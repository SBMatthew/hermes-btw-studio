"""BTW Studio v5 — Harness² side-channel RSI test suite.

Covers the deterministic engine (harness.py) and its runtime integration:
the four new in-flight detectors, the measured error streak, Δτ steer probes
(helped / hurt / no_observed_effect / confounded), the evidence-only
experience library (confounded → NO_ENTRY), Utility Yield, ψ_verify gates
(template braces, AST syntax, trigger line), preset packs, cross-session
search and the read-only state.db invariant.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import time
from pathlib import Path

import pytest

from test_btw_studio import _synthetic_token, sample_state_db  # noqa: F401  (shared fixture)


def _add_rows(db_file: Path, rows: list[tuple]) -> None:
    conn = sqlite3.connect(str(db_file))
    try:
        for r in rows:
            if r[0] == "msg":
                _, sid, role, content, tcalls, tcid, tname, ts = r
                conn.execute(
                    "INSERT INTO messages (session_id, role, content, tool_calls, tool_call_id, tool_name, timestamp) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (sid, role, content, tcalls, tcid, tname, ts),
                )
            elif r[0] == "sub":
                _, sid, parent, title, ended, reason, msgs = r
                conn.execute(
                    "INSERT INTO sessions (id, session_key, title, profile_name, source, parent_session_id, "
                    "started_at, ended_at, end_reason, message_count, tool_call_count) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    (sid, f"default:{sid}", title, "default", "subagent", parent, ended - 20, ended, reason, msgs, 0),
                )
        conn.commit()
    finally:
        conn.close()


def _call(cid: str, name: str, args: dict) -> str:
    return json.dumps([{"id": cid, "function": {"name": name, "arguments": json.dumps(args)}}])


SID = "local-session-alpha"


# ----------------------------------------------------------- pure engine


def test_harness_template_gate_resolves_clamps_and_redacts(sample_state_db):
    rt, db_file, _ = sample_state_db
    H = rt.H
    tel = rt.inspect_session(SID)
    res = H.resolve_template("Fix {{last_error}} on {{ git_branch }} touching {{@touched_files}} {{nope}} {% if x %}", tel)
    assert "E501 line too long" in res["text"]
    assert "feat/btw-studio" in res["text"]
    assert "runtime.py" in res["text"]
    assert "{{" not in res["text"] and "{%" not in res["text"]
    assert res["unknown"] == ["nope"] and res["stripped"] == 1
    assert set(res["used"]) == {"last_error", "git_branch", "touched_files"}

    fake_sk = _synthetic_token("sk-", "ab12" * 6)
    padding_tail = "y" * 900
    secret = H.resolve_template("{{last_error}}", {"recent_errors": [{"tool": "t", "detail": f"token={fake_sk} x{padding_tail}"}]})
    assert "sk-ab12" not in secret["text"] and "[redacted]" in secret["text"]
    assert len(secret["text"]) <= H.TOKEN_CHAR_CAP

    empty = H.resolve_template("Running {{active_tool}}", {"live": {}})
    assert empty["text"] == "Running (none)" and empty["empty"] == ["active_tool"]

    lint = H.lint_template("ok {{last_error}} bad {{whatever}} {{ }}")
    assert lint["ok"] is False and lint["unknown"] == ["whatever"]
    assert H.lint_template("{{cost}} and {{model}}")["ok"] is True


def test_harness_psi_verify_files_ast_and_json(tmp_path):
    from test_btw_studio import ROOT_DIR, _load_module

    H = _load_module("hb_engine_psi", ROOT_DIR / "harness.py")
    good = tmp_path / "ok.py"
    good.write_text("def f():\n    return 1\n", encoding="utf-8")
    bad = tmp_path / "bad.py"
    bad.write_text("def f(:\n    return 1\n", encoding="utf-8")
    js = tmp_path / "cfg.json"
    js.write_text('{"a": 1,}', encoding="utf-8")
    md = tmp_path / "notes.md"
    md.write_text("# hi", encoding="utf-8")
    out = H.psi_verify_files([str(good), str(bad), str(js), str(md), str(tmp_path / "missing.py")])
    assert out[str(good)]["status"] == "ok"
    assert out[str(bad)]["status"] == "syntax_error" and out[str(bad)]["line"] == 1
    assert out[str(js)]["status"] == "syntax_error"
    assert out[str(md)]["status"] == "exists"
    assert out[str(tmp_path / "missing.py")]["status"] == "missing"
    assert good.read_text(encoding="utf-8").startswith("def f")  # never written


def test_harness_probe_verdicts_cover_all_four(sample_state_db):
    rt, _, _ = sample_state_db
    H = rt.H

    def run(post, *, streak=0, target="", kinds=None, confounded=False):
        p = H.open_probe("s", text="steer", source="anomaly", live={"consecutive_errors": streak}, target_kind=target)
        for tool, err, cmd in post:
            H.tick_probe(p, tool=tool, is_error=err, command=cmd)
        return H.finalize_probe(p, current_kinds=kinds or set(), confounded=confounded)

    helped = run([("terminal", False, "pytest -q"), ("read_file", False, ""), ("patch", False, "")], streak=3, target="error_streak")
    assert helped["verdict"] == "helped" and "3 → 0" in helped["reason"]
    hurt = run([("terminal", True, ""), ("terminal", True, ""), ("patch", False, "")], streak=1)
    assert hurt["verdict"] == "hurt"
    still = run([("read_file", False, "")] * 3, target="unverified_edit", kinds={"unverified_edit"})
    assert still["verdict"] == "no_observed_effect"
    conf = run([("terminal", False, "pytest")] * 3, streak=2, confounded=True)
    assert conf["verdict"] == "confounded"
    nothing = run([])
    assert nothing["verdict"] == "no_observed_effect"

    # Reflector: only 'helped' becomes a lesson; confounded never does (NO_ENTRY)
    assert H.experience_from_probe(conf) is None
    assert H.experience_from_probe(hurt) is None
    exp = H.experience_from_probe(helped)
    assert exp and exp["verdict"] == "helped" and exp["lever"] == "C6" and exp["scope"] == "INV"
    assert "repeated" in exp["cue"].lower() or "fails" in exp["cue"].lower()


def test_harness_utility_yield_prune_and_suggestion(sample_state_db):
    rt, _, _ = sample_state_db
    H = rt.H
    now = time.time()
    fresh = {"runs": 4, "helped": 2, "hurt": 0, "last_used": now}
    stale = {"runs": 4, "helped": 2, "hurt": 0, "last_used": now - 14 * 86400}
    assert H.utility_yield(fresh, now) == pytest.approx(8.0)
    assert H.utility_yield(stale, now) == pytest.approx(2.0, rel=0.01)  # two half-lives
    assert H.utility_yield({"runs": 1, "hurt": 3, "last_used": now}, now) < 0

    prune = H.prune_candidates(
        {"bad": {"runs": 5, "hurt": 3, "helped": 1, "last_used": now}, "idle": {"runs": 1, "last_used": now - 40 * 86400}, "good": fresh},
        now,
    )
    assert set(prune) == {"bad", "idle"}

    sug = H.contextual_suggestion(["plan", "errors", "files"], {"anomalies": [{"kind": "unverified_edit"}]}, {})
    assert sug == {"id": "files", "why": "Edits without a verification step", "basis": "situation"}
    by_yield = H.contextual_suggestion(["plan", "eta"], {"anomalies": []}, {"eta": fresh})
    assert by_yield["id"] == "eta" and by_yield["basis"] == "yield"


def test_harness_promotion_has_trigger_line_and_no_braces(sample_state_db):
    rt, _, _ = sample_state_db
    skill = rt.build_promotion(target="skill", question="Why does pytest fail on Windows?", answer="Set PYTEST_DISABLE_PLUGIN_AUTOLOAD=1.")
    assert skill["target"] == "skill"
    assert skill["trigger"].startswith("When asking: why does pytest fail") or skill["trigger"].startswith("When ")
    assert "load the `" in skill["trigger"] and skill["text"].startswith("/learn ")
    assert "Trigger line (required, Harness² rule 1)" in skill["text"]
    cue_skill = rt.build_promotion(target="skill", cue="When the same tool fails twice", lesson="Diagnose first.", lever="C6")
    assert cue_skill["trigger"] == f"When the same tool fails twice, load the `{cue_skill['name']}` skill."
    mem = rt.build_promotion(target="memory", lesson="Tests need PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 here.")
    assert mem["lever"] == "C3" and mem["warnings"]


# ------------------------------------------------ runtime integration


def test_v5_new_detectors_unverified_edit_subagent_research_and_streak(sample_state_db):
    rt, db_file, _ = sample_state_db
    before = hashlib.sha256(db_file.read_bytes()).hexdigest()
    base = rt.inspect_session(SID)
    kinds = {a["kind"] for a in base["anomalies"]}
    # Fixture: one failing ruff at the very end → streak 1 → no error_streak (v4 used to flag "any 2 errors")
    assert "error_streak" not in kinds
    assert base["health"]["state"] in ("calm", "watch")
    assert all(a.get("evidence") == "observed" and a.get("lever") for a in base["anomalies"])
    assert base["counts"]["trailing_errors"] == 1
    assert hashlib.sha256(db_file.read_bytes()).hexdigest() == before

    now = time.time() + 5
    rows = [("msg", SID, "user", "Edit the parser and finish.", None, None, None, now)]
    rows.append(("msg", SID, "assistant", "Editing.", _call("w1", "patch", {"path": "/workspace/project/parser.py", "old_string": "a", "new_string": "b"}), None, None, now + 1))
    rows.append(("msg", SID, "tool", json.dumps({"ok": True}), None, "w1", "patch", now + 2))
    rows.append(("msg", SID, "assistant", "Done — parser updated.", None, None, None, now + 3))
    rows.append(("sub", "subagent-broken", SID, "Scrape the docs", now + 4, "error: timeout", 3))
    _add_rows(db_file, rows)

    snap = rt.inspect_session(SID)
    by_kind = {a["kind"]: a for a in snap["anomalies"]}
    assert by_kind["unverified_edit"]["severity"] == "high"
    assert "parser.py" in by_kind["unverified_edit"]["detail"]
    assert by_kind["unverified_edit"]["lever"] == "C8" and by_kind["unverified_edit"]["scope"] == "INV"
    assert by_kind["subagent_silent_failure"]["lever"] == "C5"
    assert snap["health"]["state"] == "act"
    assert snap["suggested_preset"]["id"] in ("errors", "files")

    # A verification command in the next turn clears the unverified edit
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", "Run the tests.", None, None, None, now + 6),
            ("msg", SID, "assistant", "", _call("w2", "patch", {"path": "/workspace/project/parser.py", "old_string": "b", "new_string": "c"}), None, None, now + 7),
            ("msg", SID, "tool", json.dumps({"ok": True}), None, "w2", "patch", now + 8),
            ("msg", SID, "assistant", "", _call("t1", "terminal", {"command": "pytest -q tests/test_parser.py"}), None, None, now + 9),
            ("msg", SID, "tool", json.dumps({"output": "3 passed", "exit_code": 0}), None, "t1", "terminal", now + 10),
            ("msg", SID, "assistant", "Tests pass.", None, None, None, now + 11),
        ],
    )
    assert "unverified_edit" not in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}

    # Research stall: many read-only steps, nothing written, turn still running
    stall = [("msg", SID, "user", "Investigate the bug.", None, None, None, now + 20)]
    for i in range(16):
        stall.append(("msg", SID, "assistant", "", _call(f"r{i}", "read_file", {"path": f"/workspace/project/m{i}.py"}), None, None, now + 21 + i * 2))
        stall.append(("msg", SID, "tool", "{}", None, f"r{i}", "read_file", now + 22 + i * 2))
    _add_rows(db_file, stall)
    rs = {a["kind"]: a for a in rt.inspect_session(SID)["anomalies"]}
    assert "research_stall" in rs and "16 read-only steps" in rs["research_stall"]["title"]


def test_v5_measured_streak_from_state_db(sample_state_db):
    rt, db_file, _ = sample_state_db
    now = time.time() + 5
    rows = [("msg", SID, "user", "Install it.", None, None, None, now)]
    for i in range(3):
        rows.append(("msg", SID, "assistant", "", _call(f"e{i}", "terminal", {"command": "pip install nope==0.0.0"}), None, None, now + 1 + i * 2))
        rows.append(("msg", SID, "tool", json.dumps({"output": "ERROR", "exit_code": 1}), None, f"e{i}", "terminal", now + 2 + i * 2))
    _add_rows(db_file, rows)
    snap = rt.inspect_session(SID)
    streak = [a for a in snap["anomalies"] if a["kind"] == "error_streak"]
    assert streak and snap["counts"]["trailing_errors"] == 4  # 3 new + the fixture's trailing ruff failure
    assert streak[0]["severity"] == "high"
    assert any(a["kind"] == "command_loop" and a["lever"] == "C7" for a in snap["anomalies"])


def test_v5_steer_probe_end_to_end_learns_only_from_evidence(sample_state_db):
    rt, db_file, tmp_path = sample_state_db
    before = hashlib.sha256(db_file.read_bytes()).hexdigest()
    rt.record_preset_run("errors")
    opened = rt.record_steer_probe(SID, text="Stop retrying ruff; read the config first.", source="anomaly", target_kind="error_streak", preset_id="errors")
    probe = opened["probe"]
    assert probe["status"] == "open" and probe["e0"]["consecutive_errors"] == 1
    assert hashlib.sha256(db_file.read_bytes()).hexdigest() == before  # opening a probe never touches state.db

    # Not enough post-steer calls yet → still open
    snap = rt.inspect_session(SID)
    assert [p["id"] for p in snap["rsi"]["open"]] == [probe["id"]]
    assert snap["health"]["steering"] is True

    t0 = float(probe["opened_at"]) + 1
    rows = [
        ("msg", SID, "assistant", "", _call("p1", "read_file", {"path": "/workspace/project/ruff.toml"}), None, None, t0),
        ("msg", SID, "tool", "{}", None, "p1", "read_file", t0 + 1),
        ("msg", SID, "assistant", "", _call("p2", "patch", {"path": "/workspace/project/ruff.toml", "old_string": "a", "new_string": "b"}), None, None, t0 + 2),
        ("msg", SID, "tool", json.dumps({"ok": True}), None, "p2", "patch", t0 + 3),
        ("msg", SID, "assistant", "", _call("p3", "terminal", {"command": "ruff check ."}), None, None, t0 + 4),
        ("msg", SID, "tool", json.dumps({"output": "All checks passed", "exit_code": 0}), None, "p3", "terminal", t0 + 5),
    ]
    _add_rows(db_file, rows)
    snap2 = rt.inspect_session(SID)
    recent = snap2["rsi"]["recent"]
    assert recent and recent[0]["verdict"] == "helped"
    assert snap2["rsi"]["learned_now"] and snap2["rsi"]["learned_now"][0]["lever"] == "C6"
    assert snap2["rsi"]["library_size"] == 1

    ov = rt.rsi_overview()
    assert ov["verdicts"]["helped"] == 1 and ov["help_rate"] == 100.0
    assert ov["preset_stats"]["errors"]["runs"] == 1 and ov["preset_stats"]["errors"]["helped"] == 1
    assert ov["preset_yield"]["errors"] > 0

    # Persisted in plugin data (not Hermes core) and survives a reload
    rsi_file = tmp_path / "plugin-data" / "btw_rsi.json"
    assert rsi_file.is_file()
    rt._load_rsi_disk()
    assert len(rt.rsi_overview()["experiences"]) == 1

    # Next time the same anomaly shape appears, the lesson is retrieved for the side-channel
    matches = rt.H.match_experiences(rt.rsi_overview()["experiences"], domain="project", kinds={"error_streak"})
    assert matches and matches[0]["match_score"] >= 3

    # Two overlapping probes → confounded → no new lesson (explicit clock, no wall-time races)
    t_base = t0 + 10
    for pid_text, off in (("A", 0.0), ("B", 0.5)):
        p = rt.H.open_probe(SID, text=pid_text, source="manual", live={"consecutive_errors": 2}, now=t_base + off)
        rt._rsi_state["probes"][p["id"]] = p
    t1 = t_base + 1
    _add_rows(
        db_file,
        [r for i in range(3) for r in (
            ("msg", SID, "assistant", "", _call(f"q{i}", "terminal", {"command": "pytest"}), None, None, t1 + i * 2),
            ("msg", SID, "tool", json.dumps({"output": "ok", "exit_code": 0}), None, f"q{i}", "terminal", t1 + i * 2 + 1),
        )],
    )
    rt.inspect_session(SID)
    ov2 = rt.rsi_overview()
    assert ov2["verdicts"]["confounded"] >= 1
    assert len(ov2["experiences"]) == 1  # NO_ENTRY for the confounded contrast
    assert rt.delete_experience("__all__")["removed"] == 1


def test_v5_ask_resolves_tokens_threads_followups_and_prompt_scope(sample_state_db):
    rt, db_file, _ = sample_state_db
    seen: list[list[dict]] = []

    class FakeLlm:
        def complete(self, messages, **kw):
            if kw.get("purpose") == "btw_studio_card_title":
                return type("R", (), {"text": "Ruff E501 Retry Loop", "model": "fake-title"})()
            seen.append(messages)
            return type("R", (), {"text": "**INV** retry loop. **DOM** likely ruff config.", "model": "fake-flash"})()

    rt._ctx.llm = FakeLlm()  # type: ignore[attr-defined]
    first = rt.ask_side_question(SID, "Why did {{last_error}} happen?", preset_id="errors")
    e1 = first["entry"]
    assert e1["question"] == "Why did {{last_error}} happen?"
    assert "E501" in e1["resolved_question"] and "{{" not in seen[-1][1]["content"].split("User side question")[1]
    assert "INV" in seen[-1][0]["content"] and "cheapest durable fix" in seen[-1][0]["content"]

    follow = rt.ask_side_question(SID, "And how do I fix it permanently?", parent_id=e1["id"])
    e2 = follow["entry"]
    assert e2["parent_id"] == e1["id"] and e2["thread_id"] == e1["id"]
    assert "EARLIER IN THIS /btw THREAD" in seen[-1][1]["content"]
    assert "Why did" in seen[-1][1]["content"]

    found = rt.search_cards("permanently fix")
    assert [r["id"] for r in found["results"]] == [e2["id"]]
    assert rt.session_badges()["badges"][SID]["cards"] == 2
    assert rt.rsi_overview()["preset_stats"]["errors"]["runs"] == 1


def test_v5_preset_packs_install_import_export_lint(sample_state_db):
    rt, _, _ = sample_state_db
    packs = rt.list_preset_packs()["packs"]
    assert {p["id"] for p in packs} >= {"coding-tdd", "research", "devops", "academic"}
    for p in packs:
        for preset in p["presets"]:
            assert rt.H.lint_template(preset["prompt"])["ok"], preset["id"]

    inst = rt.install_preset_pack("coding-tdd")
    assert inst["added"] == 3
    assert rt.install_preset_pack("coding-tdd")["added"] == 0  # idempotent
    with pytest.raises(ValueError):
        rt.install_preset_pack("nope")

    exported = rt.export_preset_pack("Workspace TDD")["pack"]
    assert exported["format"] == "btw-studio.preset-pack/1" and len(exported["presets"]) == 3

    rt.sync_presets_config(custom_presets=[], deleted_preset_ids=[])
    imp = rt.import_preset_pack(
        {"presets": exported["presets"] + [{"id": "evil", "label": "Bad", "prompt": "Use {{secret_env}} now"}]}
    )
    assert imp["added"] == 3 and imp["rejected"][0]["unknown"] == ["secret_env"]
    with pytest.raises(ValueError):
        rt.import_preset_pack({"nope": 1})


def test_v5_slash_cli_guard_and_rsi_reports(sample_state_db):
    rt, _, _ = sample_state_db
    guard = rt.handle_slash_command("guard")
    assert guard.startswith("### BTW Guard")
    rsi = rt.handle_slash_command("rsi")
    assert "Harness² side-channel RSI" in rsi
    subs_md = rt.handle_slash_command("subagents")
    assert "### BTW Studio — Subagents" in subs_md and "subagent-child-01" in subs_md
    radar = rt.handle_slash_command("radar")
    assert "Flight state:" in radar
    assert rt.handle_slash_command("search nothing-matches-this").startswith("No /btw cards")


def test_v51_portable_data_dir_steer_synth_and_subagents_tree(sample_state_db):
    rt, db_file, tmp_path = sample_state_db
    # 1. Portable namespace matches Hermes PluginContext.state.data_dir ('agent-plugin-btw-studio-c3ca34d3')
    assert rt._portable_data_dir_name("btw-studio") == "agent-plugin-btw-studio-c3ca34d3"

    # 2. Subagents tree enrichment ($0 SQLite read-only)
    before = hashlib.sha256(db_file.read_bytes()).hexdigest()
    tree = rt.inspect_subagents_tree(SID)
    assert tree["ok"] is True and tree["count"] == 1
    assert tree["subagents"][0]["id"] == "subagent-child-01"
    assert tree["subagents"][0]["status"] == "done"
    assert hashlib.sha256(db_file.read_bytes()).hexdigest() == before

    # 3. AI Steer Command Synthesizer (Main session & Subagent target)
    seen: list[list[dict]] = []

    class SynthFakeLlm:
        def complete(self, messages, **kw):
            seen.append(messages)
            return type(
                "R",
                (),
                {"text": "Increase line-length in `pyproject.toml` and re-run `ruff check .`.", "model": "fake-flash"},
            )()

    rt._ctx.llm = SynthFakeLlm()  # type: ignore[attr-defined]
    res_main = rt.synthesize_steer_command(
        SID,
        instruction="Corrija o erro {{last_error}} mencionado neste card",
        card_question="O que falhou?",
        card_answer="ruff falhou com E501 line too long em runtime.py.",
        target_type="main",
    )
    assert res_main["ok"] is True
    assert res_main["engine"] == "llm"
    assert "pyproject.toml" in res_main["command"]
    assert "E501 line too long" in seen[-1][1]["content"]
    assert "BTW SIDE-CARD CONTEXT" in seen[-1][1]["content"]

    res_sub = rt.synthesize_steer_command(
        SID,
        instruction="Focus only on catalog rule 8",
        target_type="subagent",
        subagent_id="subagent-child-01",
        subagent_goal="Verify catalog schema rules",
    )
    assert res_sub["ok"] is True and res_sub["target_type"] == "subagent"
    assert "Delegated Subagent `subagent-child-01`" in seen[-1][1]["content"]


def test_v5_catalog_rules_static(sample_state_db):
    """Rules 3/8/9/11: no self-update, no core rebinds, no env reads, no DOM reach-in."""
    import ast
    import re
    from test_btw_studio import ROOT_DIR

    py_files = ("runtime.py", "harness.py", "__init__.py")
    py_src = "\n".join((ROOT_DIR / f).read_text(encoding="utf-8") for f in py_files)
    for forbidden in ("os.environ[", "urllib.request", "requests.", "subprocess", "load_dotenv"):
        assert forbidden not in py_src, forbidden
    for rel_py in py_files:
        tree = ast.parse((ROOT_DIR / rel_py).read_text(encoding="utf-8"), filename=rel_py)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                assert node.func.id not in {"eval", "exec", "setattr"}, f"Forbidden builtin {node.func.id} in {rel_py}"
    js = (ROOT_DIR / "desktop" / "plugin.js").read_text(encoding="utf-8")
    assert re.search(r"\beval\s*\(", js) is None
    for forbidden in (
        "new Function",
        "import(",
        "data-slot",
        "data-testid",
        "data-role",
        "MutationObserver",
        "querySelector",
        "localStorage",
        "Object.defineProperty(",
        ".prototype.",
    ):
        assert forbidden not in js, forbidden


def test_v52_security_epistemic_and_stock_pet_regression_suite(sample_state_db, tmp_path):
    """Security & Isolation Regression Suite:
    1. SECRET_RE redacts JSON/quoted keys, Bearer headers, glpat, hf_, PEM blocks & DB URIs.
    2. fast_base_url SSRF guard rejects http:// non-loopback & cloud metadata 169.254.169.254.
    3. psi_verify_files enforces workspace (cwd) confinement (`outside_workspace`).
    4. Steer row (`[OUT-OF-BAND USER MESSAGE`) + ignored searches does NOT fabricate `helped`.
    5. In-flight pre-steer parallel batch (`issued_msg_id <= anchor_msg_id`) is NOT counted as post-steer.
    6. Failing pytest (`exit_code=1`) does NOT clear `unverified_edit`, while direct script execution (`exit_code=0`) does.
    7. `claimed_without_tool` catches simple past ("I created the file") and ignores summary questions ("What did you change earlier?").
    8. `delegate_task` tool result with `status='failed'` triggers `subagent_silent_failure`.
    9. Stock-safe pet bubble (`stock_safe=True`) stays strictly <= 120 chars with zero newlines.
    """
    from test_btw_studio import ROOT_DIR, _load_module

    rt, db_file, _ = sample_state_db
    H = rt.H
    init_mod = _load_module("btw_init_v52", ROOT_DIR / "__init__.py")

    # 1. Secret redaction matrix
    gl_tok = _synthetic_token("glpat-", "abcdefghij1234567890")
    hf_tok = _synthetic_token("hf_", "abcdefghijklmnopqrstuvwxyz1234")
    jwt_hdr = _synthetic_token("eyJhbGciOi", "JIUzI1NiJ9")
    pem_tag = _synthetic_token("OPENSSH ", "PRIVATE KEY")
    samples = [
        '{"api_key": "supersecretvalue123"}',
        "export PASSWORD='hunter2password99'",
        f'curl -H "Authorization: Bearer {jwt_hdr}"',
        f"token {gl_tok}",
        f"HF_TOKEN={hf_tok}",
        "postgres://admin:s3cr3tPass@db.internal:5432/prod",
        f"-----BEGIN {pem_tag}-----\nb3BlbnNzaC1rZXktdjE=\n-----END {pem_tag}-----",
    ]
    for raw in samples:
        red = H.redact(raw)
        assert "[redacted]" in red, f"Failed to redact: {raw} -> {red}"

    # 2. SSRF guard on fast_base_url
    assert init_mod._validate_fast_base_url("https://api.openai.com/v1") == "https://api.openai.com/v1"
    loop_host = "127.0.0.1"
    local_v1 = f"http://{loop_host}:11434/v1"
    assert init_mod._validate_fast_base_url(local_v1) == local_v1
    assert init_mod._validate_fast_base_url("http://169.254.169.254/latest/meta-data") == ""
    assert init_mod._validate_fast_base_url("http://evil-collector.example.com/v1") == ""

    # 3. Workspace confinement in psi_verify_files
    ws = tmp_path / "workspace"
    ws.mkdir(exist_ok=True)
    inside = ws / "app.py"
    inside.write_text("x = 1\n", encoding="utf-8")
    outside = tmp_path / "secret.json"
    outside.write_text('{"k": 1}', encoding="utf-8")
    psi = H.psi_verify_files([str(inside), str(outside)], allowed_root=ws)
    assert psi[str(inside)]["status"] == "ok"
    assert psi[str(outside)]["status"] == "outside_workspace" and psi[str(outside)]["exists"] is False

    # 4. Steer message + ignored searches must NOT fabricate 'helped' on unverified_edit
    now = time.time() + 40
    steer_msg = (
        "[OUT-OF-BAND USER MESSAGE — a direct message from the user, delivered once at this position]\n"
        "Run pytest now.\n[/OUT-OF-BAND USER MESSAGE]"
    )
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", "Edit core.py.", None, None, None, now),
            ("msg", SID, "assistant", "", _call("uw1", "patch", {"path": "/workspace/project/core.py", "old_string": "a", "new_string": "b"}), None, None, now + 1),
            ("msg", SID, "tool", json.dumps({"ok": True}), None, "uw1", "patch", now + 2),
            *[
                r
                for i in range(6)
                for r in (
                    ("msg", SID, "assistant", "", _call(f"us{i}", "search_files", {"pattern": "foo"}), None, None, now + 3 + i),
                    ("msg", SID, "tool", "{}", None, f"us{i}", "search_files", now + 3.4 + i),
                )
            ],
        ],
    )
    assert "unverified_edit" in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}
    p_unv = rt.record_steer_probe(SID, text="Run pytest now.", source="anomaly", target_kind="unverified_edit")["probe"]
    t_after = float(p_unv["opened_at"]) + 1
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", steer_msg, None, None, None, t_after),
            *[
                r
                for i in range(3)
                for r in (
                    ("msg", SID, "assistant", "", _call(f"ig{i}", "search_files", {"pattern": "bar"}), None, None, t_after + 1 + i),
                    ("msg", SID, "tool", "{}", None, f"ig{i}", "search_files", t_after + 1.4 + i),
                )
            ],
        ],
    )
    snap_ig = rt.inspect_session(SID)
    closed_unv = next(p for p in snap_ig["rsi"]["recent"] if p["id"] == p_unv["id"])
    assert closed_unv["verdict"] == "no_observed_effect"

    # 5. Pre-steer in-flight batch (issued BEFORE probe anchor_msg_id) is ignored by probe window
    t_batch = t_after + 20
    inflight_calls = json.dumps(
        [{"id": f"pre{i}", "function": {"name": "read_file", "arguments": json.dumps({"path": f"/w/{i}.py"})}} for i in range(3)]
    )
    _add_rows(db_file, [("msg", SID, "assistant", "", inflight_calls, None, None, t_batch)])
    p_pre = rt.record_steer_probe(SID, text="Stop.", source="manual", target_kind="error_streak")["probe"]
    _add_rows(
        db_file,
        [("msg", SID, "tool", "{}", None, f"pre{i}", "read_file", float(p_pre["opened_at"]) + 1 + i) for i in range(3)],
    )
    snap_pre = rt.inspect_session(SID)
    assert any(p["id"] == p_pre["id"] for p in snap_pre["rsi"]["open"])  # still open because no post-anchor call was issued!

    # 6. Failing pytest does NOT clear unverified_edit; running edited script with exit 0 DOES
    t_v = t_batch + 30
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", "Update script.", None, None, None, t_v),
            ("msg", SID, "assistant", "", _call("vf1", "write_file", {"path": "/workspace/project/run_me.py", "content": "print(1)"}), None, None, t_v + 1),
            ("msg", SID, "tool", json.dumps({"ok": True}), None, "vf1", "write_file", t_v + 2),
            ("msg", SID, "assistant", "", _call("vf2", "terminal", {"command": "pytest -q"}), None, None, t_v + 3),
            ("msg", SID, "tool", json.dumps({"output": "1 failed", "exit_code": 1}), None, "vf2", "terminal", t_v + 4),
            ("msg", SID, "assistant", "Done.", None, None, None, t_v + 5),
        ],
    )
    assert "unverified_edit" in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}
    _add_rows(
        db_file,
        [
            ("msg", SID, "assistant", "", _call("vf3", "terminal", {"command": "python /workspace/project/run_me.py"}), None, None, t_v + 6),
            ("msg", SID, "tool", json.dumps({"output": "1", "exit_code": 0}), None, "vf3", "terminal", t_v + 7),
            ("msg", SID, "assistant", "Verified.", None, None, None, t_v + 8),
        ],
    )
    assert "unverified_edit" not in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}

    # 7. Claim without tool: catches simple past, ignores summary turns
    t_c = t_v + 20
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", "What did you change earlier?", None, None, None, t_c),
            ("msg", SID, "assistant", "Earlier I've updated runtime.py and fixed the parser.", None, None, None, t_c + 1),
        ],
    )
    assert "claimed_without_tool" not in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", "Create the config file.", None, None, None, t_c + 2),
            ("msg", SID, "assistant", "I created the file and ran the suite.", None, None, None, t_c + 3),
        ],
    )
    assert "claimed_without_tool" in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}

    # 8. delegate_task failure result surfaces in subagent_silent_failure
    t_d = t_c + 10
    _add_rows(
        db_file,
        [
            ("msg", SID, "user", "Delegate audit.", None, None, None, t_d),
            ("msg", SID, "assistant", "", _call("del1", "delegate_task", {"tasks": [{"goal": "Audit API"}]}), None, None, t_d + 1),
            ("msg", SID, "tool", json.dumps({"results": [{"subagent_id": "sa-99", "goal": "Audit API", "status": "failed", "error": "503"}]}), None, "del1", "delegate_task", t_d + 2),
        ],
    )
    assert "subagent_silent_failure" in {a["kind"] for a in rt.inspect_session(SID)["anomalies"]}

    # 9. Stock-safe pet bubble <= 120 chars and single line across all personas
    long_md = "### Summary\n- Updated `runtime.py` and `desktop/plugin.js` with 18 security and UX improvements.\n- All 24 tests passed in 0.6s with $0 telemetry."
    for persona in ("neurodivergent", "anxious", "technical", "kawaii"):
        res = rt.synthesize_summary(long_md, personality=persona, lang="pt", use_llm=False, stock_safe=True)
        assert res["ok"] and len(res["summary"]) <= 114 and "\n" not in res["summary"], (persona, res["summary"])


def test_v53_redteam_security_ssrf_surrogates_and_delta_tau_fixes(sample_state_db, tmp_path):
    """Verify all Red-Team & AI Research Scientist findings:
    1. 28/28 SSRF vectors (IPv6 mapped, hex/decimal/octal IP, trailing dot metadata, RFC1918, embedded credentials, CRLF) rejected.
    2. 31/31 secret vectors (escaped JSON `\\\"api_key\\\"`, URL basic auth, query params, AWS STS, aws_secret_access_key, Discord, Stripe) redacted.
    3. 32 KB context digest, snapshot recent_errors, diff_preview, and Radar Markdown invoke H.redact().
    4. Lone UTF-16 surrogates (`\\ud800`) and null bytes sanitized without poisoning session state.
    5. Free-card Mini-Chat steers (`target_kind=""`) with clean tool follow-through yield `helped` (not `no_observed_effect`).
    6. Sticky session anomalies (`edit_churn`) do not block `helped` when transient errors clear.
    7. Read-only `inspect_session` polling never mutates `uses` on disk.
    8. `[ASYNC DELEGATION BATCH COMPLETE]` user messages do not reset turn state and surface subagent failures.
    """
    from test_btw_studio import ROOT_DIR, _load_module

    rt, db_file, _ = sample_state_db
    H = rt.H
    init_mod = _load_module("btw_init_v53", ROOT_DIR / "__init__.py")

    # 1. Exhaustive SSRF vectors
    bad_urls = [
        "https://[::ffff:169.254.169.254]/latest/meta-data/",
        "https://[0:0:0:0:0:ffff:a9fe:a9fe]/v1",
        "https://[fd00:ec2::254]/latest/meta-data/",
        "https://0xa9fea9fe/v1",
        "https://2852039166/v1",
        "https://0251.0376.0251.0376/v1",
        "https://metadata.google.internal./computeMetadata/v1/",
        "https://metadata.goog/computeMetadata/v1/",
        *(
            f"https://{priv_host}:{p}/v1"
            for priv_host, p in (
                ("10.0.0.1", 8000),
                ("192.168.1.1", 8000),
                ("100.64.0.1", 8000),
                ("0.0.0.0", 8080),
            )
        ),
        "https://user:pass@api.openai.com/v1",
        "https://api.example.com:99999/v1",
        "https://api.example.com/v1\r\nX-Injected: 1",
        "https://localhost.attacker.com/v1",
    ]
    for u in bad_urls:
        assert init_mod._validate_fast_base_url(u) == "", f"Should reject {u}"
    loop_v4 = "127.0.0.1"
    local_v1 = f"http://{loop_v4}:11434/v1"
    assert init_mod._validate_fast_base_url(local_v1) == local_v1
    assert init_mod._validate_fast_base_url(f"http://[::1]:{8080}/v1") == f"http://[::1]:{8080}/v1"

    # 2. Escaped JSON & extended secrets
    escaped_samples = [
        r'{"arguments": "{\"api_key\": \"my_super_secret_key_123456\"}"}',
        "https://api.example.com/v1?api_key=secret_query_token_987654321",
        "https://admin:SuperSecretPass123!@internal.example.com/api",
        "Authorization: Basic YWRtaW46U3VwZXJTZWNyZXRQYXNzMTIzIQ==",
        "aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "AWS_ACCESS_KEY_ID=ASIAIOSFODNN7EXAMPLE",
        _synthetic_token("rk_live_", "51NxYzAbCdEfGhIjKlMnOpQrStUvWxYz123456"),
    ]
    for s in escaped_samples:
        assert "[redacted]" in H.redact(s), f"Failed to redact: {s}"

    # 3. Digest & Radar redaction + untrusted tags
    snap = rt.inspect_session(SID)
    digest = rt._build_full_context_digest(SID, snap)
    assert "<untrusted_session_transcript>" in digest and "</untrusted_session_transcript>" in digest

    # 4. Lone surrogate sanitization
    lone_surr = "\ud800"
    rtl_override = "\u202e"
    nul_ch = "\x00"
    surr_entry = rt.record_qa_entry(SID, task_id="surr_1", question=f"q {lone_surr}", answer=f"ans {lone_surr}{nul_ch}{rtl_override} ok")
    assert lone_surr not in surr_entry["question"] and lone_surr not in surr_entry["answer"]
    assert nul_ch not in surr_entry["answer"] and rtl_override not in surr_entry["answer"]
    json.dumps(rt.inspect_session(SID), ensure_ascii=False)  # never raises UnicodeEncodeError

    # 5 & 6. Free-card Mini-Chat steer (target_kind="") and sticky anomaly exclusion
    p_free = H.open_probe("s_free", text="Refactor helper", source="card_synth", live={"consecutive_errors": 0}, target_kind="")
    H.tick_probe(p_free, tool="read_file", is_error=False)
    H.tick_probe(p_free, tool="patch", is_error=False)
    H.tick_probe(p_free, tool="write_file", is_error=False)
    H.finalize_probe(p_free, current_kinds={"edit_churn"})
    assert p_free["verdict"] == "helped"

    # 7. Read-only inspect_session polling does NOT increment `uses`
    exp_res = rt.add_experience(
        session_id=SID,
        cue="When testing read-only idempotency",
        lesson="Never mutate disk on GET /snapshot.",
        scope="INV",
        lever="C8",
        kinds="error_streak",
    )
    exp_id = exp_res["experience"]["id"]
    uses_before = next(e["uses"] for e in rt.rsi_overview()["experiences"] if e["id"] == exp_id)
    for _ in range(5):
        rt.inspect_session(SID)
    uses_after = next(e["uses"] for e in rt.rsi_overview()["experiences"] if e["id"] == exp_id)
    assert uses_after == uses_before

    # 8. Async delegation failure detection without resetting turn state
    t_async = time.time() + 100
    async_msg = (
        "[ASYNC DELEGATION BATCH COMPLETE — deleg_abc123]\n"
        "--- ✗ TASK 1/2: Audit worker (status=failed, 12.3s) ---\n"
        "[TRUNCATED — subagent hit its iteration cap]\n"
    )
    _add_rows(db_file, [("msg", SID, "user", async_msg, None, None, None, t_async)])
    snap_async = rt.inspect_session(SID)
    assert any(a["kind"] == "subagent_silent_failure" for a in snap_async["anomalies"])


def test_v53_fastapi_routes_and_cli_commands(sample_state_db, monkeypatch):
    """Exercise dashboard/plugin_api.py routes and CLI/slash commands for full coverage."""
    import asyncio
    import inspect
    import sys
    from argparse import Namespace
    from types import SimpleNamespace
    from test_btw_studio import ROOT_DIR, _ensure_test_shims, _load_module

    _ensure_test_shims()
    rt, _, tmp_path = sample_state_db
    api = _load_module("btw_plugin_api_v53", ROOT_DIR / "dashboard" / "plugin_api.py")
    monkeypatch.setitem(sys.modules, api.RUNTIME_MODULE, rt)

    def _call_route(fn, *a, **kw):
        out = fn(*a, **kw)
        return asyncio.run(out) if inspect.isawaitable(out) else out

    # Exercise synchronous and async FastAPI route handlers directly (works with or without starlette installed)
    assert _call_route(api.health)["ok"] is True
    assert _call_route(api.sessions, limit=5)["ok"] is True
    assert _call_route(api.compare, a=SID, b="subagent-child-01")["ok"] is True
    assert _call_route(api.snapshot, session_id=SID)["found"] is True
    assert _call_route(api.export_report, session_id=SID)["ok"] is True
    assert _call_route(api.subagents_tree, session_id=SID)["count"] >= 1
    assert _call_route(api.sessions_badges)["ok"] is True
    assert _call_route(api.search, q="Phase", limit=10)["ok"] is True
    assert _call_route(api.presets_get)["ok"] is True
    assert _call_route(api.packs_list)["ok"] is True
    assert _call_route(api.packs_export, name="Test Pack")["ok"] is True
    assert _call_route(api.presets_resolve, {"prompt": "Branch {{git_branch}}", "session_id": SID})["ok"] is True

    # Adversarial inputs on /synth, /recap, /record, /rsi/experience, /promote, /steer/synth
    res_synth = _call_route(api.synth, {"text": "All 10 tests green.", "max_lines": "not-an-int", "use_llm": False})
    assert res_synth["ok"] is True and len(res_synth["summary"]) <= 114
    res_recap = _call_route(api.recap, {"session_id": SID, "use_llm": False})
    assert res_recap["ok"] is True

    rec = _call_route(api.record, {"session_id": SID, "question": "Q \ud800", "answer": "A \ud800", "duration_ms": "nan"})
    assert rec["ok"] is True and rec["entry"]["duration_ms"] is None
    assert _call_route(api.pin, {"session_id": SID, "id": rec["entry"]["id"]})["ok"] is True
    assert _call_route(api.clear, {"session_id": SID, "id": rec["entry"]["id"]})["ok"] is True

    exp_added = _call_route(api.rsi_experience_add, {"lesson": "Always validate inputs", "cue": "When fuzzing API", "kinds": 12345})
    assert exp_added["ok"] is True and exp_added["experience"]["kinds"] == []
    assert _call_route(api.rsi_get, session_id=SID)["ok"] is True
    assert _call_route(api.rsi_probe, {"session_id": SID, "text": "Run pytest -q"})["ok"] is True
    assert _call_route(api.rsi_experience_delete, {"id": exp_added["experience"]["id"]})["ok"] is True
    assert _call_route(api.promote, {"target": "skill", "question": "How to test?", "answer": "Run pytest."})["ok"] is True

    # Deterministic fallback on /steer/synth when LLM raises
    rt._ctx.llm = None
    monkeypatch.setattr(rt, "_plugin_llm", lambda: SimpleNamespace(complete=lambda *a, **k: (_ for _ in ()).throw(RuntimeError("offline"))))
    st_res = _call_route(
        api.steer_synth, {"session_id": SID, "instruction": "Fix {{last_error}}", "card_question": "Q", "card_answer": "Details"}
    )
    assert st_res["ok"] is True and st_res["engine"] == "deterministic"

    # Slash commands: demo & compare & fallback ask
    assert "Interactive Harness² Showcase" in rt.handle_slash_command("demo")
    assert "Session Compare" in rt.handle_slash_command(f"compare {SID} subagent-child-01")
    assert "$0 Fallback" in rt.handle_slash_command("ask What is happening?")

    # CLI parser & commands (radar, demo, compare, steer without orphan probe)
    import argparse

    parser = argparse.ArgumentParser()
    rt.setup_cli_parser(parser)
    for cli_args in (
        Namespace(action="demo", query=[], session=SID, mode="fast", open_probe=False, json=True),
        Namespace(action="compare", query=[SID, "subagent-child-01"], session=SID, mode="fast", open_probe=False, json=False),
        Namespace(action="steer", query=["Fix", "bug"], session=SID, mode="fast", open_probe=False, json=True),
    ):
        with pytest.raises(SystemExit) as exc_info:
            rt.handle_cli_command(cli_args)
        assert exc_info.value.code == 0


def test_v54_self_recovery_rsi_error_resolved_and_subagent_feed(sample_state_db):
    """Verify v5.4 improvements:
    1. Autonomous self-recovery (streak >= 2 consecutive errors followed by clean diagnosis/fix/verification)
       automatically mints a `self_recovered` Δτ probe and an evidence-backed `INV / C6` lesson.
    2. `recent_errors` entries carry `resolved: True` once a subsequent step on the tool or verification succeeds.
    3. `inspect_subagent_feed` returns structured Goal + Steer + Turn (CoT reasoning + Tool Action + Preview + Output)
       from read-only `state.db` without mutating a single byte.
    """
    from test_btw_studio import ROOT_DIR, _load_module

    rt, db_file, _ = sample_state_db
    t0 = time.time() + 200
    rows = [
        ("msg", SID, "user", "Run the test suite and fix any issue.", None, None, None, t0),
        ("msg", SID, "assistant", "", _call("sr1", "terminal", {"command": "pytest -q"}), None, None, t0 + 1),
        ("msg", SID, "tool", json.dumps({"output": "ModuleNotFoundError: No module named 'foo'", "exit_code": 1}), None, "sr1", "terminal", t0 + 2),
        ("msg", SID, "assistant", "", _call("sr2", "terminal", {"command": "pytest -q"}), None, None, t0 + 3),
        ("msg", SID, "tool", json.dumps({"output": "ModuleNotFoundError: No module named 'foo'", "exit_code": 1}), None, "sr2", "terminal", t0 + 4),
        ("msg", SID, "assistant", "Recovered and all tests pass.", _call("sr3", "terminal", {"command": "python -m pytest -q"}), None, None, t0 + 5),
        ("msg", SID, "tool", json.dumps({"output": "12 passed in 0.4s", "exit_code": 0}), None, "sr3", "terminal", t0 + 6),
    ]
    _add_rows(db_file, rows)

    # Also add reasoning + tool + steer messages to subagent-child-01 to test inspect_subagent_feed
    conn = sqlite3.connect(str(db_file))
    try:
        cols = {r[1] for r in conn.execute("PRAGMA table_info(messages)").fetchall()}
        if "reasoning" not in cols:
            conn.execute("ALTER TABLE messages ADD COLUMN reasoning TEXT")
        if "reasoning_content" not in cols:
            conn.execute("ALTER TABLE messages ADD COLUMN reasoning_content TEXT")
        conn.execute(
            "INSERT INTO messages (session_id, role, content, timestamp) VALUES (?, 'user', ?, ?)",
            ("subagent-child-01", "Audit all 18 catalog rules and verify SSRF guards.", t0 + 10),
        )
        conn.execute(
            "INSERT INTO messages (session_id, role, content, tool_calls, timestamp, reasoning) VALUES (?, 'assistant', ?, ?, ?, ?)",
            (
                "subagent-child-01",
                "Checking runtime.py SSRF validation.",
                _call("sub_c1", "read_file", {"path": "runtime.py"}),
                t0 + 11,
                "First I will inspect _validate_fast_base_url in runtime.py for IPv6-mapped loopback.",
            ),
        )
        conn.execute(
            "INSERT INTO messages (session_id, role, content, tool_call_id, tool_name, timestamp) VALUES (?, 'tool', ?, 'sub_c1', 'read_file', ?)",
            ("subagent-child-01", json.dumps({"content": "def _validate_fast_base_url...", "total_lines": 50}), t0 + 12),
        )
        conn.execute(
            "INSERT INTO messages (session_id, role, content, timestamp) VALUES (?, 'user', ?, ?)",
            (
                "subagent-child-01",
                "[OUT-OF-BAND USER MESSAGE — direct steer]\nAlso check hex IPs.\n[/OUT-OF-BAND USER MESSAGE]",
                t0 + 13,
            ),
        )
        conn.commit()
    finally:
        conn.close()

    before_sha = hashlib.sha256(db_file.read_bytes()).hexdigest()
    snap = rt.inspect_session(SID)
    assert snap["counts"]["trailing_errors"] == 0
    assert snap["counts"]["self_recoveries"] >= 1
    # Recent errors from the streak are now marked resolved=True
    rec_errs = [e for e in snap["recent_errors"] if "ModuleNotFoundError" in e["detail"]]
    assert rec_errs and all(e["resolved"] is True for e in rec_errs)

    # Autonomous self_recovered probe and lesson minted
    auto_probes = [p for p in snap["rsi"]["recent"] if p["verdict"] == "self_recovered"]
    assert auto_probes and "autonomous" in auto_probes[0]["reason"]
    ov = rt.rsi_overview(SID)
    assert ov["verdicts"]["self_recovered"] >= 1
    assert any("self-recovered via" in e["lesson"] for e in ov["experiences"])

    # Structured subagent feed ($0 read-only SQLite)
    feed = rt.inspect_subagent_feed("subagent-child-01", limit=18)
    assert feed["ok"] is True and feed["found"] is True
    kinds = [s["kind"] for s in feed["steps"]]
    assert "goal" in kinds and "turn" in kinds and "steer" in kinds
    turn_with_cot = next(s for s in feed["steps"] if s["kind"] == "turn" and s.get("thought"))
    assert "IPv6-mapped loopback" in turn_with_cot["thought"]
    assert turn_with_cot["tools"][0]["tool"] == "read_file" and turn_with_cot["tools"][0]["status"] == "ok"
    assert hashlib.sha256(db_file.read_bytes()).hexdigest() == before_sha


def test_v56_stt_dictation_delta_tau_v2_and_subagent_dedup(sample_state_db, monkeypatch):
    """Verify v5.6 improvements:
    1. STT Dictation: raw WebSpeech hallucination filtering + native Hermes STT pipeline via confined temp file in _data_dir().
    2. Mathematical Δτ v2 Steer Validation:
       - Intent-Action causal alignment S_align in [0, 1] and 4-axis contrast vector.
       - Anti-Base-Rate Fallacy guard: unfollowed explicit steer during passive reads -> `no_observed_effect`.
       - Converged multi-step recovery (streak 3 -> 1 diagnostic error -> patch -> pytest ok) -> `helped`.
       - Induced anomaly regression (0 errors -> 1 error + induced command_loop) -> `hurt`.
       - Identical read-only thrashing -> `no_observed_effect`.
       - 1-step decisive turn-settled closure in `_evaluate_probes`.
    3. Subagent Canonical Deduplication & Multi-Turn CoT/Tools Extraction:
       - Ephemeral `sa-0-...` ID from `delegate_task` resolves to `state.db` child session (`2026...`), deduplicating cards and returning full multi-turn CoT + inline `<thought>` tags + `recent_tools`.
    """
    import base64
    import sys
    from types import ModuleType

    rt, db_file, _ = sample_state_db
    H = rt.H

    # 1. STT Dictation pipeline & Whisper hallucination guard
    assert rt.manage_btw_stt_lease(active=True, lease_id="test-lease")["ok"] is True
    assert rt.manage_btw_stt_lease(active=False, lease_id="test-lease")["active"] is False

    halluc = rt.transcribe_btw_audio(raw_transcript="Thank you for watching.", language="en-US")
    assert halluc["ok"] is True and halluc["transcript"] == ""
    clean_ws = rt.transcribe_btw_audio(raw_transcript="Explique o erro de sintaxe em runtime.py", language="pt-BR")
    assert clean_ws["ok"] is True and clean_ws["transcript"] == "Explique o erro de sintaxe em runtime.py"

    # Mock agent.transcription_provider.transcribe_audio_file to verify public STT pipeline & temp file cleanup
    fake_tp = ModuleType("agent.transcription_provider")
    observed_paths: list[Path] = []

    def _fake_transcribe_recording(wav_path: str, language: str = "en", model=None):
        p = Path(wav_path)
        observed_paths.append(p)
        assert p.is_file() and p.parent == rt._data_dir()
        return {"success": True, "transcript": "Corrija o parser.py e rode pytest", "provider": "faster-whisper-local"}

    fake_tp.transcribe_audio_file = _fake_transcribe_recording  # type: ignore[attr-defined]
    fake_agent = sys.modules.get("agent") or ModuleType("agent")
    fake_agent.transcription_provider = fake_tp  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "agent", fake_agent)
    monkeypatch.setitem(sys.modules, "agent.transcription_provider", fake_tp)

    dummy_webm = b"RIFF" + (b"\x00" * 128)
    data_url = "data:audio/webm;base64," + base64.b64encode(dummy_webm).decode("ascii")
    rt._ctx.transcribe_audio = None  # ensure native path runs
    stt_out = rt.transcribe_btw_audio(data_url, mime_type="audio/webm", language="pt-BR")
    assert stt_out["ok"] is True
    assert stt_out["transcript"] == "Corrija o parser.py e rode pytest"
    assert stt_out["provider"] == "faster-whisper-local"
    assert len(observed_paths) == 1 and not observed_paths[0].exists()  # temp file cleaned up in finally

    # 2A. Mathematical Δτ v2: High Intent-Action Alignment
    p_aligned = H.open_probe(
        "s_math",
        text="Patch `parser.py` and run `pytest -q` to verify.",
        source="manual",
        live={"consecutive_errors": 0},
        target_kind="",
    )
    assert "parser.py" in p_aligned["e0"]["intent"]["files"]
    assert p_aligned["e0"]["intent"]["wants_verify"] is True and p_aligned["e0"]["intent"]["wants_write"] is True
    H.tick_probe(p_aligned, tool="patch", is_error=False, target_file="/workspace/parser.py")
    H.tick_probe(p_aligned, tool="terminal", is_error=False, command="pytest -q tests/test_parser.py", verified_flag=True)
    H.finalize_probe(p_aligned, current_kinds=set())
    assert p_aligned["verdict"] == "helped"
    assert p_aligned["delta"]["alignment"] >= 0.70
    assert p_aligned["delta"]["score"] >= 0.60
    assert p_aligned["delta"]["confidence"] == "high"
    assert "intent alignment" in p_aligned["reason"]

    # 2B. Anti-Base-Rate Fallacy: Unfollowed explicit steer during passive reads -> `no_observed_effect`
    p_ignored = H.open_probe(
        "s_math",
        text="Patch `parser.py` and run `pytest -q` now.",
        source="manual",
        live={"consecutive_errors": 0},
        target_kind="",
    )
    H.tick_probe(p_ignored, tool="read_file", is_error=False, target_file="/workspace/unrelated_a.md")
    H.tick_probe(p_ignored, tool="read_file", is_error=False, target_file="/workspace/unrelated_b.md")
    H.tick_probe(p_ignored, tool="search_files", is_error=False, args_preview='{"pattern": "other"}')
    H.finalize_probe(p_ignored, current_kinds=set())
    assert p_ignored["verdict"] == "no_observed_effect"
    assert "without acting on the steer target" in p_ignored["reason"]

    # 2C. Converged multi-step recovery (streak 3 -> 1 diagnostic error -> patch -> pytest ok) -> `helped`
    p_conv = H.open_probe(
        "s_math",
        text="Fix import and run pytest",
        source="anomaly",
        live={"consecutive_errors": 3},
        target_kind="error_streak",
    )
    H.tick_probe(p_conv, tool="terminal", is_error=True, command="pytest -q")
    H.tick_probe(p_conv, tool="patch", is_error=False, target_file="/workspace/app.py")
    H.tick_probe(p_conv, tool="terminal", is_error=False, command="pytest -q", verified_flag=True)
    H.finalize_probe(p_conv, current_kinds=set())
    assert p_conv["verdict"] == "helped"
    assert "converged" in p_conv["reason"] and p_conv["delta"]["trailing_post_errors"] == 0

    # 2D. Induced anomaly regression -> `hurt`
    p_reg = H.open_probe(
        "s_math",
        text="Try running command again",
        source="manual",
        live={"consecutive_errors": 0},
        anomaly_kinds=[],
    )
    H.tick_probe(p_reg, tool="read_file", is_error=False, target_file="/workspace/a.py")
    H.tick_probe(p_reg, tool="terminal", is_error=True, command="bad_cmd")
    H.tick_probe(p_reg, tool="read_file", is_error=False, target_file="/workspace/b.py")
    H.finalize_probe(p_reg, current_kinds={"command_loop"})
    assert p_reg["verdict"] == "hurt"
    assert "command_loop" in p_reg["delta"]["induced_anomalies"]

    # 2E. Identical read-only thrashing -> `no_observed_effect`
    p_thrash = H.open_probe("s_math", text="Check status", source="manual", live={"consecutive_errors": 0})
    for _ in range(3):
        H.tick_probe(p_thrash, tool="read_file", is_error=False, target_file="/workspace/same.py")
    H.finalize_probe(p_thrash, current_kinds=set())
    assert p_thrash["verdict"] == "no_observed_effect"

    # 3. Subagent canonical deduplication (`sa-0-...` <-> `20261108_...`) + `<thought>` CoT + 1-step turn-settled probe
    t_sub = time.time() + 350
    sub_Goal = "Refatore a UI/UX da seção de Overview em desktop/plugin.js e valide com node --check"
    p_one = rt.record_steer_probe(SID, text=f"Delegate: {sub_Goal}", source="manual")["probe"]
    _add_rows(
        db_file,
        [
            ("msg", SID, "assistant", "", _call("dt_99", "delegate_task", {"tasks": [{"goal": sub_Goal}]}), None, None, t_sub + 1),
            (
                "msg",
                SID,
                "tool",
                json.dumps(
                    {
                        "status": "dispatched",
                        "delegation_id": "deleg_ui_99",
                        "subagent_ids": ["sa-0-ui99"],
                        "goals": [sub_Goal],
                    }
                ),
                None,
                "dt_99",
                "delegate_task",
                t_sub + 2,
            ),
            ("msg", SID, "assistant", "Subagente despachado com sucesso.", None, None, None, t_sub + 3),
            ("sub", "20261108_125000_ui99", SID, f"Subagent: {sub_Goal[:44]}…", t_sub + 25, "completed", 4),
            ("msg", "20261108_125000_ui99", "user", sub_Goal, None, None, None, t_sub + 4),
            (
                "msg",
                "20261108_125000_ui99",
                "assistant",
                "<thought>Inspecionando variáveis CSS de glassmorphism em plugin.js.</thought>",
                _call("sc_1", "patch", {"path": "desktop/plugin.js", "old_string": "#7c3aed", "new_string": "rgba(255,255,255,0.03)"}),
                None,
                None,
                t_sub + 5,
            ),
            ("msg", "20261108_125000_ui99", "tool", json.dumps({"success": True}), None, "sc_1", "patch", t_sub + 6),
        ],
    )
    snap_settled = rt.inspect_session(SID)
    closed_one = next(p for p in snap_settled["rsi"]["recent"] if p["id"] == p_one["id"])
    assert closed_one["verdict"] == "helped" and closed_one["delta"]["delegated"] is True

    # Verify `sa-0-ui99` resolves directly to `20261108_125000_ui99` and extracts `<thought>` + `recent_tools`
    feed_by_alias = rt.inspect_subagent_feed("sa-0-ui99")
    assert feed_by_alias["ok"] is True and feed_by_alias["found"] is True
    turn_st = next(s for s in feed_by_alias["steps"] if s["kind"] == "turn")
    assert "glassmorphism" in turn_st["thought"]
    assert turn_st["tools"][0]["tool"] == "patch"

    tree = rt.inspect_subagents_tree(SID)
    matched_sub = next(s for s in tree["subagents"] if s["id"] == "20261108_125000_ui99")
    assert matched_sub["subagent_id"] == "sa-0-ui99"
    assert matched_sub["delegation_id"] == "deleg_ui_99"
    assert "glassmorphism" in matched_sub["full_reasoning_text"]
    assert matched_sub["recent_tools"] and matched_sub["recent_tools"][0]["tool"] == "patch"


