# BTW Studio (`btw-studio`)

![BTW Studio — Ask while it works. Steer before it fails. Keep what helped.](docs/media/banner.png)

**Side-channel `/btw` workspace, `$0` read-only SQLite session radar, and `Δτ` steer playbook for Hermes Agent (`>=0.23.1`).** Ask `/btw` while a Hermes turn runs, read the answer as GitHub-Flavored Markdown without mutating the transcript, inspect a zero-token Session Radar from read-only `state.db`, steer `conversation_id`-tracked main turns or child subagents mid-flight — and let BTW **measure whether each steer helped** (3-call `Δτ` behavioral contrast), keeping only verified rules in `BTW.md`, `btw-skills/`, and opt-in `MEMORY.md`.

Hermes is the messenger. `/btw` is the side message: it reaches the running agent's context without interrupting the turn or invalidating the prompt cache (`ΔMainTranscript = 0 bytes`).

![Live Side-Channel Telemetry & Harness² Recursive Loop](docs/media/btw-live-flow.svg)

---

## ⚡ Quick Navigation

1. [What is New in v5.8.0 — Hermes v0.23.1 Native Integration, Playbook Sync & Reading Lens](#-what-is-new-in-v580--hermes-v0231-native-integration-playbook-sync--reading-lens)
2. [Why It Exists — Upstream Problem Matrix](#-why-it-exists--upstream-problem-matrix)
3. [01 · Composer-First `/btw` Studio, Voice STT & Native Media Deck](#-01--composer-first-btw-studio-voice-stt--native-media-deck)
4. [02 · `$0` Session Radar, AST Diff Bento & Cross-Session Conflict Guard](#-02--0-session-radar-ast-diff-bento--cross-session-conflict-guard)
5. [03 · Subagents Fleet Constellation & Bounded 32/24/16 KB Dossier](#-03--subagents-fleet-constellation--bounded-322416-kb-dossier)
6. [04 · Harness² × Hermes Integration, 1K-Step Capacity Slider & `MEMORY.md` Sync](#-04--harness--hermes-integration-1k-step-capacity-slider--memorymd-sync)
7. [05 · Full-Surface Settings, 6-Axis Reading Lens, Companion & Playbook Milestones](#-05--full-surface-settings-6-axis-reading-lens-companion--playbook-milestones)
8. [06 · Side-Channel Architecture & Data Flow Topology](#-06--side-channel-architecture--data-flow-topology)
9. [CLI & Gateway Commands](#-cli--gateway-commands)
10. [Installation & Configuration Schema](#-installation--configuration-schema)
11. [Hermes Surfaces, Rule 13 Disclosure & Rule 16 Differentiation](#-hermes-surfaces-rule-13-disclosure--rule-16-differentiation)

---

## 🛰️ What is New in v5.8.0 — Hermes v0.23.1 Native Integration, Playbook Sync & Reading Lens

Google Research's [*Harness²: Recursive Agent Harnessing for an Open World*](https://arxiv.org/abs/2610.14224) (Xu et al., 2026) demonstrates that the harness **around** a frozen model — prompts, guardrails, memory, skills, scripts, subagents, hooks — can improve itself through two coupled loops without ground-truth labels: a task-level *Propose → Probe → Compose* step driven by behavioral contrast, and a harnessing-level library that retains only evidence-backed lessons.

BTW Studio v5.8.0 integrates that loop natively with Hermes `v0.23.1`, running **beside** a live turn and never inside it:

| Subsystem | Engineering Implementation in BTW Studio v5.8.0 | Model Token Cost |
| :--- | :--- | :---: |
| **Hermes `v0.23.1` Lifecycle & Lineage (`conversation_id`)** | Binds `/btw` cards, Session Radar, and `Δτ` probes to immutable `conversation_id` across `/compress` compactions (`post_compaction`), hydrates state pre-turn on `on_session_open`, exposes `BTW_CONVERSATION_ID` via `ctx.register_session_env` (`O(1)`), and reconciles skills read-only on `post_curator_run` (`logs/curator/*/run.json` and `skills/.archive`). | `$0` |
| **Scrubbed LLM Egress & Session RPCs** | Calls `ctx.llm.complete` (plus optional `ctx.llm.complete_structured` in `recommend_presets`) scrubbed via `agent.redact.redact_sensitive_text(force=True)`, registers 12 gateway RPCs `plugin.btw-studio.{radar,ask,media_read,entry_status,curator_status,voice_wake,stt_transcribe,tts_speak,subagent_launch,subagent_control,refine_prompt,playbook_save}` via `ctx.register_rpc`, and streams session-scoped updates via `ctx.emit_to_session`. | `$0` idle / 1 side-call |
| **Dual-Scope Diagnosis (`INV` / `DOM`) & Cheapest Lever (`C3..C8`)** | Every Loop-Guard finding and diagnostic `/btw` card separates `INV` (task-invariant agent workflow) from `DOM` (workspace-specific facts) and tags the lowest-overhead durable fix (`C6 Skill`, `C7 Script`, `C5 Subagent`, `C8 Hook/Preset`, `C3 Memory`) with Verification Badges (`D0`/`D1`/`D2`). | `$0` |
| **Multi-Axis Behavioral Contrast ($\Delta\tau$)** | When you dispatch a `session.steer` / `subagent.steer` (or when the agent autonomously recovers from an error streak), BTW snapshots $e^0$ and evaluates the next 3 tool calls in `state.db?mode=ro`: `helped` · `self_recovered` · `hurt` · `no_observed_effect` · `confounded`. | `$0` |
| **Evidence-Only `BTW.md` Playbook & `MEMORY.md` Sync** | Only `helped` or `self_recovered` contrasts enter `BTW.md`. Overlapping steers are marked `confounded` (`NO_ENTRY`). Proven `INV` rules can sync an opt-in percentage (`off` by default, or `auto` / `5%–25%`, respecting `memory.write_approval` and `\n§\n` delimiters) of `MEMORY.md` or mold into `SKILL.md` files (`len(description) <= 60`). | `$0` |
| **6-Axis Independent Reading Lens (`[0,1]^6`)** | Replaces zero-sum barycentric triangles ($\sum w_i = 1$) with an independent 6-Axis Reading Lens (`Visual`, `Monothread`, `Epistemic`, `Deep`, `Concise`, `Structure`) rendered across `6D Hexagon`, `5D Polygon`, and `3D Triad` projections so neurodivergent profiles (`🧩 Systematic ASD`, `🧬 AuDHD 3e`) retain high `Visual` and `Epistemic` weights simultaneously. | `$0` |
| **Cross-Session Mesh & Write-Conflict Radar** | Reads `session_turn_leases`, `async_delegations`, and recent `messages` across active sessions (`state.db?mode=ro`) to detect sibling sessions editing the same workspace or overlapping files before merge conflicts occur. | `$0` (optional LLM audit) |
| **Opt-In Playbook Milestones (`gamify_enabled: false`)** | Disabled by default for zero visual noise. When enabled in Settings, tracks 12 Playbook Milestones across 5 progression tiers for `BTW.md` rules, `/btw` cards, `Δτ` steers, voice dictation, subagents, and generated media. | `$0` |

---

## 🧭 Why It Exists — Upstream Problem Matrix

Stock `/btw` is useful for quick checks but has three structural limitations. BTW Studio resolves each one using only public `@hermes/plugin-sdk` and Python plugin hooks:

| Upstream Issue | Stock `/btw` Behavior | BTW Studio v5.8.0 Resolution |
| :--- | :--- | :--- |
| [#123202](https://github.com/NousResearch/hermes-agent/issues/123202) — missing mid-turn context | The stock fork trims the in-progress turn, so a side question asked 30 tool calls deep cannot see what is currently running. | Twelve read-only observer hooks plus a read-only `state.db?mode=ro` tail supply the in-flight tool, recent commands with exit codes, touched files with AST status, active todos, isolated child subagents (`subagent_start`/`subagent_stop`), and 10 Loop-Guard detectors across `conversation_id` compactions. Complementary to open core PRs [#130146](https://github.com/NousResearch/hermes-agent/pull/130146), [#119747](https://github.com/NousResearch/hermes-agent/pull/119747), [#125968](https://github.com/NousResearch/hermes-agent/pull/125968), and [#121178](https://github.com/NousResearch/hermes-agent/pull/121178) (operating 100% inside `@hermes/plugin-sdk` without touching `electron/main.ts` or `preload.ts`). |
| [#149380](https://github.com/NousResearch/hermes-agent/issues/149380) — answer rows shift in transcript | Each `/btw` appends ephemeral rows to the conversation that shift after refresh or context compaction. | `/btw` is intercepted in `COMPOSER_AREAS.middleware` (`order: -50`) and rendered in `COMPOSER_AREAS.top`, the statusbar popover, the floating `PANES_AREA` window, or the studio dialog. The main transcript (`messages` table) is never modified (`ΔMainTranscript = 0 bytes`). |
| [#129391](https://github.com/NousResearch/hermes-agent/issues/129391) — dropped answers under RPC race | Desktop answers can disappear when gateway RPC and renderer state race. | Answers are synthesized via `ctx.llm.complete` (with fallback to `prompt.btw`), pushed via `ctx.emit_to_session`, and persisted atomically under cross-process locks in `btw_history.json`. |

> **Relationship to Core `ctx.side_question` ([#143791](https://github.com/NousResearch/hermes-agent/pull/143791)):** Hermes Core's `ctx.side_question` issues a single shared 60-second lease **after** a user turn finishes (`post_llm_call`) for automated text-only plugin follow-ups, is disabled on delegated subagents (`_delegate_depth > 0`), and deep-copies `messages` and `tools` at the end of every turn when `llm.side_question` is granted. BTW Studio solves the interactive side-channel problem instead: answering user `/btw` questions **mid-turn while tools are executing**, across running or completed **child subagents**, and with **multimodal attachments** via `ctx.llm` (`btw_studio_fast`) and read-only `state.db?mode=ro`, without requesting `llm.side_question` or adding per-turn snapshot overhead.

---

## 💬 01 · Composer-First `/btw` Studio, Voice STT & Native Media Deck

![01 · Composer-First /btw Studio & Multimodal Side-Channel](docs/media/popover-ask.png)

### Multimodal `/btw` Without Transcript Clutter
- **Unified Composer Architecture (`.btw-ask-box`)**: The `/btw` prompt input sits at the top of the studio with a single unified border, dynamic auto-resize (`52px` to `220px`), and zero phantom empty-state heroes when a session has not started yet (`WaitingToStartSessionHero` renders native SDK `<Loader />` and `<Blobatar />` standby stages).
- **Universal Multimodal Attachment Pipeline**: Native slash commands reject attachments at the gateway. BTW Studio intercepts `/btw` in the composer, absorbs staged `draft.attachments`, and provides an integrated `+` attachment menu:
  - **🖼️ Images & Screenshots**: Paste (`Ctrl+V`), drag-and-drop (with spotlight background blur), or pick from disk; routes directly to multimodal vision models.
  - **📄 Documents & Databases (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.ipynb`, `.sqlite`, `.zip`)**: Read via `FileReader.readAsDataURL` in Electron and extracted via pure-Python stdlib/optional local parsers (`pymupdf`/`pypdf` when present). PDFs undergo dual inspection: structured text extraction plus PNG rendering of the first 2 pages for diagram/chart vision.
  - **🎵 Audio & Opt-In Voice Dictation STT (`.mp3`, `.wav`, WebM/Opus)**: Captures user-triggered microphone audio via `MediaRecorder` (`<BtwVoiceWaveform />` 9-bar live acoustic strip) and transcribes via `agent.transcription_provider` / `ctx.transcribe_audio` (with Web Speech, Nous/Groq/OpenAI Whisper via `agent.secret_scope`, or local `faster-whisper` when `stt.provider == "local"`, all SSRF-validated with HTTP `30x` redirects disabled), applying anti-hallucination filtering and `[STT: Transcribed]` card badges.
  - **📋 Pasted Content Cards**: Automatically collapses pasted logs or code (`≥ 4 lines` or `> 160 chars`) into a compact `📋 Pasted · N lines` chip with an inline drawer to inspect or unpack back into the editor.
  - **💬 Cross-Session Mentions (`@Session` / `@session:<id>`)**: Reference any other session at `$0` from `state.db?mode=ro`.
- **Native Media Generation (`image_generate` & `video_generate`) & Lightbox**:
  - Synchronizes with configured Hermes media providers (`config.yaml` → `image_gen` / `video_gen`, such as OpenAI, FAL, Krea, or any registered Hermes provider) via opt-in `ctx.dispatch_tool` (`allow_media_tools: false` by default), relocating saved outputs into `ctx.state.data_dir/generated/`.
  - Renders generated images and MP4 videos inside `BtwMediaDeck` cards with 1-click **Lightbox Zoom**, **Copy Image to System Clipboard**, and **Download**.
- **Selectable Prose & Attached Action Dock**:
  - Full mouse text selection inside both the composer banner and `/btw` cards (`btw-selectable-prose`) with a DOM-confined selection toolbar (`Copy Selection`, `Ask in /btw`).
  - Clicking `🎯 Steer Main Agent` or `🤖 Spawn Subagent` on any card attaches it to the **Attached Action Dock** above the composer, exposing `⚡ Optimize & Synthesize` (fusing your draft, the card's diagnosis, and live `{{active_file}}` / `{{last_error}}` tokens) alongside the **3-Tier `ComposerModelPicker`** (★ Favorites, 🔥 Most Used & Subagent Presets, ✅ Composer Models).

---

## 🛰️ 02 · `$0` Session Radar, AST Diff Bento & Cross-Session Conflict Guard

![02 · $0 Read-Only Session Radar, AST Diff Bento & Cross-Session Conflict Guard](docs/media/session-radar.png)

- **4 Visual Bento Tiles with SVG Ring Gauges (`<SvgRingGauge />`)**:
  1. **Context & Compaction**: Token fill percentage against the model window (`420k / 1M`) and compaction proximity alert (`≥ 75%`).
  2. **L0 Cache & USD Savings**: Prompt-cache hit rate (`96%`), measured dollars saved (`$4.82 saved`), and total API calls.
  3. **Throughput & Execution Health**: Total tool invocations, live `tok/s`, and active vs. auto-recovered error counts.
  4. **Subagent Constellation**: Overlapping animated `<Blobatar />` avatars with 1-click jump to the Subagents Fleet Hub.
- **10-Detector Deterministic Loop Guard (`$0`)**:
  - Flags `error_streak`, `command_loop`, `edit_churn`, `claimed_without_tool`, `unverified_edit`, `subagent_silent_failure`, `research_stall`, `cache_bust_warning`, `test_weakening`, and `silent_model_fallback` — each mapped to its `INV`/`DOM` scope, cheapest lever (`C3..C8`), Verification Badges (`D0`), and a 1-line `.btw-sleek-alert-strip` with `⚡ Steer Fix Now`.
- **Cross-Session Mesh & Write-Conflict Radar (`session_mesh_guard`)**:
  - Scans active `session_turn_leases`, `async_delegations`, and recent tool calls across parallel sessions in `state.db?mode=ro`.
  - Computes file-touch and workspace overlap scores deterministically (with optional 1-click LLM cross-session audit) so running multiple sessions on the same repository (with or without git) alerts you before concurrent file writes collide.
- **Contemporary Touched Files Bento Grid (`<ContemporaryFilesGrid />`)**:
  - Displays filename-first cards with extension badges (`PY`, `JS`, `MD`), proportional edit-churn bars, and read-only `ast.parse` / `json.loads` syntax Verification Badges (`ψ ✓ AST OK` or `ψ ✗ L42`).
  - Expanding a file diff applies `grid-column: 1 / -1` (100% full width) with `pre-wrap` line breaking and zero horizontal scrollbars.

---

## 🤖 03 · Subagents Fleet Constellation & Bounded 32/24/16 KB Dossier

![03 · Subagents Fleet Constellation & Bounded 32/24/16 KB Dossier](docs/media/subagents-fleet.png)

- **Public `ctx.subagent_lifecycle` Integration**:
  - Spawn delegated child subagents directly from the studio header or Loop-Guard remedies using your configured model routes (such as `flash`, `sonnet`, `opus`, or `fast`), retaining native handle objects for mid-flight `subagent.steer` and cooperative `subagent.interrupt`.
- **Spatial Status Constellation (Canonical Runtime & `async_delegations` Deduplication)**:
  - Deduplicates active and persisted subagents by canonical runtime key (`subagent_id` / `session_id`) reconciled against `async_delegations`, grouping them into spatial zones (`Running`, `Done`, `Failed`) with animated `<Blobatar animate="always" />` status rings.
- **Bounded 32/24/16 KB 3-Accordion Specialist Dossier**:
  - Clicking any specialist opens its full inspection dossier (guarded against null selection states and closeable via `✕ Close Inspector`):
    1. `▸ ✓ OUTPUT (up to 32 KB)`: Assistant report rendered in GitHub-Flavored Markdown (`MessageTextContent`) with 1-click copy.
    2. `▸ 🧠 CoT & Tools (up to 24 KB)`: Preserves the initial hypothesis (`[goal, first_thought] + tail`) across `reasoning`, `reasoning_content`, and `reasoning_details` columns alongside the step-by-step tool timeline.
    3. `▸ 🎯 Mission / Full Prompt (up to 16 KB)`: Delegated prompt and context contract.
- **Resilient Post-Completion `/btw` Chat & Relaunch**:
  - Ask side questions (`/btw`) to any specialist even after its process has finished (`DONE` / `FAILED`): BTW Studio packages the specialist's dossier (`full_goal`, `full_assistant_text`, `full_reasoning_text`, `touched_files`) and routes via `parentRuntimeId` fallback, or lets you click **`🚀 Continue / Relaunch`** to spawn a successor child agent inheriting prior findings.

---

<a id="-04--harness--hermes-integration-1k-step-capacity-slider--memorymd-sync"></a>

## 🧬 04 · Harness² × Hermes Integration, 1K-Step Capacity Slider & `MEMORY.md` Sync

![04 · Harness² × Hermes Integration, 1K-Step Capacity Slider & MEMORY.md Sync](docs/media/learn-rsi.png)

- **Multi-Axis Behavioral Contrast ($\Delta\tau$ v2)**:

$$\Delta\tau = w_a \cdot \Delta\text{Align} + w_e \cdot \Delta\text{Tokens} + w_c \cdot \Delta\text{Conv} - w_l \cdot \Delta\text{Lat}$$

  - Evaluates the 3 tool calls following a steer against the pre-steer baseline $e^0$ across `conversation_id` compactions. If an agent overcomes an `error_streak >= 2` autonomously before a human steers, BTW harvests a `self_recovered` lesson at `$0` and intercepts obsolete manual steers so they do not disrupt the recovered turn.
- **3 Playbook Integration Modes (Strict L0 Cache Preservation)**:
  - `🛡️ Isolated`: `BTW.md` and `btw-skills` stay strictly inside `ctx.state.data_dir`. Zero bytes added to the main agent's system prompt.
  - `⚡ Lite` *(Default)*: Injects a compact domain index ($\le 1,200$ chars) **once at session initialization** (`position="after_memory"`), preserving $>95\%$ L0 prompt-cache hit rates while enriching child subagents on spawn.
  - `🧠 Full`: Injects the verified `BTW.md` playbook + proven walkthroughs at session start up to `btw_md_max_chars` and auto-molds mature rules ($C_6$ with `uses >= 2`) into `SKILL.md` files (`len(description) <= 60`, mandatory `When <condition>, load the <slug> skill.` first line), reconciled read-only with `$HERMES_HOME/logs/curator/*/run.json` and `$HERMES_HOME/skills/.archive` on `post_curator_run`.
- **1K-Step Capacity Slider (`1K` to `16K`)**:
  - Adjust `btw_md_max_chars` in exact `1,000`-character increments (`1K`, `2K`, ..., `16K`) with progressive budget indicators using native Hermes SDK icons and tokens.
- **Automatic Playbook Refinement (`Off | Lite | Medium | Full`) & `MEMORY.md` Sync**:
  - Run `refine_btw_playbook` automatically via lifecycle hooks or a configurable interval (`auto_learn_cron_minutes`), deduplicating semantically equivalent rules, summing `uses`, consolidating sequential fixes into *Proven Walkthroughs*, and saving a rollback backup (`btw_rsi.prev.json`).
  - **Hermes `MEMORY.md` Sync (`memory_md_sync_mode: "off"` by Default)**: Opt-in allocation of `auto` (dynamic free-space calculation) or a fixed `5%`, `10%`, `15%`, `20%`, or `25%` of Hermes's `MEMORY.md` budget to a concise synthesis of top `INV` rules, respecting `memory.write_approval` and `\n§\n` entry delimiters.

---

## 🧠 05 · Full-Surface Settings, 6-Axis Reading Lens, Companion & Playbook Milestones

![05 · Full-Surface Settings, 6-Axis Reading Lens, Affective Companion & Playbook Milestones](docs/media/neuro-cognitive-lens.png)

### 100% Full-Surface Bento Settings (Zero Split-Screen)
- Clicking `⚙ Settings` transitions the studio viewport into a **100% full-surface Bento configuration deck** (no split-screen overlap with underlying tabs), organized by instant category pills (`✦ All`, `🧠 Lens & Mascot`, `🎨 Themes & UI`, `⚡ Workflow & LLM`, `🛡️ Radar & RSI`, `📋 Presets`) and a `← Back` action.

### 6-Axis Independent Reading Lens (`[0,1]^6` — `6D Hexagon`, `5D Polygon` & `3D Triad`)
- **Why Barycentric Triangles Fail Neurodivergent Users**: A 2-Simplex ($\Delta^2$) forces $w_{\text{Visual}} + w_{\text{Efficient}} + w_{\text{Deep}} = 1.0$, imposing a spurious negative correlation $\bar{r} = -0.50$ (Pearson, 1897; Aitchison, 1982). Under that constraint, configuring a profile as simultaneously high-efficiency and deep-reasoning crushes the `Visual` axis down to `12%` — contradicting clinical neuroscience on *Enhanced Perceptual Functioning* (Mottron et al., 2006) and *Spatial-Pattern Thinking* in ASD and AuDHD 2e/3e.
- **The `[0,1]^6` Independent Reading Lens**: All 6 cognitive axes (`Visual`, `Monothread`, `Epistemic`, `Deep`, `Concise`, `Structure`) operate independently on $[0.05, 1.00]$ with selectable `6D Hexagon`, `5D Polygon`, and `3D Triad` projections, allowing presets like **`🧬 AuDHD 3e`** and **`🧩 Systematic ASD`** to combine **`Visual: 80–86%`**, **`Structure: 90–98%`**, **`Epistemic: 88–98%`**, **`Deep: 78–88%`**, **`Concise: 70–80%`**, and **`Monothread: 82–96%`** simultaneously.
- **9 High-Contrast WCAG AA/AAA Themes**: *Orbyx* (`orbyx`), *Cryo Datapad* (`cryo`), *Mica Glass* (`glass`), *Copper Forge* (`ai`), *Host Native* (`host`), *Terminal* (`terminal`), *Warm Paper* (`paper`, with explicit `:root.dark [data-btw-theme="paper"]` contrast isolation), *Minimal* (`minimal`), and *Nordic Boreal* (`nordic`).

### Companion Avatar, 360° Aerial Flight & Compression Radar
- **Affective Status Stage (`MascotCompanionStage`)**: Built on Russell's **Valence–Arousal Circumplex**, the procedural SVG companion renders gyroscopic rings, chassis physics, and saccadic eye movements across 9 affective states driven by live turn health (`idle`, `thinking`, `tool_flow`, `struggle`, `compression_radar`, `eureka`, `subagent_sync`, `gamify_tier`, `headpat`), paired with non-blocking `ctx.pet.say` narration ($\le 114$ chars for stock Hermes Desktop compatibility).
- **Compression Radar (`compression_radar`)**: When context token fill reaches $\ge 75\%$ of the model window (approaching context compaction), the companion automatically shifts into **`📡 COMPRESS RADAR · SCAN`** mode (`#00e5ff` rotating radar sweep HUD), alerting you in peripheral vision to pin key insights or steer before compaction occurs.
- **Opt-In 360° Aerial Viewport Flight (`BtwAerialMascotFlight`)**: Toggling **`360° Flight: ON`** (`$petAerialFlight`) releases the companion into non-intrusive free flight along the left/right viewport corridors (`pointer-events: none` on the overlay layer, clickable orb with live `$aerialBubble` telemetry callouts and perch maneuvers above the composer banner during active turns).

### 🏆 Opt-In Playbook Milestones (`gamify_enabled: false` by Default)
- **Zero Noise by Default**: `gamify_enabled` ships as `false` so minimalist setups see zero badges or progress bars.
- **Deterministic Milestone Tracking When Enabled**: Toggling **`🏆 Playbook Milestones`** ON in Settings activates a `$0` deterministic progression counter across **5 Insignia Tiers** (*Recon Cyan*, *Vanguard Emerald*, *Kinetic Amber*, *Apex Crimson*, *Orbital Violet*) and **12 Playbook Milestones**:

| Milestone ID | Title | Criterion (Measured at `$0` from Local Stores) | Tier |
| :--- | :--- | :--- | :---: |
| `first_btw` | **🛰️ First Transmission** | Ask your first `/btw` side-question with zero transcript mutation (`cards >= 1`). | I · Recon Cyan |
| `btw_cadence_10` | **📡 Silent Channel Operator** | Accumulate `10+` `/btw` cards across sessions (`cards >= 10`). | I · Recon Cyan |
| `btw_archivist_25` | **📚 Epistemic Archivist** | Reach `25+` `/btw` cards and pin at least `3` insights (`cards >= 25`, `pinned >= 3`). | II · Vanguard Emerald |
| `voice_bridge` | **🎙️ Voice of the Bridge** | Dictate a `/btw` query via STT voice waveform (`voice_cards >= 1`). | II · Vanguard Emerald |
| `first_lesson` | **🧬 First Empirical Rule** | Retain your first $\Delta\tau$-verified lesson in `BTW.md` (`lessons >= 1`). | II · Vanguard Emerald |
| `playbook_2k` | **📐 Playbook Architect** | Grow `BTW.md` past `2,000` characters of verified `INV`/`DOM` rules (`btw_md_chars >= 2000`). | III · Kinetic Amber |
| `playbook_curator` | **🏛️ Playbook Curator** | Maintain `10+` verified lessons or mold a proven lesson into a `SKILL.md` (`lessons >= 10` or `skills >= 1`). | IV · Apex Crimson |
| `first_helped_steer` | **🎯 Course Correction** | Land a `session.steer` or `subagent.steer` with a `helped` $\Delta\tau$ verdict (`helped >= 1`). | III · Kinetic Amber |
| `loop_breaker_5` | **🛡️ Loop Breaker** | Resolve `5+` anomalies with positive $\Delta\tau$ contrast (`helped + self_recovered >= 5`). | IV · Apex Crimson |
| `visual_cartographer` | **🎨 Visual Cartographer** | Generate your first diagram/image in `/btw` via `image_generate` (`images >= 1`). | IV · Apex Crimson |
| `telemetry_director` | **🎬 Telemetry Matrix Director** | Render your first motion video in `/btw` via `video_generate` (`videos >= 1`). | V · Orbital Violet |
| `fleet_commander` | **🤖 Fleet Commander** | Launch or steer a delegated child subagent from the Fleet Hub (`subagents >= 1`). | V · Orbital Violet |

---

## 📐 06 · Side-Channel Architecture & Data Flow Topology

![06 · Side-Channel Architecture & Harness² Recursive Learning Topology](docs/media/harness2-rsi.png)

Read the full technical specification in [docs/architecture/side-channel-data-flow.md](docs/architecture/side-channel-data-flow.md).

```
┌──────────────────────────────┐     RFC 3986 ?mode=ro ($0)     ┌─────────────────────────────────────┐
│   HERMES MAIN AGENT TURN     │ ─────────────────────────────▶ │     BTW STUDIO $0 ENGINE (D0)       │
│ • Frozen Prefix (Cache >95%) │                                │ • 12 Observer Hooks (return None)   │
│ • Immutable conversation_id  │     session.steer / subagent   │ • 10-Detector Loop Guard + ψ-Verify │
│ • SQLite state.db (WAL)      │ ◀───────────────────────────── │ • Cross-Session Conflict Radar      │
│ • SKILL.md & MEMORY.md       │ ◀═══════ Δτ > 0 Rules ════════ │ • Multi-Axis Δτ + Curator Sync      │
└──────────────────────────────┘   (BTW.md / SKILL / MEMORY%)   └─────────────────────────────────────┘
```

---

## 💻 CLI & Gateway Commands

`hermes btw-studio` provides **14 subcommands** (`radar`, `ask`, `steer`, `history`, `presets`, `guard`, `rsi`, `search`, `packs`, `subagents`, `spawn`, `compare`, `demo`, `ping`) with `--session/-s`, `--mode/-m`, `--open-probe`, and machine-readable `--json` output:

```bash
hermes btw-studio radar                          # Markdown Session Radar of the latest session ($0)
hermes btw-studio ask "Did {{touched_files}} pass after {{last_command}}?"
hermes btw-studio steer "Run pytest -q before patching" --open-probe
hermes btw-studio history                        # Stored /btw Q&A history for the active/latest session ($0)
hermes btw-studio presets                        # List custom and active /btw presets ($0)
hermes btw-studio guard                          # 10-detector loop guard (exit 3 when a high-severity finding is open)
hermes btw-studio rsi                            # Steer verdicts, help rate, BTW.md rule library, prune suggestions
hermes btw-studio search "pytest"                # Search stored /btw cards ($0)
hermes btw-studio packs install coding-tdd       # List or install domain preset packs
hermes btw-studio subagents                      # Read-only SQLite delegated child subagent tree & CoT summary ($0)
hermes btw-studio subagents feed <id>            # Read-only CoT & tool timeline for a child subagent ($0)
hermes btw-studio spawn "Run isolated smoke tests"
hermes btw-studio compare <a> <b>                # Side-by-side session telemetry diff ($0)
hermes btw-studio demo                           # 1-click interactive Harness² showcase walkthrough ($0, read-only)
hermes btw-studio ping                           # Validate fast_base_url SSRF policy & TCP reachability
```

> **Standalone CLI vs. Live In-Session Control**: Invoking `hermes btw-studio subagents` from an external terminal shell inspects the persisted SQLite subagent lineage (`state.db?mode=ro` and `async_delegations`) read-only; it does not mutate in-memory subagent handles owned by another running process. Live subagent `launch`, mid-flight `steer`, and cooperative `interrupt` operate inside an active session (`/btw-studio subagents launch|steer|stop ...`) or via Gateway/Desktop RPC (`subagent.steer`, `subagent.interrupt`, `ctx.subagent_lifecycle`).

In any active CLI session or messaging gateway chat (Telegram, Discord, Slack, WhatsApp):
`/btw-studio`, `/btw-studio radar`, `/btw-studio guard`, `/btw-studio rsi`, `/btw-studio subagents`, `/btw-studio subagents launch <goal>`, `/btw-studio subagents steer <id> <text>`, `/btw-studio subagents stop <id>`, `/btw-studio subagents feed <id>`, `/btw-studio spawn <goal>`, `/btw-studio ping [url]`, `/btw-studio demo`, `/btw-studio compare <a> <b>`, `/btw-studio search <text>`, `/btw-studio ask <question>`.

---

## 📦 Installation & Configuration Schema

```bash
hermes plugins install btw-studio
```

Requires Hermes **0.23.1** or newer (`requires_hermes: ">=0.23.1"`). Configured under `plugins.entries.btw-studio.settings` (or live inside the BTW Studio Settings UI), synchronized 1:1 with `plugin.yaml`:

| Key | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `intercept_slash_btw` | `bool` | `true` | Intercept `/btw` in the desktop composer and route to BTW Studio instead of appending rows to the chat transcript. |
| `show_composer_banner` | `bool` | `true` | Show the live `/btw` status and collapsible rich-Markdown card at the top of the composer. |
| `show_statusbar_chip` | `bool` | `true` | Show the `/btw` Studio chip in the desktop status bar. |
| `max_history_per_session` | `int` | `30` | Maximum number of `/btw` Q&A cards retained per session (`5` to `200`). |
| `scan_sibling_profiles` | `bool` | `false` | Also read (read-only) the `state.db` of sibling profiles under the same Hermes root for Session Compare and cross-profile drill-down. Off = active profile only. |
| `verify_touched_files` | `bool` | `true` | `psi-verify`: read-only syntax check (`ast.parse` / `json.loads`, never executed) of up to 8 workspace files edited in the session. |
| `rsi_learning` | `bool` | `true` | Keep evidence-backed lessons when a steer measurably helped (stored in this plugin's data folder). Off = verdicts are shown, nothing is learned. |
| `growth_mode` | `string` | `"lite"` | Playbook integration scope for `BTW.md` and generated skills: `'isolated'` (plugin `data_dir` only, zero prompt bytes), `'lite'` (compact domain index at session start + on-demand skills), or `'full'` (full `BTW.md` section at session start + automatic skill files in `data_dir`). |
| `btw_md_max_chars` | `int` | `4000` | Maximum character budget for the `BTW.md` verified workflow playbook (`1000` to `16000` chars in 1K UI steps; up to `64000` via config). |
| `auto_learn_mode` | `string` | `"lite"` | Automatic `BTW.md` consolidation cadence: `'off'`, `'lite'` (`$0` deterministic deduplication), `'medium'`, or `'full'`. |
| `auto_learn_hook` | `bool` | `true` | Run automatic `BTW.md` consolidation on session lifecycle hooks when `auto_learn_mode` is active. |
| `auto_learn_cron_minutes` | `int` | `0` | Optional periodic consolidation interval in minutes (`0` = disabled, `15`, `30`, or `60`). |
| `memory_md_sync_mode` | `string` | `"off"` | Opt-in bounded block synthesis into Hermes `MEMORY.md`: `'off'` (default, zero writes outside `data_dir`), `'auto'`, `'5'`, `'10'`, `'15'`, `'20'`, or `'25'` (% of `MEMORY.md` budget). |
| `session_mesh_guard` | `bool` | `true` | Detect concurrent sibling sessions touching overlapping files and line ranges in `state.db?mode=ro` (`$0`). |
| `allow_web_search` | `bool` | `false` | Allow user-initiated `/btw` side-questions to dispatch host `web_search`, `web_extract`, and `browser_exec` via `ctx.dispatch_tool` (default `false` = local session context only). |
| `allow_media_tools` | `bool` | `false` | Allow user-initiated `/btw` requests to dispatch host `image_generate`, `vision_analyze`, `video_generate`, `video_analyze`, and `text_to_speech` via `ctx.dispatch_tool` (default `false` = opt-in). |
| `dictation_engine` | `string` | `"auto"` | Voice dictation STT engine for the `/btw` composer: `'auto'` (host `agent.transcription_provider`, Nous audio gateway, Groq/OpenAI Whisper via `agent.secret_scope`, Web Speech API, or local Faster-Whisper when `stt.provider='local'`), `'nous'`, `'webspeech'`, or `'backend'`. |
| `wake_word_enabled` | `bool` | `false` | Enable hands-free wake-word detection (`'by the way'`) to trigger BTW Studio Dictate or Live Talk (default `false` = opt-in). |
| `wake_phrase` | `string` | `"by the way"` | Spoken trigger phrase for BTW Studio wake-word spotter (Sherpa-ONNX BPE keyword spotter + STT matcher). |
| `wake_target_mode` | `string` | `"live"` | Action triggered when wake-word (`'by the way'`) is detected: `'live'` (Live Voice Talk) or `'dictate'` (Voice Dictation STT into `/btw` composer). |
| `live_voice_enabled` | `bool` | `false` | Enable continuous full-duplex / hands-free Live Voice Chat loop in BTW Studio with automatic VAD and TTS playback. |
| `tts_auto_speak` | `bool` | `false` | Automatically speak `/btw` side-channel answers aloud via host-configured Hermes TTS (`text_to_speech`, Nous/OpenAI audio gateway via `agent.secret_scope`, or optional `edge_tts` when `provider='edge'`) when voice or live mode is used. |
| `tts_voice` | `string` | `"coral"` | Default voice for BTW Studio Text-to-Speech synthesis (`alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, `shimmer`, `verse`). |
| `tts_model` | `string` | `"gpt-4o-mini-tts"` | Default TTS model slug for host-configured TTS synthesis (`gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`). |
| `gamify_enabled` | `bool` | `false` | Opt-in Playbook Milestones in Settings and Learn tab (tracks `BTW.md` rules, `/btw` cards, helped steers, subagents, voice dictation, and media; disabled by default). |
| `personality` | `string` | `"balanced"` | Default 6-axis cognitive reading lens profile (`'balanced'`, `'neurodivergent'`, `'technical'`, `'anxious'`, `'kawaii'`, `'harness_rsi'`). |
| `fast_provider` | `string` | `""` | Optional custom provider override for the `btw_studio_fast` auxiliary slot (inherits from host when empty). |
| `fast_model` | `string` | `""` | Optional custom model slug override for the `btw_studio_fast` auxiliary slot. |
| `fast_base_url` | `string` | `""` | Optional custom OpenAI-compatible `base_url` for the fast observer (restricted to `https://` or loopback `http://localhost`, SSRF-validated with HTTP `30x` redirects disabled). |

---

## 🛡️ Hermes Surfaces, Rule 13 Disclosure & Rule 16 Differentiation

### Hermes Surfaces Used
- **Agent (`__init__.py`, `runtime.py`, `harness.py`)**: `ctx.register_hook` (12 observer-only hooks returning `None`: `pre_llm_call`, `post_llm_call`, `pre_tool_call`, `post_tool_call`, `post_api_request`, `on_session_open`, `on_session_start`, `on_session_end`, `post_compaction`, `post_curator_run`, `subagent_start`, `subagent_stop`), `ctx.register_auxiliary_task("btw_studio_fast")` (inheriting `compression` by default, or `inherit_from=None` when a custom provider/model is selected), `ctx.register_auxiliary_task("btw_studio_title", inherit_from="title_generation")`, `ctx.register_session_env` (`BTW_CONVERSATION_ID`, O(1) in-memory), `ctx.register_rpc` (`plugin.btw-studio.{radar,ask,media_read,entry_status,curator_status,voice_wake,stt_transcribe,tts_speak,subagent_launch,subagent_control,refine_prompt,playbook_save}`), `ctx.emit_to_session`, `ctx.register_system_prompt_section("btw-studio.verified-playbook", position="after_memory", max_chars=16000)` (once at session initialization in `lite`/`full` modes; empty in `isolated`), `ctx.register_skill`, `ctx.register_command` (`/btw-studio`), `ctx.register_cli_command` (`hermes btw-studio` with 14 subcommands), `ctx.llm.complete` (primary) & `ctx.llm.complete_structured` (optional preset ranking in `recommend_presets`) with `agent.redact.redact_sensitive_text(force=True)`, `ctx.dispatch_tool` (user-initiated local read-only `/btw` tools + opt-in media/web/voice tools), `ctx.subagent_lifecycle`, `ctx.get_config`, `ctx.state.data_dir`, `agent.secret_scope`, and `agent.transcription_provider`.
- **Dashboard Backend (`dashboard/plugin_api.py`)**: 55 FastAPI dashboard endpoints (57 route handlers) mounted at `/api/plugins/btw-studio/` with heavy I/O and LLM routes bounded by `anyio.CapacityLimiter`: `health`, `settings` (`GET`/`POST`), `settings/ping`, `telemetry`, `telemetry/summary`, `snapshot`, `subagents`, `subagents/feed`, `subagents/launch`, `subagents/control`, `export`, `sessions`, `sessions/badges`, `sessions/mesh`, `sessions/mesh/link`, `compare`, `ask`, `steer/synth`, `synth`, `recap`, `record`, `pin`, `clear`, `presets` (`GET`/`POST`), `presets/delete`, `presets/restore`, `presets/sync`, `presets/resolve`, `presets/recommend`, `packs`, `packs/install`, `packs/export`, `packs/import`, `rsi`, `rsi/probe`, `rsi/experience`, `rsi/experience/delete`, `rsi/lesson`, `rsi/playbook/refine`, `rsi/playbook/rollback`, `rsi/playbook/save`, `rsi/memory`, `rsi/memory/sync`, `rsi/auto-learn`, `rsi/skills`, `rsi/skill/mold`, `tools/execute`, `media/read`, `stt/lease`, `stt/transcribe`, `nous/status`, `tts/speak`, `voice/wake`, `promote`, `search`.
- **Desktop (`desktop/plugin.js`)**: Uses only `@hermes/plugin-sdk` and `react`. Areas: `COMPOSER_AREAS.{middleware, top, actions, microActions, attachments, contextMenu}`, `STATUSBAR_AREAS.right`, `SESSION_ROW_AREAS.trailing`, `KANBAN_CARD_AREAS.badges`, `TRANSCRIPT_DIRECTIVE_AREA`, `PANES_AREA`, `PALETTE_AREA`, `KEYBINDS_AREA`, `registerSettingsPage`, plus 8 Desktop host RPCs (`model.options`, `pet.select`, `prompt.btw`, `session.steer`, `subagent.interrupt`, `subagent.list`, `subagent.steer`, `llm.oneshot`). Zero DOM reach-in (`no querySelector` on app markup, `no MutationObserver`, `no core overrides`).

### Disclosure (Catalog Rule 13)
- **Hooks, Session Env, CLI, FastAPI & RPCs**: Registers 12 observer-only hooks returning `None` (never blocking or auto-approving), O(1) in-memory session env `BTW_CONVERSATION_ID` via `ctx.register_session_env`, 55 FastAPI dashboard endpoints (57 route handlers) under `/api/plugins/btw-studio/`, 14 `hermes btw-studio` CLI subcommands (`radar`, `ask`, `steer`, `history`, `presets`, `guard`, `rsi`, `search`, `packs`, `subagents`, `spawn`, `compare`, `demo`, `ping`), 12 gateway RPCs `plugin.btw-studio.{radar,ask,media_read,entry_status,curator_status,voice_wake,stt_transcribe,tts_speak,subagent_launch,subagent_control,refine_prompt,playbook_save}` via `ctx.register_rpc`, session-scoped events via `ctx.emit_to_session`, and 8 Desktop host RPCs (`model.options`, `pet.select`, `prompt.btw`, `session.steer`, `subagent.interrupt`, `subagent.list`, `subagent.steer`, `llm.oneshot`).
- **Network, Voice/Audio & LLM Egress**: None by default on background telemetry events. User-initiated `/btw` side questions, card titles (`btw_studio_title`), Deep Overview, prompt refinement, steer synthesis, optional playbook condensation, optional cross-session LLM mesh audits, and model-voiced recaps use host-owned `ctx.llm.complete` (plus optional `ctx.llm.complete_structured` in `recommend_presets`), scrubbed via `agent.redact.redact_sensitive_text(force=True)` (sending up to 32 KB of `<untrusted_session_transcript>` digest), or `prompt.btw` / `llm.oneshot`. When user-triggered or opted in, voice dictation STT and TTS use `agent.transcription_provider` / `ctx.dispatch_tool("text_to_speech")`, browser `window.SpeechRecognition`, local `faster-whisper` (`stt.provider="local"`), optional `edge_tts` when `provider="edge"`, or direct HTTPS calls to `https://openai-audio-gateway.nousresearch.com/v1`, `https://api.groq.com/openai/v1`, and `https://api.openai.com/v1` (or `stt.openai.base_url`), reading `TOOL_GATEWAY_USER_TOKEN`, `TOOL_GATEWAY_DOMAIN`, `GROQ_API_KEY`, `VOICE_TOOLS_OPENAI_KEY`, and `OPENAI_API_KEY` via `agent.secret_scope`; all custom and audio HTTP endpoints are SSRF-validated and disable HTTP `30x` redirects (`follow_redirects=False`). Strict opt-in gates (`false`/`"off"` by default): `allow_web_search`, `allow_media_tools`, `wake_word_enabled`, `live_voice_enabled`, `tts_auto_speak`, `memory_md_sync_mode`, `scan_sibling_profiles`, and `gamify_enabled`. If `fast_base_url` is set, only `https://` or loopback (`127.0.0.1` / `localhost` / `::1`) is accepted (blocking cloud metadata, IPv6-mapped/6to4/hex/octal/decimal private IPs across 41 SSRF vectors); clicking *Ping Endpoint* runs a user-initiated 1.5s TCP reachability check (`status: 'validated_offline'` when port is closed). Session Radar, Loop Guard, `ψ-verify`, `Δτ` probes, `auto_learn_mode: "lite"` deduplication, Playbook Milestones, Subagents tree/feed, deterministic Session Mesh, `compression_radar`, `BtwAerialMascotFlight` (opt-in, default `false`), and Compare make **zero** model or network calls (`$0`).
- **Reads Outside Own Data**: Reads `$HERMES_HOME/state.db?mode=ro` (`PRAGMA query_only = ON`, tables `sessions`, `messages`, `session_turn_leases`, `async_delegations`), never written; reads `$HERMES_HOME/logs/curator/*/run.json` and `$HERMES_HOME/skills/{.archive,<slug>}` read-only on `post_curator_run` for skill reconciliation; reads workspace `.git/HEAD` read-only (up to 5 parent directories from `cwd` for active branch display); reads `config.yaml` and `memories/MEMORY.md` read-only for settings and capacity display; reads `$HERMES_HOME/cache/wakewords/` read-only when `wake_word_enabled` is opted in. Sibling profiles' `state.db` are read only when `scan_sibling_profiles` is enabled (default `false`). With `verify_touched_files` on (default `true`), up to 8 `.py`/`.json` files edited in the session workspace (`cwd`-confined, $\le 512$ KB) are parsed with `ast.parse` / `json.loads` — never executed. User-initiated `/btw` local read-only tool dispatches (`read_file`, `search_files`, `session_search`, `manage_connections`) are confined to the active workspace/profile. User-attached `/btw` files and staged composer media are confined to `cwd`, `ctx.state.data_dir/staged-attachments`, `ctx.state.data_dir/generated`, `native-inputs`, `composer-images`, `composer-pastes`, `cache/scratch`, and `cache/generated`, and denylisted against dotfiles, `.env*`, `auth.json`, `config.yaml`, `.ssh`, CLI/vault stores, browser credential stores, and private keys.
- **Stored Data**: Strictly confined by default to `ctx.state.data_dir` (`agent-plugin-btw-studio-c3ca34d3`) under reentrant cross-process file locks (`msvcrt.locking` / `fcntl.flock` sibling `.lock` files): `btw_history.json`, `btw_presets.json`, `btw_rsi.json`, `btw_rsi.prev.json` (rollback backup), `btw_live_pulse.json`, `btw_settings.json`, `btw_session_mesh.json`, `btw_auto_learn_state.json`, `btw_memory_synthesis.md`, `BTW.md` (secret-redacted Markdown playbook, symlink-refused), `btw-skills/<slug>/SKILL.md` and `btw-skills/.archive/<slug>/` (registered via `ctx.register_skill`), `staged-attachments/` (bounded TTL browser `data:` staging), `generated/` (confined media/TTS artifacts; opt-in `save_url_image` / `save_url_video` outputs are relocated from `$HERMES_HOME/cache/generated/` into `ctx.state.data_dir/generated/` and temporary outer copies are unlinked), and `pets/btw-studio-companion/` (custom companion spritesheet and `pet.json`). Temporary audio/KWS files live inside `ctx.state.data_dir` and are unlinked in `finally`. Writing a bounded `<!-- btw-studio:playbook:start/end -->` block to `$HERMES_HOME/memories/MEMORY.md` (`memory_md_sync_mode: "off"` by default, respecting `memory.write_approval` and `\n§\n` entry delimiters) or installing the custom companion into `$HERMES_HOME/pets/btw-studio-companion/` (when clicking *"Use as Hermes Pet"*) is **off by default** and runs only on explicit user opt-in. Side-card Markdown renders with `previewOnly: true` (no remote tracking pixels); Markdown export writes only to a folder granted via `ctx.files.requestFolder`.
- **Approvals (Rule 12)**: Executes no shell commands, subprocesses, background daemons, or self-updating code. User-initiated actions can steer a turn (`session.steer` / `subagent.steer`), launch/stop a delegated subagent via public `ctx.subagent_lifecycle`, dispatch allowlisted host tools via `ctx.dispatch_tool`, or stage a promotion draft in the composer.

### How it differs from listed plugins (Rule 16)

Independent architecture — not a fork or skin of any bundled or listed plugin, and shares zero code with them:

- **vs. Core `/btw` (#123202, #149380, #129391), Open Core PRs (#130146, #119747, #125968, #121178) & Core `ctx.side_question` (#143791)**: Stock `/btw` trims mid-turn context, appends ephemeral rows to the transcript that shift on refresh/compaction, and can drop answers on gateway/renderer races. Core's `ctx.side_question` issues a single shared 60s post-turn lease (`post_llm_call`) for automated text-only plugin follow-ups, returns `None` on delegated subagents (`_delegate_depth > 0`), and deep-copies `messages`/`tools` on every turn when granted; open PR `#121178` modifies `electron/main.ts` and `preload.ts` to open a separate text-only OS window. `btw-studio` does not request `llm.side_question` and modifies zero Electron main-process files: it intercepts `/btw` in `COMPOSER_AREAS.middleware` inside `@hermes/plugin-sdk` to answer interactive user questions **mid-turn while tools execute**, across running or finished **subagents**, and with **multimodal attachments** via `ctx.llm` (`btw_studio_fast`) + `state.db?mode=ro` (`ΔMainTranscript = 0 bytes`, zero `deepcopy`).
- **vs. Selection, Side-Thread, Snippet & `@Session` Plugins (`quote-ask`, `hermes-quote-to-chat`, `hermes-action-bar`, `prompt-snippets`, `study-tree`, `session-ref`, `you-should-know`)**: `quote-ask`, `hermes-quote-to-chat`, and `hermes-action-bar` attach global `document` selection listeners over the main chat transcript to paste quotes, stage quote cards, or fire static `llm.oneshot` popups on past replies; `btw-studio` attaches **zero** global transcript selection listeners — its `.btw-selection-toolbar` checks `proseRef.current.contains(...)` strictly inside its own `/btw` cards (staging snippets only into the `/btw` side channel), and its `COMPOSER_AREAS.contextMenu` item runs only on right-click inside the composer textarea where quote plugins opt out. `prompt-snippets` expands static chat templates into the main prompt, whereas `btw-studio` interpolates live `{{active_file}}`/`{{last_error}}` session tokens exclusively for `/btw` diagnostics. `study-tree` branches side questions into child sessions (`session.branch`), exposes 4 tools, and rewrites replies via `transform_llm_output`; `btw-studio` keeps `/btw` in a zero-branch side channel without mutating replies. `session-ref` inserts `@session:"<title>"` into main prompts for the primary model to search, whereas `btw-studio` resolves `@session:<id>` inside `/btw` at `$0` from `state.db?mode=ro`. `you-should-know` spends up to 5 background LLM calls per tool-using turn; `btw-studio` makes zero background LLM calls on telemetry events (`$0` Loop Guard) and calls `ctx.llm` only when the user asks.
- **vs. Telemetry, Fleet, Mesh, Process & Load-Broker Plugins (`perf-hud`, `hermes-context-overview`, `token-cost-meter`, `radar`, `flightdeck`, `local-fleet`, `weft`, `agent-station`, `protean-subagent-viewer`, `olympus`, `taskwatch`, `load-lock`, `git-review`)**: `perf-hud`, `hermes-context-overview`, and `token-cost-meter` display passive numeric token/cost/TPS counters without reading tool outputs or steering; `radar` (#153619) is a multi-profile bot-process monitor with OS PiP and `SIGTERM` session termination (zero hooks); `flightdeck` and `local-fleet` monitor/fail-over external vLLM/Ollama inference servers; `weft` coordinates multi-agent branches via `npx @celador/weft`, Git worktrees/hooks, 2 agent tools, and an external token-authenticated gateway (macOS/Linux only); `git-review` runs git diff review panes; `agent-station` and `protean-subagent-viewer` are read-only viewers; `olympus` is a multi-profile Dashboard tab managing cron schedules and Kanban queues; `taskwatch` watches `terminal(background=true)` shell jobs via `process.list`; and `load-lock` brokers machine-wide CPU/RAM permits through a local Node daemon and 19 `load_lock_*` shell-running tools. `btw-studio` registers **zero** agent tools (`provides_tools: []`), runs **no** daemon, `git` subprocess, or shell commands, never reads `process.list`, works cross-platform (Linux, macOS, Windows), and pairs in-session `state.db?mode=ro` diagnostics (10 Loop Guard detectors, `ψ-verify` AST checks, and `$0` passive cross-session file/line write-conflict detection via `session_mesh_guard`) with live mid-turn remediation (`session.steer`, `subagent.steer`, `ctx.subagent_lifecycle` launch, and post-completion `/btw` subagent Q&A).
- **vs. Lesson-Sharing, Harness, Skill Trial & Memory Plugins (`bhived`, `harness2`, `learnloop`, `dreaming`, `skill-court`, `skillens`, `hermes-memory-pane`, `hermes-memory-ui`)**: `bhived` is an MCP package (`npx bhived-mcp`) syncing shared cross-user lessons over `mcp.bhived.ai` (`BHIVED_API_KEY`); `harness2` (#149360) is a CLI-only batch runner registering 9 tools and cloning profiles to spawn 4 full headless CLI sessions per trial; `learnloop` (#153821) runs interactive human study/practice lessons via 8 tools and `transform_llm_output`; `dreaming` (#153828) registers a `MemoryProvider` wiki consolidator; `skill-court` replays tasks in Docker/Podman sandboxes with paid LLM judges; `skillens` logs tool outputs to enforce numbered skill steps on `pre_llm_call`; and `hermes-memory-pane` / `hermes-memory-ui` inspect or wrap middleware around memory stores. `btw-studio` uses no external lesson cloud, no npm/MCP server, no profile cloning, no containers, no middleware, and no background judge spend: it evaluates steers online over the next 3 tool calls in `state.db?mode=ro` at `$0` (`helped`, `self_recovered`, `confounded -> NO_ENTRY`), keeps verified rules private in `ctx.state.data_dir/BTW.md` (reconciled read-only on `post_curator_run`), and touches `MEMORY.md` only when `memory_md_sync_mode` is explicitly enabled.
- **vs. Receipt-Audit, Command-Rewrite, Summary, Companion & Voice Plugins (`check-please`, `precog`, `promise-keeper`, `tldr`, `hermes-sanctuary`, `mascot-guide`, `pugin`, `kin`, `hermes-sidepulse`, `gemini-live`, `enchanted-composer`)**: `btw-studio` never appends lines to final replies in `transform_llm_output` or re-runs turns via `pre_verify` (`check-please`), never rewrites or blocks commands in `tool_request`/`tool_execution` middleware (`precog`, `promise-keeper`), never omits tool exit codes like post-turn `tldr`, requires no iframe worlds (`hermes-sanctuary`), external Electron/socket companions, screenshots, or global `hermes config set` mutations (`kin`, `hermes-sidepulse`, `mascot-guide`, `pugin`), and keeps voice/STT/TTS (`false` by default) strictly scoped to `/btw` side-questions via host providers rather than opening cloud voice sessions that drive main-agent turns (`gemini-live`, `enchanted-composer`).
- **vs. Bundled `plugins/hermes-achievements` (Rule 15)**: Bundled `hermes-achievements` is an always-on Dashboard tab scanning global session history for 60+ general lifestyle, provider, and tool badges with PNG share cards. `btw-studio`'s Playbook Milestones (`gamify_enabled: false`, off by default) are not a fork or skin of `hermes-achievements`: when opted in, they render only inside BTW Studio's own Settings/Learn view to track 12 side-channel playbook counters (`BTW.md` rules, `Δτ` helped steers, `/btw` cards).

---

## 🧪 Development & Verification

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -B -m pytest tests -q   # Full unit, concurrency, SSRF (41 vectors), ReDoS (<5ms), media, STT, mesh & Playbook Milestones suite
hermes plugins validate . --install-deps                        # Catalog CI validator (16/16 checks, 0 warnings)
node --input-type=module --check < desktop/plugin.js
```

## 📚 Credits & References

- **Harness² Loop**: Xu, Chen, CuiZhu, Dalvi Mishra, Ming, Yu, Han, Lee, Pfister (Google Research, 2026), [*Harness²: Recursive Agent Harnessing for an Open World*](https://arxiv.org/abs/2610.14224), [arXiv:2610.14224](https://arxiv.org/abs/2610.14224). BTW Studio reimplements the behavioral contrast concepts for a live side-channel and vendors no external code.
- **Neurocognitive Geometry**: Mottron et al. (2006) *Enhanced Perceptual Functioning*; Baron-Cohen (2009) *Hyper-Systemizing*; Pearson (1897) & Aitchison (1982) *Spurious Correlation in Ipsative Simplex Spaces*; Russell (1980) *Circumplex Model of Affect*.

## 📄 License

[MIT](LICENSE) © Matheus Souza Brito (`SBMatthew`)
