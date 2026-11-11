"""BTW Studio — Harness² side-channel engine (pure, deterministic, $0).

Maps the two coupled recursion loops of *Harness²: Recursive Agent Harnessing
for an Open World* (Xu et al., Google Research 2026, arXiv:2610.14224) onto a
side-channel that runs NEXT TO a live Hermes turn, never inside it:

Loop 1 — task-level, in flight (Propose → Probe → Compose, label-free)
  * ``lever_for``          — dual-scope diagnosis (INV = how the agent works,
                             DOM = what the workspace/practitioner knows) plus
                             the "cheapest harness lever" rule (Skill C6 →
                             Script C7 → Subagent C5 → Hook/Preset C8 → Memory
                             C3; always-on prose is the expensive option).
  * ``open_probe`` / ``tick_probe`` / ``finalize_probe`` — behavioural contrast
                             Δτ between the trajectory before a steer (e⁰) and
                             the next tool calls (e′). Verdicts follow the
                             paper's reflector: helped | hurt |
                             no_observed_effect | confounded.

Loop 2 — harnessing-level, across tasks (R_{t+1} = Update(R_t, H*_t, D_t))
  * ``experience_from_probe`` — only evidence-backed lessons enter the library;
                             a confounded contrast yields NO_ENTRY (an invented
                             attribution poisons every later task).
  * ``match_experiences``  — retrieve lessons whose cue fits the current
                             workspace / anomaly shape.
  * ``utility_yield``      — U(p) per preset with recency decay; hurt/unused
                             presets sink (auto-prune is a suggestion, never a
                             silent delete).

ψ_verify gates (the three Harness² discard rules)
  1. every Skill needs a trigger line      → ``build_promotion``
  2. no unresolved template braces         → ``resolve_template``
  3. every script named must exist/compile → ``psi_verify_files``

Everything here is pure Python with no I/O except ``psi_verify_files`` (bounded,
read-only reads of files the agent itself touched). No model calls, no network.
"""

from __future__ import annotations

import ast
import json
import math
import os
import re
import threading
import time
import uuid
from pathlib import Path
from typing import Any, Iterable, Optional

try:
    from agent.redact import redact_sensitive_text as _core_redact_sensitive_text
except ImportError:
    _core_redact_sensitive_text = None  # type: ignore[assignment]

# --------------------------------------------------------------- vocabulary

VERDICTS = ("helped", "hurt", "no_observed_effect", "confounded", "self_recovered")

# Harness² components (paper §3, Fig. 2). Order inside CHEAPEST_ORDER is the
# Prompt-1 preference: on-demand first, always-on prose last.
LEVERS: dict[str, dict[str, str]] = {
    "C1": {"name": "System prompt", "cost": "always-on"},
    "C2": {"name": "Guardrail", "cost": "always-on"},
    "C3": {"name": "Memory", "cost": "always-on"},
    "C4": {"name": "Tool guidance", "cost": "always-on"},
    "C5": {"name": "Subagent", "cost": "isolated"},
    "C6": {"name": "Skill", "cost": "on-demand"},
    "C7": {"name": "Script", "cost": "on-demand"},
    "C8": {"name": "Hook / Preset", "cost": "in-loop"},
}
CHEAPEST_ORDER = ("C6", "C7", "C5", "C8", "C2", "C3", "C4", "C1")

CODE_EXT = frozenset(
    {
        ".py", ".pyi", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".go", ".rs", ".java",
        ".kt", ".kts", ".c", ".h", ".cc", ".cpp", ".hpp", ".cs", ".rb", ".php", ".swift",
        ".scala", ".lua", ".sh", ".bash", ".ps1", ".sql",
    }
)

# Commands that count as verification of an edit (tests, linters, type checks,
# syntax checks, builds, plugin validation). Conservative: a hit only CLEARS
# the unverified-edit signal, so a broad pattern cannot create false alarms.
VERIFY_CMD_RE = re.compile(
    r"(?:\b(?:pytest|unittest|tox|nox|vitest|jest|mocha|ava|playwright|cypress|ruff|flake8|pylint|"
    r"mypy|pyright|black\s+--check|eslint|biome|tsc|shellcheck|hadolint|"
    r"py_compile|compileall)\b"
    r"|\bnode\s+(?:--input-type=\w+\s+)?--check\b"
    r"|\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:test|lint|build|check|typecheck|verify)\b"
    r"|\bgo\s+(?:test|vet|build)\b|\bcargo\s+(?:test|check|build|clippy)\b"
    r"|\bmake\s+(?:test|check|lint|build)\b|\bgradlew?\s+\w*(?:test|check|build)\b"
    r"|\bmvn\s+(?:test|verify|package)\b|\bdotnet\s+(?:test|build)\b"
    r"|\bphp\s+-l\b|\bbash\s+-n\b|\bhermes\s+plugins\s+validate\b)",
    re.IGNORECASE,
)

READ_ONLY_TOOLS = frozenset(
    {
        "read_file", "search_files", "web_search", "web_extract", "web_search_plus", "web_extract_plus",
        "session_search", "skill_view", "skills_list", "vision_analyze", "browser_snapshot", "browser_exec",
        "tool_search", "tool_describe", "memory_search", "kanban_show", "kanban_list",
    }
)
WRITE_TOOLS = frozenset({"write_file", "patch", "edit_file", "apply_patch", "create_file"})
READ_ONLY_CMD_RE = re.compile(
    r"^\s*(?:cd\s+\S+\s*(?:&&|;)\s*)?(?:ls|dir|cat|type|head|tail|less|grep|rg|find|fd|tree|wc|pwd|echo|"
    r"git\s+(?:status|log|diff|show|branch|blame)|which|where)\b",
    re.IGNORECASE,
)

RESEARCH_STALL_THRESHOLD = 14
PROBE_WINDOW = 3
PROBE_TTL_S = 15 * 60

# Secrets that must never reach a model through a template token or digest.
# Covers OpenAI/Anthropic/Stripe/GitHub/GitLab/HF/Slack/AWS/Google/NPM/PyPI/SendGrid/Databricks/Discord/JWT tokens,
# PEM private key blocks, scheme://user:password@host URIs, Authorization Bearer/Basic headers, Cookie session headers,
# URL query parameters (?key=..., &api_key=...), escaped JSON (\"api_key\": \"...\"), and quoted/unquoted assignments.
SECRET_RE = re.compile(
    r"(?:"
    r"\b(?:sk-[A-Za-z0-9_\-]{12,}|rk_(?:live|test)_[A-Za-z0-9]{12,}|sk_(?:live|test)_[A-Za-z0-9]{12,}|whsec_[A-Za-z0-9_\-]{16,}"
    r"|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|glpat-[A-Za-z0-9_\-]{16,}|shpat_[0-9a-fA-F]{24,}|hvs\.[A-Za-z0-9_\-]{20,}"
    r"|hf_[A-Za-z0-9]{20,}|xox[abprse]-[A-Za-z0-9.\-]{10,}|(?:AKIA|ASIA)[0-9A-Z]{16}|AGE-SECRET-KEY-1[A-Z0-9]{50,}"
    r"|AIza[0-9A-Za-z_\-]{30,}|ya29\.[0-9A-Za-z_\-.]{20,}|npm_[A-Za-z0-9]{20,}"
    r"|pypi-[A-Za-z0-9_\-]{32,}|SG\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{20,}|dapi[0-9a-f]{24,}"
    r"|(?:gsk|csk|pplx|fc|tvly|r8|sbp|ntn)[_-][A-Za-z0-9_\-]{16,}|lin_api_[A-Za-z0-9]{20,}|dop_v1_[0-9a-f]{40,}"
    r"|\d{8,12}:AA[A-Za-z0-9_\-]{30,}"
    r"|[MN][A-Za-z0-9]{23,}\.[A-Za-z0-9_\-]{6}\.[A-Za-z0-9_\-]{27,}"
    r"|eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{6,})"
    r"|-----BEGIN [A-Z0-9 ]{0,32}PRIVATE KEY(?:\s+BLOCK)?-----[\s\S]{0,8192}?-----END [A-Z0-9 ]{0,32}PRIVATE KEY(?:\s+BLOCK)?-----"
    r"|-----BEGIN [A-Z0-9 ]{0,32}PRIVATE KEY(?:\s+BLOCK)?-----[^\n]{0,120}(?:\n[A-Za-z0-9+/=\r\t ]{16,128})+"
    r"|\b[a-zA-Z][a-zA-Z0-9+.\-]{1,24}://[^/\s:@\"'`\\]{0,128}:[^@\s\"'`\\]{3,256}@"
    r"|(?i:\b(?:authorization\s*[:=]\s*\\?['\"`]?(?:bearer|basic|token|apikey)\s+|bearer\s+))[A-Za-z0-9._\-+/=]{8,}"
    r"|(?i:\bcookie\s*[:=]\s*\\?['\"`]?[^\r\n\"'`:]{0,200}?\b(?:session[_-]?id|sid|jwt|auth|token)\s*=\s*)[^\s;\"'`\\]{6,}"
    r"|(?i:(?<=[?&])(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|secret|token|password|passwd|key)=)[^&\s\"'`\\]{6,}"
    r"|(?i:\b[a-z0-9_]{0,32}?(?:api[_-]?key|secret[_-]?key|access[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|private[_-]?key|secret|token|password|passwd|db[_-]?pass)(?:\\+['\"]\s*:\s*\\+['\"][^\\'\"\r\n]{6,240}\\+['\"]|['\"`]?\s*[:=]\s*['\"`][^'\"`\r\n]{6,240}['\"`]|['\"`]?\s*[:=]\s*[^\s'\"`,;}\]\\]{6,}))"
    r")"
)

TEMPLATE_TOKEN_RE = re.compile(r"\{\{\s*@?([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}")
ANY_BRACES_RE = re.compile(r"\{\{[^{}]*\}\}|\{%[^{}]*%\}")
TOKEN_CHAR_CAP = 400

CONTEXT_TOKENS: dict[str, str] = {
    "last_error": "Most recent tool error / non-zero exit",
    "active_tool": "Tool running right now (with argument preview)",
    "active_file": "Most recently edited or inspected file in the session",
    "last_command": "Most recent terminal command and its exit code",
    "touched_files": "Files edited or read this session (newest first)",
    "git_branch": "Git branch recorded for the session",
    "cwd": "Session working directory",
    "todo_pending": "Open items of the active todo plan",
    "subagents": "Spawned subagents and their state",
    "model": "Model serving the main session",
    "cost": "Measured spend, tokens and cache hit",
    "anomalies": "Open Loop-Guard findings",
}


_SECRET_FAST_TRIGGERS = (
    "-", "_", ":", "=", "@", ".", "AKIA", "ASIA", "AIza", "dapi", "shpat", "ya29", "eyJ", "bearer", "Bearer", "BEARER",
)


def redact(text: str) -> str:
    s = str(text or "")
    if not s or not any(tok in s for tok in _SECRET_FAST_TRIGGERS):
        return s
    return SECRET_RE.sub("[redacted]", s)


def redact_egress(text: str) -> str:
    """Apply Hermes core's ``redact_sensitive_text(..., force=True)`` (vault values, CLI flags,
    connection strings, profile patterns) when available, plus deterministic ``SECRET_RE``."""
    raw = str(text or "")
    if not raw:
        return ""
    if callable(_core_redact_sensitive_text):
        try:
            cored = _core_redact_sensitive_text(raw, force=True)
            if isinstance(cored, str):
                raw = cored
        except Exception:
            pass
    return SECRET_RE.sub("[redacted]", raw)


def strip_llm_code_fence(text: str) -> str:
    """Strip outer markdown code fences from short auxiliary LLM outputs in pure O(N) linear time."""
    s = str(text or "").strip()
    if not (s.startswith("```") and s.endswith("```") and len(s) > 6):
        return s
    first_nl = s.find("\n")
    if first_nl == -1:
        inner_single = s[3:-3].strip()
        return inner_single if "```" not in inner_single else s
    header = s[3:first_nl].strip()
    if header and (len(header) > 24 or not re.fullmatch(r"[A-Za-z0-9_+-]{1,24}", header)):
        return s
    inner = s[first_nl + 1 : -3]
    if "```" in inner:
        return s
    return inner.strip()


def _clip(text: Any, limit: int = TOKEN_CHAR_CAP) -> str:
    s = re.sub(r"\s+", " ", str(text or "")).strip()
    return (s[: limit - 1] + "…") if len(s) > limit else s


# ------------------------------------------------- Loop 1 · dual-scope levers

_LEVER_TABLE: dict[str, dict[str, str]] = {
    "claimed_without_tool": {
        "scope": "INV",
        "lever": "C8",
        "why": "A completion claim with zero tool calls is a loop invariant violation: a hook catches it every time, prose can be skipped.",
    },
    "error_streak": {
        "scope": "INV",
        "lever": "C6",
        "why": "Repeated failures on one tool are a procedure gap: a skill with a trigger line loads only when this shape reappears.",
    },
    "command_loop": {
        "scope": "INV",
        "lever": "C7",
        "why": "The same failing command re-run unchanged: a deterministic script (diagnose → fix → retry once) beats another reminder.",
    },
    "unverified_edit": {
        "scope": "INV",
        "lever": "C8",
        "why": "A successful write does not prove the file works (Harness² Fig. 9/17): enforce a verify step after edits.",
    },
    "subagent_silent_failure": {
        "scope": "INV",
        "lever": "C5",
        "why": "A delegated subagent ended in error or empty: tighten the subagent contract (inputs, expected output, failure report).",
    },
    "subagent": {
        "scope": "INV",
        "lever": "C5",
        "why": "Steering a delegated subagent refines its task contract and execution bounds.",
    },
    "research_stall": {
        "scope": "INV",
        "lever": "C8",
        "why": "Research expands to fill the budget while the deliverable stays unwritten (Harness² Fig. 19): a deliverable watchdog fixes it.",
    },
    "cache_bust_warning": {
        "scope": "DOM",
        "lever": "C3",
        "why": "Low prompt-cache reuse on a long session: stable context belongs in a frozen prefix, volatile notes on demand.",
    },
    "edit_churn": {
        "scope": "DOM",
        "lever": "C6",
        "why": "Many incremental patches on one file signal a missing workspace fact: write it down once as a skill reference.",
    },
    "test_weakening": {
        "scope": "INV",
        "lever": "C2",
        "why": "Weakening or skipping assertions after a failing test masks regressions instead of fixing the root cause.",
    },
    "silent_model_fallback": {
        "scope": "DOM",
        "lever": "C4",
        "why": "Provider returned a different model than requested mid-turn; Δτ probes in this window are marked confounded.",
    },
}


_TEST_FILE_NAME_RE = re.compile(
    r"(?:^test_.*|_test\.[a-z0-9]+$|\.(?:test|spec)\.[a-z0-9]+$)",
    re.IGNORECASE,
)
_TEST_SKIP_INJECT_RE = re.compile(
    r"(?:\bpytest\.(?:mark\.)?(?:skip|xfail)\b|@unittest\.skip\b|\b(?:it|test|describe)\.skip\s*\("
    r"|\bxit\s*\(|\bxdescribe\s*\(|#\[\s*ignore\b|\bt\.Skip(?:f|Now)?\s*\()",
    re.IGNORECASE,
)


def _strip_comment_lines(src: str) -> str:
    return "\n".join(
        ln for ln in str(src or "").splitlines()
        if not ln.lstrip().startswith(("#", "//", "--"))
    )


def is_test_weakening_edit(file_path: str, old_str: str, new_str: str) -> bool:
    """Language-agnostic AST/structural check: True when an edit to a test file drops assertions or adds skip/xfail markers."""
    fname = Path(str(file_path or "").replace("\\", "/")).name
    if not fname or not _TEST_FILE_NAME_RE.search(fname):
        return False
    old_clean = _strip_comment_lines(old_str)
    new_clean = _strip_comment_lines(new_str)
    if not new_clean and not old_clean:
        return False
    if _TEST_SKIP_INJECT_RE.search(new_clean) and not _TEST_SKIP_INJECT_RE.search(old_clean):
        return True
    assert_re = r"\b(?:assert|assertEqual|assertTrue|assertRaises|expect)\b"
    old_asserts = len(re.findall(assert_re, old_clean))
    new_asserts = len(re.findall(assert_re, new_clean))
    return old_asserts >= 1 and new_asserts < old_asserts


def lever_for(kind: str) -> dict[str, str]:
    """Return ``{scope, lever, lever_name, why}`` for an anomaly kind."""
    row = _LEVER_TABLE.get(kind) or {"scope": "INV", "lever": "C6", "why": "Recurring procedure → on-demand skill."}
    return {**row, "lever_name": LEVERS[row["lever"]]["name"], "cost": LEVERS[row["lever"]]["cost"]}


def decorate_anomalies(anomalies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Attach Harness² metadata (+ honest epistemic seals: D0 observed vs D1 heuristic) in place."""
    heuristic_kinds = {"claimed_without_tool", "research_stall", "unverified_edit"}
    for a in anomalies:
        kind = str(a.get("kind") or "")
        meta = lever_for(kind)
        a.setdefault("scope", meta["scope"])
        a.setdefault("lever", meta["lever"])
        a.setdefault("lever_name", meta["lever_name"])
        a.setdefault("lever_why", meta["why"])
        a.setdefault("evidence", "observed")  # backward-compatible $0 deterministic seal
        a.setdefault("epistemic_tier", "D1" if kind in heuristic_kinds else "D0")
        if meta["lever"] == "C5" or kind == "subagent_silent_failure":
            a.setdefault("suggested_action", "launch_subagent")
            a.setdefault("suggested_subagent_goal", f"Fix subagent failure: {a.get('detail') or a.get('title')}")
        elif kind == "unverified_edit":
            a.setdefault("suggested_subagent_goal", f"Run test verification on edited files: {a.get('detail')}")
    return anomalies


def health_state(anomalies: list[dict[str, Any]], open_probes: int = 0) -> dict[str, Any]:
    """Calm-by-default flight state: calm | watch | act (+ steering overlay)."""
    sev = [str(a.get("severity") or "low") for a in anomalies or []]
    high, med, low = sev.count("high"), sev.count("medium"), sev.count("low")
    score = max(0, min(100, 100 - 34 * high - 14 * med - 5 * low))
    state = "act" if high else ("watch" if (med or low) else "calm")
    return {
        "state": state,
        "score": score,
        "high": high,
        "medium": med,
        "low": low,
        "steering": bool(open_probes),
    }


# --------------------------------------------- ψ_verify · template braces gate

def _token_value(name: str, telemetry: dict[str, Any]) -> str:
    t = telemetry or {}
    live = t.get("live") or {}
    if name == "last_error":
        errs = t.get("recent_errors") or []
        if errs:
            e = errs[0]
            return f"{e.get('tool')}: {e.get('detail')}"
        return ""
    if name == "active_tool":
        tool = live.get("active_tool") or ""
        if not tool:
            return ""
        prev = live.get("active_tool_args_preview") or ""
        return f"{tool} ({prev})" if prev else str(tool)
    if name == "last_command":
        cmds = t.get("recent_commands") or []
        if cmds:
            c = cmds[0]
            ec = "running" if c.get("exit_code") is None else f"exit {c.get('exit_code')}"
            return f"{c.get('command')} ({ec})"
        return ""
    if name == "active_file":
        files = t.get("touched_files") or []
        if files:
            return str(files[0])
        for anom in t.get("anomalies") or []:
            if isinstance(anom, dict) and anom.get("kind") == "edit_churn" and anom.get("detail"):
                return str(anom["detail"])
        return ""
    if name == "touched_files":
        return ", ".join(str(x) for x in (t.get("touched_files") or [])[:6])
    if name == "git_branch":
        return str(t.get("git_branch") or "")
    if name == "cwd":
        return str(t.get("cwd") or "")
    if name == "todo_pending":
        todos = [x for x in (t.get("todos") or []) if x.get("status") != "completed"]
        return " | ".join(f"[{x.get('status')}] {x.get('content')}" for x in todos[:6])
    if name == "subagents":
        subs = t.get("subagents") or []
        return " | ".join(
            f"{s.get('title') or s.get('id')} ({'done' if s.get('ended_at') else 'running'})" for s in subs[:5]
        )
    if name == "model":
        return str(t.get("model") or live.get("model") or "")
    if name == "cost":
        tk = t.get("tokens") or {}
        if not tk:
            return ""
        return (
            f"${float(tk.get('cost_usd') or 0):.4f} · in {int(tk.get('input') or 0):,} · "
            f"out {int(tk.get('output') or 0):,} · cache {tk.get('cache_hit_pct', 0)}%"
        )
    if name == "anomalies":
        return " | ".join(f"[{a.get('severity')}] {a.get('title')}" for a in (t.get("anomalies") or [])[:4])
    return ""


def resolve_template(text: str, telemetry: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    """Interpolate ``{{token}}`` / ``{{@token}}`` with live, clamped, redacted values.

    Harness² discard rule #2: nothing shaped like ``{{…}}`` / ``{%…%}`` may reach
    a model unresolved. Unknown tokens are reported and replaced by a neutral
    marker; known-but-empty tokens become ``(none)``.
    """
    raw = str(text or "")
    used: list[str] = []
    unknown: list[str] = []
    empty: list[str] = []

    def sub(m: re.Match[str]) -> str:
        name = m.group(1).lower()
        if name not in CONTEXT_TOKENS:
            unknown.append(name)
            return f"({name}: unknown token)"
        used.append(name)
        val = _clip(redact(_token_value(name, telemetry or {})))
        if not val:
            empty.append(name)
            return "(none)"
        return val

    out = TEMPLATE_TOKEN_RE.sub(sub, raw)
    leftovers = ANY_BRACES_RE.findall(out)
    if leftovers:
        out = ANY_BRACES_RE.sub("(unresolved template)", out)
    return {
        "text": out,
        "original": raw,
        "changed": out != raw,
        "used": list(dict.fromkeys(used)),
        "unknown": list(dict.fromkeys(unknown)),
        "empty": list(dict.fromkeys(empty)),
        "stripped": len(leftovers),
    }


def lint_template(text: str) -> dict[str, Any]:
    """Static check used before saving a preset (no telemetry needed)."""
    raw = str(text or "")
    names = [m.group(1).lower() for m in TEMPLATE_TOKEN_RE.finditer(raw)]
    unknown = sorted({n for n in names if n not in CONTEXT_TOKENS})
    bare = ANY_BRACES_RE.findall(TEMPLATE_TOKEN_RE.sub("", raw))
    return {"ok": not unknown and not bare, "tokens": sorted(set(names) - set(unknown)), "unknown": unknown, "malformed": bare}


# ------------------------------------------- ψ_verify · scripts exist/compile

_WIN_DEVICE_RE = re.compile(r"^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..+)?$", re.IGNORECASE)
_STICKY_ANOMALIES = frozenset({"edit_churn", "cache_bust_warning", "subagent_silent_failure"})
_PSI_CACHE: dict[tuple[str, int, int], dict[str, Any]] = {}
_PSI_CACHE_MAX = 128
_PSI_CACHE_LOCK = threading.Lock()


def _is_nt_or_unc_str(s: str) -> bool:
    norm = str(s or "").strip().replace("/", "\\")
    if norm.startswith(("\\??\\", "\\\\.\\")):
        return True
    if norm.startswith("\\\\?\\"):
        rest = norm[4:]
        if not (len(rest) >= 3 and rest[0].isascii() and rest[0].isalpha() and rest[1:3] == ":\\"):
            return True
        if any(seg.upper() in ("GLOBAL", "GLOBALROOT", "UNC") for seg in rest.split("\\") if seg):
            return True
        return False
    return norm.startswith("\\\\")


_SCRATCH_FORBIDDEN_TAIL = frozenset(
    {
        ".hermes", ".ssh", ".aws", ".gnupg", ".kube", ".docker", ".azure",
        ".claude", ".codex", ".gemini", "mcp-tokens", "webapp", "vault",
        "memories", "browser-profile", "pairing", "sessions", "system32", "syswow64",
    }
)


def _dedicated_scratch_tail(parts_low: list[str]) -> Optional[list[str]]:
    """If ``parts_low`` lies strictly inside ``.../cache/scratch/<subdir>[/...]`` (depth >= 1 below ``scratch``),
    return the subpath segments after ``scratch``; otherwise ``None`` (bare ``cache/scratch`` returns ``None``)."""
    for idx_s in range(len(parts_low) - 1):
        if parts_low[idx_s] == "cache" and parts_low[idx_s + 1] == "scratch":
            tail = parts_low[idx_s + 2 :]
            if tail and not (set(tail) & _SCRATCH_FORBIDDEN_TAIL):
                return tail
    return None


def _is_broad_or_sensitive_root(root: Path) -> bool:
    """Refuse filesystem roots, bare Home, broad user folders, system dirs, or credential directories as a workspace root."""
    try:
        resolved = root.resolve()
        if resolved == resolved.anchor or len(resolved.parts) <= 1:
            return True
        home_candidates: list[Path] = [Path.home().resolve()]
        raw_real_home = os.environ.get("HERMES_REAL_HOME", "").strip()
        if raw_real_home:
            try:
                rh = Path(os.path.expanduser(os.path.expandvars(raw_real_home))).resolve()
                if rh not in home_candidates:
                    home_candidates.append(rh)
            except Exception:
                pass
        for h_cand in home_candidates:
            if resolved == h_cand:
                return True
            if resolved.parent == h_cand and resolved.name.lower() in {
                "documents", "downloads", "desktop", "pictures", "videos", "music", "onedrive", "library", "appdata"
            }:
                return True

        parts_low = [p.lower() for p in resolved.parts]

        # Check explicit HERMES_HOME confinement before scratch exemption: bare $HERMES_HOME root and
        # any profiles/*/{mcp-tokens,webapp,vault,memories,...} are always blocked, while dedicated
        # task/test subdirectories strictly under .../cache/scratch/<subdir> (depth >= 1) are permitted.
        raw_env_home = os.environ.get("HERMES_HOME", "").strip()
        if raw_env_home:
            try:
                env_h_res = Path(os.path.expanduser(os.path.expandvars(raw_env_home))).resolve()
                env_roots = [env_h_res]
                if env_h_res.parent.name.lower() == "profiles":
                    env_roots.append(env_h_res.parent.parent)
                for eh in env_roots:
                    if resolved == eh:
                        return True
                    if resolved.is_relative_to(eh):
                        rel_eh = [p.lower() for p in resolved.relative_to(eh).parts]
                        if _dedicated_scratch_tail(rel_eh) is not None:
                            return False
                        if rel_eh and (
                            rel_eh == ["cache", "scratch"]
                            or rel_eh == ["profiles"]
                            or (len(rel_eh) == 2 and rel_eh[0] == "profiles")
                            or bool(set(rel_eh) & {"mcp-tokens", "webapp", "vault", "memories", "browser-profile", "pairing", "sessions"})
                        ):
                            return True
            except Exception:
                pass

        if _dedicated_scratch_tail(parts_low) is not None:
            return False

        # Block bare AppData or AppData/Local or AppData/Roaming, while allowing Temp scratch dirs (AppData/Local/Temp/<sub...>)
        for idx_a in range(len(parts_low)):
            if parts_low[idx_a] == "appdata":
                rem_a = parts_low[idx_a + 1 :]
                if not rem_a or rem_a in (["local"], ["roaming"], ["locallow"], ["local", "temp"]):
                    return True
                if len(rem_a) >= 2 and rem_a[0] in ("local", "roaming") and rem_a[1] != "temp":
                    return True
        parts_set = set(parts_low)
        if parts_set & {
            ".hermes", ".ssh", ".aws", ".gnupg", ".kube", ".docker", ".azure",
            ".claude", ".codex", ".gemini", "system32", "syswow64",
        }:
            return True
        if len(parts_low) >= 2 and parts_low[1] in ("windows", "etc", "proc", "sys") and "temp" not in parts_set and "tmp" not in parts_set:
            return True
        for idx in range(len(parts_low) - 1):
            if parts_low[idx] == "local" and parts_low[idx + 1] == "hermes":
                return True
            if parts_low[idx] == ".config" and parts_low[idx + 1] in ("gh", "gcloud", "op", "1password", "bitwarden"):
                return True
    except Exception:
        return True
    return False


is_broad_root = _is_broad_or_sensitive_root


def psi_verify_files(
    paths: Iterable[str],
    max_files: int = 12,
    max_bytes: int = 512_000,
    allowed_root: Optional[str | Path] = None,
    require_root: bool = False,
) -> dict[str, dict[str, Any]]:
    """Bounded, read-only syntax check of files the agent touched.

    ``.py`` → ``ast.parse``; ``.json`` → ``json.loads``. Other files only report
    existence. Never executes anything, never writes. When ``allowed_root`` is
    provided (or ``require_root=True``), paths outside that workspace root or
    when the workspace root is invalid/broad are skipped (`outside_workspace`).
    """
    out: dict[str, dict[str, Any]] = {}
    root_resolved: Optional[Path] = None
    if allowed_root is not None:
        raw_root = str(allowed_root).strip()
        if raw_root and not _is_nt_or_unc_str(raw_root):
            try:
                cand_root_raw = Path(raw_root)
                if not cand_root_raw.is_symlink():
                    cand_root = cand_root_raw.resolve()
                    if cand_root.is_dir() and not _is_broad_or_sensitive_root(cand_root):
                        root_resolved = cand_root
            except Exception:
                root_resolved = None

    for raw in list(dict.fromkeys(str(p) for p in paths if p))[:max_files]:
        rec: dict[str, Any] = {"path": raw, "exists": False, "status": "missing"}
        raw_str = str(raw).strip()
        # Block UNC/NT network shares (\\server\share, \??\UNC\...) & Windows device pipes/names before any OS stat/resolve!
        is_unc_nt = _is_nt_or_unc_str(raw_str)
        try:
            raw_parts = Path(raw_str).parts if not is_unc_nt else ()
        except Exception:
            raw_parts = ()
        if (
            is_unc_nt
            or "\x00" in raw_str
            or any(_WIN_DEVICE_RE.match(part) for part in raw_parts)
        ):
            rec["status"] = "outside_workspace"
            out[raw] = rec
            continue
        if (require_root or allowed_root is not None) and root_resolved is None:
            rec["status"] = "outside_workspace"
            out[raw] = rec
            continue
        p = Path(raw_str)
        if root_resolved is not None and not (p.is_absolute() or bool(p.drive or p.root)):
            p = root_resolved / p
        elif root_resolved is not None and not p.is_absolute() and bool(p.root):
            rec["status"] = "outside_workspace"
            out[raw] = rec
            continue
        ext = p.suffix.lower()
        try:
            if p.is_symlink():
                rec["status"] = "outside_workspace"
                out[raw] = rec
                continue
            resolved_p = p.resolve()
            if root_resolved is not None and not resolved_p.is_relative_to(root_resolved):
                rec["status"] = "outside_workspace"
                out[raw] = rec
                continue
            name_low = resolved_p.name.lower()
            parts_low = [seg.lower() for seg in resolved_p.parts]
            scratch_tail = _dedicated_scratch_tail(parts_low)
            check_segs = scratch_tail if scratch_tail is not None else parts_low
            if (
                _is_broad_or_sensitive_root(resolved_p)
                or any(
                    seg in (".hermes", ".ssh", ".aws", ".gnupg", ".kube", ".docker", ".azure", ".mozilla", "1password", "bitwarden", "user data", "google-chrome", "brave-browser", "microsoft-edge", "vivaldi", "github cli", "gcloud")
                    for seg in check_segs
                )
                or name_low in ("auth.json", "config.yaml", "credentials.json", "secrets.json", "hosts.yml", "logins.json", "signons.sqlite", "formhistory.sqlite", ".netrc", ".npmrc", ".git-credentials")
                or name_low.startswith(("login data", "cookies", "web data", "local state", "key4.db"))
                or (name_low == ".env" or (name_low.startswith(".env.") and name_low not in (".env.example", ".env.sample", ".env.template")))
            ):
                rec["status"] = "outside_workspace"
                out[raw] = rec
                continue
            if not resolved_p.is_file():
                out[raw] = rec
                continue
            st = resolved_p.stat()
            size = st.st_size
            mtime_ns = getattr(st, "st_mtime_ns", int(st.st_mtime * 1_000_000_000))
            cache_key = (str(resolved_p), mtime_ns, size)
            with _PSI_CACHE_LOCK:
                cached = _PSI_CACHE.get(cache_key)
            if cached is not None:
                out[raw] = {**cached, "path": raw}
                continue
            rec["exists"] = True
            rec["bytes"] = size
            if ext not in (".py", ".json"):
                rec["status"] = "exists"
            elif size > max_bytes:
                rec["status"] = "skipped_large"
            else:
                src = resolved_p.read_text(encoding="utf-8", errors="replace")
                if ext == ".py":
                    ast.parse(src, filename=resolved_p.name)
                else:
                    json.loads(src)
                rec["status"] = "ok"
            with _PSI_CACHE_LOCK:
                if len(_PSI_CACHE) >= _PSI_CACHE_MAX:
                    _PSI_CACHE.pop(next(iter(_PSI_CACHE)), None)
                _PSI_CACHE[cache_key] = dict(rec)
        except SyntaxError as exc:
            rec["status"] = "syntax_error"
            rec["line"] = exc.lineno
            rec["detail"] = _clip(exc.msg, 140)
        except json.JSONDecodeError as exc:
            rec["status"] = "syntax_error"
            rec["line"] = exc.lineno
            rec["detail"] = _clip(exc.msg, 140)
        except Exception as exc:  # permission, decoding, races
            rec["status"] = "unreadable"
            rec["detail"] = _clip(type(exc).__name__, 60)
        out[raw] = rec
    return out


# ------------------------------------------- Loop 1 · Δτ behavioural probes

_STEER_FILE_RE = re.compile(
    r"(?<![a-zA-Z0-9_.\-/\\])([a-zA-Z0-9_.\-/\\]{1,180}\.(?:py|pyi|js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|md|rs|go|sh|ps1|css|html|sql))\b"
)
_STEER_VERIFY_CUE_RE = re.compile(
    r"\b(?:pytest|unittest|vitest|jest|ruff|flake8|mypy|pyright|eslint|tsc|test|tests|verify|validate|check|lint|teste|testes|verifique|valide)\b",
    re.IGNORECASE,
)
_STEER_WRITE_CUE_RE = re.compile(
    r"\b(?:patch|write_file|edit|refactor|fix|remove|replace|update|implement|create|corrija|refatore|remova|substitua|edite|implemente|crie|adicione)\b",
    re.IGNORECASE,
)
_STEER_SUBAGENT_CUE_RE = re.compile(
    r"\b(?:delegate_task|delegate|subagent|subagents|subagente|subagentes|spawn|delegue|delegar)\b",
    re.IGNORECASE,
)
_STEER_STOP_CUE_RE = re.compile(
    r"\b(?:stop|abort|cancel|halt|avoid|do\s+not\s+retry|don't\s+retry|pare|cancele|aborte|evite|n[aã]o\s+tente)\b",
    re.IGNORECASE,
)


def extract_steer_intent(text: str, target_kind: str = "") -> dict[str, Any]:
    """Extract a deterministic intent signature I(u) from a steer directive ($0).

    Used by the Δτ reflector to measure causal Intent-Action alignment S_align in [0, 1]
    and prevent base-rate false positives when a steer is ignored during passive reads.
    """
    raw = str(text or "")
    files: list[str] = []
    for m in _STEER_FILE_RE.finditer(raw):
        leaf = Path(m.group(1).replace("\\", "/")).name.lower()
        if leaf and leaf not in files:
            files.append(leaf)
    kws = sorted(_semantic_tokens(raw))[:16]
    return {
        "files": files[:6],
        "wants_verify": bool(_STEER_VERIFY_CUE_RE.search(raw) or VERIFY_CMD_RE.search(raw) or target_kind == "unverified_edit"),
        "wants_write": bool(_STEER_WRITE_CUE_RE.search(raw) or target_kind == "research_stall"),
        "wants_subagent": bool(_STEER_SUBAGENT_CUE_RE.search(raw) or target_kind in ("subagent", "subagent_silent_failure")),
        "wants_stop": bool(_STEER_STOP_CUE_RE.search(raw) or target_kind in ("error_streak", "command_loop")),
        "keywords": kws,
    }


def open_probe(
    session_id: str,
    *,
    text: str,
    source: str,
    live: dict[str, Any],
    anomaly_kinds: Iterable[str] = (),
    target_kind: str = "",
    preset_id: str = "",
    entry_id: str = "",
    domain: str = "",
    now: Optional[float] = None,
    anchor_msg_id: int = 0,
    probe_id: str = "",
) -> dict[str, Any]:
    """Snapshot e⁰ right before a steer lands."""
    ts = now if now is not None else time.time()
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "", str(probe_id or ""))[:36] or f"probe_{uuid.uuid4().hex[:8]}"
    clipped_text = _clip(redact(text), 600)
    return {
        "id": clean_id,
        "session_id": session_id,
        "source": source,  # anomaly | card | preset | alert | manual | subagent
        "text": clipped_text,
        "target_kind": target_kind,
        "preset_id": preset_id,
        "entry_id": entry_id,
        "domain": domain,
        "opened_at": ts,
        "anchor_msg_id": int(anchor_msg_id or 0),
        "e0": {
            "consecutive_errors": int(live.get("consecutive_errors") or 0),
            "turn_errors": int(live.get("turn_errors") or 0),
            "turn_tools": int(live.get("turn_tools") or 0),
            "anomaly_kinds": sorted(set(anomaly_kinds)),
            "intent": extract_steer_intent(clipped_text, target_kind),
        },
        "post": [],
        "status": "open",
        "verdict": "",
        "reason": "",
    }


def tick_probe(
    probe: dict[str, Any],
    *,
    tool: str,
    is_error: bool,
    command: str = "",
    verified_flag: bool = False,
    target_file: str = "",
    args_preview: str = "",
) -> bool:
    """Feed one post-steer tool outcome; returns True when the window is full."""
    if probe.get("status") != "open":
        return False
    cmd_str = str(command or "")
    prev_str = str(args_preview or "")
    tfile_leaf = Path(str(target_file).replace("\\", "/")).name if target_file else ""
    step_rec: dict[str, Any] = {
        "tool": str(tool or "tool"),
        "error": bool(is_error),
        "verify": bool(verified_flag or (cmd_str and VERIFY_CMD_RE.search(cmd_str))),
    }
    if tfile_leaf:
        step_rec["target"] = _clip(redact(tfile_leaf), 80)
    if cmd_str or prev_str:
        step_rec["cmd_preview"] = _clip(redact(cmd_str or prev_str), 140)
    probe.setdefault("post", []).append(step_rec)
    return len(probe["post"]) >= PROBE_WINDOW


def compute_probe_contrast(
    probe: dict[str, Any],
    *,
    current_kinds: Optional[Iterable[str]] = None,
    confounded: bool = False,
) -> dict[str, Any]:
    """Compute the 4-axis mathematical contrast Δτ in [-1, +1] and reflector verdict.

    Decomposes the intervention effect between pre-steer state e⁰ and post-steer
    trajectory e′ across four normalized components:
      1. ΔS_err  ∈ [-1, +1]: Error rate & consecutive failure streak reduction.
      2. ΔS_anom ∈ [-1, +1]: Target anomaly clearance vs. new anomaly regression.
      3. S_align ∈ [ 0, +1]: Causal Intent-Action alignment (files, tools, keywords).
      4. S_prog  ∈ [-1, +1]: Epistemic verification (ψ_verify), edits, delegation vs. thrashing.
    """
    post = probe.get("post") or []
    e0 = probe.get("e0") or {}
    n_post = len(post)
    errs = sum(1 for x in post if x.get("error"))
    trailing_post_errors = 0
    for x in reversed(post):
        if x.get("error"):
            trailing_post_errors += 1
        else:
            break
    verified_ok = any(x.get("verify") and not x.get("error") for x in post)
    wrote_ok = any(x.get("tool") in WRITE_TOOLS and not x.get("error") for x in post)
    reread_ok = any(x.get("tool") == "read_file" and not x.get("error") for x in post)
    delegated_ok = any(x.get("tool") in ("delegate_task", "subagent_spawn") and not x.get("error") for x in post)
    pre_streak = int(e0.get("consecutive_errors") or 0)
    target = str(probe.get("target_kind") or "")
    pre_kinds = {str(k) for k in (e0.get("anomaly_kinds") or []) if k}
    kinds_now = {str(k) for k in current_kinds if k} if current_kinds is not None else None

    non_sticky_pre = pre_kinds - _STICKY_ANOMALIES
    non_sticky_now = (kinds_now - _STICKY_ANOMALIES) if kinds_now is not None else set()
    induced_kinds = (non_sticky_now - non_sticky_pre) if kinds_now is not None else set()
    cleared_kinds = (non_sticky_pre - non_sticky_now) if kinds_now is not None else set()

    intent = e0.get("intent") if isinstance(e0.get("intent"), dict) else extract_steer_intent(str(probe.get("text") or ""), target)
    post_haystack = " ".join(
        f"{x.get('tool', '')} {x.get('target', '')} {x.get('cmd_preview', '')}" for x in post
    ).lower()
    post_tokens = _semantic_tokens(post_haystack)
    intent_files = [str(f).lower() for f in (intent.get("files") or []) if f]
    file_hit = any(f in post_haystack for f in intent_files) if intent_files else False
    has_post_target_ctx = any(bool(x.get("target") or x.get("cmd_preview")) for x in post)
    kw_set = {str(k).lower() for k in (intent.get("keywords") or []) if k}
    kw_overlap = (len(kw_set & post_tokens) / float(max(1, min(len(kw_set), 6)))) if kw_set else 0.0
    unanchored_write_mismatch = (
        not intent_files
        and has_post_target_ctx
        and len(kw_set) >= 2
        and kw_overlap <= 0.0
        and target != "research_stall"
    )
    action_hit = (
        (not intent_files or file_hit)
        and (
            (bool(intent.get("wants_verify")) and verified_ok)
            or (bool(intent.get("wants_write")) and wrote_ok and not unanchored_write_mismatch)
            or (bool(intent.get("wants_subagent")) and delegated_ok)
        )
    )
    s_align = min(1.0, (0.55 if file_hit else 0.0) + (0.50 if action_hit else 0.0) + 0.45 * kw_overlap) if n_post else 0.0

    # Detect identical read-only thrashing (same tool + same target/cmd >= 3 times with no write/verify)
    step_sigs = [(x.get("tool"), x.get("target") or "", x.get("cmd_preview") or "") for x in post]
    is_readonly_thrash = (
        n_post >= 3
        and all(x.get("tool") in READ_ONLY_TOOLS and not x.get("verify") for x in post)
        and len(set(step_sigs)) == 1
        and bool(step_sigs[0][1] or step_sigs[0][2])
    )

    # 1. Error rate & streak contrast ΔS_err
    if n_post == 0:
        ds_err = 0.0
    elif pre_streak > 0 and errs == 0:
        ds_err = min(1.0, 0.70 + 0.10 * pre_streak)
    elif pre_streak > 0 and trailing_post_errors == 0 and errs < pre_streak:
        ds_err = 0.45
    elif pre_streak == 0 and errs == 0:
        ds_err = 0.25
    elif errs >= 2 or (pre_streak == 0 and errs >= 1 and errs == n_post) or (trailing_post_errors > pre_streak and trailing_post_errors >= 2):
        ds_err = -min(1.0, 0.55 + 0.20 * errs)
    else:
        ds_err = -0.25 * (errs / float(n_post))

    # 2. Anomaly clearance vs regression ΔS_anom
    if induced_kinds:
        ds_anom = -0.80
    elif target and target not in _STICKY_ANOMALIES:
        ds_anom = -0.60 if (kinds_now is not None and target in kinds_now) else 1.0
    elif cleared_kinds:
        ds_anom = 0.85
    else:
        ds_anom = 0.15 if not non_sticky_now else -0.20

    # 3. Epistemic & execution progress S_prog
    if n_post == 0:
        s_prog = 0.0
    elif verified_ok:
        s_prog = 1.0
    elif wrote_ok or delegated_ok:
        s_prog = 0.75
    elif is_readonly_thrash:
        s_prog = -0.50
    elif errs == 0:
        s_prog = 0.35
    else:
        s_prog = -0.40

    if pre_streak == 0 and not target and not non_sticky_pre and errs == 0 and not induced_kinds:
        raw_score = 0.42 * s_prog + 0.34 * s_align + 0.14 * ds_err + 0.10 * ds_anom
    else:
        raw_score = 0.32 * ds_err + 0.28 * ds_anom + 0.22 * s_prog + 0.18 * s_align
    score = 0.0 if (confounded or n_post == 0) else max(-1.0, min(1.0, raw_score))

    severe_induced = induced_kinds & {"error_streak", "command_loop", "claimed_without_tool", "test_weakening"}
    zero_err_sabotage = induced_kinds & {"test_weakening", "claimed_without_tool"}
    wrote_aligned = wrote_ok and (not target or s_align > 0.0)
    explicit_unmet_target = (
        (bool(intent_files) and not file_hit)
        or (bool(intent.get("wants_subagent")) and not intent.get("wants_write") and not delegated_ok)
        or (not target and pre_streak == 0 and len(kw_set) >= 3 and s_align <= 0.0)
    )
    has_unmet_explicit_intent = (
        not (wrote_ok or verified_ok or delegated_ok)
        and s_align == 0.0
        and bool(intent_files or intent.get("wants_verify") or intent.get("wants_subagent"))
        and any(x.get("target") or x.get("cmd_preview") for x in post)
    )

    if confounded:
        verdict, reason = "confounded", "Another steer landed inside the observation window — effect cannot be isolated."
    elif not post:
        verdict, reason = "no_observed_effect", "No tool call followed the steer before the probe expired."
    elif (
        errs >= 2
        or (pre_streak == 0 and errs >= 1 and n_post <= 2 and errs == n_post)
        or (trailing_post_errors > pre_streak and trailing_post_errors >= 2)
        or (bool(severe_induced) and errs >= 1)
        or bool(zero_err_sabotage)
    ):
        verdict = "hurt"
        if errs >= 1:
            reason = f"{errs}/{n_post} post-steer tool calls failed."
            if severe_induced:
                reason = f"{errs}/{n_post} post-steer tool calls failed; induced {', '.join(sorted(severe_induced))}."
        else:
            reason = f"Post-steer trajectory induced {', '.join(sorted(severe_induced))}."
        if score > -0.15:
            score = -0.25
    elif target and target not in _STICKY_ANOMALIES and kinds_now is not None and target in kinds_now:
        verdict, reason = "no_observed_effect", f"`{target}` is still open after the steer."
    elif target == "unverified_edit" and not (verified_ok or reread_ok):
        verdict, reason = "no_observed_effect", "No verification or re-read ran after the steer."
    elif target == "research_stall" and not (wrote_ok or verified_ok or delegated_ok):
        verdict, reason = "no_observed_effect", "Read-only streak continued without producing output."
    elif is_readonly_thrash and pre_streak == 0 and not (wrote_ok or verified_ok or delegated_ok):
        verdict, reason = "no_observed_effect", "Repeated identical read-only call without state change."
    elif has_unmet_explicit_intent:
        verdict, reason = "no_observed_effect", "Agent continued passive reads without acting on the steer target."
    elif (
        pre_streak >= 2
        and errs == 0
        and (wrote_ok or verified_ok)
        and (
            explicit_unmet_target
            or (s_align < 0.25 and bool(intent_files and not file_hit))
            or (bool(target) and wrote_ok and not verified_ok and s_align <= 0.0)
        )
    ):
        verdict = "self_recovered"
        reason = f"error streak {pre_streak} → 0 (autonomous recovery via unrelated path)"
    elif explicit_unmet_target and s_align < 0.35:
        verdict, reason = "no_observed_effect", "Post-steer actions had zero alignment with the explicit steer target."
    elif not severe_induced and (
        (
            errs == 0
            and (
                (pre_streak >= 1 and not explicit_unmet_target and (verified_ok or wrote_aligned or delegated_ok or s_align >= 0.35))
                or (not explicit_unmet_target and (verified_ok or wrote_aligned or delegated_ok))
                or (target and target not in _STICKY_ANOMALIES and not explicit_unmet_target and (verified_ok or wrote_aligned or delegated_ok or s_align >= 0.35))
                or (not target and n_post >= 2 and s_align >= 0.35)
                or s_align >= 0.45
            )
        )
        or (
            errs == 1
            and n_post >= 2
            and trailing_post_errors == 0
            and not explicit_unmet_target
            and (verified_ok or (pre_streak >= 2 and wrote_aligned))
        )
    ):
        bits = []
        if pre_streak:
            bits.append(f"error streak {pre_streak} → 0" if errs == 0 else f"error streak {pre_streak} → 0 (converged)")
        if target and (kinds_now is None or target not in kinds_now):
            bits.append(f"`{target}` cleared")
        if verified_ok:
            bits.append("verification command passed")
        elif wrote_ok:
            bits.append("clean write/edit step completed")
        elif delegated_ok:
            bits.append("subagent delegation dispatched")
        if s_align >= 0.50:
            bits.append(f"intent alignment {int(round(s_align * 100))}%")
        verdict = "helped"
        reason = "; ".join(bits) or f"{n_post}/{n_post} post-steer tool calls succeeded cleanly."
        if score < 0.15 and not induced_kinds:
            score = 0.15
    else:
        verdict, reason = "no_observed_effect", f"{errs}/{n_post} errors; no measurable change."

    if verdict == "helped":
        confidence = "high" if (verified_ok or (pre_streak >= 2 and errs == 0) or score >= 0.65) else "medium"
    elif verdict == "hurt":
        confidence = "high" if (errs >= 2 or bool(severe_induced)) else "medium"
    else:
        confidence = "low"

    return {
        "verdict": verdict,
        "reason": reason,
        "delta": {
            "pre_streak": pre_streak,
            "post_errors": errs,
            "trailing_post_errors": trailing_post_errors,
            "post_calls": n_post,
            "verified": verified_ok,
            "wrote": wrote_ok,
            "delegated": delegated_ok,
            "score": round(score, 3),
            "alignment": round(s_align, 3),
            "error_delta": round(ds_err, 3),
            "anomaly_delta": round(ds_anom, 3),
            "progress": round(s_prog, 3),
            "induced_anomalies": sorted(induced_kinds),
            "confidence": confidence,
        },
    }


def finalize_probe(
    probe: dict[str, Any],
    *,
    current_kinds: Optional[Iterable[str]] = None,
    confounded: bool = False,
    now: Optional[float] = None,
) -> dict[str, Any]:
    """Assign the Harness² reflector verdict from the observed contrast."""
    res = compute_probe_contrast(probe, current_kinds=current_kinds, confounded=confounded)
    probe["status"] = "closed"
    probe["verdict"] = res["verdict"]
    probe["reason"] = res["reason"]
    probe["closed_at"] = now if now is not None else time.time()
    probe["delta"] = res["delta"]
    return probe


# --------------------------------------- Loop 2 · experience library (R_t)

def domain_of(cwd: str, git_branch: str = "") -> str:
    name = Path(str(cwd or "").replace("\\", "/").rstrip("/")).name if cwd else ""
    return (name or "global").lower()[:64]


_CUE_BY_KIND = {
    "claimed_without_tool": "When the agent reports work as done in a turn that made no tool call",
    "error_streak": "When the same tool fails two or more times in a row",
    "command_loop": "When a failing terminal command is re-run unchanged",
    "unverified_edit": "When code was edited and the turn is about to end without a test, lint or re-read",
    "subagent_silent_failure": "When a delegated subagent ends in error or with no output",
    "research_stall": "When many read-only steps pile up while the deliverable is still unwritten",
    "cache_bust_warning": "When a long session shows low prompt-cache reuse",
    "edit_churn": "When one file keeps receiving small incremental patches",
    "test_weakening": "When failing tests tempt assertion removal or skip markers",
    "silent_model_fallback": "When the serving gateway silently falls back to a different model mid-turn",
}

_MACHINE_ABS_PATH_RE = re.compile(
    r"(?:[A-Za-z]:(?:\\\\|[/\\])[^\s`'\"()<>]+|\\\\\?\\[^\s`'\"()<>]+|"
    r"/(?:Users|home|workspace|mnt|var|etc|opt|tmp|root|private)/[^\s`'\"()<>]+|~/[^\s`'\"()<>]+)"
)
_BARE_MACHINE_ROOT_RE = re.compile(r"(?:\b[A-Za-z]:(?:\\\\|[/\\])|\\\\\?\\|/(?:Users|home|workspace|mnt)/)")
_ONESHOT_TASK_PROMPT_RE = re.compile(
    r"^\s*(?:[-*•]\s+|\d+[.)]\s+)?(?:"
    r"implemente\b|refatore\b|adicione\b|crie\s+(?:a|o|um|uma)\b|remova\b|substitua\b|"
    r"implement\s+(?:the|a|an|100%)\b|refactor\s+(?:the|a|an)\b|create\s+(?:a|the|an)\b|build\s+(?:a|the|an)\b|"
    r"\[(?:spawn_subagent|subagent|regarding\s+subagent)\s*:|"
    r"em\s+`?[A-Za-z0-9_./:\\-]+`?,\s*(?:conecte|aumente|corrija|adicione|remova)"
    r")",
    re.IGNORECASE,
)
_MID_WORD_TRUNC_RE = re.compile(r"[A-Za-zÀ-ÿ0-9_\\/:-]…[`'\")]*$")
_WORKSPACE_ARTIFACT_RE = re.compile(
    r"(?:(?<![a-zA-Z0-9_.-])[a-zA-Z0-9_./\\-]{1,120}\."
    r"(?:py|pyi|js|mjs|cjs|ts|tsx|jsx|json|yaml|yml|toml|md|rs|go|sh|ps1|css|html|sql)\b"
    r"|`[a-zA-Z0-9_.-]+/[a-zA-Z0-9_./-]+`)",
    re.IGNORECASE,
)
_GENERIC_PLAYBOOK_FILES = frozenset({"btw.md", "memory.md", "skill.md"})
_GENERIC_DOMAINS = frozenset({"global", "default", "coding"})
_EXC_CLASS_RE = re.compile(
    r"\b([A-Z][A-Za-z0-9_]*(?:Error|Exception|Fault|Failure)|ERR_[A-Z0-9_]+|ENOENT|EACCES|EPERM|ECONNREFUSED|ETIMEDOUT)\b"
)


def clip_clean_boundary(text: Any, limit: int = TOKEN_CHAR_CAP) -> str:
    """Clip text on a clean sentence or whitespace boundary — never mid-word or mid-path."""
    s = re.sub(r"\s+", " ", str(text or "")).strip()
    if len(s) <= limit:
        return s
    window = s[: max(16, limit - 1)].rstrip()
    for sep in (". ", "; ", " — ", " "):
        idx = window.rfind(sep)
        if idx >= int(limit * 0.55):
            trimmed = window[:idx].rstrip(" ,;:-`*\\/")
            return (trimmed + ".") if sep == ". " else (trimmed + " …")
    return window.rstrip(" ,;:-`*\\/") + " …"


def normalize_machine_paths(text: str) -> str:
    """Replace personal/machine-specific absolute paths with clean portable basenames."""
    def _rep(m: re.Match[str]) -> str:
        raw = m.group(0)
        trail = ""
        while raw and raw[-1] in ".,;:)'\"`":
            trail = raw[-1] + trail
            raw = raw[:-1]
        norm = raw.replace("\\\\", "/").replace("\\", "/").rstrip("/")
        if "…" in norm:
            return ""
        leaf = norm.rsplit("/", 1)[-1]
        return f"{leaf}{trail}" if ("." in leaf and 2 <= len(leaf) <= 64) else trail

    return re.sub(r"\s+", " ", _MACHINE_ABS_PATH_RE.sub(_rep, str(text or ""))).strip()


def extract_clean_error_headline(raw_error: Any, max_len: int = 96) -> str:
    """Extract a 1-line human-readable error headline from JSON tool outputs or tracebacks ($0, path-scrubbed)."""
    s = str(raw_error or "").strip()
    if not s:
        return ""
    exit_prefix = ""
    m_exit = re.match(r"^(exit\s+-?\d+)\s*:\s*([\s\S]+)$", s, re.IGNORECASE)
    if m_exit:
        exit_prefix = m_exit.group(1).lower()
        s = m_exit.group(2).strip()
    if s.startswith("{"):
        try:
            parsed = json.loads(s)
            if isinstance(parsed, dict):
                s = str(parsed.get("error") or parsed.get("output") or parsed.get("message") or parsed.get("detail") or s)
        except Exception:
            m_out = re.search(r'"(?:error|output|message|detail)"\s*:\s*"((?:[^"\\]|\\.)*)"', s)
            if m_out:
                s = m_out.group(1).replace("\\r\\n", "\n").replace("\\n", "\n").replace('\\"', '"')
    s = s.replace("\\r\\n", "\n").replace("\\n", "\n")
    lines = [ln.strip() for ln in s.splitlines() if ln.strip()]
    best_line = ""
    for ln in reversed(lines):
        if ln.startswith(("Traceback (most recent call last)", 'File "', "at ")) or set(ln) <= {"^", "~", " "}:
            continue
        if _EXC_CLASS_RE.search(ln):
            best_line = ln
            break
        if not best_line:
            best_line = ln
    headline = normalize_machine_paths(redact(best_line or (lines[-1] if lines else s)))
    headline = re.sub(r"\b0x[0-9a-fA-F]{6,}\b", "0x…", headline)
    headline = re.sub(r"\bline\s+\d+\b", "line N", headline, flags=re.IGNORECASE)
    headline = re.sub(r"\s+", " ", headline).strip(" `\"'")
    if exit_prefix and exit_prefix not in headline.lower():
        headline = f"{exit_prefix}: {headline}" if headline else exit_prefix
    return clip_clean_boundary(headline, max_len)


def canonicalize_failure_signature(tool: str, raw_error: Any = "") -> str:
    """Distill noisy stacktraces, JSON tool outputs, and local paths into a canonical `<tool>:<ErrorClass>` signature."""
    clean_tool = re.sub(r"[^a-zA-Z0-9_-]", "", str(tool or "tool").strip().lower())[:32] or "tool"
    headline = extract_clean_error_headline(raw_error, max_len=200)
    if not headline:
        return f"{clean_tool}:error"
    m_exc = _EXC_CLASS_RE.search(headline)
    if m_exc:
        return f"{clean_tool}:{m_exc.group(1)}"
    low = headline.lower()
    if "no module named" in low:
        return f"{clean_tool}:ModuleNotFoundError"
    if "not found" in low or "no such file" in low:
        return f"{clean_tool}:FileNotFoundError"
    if "timed out" in low or "timeout" in low:
        return f"{clean_tool}:TimeoutError"
    if "syntax" in low:
        return f"{clean_tool}:SyntaxError"
    if "permission" in low or "denied" in low:
        return f"{clean_tool}:PermissionError"
    m_ec = re.search(r"\bexit\s+(-?\d+)\b", low)
    if m_ec:
        return f"{clean_tool}:exit_{m_ec.group(1)}"
    return f"{clean_tool}:failure"


def is_oneshot_task_prompt(text: str) -> bool:
    """Return True when ``text`` is a one-off feature/task specification rather than a reusable workflow rule."""
    s = str(text or "").strip()
    if not s:
        return False
    if _ONESHOT_TASK_PROMPT_RE.search(s):
        return True
    if s.count("* **") >= 2 or s.count("- **") >= 2:
        return True
    if len(s) > 300 and len(_WORKSPACE_ARTIFACT_RE.findall(s)) >= 3:
        return True
    return False


def calibrate_experience_scope(
    cue: str,
    lesson: str,
    *,
    requested_scope: str = "INV",
    domain: str = "global",
    kinds: Iterable[str] = (),
) -> str:
    """Enforce strict epistemic boundary: repo/file-coupled rules calibrate to DOM; universal procedures stay INV."""
    kinds_set = {str(k) for k in (kinds or []) if k}
    if kinds_set & {"edit_churn", "cache_bust_warning", "silent_model_fallback"}:
        return "DOM"
    combined = f"{cue} {lesson}"
    for m in _WORKSPACE_ARTIFACT_RE.finditer(combined):
        tok = m.group(0).strip("`").replace("\\", "/").rsplit("/", 1)[-1].lower()
        if tok and tok not in _GENERIC_PLAYBOOK_FILES:
            return "DOM"
    dom_low = str(domain or "global").strip().lower()
    if dom_low not in _GENERIC_DOMAINS and len(dom_low) >= 3:
        comb_low = combined.lower()
        if re.search(rf"\b{re.escape(dom_low)}\b", comb_low) or re.search(rf"\b{re.escape(dom_low.replace('_', '-'))}\b", comb_low):
            return "DOM"
    return "DOM" if requested_scope == "DOM" else "INV"


def sanitize_experience_record(exp: dict[str, Any]) -> Optional[dict[str, Any]]:
    """Purify an experience record: strip machine paths, reject one-shot prompts/passive noise, and calibrate INV/DOM."""
    if not isinstance(exp, dict):
        return None
    raw_les = redact(str(exp.get("lesson") or "").strip())
    raw_cue = redact(str(exp.get("cue") or "").strip())
    if not raw_les:
        return None
    raw_les = _distill_delegation_lesson(raw_les)
    if is_oneshot_task_prompt(raw_les) or is_oneshot_task_prompt(raw_cue):
        return None
    m_ar = re.match(r"^After `([^`]+)` failed (\d+)×\s*\(([\s\S]*?)\),\s*self-recovered via\s+(.+)$", raw_les)
    if m_ar:
        ftool, cnt, err_raw, via = m_ar.group(1), m_ar.group(2), m_ar.group(3), m_ar.group(4)
        tools_via = [m.group(1) for seg in via.split("→") if (m := re.search(r"`([a-zA-Z0-9_]+)`", seg))]
        if not tools_via or all(t in READ_ONLY_TOOLS for t in tools_via):
            return None
        sig = canonicalize_failure_signature(ftool, err_raw)
        chain = " → ".join(f"`{t}`" for t in dict.fromkeys(tools_via))
        raw_les = (
            f"When `{ftool}` fails {cnt}+ times (`{sig}`), self-recovered via {chain} "
            "after diagnosing root cause instead of repeating identical retries."
        )
    m_stop = re.match(r"^Stop retrying `([^`]+)` with the same arguments\.\s*Diagnose the root cause of `([\s\S]*?)`\s*first", raw_les)
    if m_stop:
        ftool_s = m_stop.group(1)
        sig_s = canonicalize_failure_signature(ftool_s, m_stop.group(2))
        raw_les = f"Stop retrying `{ftool_s}` with identical arguments (`{sig_s}`); inspect the error output or target file first."

    clean_les = normalize_machine_paths(raw_les)
    clean_cue = normalize_machine_paths(raw_cue)
    if not clean_les or _BARE_MACHINE_ROOT_RE.search(clean_les) or _BARE_MACHINE_ROOT_RE.search(clean_cue):
        return None
    if _MID_WORD_TRUNC_RE.search(clean_les) or _MID_WORD_TRUNC_RE.search(clean_cue):
        return None
    dom = str(exp.get("domain") or "global").lower()[:64]
    kinds = [str(k) for k in (exp.get("kinds") or []) if k][:4]
    scope = calibrate_experience_scope(
        clean_cue,
        clean_les,
        requested_scope=str(exp.get("scope") or "INV"),
        domain=dom,
        kinds=kinds,
    )
    out = dict(exp)
    out["cue"] = clip_clean_boundary(clean_cue or "When this workflow pattern recurs", 220)
    out["lesson"] = clip_clean_boundary(clean_les, 420)
    out["evidence"] = clip_clean_boundary(normalize_machine_paths(redact(str(exp.get("evidence") or ""))), 280)
    out["scope"] = scope
    out["kinds"] = kinds
    out["domain"] = dom
    return out


def sanitize_experience_library(experiences: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deterministically purify a list of experience records ($0, idempotent)."""
    out: list[dict[str, Any]] = []
    for item in experiences or []:
        san = sanitize_experience_record(item)
        if san is not None:
            out.append(san)
    return out


def _infer_specific_cue(raw_cue: str, lesson: str, kind: str = "", preset_id: str = "", domain: str = "") -> str:
    """Upgrade vague generic triggers ('When this situation reappears') into concrete, actionable cues."""
    c = str(raw_cue or "").strip()
    generic_cues = {
        "",
        "when this situation reappears",
        "when pattern recurs",
        "when this pattern recurs",
        "when this pattern reappears",
        "when this workspace pattern appears",
        "general",
    }
    if c.lower() not in generic_cues:
        return c
    if kind and kind in _CUE_BY_KIND:
        return _CUE_BY_KIND[kind]
    if preset_id:
        return f"When running the '{preset_id}' workflow check"
    les_low = str(lesson or "").lower()
    if "delegate_task" in les_low or "subagent" in les_low or "subagente" in les_low:
        return "When decomposing independent or heavy subtasks via delegate_task"
    if "node --input-type=module --check" in les_low or "pytest" in les_low:
        return "When verifying code edits and syntax before completion"
    if "read_file" in les_low or "exploratory read" in les_low:
        return "When multiple read-only steps accumulate without an edit"
    code_tokens = re.findall(r"`([^`]{2,40})`", str(lesson or ""))
    if code_tokens:
        return f"When working with `{code_tokens[0]}` in `{domain or 'global'}`"
    return c or "When this workflow pattern recurs"


def _distill_delegation_lesson(lesson: str) -> str:
    """Condense one-off verbose subagent spawn prompts into a reusable architectural rule."""
    txt = str(lesson or "").strip()
    low = txt.lower().replace("`", "")
    if low.startswith("please spawn an isolated subagent via delegate_task") and len(txt) > 120:
        return (
            "Spawn an isolated subagent via `delegate_task` with self-contained `context`, "
            "explicit file paths, and verification criteria when parallelizing or breaking stalls."
        )
    return txt


def experience_from_probe(probe: dict[str, Any]) -> Optional[dict[str, Any]]:
    """Reflector: evidence-backed lesson or ``None`` (NO_ENTRY)."""
    verdict = str(probe.get("verdict") or "")
    if verdict not in ("helped", "self_recovered"):
        return None  # hurt/no-effect inform yields; confounded never becomes a rule
    if verdict == "self_recovered" and str(probe.get("source") or "") != "auto_recovery":
        return None  # Never promote an ignored manual steer text when recovery was autonomous
    kind = str(probe.get("target_kind") or "")
    meta = lever_for(kind) if kind else {"scope": "INV", "lever": "C8", "lever_name": "Hook / Preset"}
    raw_lesson = str(probe.get("text") or "")
    dom = str(probe.get("domain") or "global")
    cue = _infer_specific_cue(
        _CUE_BY_KIND.get(kind) or "",
        raw_lesson,
        kind=kind,
        preset_id=str(probe.get("preset_id") or ""),
        domain=dom,
    )
    lesson_clean = _distill_delegation_lesson(raw_lesson)
    delta = probe.get("delta") if isinstance(probe.get("delta"), dict) else {}
    conf = str(delta.get("confidence") or "medium")
    if conf not in ("low", "medium", "high"):
        conf = "medium"
    score_val = delta.get("score")
    score_tag = f" (Δτ={float(score_val):+.2f})" if isinstance(score_val, (int, float)) else ""
    prefix = f"Self-recovery Δτ{score_tag}" if verdict == "self_recovered" else f"Δτ contrast{score_tag}"
    cand = new_experience(
        cue=cue,
        lesson=lesson_clean,
        evidence=f"{prefix}: {probe.get('reason')}",
        scope=meta["scope"],
        lever=meta["lever"],
        domain=dom,
        verdict=verdict if verdict in ("helped", "self_recovered") else "helped",
        confidence=conf,
        source=f"probe:{probe.get('source')}",
        kinds=[kind] if kind else [],
        probe_id=str(probe.get("id") or ""),
    )
    return sanitize_experience_record(cand)


def new_experience(
    *,
    cue: str,
    lesson: str,
    evidence: str = "",
    scope: str = "INV",
    lever: str = "C6",
    domain: str = "global",
    verdict: str = "helped",
    confidence: str = "medium",
    source: str = "manual",
    kinds: Optional[list[str]] = None,
    probe_id: str = "",
    exp_id: str = "",
) -> dict[str, Any]:
    req_scope = scope if scope in ("INV", "DOM") else "INV"
    lever = lever if lever in LEVERS else "C6"
    verdict = verdict if verdict in VERDICTS else "helped"
    confidence = confidence if confidence in ("low", "medium", "high") else "medium"
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "", str(exp_id or ""))[:36] or f"exp_{uuid.uuid4().hex[:8]}"
    dom_clean = (domain or "global").lower()[:64]
    kinds_clean = [k for k in (kinds or []) if k][:4]
    clean_cue = normalize_machine_paths(redact(cue))
    clean_les = normalize_machine_paths(redact(_distill_delegation_lesson(lesson)))
    clean_ev = normalize_machine_paths(redact(evidence))
    eff_scope = calibrate_experience_scope(
        clean_cue,
        clean_les,
        requested_scope=req_scope,
        domain=dom_clean,
        kinds=kinds_clean,
    )
    return {
        "id": clean_id,
        "created_at": time.time(),
        "domain": dom_clean,
        "scope": eff_scope,
        "lever": lever,
        "cue": clip_clean_boundary(clean_cue, 240),
        "lesson": clip_clean_boundary(clean_les, 600),
        "evidence": clip_clean_boundary(clean_ev, 300),
        "verdict": verdict,
        "confidence": confidence,
        "source": source,
        "kinds": kinds_clean,
        "probe_id": probe_id,
        "uses": 0,
    }


def match_experiences(
    library: list[dict[str, Any]], *, domain: str, kinds: Iterable[str], limit: int = 3
) -> list[dict[str, Any]]:
    """Rank lessons for the current shape: same anomaly kind ≫ same domain ≫ global."""
    kinds_set = {str(k) for k in (kinds or []) if k}
    dom = (domain or "global").lower()
    profile_aliases = {"default", "coding", "global"}
    scored: list[tuple[float, dict[str, Any]]] = []
    for e in library or []:
        if not isinstance(e, dict) or e.get("verdict") not in ("helped", "self_recovered"):
            continue
        exp_kinds = {str(k) for k in (e.get("kinds") or []) if k}
        src_str = str(e.get("source") or "")
        if not exp_kinds and src_str.startswith("probe:"):
            continue  # Unclassified probe lessons must never match as wildcards on every session anomaly
        # When the lesson is tied to specific anomaly kinds and the session has no matching anomaly, skip it
        # so a 100% CALM session isn't polluted by error-recovery lessons.
        if exp_kinds and not (kinds_set & exp_kinds):
            continue
        if not kinds_set and not src_str.startswith(("manual", "card")):
            continue
        s = 0.0
        exp_dom = str(e.get("domain") or "global").lower()
        if kinds_set & exp_kinds:
            s += 3.0
        if exp_dom == dom:
            s += 1.5
        elif exp_dom in profile_aliases:
            s += 1.2 if str(e.get("source") or "").startswith(("manual", "card")) else 0.4
        s += {"high": 0.6, "medium": 0.3}.get(str(e.get("confidence")), 0.0)
        s += min(0.6, 0.1 * int(e.get("uses") or 0))
        if s >= 1.5:
            scored.append((s, e))
    scored.sort(key=lambda x: (-x[0], -float(x[1].get("created_at") or 0)))
    return [dict(e, match_score=round(s, 2)) for s, e in scored[: max(0, limit)]]


# --------------------- Playbook Refiner, Deduplication & Walkthrough Synthesis

DEFAULT_BTW_MD_MAX_CHARS = 4_000

_PLAYBOOK_STOPWORDS = frozenset(
    {
        "the", "and", "for", "with", "when", "that", "this", "from", "into", "after", "before",
        "have", "has", "had", "was", "were", "are", "not", "but", "can", "will", "should", "must",
        "para", "com", "quando", "como", "uma", "dos", "das", "nos", "nas", "por", "sem", "mais",
        "antes", "depois", "sobre", "entre", "isso", "este", "esta", "pelo", "pela",
    }
)


def _semantic_tokens(text: str) -> set[str]:
    words = re.findall(r"[a-zA-ZÀ-ÿ0-9_.-]{3,}", str(text or "").lower())
    return {
        w.strip("._-")
        for w in words
        if len(w.strip("._-")) >= 3 and w.strip("._-") not in _PLAYBOOK_STOPWORDS
    }


def _jaccard_sim(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return len(a & b) / float(len(a | b))


def _experience_tool_class(exp: dict[str, Any]) -> str:
    """Extract canonical tool class (`terminal`, `patch`, `delegate_task`, etc.) for `(scope, canonical_cue, tool_class)` dedup."""
    les = str(exp.get("lesson") or "")
    m_first = re.match(r"^(?:When|After|Stop retrying)\s+`([a-zA-Z0-9_]+)`", les, re.IGNORECASE)
    if m_first:
        return m_first.group(1).lower()
    for span in re.findall(r"`([a-zA-Z0-9_:-]+)`", les):
        head = span.split(":", 1)[0].lower()
        if head in {"terminal", "execute_code", "patch", "write_file", "read_file", "search_files", "delegate_task", "browser_exec", "web_search", "web_extract"}:
            return head
    return ""


def _canonical_cue_key(exp: dict[str, Any]) -> str:
    kinds = exp.get("kinds") or []
    inferred = _infer_specific_cue(
        str(exp.get("cue") or ""),
        str(exp.get("lesson") or ""),
        kind=str(kinds[0] if kinds else ""),
        domain=str(exp.get("domain") or "global"),
    )
    return re.sub(r"\s+", " ", inferred.strip().lower())


def _experiences_are_duplicates(a: dict[str, Any], b: dict[str, Any]) -> bool:
    """Detect structural, `(scope, canonical_cue, tool_class)`, or semantic equivalence between two experience records."""
    import difflib

    scope_a = str(a.get("scope") or "INV").upper()
    scope_b = str(b.get("scope") or "INV").upper()
    dom_a = str(a.get("domain") or "global").lower().strip()
    dom_b = str(b.get("domain") or "global").lower().strip()
    generic_doms = {"global", "default", "coding"}
    if scope_a == "DOM" and scope_b == "DOM" and dom_a != dom_b and not ({dom_a, dom_b} <= generic_doms):
        return False
    if scope_a != scope_b and dom_a != dom_b and not ({dom_a, dom_b} <= generic_doms):
        return False

    cue_a = _canonical_cue_key(a)
    cue_b = _canonical_cue_key(b)
    les_a = re.sub(r"\s+", " ", str(a.get("lesson") or "").strip().lower())
    les_b = re.sub(r"\s+", " ", str(b.get("lesson") or "").strip().lower())
    if not les_a or not les_b:
        return False
    if cue_a == cue_b and les_a == les_b:
        return True

    # Canonical (scope, canonical_cue, tool_class) clustering for repeated tool-failure / auto_recovery episodes
    tclass_a = _experience_tool_class(a)
    tclass_b = _experience_tool_class(b)
    if scope_a == scope_b and cue_a == cue_b and tclass_a and tclass_a == tclass_b:
        if scope_a == "INV" or dom_a == dom_b or ({dom_a, dom_b} <= generic_doms):
            return True

    spans_a = {s.split(":", 1)[0].strip() for s in re.findall(r"`([^`]+)`", les_a) if len(s.strip()) >= 3}
    spans_b = {s.split(":", 1)[0].strip() for s in re.findall(r"`([^`]+)`", les_b) if len(s.strip()) >= 3}
    if spans_a and spans_b and not (spans_a & spans_b):
        return False
    if (
        les_a.replace("`", "").startswith("please spawn an isolated subagent via delegate_task")
        and les_b.replace("`", "").startswith("please spawn an isolated subagent via delegate_task")
        and dom_a == dom_b
    ):
        return True

    tc_a, tc_b = _semantic_tokens(cue_a), _semantic_tokens(cue_b)
    tl_a, tl_b = _semantic_tokens(les_a), _semantic_tokens(les_b)
    j_cue = _jaccard_sim(tc_a, tc_b)
    j_les = _jaccard_sim(tl_a, tl_b)
    hybrid = 0.40 * j_cue + 0.60 * j_les
    if hybrid >= 0.58:
        return True
    if (cue_a == cue_b or j_cue >= 0.65) and (
        j_les >= 0.42 or difflib.SequenceMatcher(None, les_a, les_b).ratio() >= 0.68
    ):
        return True
    if difflib.SequenceMatcher(None, f"{cue_a} | {les_a}", f"{cue_b} | {les_b}").ratio() >= 0.76:
        return True
    return False


def _merge_experience_cluster(cluster: list[dict[str, Any]]) -> dict[str, Any]:
    """Fuse repeated/equivalent lessons into one high-signal canonical experience."""
    if len(cluster) == 1:
        item = dict(cluster[0])
        item["uses"] = max(0, int(item.get("uses") if item.get("uses") is not None else 1))
        kinds_0 = item.get("kinds") or []
        item["cue"] = _clip(
            redact(
                _infer_specific_cue(
                    str(item.get("cue") or ""),
                    str(item.get("lesson") or ""),
                    kind=str(kinds_0[0] if kinds_0 else ""),
                    domain=str(item.get("domain") or "global"),
                )
            ),
            240,
        )
        item["lesson"] = _clip(redact(_distill_delegation_lesson(str(item.get("lesson") or ""))), 600)
        return item

    conf_rank = {"high": 3, "medium": 2, "low": 1}

    def _richness(e: dict[str, Any]) -> tuple[int, int, int, int, float]:
        les = str(e.get("lesson") or "")
        code_spans = len(re.findall(r"`[^`]+`", les))
        return (
            max(0, int(e.get("uses") if e.get("uses") is not None else 1)),
            conf_rank.get(str(e.get("confidence") or "medium"), 2),
            code_spans,
            len(les),
            float(e.get("created_at") or 0.0),
        )

    ordered = sorted(cluster, key=_richness, reverse=True)
    primary = dict(ordered[0])
    earliest = min(cluster, key=lambda x: float(x.get("created_at") or time.time()))
    primary["id"] = str(earliest.get("id") or primary.get("id") or f"exp_{uuid.uuid4().hex[:8]}")
    primary["created_at"] = max(float(x.get("created_at") or 0.0) for x in cluster)

    # Prefer the most specific cue across the cluster
    best_cue = str(primary.get("cue") or "")
    for cand_e in ordered:
        c_txt = str(cand_e.get("cue") or "").strip()
        if c_txt and c_txt.lower() not in ("when this situation reappears", "when pattern recurs", "general"):
            best_cue = c_txt
            break
    kinds_p = primary.get("kinds") or []
    primary["cue"] = _clip(
        redact(
            _infer_specific_cue(
                best_cue,
                str(primary.get("lesson") or ""),
                kind=str(kinds_p[0] if kinds_p else ""),
                domain=str(primary.get("domain") or "global"),
            )
        ),
        240,
    )

    total_uses = sum(max(0, int(x.get("uses") if x.get("uses") is not None else 1)) for x in cluster)
    primary["uses"] = total_uses
    if total_uses >= 3 or len(cluster) >= 2:
        primary["confidence"] = "high"

    specific_doms = [
        str(x.get("domain"))
        for x in ordered
        if str(x.get("domain") or "global").lower() not in ("global", "default", "coding")
    ]
    if specific_doms:
        primary["domain"] = specific_doms[0].lower()[:64]

    base_lesson = _distill_delegation_lesson(str(primary.get("lesson") or "")).strip().rstrip(".")
    base_tokens = _semantic_tokens(base_lesson)
    extra_clauses: list[str] = []
    for other in ordered[1:]:
        cand = _distill_delegation_lesson(str(other.get("lesson") or "")).strip().rstrip(".")
        if not cand or cand.lower() in base_lesson.lower():
            continue
        cand_tokens = _semantic_tokens(cand)
        novel_tokens = cand_tokens - base_tokens
        if len(novel_tokens) >= 3 and len(base_lesson) + len(cand) + 3 <= 580:
            extra_clauses.append(cand)
            base_tokens |= cand_tokens
    merged_lesson = base_lesson + (". " + "; ".join(extra_clauses) if extra_clauses else "") + "."
    primary["lesson"] = clip_clean_boundary(redact(merged_lesson), 600)

    ev_parts: list[str] = []
    for x in ordered:
        ev = str(x.get("evidence") or "").strip()
        if ev and ev not in ev_parts:
            ev_parts.append(ev)
    ev_summary = "; ".join(ev_parts[:3])
    if len(cluster) > 1 and f"×{len(cluster)}" not in ev_summary:
        ev_summary = f"Merged ×{len(cluster)} ({ev_summary})" if ev_summary else f"Merged ×{len(cluster)} verified episodes"
    primary["evidence"] = clip_clean_boundary(redact(ev_summary), 300)

    all_kinds: list[str] = []
    for x in ordered:
        for k in x.get("kinds") or []:
            ks = str(k).strip()
            if ks and ks not in all_kinds:
                all_kinds.append(ks)
    primary["kinds"] = all_kinds[:4]
    primary["scope"] = calibrate_experience_scope(
        str(primary.get("cue") or ""),
        str(primary.get("lesson") or ""),
        requested_scope=str(primary.get("scope") or "INV"),
        domain=str(primary.get("domain") or "global"),
        kinds=primary["kinds"],
    )
    if primary["scope"] == "INV" and str(primary.get("domain") or "global").lower() not in _GENERIC_DOMAINS and not specific_doms:
        primary["domain"] = "global"
    primary["merged_count"] = len(cluster)
    return primary


def extract_proven_walkthroughs(
    experiences: list[dict[str, Any]],
    probes: Optional[dict[str, dict[str, Any]] | list[dict[str, Any]]] = None,
    *,
    max_items: int = 5,
) -> list[dict[str, Any]]:
    """Synthesize structured Walkthroughs & Proven Workflows from verified Δτ probes and top RSI lessons."""
    probe_list: list[dict[str, Any]] = []
    if isinstance(probes, dict):
        probe_list = [p for p in probes.values() if isinstance(p, dict)]
    elif isinstance(probes, list):
        probe_list = [p for p in probes if isinstance(p, dict)]

    walkthroughs: list[dict[str, Any]] = []
    seen_sigs: set[str] = set()

    pos_probes = [
        p
        for p in probe_list
        if p.get("status") == "closed"
        and p.get("verdict") in ("helped", "self_recovered")
        and (p.get("post") or p.get("text"))
    ]
    pos_probes.sort(
        key=lambda p: (
            1 if any(s.get("verify") for s in (p.get("post") or [])) else 0,
            float(p.get("closed_at") or p.get("opened_at") or 0.0),
        ),
        reverse=True,
    )
    for p in pos_probes:
        if len(walkthroughs) >= max_items:
            break
        raw_p_txt = str(p.get("text") or "").strip()
        if is_oneshot_task_prompt(raw_p_txt):
            continue
        clean_p_txt = normalize_machine_paths(redact(raw_p_txt))
        if _BARE_MACHINE_ROOT_RE.search(clean_p_txt) or _MID_WORD_TRUNC_RE.search(clean_p_txt):
            continue
        kind = str(p.get("target_kind") or "workflow")
        meta = lever_for(kind) if kind else {"scope": "INV", "lever": "C6", "lever_name": "Skill"}
        dom_p = str(p.get("domain") or "global")
        cue = _CUE_BY_KIND.get(kind) or f"When handling `{kind}` in `{dom_p}`"
        steer_txt = clip_clean_boundary(clean_p_txt, 260)
        eff_scope = calibrate_experience_scope(
            cue,
            steer_txt,
            requested_scope=meta["scope"],
            domain=dom_p,
            kinds=[kind] if kind != "workflow" else [],
        )
        sig = f"{kind}:{_slug(steer_txt, 24)}"
        if sig in seen_sigs:
            continue
        seen_sigs.add(sig)
        post_tools = []
        for s in p.get("post") or []:
            if isinstance(s, dict) and s.get("tool"):
                t_raw = str(s.get("tool")).strip()
                t_fmt = t_raw if t_raw.startswith("`") else f"`{t_raw}`"
                post_tools.append(t_fmt + (" *(verified ✓)*" if s.get("verify") else ""))
        chain_str = " → ".join(post_tools) if post_tools else "Direct intervention → clean execution"
        walkthroughs.append(
            {
                "title": f"{kind.replace('_', ' ').title() if kind != 'workflow' else 'Verified Steer'} Recovery",
                "domain": dom_p,
                "scope": eff_scope,
                "lever": meta["lever"],
                "cue": clip_clean_boundary(redact(cue), 200),
                "steps": [
                    f"**Trigger / Diagnosis:** {cue} (`e⁰` streak={int((p.get('e0') or {}).get('consecutive_errors') or 0)}).",
                    f"**Directive / Action:** {steer_txt}",
                    f"**Proven Trajectory (`Δτ`):** {chain_str} — _{clip_clean_boundary(redact(p.get('reason') or 'helped'), 160)}_.",
                ],
                "verdict": str(p.get("verdict") or "helped"),
                "uses": 1,
            }
        )

    conf_rank = {"high": 3, "medium": 2, "low": 1}
    ranked_exps = sorted(
        [e for e in (experiences or []) if isinstance(e, dict) and e.get("verdict") in ("helped", "self_recovered")],
        key=lambda e: (
            int(e.get("uses") or 1),
            conf_rank.get(str(e.get("confidence") or "medium"), 2),
            float(e.get("created_at") or 0.0),
        ),
        reverse=True,
    )
    for exp in ranked_exps:
        if len(walkthroughs) >= max_items:
            break
        cue = _clip(redact(str(exp.get("cue") or "When this pattern recurs")), 200)
        les = _clip(redact(str(exp.get("lesson") or "")), 360)
        if not les:
            continue
        sig = _slug(f"{cue}-{les[:30]}", 32)
        if sig in seen_sigs:
            continue
        seen_sigs.add(sig)
        lever = str(exp.get("lever") or "C6")
        scope = str(exp.get("scope") or "INV")
        uses = max(1, int(exp.get("uses") or 1))
        ev = _clip(redact(str(exp.get("evidence") or "Verified by Harness² RSI")), 180)
        walkthroughs.append(
            {
                "title": _clip(cue.replace("When ", "").capitalize(), 64),
                "domain": str(exp.get("domain") or "global"),
                "scope": scope,
                "lever": lever,
                "cue": cue,
                "steps": [
                    f"**Cue (`{scope} · {lever}`):** {cue}.",
                    f"**Procedure:** {les}",
                    f"**Verification & Evidence (`ψ_verify`):** {ev} (proven `{uses}×`).",
                ],
                "verdict": str(exp.get("verdict") or "helped"),
                "uses": uses,
            }
        )
    return walkthroughs


def refine_btw_playbook(
    experiences: list[dict[str, Any]],
    preset_stats: Optional[dict[str, Any]] = None,
    probes: Optional[dict[str, dict[str, Any]] | list[dict[str, Any]]] = None,
    *,
    max_chars: int = DEFAULT_BTW_MD_MAX_CHARS,
    walkthroughs: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    """Deduplicate, merge repeated lessons, generate 'Walkthroughs & Proven Workflows',
    and render BTW.md strictly within ``max_chars`` ($0 deterministic)."""
    budget = max(800, min(64_000, int(max_chars or DEFAULT_BTW_MD_MAX_CHARS)))
    raw_exps = [dict(e) for e in (experiences or []) if isinstance(e, dict) and str(e.get("lesson") or "").strip()]
    before_count = len(raw_exps)
    valid_exps = sanitize_experience_library(raw_exps)

    clusters: list[list[dict[str, Any]]] = []
    for exp in valid_exps:
        placed = False
        for cluster in clusters:
            if _experiences_are_duplicates(exp, cluster[0]):
                cluster.append(exp)
                placed = True
                break
        if not placed:
            clusters.append([exp])

    deduped = [_merge_experience_cluster(c) for c in clusters]
    conf_rank = {"high": 3, "medium": 2, "low": 1}
    deduped.sort(
        key=lambda x: (
            -int(x.get("uses") or 1),
            -conf_rank.get(str(x.get("confidence") or "medium"), 2),
            -float(x.get("created_at") or 0.0),
        )
    )

    wt_items = (
        list(walkthroughs)
        if isinstance(walkthroughs, list)
        else extract_proven_walkthroughs(deduped, probes, max_items=5)
    )

    header_lines = [
        "# BTW.md — Harness² Verified Agentic Workflow Playbook",
        "",
        "> Auto-maintained by **BTW Studio (Harness² RSI)**. Verified rules from `/btw` diagnostics and Δτ steer probes.",
        "",
    ]
    if not deduped and not wt_items:
        header_lines.append("_No verified workflow rules recorded yet._")
        md_empty = "\n".join(header_lines) + "\n"
        return {
            "ok": True,
            "experiences": [],
            "before_count": before_count,
            "after_count": 0,
            "merged_count": 0,
            "walkthroughs": [],
            "markdown": md_empty[:budget],
            "char_count": len(md_empty[:budget]),
            "max_chars": budget,
            "truncated": False,
        }

    wt_budget = int(budget * 0.38)
    wt_lines: list[str] = []
    if wt_items:
        wt_lines.extend(["## Walkthroughs & Proven Workflows", ""])
        for idx, wt in enumerate(wt_items, start=1):
            block_lines = [
                f"### {idx}. [{wt.get('lever', 'C6')} · {wt.get('scope', 'INV')}] {redact(str(wt.get('title') or 'Workflow'))} (`{redact(str(wt.get('domain') or 'global'))}`)",
            ]
            for st_line in wt.get("steps") or []:
                block_lines.append(f"- {redact(str(st_line))}")
            block_lines.append("")
            candidate_wt = "\n".join(wt_lines + block_lines)
            if len(candidate_wt) > wt_budget and idx > 1:
                break
            wt_lines.extend(block_lines)

    by_domain: dict[str, list[dict[str, Any]]] = {}
    for exp in deduped:
        dom = str(exp.get("domain") or "global")
        by_domain.setdefault(dom, []).append(exp)

    base_lines = header_lines + wt_lines
    current_text = "\n".join(base_lines)
    omitted_rules = 0
    total_rules_rendered = 0
    reserve_footer = 96

    domain_blocks: list[str] = []
    ordered_domains = sorted(
        by_domain.items(),
        key=lambda kv: (-max(int(x.get("uses") or 1) for x in kv[1]), kv[0]),
    )
    for dom, items in ordered_domains:
        clean_dom = redact(str(dom or "global"))[:64]
        dom_header = f"## Domain: `{clean_dom}`\n\n"
        rendered_in_dom: list[str] = []
        for item in items[:25]:
            lever = str(item.get("lever") or "C6")
            scope = str(item.get("scope") or "INV")
            cue = redact(str(item.get("cue") or "general").strip())
            lesson = redact(str(item.get("lesson") or "").strip())
            uses = int(item.get("uses") or 1)
            verdict = str(item.get("verdict") or "helped")
            merged_badge = f" · Merged: `×{item['merged_count']}`" if int(item.get("merged_count") or 1) > 1 else ""
            bullet = (
                f"- **[{lever} · {scope}]** *(Cue: `{cue}` · Verdict: `{verdict}` · "
                f"Uses: `{uses}×`{merged_badge})*: {lesson}"
            )
            projected_len = (
                len(current_text)
                + sum(len(b) for b in domain_blocks)
                + len(dom_header)
                + sum(len(r) + 1 for r in rendered_in_dom)
                + len(bullet)
                + reserve_footer
            )
            if projected_len > budget and (total_rules_rendered > 0 or wt_lines):
                omitted_rules += 1
                continue
            rendered_in_dom.append(bullet)
            total_rules_rendered += 1
        if rendered_in_dom:
            domain_blocks.append(dom_header + "\n".join(rendered_in_dom) + "\n\n")

    full_md = (current_text + "\n" + "".join(domain_blocks)).rstrip() + "\n"
    truncated = omitted_rules > 0
    if omitted_rules > 0:
        r_noun = "rule" if omitted_rules == 1 else "rules"
        footer = f"\n_(…{omitted_rules} lower-frequency {r_noun} omitted to respect btw_md_max_chars={budget})_\n"
        if len(full_md) + len(footer) <= budget:
            full_md = full_md.rstrip() + "\n" + footer
    if len(full_md) > budget:
        truncated = True
        cut_window = full_md[: max(100, budget - 64)]
        last_nl = cut_window.rfind("\n")
        full_md = (cut_window[:last_nl] if last_nl > 80 else cut_window).rstrip() + "\n_(…truncated)_\n"

    return {
        "ok": True,
        "experiences": deduped,
        "before_count": before_count,
        "after_count": len(deduped),
        "merged_count": max(0, before_count - len(deduped)),
        "walkthroughs": wt_items,
        "markdown": full_md,
        "char_count": len(full_md),
        "max_chars": budget,
        "truncated": truncated,
    }


# ------------------------------------------ Loop 2 · Utility Yield U(p)

HALF_LIFE_DAYS = 7.0


def utility_yield(stats: dict[str, Any], now: Optional[float] = None) -> float:
    """U(p) = decayed runs + 2·helped + 1·self_recovered − 2·hurt − 0.5·no_effect, recency-weighted."""
    if not stats:
        return 0.0
    ts = now if now is not None else time.time()
    last = float(stats.get("last_used") or 0.0)
    age_days = max(0.0, (ts - last) / 86400.0) if last else 30.0
    decay = math.pow(0.5, age_days / HALF_LIFE_DAYS)
    base = (
        float(stats.get("runs") or 0)
        + 2.0 * float(stats.get("helped") or 0)
        + 1.0 * float(stats.get("self_recovered") or 0)
        - 2.0 * float(stats.get("hurt") or 0)
        - 0.5 * float(stats.get("no_observed_effect") or 0)
    )
    return round(base * decay, 3)


# Reference rates per 1M tokens: (input_usd, output_usd, cache_read_usd)
_MODEL_PRICE_TABLE: list[tuple[str, tuple[float, float, float]]] = [
    ("opus", (15.0, 75.0, 1.50)),
    ("sonnet", (3.0, 15.0, 0.30)),
    ("haiku", (0.80, 4.0, 0.08)),
    ("gemini-2.5-pro", (1.25, 10.0, 0.31)),
    ("gemini-3", (1.25, 5.0, 0.125)),
    ("gemini-pro", (2.50, 10.0, 0.25)),
    ("flash", (0.30, 1.20, 0.03)),
    ("gpt-5", (2.50, 10.0, 0.25)),
    ("gpt-4o", (2.50, 10.0, 1.25)),
    ("codex", (2.00, 8.0, 0.50)),
    ("o3", (2.00, 8.0, 0.50)),
    ("deepseek", (0.27, 1.10, 0.07)),
    ("qwen", (0.40, 1.20, 0.10)),
    ("glm", (0.50, 1.50, 0.10)),
    ("kimi", (0.60, 2.50, 0.15)),
]


def estimate_token_economics(
    model: str,
    inp: int,
    out: int,
    cache_read: int,
    cache_write: int = 0,
    billed_cost_usd: float = 0.0,
) -> dict[str, Any]:
    """Calculate API list cost equivalent and prompt-cache USD savings ($0 deterministic).

    Ensures flat-rate OAuth, subscription, and custom gateway routes that report
    $0.0000 in state.db still display accurate API list value and prompt-cache savings.
    """
    m = str(model or "").lower()
    in_rate, out_rate, cache_rate = 2.50, 10.0, 0.25  # balanced frontier default
    for key, rates in _MODEL_PRICE_TABLE:
        if key in m:
            in_rate, out_rate, cache_rate = rates
            break
    inp_m = max(0, int(inp or 0)) / 1_000_000.0
    out_m = max(0, int(out or 0)) / 1_000_000.0
    cr_m = max(0, int(cache_read or 0)) / 1_000_000.0
    cw_m = max(0, int(cache_write or 0)) / 1_000_000.0
    list_cost = inp_m * in_rate + out_m * out_rate + cr_m * cache_rate + cw_m * (in_rate * 1.25)
    cache_savings = max(0.0, cr_m * (in_rate - cache_rate))
    billed = max(0.0, float(billed_cost_usd or 0.0))
    return {
        "billed_cost_usd": round(billed, 4),
        "list_cost_usd": round(list_cost, 4),
        "effective_cost_usd": round(billed if billed > 0 else list_cost, 4),
        "cache_savings_usd": round(cache_savings, 4),
        "is_subscription_estimate": billed <= 0.0 and (inp > 0 or out > 0 or cache_read > 0),
    }


def prune_candidates(preset_stats: dict[str, dict[str, Any]], now: Optional[float] = None) -> list[str]:
    """Presets that hurt more than they helped, or sat unused for 30+ days."""
    ts = now if now is not None else time.time()
    out = []
    for pid, st in (preset_stats or {}).items():
        hurt, helped = int(st.get("hurt") or 0), int(st.get("helped") or 0)
        idle = (ts - float(st.get("last_used") or ts)) / 86400.0
        if (hurt >= 2 and hurt > helped) or (int(st.get("runs") or 0) <= 1 and idle >= 30):
            out.append(pid)
    return out


def contextual_suggestion(
    preset_ids: list[str], telemetry: dict[str, Any], preset_stats: dict[str, dict[str, Any]]
) -> dict[str, str]:
    """One ✦ Suggested preset: the live situation first, then the highest U(p)."""
    ids = set(preset_ids or [])
    kinds = {str(a.get("kind")) for a in (telemetry or {}).get("anomalies") or []}
    live = (telemetry or {}).get("live") or {}
    rules = [
        ("errors", bool(kinds & {"error_streak", "command_loop", "subagent_silent_failure"}), "Loop Guard sees failures"),
        ("files", "unverified_edit" in kinds, "Edits without a verification step"),
        ("plan", "research_stall" in kinds, "Long research streak — check the plan"),
        ("cost", "cache_bust_warning" in kinds, "Prompt-cache reuse is low"),
        ("doing", bool(live.get("active_tool")), "A tool is running right now"),
    ]
    for pid, hit, why in rules:
        if hit and pid in ids:
            return {"id": pid, "why": why, "basis": "situation"}
    best, best_u = "", 0.0
    for pid in preset_ids or []:
        u = utility_yield((preset_stats or {}).get(pid) or {})
        if u > best_u:
            best, best_u = pid, u
    if best:
        return {"id": best, "why": f"Highest utility yield (U={best_u})", "basis": "yield"}
    return {}


# --------------------------------------- ψ_verify · promotion (trigger line)

def _slug(text: str, limit: int = 44) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", str(text or "").lower()).strip("-")
    if len(s) > limit:
        cut = s[:limit]
        if "-" in cut and s[limit : limit + 1] not in ("", "-"):
            cut = cut.rsplit("-", 1)[0] or cut
        s = cut.strip("-")
    return s or "btw-lesson"


def build_promotion(
    *,
    target: str,
    question: str = "",
    answer: str = "",
    cue: str = "",
    lesson: str = "",
    lever: str = "C6",
    scope: str = "INV",
    name: str = "",
) -> dict[str, Any]:
    """Draft text the user reviews and sends themselves (never auto-sent).

    target ``skill``  → ``/learn`` draft with the mandatory trigger line.
    target ``memory`` → a one-line durable fact (always-on: kept short on purpose).
    """
    cue = _clip(redact(cue or (f"When asking: {question}" if question else "When this situation reappears")), 220)
    body = _clip(redact(lesson or answer), 2400)
    skill_name = _slug(name or question or cue)
    if target == "memory":
        fact = _clip(redact(lesson or answer), 280)
        text = (
            "Remember this as a short durable fact (keep it under 2 lines, always-on context is expensive): "
            f"{fact}"
        )
        return {"ok": True, "target": "memory", "text": text, "lever": "C3", "warnings": ["Always-on memory costs tokens every turn — prefer a skill for procedures."]}
    situation = cue.strip().rstrip(".")
    if situation.lower().startswith("when "):
        situation = situation[5:].strip()
    situation = (situation[:1].lower() + situation[1:]) if situation else "this situation reappears"
    trigger = f"When {situation}, load the `{skill_name}` skill."
    text = (
        f"/learn Create a skill named `{skill_name}` from this BTW Studio finding.\n"
        f"Trigger line (required, Harness² rule 1): {trigger}\n"
        f"Scope: {scope} · Harness lever: {lever} ({LEVERS.get(lever, {}).get('name', 'Skill')})\n"
        "Rules: no unresolved {{…}} placeholders; any script you reference must exist and compile.\n\n"
        f"Finding:\n{body}"
    )
    return {"ok": True, "target": "skill", "name": skill_name, "trigger": trigger, "text": text, "lever": lever, "warnings": []}


_RESERVED_SKILL_SLUGS = frozenset(
    {"plan", "btw", "btw-studio", "learn", "help", "compact", "clear", "model", "skills", "status", "config"}
)
_MARKETING_WORDS_RE = re.compile(
    r"\b(?:powerful|comprehensive|seamless|advanced|cutting-edge|state-of-the-art|revolutionary|robust)\b",
    re.IGNORECASE,
)
_PROSE_SHELL_MAP = {
    "grep": "search_files",
    "rg": "search_files",
    "cat": "read_file",
    "head": "read_file",
    "tail": "read_file",
    "sed": "patch",
    "awk": "patch",
    "find": "search_files",
    "ls": "search_files",
}


def _sanitize_skill_prose(text: str) -> str:
    """Replace backticked raw shell utilities and machine paths in prose so skill_linter passes cleanly."""
    out = normalize_machine_paths(redact(str(text or "")))
    out = ANY_BRACES_RE.sub("(resolved)", out)
    for sh_cmd, native_tool in _PROSE_SHELL_MAP.items():
        out = re.sub(rf"`{re.escape(sh_cmd)}`", f"`{native_tool}`", out)
    return out


def _build_skill_short_description(cue: str, lesson: str) -> str:
    """Build a <= 60 char frontmatter description ('Use when ...') with zero marketing words."""
    clean_cue = _MARKETING_WORDS_RE.sub("", _sanitize_skill_prose(cue)).strip().rstrip(".")
    if clean_cue.lower().startswith("when "):
        clean_cue = clean_cue[5:].strip()
    clean_cue = re.sub(r"`[^`]*`", "", clean_cue)
    clean_cue = re.sub(r"\s+", " ", clean_cue).strip(" ,;:-")
    if not clean_cue:
        clean_cue = "this workflow pattern recurs"
    cand = f"Use when {clean_cue[:1].lower() + clean_cue[1:]}."
    if len(cand) <= 60:
        return cand
    words = cand[:-1].split()
    acc = "Use when"
    for w in words[2:]:
        if len(acc) + 1 + len(w) + 1 > 60:
            break
        acc += " " + w
    return acc.rstrip(" ,;:-") + "."


def render_skill_markdown(
    *,
    name: str = "",
    cue: str = "",
    lesson: str = "",
    evidence: str = "",
    scope: str = "INV",
    lever: str = "C6",
    domain: str = "global",
    walkthrough_steps: Optional[list[str]] = None,
    existing_markdown: str = "",
) -> dict[str, Any]:
    """Build or incrementally update a lint-clean SKILL.md with mandatory Harness² trigger line."""
    raw_slug = _slug(name or cue or lesson[:48], limit=44)
    if raw_slug in _RESERVED_SKILL_SLUGS or len(raw_slug) < 3:
        raw_slug = _slug(f"btw-{raw_slug}", limit=44)
    skill_name = raw_slug

    clean_cue = _clip(_sanitize_skill_prose(cue or "When this situation reappears"), 220)
    clean_lesson = _clip(_sanitize_skill_prose(lesson), 1800)
    clean_ev = _clip(_sanitize_skill_prose(evidence or "Verified by Harness² Δτ contrast"), 240)
    clean_dom = _slug(domain or "global", limit=32)
    scope = scope if scope in ("INV", "DOM") else "INV"
    lever = lever if lever in LEVERS else "C6"

    situation = clean_cue.strip().rstrip(".")
    if situation.lower().startswith("when "):
        situation = situation[5:].strip()
    situation = (situation[:1].lower() + situation[1:]) if situation else "this situation reappears"
    trigger_line = f"When {situation}, load the `{skill_name}` skill."
    short_desc = _build_skill_short_description(clean_cue, clean_lesson)

    version = "1.0.0"
    prior_rules: list[str] = []
    if existing_markdown:
        m_ver = re.search(r"^version:\s*['\"]?(\d+)\.(\d+)\.(\d+)['\"]?\s*$", existing_markdown, re.MULTILINE)
        if m_ver:
            version = f"{m_ver.group(1)}.{m_ver.group(2)}.{int(m_ver.group(3)) + 1}"
        m_sec = re.search(
            r"## Verified Rules & Procedure\s*\n([\s\S]*?)(?:\n## |\Z)",
            existing_markdown,
        )
        if m_sec:
            for ln in m_sec.group(1).splitlines():
                s_ln = ln.strip()
                if re.match(r"^\d+\.\s+", s_ln):
                    rule_body = re.sub(r"^\d+\.\s+", "", s_ln).strip()
                    rule_body = normalize_machine_paths(_sanitize_skill_prose(rule_body)).strip()
                    if (
                        rule_body
                        and not _BARE_MACHINE_ROOT_RE.search(rule_body)
                        and _jaccard_sim(_semantic_tokens(rule_body), _semantic_tokens(clean_lesson)) < 0.65
                    ):
                        prior_rules.append(rule_body)

    all_rules = [*prior_rules[-6:], f"{clean_lesson} *(Evidence: {clean_ev})*"]
    numbered_rules = "\n".join(f"{i}. {r}" for i, r in enumerate(all_rules, start=1))

    steps = list(walkthrough_steps or [])
    if not steps:
        steps = [
            f"**Diagnose (`D0`):** Confirm trigger condition ({situation}) using `read_file` or `search_files`.",
            f"**Apply Rule (`{scope} · {lever}`):** {clean_lesson}",
            "**Verify (`ψ_verify`):** Run the verification test or syntax check and confirm clean exit before finishing.",
        ]
    rendered_steps = "\n".join(f"{i}. {_sanitize_skill_prose(s)}" for i, s in enumerate(steps[:5], start=1))

    frontmatter = {
        "name": skill_name,
        "description": short_desc,
        "version": version,
        "author": "Hermes Agent",
        "license": "MIT",
        "platforms": ["linux", "macos", "windows"],
        "metadata": {
            "hermes": {
                "tags": ["btw-studio", "harness2", "rsi", scope.lower(), lever.lower(), clean_dom],
                "category": "btw-learned",
                "related_skills": ["hermes-agent"],
            }
        },
    }

    md = (
        "---\n"
        f"name: {skill_name}\n"
        f"description: {json.dumps(short_desc, ensure_ascii=False)}\n"
        f"version: {version}\n"
        "author: Hermes Agent\n"
        "license: MIT\n"
        "platforms: [linux, macos, windows]\n"
        "metadata:\n"
        "  hermes:\n"
        f"    tags: [btw-studio, harness2, rsi, {scope.lower()}, {lever.lower()}, {clean_dom}]\n"
        "    category: btw-learned\n"
        "    related_skills: [hermes-agent]\n"
        "---\n\n"
        f"# {skill_name}\n\n"
        f"> **Trigger line (Harness² Rule 1):** {trigger_line}\n\n"
        "## When to Use\n\n"
        f"- **Trigger:** {trigger_line}\n"
        f"- **Scope & Lever:** `{scope}` · `{lever}` ({LEVERS.get(lever, {}).get('name', 'Skill')}) · **Domain:** `{clean_dom}`\n\n"
        "## Verified Rules & Procedure\n\n"
        f"{numbered_rules}\n\n"
        "## Walkthroughs & Proven Workflows\n\n"
        f"{rendered_steps}\n"
    )
    return {
        "ok": True,
        "name": skill_name,
        "description": short_desc,
        "version": version,
        "trigger": trigger_line,
        "frontmatter": frontmatter,
        "markdown": md,
        "updated": bool(existing_markdown),
    }


# ------------------------------------------------------------ preset packs

PRESET_PACKS: dict[str, dict[str, Any]] = {
    "coding-tdd": {
        "id": "coding-tdd",
        "label": "Coding & TDD",
        "desc": "Verification-first checks for code sessions",
        "presets": [
            {"id": "pk_verify", "icon": "beaker", "label": "Verified?", "desc": "Was every edit tested?",
             "prompt": "Since the last edits ({{touched_files}}), which verification ran (tests, lint, type check) and what was the exact result? Anything still unverified?"},
            {"id": "pk_lasterr", "icon": "bug", "label": "Root cause", "desc": "Diagnose the latest failure",
             "prompt": "Last error: {{last_error}}. Separate INV (workflow) from DOM (workspace fact) and name the root cause, not the symptom."},
            {"id": "pk_diff", "icon": "git-commit", "label": "Diff review", "desc": "Risky changes in the diff",
             "prompt": "Review the changes made on {{git_branch}} in {{touched_files}}: what could break, and which test would catch it?"},
        ],
    },
    "research": {
        "id": "research",
        "label": "Research",
        "desc": "Keep long research turns converging",
        "presets": [
            {"id": "pk_sources", "icon": "book", "label": "Sources so far", "desc": "What has been read and why",
             "prompt": "List the sources read so far with one line each on what they contributed. Which claim is still unsupported?"},
            {"id": "pk_converge", "icon": "compass", "label": "Converging?", "desc": "Research vs deliverable",
             "prompt": "Is the work converging on the deliverable or still expanding? What is the single next step that produces output?"},
        ],
    },
    "devops": {
        "id": "devops",
        "label": "DevOps & Infra",
        "desc": "Commands, exits and blast radius",
        "presets": [
            {"id": "pk_cmd", "icon": "terminal", "label": "Last command", "desc": "Explain the last command",
             "prompt": "Explain {{last_command}}: what it changed, whether it is reversible, and what to check next."},
            {"id": "pk_blast", "icon": "shield", "label": "Blast radius", "desc": "What could this affect?",
             "prompt": "Given {{active_tool}} and the files {{touched_files}}, what is the blast radius if this goes wrong, and is there a rollback?"},
        ],
    },
    "academic": {
        "id": "academic",
        "label": "Academic & Clinical writing",
        "desc": "Evidence and citation discipline",
        "presets": [
            {"id": "pk_cite", "icon": "book", "label": "Citations", "desc": "Every claim sourced?",
             "prompt": "Which statements written so far lack a verifiable citation? List them with the section they appear in."},
            {"id": "pk_scope", "icon": "checklist", "label": "Scope check", "desc": "Still on the brief?",
             "prompt": "Compare the current draft with the original request: what is in scope, what drifted, what is missing?"},
        ],
    },
}
