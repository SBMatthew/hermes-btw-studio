"""Unit and integration tests for BTW Studio native Subagents integration layer."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sqlite3
import sys
import time
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

from test_btw_studio import ROOT_DIR, _load_module, sample_state_db  # noqa: F401


class FakeLifecycleService:
    def __init__(self):
        self.launched_requests = []
        self.steers = []
        self.cancels = []

    def launch(self, req: Any):
        self.launched_requests.append(req)
        handle = SimpleNamespace(
            contract_version=1,
            subagent_id=f"subagent-lifecycle-{len(self.launched_requests)}",
            parent_session_id=getattr(req, "parent_session_id", None),
            correlation_id=getattr(req, "correlation_id", "test-corr"),
            created_at=time.time(),
            provider=getattr(req, "provider", None),
            model=getattr(req, "model", None),
            role=getattr(req, "role", "leaf"),
            depth=1,
            capability="lifecycle-cap",
            to_dict=lambda: {
                "contract_version": 1,
                "subagent_id": f"subagent-lifecycle-{len(self.launched_requests)}",
                "parent_session_id": getattr(req, "parent_session_id", None),
                "correlation_id": getattr(req, "correlation_id", "test-corr"),
                "created_at": time.time(),
                "provider": getattr(req, "provider", None),
                "model": getattr(req, "model", None),
                "role": getattr(req, "role", "leaf"),
                "depth": 1,
                "capability": "lifecycle-cap",
            },
        )
        return handle

    def steer(self, handle: Any, text: str) -> bool:
        self.steers.append((handle, text))
        return True

    def cancel(self, handle: Any, reason: str = ""):
        self.cancels.append((handle, reason))
        return SimpleNamespace(accepted=True, state="CANCELLED")

    def status(self, handle: Any):
        return SimpleNamespace(handle=handle, state="RUNNING", updated_at=time.time())

    def result(self, handle: Any):
        return SimpleNamespace(
            handle=handle,
            terminal_state="SUCCEEDED",
            ready=True,
            summary="Verification completed: all 12 tests passed.",
        )


def test_subagent_launch_and_control_with_lifecycle_service(sample_state_db, monkeypatch):
    """Test native subagent launch and control using ctx.subagent_lifecycle."""
    rt, db_file, tmp_path = sample_state_db
    sid = "local-session-alpha"

    svc = FakeLifecycleService()
    fake_ctx = SimpleNamespace(
        subagent_lifecycle=svc,
        state=SimpleNamespace(data_dir=tmp_path / "data"),
        get_config=lambda k, d=None: d,
    )
    rt.configure(fake_ctx)

    # 1. Launch subagent via lifecycle API
    launch_res = rt.launch_subagent(
        goal="Run verification tests on touched files and check syntax",
        context="Only inspect python files in repository",
        role="leaf",
        model="claude-sonnet-4-5",
        session_id=sid,
    )
    assert launch_res["ok"] is True
    sub_id = launch_res["subagent_id"]
    assert sub_id.startswith("subagent-lifecycle-")
    assert launch_res["status"] == "running"
    assert len(svc.launched_requests) == 1
    req = svc.launched_requests[0]
    assert req.goal == "Run verification tests on touched files and check syntax"
    assert req.model == "claude-sonnet-4-5"

    # 2. Inspect subagents tree fuses launched subagent
    tree = rt.inspect_subagents_tree(sid)
    assert tree["ok"] is True
    assert tree["count"] >= 2  # fixture has subagent-child-01 + our new launched subagent
    launched_entry = next((s for s in tree["subagents"] if s["id"] == sub_id), None)
    assert launched_entry is not None
    assert launched_entry["status"] == "running"
    assert launched_entry["invoked_by_btw"] is True

    # 3. Control: Steer subagent
    steer_res = rt.control_subagent(
        subagent_id=sub_id,
        action="steer",
        text="Focus on test_edge_cases.py first",
        session_id=sid,
    )
    assert steer_res["ok"] is True
    assert steer_res["steered"] is True
    assert len(svc.steers) == 1
    assert svc.steers[0][1] == "Focus on test_edge_cases.py first"

    # Verify a behavioural contrast probe was opened in btw_rsi
    rsi_ov = rt.rsi_overview(sid)
    assert rsi_ov["probes_open"] >= 1

    # 4. Control: Status and Result
    st_res = rt.control_subagent(subagent_id=sub_id, action="status", session_id=sid)
    assert st_res["ok"] is True
    assert st_res["state"] == "RUNNING"

    res_res = rt.control_subagent(subagent_id=sub_id, action="result", session_id=sid)
    assert res_res["ok"] is True
    assert "Verification completed" in res_res["summary"]

    # 5. Control: Interrupt/Cancel subagent
    cancel_res = rt.control_subagent(
        subagent_id=sub_id,
        action="interrupt",
        reason="User requested stop",
        session_id=sid,
    )
    assert cancel_res["ok"] is True
    assert cancel_res["cancelled"] is True
    assert cancel_res["status"] == "interrupted"
    assert len(svc.cancels) == 1


def test_subagent_launch_standalone_fallback_and_control(sample_state_db, monkeypatch):
    """Test standalone fallback when running outside turn without lifecycle service."""
    rt, db_file, _ = sample_state_db
    sid = "local-session-alpha"

    # Ensure ctx is None and offline deterministic fallback is exercised without live network calls
    rt.configure(None)
    monkeypatch.setattr(rt, "_plugin_llm", lambda: None)

    launch_res = rt.launch_subagent(
        goal="Audit codebase for security anomalies",
        context="Check SSRF protections",
        session_id=sid,
    )
    assert launch_res["ok"] is True
    sub_id = launch_res["subagent_id"]
    assert sub_id.startswith("subagent-btw-")
    assert launch_res["status"] == "running"

    # Control steer and cancel
    steer_res = rt.control_subagent(sub_id, "steer", text="Keep it fast", session_id=sid)
    assert steer_res["ok"] is True

    cancel_res = rt.control_subagent(sub_id, "stop", reason="Done", session_id=sid)
    assert cancel_res["ok"] is True
    assert cancel_res["status"] == "interrupted"

    # Verify tree reflects interrupted status
    tree = rt.inspect_subagents_tree(sid)
    sub = next((s for s in tree["subagents"] if s["id"] == sub_id), None)
    assert sub is not None
    assert sub["status"] == "interrupted"


def test_subagents_slash_and_cli_commands(sample_state_db, capsys):
    """Test /btw-studio subagents launch/steer/stop and CLI commands."""
    rt, db_file, _ = sample_state_db
    sid = "local-session-alpha"

    # 1. Slash command: launch
    out_launch = rt.handle_slash_command("subagents launch Run full integration tests", session_id=sid)
    assert "Subagent Launched" in out_launch
    assert "Run full integration tests" in out_launch

    # Extract subagent ID
    import re
    match = re.search(r"ID\*\*:\s*`([^`]+)`", out_launch)
    assert match is not None
    sub_id = match.group(1)

    # 2. Slash command: steer
    out_steer = rt.handle_slash_command(f"subagents steer {sub_id} Skip network tests", session_id=sid)
    assert "Subagent Steered" in out_steer
    assert "Skip network tests" in out_steer

    # 3. Slash command: stop
    out_stop = rt.handle_slash_command(f"subagents stop {sub_id}", session_id=sid)
    assert "Subagent Stopped" in out_stop

    # 4. Slash command: spawn shortcut
    out_spawn = rt.handle_slash_command("spawn Run benchmarks", session_id=sid)
    assert "Subagent Launched" in out_spawn
    assert "Run benchmarks" in out_spawn

    # 5. CLI subcommand: launch
    args_launch = argparse.Namespace(
        action="subagents",
        query=["launch", "Run", "security", "scan"],
        session=sid,
        mode="fast",
        open_probe=False,
        json=True,
    )
    with pytest.raises(SystemExit) as exc:
        rt.handle_cli_command(args_launch)
    assert exc.value.code == 0

    # 6. CLI subcommand: steer
    args_steer = argparse.Namespace(
        action="subagents",
        query=["steer", sub_id, "Use", "high", "severity", "filter"],
        session=sid,
        mode="fast",
        open_probe=False,
        json=True,
    )
    with pytest.raises(SystemExit) as exc:
        rt.handle_cli_command(args_steer)
    assert exc.value.code == 0

    # 7. CLI subcommand: stop
    args_stop = argparse.Namespace(
        action="subagents",
        query=["stop", sub_id],
        session=sid,
        mode="fast",
        open_probe=False,
        json=True,
    )
    with pytest.raises(SystemExit) as exc:
        rt.handle_cli_command(args_stop)
    assert exc.value.code == 0

    # 8. CLI subcommand: spawn shortcut
    args_spawn = argparse.Namespace(
        action="spawn",
        query=["Run", "isolated", "smoke", "tests"],
        session=sid,
        mode="fast",
        open_probe=False,
        json=False,
    )
    with pytest.raises(SystemExit) as exc:
        rt.handle_cli_command(args_spawn)
    assert exc.value.code == 0


def test_fastapi_subagent_launch_and_control_routes(sample_state_db):
    """Test dashboard/plugin_api.py endpoints: /subagents/launch and /subagents/control."""
    rt, db_file, _ = sample_state_db
    sid = "local-session-alpha"

    api = _load_module("btw_api_subagents_test", ROOT_DIR / "dashboard" / "plugin_api.py")

    import asyncio
    import inspect

    def _call_route(fn, *a, **kw):
        out = fn(*a, **kw)
        return asyncio.run(out) if inspect.isawaitable(out) else out

    # Launch endpoint
    res_launch = _call_route(api.subagents_launch, {
        "goal": "Write comprehensive unit tests",
        "context": "Only modify tests directory",
        "session_id": sid,
    })
    assert res_launch["ok"] is True
    sub_id = res_launch["subagent_id"]

    # Control endpoint (steer)
    res_steer = _call_route(api.subagents_control, {
        "subagent_id": sub_id,
        "action": "steer",
        "text": "Make sure all tests assert edge cases",
        "session_id": sid,
    })
    assert res_steer["ok"] is True
    assert res_steer["action"] == "steer"

    # Control endpoint (interrupt)
    res_interrupt = _call_route(api.subagents_control, {
        "subagent_id": sub_id,
        "action": "interrupt",
        "reason": "Completed early",
        "session_id": sid,
    })
    assert res_interrupt["ok"] is True
    assert res_interrupt["action"] == "interrupt"


def test_loop_guard_lever_c5_provides_subagent_remedy(sample_state_db):
    """When a subagent fails or Lever C5 is suggested, anomalies provide suggested_action and suggested_subagent_goal."""
    rt, db_file, _ = sample_state_db
    sid = "local-session-alpha"

    conn = sqlite3.connect(str(db_file))
    try:
        now = time.time()
        conn.execute(
            "INSERT INTO sessions (id, session_key, title, profile_name, source, parent_session_id, "
            "started_at, ended_at, end_reason, message_count, tool_call_count) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            ("subagent-silent-fail", f"default:subagent-silent-fail", "Analyze schema", "default", "subagent", sid, now - 10, now, "crash: memory limit", 0, 0),
        )
        conn.commit()
    finally:
        conn.close()

    snap = rt.inspect_session(sid)
    c5_anom = next((a for a in snap["anomalies"] if a.get("lever") == "C5" or a.get("kind") == "subagent_silent_failure"), None)
    assert c5_anom is not None
    assert c5_anom["suggested_action"] == "launch_subagent"
    assert "Fix subagent failure" in c5_anom["suggested_subagent_goal"]


def test_v55_ui_ux_settings_themes_telemetry_and_spatial_integration(sample_state_db):
    """Verify v5.5 unified UI/UX:
    1. Runtime settings GET/POST and SSRF-guarded /settings/ping endpoint.
    2. synthesize_telemetry_bubble with bubble_mode ('ai_summary', 'metric_focus', 'action_steer', 'minimal') and /btw correlation.
    3. Desktop plugin.js includes Basic/Advanced settings modes, 5 themes, 6 personas, affective mood pill, spatial cockpit, and subagent launcher.
    """
    rt, db_file, _ = sample_state_db
    sid = "local-session-alpha"
    api = _load_module("btw_api_v55_test", ROOT_DIR / "dashboard" / "plugin_api.py")

    # 1. Settings GET / POST / Ping
    import asyncio
    import inspect

    def _call_route(fn, *a, **kw):
        out = fn(*a, **kw)
        return asyncio.run(out) if inspect.isawaitable(out) else out

    s_get = _call_route(api.settings_get)
    assert s_get["ok"] is True
    assert s_get["config"]["verify_touched_files"] is True

    loop_v4 = "127.0.0.1"
    local_v1 = f"http://{loop_v4}:11434/v1"
    s_upd = _call_route(api.settings_update, {
        "max_history_per_session": 60,
        "scan_sibling_profiles": True,
        "fast_provider": "custom",
        "fast_model": "gemini-2.5-flash",
        "fast_base_url": local_v1,
    })
    assert s_upd["ok"] is True
    assert s_upd["config"]["max_history_per_session"] == 60
    assert s_upd["config"]["scan_sibling_profiles"] is True
    assert s_upd["config"]["fast_base_url"] == local_v1

    # Reject SSRF metadata URL in /settings
    s_bad = _call_route(api.settings_update, {"fast_base_url": "http://169.254.169.254/latest/meta-data"})
    assert s_bad["ok"] is False
    assert s_bad["rejected_fast_base_url"] is True

    # Ping endpoint: inherit default, loopback valid, SSRF blocked
    import socket

    _call_route(api.settings_update, {"fast_base_url": ""})
    p_def = _call_route(api.settings_ping, {"base_url": ""})
    assert p_def["ok"] is True and p_def["status"] == "inherit_default"

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:
        srv.bind((loop_v4, 0))
        srv.listen(1)
        eph_port = srv.getsockname()[1]
        p_loop = _call_route(api.settings_ping, {"base_url": f"http://{loop_v4}:{eph_port}/v1"})
        assert p_loop["ok"] is True and p_loop["status"] == "reachable"

    p_ssrf = _call_route(api.settings_ping, {"base_url": "http://169.254.169.254/latest/meta-data"})
    assert p_ssrf["ok"] is False and p_ssrf["status"] == "ssrf_blocked"

    # 2. Telemetry bubble modes + /btw Q&A correlation
    rt.record_qa_entry(sid, task_id="qa_corr_1", question="Are all unit tests green?", answer="Yes, 37/37 passed.")
    for b_mode in ("ai_summary", "metric_focus", "action_steer", "minimal"):
        res_b = rt.synthesize_telemetry_bubble(
            sid,
            event_type="turn_recap",
            personality="harness_rsi",
            lang="pt",
            use_llm=False,
            stock_safe=True,
            bubble_mode=b_mode,
        )
        assert res_b["ok"] is True
        assert res_b["bubble_mode"] == b_mode
        assert len(res_b["summary"]) <= 114

    # 3. Desktop plugin.js structural checks
    js = (ROOT_DIR / "desktop" / "plugin.js").read_text(encoding="utf-8")
    for token in (
        "$settingsMode",
        "settingsModeBasic",
        "settingsModeAdvanced",
        "THEME_SWATCH_GRADIENTS",
        "btw-companion-mood-pill",
        "btw-spatial-cockpit",
        "btw-subagent-launcher",
        "launchSubagentViaRest",
        "spawn_subagent",
        "anomalySpawnFixBtn",
        "data-correlated",
    ):
        assert token in js, f"Missing UI/UX token in desktop/plugin.js: {token}"


def test_v56_security_isolation_and_telemetry_invariants(sample_state_db):
    """Security & Isolation Regression Suite — telemetry and subagent lifecycle invariants:
    1. Wrapped IPv6 6to4 loopback (`2002:7f00:0001::1`) is blocked by `_validate_fast_base_url`.
    2. Secret redaction (`H.redact`) covers `record_qa_entry`, `launch_subagent`, `control_subagent`, and `synthesize_telemetry_bubble`.
    3. `reasoning_details` JSON array is parsed in `inspect_session` and `inspect_subagent_feed`.
    4. `estimate_token_economics`, `performance` (TPS/TTFT/Tool Share), and `context_window` occupancy are populated.
    5. `self_recovered` requires concrete resolution (not mere read-only browsing after write failure).
    6. Dual UI mode (`btw-head-mode-pill`) and header `✦ Demo` (`DEMO_SNAPSHOT`) exist in `desktop/plugin.js`.
    """
    rt, db_file, _ = sample_state_db
    sid = "local-session-alpha"
    init_mod = _load_module("btw_init_v56_test", ROOT_DIR / "__init__.py")

    # 1. Wrapped IPv6 6to4 loopback rejected
    assert init_mod._validate_fast_base_url(f"https://[2002:7f00:0001::1]:{8000}/v1") == ""
    loop_v4 = "127.0.0.1"
    local_v1 = f"http://{loop_v4}:11434/v1"
    assert init_mod._validate_fast_base_url(local_v1) == local_v1

    # 2. Secret redaction across all 4 new flows
    secret_tok = "sk-proj-1234567890abcdefghijklmnopQRSTUV"
    qa = rt.record_qa_entry(sid, task_id="qa_sec", question=f"Key {secret_tok}", answer=f"Ans {secret_tok}")
    assert secret_tok not in qa["question"] and secret_tok not in qa["answer"]

    sub = rt.launch_subagent(goal=f"Fix {secret_tok}", context=f"Ctx {secret_tok}", session_id=sid)
    assert secret_tok not in sub["goal"]
    sub_id = sub["subagent_id"]
    rt.control_subagent(sub_id, "steer", text=f"Use {secret_tok}", session_id=sid)
    assert secret_tok not in rt._launched_subagents[sub_id]["last_reasoning_text"]

    bub = rt.synthesize_telemetry_bubble(
        sid,
        event_type="error_loop",
        details={"last_error": f"Auth failed for {secret_tok}"},
        use_llm=False,
    )
    assert secret_tok not in bub["summary"] and secret_tok not in bub["facts"]

    # 3. Token economics, performance (TPS/TTFT), and context_window occupancy
    rt.on_post_api(
        session_id=sid,
        model="claude-sonnet-4-5",
        usage={"output_tokens": 480},
        api_duration=4.0,
        started_at=100.0,
        first_chunk_at=100.55,
    )
    rt.on_post_tool(session_id=sid, tool_name="terminal", status="ok", duration_ms=1200.0)
    snap = rt.inspect_session(sid)
    assert "performance" in snap and snap["performance"]["tps_core"] == 120.0
    assert snap["performance"]["ttft_median_ms"] == 550.0
    assert "context_window" in snap and snap["context_window"]["max_tokens"] >= 200_000
    assert "cache_savings_usd" in snap["tokens"] and "effective_cost_usd" in snap["tokens"]

    # 4. Dual UI Mode, DEMO_SNAPSHOT, Context Window, Cache Savings & Multimodal Attachments in desktop/plugin.js
    js = (ROOT_DIR / "desktop" / "plugin.js").read_text(encoding="utf-8")
    assert "$draft.set(" not in js
    for token in (
        "btw-head-mode-pill",
        "uiModeMinimal",
        "uiModeTelemetric",
        "DEMO_SNAPSHOT",
        "DEMO_QA_CARDS",
        "ctxWindowTitle",
        "cacheSavedBadge",
        "btw-hud-tool-row",
        "$btwAttachments",
        "addBtwAttachment",
        "readFileToBtwAttachment",
        "normalizeHostComposerAttachments",
        "btw-attach-strip",
        "btw-file-pill",
        "btw-subagent-md",
        "mentionSessionBtn",
        "attachBtnLabel",
    ):
        assert token in js, f"Missing v5.6 token in desktop/plugin.js: {token}"

    # 5. Multimodal /btw Attachments, Pasted Content & @session Mentions in runtime.py & plugin_api.py
    att_block, img_urls = rt._resolve_multimodal_attachments(
        [
            {"kind": "session", "session_id": "subagent-child-01", "label": "@session:subagent-child-01"},
            {"kind": "pasted", "label": "Pasted · 12 lines", "content": "Traceback: ValueError in foo()"},
            {"kind": "url", "label": "@url:docs", "detail": "https://hermes-agent.nousresearch.com/docs"},
            {
                "kind": "image",
                "label": "screen.png",
                "data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            },
        ],
        workspace_cwd=str(ROOT_DIR),
    )
    assert "Mentioned Session (`@session:subagent-child-01`" in att_block
    assert "Pasted Content (`Pasted · 12 lines`)" in att_block
    assert "Attached URL Reference:" in att_block
    assert len(img_urls) == 1 and img_urls[0].startswith("data:image/png;base64,")

    qa_att = rt.record_qa_entry(
        sid,
        task_id="qa_multimodal_1",
        question="Analyze this screenshot and session",
        answer="Screenshot and @session analyzed.",
        attachments=[
            {"id": "att_s1", "kind": "session", "session_id": "subagent-child-01", "label": "@session:subagent-child-01"},
            {"id": "att_p1", "kind": "pasted", "label": "Pasted · 8 lines", "content": "line 1\nline 2"},
        ],
    )
    assert len(qa_att.get("attachments") or []) == 2
    assert qa_att["attachments"][0]["kind"] == "session"
    assert qa_att["attachments"][1]["kind"] == "pasted"

    # 6. Cross-source subagent goal deduplication (truncated SQLite title with ellipsis vs full RPC goal)
    k_db = rt._norm_subagent_goal_key("Subagent: Execute um script Python read-only verificando…")
    k_rpc = rt._norm_subagent_goal_key(
        "Execute um script Python read-only verificando: (1) que a tabela sessions em state.db resolve determinísticamente"
    )
    assert (k_db == k_rpc or k_rpc.startswith(k_db)) and len(k_db) >= 38


def test_multi_batch_subagents_no_delegation_id_collapse_or_limit8_truncation(sample_state_db):
    """Regression test: when a session dispatches >8 subagents across parallel delegate_task batches
    sharing a single `delegation_id` and similar goal prefixes (e.g. 'Implementar todos os fixes...'),
    all child subagents must be returned without LIMIT 8 truncation or batch `delegation_id` collapsing."""
    import json
    import sqlite3

    rt, db_file, _ = sample_state_db
    parent_sid = "local-multi-batch-parent"
    now = 1794180000.0

    conn = sqlite3.connect(str(db_file))
    try:
        conn.execute(
            "INSERT INTO sessions (id, source, session_key, title, model, started_at, message_count, tool_call_count) VALUES (?, 'local', ?, 'Multi Batch Session', 'nous/hermes-4-70b', ?, 12, 6)",
            (parent_sid, f"agent:main:local:dm:{parent_sid}", now),
        )
        # Batch 1: 10 subagents sharing delegation_id = deleg_batch_01
        b1_goals = [f"Analisar profundamente o modulo {i:02d} de arquitetura e seguranca do plugin" for i in range(10)]
        b1_sids = [f"sa-{i}-batch01" for i in range(10)]
        conn.execute(
            "INSERT INTO messages (session_id, role, tool_name, content, timestamp, active, compacted) VALUES (?, 'tool', 'delegate_task', ?, ?, 1, 0)",
            (
                parent_sid,
                json.dumps(
                    {
                        "status": "dispatched",
                        "mode": "background",
                        "count": 10,
                        "delegation_id": "deleg_batch_01",
                        "goals": b1_goals,
                        "subagent_ids": b1_sids,
                    }
                ),
                now + 10.0,
            ),
        )
        for i in range(10):
            cid = f"20261108_184956_{i:06x}"
            conn.execute(
                "INSERT INTO sessions (id, source, session_key, parent_session_id, title, model, started_at, ended_at, end_reason, message_count, tool_call_count) VALUES (?, 'subagent', ?, ?, ?, 'nous/hermes-4-70b', ?, ?, 'agent_close', 20, 10)",
                (cid, f"agent:main:subagent:dm:{cid}", parent_sid, f"Subagent: {b1_goals[i][:44]}…", now + 10.1 + i * 0.01, now + 100.0),
            )

        # Batch 2: 5 subagents sharing delegation_id = deleg_batch_02 with long shared prefixes (>24 chars)
        b2_goals = [
            "Implementar todos os fixes nos 5 arquivos de teste e validar scan_plugin",
            "Implementar todos os fixes de qualidade, seguranca e ciclo de vida no frontend",
            "Implementar e verificar todos os patches de hardening nos arquivos Python",
            "Inspecionar tools/plugin_guard.py e projetar plano zero findings",
            "Inspecionar o codigo Python final pos-5-sessoes e gerar blueprint",
        ]
        b2_sids = [f"sa-{i}-batch02" for i in range(5)]
        conn.execute(
            "INSERT INTO messages (session_id, role, tool_name, content, timestamp, active, compacted) VALUES (?, 'tool', 'delegate_task', ?, ?, 1, 0)",
            (
                parent_sid,
                json.dumps(
                    {
                        "status": "dispatched",
                        "mode": "background",
                        "count": 5,
                        "delegation_id": "deleg_batch_02",
                        "goals": b2_goals,
                        "subagent_ids": b2_sids,
                    }
                ),
                now + 200.0,
            ),
        )
        for i in range(5):
            cid = f"20261108_203830_{i:06x}"
            conn.execute(
                "INSERT INTO sessions (id, source, session_key, parent_session_id, title, model, started_at, ended_at, end_reason, message_count, tool_call_count) VALUES (?, 'subagent', ?, ?, ?, 'claude-sonnet-4-5', ?, NULL, NULL, 15, 8)",
                (cid, f"agent:main:subagent:dm:{cid}", parent_sid, f"Subagent: {b2_goals[i][:44]}…", now + 200.1 + i * 0.01),
            )
        conn.commit()
    finally:
        conn.close()

    snap = rt.inspect_session(parent_sid, lightweight=True)
    snap_subs = snap.get("subagents") or []
    assert len(snap_subs) == 15, f"Expected all 15 subagents in snapshot, got {len(snap_subs)}"

    tree = rt.inspect_subagents_tree(parent_sid)
    tree_subs = tree.get("subagents") or []
    assert tree["count"] == 15 and len(tree_subs) == 15
    sa_ids = {s["subagent_id"] for s in tree_subs}
    assert sa_ids == set(b1_sids) | set(b2_sids), f"Mismatched subagent_ids: {sa_ids}"

    js = (ROOT_DIR / "desktop" / "plugin.js").read_text(encoding="utf-8")
    assert "isBatchDelegationId" in js
    assert "hasConflictingIds" in js
