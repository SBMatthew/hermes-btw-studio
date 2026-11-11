"""Tests for BTW Studio Telemetry System and Pet Bubble Summaries."""

from __future__ import annotations

import time
from pathlib import Path

import pytest
from test_btw_studio import sample_state_db  # noqa: F401


def test_telemetry_events_capture_and_pulse(sample_state_db):
    rt, _, _ = sample_state_db
    sid = "local-session-alpha"

    # Pre tool event
    rt.on_pre_tool(session_id=sid, tool_name="terminal", arguments={"command": "pytest -v"})
    live = rt._ensure_live(sid)
    assert live["busy"] is True
    assert live["active_tool"] == "terminal"
    assert "pytest -v" in live["active_tool_args_preview"]

    # Post tool event ok
    rt.on_post_tool(session_id=sid, tool_name="terminal", status="ok", duration_ms=125.4)
    live = rt._ensure_live(sid)
    assert live["active_tool"] == ""
    assert live["turn_tools"] >= 1
    assert live["consecutive_errors"] == 0
    assert len(live["telemetry_events"]) >= 1
    last_ev = live["telemetry_events"][-1]
    assert last_ev["tool"] == "terminal"
    assert last_ev["status"] == "ok"
    assert last_ev["duration_ms"] == 125.4

    # Post tool event error
    rt.on_post_tool(session_id=sid, tool_name="terminal", status="error", error="AssertionError", duration_ms=45.2)
    live = rt._ensure_live(sid)
    assert live["turn_errors"] >= 1
    assert live["consecutive_errors"] == 1
    last_err_ev = live["telemetry_events"][-1]
    assert last_err_ev["tool"] == "terminal"
    assert last_err_ev["status"] == "error"


def test_synthesize_telemetry_bubble_personas_and_modes(sample_state_db):
    rt, _, _ = sample_state_db
    sid = "local-session-alpha"

    # Test all 4 canonical personas in stock_safe mode (strictly <= 114 chars)
    for p in ("neurodivergent", "anxious", "technical", "kawaii"):
        res = rt.synthesize_telemetry_bubble(
            sid,
            event_type="turn_recap",
            personality=p,
            lang="en",
            use_llm=False,
            stock_safe=True,
        )
        assert res["ok"] is True
        assert len(res["summary"]) <= 114
        assert res["personality"] == p
        assert res["engine"] == "deterministic"
        assert "metrics" in res

        # In Portuguese
        res_pt = rt.synthesize_telemetry_bubble(
            sid,
            event_type="turn_recap",
            personality=p,
            lang="pt",
            use_llm=False,
            stock_safe=True,
        )
        assert res_pt["ok"] is True
        assert len(res_pt["summary"]) <= 114

    # Test expanded mode (>114 allowed, strictly capped at 440)
    res_exp = rt.synthesize_telemetry_bubble(
        sid,
        event_type="turn_recap",
        personality="neurodivergent",
        lang="en",
        use_llm=False,
        stock_safe=False,
    )
    assert res_exp["ok"] is True
    assert len(res_exp["summary"]) <= 440


def test_synthesize_telemetry_bubble_event_kinds(sample_state_db):
    rt, _, _ = sample_state_db
    sid = "local-session-alpha"

    # 1. Error loop
    res_loop = rt.synthesize_telemetry_bubble(
        sid,
        event_type="error_loop",
        details={"last_error": "SyntaxError: invalid syntax", "tool": "terminal"},
        personality="anxious",
        lang="en",
        use_llm=False,
        stock_safe=True,
    )
    assert res_loop["ok"] is True
    assert "ALERT" in res_loop["facts"] or "error" in res_loop["facts"].lower()
    assert res_loop["event_type"] == "error_loop"

    # 2. Active agent execution
    rt.on_pre_tool(session_id=sid, tool_name="patch", arguments={"path": "runtime.py"})
    res_active = rt.synthesize_telemetry_bubble(
        sid,
        event_type="active",
        personality="technical",
        lang="en",
        use_llm=False,
        stock_safe=True,
    )
    assert res_active["ok"] is True
    assert "patch" in res_active["facts"]
    assert res_active["event_type"] == "active"

    # 3. Subagent milestone
    res_sub = rt.synthesize_telemetry_bubble(
        sid,
        event_type="subagent",
        details={"title": "Run test suite"},
        personality="kawaii",
        lang="pt",
        use_llm=False,
        stock_safe=True,
    )
    assert res_sub["ok"] is True
    assert "Subagente" in res_sub["facts"]


def test_inspect_session_telemetry_events(sample_state_db):
    rt, _, _ = sample_state_db
    sid = "local-session-alpha"

    # Ensure live events exist
    rt.on_pre_tool(session_id=sid, tool_name="read_file", arguments={"path": "README.md"})
    rt.on_post_tool(session_id=sid, tool_name="read_file", status="ok", duration_ms=25.0)

    snap = rt.inspect_session(sid)
    assert snap["found"] is True
    assert "telemetry_events" in snap
    assert "live_telemetry_events" in snap
    assert isinstance(snap["live_telemetry_events"], list)
    assert any(ev["tool"] == "read_file" for ev in snap["live_telemetry_events"])


def test_plugin_api_telemetry_routes(sample_state_db):
    import asyncio
    import inspect
    from types import SimpleNamespace
    from test_btw_studio import ROOT_DIR, _load_module

    rt, _, _ = sample_state_db
    sid = "local-session-alpha"
    api = _load_module("btw_plugin_api_tel_test", ROOT_DIR / "dashboard" / "plugin_api.py")
    raw_get = api.telemetry_get(session_id=sid, limit=20)
    data_get = asyncio.run(raw_get) if inspect.isawaitable(raw_get) else raw_get
    assert data_get["ok"] is True
    assert data_get["session_id"] == sid
    assert "metrics" in data_get and "live" in data_get

    req_body = {
        "session_id": sid,
        "event_type": "turn_recap",
        "personality": "neurodivergent",
        "lang": "en",
        "use_llm": False,
        "stock_safe": True,
    }
    raw_post = api.telemetry_summary(SimpleNamespace(json=lambda: asyncio.sleep(0, result=req_body)))
    data_post = asyncio.run(raw_post) if inspect.isawaitable(raw_post) else raw_post
    assert data_post["ok"] is True
    assert "summary" in data_post
    assert data_post["engine"] == "deterministic"
    assert data_post["personality"] == "neurodivergent"


def test_fastapi_testclient_telemetry_summary_json_body(sample_state_db, monkeypatch):
    """Verify real FastAPI + TestClient binds JSON body (session_id, personality, use_llm=False) on POST /telemetry/summary."""
    fastapi = pytest.importorskip("fastapi")
    testclient_mod = pytest.importorskip("fastapi.testclient")
    import sys
    from test_btw_studio import ROOT_DIR, _load_module

    if getattr(fastapi, "_btw_test_shim", False):
        pytest.skip("Real fastapi package is not installed in this environment")

    rt, _, _ = sample_state_db
    sid = "local-session-alpha"
    api = _load_module("btw_plugin_api_real_fastapi", ROOT_DIR / "dashboard" / "plugin_api.py")
    monkeypatch.setitem(sys.modules, api.RUNTIME_MODULE, rt)

    app = fastapi.FastAPI()
    app.include_router(api.router, prefix="/api/plugins/btw-studio")
    openapi = app.openapi()
    assert "/api/plugins/btw-studio/telemetry/summary" in openapi.get("paths", {})

    with testclient_mod.TestClient(app) as client:
        resp = client.post(
            "/api/plugins/btw-studio/telemetry/summary",
            json={
                "session_id": sid,
                "event_type": "turn_recap",
                "personality": "technical",
                "lang": "pt",
                "use_llm": False,
                "stock_safe": True,
            },
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["ok"] is True
    assert body["personality"] == "technical"
    assert body["engine"] == "deterministic"
    assert 0 < len(body["summary"]) <= 114


@pytest.mark.parametrize(
    "personality",
    ["balanced", "neurodivergent", "anxious", "technical", "kawaii", "harness_rsi"],
)
@pytest.mark.parametrize("lang", ["en", "pt"])
def test_telemetry_bubble_all_six_personas_bilingual_invariants(sample_state_db, personality: str, lang: str):
    rt, _, _ = sample_state_db
    sid = "local-session-alpha"
    res = rt.synthesize_telemetry_bubble(
        sid,
        event_type="turn_recap",
        personality=personality,
        lang=lang,
        use_llm=False,
        stock_safe=True,
    )
    assert res["ok"] is True
    assert res["personality"] == personality
    assert res["engine"] == "deterministic"
    assert 0 < len(res["summary"]) <= 114
    assert "\n" not in res["summary"] and "\r" not in res["summary"]
    assert "{{" not in res["summary"] and "}}" not in res["summary"]
    assert isinstance(res.get("affect"), dict)
    assert res["affect"].get("state") in ("eureka", "focused", "hyperfocus", "protective", "calm")

