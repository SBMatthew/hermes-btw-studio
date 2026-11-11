"""BTW Studio — FastAPI backend routes.

Mounted at ``/api/plugins/btw-studio/`` and called by ``desktop/plugin.js``
through ``ctx.rest()``.
"""

from __future__ import annotations

import importlib.util
import math
import sys
import threading
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import anyio
except ImportError:
    class _AnyioShim:
        class CapacityLimiter:
            def __init__(self, total_tokens: int = 8) -> None:
                self.total_tokens = total_tokens

        class to_thread:
            @staticmethod
            async def run_sync(fn: Any, *args: Any, limiter: Any = None, **kwargs: Any) -> Any:
                return fn(*args)

    anyio = _AnyioShim()  # type: ignore[assignment]

try:
    from fastapi import APIRouter, HTTPException, Query, Response
except ImportError:
    class HTTPException(Exception):  # type: ignore[no-redef]
        def __init__(self, status_code: int = 500, detail: Any = "") -> None:
            super().__init__(str(detail))
            self.status_code = status_code
            self.detail = detail

    def Query(default: Any = None, **kwargs: Any) -> Any:  # type: ignore[misc]
        return default

    class Response:  # type: ignore[no-redef]
        def __init__(self) -> None:
            self.headers: Dict[str, str] = {}

    class APIRouter:  # type: ignore[no-redef]
        def __init__(self) -> None:
            self.routes: list[Any] = []

        def get(self, path: str, **kwargs: Any) -> Any:
            def _dec(fn: Any) -> Any:
                self.routes.append(("GET", path, fn))
                return fn
            return _dec

        def post(self, path: str, **kwargs: Any) -> Any:
            def _dec(fn: Any) -> Any:
                self.routes.append(("POST", path, fn))
                return fn
            return _dec

router = APIRouter()
_LLM_LIMITER = anyio.CapacityLimiter(6)
_IO_LIMITER = anyio.CapacityLimiter(16)
_LOAD_LOCK = threading.RLock()
MAX_TEXT_PAYLOAD_CHARS = 32_000

RUNTIME_MODULE = "hermes_btw_studio_runtime"


def _clean_str(val: Any, max_len: int = MAX_TEXT_PAYLOAD_CHARS) -> str:
    if val is None or val is Ellipsis or isinstance(val, (dict, list)):
        return ""
    s = str(val).encode("utf-8", "replace").decode("utf-8").replace("\x00", "")
    return s[:max_len]


def _safe_err(rt: Any, exc: Any, limit: int = 320) -> str:
    if isinstance(exc, TimeoutError):
        return "BTW Studio storage lock busy; retry shortly."
    s = _clean_str(exc, limit)
    eff_rt = rt if rt is not None else sys.modules.get(RUNTIME_MODULE)
    if eff_rt is not None and hasattr(eff_rt, "H"):
        if hasattr(eff_rt.H, "redact_egress"):
            return str(eff_rt.H.redact_egress(s))
        if hasattr(eff_rt.H, "redact"):
            return str(eff_rt.H.redact(s))
    return s


def _preset_prompt_uses_llm(raw_prompt: str) -> bool:
    """Return True only when ``/presets/resolve`` triggers an LLM synthesis tunnel rather than $0 template interpolation."""
    p = str(raw_prompt or "")
    if p.startswith(("__BTW_DEEP_OVERVIEW__:", "__BTW_REFINE_PROMPT__:")):
        return True
    if p.startswith("__BTW_RECOMMEND__:"):
        parts = p.split(":")
        return len(parts) > 1 and parts[1].strip().lower() == "llm"
    if p.startswith("__BTW_REFINE_PLAYBOOK__:"):
        parts = p.split(":", 3)
        return len(parts) > 2 and parts[2].strip().lower() in ("1", "true", "llm")
    if p.startswith("__BTW_SESSION_MESH__"):
        parts = p.split(":", 3)
        return len(parts) > 1 and parts[1].strip().lower() in ("1", "true", "llm")
    if p.startswith("__BTW_AUTO_LEARN__"):
        parts = p.split(":", 5)
        run_now = len(parts) > 4 and parts[4].strip().lower() in ("1", "true", "run")
        mode_s = parts[1].strip().lower() if len(parts) > 1 and parts[1] else ""
        return bool(run_now and mode_s in ("medium", "full", ""))
    return False


def _safe_int(val: Any, default: int = 4, lo: int = 1, hi: int = 10) -> int:
    try:
        return max(lo, min(hi, int(val)))
    except (TypeError, ValueError, OverflowError):
        return default


def _safe_float(val: Any) -> Optional[float]:
    if val is None or val == "" or isinstance(val, (dict, list, bool)):
        return None
    try:
        f = float(val)
        return round(f, 1) if math.isfinite(f) else None
    except (TypeError, ValueError, OverflowError):
        return None


def _get_shared_reload_lock() -> threading.RLock:
    existing = sys.modules.get("_btw_studio_reload_lock_holder")
    if existing is not None and hasattr(existing, "lock"):
        return existing.lock  # type: ignore[return-value]
    from types import ModuleType

    holder = ModuleType("_btw_studio_reload_lock_holder")
    holder.lock = _LOAD_LOCK  # type: ignore[attr-defined]
    sys.modules["_btw_studio_reload_lock_holder"] = holder
    return _LOAD_LOCK


def _runtime():
    path = Path(__file__).resolve().parent.parent / "runtime.py"
    with _get_shared_reload_lock():
        try:
            mtime = path.stat().st_mtime
        except OSError:
            mtime = 0.0
        existing = sys.modules.get(RUNTIME_MODULE)
        if existing is not None and existing.__dict__.get("_LOAD_MTIME") == mtime:
            return existing
        spec = importlib.util.spec_from_file_location(RUNTIME_MODULE, path)
        if spec is None or spec.loader is None:
            raise HTTPException(status_code=500, detail="btw-studio runtime is missing")
        if existing is not None:
            saved_lock = existing.__dict__.get("_lock")
            if saved_lock is not None:
                with saved_lock:
                    saved_ctx = existing.__dict__.get("_ctx")
                    saved_live = dict(existing.__dict__.get("_live_sessions") or {})
                    saved_subs = dict(existing.__dict__.get("_launched_subagents") or {})
                    saved_s2c = dict(existing.__dict__.get("_session_to_conversation") or {})
                    saved_tips = dict(existing.__dict__.get("_conversation_tips") or {})
                    saved_skill_handles = dict(existing.__dict__.get("_skill_reg_handles") or {})
                    saved_settings_ov = dict(existing.__dict__.get("_settings_overrides") or {})
                    saved_settings_mtime = float(existing.__dict__.get("_settings_mtime") or 0.0)
                    saved_allowed_media = dict(existing.__dict__.get("_ALLOWED_GENERATED_MEDIA_PATHS") or {})
                    saved_known_subs = dict(existing.__dict__.get("_known_subagent_sessions") or {})
            else:
                saved_ctx = existing.__dict__.get("_ctx")
                saved_live = dict(existing.__dict__.get("_live_sessions") or {})
                saved_subs = dict(existing.__dict__.get("_launched_subagents") or {})
                saved_s2c = dict(existing.__dict__.get("_session_to_conversation") or {})
                saved_tips = dict(existing.__dict__.get("_conversation_tips") or {})
                saved_skill_handles = dict(existing.__dict__.get("_skill_reg_handles") or {})
                saved_settings_ov = dict(existing.__dict__.get("_settings_overrides") or {})
                saved_settings_mtime = float(existing.__dict__.get("_settings_mtime") or 0.0)
                saved_allowed_media = dict(existing.__dict__.get("_ALLOWED_GENERATED_MEDIA_PATHS") or {})
                saved_known_subs = dict(existing.__dict__.get("_known_subagent_sessions") or {})
            spec.loader.exec_module(existing)
            if saved_lock is not None:
                existing._lock = saved_lock
            existing._LOAD_MTIME = mtime
            with existing._lock:
                if saved_live:
                    existing._live_sessions.update(saved_live)
                if saved_subs:
                    existing._launched_subagents.update(saved_subs)
                if saved_s2c:
                    existing._session_to_conversation.update(saved_s2c)
                if saved_tips:
                    existing._conversation_tips.update(saved_tips)
                if saved_skill_handles:
                    existing._skill_reg_handles.update(saved_skill_handles)
                if saved_settings_ov:
                    existing._settings_overrides.update(saved_settings_ov)
                    existing._settings_mtime = saved_settings_mtime
                if saved_allowed_media:
                    existing._ALLOWED_GENERATED_MEDIA_PATHS.update(saved_allowed_media)
                if saved_known_subs and hasattr(existing, "_known_subagent_sessions"):
                    existing._known_subagent_sessions.update(saved_known_subs)
            if saved_ctx is not None:
                existing.configure(saved_ctx)
            else:
                existing.configure()
            return existing
        module = importlib.util.module_from_spec(spec)
        sys.modules[RUNTIME_MODULE] = module
        spec.loader.exec_module(module)
        module._LOAD_MTIME = mtime
        module.configure()
        return module


@router.get("/health")
async def health() -> Dict[str, Any]:
    def _run() -> Dict[str, Any]:
        rt = _runtime()
        return {"ok": True, "plugin": "btw-studio", "version": rt.VERSION, "config": rt.config_view()}

    return await anyio.to_thread.run_sync(_run, limiter=_IO_LIMITER)


@router.get("/settings")
async def settings_get() -> Dict[str, Any]:
    return await anyio.to_thread.run_sync(
        lambda: {"ok": True, "config": _runtime().config_view()},
        limiter=_IO_LIMITER,
    )


@router.post("/settings")
async def settings_update(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().update_runtime_settings(body),
            limiter=_IO_LIMITER,
        )
    except TimeoutError as exc:
        raise HTTPException(status_code=503, detail=_safe_err(None, exc)) from exc


@router.post("/settings/ping")
async def settings_ping(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    raw_url = body.get("base_url") if "base_url" in body else body.get("fast_base_url")
    clean_u = _clean_str(raw_url, 260)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().ping_fast_endpoint(clean_u),
        limiter=_IO_LIMITER,
    )


@router.get("/sessions")
async def sessions(limit: int = Query(12, ge=1, le=40)) -> Dict[str, Any]:
    """Recent top-level sessions across profiles ($0 read-only SQLite) for Session Compare."""
    cap = _safe_int(limit, default=12, lo=1, hi=40)
    return await anyio.to_thread.run_sync(
        lambda: {"ok": True, "sessions": _runtime().list_recent_sessions(cap)},
        limiter=_IO_LIMITER,
    )


@router.get("/compare")
async def compare(a: str = Query(...), b: str = Query(...)) -> Dict[str, Any]:
    """Side-by-side telemetry for two sessions ($0)."""
    clean_a = _clean_str(a, 128)
    clean_b = _clean_str(b, 128)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().compare_sessions(clean_a, clean_b),
        limiter=_IO_LIMITER,
    )


@router.post("/synth")
async def synth(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Pet narration line: compress an answer into a complete summary for ctx.pet.say."""
    p = payload if isinstance(payload, dict) else {}
    use_llm = bool(p.get("use_llm", True))
    max_lines = _safe_int(p.get("max_lines"), default=4, lo=1, hi=8)
    limiter = _LLM_LIMITER if use_llm else _IO_LIMITER
    return await anyio.to_thread.run_sync(
        lambda: _runtime().synthesize_summary(
            _clean_str(p.get("text"), 8000),
            personality=_clean_str(p.get("personality") or "neurodivergent", 40),
            lang=_clean_str(p.get("lang") or "en", 8),
            custom=_clean_str(p.get("custom"), 500),
            max_lines=max_lines,
            use_llm=use_llm,
            stock_safe=bool(p.get("stock_safe", True)),
        ),
        limiter=limiter,
    )


@router.post("/recap")
async def recap(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Turn-end recap for pet narration ($0 facts; model call only when asked)."""
    p = payload if isinstance(payload, dict) else {}
    use_llm = bool(p.get("use_llm", False))
    limiter = _LLM_LIMITER if use_llm else _IO_LIMITER
    return await anyio.to_thread.run_sync(
        lambda: _runtime().turn_recap(
            _clean_str(p.get("session_id"), 128),
            personality=_clean_str(p.get("personality") or "neurodivergent", 40),
            lang=_clean_str(p.get("lang") or "en", 8),
            custom=_clean_str(p.get("custom"), 500),
            use_llm=use_llm,
            stock_safe=bool(p.get("stock_safe", True)),
        ),
        limiter=limiter,
    )


@router.post("/telemetry/summary")
async def telemetry_summary(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Synthesize an AI-inferred personalized mascot bubble for telemetry events."""
    raw_payload: Any = payload
    if raw_payload is not None and not isinstance(raw_payload, dict) and hasattr(raw_payload, "json") and callable(raw_payload.json):
        try:
            maybe_coro = raw_payload.json()
            import inspect as _inspect

            raw_payload = await maybe_coro if _inspect.isawaitable(maybe_coro) else maybe_coro
        except Exception:
            raw_payload = {}
    p: Dict[str, Any] = raw_payload if isinstance(raw_payload, dict) else {}
    session_id = _clean_str(p.get("session_id"), 128).strip()
    event_type = _clean_str(p.get("event_type") or "auto", 32).strip()
    personality = _clean_str(p.get("personality") or "neurodivergent", 40)
    lang = _clean_str(p.get("lang") or "en", 8)
    custom = _clean_str(p.get("custom"), 500)
    use_llm = bool(p.get("use_llm", True))
    stock_safe = bool(p.get("stock_safe", True))
    bubble_mode = _clean_str(p.get("bubble_mode") or "ai_summary", 32).strip()
    details = p.get("details") if isinstance(p.get("details"), dict) else None
    limiter = _LLM_LIMITER if use_llm else _IO_LIMITER
    return await anyio.to_thread.run_sync(
        lambda: _runtime().synthesize_telemetry_bubble(
            session_id,
            event_type=event_type,
            details=details,
            personality=personality,
            lang=lang,
            custom=custom,
            use_llm=use_llm,
            stock_safe=stock_safe,
            bubble_mode=bubble_mode,
        ),
        limiter=limiter,
    )


@router.get("/telemetry")
async def telemetry_get(session_id: str = Query("", description="Session id"), limit: int = Query(20, ge=1, le=50)) -> Dict[str, Any]:
    """Return real-time telemetry events and live pulse for the session ($0 SQLite)."""
    clean_sid = _clean_str(session_id, 128).strip()
    cap = _safe_int(limit, default=20, lo=1, hi=50)

    def _read_tel() -> Dict[str, Any]:
        rt = _runtime()
        snap = rt.inspect_session(clean_sid)
        return {
            "ok": True,
            "session_id": clean_sid,
            "found": snap.get("found", False),
            "live": snap.get("live") or {},
            "events": (snap.get("telemetry_events") or [])[:cap],
            "live_events": (snap.get("live_telemetry_events") or [])[:cap],
            "metrics": {
                "counts": snap.get("counts") or {},
                "tokens": snap.get("tokens") or {},
                "top_tools": snap.get("top_tools") or [],
                "touched_files": snap.get("touched_files") or [],
                "health": snap.get("health") or {},
            },
        }

    return await anyio.to_thread.run_sync(_read_tel, limiter=_IO_LIMITER)


@router.get("/snapshot")
async def snapshot(session_id: str = Query("", description="Runtime or stored session id")) -> Dict[str, Any]:
    """Return deterministic session telemetry + Q&A history ($0.00 cost)."""
    clean_sid = _clean_str(session_id, 128)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().inspect_session(clean_sid),
        limiter=_IO_LIMITER,
    )


@router.get("/export")
async def export_report(session_id: str = Query("latest", description="Runtime or stored session id")) -> Dict[str, Any]:
    """Return a formatted GitHub-Flavored Markdown telemetry report for the session."""
    clean_sid = _clean_str(session_id, 128)

    def _run_export() -> Dict[str, Any]:
        rt = _runtime()
        telemetry = rt.inspect_session(clean_sid)
        md = rt.format_radar_markdown(telemetry)
        return {"ok": True, "session_id": telemetry.get("canonical_id") or clean_sid, "markdown": md, "telemetry": telemetry}

    return await anyio.to_thread.run_sync(_run_export, limiter=_IO_LIMITER)


@router.post("/ask")
async def ask(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Answer a side question enriched with live + SQLite mid-turn telemetry + multimodal attachments."""
    p = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(p.get("session_id"), 128).strip()
    question = _clean_str(p.get("question"), 2000).strip()
    mode = _clean_str(p.get("mode") or "fast", 16).strip()
    lang = _clean_str(p.get("lang") or "", 8).strip()
    raw_atts = p.get("attachments")[:12] if isinstance(p.get("attachments"), list) else None
    allow_web = p.get("allow_web_search") if "allow_web_search" in p and p.get("allow_web_search") is not None else None
    allow_media = p.get("allow_media_tools") if "allow_media_tools" in p and p.get("allow_media_tools") is not None else None
    tool_reqs = p.get("tool_requests")[:6] if isinstance(p.get("tool_requests"), list) else None
    raw_forced = p.get("forced_tools") if isinstance(p.get("forced_tools"), list) else None
    clean_forced = [_clean_str(ft, 48).strip() for ft in raw_forced[:6] if _clean_str(ft, 48).strip()] if raw_forced else None
    raw_chat_hist = p.get("chat_history")[:12] if isinstance(p.get("chat_history"), list) else None
    if not question and not raw_atts:
        raise HTTPException(status_code=400, detail="question is required")
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().ask_side_question(
                session_id,
                question,
                mode=mode,
                lang=lang,
                parent_id=_clean_str(p.get("parent_id"), 64).strip(),
                preset_id=_clean_str(p.get("preset_id"), 64).strip(),
                attachments=raw_atts,
                allow_web_search=bool(allow_web) if allow_web is not None else None,
                allow_media_tools=bool(allow_media) if allow_media is not None else None,
                tool_requests=tool_reqs,
                forced_tools=clean_forced,
                voice_dictated=bool(p.get("voice_dictated", False)),
                live_voice=bool(p.get("live_voice", False)),
                tts_reply=bool(p.get("tts_reply", False)),
                tts_voice=_clean_str(p.get("tts_voice"), 32).strip(),
                async_media=bool(p.get("async_media", True)),
                persist_card=bool(p.get("persist_card", True)),
                chat_history=raw_chat_hist,
            ),
            limiter=_LLM_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc
    except Exception as exc:
        # Return structured fallback signal so desktop half can seamlessly ladder to prompt.btw
        return {
            "ok": False,
            "fallback": "prompt.btw",
            "reason": _safe_err(None, exc, 400),
        }


@router.post("/record")
async def record(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Persist an answer produced by gateway ``prompt.btw`` (``btw.complete``) into BTW Studio history."""
    p = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(p.get("session_id"), 128).strip()
    question = _clean_str(p.get("question"), 2000).strip()
    answer = _clean_str(p.get("answer"), MAX_TEXT_PAYLOAD_CHARS).strip()
    raw_atts = p.get("attachments") if isinstance(p.get("attachments"), list) else None
    if not answer:
        raise HTTPException(status_code=400, detail="answer is required")

    def _run_record() -> Dict[str, Any]:
        rt = _runtime()
        entry = rt.record_qa_entry(
            session_id,
            task_id=_clean_str(p.get("task_id"), 64),
            question=question,
            answer=answer,
            source=_clean_str(p.get("source") or "prompt.btw", 48),
            model=_clean_str(p.get("model"), 120),
            duration_ms=_safe_float(p.get("duration_ms")),
            attachments=raw_atts,
        )
        return {"ok": True, "entry": entry}

    return await anyio.to_thread.run_sync(_run_record, limiter=_IO_LIMITER)


@router.post("/pin")
async def pin(payload: Dict[str, Any]) -> Dict[str, Any]:
    p = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(p.get("session_id"), 128).strip()
    entry_id = _clean_str(p.get("id"), 64).strip()

    def _run_pin() -> Dict[str, Any]:
        updated = _runtime().toggle_pin_qa(session_id, entry_id)
        return {"ok": bool(updated), "entry": updated}

    return await anyio.to_thread.run_sync(_run_pin, limiter=_IO_LIMITER)


@router.post("/clear")
async def clear(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(body.get("session_id"), 128).strip()
    entry_id = _clean_str(body.get("id") or "__all__", 64).strip()
    return await anyio.to_thread.run_sync(
        lambda: {"ok": True, "removed": _runtime().delete_qa_entry(session_id, entry_id)},
        limiter=_IO_LIMITER,
    )


@router.get("/presets")
async def presets_get() -> Dict[str, Any]:
    return await anyio.to_thread.run_sync(
        lambda: {"ok": True, **_runtime().get_presets_config()},
        limiter=_IO_LIMITER,
    )


@router.post("/presets")
async def presets_upsert(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().upsert_custom_preset(
                preset_id=_clean_str(body.get("id"), 48),
                label=_clean_str(body.get("label"), 64),
                prompt=_clean_str(body.get("prompt"), 1400),
                desc=_clean_str(body.get("desc"), 180),
                icon=_clean_str(body.get("icon") or "zap", 32),
                replace_builtin_id=_clean_str(body.get("replace_builtin_id"), 48),
            ),
            limiter=_IO_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/presets/delete")
async def presets_delete(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().delete_preset_item(_clean_str(body.get("id"), 48)),
            limiter=_IO_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/presets/restore")
async def presets_restore() -> Dict[str, Any]:
    return await anyio.to_thread.run_sync(
        lambda: _runtime().restore_builtin_presets(),
        limiter=_IO_LIMITER,
    )


@router.post("/presets/sync")
async def presets_sync(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}

    def _run_sync() -> Dict[str, Any]:
        synced = _runtime().sync_presets_config(
            custom_presets=body.get("custom_presets"),
            deleted_preset_ids=body.get("deleted_preset_ids"),
        )
        return {"ok": True, **synced}

    return await anyio.to_thread.run_sync(_run_sync, limiter=_IO_LIMITER)


# ------------------------------------------------ v5 · Harness² side-channel


_READONLY_BTW_RESOLVE_PREFIXES = (
    "__BTW_RECOMMEND__:",
    "__BTW_DEEP_OVERVIEW__:",
    "__BTW_REFINE_PROMPT__:",
    "__BTW_READ_MEDIA__:",
    "__BTW_MEDIA_CONFIG__",
    "__BTW_ENTRY_STATUS__:",
    "__BTW_SESSION_MESH__",
    "__BTW_COMPRESSION_RADAR__",
)


@router.post("/presets/resolve")
async def presets_resolve(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Live preview of ``{{token}}`` interpolation (ψ_verify rule 2), plus static lint."""
    body = payload if isinstance(payload, dict) else {}
    prompt = _clean_str(body.get("prompt"), 8000)
    sid = _clean_str(body.get("session_id"), 128)
    allow_commands = bool(body.get("allow_commands", False))
    preview_only = bool(body.get("preview", False))
    stripped_p = prompt.lstrip()
    is_btw_magic = stripped_p.startswith("__BTW_")
    block_command_tunnel = is_btw_magic and (
        preview_only
        or (not allow_commands and not stripped_p.startswith(_READONLY_BTW_RESOLVE_PREFIXES))
        or ("{{" in stripped_p and not stripped_p.startswith("__BTW_REFINE_PROMPT__:"))
    )
    limiter = _LLM_LIMITER if (not block_command_tunnel and _preset_prompt_uses_llm(prompt)) else _IO_LIMITER

    def _run_resolve() -> Dict[str, Any]:
        rt = _runtime()
        if block_command_tunnel:
            telemetry = rt.inspect_session(sid) if sid else {}
            res = rt.H.resolve_template(
                prompt,
                telemetry if telemetry.get("found") else {"live": telemetry.get("live") or {}},
            )
            res["ok"] = True
            res["command_blocked"] = True
        else:
            import inspect as _inspect

            try:
                sig_params = _inspect.signature(rt.resolve_preset_prompt).parameters
            except (TypeError, ValueError):
                sig_params = {}
            if "allow_commands" in sig_params:
                eff_allow_cmd = bool(
                    allow_commands or (not preview_only and stripped_p.startswith(_READONLY_BTW_RESOLVE_PREFIXES))
                )
                res = rt.resolve_preset_prompt(prompt, sid, allow_commands=eff_allow_cmd)
            else:
                res = rt.resolve_preset_prompt(prompt, sid)
        res["lint"] = rt.H.lint_template(prompt)
        return res

    try:
        return await anyio.to_thread.run_sync(_run_resolve, limiter=limiter)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=503, detail=_safe_err(None, exc)) from exc


@router.post("/presets/recommend")
async def presets_recommend(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Rank and recommend prompt snippets or run JIT Meta-Prompt Refiner using _build_full_context_digest()
    and _get_plugin_llm()."""
    body = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(body.get("session_id"), 128)
    use_llm = bool(body.get("use_llm", False))
    lang = _clean_str(body.get("lang") or "en", 8)
    draft_prompt = _clean_str(body.get("draft_prompt") or body.get("prompt") or "", 4000)
    mode = _clean_str(body.get("mode") or ("deep" if use_llm else "fast"), 16)
    limiter = _LLM_LIMITER if (use_llm or draft_prompt or body.get("refine")) else _IO_LIMITER

    def _run_recommend() -> Dict[str, Any]:
        rt = _runtime()
        if body.get("refine") or draft_prompt:
            return rt.refine_user_prompt(session_id, draft_prompt, mode=mode, lang=lang)
        res = rt.recommend_presets(session_id, use_llm=use_llm, lang=lang)
        if use_llm and hasattr(rt, "_build_full_context_digest") and hasattr(rt, "_get_plugin_llm"):
            telemetry = rt.inspect_session(session_id)
            if telemetry.get("found"):
                res["context_digest_preview"] = rt._build_full_context_digest(
                    str(telemetry.get("canonical_id") or session_id), telemetry, char_budget=2400
                )[:600]
        return res

    return await anyio.to_thread.run_sync(_run_recommend, limiter=limiter)


@router.get("/packs")
async def packs_list() -> Dict[str, Any]:
    return await anyio.to_thread.run_sync(lambda: _runtime().list_preset_packs(), limiter=_IO_LIMITER)


@router.post("/packs/install")
async def packs_install(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    pack_id = _clean_str(body.get("id"), 48)
    try:
        return await anyio.to_thread.run_sync(lambda: _runtime().install_preset_pack(pack_id), limiter=_IO_LIMITER)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.get("/packs/export")
async def packs_export(name: str = Query("My BTW presets")) -> Dict[str, Any]:
    clean_n = _clean_str(name, 80)
    return await anyio.to_thread.run_sync(lambda: _runtime().export_preset_pack(clean_n), limiter=_IO_LIMITER)


@router.post("/packs/import")
async def packs_import(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    try:
        return await anyio.to_thread.run_sync(lambda: _runtime().import_preset_pack(body.get("pack")), limiter=_IO_LIMITER)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/rsi/probe")
async def rsi_probe(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Loop 1: open a Δτ probe when a steer is delivered (e⁰ snapshot)."""
    body = payload if isinstance(payload, dict) else {}
    raw_text = body.get("text") if body.get("text") is not None else body.get("steer_text")
    text = _clean_str(raw_text, 1200).strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    return await anyio.to_thread.run_sync(
        lambda: _runtime().record_steer_probe(
            _clean_str(body.get("session_id"), 128),
            text=text,
            source=_clean_str(body.get("source") or "manual", 32),
            target_kind=_clean_str(body.get("target_kind"), 48),
            preset_id=_clean_str(body.get("preset_id"), 48),
            entry_id=_clean_str(body.get("entry_id"), 48),
            probe_id=_clean_str(body.get("probe_id"), 48),
        ),
        limiter=_IO_LIMITER,
    )


@router.get("/rsi")
async def rsi_get(session_id: str = Query("")) -> Dict[str, Any]:
    clean_sid = _clean_str(session_id, 128)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().rsi_overview(clean_sid, allow_cron_side_effects=False),
        limiter=_IO_LIMITER,
    )


@router.post("/rsi/experience")
@router.post("/rsi/lesson")
async def rsi_experience_add(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    raw_kinds = body.get("kinds")
    if isinstance(raw_kinds, str):
        kinds_list = [_clean_str(raw_kinds, 48).strip()] if raw_kinds.strip() else []
    elif isinstance(raw_kinds, (list, tuple, set)):
        kinds_list = [_clean_str(k, 48).strip() for k in raw_kinds if k and not isinstance(k, (dict, list))]
        kinds_list = [k for k in kinds_list if k]
    else:
        kinds_list = []
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().add_experience(
                id=_clean_str(body.get("id"), 48),
                session_id=_clean_str(body.get("session_id"), 128),
                cue=_clean_str(body.get("cue"), 400),
                lesson=_clean_str(body.get("lesson"), 1200),
                evidence=_clean_str(body.get("evidence"), 400),
                scope=_clean_str(body.get("scope") or "INV", 16),
                lever=_clean_str(body.get("lever") or "C6", 16),
                domain=_clean_str(body.get("domain"), 64),
                confidence=_clean_str(body.get("confidence") or "medium", 16),
                source=_clean_str(body.get("source") or "manual", 32),
                kinds=kinds_list,
            ),
            limiter=_IO_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/rsi/experience/delete")
async def rsi_experience_delete(payload: Dict[str, Any]) -> Dict[str, Any]:
    body = payload if isinstance(payload, dict) else {}
    clean_id = _clean_str(body.get("id"), 64)
    return await anyio.to_thread.run_sync(lambda: _runtime().delete_experience(clean_id), limiter=_IO_LIMITER)


@router.post("/rsi/playbook/refine")
async def rsi_playbook_refine(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Deduplicate, merge repeated lessons, generate Walkthroughs, and enforce btw_md_max_chars."""
    b = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(b.get("session_id"), 128)
    use_llm = bool(b.get("use_llm", False))
    max_chars_raw = b.get("max_chars") if "max_chars" in b else b.get("btw_md_max_chars")
    max_chars = _safe_int(max_chars_raw, default=4000, lo=800, hi=64_000) if max_chars_raw is not None else None
    limiter = _LLM_LIMITER if use_llm else _IO_LIMITER
    return await anyio.to_thread.run_sync(
        lambda: _runtime().refine_btw_playbook(
            session_id=session_id,
            max_chars=max_chars,
            use_llm=use_llm,
            auto_mold_skills=bool(b.get("auto_mold_skills", True)),
        ),
        limiter=limiter,
    )


@router.post("/rsi/playbook/rollback")
async def rsi_playbook_rollback() -> Dict[str, Any]:
    """Restore BTW.md and btw_rsi.json from the snapshot prior to the last refine."""
    return await anyio.to_thread.run_sync(lambda: _runtime().rollback_btw_playbook(), limiter=_IO_LIMITER)


@router.post("/rsi/playbook/save")
async def rsi_playbook_save(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Save user-edited BTW.md markdown directly to confined plugin data_dir after threat guard validation."""
    b = payload if isinstance(payload, dict) else {}
    md_text = _clean_str(b.get("markdown") or b.get("text") or "", 64_000)
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().save_btw_playbook_markdown(md_text),
            limiter=_IO_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.get("/rsi/memory")
async def rsi_memory_status() -> Dict[str, Any]:
    """Inspect Hermes MEMORY.md bounded allocation status."""
    return await anyio.to_thread.run_sync(lambda: _runtime().get_memory_md_status(), limiter=_IO_LIMITER)


@router.post("/rsi/memory/sync")
async def rsi_memory_sync(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Synthesize and sync BTW.md rules into Hermes Agent's MEMORY.md playbook block."""
    b = payload if isinstance(payload, dict) else {}
    mode_ov = _clean_str(b.get("mode") or b.get("sync_mode"), 24) or None
    force = bool(b.get("force", True))
    return await anyio.to_thread.run_sync(
        lambda: _runtime().sync_btw_to_hermes_memory(mode_override=mode_ov, force=force),
        limiter=_IO_LIMITER,
    )


@router.post("/rsi/auto-learn")
async def rsi_auto_learn(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Configure or execute an Auto-Learn cycle (off | lite | medium | full + hook/cron)."""
    b = payload if isinstance(payload, dict) else {}
    session_id = _clean_str(b.get("session_id"), 128)
    mode_ov = _clean_str(b.get("mode") or b.get("auto_learn_mode"), 24) or None
    hook_ov = bool(b["hook_enabled"]) if "hook_enabled" in b and b["hook_enabled"] is not None else None
    cron_ov = _safe_int(b.get("cron_minutes"), default=0, lo=0, hi=1440) if "cron_minutes" in b and b["cron_minutes"] is not None else None
    run_now = bool(b.get("run_now", False))
    if not run_now:
        def _update_only() -> Dict[str, Any]:
            rt = _runtime()
            patch_d: Dict[str, Any] = {}
            if mode_ov:
                patch_d["auto_learn_mode"] = mode_ov
            elif cron_ov is not None and cron_ov > 0:
                cur_cfg = rt.config_view()
                if str(cur_cfg.get("auto_learn_mode") or "off") == "off":
                    patch_d["auto_learn_mode"] = "lite"
            if hook_ov is not None:
                patch_d["auto_learn_hook"] = hook_ov
            if cron_ov is not None:
                patch_d["auto_learn_cron_minutes"] = cron_ov
            if patch_d:
                rt.update_runtime_settings(patch_d)
            return {"ok": True, "auto_learn": rt.get_auto_learn_status()}

        return await anyio.to_thread.run_sync(_update_only, limiter=_IO_LIMITER)
    eff_limiter = _LLM_LIMITER if (mode_ov in ("medium", "full", None)) else _IO_LIMITER
    return await anyio.to_thread.run_sync(
        lambda: _runtime().run_auto_learn_cycle(
            session_id=session_id,
            mode_override=mode_ov,
            hook_override=hook_ov,
            cron_minutes_override=cron_ov,
            trigger="manual",
        ),
        limiter=eff_limiter,
    )


@router.get("/sessions/mesh")
async def sessions_mesh_get(
    session_id: str = Query("", description="Focus session id"),
    use_llm: bool = Query(False),
    lang: str = Query("en"),
) -> Dict[str, Any]:
    """Multi-Session & Subagent Similarity / Conflict Radar ($0 SQLite + optional LLM audit)."""
    clean_sid = _clean_str(session_id, 128)
    clean_lang = _clean_str(lang or "en", 8)
    limiter = _LLM_LIMITER if use_llm else _IO_LIMITER
    return await anyio.to_thread.run_sync(
        lambda: _runtime().inspect_session_mesh(clean_sid, use_llm=use_llm, lang=clean_lang),
        limiter=limiter,
    )


@router.post("/sessions/mesh/link")
async def sessions_mesh_link(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Link or unlink concurrent sessions & subagents in the BTW Studio Session Mesh."""
    b = payload if isinstance(payload, dict) else {}
    action = _clean_str(b.get("action") or "status", 32)
    session_id = _clean_str(b.get("session_id"), 128)
    raw_targets = b.get("target_ids")
    if isinstance(raw_targets, list):
        targets = [_clean_str(x, 128) for x in raw_targets if x]
    elif b.get("target_id"):
        targets = [_clean_str(b.get("target_id"), 128)]
    else:
        targets = []
    note = _clean_str(b.get("note"), 280)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().manage_session_mesh_links(action=action, session_id=session_id, target_ids=targets, note=note),
        limiter=_IO_LIMITER,
    )


@router.get("/rsi/skills")
async def rsi_skills_list() -> Dict[str, Any]:
    return await anyio.to_thread.run_sync(lambda: _runtime().list_btw_skills(), limiter=_IO_LIMITER)


@router.post("/rsi/skill/mold")
async def rsi_skill_mold(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Mold an evidence-backed lesson into a SKILL.md with mandatory Harness² trigger line."""
    b = payload if isinstance(payload, dict) else {}
    raw_steps = b.get("walkthrough_steps")
    steps_list = [_clean_str(s, 360) for s in raw_steps if s] if isinstance(raw_steps, list) else None
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().mold_lesson_to_skill(
                lesson_id=_clean_str(b.get("lesson_id") or b.get("id"), 64),
                name=_clean_str(b.get("name"), 64),
                cue=_clean_str(b.get("cue"), 400),
                lesson=_clean_str(b.get("lesson"), 2400),
                evidence=_clean_str(b.get("evidence"), 400),
                scope=_clean_str(b.get("scope") or "INV", 16),
                lever=_clean_str(b.get("lever") or "C6", 16),
                domain=_clean_str(b.get("domain") or "global", 64),
                growth_mode=_clean_str(b.get("growth_mode"), 24) or None,
                walkthrough_steps=steps_list,
            ),
            limiter=_IO_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/tools/execute")
async def tools_execute(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute an allowlisted Hermes tool (web_search, web_extract, image_generate, video_generate, etc.) for /btw."""
    b = payload if isinstance(payload, dict) else {}
    tool_name = _clean_str(b.get("tool") or b.get("tool_name"), 48).strip()
    args = b.get("args") if isinstance(b.get("args"), dict) else {}
    allow_web = b.get("allow_web_search") if "allow_web_search" in b and b.get("allow_web_search") is not None else None
    allow_media_tools = bool(b.get("allow_media_tools", False))
    clean_sid = _clean_str(b.get("session_id"), 128)
    limiter = _IO_LIMITER if tool_name in ("read_file", "search_files", "session_search", "manage_connections") else _LLM_LIMITER
    try:
        def _exec_tool() -> Dict[str, Any]:
            rt = _runtime()
            cfg = rt.config_view()
            cfg_web = bool(cfg.get("allow_web_search", False))
            eff_web = cfg_web and (True if allow_web is None else bool(allow_web))
            cfg_media = bool(cfg.get("allow_media_tools", False))
            eff_media = cfg_media and allow_media_tools
            return rt.dispatch_btw_tool(
                tool_name,
                args,
                session_id=clean_sid,
                allow_web_search=eff_web,
                allow_media_tools=eff_media,
            )

        return await anyio.to_thread.run_sync(_exec_tool, limiter=limiter)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/media/read")
async def media_read_route(payload: Dict[str, Any], response: Response) -> Dict[str, Any]:
    """Safely read a confined local image/video artifact as a base64 Data-URL for BTW Studio cards & banner."""
    b = payload if isinstance(payload, dict) else {}
    raw_path = _clean_str(b.get("path") or b.get("url"), 1024).strip()
    if not raw_path:
        raise HTTPException(status_code=400, detail="path is required")
    if response is not None and hasattr(response, "headers"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
    return await anyio.to_thread.run_sync(
        lambda: _runtime().read_btw_media_data_url(
            raw_path,
            session_id=_clean_str(b.get("session_id"), 128),
        ),
        limiter=_IO_LIMITER,
    )


@router.post("/stt/lease")
async def stt_lease_route(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    b = payload if isinstance(payload, dict) else {}
    active = bool(b.get("active", True))
    lease_id = _clean_str(b.get("lease") or "btw-studio-dictation", 64)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().manage_btw_stt_lease(active=active, lease_id=lease_id),
        limiter=_IO_LIMITER,
    )


@router.post("/stt/transcribe")
async def stt_transcribe_route(payload: Dict[str, Any]) -> Dict[str, Any]:
    b = payload if isinstance(payload, dict) else {}
    raw_data_url = b.get("data_url")
    has_data_url = raw_data_url is not None and not isinstance(raw_data_url, (dict, list)) and bool(str(raw_data_url)[:64].strip())
    raw_transcript = _clean_str(b.get("raw_transcript"), 4000).strip()
    if not has_data_url and not raw_transcript:
        raise HTTPException(status_code=400, detail="data_url or raw_transcript is required")
    limiter = _IO_LIMITER if bool(raw_transcript and not has_data_url) else _LLM_LIMITER

    def _run_stt() -> Dict[str, Any]:
        data_url = _clean_str(raw_data_url, 22_000_000).strip()
        if not data_url and not raw_transcript:
            raise ValueError("data_url or raw_transcript is required")
        return _runtime().transcribe_btw_audio(
            data_url,
            mime_type=_clean_str(b.get("mime_type") or "audio/webm", 64),
            language=_clean_str(b.get("language") or "", 16),
            session_id=_clean_str(b.get("session_id") or "", 128),
            prompt_hint=_clean_str(b.get("prompt_hint") or "", 320),
            raw_transcript=raw_transcript,
        )

    try:
        return await anyio.to_thread.run_sync(_run_stt, limiter=limiter)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.get("/nous/status")
async def nous_status_route(refresh: bool = Query(False)) -> Dict[str, Any]:
    """Return host-configured gateway and auxiliary audio/media provider status."""
    return await anyio.to_thread.run_sync(
        lambda: {"ok": True, "nous_gateway": _runtime().resolve_nous_gateway_status(force=bool(refresh))},
        limiter=_IO_LIMITER,
    )


@router.post("/tts/speak")
async def tts_speak_route(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Synthesize spoken audio via host-configured Hermes TTS provider (`text_to_speech`)."""
    b = payload if isinstance(payload, dict) else {}
    text = _clean_str(b.get("text") or b.get("prompt"), 2400).strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().synthesize_btw_speech(
                text,
                voice=_clean_str(b.get("voice"), 32),
                model=_clean_str(b.get("model"), 64),
                speed=float(_safe_float(b.get("speed")) or 1.0),
                instructions=_clean_str(b.get("instructions"), 320),
                provider=_clean_str(b.get("provider") or "auto", 32),
                session_id=_clean_str(b.get("session_id"), 128),
                force_allow=bool(b.get("user_initiated", False)),
                fast_live=bool(b.get("fast_live", False)),
            ),
            limiter=_LLM_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.post("/voice/wake")
async def voice_wake_route(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Check 16kHz PCM (`pcm_b64`), audio `data_url`, or `raw_transcript` for the 'by the way' wake phrase (Sherpa-ONNX KWS + STT)."""
    b = payload if isinstance(payload, dict) else {}
    warm_only = bool(b.get("warm_only", False))

    def _run_wake() -> Dict[str, Any]:
        return _runtime().check_btw_wake_audio(
            pcm_b64=_clean_str(b.get("pcm_b64"), 4_000_000).strip(),
            data_url=_clean_str(b.get("data_url"), 22_000_000).strip(),
            mime_type=_clean_str(b.get("mime_type") or "audio/webm", 64),
            raw_transcript=_clean_str(b.get("raw_transcript"), 2000).strip(),
            custom_phrase=_clean_str(b.get("custom_phrase") or b.get("phrase"), 64).strip(),
            sample_rate=int(_safe_float(b.get("sample_rate")) or 16000),
            transcribe_on_wake=bool(b.get("transcribe_on_wake", True)),
            enforce_setting=not warm_only,
            warm_only=warm_only,
        )

    return await anyio.to_thread.run_sync(_run_wake, limiter=_IO_LIMITER)


@router.post("/promote")
async def promote(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Draft a /learn skill (with trigger line) or a short memory fact. Optionally mold SKILL.md on disk."""
    b = payload if isinstance(payload, dict) else {}

    def _run_promote() -> Dict[str, Any]:
        rt = _runtime()
        res = rt.build_promotion(
            target=_clean_str(b.get("target") or "skill", 16),
            question=_clean_str(b.get("question"), 600),
            answer=_clean_str(b.get("answer"), 4000),
            cue=_clean_str(b.get("cue"), 400),
            lesson=_clean_str(b.get("lesson"), 2400),
            lever=_clean_str(b.get("lever") or "C6", 16),
            scope=_clean_str(b.get("scope") or "INV", 16),
            name=_clean_str(b.get("name"), 64),
        )
        if bool(b.get("mold")) and res.get("target") == "skill":
            try:
                molded = rt.mold_lesson_to_skill(
                    name=_clean_str(res.get("name"), 64),
                    cue=_clean_str(b.get("cue") or b.get("question"), 400),
                    lesson=_clean_str(b.get("lesson") or b.get("answer"), 2400),
                    evidence=_clean_str(b.get("evidence"), 400),
                    scope=_clean_str(b.get("scope") or "INV", 16),
                    lever=_clean_str(b.get("lever") or "C6", 16),
                    domain=_clean_str(b.get("domain") or "global", 64),
                )
                res["molded_skill"] = molded
            except Exception:
                pass
        return res

    return await anyio.to_thread.run_sync(_run_promote, limiter=_IO_LIMITER)


@router.get("/sessions/badges")
async def sessions_badges() -> Dict[str, Any]:
    return await anyio.to_thread.run_sync(lambda: _runtime().session_badges(), limiter=_IO_LIMITER)


@router.get("/search")
async def search(q: str = Query(""), limit: int = Query(20, ge=1, le=60)) -> Dict[str, Any]:
    clean_q = _clean_str(q, 400)
    return await anyio.to_thread.run_sync(lambda: _runtime().search_cards(clean_q, limit), limiter=_IO_LIMITER)


@router.post("/steer/synth")
async def steer_synth(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Synthesize a high-signal steering command from a /btw card (or subagent state) + user instruction."""
    b = payload if isinstance(payload, dict) else {}
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().synthesize_steer_command(
                _clean_str(b.get("session_id"), 128),
                instruction=_clean_str(b.get("instruction"), 2000),
                card_question=_clean_str(b.get("card_question"), 600),
                card_answer=_clean_str(b.get("card_answer"), 6000),
                target_type=_clean_str(b.get("target_type") or "main", 32),
                subagent_id=_clean_str(b.get("subagent_id"), 128),
                subagent_goal=_clean_str(b.get("subagent_goal"), 400),
                mode=_clean_str(b.get("mode") or "fast", 16),
            ),
            limiter=_LLM_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc


@router.get("/subagents")
async def subagents_tree(session_id: str = Query("", description="Parent session id")) -> Dict[str, Any]:
    """Enriched read-only telemetry for all child subagents of ``session_id`` ($0 SQLite)."""
    clean_sid = _clean_str(session_id, 128)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().inspect_subagents_tree(clean_sid),
        limiter=_IO_LIMITER,
    )


@router.get("/subagents/feed")
async def subagent_feed(
    session_id: str = Query("", description="Subagent session id"),
    limit: int = Query(18, ge=4, le=40),
) -> Dict[str, Any]:
    """Structured Thought (CoT) + Tool Action + Output feed for a subagent ($0 SQLite)."""
    clean_sid = _clean_str(session_id, 128)
    return await anyio.to_thread.run_sync(
        lambda: _runtime().inspect_subagent_feed(clean_sid, limit=limit),
        limiter=_IO_LIMITER,
    )


@router.post("/subagents/launch")
async def subagents_launch(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Launch a new delegated child subagent via Hermes Agent's lifecycle API."""
    b = payload if isinstance(payload, dict) else {}
    goal = _clean_str(b.get("goal"), 16_000).strip()
    if not goal:
        raise HTTPException(status_code=400, detail="goal is required")
    context = _clean_str(b.get("context"), 32_000).strip()
    role = _clean_str(b.get("role") or "leaf", 32)
    model = _clean_str(b.get("model"), 120)
    provider = _clean_str(b.get("provider"), 64)
    session_id = _clean_str(b.get("session_id") or b.get("parent_session_id"), 128)
    parent_session_id = _clean_str(b.get("parent_session_id") or b.get("session_id"), 128)
    allowed_toolsets = b.get("allowed_toolsets")
    if isinstance(allowed_toolsets, list):
        toolsets_list = [
            _clean_str(x, 64).strip()
            for x in allowed_toolsets[:16]
            if x and not isinstance(x, (dict, list)) and _clean_str(x, 64).strip()
        ]
    else:
        toolsets_list = None
    timeout_seconds = _safe_float(b.get("timeout_seconds"))
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().launch_subagent(
                goal=goal,
                context=context,
                role=role,
                model=model,
                provider=provider,
                allowed_toolsets=toolsets_list,
                timeout_seconds=timeout_seconds,
                session_id=session_id,
                parent_session_id=parent_session_id,
            ),
            limiter=_LLM_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=503, detail=_safe_err(None, exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=_safe_err(None, exc)) from exc


@router.post("/subagents/control")
async def subagents_control(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Control a delegated subagent: 'steer', 'interrupt', 'status', 'result'."""
    b = payload if isinstance(payload, dict) else {}
    subagent_id = _clean_str(b.get("subagent_id"), 128).strip()
    action = _clean_str(b.get("action") or "status", 32).strip()
    text = _clean_str(b.get("text"), 4000).strip()
    reason = _clean_str(b.get("reason"), 400).strip()
    session_id = _clean_str(b.get("session_id"), 128)
    if not subagent_id:
        raise HTTPException(status_code=400, detail="subagent_id is required")
    try:
        return await anyio.to_thread.run_sync(
            lambda: _runtime().control_subagent(
                subagent_id=subagent_id,
                action=action,
                text=text,
                reason=reason,
                session_id=session_id,
            ),
            limiter=_IO_LIMITER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=_safe_err(None, exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=_safe_err(None, exc)) from exc
