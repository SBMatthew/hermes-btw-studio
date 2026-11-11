# BTW Studio (`v5.8.0`) — Side-Channel Architecture & Data Flow

> **Side-channel `/btw` workspace, `$0` read-only SQLite session radar, and `Δτ` steer evaluation for Hermes Agent (`>=0.23.1`).**

---

## 1. Executive Summary & Design Principles

In standard agent loops, auxiliary checks, side questions, and diagnostic probes are injected directly into the main conversation transcript. That introduces three failure modes:
1. **Context Window Dilution**: Consumes active context capacity and competes with task instructions.
2. **Prompt-Cache Invalidation**: Mutating prefix messages invalidates provider prompt caches, increasing latency and API spend.
3. **Transcript Mutation**: Ephemeral side questions shift message offsets, interrupt active tool loops, and pollute compressed summaries.

**BTW Studio (`v5.8.0`)** addresses these through a **read-only side-channel architecture**:
- Runs **beside** a live Hermes turn without mutating the `messages` table (`ΔMainTranscript = 0 bytes`).
- Extracts telemetry deterministically from Hermes Agent's SQLite store (`state.db?mode=ro` + `PRAGMA query_only = ON`, tables `sessions`, `messages`, `session_turn_leases`, `async_delegations`) at **`$0.00` model cost**, anchored to Hermes `v0.23.1`'s immutable `conversation_id` across `/compress` compaction rotations and exposed to child tools as `BTW_CONVERSATION_ID` via `ctx.register_session_env` (`O(1)` in-memory).
- Answers side questions (`/btw`) through decoupled auxiliary tasks (`btw_studio_fast` inheriting `compression`, `btw_studio_title` inheriting `title_generation`) using `ctx.llm.complete` (plus optional `ctx.llm.complete_structured` in `recommend_presets`) with mandatory egress scrubbing via `agent.redact.redact_sensitive_text(force=True)`.
- Launches, inspects, steers, and interrupts delegated child subagents via the public `ctx.subagent_lifecycle` API and Desktop host RPCs (`model.options`, `pet.select`, `prompt.btw`, `session.steer`, `subagent.interrupt`, `subagent.list`, `subagent.steer`, `llm.oneshot`), while exposing session-scoped push updates via `ctx.emit_to_session`, 55 FastAPI dashboard endpoints (57 route handlers) under `/api/plugins/btw-studio/`, 14 `hermes btw-studio` CLI subcommands, and 12 plugin RPCs `plugin.btw-studio.{radar,ask,media_read,entry_status,curator_status,voice_wake,stt_transcribe,tts_speak,subagent_launch,subagent_control,refine_prompt,playbook_save}` via `ctx.register_rpc`.
- Evaluates mid-turn steers via **Harness² Recursive Self-Improvement (RSI)** (Xu et al., 2026, `arXiv:2610.14224`): label-free 3-call behavioral contrast ($\Delta\tau$) verifies whether an intervention helped or hurt, retaining only evidence-backed rules in `BTW.md` and reconciling post-session skill state with `$HERMES_HOME/logs/curator/*/run.json` and `$HERMES_HOME/skills/.archive` on `post_curator_run`.

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  HERMES AGENT (>=0.23.1)                                    │
│                                                                                             │
│  ┌───────────────────────────┐                ┌──────────────────────────────────────────┐  │
│  │ Main Conversation Loop    │                │ Public Subagent Lifecycle API            │  │
│  │ · Immutable conversation_id                │ (ctx.subagent_lifecycle)                 │  │
│  │ · BTW_CONVERSATION_ID env │                └─────────────────┬────────────────────────┘  │
│  └─────────────┬─────────────┘                                  │                           │
│                │                                                │                           │
│                │ 12 Observer Hooks (return None):               │ spawn / steer / cancel    │
│                │ pre/post_llm_call, pre/post_tool_call,         │                           │
│                │ post_api_request, on_session_open,             │                           │
│                │ on_session_start/end, post_compaction,         │                           │
│                │ post_curator_run, subagent_start/stop          │                           │
│                ▼                                                ▼                           │
│  ┌───────────────────────────┐                ┌──────────────────────────────────────────┐  │
│  │ Observer State Pulse      │                │ Delegated Child Subagents                │  │
│  │ + Curator run.json Sync   │                │ (Isolated context & tools)               │  │
│  └─────────────┬─────────────┘                └─────────────────┬────────────────────────┘  │
│                │                                                │                           │
│                │ append / commit                                │ state & delegation rows   │
│                ▼                                                ▼                           │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             state.db (SQLite Database)                                │  │
│  │        sessions · messages · session_turn_leases · async_delegations · usage          │  │
│  └──────────────────────────────────────────┬────────────────────────────────────────────┘  │
└─────────────────────────────────────────────┼───────────────────────────────────────────────┘
                                              │
                      $0.00 read-only URI (?mode=ro + PRAGMA query_only=ON)
                                              │
┌─────────────────────────────────────────────▼───────────────────────────────────────────────┐
│                                  BTW STUDIO v5.8.0 (HARNESS)                                │
│                                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ 1. Zero-Cost Session    │  │ 2. Subagent Fleet Hub   │  │ 3. Harness² RSI Engine      │  │
│  │    Radar                │  │ · Launch via lifecycle  │  │ · Loop 1: 3-call Δτ probe   │  │
│  │ · Token & cache ledger  │  │ · Bounded 32/24/16 KB   │  │ · Loop 2: BTW.md playbook   │  │
│  │ · 10 Loop Guard rules   │  │   3-accordion dossier   │  │ · Dual-scope (INV / DOM)    │  │
│  │ · Cross-session Mesh    │  │ · Mid-flight Steer      │  │ · Cheapest Levers (C3..C8)  │  │
│  │ · ψ-verify AST/JSON     │  │ · Cooperative Interrupt │  │ · Curator skill reconcile   │  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────────┘  │
│                                              ▲                                              │
│                                              │                                              │
│  ┌───────────────────────────────────────────┴───────────────────────────────────────────┐  │
│  │     Auxiliary Slots (btw_studio_fast / btw_studio_title) + redact_sensitive_text      │  │
│  │        ctx.llm.complete · ctx.llm.complete_structured · Local Read-Only /btw Tools    │  │
│  └───────────────────────────────────────────┬───────────────────────────────────────────┘  │
└──────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                               │
            ctx.register_rpc (plugin.btw-studio.*) · ctx.emit_to_session · FastAPI REST
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                  USER SURFACES & RUNTIMES                                   │
│                                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────────────────────┐  │
│  │ Desktop UI Plugin    │  │ CLI & Gateway        │  │ Companion & 6-Axis Reading Lens   │  │
│  │ · Composer /btw strip│  │ · hermes btw-studio  │  │ · ctx.pet.say (<=114 chars)       │  │
│  │ · Session Radar      │  │   (14 subcommands)   │  │ · 6-axis reading lens ([0,1]⁶)    │  │
│  │ · Subagents Hub      │  │ · /btw-studio slash  │  │ · Compression radar (>=75% fill)  │  │
│  │ · Action Steer Dock  │  │ · 55 FastAPI routes  │  │ · Opt-in Playbook Milestones      │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Lifecycle Hooks, Lineage Continuity & Subagent Integration

### 3.1 12 Read-Only Observer Hooks & `conversation_id` Continuity

Every hook registered by `__init__.py` returns `None` (never blocking, rewriting, or auto-approving):
- **`on_session_open`**: Hydrates session state and playbook context as soon as the gateway opens or creates a local session, before Turn 1 starts.
- **`on_session_start` / `on_session_end`**: Tracks session boundaries, evaluates pending $\Delta\tau$ probes at turn/session close, and triggers `auto_learn_mode` consolidation when configured.
- **`pre_llm_call` / `post_llm_call` / `post_api_request`**: Records active turn timings, token/cache buckets, and live model metadata into `btw_live_pulse.json`.
- **`pre_tool_call` / `post_tool_call`**: Tracks the in-flight tool call, touched workspace files (`ψ-verify`), and step counts for $\Delta\tau$ contrast probes.
- **`post_compaction`**: Preserves `/btw` card history, active $\Delta\tau$ probes, and telemetry continuity across `/compress` context compactions via Hermes `v0.23.1`'s immutable `conversation_id`.
- **`post_curator_run`**: Reads `$HERMES_HOME/logs/curator/*/run.json` and checks `$HERMES_HOME/skills/{.archive,<slug>}` (read-only) after background curator runs to reconcile BTW Studio's `btw-skills/` metadata and surface status via `plugin.btw-studio.curator_status`.
- **`subagent_start` / `subagent_stop`**: Tracks delegated child subagent lifecycle boundaries and live roster status without mutating parent turns.

### 3.2 Subagent Invocation Pipeline (`launch_subagent`)

Subagents can be launched from active in-session surfaces (Desktop Subagents Fleet Hub, Loop Guard `C5` remedies, `/btw` Attached Action Dock, or in-session `/btw-studio` commands):

```python
# runtime.py
from agent.subagent_lifecycle import SubagentLaunchRequest

req = SubagentLaunchRequest(
    goal=goal,
    context=effective_ctx or None,
    role=role_clean,
    model=mod_clean,
    provider=prov_clean,
    allowed_toolsets=tuple(allowed_toolsets) if allowed_toolsets else None,
    parent_session_id=parent_sid or None,
)
handle = ctx.subagent_lifecycle.launch(req)
```

*(Note: standalone terminal invocations of `hermes btw-studio subagents` inspect the persisted SQLite subagent tree and `async_delegations` state read-only; live subagent launch, mid-flight `steer`, and `interrupt` require an active Gateway RPC or in-session `ctx.subagent_lifecycle` handle rather than cross-process memory mutation.)*

### 3.3 Supervision & Bounded 32/24/16 KB Dossier (`inspect_subagents_tree` & `inspect_subagent_feed`)

The subagent fleet reconciles three sources without phantom `running` states:
- **Durable SQLite Lineage (`sessions` & `async_delegations`)**: Reads child sessions and checks `async_delegations.state` so completed batches never leave stale `running` entries, even when `sessions.title` is truncated at ~50 chars.
- **In-Flight Runtime Registry (`_launched_subagents`)**: Tracks handles spawned in the current gateway process.
- **Live RPC Roster (`subagent.list`) & Feed Inspection**: Streams live execution flags from `subagent.list` while reading bounded child transcripts and tool timelines via `inspect_subagent_feed` (`state.db?mode=ro`).
- **Bounded 3-Accordion Dossier**: Surfaces up to `32 KB` of Markdown output, `24 KB` of reasoning (`reasoning`, `reasoning_content`, `reasoning_details`) + tool timeline, and `16 KB` of mission prompt.

---

## 4. The Harness² RSI Side-Channel Engine

BTW Studio implements the two coupled loops of the Harness² framework (Xu et al., 2026) in pure Python stdlib:

### Loop 1: Task-Level Behavioral Contrast ($\Delta\tau$)
```
[Steer Injected / Subagent Launched] ──► Snapshot e⁰ (Tool history, errors, touched files, conversation_id)
                                                   │
                                                   ▼
                                         Watch Next 3 Tool Calls (e′)
                                                   │
                                                   ▼
                                        Compute Contrast: e′ vs e⁰
                                                   │
            ┌──────────────────────┬───────────────┴──────────────┬──────────────────────┐
            ▼                      ▼                              ▼                      ▼
        [HELPED]           [SELF_RECOVERED]                     [HURT]              [CONFOUNDED]
    Errors resolved &      Agent corrected streak        More errors or churn      Multiple steers
    clean verify step      before steer arrived                                    overlapped
```

- **Verdict Outcomes**:
  - `helped`: The steer or subagent intervention eliminated errors and passed verification.
  - `self_recovered`: The agent resolved an `error_streak >= 2` autonomously before a manual steer took effect.
  - `hurt`: Errors increased or edit churn escalated.
  - `no_observed_effect`: Trajectory remained unchanged over the 3-call window.
  - `confounded`: Overlapping steers prevent clean attribution ($\rightarrow \text{NO\_ENTRY}$).

### Loop 2: Harnessing-Level Playbook (`BTW.md`)
Only verified `helped` and `self_recovered` verdicts enter `BTW.md`:
$$R_{t+1} = \text{Update}(R_t, H^*_t, D_t)$$
- Confounded verdicts record **NO_ENTRY**, keeping unverified steers out of future prompts.
- Rules are tagged by:
  - **Scope**: `INV` (task-invariant agent workflow rule) vs `DOM` (workspace-specific fact).
  - **Cheapest Lever**: Ordered $C_6 \text{ (Skill)} \rightarrow C_7 \text{ (Script)} \rightarrow C_5 \text{ (Subagent)} \rightarrow C_8 \text{ (Hook/Preset)} \rightarrow C_3 \text{ (Memory)}$.

### `ψ-verify` Discard Gates
1. **Skill Trigger Gate**: Molded `SKILL.md` files (`<= 60` char description) require an explicit `When <condition>, load the <slug> skill.` trigger line.
2. **Template Token Gate**: Dynamic tokens (`{{touched_files}}`, `{{last_error}}`) are resolved and secret-redacted; unresolved placeholders are rejected.
3. **Read-Only Syntax Gate**: Up to 8 workspace-confined (`.py`, `.json`, `<= 512 KB`) files edited in the session are checked via `ast.parse` / `json.loads` (never executed) and badged as `ψ ✓` or `ψ ✗ L<line>`.

---

## 5. End-to-End Data Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Desktop as Desktop UI / Gateway RPC
    participant FastLLM as Auxiliary LLM (ctx.llm.complete)
    participant PluginAPI as Runtime / FastAPI / RPC
    participant StateDB as state.db?mode=ro
    participant Lifecycle as ctx.subagent_lifecycle
    participant Subagent as Delegated Subagent

    Note over User,PluginAPI: Phase 0: Session Open & Lineage Binding ($0.00)
    PluginAPI->>PluginAPI: on_session_open -> bind conversation_id & BTW_CONVERSATION_ID env

    Note over User,Desktop: Phase 1: Session Radar & Conflict Detection ($0.00)
    Desktop->>PluginAPI: plugin.btw-studio.radar / GET /snapshot (conversation_id)
    PluginAPI->>StateDB: SELECT sessions, messages, session_turn_leases, async_delegations
    StateDB-->>PluginAPI: Read-only turn telemetry, tool calls, leases
    PluginAPI->>PluginAPI: Run 10 Loop Guard rules, Cross-Session Mesh & ψ-verify
    PluginAPI-->>Desktop: Telemetry Snapshot + Verification Badges (D0/D1) via ctx.emit_to_session

    Note over User,Desktop: Phase 2: Mid-Turn /btw Side Question & Steer
    User->>Desktop: Ask "/btw Why is auth.py failing?"
    Desktop->>PluginAPI: plugin.btw-studio.ask / POST /ask
    PluginAPI->>PluginAPI: Scrub digest via redact_sensitive_text(force=True)
    PluginAPI->>FastLLM: complete (btw_studio_fast; complete_structured for presets)
    FastLLM-->>PluginAPI: Diagnostic Markdown card (ΔMainTranscript = 0 bytes)
    PluginAPI-->>Desktop: Render GFM card + Verification Badges

    Note over User,Desktop: Phase 3: Live Subagent Steer & 3-Call Δτ Probe
    User->>Desktop: Steer Subagent or Launch C5 Fix
    Desktop->>PluginAPI: POST /subagents/launch or subagent.steer
    PluginAPI->>Lifecycle: launch(SubagentLaunchRequest) / steer(handle, text)
    Lifecycle->>Subagent: Queue directive on active child turn
    PluginAPI->>PluginAPI: Snapshot e⁰ & open 3-call Δτ probe (conversation_id-stable)

    Note over User,Desktop: Phase 4: Compaction Continuity, Δτ Verdict & Curator Sync
    Subagent->>StateDB: Commit next 3 tool calls (exit 0, AST valid)
    PluginAPI->>PluginAPI: post_compaction preserves lineage; Δτ probe -> HELPED -> BTW.md
    PluginAPI->>PluginAPI: post_curator_run reads logs/curator/*/run.json -> reconcile skills
```

---

## 6. Security, Redaction & Catalog Compliance

BTW Studio enforces all **18 Nous Research Catalog Rules**:
- **Zero Core Overrides (Rule 9)**: Uses only public `PluginContext` registration APIs and allowlisted public modules (`tools.registry`, `tools.url_safety`, `hermes_cli.config`, `hermes_constants`, `gateway.session_context`, `agent.redact`, `agent.secret_scope`, `agent.credential_pool`, `agent.plugin_llm`, `agent.transcription_provider`, `agent.image_gen_provider`, `agent.video_gen_provider`, `agent.subagent_lifecycle`).
- **Egress Redaction, Voice/Audio Disclosure & Credential Safety (Rules 11 & 13)**: Never reads `.env*`, `auth.json`, `.ssh`, keychains, or external CLI tokens; scrubs all LLM egress with `agent.redact.redact_sensitive_text(force=True)` plus 36 local redaction patterns (`<5ms` linear-time ReDoS budget). When user-triggered or opted in, voice STT/TTS uses `agent.transcription_provider` / `text_to_speech`, `window.SpeechRecognition`, local `faster-whisper` (`stt.provider="local"`), optional `edge_tts` (`provider="edge"`), or direct HTTPS audio endpoints (`https://openai-audio-gateway.nousresearch.com/v1`, `https://api.groq.com/openai/v1`, `https://api.openai.com/v1`, or `stt.openai.base_url`), reading `TOOL_GATEWAY_USER_TOKEN`, `GROQ_API_KEY`, `VOICE_TOOLS_OPENAI_KEY`, and `OPENAI_API_KEY` solely through `agent.secret_scope` / `agent.credential_pool`.
- **SSRF & Redirect Hardening**: Optional `fast_base_url` and audio endpoints enforce NFKC normalization, `https://` (or explicit loopback `127.0.0.1` / `localhost` / `::1`), `tools.url_safety.is_safe_url`, DNS resolution checks across 41 SSRF vectors, and disable HTTP `30x` redirects (`follow_redirects=False`).
- **SDK-Only Desktop Surface (Rule 8)**: Single-file ES module (`desktop/plugin.js < 1024 KB`) importing only `@hermes/plugin-sdk` and `react`, enforcing `previewOnly: true` on Markdown and strict MIME allowlists on inline media.
- **Strict `data_dir` Confinement & Opt-In Gates (Rules 12 & 13)**: All state writes stay inside `ctx.state.data_dir` by default (opt-in generated media is relocated from `$HERMES_HOME/cache/generated/` into `ctx.state.data_dir/generated/`); `allow_web_search`, `allow_media_tools`, `wake_word_enabled`, `live_voice_enabled`, `tts_auto_speak`, `memory_md_sync_mode` (respecting `memory.write_approval` and `\n§\n` delimiters), `scan_sibling_profiles`, and `gamify_enabled` default to `false` / `"off"`.

---

## 7. Verification Matrix

| Component | Test / Validator | Verified Contract | Status |
|---|---|---|---|
| **Manifest & Capabilities** | `hermes plugins validate` | 16/16 checks, 12 hooks matched, `host_ready: true`, 0 warnings | **PASS** |
| **Static Security & Payloads** | `scan_plugin` + `scan_plugin_payloads.py` | `verdict: safe` (`0 findings`), zero binaries/bytecode | **PASS** |
| **Catalog Entry Template** | `scripts/validate_plugin_catalog.py` | Schema, URLs, SemVer floor `>=0.23.1`, 12 hooks (`0 errors, 0 warnings`) | **PASS** |
| **Read-Only SQLite & Lineage** | `pytest -B tests` | SHA-256 `state.db` invariance, `conversation_id` across compaction | **PASS** |
| **Subagent Lifecycle & CLI** | `test_subagents_integration.py` | In-session `SubagentLaunchRequest`, read-only SQLite CLI inspection | **PASS** |
| **Harness² `Δτ` & Curator Sync** | `test_harness_rsi.py` | All 5 `Δτ` verdicts (`confounded -> NO_ENTRY`), `post_curator_run` sync | **PASS** |
