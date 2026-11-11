"""BTW Studio — agent-side entry point.

Registers:
1. Lightweight, read-only observer hooks so the shared runtime knows about
   in-flight tool calls and turn boundaries in real time, complementing the
   durable read-only SQLite inspection in ``runtime.py``.
2. The ``btw_studio_fast`` auxiliary LLM slot (inheriting from host compression/
   review configuration by default, with optional user config overrides).
3. The ``/btw-studio`` slash command and ``hermes btw-studio`` CLI subcommand.
"""

from __future__ import annotations

import importlib.util
import ipaddress
import logging
import re
import socket
import sys
import threading
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlsplit, urlunsplit

PLUGIN_ID = "btw-studio"
RUNTIME_MODULE = "hermes_btw_studio_runtime"
_LOAD_LOCK = threading.RLock()

logger = logging.getLogger(__name__)
_BLOCKED_METADATA_HOSTS = frozenset(
    {
        "169.254.169.254",
        "169.254.170.2",
        "169.254.169.253",
        "100.100.100.200",
        "metadata.google.internal",
        "metadata.goog",
    }
)
_LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})
_FORBIDDEN_PORTS = frozenset(
    {
        1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79,
        87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137,
        139, 143, 161, 179, 389, 427, 445, 465, 512, 513, 514, 515, 526, 530, 531,
        532, 540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1433, 1521,
        1719, 1720, 1723, 2049, 3306, 3389, 5432, 5672, 5900, 6000, 6379, 6665, 6666,
        6667, 6668, 6669, 6697, 9200, 11211, 27017,
    }
)
_CGNAT_NET = ipaddress.ip_network("100.64.0.0/10")
_SIXTOFOUR_RELAY_NET = ipaddress.ip_network("192.88.99.0/24")
_IPV4_TRANSLATED_NET = ipaddress.ip_network("::ffff:0:0:0/96")
_NAT64_NET = ipaddress.ip_network("64:ff9b::/96")
_NAT64_LOCAL_NET = ipaddress.ip_network("64:ff9b:1::/48")
_ALTERNATE_IPV4_RE = re.compile(r"^(?:0x[0-9a-f]+|\d+|0[0-7]+(?:\.[0-9a-fx]+)*)$", re.IGNORECASE)


def _classify_ip(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> tuple[bool, bool]:
    """Return ``(is_loopback, is_unsafe_internal_or_metadata)`` unwrapping IPv4-mapped/translated/6to4/Teredo/NAT64/ISATAP IPv6."""
    wrapped_v6 = False
    if isinstance(ip_obj, ipaddress.IPv6Address):
        raw_v6 = int(ip_obj)
        iid_hi = (raw_v6 >> 32) & 0xFFFFFFFF
        if ip_obj.ipv4_mapped is not None:
            ip_obj = ip_obj.ipv4_mapped
            wrapped_v6 = True
        elif ip_obj.sixtofour is not None:
            ip_obj = ip_obj.sixtofour
            wrapped_v6 = True
        elif ip_obj.teredo is not None:
            _, client_v4 = ip_obj.teredo
            ip_obj = client_v4
            wrapped_v6 = True
        elif (iid_hi & 0xFDFFFFFF) == 0x00005EFE:
            # RFC 5214 ISATAP interface identifier (::0000:5efe:w.x.y.z or ::0200:5efe:w.x.y.z)
            ip_obj = ipaddress.IPv4Address(raw_v6 & 0xFFFFFFFF)
            wrapped_v6 = True
        elif ip_obj in _IPV4_TRANSLATED_NET or ip_obj in _NAT64_NET or ip_obj in _NAT64_LOCAL_NET:
            ip_obj = ipaddress.IPv4Address(raw_v6 & 0xFFFFFFFF)
            wrapped_v6 = True
        elif raw_v6 <= 0xFFFFFFFF and ip_obj != ipaddress.IPv6Address("::1"):
            return False, True
        elif str(ip_obj).lower() == "fd00:ec2::254":
            return False, True
    if ip_obj.is_loopback:
        # Reject wrapped IPv6 loopback (::ffff:127.0.0.1, 2002:7f00:0001::1, ISATAP) or non-127.0.0.1 IPv4 loopback
        if wrapped_v6 or (isinstance(ip_obj, ipaddress.IPv4Address) and str(ip_obj) != "127.0.0.1"):
            return False, True
        return True, False
    unsafe = (
        (not ip_obj.is_global)
        or ip_obj.is_private
        or ip_obj.is_link_local
        or ip_obj.is_reserved
        or ip_obj.is_multicast
        or ip_obj.is_unspecified
        or (
            isinstance(ip_obj, ipaddress.IPv4Address)
            and (
                ip_obj in _CGNAT_NET
                or ip_obj in _SIXTOFOUR_RELAY_NET
                or str(ip_obj) in _BLOCKED_METADATA_HOSTS
            )
        )
    )
    return False, unsafe


def _validate_fast_base_url(
    raw_url: str,
    *,
    allow_loopback: bool = True,
    preserve_query: bool = False,
    quiet: bool = False,
) -> str:
    """Validate optional custom OpenAI-compatible base_url against SSRF, authority confusion & non-HTTPS leaks."""
    val = str(raw_url or "").strip()
    if not val:
        return ""
    log_fn = logger.debug if quiet else logger.warning
    if any(ord(c) < 0x20 or ord(c) == 0x7F for c in val):
        log_fn("btw-studio: fast_base_url rejected (control characters in URL)")
        return ""
    try:
        parts = urlsplit(val)
        scheme = (parts.scheme or "").lower()
        if scheme not in ("http", "https") or not parts.netloc or "\\" in parts.netloc:
            return ""
        if "@" in parts.netloc or parts.username or parts.password:
            log_fn("btw-studio: fast_base_url rejected (embedded credentials forbidden by catalog rule 11)")
            return ""
        try:
            port = parts.port
            if port is not None and (not (1 <= port <= 65535) or port in _FORBIDDEN_PORTS):
                log_fn("btw-studio: fast_base_url rejected (forbidden or invalid port)")
                return ""
        except ValueError:
            return ""

        import unicodedata

        raw_hostname = parts.hostname or ""
        if "%" in raw_hostname or "%" in parts.netloc:
            return ""
        if any((ch.isdigit() or ch.isnumeric()) and not ch.isascii() for ch in raw_hostname):
            log_fn("btw-studio: fast_base_url rejected (non-ASCII numeric characters in hostname)")
            return ""
        raw_host = (
            unicodedata.normalize("NFKC", raw_hostname)
            .translate(str.maketrans(dict.fromkeys("。．｡", ".")))
            .strip()
            .lower()
            .rstrip(".")
        )
        if not raw_host or any(c.isspace() for c in raw_host):
            return ""
        if ":" in raw_host:
            if not raw_host.isascii():
                return ""
            host = raw_host
        else:
            host = raw_host.encode("idna").decode("ascii")
        if host in _BLOCKED_METADATA_HOSTS or host.startswith("169.254.") or host.endswith(".internal"):
            log_fn("btw-studio: fast_base_url rejected (blocked metadata/internal host)")
            return ""

        # Reject non-standard integer/hex/octal/shorthand IPv4 encodings (e.g. 0xa9fea9fe, 2852039166, 127.1, 0251.0376...)
        if ":" not in host:
            if _ALTERNATE_IPV4_RE.match(host) and "." not in host:
                log_fn("btw-studio: fast_base_url rejected (ambiguous numeric IP encoding)")
                return ""
            host_segs = host.split(".")
            if all(seg.isdigit() or seg.lower().startswith("0x") for seg in host_segs):
                if len(host_segs) != 4 or any(
                    (len(seg) > 1 and seg.startswith("0")) or seg.lower().startswith("0x") for seg in host_segs
                ):
                    log_fn("btw-studio: fast_base_url rejected (shorthand/octal/hex IP encoding)")
                    return ""

        # Evaluate IP literals BEFORE scheme != "https" and normalize IPv6 with ip_lit.compressed in brackets
        ip_lit: ipaddress.IPv4Address | ipaddress.IPv6Address | None = None
        try:
            ip_lit = ipaddress.ip_address(host)
        except ValueError:
            if ":" in host:
                return ""

        if ip_lit is not None:
            fmt_host = f"[{ip_lit.compressed}]" if isinstance(ip_lit, ipaddress.IPv6Address) else ip_lit.compressed
        else:
            fmt_host = host
        canon_netloc = f"{fmt_host}:{port}" if port else fmt_host
        safe_q = ""
        if preserve_query and parts.query and not any(ch in parts.query for ch in ("\r", "\n", "\x00")):
            safe_q = parts.query
        canon_url = urlunsplit((scheme, canon_netloc, parts.path or "", safe_q, ""))

        if ip_lit is not None:
            is_loop, is_unsafe = _classify_ip(ip_lit)
            if is_loop:
                return canon_url if allow_loopback else ""
            if is_unsafe:
                log_fn("btw-studio: fast_base_url rejected (private/reserved/metadata IP literal)")
                return ""
            if scheme != "https":
                log_fn("btw-studio: fast_base_url rejected (non-loopback endpoint must use https://)")
                return ""
            return canon_url

        # Explicit loopback allowance (http or https) ONLY when allow_loopback=True for local LLM gateways
        if host in _LOOPBACK_HOSTS:
            return canon_url if allow_loopback else ""

        # Non-loopback endpoints MUST use https://
        if scheme != "https":
            log_fn("btw-studio: fast_base_url rejected (non-loopback endpoint must use https://)")
            return ""

        # Reject well-known DNS-rebinding suffixes immediately
        if any(tok in host for tok in ("169.254.", "127.0.0.", "nip.io", "sslip.io", "xip.io", "lvh.me")) or host.startswith(
            "localhost."
        ):
            log_fn("btw-studio: fast_base_url rejected (rebinding/loopback alias host)")
            return ""

        # Delegate hostname SSRF / DNS-rebinding check to Hermes's public tools.url_safety when available,
        # AND enforce DNS resolution check against _classify_ip
        try:
            from tools.url_safety import is_safe_url

            if not is_safe_url(canon_url):
                log_fn("btw-studio: fast_base_url rejected by Hermes tools.url_safety")
                return ""
        except ImportError:
            pass

        try:
            infos = socket.getaddrinfo(host, port or 443, socket.AF_UNSPEC, socket.SOCK_STREAM)
            for _fam, _, _, _, sockaddr in infos:
                ip_str = str(sockaddr[0]).split("%")[0]
                is_loop, is_unsafe = _classify_ip(ipaddress.ip_address(ip_str))
                if is_loop or is_unsafe:
                    log_fn("btw-studio: fast_base_url rejected (DNS resolved to loopback/internal/metadata IP)")
                    return ""
        except socket.gaierror:
            log_fn("btw-studio: fast_base_url rejected (DNS resolution failed)")
            return ""
        return canon_url
    except Exception:
        return ""


classify_ip = _classify_ip
validate_fast_base_url = _validate_fast_base_url

__all__ = [
    "PLUGIN_ID",
    "RUNTIME_MODULE",
    "register",
    "_classify_ip",
    "classify_ip",
    "_validate_fast_base_url",
    "validate_fast_base_url",
]


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
    """Load ``runtime.py``, hot-reloading in-place if the file on disk changed."""
    path = Path(__file__).resolve().parent / "runtime.py"
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
            raise ImportError("btw-studio: runtime.py is missing")
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
            return existing
        module = importlib.util.module_from_spec(spec)
        sys.modules[RUNTIME_MODULE] = module
        spec.loader.exec_module(module)
        module._LOAD_MTIME = mtime
        return module


def _wrap_observer_hook(hook_name: str, callback: Callable[..., Any]) -> Callable[..., None]:
    """Isolate read-only BTW Studio observer callbacks so exceptions never disrupt a Hermes turn."""

    def _safe_hook_callback(**event: Any) -> None:
        try:
            callback(**event)
        except (Exception, SystemExit):
            logger.debug("btw-studio: observer hook '%s' skipped error", hook_name, exc_info=True)

    _safe_hook_callback.__name__ = f"btw_studio_{hook_name}"
    return _safe_hook_callback


def register(ctx) -> None:
    rt = _runtime()
    rt.configure(ctx)

    # Register fast auxiliary LLM slot so /btw answers return in ~1.5-3.0s
    # without waiting on heavy reasoning models. Syncs live with btw_settings.json + config_schema.
    try:
        if hasattr(rt, "sync_auxiliary_task_registration"):
            rt.sync_auxiliary_task_registration(ctx, validate_url_fn=_validate_fast_base_url)
        elif hasattr(ctx, "register_auxiliary_task") and callable(ctx.register_auxiliary_task):
            ctx.register_auxiliary_task(
                "btw_studio_fast",
                display_name="BTW Studio Fast Observer",
                description="Fast side-question observer for BTW Studio (/btw)",
                defaults={"timeout": 45},
                inherit_from="compression",
            )
            ctx.register_auxiliary_task(
                "btw_studio_title",
                display_name="BTW Studio Card & Subagent Title Generator",
                description="Concise title generator for /btw cards and subagents inheriting from Hermes title_generation",
                defaults={"timeout": 20},
                inherit_from="title_generation",
            )
    except Exception:
        logger.debug("btw-studio: auxiliary task registration skipped", exc_info=True)

    # Register /btw-studio slash command & `hermes btw-studio` CLI subcommand
    try:
        if hasattr(ctx, "register_command") and callable(ctx.register_command):
            ctx.register_command(
                "btw-studio",
                rt.handle_slash_command,
                description="BTW Studio: $0 session radar, Harness² loop guard, subagents fleet, steer-verdict RSI, endpoint ping and side questions (/btw-studio [radar|guard|rsi|subagents|spawn <goal>|ping [url]|compare|demo|search <q>|ask <q>])",
                args_hint="[radar | guard | rsi | subagents | spawn <goal> | ping [url] | compare | demo | search <text> | ask <question>]",
            )
    except Exception:
        logger.debug("btw-studio: slash command registration skipped", exc_info=True)

    try:
        if hasattr(ctx, "register_cli_command") and callable(ctx.register_cli_command):
            ctx.register_cli_command(
                "btw-studio",
                help="BTW Studio: zero-cost SQLite session telemetry radar, subagent fleet, ping and side-question observer",
                setup_fn=rt.setup_cli_parser,
                handler_fn=rt.handle_cli_command,
                description="Inspect live session telemetry ($0 SQLite state.db radar), manage subagents (subagents/spawn), ping endpoints (ping), steer, or ask a side question from the terminal.",
            )
    except Exception:
        logger.debug("btw-studio: cli command registration skipped", exc_info=True)

    hooks: dict[str, Callable[..., Any]] = {
        "pre_llm_call": rt.on_pre_llm,
        "post_llm_call": rt.on_post_llm,
        "pre_tool_call": rt.on_pre_tool,
        "post_tool_call": rt.on_post_tool,
        "post_api_request": rt.on_post_api,
        "on_session_open": rt.on_session_open,
        "on_session_start": rt.on_session_start,
        "on_session_end": rt.on_session_end,
        "post_compaction": rt.on_post_compaction,
        "post_curator_run": rt.on_post_curator_run,
        "subagent_start": rt.on_subagent_start,
        "subagent_stop": rt.on_subagent_stop,
    }
    for name, fn in hooks.items():
        ctx.register_hook(name, _wrap_observer_hook(name, fn))

    try:
        if hasattr(ctx, "register_session_env") and callable(ctx.register_session_env) and hasattr(rt, "resolve_session_env_vars"):
            ctx.register_session_env(("BTW_CONVERSATION_ID",), rt.resolve_session_env_vars)
    except Exception:
        logger.debug("btw-studio: session_env registration skipped", exc_info=True)

    try:
        if hasattr(ctx, "register_rpc") and callable(ctx.register_rpc):
            rpc_methods = (
                ("radar", getattr(rt, "rpc_radar", None)),
                ("ask", getattr(rt, "rpc_ask", None)),
                ("media_read", getattr(rt, "rpc_media_read", None)),
                ("entry_status", getattr(rt, "rpc_entry_status", None)),
                ("curator_status", getattr(rt, "rpc_curator_status", None)),
                ("voice_wake", getattr(rt, "rpc_voice_wake", None)),
                ("stt_transcribe", getattr(rt, "rpc_stt_transcribe", None)),
                ("tts_speak", getattr(rt, "rpc_tts_speak", None)),
                ("subagent_launch", getattr(rt, "rpc_subagent_launch", None)),
                ("subagent_control", getattr(rt, "rpc_subagent_control", None)),
                ("refine_prompt", getattr(rt, "rpc_refine_prompt", None)),
                ("playbook_save", getattr(rt, "rpc_playbook_save", None)),
            )
            for rpc_name, rpc_fn in rpc_methods:
                if callable(rpc_fn):
                    ctx.register_rpc(rpc_name, rpc_fn)
    except Exception:
        logger.debug("btw-studio: rpc registration skipped", exc_info=True)

    # Register cache-safe system prompt section & bundled/molded btw-skills when supported by host
    try:
        if (
            hasattr(ctx, "register_system_prompt_section")
            and callable(ctx.register_system_prompt_section)
            and hasattr(rt, "render_system_prompt_playbook")
        ):
            ctx.register_system_prompt_section(
                "btw-studio.verified-playbook",
                rt.render_system_prompt_playbook,
                position="after_memory",
                max_chars=16000,
            )
    except Exception:
        logger.debug("btw-studio: system prompt section registration skipped", exc_info=True)

    try:
        if hasattr(rt, "sync_bundled_btw_skills"):
            rt.sync_bundled_btw_skills(ctx)
    except Exception:
        logger.debug("btw-studio: skill registration skipped", exc_info=True)

    try:
        if hasattr(ctx, "on_unload") and callable(ctx.on_unload) and hasattr(rt, "on_plugin_unload"):
            ctx.on_unload(rt.on_plugin_unload)
    except Exception:
        logger.debug("btw-studio: on_unload registration skipped", exc_info=True)
