"""Hermetic test isolation for BTW Studio.

Guarantees every test runs against an isolated temporary ``HERMES_HOME`` and OS user
home directory, resets volatile in-memory runtime caches between tests, neutralizes
active ``hermes_constants`` ContextVar overrides, and verifies at teardown that no
host ``MEMORY.md`` file was ever created or modified.
"""

from __future__ import annotations

import contextlib
import hashlib
import os
import sys
from pathlib import Path
from typing import Iterator, Optional

import pytest

TESTS_DIR = Path(__file__).resolve().parent
ROOT_DIR = TESTS_DIR.parent

for _entry in (str(ROOT_DIR), str(TESTS_DIR)):
    if _entry not in sys.path:
        sys.path.insert(0, _entry)


def _sha256_or_none(path: Path) -> Optional[str]:
    try:
        if path.is_file():
            return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        pass
    return None


def _snapshot_host_memory_files() -> dict[Path, tuple[Optional[int], Optional[str]]]:
    candidates: list[Path] = []
    try:
        real_home = Path.home()
        candidates.append(real_home / ".hermes" / "memories" / "MEMORY.md")
        candidates.append(real_home / "AppData" / "Local" / "hermes" / "memories" / "MEMORY.md")
    except Exception:
        pass
    for env_key, rel in (
        ("LOCALAPPDATA", Path("hermes") / "memories" / "MEMORY.md"),
        ("HERMES_HOME", Path("memories") / "MEMORY.md"),
    ):
        raw_val = (os.getenv(env_key) or "").strip()
        if raw_val:
            candidates.append(Path(raw_val) / rel)

    snapshots: dict[Path, tuple[Optional[int], Optional[str]]] = {}
    for cand in candidates:
        try:
            resolved = cand.resolve(strict=False)
        except OSError:
            resolved = cand
        try:
            mtime_ns = resolved.stat().st_mtime_ns if resolved.is_file() else None
        except OSError:
            mtime_ns = None
        snapshots[resolved] = (mtime_ns, _sha256_or_none(resolved))
    return snapshots


_INITIAL_HOST_MEMORY_HASHES = _snapshot_host_memory_files()
_RUNTIME_PATH = (ROOT_DIR / "runtime.py").resolve(strict=False)
_HARNESS_PATH = (ROOT_DIR / "harness.py").resolve(strict=False)
_ISOLATION_SEQ = 0


def _reset_volatile_plugin_state() -> None:
    """Clear mutable module-level caches across any loaded runtime/harness module instances."""
    for mod in list(sys.modules.values()):
        if mod is None:
            continue
        mod_file = getattr(mod, "__file__", None)
        if not mod_file or not str(mod_file).endswith(("runtime.py", "harness.py")):
            continue
        try:
            resolved_file = Path(mod_file).resolve(strict=False)
        except OSError:
            continue

        if resolved_file == _RUNTIME_PATH:
            lock = getattr(mod, "_lock", None)
            guard = lock if lock is not None and hasattr(lock, "__enter__") else contextlib.nullcontext()
            with guard:
                for dict_attr in (
                    "_disk_cfg_cache",
                    "_settings_overrides",
                    "_live_sessions",
                    "_qa_cache",
                    "_session_to_conversation",
                    "_conversation_tips",
                    "_known_subagent_sessions",
                    "_launched_subagents",
                    "_skill_reg_handles",
                    "_ALLOWED_GENERATED_MEDIA_PATHS",
                    "_WARM_OPENAI_CLIENTS",
                ):
                    container = getattr(mod, dict_attr, None)
                    if hasattr(container, "clear"):
                        container.clear()
                rsi_state = getattr(mod, "_rsi_state", None)
                if isinstance(rsi_state, dict):
                    rsi_state.clear()
                    rsi_state.update({"probes": {}, "experiences": [], "preset_stats": {}, "updated_at": 0.0})
                for float_attr in (
                    "_settings_mtime",
                    "_rsi_mtime",
                    "_qa_mtime",
                    "_presets_mtime",
                    "_last_pulse_disk_write_at",
                ):
                    if hasattr(mod, float_attr):
                        mod.__dict__[float_attr] = 0.0
            if hasattr(mod, "_ctx"):
                mod.__dict__["_ctx"] = None

        elif resolved_file == _HARNESS_PATH:
            psi_cache = getattr(mod, "_PSI_CACHE", None)
            if hasattr(psi_cache, "clear"):
                psi_cache.clear()


@pytest.fixture(scope="session")
def hermetic_sandbox_root(tmp_path_factory: pytest.TempPathFactory) -> Path:
    base = tmp_path_factory.mktemp("btw_hermetic")
    os_user = base / "shared_user_home"
    for sub in ("Documents", "Downloads", "Desktop", "AppData/Local", "AppData/Roaming", ".config"):
        (os_user / sub).mkdir(parents=True, exist_ok=True)
    return base


@pytest.fixture(autouse=True)
def _hermetic_hermes_isolation(
    hermetic_sandbox_root: Path, monkeypatch: pytest.MonkeyPatch
) -> Iterator[Path]:
    """Isolate HERMES_HOME, profile variables, OS user home, and volatile caches per test."""
    global _ISOLATION_SEQ
    _ISOLATION_SEQ += 1
    os_user = hermetic_sandbox_root / "shared_user_home"
    per_test_dir = hermetic_sandbox_root / f"case_{_ISOLATION_SEQ}"
    isolated_hermes_home = per_test_dir / "hermes_home"
    isolated_tmp = per_test_dir / "tmp"
    isolated_hermes_home.mkdir(parents=True, exist_ok=True)
    isolated_tmp.mkdir(parents=True, exist_ok=True)

    monkeypatch.setenv("HERMES_HOME", str(isolated_hermes_home))
    monkeypatch.setenv("HOME", str(os_user))
    monkeypatch.setenv("USERPROFILE", str(os_user))
    monkeypatch.setenv("HERMES_REAL_HOME", str(os_user))
    monkeypatch.setenv("LOCALAPPDATA", str(per_test_dir / "LocalAppData"))
    monkeypatch.setenv("APPDATA", str(per_test_dir / "RoamingAppData"))
    monkeypatch.setenv("TMPDIR", str(isolated_tmp))
    monkeypatch.setenv("TMP", str(isolated_tmp))
    monkeypatch.setenv("TEMP", str(isolated_tmp))

    for var_name in (
        "HERMES_PROFILE",
        "HERMES_PROFILE_NAME",
        "HERMES_SESSION_PROFILE",
        "HERMES_DATA_DIR_SUFFIX",
        "HERMES_KANBAN_TASK",
        "HERMES_CRON_SESSION",
    ):
        monkeypatch.delenv(var_name, raising=False)

    hc_mod = sys.modules.get("hermes_constants")
    hc_token = None
    if hc_mod is not None:
        set_ov = getattr(hc_mod, "set_hermes_home_override", None)
        if callable(set_ov):
            hc_token = set_ov(None)
        home_cache = getattr(hc_mod, "_HOME_KEY_CACHE", None)
        if hasattr(home_cache, "clear"):
            home_cache.clear()

    _reset_volatile_plugin_state()
    try:
        yield isolated_hermes_home
    finally:
        _reset_volatile_plugin_state()
        if hc_mod is not None and hc_token is not None:
            reset_ov = getattr(hc_mod, "reset_hermes_home_override", None)
            if callable(reset_ov):
                with contextlib.suppress(Exception):
                    reset_ov(hc_token)
            home_cache = getattr(hc_mod, "_HOME_KEY_CACHE", None)
            if hasattr(home_cache, "clear"):
                home_cache.clear()
        for host_mem, (expected_mtime_ns, expected_digest) in _INITIAL_HOST_MEMORY_HASHES.items():
            try:
                cur_mtime_ns = host_mem.stat().st_mtime_ns if host_mem.is_file() else None
            except OSError:
                cur_mtime_ns = None
            if cur_mtime_ns != expected_mtime_ns:
                actual_digest = _sha256_or_none(host_mem)
                assert actual_digest == expected_digest, (
                    f"Hermeticity violation: host MEMORY.md changed during test ({host_mem})"
                )
