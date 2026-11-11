/** BTW Studio v5.8.0 — side-channel /btw workspace,$0 Session Radar,Harness² RSI&Multi-Session Mesh(@hermes/plugin-sdk). */
import{Badge,Blobatar,Button,Codicon,COMPOSER_AREAS,CopyButton,createBudgetedLoop,DecodeText,PROFILE_SWATCHES,Dialog,
DialogContent,DialogDescription,DialogHeader,DialogTitle,DisclosureCaret,DropdownMenu,DropdownMenuContent,DropdownMenuItem,
DropdownMenuSeparator,DropdownMenuTrigger,GlyphSpinner,haptic,host,isSubmitEnter,KANBAN_CARD_AREAS,KEYBINDS_AREA,Kbd,
KbdGroup,Loader,MessageTextContent,ModelCatalogMenu,ModelMenuCloseContext,PALETTE_AREA,PANES_AREA,PanelPill,Popover,
PopoverContent,PopoverTrigger,queryClient,SearchField,SegmentedControl,SESSION_ROW_AREAS,SessionStatusDot,STATUSBAR_AREAS,StatusDot,
Switch,Tip,TRANSCRIPT_DIRECTIVE_AREA,useQuery,useValue,writeClipboardText,atom,cn,computed
}from '@hermes/plugin-sdk'
import{Fragment,useCallback,useEffect,useMemo,useRef,useState}from 'react'
import{jsx,jsxs}from 'react/jsx-runtime'
const ID='btw-studio'
const shortSid=s=>String(s||'').slice(-8)
const pl=(n,s,p=`${s}s`)=>`${n} ${Number(n)===1?s:p}`
function rovingKeyDown(ids,curIdx,onSelect){
 return e=>{
 if(!ids.length)return
 const base=curIdx>=0?curIdx:0
 let next=-1
 if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(base + 1)% ids.length
 else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(base - 1 + ids.length)% ids.length
 else if(e.key==='Home')next=0
 else if(e.key==='End')next=ids.length - 1
 if(next>=0){
 e.preventDefault()
 onSelect(ids[next])
 const role=e.currentTarget?.getAttribute?.('role')
 const kids=Array.from(e.currentTarget?.parentElement?.children||[]).filter(el=>role?el.getAttribute?.('role')===role:el.tagName==='BUTTON')
;(kids[next]||e.currentTarget?.parentElement?.children?.[next])?.focus?.()
}
}
}
const STORAGE_KEY='history.v2'
const LEGACY_STORAGE_KEY='history.v1'
const PREFS_KEY='prefs.v2'
const EVENT_PULSE= `plugin.${ID}.pulse`
const EVENT_ANSWER= `plugin.${ID}.answer`
const EVENT_TELEMETRY= `plugin.${ID}.telemetry`
const EVENT_SESSION_OPEN= `plugin.${ID}.session_open`
const EVENT_COMPACTED= `plugin.${ID}.compacted`
const EVENT_CURATOR= `plugin.${ID}.curator`
const _SAFE_INLINE_MEDIA_URI_RE=/^(?:data:(?:image\/(?:png|jpeg|jpg|webp|gif|bmp|avif)|video\/(?:mp4|webm|quicktime)|audio\/(?:mpeg|mp3|wav|ogg|webm|mp4|flac));base64,[A-Za-z0-9+/=\s]+|blob:(?:https?:\/\/|file:\/\/|app:\/\/|null\/)[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+)$/i
const _conversationRootBySid=new Map()
const CLS={
 accent:'btw-ac',
 rowBetween:'flex items-center justify-between gap-2',
 rowWrapBetween:'flex flex-wrap items-center justify-between gap-2',
 rowWrapBetweenSm:'flex flex-wrap items-center justify-between gap-1.5',
 rowShrink1:'flex shrink-0 items-center gap-1',
 rowShrink15:'flex shrink-0 items-center gap-1.5',
 rowMin0:'flex min-w-0 flex-1 items-center gap-2',
 rowMin0Sm:'flex min-w-0 flex-1 items-center gap-1.5',
 rowWrap15:'flex flex-wrap items-center gap-1.5',
 rowWrap1:'flex flex-wrap items-center gap-1',
 row15:'flex items-center gap-1.5',
 inline1:'inline-flex items-center gap-1',
 inline15:'inline-flex items-center gap-1.5',
 inline2Xs:'inline-flex items-center gap-2 text-xs',
 col15:'flex flex-col gap-1.5',
 colMin0:'min-w-0 flex-1 flex flex-col gap-0.5',
 secHdr:'btw-tx-10 font-semibold uppercase tracking-wider btw-ts',
 secHdrMuted:'btw-tx-10 font-semibold uppercase tracking-wider btw-tt px-0.5',
 kpiLbl:'btw-tx-95 font-bold uppercase tracking-wider btw-tt truncate',
 mono12:'font-mono btw-tx-12 font-semibold btw-tp',
 titleTrunc:'font-semibold btw-tp truncate',
 muted105:'btw-tx-105 btw-tt',
 muted:'btw-tt',
 mono95Muted:'font-mono btw-tx-95 btw-tt',
 mono10Muted:'font-mono btw-tx-10 btw-tt',
 menuRow:'flex w-full items-center justify-between gap-2 text-xs'
}
const EASE_SPRING='cubic-bezier(0.22,1,0.36,1)'
const FONT_MONO='var(--font-mono,ui-monospace,monospace)'
const LIGHT_HOST=':is(:root.light, [data-theme="light"])'
const mix=(color,pct,base='transparent')=> `color-mix(in srgb,${color} ${pct}%,${base})`
const mixAcc=(pct,base)=>mix('var(--ui-accent)',pct,base)
const mixTxt=(pct,base)=>mix('var(--ui-text-primary)',pct,base)
const mixStk=(pct,base)=>mix('var(--ui-stroke-secondary)',pct,base)
function normElProps(props,children){
 let base=typeof props==='string'?(props?{className:props}:{}):(props||{})
 if(base.cls!==undefined){const{cls,...rest}=base;base={className:cls,...rest}}
 return children!==undefined?{...base,children}:base
}
function codicon(name,size='0.75rem',className){
 return jsx(Codicon,className?{name,size,className}:{name,size})
}
function h(tag,props,children,key){return jsx(tag,normElProps(props,children),key)}
function hs(tag,props,children,key){return jsxs(tag,normElProps(props,children),key)}
function div(props,children,key){return jsx('div',normElProps(props,children),key)}
function divs(props,children,key){return jsxs('div',normElProps(props,children),key)}
function span(props,children,key){return jsx('span',normElProps(props,children),key)}
function spans(props,children,key){return jsxs('span',normElProps(props,children),key)}
function hBtn(className,props,children,key){
 return jsx('button',{type:'button',...(className?{className}:{}),...(props||{}),...(children!==undefined?{children}:{})},key)
}
function hsBtn(className,props,children,key){
 return jsxs('button',{type:'button',...(className?{className}:{}),...(props||{}),...(children!==undefined?{children}:{})},key)
}
function uiBtn(variant,size,props,children,key){
 const fn=Array.isArray(children)?jsxs:jsx
 return fn(Button,{type:'button',...(variant?{variant}:{}),...(size?{size}:{}),...normElProps(props,children)},key)
}
function tip(label,children,key){return jsx(Tip,{label,children},key)}
function scheduleTimer(fn,ms){
 return typeof _ctx?.setTimeout==='function'?_ctx.setTimeout(fn,ms):setTimeout(fn,ms)
}
function cancelTimer(handle){
 if(!handle)return
 if(typeof handle==='function'){try{handle()}catch{}}else clearTimeout(handle)
}
function extractOneshotText(res){
 return String(typeof res==='string'?res:(res?.text??res?.output??res?.content??res?.message??'')).trim()
}
function renderInlineCode(text){
 const s=String(text||'')
 if(!s.includes('`'))return s
 return s.split(/`([^`\n]+)`/g).map((seg,i)=>i%2===1?h('code','btw-inline-code',seg,i):seg)
}
function inferRuleScope(cue,lesson){
 return /\b[a-z0-9_.-]+\.(?:py|js|mjs|ts|tsx|jsx|json|yaml|yml|toml|rs|go|sh|css|html|sql)\b/i.test(`${cue||''} ${lesson||''}`)?'DOM':'INV'
}
function humanizeProbeHeadline(raw){
 let s=String(raw||'').trim()
 if(!s)return ''
 const t0=s.trim(),tCore=t0.startsWith('(')&&t0.endsWith(')')?t0.slice(1,-1).trim():t0
 if(tCore.startsWith('{')&&tCore.endsWith('}')){
 try{const j=JSON.parse(tCore);s=String(j.error||j.output||j.message||j.text||s)}catch{}
}else if(s.includes('{"output":')||s.includes('{"error":')){
 const idx=s.indexOf('{'),pfx=s.slice(0,idx).replace(/(?<![(,\s])[(,\s]+$/,'').trim()
 const rawJ=s.slice(idx).trim()
 try{const j=JSON.parse(rawJ.endsWith(')')?rawJ.slice(0,-1).trim():rawJ);const tail=String(j.error||j.output||'').split(/\r?\n/).filter(Boolean).pop()||'';s=pfx?`${pfx} (${tail})`:tail}catch{}
}
 s=s.replace(/\\r\\n|\\n/g,' ').replace(/Traceback \(most recent call last\):/gi,'').replace(/(?:[A-Za-z]:(?:\\\\|[/\\])|\/(?:Users|home|workspace)\/)[^\s'"`()]+[/\\]([^\s'"`()/\\]+)/g,'$1')
 return s.replace(/\s+/g,' ').trim()
}
function formatCompactToolArgPreview(tool,rawPreview,maxLen=36){
 let s=String(rawPreview||'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim()
 if(!s)return ''
 s=s.replace(/(-[ce]\s+["'])\s+/,'$1').replace(/(?:[A-Za-z]:[/\\]|\/(?:Users|home|workspace)\/)[^\s"']+[/\\]([^\s"'/\\]+)/g,'$1')
 if(s.length>maxLen){
 let cut=s.slice(0,maxLen-1).trim()
 const sp=cut.lastIndexOf(' ')
 if(sp>=Math.floor(maxLen*0.55))cut=cut.slice(0,sp).replace(/(?<![,;:\-·])[,;:\-·]+$/,'')
 s=`${cut}…`
}
 const dq=(s.match(/"/g)||[]).length,sq=(s.match(/'/g)||[]).length
 if(dq%2===1)s+='"'
 else if(sq%2===1)s+="'"
 return s
}
const MAX_LOCAL_ITEMS=40
let _rest=null
let _storage=null
let _ctx=null
let _disposing=false
let _pet=null
let _hudDispose=null
const HUD_PANE_ID='mascot-companion-hud'
const MASCOT_NAME='Orbyx'
const MASCOT_CALLSIGN='ORBYX-Δτ'
const THEMES=['orbyx','host','cryo','paper','ai','glass','terminal','minimal','nordic']
const LEGACY_THEME_ALIASES={nous:'host',caduceus:'host',notes:'paper',ascii:'terminal',glassmorphism:'glass'}
const ZOOM_STEPS={s:0.92,m:1,l:1.1}
const _composerOpenHandlers=new Set()
const $dialogOpen=atom(false)
const $popoverWide=atom(false)
const $activeTab=atom('ask')
const $askMode=atom('fast')
const $langPref=atom('auto')
const $appLang=atom('en')
const $lang=computed([$langPref,$appLang],(pref,app)=>(pref==='en'||pref==='pt'?pref:app))
const $draftQuestion=atom('')
const $targetOverride=atom(null)
const $expandedDiffPath=atom('')
const $pendingBySession=atom({})
const $entriesBySession=atom({})
const $bannerExpandedBySession=atom({})
const $bannerDismissedIdBySession=atom({})
const $livePulseBySession=atom({})
const $interceptSlashBtw=atom(true)
const $theme=atom('host')
const $accent=atom(null)
const $density=atom('comfortable')
const $zoom=atom('m')
const $pinned=atom(false)
const $hudOpen=atom(false)
const $mascotNarrate=atom(false)
const PERSONAS=['balanced','neurodivergent','anxious','technical','kawaii','harness_rsi','custom']
const LEGACY_PERSONA_ALIASES={default:'balanced',academic:'harness_rsi',deep:'harness_rsi',rsi:'harness_rsi',audhd:'neurodivergent','3e':'neurodivergent','2e':'neurodivergent',monothread:'neurodivergent',zen:'technical',tea:'technical',flash:'anxious',brief:'anxious',eficiente:'anxious',visual:'kawaii',
diagram:'kawaii',spatial:'kawaii'}
const ALERT_DEFAULTS={errorStreak:3,costUsd:0,tokensK:0}
const $personality=atom('balanced')
const $customPersona=atom('')
const $synthMode=atom('facts')
const $recapMode=atom('facts')
const $petTtl=atom(12)
const $stockSafePet=atom(true)
const $petBubbleMode=atom('minimal')
const $settingsMode=atom('basic')
const $spatialMode=atom('auto')
const $showComposerBanner=atom(true)
const $showStatusbarChip=atom(true)
const $backendSettings=atom({max_history_per_session:30,verify_touched_files:true,scan_sibling_profiles:false,fast_provider:'',
fast_model:'',fast_base_url:'',rsi_learning:true,growth_mode:'lite',btw_md_max_chars:4000,allow_web_search:false,
allow_media_tools:false,wake_word_enabled:false,wake_phrase:'by the way',wake_target_mode:'live',live_voice_enabled:false,
tts_auto_speak:false,tts_voice:'coral',tts_model:'gpt-4o-mini-tts'})
const $alerts=atom({...ALERT_DEFAULTS})
const $present=atom(false)
const $exportFolder=atom(null)
const $noPet=atom(false)
const $alertSteer=atom(null)
const $compareIds=atom({a:'',b:''})
const $customPresets=atom([])
const $deletedPresetIds=atom([])
const $presetEditorDraft=atom(null)
const $followUpParent=atom(null)
const $sessionBadges=atom({})
const $localProbes=atom([])
const $localLessons=atom([])
const $localPresetStats=atom({})
const $activeCardMiniChatId=atom('')
const $inlineMascotDrawerOpen=atom(false)
const $inlineSettingsOpen=atom(false)
const $subagentLauncherOpen=atom(false)
const $selectedSubagentId=atom('')
const $addLessonOpen=atom(false)
const $btwAttachments=atom([])
const $autoRecommendSnippets=atom(true)
const $smartRecommendationBySession=atom({})
const $sessionOnlySnippetsBySession=atom({})
const $composerActionMode=atom('ask_btw')
const $bannerThemeMode=atom('chat')
const $bannerSizeMode=atom('comfortable')
const $deepOverviewBySession=atom({})
const $maxDeepOverviewReports=atom(5)
const $expandedDeepReportIds=atom({})
const $personaWeights=atom({visual:0.34,eficiente:0.33,profundo:0.33})
const $personaAxes=atom({visual:0.80,eficiente:0.80,profundo:0.78,epistemico:0.88,monothread:0.96,estrutura:0.90})
const $personaGeometry=atom('pentagon')
const $petAffection=atom({level:82,pats:0,lastPatAt:0,lastLensShiftAt:0,lastEurekaAt:0,moodOverride:'auto'})
const $lensDragging=atom(false)
const $petAerialFlight = atom(false)
const $nativePetActive=atom(false)
const $aerialBubble=atom(null)
const $petGrabbed=atom(false)
const $bannerLaserTarget=atom(null)
const $compressionRadarState=atom(null)
const $pinnedBtwTools=atom([])
let _aerialBubbleTimer=null
let _laserReadyTimer=null
let _compressionRadarTimers=[]
const $steeredByCardId=atom({})
const $specialistOpen=atom(false)
const $playbookPreviewOpen=atom(false)
const $growthMode=atom('lite')
const $playbookCharBudget=atom(4000)
const $autoLearnMode = atom('lite')
const $autoLearnHook=atom(true)
const $autoLearnCronMins=atom(0)
const $memorySyncMode = atom('off')
const $sessionMeshOpen=atom(false)
const $howItWorksOpen=atom(false)
const $expandedProbeIds=atom({})
const $expandedLessonIds=atom({})
const $expandedPackIds=atom({})
const $importDrawerOpen=atom(false)
const $allowWebSearch=atom(false)
const $allowMediaTools=atom(false)
const $gamifyEnabled=atom(false)
const $dictationStatus=atom('idle')
const $dictationTarget=atom('main')
const $dictationLang=atom('auto')
const $dictationPartial=atom('')
const $dictationLevel=atom(0)
const $dictationElapsed=atom(0)
const $wakeWordEnabled=atom(false)
const $wakePhrase=atom('by the way')
const $wakeTargetMode=atom('live')
const $liveVoiceEnabled = atom(false)
const $liveVoiceActive=atom(false)
const $liveVoicePhase=atom('idle')
const $liveVoiceStatusText=atom('')
const $liveVoiceReply=atom('')
const $ttsAutoSpeak=atom(false)
const $ttsVoice=atom('coral')
const $ttsModel=atom('gpt-4o-mini-tts')
const $ttsSpeakingEntryId=atom('')
const $favoriteModelsList=atom([])
const $loaderCurveIdx=atom(0)
const $composerStagedNotice=atom(null)
const $activeMediaLightbox=atom(null)
const _mediaDataUrlCache=new Map()
let _stagedNoticeTimer=null
function stageCommandInBtwChat(text,meta={}){
const clean=String(text??'').trim()
if(!clean&&!meta.allowEmpty)return
const cur=String($draftQuestion.get()||'').trim()
const finalTxt=meta.append&&cur? `${cur}\n\n${clean}` :clean
$draftQuestion.set(finalTxt)
if(meta.switchToAsk!==false&&$activeTab.get()!=='ask'){$activeTab.set('ask')}
if($inlineSettingsOpen.get()){$inlineSettingsOpen.set(false)}
if(meta.openStudioIfClosed){requestOpenStudio({tab:'ask'})}
const notice={id: `staged_${Date.now().toString(36)}`,
label:meta.label||($lang.get()==='pt'?'Comando carregado no chat /btw':'Command staged in /btw chat'),
source:meta.source||'command',icon:meta.icon||'sparkle',preview:finalTxt.replace(/\s+/g,' ').slice(0,96),ts:Date.now()}
$composerStagedNotice.set(notice)
if(_stagedNoticeTimer)cancelTimer(_stagedNoticeTimer)
_stagedNoticeTimer=scheduleTimer(()=>{_stagedNoticeTimer=null
if($composerStagedNotice.get()?.id===notice.id){$composerStagedNotice.set(null)}
},4800)
haptic?.('tap')}
const NATIVE_LOADER_CURVES=['lemniscate-bloom','spiral-search','rose-orbit','fourier-flow','lissajous-drift','butterfly-phase',
'hypotrochoid-loop','original-thinking']
const NATIVE_RADAR_CURVES=['spiral-search','rose-orbit','hypotrochoid-loop','fourier-flow']
const RSI_STORAGE_KEY='rsi.v1'
const CONTEXT_TOKEN_KEYS=['last_error','active_tool','last_command','touched_files','git_branch','todo_pending','subagents','cost',
'anomalies','cwd','model']
const TEMPLATE_BRACES_RE=/\{\{[^{}]*\}\}|\{%[^{}]*%\}/g
const I18N={
 en:{
 tabAsk:'Ask',tabRadar:'Radar',tabCards:n=> `Cards (${n})`,tipClose:'Close (Esc)',
 placeholderAsk:'Ask anything about this session…',btnClear:'Clear',btnAsk:'Ask',
 synthesizingFast:'Fast observer · reading state.db snapshot · main turn keeps running',
 synthesizingDeep:'Main model · reading state.db snapshot',emptyTitle:'No side messages in this session yet',
 emptyDesc:'Click any quick preset above, create your own (+ New preset), or type a question. Answers render with full GitHub-Flavored Markdown (tables, code, math) without polluting your chat.',
 searchPlaceholder:'Search /btw questions and answers in this session…',clearUnpinned:'Clear unpinned',
 noCardsFound:'No matching cards found.',
 interceptTitle:'When enabled, typing /btw in the chat composer routes cleanly to BTW Studio without dumping raw system messages into the conversation.',
 interceptOn:'/btw interception active (clean chat)',interceptOff:'/btw interception off',shortcutLabel:'Shortcut:',
 triggerTitle:'BTW Studio — Side questions & $0 Session Radar (Ctrl+Alt+B or /btw)',
 answeringParallel:q=> `Answering in parallel: "${q}"`,answerReady:'Answer ready',copyAnswer:'Copy Markdown answer',
 openStudio:'Open Studio',hideBanner:'Dismiss banner (saved in Studio)',openStatusbarTip:'Open BTW Studio (Ctrl+Alt+B)',
 dialogDesc:'Parallel side-questions and deterministic SQLite session telemetry',quickQuestionFallback:'Quick question (/btw)',
 reAskTip:'Ask again (refresh)',steerNowTip:'Steer the running turn with this (session.steer) — nothing is interrupted',
 steerBtnLabel:'Steer',steeredNotify:'Steer delivered — lands after the current tool call',
 quoteInChatTip:'Quote in main chat composer to steer the agent',pinTip:pinned=>(pinned?'Unpin card':'Pin card to top'),
 deleteTip:'Delete card',insertedNotify:'/btw answer inserted as a quote into the composer.',
 copiedNotify:'Quote copied to clipboard.',reportCopiedNotify:'Radar report copied (Markdown)',
 inactiveSessionError:'BTW Studio: session is inactive and the btw-studio backend is unavailable.',
 failedError:msg=> `BTW Studio failed: ${msg}`,readingTelemetry:'Reading state.db (read-only · 0 tokens)…',
 statTouchedFiles:'Touched files',statusRunning:'Running',statusReady:'Ready',runningTool:tool=> `Running tool: ${tool}`,
 generatingResponse:'Generating reasoning / response…',sessionIdle:'Session ready (Idle)',
 refreshRadarTip:'Re-read state.db · 0 tokens',copyReportTip:'Copy full Session Radar telemetry as a clean Markdown table report',
 sparklineTitle:'Turn Activity & Tool Velocity Sparkline',anomalyGuardTitle:'Loop guard · deterministic · 0 tokens',
 toolDistTitle:'Session Tool Distribution',settingsTip:'Appearance & behavior',hudTitle:'BTW · mini chat',
 hudPlaceholder:'Ask about this session…',
 hudEmpty:'Ask anything about the session you are viewing. Answers never touch the transcript.',hudOpenStudio:'Open Studio',
 hudNoSession:'No active session in view',hudTabPet:'🐾 Mascot',hudTabTelemetry:'📡 Telemetry',hudTabSettings:'⚙ Options',
 hudTelemetryActive:'Active Stream',hudTelemetryIdle:'Idle · Listening',hudPetSummaryTitle:'Pet AI Telemetry Bubble',
 hudTriggerSynth:'✦ Infer Bubble',hudTriggerSynthTip:'Synthesize an AI-inferred personalized bubble from latest telemetry',
 setPetBubbleMode:'Pet Bubble Behavior',setPetBubbleModeDesc:'Configure how the pet bubble tailors summaries from agent telemetry.',
 petBubbleModeNames:{
ai_summary:'✦ AI Personalized',metric_focus:'📊 Metrics & Cost',action_steer:'⚡ Action & Steer',minimal:'🔇 Compact $0'},
 petThinking:'btw · on it',petDone:'btw · answer ready (Ctrl+Alt+B)',
 petLoop:n=> `btw · ${n} tool errors in a row — steer from the composer`,setTheme:'Theme',
 setThemeDesc:'Every theme is built on the app theme variables, so BTW repaints with your Hermes theme.',
 themeNames:{
orbyx:'🛸 Orbyx',host:'🖥 Host Theme',cryo:'❄ Cryo Tactical',paper:'📜 Paper',ai:'🔥 Copper Forge',glass:'🪟 Mica',
terminal:'📟 Terminal',minimal:'💬 Web AI Chat',nordic:'🌲 Boreal'},
 setAccent:'Accent Color',setAccentDesc:'Pick a custom highlight or follow the active theme palette.',
 setAccentClear:'Follow theme accent',setDensity:'Density',densityNames:{comfortable:'Comfortable',compact:'Compact'},
 setZoom:'Text Size',zoomNames:{s:'S',m:'M',l:'L'},setMascotNarrate:'Pet narration',
 setMascotNarrateDesc:'Short lines in the Hermes pet bubble (ctx.pet): thinking, answered, loop alerts, turn recaps.',
 setIntercept:'Intercept /btw in the composer',setInterceptDesc:'Typing /btw opens the studio; answers stay out of the transcript.',
 setLang:'Language',langAuto:'Auto',
 personaNames:{balanced:'⚖ Balanced (All-Rounder)',neurodivergent:'🧬 AuDHD 3e (Monothread & INV/DOM)',
anxious:'⚡ ADHD Flash (High-Salience & Instant Action)',technical:'🧩 Systematic ASD (Literal [D0/D2] & Visual Matrices)',
kawaii:'🎨 Visual Thinker (Rich MD, Tables & ASCII)',harness_rsi:'🏛 Deep Systems / RSI (Exhaustive & Δτ)',
custom:'✍ Custom Cognitive Lens…'},
 personaHints:{balanced:
'Harmonic 65% balance across all axes: clear executive takeaway, compact GFM table when useful, and 1–2 next steps.',neurodivergent:
'AuDHD 2e/3e calibration: strict monothread shield (↳ 1 Single Step, 96%) + structural scaffolding (📐 90%) + visual clarity (🎨 80%) + dual-scope causality (🎯 INV/DOM, 78%).',
anxious:
'ADHD Delay-Aversion & Working-Memory shield: max 3 high-contrast lines (🟢 Status · 🚨 Bottleneck · 🛠 1-Line Fix), zero preamble.',
technical:
'Autistic Hyper-Systemizing & Enhanced Perceptual Functioning: high spatial predictability (86% Visual: GFM matrices & [A] ──► [B] causal graphs) + 98% literal [D0:OBSERVED FACT] vs [D2:HYPOTHESIS].',
kawaii:
'Paivio Dual-Coding & Mayer Multimedia dominance (98% Visual): transforms explanations into GFM tables, ASCII topology diagrams, callouts, and status badges.',
harness_rsi:
'High Need-for-Cognition & Systems Engineering (98% Deep + 76% Visual): exhaustive root-cause audit, L0 prefix-cache mechanics, U(p) utility, Δτ contrast, and C0–C6 levers.'
},
 setPersona:'Cognitive Reading Lens (Studio & Mascot)',
 setPersonaDesc:'Unified cognitive style for /btw answers, Deep Overviews, and Mascot telemetry summaries.',
 setCustomPersona:'Describe your cognitive lens (≤ 400 chars)',setSynth:'Summary engine',
 synthNames:{facts:'Facts $0',llm:'✦ AI (fast model)',fast:'$0 deterministic'},setRecap:'Turn-end recap',
 recapNames:{off:'Off',facts:'$0 facts',llm:'✦ AI voice'},setTtl:'Line duration',
 ttlNames:{6:'6 s',12:'12 s',20:'20 s',30:'30 s'},previewBubble:'Test pet line',petOnScreen:'Pet on screen',
 previewText:'⚡ Status: 10/10 tests green · zero regressions.\n🎯 Fact: state.db read-only ($0).\n↳ Focus: ready for your next move.',
 previewTexts:{balanced:
'⚖ Summary: 10/10 tests green · L0 cache at 96.7% ($0 read-only).\n📊 Context: 0 errors across 4 tool calls · prefix stable.\n↳ Next: Ready to commit or run integration check.',
neurodivergent:
'⚡ Now: 10/10 tests green · turn running in background.\n🎯 Cause (INV/DOM): [INV] Side-channel is read-only ($0) ──► [DOM] state.db=ro · cache=96.7%.\n↳ Single Next Step: 1 action at a time, zero noise.',
anxious:
'🟢 Status: 10/10 tests green · cache 96.7% (0.43s).\n🚨 Bottleneck: Unverified edit on plugin.js.\n🛠 1-Line Fix: Run pytest before committing.',
technical:
'[D0:OBSERVED] suite=10/10 (0.43s) · cache_hit=96.7% · state.db=ro\n[CAUSE ──► EFFECT] [C6_Skill] ──► [0 anomalies] ──► [STATE: NOMINAL]\n[D2:HYPOTHESIS] 0 unverified assumptions · contract verified',
kawaii:
'┌─ 📊 Visual Telemetry Matrix ──────────┐\n│ 🟢 Tests: 10/10   ⚡ Cache: 96.7% ($0) │\n└──────────────┬────────────────────────┘\n               └──► ✨ Ready for next step!',
harness_rsi:
'🏛 Deep Audit: Context compaction nominal (42% occ) · L0 prefix cache at 96.7% hit rate.\n📊 Δτ Contrast: U(preset)=+0.92 across 4 tool calls · zero regressions.\n🧠 Playbook: Verified rule synced to BTW.md.',
custom:'✦ Custom 5D/6D cognitive lens active! All systems nominal, 10/10 tests green — the next move is yours.'},
 setErrorStreak:'Warn after N tool errors in a row',setCostLimit:'Warn when session cost passes (USD, 0 = off)',
 setTokenLimit:'Warn when input tokens pass (k, 0 = off)',alertCost:v=> `Session spend passed $${v} — keep going?`,
 alertTokens:v=> `Context passed ${v}k input tokens — consider /compact.`,setPresent:'Presentation mode',
 setPresentDesc:'Larger text and stronger contrast across BTW surfaces, for demos and screen recordings.',exportBtn:'Export .md',
 exportTip:'Save these /btw cards as a Markdown note (pick a folder once, e.g. your Obsidian vault)',
 exportDone:(name,folder)=> `Saved ${name} → ${folder}`,compareA:'Session A',compareB:'Session B',compareMetric:'Metric',
 compareEmpty:'Pick two sessions to compare ($0, read-only SQLite).',activePlanTitle:'Active Plan (Todo List)',
 recentErrorsTitle:'Recent Tool Alerts / Timeouts',subagentsTitle:n=> `Spawned Subagents (${n})`,
 recentCmdsTitle:'Recent Terminal Commands',recentFilesTitle:'Recently Touched Files',microActionLabel:'Quick question (/btw)',
 alertStripSteer:'Steer',alertStripDismiss:'Dismiss',answeredIn:s=> `answered in ${s}`,zeroTokens:'read-only · 0 tokens',
 attachMenuLabel:'BTW Studio — Side Question (/btw)',contextMenuLabel:'Ask /btw about this selection',
 contextMenuPrefill:text=> `Regarding this snippet ("${text}"): `,addPresetBtn:'New preset',
 addPresetTip:'Create a custom /btw preset button for questions you ask often',editPresetTip:'Edit preset',
 deletePresetTip:'Delete preset',restorePresetsBtn:n=> `Restore defaults (${n})`,
 restorePresetsTip:'Bring back deleted built-in presets',presetEditorNewTitle:'New /btw Preset',
 presetEditorEditTitle:'Edit /btw Preset',presetIconLabel:'Icon',presetNamePlaceholder:'Button label (e.g. Tests & Lint)…',
 presetDescPlaceholder:'Optional tooltip description…',presetPromptPlaceholder:'Exact /btw question to send when clicked…',
 presetSaveBtn:'Save preset',presetCancelBtn:'Cancel',presetSavedNotify:label=> `Preset "${label}" saved.`,
 presetDeletedNotify:label=> `Preset "${label}" removed.`,presetRestoredNotify:'Default presets restored.',
 saveDraftAsPresetBtn:'+ Preset',saveDraftAsPresetTip:'Save this question as a reusable quick preset button',
 saveCardAsPresetTip:'Turn this question into a quick preset button',repeatedBtwBadge:n=> `Asked ${n}× · + Save preset`,
 secPresets:'Quick Presets',presetsManageDesc:'Customize one-click /btw buttons for recurring questions in your workflow.',
 moveUpTip:'Move earlier',moveDownTip:'Move later',
 presets:[{id:'plan',icon:'checklist',label:'Phase & Plan',
desc:'Audit plan adherence and current execution phase',prompt:
'Answer concisely in structured Markdown: are you following the agreed plan? Which exact phase/step is running right now and what remains?'
},{id:'eta',icon:'watch',label:'Progress & ETA',desc:'Quantified progress and realistic completion estimate',prompt:
'What is the quantified progress so far (completed items, verified steps) and the realistic time estimate (ETA) to finish?'},{
id:'doing',icon:'pulse',label:"What's running?",desc:'Explain the exact tool or command running right now',prompt:
'What exact tool or command are you executing right this second, on which file, and with what immediate goal?'},{id:'errors',
icon:'warning',label:'Errors & Bottlenecks',desc:'Summary of failures, timeouts, and workarounds applied',prompt:
'Provide an objective summary of any errors, failures, timeouts, or bottlenecks encountered in this session so far and how they are being handled.'
},{id:'cost',icon:'dashboard',label:'Spend & Tokens',desc:'USD cost, API calls, and prompt-cache efficiency',prompt:
'Break down the exact token usage, prompt-cache hit rate, API call count, and measured USD spend in this session so far.'},{
id:'files',icon:'files',label:'Touched Files',desc:'List created or modified files and 1-line summary',prompt:
'List all files created or modified in this session so far and summarize in one line what changed in each file.'}],
 tabLearn:'Learn',tabMesh:n=>(n>0? `Mesh (${n})` :'Mesh'),flightNames:{calm:'Calm',watch:'Watch',act:'Act'},
 flightSub:{
calm:'No loop, unverified edit, silent subagent or stall observed · 0 tokens',
watch:n=> `${n} ${n===1?'signal':'signals'} worth a glance · nothing is blocked`,
act:n=> `${n} high-severity ${n===1?'finding':'findings'} · steer before it fails`},
 healthLabel:'health',steeringNow:'Steer probe open — measuring Δτ on the next 3 tool calls',sealObserved:'Observed · D0',
 sealObservedTip:'Measured from read-only state.db and live hooks — no model involved, $0',sealHypo:'AI · D2',
 sealHypoTip:'Model answer grounded on the state.db snapshot — a hypothesis until verified',
 scopeNames:{INV:'INV · how the agent works',DOM:'DOM · workspace fact'},
 leverTip:(lever,name,why)=> `Cheapest durable fix: ${lever} ${name}. ${why}`,learnedBefore:'Learned before · evidence-backed',
 verdictNames:{helped:'helped',self_recovered:'self-recovered',hurt:'hurt',
no_observed_effect:'no effect',confounded:'confounded'},
 followUpTip:'Follow up in a thread (this Q&A becomes context)',followingUp:q=> `Following up: ${q}`,
 cancelFollowUp:'Cancel follow-up',promoteBtn:'Promote',
 promoteTip:'Turn this into durable knowledge — nothing is sent without your review',
 promoteSkill:'Skill via /learn (with trigger line)',promoteMemory:'Short memory fact (always-on)',
 promoteLesson:'Lesson in the BTW library ($0)',promotePreset:'One-click preset',
 promotedNotify:'Draft seated in the composer — review, then send',lessonSavedNotify:'Lesson saved to the BTW library',
 learnedNotify:cue=> `BTW learned: ${cue}`,tokensLabel:'Live context',
 tokensTip:'Inserts a live value, resolved when sent (≤ 400 chars, secrets redacted)',resolvedPreview:'Resolves now to',
 lintUnknown:list=> `Unknown token(s): ${list}`,tokensResolved:'live tokens',kpiHelpRate:'Steer help rate',kpiProbes:'Steers measured',
 learnEmpty:'No steer outcomes yet. Steer from a Loop-Guard alert or a /btw card: BTW watches the next 3 tool calls and keeps a lesson only when the contrast proves it helped.',
 howSteps:['Observe — $0 detectors read state.db while the turn runs.',
'Steer — one click sends session.steer; BTW snapshots e⁰.',
'Measure — the next 3 tool calls decide: helped · hurt · no effect · confounded.',
'Keep — only proven lessons enter the library; confounded ones never do.'],
 lessonsTitle:'Lesson library · evidence only',lessonToSkill:'Draft a skill from this lesson',lessonDelete:'Forget this lesson',
 yieldTitle:'Preset utility yield',pruneHint:'Suggested to prune (hurt more than helped, or idle 30 days)',packsTitle:'Preset packs',
 packInstall:'Install',packAdded:n=> `Added ${n} preset(s)`,packExport:'Copy my presets as a pack',
 packExported:'Pack JSON copied to the clipboard',packImportPlaceholder:'Paste a btw-studio.preset-pack/1 JSON to import…',
 packImportBtn:'Import',packImported:(n,r)=> `Imported ${n} preset(s)${r? ` · ${r} rejected by the template gate` :''}`,
 rowBadgeTip:(cards,pinned,alert)=>
`BTW: ${cards} side card(s)${pinned? `, ${pinned} pinned` :''}${alert?' · loop alert':''}`,
 tabSubagents:n=>(n>0? `Subagents (${n})` :'Subagents'),subagentsEmptyTitle:'No delegated subagents in this session yet',
 subagentsEmptyDesc:'When the main agent spawns subagents via delegate_task, they appear here in real time with live transcripts, tool telemetry, /btw side-questions and AI-synthesized subagent.steer.',
 subagentStatusRunning:'RUNNING',subagentStatusDone:'DONE',subagentStatusFailed:'FAILED',subagentInterruptBtn:'Stop',
 subagentInterruptedNotify:id=> `Subagent ${id} interrupt signal sent.`,
 subagentSteerSentNotify:id=> `Steer queued for subagent ${id} (lands after current tool).`,
 subagentMiniChatPlaceholder:'Instruct or steer this subagent (e.g. "focus only on auth.py and skip slow tests")…',
 cardMiniChatBtn:'Command / Steer',cardMiniChatTip:'Open inline AI Command & Steer mini-chat grounded on this /btw card',
 cardMiniChatTitle:'AI Command & Steer Synthesizer',
 cardMiniChatPlaceholder:'Write what the agent should do based on this card (e.g. "fix this bug and run pytest")…',
 cardMiniChatTargetLabel:'Target:',cardMiniChatTargetMain:'Main Chat Agent',cardMiniChatSynthBtn:'✦ Synthesize Command',
 cardMiniChatSynthesizing:'Synthesizing targeted command from card + telemetry…',
 cardMiniChatPreviewLabel:'Synthesized Command (editable before sending):',cardMiniChatSendSteer:'⚡ Steer Running Turn',
 cardMiniChatSendComposer:'↵ Seat in Main Chat',cardMiniChatSendSubagent:'⚡ Steer Subagent',
 cardMiniChatDirectSteer:'Quick Raw Steer',learnAddLessonBtn:'+ Add lesson',
 learnAddLessonTitle:'Record an evidence-backed lesson (Harness² R_t)',learnCuePlaceholder:'When this situation happens (cue)…',
 learnLessonPlaceholder:'Do this concrete action / check (lesson)…',learnSaveLessonBtn:'Save lesson',
 setStockSafePet:'Compact 120-char pet bubble (Stock Hermes)',
 setStockSafePetDesc:'Default ON: single punchy line ≤ 114 chars so stock Hermes Desktop never truncates mid-word. Turn OFF only on extended patched builds.',
 previewTextCompact:'⚡ 10/10 tests green · state.db=ro ($0) · ready for next move.',
 previewTextsCompact:{
neurodivergent:'🧭 10/10 green · state.db=ro ($0) · ↳ Focus: 1 step at a time.',
anxious:'⚡ Flash: 10/10 green · cache=96.7% · 0 blockers · ready.',
technical:'[D0:OK] suite=10/10 · cache=96.7% · db=ro · anomalies=0',kawaii:'[🟢 10/10] ──► [⚡ Cache 96.7%] ──► ✨ Ready!',
harness_rsi:'🏛 Deep: ctx=42% · cache=96.7% · U(preset)=+92% · Δτ nominal',custom:'✦ Custom lens ready · 10/10 tests green ($0).'},
 viewMenuLabel:'Surface layout & view options',viewMenuWide:'Wide popover (880px)',viewMenuCompact:'Compact popover (640px)',
 viewMenuModal:'Open Full Studio Modal (940px)',viewMenuHud:'Toggle Floating Mini-Chat',
 viewMenuPin:pinned=>(pinned?'Unpin popover':'Pin popover open'),sealHeuristic:'Rule · D1',
 sealHeuristicTip:'Deterministic pattern rule over state.db ($0, no LLM) — verify before acting',
 starterTryBtn:'Try 1-click: Phase & Plan',cardsEmptyTitle:'No /btw side cards saved yet',
 cardsEmptyDesc:'Every /btw question and answer is persisted here with GFM tables, code highlighting, pin-to-top and 1-click Markdown export.',
 steerContextLimit:'Context is getting large. Wrap up the current step concisely and consider compacting.',
 steerLoopStreak:'Stop retrying the same failing step. Diagnose the root cause from the last error output first, then try a different approach.',
 invalidJsonError:'Invalid or oversized JSON pack (max 64 KB).',compareBtnLabel:'Compare Sessions',compareBackBtn:'← Back to Radar',
 moreActionsTip:'More card actions (follow-up, re-ask, quote, save preset, delete)',demoLoadBtn:'✦ Load Interactive Showcase',
 demoExitBtn:'Exit Showcase',demoBadge:'DEMO SHOWCASE',probeMeasuringLabel:'measuring',probeClosedLabel:'closed',
 probeMeasuringReason:'Measuring Δτ on next 3 tool calls…',probeExpiredReason:'Probe window expired.',
 sparklineMeta:(turns,peak)=> `${turns} turns · peak ${peak} tools/turn`,liveToolsUnit:'tools',liveCachePrefix:'Cache ',
 customBadgeLabel:'custom',cmdRunningLabel:'running',cmdDoneLabel:'done',
 compareRows:{model:'Model',elapsed_seconds:'Elapsed',messages:'Messages',tool_calls:'Tool calls',api_calls:'LLM calls',
errors:'Errors',anomalies:'Anomalies',input:'Input tokens',output:'Output tokens',cache_hit_pct:'Cache hit',cost_usd:'Cost',
files:'Files touched'},
 errResolvedBadge:'✓ recovered',errActiveBadge:'⚠ active',
 steerObsoleteRecoveredNotify:'Agent already self-recovered from that error — Lesson recorded automatically in Learn ($0)!',
 subagentThoughtLabel:'Thinking (CoT)',subagentReplyLabel:'Output',subagentGoalLabel:'Goal',subagentSteerLabel:'Steer Injected',
 subagentFeedEmpty:'Waiting for first reasoning step or tool call…',settingsModeBasic:'✨ Basic',settingsModeAdvanced:'⚙ Advanced',
 settingsModeBasicDesc:'Streamlined day-to-day visual, workflow, and mascot controls — zero clutter.',
 settingsModeAdvancedDesc:'Full engineering cockpit: desktop hooks, AST ψ-verify, alert ceilings, LLM overrides, presets & RSI.',
 switchToAdvancedBtn:'Open Advanced Engineering Cockpit (Telemetry, Models, Subagents, Presets & RSI) →',
 switchToBasicBtn:'← Switch to Basic Settings',secVisualThemes:'Visual & Theme Engine',secCoreWorkflow:'Side-Channel Workflow',
 secDesktopHooks:'Desktop Hooks & Placement',secSafetyRadar:'Telemetry, Safety Radar & Alert Ceilings',
 secFastObserver:'Fast Observer LLM & Endpoint Overrides',secRsiEngine:'Harness² RSI Self-Improvement',
 secMascotDeep:'Cognitive Lens & Mascot Companion',
 themeSubtitles:{orbyx:'Obsidian Visor & Dual Gyro',host:'Hermes Desktop Native',
cryo:'Tactical Ice Datapad',paper:'Ruled Parchment & Ink',ai:'Carbon & Molten Copper',glass:'Frosted Acrylic',
terminal:'Phosphor CRT & ASCII',minimal:'Clean Matte Web Chat',nordic:'Nocturnal Pine & Mint'},
 setAskModeDefault:'Default Ask (/btw) Engine',
 setAskModeDefaultDesc:'Fast observer answers in ~1.8s via auxiliary slot; Main Model uses primary reasoning.',
 setShowBanner:'Show Composer Top Banner',
 setShowBannerDesc:'Display live /btw answer preview and Loop-Guard alert strip above the composer.',
 setShowStatusChip:'Show Status Bar Telemetry Chip',
 setShowStatusChipDesc:'Display the live BTW session status chip in the bottom status bar.',
 setMaxHistory:'Session History Retention',setMaxHistoryDesc:'Maximum /btw Q&A cards persisted per session (5–200).',
 setPsiVerify:'ψ-Verify AST & Syntax Check',
 setPsiVerifyDesc:'Run read-only Python AST and JSON syntax checks on touched files ($0).',
 setScanSiblings:'Scan Sibling Profile Databases',
 setScanSiblingsDesc:'Inspect read-only state.db files across sibling Hermes profiles for Session Compare.',
 setFastModel:'Custom Fast Model Slug Override',setFastBaseUrl:'Custom Base URL Endpoint (HTTPS or Loopback)',
 setFastBaseUrlPlaceholder:'e.g. https://api.openai.com/v1 or http://localhost:8000/v1',pingTestingLabel:'Pinging…',
 setRsiLearning:'Harness² RSI Learning & Δτ Contrast',
 setRsiLearningDesc:'Automatically measure 3-tool-call Δτ contrast after steers and store verified lessons.',
 exportLessonsBtn:'Export Lessons JSON',lessonsExportedNotify:'RSI Lessons JSON copied to clipboard.',
 spatialLayoutLabel:'Spatial Layout',spatialNames:{auto:'Auto (Smart)',split:'◫ Split Cockpit',single:'▭ Single Pane'},
 companionMoodTip:'Reactive Companion Mood · Click to infer AI Pet Bubble from live telemetry',launchSubagentBtn:'+ Launch Subagent',
 launchContextPlaceholder:'Optional background context or constraints (supports live {{tokens}})…',
 launchDispatchBtn:'🚀 Spawn Subagent',launchingSubagentLabel:'Spawning…',
 subagentLaunchedNotify:id=> `Delegated subagent launched (${id}).`,
 steerTargetSpawnSubagent:'⚡ Spawn New Subagent (ctx.subagent_lifecycle)',cardMiniChatSendSpawn:'🚀 Spawn Subagent with Goal',
 anomalySpawnFixBtn:'🤖 Spawn Fix',cancelBtn:'Cancel',petTelemetryTitle:'Companion Telemetry Stream',
 petLoopAlertTitle:n=> `Loop Alert (${pl(n,'error')})`,petRecapTitle:'Turn Recap',petReinfer:'Re-infer',
 petEmptyStream:'Ask anything or click Infer Bubble to synthesize live session telemetry.',
 petBehaviorTitle:'Pet Behavior & Triggers',hudTurnRunning:'Agent turn running…',
 hudNoRecentTools:'No recent tool executions recorded yet in this turn.',uiModeMinimal:'Basic',uiModeTelemetric:'Telemetric',
 uiModeMinimalTip:'Minimalist Mode (Basic): clean /btw Ask & Cards only — zero cognitive overload',
 uiModeTelemetricTip:'Telemetric Mode (Advanced): full Flight Deck, Radar, Subagents CoT, Harness² RSI & Telemetric Cockpit',
 demoBtnShort:'✦ Demo',demoBtnTip:'Toggle 1-click Interactive Showcase across all tabs ($0, zero tokens)',
 ctxWindowTitle:'Context Window Occupancy',cacheSavedBadge:v=> `Saved $${v} via Cache`,attachBtnLabel:'📎 Attach',
 attachImageItem:'🖼 Image / Screenshot…',attachFileItem:'📄 File from Disk…',
 attachWorkspaceFolderItem:'📁 Session Workspace Folder (cwd)',attachGrantedFolderItem:'📁 Pick Folder (ctx.files)…',
 attachPasteItem:'📋 Paste Clipboard as Snippet',attachUrlItem:'🌐 Attach URL Reference…',mentionSessionBtn:'@Session',
 mentionSessionTip:'Mention another Hermes session (@session) to compare or pull its context into /btw',
 pastedChipLabel:(lines,chars)=> `Pasted · ${pl(lines,'line')} (${fmtCompact(chars)} chars)`,subagentFeedCompactBtn:'🧠 CoT & Tools',
 tabBasicOverview:'Overview',placeholderAskBasic:'Ask anything without interrupting the agent…',
 basicHealthyTitle:'Workflow running smoothly',basicHealthySub:'No active bottlenecks or unresolved errors in this session.',
 basicProgressLabel:(done,total)=> `Task progress · ${done}/${total} done`,basicFixNowBtn:'⚡ Fix now',
 basicDiagnoseBtn:'💬 Diagnose',plusBtnTip:'Add attachments or insert prompt snippets (+)',
 plusSnippetsHeader:'⚡ Prompt Snippets (Presets)',plusAttachHeader:'📎 Attach Context',plusRunNowBtn:'Run',
 plusInsertTip:'Click to insert snippet into chat · click Run to send immediately',presetHoverBadge:'Prompt Snippet',
 presetHoverPromptLabel:'PROMPT',presetHoverHint:'Click to ask · Shift+Click to edit in chat',pastedBadge:'PASTED',
 pastedTitle:'Pasted Content',pastedMeta:(lines,chars)=> `${pl(lines,'line')} · ${fmtCompact(chars)} chars`,
 pastedExpandTip:'Click to preview pasted content',pastedUnpackBtn:'Edit in chat',collapseToPastedBtn:'📋 To Pasted',
 collapseToPastedTip:'Convert long text in chat into a compact Pasted Content card',smartRecBtn:'✦ Recommend',
 smartRecBtnTip:'Recommend the best prompt snippet for the current Main Agent & Subagents context',smartRecAutoLabel:'Auto',
 smartRecAutoTip:'Toggle automatic routine recommendation of prompt snippets based on live context',smartRecBadge:'✦ Recommended',
 customSnippetBadge:'★ Custom',freqUsedBadge:n=> `Used ${n}×`,dragDropOverlayTitle:'Drop file to attach to BTW Studio chat',
 dragDropOverlaySub:'Images, text/code files, logs, or media references',
 overviewAlertLowTip:'Low attention: minor workflow notice in Overview',
 overviewAlertMedTip:'Medium attention: warning or active error in Overview',
 overviewAlertHighTip:'High attention: critical bottleneck or error streak in Overview',plusFilesCatHeader:'📄 Recent Session Files',
 specialistCardTitle:'✦ Agentic Specialist · Session Analysis',specialistAttentionLow:'Healthy',
 specialistAttentionMed:'Moderate Attention',specialistAttentionHigh:'High Attention',
 specialistSelectedHeader:'Best Existing Snippet Selected',specialistSuggestedHeader:'Suggested New Prompt Snippet',
 specialistUseSelectedBtn:'▶ Use Selected',specialistPinSessionBtn:'📌 Session Only',specialistPinSessionDone:'✓ Pinned to Session',
 specialistSavePermBtn:'➕ Save to Snippets',specialistSavePermDone:'✓ Saved to Snippets',sessionOnlyBadge:'⏳ Session Snippet',
 smartRecLoadingLabel:'Analyzing…',specialistScanningTitle:'Agentic Specialist is analyzing the session…',
 specialistScanningSub:'Checking errors, L0 cache efficiency, context window & LLM tool velocity…',
 cardFooterContinueBtn:'💬 Continue in Chat',
 cardFooterContinueTip:'Attach this /btw card to the BTW Studio Chat Composer to continue asking with full context',
 cardFooterSteerBtn:'🎯 Steer Main Agent',
 cardFooterSteerTip:'Attach this /btw card to the Chat Composer to steer the Main Agent (manual or 1-click ✦ Synthesize)',
 cardFooterSpawnBtn:'🤖 Spawn Subagent',
 cardFooterSpawnTip:'Attach this /btw card to the Chat Composer to spawn a dedicated Subagent with this context',
 cardFooterBtwMdBtn:'📘 Save to BTW.md',
 cardFooterBtwMdTip:'Record this diagnostic lesson into Harness² RSI and update the BTW.md playbook',
 cardFooterBtwMdDone:'✓ Saved to BTW.md',attachedBtwBadge:'💬 Attached /btw',modeAskBtwLabel:'💬 Continue /btw',
 modeAskBtwTip:'Ask a follow-up side question in /btw using this attached card as context (zero interruption to Main Agent)',
 modeSteerMainLabel:'🎯 Steer Main Agent',
 modeSteerMainTip:'Send a course-correction directive to the Main Hermes Agent using this /btw card (tracked by Harness² Δτ probe)',
 modeSpawnSubLabel:'🤖 Spawn Subagent',
 modeSpawnSubTip:'Launch an isolated Subagent carrying this /btw context to solve or verify the issue in parallel',
 composerSynthBtn:'✦ Meta-Prompt / Synthesize',composerSynthOptimizeBtn:'⚡ Optimize & Synthesize',
 composerSynthTip:'Merged Meta-Prompt & Steer Engine: optimizes your draft (or auto-generates from scratch) using this /btw card + live session telemetry!',
 composerSynthesizing:'Synthesizing…',steeredBadgeMain:'🎯 Steered',steeredBadgeSub:'🤖 Subagent',
 steeredCalloutTitle:'🎯 Meta-Prompt / Steer Dispatched from this /btw',branchedFromLabel:title=> `↳ Branched from: ${title}`,
 btnAutoSteerMain:'✦ Auto-Steer Main',btnSteerMainNow:'🎯 Steer Main Agent',btnAutoSpawnSub:'✦ Auto-Spawn Subagent',
 btnSpawnSubNow:'🤖 Spawn Subagent',
 placeholderAttachedSteer:'Write what the Main Agent should do with this /btw (or leave empty and click ✦ Synthesize / Auto-Steer)…',
 placeholderAttachedSpawn:'Write the Subagent goal for this /btw (or leave empty and click ✦ Synthesize / Auto-Spawn)…',
 placeholderAttachedAsk:'Ask a follow-up question about this attached /btw…',bannerSizeCompact:'↕ Compact',
 bannerSizeComfortable:'↕ Comfortable',
 bannerSizeTip:'Switch between Compact (bounded height) and Comfortable (expands dynamically to read everything)',
 bannerThemeHost:'🖥 Host',bannerThemeChat:'💬 Chat',bannerThemeStudio:'🎨 Studio',setBannerThemeLabel:'Banner & /btw Chip Style',
 setBannerSizeLabel:'Top /btw Banner Height Mode',deepOverviewBtn:'✦ AI Deep Overview',
 deepOverviewTip:'Run an LLM audit (Fast or Main Model) of Context vs Compression, L0 Cache hit root causes, and session bottlenecks',
 deepOverviewLoading:'Generating deep session audit (Context, Compression, L0 Cache & Bottlenecks)…',playbookCopyBtn:'📋 Copy BTW.md',
 resurfacedApplyBtn:'⚡ Apply Proven Fix',settingsPanelTitle:'BTW Studio Settings',
 subagentLaunchPresets:[{id:'verify',label:'ψ Verify Touched Files',
goal:'Run syntax and unit test verification on all recently touched files and report exact results.',
context:'Touched files: {{touched_files}} | CWD: {{cwd}}'},{id:'security',label:'🛡 Security & SSRF Audit',
goal:'Audit recently modified files for security vulnerabilities, secret leaks, or SSRF risks.',
context:'Touched files: {{touched_files}} | Active branch: {{git_branch}}'},{id:'diagnose',label:'🔬 Diagnose Last Error',
goal:'Investigate the root cause of the latest tool failure and propose a minimal targeted fix.',
context:'Last error: {{last_error}} | Last command: {{last_command}}'},{id:'docs',label:'📝 Summarize Diffs',
goal:'Inspect git diff on touched files and produce a concise technical summary of all changes.',
context:'Touched files: {{touched_files}} | Anomalies: {{anomalies}}'}],
 waitingToStartTitle:'WAITING TO START SESSION',waitingToStartBadge:'Draft · Standby',waitingFocusComposerBtn:'Focus Chat',
 waitingCurveTip:'Click to cycle native @hermes/plugin-sdk mathematical curve animation',
 presetShortLabels:{plan:'Plan',
eta:'Progress & ETA',doing:'Tools',errors:'Errors',cost:'Spend & Tokens',files:'Files',subagents:'Subagents'}
},
 pt:{
 tabAsk:'Perguntar',tabRadar:'Radar',tabCards:n=> `Cards (${n})`,tipClose:'Fechar (Esc)',
 placeholderAsk:'Pergunte qualquer coisa sobre esta sessão…',btnClear:'Limpar',btnAsk:'Perguntar',
 synthesizingFast:'Observador rápido · lendo o state.db · o turno principal segue',
 synthesizingDeep:'Modelo principal · lendo o state.db',emptyTitle:'Nenhuma mensagem lateral nesta sessão ainda',
 emptyDesc:'Clique em qualquer preset acima, crie os seus (+ Novo preset) ou digite sua dúvida. A resposta aparece formatada em Markdown (tabelas, código, negrito) sem poluir o chat.',
 searchPlaceholder:'Buscar nas perguntas e respostas /btw desta sessão…',clearUnpinned:'Limpar não-fixados',
 noCardsFound:'Nenhum card encontrado.',
 interceptTitle:'Quando ativo, digitar /btw no chat envia direto para o BTW Studio sem criar blocos de texto cru no histórico.',
 interceptOn:'Interceptação /btw ativa (chat 100% limpo)',interceptOff:'Interceptação /btw desligada',shortcutLabel:'Atalho:',
 triggerTitle:'BTW Studio — Perguntas rápidas e Radar da sessão (Ctrl+Alt+B ou /btw)',
 answeringParallel:q=> `Respondendo em paralelo: "${q}"`,answerReady:'Resposta pronta',copyAnswer:'Copiar resposta Markdown',
 openStudio:'Abrir Studio',hideBanner:'Ocultar faixa (continua salvo no Studio)',openStatusbarTip:'Abrir BTW Studio (Ctrl+Alt+B)',
 dialogDesc:'Perguntas paralelas e telemetria determinística da sessão',quickQuestionFallback:'Pergunta rápida (/btw)',
 reAskTip:'Perguntar novamente (atualizar)',steerNowTip:'Direcionar o turno em curso com isto (session.steer) — nada é interrompido',
 steerBtnLabel:'Steer',steeredNotify:'Steer entregue — entra após a tool atual',
 quoteInChatTip:'Citar no chat principal para orientar o agente',pinTip:pinned=>(pinned?'Desafixar card':'Fixar card no topo'),
 deleteTip:'Remover card',insertedNotify:'Resposta do /btw inserida no campo de mensagem.',
 copiedNotify:'Citação copiada para a área de transferência.',reportCopiedNotify:'Relatório do Radar copiado (Markdown)',
 inactiveSessionError:'BTW Studio: sessão inativa e backend btw-studio indisponível neste perfil.',
 failedError:msg=> `BTW Studio falhou: ${msg}`,readingTelemetry:'Lendo o state.db (somente leitura · 0 tokens)…',
 statTouchedFiles:'Arquivos tocados',statusRunning:'Executando',statusReady:'Pronta',runningTool:tool=> `Executando tool: ${tool}`,
 generatingResponse:'Gerando raciocínio / resposta…',sessionIdle:'Sessão pronta (Idle)',
 refreshRadarTip:'Reler o state.db · 0 tokens',copyReportTip:'Copiar telemetria completa da sessão como relatório Markdown',
 sparklineTitle:'Curva de Velocidade & Atividade por Turno',anomalyGuardTitle:'Guarda de loops · determinístico · 0 tokens',
 toolDistTitle:'Distribuição de Ferramentas na Sessão',settingsTip:'Aparência & comportamento',hudTitle:'BTW · mini chat',
 hudPlaceholder:'Pergunte sobre esta sessão…',
 hudEmpty:'Pergunte qualquer coisa sobre a sessão visível. As respostas nunca entram no chat.',hudOpenStudio:'Abrir Studio',
 hudNoSession:'Nenhuma sessão ativa visível',hudTabPet:'🐾 Mascote',hudTabTelemetry:'📡 Telemetria',hudTabSettings:'⚙ Opções',
 hudTelemetryActive:'Fluxo Ativo',hudTelemetryIdle:'Em repouso · Monitorando',hudPetSummaryTitle:'Balão de Telemetria do Pet IA',
 hudTriggerSynth:'✦ Inferir Balão',hudTriggerSynthTip:'Sintetizar resumo personalizado de IA baseado na telemetria atual',
 setPetBubbleMode:'Comportamento do Balão do Pet',
 setPetBubbleModeDesc:'Configura como os balões do mascote resumem e inferem ações a partir da telemetria.',
 petBubbleModeNames:{
ai_summary:'✦ IA Personalizada',metric_focus:'📊 Métricas & Custo',action_steer:'⚡ Ação & Steer',minimal:'🔇 Compacto $0'},
 petThinking:'btw · investigando',petDone:'btw · resposta pronta (Ctrl+Alt+B)',
 petLoop:n=> `btw · ${n} erros seguidos — faça um steer pelo composer`,setTheme:'Tema',
 setThemeDesc:'Todo tema usa as variáveis do tema do app: o BTW repinta junto com o seu tema Hermes.',
 themeNames:{orbyx:'🛸 Orbyx',
host:'🖥 Tema do Host',cryo:'❄ Cryo Tactical',paper:'📜 Papel',ai:'🔥 Forja de Cobre',glass:'🪟 Mica',terminal:'📟 Terminal',
minimal:'💬 Web AI Chat',nordic:'🌲 Boreal'},
 setAccent:'Cor de Destaque',setAccentDesc:'Escolha um destaque customizado ou siga a paleta do tema ativo.',
 setAccentClear:'Seguir tema ativo',setDensity:'Densidade',densityNames:{comfortable:'Confortável',compact:'Compacta'},
 setZoom:'Tamanho do Texto',zoomNames:{s:'P',m:'M',l:'G'},setMascotNarrate:'Narração do pet',
 setMascotNarrateDesc:'Falas curtas no balão do pet do Hermes (ctx.pet): pensando, respondeu, alertas de loop, resumo do turno.',
 setIntercept:'Interceptar /btw no composer',setInterceptDesc:'Digitar /btw abre o studio; as respostas ficam fora do transcript.',
 setLang:'Idioma',langAuto:'Auto',
 personaNames:{balanced:'⚖ Equilibrado (Generalista Harmônico)',neurodivergent:'🧬 AuDHD 3e (Monothread & Causa INV/DOM)',
anxious:'⚡ TDAH Flash (Alta Saliência & Ação Imediata)',technical:'🧩 Sistemático TEA (Literal [D0/D2] & Matrizes Visuais)',
kawaii:'🎨 Pensador Visual (Dual-Coding, Tabelas & ASCII)',harness_rsi:'🏛 Profundo / RSI (Sistemas, Cache L0 & Δτ)',
custom:'✍ Lente Cognitiva Personalizada…'},
 personaHints:{balanced:
'Equilíbrio harmônico (65% em todos os eixos): síntese executiva clara, tabela GFM concisa quando útil e 1–2 próximos passos.',
neurodivergent:
'Calibragem AuDHD 2e/3e: blindagem monothread (↳ 1 Único Passo, 96%) + andaime estrutural (📐 90%) + clareza visual (🎨 80%) + causalidade de duplo escopo (🎯 INV/DOM, 78%).',
anxious:
'Blindagem TDAH contra cegueira temporal e sobrecarga de memória de trabalho: máx. 3 linhas de alto contraste (🟢 Status · 🚨 Gargalo · 🛠 Fix em 1 linha).',
technical:
'Hiper-Sistematização & Enhanced Perceptual Functioning (TEA): alta estrutura visual-espacial (86% Visual: matrizes GFM e grafos [A] ──► [B]) + 98% de rigor literal [D0:FATO MEDIDO] vs [D2:HIPÓTESE].',
kawaii:
'Domínio Visuoespacial (Dual-Coding de Paivio & Mayer, 98% Visual): converte explicações em tabelas GFM, diagramas topológicos ASCII, callouts e badges semânticos.',
harness_rsi:
'Alta Need-for-Cognition & Engenharia de Sistemas (98% Profundo + 76% Visual): auditoria exaustiva de causas-raízes, mecânica de cache L0, utilidade U(p), contraste Δτ e alavancas C0–C6.'
},
 setPersona:'Lente Cognitiva (Studio & Mascote)',
 setPersonaDesc:'Unifica o estilo de leitura das respostas /btw, do Overview Profundo e do mascote.',
 setCustomPersona:'Descreva sua lente cognitiva (≤ 400 caracteres)',setSynth:'Motor de resumo',
 synthNames:{facts:'Fatos $0',llm:'✦ IA (modelo rápido)',fast:'$0 determinístico'},setRecap:'Resumo ao fim do turno',
 recapNames:{off:'Desligado',facts:'$0 fatos',llm:'✦ voz IA'},setTtl:'Duração da fala',
 ttlNames:{6:'6 s',12:'12 s',20:'20 s',30:'30 s'},previewBubble:'Testar fala do pet',petOnScreen:'Pet na tela',
 previewText:'⚡ Status: 10/10 testes verdes · zero regressão.\n🎯 Fato: state.db somente-leitura ($0).\n↳ Foco: seguir no fluxo sem ruído.',
 previewTexts:{balanced:
'⚖ Síntese: 10/10 testes verdes · Cache L0 em 96.7% ($0 somente-leitura).\n📊 Contexto: 0 erros em 4 tool calls · prefixo estável.\n↳ Próximo passo: Pronto para commit ou validação.',
neurodivergent:
'⚡ Agora: 10/10 testes verdes · turno em background.\n🎯 Causa (INV/DOM): [INV] Side-channel ativo ($0) ──► [DOM] state.db=ro · cache=96.7%.\n↳ Único Próximo Passo: 1 ação por vez, zero ruído.',
anxious:
'🟢 Status: 10/10 testes verdes · cache 96.7% (0.43s).\n🚨 Gargalo: Edição pendente em plugin.js.\n🛠 Fix em 1 Linha: Rodar pytest antes do commit.',
technical:
'[D0:FATO MEDIDO] suite=10/10 (0.43s) · cache_hit=96.7% · state.db=ro\n[CAUSA ──► EFEITO] [Alavanca C6_Skill] ──► [0 anomalias] ──► [ESTADO: NOMINAL]\n[D2:HIPÓTESE] 0 inferências não verificadas · contrato verificado',
kawaii:
'┌─ 📊 Matriz de Telemetria Visual ──────┐\n│ 🟢 Testes: 10/10   ⚡ Cache: 96.7% ($0) │\n└──────────────┬────────────────────────┘\n               └──► ✨ Pronto para avançar!',
harness_rsi:
'🏛 Auditoria Profunda: Compressão nominal (42% ctx) · Cache L0 em 96.7% de hit.\n📊 Contraste Δτ: U(preset)=+0.92 em 4 tool calls · zero regressões.\n🧠 Playbook: Regra verificada sincronizada no BTW.md.',
custom:'✦ Lente cognitiva 5D/6D personalizada ativa! Sistemas nominais, 10/10 testes verdes — o próximo movimento é seu.'},
 setErrorStreak:'Avisar após N erros seguidos de tools',setCostLimit:'Avisar quando o custo da sessão passar (USD, 0 = off)',
 setTokenLimit:'Avisar quando tokens de entrada passarem (k, 0 = off)',alertCost:v=> `Gasto da sessão passou de $${v} — seguimos?`,
 alertTokens:v=> `Contexto passou de ${v}k tokens de entrada — considere /compact.`,setPresent:'Modo apresentação',
 setPresentDesc:'Texto maior e contraste mais forte em todas as superfícies BTW, para demos e gravação de tela.',
 exportBtn:'Exportar .md',exportTip:'Salvar estes cards /btw como nota Markdown (escolha a pasta uma vez, ex.: seu cofre Obsidian)',
 exportDone:(name,folder)=> `Salvo ${name} → ${folder}`,compareA:'Sessão A',compareB:'Sessão B',compareMetric:'Métrica',
 compareEmpty:'Escolha duas sessões para comparar ($0, SQLite somente leitura).',activePlanTitle:'Plano Ativo (Todo List)',
 recentErrorsTitle:'Últimos Erros / Timeouts de Ferramentas',subagentsTitle:n=> `Subagentes Delegados (${n})`,
 recentCmdsTitle:'Últimos Comandos de Terminal',recentFilesTitle:'Arquivos Recentes na Sessão',
 microActionLabel:'Pergunta rápida (/btw)',alertStripSteer:'Steer',alertStripDismiss:'Dispensar',
 answeredIn:s=> `respondido em ${s}`,zeroTokens:'somente leitura · 0 tokens',attachMenuLabel:'BTW Studio — Pergunta Rápida (/btw)',
 contextMenuLabel:'Perguntar ao /btw sobre este trecho',contextMenuPrefill:text=> `Sobre este ponto ("${text}"): `,
 addPresetBtn:'Novo preset',addPresetTip:'Criar um botão de preset /btw personalizado para perguntas repetidas',
 editPresetTip:'Editar preset',deletePresetTip:'Deletar preset',restorePresetsBtn:n=> `Restaurar padrões (${n})`,
 restorePresetsTip:'Restaurar os presets originais que foram removidos',presetEditorNewTitle:'Novo Preset /btw',
 presetEditorEditTitle:'Editar Preset /btw',presetIconLabel:'Ícone',
 presetNamePlaceholder:'Nome curto do botão (ex.: Testes & Lint)…',presetDescPlaceholder:'Descrição curta opcional (tooltip)…',
 presetPromptPlaceholder:'Pergunta /btw completa que será enviada ao clicar…',presetSaveBtn:'Salvar preset',
 presetCancelBtn:'Cancelar',presetSavedNotify:label=> `Preset "${label}" salvo.`,
 presetDeletedNotify:label=> `Preset "${label}" removido.`,presetRestoredNotify:'Presets padrões restaurados.',
 saveDraftAsPresetBtn:'+ Preset',saveDraftAsPresetTip:'Salvar esta pergunta como botão rápido de preset',
 saveCardAsPresetTip:'Transformar esta pergunta em botão de preset rápido',repeatedBtwBadge:n=> `Repetida ${n}× · + Virar preset`,
 secPresets:'Presets Rápidos',presetsManageDesc:'Personalize os botões de 1 clique com os /btw que você mais repete.',
 moveUpTip:'Mover para trás',moveDownTip:'Mover para frente',
 presets:[{id:'plan',icon:'checklist',label:'Fase & Plano',
desc:'Auditar aderência ao plano e etapa atual',prompt:
'Responda de forma cirúrgica e estruturada: você está seguindo o plano combinado? Em qual fase/etapa exata está agora e o que falta para concluir?'
},{id:'eta',icon:'watch',label:'Progresso & ETA',desc:'Progresso quantificado e estimativa realista de término',prompt:
'Qual o progresso quantificado até agora (itens processados, etapas prontas) e qual a estimativa realista de tempo (ETA) para terminar?'
},{id:'doing',icon:'pulse',label:'O que faz agora?',desc:'Explicar a ferramenta ou comando rodando neste instante',prompt:
'O que exatamente você está executando neste exato segundo (qual ferramenta/comando, em qual arquivo e com qual objetivo imediato)?'},
{id:'errors',icon:'warning',label:'Erros & Gargalos',desc:'Resumo de falhas, timeouts e contornos aplicados',prompt:
'Resumo objetivo de erros, falhas, timeouts ou anomalias encontrados até agora nesta sessão e como foram ou estão sendo contornados.'
},{id:'cost',icon:'dashboard',label:'Gasto & Tokens',desc:'Custo USD, chamadas de API e eficiência de cache',prompt:
'Quanto já foi gasto (custo em USD/API, chamadas de modelo, tokens de entrada/saída e eficiência de cache) até este exato momento?'},{
id:'files',icon:'files',label:'Arquivos Tocados',desc:'Listar arquivos criados/editados e mudanças',prompt:
'Liste os arquivos criados ou modificados nesta sessão até agora e resuma em 1 linha o que mudou em cada um.'}],
 tabLearn:'Aprender',tabMesh:n=>(n>0? `Malha (${n})` :'Malha'),flightNames:{calm:'Calmo',watch:'Atenção',act:'Agir'},
 flightSub:{
calm:'Nenhum loop, edição sem verificação, subagente mudo ou estagnação · 0 tokens',
watch:n=> `${n} ${n===1?'sinal':'sinais'} para conferir · nada está travado`,
act:n=> `${n} ${n===1?'achado grave':'achados graves'} · faça o steer antes de falhar`},
 healthLabel:'saúde',steeringNow:'Sonda de steer aberta — medindo Δτ nas próximas 3 tools',sealObserved:'Observado · D0',
 sealObservedTip:'Medido no state.db (somente leitura) e nos hooks — sem modelo, $0',sealHypo:'IA · D2',
 sealHypoTip:'Resposta do modelo ancorada no snapshot do state.db — hipótese até verificar',
 scopeNames:{INV:'INV · como o agente trabalha',DOM:'DOM · fato do workspace'},
 leverTip:(lever,name,why)=> `Correção durável mais barata: ${lever} ${name}. ${why}`,
 learnedBefore:'Aprendido antes · com evidência',
 verdictNames:{
helped:'ajudou',self_recovered:'auto-recuperou',hurt:'piorou',no_observed_effect:'sem efeito',confounded:'confundido'},
 followUpTip:'Continuar em thread (este Q&A vira contexto)',followingUp:q=> `Continuando: ${q}`,
 cancelFollowUp:'Cancelar continuação',promoteBtn:'Promover',
 promoteTip:'Transformar em conhecimento durável — nada é enviado sem sua revisão',
 promoteSkill:'Skill via /learn (com trigger line)',promoteMemory:'Fato curto na memória (sempre ativo)',
 promoteLesson:'Lição na biblioteca BTW ($0)',promotePreset:'Preset de 1 clique',
 promotedNotify:'Rascunho no composer — revise e envie',lessonSavedNotify:'Lição salva na biblioteca BTW',
 learnedNotify:cue=> `BTW aprendeu: ${cue}`,tokensLabel:'Contexto vivo',
 tokensTip:'Insere um valor vivo, resolvido no envio (≤ 400 caracteres, segredos mascarados)',resolvedPreview:'Resolve agora para',
 lintUnknown:list=> `Token(s) desconhecido(s): ${list}`,tokensResolved:'tokens vivos',kpiHelpRate:'Taxa de ajuda Steer',
 kpiProbes:'Steers medidos',
 learnEmpty:'Ainda sem resultados de steer. Faça um steer a partir de um alerta ou card /btw: o BTW observa as próximas 3 tools e só guarda a lição quando o contraste prova que ajudou.',
 howSteps:['Observa — detectores $0 leem o state.db durante o turno.',
'Steer — 1 clique envia session.steer; o BTW fotografa o e⁰.',
'Mede — as próximas 3 tools decidem: ajudou · piorou · sem efeito · confundido.',
'Guarda — só lições provadas entram na biblioteca; as confundidas nunca.'],
 lessonsTitle:'Biblioteca de lições · só com evidência',lessonToSkill:'Rascunhar skill a partir desta lição',
 lessonDelete:'Esquecer esta lição',yieldTitle:'Rendimento dos presets',
 pruneHint:'Sugeridos para podar (pioraram mais do que ajudaram, ou parados há 30 dias)',packsTitle:'Pacotes de presets',
 packInstall:'Instalar',packAdded:n=> `${n} preset(s) adicionado(s)`,packExport:'Copiar meus presets como pacote',
 packExported:'JSON do pacote copiado',packImportPlaceholder:'Cole um JSON btw-studio.preset-pack/1 para importar…',
 packImportBtn:'Importar',packImported:(n,r)=> `${n} preset(s) importado(s)${r? ` · ${r} barrado(s) pelo gate de template` :''}`,
 rowBadgeTip:(cards,pinned,alert)=>
`BTW: ${cards} card(s)${pinned? `, ${pinned} fixado(s)` :''}${alert?' · alerta de loop':''}`,
 tabSubagents:n=>(n>0? `Subagentes (${n})` :'Subagentes'),subagentsEmptyTitle:'Nenhum subagente delegado nesta sessão ainda',
 subagentsEmptyDesc:'Quando o agente principal delegar tarefas via delegate_task, os subagentes aparecem aqui em tempo real com transcript ao vivo, telemetria $0, perguntas /btw e comando sintetizado via subagent.steer.',
 subagentStatusRunning:'RODANDO',subagentStatusDone:'CONCLUÍDO',subagentStatusFailed:'FALHOU',subagentInterruptBtn:'Parar',
 subagentInterruptedNotify:id=> `Sinal de parada enviado ao subagente ${id}.`,
 subagentSteerSentNotify:id=> `Steer enfileirado no subagente ${id} (entra após a tool atual).`,
 subagentMiniChatPlaceholder:'Comande ou faça steer neste subagente (ex.: "foque só no auth.py e pule testes lentos")…',
 cardMiniChatBtn:'Comandar / Steer',cardMiniChatTip:'Abrir mini-chat de Comando & Steer com IA baseado no contexto deste card /btw',
 cardMiniChatTitle:'Mini-Chat Sintetizador de Comando & Steer',
 cardMiniChatPlaceholder:'Digite o que o agente deve fazer com base neste card (ex.: "corrija esse erro e rode pytest")…',
 cardMiniChatTargetLabel:'Alvo:',cardMiniChatTargetMain:'Agente Principal (Main Chat)',cardMiniChatSynthBtn:'✦ Sintetizar Comando',
 cardMiniChatSynthesizing:'Sintetizando comando cirúrgico com base no card + telemetria…',
 cardMiniChatPreviewLabel:'Comando sintetizado pela IA (editável antes de enviar):',cardMiniChatSendSteer:'⚡ Steer no Turno em Voo',
 cardMiniChatSendComposer:'↵ Inserir no Chat Principal',cardMiniChatSendSubagent:'⚡ Steer no Subagente',
 cardMiniChatDirectSteer:'Steer Direto',learnAddLessonBtn:'+ Nova lição',
 learnAddLessonTitle:'Registrar lição validada na biblioteca (Harness² R_t)',
 learnCuePlaceholder:'Quando esta situação ocorrer (gatilho / cue)…',
 learnLessonPlaceholder:'Execute esta ação ou verificação concreta (lição)…',learnSaveLessonBtn:'Salvar lição',
 setStockSafePet:'Balão compacto ≤120 chars (Hermes Oficial)',
 setStockSafePetDesc:'Padrão LIGADO: linha única ≤114 chars para nunca cortar palavras no Hermes Desktop oficial. Desligue apenas se usar build estendida.',
 previewTextCompact:'⚡ 10/10 testes verdes · state.db=ro ($0) · pronto pro próximo passo.',
 previewTextsCompact:{
neurodivergent:'🧭 10/10 verdes · state.db=ro ($0) · ↳ Foco: 1 passo por vez.',
anxious:'⚡ Flash: 10/10 verdes · cache=96.7% · 0 bloqueios · pronto.',
technical:'[D0:OK] suite=10/10 · cache=96.7% · db=ro · anomalias=0',kawaii:'[🟢 10/10] ──► [⚡ Cache 96.7%] ──► ✨ Pronto!',
harness_rsi:'🏛 Profundo: ctx=42% · cache=96.7% · U(preset)=+92% · Δτ nominal',
custom:'✦ Lente personalizada ativa · 10/10 testes verdes ($0).'},
 viewMenuLabel:'Opções de visualização e janela',viewMenuWide:'Popover largo (880px)',viewMenuCompact:'Popover compacto (640px)',
 viewMenuModal:'Abrir Studio Completo (Modal 940px)',viewMenuHud:'Alternar Mini-Chat Flutuante',
 viewMenuPin:pinned=>(pinned?'Desafixar popover':'Fixar popover aberto'),sealHeuristic:'Regra · D1',
 sealHeuristicTip:'Regra determinística sobre o state.db ($0, sem LLM) — verifique antes de agir',
 starterTryBtn:'Testar em 1 clique: Fase & Plano',cardsEmptyTitle:'Nenhum card /btw salvo ainda',
 cardsEmptyDesc:'Toda pergunta e resposta /btw fica salva aqui com tabelas GFM, código destacado, fixação no topo e exportação Markdown.',
 steerContextLimit:'O contexto está ficando grande. Conclua a etapa atual de forma concisa e considere compactar.',
 steerLoopStreak:'Pare de repetir o mesmo passo com falha. Diagnostique a causa raiz no último erro antes e tente outra abordagem.',
 invalidJsonError:'JSON inválido ou acima do limite (máx. 64 KB).',compareBtnLabel:'Comparar Sessões',
 compareBackBtn:'← Voltar ao Radar',
 moreActionsTip:'Mais ações do card (continuar em thread, atualizar, citar, virar preset, excluir)',
 demoLoadBtn:'✦ Carregar Vitrine Interativa',demoExitBtn:'Sair da Vitrine',demoBadge:'VITRINE DEMO',probeMeasuringLabel:'medindo',
 probeClosedLabel:'fechada',probeMeasuringReason:'Medindo Δτ nas próximas 3 tools…',probeExpiredReason:'Janela da sonda expirou.',
 sparklineMeta:(turns,peak)=> `${turns} turnos · pico ${peak} tools/turno`,liveToolsUnit:'tools',liveCachePrefix:'Cache ',
 customBadgeLabel:'personalizado',cmdRunningLabel:'rodando',cmdDoneLabel:'concluído',
 compareRows:{model:'Modelo',elapsed_seconds:'Tempo decorrido',messages:'Mensagens',
tool_calls:'Chamadas de tools',api_calls:'Chamadas LLM',errors:'Erros',anomalies:'Anomalias',input:'Tokens de entrada',
output:'Tokens de saída',cache_hit_pct:'Taxa de cache',cost_usd:'Custo USD',files:'Arquivos tocados'},
 errResolvedBadge:'✓ auto-corrigido',errActiveBadge:'⚠ ativo',
 steerObsoleteRecoveredNotify:'O modelo já se auto-recuperou desse erro — Lição registrada automaticamente na aba Aprender ($0)!',
 subagentThoughtLabel:'Pensamento (CoT)',subagentReplyLabel:'Resposta / Síntese',subagentGoalLabel:'Missão Delegada',
 subagentSteerLabel:'Steer Injetado',subagentFeedEmpty:'Aguardando primeiro bloco de raciocínio ou chamada de ferramenta…',
 settingsModeBasic:'✨ Básico',settingsModeAdvanced:'⚙ Avançado',
 settingsModeBasicDesc:'Controles visuais, fluxo /btw e mascote essenciais para o dia a dia — zero poluição.',
 settingsModeAdvancedDesc:'Cockpit de engenharia completo: hooks desktop, ψ-verify AST, tetos de alerta, overrides LLM, presets e RSI.',
 switchToAdvancedBtn:'Abrir Cockpit Avançado de Engenharia (Telemetria, Modelos, Subagentes, Presets & RSI) →',
 switchToBasicBtn:'← Voltar para Configurações Básicas',secVisualThemes:'Motor Visual & Temas',
 secCoreWorkflow:'Fluxo Side-Channel (/btw)',secDesktopHooks:'Hooks Desktop & Posicionamento',
 secSafetyRadar:'Telemetria, Radar de Segurança & Tetos de Alerta',secFastObserver:'Observador Rápido LLM & Overrides de Endpoint',
 secRsiEngine:'Auto-Aprimoramento Harness² RSI',secMascotDeep:'Lente Cognitiva & Mascote Companheiro',
 themeSubtitles:{orbyx:'Visor Obsidiana & Giroscópio',
host:'Hermes Desktop Nativo',cryo:'Datapad Tático de Gelo',paper:'Pergaminho Pautado & Tinta',ai:'Carbono & Cobre Solar',
glass:'Acrílico Translúcido',terminal:'CRT Fósforo & ASCII',minimal:'Chat Web Minimalista',nordic:'Pinho Noturno & Menta'},
 setAskModeDefault:'Motor Padrão do /btw',
 setAskModeDefaultDesc:'Rápido responde em ~1.8s via slot auxiliar; Principal usa o modelo de raciocínio.',
 setShowBanner:'Exibir Faixa Superior no Composer',
 setShowBannerDesc:'Mostra prévia de respostas /btw e alertas do Loop-Guard acima da caixa de mensagem.',
 setShowStatusChip:'Exibir Chip na Barra de Status',
 setShowStatusChipDesc:'Mostra o indicador vivo do BTW Studio na barra inferior do Hermes Desktop.',
 setMaxHistory:'Retenção de Histórico por Sessão',setMaxHistoryDesc:'Limite máximo de cards /btw salvos por sessão (5–200).',
 setPsiVerify:'ψ-Verify Checagem AST & Sintaxe',
 setPsiVerifyDesc:'Valida sintaxe AST Python e JSON nos arquivos editados sem executar código ($0).',
 setScanSiblings:'Escanear Perfis Irmãos (state.db)',
 setScanSiblingsDesc:'Permite ler state.db de outros perfis Hermes (somente leitura) no Comparador de Sessões.',
 setFastModel:'Override de Modelo Rápido (Slug)',setFastBaseUrl:'Endpoint Base URL Customizado (HTTPS ou Loopback)',
 setFastBaseUrlPlaceholder:'ex.: https://api.openai.com/v1 ou http://localhost:8000/v1',pingTestingLabel:'Testando…',
 setRsiLearning:'Aprendizado Harness² RSI & Contraste Δτ',
 setRsiLearningDesc:'Mede automaticamente o contraste Δτ nas 3 tools pós-steer e retém lições provadas.',
 exportLessonsBtn:'Exportar Lições JSON',
 lessonsExportedNotify:'JSON da biblioteca de lições RSI copiado para a área de transferência.',
 spatialLayoutLabel:'Organização Espacial',
 spatialNames:{auto:'Auto (Inteligente)',split:'◫ Cockpit Dividido',single:'▭ Painel Único'},
 companionMoodTip:'Humor Reativo do Mascote · Clique para inferir balão IA com a telemetria atual',
 launchSubagentBtn:'+ Lançar Subagente',launchContextPlaceholder:'Contexto adicional ou restrições (suporta {{tokens}} vivos)…',
 launchDispatchBtn:'🚀 Despachar Subagente',launchingSubagentLabel:'Despachando…',
 subagentLaunchedNotify:id=> `Subagente delegado lançado (${id}).`,
 steerTargetSpawnSubagent:'⚡ Criar Novo Subagente (ctx.subagent_lifecycle)',cardMiniChatSendSpawn:'🚀 Criar Subagente com Missão',
 anomalySpawnFixBtn:'🤖 Subagente Fix',cancelBtn:'Cancelar',petTelemetryTitle:'Fluxo de Telemetria do Mascote',
 petLoopAlertTitle:n=> `Alerta de Loop (${n} erros)`,petRecapTitle:'Resumo do Turno',petReinfer:'Re-inferir',
 petEmptyStream:'Pergunte algo ou clique em Inferir Balão para sintetizar a telemetria viva da sessão.',
 petBehaviorTitle:'Comportamento & Gatilhos do Mascote',hudTurnRunning:'Turno do agente em execução…',
 hudNoRecentTools:'Nenhuma execução de ferramenta registrada neste turno ainda.',uiModeMinimal:'Básico',
 uiModeTelemetric:'Telemétrico',
 uiModeMinimalTip:'Modo Minimalista (Básico): foco puro em perguntas e respostas /btw — zero sobrecarga cognitiva',
 uiModeTelemetricTip:'Modo Telemétrico (Avançado): Flight Deck completo, Radar, Subagentes CoT, Harness² RSI e Cockpit Telemétrico',
 demoBtnShort:'✦ Demo',demoBtnTip:'Alternar Vitrine Interativa em todas as abas ($0, zero tokens)',
 ctxWindowTitle:'Ocupação da Janela de Contexto',cacheSavedBadge:v=> `Poupou $${v} via Cache`,attachBtnLabel:'📎 Anexar',
 attachImageItem:'🖼 Imagem / Screenshot…',attachFileItem:'📄 Arquivo do Disco…',
 attachWorkspaceFolderItem:'📁 Pasta do Workspace da Sessão (cwd)',attachGrantedFolderItem:'📁 Escolher Pasta (ctx.files)…',
 attachPasteItem:'📋 Colar Área de Transferência como Snippet',attachUrlItem:'🌐 Anexar URL de Referência…',
 mentionSessionBtn:'@Sessão',mentionSessionTip:'Mencionar outra sessão do Hermes (@session) para comparar ou puxar contexto no /btw',
 pastedChipLabel:(lines,chars)=> `Colado · ${lines} linhas (${fmtCompact(chars)} chars)`,subagentFeedCompactBtn:'🧠 CoT & Tools',
 tabBasicOverview:'Visão Geral',placeholderAskBasic:'Pergunte qualquer coisa sem interromper o agente…',
 basicHealthyTitle:'Fluxo de trabalho saudável',basicHealthySub:'Nenhum gargalo ou erro pendente nesta sessão.',
 basicProgressLabel:(done,total)=> `Progresso · ${done}/${total} concluídos`,basicFixNowBtn:'⚡ Corrigir agora',
 basicDiagnoseBtn:'💬 Diagnosticar',plusBtnTip:'Adicionar anexos ou inserir snippets de prompt (+)',
 plusSnippetsHeader:'⚡ Snippets de Prompt (Presets)',plusAttachHeader:'📎 Anexar Contexto',plusRunNowBtn:'Rodar',
 plusInsertTip:'Clique para inserir o snippet no chat · clique em Rodar para enviar agora',presetHoverBadge:'Snippet /btw',
 presetHoverPromptLabel:'PROMPT',presetHoverHint:'Clique para perguntar · Shift+Clique para editar no chat',pastedBadge:'COLADO',
 pastedTitle:'Conteúdo Colado',pastedMeta:(lines,chars)=> `${lines} linhas · ${fmtCompact(chars)} chars`,
 pastedExpandTip:'Clique para inspecionar o conteúdo colado',pastedUnpackBtn:'Editar no chat',collapseToPastedBtn:'📋 Virar Colado',
 collapseToPastedTip:'Converter texto longo do chat em um card compacto de Conteúdo Colado',smartRecBtn:'✦ Recomendar',
 smartRecBtnTip:'Recomendar o melhor snippet de prompt para o contexto atual do Agente Principal e Subagentes',
 smartRecAutoLabel:'Auto',smartRecAutoTip:'Alternar recomendação automática e rotineira de snippets conforme o contexto da conversa',
 smartRecBadge:'✦ Recomendado',customSnippetBadge:'★ Seu Snippet',freqUsedBadge:n=> `Usado ${n}×`,
 dragDropOverlayTitle:'Solte o arquivo para anexar ao chat do BTW Studio',
 dragDropOverlaySub:'Imagens, códigos, textos, logs ou referências de mídia',
 overviewAlertLowTip:'Atenção baixa: aviso leve de fluxo de trabalho na Visão Geral',
 overviewAlertMedTip:'Atenção moderada: alerta ou erro recente na Visão Geral',
 overviewAlertHighTip:'Atenção alta: gargalo crítico ou sequência de erros na Visão Geral',
 plusFilesCatHeader:'📄 Arquivos Recentes da Sessão',specialistCardTitle:'✦ Especialista Agêntico · Análise da Sessão',
 specialistAttentionLow:'Saudável',specialistAttentionMed:'Atenção Moderada',specialistAttentionHigh:'Atenção Crítica',
 specialistSelectedHeader:'Melhor Snippet Existente Selecionado',specialistSuggestedHeader:'Novo Prompt Snippet Sugerido',
 specialistUseSelectedBtn:'▶ Usar Selecionado',specialistPinSessionBtn:'📌 Só nesta Sessão',
 specialistPinSessionDone:'✓ Fixado na Sessão',specialistSavePermBtn:'➕ Salvar nos Snippets',
 specialistSavePermDone:'✓ Salvo nos Snippets',sessionOnlyBadge:'⏳ Snippet da Sessão',smartRecLoadingLabel:'Analisando…',
 specialistScanningTitle:'Especialista Agêntico analisando a sessão…',
 specialistScanningSub:'Verificando erros, eficiência de cache L0, janela de contexto e performance da LLM…',
 cardFooterContinueBtn:'💬 Continuar no Chat',
 cardFooterContinueTip:'Anexar este /btw ao chat do BTW Studio para continuar perguntando com todo o contexto',
 cardFooterSteerBtn:'🎯 Steer Main Agent',
 cardFooterSteerTip:'Anexar este /btw ao chat para enviar comando ao Agente Principal (manual ou ✦ Synthesize automático)',
 cardFooterSpawnBtn:'🤖 Spawn Subagente',
 cardFooterSpawnTip:'Anexar este /btw ao chat para lançar um Subagente dedicado com este contexto',
 cardFooterBtwMdBtn:'📘 Salvar no BTW.md',
 cardFooterBtwMdTip:'Registrar a lição deste diagnóstico no Harness² RSI e atualizar o playbook BTW.md',
 cardFooterBtwMdDone:'✓ Salvo no BTW.md',attachedBtwBadge:'💬 /btw Anexado',modeAskBtwLabel:'💬 Continuar /btw',
 modeAskBtwTip:'Continuar perguntando no canal /btw usando este card anexado como contexto (sem interromper o agente principal)',
 modeSteerMainLabel:'🎯 Steer Main Agent',
 modeSteerMainTip:'Enviar comando ou ajuste de rota ao Agente Principal do Hermes com base neste /btw (testado via sonda Δτ no Harness²)',
 modeSpawnSubLabel:'🤖 Spawn Subagente',
 modeSpawnSubTip:'Lançar um Subagente isolado carregando o contexto deste /btw para resolver ou auditar em paralelo',
 composerSynthBtn:'✦ Meta-Prompt / Sintetizar',composerSynthOptimizeBtn:'⚡ Otimizar & Sintetizar',
 composerSynthTip:'Motor Unificado de Meta-Prompt & Steer: otimiza seu rascunho (ou gera automaticamente) usando este /btw + telemetria ativa da sessão!',
 composerSynthesizing:'Sintetizando…',steeredBadgeMain:'🎯 Steered',steeredBadgeSub:'🤖 Subagente',
 steeredCalloutTitle:'🎯 Meta-Prompt / Steer Enviado a partir deste /btw',branchedFromLabel:title=> `↳ Ramificado de: ${title}`,
 btnAutoSteerMain:'✦ Auto-Steer Main',btnSteerMainNow:'🎯 Steer Main Agent',btnAutoSpawnSub:'✦ Auto-Spawn Subagente',
 btnSpawnSubNow:'🤖 Spawn Subagente',
 placeholderAttachedSteer:'Escreva o que o Main Agent deve fazer com este /btw (ou deixe vazio e clique em ✦ Synthesize / Auto-Steer)…',
 placeholderAttachedSpawn:'Escreva o objetivo do Subagente para este /btw (ou deixe vazio e clique em ✦ Synthesize / Auto-Spawn)…',
 placeholderAttachedAsk:'Faça uma pergunta de continuação sobre este /btw anexado…',bannerSizeCompact:'↕ Compacto',
 bannerSizeComfortable:'↕ Confortável',
 bannerSizeTip:'Alternar entre modo Compacto (altura limitada) e Confortável (expande dinamicamente para ler tudo sem cortes)',
 bannerThemeHost:'🖥 Host',bannerThemeChat:'💬 Chat',bannerThemeStudio:'🎨 Studio',setBannerThemeLabel:'Estilo do Banner & Chip /btw',
 setBannerSizeLabel:'Modo de Altura do Banner /btw',deepOverviewBtn:'✦ Overview Profundo com IA',
 deepOverviewTip:'Executar auditoria com IA (Rápido ou Principal) analisando Contexto vs Compressão, causas do Cache L0 e gargalos',
 deepOverviewLoading:'Gerando diagnóstico profundo da sessão (Contexto, Compressão, Cache L0 & Gargalos)…',
 playbookCopyBtn:'📋 Copiar BTW.md',resurfacedApplyBtn:'⚡ Aplicar Correção Validada',settingsPanelTitle:'Configurações do BTW Studio',
 subagentLaunchPresets:[{id:'verify',label:'ψ Verificar Arquivos Tocados',
goal:'Executar verificação de sintaxe e testes unitários nos arquivos modificados e reportar os resultados.',
context:'Arquivos tocados: {{touched_files}} | Diretório: {{cwd}}'},{id:'security',label:'🛡 Auditoria Segurança & SSRF',
goal:'Auditar arquivos modificados em busca de vulnerabilidades, vazamento de segredos ou riscos de SSRF.',
context:'Arquivos tocados: {{touched_files}} | Branch: {{git_branch}}'},{id:'diagnose',label:'🔬 Diagnosticar Último Erro',
goal:'Investigar a causa raiz da última falha de ferramenta e propor correção cirúrgica mínima.',
context:'Último erro: {{last_error}} | Último comando: {{last_command}}'},{id:'docs',label:'📝 Resumir Diffs',
goal:'Inspecionar o git diff dos arquivos tocados e gerar um resumo técnico objetivo das alterações.',
context:'Arquivos tocados: {{touched_files}} | Anomalias: {{anomalies}}'}],
 waitingToStartTitle:'WAITING TO START SESSION',waitingToStartBadge:'Rascunho · Em Espera',waitingFocusComposerBtn:'Focar no Chat',
 waitingCurveTip:'Clique para alternar a curva matemática nativa do @hermes/plugin-sdk',
 presetShortLabels:{plan:'Plano',
eta:'Progresso & ETA',doing:'Tools',errors:'Erros',cost:'Custo & Tokens',files:'Arquivos',subagents:'Subagentes'}
}
}
function t(){return I18N[$lang.get()]||I18N.en}
const LP=':is(:root.light,[data-theme="light"],[data-btw-theme="paper"],:root.dark [data-btw-theme="paper"])'
const LPT=':is(:root.light [data-btw-theme],[data-theme="light"] [data-btw-theme],[data-btw-theme="paper"],:root.dark [data-btw-theme="paper"])'
const PAPER=':is([data-btw-theme="paper"],:root.dark [data-btw-theme="paper"],[data-theme="dark"] [data-btw-theme="paper"])'
const BS=':is(.btw-studio-popover,.btw-studio-dialog,.btw-set-panel,.btw-hud,.btw-composer-banner,.btw-trigger-pill,.btw-live-voice-banner,.btw-statusbar-chip,[data-btw-portal])'
const TCARDS='.btw-studio-head,.btw-preset-btn,.btw-preset-add-btn,.btw-preset-editor,.btw-ask-box,.btw-qa-card,.btw-basic-md-overview,.btw-subagent-card,.btw-set-card,.btw-mascot-stage,.btw-ternary-card,.btw-kpi,.btw-flight,.btw-bubble'
const SEL_PROSE=':is(.btw-selectable-prose,.btw-composer-banner-body,.btw-qa-body,.btw-steered-callout,.btw-subagent-md,.btw-basic-md-overview,.btw-lesson-bento-body,.btw-bubble,.btw-diff-box,.btw-pasted-preview)'
const DIF='display:inline-flex;align-items:center'
const DFC='display:flex;flex-direction:column'
const DFB='display:flex;align-items:center;justify-content:space-between'
const VTP='var(--ui-text-primary)',VTS='var(--ui-text-secondary)',VTT='var(--ui-text-tertiary)',VST='var(--ui-stroke-secondary)',VAC='var(--ui-accent)',VBA='var(--btw-accent)',VBG='var(--ui-bg-elevated)'
const CSS=`
:root{--btw-host-accent:#38bdf8}
${LIGHT_HOST}{--btw-host-accent:#0284c7}
.btw-studio-popover{container-type:inline-size;container-name:btwsurface;--btw-r-lg:14px;--btw-r-md:11px;--btw-r-sm:7px;--btw-s0:#0b101d;--btw-s1:${mixTxt(4,'#111827')};--btw-s2:${mixTxt(7.5,'#162033')};--btw-b1:${mixAcc(32,VST)};--popover-surface:var(--btw-s0,#0b101d);--btw-fg-muted:${mixTxt(76,'#0b101d')};width:min(680px,calc(100vw - 32px))!important;max-width:calc(100vw - 24px)!important;max-height:min(82vh,740px,var(--radix-popover-content-available-height,740px))!important;${DFC};padding:0!important;overflow:visible!important;border-radius:var(--btw-r-lg)!important;background:var(--btw-s0)!important;backdrop-filter:blur(26px) saturate(1.2)!important;border:1px solid var(--btw-b1,${mixAcc(32,VST)})!important;box-shadow:0 24px 60px -12px rgba(0,0,0,0.62)!important;transition:width 0.18s cubic-bezier(0.16,1,0.3,1),max-height 0.18s cubic-bezier(0.16,1,0.3,1)}
.btw-studio-popover>span>span{background:transparent!important;border:0!important;backdrop-filter:none!important}
.btw-studio-popover>span>span>span{background:var(--popover-surface,var(--btw-s0))!important;border-top:0!important;border-left:0!important;border-right:1px solid var(--btw-b1,${mixAcc(32,VST)})!important;border-bottom:1px solid var(--btw-b1,${mixAcc(32,VST)})!important;backdrop-filter:none!important}
.btw-studio-popover[data-wide="true"]{width:min(920px,calc(100vw - 32px))!important;max-height:min(86vh,830px,var(--radix-popover-content-available-height,830px))!important}
.btw-studio-dialog{container-type:inline-size;container-name:btwsurface;--btw-r-lg:14px;--btw-r-md:11px;--btw-r-sm:7px;--btw-s0:#0b101d;--btw-s1:${mixTxt(4,'#111827')};--btw-s2:${mixTxt(7.5,'#162033')};--btw-b1:${mixAcc(32,VST)};--popover-surface:var(--btw-s0,#0b101d);--btw-fg-muted:${mixTxt(76,'#0b101d')};width:min(940px,95vw)!important;max-width:min(940px,95vw)!important;max-height:min(88vh,850px)!important;padding:0!important;overflow:hidden!important;border-radius:var(--btw-r-lg)!important;background:var(--btw-s0)!important;border:1px solid var(--btw-b1,${mixAcc(32,VST)})!important}
.btw-studio-head{${DFC};gap:6px;padding:10px 16px 0;border-bottom:1px solid ${mixStk(46)};background:linear-gradient(180deg,${mixAcc(6)},transparent)}
.btw-studio-head-top{${DFB};gap:8px;min-width:0}
.btw-studio-nav-bar{${DFB};gap:10px;min-width:0;overflow-x:auto;scrollbar-width:none}
.btw-studio-nav-bar::-webkit-scrollbar,.btw-hud-telemetry-bar::-webkit-scrollbar,.btw-hud-chips::-webkit-scrollbar,.btw-token-bar::-webkit-scrollbar,.btw-set-sec-bar::-webkit-scrollbar,.btw-ask-controls-left::-webkit-scrollbar{display:none}
.btw-nav-tabs{${DIF};gap:2px;padding:0;border:0;background:transparent}
.btw-nav-tab{position:relative;${DIF};gap:5px;height:30px;margin-bottom:-1px;padding:0 8.5px;border-radius:6px 6px 0 0;border:0;border-bottom:2px solid transparent;background:transparent;color:${mixTxt(76)};font-size:11.5px;font-weight:540;white-space:nowrap;cursor:pointer;transition:background 0.14s ease,border-color 0.14s ease,color 0.14s ease}
.btw-nav-tab:hover{color:${VTP};background:${mixTxt(4.5)}}
.btw-nav-tab[data-active="true"]{border-bottom-color:${VBA};background:${mixAcc(10)};color:${VTP};font-weight:650}
.btw-nav-tab[data-alert-level="low"]:not([data-active="true"]),.btw-nav-tab[data-alert-level="medium"]:not([data-active="true"]){color:${mixTxt(82)}}
.btw-nav-tab[data-alert-level="high"]:not([data-active="true"]){color:#fda4af;font-weight:650}
.btw-nav-alert-dot{width:6px;height:6px;border-radius:999px;flex-shrink:0;align-self:center}
.btw-nav-alert-dot[data-level="low"]{background:${VBA}}
.btw-nav-alert-dot[data-level="medium"]{background:#f59e0b;box-shadow:0 0 5px rgba(245,158,11,0.65)}
.btw-nav-alert-dot[data-level="high"]{background:#f43f5e;box-shadow:0 0 6px rgba(244,63,94,0.8)}
.btw-studio-scroll{position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 16px 24px;${DFC};gap:11px;scrollbar-gutter:stable}
.btw-studio-scroll:has(.btw-preset-hover-card){overflow:visible!important;z-index:40!important}
.btw-studio-scroll::-webkit-scrollbar{width:5px;height:5px}
.btw-studio-scroll::-webkit-scrollbar-button{display:none;width:0;height:0}
.btw-studio-scroll::-webkit-scrollbar-track{background:transparent}
.btw-studio-scroll::-webkit-scrollbar-thumb{background:${mix(VBA,38)};border-radius:999px}
.btw-studio-scroll::-webkit-scrollbar-thumb:hover{background:${mix(VBA,62)}}
.btw-studio-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;width:100%}
@container btwpane (min-width:680px){.btw-studio-presets{grid-template-columns:repeat(4,minmax(0,1fr))}}
.btw-studio-presets[data-basic="true"]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%}
.btw-preset-card{position:relative;display:flex;min-width:0;width:100%}
.btw-studio-presets[data-basic="true"] .btw-preset-card{min-width:0;width:100%}
.btw-preset-btn{width:100%;min-width:0;height:30px;${DIF};justify-content:flex-start;gap:6px;padding:0 10px;border-radius:var(--btw-r-sm,8px);font-size:11.5px;font-weight:530;text-align:left;white-space:nowrap;border:1px solid ${mixStk(45)};background:${mixTxt(3)};color:${VTS};cursor:pointer;transition:background 0.14s ease,border-color 0.14s ease,color 0.14s ease}
.btw-studio-presets[data-basic="true"] .btw-preset-btn{width:100%;height:30px;justify-content:center;padding:0 8px;font-size:11px;font-weight:550;gap:5px}
.btw-plus-cat-btn{${DFB};width:100%;gap:8px;padding:6.5px 9px;border-radius:7px;border:1px solid transparent;background:transparent;color:${VTP};font-size:11.5px;font-weight:600;cursor:pointer;text-align:left;transition:background 0.13s ease,border-color 0.13s ease}
.btw-plus-cat-btn[data-open="true"],.btw-plus-cat-btn:hover{background:${mixAcc(10)};border-color:${mixAcc(30)}}
.btw-plus-cat-body{${DFC};gap:2px;padding:3px 0 5px 6px;margin-left:6px;border-left:1px solid ${mixStk(55)}}
.btw-basic-md-overview{padding:13px 15px;border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.09));background:var(--btw-surface-inset,rgba(255,255,255,0.03));backdrop-filter:blur(12px);font-size:12.5px;line-height:1.58}
.btw-basic-md-overview h3{font-size:13px;font-weight:650;color:${VTP};margin:0 0 8px}
.btw-basic-md-overview h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${VTS};margin:12px 0 6px}
.btw-basic-md-overview blockquote{margin:6px 0 10px;padding:10px 12px;border-radius:9px;border:1px solid rgba(245,158,11,0.28);border-left:3.5px solid #f59e0b;background:rgba(245,158,11,0.07);color:${VTP}}
.btw-basic-md-overview table,.btw-composer-banner-body table{width:100%;border-collapse:collapse;margin:6px 0;border-radius:8px;overflow:hidden;border:1px solid ${mixStk(48)};background:${mix('var(--ui-bg-elevated,#0b1220)',55)};font-size:11.5px}
.btw-basic-md-overview th,.btw-composer-banner-body th{padding:6.5px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${VTT};background:${mixTxt(4.5)};border-bottom:1px solid ${mixStk(48)}}
.btw-basic-md-overview td,.btw-composer-banner-body td{padding:6.5px 10px;border-bottom:1px solid ${mixStk(28)};color:${VTS}}
.btw-basic-md-overview tr:last-child td,.btw-composer-banner-body tr:last-child td{border-bottom:0}
.btw-basic-md-overview tr:hover td{background:${mixAcc(5)}}
.btw-basic-md-overview code,.btw-composer-banner-body code,.btw-inline-code{padding:1.5px 5px;border-radius:4px;font-family:${FONT_MONO};font-size:10.5px;background:${mixAcc(14)};color:${VBA}}
.btw-preset-card[data-recommended="true"] .btw-preset-btn{border-color:${VBA}!important;box-shadow:inset 0 0 0 1px ${VBA}!important;background:${mixAcc(12,'var(--btw-s1,transparent)')};color:${VTP}}
.btw-preset-card[data-recommended="true"][data-attention="high"] .btw-preset-btn{border-color:#f43f5e!important;box-shadow:inset 0 0 0 1px #f43f5e!important;background:rgba(244,63,94,0.14);color:#fecdd3}
.btw-smart-rec-pill{${DIF};height:24px;border-radius:7px;border:1px solid ${mixAcc(42,VST)};background:${mixAcc(8)};overflow:hidden;flex-shrink:0;transition:border-color 0.2s ease,box-shadow 0.2s ease,background 0.2s ease}
.btw-smart-rec-pill[data-attention="high"]{border-color:rgba(244,63,94,0.72);background:rgba(244,63,94,0.14)}
.btw-smart-rec-pill[data-attention="high"] .btw-smart-rec-btn{color:#fda4af}
.btw-smart-rec-pill[data-loading="true"]{border-color:${VBA}!important;background:${mixAcc(18)}!important;box-shadow:0 0 12px ${mixAcc(38)}!important}
.btw-specialist-scan-bar{width:100%;height:3px;border-radius:999px;overflow:hidden;background:${mixStk(40)};position:relative}
.btw-specialist-scan-bar::after{content:'';position:absolute;inset:0;width:45%;border-radius:999px;background:linear-gradient(90deg,transparent,${VBA},transparent);animation:btw-scan-slide 1.1s ease-in-out infinite}
@keyframes btw-scan-slide{0%{transform:translateX(-100%)}100%{transform:translateX(220%)}}
.btw-preset-hover-desc{font-size:11.5px;font-weight:500;line-height:1.42;color:${VTP};padding:2px 0}
.btw-specialist-card{position:relative;${DFC};gap:8px;padding:10px 12px;border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:${mixAcc(4,'var(--btw-surface-inset,rgba(255,255,255,0.03))')};backdrop-filter:blur(12px);box-shadow:0 8px 24px -8px rgba(0,0,0,0.22);animation:btw-rise 0.16s cubic-bezier(0.16,1,0.3,1)}
.btw-specialist-card[data-attention="medium"]{border-color:rgba(245,158,11,0.58);background:${mix('#f59e0b',11,'var(--btw-s0,#0b1220)')}}
.btw-specialist-card[data-attention="high"]{border-color:rgba(244,63,94,0.72);background:${mix('#f43f5e',13,'var(--btw-s0,#0b1220)')}}
.btw-specialist-badge{${DIF};gap:4px;padding:1.5px 6.5px;border-radius:999px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em}
.btw-specialist-badge[data-attention="low"]{background:rgba(52,211,153,0.14);color:#34d399;border:1px solid rgba(52,211,153,0.35)}
.btw-specialist-badge[data-attention="medium"]{background:rgba(245,158,11,0.16);color:#fbbf24;border:1px solid rgba(245,158,11,0.42)}
.btw-specialist-badge[data-attention="high"]{background:rgba(244,63,94,0.18);color:#fda4af;border:1px solid rgba(244,63,94,0.5)}
.btw-smart-rec-btn{${DIF};gap:4px;height:100%;padding:0 8px;border:0;background:transparent;color:${VBA};font-size:10.5px;font-weight:600;cursor:pointer;transition:background 0.14s ease}
.btw-smart-rec-btn:hover:not(:disabled){background:${mixAcc(18)}}
.btw-smart-rec-auto{${DIF};gap:3px;height:100%;padding:0 7px;border:0;border-left:1px solid ${mixAcc(32,VST)};background:transparent;color:${VTS};font-size:10px;font-weight:550;cursor:pointer;transition:background 0.14s ease,color 0.14s ease}
.btw-smart-rec-auto[data-active="true"]{background:${mixAcc(20)};color:${VTP}}
.btw-preset-section-wrap{position:relative;${DFC};gap:6px}
.btw-preset-hover-card{position:absolute;left:0;right:0;bottom:calc(100% + 6px);z-index:42;width:100%;padding:10px 13px;border-radius:11px;border:1px solid ${mixAcc(55,VST)};background:var(--btw-s0,#0d131f)!important;color:var(--btw-text-strong,#f8fafc)!important;backdrop-filter:none!important;opacity:1!important;box-shadow:0 12px 28px -6px rgba(0,0,0,0.62);pointer-events:none;${DFC};gap:5px;animation:btw-rise 0.13s cubic-bezier(0.16,1,0.3,1)}
.btw-preset-hover-card .btw-preset-hover-desc{color:inherit!important}
.btw-preset-hover-card[data-align="right"]{left:auto;right:0}
.btw-preset-hover-card[data-pos="below"]{bottom:auto;top:calc(100% + 6px)}
.btw-preset-hover-prompt{padding:5.5px 8px;border-radius:7px;font-size:10.5px;line-height:1.4;color:${VTS};background:${mixTxt(5.5)};border:1px solid ${mixStk(45)}}
.btw-composer-plus-btn{${DIF};justify-content:center;width:26px;height:26px;border-radius:7px;border:1px solid ${mixStk(62)};background:${mixTxt(3.5)};color:${VTS};cursor:pointer;padding:0;flex-shrink:0;transition:all 0.14s ease}
@container btwsurface (max-width:720px){.btw-toggle-label,.btw-wide-only{display:none}}
.btw-composer-plus-btn[data-state="open"],.btw-composer-plus-btn:hover{border-color:${mixAcc(65,VST)};background:${mixAcc(14)};color:${VBA}}
.btw-pasted-card{position:relative;${DFC};gap:4px;width:100%;padding:6.5px 9.5px;border-radius:9px;border:1px solid ${mixAcc(38,VST)};background:${mix(VAC,6,mixTxt(2.8))};font-size:11px}
.btw-pasted-badge{${DIF};gap:3px;padding:1px 5px;border-radius:4px;font-size:9.5px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;background:${mixAcc(18)};color:${VBA}}
.btw-pasted-preview{margin-top:2px;padding:6px 8px;border-radius:6px;max-height:110px;overflow-y:auto;font-size:10.5px;line-height:1.4;white-space:pre-wrap;word-break:break-word;background:${mix('var(--ui-bg-elevated,#0b101b)',88)};border:1px solid ${mixStk(45)};color:${VTS}}
:is(.btw-preset-card:hover,.btw-preset-card:focus-within) .btw-preset-btn:not(:disabled){border-color:${mixAcc(55,VST)};background:${mixAcc(12,'var(--btw-s2,transparent)')};color:${VTP}}
.btw-preset-card:not([data-basic="true"]):hover .btw-preset-btn:not(:disabled){border-color:${mixAcc(52,VST)}}
.btw-steered-callout{margin:8px 12px 0;padding:7px 11px;border-radius:8px;border:1px solid rgba(16,185,129,0.36);background:rgba(16,185,129,0.08);font-size:11px}
.btw-steered-callout-title{font-weight:650;color:#34d399;margin-bottom:2px}
${LP} .btw-steered-callout{background:rgba(21,128,61,0.09)!important;border-color:rgba(21,128,61,0.38)!important}
${LP} .btw-steered-callout-title{color:#166534!important}
.btw-preset-btn:disabled{opacity:0.48;cursor:default}
.btw-preset-actions{position:absolute;right:3px;top:50%;transform:translateY(-50%);${DIF};gap:1px;padding:1px;border-radius:var(--btw-r-sm,6px);opacity:0;pointer-events:none;background:${mix('var(--btw-s0,#0b101d)',94)};backdrop-filter:blur(5px);transition:opacity 0.12s ease}
:is(.btw-preset-card:hover,.btw-preset-card:focus-within) .btw-preset-actions{opacity:1;pointer-events:auto}
.btw-preset-act{${DIF};justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--btw-r-sm,6px);background:transparent;color:${VTS};cursor:pointer;transition:all 0.12s ease}
.btw-preset-act:hover{background:${mixTxt(12)};color:${VTP}}
.btw-preset-act[data-danger="true"]:hover{background:${mix('var(--btw-danger)',18)};color:var(--btw-danger)}
.btw-preset-add-btn{${DIF};justify-content:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--btw-r-sm,6px);font-size:11px;font-weight:550;border:1px solid ${mixStk(55)};background:${mixTxt(2.5)};color:${VTS};cursor:pointer;transition:all 0.14s ease}
.btw-preset-add-btn:hover:not(:disabled){border-color:${mixAcc(68,VST)};background:${mixAcc(14)};color:${VBA}}
.btw-preset-editor{${DFC};gap:7px;padding:10px 11px;border-radius:11px;border:1px solid ${mixAcc(44,VST)};background:${mix(VAC,5,mixTxt(2.5))};animation:btw-rise 0.16s cubic-bezier(0.16,1,0.3,1)}
.btw-preset-icons-bar{display:flex;flex-wrap:wrap;gap:3px}
.btw-preset-icon-opt{${DIF};justify-content:center;width:24px;height:24px;padding:0;border-radius:6px;border:1px solid ${VST};background:${mixTxt(2.5)};color:${VTS};cursor:pointer;transition:all 0.12s ease}
.btw-preset-icon-opt:hover{border-color:${mixAcc(55,VST)};color:${VTP}}
.btw-preset-icon-opt[data-selected="true"]{border-color:${VBA};background:${mixAcc(20)};color:${VBA};box-shadow:0 0 0 1px ${mixAcc(28)}}
.btw-preset-input{width:100%;border-radius:8px;padding:5px 8px;border:1px solid ${VST};background:${mix('var(--btw-s0,Canvas)',75)};color:${VTP};font:inherit;font-size:12px;outline:none;transition:border-color 0.14s ease}
.btw-preset-input:focus{border-color:${VBA}}
:is(.btw-preset-input,.btw-launcher-textarea,.btw-ask-textarea)::placeholder{color:var(--btw-placeholder-fg,${VTP})!important;opacity:0.52!important;font-weight:400!important}
${LPT} :is(.btw-preset-input,.btw-launcher-textarea,.btw-ask-textarea)::placeholder{color:var(--btw-placeholder-fg,#0f172a)!important;opacity:0.58!important}
.btw-ask-box{position:relative;${DFC};gap:8px;padding:11px 13px 9px;border-radius:var(--btw-r-md,11px);border:1px solid ${mixAcc(30,VST)};background:var(--btw-s1,${mixTxt(3.8)});box-shadow:0 4px 16px -8px rgba(0,0,0,0.32);transition:border-color 0.15s ease,box-shadow 0.15s ease,transform 0.16s ease}
.btw-ask-box:focus-within{border-color:${mixAcc(72,VST)}!important;box-shadow:0 0 0 2px ${mixAcc(14)},0 8px 24px -8px rgba(0,0,0,0.42)!important}
.btw-ask-box[data-dragging="true"]{z-index:35;transform:scale(1.012);border-color:${VBA}!important;background:${mixAcc(10,'var(--btw-s0,#09101d)')}!important;box-shadow:0 0 0 3px ${mixAcc(34)},0 20px 48px rgba(0,0,0,0.72)!important}
.btw-drag-dimmed{filter:blur(3.5px) brightness(0.5);opacity:0.36;pointer-events:none;transition:filter 0.16s ease,opacity 0.16s ease}
.btw-drop-spotlight-overlay{position:absolute;inset:0;z-index:20;border-radius:inherit;${DFC};align-items:center;justify-content:center;gap:4px;background:${mix('var(--btw-s0,#070d19)',88,VAC)};backdrop-filter:blur(4px);pointer-events:none;text-align:center;padding:12px}
.btw-ask-textarea,.btw-ask-textarea:focus,.btw-ask-textarea:focus-visible{width:100%;min-height:58px;max-height:220px;overflow-y:auto;resize:none;border:0!important;outline:none!important;box-shadow:none!important;background:transparent;color:${VTP};caret-color:${VBA};font-size:13px;line-height:1.5;font-family:inherit;padding:2px 2px}
.btw-ask-controls{${DFB};gap:5px;min-height:32px;padding-top:7px;border-top:1px solid ${mixStk(32)};flex-wrap:nowrap;min-width:0}
.btw-ask-controls-left{display:flex;min-width:0;flex:1 1 auto;align-items:center;gap:5px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.btw-qa-card{border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.085));border-radius:var(--btw-r-md,10px);overflow:hidden;background:var(--btw-s1,rgba(255,255,255,0.028));backdrop-filter:blur(10px);transition:border-color 0.14s ease,background 0.14s ease}
.btw-qa-card[data-collapsed="true"]{border-color:var(--btw-border-subtle,rgba(255,255,255,0.07));background:var(--btw-surface-inset,rgba(255,255,255,0.02))}
.btw-qa-card[data-collapsed="true"]:hover{border-color:${mixAcc(38,VST)};background:${mixAcc(4,'var(--btw-s1,transparent)')}}
.btw-qa-card[data-pinned="true"]{border-color:${mixAcc(48,VST)};background:${mixAcc(5,'var(--btw-s1,transparent)')}}
.btw-qa-card[data-steered="true"]{border-left:2.5px solid #10b981}
.btw-qa-card.btw-thread-child{margin-left:14px;border-left:2.5px solid ${mixAcc(68)};position:relative;overflow:visible}
.btw-thread-child::before{content:'';position:absolute;left:-9px;top:-6px;bottom:50%;width:7px;border-left:1.5px solid ${mixAcc(50)};border-bottom:1.5px solid ${mixAcc(50)};border-bottom-left-radius:6px;pointer-events:none}
.btw-qa-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:8px 11px;border-bottom:1px solid ${mixStk(32)};background:${mixTxt(2.2)}}
.btw-qa-card[data-collapsed="true"] .btw-qa-header{align-items:center;min-height:34px;padding:5px 11px;border-bottom:0;background:transparent}
.btw-qa-row-actions{display:none;align-items:center;gap:3px;flex-shrink:0}
:is(.btw-qa-card:hover,.btw-qa-card:focus-within) .btw-qa-row-actions{display:inline-flex}
.btw-steered-badge{${DIF};gap:3px;padding:1px 6px;border-radius:999px;font-size:9.5px;font-weight:650;background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.38);color:#34d399;flex-shrink:0}
.btw-branch-badge{${DIF};gap:3px;padding:1px 5.5px;border-radius:999px;font-size:9.5px;font-weight:550;background:${mixAcc(12)};border:1px solid ${mixAcc(38)};color:${VBA};flex-shrink:0}
.btw-qa-body{padding:11px 13px;font-size:12.5px;line-height:1.58;max-width:78ch;overflow-x:auto}
.btw-qa-body pre{max-width:100%;overflow-x:auto}
.btw-radar-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
@container btwsurface (max-width:460px){.btw-radar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-progress-track{height:5px;width:100%;border-radius:999px;overflow:hidden;background:${mixTxt(9)}}
.btw-progress-fill{height:100%;border-radius:999px;background:${VBA};transition:width 0.25s ease}
.btw-composer-banner{border:1px solid ${mixStk(55)};background:${mix('var(--ui-bg-elevated,#0f1523)',95)};backdrop-filter:blur(12px);border-radius:6px;margin-bottom:5px;overflow:hidden;box-shadow:0 4px 14px -6px rgba(0,0,0,0.32);transition:all 0.16s ease}
.btw-composer-banner[data-banner-theme="host"]{border-color:var(--dt-border,${VST});background:${mix('var(--dt-background,var(--ui-bg-elevated,#0d1117))',96)}}
.btw-composer-banner[data-banner-theme="chat"]{border-color:${mixStk(55)};background:var(--dt-card,var(--ui-bg-elevated,#111827))}
.btw-composer-banner[data-banner-theme="studio"]{border-color:${mixAcc(32,VST)};background:${mixAcc(5,'var(--ui-bg-elevated,#0f1523)')}}
.btw-composer-banner-bar{${DFB};gap:8px;padding:5px 10px;font-size:11.5px}
.btw-banner-ghost-btn{${DIF};gap:4px;height:22px;padding:0 6.5px;border-radius:5px;border:0;background:transparent;color:${VTT};font-size:11px;font-weight:500;cursor:pointer;transition:background 0.12s ease,color 0.12s ease}
.btw-banner-ghost-btn:hover{background:var(--chrome-action-hover,${mixTxt(7)});color:${VTP}}
.btw-composer-banner-body{border-top:1px solid ${mixStk(50)};padding:12px 15px 16px;max-height:220px;overflow-y:auto;overscroll-behavior:contain;font-family:var(--font-sans,'Inter',system-ui,sans-serif);font-size:12.5px;line-height:1.58;background:${mix('var(--ui-bg-elevated,transparent)',88)}}
.btw-composer-banner:is([data-banner-size="comfortable"],[data-has-media="true"]) .btw-composer-banner-body{max-height:min(68vh,660px);height:auto;padding:14px 16px 20px}
.btw-composer-banner-body :is(h1,h2,h3){font-size:13px;font-weight:680;letter-spacing:-0.01em;color:${VTP};margin:8px 0 6px;padding-bottom:4px;border-bottom:1px solid ${mixStk(42)}}
.btw-composer-banner-body :is(h1:first-child,h2:first-child,h3:first-child){margin-top:0}
.btw-composer-banner-body h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${VAC};margin:10px 0 5px}
.btw-composer-banner-body blockquote{margin:6px 0 10px;padding:8px 12px;border-radius:7px;border:1px solid ${mixAcc(28)};border-left:3px solid ${VAC};background:${mixAcc(7)};color:${VTP}}
.btw-composer-banner-body strong{color:${VTP};font-weight:650}
.btw-composer-banner[data-banner-theme="chat"] .btw-composer-banner-body{background:transparent}
.btw-composer-banner[data-banner-theme="chat"] .btw-composer-banner-body blockquote{border-color:${mixStk(60)};border-left:3px solid ${VTS};background:${mixTxt(4)}}
.btw-composer-banner[data-banner-theme="chat"] .btw-composer-banner-body code{background:${mixTxt(8)};color:${VTP}}
.btw-composer-banner[data-banner-theme="host"] .btw-composer-banner-body{background:var(--dt-background,${VBG});color:var(--dt-foreground,${VTP})}
.btw-composer-banner[data-banner-theme="host"] .btw-composer-banner-body :is(h1,h2,h3){border-left:3px solid ${VAC};padding-left:8px;border-bottom:0}
.btw-attached-btw-dock{${DFC};gap:6px;padding:7.5px 10px;border-radius:10px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:${mixAcc(4,'var(--btw-surface-inset,rgba(255,255,255,0.03))')}}
.btw-action-mode-pill{${DIF};gap:4px;height:24px;padding:0 8.5px;border-radius:999px;border:1px solid ${mixStk(58)};background:${mixTxt(3.5)};color:${VTS};font-size:10.5px;font-weight:560;cursor:pointer;white-space:nowrap;transition:all 0.14s ease}
.btw-action-mode-pill:hover{color:${VTP};border-color:${mixAcc(52,VST)}}
.btw-action-mode-pill[data-active="true"]{border-color:${VBA};background:${mixAcc(20)};color:${VTP};font-weight:650}
.btw-composer-synth-btn{${DIF};gap:4px;height:24px;padding:0 9px;border-radius:999px;border:1px solid ${mixAcc(68,VST)};background:linear-gradient(135deg,${mixAcc(22)},${mixAcc(10)});color:${VBA};font-size:10.5px;font-weight:650;cursor:pointer;white-space:nowrap;transition:all 0.15s ease}
.btw-composer-synth-btn:hover:not(:disabled){background:${mixAcc(28)};box-shadow:0 0 12px ${mixAcc(30)}}
.btw-composer-synth-btn:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none}
.btw-qa-footer-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding-top:7px;margin-top:4px;border-top:1px solid ${mixStk(38)}}
.btw-trigger-pill{${DIF};height:var(--composer-control-size,24px);gap:5px;border-radius:6px;padding:0 7px;font-size:12px;font-weight:450;line-height:16px;cursor:pointer;user-select:none;border:1px solid transparent;background:transparent;color:${VTT};transition:all 0.12s ease}
.btw-trigger-pill:hover{background:var(--chrome-action-hover,${mixTxt(7)});color:${VTP}}
.btw-trigger-pill[data-chip-theme="host"]:not([data-active="true"]){border-color:${mixStk(45)};background:${mixTxt(2.5)};color:${VTT}}
.btw-trigger-pill[data-chip-theme="studio"]:not([data-active="true"]){border-color:${mixStk(42)};background:transparent;color:${VTT};font-weight:450}
.btw-trigger-pill[data-active="true"]{background:var(--chrome-action-hover,${mixAcc(14)});border-color:${mixAcc(42,VST)};color:${VTP};font-weight:540}
.btw-trigger-pill[data-alert="true"]{color:var(--btw-warn)!important}
.btw-trigger-count{${DIF};justify-content:center;height:15px;min-width:15px;padding:0 4px;border-radius:999px;font:600 10px/1 ${FONT_MONO};font-variant-numeric:tabular-nums;background:${mixTxt(9)};color:${VTS}}
.btw-trigger-pill[data-active="true"] .btw-trigger-count{background:${mixAcc(22)};color:${VAC}}
.btw-statusbar-chip{${DIF};height:100%;gap:4px;padding:0 6px;border:0;border-radius:0;background:transparent;font-size:11px;line-height:1;font-weight:400;color:${VTT};cursor:pointer;white-space:nowrap;transition:background-color 0.12s ease,color 0.12s ease}
.btw-statusbar-chip:hover{background:var(--chrome-action-hover,${mixTxt(7)});color:var(--foreground,${VTP})}
.btw-statusbar-chip[data-active="true"]{color:${VAC};font-weight:500}
.btw-diff-box{margin-top:5px;padding:7px 9px;border-radius:8px;font-size:11px;line-height:1.4;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;overflow-x:hidden;border:1px solid ${mixStk(80)};background:${mix('var(--btw-s0,Canvas)',92)}}
.btw-file-bento-card[data-expanded="true"]{grid-column:1 / -1}
[data-btw-theme],.btw-flight,.btw-row-badge,.btw-alert-strip,.btw-trigger-pill{--btw-ok:var(--ui-green,#10b981);--btw-observe:var(--ui-blue,#38bdf8);--btw-act:var(--ui-yellow,#fbbf24);--btw-warn:var(--ui-yellow,#fbbf24);--btw-danger:var(--ui-red,#f43f5e);--btw-hypo:var(--ui-blue,#38bdf8)}
[data-btw-theme]{--btw-accent:var(--btw-accent-override,var(--btw-accent-default,var(--btw-host-accent,#38bdf8)));--ui-accent:var(--btw-accent);--btw-b1:${mix('var(--btw-accent,#38bdf8)',32,'rgba(148,163,184,0.34)')};--popover-surface:var(--btw-s0,#0b101d);--ui-chat-bubble-background:var(--btw-s0,#0b101d);--stroke-nous:var(--btw-border-subtle,rgba(148,163,184,0.28));--btw-text-strong:var(--ui-text-primary,#f8fafc);--btw-text-body:${mix('var(--ui-text-primary,#f8fafc)',88,'var(--btw-s0,#090e1d)')};--btw-text-muted:${mix('var(--ui-text-primary,#f8fafc)',75,'var(--btw-s0,#090e1d)')};--btw-accent-ink:${mix('var(--btw-accent)',62,'#f8fafc')};--btw-ok-ink:#6ee7b7;--btw-warn-ink:#fcd34d;--btw-danger-ink:#fda4af;--btw-border-interactive:${mix('var(--btw-text-strong,#f8fafc)',40,'var(--btw-s1,#111827)')};--btw-placeholder-fg:var(--btw-text-strong,#f8fafc);--btw-surface-inset:${mix('var(--ui-text-primary,#f8fafc)',3.8)};--btw-border-subtle:${mix('var(--ui-stroke-secondary,rgba(148,163,184,0.34))',72)};--btw-seg-bg:${mix('var(--ui-text-primary,#f8fafc)',5.8)};--btw-seg-border:${mix('var(--ui-stroke-secondary,rgba(148,163,184,0.38))',80)};--btw-seg-thumb:${mix('var(--btw-accent)',24,'var(--btw-s2,#1e293b)')};--btw-seg-thumb-border:${mix('var(--btw-accent)',75)};--btw-seg-fg:${mix('var(--ui-text-primary,#f8fafc)',80)};--btw-seg-fg-active:var(--ui-text-primary,#ffffff);--btw-radar-grid:rgba(148,163,184,0.28);--btw-radar-node-ring:#ffffff;font-size:calc(12.5px * var(--btw-zoom,1))}
[data-btw-theme]::selection{background:${mix('var(--btw-accent,#38bdf8)',28)};color:var(--ui-text-primary,#f8fafc)}
[data-btw-theme] :is(.btw-qa-body,.btw-ask-textarea){font-size:calc(12.5px * var(--btw-zoom,1))}
[data-btw-theme="orbyx"]{--btw-accent-default:#38bdf8;--btw-secondary-accent:var(--btw-mascot-live-aura,#c084fc);--btw-b1:${mix('var(--btw-accent,#38bdf8)',48,'rgba(192,132,252,0.35)')};--ui-stroke-secondary:var(--btw-b1);--btw-border-subtle:rgba(56,189,248,0.24);--btw-seg-border:rgba(56,189,248,0.3);--btw-warn:#fbbf24;--btw-danger:#f43f5e;--btw-ok:#10b981;--btw-observe:#38bdf8;--btw-act:#fbbf24;--btw-hypo:#c084fc;--btw-fg-muted:#93c5fd;--btw-s0:#060a14;--btw-s1:#0b1223;--btw-s2:#121d36;--popover-surface:#050811;--btw-r-lg:14px;--btw-r-md:10px;--btw-r-sm:6px;font-family:'Lexend','Inter','JetBrains Mono',system-ui,sans-serif}
[data-btw-theme="orbyx"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="orbyx"]{border-radius:14px!important;border:1px solid var(--btw-b1)!important;background:radial-gradient(95% 65% at 15% -8%,${mix('var(--btw-accent,#38bdf8)',20)} 0%,transparent 62%),radial-gradient(85% 60% at 88% 0%,${mix('var(--btw-secondary-accent,#c084fc)',16)} 0%,transparent 64%),linear-gradient(180deg,#090e1d 0%,#050811 100%),#060a14!important;color:#f1f5f9!important}
[data-btw-theme="orbyx"] .btw-studio-head{background:linear-gradient(90deg,${mix('var(--btw-accent,#38bdf8)',16)} 0%,rgba(192,132,252,0.1) 55%,transparent 100%),#070c18!important;border-bottom:1px solid ${mix('var(--btw-accent,#38bdf8)',38,'rgba(192,132,252,0.28)')}!important}
[data-btw-theme="orbyx"] .btw-brand{font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#f1f5f9;font-size:11.5px}
[data-btw-theme="orbyx"] .btw-kpi b{color:#38bdf8;font-family:${FONT_MONO}}
[data-btw-theme="host"]{--btw-accent-default:#38bdf8;--btw-b1:var(--dt-border,${VST});--btw-s0:var(--dt-background,var(--ui-bg-elevated,#0b101d));--btw-s1:var(--dt-card,${mixTxt(4,'#111827')});--btw-s2:${mixTxt(8,'#1a2336')};--popover-surface:var(--btw-s0);font-family:var(--font-sans,'Inter',system-ui,sans-serif)}
[data-btw-theme="host"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="host"]{border-radius:14px!important;border:1px solid var(--btw-b1)!important;background:var(--btw-s0)!important;color:var(--dt-foreground,${VTP})!important}
[data-btw-theme="host"] .btw-studio-head{background:var(--dt-card,${mixTxt(3)})!important;border-bottom:1px solid var(--btw-b1)!important}
[data-btw-theme="host"] :is(.btw-ask-box,.btw-qa-card,.btw-preset-btn,.btw-basic-md-overview,.btw-set-card,.btw-mascot-stage,.btw-ternary-card){background:var(--dt-card,${mixTxt(3.8)})!important;border-color:var(--btw-b1)!important}
[data-btw-theme="host"] .btw-brand{font-weight:680;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;color:var(--dt-foreground,${VTP})}
[data-btw-theme="cryo"]{--btw-accent-default:#38bdf8;--btw-b1:rgba(56,189,248,0.34);--ui-stroke-secondary:var(--btw-b1);--ui-text-primary:#f1f5f9;--ui-text-secondary:#cbd5e1;--ui-text-tertiary:#94a3b8;--btw-border-subtle:rgba(56,189,248,0.24);--btw-fg-muted:#94a3b8;--btw-s0:#060c18;--btw-s1:#0a1426;--btw-s2:#10203a;--popover-surface:#050913;--btw-r-lg:12px;--btw-r-md:10px;--btw-r-sm:7px;--btw-seg-bg:#081120;--btw-seg-border:rgba(56,189,248,0.28);--btw-seg-thumb:rgba(56,189,248,0.22);--btw-seg-thumb-border:rgba(56,189,248,0.78);font-family:'Lexend','Inter',system-ui,sans-serif}
[data-btw-theme="cryo"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="cryo"]{border-radius:12px!important;border:1px solid var(--btw-b1)!important;background:radial-gradient(110% 75% at 50% -10%,rgba(56,189,248,0.11) 0%,transparent 62%),linear-gradient(180deg,#080f1e 0%,#050913 100%),#060c18!important;color:#e2e8f0!important}
[data-btw-theme="cryo"] .btw-studio-head{background:linear-gradient(180deg,rgba(56,189,248,0.08) 0%,transparent 100%),#070d1b!important;border-bottom:1px solid rgba(56,189,248,0.26)!important}
[data-btw-theme="cryo"] :is(.btw-ask-box,.btw-qa-card,.btw-set-card,.btw-mascot-stage,.btw-ternary-card){background:#081120!important;border-color:rgba(56,189,248,0.3)!important}
[data-btw-theme="cryo"] .btw-preset-btn{background:#0b1629!important;border-color:rgba(56,189,248,0.28)!important;color:#dbeafe!important}
[data-btw-theme="cryo"] .btw-brand{font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e0f2fe;font-size:11.5px}
[data-btw-theme="cryo"] .btw-kpi b{color:#38bdf8;font-family:${FONT_MONO}}
[data-btw-theme="ai"]{--btw-accent-default:#f59e0b;--btw-b1:rgba(245,158,11,0.38);--ui-stroke-secondary:var(--btw-b1);--ui-text-primary:#fafaf9;--ui-text-secondary:#e7e5e4;--ui-text-tertiary:#a8a29e;--btw-border-subtle:rgba(245,158,11,0.24);--btw-warn:#fbbf24;--btw-danger:#f43f5e;--btw-ok:#10b981;--btw-observe:#f59e0b;--btw-act:#ea580c;--btw-hypo:#fb923c;--btw-fg-muted:#d6d3d1;--btw-s0:#110f0d;--btw-s1:#191512;--btw-s2:#241e19;--popover-surface:#0b0a09;--btw-r-lg:12px;--btw-r-md:8px;--btw-r-sm:5px;--btw-seg-bg:#161310;--btw-seg-border:rgba(245,158,11,0.3);--btw-seg-thumb:rgba(245,158,11,0.22);--btw-seg-thumb-border:rgba(245,158,11,0.78);font-family:'Inter','Lexend',system-ui,sans-serif}
[data-btw-theme="ai"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="ai"]{border-radius:12px!important;border:1px solid var(--btw-b1)!important;background:radial-gradient(110% 70% at 50% -10%,rgba(234,88,12,0.16) 0%,transparent 70%),linear-gradient(180deg,#141210 0%,#0b0a09 100%),#110f0d!important;color:#fafaf9!important}
[data-btw-theme="ai"] .btw-studio-head{background:linear-gradient(90deg,rgba(234,88,12,0.16) 0%,transparent 100%),#12100e!important;border-bottom:1px solid rgba(245,158,11,0.3)!important}
[data-btw-theme="ai"] :is(.btw-ask-box,.btw-qa-card,.btw-set-card,.btw-mascot-stage,.btw-ternary-card){background:#171310!important;border-color:rgba(245,158,11,0.3)!important}
[data-btw-theme="ai"] .btw-preset-btn{background:#1b1613!important;border-color:rgba(245,158,11,0.28)!important;color:#f5f5f4!important}
[data-btw-theme="ai"] .btw-brand{font-weight:700;letter-spacing:0.1em;color:#fbbf24}
[data-btw-theme="glass"]{--btw-accent-default:#38bdf8;--btw-b1:rgba(148,163,184,0.32);--ui-stroke-secondary:var(--btw-b1);--btw-fg-muted:#cbd5e1;--btw-s0:#0b1220;--btw-s1:rgba(15,23,42,0.92);--btw-s2:rgba(30,41,59,0.95);--popover-surface:#0b1220;--ui-text-primary:#f8fafc;--ui-text-secondary:#e2e8f0;--ui-text-tertiary:#cbd5e1;--btw-text-strong:#f8fafc;--btw-text-body:#e2e8f0;--btw-text-muted:#cbd5e1;--btw-r-lg:18px;--btw-r-md:12px;--btw-r-sm:8px;font-family:'Segoe UI Variable',-apple-system,'Inter',sans-serif}
[data-btw-theme="glass"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="glass"]{border-radius:18px!important;border:1px solid var(--btw-b1)!important;background:linear-gradient(135deg,rgba(56,189,248,0.07) 0%,rgba(255,255,255,0.02) 100%),rgba(10,16,30,0.94)!important;backdrop-filter:blur(28px) saturate(1.6)!important;color:#f8fafc!important}
[data-btw-theme="glass"] .btw-studio-head{background:linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 100%),#0c1424!important;border-bottom:1px solid rgba(148,163,184,0.24)!important}
[data-btw-theme="glass"] :is(.btw-ask-box,.btw-qa-card,.btw-kpi,.btw-set-card,.btw-mascot-stage,.btw-ternary-card){background:rgba(14,22,38,0.92)!important;border-color:rgba(148,163,184,0.32)!important;color:#f8fafc!important}
@media (prefers-reduced-transparency:reduce){[data-btw-theme="glass"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="glass"]{background:#0b1220!important;backdrop-filter:none!important}${LIGHT_HOST} :is([data-btw-theme="glass"].btw-studio-popover,[data-btw-theme="glass"].btw-studio-dialog,.btw-set-panel[data-btw-theme="glass"]){background:#f8fafc!important;backdrop-filter:none!important}}
[data-btw-theme="terminal"]{--btw-accent-default:#22c55e;--btw-b1:rgba(34,197,94,0.48);--ui-stroke-secondary:var(--btw-b1);--ui-text-primary:#dcfce7;--ui-text-secondary:#86efac;--ui-text-tertiary:#4ade80;--btw-border-subtle:rgba(34,197,94,0.34);--btw-warn:#f59e0b;--btw-danger:#f87171;--btw-ok:#22c55e;--btw-observe:#4ade80;--btw-act:#fbbf24;--btw-hypo:#4ade80;--btw-fg-muted:#86efac;--btw-s0:#050905;--btw-s1:#071107;--btw-s2:#0c1d0c;--popover-surface:#050905;--btw-r-lg:3px;--btw-r-md:2px;--btw-r-sm:2px;font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace!important;--btw-seg-bg:#030803;--btw-seg-border:rgba(34,197,94,0.45);--btw-seg-thumb:rgba(34,197,94,0.24);--btw-seg-thumb-border:#22c55e;--btw-seg-fg:#86efac;--btw-seg-fg-active:#ecfdf5;--btw-radar-grid:rgba(34,197,94,0.36);--btw-text-strong:#dcfce7;--btw-text-body:#86efac;--btw-text-muted:#4ade80}
[data-btw-theme="terminal"] :is(button,input,textarea,select,kbd,.btw-nav-tab,.btw-preset-btn){font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace!important}
[data-btw-theme="terminal"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="terminal"]{border-radius:3px!important;border:1px solid ${VBA}!important;background:repeating-linear-gradient(0deg,rgba(34,197,94,0.02) 0 1px,transparent 1px 2px),#050905!important;color:#86efac!important}
[data-btw-theme="terminal"] .btw-studio-head{background:#081108!important;border-bottom:1px solid ${VBA}!important}
[data-btw-theme="terminal"] :is(.btw-ask-box,.btw-qa-card,.btw-set-card,.btw-mascot-stage,.btw-ternary-card){background:#071107!important;border-color:rgba(34,197,94,0.38)!important}
[data-btw-theme="terminal"] .btw-preset-btn{background:#091509!important;border-color:rgba(34,197,94,0.36)!important;color:#bbf7d0!important}
[data-btw-theme="terminal"] .btw-brand{font-family:${FONT_MONO}!important;letter-spacing:0.15em;text-transform:uppercase;color:${VBA}}
[data-btw-theme="terminal"] :is(.btw-theme-dna-pill,.btw-theme-card-badge,.btw-mascot-nameplate,.btw-mascot-emotion-pill,.btw-swatch-dot){border-radius:2px!important}
[data-btw-theme="minimal"]{--btw-accent-default:#2dd4bf;--btw-b1:#383842;--btw-fg-muted:#d4d4d8;--btw-s0:#171719;--btw-s1:#1f1f23;--btw-s2:#27272c;--popover-surface:#171719;--btw-seg-thumb:#27272c;--btw-seg-thumb-border:#2dd4bf;--btw-r-lg:16px;--btw-r-md:12px;--btw-r-sm:8px;font-family:'Inter',-apple-system,system-ui,sans-serif}
[data-btw-theme="minimal"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="minimal"]{border-radius:16px!important;backdrop-filter:none!important;background:#171719!important;border:1px solid var(--btw-b1)!important;color:#f4f4f5!important}
[data-btw-theme="minimal"] .btw-studio-head{background:#171719!important;border-bottom:1px solid #2a2a30!important}
[data-btw-theme="minimal"] :is(.btw-ask-box,.btw-qa-card,.btw-basic-md-overview,.btw-set-card,.btw-mascot-stage,.btw-ternary-card){background:#1f1f23!important;border:1px solid var(--btw-border-interactive,#3e3e48)!important}
[data-btw-theme="minimal"] .btw-preset-btn{border-radius:999px!important;background:#212125!important;border:1px solid var(--btw-border-interactive,#3e3e48)!important;color:#e4e4e7!important}
[data-btw-theme="nordic"]{--btw-accent-default:#34d399;--btw-b1:rgba(52,211,153,0.36);--ui-stroke-secondary:var(--btw-b1);--btw-fg-muted:#a7f3d0;--btw-s0:#060f0c;--btw-s1:#0b1b17;--btw-s2:#102620;--popover-surface:#050c0a;--btw-r-lg:14px;--btw-r-md:9px;--btw-r-sm:6px;--btw-seg-thumb:rgba(52,211,153,0.22);--btw-seg-thumb-border:rgba(52,211,153,0.75);font-family:'Lexend','Inter',system-ui,sans-serif}
[data-btw-theme="nordic"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="nordic"]{border-radius:14px!important;border:1px solid var(--btw-b1)!important;background:radial-gradient(110% 70% at 50% 0%,rgba(45,212,191,0.12) 0%,transparent 65%),linear-gradient(180deg,#091512 0%,#050c0a 100%),#060f0c!important;color:#ecfdf5!important}
[data-btw-theme="nordic"] .btw-studio-head{background:linear-gradient(90deg,rgba(52,211,153,0.14) 0%,transparent 75%),#07110e!important;border-bottom:1px solid rgba(52,211,153,0.26)!important}
[data-btw-theme="nordic"] :is(.btw-ask-box,.btw-qa-card,.btw-basic-md-overview,.btw-set-card,.btw-mascot-stage,.btw-ternary-card,.btw-preset-btn){background:rgba(11,27,23,0.94)!important;border-color:rgba(52,211,153,0.32)!important}
[data-btw-theme="nordic"] .btw-brand{color:#34d399;font-weight:700;letter-spacing:0.1em}
${PAPER}{--btw-accent-default:#9a3412!important;--btw-b1:#8c7358!important;--btw-accent-ink:${mix('var(--btw-accent)',46,'#1f1a16')}!important;--btw-ok-ink:#14532d!important;--btw-warn-ink:#7c2d12!important;--btw-danger-ink:#9f1239!important;--btw-border-interactive:#7d664c!important;--btw-placeholder-fg:#231f1b!important;--foreground:#231f1b!important;--muted-foreground:#54493e!important;--card-foreground:#231f1b!important;--popover-foreground:#231f1b!important;--background:#fbf8f1!important;--card:#fdfaf3!important;--border:#8c7358!important;--ui-text-primary:#231f1b!important;--ui-text-secondary:#3d332a!important;--ui-text-tertiary:#54483d!important;--ui-text-quaternary:#5c4e41!important;--ui-stroke-secondary:var(--btw-b1)!important;--ui-bg-elevated:#fbf8f1!important;--ui-chat-bubble-background:#fbf8f1!important;--stroke-nous:#8c7358!important;--btw-s0:#fbf8f1!important;--btw-s1:#fdfaf3!important;--btw-s2:#efe4cf!important;--popover-surface:#f5efe2!important;--btw-text-strong:#1f1a16!important;--btw-text-body:#382e25!important;--btw-text-muted:#54483d!important;--btw-surface-inset:rgba(146,108,68,0.07)!important;--btw-border-subtle:#9c8468!important;--btw-seg-bg:#f2e8d5!important;--btw-seg-border:#8c7358!important;--btw-seg-thumb:#fffdf9!important;--btw-seg-thumb-border:#9a3412!important;--btw-seg-fg:#3d332a!important;--btw-seg-fg-active:#7c2d12!important;--btw-radar-grid:rgba(120,86,52,0.34)!important;--btw-radar-node-ring:#231f1b!important;--btw-warn:#9a3412!important;--btw-danger:#be123c!important;--btw-ok:#166534!important;--btw-observe:#1d4ed8!important;--btw-act:#9a3412!important;--btw-hypo:#7c2d12!important;--btw-fg-muted:#54483d!important;--btw-r-lg:10px;--btw-r-md:7px;--btw-r-sm:4px;color-scheme:light!important;font-family:'Lexend','Georgia','Inter',serif}
:is(:root.dark,[data-theme="dark"]) :is([data-btw-theme="paper"].btw-studio-popover,[data-btw-theme="paper"].btw-studio-dialog,.btw-set-panel[data-btw-theme="paper"]),[data-btw-theme="paper"]:is(.btw-studio-popover,.btw-studio-dialog),.btw-set-panel[data-btw-theme="paper"]{border-radius:10px!important;border:1px solid var(--btw-b1,#8c7358)!important;background:linear-gradient(180deg,#fbf8f1 0%,#f5efe2 100%),#fbf8f1!important;box-shadow:0 18px 44px -10px rgba(45,35,25,0.36)!important;color:#231f1b!important}
${PAPER} .btw-studio-head{background:linear-gradient(180deg,#f3ebdc 0%,#ece2cf 100%),#fbf8f1!important;border-bottom:1.5px solid var(--btw-b1,#8c7358)!important;color:#231f1b!important}
${PAPER} .btw-brand{font-weight:750;letter-spacing:0.06em;color:#7c2d12!important;text-shadow:none!important}
:root.dark [data-btw-theme="paper"] .btw-qa-card,${PAPER} :is(.btw-qa-card,.btw-basic-md-overview,.btw-set-card,.btw-mascot-stage,.btw-ternary-card,.btw-kpi,.btw-flight,.btw-bubble,.btw-subagent-card,.btw-lesson-bento,.btw-gamify-deck,.btw-gamify-card,.btw-preset-btn,.btw-preset-add-btn,.btw-web-toggle-pill,.btw-action-mode-pill,.btw-mascot-act-btn,.btw-select,.btw-preset-input,.btw-ask-box,.btw-preset-editor){border-radius:8px;border:1px solid #bfa78a!important;background:#fdfaf3!important;color:#231f1b!important}
${PAPER} :is(.btw-qa-body,.btw-qa-body *,.btw-basic-md-overview *){color:#231f1b!important}
${PAPER} :is(.btw-qa-body code,.btw-basic-md-overview code,.btw-inline-code){background:#eee3ce!important;color:#7c2d12!important;border:1px solid #cbb69b!important}
${PAPER} :is(.btw-qa-body pre,.btw-basic-md-overview pre){background:#f2e8d5!important;color:#231f1b!important;border:1px solid #cbb69b!important}
${PAPER} :is(.btw-basic-md-overview table,.btw-composer-banner-body table){background:#fffdf9!important;border-color:#cbb69b!important}
${PAPER} :is(.btw-basic-md-overview th,.btw-composer-banner-body th){background:#f2e9d8!important;color:#4a3e33!important;border-bottom-color:#cbb69b!important}
${PAPER} .btw-kpi b{color:#7c2d12!important;font-weight:750}
${LIGHT_HOST} [data-btw-theme]{--btw-accent-ink:${mix('var(--btw-accent)',44,'#090d16')}!important;--btw-ok-ink:#064e3b!important;--btw-warn-ink:#78350f!important;--btw-danger-ink:#9f1239!important;--btw-b1:rgba(15,23,42,0.28)!important;--btw-border-interactive:${mix('var(--btw-text-strong,#0f172a)',52,'var(--btw-s1,#ffffff)')}!important;--btw-placeholder-fg:#0f172a!important;--foreground:#0f172a!important;--muted-foreground:#475569!important;--card-foreground:#0f172a!important;--popover-foreground:#0f172a!important;--background:#ffffff!important;--card:#f8fafc!important;--border:rgba(15,23,42,0.24)!important;--ui-text-primary:#0f172a!important;--ui-text-secondary:#334155!important;--ui-text-tertiary:#475569!important;--ui-text-quaternary:#475569!important;--ui-stroke-secondary:rgba(15,23,42,0.26)!important;--ui-bg-elevated:#ffffff!important;--ui-chat-bubble-background:#ffffff!important;--stroke-nous:rgba(15,23,42,0.24)!important;--btw-text-strong:#090d16!important;--btw-text-body:#1e293b!important;--btw-text-muted:#475569!important;--btw-surface-inset:rgba(15,23,42,0.045)!important;--btw-border-subtle:rgba(15,23,42,0.2)!important;--btw-seg-bg:#eef2f6!important;--btw-seg-border:rgba(15,23,42,0.26)!important;--btw-seg-thumb:#ffffff!important;--btw-seg-thumb-border:var(--btw-accent)!important;--btw-seg-fg:#334155!important;--btw-seg-fg-active:#090d16!important;--btw-ok:#166534!important;--btw-observe:#0369a1!important;--btw-act:#9a3412!important;--btw-warn:#9a3412!important;--btw-danger:#be123c!important;--btw-hypo:#0369a1!important;--btw-radar-grid:rgba(51,65,85,0.28)!important;--btw-radar-node-ring:#0f172a!important;color-scheme:light!important}
${LIGHT_HOST} [data-btw-theme="host"]{--btw-accent-default:#0369a1;--btw-b1:rgba(15,23,42,0.28);--btw-s0:#ffffff;--btw-s1:#f8fafc;--btw-s2:#f1f5f9;--btw-placeholder-fg:#0f172a;--popover-surface:#ffffff}
${LIGHT_HOST} [data-btw-theme="orbyx"]{--btw-accent-default:#0369a1;--btw-b1:rgba(3,105,161,0.42);--btw-fg-muted:#0369a1;--btw-s0:#f4f7fe;--btw-s1:#ffffff;--btw-s2:#e8effd;--btw-placeholder-fg:#090d16;--popover-surface:#eef2ff}
${LIGHT_HOST} :is([data-btw-theme="orbyx"].btw-studio-popover,[data-btw-theme="orbyx"].btw-studio-dialog,.btw-set-panel[data-btw-theme="orbyx"]){background:linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%),#f4f7fe!important;border-color:rgba(3,105,161,0.42)!important;color:#090d16!important}
:root.light [data-btw-theme="orbyx"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="orbyx"] :is(${TCARDS}){background:rgba(255,255,255,0.95)!important;border-color:rgba(3,105,161,0.34)!important;color:#090d16!important;box-shadow:0 1px 4px rgba(15,23,42,0.05)!important}
${LIGHT_HOST} [data-btw-theme="orbyx"] :is(.btw-brand,.btw-kpi b){color:#0369a1!important;text-shadow:none!important}
${LIGHT_HOST} [data-btw-theme="cryo"]{--btw-accent-default:#0369a1;--btw-b1:rgba(3,105,161,0.45);--btw-fg-muted:#0369a1;--btw-s0:#eef4fb;--btw-s1:#ffffff;--btw-s2:#e2ecf7;--btw-placeholder-fg:#08142c;--popover-surface:#e2ecf7}
${LIGHT_HOST} :is([data-btw-theme="cryo"].btw-studio-popover,[data-btw-theme="cryo"].btw-studio-dialog,.btw-set-panel[data-btw-theme="cryo"]){background:linear-gradient(180deg,#f2f7fd 0%,#e5eef9 100%),#eef4fb!important;border-color:rgba(3,105,161,0.45)!important;color:#08142c!important}
:root.light [data-btw-theme="cryo"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="cryo"] :is(${TCARDS}){background:rgba(255,255,255,0.95)!important;border-color:rgba(3,105,161,0.34)!important;color:#08142c!important}
${LIGHT_HOST} [data-btw-theme="cryo"] :is(.btw-brand,.btw-kpi b){color:#0369a1!important;text-shadow:none!important}
${LIGHT_HOST} [data-btw-theme="ai"]{--btw-accent-default:#9a3412;--btw-b1:rgba(180,83,9,0.42);--btw-fg-muted:#57534e;--btw-s0:#fffbeb;--btw-s1:#ffffff;--btw-s2:#fef3c7;--btw-placeholder-fg:#1c1917;--popover-surface:#fef3c7}
${LIGHT_HOST} :is([data-btw-theme="ai"].btw-studio-popover,[data-btw-theme="ai"].btw-studio-dialog,.btw-set-panel[data-btw-theme="ai"]){background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%),#fffbeb!important;border-color:rgba(180,83,9,0.42)!important;color:#1c1917!important}
:root.light [data-btw-theme="ai"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="ai"] :is(${TCARDS}){background:rgba(255,255,255,0.95)!important;border-color:rgba(180,83,9,0.34)!important;color:#1c1917!important}
${LIGHT_HOST} [data-btw-theme="ai"] :is(.btw-brand,.btw-kpi b){color:#9a3412!important;text-shadow:none!important}
${LIGHT_HOST} [data-btw-theme="glass"]{--btw-accent-default:#0369a1;--btw-b1:rgba(15,23,42,0.28);--btw-fg-muted:#334155;--btw-s0:#f8fafc;--btw-s1:rgba(255,255,255,0.95);--btw-s2:rgba(241,245,249,0.97);--btw-placeholder-fg:#0f172a;--popover-surface:#f1f5f9}
${LIGHT_HOST} :is([data-btw-theme="glass"].btw-studio-popover,[data-btw-theme="glass"].btw-studio-dialog,.btw-set-panel[data-btw-theme="glass"]){background:linear-gradient(135deg,#ffffff 0%,#f1f5f9 100%),#f8fafc!important;border:1px solid rgba(15,23,42,0.26)!important;color:#0f172a!important}
:root.light [data-btw-theme="glass"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="glass"] :is(${TCARDS}){background:rgba(255,255,255,0.94)!important;border-color:rgba(15,23,42,0.24)!important;color:#0f172a!important}
${LIGHT_HOST} [data-btw-theme="glass"] :is(.btw-brand,.btw-kpi b){color:#0369a1!important;text-shadow:none!important}
${LIGHT_HOST} [data-btw-theme="terminal"]{--btw-accent-default:#166534;--btw-b1:#166534;--btw-ok:#166534;--btw-fg-muted:#14532d;--btw-s0:#f4f4ec;--btw-s1:#fafaf5;--btw-s2:#e9eadc;--btw-placeholder-fg:#14532d;--popover-surface:#f4f4ec}
${LIGHT_HOST} :is([data-btw-theme="terminal"].btw-studio-popover,[data-btw-theme="terminal"].btw-studio-dialog,.btw-set-panel[data-btw-theme="terminal"]){background:#f4f4ec!important;border:1px solid #166534!important;color:#14532d!important}
:root.light [data-btw-theme="terminal"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="terminal"] :is(${TCARDS}){background:#fafaf5!important;border-color:rgba(22,101,52,0.45)!important;color:#14532d!important;box-shadow:none!important}
${LIGHT_HOST} [data-btw-theme="terminal"] :is(.btw-brand,.btw-kpi b){color:#166534!important;text-shadow:none!important}
${LIGHT_HOST} [data-btw-theme="minimal"]{--btw-accent-default:#0f766e;--btw-b1:#a1a1aa;--btw-fg-muted:#52525b;--btw-s0:#fafafa;--btw-s1:#ffffff;--btw-s2:#f4f4f5;--btw-placeholder-fg:#18181b;--popover-surface:#fafafa}
${LIGHT_HOST} :is([data-btw-theme="minimal"].btw-studio-popover,[data-btw-theme="minimal"].btw-studio-dialog,.btw-set-panel[data-btw-theme="minimal"]){background:#fafafa!important;border-color:#a1a1aa!important;color:#18181b!important}
:root.light [data-btw-theme="minimal"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="minimal"] :is(${TCARDS}){background:#ffffff!important;border-color:#a1a1aa!important;color:#18181b!important}
${LIGHT_HOST} [data-btw-theme="nordic"]{--btw-accent-default:#047857;--btw-b1:rgba(4,120,87,0.42);--btw-fg-muted:#065f46;--btw-s0:#f0fdf4;--btw-s1:#ffffff;--btw-s2:#dcfce7;--btw-placeholder-fg:#064e3b;--popover-surface:#dcfce7}
${LIGHT_HOST} :is([data-btw-theme="nordic"].btw-studio-popover,[data-btw-theme="nordic"].btw-studio-dialog,.btw-set-panel[data-btw-theme="nordic"]){background:linear-gradient(180deg,#f0fdf4 0%,#dcfce7 100%),#f0fdf4!important;border-color:rgba(4,120,87,0.42)!important;color:#064e3b!important}
:root.light [data-btw-theme="nordic"] .btw-qa-card,${LIGHT_HOST} [data-btw-theme="nordic"] :is(${TCARDS}){background:rgba(255,255,255,0.95)!important;border-color:rgba(4,120,87,0.34)!important;color:#064e3b!important}
${LIGHT_HOST} [data-btw-theme="nordic"] :is(.btw-brand,.btw-kpi b){color:#047857!important;text-shadow:none!important}
${LPT} :is(.btw-dash-tile,.btw-radar-tactical-deck,.btw-pet-card,.btw-attached-btw-dock,.btw-subagent-launcher,.btw-launcher-omnibox,.btw-subagent-inspector,.btw-sub-accordion,.btw-file-bento-card,.btw-mesh-row,.btw-mesh-file-card,.btw-learn-filter-bar,.btw-auto-learn-strip,.btw-playbook-manager,.btw-memory-sync-card,.btw-yield-bento,.btw-rich-playbook-stage,.btw-session-mesh-card,.btw-mesh-topology-stage,.btw-mesh-contract-hud,.btw-gamify-deck,.btw-gamify-card){background:rgba(255,255,255,0.92)!important;border-color:rgba(15,23,42,0.2)!important;color:var(--btw-text-strong,#0f172a)!important}
${PAPER} :is(.btw-dash-tile,.btw-radar-tactical-deck,.btw-pet-card,.btw-mesh-row,.btw-mesh-file-card,.btw-learn-filter-bar,.btw-auto-learn-strip,.btw-playbook-manager,.btw-memory-sync-card,.btw-yield-bento,.btw-rich-playbook-stage){background:#fdfaf3!important;border-color:#bfa78a!important;color:#231f1b!important}
${LPT} .btw-nav-alert-dot[data-level="medium"]{background:#b45309!important;box-shadow:none!important}
${LPT} .btw-nav-alert-dot[data-level="high"]{background:#be123c!important;box-shadow:none!important}
${LPT} .btw-nav-tab[data-alert-level="high"]:not([data-active="true"]){color:#9f1239!important;font-weight:700!important}
${LPT} .btw-nav-tab[data-active="true"]{border-bottom-color:${mix(VBA,85,'#0f172a')}!important;color:#090d16!important}
${LPT} :is(.btw-head-mode-btn[data-active="true"],.btw-filter-pill[data-active="true"],.btw-composer-synth-btn,.btw-growth-pill[data-active="true"],.btw-cron-btn[data-active="true"],.btw-seg-btn[data-active="true"],.btw-set-sec-pill[data-active="true"],.btw-lens-preset-btn[data-active="true"]){color:#0f172a!important;border-color:${mix(VBA,85,'#0f172a')}!important;background:${mix(VBA,13,'#ffffff')}!important;box-shadow:0 1px 2px rgba(15,23,42,0.08)!important}
${LPT} .btw-head-demo-btn[data-active="true"]{color:#78350f!important;border-color:#b45309!important;background:#fef3c7!important;box-shadow:0 1px 2px rgba(180,83,9,0.12)!important}
${LPT} .btw-preset-card[data-recommended="true"] .btw-preset-btn{border-color:${mix(VBA,85,'#0f172a')}!important;box-shadow:inset 0 0 0 1px ${mix(VBA,85,'#0f172a')}!important}
${LPT} :is(.btw-token-chip,.btw-tactical-chip,.btw-tool-dist-pill,.btw-mesh-line-chip,.btw-overview-status-pill,.btw-overview-model-pill,.btw-overview-playbook-pill,.btw-overview-deep-btn,.btw-voice-hub-btn,.btw-composer-plus-btn){background:rgba(255,255,255,0.94)!important;border-color:rgba(15,23,42,0.34)!important;color:#1e293b!important}
${LPT} .btw-mesh-risk-badge[data-risk="high"]{color:#9f1239!important;background:rgba(225,29,72,0.12)!important;border-color:#be123c!important}
${LPT} .btw-mesh-risk-badge[data-risk="medium"]{color:#92400e!important;background:rgba(217,119,6,0.14)!important;border-color:#b45309!important}
${LPT} :is(.btw-mesh-risk-badge[data-risk="low"],.btw-mesh-risk-badge[data-risk="workspace"]){color:#065f46!important;background:rgba(5,150,105,0.12)!important;border-color:#047857!important}
.btw-smart-rec-btn,.btw-inline-code,.btw-basic-md-overview code,.btw-composer-banner-body code,.btw-pasted-badge,.btw-branch-badge,.btw-composer-synth-btn,.btw-readmore-btn,.btw-decode,.btw-compare-table td.win,.btw-step::before,.btw-row-badge:not([data-alert="true"]),.btw-pinned-tool-chip,.btw-file-ext-badge,.btw-pet-ai-badge,.btw-banner-laser-pill:not([data-phase="ready_burst"]),.btw-mic-btn[data-state="transcribing"],.btw-mesh-line-chip[data-focus="true"],${BS} :is(.btw-ac,.btw-bac),${LPT} :is(.btw-ac,.btw-bac,.btw-smart-rec-btn,.btw-inline-code,.btw-pasted-badge,.btw-branch-badge,.btw-composer-synth-btn,.btw-readmore-btn,.btw-row-badge:not([data-alert="true"]),.btw-pinned-tool-chip,.btw-file-ext-badge,.btw-pet-ai-badge){color:var(--btw-accent-ink)!important}
${LPT} :is(.text-sky-300,.text-sky-400,.btw-hypo){color:#0369a1!important}
${PAPER} :is(.btw-hypo){color:#7c2d12!important}
.btw-companion-mood-pill[data-mood="alert"],.btw-row-badge[data-alert="true"],.btw-alert-strip .btw-alert-icon,.btw-mic-btn[data-state="recording"],.btw-voice-hub-btn[data-mode="recording"],.btw-flight[data-state="act"] .btw-flight-state{color:var(--btw-danger-ink)!important}
.btw-alert-strip[data-tone="wait"] .btw-alert-icon,.btw-alert-btn,.btw-flight[data-state="watch"] .btw-flight-state{color:var(--btw-warn-ink)!important}
${BS} :is(.btw-em,.text-emerald-400,.text-emerald-300),${LPT} :is(.btw-em,.text-emerald-400,.text-emerald-300,.btw-specialist-badge[data-attention="low"]),.btw-specialist-badge[data-attention="low"],.btw-voice-hub-btn[data-mode="live"],.btw-web-toggle-pill[data-active="true"],.btw-banner-laser-pill[data-phase="ready_burst"],.btw-flight[data-state="calm"] .btw-flight-state{color:var(--btw-ok-ink)!important}
${LPT} :is(.btw-mic-btn[data-state="recording"],.btw-voice-hub-btn[data-mode="recording"]){background:rgba(225,29,72,0.1)!important;border-color:#be123c!important;color:#be123c!important}
${LPT} .btw-voice-hub-btn[data-mode="live"]{background:rgba(4,120,87,0.1)!important;border-color:#047857!important}
${LPT} .btw-banner-laser-pill[data-phase="ready_burst"]{background:rgba(4,120,87,0.12)!important;border-color:#047857!important;color:#064e3b!important}
${LPT} :is(.bg-\\[#10b981\\]\\/20,.bg-\\[#10b981\\]\\/18,.bg-emerald-500\\/15,.bg-emerald-500\\/18,.bg-emerald-500\\/20){background:rgba(4,120,87,0.09)!important}
${LPT} kbd{background:#e2e8f0!important;border:1px solid #94a3b8!important;color:#0f172a!important;box-shadow:0 1px 0 rgba(15,23,42,0.12)!important}
${PAPER} kbd{background:#eee3ce!important;border:1px solid #8c7358!important;color:#231f1b!important}
${LPT} .btw-slider-readout{color:#0f172a!important}
${LPT} :is(.text-amber-200,.text-amber-300,.text-amber-400,.btw-specialist-badge[data-attention="medium"]){color:#92400e!important}
${LPT} :is(.text-rose-300,.text-rose-400,.btw-specialist-badge[data-attention="high"],.btw-preset-card[data-recommended="true"][data-attention="high"] .btw-preset-btn,.btw-smart-rec-pill[data-attention="high"] .btw-smart-rec-btn){color:#9f1239!important}
${LPT} :is(.text-purple-300,.text-purple-400){color:#6b21a8!important}
${LPT} .btw-health-pill[data-health-state="watch"]{color:#92400e!important;border-color:rgba(180,83,9,0.52)!important;background:rgba(245,158,11,0.15)!important}
${LPT} .btw-health-pill[data-health-state="act"]{color:#9f1239!important;border-color:rgba(190,18,60,0.52)!important;background:rgba(244,63,94,0.13)!important}
${LPT} .btw-health-pill[data-health-state="calm"]{color:#065f46!important;border-color:rgba(5,150,105,0.48)!important;background:rgba(16,185,129,0.12)!important}
${LPT} .btw-web-toggle-pill[data-active="true"]{color:#065f46!important;border-color:#047857!important;background:rgba(4,120,87,0.12)!important}
${LPT} .btw-steered-badge{background:rgba(21,128,61,0.12)!important;border-color:rgba(21,128,61,0.42)!important;color:#166534!important}
.btw-blobatar-wrap{${DIF};justify-content:center;border-radius:999px;flex-shrink:0}
${LPT} .btw-blobatar-wrap{background:${mix(VBA,12,'#f8fafc')}!important;color:var(--btw-accent-ink)!important;padding:1.5px;box-shadow:inset 0 0 0 1px ${mix(VBA,38,'rgba(15,23,42,0.28)')}!important}
${PAPER} .btw-blobatar-wrap{background:#efe4cf!important;color:#7c2d12!important;box-shadow:inset 0 0 0 1px #8c7358!important}
${PAPER} :is(.btw-token-chip,.btw-tactical-chip,.btw-tool-dist-pill,.btw-mesh-line-chip,.btw-overview-status-pill,.btw-overview-model-pill,.btw-overview-playbook-pill,.btw-overview-deep-btn,.btw-voice-hub-btn,.btw-composer-plus-btn,.btw-preset-btn,.btw-preset-add-btn,.btw-web-toggle-pill,.btw-action-mode-pill,.btw-ask-box,.btw-smart-rec-pill){background:#fdfaf3!important;border-color:#7d664c!important;color:#231f1b!important}
${PAPER} .btw-smart-rec-auto{border-left-color:#8c7358!important;color:#3d332a!important}
${PAPER} .btw-smart-rec-auto[data-active="true"]{background:#efe4cf!important;color:#1f1a16!important;font-weight:650!important}
${PAPER} .btw-voice-hub-btn[data-mode="wake"]{background:#f5ebd6!important;border-color:#9a3412!important;color:#7c2d12!important}
${PAPER} .btw-nav-tab[data-active="true"]{background:rgba(154,52,18,0.1)!important;border-bottom-color:#9a3412!important;color:#1f1a16!important}
${PAPER} :is(.btw-head-mode-btn[data-active="true"],.btw-filter-pill[data-active="true"],.btw-composer-synth-btn,.btw-growth-pill[data-active="true"],.btw-cron-btn[data-active="true"],.btw-seg-btn[data-active="true"],.btw-set-sec-pill[data-active="true"],.btw-lens-preset-btn[data-active="true"]){background:#fffdf9!important;border-color:#9a3412!important;color:var(--btw-accent-ink)!important}
${PAPER} .btw-ask-box:focus-within{border-color:#9a3412!important;box-shadow:0 0 0 2px rgba(154,52,18,0.16),0 8px 20px -8px rgba(45,35,25,0.22)!important}
[data-btw-density="compact"] .btw-studio-head{padding:7px 11px 0}
[data-btw-density="compact"] .btw-studio-scroll{padding:8px 10px 18px;gap:7px}
[data-btw-density="compact"] :is(.btw-preset-btn,.btw-preset-add-btn){padding:4px 7px;font-size:11px}
[data-btw-density="compact"] .btw-qa-body{padding:8px 10px}
[data-btw-density="compact"] .btw-qa-header{padding:6px 9px}
.btw-studio-popover[data-pinned="true"]{box-shadow:0 22px 54px -12px rgba(0,0,0,0.52)!important}
.btw-kbd-hint{font-size:10px;color:var(--btw-text-muted)}
.btw-hud{${DFC};height:100%;min-height:0;font-size:calc(12px * var(--btw-zoom,1));background:${mix('var(--btw-s0,Canvas)',96)};backdrop-filter:blur(24px) saturate(1.4);border-radius:var(--btw-r-lg,14px);border:1px solid ${mix(VBA,30,VST)};box-shadow:0 16px 40px -10px rgba(0,0,0,0.45);overflow:hidden}
.btw-hud-head{${DFC};gap:4px;padding:6px 10px;border-bottom:1px solid ${mixStk(75)};background:${mix(VBA,6)}}
.btw-hud-session{${DIF};gap:6px;min-width:0;font-size:11px}
.btw-hud-avatar-chip{${DIF};gap:4px;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:600;letter-spacing:0.04em;background:${mix(VBA,16)};border:1px solid ${mix(VBA,42)};color:${VTP};flex-shrink:0}
.btw-hud-avatar-chip[data-tone="error"]{background:${mix('var(--ui-red,#ef4444)',18)};border-color:${mix('var(--ui-red,#ef4444)',50)}}
.btw-hud-avatar-chip[data-tone="warn"]{background:${mix('var(--ui-yellow,#f59e0b)',18)};border-color:${mix('var(--ui-yellow,#f59e0b)',50)}}
.btw-hud-avatar-chip[data-tone="good"]{background:${mix('var(--ui-green,#10b981)',18)};border-color:${mix('var(--ui-green,#10b981)',50)}}
.btw-hud-telemetry-bar{${DIF};gap:6px;overflow-x:auto;scrollbar-width:none;font-size:9.5px;font-family:${FONT_MONO};color:${VTT};padding:2px 0 1px}
.btw-hud-tabs{${DIF};gap:4px;padding:4px 10px;border-bottom:1px solid ${mixStk(50)};background:${mixTxt(2)}}
.btw-hud-tab{border-radius:999px;padding:2px 8px;font-size:10px;border:1px solid transparent;background:transparent;color:${VTS};cursor:pointer;transition:all 0.12s ease}
.btw-hud-tab:hover{color:${VTP}}
.btw-hud-tab[data-active="true"]{background:${mix(VBA,18)};border-color:${mix(VBA,50)};color:${VTP};font-weight:600}
.btw-hud-behavior{padding:8px 10px;border-bottom:1px solid ${mixStk(60)};background:${mixTxt(4)};${DFC};gap:6px}
.btw-hud-feed{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 10px;${DFC};gap:8px}
.btw-pet-bubble{position:relative;border-radius:12px;padding:8px 10px;border:1px solid ${mixStk(80)};background:${mixTxt(3.5)};backdrop-filter:blur(8px);transition:border-color 0.15s ease}
.btw-pet-bubble:hover{border-color:${mix(VBA,45,VST)}}
.btw-pet-bubble[data-tone="error"]{border-color:${mix('var(--ui-red,#ef4444)',45)};background:${mix('var(--ui-red,#ef4444)',7)}}
.btw-pet-bubble[data-tone="good"]{border-color:${mix('var(--ui-green,#10b981)',45)};background:${mix('var(--ui-green,#10b981)',6)}}
.btw-pet-bubble[data-tone="wait"]{border-color:${mix('var(--ui-yellow,#f59e0b)',45)};background:${mix('var(--ui-yellow,#f59e0b)',6)}}
.btw-pet-bubble-head{${DIF};gap:5px;margin-bottom:4px;font-size:10px}
.btw-pet-bubble-badge{border-radius:4px;padding:1px 5px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em}
.btw-pet-bubble-text{line-height:1.45;color:${VTP};font-size:calc(11.5px * var(--btw-zoom,1))}
.btw-pet-bubble-metrics{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}
.btw-pet-bubble-tag{font-size:9.5px;font-family:${FONT_MONO};padding:1px 5px;border-radius:4px;background:${mixTxt(5)};color:${VTS};border:1px solid ${mixStk(50)}}
.btw-pet-bubble-actions{${DIF};gap:4px;margin-top:6px;padding-top:4px;border-top:1px solid ${mixStk(35)}}
.btw-bubble{max-width:92%;border-radius:12px;padding:6px 9px;line-height:1.45;font-size:calc(12px * var(--btw-zoom,1))}
.btw-bubble[data-btw-role="user"]{align-self:flex-end;border-bottom-right-radius:4px;background:${mix(VBA,22)};color:${VTP}}
.btw-bubble[data-btw-role="bot"]{align-self:flex-start;border-bottom-left-radius:4px;border:1px solid ${VST};background:${mixTxt(3)}}
.btw-hud-input{display:flex;align-items:flex-end;gap:6px;padding:7px 8px;border-top:1px solid ${VST};background:${mix('var(--btw-s0,Canvas)',85)}}
.btw-hud-input textarea{flex:1;resize:none;min-height:30px;max-height:90px;border-radius:9px;padding:6px 8px;border:1px solid ${VST};background:${mixTxt(3)};color:${VTP};font:inherit;font-size:calc(12px * var(--btw-zoom,1));outline:none}
.btw-hud-input textarea:focus{border-color:${VBA}}
.btw-hud-chips{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:4px;padding:0 10px 6px;scrollbar-width:none}
.btw-hud-chip{border-radius:999px;padding:2px 8px;font-size:10.5px;border:1px solid ${VST};background:transparent;color:${VTS};cursor:pointer;white-space:nowrap;flex:none}
.btw-hud-chip:hover:not(:disabled){border-color:${VBA};color:${VTP}}
.btw-alert-strip{${DIF};gap:8px;margin-bottom:4px;padding:5px 6px 5px 10px;border-radius:6px;font-size:11.5px;color:${VTP};border:1px solid ${mix('var(--btw-danger)',45,VST)};background:${mix('var(--btw-danger)',9)};animation:btw-rise 0.18s cubic-bezier(0.16,1,0.3,1)}
.btw-alert-strip[data-tone="wait"]{border-color:${mix('var(--btw-warn)',50,VST)};background:${mix('var(--btw-warn)',9)}}
.btw-alert-strip .btw-alert-icon{color:var(--btw-danger)}
.btw-alert-strip[data-tone="wait"] .btw-alert-icon{color:var(--btw-warn)}
.btw-alert-btn{height:24px;padding:0 8px;font-size:10.5px;color:${mix('var(--btw-warn)',72,VTP)}!important;border-color:${mix('var(--btw-warn)',55,VST)}!important}
.btw-warn-item{border-radius:var(--btw-r-md,10px)!important;border:1px solid ${mix('var(--btw-warn)',32,VST)};background:${mixTxt(3)}}
.btw-warn-text{color:${mix('var(--btw-warn)',72,VTP)}}
.btw-readmore-btn{background:transparent;border:0;padding:0;font:600 11px/1.2 ${FONT_MONO};color:${VBA};cursor:pointer;flex-shrink:0}
.btw-readmore-btn:hover{text-decoration:underline}
.btw-decode{font-family:${FONT_MONO};font-size:10.5px;letter-spacing:0.14em;color:${VBA}}
.btw-set-panel{${DFC};gap:12px;width:100%;max-width:920px;padding:2px 4px 18px}
.btw-set-panel--inline{max-width:none;width:100%;flex:0 0 auto;padding:2px 2px 20px;border-bottom:0;max-height:none;overflow:visible}
.btw-set-row{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:7px 0;min-width:0}
.btw-set-row+.btw-set-row{border-top:1px solid ${mix('var(--btw-border-subtle,var(--ui-stroke-secondary))',45)}}
.btw-set-row--stack{flex-direction:column;align-items:stretch;gap:4px}
.btw-set-row-ctrl{flex-shrink:0;${DIF};justify-content:flex-end;max-width:54%;min-width:0;padding-top:1px}
.btw-set-row--stack>.btw-set-row-ctrl{max-width:100%;width:100%;justify-content:flex-start;padding-top:3px}
.btw-set-label{font-size:11.5px;font-weight:600;line-height:1.35;color:var(--btw-text-strong,${VTP})}
.btw-set-desc{font-size:10.5px;line-height:1.45;color:var(--btw-text-muted,${VTS});max-width:58ch;margin-top:1.5px}
@keyframes btw-rise{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
[data-btw-present="true"]{--btw-zoom:1.22!important}
.btw-compare-table{width:100%;border-collapse:collapse;font-size:11.5px;font-variant-numeric:tabular-nums}
.btw-compare-table :is(th,td){padding:5px 7px;border-bottom:1px solid ${VST};text-align:left}
.btw-compare-table td.win{color:${VBA};font-weight:650}
.btw-select{width:100%;border-radius:var(--btw-r-sm,7px);padding:4px 8px;border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,${mixTxt(4)});color:var(--btw-text-strong,${VTP});font:inherit;font-size:11px;outline:none;transition:border-color 0.14s ease}
.btw-select:focus{border-color:${VBA}}
.btw-select option{background:var(--btw-s0,#0f172a);color:var(--btw-text-strong,#f8fafc)}
${PAPER} .btw-select option{background:#fdfaf3;color:#231f1b}
.btw-stepper{${DIF};gap:2px;padding:2px;border-radius:var(--btw-r-sm,7px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,transparent)}
.btw-stepper-btn{${DIF};justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:calc(var(--btw-r-sm,7px) - 2px);background:transparent;color:var(--btw-seg-fg,${VTS});font:650 12px/1 ${FONT_MONO};cursor:pointer}
.btw-stepper-btn:hover{background:${mix(VBA,16)};color:var(--btw-text-strong)}
.btw-stepper-input{width:46px;height:24px;border:0!important;outline:none!important;background:transparent!important;color:var(--btw-text-strong,${VTP});font:650 11px/1 ${FONT_MONO};font-variant-numeric:tabular-nums;text-align:center;padding:0 2px;-moz-appearance:textfield}
.btw-stepper-input::-webkit-outer-spin-button,.btw-stepper-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.btw-stepper-unit{font:600 9.5px/1 ${FONT_MONO};color:var(--btw-text-muted);padding:3px 6px;margin-left:2px;border-left:1px solid var(--btw-seg-border,${VST});user-select:none;white-space:nowrap}
.btw-seg{${DIF};flex-wrap:wrap;gap:2px;padding:2.5px;border-radius:var(--btw-r-sm,7px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,transparent);max-width:100%;min-width:0}
.btw-seg[data-full="true"]{display:flex;flex-wrap:nowrap;width:100%}
.btw-seg-btn{${DIF};justify-content:center;gap:4px;min-height:24px;padding:2px 8px;border-radius:calc(var(--btw-r-sm,7px) - 2px);border:1px solid transparent;background:transparent;color:var(--btw-seg-fg,${VTS});font-size:10.5px;font-weight:560;line-height:1.2;cursor:pointer;min-width:0;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all 0.14s ease}
.btw-seg[data-full="true"] .btw-seg-btn{flex:1 1 0%;padding:2px 4px;font-size:10px;gap:2.5px}
.btw-seg-btn:hover:not([data-active="true"]){color:var(--btw-text-strong);background:${mix('var(--btw-text-strong)',6)}}
.btw-seg-btn[data-active="true"]{background:var(--btw-seg-thumb);border-color:var(--btw-seg-thumb-border);color:var(--btw-seg-fg-active);font-weight:660;box-shadow:0 1px 4px rgba(0,0,0,0.14)}
.btw-cron-seg{${DIF};gap:2px;padding:2px;border-radius:8px;border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,transparent)}
.btw-cron-btn{${DIF};justify-content:center;min-height:24px;min-width:28px;padding:0 6px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--btw-seg-fg,${VTS});font:600 10px/1 ${FONT_MONO};cursor:pointer;transition:all 0.14s ease}
.btw-cron-btn:hover:not([data-active="true"]){color:var(--btw-text-strong);background:${mixTxt(5)}}
.btw-cron-btn[data-active="true"]{background:var(--btw-seg-thumb);border-color:var(--btw-seg-thumb-border);color:var(--btw-seg-fg-active);font-weight:700}
.btw-switch{position:relative;${DIF};width:36px;height:21px;padding:2px;border-radius:999px;border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,rgba(148,163,184,0.18));cursor:pointer;flex-shrink:0;transition:all 0.16s ease}
.btw-switch:hover{border-color:${mix(VBA,55,'var(--btw-seg-border)')}}
.btw-switch[data-checked="true"]{background:${VBA};border-color:${mix(VBA,85,'#ffffff')}}
${LPT} .btw-switch[data-checked="true"]{background:${mix(VBA,86,'#090d16')}!important;border-color:${mix(VBA,92,'#090d16')}!important}
.btw-switch-thumb{width:14px;height:14px;border-radius:999px;background:#e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.35);transform:translateX(0);transition:transform 0.16s ${EASE_SPRING},background 0.16s ease}
${LPT} .btw-switch:not([data-checked="true"]) .btw-switch-thumb{background:#475569!important}
.btw-switch[data-checked="true"] .btw-switch-thumb{transform:translateX(15px);background:#041014}
${LPT} .btw-switch[data-checked="true"] .btw-switch-thumb{background:#ffffff!important}
.btw-flight{${DIF};gap:10px;padding:7px 10px;border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03));backdrop-filter:blur(10px)}
.btw-flight[data-state="calm"]{--btw-tone:var(--btw-ok)}
.btw-flight[data-state="watch"]{--btw-tone:var(--btw-act)}
.btw-flight[data-state="act"]{--btw-tone:var(--btw-danger)}
.btw-flight[data-steering="true"]{--btw-tone:var(--btw-observe)}
.btw-flight-ring{position:relative;width:34px;height:34px;flex:none}
.btw-flight-ring svg{width:34px;height:34px;transform:rotate(-90deg)}
.btw-flight-ring .btw-ring-track{stroke:${mixTxt(12)}}
.btw-flight-ring .btw-ring-fill{stroke:var(--btw-tone);transition:stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)}
.btw-flight-ring span{position:absolute;inset:0;display:grid;place-items:center;font:650 10px/1 ${FONT_MONO};color:${VTP};font-variant-numeric:tabular-nums}
.btw-flight-state{font:700 10.5px/1 ${FONT_MONO};letter-spacing:0.12em;text-transform:uppercase;color:${mix('var(--btw-tone)',72,VTP)}}
.btw-flight-sub{font-size:10.5px;color:${VTS};line-height:1.35}
.btw-flight[data-steering="true"] .btw-flight-ring::after{content:'';position:absolute;inset:-3px;border-radius:999px;border:1.5px solid ${mix('var(--btw-observe)',60)};animation:btw-probe 1.6s ease-out infinite}
@keyframes btw-probe{from{opacity:0.9;transform:scale(0.92)}to{opacity:0;transform:scale(1.25)}}
.btw-seal{${DIF};gap:4px;padding:1px 6px;border-radius:999px;font:650 10px/1.5 ${FONT_MONO};letter-spacing:0.02em;border:1px solid ${mix('var(--btw-seal,var(--btw-observe))',52)};background:${mix('var(--btw-seal,var(--btw-observe))',13)};color:${mix('var(--btw-seal,var(--btw-observe))',65,VTP)};max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${LPT} .btw-seal{color:${mix('var(--btw-seal,var(--btw-observe))',82,'#090d16')}!important;border-color:${mix('var(--btw-seal,var(--btw-observe))',65,'rgba(15,23,42,0.25)')}!important}
.btw-seal[data-kind="observed"]{--btw-seal:var(--btw-observe)}
.btw-seal[data-kind="hypo"]{--btw-seal:var(--btw-hypo)}
.btw-seal[data-kind="lever"]{--btw-seal:var(--btw-act)}
.btw-seal[data-kind="scope"]{--btw-seal:var(--btw-text-muted)}
.btw-seal:is([data-kind="helped"],[data-kind="self_recovered"],[data-kind="psi-ok"]){--btw-seal:var(--btw-ok)}
.btw-seal:is([data-kind="hurt"],[data-kind="psi-bad"]){--btw-seal:var(--btw-danger)}
.btw-seal:is([data-kind="no_observed_effect"],[data-kind="confounded"]){--btw-seal:var(--btw-text-muted)}
.btw-seal[data-kind="thread"]{--btw-seal:${VBA}}
.btw-token-bar{display:flex;flex-wrap:nowrap;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none;padding:1px 0}
.btw-token-chip{flex:none;${DIF};height:22px;padding:0 7px;border-radius:6px;font:500 11px/1 ${FONT_MONO};border:1px solid ${mixStk(55)};background:${mixTxt(4)};color:${mixTxt(82)};white-space:nowrap;cursor:pointer;transition:all 0.12s ease}
.btw-token-chip:hover{border-color:${mixAcc(60)};background:${mixAcc(12)};color:${VTP}}
.btw-resolved{padding:6px 8px;border-radius:8px;font-size:11px;line-height:1.45;border-left:2px solid var(--btw-observe);background:${mix('var(--btw-observe)',7)};color:${VTS};white-space:pre-wrap;overflow-wrap:anywhere;max-height:110px;overflow-y:auto}
.btw-followup-bar{${DIF};gap:6px;padding:4px 8px;border-radius:8px;font-size:11px;border:1px solid ${mixAcc(38,VST)};background:${mixAcc(8)};color:${VTS}}
.btw-preset-card[data-suggested="true"] .btw-preset-btn{border-color:${mixAcc(65,VST)};background:${mixAcc(11)};color:${VTP}}
.btw-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
@container btwsurface (max-width:560px){.btw-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-kpi{border:1px solid ${mixStk(38)};background:var(--btw-s1,transparent);border-radius:var(--btw-r-md,10px);padding:8px 10px;min-width:0}
.btw-kpi b{display:block;font-size:16px;font-weight:700;color:${VTP};font-variant-numeric:tabular-nums}
.btw-kpi small{font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--btw-text-muted,${VTS})}
.btw-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;counter-reset:btwstep}
@container btwsurface (max-width:620px){.btw-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-step{counter-increment:btwstep;position:relative;padding:8px 9px 8px 26px;border-radius:var(--btw-r-md,10px);font-size:11px;line-height:1.4;color:${VTS};border:1px solid ${mixStk(36)};background:var(--btw-s1,${mixTxt(3.5)})}
.btw-step::before{content:counter(btwstep);position:absolute;left:7px;top:8px;width:14px;height:14px;border-radius:999px;display:grid;place-items:center;font:700 9px/1 ${FONT_MONO};background:${mixAcc(22)};color:${VBA}}
.btw-lesson{border:1px solid ${mixStk(38)};border-left:3px solid var(--btw-ok);background:var(--btw-s1,transparent);border-radius:var(--btw-r-md,10px);padding:7px 9px;font-size:11.5px;min-width:0}
.btw-yield-bar{height:4px;border-radius:999px;background:${mixTxt(8)};overflow:hidden}
.btw-yield-bar>i{display:block;height:100%;background:var(--btw-ok);border-radius:inherit}
.btw-yield-bar[data-neg="true"]>i{background:var(--btw-danger)}
.btw-row-badge{${DIF};gap:2px;height:15px;padding:0 4px;border-radius:999px;font:650 9px/1 ${FONT_MONO};font-variant-numeric:tabular-nums;color:${VBA};background:${mixAcc(14)}}
.btw-row-badge[data-alert="true"]{color:var(--btw-danger);background:${mix('var(--btw-danger)',15)}}
.btw-anom-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:4px;min-width:0;max-width:100%;overflow:hidden}
.btw-learned{border:1px solid ${mix('var(--btw-ok)',42,VST)};background:${mix('var(--btw-ok)',7)};border-radius:9px;padding:7px 9px}
.btw-studio-popover :is(button,[role="button"],[role="tab"],[role="radio"],[role="slider"],[role="switch"],textarea:not(.btw-ask-textarea),input,select):focus-visible,.btw-studio-dialog :is(button,[role="button"],[role="tab"],[role="radio"],[role="slider"],[role="switch"],textarea:not(.btw-ask-textarea),input,select):focus-visible,.btw-set-panel :is(button,[role="button"],[role="tab"],[role="radio"],[role="slider"],[role="switch"],input,select):focus-visible{outline:2px solid ${VBA}!important;outline-offset:2px!important}
.btw-card-minichat{${DFC};gap:7px;padding:10px 12px;border-top:1px solid ${mixAcc(32,VST)};background:linear-gradient(180deg,${mixAcc(7)},transparent),${mixTxt(2.5)}}
.btw-synth-preview{${DFC};gap:5px;padding:8px 10px;border-radius:9px;border:1px solid ${mix('var(--btw-ok)',45,VST)};background:${mix('var(--btw-ok)',6)}}
.btw-subagent-zone{${DFC};gap:8px;padding:10px 12px;border-radius:13px;border:1px solid ${mixStk(65)};background:${mixTxt(1.8)}}
.btw-subagent-zone[data-zone="running"]{border-color:rgba(56,189,248,0.42);background:radial-gradient(circle at 12% 0%,rgba(56,189,248,0.1),transparent 70%),${mixTxt(2)}}
.btw-subagent-zone[data-zone="done"]{border-color:rgba(16,185,129,0.36);background:radial-gradient(circle at 12% 0%,rgba(16,185,129,0.08),transparent 70%),${mixTxt(1.8)}}
.btw-subagent-zone[data-zone="failed"]{border-color:rgba(244,63,94,0.42);background:radial-gradient(circle at 12% 0%,rgba(244,63,94,0.09),transparent 70%),${mixTxt(2)}}
.btw-subagent-card{position:relative;${DFC};align-items:center;justify-content:space-between;gap:7px;padding:11px 12px 10px;border-radius:14px;border:1px solid ${mixStk(72)};background:${mixTxt(2.6)};cursor:pointer;text-align:center;user-select:none;min-width:0;transition:transform 0.16s cubic-bezier(0.16,1,0.3,1),border-color 0.16s ease,box-shadow 0.16s ease}
.btw-subagent-card:hover{transform:translateY(-2px);border-color:${mixAcc(55,VST)};box-shadow:0 10px 24px -8px rgba(0,0,0,0.42)}
.btw-subagent-card[data-selected="true"]{border-width:1.5px;box-shadow:0 0 0 2px ${mixAcc(28)},0 12px 28px -8px rgba(0,0,0,0.5)}
.btw-subagents-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;width:100%}
.btw-packs-grid{display:grid;grid-template-columns:1fr;gap:6px}
@container btwsurface (min-width:520px){.btw-packs-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-subagent-card[data-status="running"]{border-color:rgba(56,189,248,0.52);background:radial-gradient(circle at 50% 48%,rgba(56,189,248,0.14),transparent 68%),${mixTxt(3)}}
.btw-subagent-card[data-status="done"]{border-color:rgba(16,185,129,0.44);background:radial-gradient(circle at 50% 48%,rgba(16,185,129,0.11),transparent 68%),${mixTxt(2.5)}}
.btw-subagent-card[data-status="failed"]{border-color:rgba(244,63,94,0.52);background:radial-gradient(circle at 50% 48%,rgba(244,63,94,0.13),transparent 68%),${mixTxt(2.8)}}
.btw-bot-avatar-stage{position:relative;width:62px;height:62px;${DIF};justify-content:center;border-radius:999px;overflow:hidden}
.btw-bot-avatar-ring{position:absolute;inset:1px;border-radius:999px;border:1.5px solid rgba(16,185,129,0.48);pointer-events:none}
.btw-bot-avatar-stage[data-status="running"] .btw-bot-avatar-ring{border:2px dashed rgba(56,189,248,0.78);animation:btw-orbit-spin 8s linear infinite}
.btw-bot-avatar-stage[data-status="done"] .btw-bot-avatar-ring{border-color:rgba(16,185,129,0.55)}
.btw-bot-avatar-stage[data-status="failed"] .btw-bot-avatar-ring{border-color:rgba(244,63,94,0.65)}
@keyframes btw-orbit-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.btw-subagent-inspector{${DFC};gap:9px;padding:13px 14px;border-radius:12px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03));backdrop-filter:blur(12px)}
.btw-sub-accordion{${DFC};border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03));overflow:hidden;transition:border-color 0.14s ease}
.btw-sub-accordion:hover{border-color:${mixAcc(36,VST)}}
.btw-sub-accordion[data-open="true"]{border-color:${mixAcc(42,VST)};background:${mixAcc(4,'var(--btw-surface-inset,transparent)')}}
.btw-sub-accordion-head{${DFB};gap:8px;width:100%;min-height:36px;padding:6px 11px;background:transparent;border:0;color:${VTP};text-align:left;cursor:pointer;user-select:none}
.btw-sub-accordion-body{padding:9px 12px 11px;border-top:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:${mixTxt(1.5)}}
.btw-overview-command-bar{${DFB};flex-wrap:nowrap;gap:6px;width:100%;padding:2px 1px 4px;min-width:0;overflow-x:auto;scrollbar-width:none}
.btw-overview-status-pill{${DIF};gap:6px;height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.1));background:var(--btw-surface-inset,rgba(255,255,255,0.035));color:${VTP};font-size:11px;cursor:pointer;user-select:none;white-space:nowrap;flex-shrink:0}
.btw-overview-status-pill:hover{border-color:${mixAcc(45,VST)};background:${mixAcc(7)}}
.btw-overview-model-pill{${DIF};gap:5px;height:26px;max-width:100%;padding:0 8px 0 6px;border-radius:7px;border:1px solid var(--btw-seg-border,rgba(255,255,255,0.14));background:var(--btw-seg-bg,rgba(255,255,255,0.04));color:var(--btw-text-strong,${VTP});font-family:${FONT_MONO};font-size:10.5px;font-weight:580;cursor:pointer;white-space:nowrap;min-width:0;transition:all 0.14s ease}
.btw-overview-model-pill:hover{border-color:${mix(VBA,60,'var(--btw-seg-border)')};background:${mix(VBA,10,'var(--btw-seg-bg)')}}
.btw-overview-playbook-pill{${DIF};gap:4.5px;height:25px;padding:0 8.5px;border-radius:999px;border:1px solid var(--btw-seg-border,rgba(255,255,255,0.1));background:var(--btw-surface-inset,rgba(255,255,255,0.03));color:${VTS};font-family:${FONT_MONO};font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0}
.btw-overview-playbook-pill:hover{border-color:${mixAcc(45,VST)};color:${VTP}}
.btw-overview-deep-btn{${DIF};gap:5px;height:25px;padding:0 10px;border-radius:8px;border:1px solid var(--btw-seg-border,rgba(255,255,255,0.12));background:var(--btw-seg-bg,rgba(255,255,255,0.045));color:${VTP};font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.14s ease}
.btw-overview-deep-btn:hover:not(:disabled){border-color:${mixAcc(55,VST)};background:${mixAcc(10)}}
.btw-overview-deep-btn:disabled{opacity:0.6;cursor:default}
.btw-live-dash-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%}
@container btwsurface (min-width:860px){.btw-live-dash-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
.btw-spatial-dock .btw-live-dash-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px}
.btw-spatial-dock .btw-dash-tile{padding:7px 8px;gap:6px}
.btw-studio-live-bar{${DIF};gap:6px;font-size:10.5px;color:${VTS};font-variant-numeric:tabular-nums;white-space:nowrap;padding-bottom:2px;padding-right:6px;flex-shrink:0}
.btw-dash-tile{position:relative;${DIF};gap:11px;padding:10px 12px;border-radius:10px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:radial-gradient(120% 110% at 0% 0%,${mix('var(--btw-tile-glow,#38bdf8)',7)},transparent 70%),var(--btw-s1,rgba(255,255,255,0.025));min-width:0;transition:transform 0.15s ${EASE_SPRING},border-color 0.15s ease}
.btw-dash-tile[data-clickable="true"]{cursor:pointer}
.btw-dash-tile[data-clickable="true"]:hover{transform:translateY(-1px);border-color:${mixAcc(45,VST)}}
.btw-card,.btw-studio,.btw-studio-llm,.btw-studio-quick-ask,.btw-ternary-grad-ve,.btw-ternary-grad-vp{--btw-surface-marker:1}
.btw-file-bento-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;width:100%}
@container btwsurface (max-width:520px){.btw-file-bento-grid{grid-template-columns:minmax(0,1fr)}}
.btw-file-row-actions{${DIF};gap:4px;opacity:0.65;transition:opacity 0.14s ease}
:is(.btw-file-bento-card:hover,.btw-file-bento-card:focus-within) .btw-file-row-actions{opacity:1}
.btw-voice-hub-btn{${DIF};gap:5px;height:26px;padding:0 8.5px;border-radius:7px;border:1px solid ${mixStk(58)};background:${mixTxt(3)};color:${VTS};font-size:11px;font-weight:580;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:all 0.14s ease}
.btw-voice-hub-btn:hover:not(:disabled){border-color:${mixAcc(55,VST)};color:${VTP}}
.btw-voice-hub-btn[data-mode="wake"]{border-color:${mix(VBA,42,VST)};background:${mix(VBA,10)};color:var(--btw-text-strong,${VTP})}
.btw-voice-hub-btn[data-mode="live"]{border-color:#10b981;background:rgba(16,185,129,0.14);color:#10b981}
.btw-voice-hub-btn[data-mode="recording"]{border-color:rgba(244,63,94,0.72);background:rgba(244,63,94,0.16);color:#fda4af;animation:btw-probe 1.4s ease-in-out infinite}
.btw-pinned-tool-chip{${DIF};gap:4.5px;height:21px;padding:0 7px;border-radius:6px;border:1px solid ${mixAcc(55)};background:${mixAcc(13)};color:${VBA};font:600 10px/1 ${FONT_MONO};white-space:nowrap}
.btw-dash-tile-actions{${DIF};gap:4px;margin-top:3px;opacity:0.85}
.btw-dash-tile:hover .btw-dash-tile-actions{opacity:1}
.btw-tile-mini-btn{${DIF};gap:3px;height:20px;padding:0 6.5px;border-radius:999px;font:600 9.5px/1 ${FONT_MONO};color:${VTS};background:${mixTxt(5)};border:1px solid ${mixStk(72)};cursor:pointer;white-space:nowrap;transition:all 0.14s ease}
.btw-tile-mini-btn:hover{color:${VBA};border-color:${mixAcc(58)};background:${mixAcc(14)}}
.btw-tile-mini-btn[data-tone="steer"]:hover{color:#f59e0b;border-color:rgba(245,158,11,0.55);background:rgba(245,158,11,0.14)}
.btw-radar-tactical-deck{${DFC};gap:7px;padding:8px 10px;border-radius:12px;border:1px solid ${mixAcc(28,VST)};background:radial-gradient(120% 120% at 100% 0%,${mixAcc(9)},transparent 70%),var(--btw-s1,rgba(255,255,255,0.025))}
.btw-tactical-chip{${DIF};gap:4px;height:22px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:600;color:${VTS};background:${mixTxt(4)};border:1px solid ${mixStk(52)};cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.14s ease}
.btw-tactical-chip[data-active="true"],.btw-tactical-chip:hover{color:${VTP};border-color:${mixAcc(60)};background:${mixAcc(15)}}
.btw-tool-spectrum-bar{display:flex;width:100%;height:6px;border-radius:999px;overflow:hidden;gap:2px;background:${mixTxt(7)}}
.btw-tool-spectrum-seg{height:100%;border-radius:999px;transition:width 0.28s ${EASE_SPRING},opacity 0.15s ease}
.btw-tool-dist-pill{${DIF};gap:5px;height:24px;padding:0 8px;border-radius:8px;font-family:${FONT_MONO};font-size:10.5px;color:${VTP};background:${mixTxt(3.5)};border:1px solid ${mixStk(52)};cursor:pointer;transition:all 0.14s ease}
.btw-tool-dist-pill[data-selected="true"],.btw-tool-dist-pill:hover{border-color:${mixAcc(55)};background:${mixAcc(12)};transform:translateY(-1px)}
.btw-self-heal-pill{${DFB};gap:8px;padding:6px 10px;border-radius:10px;border:1px solid rgba(16,185,129,0.28);background:rgba(16,185,129,0.06);cursor:pointer}
.btw-self-heal-pill:hover{border-color:rgba(16,185,129,0.45);background:rgba(16,185,129,0.1)}
.btw-file-bento-card{${DFC};gap:5px;padding:8px 10px;border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03));min-width:0;transition:all 0.14s ease}
.btw-file-bento-card:hover{border-color:${mixAcc(48,VST)};background:${mixTxt(3.8)}}
.btw-file-bento-card[data-churn="high"]{border-color:rgba(245,158,11,0.48)}
.btw-file-bento-card[data-syntax="error"]{border-color:rgba(244,63,94,0.55)}
.btw-file-ext-badge{${DIF};justify-content:center;min-width:26px;height:20px;padding:0 5px;border-radius:6px;font:700 9px/1 ${FONT_MONO};letter-spacing:0.03em;text-transform:uppercase;background:${mixAcc(16)};color:${VBA};border:1px solid ${mixAcc(38)}}
.btw-sleek-alert-strip{${DFB};flex-wrap:wrap;gap:8px;padding:8px 11px;border-radius:10px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03))}
.btw-subagent-tail{max-height:180px;overflow-y:auto;padding:8px 10px;border-radius:10px;font:11px/1.45 ${FONT_MONO};border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03));color:${VTS};white-space:pre-wrap;overflow-wrap:anywhere}
.btw-feed-timeline{${DFC};gap:7px;max-height:290px;overflow-y:auto;padding:8px 10px;border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-surface-inset,rgba(255,255,255,0.03))}
.btw-feed-thought{padding:6px 9px;border-radius:10px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));border-left:2.5px solid var(--btw-hypo,#38bdf8);background:${mixTxt(2.5)};color:${VTS};font-size:11px;line-height:1.42}
.btw-feed-tool{${DFC};gap:2px;padding:5px 8px;border-radius:7px;border:1px solid ${mixStk(72)};background:${mixTxt(2.5)};font-size:10.5px}
.btw-feed-tool[data-status="error"]{border-color:${mix('var(--btw-danger)',50,VST)};background:${mix('var(--btw-danger)',6)}}
.btw-feed-tool[data-status="running"]{border-color:${mixAcc(55,VST)};background:${mixAcc(7)}}
.btw-feed-reply{padding:6px 9px;border-radius:7px;border-left:2.5px solid var(--btw-ok,#34d399);background:${mix('var(--btw-ok,#34d399)',7)};color:${VTP};font-size:11px;line-height:1.42}
.btw-empty-hero{${DFC};align-items:center;justify-content:center;gap:6px;padding:18px 16px;border-radius:12px;border:1px solid ${mixStk(55)};background:radial-gradient(80% 90% at 50% 0%,${mixAcc(7)},transparent 70%),${mixTxt(1.8)};text-align:center}
.btw-set-card{${DFC};gap:8px;min-width:0;padding:12px 14px;border-radius:var(--btw-r-md);border:1px solid ${mixStk(55)};background:var(--btw-s1);transition:border-color 0.16s ease}
.btw-set-card:hover{border-color:${mixAcc(42,VST)}}
.btw-set-card-head{${DFB};flex-wrap:wrap;gap:6px 8px;min-width:0;padding-bottom:6px;border-bottom:1px solid ${mixStk(38)}}
.btw-set-card-title{${DIF};gap:6px;min-width:0;flex:1 1 160px;font-size:12px;font-weight:700;color:var(--btw-text-strong,${VTP})}
.btw-head-mode-pill{${DIF};height:25px;gap:2px;padding:2px;border-radius:999px;background:var(--btw-seg-bg,${mixTxt(6.5)});border:1px solid var(--btw-seg-border,${mixStk(72)})}
.btw-head-mode-btn{${DIF};gap:3px;height:19px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:600;color:var(--btw-seg-fg,${VTS});background:transparent;border:1px solid transparent;cursor:pointer;transition:all 0.14s ease;white-space:nowrap}
.btw-head-mode-btn:hover:not([data-active="true"]){color:${VTP};background:${mixTxt(5)}}
.btw-head-mode-btn[data-active="true"]{background:var(--btw-seg-thumb,${mix(VBA,24,'#1e293b')});border-color:var(--btw-seg-thumb-border,${mix(VBA,72)});color:var(--btw-seg-fg-active,#ffffff);font-weight:680;box-shadow:0 1px 3px rgba(0,0,0,0.3)}
.btw-head-demo-btn{${DIF};gap:3.5px;height:25px;padding:0 9px;border-radius:999px;font-size:10px;font-weight:650;color:var(--btw-text-body,${VTS});background:transparent;border:1px dashed ${mix('#f59e0b',45,VST)};cursor:pointer;white-space:nowrap;transition:all 0.14s ease}
.btw-head-demo-btn:hover{border-style:solid;border-color:#f59e0b;color:var(--btw-warn-ink,#fde68a);background:rgba(245,158,11,0.12)}
.btw-head-demo-btn[data-active="true"]{border-style:solid;background:rgba(245,158,11,0.2);border-color:#f59e0b;color:#fef3c7;box-shadow:0 0 10px -2px rgba(245,158,11,0.35)}
.btw-pet-card{${DFC};gap:5px;padding:8px 10px;border-radius:var(--btw-r-md,10px);border:1px solid ${mixAcc(36,VST)};background:${mixAcc(6,'var(--btw-s1,transparent)')}}
.btw-pet-card[data-tone="error"]{border-color:${mix('var(--btw-danger)',50,VST)};background:${mix('var(--btw-danger)',8)}}
.btw-pet-card-header{${DFB};gap:6px}
.btw-pet-ai-badge{font:650 9.5px/1.3 ${FONT_MONO};padding:1px 6px;border-radius:999px;color:${VBA};background:${mixAcc(15)};border:1px solid ${mixAcc(38)}}
.btw-hud-tool-row{padding:7px 9px;border-radius:8px;border:1px solid ${mixStk(70)};background:${mixTxt(3)};${DFB};font-size:11.5px}
.btw-hud[data-inline="true"]{height:auto;max-height:268px}
.btw-hud-head,.btw-hud-tabs,.btw-hud-chips,.btw-hud-input{flex-shrink:0}
.btw-subagent-md{font-family:var(--font-sans,system-ui,sans-serif);font-size:calc(11.5px * var(--btw-zoom,1));line-height:1.5;color:${VTP}}
.btw-subagent-md p{margin:0 0 4px}
.btw-subagent-md p:last-child{margin-bottom:0}
.btw-subagent-md :is(h1,h2,h3,h4){font-size:calc(12px * var(--btw-zoom,1));font-weight:650;margin:2px 0 4px;color:${VTP}}
.btw-subagent-md :is(ul,ol){margin:2px 0 4px;padding-left:16px}
.btw-file-pill{${DIF};gap:5px;max-width:100%;padding:2px 7px;border-radius:6px;border:1px solid ${mixStk(75)};background:${mixTxt(3.5)};font-family:${FONT_MONO};font-size:10px;color:${VTP};cursor:pointer}
.btw-file-pill:hover{border-color:${mixAcc(55,VST)};background:${mixAcc(9)}}
.btw-attach-strip{display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding:4px 2px 2px}
.btw-attach-chip{${DIF};gap:5px;max-width:240px;padding:2px 7px;border-radius:7px;border:1px solid ${mixAcc(42,VST)};background:${mixAcc(9)};font-size:10.5px;color:${VTP}}
.btw-attach-thumb{width:18px;height:18px;border-radius:4px;object-fit:cover;flex-shrink:0;border:1px solid ${mixStk(80)}}
.btw-theme-live-stage{${DFB};flex-wrap:wrap;gap:12px;padding:11px 14px;border-radius:var(--btw-r-md,11px);border:1px solid ${mix(VBA,38,'var(--btw-border-subtle)')};background:radial-gradient(90% 120% at 10% 0%,${mix(VBA,13)} 0%,transparent 65%),var(--btw-surface-inset,${mixTxt(3)})}
.btw-theme-live-meta{${DFC};gap:5px;min-width:210px;flex:1 1 240px}
.btw-theme-dna-strip{${DIF};gap:5px;flex-wrap:wrap}
.btw-theme-dna-pill{${DIF};gap:4.5px;padding:2px 7px;border-radius:999px;font:650 9.5px/1.3 ${FONT_MONO};color:var(--btw-text-body,${VTS});background:var(--btw-seg-bg,${mixTxt(5)});border:1px solid var(--btw-seg-border,${VST})}
.btw-theme-dna-dot{width:9px;height:9px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.48),0 0 0 1px rgba(0,0,0,0.38);flex-shrink:0}
.btw-theme-live-specimen{${DIF};gap:6px;flex-wrap:wrap;padding:6px 9px;border-radius:var(--btw-r-sm,8px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,transparent)}
.btw-theme-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%}
@container btwsurface (max-width:540px){.btw-theme-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-theme-card{position:relative;min-width:0;${DFC};align-items:flex-start;gap:5px;padding:8px 9px;border-radius:var(--btw-r-md,10px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-surface-inset,${mixTxt(2.8)});text-align:left;cursor:pointer;overflow:hidden;transition:transform 0.16s ${EASE_SPRING},border-color 0.16s ease}
.btw-theme-card:hover{border-color:${mix(VBA,62,VST)};transform:translateY(-1px)}
.btw-theme-card[data-active="true"]{border-color:${VBA};background:${mix(VBA,11,'var(--btw-surface-inset,transparent)')};box-shadow:0 0 0 1.5px ${mix(VBA,55)}}
.btw-theme-swatch{position:relative;width:100%;height:38px;border-radius:calc(var(--btw-r-md,10px) - 3px);border:1px solid rgba(148,163,184,0.34);background-color:#0f172a;overflow:hidden;${DFC};justify-content:space-between;padding:4px 6px}
.btw-theme-swatch-top,.btw-theme-swatch-body{${DFB};gap:4px;width:100%}
.btw-theme-swatch-dots{${DIF};gap:3px}
.btw-theme-swatch-dots>i{width:5px;height:5px;border-radius:999px;display:inline-block}
.btw-theme-swatch-tag{font:750 7.5px/1.3 ${FONT_MONO};letter-spacing:0.06em;text-transform:uppercase;padding:0.5px 4px;border-radius:4px}
.btw-theme-swatch-mock-card{flex:1 1 auto;height:12px;border-radius:3.5px;${DIF};gap:4px;padding:0 5px}
.btw-theme-swatch-mock-bar{height:3.5px;border-radius:999px}
.btw-theme-swatch-palette{${DIF};gap:2.5px;flex-shrink:0}
.btw-theme-swatch-palette>span{width:7px;height:7px;border-radius:999px;border:1px solid rgba(255,255,255,0.55);box-shadow:0 0 0 1px rgba(15,23,42,0.45)}
.btw-theme-card-badge{font:700 8px/1.3 ${FONT_MONO};letter-spacing:0.04em;text-transform:uppercase;padding:1px 5px;border-radius:999px;border:1px solid ${mix(VBA,52)};background:${mix(VBA,13)};color:var(--btw-text-strong,${VTP});flex-shrink:0}
.btw-visual-deck{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;width:100%;margin-top:2px}
@container btwsurface (min-width:780px){.btw-visual-deck{grid-template-columns:minmax(240px,0.82fr) minmax(0,1.38fr);align-items:stretch}}
.btw-accent-studio-tile,.btw-ergonomics-studio-tile{${DFC};justify-content:space-between;gap:9px;padding:11px 13px;border-radius:var(--btw-r-md,10px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-surface-inset,${mixTxt(2.2)});min-width:0}
.btw-swatch-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;align-items:center;justify-items:center;padding:6px 4px 4px}
@container btwsurface (min-width:540px) and (max-width:779px){.btw-swatch-grid{grid-template-columns:repeat(12,minmax(0,1fr));gap:6px}}
.btw-swatch-dot{position:relative;width:25px;height:25px;border-radius:999px;padding:0;border:2px solid rgba(255,255,255,0.36);box-shadow:0 1px 4px rgba(0,0,0,0.28),inset 0 0 0 1px rgba(0,0,0,0.28);cursor:pointer;${DIF};justify-content:center;color:#090d16;font-size:11px;font-weight:800;text-shadow:0 1px 1px rgba(255,255,255,0.55);transition:transform 0.14s ${EASE_SPRING}}
${LP} .btw-swatch-dot{border:1.5px solid rgba(15,23,42,0.36);box-shadow:0 1px 3px rgba(15,23,42,0.16),inset 0 0 0 1px rgba(255,255,255,0.45)}
.btw-swatch-dot:hover{transform:scale(1.12);border-color:#ffffff}
.btw-swatch-dot[data-active="true"]{transform:scale(1.1);border-color:#ffffff;box-shadow:0 0 0 2.5px ${VBA},0 3px 10px rgba(0,0,0,0.38)}
${LP} .btw-swatch-dot[data-active="true"]{border-color:#ffffff;box-shadow:0 0 0 2.5px #0f172a,0 2px 8px rgba(15,23,42,0.28)}
.btw-ergonomics-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;width:100%}
@container btwsurface (max-width:460px){.btw-ergonomics-grid{grid-template-columns:minmax(0,1fr)}}
.btw-ergonomics-cell{${DFC};align-items:stretch;justify-content:space-between;gap:5px;padding:7px 9px;border-radius:var(--btw-r-sm,8px);border:1px solid ${mix('var(--btw-seg-border)',72)};background:${mix('var(--btw-text-strong)',1.8)};min-width:0;overflow:hidden}
.btw-ergonomics-lbl{font-size:10.5px;font-weight:600;line-height:1.25;color:var(--btw-text-body,${VTS});min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.btw-mascot-nameplate{${DIF};gap:5px;padding:1.5px 7.5px;border-radius:999px;font:750 9.5px/1.3 ${FONT_MONO};letter-spacing:0.04em;color:var(--btw-text-strong,${VTP});background:${mix(VBA,14)};border:1px solid ${mix(VBA,48)}}
.btw-ternary-card{${DFC};align-items:stretch;gap:12px;padding:12px;border-radius:var(--btw-r-md,12px);border:1px solid ${mix('var(--btw-ternary-color,var(--btw-accent))',42,'var(--btw-seg-border)')};background:radial-gradient(circle at 24% 45%,${mix('var(--btw-ternary-color,var(--btw-accent))',10)},transparent 68%),var(--btw-surface-inset,${mixTxt(2.5)});width:100%;min-width:0;user-select:none}
.btw-lens-radar-col{${DFC};align-items:center;justify-content:flex-start;gap:8px;min-width:0;width:100%;height:100%;padding:4px 6px 6px}
.btw-ternary-svg{width:100%;max-width:360px;height:auto;margin:0 auto;touch-action:none;cursor:crosshair;overflow:hidden;display:block}
.btw-ternary-lbl-v{fill:#38bdf8}.btw-ternary-lbl-e{fill:#34d399}.btw-ternary-lbl-p{fill:#fcd34d}.btw-ternary-lbl-ep{fill:#2dd4bf}.btw-ternary-lbl-m{fill:#d8b4fe}.btw-ternary-lbl-s{fill:#fda4af}
${LP} .btw-ternary-lbl-v{fill:#075985!important}${LP} .btw-ternary-lbl-e{fill:#166534!important}${LP} .btw-ternary-lbl-p{fill:#92400e!important}${LP} .btw-ternary-lbl-ep{fill:#115e59!important}${LP} .btw-ternary-lbl-m{fill:#6b21a8!important}${LP} .btw-ternary-lbl-s{fill:#9f1239!important}
.btw-ternary-readout{${DFC};align-items:stretch;justify-content:space-between;gap:8px;width:100%;min-width:0;padding:11px 12px;border-radius:var(--btw-r-md,10px);border:1px solid ${mix('var(--btw-ternary-color,var(--btw-accent))',34,'var(--btw-seg-border)')};background:${mix('var(--btw-ternary-color,var(--btw-accent))',5,'var(--btw-seg-bg,transparent)')};text-align:left}
@container btwsurface (min-width:560px){.btw-ternary-card{display:grid;grid-template-columns:minmax(256px,0.96fr) minmax(0,1.14fr);align-items:stretch;gap:12px;padding:12px 14px}.btw-ternary-readout{height:100%}}
.btw-lens-axes-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px;width:100%}
.btw-lens-axis-item{${DFC};gap:4px;min-width:0;cursor:pointer;padding:4px 6px;border-radius:6px;transition:background 0.12s ease}
.btw-lens-axis-item:hover{background:${mix('var(--btw-text-strong)',6)}}
.btw-lens-axis-top{${DFB};gap:4px;font-size:10px;line-height:1.2;min-width:0}
.btw-lens-axis-name{${DIF};gap:3.5px;font-weight:600;color:var(--btw-text-body);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.btw-lens-axis-pct{font:700 9.5px/1 ${FONT_MONO};font-variant-numeric:tabular-nums;color:var(--btw-text-strong);flex-shrink:0}
.btw-lens-axis-track{position:relative;height:6px;width:100%;border-radius:999px;background:${mix('var(--btw-text-strong)',14)};overflow:visible}
.btw-lens-axis-fill{width:100%;height:100%;border-radius:999px;transform-origin:left center;transition:transform 0.14s ${EASE_SPRING}}
.btw-lens-axis-thumb{position:absolute;top:50%;width:12px;height:12px;border-radius:999px;transform:translate(-50%,-50%);border:2px solid var(--btw-s0,#0b101d);box-shadow:0 1px 4px rgba(0,0,0,0.45),0 0 0 1.5px rgba(255,255,255,0.6);pointer-events:none;transition:left 0.14s ${EASE_SPRING}}
.btw-lens-live-preview{${DFC};gap:3.5px;padding:8px 10px;border-radius:8px;border:1px solid var(--btw-seg-border);background:var(--btw-s0,#0b101d);font:500 10px/1.45 ${FONT_MONO};color:var(--btw-text-body);overflow-wrap:anywhere}
.btw-lens-presets-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;width:100%;padding-top:2px}
@container btwsurface (min-width:780px){.btw-lens-presets-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.btw-lens-preset-btn{${DIF};justify-content:flex-start;gap:5px;height:26px;padding:0 8px;border-radius:var(--btw-r-sm,7px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,transparent);color:var(--btw-seg-fg,${VTS});font-size:10.5px;font-weight:560;cursor:pointer;min-width:0;overflow:hidden;white-space:nowrap;transition:all 0.14s ease}
.btw-lens-preset-btn:hover{border-color:${mix(VBA,55,'var(--btw-seg-border)')};color:var(--btw-text-strong)}
.btw-lens-preset-btn[data-active="true"]{background:var(--btw-seg-thumb);border-color:${VBA};color:var(--btw-seg-fg-active);font-weight:660}
.btw-set-bento-grid{${DFC};gap:10px;width:100%}
@container btwsurface (min-width:720px){.btw-set-bento-grid[data-bento="true"]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}.btw-set-bento-grid[data-bento="true"] .btw-set-card--full{grid-column:1 / -1}}
.btw-set-sec-bar{position:sticky;top:-14px;z-index:20;display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;align-items:center;gap:4px;margin:-4px -6px 4px;padding:8px 8px 7px;border-radius:0 0 var(--btw-r-md,10px) var(--btw-r-md,10px);background:var(--btw-s0,#0b101d)!important;backdrop-filter:none!important;border:1px solid var(--btw-seg-border,${VST});box-shadow:0 -16px 0 8px var(--btw-s0,#0b101d),0 8px 18px -8px rgba(0,0,0,0.4)}
.btw-set-sec-pill{${DIF};gap:4.5px;height:25px;padding:0 7.5px;border-radius:calc(var(--btw-r-md,10px) - 3px);font-size:10.5px;font-weight:560;color:var(--btw-seg-fg,${VTS});background:transparent;border:1px solid transparent;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.14s ease}
.btw-set-sec-pill:hover{color:var(--btw-text-strong);background:${mix('var(--btw-text-strong)',6)}}
.btw-set-sec-pill[data-active="true"]{color:var(--btw-seg-fg-active);font-weight:660;border-color:var(--btw-seg-thumb-border);background:var(--btw-seg-thumb);box-shadow:0 1px 3px rgba(0,0,0,0.14)}
.btw-set-back-btn{${DIF};gap:5px;height:26px;padding:0 10px;border-radius:var(--btw-r-sm,7px);font-size:11px;font-weight:600;color:var(--btw-text-strong);background:var(--btw-seg-bg);border:1px solid var(--btw-seg-border);cursor:pointer}
.btw-set-back-btn:hover{border-color:${VBA};color:${VBA};background:${mix(VBA,12)}}
.btw-mascot-stage{${DFC};gap:9px;padding:11px 13px;border-radius:var(--btw-r-md,12px);border:1px solid ${mix('var(--mascot-aura,var(--btw-accent))',38,'var(--btw-seg-border)')};background:radial-gradient(circle at 14% 38%,${mix('var(--mascot-aura,var(--btw-accent))',13)},transparent 62%),var(--btw-surface-inset,${mixTxt(2.5)})}
.btw-mascot-stage--compact{padding:7px 10px;gap:6px}
.btw-mascot-stage-main{${DIF};gap:12px}
.btw-mascot-avatar-btn{position:relative;width:76px;height:76px;padding:0;border:0;background:transparent;cursor:pointer;flex-shrink:0;outline:none;transition:transform 0.18s ${EASE_SPRING}}
.btw-mascot-stage--compact .btw-mascot-avatar-btn{width:62px;height:62px}
.btw-mascot-avatar-btn:hover{transform:scale(1.06)}
.btw-mascot-avatar-btn:active{transform:scale(0.93) rotate(-4deg)}
.btw-mascot-svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.3))}
.btw-mascot-body-group{transform-origin:60px 62px;animation:btw-mascot-float 3.6s ease-in-out infinite}
.btw-mascot-stage[data-emotion="curious"] .btw-mascot-body-group{transform:rotate(7deg)}
.btw-mascot-stage[data-emotion="affection"] .btw-mascot-body-group{animation:btw-mascot-happy-bounce 0.65s ease-in-out infinite}
.btw-mascot-stage[data-emotion="protective"] .btw-mascot-body-group{animation:btw-mascot-alert-pulse 1.1s ease-in-out infinite}
.btw-mascot-gyro-ring-a{transform-origin:60px 60px;transform:rotate(-18deg);transition:stroke 0.25s ease,transform 0.35s ease}
.btw-mascot-stage[data-emotion="curious"] .btw-mascot-gyro-ring-a{transform:rotate(16deg) scale(1.03)}
.btw-mascot-gyro-ring-b{transform-origin:60px 60px;animation:btw-mascot-spin 18s linear infinite}
.btw-mascot-eyes-gaze{transition:transform 0.14s ${EASE_SPRING}}
.btw-mascot-eyes-blink{transform-origin:60px 58px;animation:btw-mascot-blink 4.6s infinite}
.btw-mascot-heart-beat{color:var(--mascot-emotion-color,${VBA});display:inline-block;animation:btw-mascot-beat var(--mascot-bpm-dur,0.8s) ease-in-out infinite}
.btw-mascot-heart-particle{position:absolute;top:4px;font-size:13px;pointer-events:none;z-index:5;animation:btw-mascot-particle-rise 1s ${EASE_SPRING} forwards}
.btw-mascot-stage-info{flex:1 1 auto;min-width:0;${DFC};gap:6px}
.btw-mascot-emotion-pill{${DIF};gap:5px;padding:1.5px 8px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.03em;background:${mix('var(--mascot-emotion-color,var(--btw-accent))',14)};border:1px solid ${mix('var(--mascot-emotion-color,var(--btw-accent))',48)};color:var(--btw-text-strong)}
.btw-mascot-meters{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@container btwsurface (max-width:480px){.btw-mascot-meters{grid-template-columns:1fr;gap:4px}}
.btw-mascot-meter{${DIF};gap:6px;font-size:10px;min-width:0}
.btw-mascot-meter-lbl{color:var(--btw-text-muted);flex-shrink:0;font-weight:550}
.btw-mascot-meter-track{flex:1 1 auto;height:5.5px;border-radius:999px;background:${mix('var(--btw-text-strong)',12)};overflow:hidden}
.btw-mascot-meter-fill{height:100%;border-radius:999px;transition:width 0.25s ${EASE_SPRING}}
.btw-mascot-meter-val{font:650 9.5px/1 ${FONT_MONO};color:var(--btw-text-body);min-width:30px;text-align:right;font-variant-numeric:tabular-nums}
.btw-mascot-stage-actions{${DFC};gap:6px;padding-top:8px;border-top:1px solid ${mix('var(--btw-seg-border)',55)}}
.btw-mascot-primary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%}
@container btwsurface (max-width:560px){.btw-mascot-primary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-mascot-act-btn{${DIF};justify-content:center;gap:5px;height:26px;padding:0 8px;border-radius:var(--btw-r-sm,7px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-seg-bg,transparent);color:var(--btw-text-body);font-size:10.5px;font-weight:600;cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:all 0.14s ease}
.btw-mascot-act-btn:hover{border-color:${mix(VBA,62,'var(--btw-seg-border)')};color:var(--btw-text-strong);background:${mix(VBA,10,'var(--btw-seg-bg)')}}
.btw-mascot-act-btn[data-active="true"]{border-color:${VBA};background:var(--btw-seg-thumb);color:var(--btw-seg-fg-active)}
.btw-mascot-sub-bar{${DFB};flex-wrap:wrap;gap:6px;width:100%}
.btw-preset-row-card{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:var(--btw-r-sm,8px);border:1px solid var(--btw-seg-border,${VST});background:var(--btw-surface-inset,transparent)}
.btw-preset-row-card:hover{border-color:${mix(VBA,50,'var(--btw-seg-border)')}}
.btw-preset-row-prompt{font-size:10.5px;line-height:1.42;color:var(--btw-text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:1.5px}
.btw-preset-icon-btn{${DIF};justify-content:center;width:26px;height:26px;padding:0;border-radius:var(--btw-r-sm,6px);border:1px solid transparent;background:transparent;color:var(--btw-text-muted);cursor:pointer}
.btw-preset-icon-btn:hover{background:var(--btw-seg-bg);border-color:var(--btw-seg-border);color:var(--btw-text-strong)}
.btw-preset-icon-btn[data-danger="true"]:hover{background:${mix('var(--btw-danger)',14)};border-color:${mix('var(--btw-danger)',45)};color:var(--btw-danger)}
@keyframes btw-mascot-float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-3.5px)}}
@keyframes btw-mascot-happy-bounce{0%,100%{transform:translateY(0) scale(1,1)}45%{transform:translateY(-5px) scale(1.05,0.96)}}
@keyframes btw-mascot-alert-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes btw-mascot-blink{0%,92%,96%,100%{transform:scaleY(1)}94%,98%{transform:scaleY(0.08)}}
@keyframes btw-mascot-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes btw-mascot-beat{0%,100%{transform:scale(1)}40%{transform:scale(1.28)}}
@keyframes btw-mascot-particle-rise{0%{opacity:1;transform:translateY(0) scale(0.8)}100%{opacity:0;transform:translateY(-28px) scale(1.25)}}
.btw-aerial-companion{position:fixed;z-index:18;width:76px;height:76px;pointer-events:auto;user-select:none;cursor:grab;will-change:left,top,transform;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.42))}
.btw-aerial-companion[data-emotion="compression_radar"]{z-index:46;filter:drop-shadow(0 0 18px rgba(0,229,255,0.55)) drop-shadow(0 8px 20px rgba(0,0,0,0.5))}
.btw-aerial-companion:active{cursor:grabbing}
.btw-aerial-orb-wrap{position:relative;width:76px;height:76px;transition:transform 0.16s ${EASE_SPRING}}
.btw-aerial-companion[data-emotion="eureka"] .btw-aerial-orb-wrap{animation:btw-aerial-roll 0.9s ${EASE_SPRING}}
.btw-aerial-thruster{position:absolute;top:50%;width:24px;height:10px;border-radius:999px;pointer-events:none;filter:blur(2px);opacity:0.78}
.btw-aerial-badge{position:absolute;left:50%;bottom:-10px;transform:translateX(-50%);${DIF};gap:3px;padding:1px 6px;border-radius:999px;font:700 8.5px/1.3 ${FONT_MONO};white-space:nowrap;color:#f8fafc;background:rgba(9,13,22,0.92);border:1px solid var(--mascot-aura,#38bdf8);box-shadow:0 2px 8px rgba(0,0,0,0.45);pointer-events:none}
.btw-aerial-bubble{position:absolute;bottom:calc(100% + 8px);width:max-content;max-width:min(230px,calc(100vw - 32px));padding:6px 10px;border-radius:10px;font-size:10.5px;line-height:1.35;color:#f8fafc;background:#0b111e;border:1px solid var(--mascot-aura,#38bdf8);box-shadow:0 8px 24px rgba(0,0,0,0.55);pointer-events:none;overflow-wrap:anywhere;animation:btw-rise 0.18s ease-out}
@keyframes btw-aerial-roll{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.16)}100%{transform:rotate(360deg) scale(1)}}
.btw-mascot-stage[data-emotion="struggle"] .btw-mascot-body-group,.btw-aerial-companion[data-emotion="struggle"] .btw-aerial-orb-wrap{animation:btw-mascot-struggle-wiggle 0.17s ease-in-out infinite!important}
.btw-mascot-sweat-drop{position:absolute;top:2px;font-size:13px;pointer-events:none;z-index:6;animation:btw-sweat-fly 0.55s ease-out infinite}
.btw-laser-canvas{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:47;overflow:visible}
.btw-laser-beam-glow{fill:none;stroke-linecap:round;filter:blur(3px);opacity:0.55}
.btw-laser-beam-core{fill:none;stroke:#ffffff;stroke-linecap:round;opacity:0.95}
.btw-laser-beam-packets{fill:none;stroke-linecap:round;stroke-dasharray:10 14;animation:btw-laser-flow 0.32s linear infinite}
.btw-laser-impact-ring{transform-origin:center;animation:btw-laser-impact-pulse 0.65s ease-out infinite}
.btw-composer-banner[data-laser-state="loading"]{border-color:${mixAcc(72,VST)}!important;box-shadow:0 0 0 1px ${mixAcc(32)},0 0 22px ${mixAcc(28)}!important}
.btw-composer-banner[data-laser-state="ready_burst"]{border-color:${mix('#10b981',75,VAC)}!important;animation:btw-banner-laser-ready 1.8s ${EASE_SPRING}}
.btw-banner-laser-pill{${DIF};gap:4px;padding:1px 6px;border-radius:999px;font:700 9px/1.3 ${FONT_MONO};letter-spacing:0.04em;color:${VAC};background:${mixAcc(16)};border:1px solid ${mixAcc(45)}}
.btw-banner-laser-pill[data-phase="ready_burst"]{color:#34d399;background:rgba(16,185,129,0.16);border-color:rgba(52,211,153,0.55)}
@keyframes btw-mascot-struggle-wiggle{0%,100%{transform:rotate(-11deg) scale(1.06,0.94) translateY(-1px)}50%{transform:rotate(11deg) scale(0.94,1.06) translateY(2px)}}
@keyframes btw-sweat-fly{0%{opacity:1;transform:translate(0,0) scale(0.8)}100%{opacity:0;transform:translate(8px,-16px) scale(1.15)}}
@keyframes btw-laser-flow{from{stroke-dashoffset:48}to{stroke-dashoffset:0}}
@keyframes btw-laser-impact-pulse{0%{opacity:0.95;transform:scale(0.65)}100%{opacity:0;transform:scale(1.85)}}
@keyframes btw-banner-laser-ready{0%{box-shadow:0 0 0 2px rgba(52,211,153,0.65),0 0 28px rgba(56,189,248,0.52)}100%{box-shadow:none}}
.btw-aerial-companion[data-emotion="compression_radar"] .btw-aerial-bubble{bottom:calc(100% + 34px);z-index:3;max-width:min(310px,calc(100vw - 32px));padding:8px 12px;font-size:11.5px;line-height:1.48;background:rgba(7,12,22,0.97);border-width:1.5px}
.btw-mascot-radar-cone{transform-box:view-box;transform-origin:60px 60px;animation:btw-mascot-spin 4.2s linear infinite}
.btw-mascot-sonar-ring{transform-box:view-box;transform-origin:60px 60px;animation:btw-sonar-expand 3.2s ease-out infinite}
.btw-mascot-compress-ring{transform-box:view-box;transform-origin:60px 60px;animation:btw-compress-implode 2.8s ${EASE_SPRING} infinite}
.btw-mascot-visor-scanline{animation:btw-visor-scan 2.4s ease-in-out infinite}
.btw-aerial-radar-hud{position:absolute;top:-26px;left:50%;transform:translateX(-50%);${DIF};gap:5px;padding:2.5px 9px;border-radius:999px;font:700 9.5px/1.2 ${FONT_MONO};white-space:nowrap;color:#00e5ff;background:rgba(5,11,22,0.96);border:1px solid rgba(0,229,255,0.75);pointer-events:none}
@keyframes btw-sonar-expand{0%{opacity:0.92;transform:scale(0.68)}100%{opacity:0;transform:scale(1.52)}}
@keyframes btw-compress-implode{0%{opacity:0;transform:scale(1.42)}40%{opacity:0.95}100%{opacity:0.15;transform:scale(0.55)}}
@keyframes btw-visor-scan{0%,100%{transform:translateY(-9px);opacity:0.85}50%{transform:translateY(9px);opacity:1}}
.btw-companion-mood-pill{${DIF};gap:5px;padding:2px 8px;border-radius:999px;font:600 10px/1.3 ${FONT_MONO};border:1px solid ${mixAcc(38,VST)};background:${mixAcc(9)};color:${VTP};cursor:pointer}
.btw-companion-mood-pill:hover{border-color:${VBA};background:${mixAcc(16)}}
.btw-companion-mood-pill[data-mood="alert"]{border-color:${mix('var(--btw-danger,#f87171)',60)};background:${mix('var(--btw-danger,#f87171)',14)};color:var(--btw-danger,#f87171)}
.btw-companion-mood-pill[data-mood="work"]{border-color:${mix('var(--btw-warn,#fbbf24)',60)};background:${mix('var(--btw-warn,#fbbf24)',12)}}
.btw-spatial-cockpit{${DFC};gap:10px;min-width:0}
.btw-main-pane{container-type:inline-size;container-name:btwpane;min-width:0}
@container btwpane (max-width:540px){.btw-toggle-label{display:none}}
@container btwsurface (min-width:740px){.btw-spatial-cockpit[data-spatial="split"]{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(265px,0.92fr);gap:12px;align-items:start}}
.btw-spatial-dock{container-type:inline-size;container-name:btwsurface;${DFC};gap:9px;min-width:0;padding:9px 10px;border-radius:var(--btw-r-md);border:1px solid ${mixAcc(26,VST)};background:${mixTxt(2)}}
.btw-subagent-launcher{${DFC};gap:9px;padding:11px 13px;border-radius:13px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.08));background:var(--btw-s1,rgba(255,255,255,0.028))}
.btw-launcher-omnibox{${DFC};gap:7px;padding:9px 11px;border-radius:11px;border:1px solid var(--btw-border-subtle,rgba(255,255,255,0.1));background:var(--btw-surface-inset,rgba(255,255,255,0.024))}
.btw-launcher-omnibox:focus-within{border-color:${VBA};box-shadow:0 0 0 2px ${mixAcc(14)}}
.btw-launcher-textarea,.btw-launcher-textarea:focus,.btw-launcher-textarea:focus-visible{width:100%;resize:none!important;border:0!important;outline:none!important;box-shadow:none!important;background:transparent;color:${VTP};font-size:12px;line-height:1.45;padding:0}
.btw-launcher-ctx-box{padding-top:6px;border-top:1px dashed ${mixStk(50)};${DFC};gap:5px}
.btw-preset-btn[data-correlated="true"]{border-color:${VBA}!important;box-shadow:0 0 12px -4px ${mixAcc(35)}}
@keyframes btw-contemp-enter{from{opacity:0;transform:translateY(5px) scale(0.992)}to{opacity:1;transform:translateY(0) scale(1)}}
.btw-stagger-item{animation:btw-contemp-enter 0.22s ${EASE_SPRING} both}
.btw-waiting-stage{position:relative;${DFC};align-items:center;justify-content:center;flex:1 1 auto;min-height:212px;gap:8px;padding:24px 20px 20px;border-radius:12px;border:1px solid ${mixStk(32)};background:radial-gradient(52% 58% at 50% 24%,${mixAcc(6)},transparent 76%);text-align:center;overflow:hidden}
.btw-waiting-orb{position:relative;width:72px;height:72px;${DIF};justify-content:center;border-radius:999px;cursor:pointer;user-select:none;background:radial-gradient(circle at 50% 50%,${mixAcc(10)},transparent 72%)}
.btw-waiting-orb--radar,.btw-waiting-orb--subagent{width:76px;height:76px}
.btw-waiting-radar-sweep{position:absolute;inset:3px;border-radius:999px;background:conic-gradient(from 0deg at 50% 50%,transparent 0deg,transparent 300deg,${mixAcc(4)} 330deg,${mixAcc(18)} 360deg);animation:btw-orbit-spin 4.8s linear infinite;pointer-events:none}
.btw-waiting-radar-crosshair{position:absolute;inset:8px;border-radius:999px;background:linear-gradient(90deg,transparent 49.4%,${mixStk(22)} 50%,transparent 50.6%),linear-gradient(0deg,transparent 49.4%,${mixStk(22)} 50%,transparent 50.6%);pointer-events:none}
.btw-waiting-decode-card{position:relative;width:min(100%,284px);${DFC};gap:5px;padding:9px 12px;border-radius:10px;border:1px solid ${mixStk(42)};background:${mixTxt(2)};text-align:left}
.btw-waiting-ring-outer{position:absolute;inset:0;border-radius:999px;border:1px solid ${mixStk(36)};pointer-events:none}
.btw-waiting-ring-inner{position:absolute;inset:7px;border-radius:999px;border:1px solid ${mixAcc(16)};pointer-events:none}
.btw-waiting-decode{font-size:9.5px!important;font-weight:600!important;letter-spacing:0.14em!important;color:${VTS}}
.btw-waiting-pill{${DIF};gap:5px;height:20px;padding:0 8px;border-radius:999px;font:500 9.5px/1 ${FONT_MONO};letter-spacing:0.04em;border:1px solid ${mixStk(40)};background:${mixTxt(2.5)};color:${VTS}}
.btw-waiting-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;margin-top:6px}
.btw-composer-model-hub{${DIF};gap:5px;max-width:100%;min-width:0;flex-shrink:1;padding:0;border:0!important;background:transparent!important}
.btw-model-tier-pill{${DIF};gap:5px;height:24px;padding:0 8px;border-radius:999px;border:1px solid ${mixStk(75)};background:${mixTxt(3)};color:${VTS};font:500 10px/1 ${FONT_MONO};cursor:pointer}
.btw-model-tier-pill[data-active="true"],.btw-model-tier-pill:hover{border-color:${mixAcc(62)};background:${mixAcc(14)};color:${VTP}}
.btw-primary-send-btn{position:relative;${DIF};justify-content:center;gap:5px;height:26px;padding:0 12px;border-radius:7px;border:1px solid ${mix(VBA,88,'#ffffff')};background:${mix(VBA,76,'#f8fafc')};color:#041019;font-size:11.5px;font-weight:700;letter-spacing:0.01em;white-space:nowrap;flex-shrink:0;cursor:pointer;box-shadow:0 2px 10px -2px ${mixAcc(42)};transition:transform 0.16s ${EASE_SPRING},box-shadow 0.16s ease}
.btw-primary-send-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px -3px ${mixAcc(58)}}
.btw-primary-send-btn:active:not(:disabled){transform:translateY(0) scale(0.98)}
${LIGHT_HOST} .btw-primary-send-btn{background:${mix(VBA,56,'#090d16')}!important;border-color:${mix(VBA,72,'#090d16')}!important;color:#ffffff!important}
${PAPER} .btw-primary-send-btn{background:#7c2d12!important;border-color:#5c1f0a!important;color:#ffffff!important}
:is([data-btw-theme="minimal"],${LIGHT_HOST} [data-btw-theme="minimal"]) .btw-primary-send-btn{background:#0f766e!important;border-color:#115e59!important;color:#ffffff!important}
[data-btw-theme="terminal"] .btw-primary-send-btn{border-radius:2px!important;background:#22c55e!important;border-color:#4ade80!important;color:#031107!important}
${LIGHT_HOST} [data-btw-theme="terminal"] .btw-primary-send-btn{border-radius:2px!important;background:#166534!important;border-color:#14532d!important;color:#ffffff!important}
${LIGHT_HOST} [data-btw-theme="nordic"] .btw-primary-send-btn{background:#047857!important;border-color:#065f46!important;color:#ffffff!important}
${LIGHT_HOST} [data-btw-theme="ai"] .btw-primary-send-btn{background:#9a3412!important;border-color:#7c2d12!important;color:#ffffff!important}
.btw-primary-send-btn:disabled,:is([data-btw-theme="minimal"],[data-btw-theme="terminal"]) .btw-primary-send-btn:disabled{opacity:1!important;cursor:not-allowed;box-shadow:none!important;transform:none!important;background:${mix('var(--btw-text-strong,var(--ui-text-primary))',7,'var(--btw-s1,#131b2e)')}!important;border-color:${mix('var(--btw-text-strong,var(--ui-text-primary))',24,'var(--btw-s1,#131b2e)')}!important;color:${mix('var(--btw-text-strong,var(--ui-text-primary))',56,'var(--btw-s1,#131b2e)')}!important}
${LPT} .btw-primary-send-btn:disabled{opacity:1!important;cursor:not-allowed;box-shadow:none!important;transform:none!important;background:#e2e8f0!important;border-color:#64748b!important;color:#334155!important}
${PAPER} .btw-primary-send-btn:disabled{background:#ebe0cd!important;border-color:#8c7358!important;color:#4a3e33!important}
.btw-ring-gauge-fill{transition:stroke-dashoffset 0.52s ${EASE_SPRING},stroke 0.25s ease}
.btw-ring-gauge--pulse::after{content:'';position:absolute;inset:-2px;border-radius:999px;border:1.5px solid ${mix('var(--btw-ring-color,var(--ui-accent))',55)};animation:btw-probe 1.8s ease-out infinite;pointer-events:none}
.btw-velocity-orb-busy{position:relative;width:42px;height:42px;flex-shrink:0;${DIF};justify-content:center;border-radius:999px;overflow:hidden;background:radial-gradient(circle at 50% 50%,${mixAcc(22)},transparent 72%);border:1px solid ${mixAcc(42)}}
.btw-velocity-orbit-ring{position:absolute;inset:0;border-radius:999px;border:1.5px dashed ${mixAcc(68)};animation:btw-orbit-spin 6s linear infinite;pointer-events:none}
.btw-growth-mode-bar{${DFC};gap:6px;padding:9px 11px;border-radius:12px;border:1px solid ${mixAcc(38,VST)};background:radial-gradient(circle at 0% 0%,${mixAcc(10)},transparent 65%),${mixTxt(2.2)}}
.btw-growth-pill{${DIF};gap:5px;height:25px;padding:0 9px;border-radius:999px;font-size:10.5px;font-weight:600;border:1px solid ${mixStk(70)};background:${mixTxt(2.5)};color:${VTS};cursor:pointer;transition:all 0.16s ${EASE_SPRING}}
.btw-growth-pill:hover{border-color:${mixAcc(55,VST)};color:${VTP}}
.btw-growth-pill[data-active="true"]{border-color:${mixAcc(78)};background:${mixAcc(18)};color:var(--btw-text-strong,${VTP})}
.btw-learn-filter-bar{${DFB};flex-wrap:wrap;gap:6px;padding:7px 9px;border-radius:11px;border:1px solid ${mixStk(62)};background:${mixTxt(2)}}
.btw-filter-pill{${DIF};gap:4px;height:24px;padding:0 8px;border-radius:999px;font:600 9.5px/1 ${FONT_MONO};border:1px solid ${mixStk(68)};background:transparent;color:${VTS};cursor:pointer;white-space:nowrap;transition:all 0.14s ${EASE_SPRING}}
.btw-filter-pill:hover{border-color:${mixAcc(55,VST)};color:${VTP}}
.btw-filter-pill[data-active="true"]{border-color:${VBA};background:${mixAcc(18)};color:var(--btw-text-strong,${VTP});font-weight:700}
.btw-lessons-bento-grid{display:grid;grid-template-columns:1fr;gap:7px;width:100%}
@container btwsurface (min-width:560px){.btw-lessons-bento-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-lesson-bento{${DFC};border-radius:12px;border:1px solid ${mixStk(65)};border-left:3px solid var(--btw-ok);background:${mixTxt(2.2)};overflow:hidden;min-width:0}
.btw-lesson-bento[data-scope="DOM"]{border-left-color:var(--btw-observe,#38bdf8)}
.btw-lesson-bento:hover{border-color:${mixAcc(48,VST)}}
.btw-lesson-bento[data-expanded="true"]{grid-column:1 / -1;border-color:${mixAcc(58,VST)}}
.btw-lesson-bento-head{${DFB};gap:8px;padding:8px 10px;cursor:pointer;user-select:none;min-width:0;max-width:100%;overflow:hidden}
.btw-lesson-bento-body{${DFC};gap:8px;padding:9px 12px 11px;border-top:1px solid ${mixStk(48)};background:${mix('var(--btw-s0,Canvas)',72)}}
.btw-playbook-manager{${DFC};gap:9px;padding:11px 12px;border-radius:13px;border:1px solid ${mixAcc(45,VST)};background:radial-gradient(circle at 10% 0%,${mixAcc(10)},transparent 68%),${mixTxt(2.4)}}
.btw-budget-track{width:100%;height:5.5px;border-radius:999px;background:${mixTxt(9)};overflow:hidden}
.btw-budget-fill{height:100%;border-radius:inherit;transition:width 0.38s ${EASE_SPRING}}
.btw-yield-bento{${DFC};gap:5px;padding:8px 10px;border-radius:10px;border:1px solid ${mixStk(58)};background:${mixTxt(2)}}
.btw-yield-bar-spring{height:5.5px;border-radius:999px;background:${mixTxt(8)};overflow:hidden}
.btw-yield-bar-spring>i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--btw-ok),${mix('var(--btw-ok)',72,'#38bdf8')})}
.btw-yield-bar-spring[data-neg="true"]>i{background:linear-gradient(90deg,var(--btw-danger),#f59e0b)}
.btw-mic-btn{${DIF};justify-content:center;gap:4px;height:26px;min-width:26px;padding:0 7px;border-radius:7px;border:1px solid ${mixStk(60)};background:${mixTxt(3)};color:${VTS};font-size:10.5px;font-weight:580;white-space:nowrap;flex-shrink:0;cursor:pointer}
.btw-mic-btn:hover:not(:disabled){border-color:${mixAcc(60,VST)};background:${mixAcc(10)};color:${VTP}}
.btw-mic-btn[data-state="recording"]{border-color:rgba(244,63,94,0.68);background:rgba(244,63,94,0.15);color:#fda4af;animation:btw-probe 1.5s ease-in-out infinite}
.btw-mic-btn[data-state="transcribing"]{border-color:${mixAcc(70)};background:${mixAcc(14)};color:${VBA}}
.btw-dictation-strip{${DFB};gap:8px;padding:6px 10px;border-radius:8px;border:1px solid ${mixAcc(42,VST)};background:${mixAcc(7,'var(--btw-s1,transparent)')};font-size:11px}
.btw-voice-waveform{${DIF};gap:2px;height:15px;padding:0 2px;color:${VBA}}
.btw-voice-wave-bar{width:2.5px;min-height:3px;border-radius:999px;background:currentColor;transition:height 0.08s ease-out}
.btw-live-voice-banner{${DFB};gap:8px;padding:6px 10px;border-radius:8px;border:1px solid rgba(16,185,129,0.38);background:rgba(16,185,129,0.08);font-size:11px;color:${VTP}}
.btw-audio-player-frame{${DFC};align-items:stretch;justify-content:center;width:100%;padding:12px 14px;background:var(--btw-s2,rgba(15,23,42,0.72));gap:6px}
.btw-audio-player-frame audio{width:100%;height:34px;outline:none}
.btw-web-toggle-pill{${DIF};gap:4.5px;height:26px;padding:0 8px;border-radius:7px;font-size:11px;font-weight:560;white-space:nowrap;flex-shrink:0;border:1px solid ${mixStk(60)};background:${mixTxt(3)};color:${VTS};cursor:pointer;transition:all 0.14s ease}
.btw-web-toggle-pill:hover{border-color:${mixAcc(50,VST)};color:${VTP}}
.btw-web-toggle-pill[data-active="true"]{border-color:${mix('#10b981',65)};background:${mix('#10b981',14)};color:#34d399}
${SEL_PROSE},${SEL_PROSE} *{-webkit-user-select:text!important;user-select:text!important;cursor:text}
.btw-selectable-prose :is(button,[role="button"],img,video,svg,.btw-media-action-btn,.btw-selection-btn),.btw-composer-banner-body :is(button,[role="button"],img,video,svg,.btw-media-action-btn,.btw-selection-btn),.btw-qa-body :is(button,[role="button"],img,video,svg,.btw-media-action-btn,.btw-selection-btn){-webkit-user-select:none!important;user-select:none!important;cursor:pointer}
.btw-selection-toolbar{${DFB};flex-wrap:wrap;gap:6px;margin-bottom:6px;padding:4px 8px;border-radius:8px;border:1px solid ${mixAcc(55,VST)};background:${mixAcc(12,'var(--btw-s0,#0f172a)')};user-select:none!important}
.btw-selection-btn{${DIF};gap:4px;height:22px;padding:0 7px;border-radius:6px;border:1px solid ${mixAcc(45,VST)};background:${mixAcc(16)};color:${VTP};font-size:10px;font-weight:600;cursor:pointer}
.btw-selection-btn:hover{border-color:${VBA};background:${mixAcc(28)}}
@keyframes btw-chat-staged-pulse{0%{box-shadow:0 0 0 0 ${mix('#10b981',55)}}50%{box-shadow:0 0 0 3px ${mix('#10b981',26)}}100%{box-shadow:0 0 0 1.5px ${mixAcc(32)}}}
.btw-ask-box[data-command-staged="true"]{border-color:${mix('#10b981',72,VAC)}!important;animation:btw-chat-staged-pulse 1.1s ${EASE_SPRING} 2}
.btw-command-staged-banner{${DFB};gap:8px;padding:5px 9px;margin-bottom:4px;border-radius:8px;border:1px solid ${mix('#10b981',52,VAC)};background:linear-gradient(90deg,${mix('#10b981',16)},${mixAcc(10)});font-size:10.5px;color:${VTP}}
.btw-media-deck{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px;width:100%}
.btw-media-deck[data-multi="true"]{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.btw-media-card{position:relative;${DFC};border-radius:10px;border:1px solid ${mixStk(75)};background:${mix('var(--btw-s0,#0b0f19)',88)};overflow:hidden}
.btw-media-card:hover{border-color:${mixAcc(58,VST)}}
.btw-media-frame{position:relative;${DIF};justify-content:center;width:100%;min-height:120px;max-height:360px;background:rgba(0,0,0,0.28);overflow:hidden}
.btw-media-frame img{display:block;width:auto;max-width:100%;max-height:340px;object-fit:contain;cursor:zoom-in!important}
.btw-media-frame video{display:block;width:100%;max-height:340px;background:#000}
.btw-media-overlay-bar{position:absolute;top:7px;right:7px;z-index:6;${DIF};gap:4px;padding:3px 5px;border-radius:8px;border:1px solid rgba(255,255,255,0.18);background:rgba(9,13,22,0.85);backdrop-filter:blur(8px)}
.btw-media-action-btn{${DIF};gap:3.5px;height:22px;padding:0 6.5px;border-radius:6px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.09);color:#f8fafc;font-size:10px;font-weight:600;cursor:pointer}
.btw-media-action-btn:hover{border-color:${VBA};background:${mixAcc(28,'rgba(15,23,42,0.9)')};color:#ffffff}
.btw-media-caption{${DFB};gap:6px;padding:5px 9px;border-top:1px solid ${mixStk(45)};font-size:10px;color:${VTS}}
.btw-lightbox-stage{position:relative;${DFC};align-items:center;justify-content:center;width:100%;min-height:55vh;max-height:82vh;overflow:hidden;user-select:none}
.btw-lightbox-toolbar{${DIF};flex-wrap:wrap;justify-content:center;gap:6px;margin-top:10px;padding:5px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.2);background:rgba(9,13,22,0.9)}
.btw-learn-command-deck{${DFC};gap:8px;padding:11px 13px;border-radius:14px;border:1px solid ${mix('var(--btw-deck-accent,var(--ui-accent))',48,VST)};background:radial-gradient(circle at 8% 0%,${mix('var(--btw-deck-accent,var(--ui-accent))',14)},transparent 62%),${mixTxt(2.5)}}
.btw-auto-learn-strip{${DFB};flex-wrap:wrap;gap:8px;padding:7px 10px;border-radius:10px;border:1px solid ${mixStk(65)};background:${mix('var(--btw-s0,#0f172a)',60)}}
.btw-luminous-slider-wrap{${DFC};gap:6px;padding:8px 11px;border-radius:11px;border:1px solid ${mix('var(--slider-color,#38bdf8)',52,VST)};background:linear-gradient(90deg,${mix('var(--slider-color,#38bdf8)',12)},transparent 85%),${mixTxt(2)}}
.btw-luminous-slider{-webkit-appearance:none;appearance:none;width:100%;height:7px;border-radius:999px;background:linear-gradient(90deg,#38bdf8 0%,#10b981 30%,#a855f7 65%,#ec4899 82%,#fde047 100%);outline:none;cursor:pointer}
.btw-luminous-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:var(--slider-color,#38bdf8);border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.5);cursor:grab}
.btw-luminous-slider-ticks{${DFB};gap:2px;padding:0 2px}
.btw-luminous-tick{${DIF};justify-content:center;min-height:24px;min-width:28px;font:600 9.5px/1 ${FONT_MONO};padding:2px 5px;border-radius:5px;border:1px solid transparent;background:transparent;color:var(--btw-text-body,${VTS});cursor:pointer;transition:all 0.14s ease}
.btw-luminous-tick:hover{color:var(--btw-text-strong,${VTP});background:${mixTxt(8)}}
.btw-luminous-tick[data-active="true"]{color:#f8fafc!important;background:${mix('var(--slider-color,var(--btw-accent))',26,'#0f172a')}!important;border-color:var(--slider-color,${VBA})!important;font-weight:700}
${LPT} .btw-luminous-tick[data-active="true"]{color:#0f172a!important;background:${mix(VBA,14,'#ffffff')}!important;border-color:${mix(VBA,85,'#0f172a')}!important}
.btw-memory-sync-card{${DFC};gap:7px;padding:9px 11px;border-radius:11px;border:1px solid ${mix('#a855f7',42,VST)};background:${mixTxt(2)}}
.btw-memory-bar-track{display:flex;width:100%;height:7px;border-radius:999px;background:${mixTxt(9)};overflow:hidden;gap:1px}
.btw-memory-bar-base{height:100%;background:linear-gradient(90deg,#38bdf8,#6366f1)}
.btw-memory-bar-btw{height:100%;background:linear-gradient(90deg,#ec4899,#fde047)}
.btw-rich-playbook-stage{grid-column:1 / -1;width:100%;border-radius:11px;border:1px solid ${mixAcc(45,VST)};background:${mix('var(--btw-s0,#0b0f19)',82)};padding:12px 14px;overflow-y:auto}
.btw-session-mesh-card{${DFC};gap:8px;padding:10px 12px;border-radius:13px;border:1px solid ${mix('var(--mesh-accent,#38bdf8)',50,VST)};background:${mixTxt(2.3)}}
.btw-mesh-row{${DFC};gap:6px;padding:8px 10px;border-radius:10px;border:1px solid ${mixStk(68)};background:${mix('var(--btw-s0,#0f172a)',68)};min-width:0;overflow:hidden}
.btw-mesh-row:hover{border-color:${mixAcc(52,VST)}}
.btw-mesh-row[data-risk="high"]{border-left:2.5px solid #f43f5e}
.btw-mesh-row[data-risk="medium"]{border-left:2.5px solid #f59e0b}
.btw-mesh-row:is([data-risk="low"],[data-risk="workspace"]){border-left:2.5px solid #06b6d4}
.btw-mesh-risk-badge{${DIF};gap:4px;padding:1.5px 6.5px;border-radius:999px;font:700 9px/1.2 ${FONT_MONO};text-transform:uppercase;letter-spacing:0.04em}
.btw-mesh-risk-badge[data-risk="high"]{color:#fda4af;background:rgba(244,63,94,0.2);border:1px solid rgba(244,63,94,0.5)}
.btw-mesh-risk-badge[data-risk="medium"]{color:#fde047;background:rgba(245,158,11,0.18);border:1px solid rgba(245,158,11,0.48)}
.btw-mesh-risk-badge[data-risk="low"]{color:#6ee7b7;background:rgba(16,185,129,0.16);border:1px solid rgba(16,185,129,0.42)}
.btw-mesh-risk-badge[data-risk="workspace"]{color:#7dd3fc;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.42)}
.btw-mesh-topology-stage{position:relative;${DFC};gap:8px;padding:12px 14px;border-radius:14px;border:1px solid ${mix('var(--mesh-accent,#38bdf8)',48,VST)};background:${mix('var(--btw-s0,#0b0f19)',82)};overflow:hidden}
.btw-mesh-topology-stage svg,.btw-mesh-topology-stage svg *{overflow:hidden}
.btw-mesh-file-bento-grid{display:grid;grid-template-columns:1fr;gap:8px;width:100%}
@container btwsurface (min-width:540px){.btw-mesh-file-bento-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.btw-mesh-file-card{${DFC};justify-content:space-between;gap:6px;padding:9px 11px;border-radius:11px;border:1px solid ${mixStk(68)};background:${mix('var(--btw-s0,#0f172a)',68)};min-width:0}
.btw-mesh-file-card:hover{border-color:${mixAcc(55,VST)}}
.btw-mesh-file-card[data-status="collision"]{border-left:3px solid #f43f5e}
.btw-mesh-file-card[data-status="shared_disjoint"]{border-left:3px solid #f59e0b}
.btw-mesh-file-card[data-status="write_read"]{border-left:3px solid #38bdf8}
.btw-mesh-file-card[data-status="exclusive"]{border-left:3px solid #10b981}
.btw-mesh-line-chip{${DIF};gap:3.5px;padding:1.5px 6px;border-radius:6px;font:600 9.5px/1.2 ${FONT_MONO};border:1px solid ${mixStk(70)};background:${mixTxt(4)};color:${VTP};max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.btw-mesh-line-chip[data-focus="true"]{border-color:${mixAcc(65)};background:${mixAcc(16)};color:${VBA}}
.btw-mesh-portal-strip{${DFB};flex-wrap:wrap;gap:8px;padding:7px 11px;border-radius:11px;border:1px solid ${mix('var(--mesh-accent,#38bdf8)',50,VST)};background:${mixTxt(2.2)};cursor:pointer}
@keyframes btw-mesh-flow{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
.btw-mesh-flow-edge{stroke-dasharray:6 6;animation:btw-mesh-flow 1.15s linear infinite}
.btw-dash-tile[data-active-filter="true"]{border-color:${mix('var(--btw-tile-glow,var(--ui-accent))',78)}!important}
.btw-file-linemap-track{position:relative;width:100%;height:8px;border-radius:999px;background:${mixTxt(8)};border:1px solid ${mixStk(55)};overflow:hidden}
.btw-file-linemap-seg{position:absolute;top:0;bottom:0;min-width:6px;border-radius:999px;opacity:0.9}
.btw-mesh-contract-hud{${DFC};gap:8px;padding:9px 12px;border-radius:12px;border:1px solid ${mix('#a855f7',45,VST)};background:${mix('var(--btw-s0,#0f172a)',68)}}
.btw-mesh-sub-nested{${DFC};gap:4px;margin-top:4px;padding:6px 8px;border-radius:8px;border:1px solid ${mix('#a855f7',35,VST)};background:${mix('#a855f7',6)}}
.btw-gamify-deck{${DFC};gap:8px;padding:10px 12px;border-radius:12px;border:1px solid ${mix('#f59e0b',45,VST)};background:${mix('var(--btw-s0,#0f172a)',72)}}
.btw-gamify-xp-bar{width:100%;height:7px;border-radius:999px;overflow:hidden;background:${mixTxt(10)}}
.btw-gamify-xp-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#10b981,#f59e0b)}
.btw-gamify-card{${DFC};gap:3px;padding:7px 9px;border-radius:9px;border:1px solid ${mixStk(72)};background:${mix('var(--btw-s0,#0f172a)',58)}}
.btw-gamify-card[data-unlocked="true"]{border-color:${mix('var(--ach-color,#10b981)',58,VST)}}
.btw-gamify-card[data-unlocked="false"]{opacity:0.65}
${BS} .flex-nowrap{flex-wrap:nowrap}${BS} .my-auto{margin-top:auto;margin-bottom:auto}${BS} .mt-\\[1px\\]{margin-top:1px}${BS} .pb-10{padding-bottom:2.5rem}${BS} .-space-x-2>:not(:first-child){margin-left:-0.5rem}${BS} .tracking-tighter{letter-spacing:-0.04em}${BS} .rounded-\\[7px\\]{border-radius:7px}
${BS} .w-6{width:1.5rem}${BS} .w-68{width:17rem}${BS} .w-\\[66px\\]{width:66px}
${BS} .h-\\[19px\\]{height:19px}${BS} .h-\\[21px\\]{height:21px}${BS} .h-\\[22px\\]{height:22px}${BS} .h-\\[23px\\]{height:23px}${BS} .h-\\[24px\\]{height:24px}${BS} .h-\\[26px\\]{height:26px}${BS} .h-\\[28px\\]{height:28px}${BS} .h-\\[30px\\]{height:30px}${BS} .h-\\[142px\\]{height:142px}${BS} .min-h-\\[46px\\]{min-height:46px}${BS} .min-w-\\[132px\\]{min-width:132px}${BS} .min-w-\\[200px\\]{min-width:200px}
${BS} .max-w-20{max-width:5rem}${BS} .max-w-24{max-width:6rem}${BS} .max-w-28{max-width:7rem}${BS} .max-w-44{max-width:11rem}${BS} .max-w-52{max-width:13rem}${BS} .max-w-\\[110px\\]{max-width:110px}${BS} .max-w-\\[130px\\]{max-width:130px}${BS} .max-w-\\[148px\\]{max-width:148px}${BS} .max-w-\\[160px\\]{max-width:160px}${BS} .max-w-\\[168px\\]{max-width:168px}${BS} .max-w-\\[180px\\]{max-width:180px}${BS} .max-w-\\[200px\\]{max-width:200px}${BS} .max-w-\\[40ch\\]{max-width:40ch}${BS} .max-w-\\[50ch\\]{max-width:50ch}${BS} .max-w-\\[52ch\\]{max-width:52ch}${BS} .max-w-\\[54ch\\]{max-width:54ch}${BS} .max-w-\\[88vw\\]{max-width:88vw}
${BS} .max-h-\\[120px\\]{max-height:120px}${BS} .max-h-\\[200px\\]{max-height:200px}${BS} .max-h-\\[260px\\]{max-height:260px}${BS} .max-h-\\[268px\\]{max-height:268px}${BS} .max-h-\\[280px\\]{max-height:280px}${BS} .max-h-\\[340px\\]{max-height:340px}${BS} .max-h-\\[380px\\]{max-height:380px}${BS} .max-h-\\[420px\\]{max-height:420px}${BS} .max-h-\\[72vh\\]{max-height:72vh}${BS} .max-h-\\[76vh\\]{max-height:76vh}${BS} .max-h-\\[92vh\\]{max-height:92vh}
${BS} .opacity-12{opacity:0.12}${BS} .opacity-25{opacity:0.25}${BS} .opacity-75{opacity:0.75}${BS} .opacity-85{opacity:0.85}
${BS} .bg-\\[\\#050b16\\]\\/90{background:rgba(5,11,22,0.9)}${BS} .bg-\\[\\#10b981\\]{background:#10b981}${BS} .bg-\\[\\#10b981\\]\\/18{background:rgba(16,185,129,0.18)}${BS} .bg-\\[\\#10b981\\]\\/20{background:rgba(16,185,129,0.2)}${BS} .bg-emerald-500\\/18{background:rgba(16,185,129,0.18)}${BS} .bg-emerald-500\\/20{background:rgba(16,185,129,0.2)}${BS} .bg-purple-400{background:#c084fc}${BS} .bg-purple-500\\/10{background:rgba(168,85,247,0.1)}${BS} .bg-slate-400{background:#94a3b8}
${BS} .border-\\[\\#00e5ff\\]\\/55{border-color:rgba(0,229,255,0.55)}${BS} .border-\\[\\#10b981\\]\\/20{border-color:rgba(16,185,129,0.2)}${BS} .border-\\[\\#10b981\\]\\/40{border-color:rgba(16,185,129,0.4)}${BS} .border-amber-400\\/45{border-color:rgba(251,191,36,0.45)}${BS} .border-amber-400\\/50{border-color:rgba(251,191,36,0.5)}${BS} .border-emerald-400\\/50{border-color:rgba(52,211,153,0.5)}${BS} .border-emerald-500\\/35{border-color:rgba(16,185,129,0.35)}${BS} .border-emerald-500\\/40{border-color:rgba(16,185,129,0.4)}${BS} .border-emerald-500\\/55{border-color:rgba(16,185,129,0.55)}${BS} .border-purple-500\\/35{border-color:rgba(168,85,247,0.35)}${BS} .border-purple-500\\/45{border-color:rgba(168,85,247,0.45)}${BS} .border-rose-400\\/50{border-color:rgba(251,113,133,0.5)}${BS} .border-rose-500\\/45{border-color:rgba(244,63,94,0.45)}${BS} .border-sky-500\\/35{border-color:rgba(14,165,233,0.35)}${BS} .ring-\\(--ui-bg-elevated\\){--tw-ring-color:var(--btw-s0,${VBG})}${BS} .btw-brand-icon,.btw-mascot-pat-btn{--btw-el:1}
${BS} .btw-sz-36{width:36px;height:36px}${BS} .btw-sz-42{width:42px;height:42px}${BS} .btw-tx-85{font-size:8.5px}${BS} .btw-tx-9{font-size:9px}${BS} .btw-tx-95{font-size:9.5px}${BS} .btw-tx-10{font-size:10px}${BS} .btw-tx-105{font-size:10.5px}${BS} .btw-tx-11{font-size:11px}${BS} .btw-tx-115{font-size:11.5px}${BS} .btw-tx-12{font-size:12px}${BS} .btw-tx-125{font-size:12.5px}${BS} .btw-tx-13{font-size:13px}${BS} .btw-tp{color:${VTP}}${BS} .btw-ts{color:${VTS}}${BS} .btw-tt{color:${VTT}}${BS} .btw-tq{color:var(--btw-text-muted,${VTT})}${BS} .btw-ac{color:${VAC}}${BS} .btw-red{color:var(--btw-danger,#f43f5e)}${BS} .btw-str{color:var(--btw-text-strong,${VTP})}${BS} .btw-bdy{color:var(--btw-text-body,${VTS})}${BS} .btw-mut{color:var(--btw-text-muted,${VTT})}${BS} .btw-bac{color:${VBA}}${BS} .btw-ok{color:var(--btw-ok,#10b981)}${BS} .btw-hypo{color:var(--btw-hypo,#38bdf8)}${BS} .btw-em{color:#10b981}${BS} .btw-wht{color:#f8fafc}${BS} .btw-bg-seg{background:var(--btw-seg-bg)}${BS} .btw-bg-ba18{background:${mix(VBA,18)}}${BS} .btw-bg-ok10{background:${mix('var(--btw-ok)',10)}}${BS} .btw-bg-wn10{background:${mix('var(--btw-warn)',10)}}${BS} .btw-bg-ac{background:${VAC}}${BS} .btw-bg-ac6{background:${mixAcc(6)}}${BS} .btw-bg-ac8{background:${mixAcc(8)}}${BS} .btw-bg-ac10{background:${mixAcc(10)}}${BS} .btw-bg-ac12{background:${mixAcc(12)}}${BS} .btw-bg-ac14{background:${mixAcc(14)}}${BS} .btw-bg-ac15{background:${mixAcc(15)}}${BS} .btw-bg-ac16{background:${mixAcc(16)}}${BS} .btw-bg-ac18{background:${mixAcc(18)}}${BS} .btw-bg-ac20{background:${mixAcc(20)}}${BS} .btw-bg-ac22{background:${mixAcc(22)}}${BS} .btw-bg-b70{background:${mix('var(--btw-s0,#0b101d)',70)}}${BS} .btw-bg-rd10{background:${mix('var(--btw-danger)',10)}}${BS} .btw-bg-rd20{background:${mix('var(--btw-danger)',20)}}${BS} .btw-bg-tq{background:${mixTxt(28)}}${BS} .btw-bg-tp4{background:${mixTxt(4)}}${BS} .btw-bg-tp8{background:${mixTxt(8)}}${BS} .btw-bg-tp10{background:${mixTxt(10)}}${BS} .btw-bg-tp15m{background:${mixTxt(1.5)}}${BS} .btw-bg-tp18m{background:${mixTxt(1.8)}}${BS} .btw-bg-tp2{background:${mixTxt(2)}}${BS} .btw-bg-tp25m{background:${mixTxt(2.5)}}${BS} .btw-bg-tp3{background:${mixTxt(3)}}${BS} .btw-bg-tp4m{background:${mixTxt(4)}}${BS} .btw-bg-tp5{background:${mixTxt(5)}}${BS} .btw-bd-seg{border-color:var(--btw-seg-border)}${BS} .btw-bd-seg50{border-color:${mix('var(--btw-seg-border)',50)}}${BS} .btw-bd-ok45{border-color:${mix('var(--btw-ok)',45)}}${BS} .btw-bd-wn45{border-color:${mix('var(--btw-warn)',45)}}${BS} .btw-bd-ba55{border-color:${mix(VBA,55)}}${BS} .btw-bd-ac35{border-color:${mixAcc(35)}}${BS} .btw-bd-ac40{border-color:${mixAcc(40)}}${BS} .btw-bd-ac45{border-color:${mixAcc(45)}}${BS} .btw-bd-ac50{border-color:${mixAcc(50)}}${BS} .btw-bd-ac60{border-color:${mixAcc(60)}}${BS} .btw-bd-rd40{border-color:${mix('var(--btw-danger)',40)}}${BS} .btw-bd{border-color:${VST}}${BS} .btw-bd-st40{border-color:${mixStk(40)}}${BS} .btw-bd-st45{border-color:${mixStk(45)}}${BS} .btw-bd-st50{border-color:${mixStk(50)}}${BS} .btw-bd-st55{border-color:${mixStk(55)}}${BS} .btw-bd-st60{border-color:${mixStk(60)}}${BS} .btw-bd-st70{border-color:${mixStk(70)}}${BS} .btw-bd-st80{border-color:${mixStk(80)}}${BS} .btw-fc-ac:focus{border-color:${VAC}}${BS} .btw-hv-ch:hover{background:var(--chrome-action-hover,${mixTxt(7)})}${BS} .btw-hv-ac12:hover{background:${mixAcc(12)}}${BS} .btw-hv-ac22:hover{background:${mixAcc(22)}}${BS} .btw-hv-tp6:hover{background:${mixTxt(6)}}${BS} .btw-hv-bdac:hover{border-color:${VAC}}${BS} .btw-hv-bdst:hover{border-color:${VST}}${BS} .btw-hv-ac:hover{color:${VAC}}${BS} .btw-hv-tp:hover{color:${VTP}}
${BS} .btw-hv-amb:hover{color:var(--btw-warn-ink,#fbbf24)}
@media (prefers-reduced-motion:reduce){.btw-alert-strip,.btw-studio-dialog,.btw-mascot-body-group,.btw-mascot-gyro-ring-b,.btw-mascot-eyes-blink,.btw-mascot-heart-beat,.btw-mascot-radar-cone,.btw-mascot-sonar-ring,.btw-mascot-compress-ring,.btw-mascot-visor-scanline,.btw-laser-beam-packets,.btw-laser-impact-ring,.btw-mascot-sweat-drop,.btw-mascot-stage[data-emotion="struggle"] .btw-mascot-body-group,.btw-aerial-companion[data-emotion="struggle"] .btw-aerial-orb-wrap,.btw-flight-ring .btw-ring-fill,.btw-flight,.btw-token-chip,.btw-card-minichat,.btw-stagger-item,.btw-waiting-stage,.btw-waiting-ring-outer,.btw-waiting-ring-inner,.btw-waiting-radar-sweep,.btw-velocity-orbit-ring,.btw-bot-avatar-ring,.btw-mesh-flow-edge,.btw-specialist-scan-bar::after,.btw-flight[data-steering="true"] .btw-flight-ring::after{transition:none!important;animation:none!important}}
`
function isVisibleElement(el){if(!el||!el.isConnected)return false
const rect=el.getBoundingClientRect()
if(rect.width<=0||rect.height<=0)return false
const style=window.getComputedStyle(el)
return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>0}
let _prefsDebounceTimer=null
function savePrefs(overrides = {}) {
 if(_prefsDebounceTimer){cancelTimer(_prefsDebounceTimer);_prefsDebounceTimer=null}
 if(!_storage)return
 try{
 _storage.set(PREFS_KEY,{
 interceptSlashBtw:$interceptSlashBtw.get(),askMode:$askMode.get(),langPref:$langPref.get(),
 theme:$theme.get(),accent:$accent.get(),density:$density.get(),zoom:$zoom.get(),pinned:$pinned.get(),
 popoverWide:$popoverWide.get(),maxDeepOverviewReports:$maxDeepOverviewReports.get(),loaderCurveIdx:$loaderCurveIdx.get(),
 mascotNarrate:$mascotNarrate.get(),personality:$personality.get(),customPersona:$customPersona.get(),synthMode:$synthMode.get(),
 recapMode:$recapMode.get(),petTtl:$petTtl.get(),stockSafePet:$stockSafePet.get(),petBubbleMode:$petBubbleMode.get(),
 settingsMode:$settingsMode.get(),spatialMode:$spatialMode.get(),showComposerBanner:$showComposerBanner.get(),
 showStatusbarChip:$showStatusbarChip.get(),alerts:$alerts.get(),present:$present.get(),hudOpen:$hudOpen.get(),
 exportFolder:$exportFolder.get(),customPresets:$customPresets.get(),deletedPresetIds:$deletedPresetIds.get(),
 autoRecommendSnippets:$autoRecommendSnippets.get(),bannerThemeMode:$bannerThemeMode.get(),bannerSizeMode:$bannerSizeMode.get(),
 personaWeights:$personaWeights.get(),steeredByCardId:$steeredByCardId.get(),favoriteModels:$favoriteModelsList.get(),
 growthMode:$growthMode.get(),playbookCharBudget:$playbookCharBudget.get(),autoLearnMode:$autoLearnMode.get(),
 autoLearnHook:$autoLearnHook.get(),autoLearnCronMins:$autoLearnCronMins.get(),memorySyncMode:$memorySyncMode.get(),
 allowWebSearch:$allowWebSearch.get(),allowMediaTools:$allowMediaTools.get(),gamifyEnabled:$gamifyEnabled.get(),dictationLang:$dictationLang.get(),
 wakeWordEnabled:$wakeWordEnabled.get(),wakePhrase:$wakePhrase.get(),wakeTargetMode:$wakeTargetMode.get(),liveVoiceEnabled:$liveVoiceEnabled.get(),
 ttsAutoSpeak:$ttsAutoSpeak.get(),ttsVoice:$ttsVoice.get(),ttsModel:$ttsModel.get(),pinnedTools:$pinnedBtwTools.get(),
 personaAxes:$personaAxes.get(),personaGeometry:$personaGeometry.get(),petAffection:$petAffection.get(),
 petAerialFlight:$petAerialFlight.get(),nativePetActive:$nativePetActive.get(),...overrides
})
}catch{}
}
function savePrefsDebounced(delayMs=220){
 if(_prefsDebounceTimer)cancelTimer(_prefsDebounceTimer)
 _prefsDebounceTimer=scheduleTimer(()=>{_prefsDebounceTimer=null;savePrefs()},delayMs)
}
function flushPendingPrefs(){
 if(_prefsDebounceTimer){cancelTimer(_prefsDebounceTimer);_prefsDebounceTimer=null;savePrefs()}
}
function setPref(store,value,key){store.set(value);savePrefs({[key]:value})}
function setPrefDebounced(store,value){store.set(value);savePrefsDebounced(220)}
function updatePetAffection(patch){$petAffection.set({...$petAffection.get(),...patch});savePrefsDebounced(220)}
let _settingsSyncTimer=null
function syncBackendSettings(partial){
const next={...($backendSettings.get()||{}),...partial}
$backendSettings.set(next)
if(!_rest)return
if(_settingsSyncTimer)cancelTimer(_settingsSyncTimer)
_settingsSyncTimer=scheduleTimer(()=>{_settingsSyncTimer=null
const latest=$backendSettings.get()||{}
void _rest('/settings',{method:'POST',body:latest,timeoutMs:8000
}).catch(()=>undefined)
},300)}
function useThemeProps(extraStyle=null){
const theme=useValue($theme)
const accent=useValue($accent)
const density=useValue($density)
const zoom=useValue($zoom)
const present=useValue($present)
const axes=useValue($personaAxes)
const weights=useValue($personaWeights)
const z=ZOOM_STEPS[zoom]||1
const liveLensColor=mixTernaryColor(weights,axes)
const style={'--btw-zoom':String(present?Math.max(z,1.22):z),'--btw-mascot-live-aura':liveLensColor}
if(accent)style['--btw-accent-override']=accent
return{'data-btw-present':present?'true':'false','data-btw-theme':THEMES.includes(theme)?theme:'host',
'data-btw-density':density==='compact'?'compact':'comfortable',style:extraStyle?{...style,...extraStyle}:style}}
function dismissGuards(triggerRef){
const isOwnSurface=target=>Boolean(target&&typeof target.closest==='function'&&(target.closest('.btw-trigger-pill')||
target.closest('[data-btw-hud]')||(triggerRef?.current&&triggerRef.current.contains(target))))
return{onFocusOutside:e=>{if($pinned.get())e.preventDefault()},onEscapeKeyDown:e=>{if($activeMediaLightbox.get()){e.preventDefault()
$activeMediaLightbox.set(null)
return}
if($composerStagedNotice.get()){$composerStagedNotice.set(null)}
if($dictationStatus.get()!=='idle'){e.preventDefault()
stopBtwDictation(true)
return}
if($specialistOpen.get()){e.preventDefault()
$specialistOpen.set(false)
return}
if($playbookPreviewOpen.get()){e.preventDefault()
$playbookPreviewOpen.set(false)
return}
if($howItWorksOpen.get()){e.preventDefault()
$howItWorksOpen.set(false)
return}
if($importDrawerOpen.get()){e.preventDefault()
$importDrawerOpen.set(false)
return}
if($sessionMeshOpen.get()){e.preventDefault()
$sessionMeshOpen.set(false)
return}
if($activeCardMiniChatId.get()){e.preventDefault()
$activeCardMiniChatId.set('')
return}
if($presetEditorDraft.get()){e.preventDefault()
$presetEditorDraft.set(null)
return}
if($subagentLauncherOpen.get()){e.preventDefault()
$subagentLauncherOpen.set(false)
$selectedSubagentId.set('')
return}
if($selectedSubagentId.get()){e.preventDefault()
$selectedSubagentId.set('')
return}
if($addLessonOpen.get()){e.preventDefault()
$addLessonOpen.set(false)
return}
if($inlineMascotDrawerOpen.get()){e.preventDefault()
$inlineMascotDrawerOpen.set(false)
return}
if($inlineSettingsOpen.get()){e.preventDefault()
$inlineSettingsOpen.set(false)
return}
const attCard=($btwAttachments.get()||[]).find(a=>a&&a.kind==='btw_card')
if(attCard){e.preventDefault()
removeBtwAttachment(attCard.id)
$followUpParent.set(null)
$composerActionMode.set('ask_btw')}},onPointerDownOutside:e=>{if($pinned.get()||isOwnSurface(e?.target))e.preventDefault()},
onInteractOutside:e=>{if(e?.type==='focusin'||e?.detail?.originalEvent?.type==='focusin'){e.preventDefault()
return}
if($pinned.get()||isOwnSurface(e?.target))e.preventDefault()}}}
function focusIntoSurface(e){e.preventDefault()
const root=e.currentTarget
scheduleTimer(()=>{root?.focus?.({preventScroll:true})
},30)}
const PRESET_ICONS=['checklist','watch','pulse','warning','dashboard','files','zap','bug','terminal','beaker','git-commit','shield',
'rocket','search','book','flame','lightbulb','comment-discussion','hubot','compass']
function sanitizeCustomPreset(raw){if(!raw||typeof raw!=='object')return null
const label=String(raw.label||'').trim().slice(0,48)
const prompt=String(raw.prompt||'').trim().slice(0,1200)
if(!label||!prompt)return null
const slug=label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,24)||'item'
const id=String(raw.id|| `custom_${slug}_${prompt.length}`).trim()
const icon=PRESET_ICONS.includes(raw.icon)?raw.icon:'zap'
const desc=String(raw.desc||prompt.slice(0,90)).trim().slice(0,140)
return{id,icon,label,desc,prompt,custom:true}}
const $activePresets=computed([$lang,$customPresets,$deletedPresetIds],(lang,customList,deletedIds)=>{
const strings=I18N[lang]||I18N.en
const deletedSet=new Set(Array.isArray(deletedIds)?deletedIds:[])
const defaults=(strings.presets||[]).filter(p=>!deletedSet.has(p.id)).map(p=>({...p,custom:false}))
const customs=(Array.isArray(customList)?customList:[]).map(sanitizeCustomPreset).filter(Boolean)
return[...defaults,...customs]})
function syncPresetsToBackend(){if(!_rest)return
void _rest('/presets/sync',{method:'POST',body:{custom_presets:$customPresets.get()||[],
deleted_preset_ids:$deletedPresetIds.get()||[]},timeoutMs:8000
}).catch(()=>undefined)}
function suggestPresetLabel(question){
const clean=String(question||'')
.replace(/^\/btw\s+/i,'')
.replace(/[`*_#?![\]()]+/g,' ')
.replace(/\s+/g,' ')
.trim()
if(!clean)return ''
const words=clean.split(' ').slice(0,4).join(' ')
const clipped=words.length>26? `${words.slice(0,25).trim()}…` :words
return clipped.charAt(0).toUpperCase()+ clipped.slice(1)}
function openPresetCreatorFromQuestion(questionText,surface='ask'){
const q=String(questionText||'').trim()
if(surface==='ask')$activeTab.set('ask')
$presetEditorDraft.set({id:'',icon:'zap',label:suggestPresetLabel(q),desc:'',prompt:q,replaceBuiltinId:'',surface})
haptic?.('tap')}
function openPresetEditorForItem(preset,surface='ask'){if(!preset)return
$presetEditorDraft.set({id:preset.custom?preset.id:'',icon:PRESET_ICONS.includes(preset.icon)?preset.icon:'zap',
label:String(preset.label||''),desc:String(preset.desc||''),prompt:String(preset.prompt||''),
replaceBuiltinId:preset.custom?'':String(preset.id||''),surface})
haptic?.('tap')}
function deletePresetById(presetId,labelForToast=''){
const id=String(presetId||'').trim()
if(!id)return
const customList=$customPresets.get()||[]
if(customList.some(p=>p.id===id)){
const nextCustom=customList.filter(p=>p.id!==id)
$customPresets.set(nextCustom)
savePrefs({customPresets:nextCustom})
}else{
const prevDeleted=$deletedPresetIds.get()||[]
if(!prevDeleted.includes(id)){
const nextDeleted=[...prevDeleted,id]
$deletedPresetIds.set(nextDeleted)
savePrefs({deletedPresetIds:nextDeleted})}}
const draft=$presetEditorDraft.get()
if(draft&&(draft.id===id||draft.replaceBuiltinId===id)){$presetEditorDraft.set(null)}
syncPresetsToBackend()
haptic?.('tap')
if(labelForToast){host.notify?.({kind:'info',message:t().presetDeletedNotify(labelForToast)})}}
function addOrUpdateCustomPreset({id='',label,prompt,desc='',icon='zap',replaceBuiltinId=''}){
const cleanLabel=String(label||'').trim().slice(0,48)
const cleanPrompt=String(prompt||'').trim().slice(0,1200)
if(!cleanLabel||!cleanPrompt)return null
const cleanIcon=PRESET_ICONS.includes(icon)?icon:'zap'
const cleanDesc=String(desc||cleanPrompt.slice(0,90)).trim().slice(0,140)
const list=[...($customPresets.get()||[])]
let saved=null
if(id){
const idx=list.findIndex(p=>p.id===id)
if(idx>=0){saved={...list[idx],label:cleanLabel,prompt:cleanPrompt,desc:cleanDesc,icon:cleanIcon,custom:true}
list[idx]=saved}}
if(!saved){saved={id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,icon:cleanIcon,
label:cleanLabel,desc:cleanDesc,prompt:cleanPrompt,custom:true}
list.push(saved)}
const capped=list.slice(-24)
$customPresets.set(capped)
const hideBuiltin=String(replaceBuiltinId||'').trim()
let nextDeleted=$deletedPresetIds.get()||[]
if(hideBuiltin&&!nextDeleted.includes(hideBuiltin)){nextDeleted=[...nextDeleted,hideBuiltin]
$deletedPresetIds.set(nextDeleted)}
savePrefs({customPresets:capped,deletedPresetIds:nextDeleted})
syncPresetsToBackend()
haptic?.('success')
host.notify?.({kind:'info',message:t().presetSavedNotify(saved.label)})
return saved}
function moveCustomPreset(presetId,delta){
const list=[...($customPresets.get()||[])]
const idx=list.findIndex(p=>p.id===presetId)
const targetIdx=idx + delta
if(idx<0||targetIdx<0||targetIdx>=list.length)return
const[item]=list.splice(idx,1)
list.splice(targetIdx,0,item)
$customPresets.set(list)
savePrefs({customPresets:list})
syncPresetsToBackend()
haptic?.('tap')}
function restoreDefaultPresets(){$deletedPresetIds.set([])
savePrefs({deletedPresetIds:[]})
syncPresetsToBackend()
haptic?.('success')
host.notify?.({kind:'info',message:t().presetRestoredNotify})}
let _petLines={}
function petVisible(){try{
return Boolean(_pet?.visible?.get?.())
}catch{
return false}}
function petSay(id,text,tone='info',ttlMs=6000,extra={}){if(!$mascotNarrate.get())return
const stockSafe=Boolean($stockSafePet.get())
let line=String(text||'')
.split('\n')
.map(l=>l.replace(/[ \t]+/g,' ').trim())
.filter(Boolean)
.slice(0,stockSafe?2:6)
.join(stockSafe?' · ':'\n')
.trim()
if(!line)return
const fullBubbleLine=line.slice(0,180)
if(stockSafe&&line.length>114){
const window=line.slice(0,114).trim()
const lastSep=Math.max(window.lastIndexOf('. '),window.lastIndexOf('! '),window.lastIndexOf(' · '))
const lastSpace=window.lastIndexOf(' ')
line=lastSep>=64?window.slice(0,lastSep +(window[lastSep]===' '?0:1)).trim():lastSpace>=72
? `${window.slice(0,lastSpace).replace(/(?<![,;:\-·])[,;:\-·]+$/,'').trim()}…` : `${window.slice(0,113).trim()}…`}
if(extra.steer){
$alertSteer.set({id,text:line.replace(/\n+/g,' · '),tone,steer:extra.steer,kind:extra.kind||'',at:Date.now()})}
const ttlPref=Number($petTtl.get())
const ttl=extra.sticky||ttlPref===0?30000:Math.max(ttlMs,ttlPref * 1000,String(id).startsWith('comp-radar-')?5800:0)
if($petAerialFlight.get()){$aerialBubble.set({id,text:fullBubbleLine,tone,ts:Date.now()})
if(_aerialBubbleTimer)cancelTimer(_aerialBubbleTimer)
_aerialBubbleTimer=scheduleTimer(()=>{_aerialBubbleTimer=null
if($aerialBubble.get()?.id===id)$aerialBubble.set(null)
},Math.min(18000,Math.max(3500,ttl)))}
if(!petVisible())return
const sdkTone=tone==='error'||tone==='wait'?tone:'info'
try{_petLines[id]?.()
_petLines[id]=_pet.say(line.slice(0,stockSafe?114:440),{id: `btw-${id}`,tone:sdkTone,ttlMs:Math.min(30000,Math.max(1000,ttl))})
}catch{}}
function petClear(id){try{_petLines[id]?.()
delete _petLines[id]
_pet?.clear?.(`btw-${id}`)
}catch{}}
function personaPayload(){
const cur=$personality.get()
const norm=PERSONAS.includes(cur)?cur:LEGACY_PERSONA_ALIASES[cur]||'balanced'
return{personality:norm,custom:norm==='custom'?$customPersona.get():'',
lang:$lang.get(),stock_safe:Boolean($stockSafePet.get())}}
const $petBubblesBySession=atom({})
function addPetBubble(sessionIdentifier,bubble){
const key=canonicalSessionKey(sessionIdentifier)
if(!key||!bubble)return null
const currentMap=$petBubblesBySession.get()||{}
const currentList=currentMap[key]||[]
const entry={id:bubble.id|| `pb-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
timestamp:bubble.timestamp||Date.now(),type:bubble.type||'telemetry',
title:bubble.title||'',summary:String(bubble.summary||'').trim(),ai_inferred:Boolean(bubble.ai_inferred),
personality:bubble.personality||$personality.get(),tone:bubble.tone||'info',
metrics:bubble.metrics||null,steer:bubble.steer||'',tool:bubble.tool||'',raw:bubble.raw||'',
details:bubble.details||null}
if(!entry.summary)return null
const nextList=[entry,...currentList.filter(b=>b.id!==entry.id)].slice(0,40)
$petBubblesBySession.set({...currentMap,[key]:nextList})
return entry}
let _telemetrySeq=0
async function speakTelemetry(sessionId,eventType='auto',details={}){if(!$mascotNarrate.get()||!sessionId)return null
const mySeq=++_telemetrySeq
const key=canonicalSessionKey(sessionId)
const bMode=$petBubbleMode.get()||'ai_summary'
const isErr=eventType==='error_loop'||eventType==='alert'
const tone=isErr?'error':(eventType==='active'?'wait':'info')
const bubbleId= `pb-tel-${eventType}-${Date.now().toString(36)}`
const pulse=$livePulseBySession.get()?.[key]||{}
const activeTool=details.tool||pulse.active_tool||''
const turnTools=Number(details.turn_tools??pulse.turn_tools??0)
const turnErrors=Number(details.turn_errors??pulse.turn_errors??0)
const consec=Number(details.consecutive_errors??pulse.consecutive_errors??0)
const pt=$lang.get()==='pt'
const instantRaw=isErr
?(pt? `ALERTA: ${consec||2} erros seguidos${activeTool? ` em ${activeTool}` :''}` : `ALERT: ${consec||2} consecutive errors${activeTool? ` on ${activeTool}` :''}`)
:activeTool
?(pt? `Agente rodando: tool=${activeTool} · ${pl(turnTools,'tool')} no turno` : `Agent active: tool=${activeTool} · ${pl(turnTools,'tool')} this turn`)
:(pt? `Telemetria ativa · ${pl(turnTools,'tool')} (${pl(turnErrors,'erro')})` : `Telemetry active · ${pl(turnTools,'tool')} (${pl(turnErrors,'error')})`)
const instantLine=decorateClientPersona(instantRaw)
if(instantLine){petSay(`tel-${eventType}`,instantLine,tone,12000)
addPetBubble(key,{id:bubbleId,type:isErr?'alert':'telemetry',
title:isErr?(t().petLoopAlertTitle?t().petLoopAlertTitle(consec||2):'Loop Alert'):(t().petTelemetryTitle||'Agent Telemetry'),
summary:instantLine,ai_inferred:false,personality:$personality.get(),tone,
metrics:{turn_tools:turnTools,turn_errors:turnErrors,consecutive_errors:consec,active_tool:activeTool},tool:activeTool,
steer:isErr?t().steerLoopStreak:''})}
if(!_rest)return{ok:true,summary:instantLine,engine:'deterministic'}
let enrichedRes=null
try{
const fastRes=await _rest('/telemetry/summary',{method:'POST',body:{session_id:sessionId,event_type:eventType,details,
bubble_mode:bMode,use_llm:false,...personaPayload()},timeoutMs:6000})
if(fastRes?.ok&&fastRes.summary&&mySeq===_telemetrySeq){enrichedRes=fastRes
const suggestedSteer=fastRes.suggested_steer||(isErr?t().steerLoopStreak:'')
petSay(`tel-${eventType}`,fastRes.summary,tone,12000,{steer:suggestedSteer})
addPetBubble(key,{id:bubbleId,type:isErr?'alert':'telemetry',
title:isErr?(t().petLoopAlertTitle?t().petLoopAlertTitle(consec||2):'Loop Alert'):(t().petTelemetryTitle||'Agent Telemetry'),
summary:fastRes.summary,ai_inferred:false,personality:fastRes.personality||$personality.get(),tone,metrics:fastRes.metrics,
tool:details.tool||fastRes.metrics?.active_tool||activeTool,steer:suggestedSteer})}
}catch{}
return enrichedRes||{ok:true,summary:instantLine,engine:'deterministic'}}
async function speakSynth(answer,entryId='',sessionKey='',question=''){if(!$mascotNarrate.get())return
const fallback=tldr(answer)||t().petDone
const bubbleId=entryId? `pb-btw-${entryId}` : `pb-btw-${Date.now().toString(36)}`
petSay('done',fallback,'info',14000)
if(sessionKey){addPetBubble(sessionKey,{id:bubbleId,type:'btw',title:question? `/btw · ${question}` :t().petDone,
summary:fallback,ai_inferred:false,personality:personaPayload().personality,tone:'good',
steer:answer? `[BTW insight on "${question||''}"]: ${answer.slice(0,500)}` :'',raw:answer})}
const useLlm=$synthMode.get()==='llm'
if(_rest&&useLlm){try{
const res=await _rest('/synth',{method:'POST',
body:{text:String(answer||'').slice(0,6000),max_lines:4,use_llm:true,...personaPayload()},timeoutMs:12000})
if(res?.ok&&res.summary){petSay('done',res.summary,'info',14000)
if(sessionKey){addPetBubble(sessionKey,{id:bubbleId,type:'btw',title:question? `/btw · ${question}` :t().petDone,
summary:res.summary,ai_inferred:res.engine==='llm',personality:personaPayload().personality,tone:'good',
steer:answer? `[BTW insight on "${question||''}"]: ${answer.slice(0,500)}` :'',raw:answer})}}
}catch{}}}
let _lastRecapAt=0
async function speakRecap(sessionId){
const mode=$recapMode.get()
if(mode==='off'||!_rest||!sessionId||!$mascotNarrate.get())return
if(Date.now()- _lastRecapAt<8000||$pendingBySession.get()[canonicalSessionKey(sessionId)])return
_lastRecapAt=Date.now()
const bubbleId= `pb-recap-${Date.now().toString(36)}`
try{
const fastRes=await _rest('/recap',{method:'POST',body:{session_id:sessionId,use_llm:false,...personaPayload()},
timeoutMs:6000})
if(fastRes?.ok&&fastRes.summary){petSay('recap',fastRes.summary,'info',12000)
addPetBubble(sessionId,{id:bubbleId,type:'recap',title:t().petRecapTitle||'Turn Recap',summary:fastRes.summary,
ai_inferred:false,personality:personaPayload().personality,tone:'info',metrics:fastRes.metrics||null,facts:fastRes.facts||''
})}
if(mode==='llm'){
const llmRes=await _rest('/recap',{method:'POST',body:{session_id:sessionId,use_llm:true,...personaPayload()},
timeoutMs:12000})
if(llmRes?.ok&&llmRes.summary){petSay('recap',llmRes.summary,'info',12000)
addPetBubble(sessionId,{id:bubbleId,type:'recap',title:t().petRecapTitle||'Turn Recap',summary:llmRes.summary,
ai_inferred:true,personality:personaPayload().personality,tone:'info',metrics:llmRes.metrics||null,facts:llmRes.facts||''})}}
}catch{}}
const _alertedBySession={}
async function checkBudgetAlerts(sessionId){
const a=$alerts.get()
if(!_rest||!sessionId)return
try{
const snap=await _rest(`/snapshot?session_id=${encodeURIComponent(sessionId)}`,{timeoutMs:8000})
if(!snap?.found)return
const key=canonicalSessionKey(sessionId)
const seen=(_alertedBySession[key]=_alertedBySession[key]||{})
const compactedNow=Number(snap.context_window?.messages_compacted??Math.max(0,Number(snap.counts?.messages_total||0)- Number(snap.counts?.messages_active||0)))
if(seen.compactedCount===undefined){seen.compactedCount=compactedNow
}else if(compactedNow>seen.compactedCount){seen.compactedCount=compactedNow
void triggerCompressionRadarTour({storedId:sessionId,runtimeId:sessionId,key},snap)}
const occNow=Number(snap.context_window?.occupancy_pct||0)
if(occNow>=75&&!seen.occ75){seen.occ75=true
void triggerCompressionRadarTour({storedId:sessionId,runtimeId:sessionId,key},snap)}
const cost=Number(snap.tokens?.cost_usd||0)
const inK=Number(snap.tokens?.input||0)/ 1000
if(a.costUsd>0&&cost>=a.costUsd&&!seen.cost){seen.cost=true
petSay('alert-cost',t().alertCost(a.costUsd),'error',15000,{sticky:true})
}else if(a.tokensK>0&&inK>=a.tokensK&&!seen.tokens){seen.tokens=true
petSay('alert-tokens',t().alertTokens(a.tokensK),'wait',15000,{sticky:true,steer:t().steerContextLimit})}
}catch{}}
async function exportCardsMarkdown(scope,entries){
const strings=t()
const files=_ctx?.files
if(!files)return
let folder=$exportFolder.get()
if(!folder?.id){
const res=await files.requestFolder()
if(!res?.ok||!res.folder)return
folder={id:res.folder.id,name:res.folder.name}
setPref($exportFolder,folder,'exportFolder')}
const sid=scope.storedId||scope.runtimeId||'session'
const safeSid=String(sid).replace(/[^a-zA-Z0-9_-]/g,'_').slice(-12)||'session'
const stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')
const name= `btw-${safeSid}-${stamp}.md`
const body=[`---`,`source: btw-studio`,`session: ${sid}`,`profile: ${scope.profile}`,`exported: ${new Date().toISOString()}`,
`tags: [hermes, btw]`,`---`,'',`# BTW Studio — ${sid}`,'',...[...entries]
.sort((x,y)=>(x.created_at||0)-(y.created_at||0))
.flatMap(e=>[`## ${e.pinned?'📌 ':''}${e.question}`,'',e.answer,''])
].join('\n')
const out=await files.writeText(folder.id,name,body)
if(out?.ok){haptic?.('success')
host.notify?.({kind:'info',message:strings.exportDone(name,folder.name)})
}else{setPref($exportFolder,null,'exportFolder')
host.notify?.({kind:'error',message:out?.message||'Export failed'})}}
function decorateClientPersona(text){
const core=String(text||'').trim()
if(!core)return ''
const pt=$lang.get()==='pt'
const cur=$personality.get()
const p=PERSONAS.includes(cur)?cur:LEGACY_PERSONA_ALIASES[cur]||'neurodivergent'
if($stockSafePet.get()){
const flat=core.split(/\r?\n+/).map(x=>x.trim()).filter(Boolean).join(' · ').replace(/\s+/g,' ').trim()
const fit=(s,cap)=>{if(s.length<=cap)return s
const w=s.slice(0,cap-1).trim(),sp=w.lastIndexOf(' ')
return sp>=Math.floor(cap*0.6)?`${w.slice(0,sp).replace(/(?<![,;:\-·.])[,;:\-·.]+$/,'')}…`:`${w}…`}
if(p==='balanced')return fit(`⚖ ${flat}`,114)
if(p==='neurodivergent')return fit(`⚡ ${flat}`,114)
if(p==='anxious')return fit(`😰 ${pt?'Chequei 3×: ':'Checked 3×: '}${flat}`,114)
if(p==='technical')return `[TELEMETRY] ${fit(flat,84)} · state.db=ro`.slice(0,114)
if(p==='kawaii')return `(｡•̀ᴗ-)✧ ${fit(flat,98)} ✨`.slice(0,114)
if(p==='harness_rsi')return `🔄 [RSI] ${fit(flat,96)}`.slice(0,114)
return fit(flat,114)}
if(p==='balanced'){
const lines=core.split('\n')
const head=lines[0]
const rest=lines.slice(1).join(' · ')
return pt? `⚖ Síntese: ${head}\n📊 Contexto: ${rest||'state.db somente-leitura ($0)'}\n↳ Pronto para o próximo passo.`
: `⚖ Summary: ${head}\n📊 Context: ${rest||'state.db read-only ($0)'}\n↳ Ready for next step.`}
if(p==='neurodivergent'){
const lines=core.split('\n')
const head=lines[0]
const rest=lines.slice(1).join(' · ')
return rest?pt? `⚡ Status: ${head}\n🎯 Causa (INV/DOM): ${rest}\n↳ 1 passo por vez · zero ruído.`
: `⚡ Status: ${head}\n🎯 Cause (INV/DOM): ${rest}\n↳ One step at a time · zero noise.` :pt
? `⚡ Foco: ${head}\n↳ Monothread · zero ruído.` : `⚡ Focus: ${head}\n↳ Monothread · zero noise.`}
if(p==='anxious'){
return pt? `😰 Respira, chequei 3× nos logs:\n${core}\n(Loop-Guard ativo: tudo sob controle!)`
: `😰 Deep breath, triple-checked the logs:\n${core}\n(Loop-Guard active: under control!)`}
if(p==='technical'){
return `[D0:OBSERVED] ${core.replace(/\n+/g,' · ')}\n[VERDICT] state.db=ro · nominal · Δτ valid`}
if(p==='kawaii'){
return `(｡•̀ᴗ-)✧ ${core} ✨`}
if(p==='harness_rsi'){
return pt? `🔄 Ciclo RSI: Propose-Probe-Compose\n📊 Telemetria: ${core}\n🧠 Biblioteca atualizada com evidência real.`
: `🔄 RSI Cycle: Propose-Probe-Compose\n📊 Telemetry: ${core}\n🧠 Library updated with verified evidence.`}
return core}
function tldr(markdown){
const plain=String(markdown||'')
.replace(/```[\s\S]*?```/g,' ')
.replace(/`([^`]*)`/g,'$1')
.replace(/\*\*([^\n*]+)\*\*/g,'$1')
.replace(/^[ \t]*#{1,6}[ \t]+/gm,'')
.replace(/^(?:btw\s*[→\-:]\s*)?(?:com\s+base\s+n[ao][^\n:.]{0,90}[:.,]\s*|based\s+on\s+(?:the\s+)?[^\n:.]{0,90}[:.,]\s*)+/i,'')
.split('\n')
.map(l=>l.replace(/^\s*[-•]\s+/,'').replace(/[ \t]+/g,' ').trim())
.filter(Boolean)
.slice(0,3)
.join('\n')
.trim()
const digest=plain.length<=260?plain:(()=>{
const cut=plain.slice(0,260)
const lastDot=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('\n'))
return lastDot>90?cut.slice(0,lastDot + 1).trim(): `${cut.slice(0,255).trim()}.`
})()
return decorateClientPersona(digest)}
function setHudOpen(next,persist=true){
const want=Boolean(next)
if(!_ctx)return
if(want&&!_hudDispose){_hudDispose=_ctx.register({id:HUD_PANE_ID,area:PANES_AREA,title:t().hudTitle,
data:{placement:'floating',anchor:'bottom-right',width:348,height:460,lifecycleKeepAlive:true},
render:()=>jsx(MascotHud,{})})
scheduleTimer(()=>{try{host.undismissPane?.(`${ID}:${HUD_PANE_ID}`)
}catch{}
},0)
}else if(!want&&_hudDispose){_hudDispose()
_hudDispose=null}
$hudOpen.set(want)
if(persist){savePrefs({hudOpen:want})}}
function pruneDisconnectedComposerHandlers(){for(const h of[..._composerOpenHandlers]){
if(h&&h._triggerRef&&(!h._triggerRef.current||!h._triggerRef.current.isConnected)){_composerOpenHandlers.delete(h)}}}
function requestOpenStudio({tab='ask',prefill=null,modal=false,toggle=false}={}){haptic?.('tap')
pruneDisconnectedComposerHandlers()
if(tab){
const normTab=tab==='cards'?'history':tab==='subs'?'subagents':tab
$activeTab.set(normTab)
if($inlineSettingsOpen.get())$inlineSettingsOpen.set(false)}
if(typeof prefill==='string'&&prefill.trim()){stageCommandInBtwChat(prefill.trim(),{
label:$lang.get()==='pt'?'💬 Comando inserido no chat /btw':'💬 Command inserted into /btw chat',source:'prefill',
icon:'comment',switchToAsk:false})}
if(modal){for(const handler of[..._composerOpenHandlers]){handler({action:'close'})}
$dialogOpen.set(toggle?!$dialogOpen.get():true)
return}
let claimed=false
for(const handler of[..._composerOpenHandlers]){if(handler({action:toggle?'toggle':'open'})){claimed=true
break}}
if(!claimed){$dialogOpen.set(toggle?!$dialogOpen.get():true)}}
function closeAllStudioSurfaces(){pruneDisconnectedComposerHandlers()
for(const handler of[..._composerOpenHandlers]){handler({action:'close'})}
$dialogOpen.set(false)}
function cleanBtwMarkdown(raw){if(!raw)return ''
let out=String(raw).trim()
out=out.replace(/^\[btw(?:\s+"[^"]*")?(?:\s+\(btw_[a-zA-Z0-9_]+\))?\]\s*\n?/,'')
out=out.replace(/^[ \t]*::[a-zA-Z0-9_-]+\{[^\n]*\}[ \t]*$/gm,m=> `\`${m.trim()}\``)
return out.trim()}
function rawSessionLeaf(sid){
 const s=String(sid||'').trim()
 return!s?'':(s.includes(':')?s.split(':').pop():s)
}
function canonicalSessionKey(sid){
 const leaf=rawSessionLeaf(sid)
 if(!leaf)return 'draft'
 return _conversationRootBySid.get(leaf)||_conversationRootBySid.get(String(sid||'').trim())||leaf
}
function migrateSessionKeyAlias(oldKey,rootKey){
 const fromK=rawSessionLeaf(oldKey),toK=rawSessionLeaf(rootKey)
 if(!fromK||!toK||fromK===toK||fromK==='draft'||toK==='draft')return
 _conversationRootBySid.set(fromK,toK)
 const mergeById=(a,b)=>{
 const m=new Map()
 for(const it of[...(Array.isArray(b)?b:[]),...(Array.isArray(a)?a:[])]){
 if(it?.id&&!m.has(it.id))m.set(it.id,it)
}
 return[...m.values()]
}
 const entriesMap=$entriesBySession.get()||{}
 if(Array.isArray(entriesMap[fromK])&&entriesMap[fromK].length>0){
 const nextEntries={...entriesMap,[toK]:mergeById(entriesMap[fromK],entriesMap[toK]).sort((a,b)=>Number(a.created_at||0)- Number(b.created_at||0)).slice(-MAX_LOCAL_ITEMS)}
 delete nextEntries[fromK]
 $entriesBySession.set(nextEntries)
 try{_storage?.set(STORAGE_KEY,nextEntries)}catch{}
}
 const pendMap=$pendingBySession.get()||{}
 if(pendMap[fromK]){
 const nextPend={...pendMap,[toK]:pendMap[toK]||pendMap[fromK]}
 delete nextPend[fromK]
 $pendingBySession.set(nextPend)
}
 const deepMap=$deepOverviewBySession.get()||{}
 if(Array.isArray(deepMap[fromK])&&deepMap[fromK].length>0){
 const nextDeep={...deepMap,[toK]:mergeById(deepMap[fromK],deepMap[toK])}
 delete nextDeep[fromK]
 $deepOverviewBySession.set(nextDeep)
}
 const petMap=$petBubblesBySession.get()||{}
 if(Array.isArray(petMap[fromK])&&petMap[fromK].length>0){
 const nextPet={...petMap,[toK]:mergeById(petMap[fromK],petMap[toK]).slice(0,40)}
 delete nextPet[fromK]
 $petBubblesBySession.set(nextPet)
}
}
function trackConversationRoot(sid,conversationId,oldSid=''){
 const rootLeaf=rawSessionLeaf(conversationId)
 if(!rootLeaf)return
 if(oldSid)migrateSessionKeyAlias(oldSid,rootLeaf)
 if(sid)migrateSessionKeyAlias(sid,rootLeaf)
}
function resolveFocusedIds(){
const hashSid=typeof location!=='undefined'&&location.hash?location.hash.replace(/^#\/?/,'').split(/[?#]/)[0].trim():''
const runtimeId=host.state?.focusedSessionId?.get?.()||host.state?.activeSessionId?.get?.()||hashSid||''
const storedId=host.state?.focusedStoredSessionId?.get?.()||hashSid||''
const key=canonicalSessionKey(storedId||runtimeId)
return{runtimeId:String(runtimeId||''),storedId:String(storedId||''),parentRuntimeId:String(runtimeId||''),
parentStoredId:String(storedId||''),key}}
function fmtCompact(n){
const v=Number(n)||0
if(v>=1_000_000)return `${(v / 1_000_000).toFixed(2)}M`
if(v>=1_000)return `${(v / 1_000).toFixed(1)}k`
return String(v)}
function fmtDurationSec(sec){
const s=Math.max(0,Math.round(Number(sec)||0))
if(s<60)return `${s}s`
const m=Math.floor(s / 60)
const rem=s % 60
if(m<60)return `${m}m ${rem}s`
const h=Math.floor(m / 60)
return `${h}h ${m % 60}m`}
function fmtClock(epochSec){if(!epochSec)return ''
try{
return new Date(Number(epochSec)* 1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})
}catch{
return ''}}
function shortModelName(slug){if(!slug)return ''
return String(slug).split('/').pop()||String(slug)}
function buildClientRadarMarkdown(d){if(!d||!d.found){
return '### BTW Studio — Session Radar ($0)\n\nNo persisted session found in `state.db` yet.'}
const counts=d.counts||{}
const toks=d.tokens||{}
const activeTool=d.live?.active_tool||''
const statusStr=activeTool? `Running tool \`${activeTool}\`` :d.live?.busy?'Busy':'Ready (Idle)'
const safeTitle=String(d.title||'Untitled session').replace(/[\r\n|]+/g,' ').trim()
const lines=[`### BTW Studio — Session Radar (\`${d.canonical_id||d.session_id}\`)`,'',`- **Title:** ${safeTitle}`,
`- **Profile / Model:** \`${d.profile}\` · \`${d.model}\``,
`- **Status:** ${statusStr} · **Elapsed:** \`${fmtDurationSec(d.elapsed_seconds)}\``,'','| Metric | Value | Detail |',
'| :--- | :--- | :--- |',
`| **Messages & API** | \`${counts.messages_active||0}\` msgs | \`${counts.api_calls||0}\` LLM API calls |`,
`| **Tool Execution** | \`${counts.tool_calls||0}\` tools | \`${counts.errors_recent||0}\` alerts/timeouts |`,
`| **Tokens & Cache** | \`${toks.cache_hit_pct??0}%\` cache hit | in \`${fmtCompact(toks.input)}\` · out \`${fmtCompact(toks.output)}\` · cache \`${fmtCompact(toks.cache_read)}\` |`,
`| **Measured Spend** | \`$${Number(toks.cost_usd||0).toFixed(4)}\` | \`${toks.billing_provider||'subscription/custom'}\` |`]
if(Array.isArray(d.top_tools)&&d.top_tools.length>0){
lines.push('', `**Top Tools:** ${d.top_tools.map(x=> `\`${x.name}\` (×${x.count})`).join(', ')}`)}
if(Array.isArray(d.touched_files)&&d.touched_files.length>0){
lines.push('','#### Recently Touched Files',...d.touched_files.slice(0,8).map(fp=> `- \`${fp}\``))}
return lines.join('\n')}
function persistLocalEntries(map){if(!_storage)return
try{
const keys=Object.keys(map)
const trimmed={}
for(const k of keys.slice(-30)){trimmed[k]=(map[k]||[]).slice(-MAX_LOCAL_ITEMS)}
_storage.set(STORAGE_KEY,trimmed)
}catch{}}
function normalizeEntryObject(rawEntry){if(!rawEntry||typeof rawEntry!=='object')return null
return{id:String(rawEntry.id||rawEntry.task_id|| `btw_${Date.now()}`),title:rawEntry.title?String(rawEntry.title):'',
question:String(rawEntry.question||'').trim(),answer:cleanBtwMarkdown(rawEntry.answer||rawEntry.text||''),
source:String(rawEntry.source||'btw-studio'),model:String(rawEntry.model||''),
duration_ms:rawEntry.duration_ms!=null?Number(rawEntry.duration_ms):null,pinned:Boolean(rawEntry.pinned),
created_at:Number(rawEntry.created_at||Date.now()/ 1000),parent_id:rawEntry.parent_id?String(rawEntry.parent_id):'',
thread_id:rawEntry.thread_id?String(rawEntry.thread_id):'',
resolved_question:rawEntry.resolved_question?String(rawEntry.resolved_question):'',
preset_id:rawEntry.preset_id?String(rawEntry.preset_id):'',
anomaly_kinds:Array.isArray(rawEntry.anomaly_kinds)?rawEntry.anomaly_kinds.map(String).slice(0,6):[],
media_pending:Boolean(rawEntry.media_pending),
media_items:Array.isArray(rawEntry.media_items)?rawEntry.media_items.map(m=>({...m})):[],
tool_runs:Array.isArray(rawEntry.tool_runs)?rawEntry.tool_runs:[],
attachments:Array.isArray(rawEntry.attachments)?rawEntry.attachments.map(a=>{if(!a||typeof a!=='object')return null;const isSvg=/\.svg$/i.test(String(a.label||a.path||''))||String(a.mime_type||'').toLowerCase().includes('svg');const safeThumb=!isSvg&&_SAFE_INLINE_MEDIA_URI_RE.test(a.thumbnail_url||'')?a.thumbnail_url:'';const safeData=!isSvg&&_SAFE_INLINE_MEDIA_URI_RE.test(a.data_url||'')?a.data_url:'';return{...a,kind:isSvg&&a.kind==='image'?'file':a.kind,thumbnail_url:safeThumb,data_url:safeData}}).filter(Boolean):[],voice_dictated:Boolean(rawEntry.voice_dictated),
live_voice:Boolean(rawEntry.live_voice),
tts_audio:rawEntry.tts_audio&&typeof rawEntry.tts_audio==='object'?{...rawEntry.tts_audio}:null}}
function upsertEntry(sessionKey,rawEntry,autoExpandBanner=true){
const cleaned=normalizeEntryObject(rawEntry)
if(!cleaned||!cleaned.answer)return null
const key=canonicalSessionKey(sessionKey)
const prevMap=$entriesBySession.get()
const rawList=prevMap?.[key]
const list=Array.isArray(rawList)?rawList.filter(Boolean):[]
const idx=list.findIndex(item=>item.id===cleaned.id)
if(idx>=0){cleaned.pinned=Boolean(list[idx].pinned||cleaned.pinned)
list[idx]=cleaned
}else{list.push(cleaned)}
const pinnedList=list.filter(x=>x.pinned)
const unpinnedList=list.filter(x=>!x.pinned)
const capped=list.length>MAX_LOCAL_ITEMS
?[...pinnedList,...unpinnedList.slice(-Math.max(1,MAX_LOCAL_ITEMS - pinnedList.length))]:list
const nextMap={...prevMap,[key]:capped}
$entriesBySession.set(nextMap)
persistLocalEntries(nextMap)
const pend={...$pendingBySession.get()}
const wasPending=Boolean(pend[key])
if(pend[key]){delete pend[key]
$pendingBySession.set(pend)}
if(wasPending||idx<0){petClear('thinking')
void speakSynth(cleaned.answer,cleaned.id,key,cleaned.question)}
const dis={...$bannerDismissedIdBySession.get()}
delete dis[key]
$bannerDismissedIdBySession.set(dis)
if(autoExpandBanner){$bannerExpandedBySession.set({...$bannerExpandedBySession.get(),[key]:true})}
return cleaned}
function mergeBackendHistory(sessionKey,backendItems){if(!Array.isArray(backendItems)||!backendItems.length)return
const key=canonicalSessionKey(sessionKey)
const prevMap=$entriesBySession.get()
const local=[...(prevMap[key]||[])]
const byId=new Map(local.map(x=>[x.id,x]))
let changed=false
for(const item of backendItems){if(!item||!item.id||!item.answer)continue
const norm=normalizeEntryObject(item)
if(!norm)continue
const prev=byId.get(norm.id)
if(!prev){byId.set(norm.id,norm)
changed=true
}else{
const prevMediaSig=JSON.stringify(prev.media_items||[])
const nextMediaSig=JSON.stringify(norm.media_items||[])
if(prev.answer!==norm.answer||Boolean(prev.media_pending)!==Boolean(norm.media_pending)||prevMediaSig!==nextMediaSig||
(!prev.title&&norm.title)
){norm.pinned=Boolean(prev.pinned||norm.pinned)
byId.set(norm.id,norm)
changed=true}}
if(norm.media_pending||(Array.isArray(norm.media_items)&&norm.media_items.some(m=>m&&m.status==='generating'))
){pollPendingBtwMedia(key,item.session_id||key,norm.id)}}
if(changed){
const sortedAll=[...byId.values()].sort((a,b)=>(a.created_at||0)-(b.created_at||0))
const pinnedList=sortedAll.filter(x=>x.pinned)
const unpinnedList=sortedAll.filter(x=>!x.pinned)
const merged=sortedAll.length>MAX_LOCAL_ITEMS?[...pinnedList.slice(-MAX_LOCAL_ITEMS),...unpinnedList.slice(-Math.max(0,MAX_LOCAL_ITEMS - pinnedList.length))].sort((a,b)=>(a.created_at||0)-(b.created_at||0)):sortedAll
const next={...prevMap,[key]:merged}
$entriesBySession.set(next)
persistLocalEntries(next)
const lastEntry=merged[merged.length - 1]
if(lastEntry&&(lastEntry.media_pending||(Array.isArray(lastEntry.media_items)&&lastEntry.media_items.length>0)||
/MEDIA:/i.test(String(lastEntry.answer||'')))&&$bannerExpandedBySession.get()[key]===undefined
){$bannerExpandedBySession.set({...$bannerExpandedBySession.get(),[key]:true})}}}
function persistLocalRsi(overrides={}){if(!_storage)return
try{_storage.set(RSI_STORAGE_KEY,{probes:($localProbes.get()||[]).slice(-60),lessons:($localLessons.get()||[]).slice(-120),
presetStats:$localPresetStats.get()||{},...overrides})
}catch{}}
function recordLocalPresetRun(presetId){
const pid=String(presetId||'').trim()
if(!pid)return
const cur={...($localPresetStats.get()||{})}
const prev=cur[pid]||{runs:0,helped:0,hurt:0,no_observed_effect:0,confounded:0}
cur[pid]={...prev,runs:Number(prev.runs||0)+ 1,last_used:Date.now()/ 1000}
$localPresetStats.set(cur)
persistLocalRsi({presetStats:cur})}
function computeClientUtilityYield(st){if(!st)return 0
const now=Date.now()/ 1000
const last=Number(st.last_used||0)
const ageDays=last?Math.max(0,(now - last)/ 86400):30
const decay=Math.pow(0.5,ageDays / 7)
const base=Number(st.runs||0)+
2 * Number(st.helped||0)+
1 * Number(st.self_recovered||0)-
2 * Number(st.hurt||0)-
0.5 * Number(st.no_observed_effect||0)
return Math.round(base * decay * 1000)/ 1000}
function stripInlineMarkdownPreview(raw,maxLen=120){
const clean=String(raw||'')
.replace(/```[\s\S]*?```/g,' [code] ')
.replace(/`([^`]+)`/g,'$1')
.replace(/\*\*([^*]+)\*\*/g,'$1')
.replace(/\*([^*]+)\*/g,'$1')
.replace(/__([^_]+)__/g,'$1')
.replace(/^#{1,6}[ \t]+/gm,'')
.replace(/^[ \t]*[-*+>][ \t]+/gm,'')
.replace(/\[([^\[\]\n]{1,300})\]\(([^()\n]{1,600})\)/g,'$1')
.split(/\r?\n+/).map(x=>x.trim()).filter(Boolean).join(' · ')
.replace(/\s{2,}/g,' ')
.trim()
if(clean.length<=maxLen)return clean
return `${clean.slice(0,maxLen - 1).trim()}…`}
function buildLessonRichMarkdown(item,isPt=false){
const cue=String(item?.cue||(isPt?'Quando este padrão ocorrer':'When this pattern appears')).trim()
const lesson=String(item?.lesson||'').trim()
const evidence=String(item?.evidence||'').trim()
const scopeDesc=item?.scope==='DOM'?isPt?'DOM · Fato específico deste repositório/workspace'
:'DOM · Workspace/domain-specific fact':isPt?'INV · Regra invariante de fluxo agêntico':'INV · Invariant agent workflow rule'
const lines=[`> **🎯 ${isPt?'Gatilho (Cue)':'Trigger (Cue)'}:** ${cue}`,'',lesson]
if(evidence){
lines.push('','---', `*🔬 **${isPt?'Evidência Empírica':'Empirical Evidence'}:** ${evidence} · **${scopeDesc}** · **Lever ${item?.lever||'C6'}***`)
}
return lines.join('\n')}
let _activeMediaRecorder=null
let _activeMediaStream=null
let _activeAudioCtx=null
let _activeAnalyser=null
let _dictationAudioChunks=[]
let _dictationMimeType='audio/webm'
let _dictationTimer=null
let _dictationWaveTimer=null
let _dictationBaseText=''
let _dictationFinalAcc=''
let _dictationCustomSetter=null
let _lastVoiceDictatedFlag=false
const WAVE_WEIGHTS=[0.38,0.62,0.85,1.0,0.92,1.0,0.85,0.62,0.38]
function BtwVoiceWaveform({active=false}){
const level=useValue($dictationLevel)
const norm=Math.max(0,Math.min(1,Number(level)||0))
return div({'aria-hidden':'true',cls:'btw-voice-waveform','data-active':active?'true':'false'},WAVE_WEIGHTS.map((w,idx)=>{
const jitter=active?Math.sin(idx * 1.3 + norm * 12)* 0.08:0
const hPct=active?Math.round(Math.max(22,Math.min(100,(0.22 + Math.min(0.78,norm * 1.45 * w + jitter))* 100))):24
return span({cls:'btw-voice-wave-bar',style:{height: `${hPct}%` }},undefined,idx)}))}
let _sharedMicStream=null,_sharedMicPending=null,_dictPcmChunks=[],_dictPcmRate=48000,_dictProc=null,_dictMute=null,_dictWebSpeech=null,_liveWebSpeech=null
const _STT_HALLUCINATIONS=new Set(['you','thank you','thanks for watching','thank you for watching','bye','subtitles by','obrigado','obrigada','tchau','inscreva-se no canal','legendas pela comunidade amara.org','amara.org'])
function _sanitizeFastSpeechText(raw){
const s=String(raw||'').replace(/\s+/g,' ').trim()
if(s.length<2)return ''
const norm=s.toLowerCase().replace(/^[^\wÀ-ÿ]+/,'').replace(/(?<=[\wÀ-ÿ])[^\wÀ-ÿ]+$/,'')
return(!norm||_STT_HALLUCINATIONS.has(norm))?'':s}
async function _acquireSharedMicStream(){
if(_sharedMicStream){
const liveTrks=(_sharedMicStream.getAudioTracks?.()||[]).filter(t=>t.readyState==='live')
if(liveTrks.length>0)return _sharedMicStream
try{for(const t of _sharedMicStream.getTracks?.()||[])t.stop()}catch{}
_sharedMicStream=null}
if(_sharedMicPending)return await _sharedMicPending
if(!(typeof navigator!=='undefined'&&navigator.mediaDevices?.getUserMedia))throw new Error('mic unavailable')
_sharedMicPending=(async()=>{
const s=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}})
const trks=s.getAudioTracks?.()||[]
if(!trks.length||trks.every(t=>t.readyState==='ended')){for(const t of s.getTracks?.()||[])t.stop();throw new Error('mic ended')}
for(const t of trks){t.onended=()=>{if(_sharedMicStream===s)_sharedMicStream=null}}
_sharedMicStream=s
return s})()
try{return await _sharedMicPending}finally{_sharedMicPending=null}}
function _releaseSharedMicIfIdle(force=false){
if(!force&&($wakeWordEnabled.get()||$liveVoiceActive.get()||$dictationStatus.get()==='recording'))return
if(_sharedMicStream){try{for(const t of _sharedMicStream.getTracks?.()||[]){t.onended=null;t.stop()}}catch{};_sharedMicStream=null}}
async function _callBtwVoiceApi(rpcName,restPath,body,timeoutMs=25_000){
try{
const r=await host.request(`plugin.btw-studio.${rpcName}`,rpcName==='ask'?{...body,sync:true}:body,timeoutMs)
if(r&&typeof r==='object'){
if(rpcName==='ask'){if(r.entry)return r}
else if('ok' in r||'detected' in r||'transcript' in r||'data_url' in r)return r}
}catch{}
if(_rest)return await _rest(restPath,{method:'POST',body,timeoutMs})
return null}
function _downsampleFloat32To16kPcm16(floatSamples,inputSampleRate){
const ratio=Math.max(1,(inputSampleRate||16000)/ 16000),outLen=Math.floor(floatSamples.length / ratio)
if(outLen<320)return null
const down=new Float32Array(outLen);let peak=0
for(let i=0;i<outLen;i +=1){
const s0=Math.floor(i * ratio),s1=Math.min(floatSamples.length,Math.max(s0 + 1,Math.floor((i + 1)* ratio)))
let sum=0;for(let j=s0;j<s1;j +=1)sum +=floatSamples[j]
const avg=sum /(s1 - s0);down[i]=avg;const av=Math.abs(avg);if(av>peak)peak=av}
const gain=(peak>=0.005&&peak<0.28)?Math.min(8,0.68 / peak):1,pcm16=new Int16Array(outLen)
for(let i=0;i<outLen;i +=1){const s=Math.max(-1,Math.min(1,down[i]* gain));pcm16[i]=s<0?s * 0x8000:s * 0x7fff}
return pcm16}
async function _floatChunksTo16kWavDataUrl(chunks,inputRate){
let total=0;for(const c of chunks)total +=c.length
if(total<400)return ''
const merged=new Float32Array(total);let off=0
for(const c of chunks){merged.set(c,off);off +=c.length}
const pcm16=_downsampleFloat32To16kPcm16(merged,inputRate)
if(!pcm16)return ''
const byteLen=pcm16.length * 2,wavBuf=new ArrayBuffer(44 + byteLen),v=new DataView(wavBuf)
v.setUint32(0,0x46464952,true);v.setUint32(4,36 + byteLen,true);v.setUint32(8,0x45564157,true);v.setUint32(12,0x20746d66,true)
v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true)
v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);v.setUint32(36,0x61746164,true);v.setUint32(40,byteLen,true)
new Uint8Array(wavBuf,44).set(new Uint8Array(pcm16.buffer))
return await _blobToDataUrl(new Blob([wavBuf],{type:'audio/wav'}))}
function _startParallelWebSpeech(langCode,onUpdate){
try{
const SR=window.SpeechRecognition||window.webkitSpeechRecognition
if(!SR)return null
const rec=new SR();rec.continuous=true;rec.interimResults=true
rec.lang=langCode==='pt'?'pt-BR':langCode==='en'?'en-US':($lang.get()==='pt'?'pt-BR':'en-US')
let finalAcc='',interimTxt=''
rec.onresult=ev=>{
interimTxt=''
for(let i=ev.resultIndex;i<ev.results.length;i +=1){
const tStr=String(ev.results[i]?.[0]?.transcript||'')
if(ev.results[i].isFinal)finalAcc=(finalAcc + ' ' + tStr).trim()
else interimTxt +=tStr}
onUpdate?.(finalAcc,interimTxt.trim())}
rec.onerror=()=>undefined
rec.start()
return{getText:()=>(finalAcc||interimTxt).trim(),stop:()=>{try{rec.onresult=null;rec.stop()}catch{}}}
}catch{return null}}
function _extractClientWakeMeta(txt,customPhrase=''){
const clean=String(txt||'').trim();if(!clean)return{detected:false,command:'',isStop:false}
const norm=clean.toLowerCase().replace(/^[^\wÀ-ÿ]+/,'').replace(/(?<=[\wÀ-ÿ])[^\wÀ-ÿ]+$/,'').trim()
if(['stop','stop live','end live','cancel','goodbye','never mind','nevermind','parar','parar live','pare','pode parar','encerrar','encerrar live','cancelar','tchau','valeu'].includes(norm))return{detected:false,command:'',isStop:true}
const trigs=['hey by the way','okay by the way','ok by the way','by the way','hey btw','btw','por sinal','a propósito','a proposito']
const cp=String(customPhrase||$wakePhrase.get()||'').trim().toLowerCase()
if(cp&&!trigs.includes(cp))trigs.unshift(cp)
trigs.sort((a,b)=>b.length - a.length)
for(const tg of trigs){
const esc=tg.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
const m=new RegExp(`(?:^|\\b)(${esc})(?:[\\s,.:;!\\-—?]+([\\s\\S]*))?$`,'i').exec(clean)
if(m){
let rem=String(m[2]||'').trim().replace(/^[,.:;!\-—?\s]+/,'')
if(!rem&&m.index>0){const pfx=clean.slice(0,m.index).trim().replace(/(?<![,.:;!\-—?\s])[,.:;!\-—?\s]+$/,'');if(pfx.length>=4)rem=pfx}
return{detected:true,command:rem,isStop:false}}}
return{detected:false,command:'',isStop:false}}
function resolveDictationBcp47(){
const pref=$dictationLang.get()
return(pref==='pt-BR'||pref==='pt')?'pt':(pref==='en-US'||pref==='en')?'en':'auto'}
function _applyDictationText(text){
const setter=_dictationCustomSetter;if(typeof setter==='function')setter(text);else $draftQuestion.set(text)}
function _cleanupDictationHardware(){
if(_dictWebSpeech){try{_dictWebSpeech.stop()}catch{};_dictWebSpeech=null}
if(_dictationTimer){clearInterval(_dictationTimer);_dictationTimer=null}
if(_dictationWaveTimer){clearInterval(_dictationWaveTimer);_dictationWaveTimer=null}
if(_dictProc){try{_dictProc.onaudioprocess=null;_dictProc.disconnect()}catch{};_dictProc=null}
if(_dictMute){try{_dictMute.disconnect()}catch{};_dictMute=null}
if(_activeAudioCtx){try{const ctx=_activeAudioCtx;_activeAudioCtx=null;_activeAnalyser=null;void ctx.close?.().catch?.(()=>undefined)}catch{}}
_activeMediaStream=null;_dictPcmChunks=[]
_releaseSharedMicIfIdle(false)}
function _blobToDataUrl(blob){
return new Promise((resolve,reject)=>{try{const reader=new FileReader()
reader.onloadend=()=>resolve(typeof reader.result==='string'?reader.result:'');reader.onerror=err=>reject(err);reader.readAsDataURL(blob)
}catch(err){reject(err)}})}
async function _transcribeRecordedAudioBlob(blob,mimeType,langBcp47,rawSpeechFallback='',wavDataUrl=''){
if(rawSpeechFallback&&rawSpeechFallback.trim().length>=2){
const fastRes=await _callBtwVoiceApi('stt_transcribe','/stt/transcribe',{raw_transcript:rawSpeechFallback.trim(),language:langBcp47},6000)
if(fastRes?.ok&&typeof fastRes.transcript==='string')return fastRes.transcript.trim()
return rawSpeechFallback.trim()}
let dataUrl=wavDataUrl||''
let effMime=wavDataUrl?'audio/wav':(mimeType||'audio/webm')
if(!dataUrl&&blob&&blob.size>80){try{dataUrl=await _blobToDataUrl(blob)}catch{dataUrl=''}}
if(dataUrl){
const res=await _callBtwVoiceApi('stt_transcribe','/stt/transcribe',{data_url:dataUrl,mime_type:effMime,language:langBcp47},25_000)
if(res?.ok&&typeof res.transcript==='string'&&res.transcript.trim())return res.transcript.trim()}
return ''}
function stopBtwDictation(cancelled=false){
const recorder=_activeMediaRecorder;_activeMediaRecorder=null
const wsText=_dictWebSpeech?.getText?.()||''
const pcmSnap=_dictPcmChunks.slice(),pcmRate=_dictPcmRate
if(cancelled){
if(recorder&&recorder.state!=='inactive'){try{recorder.ondataavailable=null;recorder.onstop=null;recorder.stop()}catch{}}
_dictationAudioChunks=[];_cleanupDictationHardware();_applyDictationText(_dictationBaseText);_dictationCustomSetter=null
$dictationPartial.set('');$dictationLevel.set(0);$dictationElapsed.set(0);$dictationStatus.set('idle');petClear('dictating')
if(!_disposing&&_ctx&&$wakeWordEnabled.get()&&!$liveVoiceActive.get())void startBtwWakeListener()
return}
const isPt=$lang.get()==='pt',langBcp47=resolveDictationBcp47(),speechInterim=String($dictationPartial.get()||'').trim()
const isStatusPlaceholder=/^(🎙|Ditado |Dictation |Gravando |Recording |Wake )/.test(speechInterim)
const cleanSpeechText=_sanitizeFastSpeechText(wsText||_dictationFinalAcc||(!isStatusPlaceholder?speechInterim:'')||'')
$dictationPartial.set('');$dictationLevel.set(0);petClear('dictating');$dictationStatus.set('transcribing')
const finalizeWithTranscript=spokenTxt=>{
const combined=[_dictationBaseText,String(spokenTxt||'').trim()].filter(Boolean).join(' ').trim()
if(combined){_lastVoiceDictatedFlag=true;_applyDictationText(combined);haptic?.('success')
petSay('done',$lang.get()==='pt'?'[STT: Transcrito] ✓':'[STT: Transcribed] ✓','info',4000)
}else if(cleanSpeechText){_lastVoiceDictatedFlag=true;_applyDictationText([_dictationBaseText,cleanSpeechText].filter(Boolean).join(' ').trim())
}else{host.notify?.({kind:'info',message:isPt?'Nenhuma fala detectada no áudio gravado.':'No speech detected in the recorded audio.'})}
_dictationCustomSetter=null;$dictationStatus.set('idle');$dictationElapsed.set(0)
if(!_disposing&&_ctx&&$wakeWordEnabled.get()&&!$liveVoiceActive.get())void startBtwWakeListener()
else _releaseSharedMicIfIdle(false)}
const processChunks=async()=>{
const chunks=_dictationAudioChunks.slice();_dictationAudioChunks=[];const mime=_dictationMimeType||'audio/webm';_cleanupDictationHardware()
if(cleanSpeechText.length>=2){const vTxt=await _transcribeRecordedAudioBlob(null,mime,langBcp47,cleanSpeechText,'').catch(()=>cleanSpeechText);finalizeWithTranscript(_sanitizeFastSpeechText(vTxt));return}
const wavUrl=pcmSnap.length>0?await _floatChunksTo16kWavDataUrl(pcmSnap,pcmRate):''
const blob=(!wavUrl&&chunks.length>0)?new Blob(chunks,{type:mime}):null
if(!wavUrl&&(!blob||blob.size<=80)){finalizeWithTranscript('');return}
try{finalizeWithTranscript(await _transcribeRecordedAudioBlob(blob,mime,langBcp47,'',wavUrl))}catch{finalizeWithTranscript('')}}
if(pcmSnap.length>0||cleanSpeechText.length>=2){
if(recorder&&recorder.state!=='inactive'){try{recorder.ondataavailable=null;recorder.onstop=null;recorder.stop()}catch{}}
void processChunks();return}
if(recorder&&recorder.state!=='inactive'){try{recorder.onstop=()=>{void processChunks()};recorder.stop();return}catch{}}
void processChunks()}
function toggleBtwDictation(target='main',customDraftValue=null,customDraftSetter=null,opts={}){
if($dictationStatus.get()==='recording'){stopBtwDictation(false);return}
if($dictationStatus.get()==='transcribing')return
if($liveVoiceActive.get())stopBtwLiveVoice(false)
stopBtwWakeListener(false)
const isPt=$lang.get()==='pt',fromWake=Boolean(opts?.fromWake)
_dictationCustomSetter=typeof customDraftSetter==='function'?customDraftSetter:null
_dictationBaseText=String(customDraftValue!==null?customDraftValue:$draftQuestion.get()||'').trim()
_dictationFinalAcc='';_dictationAudioChunks=[];_dictPcmChunks=[];$dictationTarget.set(target)
$dictationPartial.set(isPt?(fromWake?'🎙 Wake → Ditado (fale agora)…':'🎙 Ouvindo microfone…'):(fromWake?'🎙 Wake → Dictate (speak now)…':'🎙 Listening…'))
$dictationElapsed.set(0);$dictationStatus.set('recording');$dictationLevel.set(0.28);haptic?.('tap')
petSay('dictating',isPt?'🎙 Ouvindo ditado /btw…':'🎙 Listening for /btw dictation…','wait',20000)
_dictWebSpeech=_startParallelWebSpeech(resolveDictationBcp47(),(fin,inter)=>{
_dictationFinalAcc=fin;const preview=[fin,inter].filter(Boolean).join(' ').trim()
if(preview)$dictationPartial.set(`🎙 ${preview}`)})
const startedMs=Date.now()
_dictationTimer=setInterval(()=>{const sec=Math.floor((Date.now()- startedMs)/ 1000);$dictationElapsed.set(sec);if(sec>=180)stopBtwDictation(false)},500)
const timeBuf=new Uint8Array(128);let dictSpeechMs=0,dictSilenceMs=0,dictConfirmed=false,dictNoise=0.007
_dictationWaveTimer=setInterval(()=>{if(_activeAnalyser){try{_activeAnalyser.getByteTimeDomainData(timeBuf);let sumSq=0
for(let i=0;i<timeBuf.length;i +=1){const v=(timeBuf[i]- 128)/ 128;sumSq +=v * v}
const rms=Math.sqrt(sumSq / timeBuf.length),boosted=Math.min(1,Math.max(0.12,rms * 5.2))
const nextLvl=$dictationLevel.get()* 0.35 + boosted * 0.65
if(Math.abs(nextLvl - $dictationLevel.get())>=0.04)$dictationLevel.set(nextLvl)
if(fromWake){const elMs=Date.now()- startedMs,gate=Math.max(0.013,Math.min(0.042,dictNoise * 2.25))
if(rms>gate){dictSpeechMs +=80;dictSilenceMs=0;if(dictSpeechMs>=180)dictConfirmed=true}
else{if(!dictConfirmed)dictNoise=dictNoise * 0.92 + rms * 0.08
if(dictConfirmed){dictSilenceMs +=80;if(dictSilenceMs>=860){stopBtwDictation(false);return}}
else if(elMs>=7500){stopBtwDictation(true);return}}}
return}catch{}}
const cur=$dictationLevel.get(),pulse=0.22 + Math.abs(Math.sin(Date.now()/ 190))* 0.45,np=Math.min(1,cur * 0.4 + pulse * 0.6);if(Math.abs(np - cur)>=0.04)$dictationLevel.set(np)},80)
_acquireSharedMicStream().then(stream=>{
if(!_ctx||$dictationStatus.get()!=='recording'){_releaseSharedMicIfIdle(Boolean(!_ctx));return}
_activeMediaStream=stream
try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(AudioCtx){
const actx=new AudioCtx();if(actx.state==='suspended')void actx.resume().catch(()=>undefined)
_dictPcmRate=actx.sampleRate||48000
const source=actx.createMediaStreamSource(stream),analyser=actx.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=0.45
const proc=actx.createScriptProcessor(2048,1,1),mute=actx.createGain();mute.gain.value=0
proc.onaudioprocess=ev=>{try{ev.outputBuffer.getChannelData(0).fill(0)}catch{}
if($dictationStatus.get()!=='recording')return
const inp=ev.inputBuffer.getChannelData(0),cp=new Float32Array(inp.length);cp.set(inp);_dictPcmChunks.push(cp)}
source.connect(analyser);source.connect(proc);proc.connect(mute);mute.connect(actx.destination)
_activeAudioCtx=actx;_activeAnalyser=analyser;_dictProc=proc;_dictMute=mute}}catch{}
if(!_dictationFinalAcc)$dictationPartial.set(isPt?(fromWake?'🎙 Ditado via Wake (pausa conclui)…':'🎙 Gravando voz (clique ✓ Concluir)…'):(fromWake?'🎙 Wake dictation (pause finishes)…':'🎙 Recording voice (click ✓ Done)…'))
}).catch(()=>{if($dictationStatus.get()==='recording'){
host.notify?.({kind:'warning',message:isPt?'Permissão de microfone negada ou dispositivo indisponível.':'Microphone permission denied or unavailable.'})
stopBtwDictation(true)}})}
let _activeTtsAudio=null,_wakeMediaStream=null,_ttsPlayToken=0
let _wakeAudioCtx=null,_wakeAnalyser=null,_wakeProcessor=null,_wakeInterval=null,_wakePcmRing=[],_wakeCheckInFlight=false
let _liveRecStream=null,_liveRecAudioCtx=null,_liveRecAnalyser=null,_liveMediaRecorder=null,_liveAudioChunks=[],_liveVadTimer=null,_liveProc=null,_liveMute=null
let _liveSilentCycles=0,_liveTurnRetryTimer=null,_chimeAudioCtx=null,_chimeCloseTimer=null,_wakeMuteGain=null,_wakeResumeCleanup=null
let _liveNextCreatesBanner=true,_liveConvHistory=[]
function playBtwWakeChime(kind='wake'){try{
const AudioCtx=window.AudioContext||window.webkitAudioContext
if(!AudioCtx)return
if(_chimeCloseTimer){clearTimeout(_chimeCloseTimer);_chimeCloseTimer=null}
if(_chimeAudioCtx){try{void _chimeAudioCtx.close?.().catch?.(()=>undefined)}catch{}_chimeAudioCtx=null}
const ctx=new AudioCtx();_chimeAudioCtx=ctx;const now=ctx.currentTime
const freqs=kind==='stop'?[660,440]:kind==='ready'?[587.33,880]:[523.25,659.25,987.77]
freqs.forEach((f,idx)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine'
osc.frequency.setValueAtTime(f,now + idx * 0.065);gain.gain.setValueAtTime(0.001,now + idx * 0.065)
gain.gain.exponentialRampToValueAtTime(0.08,now + idx * 0.065 + 0.015);gain.gain.exponentialRampToValueAtTime(0.0001,now + idx * 0.065 + 0.14)
osc.connect(gain);gain.connect(ctx.destination);osc.start(now + idx * 0.065);osc.stop(now + idx * 0.065 + 0.15)})
_chimeCloseTimer=setTimeout(()=>{_chimeCloseTimer=null;if(_chimeAudioCtx===ctx)_chimeAudioCtx=null;void ctx.close?.().catch?.(()=>undefined)},600)
}catch{}}
function stopBtwTtsPlayback(){
_ttsPlayToken +=1
if(_activeTtsAudio){try{_activeTtsAudio.pause();_activeTtsAudio.src=''}catch{};_activeTtsAudio=null}
$ttsSpeakingEntryId.set('')
if($liveVoicePhase.get()==='speaking'){$liveVoicePhase.set($liveVoiceActive.get()?'listening':($wakeWordEnabled.get()?'wake_standby':'idle'))}}
function _prepareFastSpokenChunks(rawMarkdown,fastLive=false){
let clean=String(rawMarkdown||'').replace(/```[\s\S]*?```/g,' ').replace(/MEDIA:\S+/gi,' ').replace(/\[([^\[\]\n]{1,300})\]\(([^()\n]{1,600})\)/g,'$1')
.replace(/[*_~`#>|]/g,' ').replace(/\s+/g,' ').trim()
if(!clean)return[]
clean=clean.slice(0,fastLive?480:1200)
if(!fastLive||clean.length<=120)return[clean]
const m=/^(.{28,135}?[.!?…])(?:\s+([\s\S]+))?$/.exec(clean)
if(m&&m[2]?.trim())return[m[1].trim(),m[2].trim()]
return[clean]}
async function _fetchTtsChunkUrl(text,sessionScope,fastLive=false,userInitiated=true){
const voicePref=$ttsVoice.get()||($backendSettings.get()||{}).tts_voice||'coral'
const modelPref=$ttsModel.get()||($backendSettings.get()||{}).tts_model||'gpt-4o-mini-tts'
const res=await _callBtwVoiceApi('tts_speak','/tts/speak',{text,voice:voicePref,model:modelPref,fast_live:fastLive,user_initiated:userInitiated,
session_id:sessionScope?.storedId||sessionScope?.runtimeId||'active'},30_000)
if(res?.ok&&res.data_url&&_SAFE_INLINE_MEDIA_URI_RE.test(res.data_url)){
if(res.media_path){
if(_mediaDataUrlCache.size>=36)_mediaDataUrlCache.delete(_mediaDataUrlCache.keys().next().value)
_mediaDataUrlCache.set(String(res.media_path).replace(/\\/g,'/'),res.data_url)}
return res.data_url}
return ''}
function _playSingleAudioUrl(url,myToken){
return new Promise(resolve=>{
if(myToken!==_ttsPlayToken||!url){resolve(false);return}
try{const audio=new Audio(url);_activeTtsAudio=audio
const done=ok=>{if(_activeTtsAudio===audio)_activeTtsAudio=null;resolve(ok)}
audio.onended=()=>done(true);audio.onerror=()=>done(false)
void audio.play().catch(()=>done(false))
}catch{resolve(false)}})}
async function speakBtwCardOrText(entryOrText,sessionScope=null,onEnded=null,opts={}){
const isObj=entryOrText&&typeof entryOrText==='object',entryId=isObj?String(entryOrText.id||''):''
if(entryId&&$ttsSpeakingEntryId.get()===entryId){stopBtwTtsPlayback();onEnded?.();return false}
stopBtwTtsPlayback()
const myToken=_ttsPlayToken
const fastLive=Boolean(opts?.fastLive||$liveVoiceActive.get())
const rawText=isObj?String(entryOrText.answer||entryOrText.text||''):String(entryOrText||'')
if(!rawText.trim()&&!(isObj&&entryOrText.tts_audio?.path)){onEnded?.();return false}
if(entryId)$ttsSpeakingEntryId.set(entryId)
if($liveVoiceActive.get()){$liveVoicePhase.set('speaking')
$liveVoiceStatusText.set($lang.get()==='pt'?'🔊 Respondendo por voz…':'🔊 Speaking reply…')}
const resetSpeakPhase=()=>{
if(!entryId||$ttsSpeakingEntryId.get()===entryId)$ttsSpeakingEntryId.set('')
if($liveVoicePhase.get()==='speaking'){$liveVoicePhase.set($liveVoiceActive.get()?'listening':($wakeWordEnabled.get()?'wake_standby':'idle'))}}
let prebuiltUrl=isObj&&entryOrText.tts_audio?.data_url?String(entryOrText.tts_audio.data_url):''
if(!prebuiltUrl&&isObj&&entryOrText.tts_audio?.path){try{prebuiltUrl=await resolveBtwMediaDisplayUrl(entryOrText.tts_audio.path,sessionScope)}catch{}}
if(prebuiltUrl&&_SAFE_INLINE_MEDIA_URI_RE.test(prebuiltUrl)){
const ok=await _playSingleAudioUrl(prebuiltUrl,myToken)
if(myToken===_ttsPlayToken){resetSpeakPhase();onEnded?.()}
return ok}
const chunks=_prepareFastSpokenChunks(rawText,fastLive)
if(!chunks.length){resetSpeakPhase();onEnded?.();return false}
const urlPromises=chunks.map(c=>_fetchTtsChunkUrl(c,sessionScope,fastLive))
let playedAny=false
for(let i=0;i<urlPromises.length;i +=1){
if(myToken!==_ttsPlayToken)break
let u=''
try{u=await urlPromises[i]}catch{}
if(myToken!==_ttsPlayToken)break
if(u){const ok=await _playSingleAudioUrl(u,myToken);if(ok)playedAny=true}}
if(myToken===_ttsPlayToken){resetSpeakPhase();onEnded?.()}
return playedAny}
async function _float32To16kHzInt16Base64(floatSamples,inputSampleRate){try{
const pcm16=_downsampleFloat32To16kPcm16(floatSamples,inputSampleRate)
if(!pcm16)return ''
const dataUrl=await _blobToDataUrl(new Blob([pcm16.buffer],{type:'application/octet-stream'})),commaIdx=dataUrl.indexOf(',')
return commaIdx>=0?dataUrl.slice(commaIdx + 1):''
}catch{return ''}}
function _cleanupLiveVoiceHardware(){
if(_liveWebSpeech){try{_liveWebSpeech.stop()}catch{};_liveWebSpeech=null}
if(_liveTurnRetryTimer){clearTimeout(_liveTurnRetryTimer);_liveTurnRetryTimer=null}
if(_liveVadTimer){clearInterval(_liveVadTimer);_liveVadTimer=null}
if(_liveProc){try{_liveProc.onaudioprocess=null;_liveProc.disconnect()}catch{};_liveProc=null}
if(_liveMute){try{_liveMute.disconnect()}catch{};_liveMute=null}
if(_liveMediaRecorder){try{_liveMediaRecorder.ondataavailable=null;_liveMediaRecorder.onstop=null
if(_liveMediaRecorder.state!=='inactive')_liveMediaRecorder.stop()}catch{};_liveMediaRecorder=null}
if(_liveRecAudioCtx){try{void _liveRecAudioCtx.close?.().catch?.(()=>undefined)}catch{};_liveRecAudioCtx=null;_liveRecAnalyser=null}
_liveRecStream=null;_liveAudioChunks=[]}
function resumeLiveListeningAfterTurn(delayMs=70){
if(_liveTurnRetryTimer){clearTimeout(_liveTurnRetryTimer);_liveTurnRetryTimer=null}
if(!$liveVoiceActive.get())return
$liveVoicePhase.set('idle')
_liveTurnRetryTimer=setTimeout(()=>{_liveTurnRetryTimer=null;if($liveVoiceActive.get())startBtwLiveVoiceTurn()},delayMs)}
function stopBtwLiveVoice(returnToWakeStandby=true){
_cleanupLiveVoiceHardware();stopBtwTtsPlayback();$liveVoiceActive.set(false);$liveVoiceReply.set('')
_liveConvHistory=[];_liveNextCreatesBanner=true;$dictationLevel.set(0)
if(!_disposing&&_ctx&&returnToWakeStandby&&$wakeWordEnabled.get()){
$liveVoicePhase.set('wake_standby')
$liveVoiceStatusText.set($lang.get()==='pt'?'👂 Aguardando "By the way"…':'👂 Listening for "By the way"…')
void startBtwWakeListener()
}else{$liveVoicePhase.set('idle');$liveVoiceStatusText.set('');_releaseSharedMicIfIdle(false)}}
async function runBtwLiveVoiceExchange(questionText,{createBanner=false}={}){
const cleanQ=String(questionText||'').trim()
if(!cleanQ||!$liveVoiceActive.get()){resumeLiveListeningAfterTurn(80);return false}
const isPt=$lang.get()==='pt',scope=resolveFocusedIds(),histSnap=_liveConvHistory.slice(-8)
_liveConvHistory=[..._liveConvHistory,{role:'user',content:cleanQ.slice(0,900)}].slice(-12)
$liveVoicePhase.set('thinking')
$liveVoiceStatusText.set(`${createBanner?'✦ /btw':'💬 Live'}: "${cleanQ.slice(0,52)}${cleanQ.length>52?'…':''}"`)
if(createBanner){_liveNextCreatesBanner=false
const ok=await dispatchSideQuestion(cleanQ,scope,'fast',{voiceDictated:true,liveVoice:true,ttsReply:true,persistCard:true,chatHistory:histSnap})
if(!ok&&$liveVoiceActive.get())resumeLiveListeningAfterTurn(200)
return ok}
const askBody={session_id:scope.storedId||scope.runtimeId||'active',question:cleanQ,mode:'fast',lang:$lang.get()||'en',
allow_web_search:Boolean($allowWebSearch.get()),voice_dictated:true,live_voice:true,tts_reply:false,
tts_voice:$ttsVoice.get()||'coral',persist_card:false,chat_history:histSnap}
let replyTxt='',entryObj=null
try{
const res=await _callBtwVoiceApi('ask','/ask',askBody,45_000)
replyTxt=String(res?.entry?.answer||'').trim()
if(res?.ok&&replyTxt)entryObj=res.entry
}catch{}
if(!replyTxt){try{
const histLines=histSnap.map(h=> `${h.role==='user'?'User':'Assistant'}: ${h.content}`).join('\n')
const oneshot=await host.request('llm.oneshot',{session_id:scope.runtimeId||scope.storedId||undefined,task:'compression',
instructions:isPt?'Você está conversando por voz em tempo real no BTW Studio sobre a sessão atual do Hermes Agent. Responda de forma natural, direta e concisa em 2 a 3 frases curtas para leitura em voz.':'You are having a live voice conversation in BTW Studio about the active Hermes session. Reply naturally and concisely in 2-3 short spoken sentences.',
input:(histLines? `${histLines}\n` :'')+ `User: ${cleanQ}`,temperature:0.25,max_tokens:260},25_000)
replyTxt=extractOneshotText(oneshot)
}catch{}}
if(replyTxt&&$liveVoiceActive.get()){
_liveConvHistory=[..._liveConvHistory,{role:'assistant',content:replyTxt.slice(0,900)}].slice(-12)
const flatPreview=stripInlineMarkdownPreview(replyTxt,160);$liveVoiceReply.set(flatPreview)
petSay('done', `💬 ${flatPreview}`,'info',9000)
void speakBtwCardOrText(entryObj||replyTxt,scope,()=>resumeLiveListeningAfterTurn(70),{fastLive:true})
return true}
host.notify?.({kind:'warning',message:isPt?'Falha na resposta de voz Live; retomando escuta…':'Live voice reply failed; resuming listener…'})
resumeLiveListeningAfterTurn(250);return false}
function startBtwLiveVoiceTurn(){
if(!$liveVoiceActive.get()||['thinking','speaking','transcribing'].includes($liveVoicePhase.get()))return
_cleanupLiveVoiceHardware()
const isPt=$lang.get()==='pt';$liveVoicePhase.set('listening')
$liveVoiceStatusText.set(_liveNextCreatesBanner
?(isPt?'🟢 Fale sua pergunta para abrir o banner /btw (ou diga "parar")…':'🟢 Speak your question to materialize a /btw banner (or say "stop")…')
:(isPt?'🟢 Conversando Live — fale livremente (diga "by the way" p/ novo banner)…':'🟢 Live Talk active — speak freely (say "by the way" for a new banner)…'))
_acquireSharedMicStream().then(stream=>{
if(!_ctx||!$liveVoiceActive.get()||$liveVoicePhase.get()!=='listening'){_releaseSharedMicIfIdle(Boolean(!_ctx));return}
_liveRecStream=stream
const AudioCtx=window.AudioContext||window.webkitAudioContext
if(!AudioCtx){stopBtwLiveVoice(false);return}
const actx=new AudioCtx();if(actx.state==='suspended')void actx.resume().catch(()=>undefined)
const sr=actx.sampleRate||48000,src=actx.createMediaStreamSource(stream),analyser=actx.createAnalyser()
analyser.fftSize=256;analyser.smoothingTimeConstant=0.4
const proc=actx.createScriptProcessor(2048,1,1),mute=actx.createGain();mute.gain.value=0
const pcmChunks=[];let preRoll=[]
let noiseFloor=0.007,speechConfirmed=false,speechMs=0,silenceMs=0;const startedAt=Date.now()
_liveWebSpeech=_startParallelWebSpeech(resolveDictationBcp47(),(fin,inter)=>{
const liveTxt=[fin,inter].filter(Boolean).join(' ').trim()
if(liveTxt&&$liveVoicePhase.get()==='listening')$liveVoiceStatusText.set(`🎙 "${liveTxt.slice(-64)}"`)})
proc.onaudioprocess=ev=>{
try{ev.outputBuffer.getChannelData(0).fill(0)}catch{}
if(!$liveVoiceActive.get()||$liveVoicePhase.get()!=='listening')return
const inp=ev.inputBuffer.getChannelData(0),cp=new Float32Array(inp.length);cp.set(inp)
if(speechConfirmed||speechMs>0)pcmChunks.push(cp)
else{preRoll.push(cp);if(preRoll.length>10)preRoll.shift()}}
src.connect(analyser);src.connect(proc);proc.connect(mute);mute.connect(actx.destination)
_liveRecAudioCtx=actx;_liveRecAnalyser=analyser;_liveProc=proc;_liveMute=mute
const timeBuf=new Uint8Array(128)
const finishUtterance=async()=>{
if(_liveVadTimer){clearInterval(_liveVadTimer);_liveVadTimer=null}
const wsFastText=_sanitizeFastSpeechText(_liveWebSpeech?.getText?.()||'')
const captured=[...preRoll,...pcmChunks];preRoll=[];pcmChunks.length=0
_cleanupLiveVoiceHardware()
if(!$liveVoiceActive.get())return
if(!speechConfirmed&&!wsFastText){
_liveSilentCycles +=1;if(_liveSilentCycles>=10){playBtwWakeChime('stop');stopBtwLiveVoice(true);return}
$liveVoicePhase.set('idle');startBtwLiveVoiceTurn();return}
_liveSilentCycles=0;$liveVoicePhase.set('transcribing')
$liveVoiceStatusText.set(isPt?'🎙 Processando fala…':'🎙 Processing speech…')
let transcript='',isStop=false,wakeDetected=false,wakeCmd=''
if(wsFastText.length>=2){
const fastStt=await _callBtwVoiceApi('stt_transcribe','/stt/transcribe',{raw_transcript:wsFastText,language:resolveDictationBcp47()},4000).catch(()=>null)
transcript=_sanitizeFastSpeechText(fastStt?.ok&&typeof fastStt.transcript==='string'?fastStt.transcript:wsFastText);const wm=_extractClientWakeMeta(transcript);isStop=Boolean(fastStt?.is_stop_command||wm.isStop);wakeDetected=Boolean(fastStt?.wake_detected||wm.detected);wakeCmd=String(fastStt?.wake_command||wm.command||'').trim()
}else{
const wavDataUrl=await _floatChunksTo16kWavDataUrl(captured,sr)
if(wavDataUrl){try{
const sttRes=await _callBtwVoiceApi('stt_transcribe','/stt/transcribe',{data_url:wavDataUrl,mime_type:'audio/wav',language:resolveDictationBcp47()},22_000)
if(sttRes?.ok){transcript=String(sttRes.transcript||'').trim();isStop=Boolean(sttRes.is_stop_command)
wakeDetected=Boolean(sttRes.wake_detected);wakeCmd=String(sttRes.wake_command||'').trim()}
}catch{}}}
if(!$liveVoiceActive.get())return
const localMeta=_extractClientWakeMeta(transcript)
if(isStop||localMeta.isStop){
playBtwWakeChime('stop');petSay('done',isPt?'👋 Live Talk encerrado por voz.':'👋 Live Talk ended by voice.','info',4000);stopBtwLiveVoice(true);return}
if(localMeta.detected&&!wakeDetected){wakeDetected=true;wakeCmd=localMeta.command}
if(wakeDetected&&!wakeCmd){playBtwWakeChime('ready');_liveNextCreatesBanner=true;$liveVoicePhase.set('idle');startBtwLiveVoiceTurn();return}
const finalQuestion=wakeDetected?wakeCmd:transcript
if(!finalQuestion){$liveVoicePhase.set('idle');startBtwLiveVoiceTurn();return}
const makeBanner=Boolean(wakeDetected||_liveNextCreatesBanner)
if(wakeDetected)playBtwWakeChime('wake')
await runBtwLiveVoiceExchange(finalQuestion,{createBanner:makeBanner})}
_liveVadTimer=setInterval(()=>{
if(!$liveVoiceActive.get()||$liveVoicePhase.get()!=='listening'){if(_liveVadTimer){clearInterval(_liveVadTimer);_liveVadTimer=null};return}
const elapsed=Date.now()- startedAt
try{analyser.getByteTimeDomainData(timeBuf);let sumSq=0
for(let i=0;i<timeBuf.length;i +=1){const v=(timeBuf[i]- 128)/ 128;sumSq +=v * v}
const rms=Math.sqrt(sumSq / timeBuf.length),nl=Math.min(1,rms * 5.2);if(Math.abs(nl - $dictationLevel.get())>=0.04)$dictationLevel.set(nl)
const gate=Math.max(0.013,Math.min(0.044,noiseFloor * 2.25))
if(rms>gate){speechMs +=60;silenceMs=0;if(speechMs>=180)speechConfirmed=true}
else{if(!speechConfirmed)noiseFloor=noiseFloor * 0.92 + rms * 0.08
if(speechConfirmed){silenceMs +=60;if(silenceMs>=660){void finishUtterance();return}}}
}catch{}
if((!speechConfirmed&&elapsed>=12000)||elapsed>=30000)void finishUtterance()
},60)}).catch(()=>stopBtwLiveVoice(false))}
function toggleBtwLiveVoice(initialCommand='',opts={}){
if($liveVoiceActive.get()&&!initialCommand&&!opts?.fromWake){playBtwWakeChime('stop');stopBtwLiveVoice(true);return}
if(!$liveVoiceEnabled.get()){setPref($liveVoiceEnabled,true,'liveVoiceEnabled');syncBackendSettings({live_voice_enabled:true})}
stopBtwWakeListener(false);_liveSilentCycles=0;_liveConvHistory=[];$liveVoiceReply.set('');$liveVoiceActive.set(true)
void _callBtwVoiceApi('voice_wake','/voice/wake',{warm_only:true},6000).catch(()=>null)
playBtwWakeChime('wake');haptic?.('success')
const isPt=$lang.get()==='pt'
petSay('dictating',isPt?'🟢 BTW Live Talk Ativo! Pode falar…':'🟢 BTW Live Talk Active! Speak freely…','info',8000)
if(initialCommand&&String(initialCommand).trim()){_liveNextCreatesBanner=false;void runBtwLiveVoiceExchange(String(initialCommand).trim(),{createBanner:true});return}
_liveNextCreatesBanner=true;$liveVoicePhase.set('idle');startBtwLiveVoiceTurn()}
function setBtwWakeTargetMode(modeVal){
const clean=modeVal==='dictate'?'dictate':'live'
setPref($wakeTargetMode,clean,'wakeTargetMode');syncBackendSettings({wake_target_mode:clean});haptic?.('tap')}
function stopBtwWakeListener(disableSetting=false){
if(_wakeResumeCleanup){try{_wakeResumeCleanup()}catch{}_wakeResumeCleanup=null}
if(_wakeInterval){clearInterval(_wakeInterval);_wakeInterval=null}
if(_wakeProcessor){try{_wakeProcessor.onaudioprocess=null;_wakeProcessor.disconnect()}catch{};_wakeProcessor=null}
if(_wakeMuteGain){try{_wakeMuteGain.disconnect()}catch{};_wakeMuteGain=null}
if(_wakeAudioCtx){try{void _wakeAudioCtx.close?.().catch?.(()=>undefined)}catch{};_wakeAudioCtx=null;_wakeAnalyser=null}
_wakeMediaStream=null;_wakePcmRing=[];_wakeCheckInFlight=false
if(disableSetting){$wakeWordEnabled.set(false);if(!$liveVoiceActive.get()){$liveVoicePhase.set('idle');$liveVoiceStatusText.set('')};_releaseSharedMicIfIdle(false)}}
async function startBtwWakeListener(){
if(_disposing||!_ctx||!$wakeWordEnabled.get()||$liveVoiceActive.get()||$dictationStatus.get()==='recording')return
stopBtwWakeListener(false)
const isPt=$lang.get()==='pt',phraseLabel=$wakePhrase.get()||'by the way'
const targetLabel=$wakeTargetMode.get()==='dictate'?(isPt?'Ditado':'Dictate'):'Live Talk'
$liveVoicePhase.set('wake_standby');$liveVoiceStatusText.set(`👂 Wake "${phraseLabel}" → ${targetLabel}…`)
void _callBtwVoiceApi('voice_wake','/voice/wake',{warm_only:true,custom_phrase:phraseLabel},6000).catch(()=>null)
try{
const stream=await _acquireSharedMicStream()
if(_disposing||!_ctx||!$wakeWordEnabled.get()||$liveVoiceActive.get()){_releaseSharedMicIfIdle(Boolean(_disposing||!_ctx));return}
_wakeMediaStream=stream
const AudioCtx=window.AudioContext||window.webkitAudioContext
if(!AudioCtx){_wakeMediaStream=null;_releaseSharedMicIfIdle(false);return}
const actx=new AudioCtx(),source=actx.createMediaStreamSource(stream),analyser=actx.createAnalyser()
analyser.fftSize=256;source.connect(analyser)
const proc=actx.createScriptProcessor(2048,1,1),muteGain=actx.createGain();muteGain.gain.value=0
const sr=actx.sampleRate||48000,preRollMax=Math.floor(sr * 0.65),speechMax=Math.floor(sr * 6.2)
let preRollChunks=[],preRollLen=0,speechChunks=[],speechLen=0,speechMs=0,silenceAfterSpeechMs=0,noiseFloor=0.006,readyToFlush=false
proc.onaudioprocess=ev=>{
try{ev.outputBuffer.getChannelData(0).fill(0)}catch{}
if(!$wakeWordEnabled.get()||$liveVoiceActive.get()||$dictationStatus.get()==='recording')return
const input=ev.inputBuffer.getChannelData(0);let sumSq=0
for(let i=0;i<input.length;i +=2)sumSq +=input[i]* input[i]
const rms=Math.sqrt(sumSq /(input.length / 2)),blockMs=(input.length / sr)* 1000,copy=new Float32Array(input.length);copy.set(input)
const gate=Math.max(0.012,Math.min(0.042,noiseFloor * 2.2))
if(rms>gate){
if(speechChunks.length===0&&preRollChunks.length>0){
for(const pr of preRollChunks){speechChunks.push(pr);speechLen +=pr.length};preRollChunks=[];preRollLen=0}
speechChunks.push(copy);speechLen +=copy.length;speechMs +=blockMs;silenceAfterSpeechMs=0
while(speechLen>speechMax&&speechChunks.length>1)speechLen -=speechChunks.shift().length
if(speechMs>=4800)readyToFlush=true
}else if(speechChunks.length>0){
speechChunks.push(copy);speechLen +=copy.length;silenceAfterSpeechMs +=blockMs
if(speechMs>=220&&silenceAfterSpeechMs>=320)readyToFlush=true
else if(speechMs<220&&silenceAfterSpeechMs>=280){speechChunks=[];speechLen=0;speechMs=0;silenceAfterSpeechMs=0}
}else{noiseFloor=noiseFloor * 0.94 + rms * 0.06;preRollChunks.push(copy);preRollLen +=copy.length
while(preRollLen>preRollMax&&preRollChunks.length>1)preRollLen -=preRollChunks.shift().length}}
source.connect(proc);proc.connect(muteGain);muteGain.connect(actx.destination)
_wakeAudioCtx=actx;_wakeAnalyser=analyser;_wakeProcessor=proc;_wakeMuteGain=muteGain
if(actx.state==='suspended'){void actx.resume().catch(()=>undefined)
if(typeof document!=='undefined'){
const unlock=()=>{if(_wakeAudioCtx?.state==='suspended')void _wakeAudioCtx.resume().catch(()=>undefined)}
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true})
_wakeResumeCleanup=()=>{document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock)}}}
_wakeInterval=setInterval(async()=>{
if(!$wakeWordEnabled.get()||$liveVoiceActive.get()||$dictationStatus.get()==='recording')return
if(actx.state==='suspended'){void actx.resume().catch(()=>undefined);return}
if(_wakeCheckInFlight||!readyToFlush||speechLen<sr * 0.36)return
readyToFlush=false;const snapChunks=speechChunks.slice(),snapTotal=speechLen,snapVoicedMs=speechMs
if(speechMs>=4800&&silenceAfterSpeechMs<320){
const keepSamples=Math.floor(sr * 1.25),tail=[];let tailLen=0
for(let i=snapChunks.length - 1;i>=0&&tailLen<keepSamples;i -=1){tail.unshift(snapChunks[i]);tailLen +=snapChunks[i].length}
speechChunks=tail;speechLen=tailLen;speechMs=700;silenceAfterSpeechMs=0
}else{speechChunks=[];speechLen=0;speechMs=0;silenceAfterSpeechMs=0}
const merged=new Float32Array(snapTotal);let off=0
for(const c of snapChunks){merged.set(c,off);off +=c.length}
_wakeCheckInFlight=true
try{
const pcmB64=await _float32To16kHzInt16Base64(merged,sr);if(!pcmB64)return
const res=await _callBtwVoiceApi('voice_wake','/voice/wake',{pcm_b64:pcmB64,sample_rate:16000,
custom_phrase:$wakePhrase.get()||'by the way',transcribe_on_wake:true},12_000)
if(res?.ok&&res.detected&&$wakeWordEnabled.get()&&!$liveVoiceActive.get()){
speechChunks=[];speechLen=0;speechMs=0;silenceAfterSpeechMs=0
const cmd=String(res.command||'').trim(),wMode=$wakeTargetMode.get()==='dictate'?'dictate':'live'
requestOpenStudio({tab:'ask'})
if(wMode==='dictate'){playBtwWakeChime('wake');haptic?.('success')
if(cmd){const prevD=String($draftQuestion.get()||'').trim();_lastVoiceDictatedFlag=true
$draftQuestion.set([prevD,cmd].filter(Boolean).join(' ').trim())
petSay('done',$lang.get()==='pt'?'🎙 [Wake → Ditado] Texto inserido!':'🎙 [Wake → Dictate] Text inserted!','info',4500)
}else{toggleBtwDictation('main',null,null,{fromWake:true})}
}else{toggleBtwLiveVoice(cmd,{fromWake:true})}}
}catch{}finally{_wakeCheckInFlight=false}
},140)
}catch{stopBtwWakeListener(true)
host.notify?.({kind:'warning',message:isPt?'Permissão de microfone negada ou dispositivo de áudio indisponível para o Wake-word.':'Microphone permission denied or audio input device unavailable for Wake-word.'})}}
function toggleBtwWakeWord(nextVal=null){
const target=typeof nextVal==='boolean'?nextVal:!$wakeWordEnabled.get()
setPref($wakeWordEnabled,target,'wakeWordEnabled');syncBackendSettings({wake_word_enabled:target,wake_target_mode:$wakeTargetMode.get()});haptic?.('tap')
if(target){const isPt=$lang.get()==='pt',p=$wakePhrase.get()||'by the way',mLbl=$wakeTargetMode.get()==='dictate'?(isPt?'Ditado':'Dictate'):'Live Talk'
petSay('wake',isPt? `👂 Wake "${p}" → ${mLbl} ativado!` : `👂 Wake "${p}" → ${mLbl} armed!`,'info',5000);void startBtwWakeListener()
}else{stopBtwWakeListener(true)}}
function addLocalLesson({cue,lesson,evidence='',scope='INV',lever='C6',domain='global',id=''}){
const item={id:id|| `exp_${Date.now().toString(36)}`,created_at:Date.now()/ 1000,cue:String(cue||'').trim().slice(0,240),
lesson:String(lesson||'').trim().slice(0,600),evidence:String(evidence||'manual').trim().slice(0,300),
scope:scope==='DOM'?'DOM':'INV',lever:lever||'C6',domain:String(domain||'global'),verdict:'helped'}
if(!item.lesson)return null
const prev=$localLessons.get()||[]
if(prev.some(x=>x.id===item.id))return item
const next=[item,...prev].slice(0,120)
$localLessons.set(next)
persistLocalRsi({lessons:next})
return item}
function removeLocalLesson(id){
const prev=$localLessons.get()||[]
const next=id==='__all__'?[]:prev.filter(x=>x.id!==id)
$localLessons.set(next)
persistLocalRsi({lessons:next})}
function openSteerProbe(ids,text,meta={}){
const sid=meta.targetSessionId||ids?.storedId||ids?.runtimeId||'active'
const probeId= `probe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
const localProbe={id:probeId,session_id:sid,source:meta.source||'manual',text:String(text||'').slice(0,400),
target_kind:meta.targetKind||'',preset_id:meta.presetId||'',opened_at:Date.now()/ 1000,status:'open',verdict:'',
reason:'Measuring Δτ on next 3 tool calls…'}
const nextProbes=[localProbe,...($localProbes.get()||[])].slice(0,60)
$localProbes.set(nextProbes)
persistLocalRsi({probes:nextProbes})
if(!_rest||!sid)return
void _rest('/rsi/probe',{method:'POST',body:{probe_id:probeId,session_id:sid,text:String(text||'').slice(0,1200),
source:meta.source||'manual',target_kind:meta.targetKind||'',preset_id:meta.presetId||'',entry_id:meta.entryId||''},
timeoutMs:8000}).then(res=>{if(res?.ok&&res.probe?.id){
const updated=($localProbes.get()||[]).map(p=>(p.id===probeId?{...localProbe,...res.probe}:p))
$localProbes.set(updated)
persistLocalRsi({probes:updated})}}).catch(()=>undefined)}
async function synthesizeSteerCommand({sessionId='',instruction='',cardQuestion='',cardAnswer='',targetType='main',
subagentId='',subagentGoal='',mode='fast'
}){
const inst=String(instruction||'').trim()
if(!inst)return{ok:false,command:''}
if(_rest){try{
const res=await _rest('/steer/synth',{method:'POST',body:{session_id:sessionId,instruction:inst,card_question:cardQuestion,
card_answer:cardAnswer,target_type:targetType,subagent_id:subagentId,subagent_goal:subagentGoal,mode},timeoutMs:45_000})
if(res?.ok&&res.command)return res
}catch{}}
const cleanInst=inst.replace(TEMPLATE_BRACES_RE,'').trim()||inst
const snippet=cardAnswer
? `\n\n[Context from /btw "${cardQuestion}"]: ${String(cardAnswer).replace(/\s+/g,' ').trim().slice(0,380)}` :''
return{ok:true,command: `${cleanInst}${snippet}`,engine:'deterministic'}}
async function launchSubagentViaRest({goal,context='',model='',sessionId='',parentSessionId=''}){
const cleanGoal=String(goal||'').trim()
if(!cleanGoal||(!_rest&&typeof host?.request!=='function'))return null
const scope=resolveFocusedIds()
const parentSid=parentSessionId||sessionId||scope.parentStoredId||scope.storedId||scope.parentRuntimeId||scope.runtimeId||'active'
const sid=sessionId||parentSid
const strings=t()
const reqBody={session_id:sid,parent_session_id:parentSid,goal:cleanGoal,context:String(context||'').trim(),model:String(model||'').trim()}
try{
let res=null
if(typeof host?.request==='function'){try{res=await host.request(`plugin.${ID}.subagent_launch`,reqBody)}catch{res=null}}
if(!res?.ok&&_rest){res=await _rest('/subagents/launch',{method:'POST',body:reqBody,timeoutMs:20_000})}
if(res?.ok&&res.subagent_id){haptic?.('success')
host.notify?.({kind:'info',message:strings.subagentLaunchedNotify(res.subagent_id)})
openSteerProbe(scope, `[spawn_subagent:${res.subagent_id}] ${cleanGoal}`,{source:'subagent_spawn',targetSessionId:res.subagent_id})
try{queryClient?.invalidateQueries?.({queryKey:[ID]})
}catch{}
void refreshSessionBadges()
void speakTelemetry(sid,'subagent',{title:cleanGoal,subagent_id:res.subagent_id})
return res}
if(res?.error){host.notify?.({kind:'warning',message:String(res.error)})}
}catch{}
return null}
async function steerSubagentSession(subagentId,subagentTitle,steerText,parentScope=null,onCloseSurface=null){
const text=String(steerText||'').trim()
const subId=String(subagentId||'').trim()
if(!text||!subId)return false
const scope=parentScope||resolveFocusedIds()
const parentRuntimeSid=scope.parentRuntimeId||scope.runtimeId||''
const parentStoredSid=scope.parentStoredId||scope.storedId||parentRuntimeSid
const strings=t()
if(parentRuntimeSid&&typeof host?.request==='function'){try{
const res=await host.request('subagent.steer',{session_id:parentRuntimeSid,subagent_id:subId,text})
if(res?.status==='queued'){haptic?.('success')
host.notify?.({kind:'info',message:strings.subagentSteerSentNotify(subagentTitle||subId)})
openSteerProbe(scope, `[subagent:${subId}] ${text}`,{source:'subagent',targetSessionId:subId})
return true}
}catch{}}
if(typeof host?.request==='function'){try{
const rpcRes=await host.request(`plugin.${ID}.subagent_control`,{subagent_id:subId,action:'steer',text,session_id:parentStoredSid})
if(rpcRes?.ok){haptic?.('success')
host.notify?.({kind:'info',message:strings.subagentSteerSentNotify(subagentTitle||subId)})
openSteerProbe(scope, `[subagent:${subId}] ${text}`,{source:'subagent',targetSessionId:subId})
return true}
}catch{}}
if(_rest){try{
const restRes=await _rest('/subagents/control',{method:'POST',body:{subagent_id:subId,action:'steer',text,
session_id:parentStoredSid},timeoutMs:12_000})
if(restRes?.ok){haptic?.('success')
host.notify?.({kind:'info',message:strings.subagentSteerSentNotify(subagentTitle||subId)})
openSteerProbe(scope, `[subagent:${subId}] ${text}`,{source:'subagent',targetSessionId:subId})
return true}
}catch{}}
const fallbackDirective= `[Regarding Subagent "${subagentTitle||subId}" (${subId})]: ${text}`
return steerActiveSession(fallbackDirective,scope,onCloseSurface,{source:'subagent_fallback'})}
async function steerActiveSession(steerText,sessionScope=null,onCloseSurface=null,meta={}){
const text=String(steerText||'').trim()
if(!text)return false
const ids=sessionScope||resolveFocusedIds()
const strings=t()
const runtimeSid=ids.runtimeId||resolveFocusedIds().runtimeId
const busyMap=host.state?.busyBySession?.get?.()||{}
const isLiveBusy=Boolean((runtimeSid&&busyMap[runtimeSid])||
(runtimeSid&&runtimeSid===host.state?.focusedSessionId?.get?.()&&host.state?.busy?.get?.())||ids.busy)
if((meta?.source==='alert'||meta?.source==='anomaly')&&meta?.targetKind==='error_streak'){
const livePulse=$livePulseBySession.get()[ids.key]
if(livePulse&&Number(livePulse.consecutive_errors||0)===0&&!isLiveBusy){haptic?.('success')
host.notify?.({kind:'info',message:strings.steerObsoleteRecoveredNotify})
return true}}
if(runtimeSid&&isLiveBusy){try{
const res=await host.request('session.steer',{session_id:runtimeSid,text})
if(res?.status==='queued'||res?.status==='accepted'){haptic?.('success')
host.notify?.({kind:'info',message:strings.steeredNotify})
openSteerProbe(ids,text,meta)
return true}
}catch{}}
const formatted= `> **[/btw steer]** ${text.split('\n').join('\n> ')}\n\n`
const targetSid=runtimeSid||ids.storedId||null
const ok=await host.composer?.insertText?.(targetSid,formatted,{mode:'block'})
if(ok){host.composer?.focus?.(targetSid)
onCloseSurface?.()
closeAllStudioSurfaces()
host.notify?.({kind:'info',message:strings.insertedNotify})
return true}
await writeClipboardText(text)
host.notify?.({kind:'info',message:strings.copiedNotify})
return false}
function splitPathLeaf(fp){
const norm=String(fp||'').replace(/\\/g,'/').replace(/(?<!\/)\/+$/,'')
const parts=norm.split('/').filter(Boolean)
const leaf=parts[parts.length - 1]||norm
const parent=parts.length>=2?parts[parts.length - 2]:''
return{leaf,parent,full:String(fp||'')}}
function formatRelativeWorkspacePath(fp,cwd=''){
const normFp=String(fp||'').replace(/\\/g,'/').replace(/(?<!\/)\/+$/,'')
const normCwd=String(cwd||'').replace(/\\/g,'/').replace(/(?<!\/)\/+$/,'')
const{leaf,parent}=splitPathLeaf(normFp)
if(normCwd&&normFp.toLowerCase().startsWith(normCwd.toLowerCase()+ '/')){
const rel=normFp.slice(normCwd.length + 1)
const dir=rel.includes('/')?rel.slice(0,rel.lastIndexOf('/')+ 1):'./'
return{leaf,relDir:dir,isExternal:false,full:normFp}}
return{leaf,relDir:parent? `${parent}/` :'./',isExternal:Boolean(normCwd&&/^[a-zA-Z]:\/|^\//.test(normFp)),
full:normFp}}
function formatCleanTerminalCommand(rawCmd,cwd=''){
let s=String(rawCmd||'').trim()
if(!s)return ''
s=s.replace(/^cd\s+(?:"[^"]+"|'[^']+'|[^\s&;]+)\s*(?:&&|;)\s*/i,'')
s=s.replace(/^(?:[A-Z0-9_]+=(?:"[^"]*"|'[^']*'|[^\s]+)\s+)+/,'')
if(cwd){
const normCwd=String(cwd).replace(/\\/g,'/').replace(/(?<!\/)\/+$/,'')
if(normCwd.length>6){s=s.split(normCwd + '/').join('./').split(normCwd).join('.')}}
return s.trim()||String(rawCmd||'').trim()}
function cleanSubagentTitle(rawTitle,replyHint=''){
const combined= `${String(replyHint||'').slice(0,260)}\n${String(rawTitle||'').slice(0,340)}`
const mJudge=combined.match(/\b(Juiz\s*0?\d+|JUIZ\s*0?\d+|Judge\s*0?\d+|Head\s+Judge)\b(?:[^\n:—–-]*[—–:-]\s*([^(\n]{3,24}))?/i)
if(mJudge){
const jName=mJudge[1].trim().replace(/\b\w/g,c=>c.toUpperCase())
const jFocus=String(mJudge[2]||'').split('&')[0].split(',')[0].trim()
return jFocus&&jFocus.length<=16? `${jName} · ${jFocus}` :jName}
const s=String(rawTitle||'')
.replace(/^subagent\s*:\s*/i,'')
.replace(/^\s*\d+[.)]\s*/,'')
.replace(/(?<!\s)\s*\.\.$/,'…')
.trim()
if(!s)return 'Hermes Bot'
if(s.length<=28&&!s.includes('\n'))return s
const stripped=s
.replace(/^(?:please\s+|por\s+favor\s+)?(?:concisely\s+|briefly\s+|implacavelmente\s+|tecnicamente\s+)?(?:analise|audite|verifique|inspecione|execute|implemente|analyze|audit|verify|inspect|check|review|summarize|run|test)\s+(?:tecnicamente\s+|implacavelmente\s+)?(?:todos\s+os\s+|todas\s+as\s+|tudo\s+o\s+que\s+|o\s+estado\s+atual\s+d[eo]\s+|the\s+|all\s+)?/i,'')
.replace(/`/g,'')
.split('\n')[0]
.trim()
const words=stripped.split(/\s+/).map(w=>w.replace(/^[,.:;()[\]{}]+/,'').replace(/(?<![,.:;()[\]{}])[,.:;()[\]{}]+$/,'')).filter(Boolean)
const short=words.slice(0,4).join(' ')||s.slice(0,24)
return short.length>28? `${short.slice(0,26)}…` :short.charAt(0).toUpperCase()+ short.slice(1)}
function stripRedundantKaomoji(rawText){
return String(rawText||'')
.replace(/\s*💖\s*\(ง\s*•̀_•́\)ง\s*✨\s*/g,'')
.replace(/\s*✨\s*(?:Bora crescer juntinhos~|Growing together with you~)\s*\(ง\s*•̀_•́\)ง\s*🌸\s*/g,'')
.trim()}
function addBtwAttachment(att){if(!att||typeof att!=='object')return
const cur=$btwAttachments.get()||[]
const id=String(att.id|| `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`)
const deduped=cur.filter(x=>x.id!==id&&!(x.kind===att.kind&&x.label===att.label&&att.label))
$btwAttachments.set([...deduped,{...att,id}].slice(-8))}
function removeBtwAttachment(id){$btwAttachments.set(($btwAttachments.get()||[]).filter(x=>x.id!==id))}
function clearBtwAttachments(){$btwAttachments.set([])}
function inferAudioMimeFromName(fileName,fallbackType=''){
const rawType=String(fallbackType||'').trim().toLowerCase()
if(rawType.startsWith('audio/'))return rawType
const lower=String(fileName||'').toLowerCase()
if(lower.endsWith('.mp3'))return 'audio/mpeg'
if(lower.endsWith('.wav'))return 'audio/wav'
if(lower.endsWith('.m4a'))return 'audio/mp4'
if(lower.endsWith('.ogg')||lower.endsWith('.opus'))return 'audio/ogg'
if(lower.endsWith('.flac'))return 'audio/flac'
if(lower.endsWith('.aac'))return 'audio/aac'
if(lower.endsWith('.webm'))return 'audio/webm'
return rawType||'audio/mpeg'}
function readFileToBtwAttachment(file){
return new Promise(resolve=>{if(!file)return resolve(null)
const fileName=String(file.name||'')
const fileType=String(file.type||'').toLowerCase()
const filePath=file.path?String(file.path):''
const fileSize=Number(file.size||0)
const kb=Math.max(1,Math.round(fileSize / 1024))
const sizeLabel=kb>=1024? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
const isSvgFile=/\.svg$/i.test(fileName)||fileType.includes('svg')
const isImg=!isSvgFile&&(fileType.startsWith('image/')||/\.(png|jpe?g|webp|gif|bmp|ico|tiff?|avif)$/i.test(fileName))
const isAudio=!isImg&&(fileType.startsWith('audio/')||/\.(mp3|wav|m4a|ogg|opus|flac|aac|webm|wma|amr)$/i.test(fileName))
const isVideo=!isImg&&!isAudio&&(fileType.startsWith('video/')||/\.(mp4|mov|mkv|avi|wmv|flv|m4v)$/i.test(fileName))
const isDoc=!isImg&&!isAudio&&!isVideo&&
/\.(pdf|docx?|docm|xlsx?|xlsm|xlsb|pptx?|pptm|ppsx?|ppsm|pot|odt|ods|odp|epub|rtf|ipynb|db|sqlite3?|zip)$/i.test(fileName)
if(isAudio){
const mimeType=inferAudioMimeFromName(fileName,fileType)
if(fileSize>0&&fileSize<=25 * 1024 * 1024&&typeof FileReader!=='undefined'){
const audioReader=new FileReader()
audioReader.onload=()=>{
const dataUrl=String(audioReader.result||'')
resolve({id: `audio_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:'audio',icon:'🔊',
label:fileName||'audio.mp3',detail: `${sizeLabel} · ${mimeType}`,path:filePath,size:fileSize,mime_type:mimeType,
data_url:dataUrl})}
audioReader.onerror=()=>resolve({id: `audio_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:'audio',
icon:'🔊',label:fileName||'audio.mp3',detail: `${sizeLabel} · ${mimeType}`,path:filePath,size:fileSize,mime_type:mimeType})
audioReader.readAsDataURL(file)
return}
return resolve({id: `audio_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:'audio',icon:'🔊',
label:fileName||'audio.mp3',detail: `${sizeLabel} · ${mimeType}`,path:filePath,size:fileSize,mime_type:mimeType})}
const isBinaryMedia=!isImg&&(isVideo||isDoc||/\.(tar|gz|7z|rar|exe|dll)$/i.test(fileName)||fileSize>2 * 1024 * 1024)
if(isBinaryMedia){
const extUpper=(fileName.split('.').pop()||'').toUpperCase()
const kindVal=isVideo?'video':isDoc?'document':'file'
if(fileSize>0&&fileSize<=25 * 1024 * 1024&&typeof FileReader!=='undefined'){
const binReader=new FileReader()
binReader.onload=()=>{
const dataUrl=String(binReader.result||'')
resolve({id: `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:kindVal,label:fileName||'document',
detail:extUpper? `${sizeLabel} · ${extUpper}` :sizeLabel,path:filePath,size:fileSize,format:extUpper,
mime_type:fileType||undefined,data_url:dataUrl})}
binReader.onerror=()=>resolve({id: `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:kindVal,
label:fileName||'document',detail:extUpper? `${sizeLabel} · ${extUpper}` :sizeLabel,path:filePath,size:fileSize,
format:extUpper})
binReader.readAsDataURL(file)
return}
return resolve({id: `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:kindVal,
label:fileName||'media',detail:extUpper? `${sizeLabel} · ${extUpper}` :sizeLabel,path:filePath,size:fileSize,format:extUpper,
content: `[Attached binary/media file: ${fileName||'file'} (${fileType||extUpper||'binary'}, ${kb} KB)${filePath? ` at ${filePath}` :''}]`
})}
const reader=new FileReader()
reader.onload=()=>{
const res=String(reader.result||'')
if(isImg){resolve({id: `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:'image',
label:fileName||'image.png',detail:sizeLabel,path:filePath,size:fileSize,mime_type:fileType||'image/png',data_url:res,
thumbnail_url:res})
}else{
const text=res.slice(0,24000)
const lines=text.split('\n').length
resolve({id: `file_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,kind:'file',label:fileName||'file.txt',
detail: `${lines} lines · ${Math.max(1,Math.round((fileSize||text.length)/ 1024))} KB`,path:filePath,
size:fileSize||text.length,lines,content:text})}}
reader.onerror=()=>resolve(null)
if(isImg)reader.readAsDataURL(file)
else reader.readAsText(file)})}
async function handleDroppedFiles(fileListOrArray,maxFiles=6){
const files=Array.from(fileListOrArray||[]).filter(Boolean).slice(0,maxFiles)
if(!files.length)return[]
const added=[]
for(const f of files){
const att=await readFileToBtwAttachment(f)
if(att){addBtwAttachment(att)
added.push(att)}}
return added}
function normalizeHostComposerAttachments(rawList){if(!Array.isArray(rawList)||rawList.length===0)return[]
return rawList
.filter(Boolean)
.slice(0,8)
.map((a,idx)=>{
const rawName=String(a.label||a.path||'')
let kind=['file','folder','image','audio','video','terminal','url','pasted','session'].includes(a.kind)
?(a.kind==='terminal'?'pasted':a.kind):'file'
if(/\.svg$/i.test(rawName))kind='file'
else if(kind==='file'&&/\.(mp3|wav|m4a|ogg|opus|flac|aac|webm)$/i.test(rawName)){kind='audio'
}else if(kind==='file'&&/\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(rawName)){kind='image'
}else if(kind==='file'&&/\.(mp4|mov|mkv|avi)$/i.test(rawName)){kind='video'}
const safeHostThumb=kind==='image'&&_SAFE_INLINE_MEDIA_URI_RE.test(a.thumbnailUrl||a.previewUrl||'')?(a.thumbnailUrl||a.previewUrl||''):''
const safeHostData=kind!=='file'&&_SAFE_INLINE_MEDIA_URI_RE.test(a.previewUrl||a.thumbnailUrl||'')?(a.previewUrl||a.thumbnailUrl||''):''
return{id:String(a.id|| `host_att_${idx}_${Date.now().toString(36)}`),kind,icon:kind==='audio'?'🔊':undefined,
label:String(a.label||a.path||kind),detail:String(a.detail||a.refText||a.path||''),path:a.path?String(a.path):'',
content:a.titlePreview?String(a.titlePreview):'',data_url:safeHostData,
thumbnail_url:safeHostThumb}})}
const _activeMediaPolls=new Map()
function pollPendingBtwMedia(sessionKey,sessionId,entryId){if(!entryId)return
const pollKey= `${sessionKey}:${entryId}`
if(_activeMediaPolls.has(pollKey))return
let attempts=0
const maxAttempts=110
const timer=setInterval(async()=>{attempts +=1
if(attempts>maxAttempts){clearInterval(timer)
_activeMediaPolls.delete(pollKey)
return}
try{
let res=null
try{res=await host.request('plugin.btw-studio.entry_status',{session_id:sessionId||'',entry_id:entryId},8000)}catch{}
if((!res||!res.entry)&&_rest){
res=await _rest('/presets/resolve',{method:'POST',
body:{session_id:sessionId||'',prompt: `__BTW_ENTRY_STATUS__:${sessionId||''}:${entryId}` },timeoutMs:8000})}
if(res?.ok&&res.entry){
const stillPending=Boolean(res.entry.media_pending)||
(Array.isArray(res.entry.media_items)&&res.entry.media_items.some(m=>m&&m.status==='generating'))
upsertEntry(sessionKey,res.entry,!stillPending)
if(!stillPending){clearInterval(timer)
_activeMediaPolls.delete(pollKey)
haptic?.('success')}}
}catch{}
},2200)
_activeMediaPolls.set(pollKey,timer)}
async function dispatchSideQuestion(questionText,explicitIds=null,requestedMode=null,opts={}){
const rawQ=String(questionText||'').trim()
const passedAtts=Array.isArray(opts.attachments)?opts.attachments:($btwAttachments.get()||[])
if(!rawQ&&passedAtts.length===0)return false
const question=rawQ||(passedAtts[0]?.label? `Analyze ${passedAtts[0].label}` :'Analyze attached context')
if(!opts.keepAttachments)clearBtwAttachments()
const ids=explicitIds||resolveFocusedIds()
const key=ids.key
const sessionParam=ids.runtimeId||ids.storedId
const mode=String(requestedMode||$askMode.get()||'fast')
const strings=t()
const follow=opts.parentId?{id:opts.parentId}:$followUpParent.get()
const parentId=follow?.id||''
const presetId=String(opts.presetId||'')
if(!sessionParam){
const pt=$lang.get()==='pt'
const onboardingEntry={id: `btw_onboard_${Date.now().toString(36).slice(-5)}`,question,answer:pt
? `### ✦ Diagnóstico Inicial ($0 · Sessão Nova)\n- **Status:** Sessão recém-aberta (aguardando 1ª mensagem para persistir no \`state.db?mode=ro\`).\n- **INV (Workflow):** O canal lateral \`/btw\` está pronto para responder sem tocar no transcript.\n- **DOM (Workspace):** Perfil ativo \`${ids.profile||'default'}\` · Modelo \`${shortModelName(ids.model)||'default'}\`.\n- **Alavanca Harness²:** Experimente clicar em **⚡ Comandar / Steer** abaixo para sintetizar um comando e inseri-lo no chat principal!`
: `### ✦ Onboarding Flight-Check ($0 · Fresh Session)\n- **Status:** Newly opened chat (waiting for the first turn to flush to \`state.db?mode=ro\`).\n- **INV (Workflow):** Your \`/btw\` side-channel is armed and never pollutes the conversation transcript.\n- **DOM (Workspace):** Active profile \`${ids.profile||'default'}\` · Model \`${shortModelName(ids.model)||'default'}\`.\n- **Harness² Lever:** Click **⚡ Command / Steer** below right now to test AI command synthesis into your main composer!`,
source:'btw-studio',model:'$0 Flight-Check',duration_ms:8,created_at:Date.now()/ 1000,preset_id:presetId,attachments:passedAtts
}
if(presetId)recordLocalPresetRun(presetId)
haptic?.('success')
upsertEntry(key,onboardingEntry,true)
return true}
if(follow)$followUpParent.set(null)
if(presetId)recordLocalPresetRun(presetId)
const startedAt=Date.now()
const tempTaskId= `btw_${startedAt.toString(36).slice(-5)}`
const wasVoiceDictated=Boolean(opts.voiceDictated||_lastVoiceDictatedFlag)
const isLiveVoiceTurn=Boolean(opts.liveVoice||$liveVoiceActive.get())
const wantTtsReply=Boolean(opts.ttsReply||isLiveVoiceTurn||(wasVoiceDictated&&$ttsAutoSpeak.get()))
_lastVoiceDictatedFlag=false
$pendingBySession.set({...$pendingBySession.get(),
[key]:{taskId:tempTaskId,question,startedAt,mode,parentId,attachments:passedAtts,voiceDictated:wasVoiceDictated,liveVoice:isLiveVoiceTurn,ttsReply:wantTtsReply}})
petClear('done')
petSay('thinking',strings.petThinking,'wait',30000)
const activePinnedTools=Array.isArray(opts.forcedTools)?opts.forcedTools:[...($pinnedBtwTools.get()||[])]
if(!opts.keepPinnedTools&&activePinnedTools.length>0)setPref($pinnedBtwTools,[],'pinnedTools')
if(_settingsSyncTimer&&_rest){cancelTimer(_settingsSyncTimer);_settingsSyncTimer=null;void _rest('/settings',{method:'POST',body:$backendSettings.get()||{},timeoutMs:8000}).catch(()=>undefined)}
const persistCard=opts.persistCard!==false
const curPers=$personality.get()||'balanced'
const askBody={session_id:ids.storedId||ids.runtimeId,question,mode,parent_id:parentId,
preset_id:presetId,lang:$lang.get()||'en',personality:curPers,custom_persona:curPers==='custom'?$customPersona.get():undefined,attachments:passedAtts,allow_web_search:Boolean($allowWebSearch.get()),
allow_media_tools:Boolean($allowMediaTools.get()),
tool_requests:opts.toolRequests||undefined,forced_tools:activePinnedTools.length>0?activePinnedTools:undefined,
voice_dictated:wasVoiceDictated,live_voice:isLiveVoiceTurn,
tts_reply:false,tts_voice:$ttsVoice.get()||'coral',async_media:true,
persist_card:persistCard,chat_history:opts.chatHistory||undefined}
try{
const res=await _callBtwVoiceApi('ask','/ask',askBody,95_000)
if(res&&res.ok&&res.entry){
if(res.tts_audio&&!res.entry.tts_audio)res.entry.tts_audio=res.tts_audio
if(isLiveVoiceTurn&&res.entry.answer){
_liveConvHistory=[..._liveConvHistory,{role:'assistant',content:String(res.entry.answer).slice(0,900)}].slice(-12)
$liveVoiceReply.set(stripInlineMarkdownPreview(res.entry.answer,160))}
if(wasVoiceDictated&&res.entry.title&&!String(res.entry.title).startsWith('[STT:')&&!String(res.entry.title).startsWith('[LIVE:')){
res.entry.title= `${isLiveVoiceTurn?'[LIVE: By The Way]':($lang.get()==='pt'?'[STT: Transcrito]':'[STT: Transcribed]')} ${res.entry.title}`
res.entry.voice_dictated=true}
const hasMedia=Boolean(res.entry.media_pending)||(Array.isArray(res.entry.media_items)&&res.entry.media_items.length>0)||
/MEDIA:/i.test(String(res.entry.answer||''))
if(persistCard){
if(hasMedia||isLiveVoiceTurn){$bannerExpandedBySession.set({...$bannerExpandedBySession.get(),[key]:true})}
haptic?.('success')
upsertEntry(key,res.entry,true)
if(res.media_pending||res.entry.media_pending||
(Array.isArray(res.entry.media_items)&&res.entry.media_items.some(m=>m&&m.status==='generating'))
){pollPendingBtwMedia(key,res.entry.session_id||ids.storedId||ids.runtimeId,res.entry.id)}
}else{
const pend={...$pendingBySession.get()};delete pend[key];$pendingBySession.set(pend);petClear('thinking')}
if(wantTtsReply||isLiveVoiceTurn){
void speakBtwCardOrText(res.entry,ids,()=>{
if($liveVoiceActive.get())resumeLiveListeningAfterTurn(70)},{fastLive:isLiveVoiceTurn})}
return true}
}catch{}
const attFallbackSuffix=passedAtts.length>0?'\n\n[Attached context]: ' +
passedAtts
.map(a=> `${a.kind}:${a.label}${a.content? ` (${String(a.content).slice(0,600)})` :a.detail? ` (${a.detail})` :''}`)
.join(' | '):''
const fallbackText=(question.replace(TEMPLATE_BRACES_RE,'').replace(/\s{2,}/g,' ').trim()||question)+ attFallbackSuffix
const rpcSessionId=(ids.isSubagentInspect&&ids.parentRuntimeId)?ids.parentRuntimeId:(ids.runtimeId||ids.storedId)
if($interceptSlashBtw.get()!==false){
try{
const isPt=$lang.get()==='pt'
const oneshot=await host.request('llm.oneshot',{session_id:rpcSessionId||undefined,task:mode==='deep'?undefined:'compression',
instructions:isPt
?'Você é o BTW Studio (/btw), canal lateral silencioso do Hermes Agent. Responda de forma objetiva, técnica e em Markdown estruturado sem modificar o chat principal.'
:'You are BTW Studio (/btw), the silent side-channel for Hermes Agent. Answer concisely and accurately in Markdown without mutating the main chat.',
input:fallbackText,temperature:0.2,max_tokens:isLiveVoiceTurn?420:1100},55_000)
const ansTxt=extractOneshotText(oneshot)
if(ansTxt){
const durationMs=Date.now()- startedAt
const titlePfx=isLiveVoiceTurn?'[LIVE: By The Way] ':wasVoiceDictated?(isPt?'[STT: Transcrito] ':'[STT: Transcribed] '):''
const rawEntry={id:tempTaskId,session_id:ids.storedId||ids.runtimeId||key,title:`${titlePfx}${question.slice(0,56)}`,question,answer:ansTxt,
source:'btw-studio-oneshot',model:mode==='deep'?(ids.model||'session-model'):'fast-aux',duration_ms:durationMs,created_at:Date.now()/ 1000,
voice_dictated:wasVoiceDictated,live_voice:isLiveVoiceTurn,attachments:passedAtts}
if(isLiveVoiceTurn){
_liveConvHistory=[..._liveConvHistory,{role:'assistant',content:ansTxt.slice(0,900)}].slice(-12)
$liveVoiceReply.set(stripInlineMarkdownPreview(ansTxt,160))}
if(persistCard){
$bannerExpandedBySession.set({...$bannerExpandedBySession.get(),[key]:true})
haptic?.('success')
upsertEntry(key,rawEntry,true)
if(_rest&&(ids.storedId||ids.runtimeId)){
void _rest('/record',{method:'POST',body:{session_id:ids.storedId||ids.runtimeId,task_id:tempTaskId,question,answer:ansTxt,source:'btw-studio-oneshot',duration_ms:durationMs}}).catch(()=>undefined)}
}else{const pend={...$pendingBySession.get()};delete pend[key];$pendingBySession.set(pend);petClear('thinking')}
if(wantTtsReply||isLiveVoiceTurn){
void speakBtwCardOrText(rawEntry,ids,()=>{if($liveVoiceActive.get())resumeLiveListeningAfterTurn(70)},{fastLive:isLiveVoiceTurn})}
return true}
}catch(err){
const pend={...$pendingBySession.get()};delete pend[key];$pendingBySession.set(pend);petClear('thinking')
const msg=strings.failedError(err instanceof Error?err.message:String(err))
petSay('error',msg,'error',8000);host.notify?.({kind:'error',message:msg})
return false}}
if(!rpcSessionId){
const pend={...$pendingBySession.get()}
delete pend[key]
$pendingBySession.set(pend)
petClear('thinking')
host.notify?.({kind:'error',message:strings.inactiveSessionError})
return false}
try{
const rpc=await host.request('prompt.btw',{session_id:rpcSessionId,text:fallbackText})
const realTaskId=String(rpc?.task_id||tempTaskId)
$pendingBySession.set({...$pendingBySession.get(),[key]:{taskId:realTaskId,question,startedAt,mode,voiceDictated:wasVoiceDictated,liveVoice:isLiveVoiceTurn,ttsReply:wantTtsReply}})
return true
}catch(err){
const pend={...$pendingBySession.get()}
delete pend[key]
$pendingBySession.set(pend)
petClear('thinking')
petSay('error',strings.failedError(err instanceof Error?err.message:String(err)),'error',8000)
host.notify?.({kind:'error',message:strings.failedError(err instanceof Error?err.message:String(err))})
return false}}
const SLASH_BTW_RE=/^\/btw(?:\s+([\s\S]*))?$/i
function clearComposerDraftSilently(capturedIds=null){
const ids=capturedIds||resolveFocusedIds()
const sid=ids.runtimeId||ids.storedId||null
const clear=()=>{if(sid)void host.composer?.setDraft?.(sid,'')
else void host.composer?.setDraft?.(null,'')}
scheduleTimer(clear,0)
scheduleTimer(clear,35)}
async function btwComposerMiddleware(draft){
const raw=String(draft?.text||'').trim()
if(/^\/(?:compress|compact)(?:\s|$)/i.test(raw)){
const compIds=resolveFocusedIds()
void triggerCompressionRadarTour(compIds,null,{liveRpc:true})
return draft}
if(!$interceptSlashBtw.get())return draft
const match=SLASH_BTW_RE.exec(raw)
if(!match)return draft
const hostAtts=normalizeHostComposerAttachments(draft?.attachments)
for(const a of hostAtts){if((a.kind==='image'||a.kind==='audio')&&a.data_url&&a.data_url.startsWith('blob:')){try{
const resp=await fetch(a.data_url)
const blob=await resp.blob()
const defName=a.kind==='audio'?'audio.mp3':'image.png'
const defMime=a.kind==='audio'?'audio/mpeg':'image/png'
const converted=await readFileToBtwAttachment(new File([blob],a.label||defName,{type:blob.type||defMime}))
if(converted){
addBtwAttachment({...a,data_url:converted.data_url,thumbnail_url:converted.thumbnail_url,mime_type:converted.mime_type})
continue}
}catch{}}
addBtwAttachment(a)}
const question=String(match[1]||'').trim()
const capturedIds=resolveFocusedIds()
clearComposerDraftSilently(capturedIds)
if(!question&&hostAtts.length===0){requestOpenStudio({tab:'ask'})
return null}
haptic?.('tap')
void dispatchSideQuestion(question,capturedIds,null,{attachments:[...($btwAttachments.get()||[])]})
return null}
let _lastParentSessionKey=''
const $demoShowcase=atom(false)
function useFocusedSessionScope(){
const rawRuntimeId=useValue(host.state.focusedSessionId??host.state.activeSessionId)
const rawStoredId=useValue(host.state.focusedStoredSessionId??host.state.activeSessionId)
const hashSid=typeof location!=='undefined'&&location.hash?location.hash.replace(/^#\/?/,'').split(/[?#]/)[0].trim():''
const runtimeId=rawRuntimeId||hashSid
const storedId=rawStoredId||hashSid
const busy=useValue(host.state.busy)
const model=useValue(host.state.model)
const profile=useValue(host.state.focusedSessionProfile??host.state.profile)
const override=useValue($targetOverride)
const parentKey=canonicalSessionKey(storedId||runtimeId)
useEffect(()=>{if(parentKey&&_lastParentSessionKey&&parentKey!==_lastParentSessionKey){
if($targetOverride.get())$targetOverride.set(null)
if($followUpParent.get())$followUpParent.set(null)
if($activeCardMiniChatId.get())$activeCardMiniChatId.set('')}
if(parentKey)_lastParentSessionKey=parentKey
},[parentKey])
const effectiveStoredId=override?.id?String(override.id):String(storedId||'')
const effectiveRuntimeId=override?.id?'':String(runtimeId||'')
const key=canonicalSessionKey(effectiveStoredId||effectiveRuntimeId)
return{runtimeId:effectiveRuntimeId,storedId:effectiveStoredId,parentRuntimeId:String(runtimeId||''),
parentStoredId:String(storedId||''),isSubagentInspect:Boolean(override?.id),subagentTitle:override?.title||'',key,
busy:Boolean(busy),model:String(model||''),profile:String(profile||'default')}}
function resolveModelContextMax(modelName,fallbackMax=0){
const m=String(modelName||'').toLowerCase()
const fb=Number(fallbackMax||0)
if(/(gemini|flash|1m|pro-1\.5|pro-2|sonnet-5|opus-5)/i.test(m))return 1_000_000
if(fb>0)return fb
if(/(gpt-4o|gpt-4\.1-mini|deepseek|glm)/i.test(m))return 128_000
return 200_000}
function hydrateSnapshotWithHostContext(raw,scope,focusedUsage=null,liveComposerModel=''){
if(!raw||typeof raw!=='object'||raw.is_demo_showcase)return raw
const isParentFocused=!scope?.isSubagentInspect
const hostUsage=isParentFocused&&focusedUsage&&typeof focusedUsage==='object'?focusedUsage:null
const composerModel=String((isParentFocused&&(liveComposerModel||hostUsage?.model||scope?.model))||raw.model||'default'
).trim()
const rawToks=raw.tokens&&typeof raw.tokens==='object'?raw.tokens:{}
const rawCounts=raw.counts&&typeof raw.counts==='object'?raw.counts:{}
const rawPerf=raw.performance&&typeof raw.performance==='object'?raw.performance:{}
const rawCtx=raw.context_window&&typeof raw.context_window==='object'?raw.context_window:{}
const inp=Math.max(Number(rawToks.input||0),Number(hostUsage?.input||0))
const out=Math.max(Number(rawToks.output||0),Number(hostUsage?.output||0))
const cacheRead=Number(rawToks.cache_read||0)
const apiCalls=Math.max(Number(rawCounts.api_calls||0),Number(hostUsage?.calls||0))
const denom=inp + cacheRead
const computedCachePct=denom>0?Math.round((cacheRead / denom)* 1000)/ 10:Number(hostUsage?.cache_hit_pct||0)
const cacheHitPct=Number(rawToks.cache_hit_pct??computedCachePct??0)
const fallbackSavedUsd=Math.round(cacheRead * 0.000001125 * 10000)/ 10000
const fallbackCostUsd=Math.round((inp * 0.00000125 + out * 0.000005 + cacheRead * 0.000000125)* 10000)/ 10000
const hostCtxMax=Number(hostUsage?.context_max||0)
const maxCtxTokens=hostCtxMax>0?hostCtxMax:resolveModelContextMax(composerModel,rawCtx.max_tokens)
const hostCtxUsed=Number(hostUsage?.context_used||0)
const dbCtxUsed=Number(rawCtx.used_tokens||rawCtx.estimated_tokens||0)
const estFromToks=apiCalls>0?Math.min(maxCtxTokens,Math.round((inp + cacheRead)/ Math.max(1,apiCalls)))
:Math.min(maxCtxTokens,inp + cacheRead)
const usedCtxTokens=Math.min(maxCtxTokens,hostCtxUsed>0?hostCtxUsed:dbCtxUsed>0?dbCtxUsed:estFromToks)
const computedOccPct=maxCtxTokens>0&&usedCtxTokens>0?Math.min(100,Math.round((usedCtxTokens / maxCtxTokens)* 1000)/ 10)
:Math.min(100,Math.max(0,Number(hostUsage?.context_percent??rawCtx.occupancy_pct??0)))
const tpsCore=Number(rawPerf.tps_core||hostUsage?.avg_tps||0)
return{...raw,model:composerModel||raw.model,composer_model:composerModel,counts:{...rawCounts,api_calls:apiCalls},tokens:{
...rawToks,input:inp,output:out,cache_hit_pct:cacheHitPct,cache_savings_usd:
Number(rawToks.cache_savings_usd||0)>0?Number(rawToks.cache_savings_usd):fallbackSavedUsd,effective_cost_usd:
Number(rawToks.effective_cost_usd??rawToks.cost_usd??0)>0?Number(rawToks.effective_cost_usd??rawToks.cost_usd)
:fallbackCostUsd},performance:{...rawPerf,tps_core:tpsCore},context_window:{...rawCtx,used_tokens:usedCtxTokens,
max_tokens:maxCtxTokens,occupancy_pct:computedOccPct,compressions:Number(hostUsage?.compressions??rawCtx.compressions??0),
source:hostCtxUsed>0?hostUsage?.context_source||'composer_live':dbCtxUsed>0?'state_db':'token_estimate',
composer_model:composerModel}}}
function useSessionRadar(scope,enabled){
const targetId=scope.storedId||scope.runtimeId
const focusedUsage=useValue(host.state?.focusedUsage??$noPet)
const liveComposerModel=useValue(host.state?.model??$noPet)
return useQuery({queryKey:[ID,'snapshot',scope.profile,targetId],enabled:Boolean(enabled&&_rest&&targetId),
queryFn:async()=>{
const data=await _rest(`/snapshot?session_id=${encodeURIComponent(targetId)}`,{timeoutMs:8000})
 if(data?.conversation_id)trackConversationRoot(data.session_id||data.canonical_id||targetId,data.conversation_id)
 if(data?.history?.length)mergeBackendHistory(canonicalSessionKey(data.conversation_id||targetId),data.history)
return hydrateSnapshotWithHostContext(data,scope,host.state?.focusedUsage?.get?.()||null,host.state?.model?.get?.()||'')},
select:data=>hydrateSnapshotWithHostContext(data,scope,focusedUsage,liveComposerModel),staleTime:3000,
refetchInterval:enabled?(scope.busy?3500:10000):false,retry:1})}
function useElapsedSeconds(startedAtMs,active){
const[now,setNow]=useState(()=>Date.now())
useEffect(()=>{if(!active||!startedAtMs)return undefined
setNow(Date.now())
if(typeof createBudgetedLoop==='function'){
const loop=createBudgetedLoop(()=>setNow(Date.now()),{fps:8})
loop?.start?.()
return()=>{if(typeof loop?.dispose==='function')loop.dispose();else loop?.stop?.()}}
const id=setInterval(()=>{if(typeof document==='undefined'||!document.hidden)setNow(Date.now())
},250)
return()=>clearInterval(id)
},[active,startedAtMs])
if(!active||!startedAtMs)return '0.0s'
return `${Math.max(0,(now - startedAtMs)/ 1000).toFixed(1)}s`}
function BtwElapsedSpan({startedAt,active,prefix=''}){
const txt=useElapsedSeconds(startedAt,active)
return span('tabular-nums',`${prefix}${txt}`)}
function Seal({kind,children,title}){
return span({cls:'btw-seal','data-kind':kind,title},children)}
function FlightDeck({snap,scope=null,compact=false,onOpenTactical=null}){
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const health=snap?.health
if(!health)return null
const state=['calm','watch','act'].includes(health.state)?health.state:'calm'
const score=Math.max(0,Math.min(100,Number(health.score??100)))
const n=Number(health.high||0)+ Number(health.medium||0)+ Number(health.low||0)
const circ=2 * Math.PI * 14
const sub=health.steering?strings.steeringNow:state==='calm'?strings.flightSub.calm:state==='watch'
?strings.flightSub.watch(n):strings.flightSub.act(Number(health.high||0))
const learned=Array.isArray(snap?.rsi?.learned_now)?snap.rsi.learned_now.filter(Boolean):[]
const topAnom=Array.isArray(snap?.anomalies)?snap.anomalies.find(Boolean):null
const curveType=state==='calm'?'spiral-search':state==='watch'?'rose-orbit':'fourier-flow'
return divs(CLS.col15,[divs({cls:'btw-flight','data-state':state,'data-steering':health.steering?'true':'false',role:'status','aria-live':'polite'},[divs({cls:'btw-flight-ring',title: `${strings.healthLabel} ${score}/100`},[hs('svg',{viewBox:'0 0 34 34','aria-hidden':'true'},[
h('circle',{cls:'btw-ring-track',cx:'17',cy:'17',r:'14',fill:'none',strokeWidth:'3'}),h('circle',{cls:'btw-ring-fill',cx:'17',cy:'17',r:'14',fill:'none',strokeWidth:'3',strokeLinecap:'round',strokeDasharray:String(circ),strokeDashoffset:String(circ *(1 - score / 100))})]),span(null,String(score))]),
divs('min-w-0 flex-1',[divs(CLS.rowWrap15,[
typeof SessionStatusDot==='function'?jsx(SessionStatusDot,{storedSessionId:scope?.parentStoredId||scope?.storedId||null})
:jsx(StatusDot,{tone:state==='calm'?'good':'warn'}),typeof DecodeText==='function'?jsx(DecodeText,{
text:String(strings.flightNames[state]||state).toUpperCase(),prefix:4,loop:false,cursor:false,className:'btw-flight-state'})
:span('btw-flight-state',strings.flightNames[state]),
!compact&&jsx(Seal,{kind:'observed',title:strings.sealObservedTip,children:strings.sealObserved}),
typeof Loader==='function'&&!compact&&jsx(Loader,{type:curveType,strokeScale:1.1,
className:cn('size-3.5 shrink-0',state==='calm'?'text-emerald-400':'text-amber-400')})]),
div('btw-flight-sub truncate',sub)]),!compact&&divs(CLS.rowShrink1,[hBtn('btw-tile-mini-btn',{title:isPt?'Consultar saúde e telemetria via /btw':'Query session health & telemetry via /btw',onClick:()=>{
const q=isPt
? `Audite o estado atual da sessão (${score}/100 · ${strings.flightNames[state]}): avalie contexto, cache L0, ferramentas e sugira o próximo passo ótimo.`
: `Audit the current session state (${score}/100 · ${strings.flightNames[state]}): evaluate context, L0 cache, tools, and suggest the optimal next step.`
if(onOpenTactical){onOpenTactical({target: `FlightDeck · ${score}/100`,prompt:q,
steer:topAnom?.suggested_steer||(isPt?'Mantenha execução enxuta, verifique edições pendentes e preserve o cache L0.':'Keep execution lean, verify pending edits, and preserve the L0 prefix cache.')
})
}else{stageCommandInBtwChat(q,{label:'📡 FlightDeck Audit → /btw',source:'radar',icon:'pulse'})}
haptic?.('tap')}},'💬 /btw'),hBtn('btw-tile-mini-btn',{'data-tone':'steer',title:topAnom?.suggested_steer? `${isPt?'Aplicar correção via Steer':'Apply fix via Steer'}: ${topAnom.suggested_steer}` :isPt
?'Direcionar a sessão ativa via Steer':'Steer the active session',onClick:()=>{if(topAnom?.suggested_steer){
void steerActiveSession(topAnom.suggested_steer,scope,null,{source:'flight_deck',targetKind:topAnom.kind||''})
}else if(onOpenTactical){onOpenTactical({target:isPt?'Direcionamento Tático':'Tactical Steer',prompt:isPt
?'Verifique a consistência do que foi feito até agora, valide os arquivos tocados e conclua o objetivo sem loops.'
:'Verify consistency of work done so far, validate touched files, and complete the goal without loops.',steer:isPt
?'Verifique a consistência do que foi feito até agora, valide os arquivos tocados e conclua o objetivo sem loops.'
:'Verify consistency of work done so far, validate touched files, and complete the goal without loops.'})}
haptic?.('tap')}},topAnom?.suggested_steer?(isPt?'⚡ Corrigir':'⚡ Fix'):'⚡ Steer')])]),learned.length>0&&
divs('btw-learned btw-tx-11',[
jsx(Seal,{kind:'helped',children:`✓ ${strings.verdictNames.helped}` }),
span('ml-1.5 btw-ts',strings.learnedNotify(learned[0].cue))])])}
function AnomalyMeta({anom}){
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
if(!anom?.lever)return null
const isHeuristic=anom.epistemic_tier==='D1'
return divs('btw-anom-meta',[jsx(Seal,{kind:'observed',
title:isHeuristic?strings.sealHeuristicTip:strings.sealObservedTip,
children:isHeuristic?strings.sealHeuristic:strings.sealObserved}),
jsx(Seal,{kind:'scope',children:strings.scopeNames[anom.scope]||anom.scope}),jsx(Seal,{kind:'lever',
title:strings.leverTip(anom.lever,anom.lever_name,anom.lever_why||''),children: `${anom.lever_name} (${anom.lever})`})])}
function LessonMatches({matches,scope=null,onSelectTactical=null}){
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const[expandedMap,setExpandedMap]=useState({})
const safeMatches=Array.isArray(matches)?matches.filter(Boolean):[]
if(safeMatches.length===0)return null
return divs(CLS.col15,[div(CLS.secHdrMuted,strings.learnedBefore),
...safeMatches.map(m=>{
const isOpen=Boolean(expandedMap[m.id])
const cleanLesson=stripInlineMarkdownPreview(String(m.lesson||''),1600)
return divs('btw-lesson flex flex-col gap-1.5 rounded-lg p-2.5',[divs('flex items-center justify-between gap-2 min-w-0',[
div({cls:'font-semibold btw-tx-115 btw-tp truncate min-w-0 flex-1',title:m.cue},m.cue),
divs(CLS.rowShrink1,[hBtn('btw-tile-mini-btn',{title:isPt?'Investigar via /btw antes de aplicar':'Inspect via /btw before applying',onClick:()=>{
const q=isPt?`Analise o alerta "${m.cue}" e valide se devemos aplicar a regra aprendida: "${m.lesson}".`:`Analyze the alert "${m.cue}" and validate whether we should apply the learned rule: "${m.lesson}".`
if(onSelectTactical)onSelectTactical({target:m.cue,prompt:q,steer:m.lesson})
else stageCommandInBtwChat(q,{label:`💬 ${m.cue}`,source:'lesson',icon:'sparkle'})
haptic?.('tap')}},'/btw'),m.lesson&&uiBtn('outline','xs',{cls:'shrink-0 h-[22px] px-2 btw-tx-10 btw-ac btw-bd-ac40',onClick:()=>void steerActiveSession(m.lesson,scope,null,{source:'resurfaced_lesson',targetKind:Array.isArray(m.kinds)&&m.kinds[0]?m.kinds[0]:''})},strings.resurfacedApplyBtn)])]),
div(cn('btw-tx-11 leading-relaxed btw-ts',!isOpen&&'line-clamp-2'),cleanLesson),
divs('flex items-center justify-between gap-2 pt-0.5',[divs('flex items-center gap-1.5 flex-wrap min-w-0',[
jsx(Seal,{kind:'helped',children:m.evidence||strings.verdictNames.helped}),
jsx(Seal,{kind:'lever',children:`${m.scope} · ${m.lever}`})]),
cleanLesson.length>140&&hBtn('btw-readmore-btn',{'aria-expanded':isOpen?'true':'false',onClick:()=>setExpandedMap(prev=>({...prev,[m.id]:!prev[m.id]}))},isOpen?(isPt?'▴ Recolher':'▴ Less'):(isPt?'▾ Ler mais':'▾ Read more'))])],m.id)})])}
function TokenChips({targetRef,onInsert,compact=false}){
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
const keys=compact?CONTEXT_TOKEN_KEYS.slice(0,5):CONTEXT_TOKEN_KEYS
const insert=key=>{
const token= `{{${key}}}`
const el=targetRef?.current
const value=String(el?.value??'')
const start=typeof el?.selectionStart==='number'?el.selectionStart:value.length
const end=typeof el?.selectionEnd==='number'?el.selectionEnd:value.length
const pad=start>0&&!/\s$/.test(value.slice(0,start))?' ':''
const next= `${value.slice(0,start)}${pad}${token}${value.slice(end)}`
onInsert(next)
scheduleTimer(()=>{try{
const pos=start + pad.length + token.length
el?.focus?.({preventScroll:true})
el?.setSelectionRange?.(pos,pos)
}catch{}
},0)
haptic?.('tap')}
return divs({cls:'btw-token-bar',title:strings.tokensTip},[
spans('inline-flex items-center gap-1 btw-tx-105 btw-tt mr-0.5 shrink-0',[codicon('symbol-variable','0.68rem','btw-ac opacity-80'),`${strings.tokensLabel}:`]),
...keys.map(k=>hBtn('btw-token-chip',{title: `Insert {{${k}}}`,onClick:()=>insert(k)},`@${k}`,k))])}
function useResolvedPreview(text,sessionId,enabled){
const[res,setRes]=useState(null)
useEffect(()=>{if(!enabled||!_rest||!/\{\{/.test(String(text||''))){setRes(null)
return undefined}
let alive=true
const timer=setTimeout(()=>{
void _rest('/presets/resolve',{method:'POST',body:{prompt:text,session_id:sessionId||''},timeoutMs:6000})
.then(r=>alive&&setRes(r?.ok?r:null)).catch(()=>alive&&setRes(null))
},320)
return()=>{alive=false
clearTimeout(timer)}
},[text,sessionId,enabled])
return res}
function ResolvedPreview({res}){
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
if(!res)return null
const unknown=res.lint?.unknown||res.unknown||[]
return divs('flex flex-col gap-1',[divs('btw-resolved',[h('strong','btw-tp',`${strings.resolvedPreview}: `),res.text]),
unknown.length>0&&div('btw-warn-text btw-tx-105',strings.lintUnknown(unknown.join(', ')))])}
function PromoteMenu({entry,sessionScope,onCloseSurface}){
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
const seat=async body=>{
const targetSid=sessionScope.runtimeId||sessionScope.storedId||null
const ok=await host.composer?.setDraft?.(targetSid,body)
if(ok){host.composer?.focus?.(targetSid)
onCloseSurface?.()
closeAllStudioSurfaces()
host.notify?.({kind:'info',message:strings.promotedNotify})
}else{await writeClipboardText(body)
host.notify?.({kind:'info',message:strings.copiedNotify})}}
const draft=async target=>{
let text=''
if(_rest){try{
const res=await _rest('/promote',{method:'POST',body:{target,question:entry.question,answer:entry.answer.slice(0,3000)},
timeoutMs:8000})
text=res?.text||''
}catch{}}
if(!text){
text= `/learn Keep this from a BTW side message as reusable knowledge — Q: ${entry.question}\n\n${entry.answer.slice(0,3000)}`}
await seat(text)}
const saveLesson=async()=>{
const cueText=entry.question? `When asking: ${entry.question}` :'When this situation reappears'
const lessonText=entry.answer.slice(0,600)
const expId= `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
addLocalLesson({id:expId,cue:cueText,lesson:lessonText,evidence: `BTW card ${entry.id}`,scope:inferRuleScope(cueText,lessonText),lever:'C6',domain:'global'})
haptic?.('success')
host.notify?.({kind:'info',message:strings.lessonSavedNotify})
if(!_rest)return
try{await _rest('/rsi/experience',{method:'POST',body:{id:expId,
session_id:sessionScope.storedId||sessionScope.runtimeId||'',cue:cueText,lesson:lessonText,evidence: `BTW card ${entry.id}`,
kinds:entry.anomaly_kinds||[],source:'card'},timeoutMs:8000})
}catch{}}
const item=(icon,label,onSelect)=>jsx(DropdownMenuItem,{onSelect:()=>void onSelect(),children:spans(CLS.inline2Xs,[codicon(icon,'0.78rem',CLS.accent),label])})
return jsxs(DropdownMenu,{children:[jsx(DropdownMenuTrigger,{asChild:true,children:uiBtn('ghost','icon-xs',{title:strings.promoteTip,'aria-label':strings.promoteBtn},codicon('rocket'))}),jsxs(DropdownMenuContent,{align:'end','data-btw-portal':'',children:[item('book',strings.promoteSkill,()=>draft('skill')),
item('lightbulb',strings.promoteLesson,saveLesson),
item('zap',strings.promotePreset,()=>openPresetCreatorFromQuestion(entry.question,'ask')),jsx(DropdownMenuSeparator,{}),
item('bookmark',strings.promoteMemory,()=>draft('memory'))]})]})}
function BtwBrandIcon({size=16,alert=false,className=''}){
const s=typeof size==='number'? `${size}px` :String(size)
const coreFill=alert?'#f59e0b':'#f43f5e'
const pulseStroke=alert?'#fbbf24':'#34d399'
return hs('svg',{width:s,height:s,viewBox:'0 0 24 24',fill:'none',xmlns:'http://www.w3.org/2000/svg','aria-hidden':'true',cls:cn('btw-brand-icon shrink-0',className),style:{width:s,height:s,display:'inline-block',verticalAlign:'middle'}},[h('rect',{x:'1.25',y:'1.25',width:'21.5',height:'21.5',rx:'5.5',fill:'#060D20',stroke:alert?'#f59e0b':'#00E5FF',strokeWidth:'1.5'}),h('path',{d:'M 5.2 10.5 A 6.8 6.8 0 0 1 18.8 10.5',stroke:'#00E5FF',strokeWidth:'1.25',strokeLinecap:'round',strokeOpacity:'0.78'}),
h('polygon',{points:'9.2,8.5 3.6,6.5 4.8,8.8 9.0,10.0',fill:'#38BDF8'}),
h('polygon',{points:'9.2,10.6 4.4,9.6 5.4,11.4 9.2,11.8',fill:'#0284C7'}),
h('polygon',{points:'14.8,8.5 20.4,6.5 19.2,8.8 15.0,10.0',fill:'#38BDF8'}),
h('polygon',{points:'14.8,10.6 19.6,9.6 18.6,11.4 14.8,11.8',fill:'#0284C7'}),h('line',{x1:'12',y1:'3.4',x2:'12',y2:'14.2',stroke:'#FBBF24',strokeWidth:'1.7',strokeLinecap:'round'}),
h('circle',{cx:'12',cy:'3.8',r:'1.35',fill:'#FEF08A'}),h('polygon',{points:'12,7.5 14.3,8.8 14.3,11.4 12,12.7 9.7,11.4 9.7,8.8',fill:coreFill,stroke:'#FDE68A',strokeWidth:'0.85'}),h('path',{d:'M 5.6 19.4 L 7.4 15.6',stroke:'#F59E0B',strokeWidth:'2.0',strokeLinecap:'round'}),h('path',{d:'M 9.2 17.6 H 11.2 L 12.3 15.4 L 13.7 19.6 L 15.0 16.8 L 16.0 17.6 H 18.6',stroke:pulseStroke,strokeWidth:'1.7',strokeLinecap:'round',strokeLinejoin:'round'})])}
function SessionRowBadge({sessionId}){
const badges=useValue($sessionBadges)
const entriesMap=useValue($entriesBySession)
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
const key=canonicalSessionKey(sessionId)
const b=badges?.[key]||null
const rawLocal=entriesMap?.[key]
const local=Array.isArray(rawLocal)?rawLocal.filter(Boolean):[]
const cards=Math.max(Number(b?.cards||0),local.length)
const pinned=Math.max(Number(b?.pinned||0),local.filter(x=>x?.pinned).length)
const alert=Boolean(b?.alert)
if(!cards&&!alert)return null
return spans({cls:'btw-row-badge','data-alert':alert?'true':'false',title:strings.rowBadgeTip(cards,pinned,alert)},[codicon(alert?'warning':pinned?'pinned':'comment-discussion','0.55rem'),alert&&!cards?'!':String(cards)])}
let _badgeTimer=null
let _lastBadgesJson=''
function refreshSessionBadges(){if(!_rest||(typeof document!=='undefined'&&document.visibilityState==='hidden'))return
void _rest('/sessions/badges',{timeoutMs:6000}).then(res=>{if(res?.ok&&res.badges&&typeof res.badges==='object'){
const nextJson=JSON.stringify(res.badges)
if(nextJson!==_lastBadgesJson){_lastBadgesJson=nextJson
$sessionBadges.set(res.badges)}}}).catch(()=>undefined)}
const CLIENT_FALLBACK_PACKS=[{id:'coding-tdd',label:'Coding & TDD',desc:'Verification-first checks for code sessions',presets:[{
id:'pk_verify',icon:'beaker',label:'Verified?',desc:'Was every edit tested?',prompt:
'Since the last edits ({{touched_files}}), which verification ran (tests, lint, type check) and what was the exact result? Anything still unverified?'
},{id:'pk_lasterr',icon:'bug',label:'Root cause',desc:'Diagnose the latest failure',prompt:
'Last error: {{last_error}}. Separate INV (workflow) from DOM (workspace fact) and name the root cause, not the symptom.'},{
id:'pk_diff',icon:'git-commit',label:'Diff review',desc:'Risky changes in the diff',prompt:
'Review the changes made on {{git_branch}} in {{touched_files}}: what could break, and which test would catch it?'}]},{id:'research',
label:'Research',desc:'Keep long research turns converging',presets:[{id:'pk_sources',icon:'book',label:'Sources so far',
desc:'What has been read and why',
prompt:'List the sources read so far with one line each on what they contributed. Which claim is still unsupported?'},{
id:'pk_converge',icon:'compass',label:'Converging?',desc:'Research vs deliverable',
prompt:'Is the work converging on the deliverable or still expanding? What is the single next step that produces output?'}]},{
id:'devops',label:'DevOps & Infra',desc:'Commands, exits and blast radius',presets:[{id:'pk_cmd',icon:'terminal',
label:'Last command',desc:'Explain the last command',
prompt:'Explain {{last_command}}: what it changed, whether it is reversible, and what to check next.'},{id:'pk_blast',
icon:'shield',label:'Blast radius',desc:'What could this affect?',
prompt:'Given {{active_tool}} and the files {{touched_files}}, what is the blast radius if this goes wrong, and is there a rollback?'
}]},{id:'academic',label:'Academic & Clinical writing',desc:'Evidence and citation discipline',presets:[{id:'pk_cite',
icon:'book',label:'Citations',desc:'Every claim sourced?',
prompt:'Which statements written so far lack a verifiable citation? List them with the section they appear in.'},{id:'pk_scope',
icon:'checklist',label:'Scope check',desc:'Still on the brief?',
prompt:'Compare the current draft with the original request: what is in scope, what drifted, what is missing?'}]}]
function hasForbiddenProtoKeys(obj,depth=0){if(!obj||typeof obj!=='object'||depth>5)return depth>5
for(const k of Object.getOwnPropertyNames(obj)){if(k==='__proto__'||k==='constructor'||k==='prototype')return true
if(typeof obj[k]==='object'&&obj[k]!==null&&hasForbiddenProtoKeys(obj[k],depth + 1))return true}
return false}
const DEMO_LESSONS=[{id:'demo_exp_1',created_at:Date.now()/ 1000 - 120,
cue:'High edit churn on plugin.js',
lesson:'Run node --input-type=module --check before syncing across profiles.',
evidence:'Δτ contrast: syntax errors 0; 58 verified runs',scope:'DOM',lever:'C3',domain:'coding',uses:58,
verdict:'helped'},{id:'demo_exp_2',created_at:Date.now()/ 1000 - 240,
cue:'When the same tool fails two or more times in a row',
lesson:'Stop retrying with identical arguments; inspect conftest.py or error stderr first, then run pytest -q.',
evidence:'Δτ contrast: error streak 3 → 0; verification command passed',scope:'INV',lever:'C6',domain:'hermes-btw-studio',uses:19,
verdict:'helped'},{id:'demo_exp_3',created_at:Date.now()/ 1000 - 340,
cue:'When code was edited and the turn is about to end without a test or lint',
lesson:'Run `pytest -q` and `hermes plugins validate .` before declaring the task complete.',
evidence:'Δτ contrast: `unverified_edit` cleared; verification command passed',scope:'INV',lever:'C8',domain:'hermes-btw-studio',uses:14,
verdict:'helped'},{id:'demo_exp_4',created_at:Date.now()/ 1000 - 480,
cue:'When validating outbound base_url endpoints in runtime.py',
lesson:'Resolve DNS once, block RFC1918/link-local ranges unless opted-in, and pin the validated IP.',
evidence:'Δτ contrast: 41/41 SSRF vectors blocked',scope:'DOM',lever:'C6',domain:'hermes-btw-studio',uses:9,
verdict:'helped'}]
const DEMO_PROBES=[{id:'demo_probe_helped',text:'Inspect conftest.py and run pytest -q to verify the fix.',verdict:'helped',
status:'closed',reason:'error streak 3 → 0; `error_streak` cleared; verification command passed',opened_at:Date.now()/ 1000 - 125
},{id:'demo_probe_auto_rec',
text:'After `terminal` failed 2× (exit 1: No module named pytest), self-recovered via `terminal` (`python -m pytest -q`).',
verdict:'self_recovered',status:'closed',reason:'error streak 2 → 0 (autonomous); verification command passed',
opened_at:Date.now()/ 1000 - 180},{id:'demo_probe_no_eff',text:'Check secondary profile lock before reloading skills index',
verdict:'no_observed_effect',status:'closed',
reason:'Session finished within 1 tool call — neutral Δτ window.',
opened_at:Date.now()/ 1000 - 260}]
const DEMO_RSI={ok:true,is_demo_showcase:true,growth_mode:'lite',btw_md_max_chars:6000,
auto_learn:{mode:'lite',hook_enabled:true,cron_minutes:15},
verdicts:{helped:15,self_recovered:41,hurt:0,no_observed_effect:4,confounded:0},
probes_open:0,probes_recent:DEMO_PROBES,experiences:DEMO_LESSONS,
molded_skills:[{name:'btw-verify-before-done',qualified_name:'btw-verify-before-done',version:'1.0.0',scope_origin:'INV · C8',trigger:'Use before ending a turn with edited Python or ESM files.'},{name:'btw-ssrf-ip-pinning',qualified_name:'btw-ssrf-ip-pinning',version:'1.0.0',scope_origin:'DOM · C6',trigger:'Use when validating custom HTTP base_url endpoints.'}],
walkthroughs:[{title:'Zero-Interruption Side-Channel Audit',lever:'C8',scope:'INV',domain:'hermes-btw-studio',steps:['Inspect state.db?mode=ro at $0','Dispatch non-destructive session.steer','Verify Δτ across next 3 tool calls']}],
memory_md:{sync_mode:'10',total_chars:980,base_chars:842,btw_block_chars:138,limit_chars:2200,free_without_btw:1358,allocated_budget_chars:220,allocated_pct:6.3,synced:true,preview:'<!-- btw-studio:start -->\n- [C3 · DOM] Run node --input-type=module --check before syncing across profiles.\n- [C8 · INV] Run pytest -q before declaring multi-file edits complete.\n<!-- btw-studio:end -->'},
preset_yield:{errors:6.4,files:4.2,plan:3.1,doing:2.0}}
const DEMO_SUBAGENTS=[{
id:'sa-0-sec-audit',short_title:'Security & Catalog Judge',title:'Security & 18 Catalog Rules Audit',
full_goal:'Audit 18 Nous Catalog rules, SSRF vectors, and secret redaction across runtime.py and harness.py.',
model:'claude-sonnet-4-5',status:'running',tool_call_count:28,message_count:58,elapsed_seconds:142,
active_tool:'execute_code',touched_files:['harness.py','runtime.py','__init__.py'],
last_reasoning_text:'Checking _validate_fast_base_url against IPv6-mapped loopback and cloud metadata.',
last_assistant_text:'Verified **41/41 SSRF vectors blocked** and **36/36 secret patterns redacted**.',
demo_steps:[
{id:'ds_g1',kind:'goal',text:'Audit 18 Catalog security rules, SSRF vectors, and secret redaction.'},
{id:'ds_t1',kind:'turn',thought:'Testing SSRF bypass payloads and secret redaction.',tools:[{call_id:'c1',tool:'execute_code',args:'verify_ssrf_and_redaction()',status:'ok',preview:'41/41 blocked'}],reply:'Verified 41/41 SSRF vectors blocked and 36/36 secret patterns redacted.'}
]},{
id:'sa-1-rsi-verify',short_title:'Harness² Δτ Verifier',title:'Harness² Δτ Behavioral Contrast Verification',
full_goal:'Verify Δτ behavioral contrast and self-recovery across state.db?mode=ro.',
model:'gemini-2.5-flash',status:'done',tool_call_count:26,message_count:54,elapsed_seconds:118,
active_tool:'',touched_files:['tests/test_harness_rsi.py'],
last_reasoning_text:'Validating error streak self-recovery without mutating state.db.',
last_assistant_text:'Replay-verified **160 sessions** in `state.db?mode=ro` (**0 bytes mutated**).',
demo_steps:[{id:'ds_g2',kind:'goal',text:'Verify Δτ contrast across state.db?mode=ro.'}]
}]
const DEMO_QA_CARDS=[{id:'btw_demo_1',session_id:'demo-session',title:'SSRF & Secret Redaction Verification Status',
question:'What is the agent doing right now, and did the recent edits pass verification?',answer:
'The agent is auditing **SSRF & Secret Redaction** across `runtime.py` and `__init__.py` (`41/41` SSRF vectors blocked, `36/36` secret patterns redacted).\n\n- **Edited files**: `runtime.py` (`ψ ✓ AST valid`), `harness.py` (`ψ ✓ AST valid`)\n- **Autonomous Self-Recovery (`Δτ`)**: Earlier `pytest` failure (`exit 1`) was self-healed via `python -m pytest -q` (`40 passed`).',
source:'btw-studio-llm',model:'gemini-2.5-flash',duration_ms:1420,pinned:true,steer_info:{target:'main',command:'python -m pytest tests/ -q && node --input-type=module --check < desktop/plugin.js',ts:Date.now()/1000-30},created_at:Date.now()/1000-45},{id:'btw_demo_2',session_id:'demo-session',
title:'Prompt Cache L0 Savings & Token Economics',question:'How much money has Prompt Caching saved in this session so far?',answer:
'| Metric | Value |\n| :--- | :--- |\n| **Prompt Cache Hit Rate** | `94.2%` (`412.0k` cache read / `25.4k` fresh input) |\n| **Estimated API List Cost** | `$0.21` (vs `$2.05` uncached) |\n| **Net Cache Savings** | **`$1.84 USD saved`** (`0` cache invalidations from `/btw`) |',
source:'btw-studio-llm',model:'gemini-2.5-flash',duration_ms:1180,pinned:false,created_at:Date.now()/1000-95},{id:'btw_demo_3',session_id:'demo-session',title:'Subagent Fleet CoT & Tool Feed Summary',
question:'Summarize the progress of the delegated subagents.',answer:
'Two delegated subagents are active in the fleet:\n1. **`sa-0-sec-audit` (`running` · `claude-sonnet-4-5`)**: Verified 41/41 SSRF vectors and connect-time IP pinning (`28 tool calls`).\n2. **`sa-1-rsi-verify` (`done` · `gemini-2.5-flash`)**: Replay-verified 160 sessions in `state.db?mode=ro` with 0 bytes mutated.',
source:'btw-studio-llm',model:'claude-sonnet-4-5',duration_ms:1640,pinned:false,created_at:Date.now()/1000-150},{id:'btw_demo_4',session_id:'demo-session',title:'Context Window vs Compaction Health Check',
question:'Is the context window healthy or approaching compaction?',answer:
'> **✓ Context & Cache Healthy (`42.1%` occupancy · `84.2k / 200k` tokens)**\n\nLargest tool payload is `execute_code` (`3.7k` tokens). L0 prefix cache remains warm at `94.2%` because `/btw` queries run on the read-only side-channel without touching the main conversation transcript.',
source:'btw-studio-llm',model:'gemini-2.5-flash',duration_ms:980,pinned:false,created_at:Date.now()/1000-210}]
const DEMO_SNAPSHOT={ok:true,found:true,is_demo_showcase:true,session_id:'demo-session',canonical_id:'demo-session',
title:'Interactive Showcase — BTW Studio v5.8.0 × Harness²',profile:'default',model:'claude-sonnet-4-5',
cwd:'/workspace/hermes-btw-studio',git_branch:'v4-hermes-native',elapsed_seconds:264,counts:{messages_total:42,
messages_active:42,max_msg_id:42,tool_calls:31,api_calls:14,errors_recent:2,anomalies:2,trailing_errors:0,self_recoveries:1},
tokens:{input:25400,output:8900,cache_read:412000,cache_write:18000,reasoning:3200,cache_hit_pct:94.2,cost_usd:0.21,
list_cost_usd:0.21,effective_cost_usd:0.21,cache_savings_usd:1.84,is_subscription_estimate:false},performance:{tps_core:96.4,
ttft_median_ms:580,tool_time_ms:14200,api_time_ms:27500,tool_time_share_pct:34.1},context_window:{used_tokens:84200,
max_tokens:200000,occupancy_pct:42.1,largest_tool_payload:{tool:'execute_code',chars:14800,est_tokens:3700}},health:{
state:'watch',score:86,high:0,medium:1,low:1,steering:false},anomalies:[{kind:'unverified_edit',severity:'medium',
title:'Edited code without a post-edit verification run',
detail:'desktop/plugin.js edited 2 tool calls ago — run node --input-type=module --check and pytest -q',scope:'INV',lever:'C8',
lever_name:'Guardrail / Hook',
lever_why:'A successful write does not prove the file works (Harness² Fig. 9/17): enforce a verify step after edits.',
epistemic_tier:'D1',
suggested_steer:'Run `node --input-type=module --check < desktop/plugin.js` and `pytest -q` to verify your recent edits.',
suggested_subagent_goal:'Run syntax and unit test verification on desktop/plugin.js and runtime.py.'}],sparkline:[
{msg_id:1,tools:3,chars:620,errors:0},{msg_id:2,tools:4,chars:840,errors:2},
{msg_id:3,tools:5,chars:910,errors:0},{msg_id:4,tools:6,chars:1120,errors:0},
{msg_id:5,tools:4,chars:780,errors:0},{msg_id:6,tools:5,chars:950,errors:0},
{msg_id:7,tools:4,chars:1040,errors:0}],rsi:{open:[],recent:DEMO_PROBES,learned_now:[DEMO_LESSONS[0]],
matches:[DEMO_LESSONS[0]],library_size:DEMO_LESSONS.length},recent_errors:[{tool:'terminal',
detail:'exit 1: ModuleNotFoundError: No module named hermes_yaml (switched to project venv)',resolved:true}],recent_commands:[
{call_id:'cmd_1',command:'python -m pytest tests/ -q',exit_code:0,recovered:false},
{call_id:'cmd_2',command:'node --input-type=module --check < desktop/plugin.js',exit_code:0,recovered:false},
{call_id:'cmd_3',command:'python -m pytest tests/',exit_code:1,recovered:true}],
touched_files:['runtime.py','desktop/plugin.js','harness.py'],touched_files_details:[{path:'runtime.py',last_op:'patch',
edits:3,psi:{status:'ok',detail:'AST valid Python'},
diff_preview:'--- a/runtime.py\n+++ b/runtime.py\n@@ -105,3 +105,3 @@\n-VERSION = "5.7.0"\n+VERSION = "5.8.0"\n+def _extract_reasoning_text(row, msg_cols):'
},{path:'desktop/plugin.js',last_op:'patch',edits:4,psi:{status:'ok',detail:'ESM valid'},
diff_preview:'--- a/desktop/plugin.js\n+++ b/desktop/plugin.js\n@@ -252,3 +252,5 @@\n+// 1-Click Global Mode Switcher: Minimalist (Basic) vs Telemetric (Advanced)\n+const isBasicMode = settingsMode === "basic"'
},{path:'harness.py',last_op:'patch',edits:2,psi:{status:'ok',detail:'AST valid Python'},
diff_preview:'--- a/harness.py\n+++ b/harness.py\n@@ -730,3 +730,5 @@\n+def estimate_token_economics(model, inp, out, cache_read):'}
],todos:[{id:'t1',content:'Audit 18 Nous Research Catalog Rules & SSRF vectors',status:'completed'},
{id:'t2',content:'Calibrate Dual UI (Minimalist Basic vs Telemetric Advanced)',status:'completed'},
{id:'t3',content:'Verify 45+ pytest unit & adversarial stress assertions',status:'in_progress'}],subagents:DEMO_SUBAGENTS,
live:{busy:true,active_tool:'execute_code',turn_tools:4,turn_errors:0,consecutive_errors:0,model:'claude-sonnet-4-5'}}
function getPlaybookSliderVisuals(chars,isPt=false){
const k=Math.max(1,Math.min(16,Math.round((Number(chars)||4000)/ 1000)))
const t=(k - 1)/ 15
const intensity=(0.18 + t * 0.82).toFixed(2)
const brightness=(1.0 + t * 0.22).toFixed(2)
let color='#38bdf8'
let icon='zap'
let tierLabel=isPt?'Compacto Focado':'Focused Compact'
if(k>=12){color='#fde047'
icon='flame'
tierLabel=isPt?'Supernova · Playbook Total':'Supernova · Full Playbook'
}else if(k>=7){color='#ec4899'
icon='sparkle'
tierLabel=isPt?'Integração Profunda':'Deep Integration'
}else if(k>=4){color='#10b981'
icon='book'
tierLabel=isPt?'Equilibrado por Domínio':'Balanced Domain'}
return{k,chars:k * 1000,color,intensity,brightness,icon,tierLabel}}
function BtwGamifyDeck({gamifyData,isPt}){
const g=gamifyData||{}
const xp=Number(g.xp||0)
const nextXp=Math.max(300,Number(g.next_rank_xp||300))
const pct=Math.max(4,Math.min(100,Math.round((xp / nextXp)* 100)))
const rankTitle=isPt?g.rank_title_pt||'I · Cadete Observador':g.rank_title_en||'I · Cadet Observer'
const c=g.counters||{}
const achs=Array.isArray(g.achievements)?g.achievements:[]
const unlockedCount=Number(g.unlocked_count??achs.filter(a=>a.unlocked).length)
return divs({cls:'btw-gamify-deck btw-stagger-item','data-btw-role':'gamify-deck'},[divs(CLS.rowWrapBetween,[divs(CLS.row15,[codicon('trophy','0.82rem','text-amber-400'),span('btw-tx-105 font-bold uppercase tracking-wider btw-tp',isPt
? `🏆 Marcos do Playbook · ${rankTitle}` : `🏆 Playbook Milestones · ${rankTitle}`)]),spans('font-mono btw-tx-10 font-semibold text-amber-300',[
`${xp.toLocaleString()} / ${nextXp.toLocaleString()} XP · `,
isPt? `${unlockedCount}/${achs.length||12} desbloqueadas` : `${unlockedCount}/${achs.length||12} unlocked`])]),div('btw-gamify-xp-bar',div({cls:'btw-gamify-xp-fill',style:{width: `${pct}%` }})),divs('flex flex-wrap items-center gap-2 font-mono btw-tx-95 btw-ts',[
span(null,`💬 /btw cards: ${c.total_cards||0}`),
span(null,`📘 BTW.md: ${(c.btw_md_chars||0).toLocaleString()} chars`),
span(null,`🎯 Δτ helped: ${c.positive_steers||0}`),span(null,`🎨 Images: ${c.images_generated||0}`),
span(null,`🎬 Videos: ${c.videos_generated||0}`),span(null,`🤖 Subagents: ${c.subagents_count||0}`)]),achs.length>0&&div('grid grid-cols-2 gap-1.5 pt-0.5',achs.map(ach=>divs({cls:'btw-gamify-card','data-unlocked':ach.unlocked?'true':'false',style:{'--ach-color':ach.color||'#10b981'}},[divs('flex items-center justify-between gap-1',[spans('inline-flex items-center gap-1 font-semibold btw-tx-105 btw-tp truncate',[
codicon(ach.icon||'star-full','0.7rem'),
span('truncate',isPt?ach.title_pt:ach.title_en)]),span({cls:'font-mono btw-tx-9 shrink-0',style:{color:ach.unlocked?`color-mix(in srgb, ${ach.color||'#10b981'} 48%, var(--btw-text-strong))`:undefined}},ach.unlocked?'✓': `${ach.progress||0}/${ach.target||1}`)]),div('btw-tx-95 btw-tt leading-snug',isPt?ach.desc_pt:ach.desc_en)],ach.id)))])}
function LearnView({scope}){
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const backendCfg=useValue($backendSettings)||{}
const gamifyEnabled=useValue($gamifyEnabled)
const customPresets=useValue($customPresets)
const activePresets=useValue($activePresets)
const localProbes=useValue($localProbes)
const localLessons=useValue($localLessons)
const localPresetStats=useValue($localPresetStats)
const demoMode=useValue($demoShowcase)
const playbookOpen=useValue($playbookPreviewOpen)
const setPlaybookOpen=val=>$playbookPreviewOpen.set(typeof val==='function'?val($playbookPreviewOpen.get()):Boolean(val))
const growthMode=useValue($growthMode)
const charBudget=useValue($playbookCharBudget)
const autoLearnMode=useValue($autoLearnMode)
const autoLearnHook=useValue($autoLearnHook)
const autoLearnCronMins=useValue($autoLearnCronMins)
const memorySyncMode=useValue($memorySyncMode)
const howItWorksOpen=useValue($howItWorksOpen)
const expandedProbes=useValue($expandedProbeIds)
const expandedLessons=useValue($expandedLessonIds)
const expandedPacks=useValue($expandedPackIds)
const importOpen=useValue($importDrawerOpen)
const[importText,setImportText]=useState('')
const showAddLesson=useValue($addLessonOpen)
const setShowAddLesson=val=>$addLessonOpen.set(typeof val==='function'?val($addLessonOpen.get()):Boolean(val))
const[cueDraft,setCueDraft]=useState('')
const[lessonDraft,setLessonDraft]=useState('')
const[scopeDraft,setScopeDraft]=useState('INV')
const[leverDraft,setLeverDraft]=useState('C6')
const[scopeFilter,setScopeFilter]=useState('ALL')
const[leverFilter,setLeverFilter]=useState('ALL')
const[verdictFilter,setVerdictFilter]=useState('ALL')
const[lessonSearch,setLessonSearch]=useState('')
const[editingLessonId,setEditingLessonId]=useState('')
const[editCue,setEditCue]=useState('')
const[editLesson,setEditLesson]=useState('')
const[editScope,setEditScope]=useState('INV')
const[editLever,setEditLever]=useState('C6')
const[playbookTab,setPlaybookTab]=useState('preview')
const[autoLearnOpen,setAutoLearnOpen]=useState(false)
const[fullHeightPreview,setFullHeightPreview]=useState(false)
const[customPlaybookMd,setCustomPlaybookMd]=useState(null)
const[refiningPlaybook,setRefiningPlaybook]=useState(false)
const[moldingLessonId,setMoldingLessonId]=useState('')
const[syncingMemory,setSyncingMemory]=useState(false)
const targetSid=scope.storedId||scope.runtimeId||''
const rsiQuery=useQuery({queryKey:[ID,'rsi',scope.profile,targetSid],enabled:Boolean(_rest&&!demoMode),
queryFn:()=>_rest(`/rsi?session_id=${encodeURIComponent(targetSid)}`,{timeoutMs:8000}),staleTime:3000,refetchInterval:6000,
retry:1})
const packsQuery=useQuery({queryKey:[ID,'packs'],enabled:Boolean(_rest),queryFn:()=>_rest('/packs',{timeoutMs:8000}),
staleTime:60_000})
const rsiData=rsiQuery.data
const ov=demoMode?DEMO_RSI:(rsiData||{})
const remoteLessons=Array.isArray(ov.experiences)?ov.experiences:[]
const moldedSkills=Array.isArray(ov.molded_skills)?ov.molded_skills:[]
const walkthroughs=Array.isArray(ov.walkthroughs)?ov.walkthroughs:[]
useEffect(()=>{
if(demoMode)return
if(ov.growth_mode&&['isolated','lite','full'].includes(ov.growth_mode)&&ov.growth_mode!==$growthMode.get()){
$growthMode.set(ov.growth_mode)}
if(ov.btw_md_max_chars&&Number(ov.btw_md_max_chars)>=800&&Number(ov.btw_md_max_chars)!==$playbookCharBudget.get()){
$playbookCharBudget.set(Number(ov.btw_md_max_chars))}
if(ov.auto_learn?.mode&&['off','lite','medium','full'].includes(ov.auto_learn.mode)&&ov.auto_learn.mode!==$autoLearnMode.get()){
$autoLearnMode.set(ov.auto_learn.mode)}
if(typeof ov.auto_learn?.hook_enabled==='boolean'&&ov.auto_learn.hook_enabled!==$autoLearnHook.get()){
$autoLearnHook.set(ov.auto_learn.hook_enabled)}
if(typeof ov.auto_learn?.cron_minutes==='number'&&ov.auto_learn.cron_minutes!==$autoLearnCronMins.get()){
$autoLearnCronMins.set(ov.auto_learn.cron_minutes)}
if(ov.memory_md?.sync_mode&&ov.memory_md.sync_mode!==$memorySyncMode.get()){$memorySyncMode.set(String(ov.memory_md.sync_mode))}
},[demoMode,ov.growth_mode,ov.btw_md_max_chars,ov.auto_learn,ov.memory_md])
useEffect(()=>{
if(!autoLearnCronMins||autoLearnCronMins<=0||autoLearnMode==='off'||!_rest)return undefined
const timer=setInterval(()=>{
const nextCron=Number(ov.auto_learn?.next_cron_at||0)
if(nextCron>0&&Date.now()/ 1000>=nextCron&&!refiningPlaybook){
void updateAutoLearnConfig({runNow:true})}
},20000)
return()=>clearInterval(timer)
},[autoLearnCronMins,autoLearnMode,ov.auto_learn?.next_cron_at,refiningPlaybook])
useEffect(()=>{
const remRecent=Array.isArray(ov.probes_recent)?ov.probes_recent:[]
if(!localProbes?.length)return
const closedById=new Map(remRecent.filter(p=>p?.id).map(p=>[p.id,p]))
const nowSec=Date.now()/ 1000
let mutated=false
const reconciled=localProbes.filter(Boolean).map(lp=>{if(lp.status!=='open')return lp
if(closedById.has(lp.id)){mutated=true
return{...lp,...closedById.get(lp.id),status:'closed'}}
if(nowSec - Number(lp.opened_at||0)>900){mutated=true
return{...lp,status:'closed',verdict:'no_observed_effect',reason:strings.probeExpiredReason}}
return lp})
if(mutated){$localProbes.set(reconciled)
persistLocalRsi({probes:reconciled})}
},[ov.probes_recent,localProbes,strings.probeExpiredReason])
const lessons=useMemo(()=>{
if(demoMode)return[...DEMO_LESSONS]
const map=new Map(),sigSet=new Set(),nowS=Date.now()/1000
const optLocal=Array.isArray(ov.experiences)?(localLessons||[]).filter(x=>x&&nowS-Number(x.created_at||0)<15):(localLessons||[])
for(const item of[...remoteLessons,...optLocal]){
if(!item?.id)continue
const sig=`${String(item.cue||'').trim().toLowerCase()}|${String(item.lesson||'').trim().toLowerCase()}`
if(!map.has(item.id)&&!sigSet.has(sig)){map.set(item.id,item);sigSet.add(sig)}}
return[...map.values()].sort((a,b)=>Number(b.created_at||0)-Number(a.created_at||0))
},[ov.experiences,remoteLessons,localLessons,demoMode])
const filteredLessons=useMemo(()=>{
const q=lessonSearch.trim().toLowerCase()
return lessons.filter(item=>{if(scopeFilter!=='ALL'&&(item.scope||'INV')!==scopeFilter)return false
if(leverFilter!=='ALL'&&(item.lever||'C6')!==leverFilter)return false
if(q){
const hay= `${item.cue||''} ${item.lesson||''} ${item.evidence||''} ${item.domain||''}`.toLowerCase()
if(!hay.includes(q))return false}
return true})
},[lessons,scopeFilter,leverFilter,lessonSearch])
const recentProbes=useMemo(()=>{
if(demoMode){
const dSorted=[...DEMO_PROBES].sort((a,b)=>Number(b.opened_at||0)-Number(a.opened_at||0))
return verdictFilter==='ALL'?dSorted:dSorted.filter(p=>(p.status==='open'?'observed':p.verdict)===verdictFilter)}
const rem=Array.isArray(ov.probes_recent)?ov.probes_recent:[]
const map=new Map()
for(const p of[...rem,...(localProbes||[])]){if(p?.id&&!map.has(p.id))map.set(p.id,p)}
const sorted=[...map.values()].sort((a,b)=>Number(b.opened_at||0)- Number(a.opened_at||0))
if(verdictFilter==='ALL')return sorted.slice(0,8)
return sorted.filter(p=>(p.status==='open'?'observed':p.verdict)===verdictFilter).slice(0,8)
},[ov.probes_recent,localProbes,demoMode,verdictFilter])
const v=ov.verdicts||{}
const confoundedCount=Number(v.confounded||0)
const remoteClosed=Number(v.helped||0)+
Number(v.self_recovered||0)+
Number(v.hurt||0)+
Number(v.no_observed_effect||0)+
confoundedCount
const localClosedCount=demoMode?0:(localProbes||[]).filter(p=>p?.status==='closed').length
const closed=demoMode?remoteClosed:Math.max(remoteClosed,localClosedCount)
const openCount=demoMode?0:Math.max(Number(ov.probes_open||0),(localProbes||[]).filter(p=>p?.status==='open').length)
const steeredTotal=Number(v.helped||0)+Number(v.hurt||0)+Number(v.no_observed_effect||0)
const selfRecCount=Number(v.self_recovered||0)
const helpPct=steeredTotal>0?Math.round((Number(v.helped||0)/steeredTotal)*1000)/10:0
const invCount=lessons.filter(x=>(x.scope||'INV')==='INV').length
const domCount=lessons.filter(x=>x.scope==='DOM').length
const yields=useMemo(()=>{
if(demoMode)return{...(DEMO_RSI.preset_yield||{})}
const merged={...(ov.preset_yield||{})}
for(const[pid,st]of Object.entries(localPresetStats||{})){
const localU=computeClientUtilityYield(st)
if(merged[pid]==null||Math.abs(localU)>Math.abs(Number(merged[pid]||0))){merged[pid]=localU}}
return merged
},[ov.preset_yield,localPresetStats,demoMode])
const labelOf=id=>activePresets.find(p=>p?.id===id)?.label||id
const yieldRows=Object.entries(yields).sort((a,b)=>b[1]- a[1]).slice(0,8)
const maxAbs=Math.max(1,...yieldRows.map(([,u])=>Math.abs(Number(u)||0)))
const rawPacks=Array.isArray(packsQuery.data?.packs)&&packsQuery.data.packs.length>0?packsQuery.data.packs:CLIENT_FALLBACK_PACKS
const availablePacks=rawPacks.filter(p=>p&&Array.isArray(p.presets))
const generatedPlaybookMd=useMemo(()=>{if(ov.btw_md&&lessons.length===remoteLessons.length){
return String(ov.btw_md).slice(0,charBudget)}
const mdLines=['# BTW.md — Harness² Verified Agentic Workflow Playbook','',
'> Auto-maintained by **BTW Studio (Harness² RSI)**. Verified rules from `/btw` diagnostics and Δτ steer probes.','']
if(walkthroughs.length>0){mdLines.push('## Walkthroughs & Proven Workflows','')
walkthroughs.slice(0,3).forEach((wt,idx)=>{
mdLines.push(`### ${idx + 1}. [${wt.lever||'C6'} · ${wt.scope||'INV'}] ${wt.title||'Workflow'} (\`${wt.domain||'global'}\`)`)
;(wt.steps||[]).forEach(st=>mdLines.push(`- ${st}`))
mdLines.push('')})}
const activeList=lessons
if(activeList.length===0){mdLines.push('_No verified workflow rules recorded yet._')
}else{
const byDom=new Map()
for(const item of activeList.slice(0,30)){
const dKey=String(item.domain||'global').toLowerCase()
if(!byDom.has(dKey))byDom.set(dKey,[])
byDom.get(dKey).push(item)}
for(const[domName,domItems]of byDom.entries()){mdLines.push(`## Domain: \`${domName}\``,'')
for(const item of domItems){
const lv=item.lever||'C6'
const sc=item.scope||'INV'
const cu=stripInlineMarkdownPreview(item.cue||'general',120)
const ls=String(item.lesson||'').split(/\r?\n+/).map(x=>x.trim()).filter(Boolean).join(' ')
const us=Number(item.uses||1)
const vd=item.verdict||'helped'
mdLines.push(`- **[${lv} · ${sc}]** *(Cue: \`${cu}\` · Verdict: \`${vd}\` · Uses: \`${us}×\`)*: ${ls}`)}
mdLines.push('')}}
return mdLines.join('\n').trim().slice(0,charBudget)
},[ov.btw_md,lessons,remoteLessons.length,walkthroughs,charBudget])
const activePlaybookMd=customPlaybookMd!=null?customPlaybookMd:generatedPlaybookMd
const pbCharLen=activePlaybookMd.length
const pbBudgetPct=Math.min(100,Math.round((pbCharLen / Math.max(800,charBudget))* 100))
const pbBudgetColor=pbBudgetPct>90?'#f43f5e':pbBudgetPct>=75?'#f59e0b':'#10b981'
const changeGrowthMode=nextMode=>{setPref($growthMode,nextMode,'growthMode')
syncBackendSettings({growth_mode:nextMode})
haptic?.('tap')
void rsiQuery.refetch()}
const changeCharBudget=(nextBudget,immediate=false)=>{
 const snapped=Math.max(1000,Math.min(16000,Math.round((Number(nextBudget)||4000)/ 1000)* 1000))
 if(immediate)setPref($playbookCharBudget,snapped,'playbookCharBudget')
 else setPrefDebounced($playbookCharBudget,snapped)
 syncBackendSettings({btw_md_max_chars:snapped})
 if(immediate){haptic?.('tap');void rsiQuery.refetch()}
}
const updateAutoLearnConfig=async({mode,hook,cronMins,runNow=false}={})=>{
const nextC=cronMins!=null?Number(cronMins):autoLearnCronMins
const nextM=mode!=null?mode:(nextC>0&&autoLearnMode==='off'?'lite':autoLearnMode)
const nextH=hook!=null?Boolean(hook):autoLearnHook
if(mode!=null||(nextC>0&&autoLearnMode==='off'))setPref($autoLearnMode,nextM,'autoLearnMode')
if(hook!=null)setPref($autoLearnHook,nextH,'autoLearnHook')
if(cronMins!=null)setPref($autoLearnCronMins,nextC,'autoLearnCronMins')
syncBackendSettings({auto_learn_mode:nextM,auto_learn_hook:nextH,auto_learn_cron_minutes:nextC})
haptic?.('tap')
if(!_rest)return
if(runNow)setRefiningPlaybook(true)
let res=await _rest('/rsi/auto-learn',{method:'POST',body:{session_id:targetSid,mode:nextM,hook_enabled:nextH,
cron_minutes:nextC,run_now:runNow},timeoutMs:25000
}).catch(()=>null)
if(runNow){setRefiningPlaybook(false)
if(res?.refine?.experiences){$localLessons.set(res.refine.experiences)
persistLocalRsi({lessons:res.refine.experiences})}
if(res?.refine?.markdown){setCustomPlaybookMd(res.refine.markdown)}
haptic?.('success')
host.notify?.({kind:'info',message:isPt? `Ciclo Auto-Learn (${nextM.toUpperCase()}) concluído e BTW.md refinado!`
: `Auto-Learn (${nextM.toUpperCase()}) cycle completed and BTW.md refined!`})}
void rsiQuery.refetch()}
const syncToHermesMemoryNow=async(modeOverride=null)=>{if(syncingMemory)return
const nextMode=modeOverride!=null?String(modeOverride):memorySyncMode
if(modeOverride!=null){setPref($memorySyncMode,nextMode,'memorySyncMode')
syncBackendSettings({memory_md_sync_mode:nextMode})}
setSyncingMemory(true)
let res=null
if(_rest){res=await _rest('/rsi/memory/sync',{method:'POST',body:{mode:nextMode,force:true},timeoutMs:12000
}).catch(()=>null)}
setSyncingMemory(false)
void rsiQuery.refetch()
haptic?.('success')
host.notify?.({kind:'info',message:isPt
? `MEMORY.md sincronizado (${nextMode==='auto'?'Dinâmico':nextMode==='off'?'Desativado': `${nextMode}%`}) · ${res?.btw_block_chars||0} chars!`
: `Hermes MEMORY.md synced (${nextMode==='auto'?'Dynamic':nextMode==='off'?'Off': `${nextMode}%`}) · ${res?.btw_block_chars||0} chars!`
})}
const linkSessionInMesh=async(action,targetIds=[],note='')=>{if(!_rest)return
let res=await _rest('/sessions/mesh/link',{method:'POST',body:{action,session_id:targetSid,target_ids:targetIds,note},
timeoutMs:8000
}).catch(()=>null)
void rsiQuery.refetch()
haptic?.('success')
host.notify?.({kind:'info',message:isPt?action==='link_all_project'
?'Todas as sessões paralelas do projeto foram linkadas ao Guarda Anti-Conflito!':'Malha de sessões atualizada!'
:action==='link_all_project'?'All parallel project sessions linked to Conflict Guard!':'Session mesh updated!'})}
const refineAndPolishPlaybook=async(useLlm=false)=>{if(refiningPlaybook)return
setRefiningPlaybook(true)
const beforeChars=pbCharLen
let res=null
if(_rest){res=await _rest('/rsi/playbook/refine',{method:'POST',
body:{session_id:targetSid,max_chars:charBudget,use_llm:useLlm,auto_mold_skills:true},timeoutMs:25000
}).catch(()=>null)}
if(res?.ok&&Array.isArray(res.experiences)){$localLessons.set(res.experiences)
persistLocalRsi({lessons:res.experiences})
setCustomPlaybookMd(res.markdown||null)
void rsiQuery.refetch()
setRefiningPlaybook(false)
haptic?.('success')
const mergedCnt=Number(res.merged_count||0)
const savedChars=Number(res.saved_chars||Math.max(0,beforeChars -(res.after_chars||beforeChars)))
const moldedCnt=Array.isArray(res.molded_skills)?res.molded_skills.length:0
host.notify?.({kind:'info',message:isPt
? `BTW.md refinado! ${mergedCnt} duplicatas fundidas · ${savedChars} chars otimizados${moldedCnt? ` · ${moldedCnt} skill(s) moldada(s)` :''}.`
: `BTW.md refined! ${mergedCnt} duplicates merged · ${savedChars} chars saved${moldedCnt? ` · ${moldedCnt} skill(s) molded` :''}.`})
return}
const seenCues=new Set()
const compactedLessons=[]
for(const item of lessons){
const normCue=stripInlineMarkdownPreview(item.cue||'',80).toLowerCase()
if(seenCues.has(normCue))continue
seenCues.add(normCue)
compactedLessons.push({...item,cue:stripInlineMarkdownPreview(item.cue||'When pattern recurs',95),
lesson:stripInlineMarkdownPreview(item.lesson||'',200)})}
$localLessons.set(compactedLessons)
persistLocalRsi({lessons:compactedLessons})
setCustomPlaybookMd(null)
setRefiningPlaybook(false)
haptic?.('success')
host.notify?.({kind:'info',message:isPt?'BTW.md refinado e deduplicado com sucesso!':'BTW.md playbook refined & deduplicated!'})
}
const rollbackPlaybook=async()=>{if(!_rest)return
let res=await _rest('/rsi/playbook/rollback',{method:'POST',timeoutMs:8000}).catch(()=>null)
if(res?.ok&&Array.isArray(res.experiences)){$localLessons.set(res.experiences)
persistLocalRsi({lessons:res.experiences})
setCustomPlaybookMd(null)
void rsiQuery.refetch()
haptic?.('success')
host.notify?.({kind:'info',
message:isPt?'Playbook BTW.md restaurado para a versão anterior.':'BTW.md playbook restored to previous snapshot.'})}}
const moldLessonIntoSkill=async e=>{if(!e||moldingLessonId===e.id)return
setMoldingLessonId(e.id)
let res=null
if(_rest){res=await _rest('/rsi/skill/mold',{method:'POST',body:{lesson_id:e.id,cue:e.cue,lesson:e.lesson,
evidence:e.evidence,scope:e.scope,lever:e.lever,domain:e.domain,growth_mode:growthMode},timeoutMs:10000
}).catch(()=>null)}
setMoldingLessonId('')
if(res?.ok&&res.name){void rsiQuery.refetch()
haptic?.('success')
host.notify?.({kind:'info',message:isPt
? `Skill "${res.name}" (v${res.version||'1.0.0'}) moldada em SKILL.md (${res.growth_mode})!`
: `Skill "${res.name}" (v${res.version||'1.0.0'}) molded to SKILL.md (${res.growth_mode})!`})
return}
await lessonToSkill(e)}
const adoptRemote=res=>{if(!res?.ok||!Array.isArray(res.custom_presets))return
const list=res.custom_presets.map(sanitizeCustomPreset).filter(Boolean).slice(-24)
$customPresets.set(list)
savePrefs({customPresets:list})}
const installPack=async id=>{
const res=_rest?await _rest('/packs/install',{method:'POST',body:{id},timeoutMs:8000}).catch(()=>null):null
if(res?.ok){adoptRemote(res)
host.notify?.({kind:'info',message:strings.packAdded(res.added)})
return}
const pack=availablePacks.find(p=>p.id===id)
if(!pack)return
const cur=[...($customPresets.get()||[])]
const have=new Set(cur.map(x=>x.id))
let added=0
for(const p of pack.presets){
const san=sanitizeCustomPreset(p)
if(san&&!have.has(san.id)&&cur.length<24){cur.push(san)
have.add(san.id)
added +=1}}
$customPresets.set(cur)
savePrefs({customPresets:cur})
syncPresetsToBackend()
haptic?.('success')
host.notify?.({kind:'info',message:strings.packAdded(added)})}
const exportPack=async()=>{
const res=_rest?await _rest('/packs/export',{timeoutMs:8000}).catch(()=>null):null
const packObj=res?.ok&&res.pack?res.pack:{format:'btw-studio.preset-pack/1',id:'my-btw-presets',label:'My BTW presets',
presets:($customPresets.get()||[]).map(({id,icon,label,desc,prompt})=>({id,icon,label,desc,prompt}))}
await writeClipboardText(JSON.stringify(packObj,null,2))
host.notify?.({kind:'info',message:strings.packExported})}
const importPack=async()=>{if(!importText||importText.length>65536){
host.notify?.({kind:'error',message:strings.invalidJsonError})
return}
let pack=null
try{pack=JSON.parse(importText)
}catch{host.notify?.({kind:'error',message:strings.invalidJsonError})
return}
if(!pack||typeof pack!=='object'||hasForbiddenProtoKeys(pack)){
host.notify?.({kind:'error',message:strings.invalidJsonError})
return}
const res=_rest?await _rest('/packs/import',{method:'POST',body:{pack},timeoutMs:8000}).catch(()=>null):null
if(res?.ok){adoptRemote(res)
setImportText('')
host.notify?.({kind:'info',message:strings.packImported(res.added,(res.rejected||[]).length)})
return}
if(Array.isArray(pack?.presets)){
const cur=[...($customPresets.get()||[])].filter(Boolean)
const have=new Set(cur.map(x=>x.id))
let added=0
let rejected=0
for(const raw of pack.presets.slice(0,24)){
const san=sanitizeCustomPreset(raw)
if(!san)continue
const tokenMatches=[...san.prompt.matchAll(/\{\{\s*@?([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g)].map(m=>m[1].toLowerCase())
const hasUnknown=tokenMatches.some(tk=>!CONTEXT_TOKEN_KEYS.includes(tk))
if(hasUnknown){rejected +=1
continue}
if(!have.has(san.id)){cur.push(san)
have.add(san.id)
added +=1}}
$customPresets.set(cur.slice(-24))
savePrefs({customPresets:cur.slice(-24)})
syncPresetsToBackend()
setImportText('')
host.notify?.({kind:'info',message:strings.packImported(added,rejected)})}}
const submitManualLesson=async()=>{if(!lessonDraft.trim())return
const cue=cueDraft.trim()||'When this workspace pattern appears'
const lesson=lessonDraft.trim()
const expId= `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
const created=addLocalLesson({id:expId,cue,lesson,evidence:'Verified by user',scope:scopeDraft,lever:leverDraft,domain:'global'
})
if(_rest){await _rest('/rsi/experience',{method:'POST',body:{id:expId,session_id:targetSid,cue,lesson,
evidence:'Verified by user',scope:scopeDraft,lever:leverDraft,domain:'global',source:'manual'},timeoutMs:8000
}).catch(()=>null)
void rsiQuery.refetch()}
if(created){setCueDraft('')
setLessonDraft('')
setShowAddLesson(false)
haptic?.('success')
host.notify?.({kind:'info',message:strings.lessonSavedNotify})}}
const forget=async id=>{removeLocalLesson(id)
if(_rest){await _rest('/rsi/experience/delete',{method:'POST',body:{id},timeoutMs:8000}).catch(()=>null)
void rsiQuery.refetch()}}
const lessonToSkill=async e=>{
const res=_rest?await _rest('/promote',{method:'POST',
body:{target:'skill',cue:e.cue,lesson:e.lesson,lever:e.lever,scope:e.scope,mold:true},timeoutMs:8000
}).catch(()=>null):null
const draftText=res?.text||
`/learn Create a skill from this BTW Studio lesson.\nTrigger line (required, Harness² rule 1): When ${String(e.cue||'this situation reappears').replace(/^when\s+/i,'')}, load this skill.\n\nLesson:\n${e.lesson}`
const target=scope.runtimeId||scope.storedId||null
if(await host.composer?.setDraft?.(target,draftText)){host.composer?.focus?.(target)
closeAllStudioSurfaces()
host.notify?.({kind:'info',message:strings.promotedNotify})
}else{await writeClipboardText(draftText)
host.notify?.({kind:'info',message:strings.copiedNotify})}}
const startEditLesson=item=>{setEditingLessonId(item.id)
setEditCue(item.cue||'')
setEditLesson(item.lesson||'')
setEditScope(item.scope||'INV')
setEditLever(item.lever||'C6')
const cur=$expandedLessonIds.get()||{}
if(!cur[item.id])$expandedLessonIds.set({...cur,[item.id]:true})
haptic?.('tap')}
const saveEditedLesson=async item=>{if(!editLesson.trim())return
const updatedItem={...item,cue:editCue.trim()||item.cue,lesson:editLesson.trim(),scope:editScope,lever:editLever}
const prev=$localLessons.get()||[]
const exists=prev.some(x=>x.id===item.id)
const next=exists?prev.map(x=>(x.id===item.id?updatedItem:x)):[updatedItem,...prev]
$localLessons.set(next)
persistLocalRsi({lessons:next})
setEditingLessonId('')
if(_rest){await _rest('/rsi/experience',{method:'POST',body:{id:updatedItem.id,session_id:targetSid,cue:updatedItem.cue,
lesson:updatedItem.lesson,evidence:updatedItem.evidence||'Refined by user',scope:updatedItem.scope,lever:updatedItem.lever,
domain:updatedItem.domain||'global',source:'manual'},timeoutMs:8000
}).catch(()=>null)
void rsiQuery.refetch()}
haptic?.('success')
host.notify?.({kind:'info',message:strings.lessonSavedNotify})}
const toggleProbeExpand=id=>{
const cur=$expandedProbeIds.get()||{}
$expandedProbeIds.set({...cur,[id]:!cur[id]})
haptic?.('tap')}
const toggleLessonExpand=id=>{
const cur=$expandedLessonIds.get()||{}
$expandedLessonIds.set({...cur,[id]:!cur[id]})
haptic?.('tap')}
const togglePackExpand=id=>{
const cur=$expandedPackIds.get()||{}
$expandedPackIds.set({...cur,[id]:!cur[id]})
haptic?.('tap')}
const sectionTitle=(text,actionNode=null)=>divs('flex items-center justify-between gap-2 btw-tx-10 font-semibold uppercase tracking-wider btw-tq',[span(null,text),actionNode])
const growthModeDesc=growthMode==='isolated'?isPt
?'🛡 BTW Isolado: Regras e btw-skills ficam estritamente dentro do BTW Studio (zero escrita na memória/skills do Hermes principal).'
:'🛡 BTW Isolated: Rules & btw-skills stay strictly inside BTW Studio (zero writes to main Hermes memory/skills).'
:growthMode==='full'?isPt
?'🧠 BTW Full (Integração Total): BTW.md, Walkthroughs e btw-skills co-evoluem automaticamente com o Hermes Agent principal e subagentes.'
:'🧠 BTW Full (Full Integration): BTW.md, Walkthroughs & btw-skills automatically co-evolve with your main Hermes Agent and subagents.'
:isPt?'⚡ BTW Lite (Recomendado): Injeção cache-safe por domínio em subagentes/sessões e promoção de skills sob demanda.'
:'⚡ BTW Lite (Recommended): Cache-safe domain playbook for subagents/sessions plus on-demand skill promotion.'
const sliderVis=getPlaybookSliderVisuals(charBudget,isPt)
const memStatus=ov.memory_md||{sync_mode:memorySyncMode,total_chars:0,base_chars:0,btw_block_chars:0,limit_chars:2200,
free_without_btw:2200,allocated_budget_chars:220,allocated_pct:10,synced:false,preview:''}
const memLimit=Math.max(800,Number(memStatus.limit_chars||2200))
const fmtQuotaC=pct=>{const c=Math.round((memLimit * pct)/ 100);return c>=1000? `${(c / 1000).toFixed(1)}K` : `${c}c`}
const memPctLabel=memStatus.sync_mode==='off'?'Off':`${memStatus.allocated_pct??6.3}%`
const meshData=demoMode?DEMO_SESSION_MESH:(ov.session_mesh||{active_parallel_count:0,high_risk_count:0,medium_risk_count:0,linked_ids:[],
related_sessions:[],conflict_guard_directive:''})
const relatedSessions=Array.isArray(meshData.related_sessions)?meshData.related_sessions:[]
const meshHighCount=Number(meshData.high_risk_count||0)
const meshActiveCount=Number(meshData.active_parallel_count||0)
const deckAccent=growthMode==='full'?'#ec4899':growthMode==='isolated'?'#f59e0b':'#10b981'
const lessonLibraryBlock=hs(Fragment,null,[
sectionTitle(strings.lessonsTitle,uiBtn('outline','xs',{onClick:()=>setShowAddLesson(s=>!s)},strings.learnAddLessonBtn)),
showAddLesson&&divs({cls:'btw-preset-editor',onKeyDown:e=>{if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
setShowAddLesson(false)}}},[
div('btw-tx-11 font-semibold btw-tp',strings.learnAddLessonTitle),h('input',{type:'text',cls:'btw-preset-input',placeholder:strings.learnCuePlaceholder,value:cueDraft,onChange:e=>setCueDraft(e.target.value)}),h('textarea',{rows:2,cls:'btw-preset-input',placeholder:strings.learnLessonPlaceholder,value:lessonDraft,onChange:e=>setLessonDraft(e.target.value)}),divs(CLS.rowWrapBetween,[divs(CLS.row15,[jsx(SegmentedControl,{sizing:'content',value:scopeDraft,onChange:setScopeDraft,options:[{id:'INV',label:'INV'},
{id:'DOM',label:'DOM'}]}),jsx(SegmentedControl,{sizing:'content',value:leverDraft,onChange:setLeverDraft,options:[
{id:'C6',label:'C6 Skill'},{id:'C7',label:'C7 Script'},{id:'C8',label:'C8 Guard'}]})]),divs(CLS.row15,[
uiBtn('ghost','xs',{onClick:()=>setShowAddLesson(false)},strings.presetCancelBtn),
uiBtn('default','xs',{disabled:!lessonDraft.trim(),onClick:()=>void submitManualLesson()},strings.learnSaveLessonBtn)])])]),lessons.length>0&&divs('btw-learn-filter-bar',[
divs(CLS.rowWrap1,[[
{id:'ALL',label:isPt? `Todos (${lessons.length})` : `All (${lessons.length})` },{id:'INV',label: `INV (${invCount})` },
{id:'DOM',label: `DOM (${domCount})` }
].map(sc=>hBtn('btw-filter-pill',{'data-active':scopeFilter===sc.id?'true':'false',onClick:()=>setScopeFilter(sc.id)},sc.label,sc.id)),span('opacity-30 px-0.5','|'),
...['ALL','C6','C7','C8','C5'].map(lv=>hBtn('btw-filter-pill',{'data-active':leverFilter===lv?'true':'false',onClick:()=>setLeverFilter(prev=>(prev===lv&&lv!=='ALL'?'ALL':lv))},lv==='ALL'?(isPt?'Alavancas':'All Levers'):lv,lv))]),h('input',{type:'search',cls:'btw-preset-input max-w-[180px] py-0.5 btw-tx-105',placeholder:isPt?'🔍 Filtrar regras…':'🔍 Filter rules…',value:lessonSearch,onChange:e=>setLessonSearch(e.target.value)})]),lessons.length===0?divs('btw-empty-hero btw-tt',[div(null,strings.learnEmpty),uiBtn('outline','xs',{cls:'mt-1 btw-ac btw-bd-ac40',onClick:()=>{$demoShowcase.set(true)
haptic?.('tap')}},strings.demoLoadBtn)]):div('btw-lessons-bento-grid',filteredLessons.slice(0,18).map(e=>{
const isExpanded=Boolean(expandedLessons?.[e.id])
const isEditing=editingLessonId===e.id
const cleanCueTitle=stripInlineMarkdownPreview(e.cue||'When this pattern reappears',88)
const cleanLessonPreview=stripInlineMarkdownPreview(e.lesson||'',115)
const cleanEvidenceTag=e.evidence?stripInlineMarkdownPreview(humanizeProbeHeadline(e.evidence),32):''
return divs({cls:'btw-lesson btw-lesson-bento','data-scope':e.scope||'INV','data-expanded':isExpanded?'true':'false'},[divs({cls:'btw-lesson-bento-head',role:'button','aria-expanded':isExpanded?'true':'false',tabIndex:0,onClick:()=>toggleLessonExpand(e.id),onKeyDown:ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();toggleLessonExpand(e.id)}}},[divs('min-w-0 flex-1 flex flex-col gap-1 overflow-hidden',[divs('flex items-center gap-1.5 min-w-0',[
jsx(DisclosureCaret,{open:isExpanded,size:'0.72rem',className:'shrink-0 btw-ac'}),span('font-semibold btw-tx-115 btw-tp truncate',cleanCueTitle)]),!isExpanded&&div('btw-tx-105 btw-ts line-clamp-2 leading-snug pl-4',cleanLessonPreview),divs('btw-anom-meta pl-4',[jsx(Seal,{kind:'lever',children:`${e.scope||'INV'} · ${e.lever||'C6'}`}),cleanEvidenceTag&&span('sr-only',' · '),cleanEvidenceTag&&jsx(Seal,{kind:'helped',children:cleanEvidenceTag}),span('sr-only',' · '),jsx(Seal,{kind:'scope',children:e.domain||'global'}),Number(e.uses||1)>1&&span('font-mono btw-tx-95 btw-ac shrink-0',` · ${e.uses}×`)])]),divs({cls:'flex shrink-0 items-center gap-0.5',onClick:ev=>ev.stopPropagation()},[tip(isPt?'Moldar em SKILL.md (btw-skills / Hermes)':'Mold into SKILL.md (btw-skills / Hermes)',uiBtn('ghost','icon-xs',{title:strings.lessonToSkill,'aria-label':strings.lessonToSkill,disabled:moldingLessonId===e.id,onClick:()=>void moldLessonIntoSkill(e)},moldingLessonId===e.id
?jsx(GlyphSpinner,{spinner:'braille'}):codicon('book','0.74rem'))),tip(strings.lessonDelete,uiBtn('ghost','icon-xs',{title:strings.lessonDelete,'aria-label':strings.lessonDelete,onClick:()=>void forget(e.id),cls:'btw-tq hover:text-destructive'},codicon('trash','0.74rem')))])]),isExpanded&&divs('btw-lesson-bento-body btw-basic-md-overview',[isEditing?divs(CLS.col15,[h('input',{type:'text',cls:'btw-preset-input',value:editCue,onChange:ev=>setEditCue(ev.target.value)}),
h('textarea',{rows:3,cls:'btw-preset-input',value:editLesson,onChange:ev=>setEditLesson(ev.target.value)}),
divs('flex items-center justify-end gap-1.5',[
uiBtn('ghost','xs',{onClick:()=>setEditingLessonId('')},strings.presetCancelBtn),
uiBtn('default','xs',{onClick:()=>void saveEditedLesson(e)},strings.learnSaveLessonBtn)
])]):jsx(MessageTextContent,{text:buildLessonRichMarkdown(e,isPt),media:false,previewOnly:true}),divs('flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t btw-bd-st50',[
divs(CLS.rowWrap1,[hBtn('btw-action-mode-pill',{onClick:()=>void steerActiveSession(e.lesson,scope,null,{source:'lesson_library'})},isPt?'⚡ Aplicar via Steer':'⚡ Apply Steer'),hBtn('btw-action-mode-pill',{onClick:()=>void moldLessonIntoSkill(e)},isPt?'📘 Moldar SKILL.md':'📘 Mold SKILL.md'),hBtn('btw-action-mode-pill',{onClick:()=>void lessonToSkill(e)},isPt?'💬 Enviar /learn':'💬 Draft /learn')]),
divs('flex items-center gap-1',[hBtn('btw-action-mode-pill',{onClick:()=>startEditLesson(e)},isPt?'✍ Editar':'✍ Edit'),jsx(CopyButton,{text:e.lesson||'',appearance:'icon',
buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer})])])])],e.id)}))])
return divs('flex flex-col gap-2.5 text-xs pb-10',[
demoMode&&divs('flex items-center justify-between gap-2 rounded-lg border btw-bd-ac45 btw-bg-ac10 px-2.5 py-1 btw-tx-11',[jsx(Seal,{kind:'observed',children:strings.demoBadge}),uiBtn('ghost','xs',{onClick:()=>$demoShowcase.set(false)},strings.demoExitBtn)]),
divs({cls:'btw-growth-mode-bar btw-learn-command-deck btw-stagger-item',style:{'--btw-deck-accent':deckAccent}},[
divs(CLS.rowWrapBetween,[divs(CLS.row15,[typeof Loader==='function'?jsx(Loader,{type:growthMode==='full'?'lemniscate-bloom':'rose-orbit',strokeScale:1.15,className:'size-3.5 btw-ac'}):codicon('sparkle','0.78rem',CLS.accent),span('btw-tx-105 font-bold uppercase tracking-wider btw-tp',isPt?'Integração do Playbook':'Playbook Integration'),hBtn('btw-filter-pill',{'data-active':autoLearnOpen?'true':'false',onClick:()=>{setAutoLearnOpen(v=>!v);haptic?.('tap')}},`⚙ Auto-Learn (${autoLearnMode.toUpperCase()})`),hBtn('btw-filter-pill',{onClick:()=>{$howItWorksOpen.set(!howItWorksOpen);haptic?.('tap')}},isPt?(howItWorksOpen?'▾ Ocultar Ciclo':'? Ciclo Δτ'):howItWorksOpen?'▾ Hide Loop':'? Δτ Loop')]),divs({cls:CLS.rowWrap1,role:'radiogroup','aria-label':isPt?'Integração do Playbook':'Playbook Integration'},[[{id:'isolated',label:isPt?'🛡 Isolado':'🛡 Isolated'},{id:'lite',label:isPt?'⚡ Domínio':'⚡ Domain'},{id:'full',label:'🧠 Full'}].map((m,mIdx,mArr)=>hBtn('btw-growth-pill',{role:'radio','aria-checked':growthMode===m.id?'true':'false',tabIndex:growthMode===m.id?0:-1,'data-active':growthMode===m.id?'true':'false',onClick:()=>changeGrowthMode(m.id),onKeyDown:rovingKeyDown(mArr.map(x=>x.id),mIdx,changeGrowthMode)},m.label,m.id))])]),howItWorksOpen&&div('btw-tx-105 btw-ts leading-snug',growthModeDesc),howItWorksOpen&&div('btw-steps pt-1',strings.howSteps.map((s,i)=>div('btw-step',s,i))),
autoLearnOpen&&divs('btw-auto-learn-strip',[divs({cls:CLS.rowWrap15,role:'radiogroup','aria-label':'Auto-Learn mode'},[
codicon('sync','0.72rem','text-emerald-400'),span('font-mono btw-tx-95 font-bold uppercase tracking-wider btw-tp','Auto-Learn:'),...[
{id:'off',label:'Off',tip:isPt?'Refinamento manual':'Manual refinement only'},
{id:'lite',label:isPt?'⚡ Dedup $0':'⚡ $0 Dedup',tip:isPt?'Deduplicação determinística ($0)':'$0 deterministic dedup on each lesson'},
{id:'medium',label:'⚙ Medium',tip:isPt?'Deduplicação + síntese IA + MEMORY.md':'Dedup + AI synthesis + MEMORY.md'},
{id:'full',label:'🚀 Full Auto',tip:isPt?'Refinamento IA contínuo + Skills + MEMORY.md':'Continuous AI refine + Skills + MEMORY.md sync'}
].map((al,alIdx,alArr)=>hBtn('btw-filter-pill',{role:'radio','aria-checked':autoLearnMode===al.id?'true':'false',tabIndex:autoLearnMode===al.id?0:-1,'data-active':autoLearnMode===al.id?'true':'false',title:al.tip,onClick:()=>void updateAutoLearnConfig({mode:al.id}),onKeyDown:rovingKeyDown(alArr.map(x=>x.id),alIdx,id=>void updateAutoLearnConfig({mode:id}))},al.label,al.id))]),divs(CLS.rowWrap15,[hBtn('btw-filter-pill',{'aria-pressed':autoLearnHook?'true':'false','data-active':autoLearnHook?'true':'false',title:isPt?'Hook por Lição: refina automaticamente a cada nova lição':'Per-Learn Hook: auto-refines on each new lesson',onClick:()=>void updateAutoLearnConfig({hook:!autoLearnHook})},`🪝 Hook ${autoLearnHook?'ON':'OFF'}`),divs('inline-flex items-center gap-1.5',[span('font-mono btw-tx-10 font-semibold btw-ts','⏱ Cron'),div({cls:'btw-cron-seg',role:'radiogroup','aria-label':isPt?'Intervalo do Cron Auto-Learn':'Auto-Learn Cron interval'},[{m:0,l:'Off'},{m:15,l:'15m'},{m:30,l:'30m'},{m:60,l:'1h'}].map((cr,crIdx,crArr)=>hBtn('btw-cron-btn',{role:'radio','aria-checked':autoLearnCronMins===cr.m?'true':'false',tabIndex:autoLearnCronMins===cr.m?0:-1,'data-active':autoLearnCronMins===cr.m?'true':'false',onClick:()=>void updateAutoLearnConfig({cronMins:cr.m}),onKeyDown:rovingKeyDown(crArr.map(x=>x.m),crIdx,val=>void updateAutoLearnConfig({cronMins:val}))},cr.l,cr.m)))]),hBtn('btw-action-mode-pill',{disabled:refiningPlaybook,title:isPt?'Executar ciclo completo de Auto-Learn agora':'Run full Auto-Learn cycle now',onClick:()=>void updateAutoLearnConfig({runNow:true})},refiningPlaybook?'⟳ …':isPt?'▶ Rodar Agora':'▶ Run Now')])])]),divs('btw-live-dash-grid btw-kpi-grid',[divs({cls:'btw-dash-tile btw-kpi btw-stagger-item',style:{'--btw-tile-glow':helpPct>=60?'#10b981':'#38bdf8'}},[
jsx(SvgRingGauge,{pct:steeredTotal>0||demoMode?helpPct:0,color:helpPct>=60?'#10b981':'#38bdf8',size:40,centerLabel:steeredTotal>0||demoMode?`${Math.round(helpPct)}%`:'Δτ'}),divs('min-w-0 flex flex-col gap-0.5',[h('small',CLS.kpiLbl,strings.kpiHelpRate),
h('b','font-mono btw-tx-13 font-bold btw-tp truncate',steeredTotal>0||demoMode?`${helpPct}%`:'—'),span('btw-tx-95 text-emerald-400 font-medium truncate',`${v.helped||0}/${steeredTotal} steered · ${selfRecCount} auto-recovered${confoundedCount>0?` · ${confoundedCount} confounded`:''}`)])]),divs({cls:'btw-dash-tile btw-kpi btw-stagger-item',style:{'--btw-tile-glow':'#38bdf8',animationDelay:'35ms'}},[
jsx(SvgRingGauge,{pct:closed>0?Math.min(100,Math.round(((closed-confoundedCount)/Math.max(1,closed))*100)):100,color:'#38bdf8',size:40,centerLabel:String(closed)}),divs('min-w-0 flex flex-col gap-0.5',[h('small',CLS.kpiLbl,strings.kpiProbes),
h('b','font-mono btw-tx-13 font-bold btw-tp truncate',`${pl(closed,isPt?'sonda':'probe',isPt?'sondas':'probes')}${openCount>0?` (+${openCount} ⏳)`:''}`),span('btw-tx-95 btw-ts truncate',`${steeredTotal} steered · ${selfRecCount} auto-recovered${confoundedCount>0?` · ${confoundedCount} confounded`:''}`)])]),divs({cls:'btw-dash-tile btw-kpi btw-stagger-item','data-clickable':'true',style:{'--btw-tile-glow':sliderVis.color,animationDelay:'70ms'},onClick:()=>{setPlaybookOpen(vOpen=>!vOpen);haptic?.('tap')}},[typeof Blobatar==='function'?div({cls:'flex btw-sz-42 shrink-0 items-center justify-center rounded-full border btw-bd-ac35 btw-bg-ac12',style:{width:'40px',height:'40px'}},span('btw-blobatar-wrap',jsx(Blobatar,{name:String(scope.profile||'harness'),size:22,animate:'always'}))):jsx(SvgRingGauge,{pct:pbBudgetPct,color:sliderVis.color,size:40,centerLabel:`${sliderVis.k}K`}),divs('min-w-0 flex flex-col gap-0.5',[h('small',CLS.kpiLbl,isPt?'PLAYBOOK & MEMÓRIA':'PLAYBOOK & MEMORY'),h('b','font-mono btw-tx-125 font-bold btw-tp truncate',`${pl(lessons.length,isPt?'regra':'rule',isPt?'regras':'rules')} · ${pl(moldedSkills.length,'skill')}`),divs('flex items-center gap-1.5 min-w-0',[span('btw-tx-95 btw-ts truncate',`${invCount} INV · ${domCount} DOM`),span('btw-tile-mini-btn',playbookOpen?'▾ BTW.md':'▸ BTW.md')])])]),divs({cls:'btw-dash-tile btw-kpi btw-stagger-item','data-clickable':'true',style:{'--btw-tile-glow':meshHighCount>0?'#f43f5e':meshActiveCount>0?'#f59e0b':'#10b981',animationDelay:'105ms'},onClick:()=>{$activeTab.set('mesh');haptic?.('tap')}},[(openCount>0||meshActiveCount>0)&&typeof Loader==='function'?divs('btw-velocity-orb-busy',[div('btw-velocity-orbit-ring'),jsx(Loader,{type:'spiral-search',strokeScale:1.15,className:'size-6 btw-ac'})]):jsx(SvgRingGauge,{pct:meshHighCount>0?100:85,color:meshHighCount>0?'#f43f5e':'#10b981',size:40,centerLabel:String(meshActiveCount)}),divs('min-w-0 flex flex-col gap-0.5',[
h('small',CLS.kpiLbl,isPt?'MALHA ATIVA & CONFLITOS':'ACTIVE MESH & CONFLICTS'),h('b','font-mono btw-tx-12 font-bold btw-tp truncate',meshActiveCount>0?(isPt?pl(meshActiveCount,'paralela ativa','paralelas ativas'):`${meshActiveCount} active parallel`):(isPt?'0 paralelas ativas':'0 active parallel')),span({cls:cn('btw-tx-95 font-medium truncate',meshHighCount>0?'text-rose-400':CLS.accent)},meshHighCount>0?(isPt?`⚠ ${pl(meshHighCount,'risco de colisão','riscos de colisão')} · Malha →`:`⚠ ${pl(meshHighCount,'collision risk')} · Mesh →`):(isPt?'Sessões ativas · Malha →':'Active sessions · Mesh →'))])])]),
divs('btw-playbook-manager',[
refiningPlaybook&&div('btw-specialist-scan-bar'),divs(CLS.rowWrapBetween,[divs('flex min-w-0 items-center gap-2',[jsx(SvgRingGauge,{pct:pbBudgetPct,color:pbBudgetColor,size:34,centerLabel:`${sliderVis.k}K`}),divs('min-w-0',[divs('flex items-center gap-1.5 btw-tx-11 font-bold btw-tp',[span(null,'📘 BTW.md Playbook'),span({cls:'font-mono btw-tx-10 btw-slider-readout',style:{color:`color-mix(in srgb, ${pbBudgetColor} 52%, var(--btw-text-strong))`}},`[${pbCharLen.toLocaleString()} / ${charBudget.toLocaleString()} chars · ${pbBudgetPct}%]`)]),div('btw-tx-10 btw-tt truncate',isPt?`${pl(lessons.length,'regra','regras')} · ${pl(walkthroughs.length,'walkthrough')} · ${pl(moldedSkills.length,'skill')} · MEMORY.md (${memPctLabel})`:`${pl(lessons.length,'rule')} · ${pl(walkthroughs.length,'walkthrough')} · ${pl(moldedSkills.length,'skill')} · MEMORY.md (${memPctLabel})`)])]),divs(CLS.rowWrap1,[hBtn('btw-composer-synth-btn',{disabled:refiningPlaybook,title:isPt?'Deduplicar, fundir lições e polir o BTW.md':'Deduplicate, merge repeated lessons, and polish BTW.md',onClick:()=>void refineAndPolishPlaybook(true)},[refiningPlaybook?jsx(GlyphSpinner,{spinner:'braille'}):codicon('sparkle','0.72rem'),span(null,refiningPlaybook?(isPt?'Refinando…':'Refining…'):(isPt?'✦ Refinar BTW.md':'✦ Refine BTW.md'))]),hBtn('btw-action-mode-pill',{'aria-expanded':playbookOpen?'true':'false',onClick:()=>{setPlaybookOpen(vOpen=>!vOpen);haptic?.('tap')}},playbookOpen?(isPt?'▾ Ocultar BTW.md':'▾ Hide BTW.md'):(isPt?'📖 Ver BTW.md':'📖 View BTW.md')),hBtn('btw-action-mode-pill',{title:`Sync quota cap: ${memStatus.sync_mode||'10'}%`,onClick:()=>{setPlaybookOpen(true);setPlaybookTab('memory');haptic?.('tap')}},`🧠 MEMORY.md (${memPctLabel})`),ov.has_backup&&hBtn('btw-action-mode-pill',{title:isPt?'Desfazer último refinamento':'Undo last BTW.md refinement',onClick:()=>void rollbackPlaybook()},'↩ Undo')])]),div('btw-budget-track',div({cls:'btw-budget-fill',style:{width:`${pbBudgetPct}%`,background:`linear-gradient(90deg, #10b981 0%, ${pbBudgetColor} 100%)`}})),playbookOpen&&divs('flex flex-col gap-2 pt-1.5 border-t btw-bd-st50',[
divs({cls:'btw-luminous-slider-wrap',style:{'--slider-color':sliderVis.color,'--slider-intensity':sliderVis.intensity,'--slider-brightness':sliderVis.brightness}},[divs('flex items-center justify-between gap-2 btw-tx-10',[spans('inline-flex items-center gap-1.5 font-semibold btw-str',[codicon(sliderVis.icon,'0.74rem',CLS.accent),span(null,isPt?`Dimensão do BTW.md: ${sliderVis.k}K (${charBudget.toLocaleString()} chars) — ${sliderVis.tierLabel}`:`BTW.md Capacity: ${sliderVis.k}K (${charBudget.toLocaleString()} chars) — ${sliderVis.tierLabel}`)]),jsx(ComposerModelPicker,{compact:true,providerValue:backendCfg.fast_provider||'',modelValue:backendCfg.fast_model||'',onSelect:({provider,model,base_url})=>{const patch={fast_provider:provider||'',fast_model:model||''};if(base_url&&!backendCfg.fast_base_url)patch.fast_base_url=base_url;syncBackendSettings(patch)}})]),
h('input',{type:'range',min:1000,max:16000,step:1000,value:Math.max(1000,Math.min(16000,charBudget)),cls:'btw-luminous-slider','aria-label':isPt?'Tamanho máximo do BTW.md em passos de 1K':'BTW.md max size in 1K steps',onChange:e=>changeCharBudget(Number(e.target.value),false),onPointerUp:()=>{flushPendingPrefs();void rsiQuery.refetch()},onBlur:()=>flushPendingPrefs()}),div('btw-luminous-slider-ticks',[1,4,7,10,13,16].map(kStep=>hBtn('btw-luminous-tick',{'data-active':sliderVis.k===kStep?'true':'false',onClick:()=>changeCharBudget(kStep*1000,true)},`${kStep}K`,kStep)))]),
divs(CLS.rowWrapBetween,[divs({cls:CLS.rowWrap1,role:'tablist','aria-label':'Playbook views'},[[{id:'preview',label:'👁 Rich Markdown (BTW.md)'},{id:'memory',label:`🧠 Hermes MEMORY.md (${memPctLabel})`},{id:'skills',label:`📘 BTW Skills (${moldedSkills.length})`},{id:'edit',label:isPt?'✍ Editar Raw':'✍ Edit Raw'}].map((tb,tbIdx,tbArr)=>hBtn('btw-filter-pill',{role:'tab','aria-selected':playbookTab===tb.id?'true':'false',tabIndex:playbookTab===tb.id?0:-1,'data-active':playbookTab===tb.id?'true':'false',onClick:()=>setPlaybookTab(tb.id),onKeyDown:rovingKeyDown(tbArr.map(x=>x.id),tbIdx,setPlaybookTab)},tb.label,tb.id))]),divs(CLS.row15,[
playbookTab==='preview'&&hBtn('btw-action-mode-pill',{onClick:()=>setFullHeightPreview(vH=>!vH)},fullHeightPreview?(isPt?'🗕 Compactar':'🗕 Compact'):(isPt?'🗖 Expandir 100%':'🗖 Full Expand')),hBtn('btw-action-mode-pill',{onClick:()=>void refineAndPolishPlaybook(true)},isPt?'✦ Polimento IA':'✦ AI Polish'),hBtn('btw-action-mode-pill',{onClick:async()=>{await writeClipboardText(activePlaybookMd);haptic?.('success');host.notify?.({kind:'info',message:strings.copiedNotify})}},strings.playbookCopyBtn),hBtn('rounded p-0.5 btw-tt btw-hv-tp cursor-pointer',{'aria-label':strings.tipClose,title:strings.tipClose,onClick:()=>setPlaybookOpen(false)},codicon('close','0.72rem'))])]),playbookTab==='preview'&&
div({cls:cn('btw-rich-playbook-stage btw-basic-md-overview btw-selectable-prose',
fullHeightPreview?'max-h-[72vh]':'max-h-[420px]')},jsx(MessageTextContent,{text:activePlaybookMd,media:false,previewOnly:true})),playbookTab==='memory'&&
divs('btw-memory-sync-card',[divs(CLS.rowWrapBetween,[divs('min-w-0',[div('btw-tx-11 font-bold btw-tp',isPt?'🧠 Integração com a Memória do Hermes (MEMORY.md)':'🧠 Hermes Memory Integration (MEMORY.md)'),
div('font-mono btw-tx-10 btw-ts',isPt
? `Ocupação Base: ${(memStatus.base_chars||0).toLocaleString()} / ${memLimit.toLocaleString()} chars · Bloco BTW.md: ${(memStatus.btw_block_chars||0).toLocaleString()} chars (Alocado: ${(memStatus.allocated_budget_chars||0).toLocaleString()} chars · ${memPctLabel})`
: `Base Occupancy: ${(memStatus.base_chars||0).toLocaleString()} / ${memLimit.toLocaleString()} chars · BTW.md Block: ${(memStatus.btw_block_chars||0).toLocaleString()} chars (Allocated: ${(memStatus.allocated_budget_chars||0).toLocaleString()} chars · ${memPctLabel})`)]),hBtn('btw-composer-synth-btn',{disabled:syncingMemory,onClick:()=>void syncToHermesMemoryNow()},syncingMemory?isPt?'Sincronizando…':'Syncing…':isPt
?'🔄 Sincronizar MEMORY.md Agora':'🔄 Sync MEMORY.md Now')]),divs({cls:'btw-memory-bar-track',title: `Base MEMORY.md: ${memStatus.base_chars} chars | BTW.md Synthesis: ${memStatus.allocated_budget_chars} chars | Limit: ${memLimit.toLocaleString()} chars`},[div({cls:'btw-memory-bar-base',style:{width: `${Math.min(100,Math.round(((memStatus.base_chars||0)/ memLimit)* 100))}%` }}),div({cls:'btw-memory-bar-btw',style:{width: `${Math.min(35,Math.round(((memStatus.allocated_budget_chars||0)/ memLimit)* 100))}%` }})]),divs(CLS.rowWrapBetweenSm,[span('btw-tx-10 btw-tt',isPt?'Cota do MEMORY.md destinada à síntese do BTW.md:':'MEMORY.md quota allocated to BTW.md synthesis:'),divs(CLS.rowWrap1,[{id:'off',label:'Off (0%)'},
{id:'auto',label:isPt?'✨ Auto Dinâmico':'✨ Auto Dynamic'},{id:'5',label: `5% (${fmtQuotaC(5)})` },{id:'10',label: `10% (${fmtQuotaC(10)})` },
{id:'15',label: `15% (${fmtQuotaC(15)})` },{id:'20',label: `20% (${fmtQuotaC(20)})` },{id:'25',label: `25% (${fmtQuotaC(25)})` }
].map(opt=>hBtn('btw-filter-pill',{'data-active':String(memorySyncMode)===opt.id?'true':'false',onClick:()=>void syncToHermesMemoryNow(opt.id)},opt.label,opt.id)))]),memStatus.preview&&div('btw-rich-playbook-stage max-h-[200px]',jsx(MessageTextContent,{text:memStatus.preview,media:false,previewOnly:true}))]),playbookTab==='skills'&&
div('flex flex-col gap-1.5 max-h-[280px] overflow-y-auto',moldedSkills.length===0?div('btw-tx-11 btw-tt py-2',isPt
?'Nenhuma btw-skill moldada ainda. Clique no ícone 📘 em qualquer lição abaixo ou em "✦ Refinar BTW.md" para gerar SKILL.md complementares.'
:'No btw-skills molded yet. Click 📘 on any lesson below or "✦ Refine BTW.md" to generate complementary SKILL.md files.')
:moldedSkills.map(sk=>divs('flex items-center justify-between gap-2 rounded-lg border btw-bd-st60 px-2.5 py-1.5',[
divs('min-w-0 flex-1',[divs('flex items-center gap-1.5 font-mono btw-tx-11 font-semibold btw-ac',[
span(null,`📘 ${sk.qualified_name||sk.name}`),
span('btw-tx-95 btw-tt',`v${sk.version||'1.0.0'} · ${sk.scope_origin}`)]),
div('btw-tx-105 btw-ts truncate',sk.trigger||sk.description)]),
jsx(CopyButton,{text: `skill_view(name="${sk.qualified_name||sk.name}")`,appearance:'icon',buttonSize:'icon-xs',
title:'Copy skill_view call','aria-label':'Copy skill_view call'})],sk.name))),playbookTab==='edit'&&divs('flex flex-col gap-1.5',[
h('textarea',{rows:8,cls:'btw-preset-input font-mono btw-tx-105',value:activePlaybookMd,onChange:e=>setCustomPlaybookMd(e.target.value.slice(0,charBudget))}),
divs('flex items-center justify-end gap-1.5',[
customPlaybookMd!==null&&uiBtn('ghost','xs',{onClick:()=>setCustomPlaybookMd(null)},isPt?'Descartar':'Discard'),
hBtn('btw-composer-synth-btn',{disabled:!activePlaybookMd.trim(),onClick:async()=>{
let saved=null
if(typeof host?.request==='function'){try{saved=await host.request(`plugin.${ID}.playbook_save`,{markdown:activePlaybookMd})}catch{saved=null}}
if(!saved?.ok&&_rest){try{saved=await _rest('/rsi/playbook/save',{method:'POST',body:{markdown:activePlaybookMd},timeoutMs:8000})}catch{saved=null}}
if(saved?.ok){setCustomPlaybookMd(null);void rsiQuery.refetch();haptic?.('success');host.notify?.({kind:'info',message:isPt?'BTW.md salvo com sucesso!':'BTW.md saved!'})}
else if(saved?.error){host.notify?.({kind:'warning',message:String(saved.error)})}
}},isPt?'✓ Salvar BTW.md':'✓ Save BTW.md')])])])]),
lessonLibraryBlock,
(gamifyEnabled||Boolean(backendCfg.gamify_enabled))&&jsx(BtwGamifyDeck,{gamifyData:ov.gamify,isPt}),
(closed>0||openCount>0)&&sectionTitle(isPt?'SONDAS DE STEER RECENTES':'RECENT STEER PROBES'),
(closed>0||openCount>0)&&divs(CLS.rowWrap15,[hBtn('btw-filter-pill',{'data-active':verdictFilter==='ALL'?'true':'false',onClick:()=>setVerdictFilter('ALL')},isPt?`Todos (${closed+openCount})`:`All (${closed+openCount})`),openCount>0&&hBtn('bg-transparent border-0 p-0 cursor-pointer',{onClick:()=>setVerdictFilter(prev=>prev==='observed'?'ALL':'observed')},jsx(Seal,{kind:'observed',children:`${isPt?'medindo':'measuring'} ${openCount}`})),
...['helped','self_recovered','hurt','no_observed_effect','confounded'].map(k=>hBtn('bg-transparent border-0 p-0 cursor-pointer',{onClick:()=>setVerdictFilter(prev=>prev===k?'ALL':k)},jsx(Seal,{kind:(k==='hurt'&&!(v.hurt>0))?'scope':k,children:`${strings.verdictNames[k]} ${v[k]||0}`}),k))]),
recentProbes.length>0&&div(CLS.col15,recentProbes.slice(0,6).map(p=>{
const isOpen=Boolean(expandedProbes?.[p.id])
const cleanHead=stripInlineMarkdownPreview(humanizeProbeHeadline(p.text||p.target_kind||p.id),92)
const cleanReason=stripInlineMarkdownPreview(humanizeProbeHeadline(p.reason||strings.probeMeasuringReason),102)
const dScore=typeof p.delta?.score==='number'?`${p.delta.score>=0?'+':''}${p.delta.score.toFixed(2)}`:null
const dAlign=typeof p.delta?.alignment==='number'&&p.delta.alignment>0?`${Math.round(p.delta.alignment*100)}%`:null
const dConf=p.delta?.confidence?String(p.delta.confidence).toUpperCase():null
const probeMd=[`**Directive:** ${humanizeProbeHeadline(p.text||p.target_kind||p.id)}`,'',`> **Δτ Verdict (\`${p.verdict||p.status}\`):** ${humanizeProbeHeadline(p.reason||strings.probeMeasuringReason)}`,...(dScore?['',`**Causal Contrast Vector (\`Δτ = ${dScore}\`):** \`ΔS_err=${p.delta?.error_delta??0}\` · \`ΔS_anom=${p.delta?.anomaly_delta??0}\` · \`S_prog=${p.delta?.progress??0}\` · \`S_align=${dAlign||'0%'}\` · **Confidence:** \`${dConf||'MEDIUM'}\``]:[])].join('\n')
return divs({cls:'btw-sub-accordion','data-open':isOpen?'true':'false'},[divs({cls:'btw-sub-accordion-head',role:'button','aria-expanded':isOpen?'true':'false',tabIndex:0,onClick:()=>toggleProbeExpand(p.id),onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleProbeExpand(p.id)}}},[divs(CLS.rowMin0,[jsx(DisclosureCaret,{open:isOpen,size:'0.7rem',className:'shrink-0 btw-ac'}),p.status==='open'&&typeof Loader==='function'?jsx(Loader,{type:'rose-orbit',className:'size-3.5 btw-ac shrink-0'}):null,divs('min-w-0 flex-1 overflow-hidden',[div('truncate font-medium btw-tp',cleanHead),!isOpen&&div('btw-tx-10 btw-tt truncate',cleanReason)])]),jsx(Seal,{kind:p.status==='open'?'observed':p.verdict||'no_observed_effect',children:p.status==='open'?strings.probeMeasuringLabel:strings.verdictNames[p.verdict]||p.verdict||strings.probeClosedLabel})]),isOpen&&divs('btw-sub-accordion-body btw-basic-md-overview flex flex-col gap-2',[jsx(MessageTextContent,{text:probeMd,media:false,previewOnly:true}),divs('flex flex-wrap items-center justify-between gap-2 pt-1 border-t btw-bd-st50',[spans(CLS.mono10Muted,[`Source: ${p.source||'steer'}`,p.target_kind?` · Target: ${p.target_kind}`:'',p.delta?` · Errors: ${p.delta.pre_streak??0}→${p.delta.post_errors??0}`:'']),divs(CLS.row15,[jsx(CopyButton,{text:p.text||'',appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer}),p.text&&hBtn('btw-action-mode-pill',{onClick:()=>void steerActiveSession(p.text,scope,null,{source:'probe_replay'})},isPt?'⚡ Re-enviar Steer':'⚡ Re-apply Steer')])])])],p.id)})),
yieldRows.length>0&&sectionTitle(strings.yieldTitle),yieldRows.length>0&&div(CLS.col15,yieldRows.map(([id,u])=>{
const st=(ov.preset_stats||{})[id]||(localPresetStats||{})[id]||{}
return divs('btw-yield-bento',[divs(CLS.rowBetween,[divs('flex min-w-0 items-center gap-1.5',[
span('truncate font-medium btw-tp',labelOf(id)),st.runs>0&&span(CLS.mono95Muted,`${st.runs}× · ${st.helped||0}✓`)]),span({cls:cn('font-mono btw-tx-105 font-semibold',u>=0?'text-emerald-400':'text-amber-400')},`U=${u}`)]),
div({cls:'btw-yield-bar btw-yield-bar-spring','data-neg':u<0?'true':'false'},h('i',{style:{width: `${Math.max(6,Math.round((Math.abs(u)/ maxAbs)* 100))}%` }}))],id)})),
Array.isArray(ov.prune_candidates)&&ov.prune_candidates.length>0&&div('btw-warn-text btw-tx-105',`${strings.pruneHint}: ${ov.prune_candidates.map(labelOf).join(', ')}`),sectionTitle(strings.packsTitle,hBtn('btw-action-mode-pill',{onClick:()=>$importDrawerOpen.set(!importOpen)},isPt?'📦 Importar / Exportar JSON':'📦 Import / Export JSON')),div('btw-packs-grid',availablePacks.map(p=>{
const isPackOpen=Boolean(expandedPacks?.[p.id])
const allInstalled=(p.presets||[]).filter(Boolean).every(x=>(customPresets||[]).filter(Boolean).some(c=>c.id===x.id))
return divs('flex flex-col gap-1.5 rounded-lg border btw-bd px-2.5 py-2',[
divs(CLS.rowBetween,[hsBtn('min-w-0 flex-1 text-left bg-transparent border-0 p-0 cursor-pointer',{onClick:()=>togglePackExpand(p.id)},[
divs('flex items-center gap-1 font-medium btw-tp truncate',[
jsx(DisclosureCaret,{open:isPackOpen,size:'0.68rem',className:CLS.accent}),
span('truncate',p.label)]),
div('btw-tx-105 btw-tt truncate pl-3.5',`${p.desc} · ${p.presets.length}`)]),
uiBtn(allInstalled?'secondary':'outline','xs',{disabled:allInstalled,onClick:()=>void installPack(p.id)},allInstalled?(isPt?'✓ Instalado':'✓ Installed'):strings.packInstall)]),
isPackOpen&&div('flex flex-col gap-1 pt-1 border-t btw-bd-st50 btw-tx-10',(p.presets||[]).map(pr=>divs('flex items-start justify-between gap-1.5 rounded btw-bg-tp3 px-2 py-1',[divs('min-w-0 flex-1',[div('font-semibold btw-tp',pr.label),
div('font-mono btw-tx-95 btw-tt truncate',pr.prompt)])],pr.id)))],p.id)})),(importOpen||importText.trim().length>0)&&divs(CLS.col15,[h('textarea',{rows:2,cls:'btw-preset-input font-mono btw-tx-105',placeholder:strings.packImportPlaceholder,value:importText,onChange:e=>setImportText(e.target.value)}),divs('flex items-center justify-end gap-1.5',[
uiBtn('ghost','xs',{onClick:()=>void exportPack()},strings.packExport),
uiBtn('default','xs',{disabled:!importText.trim(),onClick:()=>void importPack()},strings.packImportBtn)])])])}
function PresetEditorCard({surface='ask',onSaved}){
const draft=useValue($presetEditorDraft)
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
const nameRef=useRef(null)
const promptRef=useRef(null)
const focusedIds=resolveFocusedIds()
const preview=useResolvedPreview(draft?.prompt||'',focusedIds.storedId||focusedIds.runtimeId,Boolean(draft))
const isVisibleHere=Boolean(draft&&(draft.surface||'ask')===surface)
useEffect(()=>{if(!isVisibleHere)return undefined
const timer=setTimeout(()=>{nameRef.current?.focus?.({preventScroll:true})
},25)
return()=>clearTimeout(timer)
},[isVisibleHere,draft?.id,draft?.replaceBuiltinId])
if(!isVisibleHere)return null
const isEditing=Boolean(draft.id||draft.replaceBuiltinId)
const canSave=Boolean(String(draft.label||'').trim()&&String(draft.prompt||'').trim())
const patchDraft=fields=>{
const cur=$presetEditorDraft.get()
if(cur)$presetEditorDraft.set({...cur,...fields})}
const closeEditor=()=>{$presetEditorDraft.set(null)
onSaved?.()}
const commitSave=()=>{if(!canSave)return
const saved=addOrUpdateCustomPreset(draft)
if(saved){$presetEditorDraft.set(null)
onSaved?.()}}
const handleKeyDown=e=>{if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
closeEditor()
}else if(isSubmitEnter(e)&&(e.ctrlKey||e.metaKey)){e.preventDefault()
commitSave()}}
return divs({cls:'btw-preset-editor',onKeyDown:handleKeyDown},[divs(CLS.rowBetween,[divs('flex items-center gap-1.5 btw-tx-115 font-semibold btw-tp',[
codicon(draft.icon||'zap','0.8rem',CLS.accent),
span(null,isEditing?strings.presetEditorEditTitle:strings.presetEditorNewTitle)]),uiBtn('ghost','icon-xs',{onClick:closeEditor,title:strings.presetCancelBtn,'aria-label':strings.presetCancelBtn},codicon('close'))]),div({cls:'btw-preset-icons-bar',role:'radiogroup','aria-label':strings.presetIconLabel},PRESET_ICONS.map((ic,icIdx)=>hBtn('btw-preset-icon-opt',{role:'radio','aria-checked':(draft.icon||'zap')===ic?'true':'false','aria-label':ic,tabIndex:(PRESET_ICONS.includes(draft.icon||'zap')?(draft.icon||'zap')===ic:icIdx===0)?0:-1,'data-selected':(draft.icon||'zap')===ic?'true':'false',title:ic,onClick:()=>patchDraft({icon:ic}),onKeyDown:rovingKeyDown(PRESET_ICONS,icIdx,val=>patchDraft({icon:val}))},codicon(ic,'0.76rem'),ic))),divs('btw-packs-grid',[h('input',{ref:nameRef,type:'text',maxLength:48,cls:'btw-preset-input font-medium',placeholder:strings.presetNamePlaceholder,value:draft.label||'',onChange:e=>patchDraft({label:e.target.value})}),h('input',{type:'text',maxLength:140,cls:'btw-preset-input',placeholder:strings.presetDescPlaceholder,value:draft.desc||'',onChange:e=>patchDraft({desc:e.target.value})})]),h('textarea',{ref:promptRef,rows:2,maxLength:1200,cls:'btw-preset-input resize-y min-h-[46px] max-h-[120px]',placeholder:strings.presetPromptPlaceholder,value:draft.prompt||'',onChange:e=>patchDraft({prompt:e.target.value})}),
jsx(TokenChips,{targetRef:promptRef,onInsert:next=>patchDraft({prompt:next})}),jsx(ResolvedPreview,{res:preview}),
divs('flex items-center justify-end gap-1.5 pt-0.5',[uiBtn('ghost','xs',{onClick:closeEditor},strings.presetCancelBtn),uiBtn('default','xs',{disabled:!canSave,onClick:commitSave},spans(CLS.inline1,[codicon('check','0.72rem'),strings.presetSaveBtn]))])])}
function buildClientSpecialistRecommendation(snap,activePresets,presetStatsMap,lang='en'){
const isPt=String(lang||'en').toLowerCase().startsWith('pt')
const nowSec=Date.now()/ 1000
const live=snap?.live||{}
const anomalies=Array.isArray(snap?.anomalies)?snap.anomalies.filter(Boolean):[]
const recentErrors=Array.isArray(snap?.recent_errors)?snap.recent_errors.filter(e=>e&&!e.resolved):[]
const touchedFiles=Array.isArray(snap?.touched_files)?snap.touched_files.filter(Boolean):[]
const todos=Array.isArray(snap?.todos)?snap.todos.filter(Boolean):[]
const subagents=Array.isArray(snap?.subagents)?snap.subagents.filter(Boolean):[]
const runningSubs=subagents.filter(s=>s.status==='running'||!s.ended_at)
const failedSubs=subagents.filter(s=>s.status==='failed')
const tokensInfo=snap?.tokens||{}
const inTok=Math.max(0,Number(tokensInfo.input||0))
const cacheTok=Math.max(0,Number(tokensInfo.cache_read||0))
const totTok=Math.max(0,Number(tokensInfo.total||inTok + Number(tokensInfo.output||0)))
let cacheHitPct=inTok>0?Math.round((cacheTok / Math.max(1,inTok))* 1000)/ 10:0
if(cacheHitPct>100)cacheHitPct=Math.round((cacheTok / Math.max(1,inTok + cacheTok))* 1000)/ 10
const ctxOccPct=Math.round(Math.min(100,Math.max(0,Number(snap?.context_window?.occupancy_pct||0)))* 10)/ 10
const toolCallsCnt=Math.max(0,Number(snap?.counts?.tool_calls||0))
const errStreak=Math.max(0,Number(live.consecutive_errors||0))
const hasHighAnom=anomalies.some(a=>a?.severity==='high')
const hasMedAnom=anomalies.some(a=>a?.severity==='medium')
const attentionLevel=errStreak>=2||recentErrors.length>=2||hasHighAnom||failedSubs.length>0||ctxOccPct>=88?'high'
:recentErrors.length===1||hasMedAnom||anomalies.length>0||ctxOccPct>=75||(inTok>15000&&cacheHitPct<45)?'medium'
:'low'
const specialistMetrics={errors_active:recentErrors.length,anomalies_count:anomalies.length,cache_hit_pct:cacheHitPct,
context_occ_pct:ctxOccPct,total_tokens:totTok,tool_calls:toolCallsCnt,subagents_count:subagents.length,
cost_usd:Math.round(Number(tokensInfo.cost_usd||0)* 10000)/ 10000}
let specialistDiagnosis=''
if(attentionLevel==='high'){specialistDiagnosis=isPt
? `Atenção Crítica: ${recentErrors.length} erro(s) ativo(s), ${anomalies.length} anomalia(s), contexto em ${ctxOccPct}% e cache L0 em ${cacheHitPct}%.`
: `High Attention: ${recentErrors.length} active error(s), ${anomalies.length} anomaly(ies), context at ${ctxOccPct}% and L0 cache at ${cacheHitPct}%.`
}else if(attentionLevel==='medium'){
const topIssue=anomalies[0]?.title||(recentErrors[0]?.tool? `erro em ${recentErrors[0].tool}` : `contexto ${ctxOccPct}%`)
specialistDiagnosis=isPt
? `Atenção Moderada (${topIssue}) · Cache L0 ${cacheHitPct}% · Contexto ${ctxOccPct}% · ${toolCallsCnt} calls.`
: `Medium Attention (${topIssue}) · L0 Cache ${cacheHitPct}% · Context ${ctxOccPct}% · ${toolCallsCnt} calls.`
}else{specialistDiagnosis=isPt
? `Sessão Saudável · Cache L0 ${cacheHitPct}% · Contexto ${ctxOccPct}% · ${pl(toolCallsCnt,'chamada')} e ${pl(touchedFiles.length,'arquivo tocado','arquivos tocados')}.`
: `Healthy Session · L0 Cache ${cacheHitPct}% · Context ${ctxOccPct}% · ${pl(toolCallsCnt,'call')} and ${pl(touchedFiles.length,'touched file')}.`
}
const scored=(activePresets||[]).map(item=>{
const pid=String(item.id||'')
const localRuns=Number(presetStatsMap?.[pid]?.runs||0)
const backendRuns=Number(snap?.rsi?.preset_stats?.[pid]?.runs||0)
const runs=Math.max(localRuns,backendRuns)
const lastUsed=Number(presetStatsMap?.[pid]?.last_used||snap?.rsi?.preset_stats?.[pid]?.last_used||0)
const isCustom=Boolean(item.custom)
const promptLower=String(item.prompt||'').toLowerCase()
const freqScore=35 * Math.log1p(runs)+ 8 * Math.min(runs,25)
const customScore=isCustom?180:0
const recencyScore=lastUsed>0?45 * Math.exp(-Math.max(0,nowSec - lastUsed)/ 86400):0
let ctxScore=0
let whyReason=''
if((recentErrors.length>0||failedSubs.length>0||anomalies.length>0)&&(pid==='errors'||promptLower.includes('error')||promptLower.includes('erro'))){
ctxScore +=240
whyReason=isPt?'Alertas ou anomalias ativas detectadas na sessão':'Active alerts or anomalies detected in session'}
if((runningSubs.length>0||live.active_tool)&&(pid==='doing'||promptLower.includes('subagent')||promptLower.includes('{{active_tool}}'))){
ctxScore +=195
if(!whyReason)whyReason=isPt? `Execução ativa (${live.active_tool|| `${runningSubs.length} subagente(s)`})` : `Active execution (${live.active_tool|| `${runningSubs.length} subagent(s)`})`
}
if(touchedFiles.length>0&&(pid==='files'||promptLower.includes('file')||promptLower.includes('arquivo'))){ctxScore +=155
if(!whyReason)whyReason=isPt? `${touchedFiles.length} arquivo(s) modificado(s) nesta sessão` : `${touchedFiles.length} file(s) modified in this session`
}
if(todos.length>0&&(pid==='eta'||pid==='plan')){ctxScore +=145
if(!whyReason)whyReason=isPt? `Plano com ${todos.length} tarefas rastreadas` : `Plan with ${todos.length} tracked tasks`}
if(!whyReason){whyReason=isCustom?isPt? `Seu snippet personalizado${runs>0? ` · usado ${runs}×` :''}`
: `Your custom snippet${runs>0? ` · used ${runs}×` :''}` :runs>0?isPt? `Alta frequência de uso (${runs}×)`
: `Frequently used (${runs}×)` :isPt?'Atalho essencial para o momento atual':'Essential shortcut for current session state'}
return{id:pid,label:item.label||pid,custom:isCustom,runs,
score:Math.round((customScore + freqScore + recencyScore + ctxScore)* 100)/ 100,why:whyReason}})
scored.sort((a,b)=>b.score - a.score||b.runs - a.runs)
const topRec=scored[0]||{id:'eta',label:'Progress & ETA',why:'',score:0}
let dynamicSnippet=null
if(subagents.length>0){
const subNames=subagents.slice(0,3).map(s=>cleanSubagentTitle(s.title||s.id)).join(', ')
dynamicSnippet={id:'dyn_subagents_pulse',icon:'hubot',
label:isPt? `Subagentes (${subagents.length})` : `Subagents Pulse (${subagents.length})`,
desc:isPt? `Sintetizar o que os subagentes (${subNames}) descobriram` : `Synthesize what subagents (${subNames}) discovered`,
prompt:isPt
? `Resuma de forma direta o status dos ${subagents.length} subagentes desta sessão (${subNames}), o que cada um já concluiu e se algum precisa de intervenção.`
: `Concisely summarize the status of the ${subagents.length} subagents in this session (${subNames}), what each has completed, and whether any needs intervention.`,
why:isPt?'Subagentes ativos na sessão':'Active subagents in session',severity:attentionLevel,dynamic:true}
}else if(recentErrors.length>0||anomalies.length>0){
const issueTitle=anomalies[0]?.title|| `${recentErrors[0]?.tool||'tool'}`
dynamicSnippet={id:'dyn_error_diag',icon:'flame',label:isPt?'Auditar Gargalo Atual':'Audit Current Bottleneck',
desc:isPt? `Diagnosticar: ${issueTitle}` : `Diagnose: ${issueTitle}`,prompt:isPt
? `Analise o ponto de atenção atual da sessão (${issueTitle}), verifique se há risco de regressão ou erro silencioso e proponha o próximo passo mais seguro.`
: `Analyze the current session attention point (${issueTitle}), check for regressions or silent errors, and propose the safest next step.`,
why:issueTitle,severity:attentionLevel,dynamic:true}
}else if(touchedFiles.length>0){
const leaf=splitPathLeaf(touchedFiles[0]).leaf
dynamicSnippet={id:'dyn_file_audit',icon:'sparkle',label:isPt? `Auditar ${leaf}` : `Audit ${leaf}`,
desc:isPt? `Revisar alterações recentes em ${leaf} e checar regressões` : `Review recent edits in ${leaf} and check for regressions`,
prompt:isPt
? `Revise as alterações recentes feitas em \`${leaf}\` nesta sessão (Cache ${cacheHitPct}%, Contexto ${ctxOccPct}%) e aponte se ficou algum ponto pendente ou risco de regressão.`
: `Review the recent changes made to \`${leaf}\` in this session (Cache ${cacheHitPct}%, Context ${ctxOccPct}%) and point out any pending items or regression risks.`,
why:isPt? `Edição recente em ${leaf}` : `Recent edit on ${leaf}`,severity:attentionLevel,dynamic:true}
}else{dynamicSnippet={id:'dyn_perf_audit',icon:'pulse',label:isPt?'Diagnóstico Executivo':'Executive Diagnostic',
desc:isPt? `Avaliar Cache ${cacheHitPct}%, Contexto ${ctxOccPct}% e próximos passos` : `Evaluate Cache ${cacheHitPct}%, Context ${ctxOccPct}% & next steps`,
prompt:isPt
? `Faça um diagnóstico executivo desta sessão (Cache ${cacheHitPct}%, Contexto ${ctxOccPct}%, ${toolCallsCnt} tool calls): qual é o estado atual, eficiência e próximo passo ideal?`
: `Provide an executive diagnostic of this session (Cache ${cacheHitPct}%, Context ${ctxOccPct}%, ${toolCallsCnt} tool calls): what is the current status, efficiency, and ideal next step?`,
why:isPt?'Análise de performance da sessão':'Session performance analysis',severity:attentionLevel,dynamic:true}}
return{ok:true,engine:'specialist-local',attention_level:attentionLevel,specialist_diagnosis:specialistDiagnosis,
specialist_metrics:specialistMetrics,recommended_id:topRec.id,recommended_label:topRec.label,why:topRec.why,ranked:scored,
dynamic_snippet:dynamicSnippet,updated_at:nowSec}}
function PresetGridSection({pending,onRunPreset,focusTargetRef,suggestion=null,snap=null,hoverPos='above'}){
const activePresets=useValue($activePresets)
const deletedIds=useValue($deletedPresetIds)
const editorDraft=useValue($presetEditorDraft)
const presetStatsMap=useValue($localPresetStats)
const autoRecommend=useValue($autoRecommendSnippets)
const smartRecMap=useValue($smartRecommendationBySession)
const sessionOnlyMap=useValue($sessionOnlySnippetsBySession)
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
const[focusedIdx,setFocusedIdx]=useState(0)
const[hoveredId,setHoveredId]=useState('')
const[recommending,setRecommending]=useState(false)
const specialistOpen=useValue($specialistOpen)
const setSpecialistOpen=val=>$specialistOpen.set(typeof val==='function'?val($specialistOpen.get()):Boolean(val))
const[savedDynIds,setSavedDynIds]=useState({})
const btnRefs=useRef([])
const lastSigRef=useRef('')
const sessionKey=canonicalSessionKey(snap?.canonical_id||snap?.session_id||'active')
const smartRec=smartRecMap?.[sessionKey]||null
const sessionSnippets=useMemo(()=>sessionOnlyMap?.[sessionKey]||[],[sessionOnlyMap,sessionKey])
const attentionLevel=smartRec?.attention_level||'low'
const frozenRef=useRef(null)
if(frozenRef.current===null&&suggestion?.id)frozenRef.current=suggestion
const suggested=smartRec?.recommended_id?{id:smartRec.recommended_id,why:smartRec.why||suggestion?.why||''}
:frozenRef.current
const runSmartRecommend=useCallback(async(useLlm=false)=>{
const sid=snap?.canonical_id||snap?.session_id||''
setRecommending(true)
const startedAt=Date.now()
let resultObj=null
if(_rest){try{
const res=await _rest('/presets/recommend',{method:'POST',body:{session_id:sid,use_llm:useLlm,lang},timeoutMs:useLlm?10000:4000})
if(res?.ok&&res?.recommended_id){resultObj=res}
}catch{}}
if(!resultObj){resultObj=buildClientSpecialistRecommendation(snap,activePresets,presetStatsMap,lang)}
if(useLlm){
const elapsed=Date.now()- startedAt
if(elapsed<420){await new Promise(r=>setTimeout(r,420 - elapsed))}}
$smartRecommendationBySession.set({...($smartRecommendationBySession.get()||{}),[sessionKey]:resultObj})
setRecommending(false)},[snap,activePresets,presetStatsMap,sessionKey,lang])
const pinSnippetForSession=useCallback(snippet=>{if(!snippet?.id||!snippet?.prompt)return
const cur=($sessionOnlySnippetsBySession.get()||{})[sessionKey]||[]
if(cur.some(x=>x.id===snippet.id||x.label===snippet.label))return
const nextItem={id: `sess_${Date.now().toString(36)}`,icon:snippet.icon||'sparkle',label:snippet.label,desc:snippet.desc||'',
prompt:snippet.prompt,why:snippet.why||'',sessionOnly:true}
$sessionOnlySnippetsBySession.set({...($sessionOnlySnippetsBySession.get()||{}),[sessionKey]:[nextItem,...cur].slice(0,6)})
haptic?.('success')},[sessionKey])
const contextSig= `${snap?.canonical_id||''}:${snap?.live?.active_tool||''}:${snap?.counts?.tool_calls||0}:${snap?.counts?.errors_recent||0}:${(snap?.subagents||[]).length}:${(snap?.touched_files||[]).length}:${lang}`
useEffect(()=>{if(!autoRecommend||!_rest||!snap?.found)return undefined
if(lastSigRef.current===contextSig)return undefined
lastSigRef.current=contextSig
const timer=setTimeout(()=>{void runSmartRecommend(false)
},180)
return()=>clearTimeout(timer)
},[autoRecommend,contextSig,snap?.found,runSmartRecommend])
const correlatedSet=useMemo(()=>{
const set=new Set()
if(suggested?.id)set.add(suggested.id)
const hasErr=Number(snap?.counts?.errors_recent||0)>0||(Array.isArray(snap?.anomalies)&&snap.anomalies.length>0)||
(Array.isArray(snap?.subagents)&&snap.subagents.some(s=>s?.status==='failed'))
const hasFiles=Array.isArray(snap?.touched_files)&&snap.touched_files.length>0
const isBusy=Boolean(snap?.live?.busy)||
(Array.isArray(snap?.subagents)&&snap.subagents.some(s=>s?.status==='running'||!s?.ended_at))
for(const p of activePresets){if(!p?.id)continue
const pr=String(p.prompt||'').toLowerCase()
if(hasErr&&(p.id==='errors'||pr.includes('{{last_error}}')||pr.includes('{{anomalies}}')||pr.includes('error')||pr.includes('erro')))set.add(p.id)
if(hasFiles&&(p.id==='files'||pr.includes('{{touched_files}}')||pr.includes('file')||pr.includes('arquivo')))set.add(p.id)
if(isBusy&&(p.id==='doing'||pr.includes('{{active_tool}}')||pr.includes('subagent')))set.add(p.id)}
return set
},[activePresets,suggested,snap])
const getRunsCount=useCallback(pid=>{
const localRuns=Number(presetStatsMap?.[pid]?.runs||0)
const backendRuns=Number(snap?.rsi?.preset_stats?.[pid]?.runs||0)
return Math.max(localRuns,backendRuns)},[presetStatsMap,snap?.rsi?.preset_stats])
const orderedPresets=useMemo(()=>{
const nowSec=Date.now()/ 1000
const rankMap=new Map()
if(Array.isArray(smartRec?.ranked)){smartRec.ranked.forEach((r,idx)=>{
if(r?.id)rankMap.set(r.id,{score:Number(r.score||0),why:r.why||'',order:idx})})}
const scoreOf=p=>{if(!p?.id)return -1
const runs=getRunsCount(p.id)
const lastUsed=Number(presetStatsMap?.[p.id]?.last_used||snap?.rsi?.preset_stats?.[p.id]?.last_used||0)
const ageHours=lastUsed>0?Math.max(0,(nowSec - lastUsed)/ 3600):999
const freqScore=35 * Math.log1p(runs)+ 8 * Math.min(runs,25)
const customScore=p.custom?180:0
const sessionScore=p.sessionOnly?520:0
const recencyScore=lastUsed>0?45 * Math.exp(-ageHours / 24):0
const corrScore=correlatedSet.has(p.id)?140:0
const recScore=suggested?.id===p.id?1000:0
const srvScore=rankMap.has(p.id)?Number(rankMap.get(p.id).score||0)* 0.35:0
return recScore + sessionScore + customScore + freqScore + recencyScore + corrScore + srvScore}
const merged=[...sessionSnippets,...activePresets]
const seenLabels=new Set()
const deduped=[]
for(const item of merged){if(!item?.id)continue
const lblKey=String(item.label||item.id).trim().toLowerCase()
if(seenLabels.has(lblKey))continue
seenLabels.add(lblKey)
deduped.push(item)}
return deduped.sort((a,b)=>scoreOf(b)- scoreOf(a))
},[activePresets,sessionSnippets,suggested,correlatedSet,getRunsCount,presetStatsMap,snap?.rsi?.preset_stats,smartRec])
const toggleNewEditor=()=>{
if(editorDraft&&(editorDraft.surface||'ask')==='ask'&&!editorDraft.id&&!editorDraft.replaceBuiltinId){
$presetEditorDraft.set(null)
}else{
const currentDraft=$draftQuestion.get().trim()
$presetEditorDraft.set({id:'',icon:'zap',label:currentDraft?suggestPresetLabel(currentDraft):'',desc:'',prompt:currentDraft,
replaceBuiltinId:'',surface:'ask'})}
haptic?.('tap')}
const settingsMode=useValue($settingsMode)
const isBasicMode=settingsMode==='basic'
const visiblePresets=useMemo(()=>(isBasicMode?orderedPresets.slice(0,4):orderedPresets),[orderedPresets,isBasicMode])
const moveFocus=nextIdx=>{
const count=visiblePresets.length
if(!count)return
const clamped=((nextIdx % count)+ count)% count
setFocusedIdx(clamped)
btnRefs.current[clamped]?.focus?.({preventScroll:true})}
const presetCounts=useMemo(()=>{if(!snap?.found)return{};const errs=(snap.recent_errors||[]).filter(e=>!e?.resolved).length+(snap.anomalies||[]).length;const files=(snap.touched_files||[]).length;const tools=Number(snap.counts?.tool_calls||0);const subs=(snap.subagents||[]).length;return{errors:errs,files,doing:tools,subagents:subs}},[snap])
return divs({cls:'btw-preset-section-wrap',onMouseLeave:()=>setHoveredId('')},[!isBasicMode&&divs('flex items-center justify-between gap-2 px-0.5',[span('btw-tx-10 font-semibold uppercase tracking-wider btw-mut',strings.secPresets),divs(CLS.row15,[divs({cls:'btw-smart-rec-pill','data-attention':attentionLevel,'data-loading':recommending?'true':'false'},[hsBtn('btw-smart-rec-btn',{disabled:recommending,title:strings.smartRecBtnTip,'aria-label':strings.smartRecBtnTip,onClick:()=>{haptic?.('tap')
setSpecialistOpen(true)
void runSmartRecommend(true)}},[recommending?jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent})
:codicon('sparkle','0.7rem'),recommending
?span('btw-tx-10',strings.smartRecLoadingLabel)
:span(null,strings.smartRecBtn.replace(/^✦\s*/,''))
]),hBtn('btw-smart-rec-auto',{'data-active':autoRecommend?'true':'false',title:strings.smartRecAutoTip,'aria-pressed':autoRecommend?'true':'false',onClick:()=>{
const nextVal=!autoRecommend
setPref($autoRecommendSnippets,nextVal,'autoRecommendSnippets')
if(nextVal)void runSmartRecommend(false)
haptic?.('tap')}},strings.smartRecAutoLabel)],'__smart_rec_control__'),
deletedIds.length>0&&hsBtn('btw-preset-add-btn h-[24px] px-2 btw-tx-105',{title:strings.restorePresetsTip,'aria-label':strings.restorePresetsTip,onClick:()=>{restoreDefaultPresets()
scheduleTimer(()=>focusTargetRef?.current?.focus?.({preventScroll:true}),10)}},[
codicon('history','0.68rem','shrink-0'),
span('truncate',strings.restorePresetsBtn(deletedIds.length))],'__restore_presets__'),
hsBtn('btw-preset-add-btn h-[24px] px-2 btw-tx-105',{title:strings.addPresetTip,'aria-label':strings.addPresetTip,onClick:toggleNewEditor},[
codicon('add','0.7rem','shrink-0'),
span('truncate',strings.addPresetBtn)],'__add_preset__')])]),divs({cls:'btw-studio-presets','data-basic':isBasicMode?'true':'false',role:'toolbar','aria-label':strings.secPresets},[...visiblePresets.map((preset,idx)=>{
const isTopRec=idx===0&&(suggested?.id===preset.id||Boolean(preset.sessionOnly))
return divs({cls:'btw-preset-card','data-basic':isBasicMode?'true':'false','data-recommended':isTopRec?'true':'false','data-attention':isTopRec?attentionLevel:'low','data-suggested':!isBasicMode&&isTopRec?'true':'false',onMouseEnter:e=>{const r=e.currentTarget?.getBoundingClientRect?.();if(r)setHoverPos(r.top<195?'below':'above');setHoveredId(preset.id)}},[hsBtn('btw-preset-btn',{ref:el=>{btnRefs.current[idx]=el},tabIndex:idx===Math.min(focusedIdx,Math.max(0,visiblePresets.length - 1))?0:-1,'data-correlated':!isBasicMode&&isTopRec?'true':'false',disabled:Boolean(pending),onFocus:()=>{setFocusedIdx(idx)
setHoveredId(preset.id)},onBlur:()=>setHoveredId(prev=>(prev===preset.id?'':prev)),onKeyDown:e=>{
if(e.key==='ArrowRight'){e.preventDefault()
moveFocus(idx + 1)
}else if(e.key==='ArrowLeft'){e.preventDefault()
moveFocus(idx - 1)
}else if(e.key==='ArrowDown'){e.preventDefault()
moveFocus(idx +(isBasicMode?4:3))
}else if(e.key==='ArrowUp'){e.preventDefault()
moveFocus(idx -(isBasicMode?4:3))
}else if(e.key==='Home'){e.preventDefault()
moveFocus(0)
}else if(e.key==='End'){e.preventDefault()
moveFocus(visiblePresets.length - 1)
}else if(e.key==='e'||e.key==='E'||e.key==='F2'){e.preventDefault()
openPresetEditorForItem(preset,'ask')
}else if(e.key==='Delete'){e.preventDefault()
deletePresetById(preset.id,preset.label)}},onClick:e=>{setHoveredId('')
recordLocalPresetRun(preset.id)
if(e.shiftKey){stageCommandInBtwChat(preset.prompt,{label: `⚡ Snippet: ${preset.label}`,source:'preset',icon:preset.icon||'zap'
})
scheduleTimer(()=>focusTargetRef?.current?.focus?.({preventScroll:true}),15)
return}
onRunPreset(preset.prompt,preset.id)}},[codicon(preset.icon||'zap','0.72rem',cn('shrink-0',isTopRec?'btw-ac':'btw-ts opacity-80')),spans('truncate flex-1 inline-flex items-center gap-1 min-w-0',(()=>{const baseLbl=isBasicMode&&!preset.custom&&strings.presetShortLabels?.[preset.id]?strings.presetShortLabels[preset.id]:preset.label;const cnt=presetCounts[preset.id];const showCnt=snap?.found&&!preset.custom&&typeof cnt==='number'&&(preset.id==='errors'||preset.id==='files'||preset.id==='doing'||(preset.id==='subagents'&&cnt>0));const cntCls=cnt===0?'btw-tt opacity-45 font-normal':preset.id==='errors'&&cnt>0?'text-amber-400 font-semibold':'btw-ts opacity-85';return[span('truncate',baseLbl),showCnt&&span(cn('shrink-0 font-mono btw-tx-10 tabular-nums',cntCls),`(${cnt})`)];})()),
isTopRec&&
span('ml-0.5 shrink-0 font-mono btw-tx-9 btw-ac','✦'),preset.sessionOnly&&span('shrink-0 font-mono btw-tx-9 btw-ac','⏳'),
!isBasicMode&&
preset.custom&&span('shrink-0 font-mono btw-tx-9 btw-ac opacity-85','★')]),
!isBasicMode&&
!preset.dynamic&&!preset.sessionOnly&&divs('btw-preset-actions',[hBtn('btw-preset-act',{tabIndex:0,title:strings.editPresetTip,'aria-label':strings.editPresetTip,onClick:e=>{
e.preventDefault()
e.stopPropagation()
openPresetEditorForItem(preset,'ask')}},codicon('edit','0.68rem')),hBtn('btw-preset-act',{tabIndex:0,'data-danger':'true',title:strings.deletePresetTip,'aria-label':strings.deletePresetTip,onClick:e=>{e.preventDefault()
e.stopPropagation()
deletePresetById(preset.id,preset.label)
scheduleTimer(()=>focusTargetRef?.current?.focus?.({preventScroll:true}),10)}},codicon('close','0.7rem'))])],preset.id)})]),hoveredId&&(()=>{
const preset=visiblePresets.find(p=>p.id===hoveredId)
if(!preset)return null
const idx=visiblePresets.indexOf(preset)
const isTopRec=idx===0&&(suggested?.id===preset.id||Boolean(preset.sessionOnly))
const runsCount=getRunsCount(preset.id)
const recWhy=preset.why||(suggested?.id===preset.id?suggested.why:'')||
(Array.isArray(smartRec?.ranked)?smartRec.ranked.find(r=>r?.id===preset.id)?.why||'':'')
const fallbackDesc=preset.desc||(Array.isArray(strings.presets)?strings.presets.find(p=>p.id===preset.id)?.desc:'')||
recWhy||''
return divs({cls:'btw-preset-hover-card','data-pos':hoverPos==='below'?'below':'above',role:'tooltip'},[divs(CLS.rowBetween,[divs('flex items-center gap-1.5 font-semibold text-xs btw-tp',[
codicon(preset.icon||'zap','0.78rem',CLS.accent),span(null,preset.label)
]),divs('flex items-center gap-1',[runsCount>0&&span('rounded btw-bg-tp10 px-1.5 py-0.5 font-mono btw-tx-9 btw-ts',strings.freqUsedBadge(runsCount)),span('rounded btw-bg-ac15 px-1.5 py-0.5 font-mono btw-tx-95 font-semibold btw-ac',preset.sessionOnly?strings.sessionOnlyBadge:isTopRec?strings.smartRecBadge:preset.custom?strings.customSnippetBadge
:strings.presetHoverBadge)])]),fallbackDesc&&div('btw-preset-hover-desc',fallbackDesc),recWhy&&
recWhy!==fallbackDesc&&div('btw-tx-10 font-medium btw-ac',`✦ ${recWhy}`),divs('btw-preset-hover-prompt font-mono',[div('mb-0.5 btw-tx-9 font-bold uppercase tracking-wider btw-ac',strings.presetHoverPromptLabel),
div('line-clamp-3',preset.prompt)]),div('btw-tx-10 btw-tt',strings.presetHoverHint)])
})(),specialistOpen&&(recommending||smartRec)&&(()=>{if(recommending){
return divs({cls:'btw-specialist-card text-xs','data-attention':attentionLevel},[divs('flex items-center gap-2',[jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent}),
span('font-semibold btw-tp',strings.specialistScanningTitle)]),div('btw-tx-11 btw-ts',strings.specialistScanningSub),
div('btw-specialist-scan-bar')])}
const dyn=smartRec.dynamic_snippet||null
const metrics=smartRec.specialist_metrics||{}
const recPreset=activePresets.find(p=>p.id===smartRec.recommended_id)||orderedPresets[0]||null
const isPinnedSession=dyn&&sessionSnippets.some(s=>s.label===dyn.label)
const isSavedPerm=dyn&&Boolean(savedDynIds[dyn.label])
return divs({cls:'btw-specialist-card text-xs','data-attention':attentionLevel},[divs(CLS.rowBetween,[divs('flex items-center gap-2 min-w-0',[
codicon('sparkle','0.82rem','btw-ac shrink-0'),span(CLS.titleTrunc,strings.specialistCardTitle),span({cls:'btw-specialist-badge','data-attention':attentionLevel},attentionLevel==='high'
?strings.specialistAttentionHigh:attentionLevel==='medium'?strings.specialistAttentionMed:strings.specialistAttentionLow)]),hBtn('rounded p-0.5 btw-tt btw-hv-tp cursor-pointer',{onClick:()=>setSpecialistOpen(false)},codicon('close','0.74rem'))]),
smartRec.specialist_diagnosis&&div('btw-tx-11 leading-snug btw-ts',smartRec.specialist_diagnosis),divs('flex flex-wrap items-center gap-1.5 btw-tx-10 font-mono btw-tt',[span('rounded btw-bg-tp8 px-1.5 py-0.5',`Cache ${metrics.cache_hit_pct??0}%`),span('rounded btw-bg-tp8 px-1.5 py-0.5',`Ctx ${metrics.context_occ_pct??0}%`),span('rounded btw-bg-tp8 px-1.5 py-0.5',`Errors ${metrics.errors_active??0}`),span('rounded btw-bg-tp8 px-1.5 py-0.5',`Calls ${metrics.tool_calls??0}`)]),recPreset&&
divs('flex items-center justify-between gap-2 rounded-lg border btw-bd-st50 btw-bg-tp4 px-2.5 py-1.5',[divs('min-w-0 flex-1',[divs('flex items-center gap-1.5 btw-tx-10 font-semibold uppercase tracking-wider btw-ac',[span(null,'✦'),span(null,strings.specialistSelectedHeader)]),divs('truncate text-xs font-medium btw-tp',[recPreset.label,smartRec.why? ` — ${smartRec.why}` :''])]),uiBtn('outline','xs',{cls:'h-6 px-2 btw-tx-105 shrink-0 btw-ac btw-bd-ac45',onClick:()=>{
recordLocalPresetRun(recPreset.id)
onRunPreset(recPreset.prompt,recPreset.id)
setSpecialistOpen(false)}},strings.specialistUseSelectedBtn)]),dyn&&divs('flex flex-col gap-1.5 rounded-lg border btw-bd-ac40 btw-bg-ac8 px-2.5 py-2',[divs(CLS.rowBetween,[span('btw-tx-10 font-semibold uppercase tracking-wider btw-ac',`✨ ${strings.specialistSuggestedHeader}`),span('font-semibold text-xs btw-tp',dyn.label)]),div('font-mono btw-tx-105 btw-ts line-clamp-2',dyn.prompt),divs('flex flex-wrap items-center gap-1.5 pt-0.5',[uiBtn('default','xs',{cls:'h-6 px-2 btw-tx-105',onClick:()=>{onRunPreset(dyn.prompt,dyn.id)
setSpecialistOpen(false)}},`⚡ ${strings.plusRunNowBtn}`),uiBtn('outline','xs',{disabled:isPinnedSession,cls:'h-6 px-2 btw-tx-105',onClick:()=>pinSnippetForSession(dyn)},isPinnedSession?strings.specialistPinSessionDone:strings.specialistPinSessionBtn),uiBtn('outline','xs',{disabled:isSavedPerm,cls:'h-6 px-2 btw-tx-105 btw-ac btw-bd-ac40',onClick:()=>{addOrUpdateCustomPreset({label:dyn.label,prompt:dyn.prompt,desc:dyn.desc||dyn.why||'',
icon:dyn.icon||'sparkle'})
setSavedDynIds(prev=>({...prev,[dyn.label]:true}))}},isSavedPerm?strings.specialistSavePermDone:strings.specialistSavePermBtn)])])])
})(),jsx(PresetEditorCard,{surface:'ask',
onSaved:()=>scheduleTimer(()=>focusTargetRef?.current?.focus?.({preventScroll:true}),15)})])}
function CardSteerMiniChat({entry,sessionScope,availableSubagents=[],defaultSubagent=null,onCloseSurface,onDone}){
const lang=useValue($lang)
const askMode=useValue($askMode)
const strings=I18N[lang]||I18N.en
const[instruction,setInstruction]=useState('')
const[target,setTarget]=useState(defaultSubagent?.id? `sub:${defaultSubagent.id}` :'main')
const[synthesizing,setSynthesizing]=useState(false)
const[synthCmd,setSynthCmd]=useState('')
const[synthMeta,setSynthMeta]=useState(null)
const inputRef=useRef(null)
useEffect(()=>{
const t=setTimeout(()=>inputRef.current?.focus?.({preventScroll:true}),25)
return()=>clearTimeout(t)
},[])
const selectedSub=useMemo(()=>{if(!target.startsWith('sub:'))return null
const id=target.slice(4)
if(defaultSubagent?.id===id)return defaultSubagent
return(availableSubagents||[]).find(s=>(s.id||s.subagent_id)===id)||{id,title:id}
},[target,availableSubagents,defaultSubagent])
const runSynthesize=async()=>{if(!instruction.trim()||synthesizing)return
setSynthesizing(true)
try{
const res=await synthesizeSteerCommand({sessionId:sessionScope.storedId||sessionScope.runtimeId||'',
instruction:instruction.trim(),cardQuestion:entry?.question||'',cardAnswer:entry?.answer||'',
targetType:selectedSub?'subagent':'main',subagentId:selectedSub?selectedSub.id||selectedSub.subagent_id:'',
subagentGoal:selectedSub?selectedSub.title||selectedSub.goal||'':'',mode:askMode})
if(res?.command){setSynthCmd(res.command)
setSynthMeta(res)
haptic?.('tap')}
}finally{setSynthesizing(false)}}
const dispatchCommand=async(modeOverride='auto')=>{
const finalCmd=String(synthCmd||instruction).trim()
if(!finalCmd)return
if(entry?.id){
const nextSteered={...$steeredByCardId.get(),[entry.id]:{target:target==='spawn_subagent'||selectedSub?'subagent':'main',
command:finalCmd,ts:Date.now()/ 1000}}
setPref($steeredByCardId,nextSteered,'steeredByCardId')}
if(target==='spawn_subagent'){
const ctxBody=entry?.answer? `[From /btw "${entry.question||''}"]: ${String(entry.answer).slice(0,1200)}` :''
await launchSubagentViaRest({goal:finalCmd,context:ctxBody,sessionId:sessionScope.storedId||sessionScope.runtimeId||''})
$activeTab.set('subagents')
onDone?.()
return}
if(selectedSub){
await steerSubagentSession(selectedSub.rpc_id||selectedSub.subagent_id||selectedSub.id,selectedSub.title||selectedSub.goal,finalCmd,sessionScope,onCloseSurface)
onDone?.()
return}
if(modeOverride==='composer'){
const targetSid=sessionScope.runtimeId||sessionScope.storedId||null
const ok=await host.composer?.setDraft?.(targetSid,finalCmd)
if(ok){host.composer?.focus?.(targetSid)
onCloseSurface?.()
closeAllStudioSurfaces()
host.notify?.({kind:'info',message:strings.promotedNotify})
}else{await writeClipboardText(finalCmd)
host.notify?.({kind:'info',message:strings.copiedNotify})}
onDone?.()
return}
await steerActiveSession(finalCmd,sessionScope,onCloseSurface,{source:'card_synth',entryId:entry?.id||'',
presetId:entry?.preset_id||'',targetKind:(entry?.anomaly_kinds||[])[0]||''})
onDone?.()}
return divs({cls:'btw-card-minichat',onKeyDown:e=>{if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
onDone?.()}}},[divs(CLS.rowWrapBetween,[divs('flex items-center gap-1.5 btw-tx-11 font-semibold btw-ac',[codicon('sparkle','0.78rem'),span(null,strings.cardMiniChatTitle)]),divs(CLS.row15,[
span(CLS.muted105,strings.cardMiniChatTargetLabel),h('select',{cls:'btw-select','aria-label':strings.cardMiniChatTargetLabel,style:{width:'auto',maxWidth:210,padding:'2px 6px',fontSize:'10.5px'},value:target,onChange:e=>setTarget(e.target.value)},[
h('option',{value:'main'},strings.cardMiniChatTargetMain,'main'),
h('option',{value:'spawn_subagent'},strings.steerTargetSpawnSubagent,'spawn_subagent'),
...(defaultSubagent?[defaultSubagent]:availableSubagents||[]).filter(Boolean).map(sub=>{
const sid=sub.id||sub.subagent_id
const stitle=sub.title||sub.goal||sid
return h('option',{value:`sub:${sid}`},`🤖 ${stitle}`,sid)})]),onDone&&uiBtn('ghost','icon-xs',{title:strings.tipClose,'aria-label':strings.tipClose,onClick:onDone},codicon('close','0.72rem'))])]),h('textarea',{ref:inputRef,rows:2,'aria-label':strings.cardMiniChatTitle,cls:'btw-preset-input btw-tx-115',placeholder:selectedSub?strings.subagentMiniChatPlaceholder:strings.cardMiniChatPlaceholder,value:instruction,disabled:synthesizing,onChange:e=>setInstruction(e.target.value),onKeyDown:e=>{if(isSubmitEnter(e)&&!e.shiftKey){
e.preventDefault()
void runSynthesize()
}else if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
onDone?.()}}}),jsx(TokenChips,{targetRef:inputRef,onInsert:next=>setInstruction(next),compact:true}),divs(CLS.rowWrapBetweenSm,[uiBtn('default','xs',{disabled:!instruction.trim()||synthesizing,onClick:()=>void runSynthesize()},synthesizing?spans(CLS.inline15,[jsx(GlyphSpinner,{spinner:'braille'}),strings.cardMiniChatSynthesizing]):strings.cardMiniChatSynthBtn),instruction.trim()&&!synthCmd&&uiBtn('outline','xs',{onClick:()=>void dispatchCommand('auto')},target==='spawn_subagent'?strings.cardMiniChatSendSpawn:selectedSub
?strings.cardMiniChatSendSubagent:strings.cardMiniChatDirectSteer)]),synthCmd&&divs('btw-synth-preview',[divs('flex items-center justify-between gap-2 btw-tx-105 font-semibold btw-tp',[span(null,strings.cardMiniChatPreviewLabel),synthMeta?.duration_ms?span(CLS.mono10Muted,`${(synthMeta.duration_ms / 1000).toFixed(1)}s · ${synthMeta.engine||'llm'}`):null]),h('textarea',{rows:3,'aria-label':strings.cardMiniChatPreviewLabel,cls:'btw-preset-input font-mono btw-tx-11',value:synthCmd,onChange:e=>setSynthCmd(e.target.value),onKeyDown:e=>{if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
onDone?.()}}}),divs('flex flex-wrap items-center justify-end gap-1.5',[
jsx(CopyButton,{text:synthCmd,appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer}),
!selectedSub&&target!=='spawn_subagent'&&uiBtn('outline','xs',{onClick:()=>void dispatchCommand('composer')},strings.cardMiniChatSendComposer),uiBtn('default','xs',{onClick:()=>void dispatchCommand('steer')},target==='spawn_subagent'
?strings.cardMiniChatSendSpawn:selectedSub?strings.cardMiniChatSendSubagent:sessionScope.busy?strings.cardMiniChatSendSteer
:strings.cardMiniChatSendComposer)])])])}
function deriveBtwCardTitle(entry){if(!entry)return ''
const rawTitle=String(entry.title||'')
.replace(/^(?:\[(?:STT|LIVE):[^\]]+\]\s*)+/i,'')
.trim()
const q=String(entry.question||'')
.replace(/^(?:\[(?:STT|LIVE):[^\]]+\]\s*)+/i,'')
.trim()
const isClippedRaw=/(?:…|(?<!\.)\.{2,})$/.test(rawTitle)&&q.length>rawTitle.length
if(rawTitle&&(rawTitle.length>=10||!q)&&rawTitle.length<=96&&!isClippedRaw){
return rawTitle}
if(!q)return rawTitle||I18N[$lang.get()]?.quickQuestionFallback||'Side Question'
const mParen=q.match(/\(([^()]{6,52}(?:\([^()]{1,20}\))?)\)/)
if(mParen&&/(analyze the current|analise o ponto|diagnose|diagnosticar)/i.test(q)){
const cand=mParen[1].replace(/`/g,'').trim()
if(cand.length>=6)return cand.slice(0,56)}
let cleaned=q
.replace(
/^(?:please\s+|por\s+favor\s+)?(?:concisely\s+|briefly\s+)?(?:summarize|analyze|review|check|explain|diagnose|resuma|analise|revise|verifique|explique|faça um diagnóstico executivo d[ea])\s+(?:de forma direta\s+|the\s+|as\s+|os\s+|o\s+|a\s+)?(?:status\s+of\s+|current\s+session\s+|alterações\s+recentes\s+(?:feitas\s+)?em\s+|recent\s+changes\s+(?:made\s+)?to\s+|recent\s+failure\s+on\s+|falha\s+recente\s+na\s+ferramenta\s+)?/i,
'')
.replace(/`/g,'')
.split('\n')[0]
.trim()
for(const sep of[' — ','. ',': ','? ',', and ',' e aponte',' e explique']){
if(cleaned.includes(sep)&&cleaned.split(sep)[0].length>=10){cleaned=cleaned.split(sep)[0].trim()}}
if(cleaned.length>78){cleaned= `${cleaned.slice(0,75).replace(/\s+\S*$/,'')}…`}
return cleaned?cleaned.charAt(0).toUpperCase()+ cleaned.slice(1):q.slice(0,76)}
function attachBtwCardToComposer(entry,initialMode='ask_btw'){if(!entry?.id)return
const title=deriveBtwCardTitle(entry)
const cur=($btwAttachments.get()||[]).filter(a=>a.kind!=='btw_card')
$btwAttachments.set([{id: `btw_card_${entry.id}`,kind:'btw_card',entry_id:entry.id,label:title,
detail:entry.created_at?fmtClock(entry.created_at):'/btw',question:entry.question||'',answer:entry.answer||'',
anomaly_kinds:entry.anomaly_kinds||[],preset_id:entry.preset_id||'',
content: `[Attached /btw Card: ${title}]\nQuestion: ${entry.question||''}\nAnswer:\n${String(entry.answer||'').slice(0,6000)}`},
...cur])
$followUpParent.set({id:entry.id,question:entry.question||'',title,answer:entry.answer||''})
$composerActionMode.set(initialMode)
$activeTab.set('ask')
const isPt=$lang.get()==='pt'
const modeLabel=initialMode==='steer_main'?isPt? `🎯 Card anexado para Steer: ${title}` : `🎯 Card attached for Steer: ${title}`
:initialMode==='spawn_subagent'?isPt? `🤖 Card anexado para Subagente: ${title}` : `🤖 Card attached for Subagent: ${title}` :isPt
? `💬 Card anexado ao chat /btw: ${title}` : `💬 Card attached to /btw chat: ${title}`
const notice={id: `staged_${Date.now().toString(36)}`,label:modeLabel,source:initialMode,
icon:initialMode==='steer_main'?'zap':initialMode==='spawn_subagent'?'hubot':'comment',
preview:String(entry.question||entry.answer||'').replace(/\s+/g,' ').slice(0,96),ts:Date.now()}
$composerStagedNotice.set(notice)
if(_stagedNoticeTimer)cancelTimer(_stagedNoticeTimer)
_stagedNoticeTimer=scheduleTimer(()=>{_stagedNoticeTimer=null
if($composerStagedNotice.get()?.id===notice.id){$composerStagedNotice.set(null)}
},4800)
haptic?.('tap')}
const _INLINE_MEDIA_LINE_RE=/^[ \t]*MEDIA:\s*(.+?)[ \t]*$/gim
const _MD_MEDIA_IMG_RE=/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const _UNSAFE_MEDIA_SCHEME_RE=/^(?:https?:|ftp:|file:|javascript:|vbscript:|ws:|wss:|data:(?!image\/(?:png|jpeg|jpg|webp|gif|bmp|avif);base64,|video\/(?:mp4|webm|quicktime);base64,|audio\/(?:mpeg|mp3|wav|ogg|webm|mp4|flac);base64,)|\/\/)/i
function inferMediaKindFromPath(rawPath){
const s=String(rawPath||'').trim().toLowerCase()
if(!s||_UNSAFE_MEDIA_SCHEME_RE.test(s))return ''
if(/^data:video\/(?:mp4|webm|quicktime);base64,/i.test(s)||/\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(s))return 'video'
if(/^data:audio\/(?:mpeg|mp3|wav|ogg|webm|mp4|flac);base64,/i.test(s)||/\.(mp3|wav|ogg|m4a|opus|flac|aac)$/i.test(s))return 'audio'
if(/^data:image\/(?:png|jpeg|jpg|webp|gif|bmp|avif);base64,/i.test(s)||/\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(s))return 'image'
return 'file'}
function extractBtwMediaAndCleanMarkdown(entry,rawText){
const text=String(rawText??entry?.answer??'')
const items=[]
const seen=new Set()
const addMedia=(rawObj,idxHint=0)=>{if(!rawObj)return
const status=String(rawObj.status||'ready').toLowerCase()
let p=String(rawObj.path||rawObj.url||rawObj.media_path||'').trim()
if(p.toUpperCase().startsWith('MEDIA:'))p=p.slice(6).trim()
p=p.replace(/^['"`]+|['"`]+$/g,'').trim()
if(_UNSAFE_MEDIA_SCHEME_RE.test(p))return
if(!p&&status!=='generating'&&status!=='error')return
const key=p?p.replace(/\\/g,'/').toLowerCase(): `pending_${rawObj.id||idxHint}_${rawObj.kind||'image'}`
if(seen.has(key))return
const kind=rawObj.kind||rawObj.media_kind||(p?inferMediaKindFromPath(p):'image')
if(kind!=='image'&&kind!=='video'&&kind!=='audio')return
seen.add(key)
const leafName=p?p.replace(/\\/g,'/').split('/').pop()?.split('?')[0]||(kind==='video'?'video.mp4':kind==='audio'?'speech.mp3':'image.png')
:kind==='video'?'video.mp4':kind==='audio'?'speech.mp3':'image.png'
items.push({id:rawObj.id|| `m_${idxHint}`,kind,status,path:p,name:rawObj.name||leafName,prompt:rawObj.prompt||'',
provider:rawObj.provider||'',model:rawObj.model||'',aspect_ratio:rawObj.aspect_ratio||'',error:rawObj.error||''})}
if(Array.isArray(entry?.media_items)){entry.media_items.forEach((mi,idx)=>addMedia(mi,idx))}
if(Array.isArray(entry?.tool_runs)){for(const tr of entry.tool_runs){
if(tr&&tr.ok&&(tr.media_path||tr.result?.image||tr.result?.video||tr.result?.saved_path||tr.result?.file_path)){addMedia({
kind:tr.media_kind||(tr.tool==='video_generate'?'video':tr.tool==='text_to_speech'?'audio':'image'),
path:tr.media_path||tr.result?.image||tr.result?.video||tr.result?.saved_path||tr.result?.file_path,prompt:tr.args?.prompt||tr.args?.text||'',
provider:tr.provider||tr.result?.provider||'',model:tr.model||tr.result?.model||'',aspect_ratio:tr.args?.aspect_ratio||''
})}}}
let mLine
const lineRegex=new RegExp(_INLINE_MEDIA_LINE_RE.source,'gim')
while((mLine=lineRegex.exec(text))!==null){
const cand=String(mLine[1]||'').trim()
const k=inferMediaKindFromPath(cand)
if(k==='image'||k==='video'||k==='audio'){addMedia({kind:k,path:cand})}}
let mImg
const mdImgRegex=new RegExp(_MD_MEDIA_IMG_RE.source,'g')
while((mImg=mdImgRegex.exec(text))!==null){
const altTxt=String(mImg[1]||'').trim()
const hrefTxt=String(mImg[2]||'').trim()
if(_UNSAFE_MEDIA_SCHEME_RE.test(hrefTxt))continue
const k=inferMediaKindFromPath(hrefTxt)
if(k==='image'||k==='video'){addMedia({kind:k,path:hrefTxt,prompt:altTxt})}}
let cleanedMarkdown=text
if(items.length>0){cleanedMarkdown=cleanedMarkdown.replace(_INLINE_MEDIA_LINE_RE,(fullMatch,capturedPath)=>{
const norm=String(capturedPath||'').trim().replace(/^['"`]+|['"`]+$/g,'').replace(/\\/g,'/').toLowerCase()
return seen.has(norm)?'':fullMatch
}).replace(/\n{3,}/g,'\n\n').trim()}
return{cleanedMarkdown:cleanedMarkdown||text,mediaItems:items}}
async function resolveBtwMediaDisplayUrl(rawPath,sessionScope){
const s=String(rawPath||'').trim()
if(!s||_UNSAFE_MEDIA_SCHEME_RE.test(s))return ''
if(_SAFE_INLINE_MEDIA_URI_RE.test(s))return s
if(/^data:/i.test(s))return ''
const cacheKey=s.replace(/\\/g,'/')
if(_mediaDataUrlCache.has(cacheKey)){
return _mediaDataUrlCache.get(cacheKey)}
const sid=sessionScope?.storedId||sessionScope?.runtimeId||''
let res=null
try{res=await host.request('plugin.btw-studio.media_read',{path:s,session_id:sid},22000)}catch{}
if((!res||!res.data_url)&&_rest){try{
res=await _rest('/media/read',{method:'POST',body:{path:s,session_id:sid},timeoutMs:22000})
}catch{}}
if(res?.ok&&res.data_url&&_SAFE_INLINE_MEDIA_URI_RE.test(res.data_url)){if(_mediaDataUrlCache.size>=36){
const oldest=_mediaDataUrlCache.keys().next().value
if(oldest)_mediaDataUrlCache.delete(oldest)}
_mediaDataUrlCache.set(cacheKey,res.data_url)
return res.data_url}
return ''}
async function copyImageToSystemClipboard(displaySrc,fallbackPath){try{
if(displaySrc&&typeof ClipboardItem!=='undefined'&&navigator.clipboard?.write){
const img=new Image()
if(/^https?:\/\//i.test(displaySrc)){
img.crossOrigin='anonymous'}
await new Promise((resolve,reject)=>{img.onload=resolve
img.onerror=reject
img.src=displaySrc})
const canvas=document.createElement('canvas')
canvas.width=img.naturalWidth||img.width||1024
canvas.height=img.naturalHeight||img.height||1024
const ctx2d=canvas.getContext('2d')
if(ctx2d){ctx2d.drawImage(img,0,0)
const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))
if(blob){await navigator.clipboard.write([new ClipboardItem({'image/png':blob})])
haptic?.('success')
return true}}}
}catch{}
await writeClipboardText(String(fallbackPath||displaySrc||''))
haptic?.('tap')
return true}
function downloadBtwMediaFile(displaySrc,rawPath,defaultName='btw-media'){
const href=String(displaySrc||'').trim()
if(!href||!_SAFE_INLINE_MEDIA_URI_RE.test(href))return
const cleanName=String(defaultName||rawPath||'btw-media').replace(/\\/g,'/').split('/').pop()?.split('?')[0]||'btw-media'
try{
const a=document.createElement('a')
a.href=href
a.download=cleanName
a.rel='noopener noreferrer'
a.click()
haptic?.('tap')
}catch{if(_ctx?.os?.openExternal&&/^https?:\/\//i.test(href)){
void _ctx.os.openExternal(href)
}else{void writeClipboardText(String(rawPath||href))}}}
function BtwMediaLightbox(){
const item=useValue($activeMediaLightbox)
const lang=useValue($lang)
const isPt=lang==='pt'
const[scale,setScale]=useState(1)
const[offset,setOffset]=useState({x:0,y:0})
const[panning,setPanning]=useState(false)
const[copiedImg,setCopiedImg]=useState(false)
const dragRef=useRef({active:false,moved:false,startX:0,startY:0,origX:0,origY:0})
useEffect(()=>{setScale(1)
setOffset({x:0,y:0})
setPanning(false)
setCopiedImg(false)
},[item?.src,item?.path])
if(!item)return null
const zoomIn=()=>setScale(s=>Math.min(8,Math.round((s + 0.35)* 100)/ 100))
const zoomOut=()=>setScale(s=>Math.max(0.25,Math.round((s - 0.35)* 100)/ 100))
const resetZoom=()=>{setScale(1)
setOffset({x:0,y:0})}
return jsx(Dialog,{open:Boolean(item),onOpenChange:open=>{if(!open)$activeMediaLightbox.set(null)},
children:jsxs(DialogContent,{showCloseButton:false,blurBackdrop:true,'data-variant':'media-lightbox',
className:'w-auto max-w-[92vw] max-h-[92vh] border-0 bg-transparent! shadow-none! p-2 flex flex-col items-center justify-center',
bodyClassName:'p-0 flex flex-col items-center justify-center overflow-visible',children:[jsxs(DialogHeader,{className:'sr-only',
children:[jsx(DialogTitle,{children:item.name||'Media Lightbox'}),
jsx(DialogDescription,{children:item.prompt||item.path||'Zoomable media preview'})]}),div({cls:'btw-lightbox-stage',onWheel:e=>{e.preventDefault()
const delta=e.deltaY<0?0.22:-0.22
setScale(s=>Math.min(8,Math.max(0.25,Math.round((s + delta)* 100)/ 100)))},onPointerDown:e=>{if(e.button!==0)return
dragRef.current={active:true,moved:false,startX:e.clientX,startY:e.clientY,origX:offset.x,origY:offset.y}
setPanning(true)
e.currentTarget.setPointerCapture?.(e.pointerId)},onPointerMove:e=>{if(!dragRef.current.active)return
const dx=e.clientX - dragRef.current.startX
const dy=e.clientY - dragRef.current.startY
if(Math.abs(dx)>4||Math.abs(dy)>4){dragRef.current.moved=true}
setOffset({x:dragRef.current.origX + dx,y:dragRef.current.origY + dy})},onPointerUp:e=>{if(!dragRef.current.active)return
const wasMoved=dragRef.current.moved
dragRef.current.active=false
setPanning(false)
e.currentTarget.releasePointerCapture?.(e.pointerId)
if(!wasMoved&&item.kind==='image'&&scale===1){$activeMediaLightbox.set(null)}},onDoubleClick:()=>{
if(scale!==1)resetZoom()
else setScale(2)}},item.kind==='video'?h('video',{src:item.src||undefined,controls:true,autoPlay:true,playsInline:true,onClick:e=>e.stopPropagation(),cls:'max-h-[76vh] max-w-[88vw] rounded-xl shadow-2xl bg-black',style:{
transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
cursor:scale>1?(panning?'grabbing':'grab'):'default'}}):h('img',{src:item.src||undefined,alt:item.prompt||item.name||'BTW Image',draggable:false,cls:'max-h-[76vh] max-w-[88vw] rounded-xl object-contain shadow-2xl select-none',style:{
transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
cursor:scale>1?(panning?'grabbing':'grab'):'zoom-out'}})),divs({cls:'btw-lightbox-toolbar',onClick:e=>e.stopPropagation(),onPointerDown:e=>e.stopPropagation()},[hBtn('btw-media-action-btn',{onClick:zoomOut,title:isPt?'Diminuir Zoom':'Zoom Out'},'−'),hBtn('btw-media-action-btn font-mono tabular-nums',{onClick:resetZoom,title:isPt?'Resetar Zoom (100%)':'Reset Zoom (100%)'},`${Math.round(scale * 100)}%`),hBtn('btw-media-action-btn',{onClick:zoomIn,title:isPt?'Aumentar Zoom':'Zoom In'},'+'),item.kind==='image'&&
hBtn('btw-media-action-btn',{onClick:async()=>{
await copyImageToSystemClipboard(item.src,item.path)
setCopiedImg(true)
scheduleTimer(()=>setCopiedImg(false),1800)}},copiedImg?isPt?'✓ Imagem Copiada!':'✓ Image Copied!':isPt
?'📋 Copiar Imagem':'📋 Copy Image'),hBtn('btw-media-action-btn',{onClick:()=>downloadBtwMediaFile(item.src,item.path,item.name)},isPt?'💾 Baixar':'💾 Download'),hBtn('btw-media-action-btn',{onClick:()=>$activeMediaLightbox.set(null)},isPt?'✕ Fechar':'✕ Close')])]})})}
function BtwMediaItemCard({item,sessionScope}){
const lang=useValue($lang)
const isPt=lang==='pt'
const[displaySrc,setDisplaySrc]=useState(()=>
_SAFE_INLINE_MEDIA_URI_RE.test(item.path||'')?item.path:(_mediaDataUrlCache.get(String(item.path||'').replace(/\\/g,'/'))||'')
)
const[loading,setLoading]=useState(!displaySrc&&Boolean(item?.path))
const[retryTick,setRetryTick]=useState(0)
const[copied,setCopied]=useState(false)
useEffect(()=>{
let alive=true
if(!item?.path||_UNSAFE_MEDIA_SCHEME_RE.test(item.path)){setLoading(false);return undefined}
if(_SAFE_INLINE_MEDIA_URI_RE.test(item.path)){setDisplaySrc(item.path)
setLoading(false)
return undefined}
if(/^data:/i.test(item.path)){setLoading(false);return undefined}
setLoading(true)
void resolveBtwMediaDisplayUrl(item.path,sessionScope).then(url=>{if(!alive)return
if(url)setDisplaySrc(url)
setLoading(false)})
return()=>{alive=false}
},[item?.path,sessionScope?.storedId,sessionScope?.runtimeId,retryTick])
const openLightbox=e=>{e?.stopPropagation?.()
if(!displaySrc&&!item?.path)return
$activeMediaLightbox.set({...item,src:displaySrc||undefined})
haptic?.('tap')}
const isGenerating=item?.status==='generating'&&!item?.path
const isError=item?.status==='error'&&!item?.path
const providerLabel=[item.provider,item.model].filter(Boolean).join(' · ')
return divs({cls:'btw-media-card',onClick:e=>e.stopPropagation(),onPointerDown:e=>e.stopPropagation()},[
divs('btw-media-frame',[isGenerating?divs('flex flex-col items-center justify-center gap-2 px-4 py-8 text-center',[typeof Loader==='function'
?jsx(Loader,{type:item.kind==='video'?'rose-orbit':'lemniscate-bloom',className:'size-7 btw-ac'})
:jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent}),span('font-semibold text-xs btw-tp',item.kind==='video'?isPt
? `🎬 Gerando vídeo MP4 (${providerLabel||'Hermes Video Gen'})…` : `🎬 Generating MP4 video (${providerLabel||'Hermes Video Gen'})…`
:isPt? `🎨 Gerando imagem (${providerLabel||'Hermes Image Gen'})…` : `🎨 Generating image (${providerLabel||'Hermes Image Gen'})…`),item.prompt?span('max-w-md line-clamp-2 btw-tx-105 btw-tt italic',item.prompt):null]):isError?divs('flex flex-col items-center justify-center gap-1 px-4 py-6 text-center text-xs btw-red',[
span('font-semibold',isPt?'⚠ Falha ao gerar mídia':'⚠ Media generation failed'),
item.error?span('btw-tx-10 opacity-80',item.error):null]):loading&&!displaySrc
?divs('flex items-center gap-2 py-8 text-xs btw-tt',[
jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent}),
span(null,isPt? `Carregando ${item.name}…` : `Loading ${item.name}…`)]):!displaySrc
?divs('flex flex-col items-center justify-center gap-2 px-4 py-6 text-center text-xs btw-tt',[
span(null,isPt? `Mídia local pronta (${item.name})` : `Local media ready (${item.name})`),
hBtn('btw-action-mode-pill',{onClick:e=>{e.stopPropagation();_mediaDataUrlCache.delete(String(item.path||'').replace(/\\/g,'/'));setRetryTick(v=>v + 1)}},isPt?'↻ Carregar prévia':'↻ Load preview')]):item.kind==='audio'?divs('btw-audio-player-frame',[
divs('flex items-center justify-between gap-2 btw-tx-105 font-mono btw-ts',[
span('btw-ac font-semibold',`🔊 ${providerLabel||'Nous OpenAI TTS'}`),
item.prompt?span('truncate opacity-80 italic',`"${item.prompt}"`):null
]),
h('audio',{src:displaySrc||undefined,controls:true,preload:'metadata'})
]):item.kind==='video'?h('video',{src:displaySrc||undefined,controls:true,playsInline:true,preload:'metadata'}):h('img',{src:displaySrc||undefined,alt:item.prompt||item.name||'Generated image',draggable:false,onClick:openLightbox,title:isPt?'Clique para dar Zoom (Lightbox)':'Click to Zoom (Lightbox)'}),!isGenerating&&!isError&&divs('btw-media-overlay-bar',[item.kind!=='audio'&&hBtn('btw-media-action-btn',{title:isPt?'Ampliar com Zoom (Lightbox)':'Zoom in Lightbox',onClick:openLightbox},isPt?'🔍 Zoom':'🔍 Zoom'),
item.kind==='image'&&hBtn('btw-media-action-btn',{title:isPt?'Copiar imagem para a área de transferência':'Copy image to clipboard',onClick:async e=>{e.stopPropagation()
await copyImageToSystemClipboard(displaySrc,item.path)
setCopied(true)
scheduleTimer(()=>setCopied(false),1800)}},copied?(isPt?'✓ Copiada':'✓ Copied'):isPt?'📋 Copiar':'📋 Copy'),
hBtn('btw-media-action-btn',{title:isPt?'Baixar arquivo':'Download file',onClick:e=>{
e.stopPropagation()
downloadBtwMediaFile(displaySrc,item.path,item.name)}},isPt?'💾 Baixar':'💾 Save')])]),divs('btw-media-caption',[spans({cls:'inline-flex min-w-0 items-center gap-1.5 truncate font-mono btw-tx-95',title:item.prompt||item.path},[
span('btw-ac font-semibold shrink-0',item.kind==='video'?'🎬 VIDEO':item.kind==='audio'?'🔊 AUDIO':'🎨 IMAGE'),
providerLabel?span('btw-ts shrink-0',`· ${providerLabel}`):null,
span('truncate opacity-80',item.prompt||item.name)]),!isGenerating&&!isError&&item.kind!=='audio'&&hBtn('bg-transparent border-0 p-0 btw-tx-95 font-mono btw-ac hover:underline cursor-pointer shrink-0',{onClick:openLightbox},isPt?'⤢ Expandir':'⤢ Expand')])])}
function BtwMediaDeck({items,sessionScope}){if(!Array.isArray(items)||items.length===0)return null
return div({cls:'btw-media-deck','data-multi':items.length>1?'true':'false'},items.map((item,idx)=>
jsx(BtwMediaItemCard,{item,sessionScope}, `${item.id||item.path||idx}`)))}
function BtwRichAnswerBody({text,entry=null,sessionScope=null,mediaFirst=false}){
const lang=useValue($lang)
const isPt=lang==='pt'
const proseRef=useRef(null)
const[selectedSnippet,setSelectedSnippet]=useState('')
const[copiedSnippet,setCopiedSnippet]=useState(false)
const{cleanedMarkdown,mediaItems}=useMemo(()=>extractBtwMediaAndCleanMarkdown(entry,text),[entry,text])
const handleCheckSelection=useCallback(()=>{try{
const root=proseRef.current
const sel=window.getSelection?.()
if(!root||!sel||sel.isCollapsed||!sel.anchorNode||!sel.focusNode){setSelectedSnippet(prev=>(prev?'':prev))
return}
if(!root.contains(sel.anchorNode)&&!root.contains(sel.focusNode)){setSelectedSnippet(prev=>(prev?'':prev))
return}
if(!(root.contains(sel.anchorNode)&&root.contains(sel.focusNode))){setSelectedSnippet(prev=>(prev?'':prev))
return}
const str=String(sel.toString()||'').trim()
setSelectedSnippet(str.length>=2?str:'')
}catch{}
},[])
return divs({ref:proseRef,cls:'btw-selectable-prose','data-selectable-text':'true',onPointerDown:e=>{setSelectedSnippet('');e.stopPropagation()},onMouseDown:e=>e.stopPropagation(),onMouseUp:handleCheckSelection,onKeyUp:handleCheckSelection,onCopy:e=>{e.stopPropagation()
const sel=window.getSelection?.()?.toString?.()||''
if(sel){void writeClipboardText(sel)}}},[selectedSnippet&&divs({cls:'btw-selection-toolbar',onPointerDown:e=>{e.preventDefault()
e.stopPropagation()},onMouseDown:e=>{e.preventDefault()
e.stopPropagation()}},[spans('min-w-0 flex-1 truncate font-mono btw-tx-10 btw-ts',[span('btw-ac font-semibold mr-1','✂'),
`"${selectedSnippet.slice(0,68)}${selectedSnippet.length>68?'…':''}"`]),divs(CLS.rowShrink1,[hBtn('btw-selection-btn',{onClick:async e=>{e.stopPropagation()
await writeClipboardText(selectedSnippet)
setCopiedSnippet(true)
haptic?.('success')
scheduleTimer(()=>setCopiedSnippet(false),1600)}},copiedSnippet?isPt?'✓ Copiado!':'✓ Copied!':isPt?'📋 Copiar trecho'
:'📋 Copy selection'),hBtn('btw-selection-btn',{onClick:e=>{e.stopPropagation()
stageCommandInBtwChat(isPt? `Sobre este trecho: "${selectedSnippet.slice(0,400)}" — `
: `Regarding this snippet: "${selectedSnippet.slice(0,400)}" — `,{
label:isPt?'✂ Trecho selecionado enviado ao chat /btw':'✂ Selected snippet staged in /btw chat',source:'selection',
icon:'quote',openStudioIfClosed:true})
setSelectedSnippet('')}},isPt?'💬 Usar no Chat /btw':'💬 Ask in /btw'),hBtn('bg-transparent border-0 px-1 btw-tt btw-hv-tp cursor-pointer btw-tx-10',{onClick:e=>{e.stopPropagation()
setSelectedSnippet('')}},'✕')])]),mediaFirst&&mediaItems.length>0
?div('mb-2.5',jsx(BtwMediaDeck,{items:mediaItems,sessionScope})):null,cleanedMarkdown
?jsx(MessageTextContent,{text:cleanedMarkdown,media:false,previewOnly:true}):null,!mediaFirst&&mediaItems.length>0
?jsx(BtwMediaDeck,{items:mediaItems,sessionScope}):null])}
async function memorizeCardRuleToBtwMd(entry,sessionScope){if(!entry)return false
const title=deriveBtwCardTitle(entry)
const cleanLines=String(entry.answer||'')
.split('\n')
.map(l=>l.trim())
.filter(l=>l.length>14&&!l.startsWith('|--')&&!l.startsWith('| :'))
.slice(0,4)
const lessonTxt=cleanLines.join('\n').slice(0,580)||String(entry.answer||'').slice(0,400)
const cueTxt=stripInlineMarkdownPreview(title||entry.question||'When this pattern reappears',140)
const expId= `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
const ruleScope=inferRuleScope(cueTxt,lessonTxt)
addLocalLesson({id:expId,cue:cueTxt,lesson:lessonTxt,evidence: `From /btw card ${entry.id}`,lever:'C6',scope:ruleScope,
domain:sessionScope?.profile||'global'})
if(_rest){try{await _rest('/rsi/experience',{method:'POST',body:{id:expId,
session_id:sessionScope?.storedId||sessionScope?.runtimeId||'',cue:cueTxt,lesson:lessonTxt,
evidence: `From /btw card ${entry.id}`,lever:'C6',scope:ruleScope,domain:sessionScope?.profile||'global',source:'card',
kinds:entry.anomaly_kinds||[]}})
}catch{}}
haptic?.('success')
host.notify?.({kind:'info',message:t().cardFooterBtwMdDone})
return true}
function QaCard({entry,sessionScope,availableSubagents=[],compact=false,latest=false,onCloseSurface}){
const hasEntryMedia=useMemo(()=>Boolean(
entry?.media_pending||
(Array.isArray(entry?.media_items)&&entry.media_items.length>0)||
(Array.isArray(entry?.tool_runs)&&entry.tool_runs.some(tr=>tr&&tr.ok&&(tr.media_path||tr.result?.image||tr.result?.video)))||
/MEDIA:/i.test(String(entry?.answer||''))
),[entry?.media_pending,entry?.media_items,entry?.tool_runs,entry?.answer])
const demoModeCard=useValue($demoShowcase)
const[collapsed,setCollapsed]=useState(()=>!(latest&&(hasEntryMedia||demoModeCard||Date.now()/ 1000 - Number(entry?.created_at||0)<600)))
const autoExpandedRef=useRef(false)
const prevHasMediaRef=useRef(false)
useEffect(()=>{
if(!autoExpandedRef.current&&(hasEntryMedia||(latest&&(demoModeCard||Date.now()/ 1000 - Number(entry?.created_at||0)<600)))){
autoExpandedRef.current=true
setCollapsed(false)
}else if(hasEntryMedia&&!prevHasMediaRef.current){
setCollapsed(false)
}
prevHasMediaRef.current=hasEntryMedia
},[hasEntryMedia,latest,demoModeCard,entry?.created_at])
const[savedBtwMd,setSavedBtwMd]=useState(false)
const activeMiniChatId=useValue($activeCardMiniChatId)
const miniChatOpen=activeMiniChatId===entry.id
const speakingEntryId=useValue($ttsSpeakingEntryId)
const isSpeakingThisCard=speakingEntryId===entry.id
const lang=useValue($lang)
const settingsMode=useValue($settingsMode)
const isBasicMode=settingsMode==='basic'
const activePresets=useValue($activePresets)
const entriesMap=useValue($entriesBySession)
const steeredMap=useValue($steeredByCardId)
const localProbes=useValue($localProbes)
const strings=I18N[lang]||I18N.en
const cardTitle=useMemo(()=>deriveBtwCardTitle(entry),[entry])
const showQuestionSub=Boolean(entry.question&&entry.question.trim()!==cardTitle&&entry.question.length>cardTitle.length + 6)
const steerInfo=useMemo(()=>{if(steeredMap?.[entry.id])return steeredMap[entry.id]
if(entry.steer_info)return entry.steer_info
const matchedProbe=Array.isArray(localProbes)?localProbes.find(p=>p&&p.entry_id===entry.id):null
if(matchedProbe){
return{target:matchedProbe.source?.includes('spawn')?'subagent':'main',command:matchedProbe.steer||'',
verdict:matchedProbe.verdict||''}}
return null
},[steeredMap,localProbes,entry.id,entry.steer_info])
const parentCard=useMemo(()=>{if(!entry.parent_id)return null
const list=entriesMap?.[sessionScope.key]||[]
return list.find(item=>item&&item.id===entry.parent_id)||null
},[entriesMap,sessionScope.key,entry.parent_id])
const parentTitle=useMemo(()=>(parentCard?deriveBtwCardTitle(parentCard):''),[parentCard])
const normQ=String(entry.question||'').trim().toLowerCase()
const alreadyPreset=Boolean(normQ&&activePresets.some(p=>String(p.prompt||'').trim().toLowerCase()===normQ))
const repeatCount=useMemo(()=>{if(!normQ)return 0
const list=entriesMap[sessionScope.key]||[]
return list.filter(item=>String(item.question||'').trim().toLowerCase()===normQ).length
},[entriesMap,sessionScope.key,normQ])
const onPin=async()=>{
const key=sessionScope.key
const map=$entriesBySession.get()
const nextList=(map[key]||[]).map(item=>item.id===entry.id?{...item,pinned:!item.pinned}:item)
const nextMap={...map,[key]:nextList}
$entriesBySession.set(nextMap)
persistLocalEntries(nextMap)
if(_rest&&(sessionScope.storedId||sessionScope.runtimeId)){try{await _rest('/pin',{method:'POST',
body:{session_id:sessionScope.storedId||sessionScope.runtimeId,id:entry.id}})
}catch{}}}
const onDelete=async()=>{
const key=sessionScope.key
const map=$entriesBySession.get()
const nextList=(map[key]||[]).filter(item=>item.id!==entry.id)
const nextMap={...map,[key]:nextList}
$entriesBySession.set(nextMap)
persistLocalEntries(nextMap)
if(_rest&&(sessionScope.storedId||sessionScope.runtimeId)){try{await _rest('/clear',{method:'POST',
body:{session_id:sessionScope.storedId||sessionScope.runtimeId,id:entry.id}})
}catch{}}}
const onInsertToComposer=async()=>{
const quote= `> **[/btw]** ${entry.question}\n> ${entry.answer.split('\n').join('\n> ')}\n\n`
const targetSid=sessionScope.runtimeId||sessionScope.storedId||null
const ok=await host.composer?.insertText?.(targetSid,quote,{mode:'block'})
if(ok){host.composer?.focus?.(targetSid)
onCloseSurface?.()
closeAllStudioSurfaces()
host.notify?.({kind:'info',message:strings.insertedNotify})
}else{await writeClipboardText(quote)
host.notify?.({kind:'info',message:strings.copiedNotify})}}
return divs({cls:cn('btw-qa-card',entry.parent_id&&parentCard&&!collapsed&&'btw-thread-child'),'data-pinned':entry.pinned?'true':'false','data-collapsed':collapsed?'true':'false','data-steered':steerInfo?'true':'false'},[divs('btw-qa-header',[hsBtn(cn(
'flex min-w-0 flex-1 text-left cursor-pointer bg-transparent border-0 p-0',collapsed?'items-center gap-1.5':'items-start gap-1.5'
),{'aria-expanded':!collapsed?'true':'false',onClick:()=>setCollapsed(v=>!v)},[jsx(DisclosureCaret,{open:!collapsed,size:'0.72rem',
className:cn(collapsed?'':'mt-0.5','btw-tt shrink-0')}),collapsed?divs({cls:'flex min-w-0 flex-1 flex-col gap-0.5',title:entry.question||cardTitle},[divs('flex min-w-0 items-center gap-1.5 text-xs font-medium btw-tp',[span('btw-ac font-mono btw-tx-10 shrink-0',entry.parent_id?'↳':steerInfo?(steerInfo.target==='subagent'?'🤖':'🎯'):'✦'),
(entry.live_voice||/^\[LIVE:/i.test(String(entry.title||'')))
?span('rounded bg-emerald-500/15 px-1.5 py-px font-mono btw-tx-9 font-semibold text-emerald-400 shrink-0','LIVE')
:(entry.voice_dictated||/^\[STT:/i.test(String(entry.title||'')))
?span('rounded btw-bg-ac14 px-1.5 py-px font-mono btw-tx-9 font-semibold btw-ac shrink-0','VOICE')
:null,
hasEntryMedia?span('rounded btw-bg-ac18 px-1.5 py-px font-mono btw-tx-9 font-semibold btw-ac shrink-0',entry.media_pending?'⏳ MEDIA':(Array.isArray(entry.media_items)&&entry.media_items.some(m=>m?.kind==='video')?'🎬 VIDEO':'🎨 IMAGE')):null,
span('truncate',cardTitle||strings.quickQuestionFallback)]),entry.answer&&div('truncate btw-tx-105 btw-tt opacity-85',stripInlineMarkdownPreview(entry.answer,96))]):divs({cls:'min-w-0 flex-1',title:entry.question||cardTitle},[divs('flex items-center gap-1.5 text-xs font-semibold btw-tp',[span('btw-ac font-mono btw-tx-10 shrink-0',entry.parent_id?'↳':steerInfo?(steerInfo.target==='subagent'?'🤖':'🎯'):'✦'),
(entry.live_voice||/^\[LIVE:/i.test(String(entry.title||'')))
?span('rounded bg-emerald-500/15 px-1.5 py-px font-mono btw-tx-9 font-semibold text-emerald-400 shrink-0','LIVE')
:(entry.voice_dictated||/^\[STT:/i.test(String(entry.title||'')))
?span('rounded btw-bg-ac14 px-1.5 py-px font-mono btw-tx-9 font-semibold btw-ac shrink-0','VOICE')
:null,
span('truncate',cardTitle||strings.quickQuestionFallback)]),showQuestionSub&&div('mt-0.5 truncate btw-tx-105 btw-ts opacity-85',entry.question),divs('mt-0.5 flex flex-wrap items-center gap-1.5 btw-tx-105 btw-tt',[
!isBasicMode&&span('font-mono',entry.id),
!isBasicMode&&entry.duration_ms
?span('font-medium btw-ts',`· ${strings.answeredIn(`${(entry.duration_ms / 1000).toFixed(1)}s`)}`):null,
!isBasicMode&&entry.model
?span('truncate max-w-36',`· ${shortModelName(entry.model)}`):null,
entry.created_at?span(null,`${!isBasicMode?'· ':''}${fmtClock(entry.created_at)}`):null,
entry.parent_id?span('btw-branch-badge',strings.branchedFromLabel(parentTitle?parentTitle.slice(0,22):entry.parent_id)):null,
!isBasicMode&&entry.source==='btw-studio-llm'
?jsx(Seal,{kind:'hypo',title:strings.sealHypoTip,children:strings.sealHypo}):null,
!isBasicMode&&entry.resolved_question
?span({title:entry.resolved_question},jsx(Seal,{kind:'observed',children:`{{ }} ${strings.tokensResolved}` }))
:null,
!isBasicMode&&repeatCount>=2&&!alreadyPreset
?span({role:'button',tabIndex:0,title:strings.saveCardAsPresetTip,onClick:e=>{e.preventDefault()
e.stopPropagation()
openPresetCreatorFromQuestion(entry.question,'ask')},onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault()
e.stopPropagation()
openPresetCreatorFromQuestion(entry.question,'ask')}},cls:'inline-flex items-center gap-1 rounded-full border btw-bd-ac45 btw-bg-ac12 px-1.5 py-0 btw-tx-10 font-semibold btw-ac btw-hv-ac22 cursor-pointer'},strings.repeatedBtwBadge(repeatCount)):null])])]),divs(CLS.rowShrink15,[steerInfo&&span({cls:'btw-steered-badge',title:steerInfo.command||strings.steeredCalloutTitle},steerInfo.target==='subagent'?strings.steeredBadgeSub:strings.steeredBadgeMain),collapsed&&entry.parent_id&&
span({cls:'btw-branch-badge',title:strings.branchedFromLabel(parentTitle||entry.parent_id)},`↳ ${parentTitle?parentTitle.slice(0,12):'branch'}`),collapsed&&entry.created_at&&span('font-mono btw-tx-10 btw-tt tabular-nums',fmtClock(entry.created_at).slice(0,5)),
divs({cls:cn('flex items-center gap-0.5',collapsed&&'btw-qa-row-actions')},[!compact&&tip(strings.cardMiniChatTip,hBtn('btw-action-mode-pill',{'aria-label':strings.cardMiniChatTip,onClick:()=>{if(isBasicMode){attachBtwCardToComposer(entry,'steer_main')
return}
$activeCardMiniChatId.set(miniChatOpen?'':entry.id)
if(collapsed&&!miniChatOpen)setCollapsed(false)
haptic?.('tap')}},`⚡ ${strings.cardMiniChatBtn}`)),
!compact&&!isBasicMode&&!collapsed&&jsx(PromoteMenu,{entry,sessionScope,onCloseSurface}),
!collapsed&&tip(isSpeakingThisCard
?(lang==='pt'?'Parar leitura em voz alta (TTS)':'Stop speaking aloud (TTS)')
:(lang==='pt'?'Ouvir resposta em voz alta (Nous OpenAI TTS)':'Speak answer aloud (Nous OpenAI TTS)'),uiBtn('ghost','icon-xs',{onClick:e=>{
e.stopPropagation()
void speakBtwCardOrText(entry,sessionScope)
},cls:isSpeakingThisCard?'btw-em animate-pulse':CLS.muted},span('btw-tx-11',isSpeakingThisCard?'⏹':'🔊'))),
!collapsed&&jsx(CopyButton,{text:entry.answer,appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,
'aria-label':strings.copyAnswer}),tip(strings.pinTip(entry.pinned),uiBtn('ghost','icon-xs',{'aria-label':strings.pinTip(entry.pinned),onClick:onPin,cls:entry.pinned?CLS.accent:CLS.muted},codicon(entry.pinned?'pinned-dirty':'pin','0.72rem'))),!compact&&jsxs(DropdownMenu,{
children:[jsx(DropdownMenuTrigger,{asChild:true,children:uiBtn('ghost','icon-xs',{title:strings.moreActionsTip,'aria-label':strings.moreActionsTip},codicon('ellipsis'))}),
jsxs(DropdownMenuContent,{align:'end','data-btw-portal':'',children:[entry.question&&jsx(DropdownMenuItem,{onSelect:()=>{
attachBtwCardToComposer(entry,'ask_btw')},children:spans(CLS.inline2Xs,[codicon('comment','0.75rem',CLS.accent),strings.followUpTip])}),
entry.question&&jsx(DropdownMenuItem,{onSelect:()=>void dispatchSideQuestion(entry.question,sessionScope),
children:spans(CLS.inline2Xs,[codicon('refresh','0.75rem',CLS.accent),strings.reAskTip])}),
jsx(DropdownMenuItem,{onSelect:()=>void onInsertToComposer(),children:spans(CLS.inline2Xs,[codicon('reply','0.75rem',CLS.accent),strings.quoteInChatTip])}),
!isBasicMode&&
entry.question&&!alreadyPreset&&jsx(DropdownMenuItem,{onSelect:()=>openPresetCreatorFromQuestion(entry.question,'ask'),
children:spans(CLS.inline2Xs,[codicon('diff-added','0.75rem',CLS.accent),strings.saveCardAsPresetTip])}),
jsx(DropdownMenuSeparator,{}),jsx(DropdownMenuItem,{onSelect:()=>void onDelete(),children:spans('inline-flex items-center gap-2 text-xs text-destructive',[codicon('trash'),strings.deleteTip])})]})]})])])]),!collapsed&&steerInfo?.command&&
divs('btw-steered-callout',[div('btw-steered-callout-title',strings.steeredCalloutTitle),div('font-mono btw-tx-105 btw-ts whitespace-pre-wrap',steerInfo.command)]),!collapsed&&
Array.isArray(entry.attachments)&&entry.attachments.length>0&&div('btw-attach-strip px-1 pb-1',entry.attachments.map(att=>spans({cls:'btw-attach-chip',title:att.preview||att.detail||att.label},[att.kind==='image'&&_SAFE_INLINE_MEDIA_URI_RE.test(att.thumbnail_url||'')
?h('img',{src:att.thumbnail_url,alt:att.label,cls:'btw-attach-thumb'}):span(null,att.kind==='session'
?'💬':att.kind==='audio'?'🔊':att.kind==='video'?'🎬':att.kind==='pasted'?'📋':att.kind==='folder'?'📁'
:att.kind==='url'?'🌐':att.kind==='image'?'🖼':'📄'),
span('truncate font-medium',att.label),att.detail
?span('font-mono btw-tx-95 btw-tt truncate max-w-24',att.detail):null],att.id||att.label))),!collapsed&&div({cls:'btw-qa-body','data-selectable-text':'true'},jsx(BtwRichAnswerBody,{text:entry.answer,entry,sessionScope})),!collapsed&&!compact&&divs('btw-qa-footer-bar',[divs(CLS.rowWrap15,[hBtn('btw-action-mode-pill',{title:strings.cardFooterContinueTip,onClick:()=>attachBtwCardToComposer(entry,'ask_btw')},strings.cardFooterContinueBtn),hBtn('btw-action-mode-pill',{title:strings.cardFooterSteerTip,onClick:()=>attachBtwCardToComposer(entry,'steer_main')},strings.cardFooterSteerBtn),hBtn('btw-action-mode-pill',{title:strings.cardFooterSpawnTip,onClick:()=>attachBtwCardToComposer(entry,'spawn_subagent')},strings.cardFooterSpawnBtn)]),hBtn('btw-action-mode-pill',{disabled:savedBtwMd,title:strings.cardFooterBtwMdTip,onClick:async()=>{await memorizeCardRuleToBtwMd(entry,sessionScope)
setSavedBtwMd(true)}},savedBtwMd?strings.cardFooterBtwMdDone:strings.cardFooterBtwMdBtn)]),!compact&&
!isBasicMode&&
miniChatOpen&&jsx(CardSteerMiniChat,{entry,sessionScope,availableSubagents,onCloseSurface,
onDone:()=>$activeCardMiniChatId.set('')})])}
function TurnSparkline({points,title,scope=null,onSelectTurnTactical=null}){
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const[selectedTurnIdx,setSelectedTurnIdx]=useState(null)
const validPoints=Array.isArray(points)?points.filter(Boolean):[]
if(validPoints.length<2)return null
const maxTools=Math.max(1,...validPoints.map(p=>Number(p.tools)||0))
const peakIdx=validPoints.reduce((best,p,i)=>((Number(p.tools)||0)>=(Number(validPoints[best]?.tools)||0)?i:best),0)
const hasAlertTurn=validPoints.some(p=>Number(p.errors||0)>0)
const svgW=620
const svgH=42
const padX=6
const innerW=svgW - padX * 2
const step=innerW / Math.max(1,validPoints.length - 1)
const coords=validPoints.map((p,idx)=>{
const x=Math.round(padX + idx * step)
const ratio=(Number(p.tools)||0)/ maxTools
const y=Math.round(svgH - 7 - ratio *(svgH - 14))
return{x,y,idx,tools:Number(p.tools||0),errors:Number(p.errors||0)}})
const polyPoints=coords.map(c=> `${c.x},${c.y}`).join(' ')
let smoothPath= `M ${coords[0].x},${coords[0].y}`
for(let i=0;i<coords.length - 1;i++){
const p0=coords[i]
const p1=coords[i + 1]
const cx=Math.round((p0.x + p1.x)/ 2)
smoothPath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`}
const areaPath= `${smoothPath} L ${coords[coords.length - 1].x},${svgH - 2} L ${coords[0].x},${svgH - 2} Z`
const activeTurn=selectedTurnIdx!=null&&coords[selectedTurnIdx]?coords[selectedTurnIdx]:null
const peakCoord=coords[peakIdx]||null
return divs('rounded-xl border btw-bd-st70 btw-bg-tp18m p-3',[
divs('mb-2 flex flex-wrap items-center justify-between gap-2 btw-tx-10 font-semibold uppercase tracking-wider btw-tt',[spans(CLS.inline15,[
codicon('pulse','0.75rem',CLS.accent),title]),divs(CLS.row15,[span('font-mono btw-ts',strings.sparklineMeta(validPoints.length,maxTools)),hBtn('btw-tile-mini-btn btw-ac',{title:isPt?'Inspecionar pico de atividade no turno':'Inspect peak activity turn',onClick:()=>{
setSelectedTurnIdx(prev=>(prev===peakIdx?null:peakIdx))
haptic?.('tap')}},isPt? `Pico T#${peakIdx + 1}` : `Peak T#${peakIdx + 1}`)])]),hs('svg',{viewBox: `0 -4 ${svgW} ${svgH + 8}`,preserveAspectRatio:'xMidYMid meet',cls:'w-full h-12 overflow-visible cursor-pointer'},[
h('line',{x1:String(padX),y1:String(svgH - 2),x2:String(svgW - padX),y2:String(svgH - 2),stroke:'var(--btw-radar-grid,rgba(148,163,184,0.22))',strokeWidth:'1',strokeDasharray:'3 3'}),
peakCoord&&maxTools>=2&&h('line',{x1:String(peakCoord.x),y1:String(peakCoord.y),x2:String(peakCoord.x),y2:String(svgH - 2),stroke:'currentColor',strokeWidth:'1',strokeDasharray:'2 2',cls:'btw-ac opacity-45'}),
h('path',{d:areaPath,fill:'currentColor',cls:'btw-ac opacity-12'}),h('path',{d:smoothPath,fill:'none',stroke:'currentColor',strokeWidth:'1.8',strokeLinecap:'round',points:polyPoints,cls:CLS.accent}),coords.map((c,i)=>{
const isSel=selectedTurnIdx===i
const isPeak=i===peakIdx&&maxTools>=2
return hs('g',{onClick:()=>{setSelectedTurnIdx(prev=>(prev===i?null:i))
haptic?.('tap')}},[(isSel||isPeak)&&h('circle',{cx:String(c.x),cy:String(c.y),r:isSel?'6':'4.5',fill:'none',stroke:c.errors>0?'var(--btw-warn,#f59e0b)':'currentColor',strokeWidth:'1.2',cls:c.errors>0?'opacity-85':'btw-ac opacity-65'}),h('circle',{cx:String(c.x),cy:String(c.y),r:isSel?'4':c.errors>0?'3.4':'2.4',fill:c.errors>0?'var(--btw-warn,#f59e0b)':'currentColor',stroke:'var(--btw-s0,#0b101d)',strokeWidth:'1',cls:c.errors>0?'':CLS.accent}),h('title',null,`Turn #${i + 1}: ${c.tools} ${c.tools===1?'tool':'tools'}${c.errors>0? ` · ${c.errors} alert` :''}`)],i)})]),
divs('mt-1 flex items-center justify-between font-mono btw-tx-9 btw-tq',[
span(null,'T#1'),
spans(CLS.row15,[span(null,`max ${maxTools}/turn`),hasAlertTurn&&span('text-amber-400',isPt?'· ● turno c/ alerta':'· ● alert turn')]),
span(null,`T#${validPoints.length}`)
]),activeTurn&&divs('mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border btw-bd-st60 btw-bg-tp25m px-2.5 py-1 btw-tx-105',[divs('flex items-center gap-2 font-mono',[span('font-bold btw-ac',isPt? `Turno #${activeTurn.idx + 1}` : `Turn #${activeTurn.idx + 1}`),
span('btw-ts',`🛠 ${activeTurn.tools} tools`),jsx(Seal,{
kind:activeTurn.errors>0?'observed':'helped',children:activeTurn.errors>0? `⚠ ${activeTurn.errors} alert` :'✓ clean'})]),
divs('flex items-center gap-1',[hBtn('btw-tile-mini-btn',{onClick:()=>{
const q=isPt
? `O que aconteceu no Turno #${activeTurn.idx + 1} (${activeTurn.tools} chamadas de ferramentas${activeTurn.errors>0? `, ${activeTurn.errors} alerta` :''}) e como otimizar o ritmo?`
: `What happened in Turn #${activeTurn.idx + 1} (${activeTurn.tools} tool calls${activeTurn.errors>0? `, ${activeTurn.errors} alert` :''}) and how can we optimize the rhythm?`
if(onSelectTurnTactical){onSelectTurnTactical({target: `Turn #${activeTurn.idx + 1} (${activeTurn.tools} tools)`,prompt:q,
steer:isPt
? `Otimize o ritmo de chamadas de ferramentas (referência: Turno #${activeTurn.idx + 1} com ${activeTurn.tools} tools), agrupando leituras independentes em paralelo.`
: `Optimize tool-call batching rhythm (reference: Turn #${activeTurn.idx + 1} with ${activeTurn.tools} tools) by batching independent reads in parallel.`
})
}else{stageCommandInBtwChat(q,{label: `📈 Turn #${activeTurn.idx + 1} → /btw`,source:'sparkline',icon:'pulse'})}
haptic?.('tap')}},`💬 /btw T#${activeTurn.idx + 1}`),hBtn('btw-tile-mini-btn',{'data-tone':'steer',onClick:()=>{
const st=isPt
? `Agrupe chamadas de ferramentas independentes em paralelo e evite chamadas sequenciais redundantes (pico observado no Turno #${activeTurn.idx + 1}: ${activeTurn.tools} tools).`
: `Batch independent tool calls in parallel and avoid redundant sequential calls (peak observed at Turn #${activeTurn.idx + 1}: ${activeTurn.tools} tools).`
void steerActiveSession(st,scope,null,{source:'sparkline_turn'})}},'⚡ Steer')])])])}
function humanizeErrorDetail(rawDetail,lang='en'){
const isPt=lang==='pt'
let txt=String(rawDetail||'').trim()
if(!txt)return isPt?'Falha de execução':'Execution failure'
if(txt.startsWith('{')&&txt.includes('"output"')){try{
const parsed=JSON.parse(txt)
txt=String(parsed.error||parsed.output||txt)
}catch{
const mOut=txt.match(/"output"\s*:\s*"((?:\\.|[^"\\])*)"/)
if(mOut){txt=mOut[1].replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\\"/g,'"')}}}
txt=txt.replace(/^exit\s+\d+:\s*/i,'').replace(/\r\n/g,'\n')
const lines=txt
.split('\n')
.map(l=>l.trim())
.filter(l=>l&&!/^[.=_-]{5,}/.test(l)&&!/warnings summary/i.test(l)&&!/^Traceback/i.test(l)&&!/^File\s+"/i.test(l))
const errLine=[...lines].reverse().find(l=>/(Error|Exception|FAILED|failed|denied|timeout|not found):?/i.test(l))||
lines[lines.length - 1]||txt
return errLine.slice(0,140)}
function buildBasicOverviewMarkdown(d,scope,strings,lang='en',activeTool='',activeErrors=[],safeTodos=[]){
const base=buildClientRadarMarkdown(d)
const done=safeTodos.filter(t=>t?.status==='completed'||t?.status==='done').length
const extra=[]
if(activeTool)extra.push(`- **Active:** ${strings.runningTool(activeTool)}`)
if(activeErrors.length)extra.push(`- **Alerts:** ${activeErrors.length}`)
if(safeTodos.length)extra.push(`- **Plan:** ${done}/${safeTodos.length}`)
return extra.length?`${base}\n\n${extra.join('\n')}`:base}
function SvgRingGauge({pct=0,color='#38bdf8',size=42,centerLabel=null,pulse=false}){
const clamped=Math.min(100,Math.max(0,Number(pct||0)))
const visualPct=clamped>0?Math.max(4,clamped):0
const r=17.5,circ=2*Math.PI*r,offset=circ-(visualPct/100)*circ
const pctLabel=clamped>0&&clamped<10&&Math.round(clamped*10)%10!==0?`${clamped.toFixed(1)}%`:`${Math.round(clamped)}%`
const mainTxt=centerLabel!=null?String(centerLabel):pctLabel
return divs({cls:cn('relative shrink-0 flex items-center justify-center',pulse&&'btw-ring-gauge--pulse'),style:{width:`${size}px`,height:`${size}px`,'--btw-ring-color':color}},[hs('svg',{width:size,height:size,viewBox:'0 0 42 42',cls:'block -rotate-90 overflow-hidden'},[h('circle',{cx:'21',cy:'21',r:String(r),fill:'none',stroke:'rgba(148,163,184,0.2)',strokeWidth:'3'}),h('circle',{cls:'btw-ring-gauge-fill',cx:'21',cy:'21',r:String(r),fill:'none',stroke:color,strokeWidth:'3',strokeLinecap:'round',strokeDasharray:circ.toFixed(2),strokeDashoffset:offset.toFixed(2)})]),divs('absolute inset-0 flex items-center justify-center pointer-events-none',[span({cls:'font-mono font-bold tabular-nums btw-tp',style:{fontSize:mainTxt.length>=5?'8.5px':'10px',lineHeight:1}},mainTxt)])])}
function ContemporaryFilesGrid({d,scope,lang,strings,onSelectFileTactical=null,hideWorkspaceBadge=false}){
const expandedDiff=useValue($expandedDiffPath)
const isPt=lang==='pt'
const anomalies=Array.isArray(d?.anomalies)?d.anomalies.filter(Boolean):[]
const rawTouched=Array.isArray(d?.touched_files_details)&&d.touched_files_details.length>0
?d.touched_files_details.filter(Boolean):(Array.isArray(d?.touched_files)?d.touched_files.filter(Boolean):[]).map(fp=>({
path:fp,edits:0,diff_preview:''
}))
const touchedMap=new Map()
for(const anom of anomalies){if(anom.kind==='edit_churn'){
const mEdits=String(anom.title||'').match(/\((\d+)\s+edits?\)/i)
const editsCnt=mEdits?Number(mEdits[1]):10
const fp=anom.detail||(String(anom.title||'').match(/on\s+([^\s(]+)/i)?.[1]??'')
if(fp){
const key=splitPathLeaf(fp).leaf
touchedMap.set(key,{path:fp,edits:editsCnt,churnAlert:true,diff_preview:''})}}}
for(const item of rawTouched){if(!item?.path)continue
const key=splitPathLeaf(item.path).leaf
const existing=touchedMap.get(key)
touchedMap.set(key,{...existing,...item,edits:Math.max(Number(item.edits||0),Number(existing?.edits||0)),
churnAlert:Boolean(existing?.churnAlert||Number(item.edits||0)>=8)})}
const files=Array.from(touchedMap.values()).slice(0,8)
if(files.length===0)return null
return divs('flex flex-col gap-2',[divs('flex items-center justify-between gap-2 px-0.5',[spans('inline-flex items-center gap-1.5 btw-tx-10 font-semibold uppercase tracking-wider btw-tt',[
codicon('files','0.75rem',CLS.accent),`${strings.recentFilesTitle} (${files.length})`]),
!hideWorkspaceBadge&&d?.cwd?span({cls:'font-mono btw-tx-95 btw-ts opacity-80 truncate max-w-52',title:d.cwd},splitPathLeaf(d.cwd).leaf):null]),div('btw-file-bento-grid',files.map((item,idx)=>{
const fp=item.path
const hasDiff=Boolean(item.diff_preview)
const isExpanded=expandedDiff===fp
const isOddLast=files.length>1&&files.length % 2===1&&idx===files.length - 1
const{leaf,relDir,full}=formatRelativeWorkspacePath(fp,d?.cwd)
const ext=(leaf.includes('.')?leaf.split('.').pop()||'FILE':'FILE').slice(0,4).toUpperCase()
const edits=Number(item.edits||0)
const isSyntaxErr=item.psi?.status==='syntax_error'
const isHighChurn=Boolean(item.churnAlert||edits>=8)
const askFilePrompt=isPt
? `Revise o arquivo \`${leaf}\` (${relDir||'./'}) e verifique se há regressões, bugs de borda ou melhorias pendentes.`
: `Review file \`${leaf}\` (${relDir||'./'}) and check for regressions, edge-case bugs, or pending improvements.`
const steerFilePrompt=isSyntaxErr?isPt
? `Corrija imediatamente o erro de sintaxe na linha ${item.psi?.line||'?'} de \`${leaf}\` e valide a sintaxe antes de prosseguir.`
: `Immediately fix the syntax error at line ${item.psi?.line||'?'} in \`${leaf}\` and validate syntax before continuing.`
:isHighChurn?isPt
? `Estabilize as edições em \`${leaf}\` (${edits}× edições) e rode verificação de sintaxe/testes antes de novas alterações.`
: `Stabilize edits in \`${leaf}\` (${edits}× edits) and run syntax/test verification before further changes.` :isPt
? `Verifique a integridade de \`${leaf}\` e garanta que todas as referências e testes relacionados passem.`
: `Verify the integrity of \`${leaf}\` and ensure all related references and tests pass.`
return divs({cls:'btw-file-bento-card group','data-churn':isHighChurn?'high':'normal','data-syntax':isSyntaxErr?'error':'ok','data-expanded':isExpanded?'true':'false',style:(isExpanded||isOddLast)?{gridColumn:'1 / -1'}:undefined},[divs('flex items-center justify-between gap-2 min-w-0',[divs(CLS.rowMin0,[
span('btw-file-ext-badge shrink-0',ext),span({cls:'font-mono btw-tx-115 font-semibold btw-tp truncate',title:full},leaf)]),isSyntaxErr
?jsx(Seal,{kind:'psi-bad',children:`✗ L${item.psi?.line||'?'}` }):isHighChurn
?jsx(Seal,{kind:'observed',children:`${edits}×` }):edits>0?jsx(Seal,{kind:'helped',children:`${edits}×` })
:span('rounded btw-bg-tp5 px-1.5 py-0.5 font-mono btw-tx-9 btw-tt shrink-0',isPt?'lido':'read')]),divs('flex items-center justify-between gap-1.5 min-w-0',[span({cls:'font-mono btw-tx-10 btw-ts opacity-80 truncate min-w-0 flex-1',title:relDir||'./'},relDir||'./'),divs('btw-file-row-actions shrink-0',[hasDiff&&hBtn('btw-tile-mini-btn',{onClick:()=>{$expandedDiffPath.set(isExpanded?'':fp)
haptic?.('tap')}},isExpanded?'▴ Diff':'▾ Diff'),hBtn('btw-tile-mini-btn',{title:isPt? `Perguntar via /btw sobre ${leaf}` : `Ask /btw about ${leaf}`,onClick:()=>{addBtwAttachment({id: `file_${leaf}`,
kind:'file',label: `@file:${leaf}`,detail: `${relDir}${leaf}`,path:full})
if(onSelectFileTactical){onSelectFileTactical({target: `@file:${leaf}`,prompt:askFilePrompt,steer:steerFilePrompt})
}else{stageCommandInBtwChat(askFilePrompt,{label:isPt? `📄 @file:${leaf} no chat /btw` : `📄 @file:${leaf} staged in /btw`,
source:'file',icon:'file-code'})}
haptic?.('tap')}},'/btw'),hBtn('btw-tile-mini-btn',{'data-tone':'steer',title:isPt? `Direcionar agente sobre ${leaf} via Steer` : `Steer agent on ${leaf}`,onClick:()=>{
void steerActiveSession(steerFilePrompt,scope,null,{source:'file_card',targetKind:isHighChurn?'edit_churn':'file_verify'})}},'Steer')])]),hasDiff&&isExpanded&&divs('mt-1 flex flex-col gap-1',[divs('flex items-center justify-between px-1 btw-tx-95 font-mono btw-tt',[
span(null,`${full} · Live Diff Preview`),jsx(CopyButton,{text:item.diff_preview||'',appearance:'icon',
buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer})]),h('pre','btw-diff-box font-mono btw-ts',item.diff_preview)])],fp||idx)}))])}
function isSessionUnstarted(snap,scope,demoMode=false,entriesLen=0,hasPending=false){
if(demoMode||scope?.busy||hasPending||Number(entriesLen||0)>0)return false
if(!snap||!snap.found){
const focusUsage=host.state?.focusedUsage?.get?.()
if(focusUsage&&(Number(focusUsage.calls||0)>0||Number(focusUsage.input||0)>0||Number(focusUsage.output||0)>0))return false
const pulse=scope?.key?$livePulseBySession.get()?.[scope.key]:null
if(pulse&&(pulse.busy||Number(pulse.turn_tools||0)>0))return false
const hashSid=typeof location!=='undefined'&&location.hash?location.hash.replace(/^#\/?/,'').split(/[?#]/)[0].trim():''
if((scope?.storedId||scope?.runtimeId||hashSid)&&String(scope?.storedId||scope?.runtimeId||hashSid).startsWith('local-'))return false
return true}
const c=snap.counts||{}
const noMsgs=Number(c.messages_total||0)===0&&Number(c.messages_active||0)===0
const noTools=Number(c.tool_calls||0)===0&&Number(c.api_calls||0)===0
const noSubs=!Array.isArray(snap.subagents)||snap.subagents.length===0
return noMsgs&&noTools&&noSubs}
function WaitingToStartSessionHero({scope,variant='ask',onOpenSettings}){
const lang=useValue($lang)
const curveIdx=useValue($loaderCurveIdx)
const settingsMode=useValue($settingsMode)
const isTelemetric=settingsMode!=='basic'
const strings=I18N[lang]||I18N.en
const isPt=lang==='pt'
const useRadarVisual=variant==='radar'||(variant==='ask'&&isTelemetric)
const activeCurve=useRadarVisual?NATIVE_RADAR_CURVES[curveIdx % NATIVE_RADAR_CURVES.length]||'spiral-search'
:NATIVE_LOADER_CURVES[curveIdx % NATIVE_LOADER_CURVES.length]||'lemniscate-bloom'
const cycleCurve=()=>{setPref($loaderCurveIdx,(curveIdx + 1)% NATIVE_LOADER_CURVES.length,'loaderCurveIdx')
haptic?.('tap')}
const focusMainComposer=()=>{closeAllStudioSurfaces()
setTimeout(()=>{try{host.composer?.focus?.()
}catch{}
},24)
haptic?.('tap')}
const pillSuffix=variant==='subagents'?'subagents · standby':variant==='cards'?'side-channel · /btw':activeCurve
const variantHeading=variant==='subagents'?isPt?'Frota de subagentes em espera':'Subagent fleet on standby'
:variant==='cards'?isPt?'Nenhum card /btw nesta sessão':'No /btw cards in this session':variant==='radar'?isPt
?'Telemetria $0 em espera':'Live $0 telemetry on standby':isPt?'Pronto para consultas /btw':'Ready for /btw side-queries'
const variantSubtitle=variant==='subagents'?isPt
?'Inicie a sessão no chat principal para habilitar subagentes, dossiês CoT e steer por bot.'
:'Start the session in the main chat to unlock subagents, CoT dossiers, and per-bot steering.':variant==='cards'?isPt
?'Respostas paralelas com Markdown, tabelas e síntese de steer aparecerão aqui.'
:'Parallel answers with Markdown, tables, and steer synthesis will appear here.':variant==='radar'||useRadarVisual?isPt
?'Envie a primeira mensagem no chat principal para ativar o radar $0, cache L0 e diagnóstico.'
:'Send a message in the main chat to wake live $0 telemetry, L0 cache, and diagnostics.':isPt
?'Envie a primeira mensagem no chat principal para consultar o contexto sem poluir a conversa.'
:'Send a message in the main chat to query live context without polluting the transcript.'
let visualCenterpiece=null
if(variant==='subagents'){visualCenterpiece=divs('btw-waiting-orb btw-waiting-orb--subagent',[
div('btw-waiting-ring-outer'),div('btw-waiting-ring-inner'),typeof Blobatar==='function'
?jsx(Blobatar,{name:String(scope?.profile||'hermes-neutral-subagent'),size:46,animate:'always',
className:'block overflow-visible'}):codicon('hubot','1.8rem',CLS.accent)])
}else if(variant==='cards'){visualCenterpiece=divs('btw-waiting-decode-card',[divs(CLS.rowBetween,[spans('inline-flex items-center gap-1.5 font-mono btw-tx-95 font-medium btw-ts',[
typeof SessionStatusDot==='function'?jsx(SessionStatusDot,{storedSessionId:null}):jsx(StatusDot,{tone:'good'}),
'✦ /btw card']),typeof PanelPill==='function'?jsx(PanelPill,{tone:'muted',children:'standby'})
:span('font-mono btw-tx-9 btw-tq','standby')]),div('btw-tx-105 btw-tt truncate',isPt?'Markdown · Tabelas · Código · Steer':'Markdown · Tables · Code · Live Steer')])
}else{visualCenterpiece=tip(`${strings.waitingCurveTip} (${activeCurve})`,divs({cls:cn('btw-waiting-orb',useRadarVisual&&'btw-waiting-orb--radar'),role:'button',tabIndex:0,onClick:cycleCurve,onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault()
cycleCurve()}}},[useRadarVisual&&div('btw-waiting-radar-crosshair'),
useRadarVisual&&div('btw-waiting-radar-sweep'),div('btw-waiting-ring-outer'),
div('btw-waiting-ring-inner'),typeof Loader==='function'?jsx(Loader,{type:activeCurve,strokeScale:1,
className:'size-11 btw-ac'}):jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent})]))}
return divs({cls:'btw-waiting-stage',role:'status','aria-live':'polite'},[visualCenterpiece,divs('btw-waiting-pill',[typeof SessionStatusDot==='function'?jsx(SessionStatusDot,{storedSessionId:null})
:jsx(StatusDot,{tone:'good'}),span('btw-ts',pillSuffix)]),div('mt-0.5 btw-tx-13 font-semibold tracking-tight btw-tp',variantHeading),div('opacity-70',jsx(DecodeText,{text:strings.waitingToStartTitle,prefix:7,loop:false,cursor:false,
className:'btw-waiting-decode'})),div('max-w-[40ch] btw-tx-115 leading-relaxed btw-tt',variantSubtitle),divs('btw-waiting-actions',[uiBtn('secondary','xs',{cls:'h-6 rounded-md px-2.5 btw-tx-11 font-medium',onClick:focusMainComposer},spans(CLS.inline15,[
codicon('comment','0.72rem',CLS.accent),strings.waitingFocusComposerBtn])),uiBtn('ghost','xs',{cls:'h-6 rounded-md px-2 btw-tx-11 btw-tt btw-hv-tp',onClick:()=>{
$demoShowcase.set(true)
haptic?.('tap')}},strings.demoBtnShort),onOpenSettings&&uiBtn('ghost','xs',{cls:'h-6 rounded-md px-2 btw-tx-11 btw-tt btw-hv-tp',onClick:()=>{onOpenSettings()
haptic?.('tap')}},spans(CLS.inline1,[
codicon('settings-gear','0.7rem'),isPt?'Aparência':'Appearance']))])])}
function RadarView({scope,radarQuery,onOpenSettings}){
const pulseMap=useValue($livePulseBySession)
const pendingMap=useValue($pendingBySession)
const entriesMap=useValue($entriesBySession)
const lang=useValue($lang)
const demoMode=useValue($demoShowcase)
const settingsMode=useValue($settingsMode)
const isBasicMode=settingsMode==='basic'
const askMode=useValue($askMode)
const personality=useValue($personality)
const growthMode=useValue($growthMode)
const deepOverviewsMap=useValue($deepOverviewBySession)
const maxReports=useValue($maxDeepOverviewReports)
const expandedRepMap=useValue($expandedDeepReportIds)
const[loadingDeepOverview,setLoadingDeepOverview]=useState(false)
const[overviewCurveIdx,setOverviewCurveIdx]=useState(0)
const[tacticalOpen,setTacticalOpen]=useState(false)
const[tacticalTarget,setTacticalTarget]=useState('')
const[tacticalDraft,setTacticalDraft]=useState('')
const[tacticalSteerDraft,setTacticalSteerDraft]=useState('')
const[resolvedErrorsOpen,setResolvedErrorsOpen]=useState(false)
const[selectedToolName,setSelectedToolName]=useState('')
const focusedUsage=useValue(host.state?.focusedUsage??$noPet)
const liveComposerModel=useValue(host.state?.model??$noPet)
const strings=I18N[lang]||I18N.en
const isPt=lang==='pt'
const pulse=pulseMap[scope.key]||null
const pendingBtw=pendingMap[scope.key]||null
const sessionEntries=Array.isArray(entriesMap[scope.key])?entriesMap[scope.key]:[]
const latestBtwEntry=sessionEntries[0]||null
const hasTarget=Boolean(scope.storedId||scope.runtimeId)
const overviewCurves=['rose-orbit','lemniscate-bloom','fourier-flow','hypotrochoid-loop']
const activeOverviewCurve=overviewCurves[overviewCurveIdx % overviewCurves.length]
const openRadarTactical=useCallback(({target='',prompt='',steer=''}={})=>{setTacticalTarget(target)
setTacticalDraft(prompt)
setTacticalSteerDraft(steer||prompt)
setTacticalOpen(true)
haptic?.('tap')
},[])
const deepReports=useMemo(()=>{
const raw=deepOverviewsMap[scope.key]
if(!raw)return[]
if(Array.isArray(raw))return raw
if(raw.markdown){
return[{id: `rep_legacy_${raw.updated_at||Date.now()}`,reportNum:1,title:'Report #1',markdown:raw.markdown,
engine:raw.engine||'fast',model:raw.model||'',duration_ms:raw.duration_ms||0,created_at:raw.updated_at||Date.now()}]}
return[]
},[deepOverviewsMap,scope.key])
const deleteDeepReport=reportId=>{
const cur=Array.isArray(deepOverviewsMap[scope.key])?deepOverviewsMap[scope.key]:deepReports
const nextList=cur.filter(r=>r.id!==reportId)
$deepOverviewBySession.set({...$deepOverviewBySession.get(),[scope.key]:nextList})
haptic?.('tap')}
const clearAllDeepReports=()=>{
const next={...$deepOverviewBySession.get()}
delete next[scope.key]
$deepOverviewBySession.set(next)
haptic?.('tap')}
const toggleExpandReport=reportId=>{
const cur=$expandedDeepReportIds.get()||{}
$expandedDeepReportIds.set({...cur,[reportId]:!cur[reportId]})
haptic?.('tap')}
const runDeepOverview=async()=>{if(loadingDeepOverview)return
setLoadingDeepOverview(true)
const sid=scope.storedId||scope.runtimeId||''
const mode=$askMode.get()||'fast'
let res=null
if(demoMode){await new Promise(r=>setTimeout(r,240))
res={ok:true,engine:'demo_showcase',model:'claude-sonnet-4-5',duration_ms:420,overview_markdown:isPt?[
'### ✦ Diagnóstico Executivo Profundo — Showcase Interativo','',
'> **Status Global (`WATCH · Score 86/100`)**: Sessão saudável com **94.2% de Cache Hit L0** (`$1.84 USD` economizados) e **1 auto-recuperação verificada (`Δτ`)**.',
'','| Eixo Analisado | Métrica Medida | Diagnóstico & Causa Raiz |','| :--- | :--- | :--- |',
'| **🧠 Janela vs Compressão** | `84.2k / 200.0k (42.1%)` | Contexto enxuto sem perda por compactação; maior payload é `execute_code` (`3.7k` tok). |',
'| **⚡ Cache de Prefixo L0** | `94.2%` (`412.0k` read) | Prefixo 100% preservado porque consultas `/btw` operam fora da transcrição principal. |',
'| **🔍 Fluxo & Arquivos** | `3 arquivos` (`ψ ✓ AST`) | `desktop/plugin.js` editado há 2 chamadas sem rodar `pytest` pós-edição (`unverified_edit`). |',
'','### 🎯 Próximo Passo Recomendado',
'- Clique em **⚡ Corrigir agora** para despachar `node --input-type=module --check < desktop/plugin.js && pytest -q`.'
].join('\n'):['### ✦ Executive Deep Session Audit — Interactive Showcase','',
'> **Overall Status (`WATCH · Score 86/100`)**: Healthy trajectory with **94.2% L0 Prompt Cache Hit** (`$1.84 USD` saved) and **1 verified autonomous self-recovery (`Δτ`)**.',
'','| Audit Dimension | Measured Value | Root-Cause Diagnosis |','| :--- | :--- | :--- |',
'| **🧠 Context vs Compaction** | `84.2k / 200.0k (42.1%)` | Healthy headroom with zero compaction loss; largest payload is `execute_code` (`3.7k` tok). |',
'| **⚡ L0 Prefix Cache** | `94.2%` (`412.0k` read) | Prefix stays warm because `/btw` queries run on the read-only side-channel without touching the transcript. |',
'| **🔍 Workflow & Files** | `3 files` (`ψ ✓ AST`) | `desktop/plugin.js` edited 2 tool calls ago without a post-edit verification run (`unverified_edit`). |',
'','### 🎯 Recommended Next Step',
'- Click **⚡ Fix now** to dispatch `node --input-type=module --check < desktop/plugin.js && pytest -q`.'
].join('\n')}
}else if(_rest){try{res=await _rest('/presets/resolve',{method:'POST',body:{
prompt: `__BTW_DEEP_OVERVIEW__:${mode}:${lang}:${personality}`,session_id:sid},timeoutMs:65000})
}catch{res=null}}
setLoadingDeepOverview(false)
if(res?.ok&&res.overview_markdown){
const cap=Math.max(1,Number($maxDeepOverviewReports.get()||5))
const curList=Array.isArray($deepOverviewBySession.get()[scope.key])?$deepOverviewBySession.get()[scope.key]:deepReports
const nextNum=(curList.reduce((acc,r)=>Math.max(acc,Number(r.reportNum||0)),0)||0)+ 1
const firstLine=String(res.overview_markdown||'')
.split('\n')
.map(l=>l.replace(/^[#>*\s`✦-]+/,'').trim())
.find(l=>l.length>8&&!l.startsWith('|'))||(isPt?'Diagnóstico Profundo':'Deep Audit')
const newRep={id: `rep_${Date.now().toString(36)}_${nextNum}`,reportNum:nextNum,
title: `Report #${nextNum} · ${firstLine.slice(0,44)}`,markdown:res.overview_markdown,engine:res.engine||mode,
model:res.model||'',duration_ms:res.duration_ms||0,created_at:Date.now()}
const updatedList=[newRep,...curList].slice(0,cap)
$deepOverviewBySession.set({...$deepOverviewBySession.get(),[scope.key]:updatedList})
haptic?.('success')}}
const rawData=radarQuery.data
const fallbackLiveSnap=useMemo(()=>{
if(rawData?.found||demoMode)return null
const fu=focusedUsage||host.state?.focusedUsage?.get?.()||null
const hasId=Boolean(scope?.storedId||scope?.runtimeId)
if(!hasId&&!fu)return null
return{
ok:true,
found:true,
session_id:scope?.storedId||scope?.runtimeId||'active',
canonical_id:scope?.key||'active',
profile:scope?.profile||'default',
model:liveComposerModel||scope?.model||'default',
counts:{
messages_total:Math.max(1,Number(fu?.calls||0)* 2),
messages_active:Math.max(1,Number(fu?.calls||0)* 2),
tool_calls:Number(pulse?.turn_tools||0),
api_calls:Number(fu?.calls||0),
errors_recent:Number(pulse?.turn_errors||0)
},
tokens:{
input:Number(fu?.input||0),
output:Number(fu?.output||0),
cache_read:Number(fu?.cache_read||0),
cache_hit_pct:Number(fu?.cache_hit_pct||0),
cost_usd:Number(fu?.cost_usd||0)
},
context_window:{
used_tokens:Number(fu?.context_used||0),
max_tokens:Number(fu?.context_max||0),
occupancy_pct:Number(fu?.context_percent||0)
},
health:{state:'calm',score:100,high:0,medium:0,low:0},
live:pulse||{busy:Boolean(scope?.busy)},
touched_files:[],
top_tools:[],
subagents:[]
}
},[rawData?.found,demoMode,focusedUsage,scope?.storedId,scope?.runtimeId,scope?.key,scope?.profile,scope?.model,scope?.busy,liveComposerModel,pulse])
const baseData=demoMode?DEMO_SNAPSHOT:(rawData?.found?rawData:(fallbackLiveSnap||rawData))
const d=useMemo(()=>hydrateSnapshotWithHostContext(baseData,scope,focusedUsage,liveComposerModel),
[baseData,scope,focusedUsage,liveComposerModel])
if(hasTarget&&radarQuery.isFetching&&!radarQuery.data&&!demoMode){
return divs('flex items-center justify-center gap-2.5 py-8 text-xs btw-tt',[
typeof Loader==='function'?jsx(Loader,{type:'lemniscate-bloom',className:'size-6 btw-ac'})
:jsx(GlyphSpinner,{spinner:'braille'}),jsx(DecodeText,{text:strings.readingTelemetry,prefix:7,loop:false})])}
const unstarted=isSessionUnstarted(d,scope,demoMode)
if(!d||!d.found||unstarted){
return jsx(WaitingToStartSessionHero,{scope,variant:'radar',onOpenSettings})}
const toks=d.tokens||{}
const counts=d.counts||{}
const perf=d.performance||{}
const ctxWin=d.context_window||{}
const activeComposerModel=String(d.composer_model||liveComposerModel||focusedUsage?.model||scope.model||d.model||'default').trim()
const activeTool=pulse?.active_tool||d.live?.active_tool||''
const cachePct=Math.min(100,Math.max(0,Number(toks.cache_hit_pct||0)))
const effectiveCost=Number(toks.effective_cost_usd??toks.cost_usd??0)
const cacheSaved=Number(toks.cache_savings_usd||0)
const ctxOccPct=Math.min(100,Math.max(0,Number(ctxWin.occupancy_pct||0)))
const safeTodos=Array.isArray(d.todos)?d.todos.filter(Boolean):[]
const doneTodos=safeTodos.filter(t=>t?.status==='completed').length
const totalTodos=safeTodos.length
const activeErrors=Array.isArray(d.recent_errors)?d.recent_errors.filter(e=>e&&!e.resolved):[]
const visibleErrors=isBasicMode?activeErrors:Array.isArray(d.recent_errors)?d.recent_errors.filter(Boolean):[]
const subs=Array.isArray(d.subagents)?d.subagents.filter(Boolean):[]
const runningSubsCnt=subs.filter(s=>!s.ended_at||s.status==='running').length
const doneSubsCnt=subs.length - runningSubsCnt
const subToolsTotal=subs.reduce((acc,s)=>acc + Number(s.tool_calls??s.tool_call_count??0),0)
const ctxColor=ctxOccPct>=82?'#f43f5e':ctxOccPct>=62?'#f59e0b':'#38bdf8'
const cacheColor=cachePct>=85?'#10b981':cachePct>=50?'#38bdf8':'#f59e0b'
const rsiMatches=Array.isArray(d.rsi?.matches)?d.rsi.matches.filter(Boolean):[]
const allAnomalies=Array.isArray(d.anomalies)?d.anomalies.filter(Boolean):[]
const dedupedAnomalies=allAnomalies.filter(anom=>{if(!rsiMatches.length||isBasicMode)return true
const aTitle=String(anom.title||'').toLowerCase()
return!rsiMatches.some(m=>{
const mCue=String(m.cue||'').toLowerCase()
return mCue&&(aTitle.includes(mCue)||mCue.includes(aTitle)||(anom.kind==='edit_churn'&&mCue.includes('churn')))})})
const copyMarkdownReport=async()=>{
const md=buildClientRadarMarkdown(d)
await writeClipboardText(md)
haptic?.('success')
host.notify?.({kind:'info',message:strings.reportCopiedNotify})}
const largestToolName=ctxWin.largest_tool_payload?.tool||''
const largestToolTok=Number(ctxWin.largest_tool_payload?.est_tokens||0)
const topToolObj=Array.isArray(d.top_tools)&&d.top_tools[0]?d.top_tools[0]:null
const touchedCount=Array.isArray(d.touched_files)?d.touched_files.length:0
const tacticalChips=[
touchedCount>0&&{id:'verify_files',icon:'shield',label:isPt?`🛡️ Arquivos (${touchedCount})`:`🛡️ Files (${touchedCount})`,target:isPt?pl(touchedCount,'arquivo tocado','arquivos tocados'):pl(touchedCount,'touched file'),prompt:isPt?`Audite ${touchedCount===1?'o arquivo tocado':`os ${touchedCount} arquivos tocados`} nesta sessão ({{touched_files}}) quanto a sintaxe, regressões e cobertura de testes.`:`Audit the ${pl(touchedCount,'file')} touched in this session ({{touched_files}}) for syntax, regressions, and test coverage.`,steer:isPt?'Antes de encerrar, verifique a sintaxe e execute os testes para os arquivos modificados ({{touched_files}}).':'Before finishing, verify syntax and run tests for all modified files ({{touched_files}}).'},
subs.length>0&&{id:'fleet_sync',icon:'hubot',label:isPt?`🤖 Frota (${subs.length} · ${pl(subToolsTotal,'tool')})`:`🤖 Fleet (${subs.length} · ${pl(subToolsTotal,'tool')})`,target:`Subagents (${subs.length})`,prompt:isPt?`Sintetize o progresso de ${pl(subs.length,'subagente','subagentes')} (${runningSubsCnt} ativos, ${doneSubsCnt} concluídos, ${pl(subToolsTotal,'tool')}).`:`Synthesize the findings and progress of the ${pl(subs.length,'subagent')} (${runningSubsCnt} active, ${doneSubsCnt} done, ${pl(subToolsTotal,'tool')}).`,steer:isPt?'Consolide os achados verificados dos subagentes sem duplicar trabalho.':'Consolidate verified findings from the subagents without duplicating work.'},
topToolObj&&{id:'tool_opt',icon:'tools',label:`🔧 ${topToolObj.name} ×${topToolObj.count}`,target:`Tool · ${topToolObj.name} ×${topToolObj.count}`,prompt:isPt?`Avalie o padrão de uso de \`${topToolObj.name}\` (${pl(topToolObj.count,'chamada')}) nesta sessão: há oportunidades de paralelismo?`:`Evaluate the usage pattern of \`${topToolObj.name}\` (${pl(topToolObj.count,'call')}) in this session: can calls be batched?`,steer:isPt?`Agrupe chamadas independentes de \`${topToolObj.name}\` em paralelo.`:`Batch independent \`${topToolObj.name}\` calls in parallel.`}
].filter(Boolean)
const renderDeepReportsStack=()=>divs(CLS.col15,[loadingDeepOverview&&divs('flex flex-col gap-1.5 rounded-xl border btw-bd-ac40 btw-bg-ac6 p-2.5',[
div('btw-specialist-scan-bar'),
div('btw-tx-11 btw-ts',strings.deepOverviewLoading)]),
deepReports.length>0&&divs(CLS.col15,[divs('flex items-center justify-between gap-2 px-0.5',[spans('inline-flex items-center gap-1.5 btw-tx-10 font-bold uppercase tracking-wider btw-ac',[
codicon('sparkle','0.74rem'),
`${strings.deepOverviewBtn.replace(/^✦\s*/,'')} (${deepReports.length}/${maxReports})`]),divs(CLS.row15,[divs({cls:'inline-flex items-center gap-1 btw-tx-95 font-mono btw-tt',title:isPt?'Limite máximo de relatórios acumulados':'Maximum accumulated reports limit'},[
span(null,'Max:'),...[3,5,10].map(n=>hBtn('btw-action-mode-pill px-1.5 py-0 btw-tx-9',{'data-active':maxReports===n?'true':'false',onClick:()=>{
setPref($maxDeepOverviewReports,n,'maxDeepOverviewReports')
const cur=Array.isArray(deepOverviewsMap[scope.key])?deepOverviewsMap[scope.key]:deepReports
if(cur.length>n){$deepOverviewBySession.set({...$deepOverviewBySession.get(),[scope.key]:cur.slice(0,n)})}
haptic?.('tap')}},String(n),n))]),deepReports.length>1&&hBtn('btw-action-mode-pill btw-tx-95',{onClick:clearAllDeepReports},isPt?'Limpar todos':'Clear all')])]),
...deepReports.map(rep=>{
const isOpen=Boolean(expandedRepMap?.[rep.id])
const timeStr=rep.created_at?new Date(rep.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''
return divs({cls:'btw-sub-accordion','data-open':isOpen?'true':'false'},[divs({cls:'btw-sub-accordion-head',onClick:()=>toggleExpandReport(rep.id),role:'button',tabIndex:0,onKeyDown:e=>{
if(e.key==='Enter'||e.key===' '){e.preventDefault()
toggleExpandReport(rep.id)}}},[divs(CLS.rowMin0,[
jsx(DisclosureCaret,{open:isOpen,size:'0.72rem',className:'shrink-0 btw-ac'}),span('rounded-full btw-bg-ac15 px-2 py-0.5 font-mono btw-tx-95 font-bold btw-ac shrink-0',`✦ Report #${rep.reportNum||1}`),span('truncate btw-tx-115 font-semibold btw-tp',rep.title.replace(/^Report\s+#\d+\s*·\s*/i,''))]),divs({cls:'flex shrink-0 items-center gap-1.5 font-mono btw-tx-95 btw-tt',onClick:e=>e.stopPropagation()},[rep.model?span('hidden sm:inline',shortModelName(rep.model)):null,
rep.duration_ms?span(null,`${(Number(rep.duration_ms)/ 1000).toFixed(1)}s`):null,
timeStr?span(null,timeStr):null,jsx(CopyButton,{text:rep.markdown||'',appearance:'icon',
buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer}),hBtn('rounded p-1 btw-tt hover:text-destructive cursor-pointer',{title:isPt?'Excluir este relatório':'Delete this report',onClick:()=>deleteDeepReport(rep.id)},codicon('trash','0.72rem'))])]),isOpen&&div('btw-sub-accordion-body btw-basic-md-overview max-h-[380px] overflow-y-auto',jsx(MessageTextContent,{text:rep.markdown||'',media:false,previewOnly:true}))],rep.id)})])])
const renderInteractiveBentoTiles=()=>divs('btw-live-dash-grid',[divs({cls:'btw-dash-tile btw-stagger-item','data-clickable':'true',style:{'--btw-tile-glow':ctxColor},title:isPt?'Clique para diagnosticar ocupação da janela de contexto':'Click to inspect context window occupancy',onClick:()=>openRadarTactical({
target: `Context ${ctxOccPct}%`,prompt:isPt
? `Analise a saúde da janela de contexto (${ctxOccPct}%) vs compressão${largestToolName? ` e o impacto de ${largestToolName} (${fmtCompact(largestToolTok)} tok)` :''}.`
: `Analyze context window occupancy (${ctxOccPct}%) vs compaction${largestToolName? ` and the impact of ${largestToolName} (${fmtCompact(largestToolTok)} tok)` :''}.`,
steer:isPt? `Mantenha o consumo de contexto enxuto (${ctxOccPct}% ocupado) usando paginação/filtros nas ferramentas.`
: `Keep context usage lean (${ctxOccPct}% occupied) by using pagination and filters in tool calls.`})},[
jsx(SvgRingGauge,{pct:ctxOccPct,color:ctxColor,size:42,pulse:scope.busy}),divs(CLS.colMin0,[divs(CLS.rowBetween,[span(CLS.secHdr,isPt?'Contexto':'Context'),!isBasicMode&&largestToolName&&span({cls:'font-mono btw-tx-9 btw-tt truncate max-w-[110px]',title: `Max tool payload: ${largestToolName} (${fmtCompact(largestToolTok)} tok)`},largestToolName)]),
span(CLS.mono12,`${fmtCompact(ctxWin.used_tokens||toks.input||0)} / ${fmtCompact(ctxWin.max_tokens||200000)}`),
span(CLS.muted105,ctxOccPct>=75?(isPt?'Próximo da compressão':'Near compaction'):ctxOccPct>=50?(isPt?'Ocupação moderada':'Moderate load'):(isPt?'Janela enxuta':'Healthy headroom'))])]),divs({cls:'btw-dash-tile btw-stagger-item','data-clickable':'true',style:{'--btw-tile-glow':cacheColor,animationDelay:'35ms'},title:isPt?'Clique para auditar eficiência do Cache L0 e custo':'Click to audit L0 Cache efficiency & spend',onClick:()=>openRadarTactical({target: `L0 Cache ${cachePct}% · $${effectiveCost.toFixed(2)}`,prompt:isPt
? `Audite a eficiência do Cache L0 (${cachePct}%, $${cacheSaved.toFixed(2)} poupados em ${counts.api_calls||0} chamadas) e a relação custo/benefício da sessão.`
: `Audit L0 Cache efficiency (${cachePct}%, $${cacheSaved.toFixed(2)} saved across ${counts.api_calls||0} calls) and session ROI.`,
steer:isPt? `Agrupe chamadas de ferramentas em paralelo para maximizar o reaproveitamento do Cache de Prefixo L0 (${cachePct}%).`
: `Batch tool calls in parallel to maximize L0 Prefix Cache reuse (${cachePct}%).`})},[
jsx(SvgRingGauge,{pct:cachePct,color:cacheColor,size:42}),divs(CLS.colMin0,[divs(CLS.rowBetween,[span(CLS.secHdr,isPt?'Cache & Custo':'Cache & Spend'),span('font-mono btw-tx-105 font-medium btw-tp',`${toks.is_subscription_estimate?'≈':''}$${effectiveCost.toFixed(2)}`)]),span('font-mono btw-tx-12 font-semibold text-emerald-400',cacheSaved>=0.01? `$${cacheSaved.toFixed(2)} ${isPt?'poupados':'saved'}` : `${cachePct}% cache hit`),
span(CLS.muted105,`${cachePct}% ${isPt?'reaproveitamento L0':'prefix cache hit'}`)])]),(()=>{
const mainTools=Number(counts.tool_calls||0)
const totalTools=mainTools + subToolsTotal
const tpsVal=Number(perf.tps_core||0)
const velColor=activeErrors.length>0?'#f59e0b':totalTools>0?'#10b981':'#38bdf8'
const ringPct=totalTools>0?Math.max(18,Math.round(((totalTools - activeErrors.length)/ Math.max(1,totalTools))* 100))
:tpsVal>0?Math.min(100,Math.round((tpsVal / 120)* 100)):Math.min(100,Math.max(24,(counts.messages_active||1)* 18))
const centerMain=totalTools>0?String(mainTools):tpsVal>0?String(Math.round(tpsVal))
:String(counts.messages_active||counts.api_calls||1)
const centerUnit=totalTools>0?'tools':tpsVal>0?'tok/s':isPt?'turnos':'turns'
return divs({cls:'btw-dash-tile btw-stagger-item','data-clickable':'true',style:{'--btw-tile-glow':velColor,animationDelay:'70ms'},title:isPt?'Clique para analisar ritmo de ferramentas e chamadas':'Click to inspect tool velocity & calls',onClick:()=>openRadarTactical({target: `Velocity · ${mainTools} tools`,prompt:isPt
? `Analise a velocidade de execução (${tpsVal>0? `${tpsVal} tok/s, ` :''}${mainTools} chamadas de ferramentas em ${fmtDurationSec(d.elapsed_seconds)}) e identifique gargalos.`
: `Analyze execution velocity (${tpsVal>0? `${tpsVal} tok/s, ` :''}${mainTools} tool calls in ${fmtDurationSec(d.elapsed_seconds)}) and identify bottlenecks.`,
steer:isPt? `Priorize execução direta e verificação final sem etapas redundantes.`
: `Prioritize direct execution and final verification without redundant steps.`})},[scope.busy&&typeof Loader==='function'?divs('btw-velocity-orb-busy',[
div('btw-velocity-orbit-ring'),
jsx(Loader,{type:'fourier-flow',strokeScale:1.2,className:'size-6 btw-ac'})]):jsx(SvgRingGauge,{pct:ringPct,color:velColor,size:42,centerLabel:centerMain}),divs(CLS.colMin0,[divs(CLS.rowBetween,[span(CLS.secHdr,isPt?'Atividade':'Activity'),span(CLS.mono10Muted,pl(counts.api_calls||0,isPt?'turno':'turn',isPt?'turnos':'turns'))]),span(CLS.mono12,`${pl(mainTools,'tool')} · ${pl(counts.messages_active||0,'msg')}`),
span(CLS.muted105,tpsVal>0? `${tpsVal} tok/s · ${fmtDurationSec(d.elapsed_seconds)}` :fmtDurationSec(d.elapsed_seconds))])])
})(),divs({cls:'btw-dash-tile btw-stagger-item','data-clickable':'true',style:{'--btw-tile-glow':runningSubsCnt>0?'#38bdf8':'#10b981',animationDelay:'105ms'},onClick:()=>{
$activeTab.set('subagents')
haptic?.('tap')}},[subs.length>0&&typeof Blobatar==='function'?div('flex -space-x-2 shrink-0 items-center',subs.slice(0,3).map(s=>div('rounded-full ring-2 ring-(--ui-bg-elevated)',jsx(Blobatar,{name:String(s.id||'sub'),size:24,animate:'always'}),s.id))):typeof Blobatar==='function'
?div({cls:'flex btw-sz-42 shrink-0 items-center justify-center rounded-full border btw-bd-st60 btw-bg-tp3',style:{width:'42px',height:'42px'}},span('btw-blobatar-wrap',jsx(Blobatar,{name:String(scope.profile||'fleet'),size:24,animate:'always'}))):div({cls:'flex btw-sz-42 shrink-0 items-center justify-center rounded-full border btw-bd-st60 btw-bg-tp3',style:{width:'42px',height:'42px'}},codicon('hubot','1rem',CLS.accent)),divs(CLS.colMin0,[divs(CLS.rowBetween,[span(CLS.secHdr,isPt?'Subagentes':'Subagents'),span('font-mono btw-tx-10 btw-ac',isPt?'Frota →':'Fleet →')]),span(CLS.mono12,subs.length===0?isPt?'Nenhum ativo':'None spawned':runningSubsCnt>0
? `${runningSubsCnt} working · ${doneSubsCnt} done` : `${doneSubsCnt} ${strings.cmdDoneLabel}`),
span(CLS.muted105,subToolsTotal>0?pl(subToolsTotal,'subagent tool call'):(isPt?'Delegação paralela':'Parallel delegation'))])])])
const renderRadarTacticalDeck=()=>divs('btw-radar-tactical-deck',[divs('flex items-center justify-between gap-2 flex-nowrap min-w-0',[divs('flex min-w-0 flex-1 items-center gap-1.5 flex-nowrap overflow-x-auto btw-ask-controls-left',[span('mr-1 inline-flex items-center gap-1 font-mono btw-tx-95 font-bold uppercase tracking-wider btw-ac shrink-0',[codicon('zap','0.7rem'),isPt?'Ação Rápida:':'Quick Action:']),...tacticalChips.map(chip=>hBtn('btw-tactical-chip',{'data-active':tacticalOpen&&tacticalTarget===chip.target?'true':'false',onClick:()=>{
if(tacticalOpen&&tacticalTarget===chip.target){setTacticalOpen(false)
}else{openRadarTactical(chip)}}},chip.label,chip.id))]),hBtn('btw-tile-mini-btn shrink-0',{'aria-expanded':tacticalOpen?'true':'false',onClick:()=>{if(!tacticalOpen&&!tacticalDraft&&tacticalChips[0]){openRadarTactical(tacticalChips[0])
}else{setTacticalOpen(v=>!v)
haptic?.('tap')}}},tacticalOpen?(isPt?'▴ Ocultar':'▴ Hide'):'💬 /btw · ⚡ Steer ▾')]),tacticalOpen&&divs('flex flex-col gap-1.5 pt-1 border-t btw-bd-st50',[divs('flex items-center justify-between gap-2 btw-tx-10',[divs('flex items-center gap-1.5 min-w-0',[typeof PanelPill==='function'
?jsx(PanelPill,{tone:'good',children:tacticalTarget||'Radar Telemetry'})
:jsx(Seal,{kind:'observed',children:tacticalTarget||'Radar Telemetry'}),span('btw-tt truncate',isPt?'Dispare /btw sem sair do Radar ou envie Steer direto para a sessão'
:'Fire /btw right inside Radar or send a direct Steer to the session')]),hBtn('btw-tt btw-hv-tp btw-tx-10',{'aria-label':strings.tipClose,title:strings.tipClose,onClick:()=>setTacticalOpen(false)},'✕')]),divs(CLS.rowWrap15,[h('input',{type:'text',value:tacticalDraft,onChange:e=>{setTacticalDraft(e.target.value)
setTacticalSteerDraft(e.target.value)},onKeyDown:e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault()
if(tacticalDraft.trim()){void dispatchSideQuestion(tacticalDraft.trim(),scope)}}},placeholder:isPt
?'Pergunte via /btw ou escreva uma diretiva de Steer sobre esta métrica...'
:'Ask a /btw side-question or type a Steer directive about this metric...',cls:'min-w-[200px] flex-1 rounded-lg border btw-bd-st80 btw-bg-b70 px-2.5 py-1 btw-tx-11 btw-tp outline-none btw-fc-ac'}),uiBtn('secondary','xs',{disabled:!tacticalDraft.trim()||Boolean(pendingBtw),onClick:()=>{
if(tacticalDraft.trim()){void dispatchSideQuestion(tacticalDraft.trim(),scope)}},cls:'h-6 px-2.5 btw-tx-10 font-semibold'},pendingBtw?spans(CLS.inline1,[typeof Loader==='function'
?jsx(Loader,{type:'lemniscate-bloom',className:'size-3 btw-ac'}):'⏳',isPt?'Consultando...':'Asking...'])
:isPt?'💬 Perguntar /btw Aqui':'💬 Ask /btw Here'),uiBtn('outline','xs',{disabled:!(tacticalSteerDraft||tacticalDraft).trim(),onClick:()=>{
const cmd=(tacticalSteerDraft||tacticalDraft).trim()
if(cmd){void steerActiveSession(cmd,scope,null,{source:'radar_tactical'})}},cls:'btw-alert-btn h-6 px-2.5 btw-tx-10'},'⚡ Steer'),uiBtn('ghost','xs',{disabled:!tacticalDraft.trim(),onClick:()=>{
stageCommandInBtwChat(tacticalDraft.trim(),{label: `📡 ${tacticalTarget||'Radar'} → /btw`,source:'radar',icon:'pulse'})},cls:'h-6 px-2 btw-tx-10 btw-ac'},isPt?'↳ Abrir no Chat':'↳ Open in Chat')]),
(pendingBtw||latestBtwEntry)&&divs('mt-0.5 flex flex-col gap-1 rounded-lg border btw-bd-st60 btw-bg-tp2 px-2.5 py-1.5 btw-tx-11',[pendingBtw?divs('flex items-center gap-2 btw-ts',[
typeof Loader==='function'?jsx(Loader,{type:'lemniscate-bloom',className:'size-3.5 btw-ac'})
:jsx(GlyphSpinner,{spinner:'braille'}),typeof DecodeText==='function'
?jsx(DecodeText,{text:pendingBtw.question||strings.petThinking,loop:false})
:span('truncate',pendingBtw.question)]):latestBtwEntry?divs(CLS.rowBetween,[divs('min-w-0 flex-1 flex items-center gap-1.5 truncate',[
span('font-mono btw-tx-95 btw-ac shrink-0','✦ /btw:'),span(CLS.titleTrunc,deriveBtwCardTitle(latestBtwEntry)),span('btw-tt truncate',`— ${stripInlineMarkdownPreview(latestBtwEntry.answer||'',90)}`)]),
hBtn('btw-tile-mini-btn shrink-0',{onClick:()=>{$activeTab.set('ask')
haptic?.('tap')}},isPt?'Ver Card →':'View Card →')]):null])])])
const renderUnifiedCommandBar=()=>divs('btw-overview-command-bar',[divs('flex min-w-0 flex-wrap items-center gap-1.5',[hsBtn('btw-overview-status-pill',{title:strings.waitingCurveTip,onClick:()=>{
setOverviewCurveIdx(i=>(i + 1)% overviewCurves.length)
haptic?.('tap')}},[typeof Loader==='function'?jsx(Loader,{type:scope.busy?'lemniscate-bloom':activeOverviewCurve,
strokeScale:1.15,className:cn('size-3.5 shrink-0',scope.busy?CLS.accent:'text-emerald-400')})
:typeof SessionStatusDot==='function'?jsx(SessionStatusDot,{storedSessionId:scope.parentStoredId||scope.storedId||null}):span({cls:cn('inline-block size-2 shrink-0 rounded-full',scope.busy?'btw-bg-ac animate-pulse':'bg-emerald-400')}),
span('font-semibold btw-tp truncate max-w-[180px]',activeTool
?strings.runningTool(activeTool):scope.busy?typeof DecodeText==='function'
?jsx(DecodeText,{text:d.last_activity_description||strings.generatingResponse,loop:false})
:d.last_activity_description||strings.generatingResponse:strings.statusReady),span('font-mono btw-tx-10 btw-tt shrink-0',activeTool?`· ${pl(Math.max(1,Number(pulse?.turn_tools||d.live?.turn_tools||1)),'tool')}`:`· ${fmtDurationSec(d.elapsed_seconds)}`)]),
hsBtn('btw-overview-model-pill',{title:isPt
? `Modelo ativo no Hermes Composer (${activeComposerModel}) · Janela ${fmtCompact(ctxWin.max_tokens||200000)}`
: `Active model in Hermes Composer (${activeComposerModel}) · ${fmtCompact(ctxWin.max_tokens||200000)} window`,onClick:()=>{
onOpenSettings?.()
haptic?.('tap')}},[typeof Blobatar==='function'
?jsx(Blobatar,{name:String(scope.profile||d.profile||'default'),size:14,animate:'always'})
:codicon('comment-discussion','0.68rem','text-emerald-400'),span('truncate max-w-[130px]',shortModelName(activeComposerModel)),span(CLS.muted,`· ${fmtCompact(ctxWin.max_tokens||200000)}`)]),!isBasicMode&&hsBtn('btw-overview-playbook-pill',{title:isPt?'Clique para abrir a aba Learn (Integração BTW.md)':'Click to open Learn tab (Playbook Integration)',onClick:()=>{
$activeTab.set('learn')
haptic?.('tap')}},[codicon(growthMode==='full'?'sparkle':growthMode==='isolated'?'shield':'zap','0.68rem',growthMode==='full'?'text-sky-400':growthMode==='isolated'?'text-amber-400':'text-emerald-400'),span(null,growthMode==='full'?'Full':growthMode==='isolated'?'Isolated':'Lite')])]),divs(CLS.rowShrink1,[hsBtn('btw-overview-deep-btn',{disabled:loadingDeepOverview,title:strings.deepOverviewTip,onClick:()=>void runDeepOverview()},[loadingDeepOverview?typeof Loader==='function'
?jsx(Loader,{type:'fourier-flow',strokeScale:1.15,className:'size-3.5 btw-ac'})
:jsx(GlyphSpinner,{spinner:'braille'}):codicon('sparkle','0.72rem','text-sky-400'),
span(null,loadingDeepOverview?strings.smartRecLoadingLabel:strings.deepOverviewBtn.replace(/^✦\s*/,''))]),
!isBasicMode&&
tip(strings.compareBtnLabel,uiBtn('ghost','icon-xs',{'aria-label':strings.compareBtnLabel,onClick:()=>$activeTab.set('compare')},codicon('diff'))),
!isBasicMode&&
tip(strings.copyReportTip,uiBtn('ghost','icon-xs',{'aria-label':strings.copyReportTip,onClick:copyMarkdownReport},codicon('markdown'))),
tip(strings.refreshRadarTip,uiBtn('ghost','icon-xs',{'aria-label':strings.refreshRadarTip,onClick:()=>radarQuery.refetch()},codicon('refresh')))])])
if(isBasicMode){
const topAnom=allAnomalies[0]||null
const topErr=activeErrors[0]||null
const steerCmd=topAnom?.suggested_steer||''
const diagPrompt=topAnom? `Diagnose and help resolve: ${topAnom.title}.` :topErr
? `How can we fix the recent error on \`${topErr.tool}\`: ${humanizeErrorDetail(topErr.detail,lang)}?` :''
const basicMd=buildBasicOverviewMarkdown(d,scope,strings,lang,activeTool,activeErrors,safeTodos)
return divs({cls:'flex flex-col gap-3 text-xs','data-md-len':basicMd.length},[renderUnifiedCommandBar(),
renderInteractiveBentoTiles(),tacticalOpen&&renderRadarTacticalDeck(),(topAnom||topErr)&&divs('btw-sleek-alert-strip',[divs(CLS.rowMin0,[
codicon('warning','0.82rem','shrink-0 text-amber-400'),span('font-medium btw-tx-115 btw-tp truncate',topAnom?topAnom.title: `${isPt?'Alerta em':'Alert in'} ${topErr.tool}: ${humanizeErrorDetail(topErr.detail,lang)}`)
]),divs(CLS.rowShrink15,[steerCmd&&uiBtn('outline','xs',{cls:'btw-alert-btn h-6 px-2.5 btw-tx-10',onClick:()=>
void steerActiveSession(steerCmd,scope,null,{source:'anomaly',targetKind:topAnom?.kind||''})},strings.basicFixNowBtn),diagPrompt&&uiBtn('outline','xs',{cls:'h-6 px-2.5 btw-tx-10 btw-ac btw-bd-ac40',onClick:()=>openRadarTactical({
target:topAnom?topAnom.title:topErr?.tool||'Alert',prompt:diagPrompt,steer:steerCmd||diagPrompt})},strings.basicDiagnoseBtn)])]),renderDeepReportsStack(),
jsx(ContemporaryFilesGrid,{d,scope,lang,strings,onSelectFileTactical:openRadarTactical})])}
const toolColors=['#38bdf8','#10b981','#a855f7','#f59e0b','#f43f5e','#eab308','#14b8a6','#818cf8']
const topToolsList=Array.isArray(d.top_tools)?d.top_tools.filter(Boolean):[]
const totalDistCalls=Math.max(1,topToolsList.reduce((acc,t)=>acc + Number(t.count||0),0))
return divs('flex flex-col gap-3 text-xs',[
renderUnifiedCommandBar(),renderInteractiveBentoTiles(),renderRadarTacticalDeck(),
renderDeepReportsStack(),
dedupedAnomalies.length>0&&
divs(CLS.col15,[divs('btw-warn-text px-0.5 flex items-center justify-between btw-tx-10 font-semibold uppercase tracking-wider',[
spans(CLS.inline15,[codicon('warning'),
strings.anomalyGuardTitle]),span('font-mono btw-tx-95 opacity-80',`${dedupedAnomalies.length} ${dedupedAnomalies.length===1?'signal':'signals'}`)]),div(CLS.col15,dedupedAnomalies.map((anom,idx)=>{
const relDetail=anom.detail&&(anom.detail.includes('/')||anom.detail.includes('\\'))
?(()=>{const rp=formatRelativeWorkspacePath(anom.detail,d.cwd);return `${rp.relDir||''}${rp.leaf}` })()
:anom.detail
return divs('btw-warn-item flex items-start justify-between gap-2.5 rounded-lg p-2.5 btw-tx-11',[divs('min-w-0 flex-1',[div('btw-warn-text font-semibold leading-snug',renderInlineCode(anom.title)),relDetail
?div({cls:'mt-0.5 truncate font-mono btw-tx-10 btw-ts opacity-85',title:anom.detail},relDetail):null,
jsx(AnomalyMeta,{anom})]),divs(CLS.rowShrink1,[hBtn('btw-tile-mini-btn h-[22px] px-2 btw-tx-95',{onClick:()=>openRadarTactical({target:anom.title,
prompt: `Diagnose [${anom.kind||'anomaly'}]: ${anom.title}. ${anom.detail||''}`.trim(),steer:anom.suggested_steer||''})},'/btw'),(anom.suggested_action==='launch_subagent'||anom.lever==='C5'||anom.suggested_subagent_goal)&&uiBtn('outline','xs',{onClick:async()=>{await launchSubagentViaRest({
goal:anom.suggested_subagent_goal||anom.suggested_steer||anom.title,context:anom.detail||'',
sessionId:scope.storedId||scope.runtimeId||''})
$activeTab.set('subagents')},cls:'shrink-0 h-[22px] px-2 btw-tx-10 btw-ac btw-bd-ac40'},spans(CLS.inline1,[codicon('hubot','0.68rem'),strings.anomalySpawnFixBtn.replace(/^[^\wA-Za-zÀ-ÿ]+\s*/,'')])),anom.suggested_steer&&
uiBtn('outline','xs',{onClick:()=>void steerActiveSession(anom.suggested_steer,scope,null,{source:'anomaly',targetKind:anom.kind}),cls:'btw-alert-btn shrink-0 h-[22px] px-2 btw-tx-10'},spans(CLS.inline1,[
codicon('zap','0.68rem'),strings.steerBtnLabel]))])],idx)}))]),(Number(counts.tool_calls||0)>0||(Array.isArray(d.touched_files)&&d.touched_files.length>0)||demoMode)&&
jsx(LessonMatches,{matches:d.rsi?.matches,scope,onSelectTactical:openRadarTactical}),Array.isArray(d.sparkline)&&d.sparkline.length>=2&&jsx(TurnSparkline,{points:d.sparkline,
title:strings.sparklineTitle,scope,onSelectTurnTactical:openRadarTactical}),topToolsList.length>0&&divs('rounded-xl border btw-bd-st80 btw-bg-tp18m p-2.5 flex flex-col gap-2',[
divs('flex items-center justify-between gap-2 btw-tx-10 font-semibold uppercase tracking-wider btw-tt',[spans(CLS.inline15,[
codicon('tools','0.75rem',CLS.accent),strings.toolDistTitle]),span('font-mono btw-tx-95 btw-ts normal-case',`${pl(totalDistCalls,'tool call')} · Top: ${topToolsList[0].name} (${Math.round((Number(topToolsList[0].count||0)/ totalDistCalls)* 100)}%)`)]),div('btw-tool-spectrum-bar',topToolsList.map((toolItem,idx)=>{
const share=Math.max(4,Math.round((Number(toolItem.count||0)/ totalDistCalls)* 100))
const col=toolColors[idx % toolColors.length]
return div({cls:'btw-tool-spectrum-seg',style:{width: `${share}%`,background:col,
opacity:selectedToolName&&selectedToolName!==toolItem.name?0.35:0.92},title: `${toolItem.name}: ×${toolItem.count} (${share}%)`},undefined,toolItem.name)})),div('flex flex-wrap gap-1.5',topToolsList.map((toolItem,idx)=>{
const share=Math.round((Number(toolItem.count||0)/ totalDistCalls)* 100)
const col=toolColors[idx % toolColors.length]
const isLargestPayload=largestToolName&&largestToolName===toolItem.name&&largestToolTok>0
const isSelected=selectedToolName===toolItem.name
return hsBtn('btw-tool-dist-pill',{'data-selected':isSelected?'true':'false',title:isPt
? `Clique para auditar ou enviar Steer sobre ${toolItem.name} (×${toolItem.count}, ${share}%)`
: `Click to audit or Steer ${toolItem.name} (×${toolItem.count}, ${share}%)`,onClick:()=>{
setSelectedToolName(prev=>(prev===toolItem.name?'':toolItem.name))
openRadarTactical({target: `🔧 ${toolItem.name} ×${toolItem.count} (${share}%)`,prompt:isPt
? `Audite as ${toolItem.count} chamadas da ferramenta \`${toolItem.name}\` (${share}% do total${isLargestPayload? `, maior payload de contexto com ${fmtCompact(largestToolTok)} tok` :''}): há chamadas redundantes ou que possam ser agrupadas?`
: `Audit the ${toolItem.count} calls to \`${toolItem.name}\` (${share}% of total${isLargestPayload? `, largest context payload at ${fmtCompact(largestToolTok)} tok` :''}): are there redundant calls or batching opportunities?`,
steer:isPt
? `Otimize o uso de \`${toolItem.name}\` (já chamada ${toolItem.count}×): agrupe operações independentes e filtre saídas volumosas.`
: `Optimize \`${toolItem.name}\` usage (called ${toolItem.count}× so far): batch independent operations and filter large outputs.`})}},[span({cls:'inline-block size-2 rounded-full shrink-0',style:{background:col}}),
span('font-semibold',toolItem.name),
span('btw-ac font-bold',`×${toolItem.count}`),
span('btw-tx-9 btw-tt',`${share}%`),isLargestPayload&&span('rounded bg-amber-500/15 px-1 py-0 btw-tx-85 font-bold text-amber-400',`🔥 ${fmtCompact(largestToolTok)}`)],toolItem.name)}))]),totalTodos>0&&divs('rounded-lg border btw-bd p-2.5',[
divs('mb-1.5 flex items-center justify-between btw-tx-10 font-semibold uppercase tracking-wider btw-tq',[span(null,strings.activePlanTitle),
span('font-mono btw-ac',`${doneTodos}/${totalTodos}`)]),div('btw-progress-track mb-2',div({cls:'btw-progress-fill',style:{width: `${Math.round((doneTodos / totalTodos)* 100)}%` }})),div('flex flex-col gap-1',safeTodos.map((todo,i)=>divs('flex items-center gap-1.5 btw-tx-115',[codicon(todo.status==='completed'?'pass-filled':todo.status==='in_progress'?'play-circle':'circle-large-outline','0.75rem',todo.status==='completed'?CLS.accent:todo.status==='in_progress'?'btw-tp'
:'btw-tq'),span({cls:cn('truncate',todo.status==='completed'
?'line-through btw-tq':'btw-ts')},todo.content)],i)))]),
visibleErrors.length>0&&(()=>{
const allResolved=activeErrors.length===0
const showRows=!allResolved||resolvedErrorsOpen
const uniqueErrTools=Array.from(new Set(visibleErrors.map(e=>e?.tool).filter(Boolean)))
return divs(CLS.col15,[allResolved?divs({cls:'btw-self-heal-pill',role:'button','aria-expanded':resolvedErrorsOpen?'true':'false',tabIndex:0,onClick:()=>{setResolvedErrorsOpen(v=>!v)
haptic?.('tap')},onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault()
setResolvedErrorsOpen(v=>!v)}}},[divs('flex min-w-0 items-center gap-2 btw-tx-11',[
jsx(Seal,{kind:'self_recovered',children:strings.errResolvedBadge}),span('font-medium btw-ts truncate',isPt
? `Agente auto-recuperou ${visibleErrors.length} incidente(s) (${uniqueErrTools.join(', ')}) — nenhum steer necessário`
: `Agent self-healed ${pl(visibleErrors.length,'tool incident')} (${uniqueErrTools.join(', ')}) — no steer needed`)]),spans('inline-flex shrink-0 items-center gap-1 font-mono btw-tx-95 btw-tt',[
isPt?'Histórico':'Log',jsx(DisclosureCaret,{open:resolvedErrorsOpen,size:'0.68rem'})])]):divs('flex items-center justify-between btw-tx-10 font-semibold uppercase tracking-wider text-amber-400 px-0.5',[
span(null,strings.recentErrorsTitle),
span('font-mono',`${activeErrors.length} active`)]),showRows&&div('flex flex-col gap-1.5 rounded-lg border btw-bd-st70 p-2',visibleErrors.slice(0,4).map((err,idx)=>{
const cleanMsg=humanizeErrorDetail(err.detail,lang)
return divs({cls:cn('flex items-center justify-between gap-2 btw-tx-11',
err.resolved?CLS.muted:'btw-tp')},[divs('min-w-0 flex-1 flex items-center gap-1.5',[jsx(Seal,{kind:err.resolved?'self_recovered':'hurt',
children:err.resolved?strings.errResolvedBadge:strings.errActiveBadge}),
h('code','font-mono font-semibold btw-ac shrink-0',err.tool),span({cls:'truncate font-mono btw-tx-105',title:err.detail},cleanMsg)]),divs(CLS.rowShrink1,[hBtn('btw-tile-mini-btn',{onClick:()=>
openRadarTactical({target: `Incident · ${err.tool}`,prompt:isPt
? `Analise a causa raiz do alerta em \`${err.tool}\` (\`${cleanMsg}\`) e confirme se a recuperação foi completa.`
: `Analyze the root cause of the \`${err.tool}\` incident (\`${cleanMsg}\`) and confirm whether recovery is complete.`,steer:isPt
? `Evite repetir o erro em \`${err.tool}\` (\`${cleanMsg}\`) validando o schema/colunas antes da execução.`
: `Avoid repeating the error in \`${err.tool}\` (\`${cleanMsg}\`) by validating schema/arguments beforehand.`})},'💬 /btw'),
!err.resolved&&hBtn('btw-tile-mini-btn',{'data-tone':'steer',onClick:()=>
void steerActiveSession(isPt? `Corrija o erro ativo em \`${err.tool}\` (${cleanMsg}) antes de avançar.`
: `Fix the active error in \`${err.tool}\` (${cleanMsg}) before proceeding.`,scope,null,{source:'error_row'})},'⚡ Steer')
])],idx)}))])
})(),Array.isArray(d.recent_commands)&&d.recent_commands.length>0&&divs('rounded-xl border btw-bd-st70 btw-bg-tp18m p-3',[divs('mb-2 flex items-center justify-between gap-2',[span('btw-tx-10 font-semibold uppercase tracking-wider btw-tt',strings.recentCmdsTitle),d.cwd
?span({cls:'font-mono btw-tx-95 btw-ts opacity-80 truncate max-w-48',title:d.cwd},splitPathLeaf(d.cwd).leaf):null]),div(CLS.col15,d.recent_commands.filter(Boolean).slice(0,5).map((cmd,idx)=>{
const rawClean=formatCleanTerminalCommand(cmd.command,d.cwd)
const cleanCmd=rawClean.length>68? `${rawClean.slice(0,32)}…${rawClean.slice(-33)}` :rawClean
const isRunning=cmd.exit_code==null
const isOk=cmd.exit_code===0
const isHealed=!isRunning&&!isOk&&Boolean(cmd.recovered)
return divs('group flex items-center justify-between gap-2 rounded-md border btw-bd-st40 btw-bg-tp15m px-2.5 py-1.5 btw-tx-11 btw-hv-bdst',[divs('flex min-w-0 flex-1 items-center gap-2.5',[div('w-[66px] shrink-0 flex items-center',jsx(Seal,{
kind:isRunning?'observed':isOk?'helped':isHealed?'self_recovered':'hurt',
title:isHealed?strings.errResolvedBadge:cmd.command,children:isRunning? `◐ ${strings.cmdRunningLabel}` :isOk?'✓ 0':isHealed
? `↺ ${cmd.exit_code}` : `✕ ${cmd.exit_code}`})),h('code',{cls:cn('min-w-0 flex-1 truncate font-mono btw-tx-105',
isHealed?CLS.muted:'btw-tp'),title:cmd.command},cleanCmd)]),divs('flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity',[hBtn('btw-tile-mini-btn',{onClick:()=>openRadarTactical({target: `cmd · exit ${cmd.exit_code??'running'}`,
prompt: `Explain command \`${rawClean}\` (exit ${cmd.exit_code??'running'}) and its result.`,
steer: `Verify the output of \`${rawClean}\` and handle any warnings.`})},'/btw'),jsx(CopyButton,{
text:cmd.command||rawClean,appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer})])
],cmd.call_id||idx)}))]),jsx(ContemporaryFilesGrid,{d,scope,lang,strings,onSelectFileTactical:openRadarTactical,hideWorkspaceBadge:Boolean(d.recent_commands?.length)})])}
function HermesBotAvatar({sub,size=50}){
const status=sub?.status||'done'
const seed=String(sub?.id||sub?.short_title||sub?.title||'subagent')
return divs({cls:'btw-bot-avatar-stage shrink-0','data-status':status,style:{width: `${size + 14}px`,height: `${size + 14}px` }},[div('btw-bot-avatar-ring'),
typeof Blobatar==='function'?jsx(Blobatar,{name:seed,size,animate:'always',className:'block overflow-visible'})
:codicon('hubot','1.4rem',CLS.accent)])}
function SubagentsView({scope,snapSubagents=[],onClose,isUnstarted=false,onOpenSettings}){
const lang=useValue($lang)
const demoMode=useValue($demoShowcase)
const settingsMode=useValue($settingsMode)
const isBasicMode=settingsMode==='basic'
const strings=I18N[lang]||I18N.en
const entriesMap=useValue($entriesBySession)
const pendingMap=useValue($pendingBySession)
const subDictationStatus=useValue($dictationStatus)
const subDictationTarget=useValue($dictationTarget)
const subDictationPartial=useValue($dictationPartial)
const subDictationElapsed=useValue($dictationElapsed)
const selectedSubId=useValue($selectedSubagentId)
const setSelectedSubId=val=>$selectedSubagentId.set(typeof val==='function'?val($selectedSubagentId.get()):String(val||''))
const[openSections,setOpenSections]=useState({output:false,cot:false,prompt:false,tail:false})
const[subChatMode,setSubChatMode]=useState('ask_btw')
const[subChatDraft,setSubChatDraft]=useState('')
const[subChatSending,setSubChatSending]=useState(false)
const launcherOpen=useValue($subagentLauncherOpen)
const setLauncherOpen=val=>$subagentLauncherOpen.set(typeof val==='function'?val($subagentLauncherOpen.get()):Boolean(val))
const[launchGoal,setLaunchGoal]=useState('')
const[launchContext,setLaunchContext]=useState('')
const[showLaunchCtx,setShowLaunchCtx]=useState(false)
const[launchProvider,setLaunchProvider]=useState('')
const[launchModel,setLaunchModel]=useState('')
const[launching,setLaunching]=useState(false)
const ctxInputRef=useRef(null)
const parentStoredId=scope.parentStoredId||scope.storedId||''
const parentRuntimeId=scope.parentRuntimeId||scope.runtimeId||''
const toggleSubSection=secKey=>{setOpenSections(prev=>({...prev,[secKey]:!prev[secKey]}))
haptic?.('tap')}
const dbTreeQ=useQuery({queryKey:[ID,'subagents-db',scope.profile,parentStoredId||parentRuntimeId],
enabled:Boolean(_rest&&(parentStoredId||parentRuntimeId)),
queryFn:()=>_rest(`/subagents?session_id=${encodeURIComponent(parentStoredId||parentRuntimeId)}`,{timeoutMs:8000}),
staleTime:3500,refetchInterval:scope.busy?4500:12000,retry:1})
const liveRpcQ=useQuery({queryKey:[ID,'subagents-rpc',parentRuntimeId],enabled:Boolean(parentRuntimeId&&host?.request),
queryFn:async()=>{try{
return await host.request('subagent.list',{session_id:parentRuntimeId})
}catch{
return{subagents:[],delegations:[]}}},staleTime:3000,refetchInterval:scope.busy?4000:12000,retry:0})
const dbTreeList=useMemo(()=>(Array.isArray(dbTreeQ.data?.subagents)?dbTreeQ.data.subagents:[]),[dbTreeQ.data])
const liveRpcList=useMemo(()=>(Array.isArray(liveRpcQ.data?.subagents)?liveRpcQ.data.subagents:[]),[liveRpcQ.data])
const mergedList=useMemo(()=>{
const normGoalKey=raw=>{
const s=String(raw||'')
.replace(/^\s*subagent\s*:\s*/i,'')
.replace(/(?<![\s….])[\s….]+$/,'')
.replace(/[^a-zA-ZÀ-ÿ0-9]+/g,' ')
.trim()
.toLowerCase()
return s?s.slice(0,96):''}
const commonPrefixLen=(a,b)=>{
const n=Math.min(a.length,b.length)
let i=0
while(i<n&&a[i]===b[i])i +=1
return i}
const isBatchDelegationId=id=>/^deleg_[a-z0-9]+$/i.test(String(id||'').trim())
const isEphemeralRpcId=id=>/^(sa-\d+|deleg[_:]|subagent-btw-|subagent-lifecycle-)/i.test(String(id||'').trim())
const isDbSessionId=id=>/^(20\d{2}|subagent-child)/i.test(String(id||'').trim())
const extractInlineThought=txt=>{
const m=String(txt||'').match(/<thought>([\s\S]*?)<\/thought>/i)
return m?.[1]?String(m[1]).trim():''}
const formatSubToolRecord=(t,idx=0)=>{if(typeof t==='string')return{call_id:`tc_${idx}`,tool:t,args:'',status:'ok',preview:''}
const fn=t.function&&typeof t.function==='object'?t.function:{}
const toolName=String(t.tool||t.tool_name||t.name||fn.name||'tool').trim()
let rawArgs=t.args??t.arguments??fn.arguments??t.command??t.path??''
if(rawArgs&&typeof rawArgs==='object'){try{rawArgs=rawArgs.command||rawArgs.path||rawArgs.file_path||rawArgs.query||rawArgs.goal||rawArgs.pattern||JSON.stringify(rawArgs)}catch{rawArgs=''}}
return{call_id:String(t.call_id||t.id||`tc_${idx}_${toolName}`),tool:toolName,args:String(rawArgs||'').trim().slice(0,140),status:String(t.status||(t.is_error||t.error?'error':'ok')).toLowerCase(),preview:String(t.preview||t.output||t.detail||t.error||'').trim().slice(0,160)}}
const normalizeToolsArray=rawTools=>Array.isArray(rawTools)?rawTools.filter(Boolean).map(formatSubToolRecord):[]
const records=[]
const byCanonicalKey=new Map()
const byGoalPrefix=new Map()
const upsertSubagent=(raw,sourceTag)=>{if(!raw||typeof raw!=='object')return
const rawId=String(raw.id||raw.subagent_id||'').trim()
const canonicalKey=String(raw.child_session_id||raw.session_id||(!isBatchDelegationId(raw.id)?raw.id:'')||
raw.subagent_id||raw.id||''
).trim()
if(!canonicalKey&&!rawId)return
const incomingDbId=String(raw.child_session_id||raw.session_id||
((sourceTag==='db'||sourceTag==='snap'||isDbSessionId(rawId))&&!isEphemeralRpcId(rawId)?rawId:'')
).trim()
const incomingRpcId=String(raw.subagent_id||
((sourceTag==='rpc'||isEphemeralRpcId(rawId))&&!isBatchDelegationId(rawId)?rawId:'')
).trim()
const candidateIds=[canonicalKey,incomingDbId,incomingRpcId,raw.child_session_id,raw.session_id,
!isBatchDelegationId(raw.id)?raw.id:'',raw.subagent_id]
.filter(Boolean)
.map(x=>String(x).trim())
.filter(x=>!isBatchDelegationId(x))
const hasConflictingIds=rec=>{if(!rec)return true
if(rec.db_id&&incomingDbId&&rec.db_id!==incomingDbId)return true
if(rec.rpc_id&&incomingRpcId&&rec.rpc_id!==incomingRpcId)return true
return false}
const goalText=String(raw.full_goal||raw.goal||raw.title||'').trim()
const titleText=String(raw.title||raw.goal||raw.full_goal||canonicalKey).trim()
const gKey=normGoalKey(goalText||titleText)
let target=null
for(const cid of candidateIds){if(byCanonicalKey.has(cid)){
const candRec=byCanonicalKey.get(cid)
if(!hasConflictingIds(candRec)){target=candRec
break}}}
if(!target&&gKey&&gKey.length>=12){
let existing=byGoalPrefix.get(gKey)||null
if(existing&&hasConflictingIds(existing)){existing=null}
if(!existing){
let bestCp=0
for(const rec of records){if(hasConflictingIds(rec))continue
const recGKey=normGoalKey(rec.full_goal||rec.title||'')
if(!recGKey||recGKey.length<12)continue
const cp=commonPrefixLen(recGKey,gKey)
const minReq=Math.min(32,recGKey.length,gKey.length)
if(cp>=Math.max(16,minReq)&&cp>bestCp){bestCp=cp
existing=rec}}}
if(existing&&!hasConflictingIds(existing)){
const existingHasDb=Boolean(existing.db_id||isDbSessionId(existing.id))
const existingHasRpc=Boolean(existing.live_rpc||existing.rpc_id||isEphemeralRpcId(existing.id))
const incomingIsRpc=sourceTag==='rpc'||isEphemeralRpcId(canonicalKey)||isEphemeralRpcId(rawId)
const incomingIsDb=sourceTag==='db'||sourceTag==='snap'||isDbSessionId(canonicalKey)||isDbSessionId(rawId)
if((existingHasDb&&incomingIsRpc&&!incomingDbId)||(existingHasRpc&&incomingIsDb&&!existing.db_id)||
existing.id===canonicalKey||(sourceTag==='db'&&existing._source==='snap'&&existing.id===canonicalKey)||
(sourceTag==='snap'&&existing._source==='db'&&existing.id===canonicalKey)
){target=existing}}}
const incomingCot=String(raw.full_reasoning_text||raw.last_reasoning_text||raw.reasoning||raw.thought||
extractInlineThought(raw.full_assistant_text||raw.last_assistant_text)||''
).trim()
const incomingOut=String(raw.full_assistant_text||raw.last_assistant_text||raw.summary||raw.output||'').trim()
const incomingTools=normalizeToolsArray(Array.isArray(raw.tool_calls)?raw.tool_calls:Array.isArray(raw.recent_tools)
?raw.recent_tools:Array.isArray(raw.recent_commands)?raw.recent_commands:[])
const incomingSteps=Array.isArray(raw.steps)?raw.steps:Array.isArray(raw.demo_steps)?raw.demo_steps:[]
const incomingToolCount=Math.max(
Number(raw.tool_call_count??raw.tool_count??(typeof raw.tool_calls==='number'?raw.tool_calls:0)??0),incomingTools.length)
const incomingStatus=String(raw.live_status||raw.status||(raw.ended_at?'done':'running')).toLowerCase()
if(!target){
const dbId=incomingDbId
const rpcId=incomingRpcId
const preferredId=String(dbId||canonicalKey||rawId)
target={...raw,id:preferredId,canonical_key:canonicalKey||preferredId,db_id:dbId?String(dbId):'',
rpc_id:rpcId?String(rpcId):'',delegation_id:String(raw.delegation_id||''),
merged_ids:Array.from(new Set([preferredId,...candidateIds].filter(Boolean))),title:titleText||preferredId,
full_goal:goalText||titleText||preferredId,model:String(raw.model||''),
status:incomingStatus==='completed'||incomingStatus==='succeeded'?'done':incomingStatus,
live_status:String(raw.live_status||raw.status||''),tool_call_count:incomingToolCount,
message_count:Number(raw.message_count||0),active_tool:String(raw.active_tool||raw.last_tool||''),
accepting_steer:Boolean(raw.accepting_steer??(incomingStatus==='running')),started_at:raw.started_at||0,
ended_at:raw.ended_at||null,elapsed_seconds:Number(raw.elapsed_seconds||0),
end_reason:String(raw.end_reason||raw.error||''),full_reasoning_text:incomingCot,
last_reasoning_text:String(raw.last_reasoning_text||incomingCot||''),reasoning:String(raw.reasoning||incomingCot||''),
thought:String(raw.thought||incomingCot||''),full_assistant_text:incomingOut,
last_assistant_text:String(raw.last_assistant_text||incomingOut||''),tool_calls:incomingTools,recent_tools:incomingTools,
steps:incomingSteps,touched_files:Array.isArray(raw.touched_files)?raw.touched_files:[],
live_rpc:sourceTag==='rpc'||Boolean(raw.live_rpc),_source:sourceTag}
records.push(target)
}else{
const dbId=target.db_id||incomingDbId
const rpcId=target.rpc_id||incomingRpcId
if(dbId&&isEphemeralRpcId(target.id)&&!isEphemeralRpcId(dbId)){target.id=String(dbId)}
target.db_id=dbId?String(dbId):target.db_id
target.rpc_id=rpcId?String(rpcId):target.rpc_id
if(raw.delegation_id&&!target.delegation_id){target.delegation_id=String(raw.delegation_id)}
target.merged_ids=Array.from(new Set([...(target.merged_ids||[]),target.id,...candidateIds].filter(Boolean)))
if(goalText&&(!target.full_goal||goalText.length>target.full_goal.length||target.full_goal===target.id)){
target.full_goal=goalText}
if(titleText&&(!target.title||titleText.length>target.title.length||target.title===target.id)){target.title=titleText}
if(raw.short_title&&!target.short_title){target.short_title=raw.short_title}
if(raw.model&&(!target.model||target.model==='default')){target.model=String(raw.model)}
const normInStatus=incomingStatus==='completed'||incomingStatus==='succeeded'?'done':incomingStatus
const hasEnded=Boolean(target.ended_at||raw.ended_at)
if(normInStatus==='failed'||target.status==='failed'){target.status='failed'
}else if(hasEnded||normInStatus==='done'){target.status='done'
}else if(sourceTag==='rpc'&&normInStatus==='running'){target.status='running'
target.live_status='running'
}else if(!target.status){target.status=normInStatus}
if(raw.live_status)target.live_status=String(raw.live_status)
target.started_at=target.started_at||raw.started_at||0
target.ended_at=target.ended_at||raw.ended_at||null
const computedElapsed=!target.ended_at&&Number(target.started_at||0)>1_000_000_000
?Math.max(0,Math.round(Date.now()/ 1000 - Number(target.started_at))):0
target.tool_call_count=Math.max(Number(target.tool_call_count||0),incomingToolCount)
target.message_count=Math.max(Number(target.message_count||0),Number(raw.message_count||0))
target.elapsed_seconds=Math.max(Number(target.elapsed_seconds||0),Number(raw.elapsed_seconds||0),computedElapsed)
target.active_tool=String(raw.last_tool||raw.active_tool||target.active_tool||'')
target.accepting_steer=Boolean(raw.accepting_steer??target.accepting_steer??(target.status==='running'))
if(raw.end_reason||raw.error){target.end_reason=String(raw.end_reason||raw.error||target.end_reason||'')}
if(incomingCot&&incomingCot.length>String(target.full_reasoning_text||'').length){target.full_reasoning_text=incomingCot}
if(raw.last_reasoning_text){target.last_reasoning_text=String(raw.last_reasoning_text)
}else if(!target.last_reasoning_text&&incomingCot){target.last_reasoning_text=incomingCot}
target.reasoning=target.full_reasoning_text||target.last_reasoning_text||''
target.thought=target.full_reasoning_text||target.last_reasoning_text||''
if(incomingOut&&incomingOut.length>String(target.full_assistant_text||'').length){target.full_assistant_text=incomingOut}
if(raw.last_assistant_text){target.last_assistant_text=String(raw.last_assistant_text)
}else if(!target.last_assistant_text&&incomingOut){target.last_assistant_text=incomingOut}
if(incomingTools.length>0){
const existingTools=Array.isArray(target.tool_calls)?target.tool_calls:[]
const seenToolIds=new Set(existingTools.map(t=> `${t.call_id}:${t.tool}:${t.args}`))
const combinedTools=[...existingTools]
for(const it of incomingTools){
const sig= `${it.call_id}:${it.tool}:${it.args}`
if(!seenToolIds.has(sig)){seenToolIds.add(sig)
combinedTools.push(it)}}
target.tool_calls=combinedTools
target.recent_tools=combinedTools
target.tool_call_count=Math.max(target.tool_call_count,combinedTools.length)}
if(incomingSteps.length>(Array.isArray(target.steps)?target.steps.length:0)){target.steps=incomingSteps}
if(Array.isArray(raw.demo_steps)&&raw.demo_steps.length>0&&!target.demo_steps){target.demo_steps=raw.demo_steps}
if(Array.isArray(raw.touched_files)&&raw.touched_files.length>0){
target.touched_files=Array.from(new Set([...(target.touched_files||[]),...raw.touched_files]))}
if(sourceTag==='rpc'||raw.live_rpc){target.live_rpc=true}}
for(const cid of target.merged_ids||[target.id]){if(cid)byCanonicalKey.set(cid,target)}
if(gKey&&gKey.length>=6){byGoalPrefix.set(gKey,target)}}
if(demoMode){
for(const ds of DEMO_SUBAGENTS)upsertSubagent(ds,'demo')
}else{
const snapList=Array.isArray(snapSubagents)?snapSubagents:[]
for(const s of snapList)upsertSubagent(s,'snap')
for(const s of dbTreeList)upsertSubagent(s,'db')
for(const ls of liveRpcList){upsertSubagent({...ls,id:ls?.child_session_id||ls?.session_id||ls?.subagent_id||ls?.id,
subagent_id:ls?.subagent_id||ls?.id,title:ls?.goal||ls?.title||ls?.subagent_id,
full_goal:ls?.goal||ls?.full_goal||ls?.title||ls?.subagent_id,live_status:ls?.status||'running',
status:ls?.status||'running',tool_call_count:Number(ls?.tool_count??ls?.tool_call_count??0),
active_tool:ls?.last_tool||ls?.active_tool||'',accepting_steer:Boolean(ls?.accepting_steer??true),live_rpc:true},'rpc')}
const failedDel=Array.isArray(liveRpcQ.data?.delegations)?liveRpcQ.data.delegations:[]
for(const fd of failedDel){if(!fd||typeof fd!=='object')continue
const fid=fd.child_session_id||fd.session_id|| `${fd.delegation_id||'deleg'}:${fd.task_index||0}`
upsertSubagent({...fd,id:fid,delegation_id:fd.delegation_id||fid,title:fd.goal||fd.title||fid,
full_goal:fd.goal||fd.title||fid,status:'failed',live_status:'failed',end_reason:fd.error||fd.status||'failed'},'rpc')}}
return records
.map(sub=>({...sub,short_title:sub.short_title||cleanSubagentTitle(sub.title||sub.id,sub.last_assistant_text||'')
}))
.sort((a,b)=>{if((a.status==='running')!==(b.status==='running'))return a.status==='running'?-1:1
return Number(b.started_at||0)- Number(a.started_at||0)})
},[dbTreeList,liveRpcList,liveRpcQ.data,snapSubagents,demoMode])
useEffect(()=>{
if(demoMode&&DEMO_SUBAGENTS[0]?.id){
const curSel=$selectedSubagentId.get()
if(!curSel||!DEMO_SUBAGENTS.some(ds=>ds.id===curSel)){setSelectedSubId(DEMO_SUBAGENTS[0].id)}}
},[demoMode])
const selectedSub=useMemo(()=>{if(!selectedSubId)return null
return(mergedList.find(s=>s.id===selectedSubId||(s.canonical_key&&s.canonical_key===selectedSubId)||
(s.db_id&&s.db_id===selectedSubId)||(s.rpc_id&&s.rpc_id===selectedSubId)||
(Array.isArray(s.merged_ids)&&s.merged_ids.includes(selectedSubId))
)||null)
},[mergedList,selectedSubId])
const feedSessionId=selectedSub?.db_id||selectedSub?.child_session_id||selectedSub?.session_id||selectedSub?.id||selectedSubId
const feedQ=useQuery({queryKey:[ID,'subagent-feed',scope.profile,feedSessionId],
enabled:Boolean(_rest&&feedSessionId&&!selectedSub?.demo_steps),
queryFn:()=>_rest(`/subagents/feed?session_id=${encodeURIComponent(feedSessionId)}&limit=32`,{timeoutMs:8000}),staleTime:2000,
refetchInterval:selectedSub?3000:false,retry:1})
const subBackendCfg=useValue($backendSettings)||{}
const interruptChild=async sub=>{if(!sub?.id)return
let notified=false
const rpcTargetId=sub.rpc_id||sub.subagent_id||sub.id
if(parentRuntimeId&&host?.request){try{
const res=await host.request('subagent.interrupt',{session_id:parentRuntimeId,subagent_id:rpcTargetId})
if(res?.found!==false){notified=true
haptic?.('tap')
host.notify?.({kind:'info',message:strings.subagentInterruptedNotify(sub.short_title||sub.title||sub.id)})}
}catch{}}
if(!notified&&typeof host?.request==='function'){try{
const rRpc=await host.request(`plugin.${ID}.subagent_control`,{subagent_id:rpcTargetId,action:'interrupt',session_id:parentStoredId||parentRuntimeId})
if(rRpc?.ok){notified=true;haptic?.('tap');host.notify?.({kind:'info',message:strings.subagentInterruptedNotify(sub.short_title||sub.title||sub.id)})}
}catch{}}
if(_rest){try{
const r=await _rest('/subagents/control',{method:'POST',
body:{subagent_id:rpcTargetId,action:'interrupt',session_id:parentStoredId||parentRuntimeId},timeoutMs:8000})
if(r?.ok&&!notified){haptic?.('tap')
host.notify?.({kind:'info',message:strings.subagentInterruptedNotify(sub.short_title||sub.title||sub.id)})}
}catch{}}
void liveRpcQ.refetch()
void dbTreeQ.refetch()}
const onRunLaunch=async()=>{
const goalTxt=launchGoal.trim()
const ctxTxt=launchContext.trim()
if(!goalTxt||launching)return
setLaunching(true)
setLaunchGoal('')
setLaunchContext('')
setLauncherOpen(false)
const targetParentSid=parentStoredId||parentRuntimeId||'active'
void(async()=>{try{
const res=await launchSubagentViaRest({goal:goalTxt,context:ctxTxt,model:launchModel,sessionId:targetParentSid,
parentSessionId:targetParentSid})
if(res?.ok){void dbTreeQ.refetch()
void liveRpcQ.refetch()
try{queryClient?.invalidateQueries?.({queryKey:[ID]})
}catch{}}
}finally{setLaunching(false)}
})()}
useEffect(()=>{if(!selectedSubId||!_rest||selectedSubId.startsWith('sa-'))return undefined
let cancelled=false
void _rest(`/snapshot?session_id=${encodeURIComponent(selectedSubId)}`,{timeoutMs:6000}).then(snapRes=>{
if(!cancelled&&Array.isArray(snapRes?.history)&&snapRes.history.length>0){$entriesBySession.set({...$entriesBySession.get(),
[selectedSubId]:snapRes.history})}}).catch(()=>{})
return()=>{cancelled=true}
},[selectedSubId])
const submitSubagentChat=sub=>{
const text=subChatDraft.trim()
if(!text||!sub?.id||subChatSending)return
setSubChatSending(true)
setSubChatDraft('')
const fullOut=String(sub.full_assistant_text||sub.last_assistant_text||'')
const inlineThought=sub.full_assistant_text?.match(/<thought>([\s\S]*?)<\/thought>/i)?.[1]||''
const stepThoughts=(Array.isArray(feedQ.data?.steps)?feedQ.data.steps:Array.isArray(sub.steps)?sub.steps:[])
.map(s=>String(s?.thought||s?.reasoning||(s?.kind==='thought'?s?.text:'')||'').trim())
.filter(Boolean)
.join('\n\n')
const fullCot=String(
sub.full_reasoning_text||sub.last_reasoning_text||sub.reasoning||sub.thought||inlineThought||stepThoughts||''
).trim()
const fullGoal=String(sub.full_goal||sub.title||sub.id)
const targetParentSid=parentStoredId||parentRuntimeId||'active'
void(async()=>{try{if(subChatMode==='steer_bot'){if(sub.status==='running'){
const ok=await steerSubagentSession(sub.rpc_id || sub.subagent_id || sub.id,sub.short_title||sub.title||sub.id,text,scope)
if(ok){haptic?.('success')
void liveRpcQ.refetch()
void dbTreeQ.refetch()
try{queryClient?.invalidateQueries?.({queryKey:[ID]})
}catch{}}
}else{
const res=await launchSubagentViaRest({goal:text,context:[
`Continuation of finished subagent "${sub.short_title||sub.id}" (${sub.id}).`,`Original mission: ${fullGoal.slice(0,1200)}`,
fullOut? `Previous output summary:\n${fullOut.slice(0,3500)}` :'']
.filter(Boolean)
.join('\n\n'),sessionId:targetParentSid,parentSessionId:targetParentSid})
if(res?.ok){haptic?.('success')
void dbTreeQ.refetch()
void liveRpcQ.refetch()
try{queryClient?.invalidateQueries?.({queryKey:[ID]})
}catch{}}}
}else{
const subScope={...scope,key:sub.id,storedId:sub.id,runtimeId:sub.id,parentRuntimeId:parentRuntimeId||scope.runtimeId||'',
parentStoredId:parentStoredId||scope.storedId||'',isSubagentInspect:true,subagentTitle:sub.short_title||sub.title||sub.id}
const subCtxAttachment={id: `sub_ctx_${sub.id}`,kind:'session',session_id:sub.id,label: `@session:${sub.short_title||sub.id}`,
detail: `${sub.model||'subagent'} · ${sub.tool_call_count||0} tools · ${sub.status}`,content:[
`Subagent "${sub.short_title||sub.id}" (ID: ${sub.id}, status: ${sub.status}, model: ${sub.model||'default'}, tools: ${sub.tool_call_count||0})`,
`Full Mission Prompt:\n${fullGoal.slice(0,3000)}`,Array.isArray(sub.touched_files)&&sub.touched_files.length
? `Touched Files: ${sub.touched_files.join(', ')}` :'',fullCot? `Chain of Thought (CoT):\n${fullCot.slice(0,4000)}` :'',
fullOut? `Full Final Output:\n${fullOut.slice(0,8000)}` :'']
.filter(Boolean)
.join('\n\n')}
void dispatchSideQuestion(text,subScope,$askMode.get()||'fast',{attachments:[subCtxAttachment],keepAttachments:true})
haptic?.('success')}
}finally{setSubChatSending(false)}
})()}
const presetCodiconMap={verify:'check-all',security:'shield',diagnose:'bug',docs:'diff'}
const cleanPresetLabel=rawLbl=>String(rawLbl||'')
.replace(/^[^a-zA-ZÀ-ÿ0-9]+/u,'')
.trim()
const launcherNode=divs('flex flex-col gap-2',[divs('btw-overview-command-bar',[spans('inline-flex items-center gap-1.5 btw-tx-105 font-bold uppercase tracking-wider btw-ts',[
typeof Loader==='function'&&mergedList.some(s=>s.status==='running')
?jsx(Loader,{type:'lemniscate-bloom',strokeScale:1.15,className:'size-3.5 text-sky-400 shrink-0'})
:codicon('hubot','0.78rem','text-emerald-400'),strings.subagentsTitle(mergedList.length)]),
hsBtn('btw-overview-deep-btn',{onClick:()=>{setLauncherOpen(v=>!v)
haptic?.('tap')}},[codicon(launcherOpen?'close':'add','0.7rem','text-sky-400'),
span(null,launcherOpen?lang==='pt'?'Fechar Lançador':'Close Launcher'
:(strings.launchSubagentBtn||'+ Launch Subagent').replace(/^\+\s*/,''))])]),launcherOpen&&divs({cls:'btw-subagent-launcher',onKeyDown:e=>{if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
setLauncherOpen(false)}}},[divs(CLS.rowWrapBetween,[
divs('inline-flex items-center gap-1.5 btw-tx-11 font-semibold btw-tp',[
typeof Loader==='function'?jsx(Loader,{type:'rose-orbit',strokeScale:1.15,className:'size-3.5 text-emerald-400 shrink-0'})
:codicon('sparkle','0.72rem','text-emerald-400'),span(null,lang==='pt'?'Novo Subagente Delegado':'New Delegated Subagent')]),hsBtn('btw-overview-playbook-pill',{'data-active':showLaunchCtx||Boolean(launchContext)?'true':'false',onClick:()=>{
setShowLaunchCtx(v=>!v)
haptic?.('tap')}},[
codicon(showLaunchCtx||Boolean(launchContext)?'chevron-up':'add','0.65rem','text-sky-400'),
span(null,lang==='pt'?'Contexto & @tags':'Context & @tags')])]),div('grid grid-cols-2 gap-1.5',(strings.subagentLaunchPresets||[]).map(p=>hsBtn('btw-model-tier-pill justify-start w-full px-2.5',{onClick:()=>{setLaunchGoal(p.goal)
if(p.context){setLaunchContext(p.context)
setShowLaunchCtx(true)}
haptic?.('tap')}},[codicon(presetCodiconMap[p.id]||'sparkle','0.68rem','text-sky-400 shrink-0'),span('truncate font-medium',cleanPresetLabel(p.label))],p.id))),divs('btw-launcher-omnibox',[h('textarea',{rows:2,cls:'btw-launcher-textarea',placeholder:lang==='pt'
?'Descreva a missão do subagente (Enter dispara, Shift+Enter quebra linha)...'
:'Describe the subagent mission (Enter dispatches, Shift+Enter for newline)...',value:launchGoal,onChange:e=>setLaunchGoal(e.target.value),onKeyDown:e=>{if(isSubmitEnter(e)){e.preventDefault()
void onRunLaunch()}}}),(showLaunchCtx||Boolean(launchContext))&&divs('btw-launcher-ctx-box',[
h('textarea',{ref:ctxInputRef,rows:2,cls:'btw-launcher-textarea font-mono btw-tx-11 btw-ts',placeholder:strings.launchContextPlaceholder,value:launchContext,onChange:e=>setLaunchContext(e.target.value)}),
jsx(TokenChips,{targetRef:ctxInputRef,onInsert:next=>setLaunchContext(next),compact:true})]),divs('flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t btw-bd-st50',[
jsx(ComposerModelPicker,{providerValue:launchProvider,modelValue:launchModel,compact:true,onSelect:({provider,model})=>{
setLaunchProvider(provider||'')
setLaunchModel(model||'')}}),divs(CLS.row15,[uiBtn('ghost','xs',{cls:'h-6 px-2 btw-tx-11 btw-tt btw-hv-tp',onClick:()=>setLauncherOpen(false)},strings.cancelBtn),hsBtn('btw-overview-deep-btn',{disabled:!launchGoal.trim()||launching,onClick:()=>void onRunLaunch()},[launching?typeof Loader==='function'
?jsx(Loader,{type:'fourier-flow',strokeScale:1.15,className:'size-3.5 text-sky-400'})
:jsx(GlyphSpinner,{spinner:'braille'}):codicon('play','0.7rem','text-emerald-400'),
span(null,launching?strings.launchingSubagentLabel
:(strings.launchDispatchBtn||'Spawn Subagent').replace(/^[🚀\s]+/u,''))])])])])])])
if(mergedList.length===0){if(isUnstarted){
return jsx(WaitingToStartSessionHero,{scope,variant:'subagents',onOpenSettings})}
return divs('flex flex-col gap-2.5 text-xs',[launcherNode,divs('btw-empty-hero btw-stagger-item text-xs',[jsx(HermesBotAvatar,{sub:{id:String(scope?.profile||'hermes-fleet'),status:'running'},size:46}),div('mt-0.5 font-semibold btw-tp',strings.subagentsEmptyTitle),div('max-w-[50ch] btw-tx-115 leading-relaxed btw-tt',strings.subagentsEmptyDesc),divs('mt-1.5 flex flex-wrap items-center justify-center gap-2',[hsBtn('btw-primary-send-btn',{onClick:()=>{setLauncherOpen(true)
haptic?.('tap')}},[codicon('hubot','0.72rem'),span(null,strings.launchSubagentBtn)]),
uiBtn('outline','xs',{cls:'h-[26px] rounded-full px-3 btw-ac btw-bd-ac40',onClick:()=>{$demoShowcase.set(true)
haptic?.('tap')}},strings.demoLoadBtn)])])])}
const runningSubs=mergedList.filter(s=>s.status==='running')
const doneSubs=mergedList.filter(s=>s.status!=='running'&&s.status!=='failed')
const failedSubs=mergedList.filter(s=>s.status==='failed')
const renderBotCard=sub=>{
const isRunning=sub.status==='running'
const isFailed=sub.status==='failed'
const isSelected=selectedSub?selectedSub.id===sub.id:selectedSubId===sub.id
const shortTitle=sub.short_title||cleanSubagentTitle(sub.title||sub.id,sub.last_assistant_text||'')
return divs({cls:'btw-subagent-card','data-status':sub.status||'done','data-selected':isSelected?'true':'false',role:'button',tabIndex:0,title:sub.full_goal||sub.title||shortTitle,onClick:()=>{
setSelectedSubId(()=>(isSelected?'':sub.id))
haptic?.('tap')},onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault()
setSelectedSubId(()=>(isSelected?'':sub.id))
haptic?.('tap')}}},[div('w-full line-clamp-2 px-1 btw-tx-115 font-semibold tracking-tight leading-snug btw-tp',shortTitle),
jsx(HermesBotAvatar,{sub,size:50}),divs('w-full min-w-0 flex items-center justify-center gap-1.5 font-mono btw-tx-95',[jsx(Seal,{kind:isRunning?'observed':isFailed?'hurt':'helped',children:isRunning
? `◐ ${sub.active_tool?sub.active_tool:strings.subagentStatusRunning}` :isFailed? `✕ ${strings.subagentStatusFailed}`
: `✓ ${strings.subagentStatusDone}`}),sub.elapsed_seconds?span('btw-tt shrink-0 whitespace-nowrap tabular-nums',fmtDurationSec(sub.elapsed_seconds)):null])],sub.id)}
const renderZone=(zoneKind,titleText,list,dotColor)=>{if(!list.length)return null
return divs({cls:'btw-subagent-zone','data-zone':zoneKind},[divs('flex items-center justify-between gap-2 px-0.5',[spans('inline-flex items-center gap-1.5 btw-tx-10 font-bold uppercase tracking-wider btw-ts',[
span({cls:cn('inline-block size-2 rounded-full',zoneKind==='running'&&'animate-pulse'),style:{background:dotColor}}),`${titleText} (${list.length})`]),span('btw-tx-10 btw-tt',lang==='pt'?'Clique em um bot para inspecionar e conversar via /btw':'Click any bot to inspect & chat via /btw')]),
div({cls:'btw-subagents-grid','data-multi':list.length>1?'true':'false'},list.map(renderBotCard))],zoneKind)}
const subEntries=selectedSub?(entriesMap?.[selectedSub.id]||[]):[]
const subPending=selectedSub?(pendingMap?.[selectedSub.id]||null):null
const subFeedSteps=selectedSub?Array.isArray(selectedSub.demo_steps)&&selectedSub.demo_steps.length>0?selectedSub.demo_steps
:Array.isArray(feedQ.data?.steps)&&feedQ.data.steps.length>0?feedQ.data.steps:Array.isArray(selectedSub.steps)
?selectedSub.steps:[]:[]
const feedSteps=subFeedSteps
return divs('flex flex-col gap-2.5 text-xs',[launcherNode,demoMode&&divs('flex items-center justify-between gap-2 rounded-lg border btw-bd-ac45 btw-bg-ac10 px-2.5 py-1.5 btw-tx-11',[jsx(Seal,{kind:'observed',children:strings.demoBadge}),uiBtn('ghost','xs',{onClick:()=>$demoShowcase.set(false)},strings.demoExitBtn)]),renderZone('running',
lang==='pt'?'⚡ Em Execução · Working':'⚡ Working Now',runningSubs,'#38bdf8'),renderZone('done',
lang==='pt'?'✓ Concluídos · Completed':'✓ Completed',doneSubs,'#10b981'),renderZone('failed',
lang==='pt'?'✕ Com Erro / Interrompidos':'✕ Error / Interrupted',failedSubs,'#f43f5e'),selectedSub&&(()=>{
const isPt=lang==='pt'
const sub=selectedSub
const rawAssistantText=String(sub.full_assistant_text||sub.last_assistant_text||'').trim()
const fullOut=rawAssistantText.replace(/<thought>[\s\S]*?<\/thought>/gi,'').trim()
const baseCot=String(sub.full_reasoning_text||sub.last_reasoning_text||sub.reasoning||sub.thought||
(sub.full_assistant_text?.match(/<thought>([\s\S]*?)<\/thought>/i)?.[1])||''
).trim()
const stepThoughtsList=subFeedSteps
.map(s=>String(s?.thought||s?.reasoning||(s?.kind==='thought'?s?.text:'')||'').trim())
.filter(Boolean)
const combinedCotParts=[]
if(baseCot)combinedCotParts.push(baseCot)
for(const st of stepThoughtsList){if(!combinedCotParts.some(existing=>existing.includes(st)||st.includes(existing))){
combinedCotParts.push(st)}}
const fullCot=combinedCotParts.join('\n\n').trim()
const formatToolRecord=(t,idx)=>{if(!t)return null
if(typeof t==='string'){
return{call_id: `sub_tc_${idx}`,tool:t,args:'',status:'ok',preview:''}}
const fn=t.function&&typeof t.function==='object'?t.function:{}
const toolName=String(t.tool||t.tool_name||t.name||fn.name||'tool').trim()
let rawArgs=t.args??t.arguments??fn.arguments??t.command??t.path??''
if(rawArgs&&typeof rawArgs==='object'){try{rawArgs=rawArgs.command||rawArgs.path||rawArgs.file_path||rawArgs.query||
rawArgs.pattern||JSON.stringify(rawArgs)
}catch{rawArgs=''}
}else if(typeof rawArgs==='string'&&rawArgs.trim().startsWith('{')){try{
const parsedArgs=JSON.parse(rawArgs)
rawArgs=parsedArgs.command||parsedArgs.path||parsedArgs.file_path||parsedArgs.query||parsedArgs.pattern||rawArgs
}catch{}}
const argsPreview=String(rawArgs||'').trim().slice(0,140)
const statusVal=String(t.status||(t.is_error||t.error||(t.exit_code!=null&&t.exit_code!==0)?'error':'ok')
).toLowerCase()
const outPreviewTxt=String(t.preview||t.output||t.detail||t.error||'').trim().slice(0,160)
return{call_id:String(t.call_id||t.id|| `sub_tc_${idx}_${toolName}`),tool:toolName,args:argsPreview,status:statusVal,
preview:outPreviewTxt}}
/** @type{Array<{call_id:string,tool:string,args:string,status:string,preview:string}>}*/
const stepToolsFlat=[]
for(const s of subFeedSteps){
const rawStepTools=Array.isArray(s?.tools)?s.tools:Array.isArray(s?.tool_calls)?s.tool_calls:s?.kind==='tool'?[s]:[]
for(const rt of rawStepTools){
const normT=formatToolRecord(rt,stepToolsFlat.length)
if(normT)stepToolsFlat.push(normT)}}
const directSubTools=[...(Array.isArray(sub.recent_tools)?sub.recent_tools:[]),
...(Array.isArray(sub.tool_calls)?sub.tool_calls:[]),...(Array.isArray(sub.recent_commands)?sub.recent_commands:[])]
.map((rt,idx)=>formatToolRecord(rt,idx))
.filter(/** @returns{x is{call_id:string,tool:string,args:string,status:string,preview:string}}*/ x=>x!==null)
if(sub.active_tool&&stepToolsFlat.length===0&&directSubTools.length===0){directSubTools.push({
call_id: `active_${sub.active_tool}`,tool:String(sub.active_tool),args:'',status:sub.status==='running'?'running':'ok',
preview:''})}
const standaloneToolCalls=stepToolsFlat.length>0?stepToolsFlat:directSubTools
const effectiveToolCount=Math.max(Number(sub.tool_call_count||0),stepToolsFlat.length,directSubTools.length)
const fullGoal=String(sub.full_goal||sub.title||sub.id).trim()
const outPreview=fullOut
.split('\n')
.map(l=>l.replace(/^[#>*\s`-]+/,'').replace(/\*\*/g,'').trim())
.find(l=>l.length>10&&!l.startsWith('|'))||(sub.status==='running'?isPt
? `Em execução (${effectiveToolCount} tools${sub.active_tool? ` · ⚡ ${sub.active_tool}` :''}) — veja CoT & Tools abaixo`
: `Running (${effectiveToolCount} tools${sub.active_tool? ` · ⚡ ${sub.active_tool}` :''}) — see CoT & Tools below` :isPt
?'Clique para visualizar 100% do relatório':'Click to view 100% of the output')
const firstToolSummary=standaloneToolCalls.length>0? `${standaloneToolCalls[standaloneToolCalls.length - 1].tool}${
standaloneToolCalls[standaloneToolCalls.length - 1].args? `(${standaloneToolCalls[standaloneToolCalls.length - 1].args.slice(0,48)})`
:''
}` :''
const cotPreview=fullCot
.split('\n')
.map(l=>l.replace(/^[#>*\s`-]+/,'').replace(/\*\*/g,'').trim())
.find(l=>l.length>10)||(firstToolSummary? `${standaloneToolCalls.length} tools · ${firstToolSummary}` :subFeedSteps.length>0
?isPt? `${subFeedSteps.length} etapas registradas · clique para expandir CoT & Tools`
: `${subFeedSteps.length} steps recorded · click to expand CoT & Tools` :isPt
?'Clique para inspecionar a linha do tempo de ferramentas e raciocínio':'Click to inspect tool timeline and reasoning')
const goalPreview=fullGoal
.split('\n')
.map(l=>l.replace(/^[#>*\s`-]+/,'').replace(/\*\*/g,'').trim())
.find(l=>l.length>6)||fullGoal.slice(0,80)
return divs('btw-subagent-inspector',[divs('flex flex-wrap items-center justify-between gap-2 border-b btw-bd-st55 pb-2.5',[
divs('flex min-w-0 items-center gap-2.5',[jsx(HermesBotAvatar,{sub:selectedSub,size:36}),
divs('min-w-0 flex flex-col gap-0.5',[divs(CLS.rowWrap15,[span('btw-tx-13 font-bold btw-tp truncate',selectedSub.short_title),
jsx(Seal,{kind:selectedSub.status==='running'?'observed':selectedSub.status==='failed'?'hurt':'helped',children:
selectedSub.status==='running'? `◐ ${strings.subagentStatusRunning}` :selectedSub.status==='failed'
? `✕ ${strings.subagentStatusFailed}` : `✓ ${strings.subagentStatusDone}`})]),divs('flex flex-wrap items-center gap-1.5 font-mono btw-tx-10 btw-tt',[
selectedSub.model?span('font-semibold btw-ac',shortModelName(selectedSub.model)):null,
span(null,`· ${selectedSub.tool_call_count||0} ${strings.liveToolsUnit}`),
selectedSub.elapsed_seconds?span(null,`· ${fmtDurationSec(selectedSub.elapsed_seconds)}`):null,
selectedSub.active_tool?span(CLS.accent,`· ⚡ ${selectedSub.active_tool}`):null])])]),divs(CLS.row15,[selectedSub.status==='running'&&uiBtn('outline','xs',{cls:'h-6 px-2 btw-tx-10 text-destructive border-destructive/40',onClick:()=>void interruptChild(selectedSub)},strings.subagentInterruptBtn),hBtn('inline-flex items-center justify-center size-6 rounded-md border btw-bd-st60 btw-bg-tp4m btw-ts btw-hv-tp btw-hv-bdst cursor-pointer transition-colors',{'data-btw-role':'close-subagent-inspector',onClick:e=>{e.preventDefault()
e.stopPropagation()
setSelectedSubId('')
haptic?.('tap')},title:isPt?'Fechar inspeção (Esc)':'Close inspector (Esc)','aria-label':isPt?'Fechar inspeção':'Close inspector'},codicon('close','0.78rem'))])]),
selectedSub.end_reason&&selectedSub.status==='failed'&&div('btw-warn-text font-mono btw-tx-11 wrap-anywhere rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 py-1.5',`⚠ ${selectedSub.end_reason}`),divs(CLS.col15,[divs({cls:'btw-sub-accordion','data-open':openSections.output?'true':'false'},[divs({cls:'btw-sub-accordion-head',onClick:()=>toggleSubSection('output'),role:'button',tabIndex:0,onKeyDown:e=>{
if(e.key==='Enter'||e.key===' '){e.preventDefault()
toggleSubSection('output')}}},[divs(CLS.rowMin0,[
jsx(DisclosureCaret,{open:openSections.output,size:'0.72rem',className:'shrink-0 text-emerald-400'}),span('rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono btw-tx-95 font-bold text-emerald-400 shrink-0',`✓ ${strings.subagentReplyLabel}`),span('truncate btw-tx-115 btw-ts',outPreview)]),divs({cls:'flex shrink-0 items-center gap-1.5 font-mono btw-tx-95 btw-tt',onClick:e=>e.stopPropagation()},[fullOut?span(null,`${fmtCompact(fullOut.length)} chars`):null,fullOut?jsx(CopyButton,{text:fullOut,
appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer}):null])]),
openSections.output&&div('btw-sub-accordion-body btw-subagent-md max-h-[420px] overflow-y-auto',fullOut
?jsx(MessageTextContent,{text:fullOut,media:false,previewOnly:true}):fullCot||standaloneToolCalls.length>0
?divs('flex flex-col gap-1.5 btw-tx-11 btw-ts',[div(CLS.muted,isPt?'Subagente executando ferramentas (sem texto final emitido ainda):'
:'Subagent executing tools (no final assistant text emitted yet):'),fullCot?div('btw-feed-thought wrap-anywhere',jsx(MessageTextContent,{text:fullCot,media:false,previewOnly:true}))
:null,standaloneToolCalls.slice(-5).map((tItem,tIdx)=>divs({cls:'btw-feed-tool','data-status':tItem.status||'ok'},[divs('flex flex-wrap items-center justify-between gap-1.5 font-mono',[spans('min-w-0 flex-1 truncate btw-tp',[
h('strong',CLS.accent,tItem.tool),tItem.args? ` (${tItem.args})` :'']),jsx(Seal,{
kind:tItem.status==='error'?'hurt':tItem.status==='running'?'observed':'helped',
children:tItem.status==='error'?'✕ error':tItem.status==='running'?'◐ running':'✓ ok'})]),tItem.preview?div('font-mono btw-tx-10 btw-tt wrap-anywhere line-clamp-2',`↳ ${tItem.preview}`):null],tItem.call_id||tIdx))]):div('btw-tx-11 btw-tt',isPt?'Aguardando saída final do subagente…':'Waiting for subagent output…'))]),divs({cls:'btw-sub-accordion','data-open':openSections.cot?'true':'false'},[divs({cls:'btw-sub-accordion-head',onClick:()=>toggleSubSection('cot'),role:'button',tabIndex:0,onKeyDown:e=>{
if(e.key==='Enter'||e.key===' '){e.preventDefault()
toggleSubSection('cot')}}},[divs(CLS.rowMin0,[
jsx(DisclosureCaret,{open:openSections.cot,size:'0.72rem',className:'shrink-0 btw-ac'}),span('rounded-full btw-bg-ac15 px-2 py-0.5 font-mono btw-tx-95 font-bold btw-ac shrink-0',`${strings.subagentFeedCompactBtn} (${effectiveToolCount})`),span('truncate btw-tx-115 btw-ts',cotPreview)]),fullCot?div({cls:'shrink-0 font-mono btw-tx-95 btw-tt',onClick:e=>e.stopPropagation()},jsx(CopyButton,{
text:fullCot,appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer})):null]),
openSections.cot&&divs('btw-sub-accordion-body btw-feed-timeline flex flex-col gap-2 max-h-[420px] overflow-y-auto',[fullCot&&
divs('btw-feed-thought',[div('mb-1 font-mono btw-tx-95 font-semibold uppercase tracking-wider btw-hypo',`🧠 ${strings.subagentThoughtLabel}`),div('btw-subagent-md',jsx(MessageTextContent,{text:fullCot,media:false,previewOnly:true}))]),stepToolsFlat.length===0&&
directSubTools.length>0&&directSubTools.map((tItem,tIdx)=>divs({cls:'btw-feed-tool','data-status':tItem.status||'ok'},[divs('flex flex-wrap items-center justify-between gap-1.5 font-mono',[spans('min-w-0 flex-1 truncate btw-tp',[
h('strong',CLS.accent,tItem.tool),tItem.args? ` (${tItem.args})` :'']),jsx(Seal,{
kind:tItem.status==='error'?'hurt':tItem.status==='running'?'observed':'helped',
children:tItem.status==='error'?'✕ error':tItem.status==='running'?'◐ running':'✓ ok'})]),tItem.preview?div('font-mono btw-tx-10 btw-tt wrap-anywhere line-clamp-2',`↳ ${tItem.preview}`):null],tItem.call_id|| `direct_${tIdx}`)),feedQ.isFetching&&subFeedSteps.length===0&&directSubTools.length===0&&!fullCot
?jsx(GlyphSpinner,{spinner:'braille'}):subFeedSteps.length===0&&directSubTools.length===0&&!fullCot
?div('btw-tx-11 btw-tt',strings.subagentFeedEmpty)
:subFeedSteps.map((step,stepIdx)=>{if(step.kind==='goal')return null
if(step.kind==='steer'){
return divs('rounded-md border btw-bd-ac45 btw-bg-ac10 px-2.5 py-1.5 btw-tx-105 btw-tp',[div('mb-0.5 font-mono btw-tx-95 font-semibold uppercase tracking-wider btw-ac',`⚡ ${strings.subagentSteerLabel}`),div('btw-subagent-md',jsx(MessageTextContent,{text:step.text,media:false,previewOnly:true}))],step.id|| `steer_${stepIdx}`)}
const stepThoughtTxt=String(step.thought||step.reasoning||(step.kind==='thought'?step.text:'')||''
).trim()
const showStepThought=Boolean(stepThoughtTxt&&stepThoughtTxt!==fullCot)
const rawStepTools=Array.isArray(step.tools)?step.tools:Array.isArray(step.tool_calls)?step.tool_calls:step.kind==='tool'
?[step]:[]
const normStepTools=rawStepTools.map((rt,idx)=>formatToolRecord(rt,idx)).filter(/** @returns{x is{call_id:string,tool:string,args:string,status:string,preview:string}}*/ x=>x!==null)
const stepReplyTxt=String(step.reply||(step.kind==='reply'?step.text:'')||'').trim()
if(!showStepThought&&normStepTools.length===0&&!stepReplyTxt)return null
return divs(CLS.col15,[showStepThought?divs('btw-feed-thought wrap-anywhere',[div('mb-0.5 font-mono btw-tx-95 font-semibold uppercase tracking-wider btw-hypo',`🧠 ${strings.subagentThoughtLabel}`),div('btw-subagent-md',jsx(MessageTextContent,{text:stepThoughtTxt,media:false,previewOnly:true}))]):null,
normStepTools.map((tItem,tIdx)=>divs({cls:'btw-feed-tool','data-status':tItem.status||'ok'},[divs('flex flex-wrap items-center justify-between gap-1.5 font-mono',[spans('min-w-0 flex-1 truncate btw-tp',[
h('strong',CLS.accent,tItem.tool),tItem.args? ` (${tItem.args})` :'']),jsx(Seal,{
kind:tItem.status==='error'?'hurt':tItem.status==='running'?'observed':'helped',
children:tItem.status==='error'?'✕ error':tItem.status==='running'?'◐ running':'✓ ok'})]),tItem.preview?div('font-mono btw-tx-10 btw-tt wrap-anywhere line-clamp-2',`↳ ${tItem.preview}`):null],tItem.call_id||tIdx)),stepReplyTxt?divs('btw-feed-reply wrap-anywhere',[div('mb-0.5 font-mono btw-tx-95 font-semibold uppercase tracking-wider btw-ok',`✓ ${strings.subagentReplyLabel}`),div('btw-subagent-md',jsx(MessageTextContent,{text:stepReplyTxt,media:false,previewOnly:true}))]):null],step.id|| `step_${stepIdx}`)
})])]),divs({cls:'btw-sub-accordion','data-open':openSections.prompt?'true':'false'},[divs({cls:'btw-sub-accordion-head',onClick:()=>toggleSubSection('prompt'),role:'button',tabIndex:0,onKeyDown:e=>{
if(e.key==='Enter'||e.key===' '){e.preventDefault()
toggleSubSection('prompt')}}},[divs(CLS.rowMin0,[
jsx(DisclosureCaret,{open:openSections.prompt,size:'0.72rem',className:'shrink-0 text-amber-400'}),span('rounded-full bg-amber-500/15 px-2 py-0.5 font-mono btw-tx-95 font-bold text-amber-400 shrink-0',`🎯 ${strings.subagentGoalLabel}`),span('truncate btw-tx-115 btw-ts',goalPreview)]),divs({cls:'flex shrink-0 items-center gap-1.5 font-mono btw-tx-95 btw-tt',onClick:e=>e.stopPropagation()},[span(null,`${fmtCompact(fullGoal.length)} chars`),jsx(CopyButton,{text:fullGoal,appearance:'icon',
buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer})])]),openSections.prompt&&div('btw-sub-accordion-body btw-subagent-md btw-subagent-tail max-h-[340px] overflow-y-auto',jsx(MessageTextContent,{text:fullGoal,media:false,previewOnly:true}))])]),
Array.isArray(selectedSub.touched_files)&&selectedSub.touched_files.length>0&&divs(CLS.col15,[span('btw-tx-95 font-bold uppercase tracking-wider btw-tt px-0.5',`${strings.statTouchedFiles||(isPt?'Arquivos Tocados':'Touched Files')} (${selectedSub.touched_files.length})`),
div('btw-file-bento-grid',selectedSub.touched_files.slice(0,6).map(fp=>{
const{leaf,parent,full}=splitPathLeaf(fp)
const ext=(leaf.includes('.')?leaf.split('.').pop()||'FILE':'FILE').slice(0,4).toUpperCase()
return divs('btw-file-bento-card flex-row items-center justify-between py-1.5 px-2.5',[divs('flex min-w-0 items-center gap-2',[span('btw-file-ext-badge shrink-0',ext),
divs('min-w-0 flex flex-col',[span({cls:'font-mono btw-tx-11 font-semibold btw-tp truncate',title:full},leaf),parent?span('font-mono btw-tx-9 btw-tt truncate',`${parent}/`):null])]),hBtn('btw-token-chip h-5 px-1.5 btw-tx-95 btw-ac shrink-0',{onClick:()=>{
setSubChatMode('ask_btw')
setSubChatDraft(isPt? `Explique o que você encontrou ou alterou no arquivo \`${leaf}\`.`
: `Explain what you found or changed in \`${leaf}\`.`)
haptic?.('tap')}},'💬 /btw')],fp)}))]),divs({cls:'btw-ask-box',style:{minHeight:'auto'}},[
divs('flex flex-wrap items-center justify-between gap-1.5 px-3 pt-2',[divs('flex items-center gap-1',[hBtn('btw-action-mode-pill',{'data-active':subChatMode==='ask_btw'?'true':'false',onClick:()=>setSubChatMode('ask_btw')},isPt?'💬 Chat /btw':'💬 /btw Chat'),hBtn('btw-action-mode-pill',{'data-active':subChatMode==='steer_bot'?'true':'false',onClick:()=>setSubChatMode('steer_bot')},selectedSub.status==='running'?isPt?'⚡ Steer ao Vivo':'⚡ Live Steer':isPt?'🚀 Continuar / Relançar'
:'🚀 Continue / Relaunch')]),divs(CLS.rowWrap1,[jsx(ComposerModelPicker,{
compact:true,providerValue:subBackendCfg.fast_provider||'',
modelValue:subBackendCfg.fast_model||'',onSelect:({provider,model,base_url})=>{
const cfgCur=$backendSettings.get()||{}
const patch={fast_provider:provider||'',fast_model:model||''}
if(base_url&&!cfgCur.fast_base_url)patch.fast_base_url=base_url
syncBackendSettings(patch)}}),hBtn('btw-token-chip btw-tx-95',{onClick:()=>{
setSubChatMode('ask_btw')
setSubChatDraft(isPt?'Resuma seus principais achados, arquivos analisados e conclusões.'
:'Summarize your main findings, analyzed files, and conclusions.')}},isPt?'📋 Resumir':'📋 Summarize'),hBtn('btw-token-chip btw-tx-95',{onClick:()=>{setSubChatMode('ask_btw')
setSubChatDraft(isPt?'Quais foram os pontos críticos ou bloqueadores encontrados?'
:'What were the critical findings or blockers encountered?')}},isPt?'🔍 Pontos críticos':'🔍 Key findings')])]),
divs('flex items-center gap-2 px-3 py-2',[h('input',{type:'text',cls:'btw-preset-input flex-1 btw-tx-12',placeholder:subChatMode==='steer_bot'?selectedSub.status==='running'?isPt
? `Envie um comando Steer ao vivo para ${selectedSub.short_title} (Enter envia)…`
: `Send a live Steer instruction to ${selectedSub.short_title} (Enter sends)…` :isPt
? `Relance ${selectedSub.short_title} com uma nova missão continuando o trabalho (Enter envia)…`
: `Relaunch ${selectedSub.short_title} with a follow-up mission (Enter sends)…` :isPt
? `Pergunte qualquer coisa sobre o trabalho de ${selectedSub.short_title} (Enter envia)…`
: `Ask anything about ${selectedSub.short_title}'s work (Enter sends)…`,value:subChatDraft,onChange:e=>setSubChatDraft(e.target.value),onKeyDown:e=>{if(isSubmitEnter(e)){e.preventDefault()
void submitSubagentChat(selectedSub)}}}),hBtn('btw-mic-btn',{'data-state':subDictationTarget==='subagent'?subDictationStatus:'idle',disabled:subDictationStatus==='transcribing',title:
subDictationStatus==='recording'&&subDictationTarget==='subagent'?isPt?'Parar e transcrever ditado'
:'Stop & transcribe dictation':isPt?'Ditar por voz para o subagente (STT)':'Voice dictate to subagent (STT)',onClick:()=>toggleBtwDictation('subagent',subChatDraft,setSubChatDraft)},subDictationStatus==='transcribing'&&subDictationTarget==='subagent'?jsx(GlyphSpinner,{spinner:'braille'}):codicon(subDictationStatus==='recording'&&subDictationTarget==='subagent'?'debug-stop':'unmute','0.78rem')),
uiBtn('default','xs',{disabled:!subChatDraft.trim()||subChatSending||Boolean(subPending),onClick:()=>void submitSubagentChat(selectedSub)},subChatSending||subPending?jsx(GlyphSpinner,{spinner:'braille'})
:subChatMode==='steer_bot'?selectedSub.status==='running'? `⚡ ${strings.steerBtnLabel}` :'🚀 Relaunch':isPt?'Enviar ↵'
:'Send ↵')]),subDictationStatus!=='idle'&&subDictationTarget==='subagent'&&divs('btw-dictation-strip mx-3 mb-2',[divs(CLS.rowMin0,[
subDictationStatus==='recording'?jsx(BtwVoiceWaveform,{active:true}):jsx(GlyphSpinner,{spinner:'braille'}),span('font-mono btw-tx-10 font-semibold btw-ac shrink-0',subDictationStatus==='recording'
? `🎙 ${Math.floor(subDictationElapsed / 60)}:${String(subDictationElapsed % 60).padStart(2,'0')}` :isPt?'Transcrevendo STT…'
:'Transcribing STT…'),subDictationPartial&&span('truncate btw-tx-105 italic btw-ts',subDictationPartial)]),divs(CLS.rowShrink1,[
subDictationStatus==='recording'&&hBtn('btw-action-mode-pill',{onClick:()=>stopBtwDictation(false)},isPt?'✓ Concluir':'✓ Done'),hBtn('rounded p-0.5 btw-tt hover:text-destructive cursor-pointer bg-transparent border-0',{onClick:()=>stopBtwDictation(true)},codicon('close','0.72rem'))])]),
(subChatSending||subPending)&&divs('flex flex-col gap-1 px-3 pb-2.5',[
div('btw-specialist-scan-bar'),div('btw-tx-105 btw-ac',isPt
? `⏳ Consultando contexto completo de ${selectedSub.short_title} via /btw…`
: `⏳ Querying ${selectedSub.short_title}'s full context via /btw…`)])]),subEntries.length>0&&divs(CLS.col15,subEntries.slice(-6).reverse().map((entry,idx)=>jsx(QaCard,{entry,sessionScope:{
...scope,key:selectedSub.id,storedId:selectedSub.id,runtimeId:selectedSub.id,
parentRuntimeId:parentRuntimeId||scope.runtimeId||'',parentStoredId:parentStoredId||scope.storedId||'',
isSubagentInspect:true,subagentTitle:selectedSub.short_title},latest:idx===0,availableSubagents:mergedList,
onCloseSurface:onClose},entry.id)))])
})()])}
function StudioSurfaceBody({scope,inDialog=false,onClose}){
const tab=useValue($activeTab)
const draft=useValue($draftQuestion)
const askMode=useValue($askMode)
const lang=useValue($lang)
const wide=useValue($popoverWide)
const demoMode=useValue($demoShowcase)
const settingsMode=useValue($settingsMode)
const isBasicMode=settingsMode==='basic'
const pendingMap=useValue($pendingBySession)
const entriesMap=useValue($entriesBySession)
const pulseMap=useValue($livePulseBySession)
const intercept=useValue($interceptSlashBtw)
const[search,setSearch]=useState('')
const inputRef=useRef(null)
const strings=I18N[lang]||I18N.en
const pending=pendingMap[scope.key]||null
const elapsedPending=useElapsedSeconds(pending?.startedAt,Boolean(pending))
const pulse=pulseMap[scope.key]||null
const entries=useMemo(()=>{
const rawList=entriesMap?.[scope.key]
const list=Array.isArray(rawList)?rawList.filter(item=>item&&
!/^(Produce an Executive Deep Overview|Produza um Overview Profundo Executivo|Reescreva e otimize|Targeted rewrite and optimize)/i.test(
String(item.question||'').trim())):[]
const effectiveList=demoMode?DEMO_QA_CARDS:list
const nowSec=Date.now()/ 1000
return[...effectiveList].sort((a,b)=>{
const aFresh=nowSec - Number(a.created_at||0)<45
const bFresh=nowSec - Number(b.created_at||0)<45
if(aFresh!==bFresh)return aFresh?-1:1
if(Boolean(a.pinned)!==Boolean(b.pinned))return a.pinned?-1:1
return(b.created_at||0)-(a.created_at||0)})
},[entriesMap,scope.key,demoMode])
const radarQuery=useSessionRadar(scope,true)
const snap=demoMode?DEMO_SNAPSHOT:radarQuery.data
useEffect(()=>{if(tab==='ask'){
const cancel=scheduleTimer(()=>inputRef.current?.focus?.(),40)
return cancel}
return undefined
},[tab])
const submitQuestion=useCallback((textToAsk,presetId='')=>{
const q=String(textToAsk??$draftQuestion.get()).trim()
const atts=$btwAttachments.get()||[]
const pTools=$pinnedBtwTools.get()||[]
if((!q&&atts.length===0)||Boolean($pendingBySession.get()[scope.key]))return
$draftQuestion.set('')
$composerStagedNotice.set(null)
void dispatchSideQuestion(q,scope,$askMode.get(),{presetId,attachments:[...atts],forcedTools:[...pTools]})},[scope])
const btwAttachments=useValue($btwAttachments)
const pinnedTools=useValue($pinnedBtwTools)
const togglePinnedTool=useCallback(tName=>{
const cur=Array.isArray($pinnedBtwTools.get())?$pinnedBtwTools.get():[]
const exists=cur.includes(tName)
const next=exists?cur.filter(x=>x!==tName):[...cur,tName]
setPref($pinnedBtwTools,next,'pinnedTools')
if(!exists&&(tName==='web_search'||tName==='web_extract'||tName==='browser_exec')&&!$allowWebSearch.get()){
 setPref($allowWebSearch,true,'allowWebSearch')
 syncBackendSettings({allow_web_search:true})
}
if(!exists&&(tName==='image_generate'||tName==='video_generate'||tName==='text_to_speech'||tName==='vision_analyze'||tName==='video_analyze')&&!$allowMediaTools.get()){
 setPref($allowMediaTools,true,'allowMediaTools')
 syncBackendSettings({allow_media_tools:true})
}
haptic?.('tap')
scheduleTimer(()=>inputRef.current?.focus?.(),15)},[])
const activePresetsList=useValue($activePresets)
const composerActionMode=useValue($composerActionMode)
const allowWebSearch=useValue($allowWebSearch)
const allowMediaTools=useValue($allowMediaTools)
const dictationStatus=useValue($dictationStatus)
const dictationPartial=useValue($dictationPartial)
const dictationElapsed=useValue($dictationElapsed)
const wakeWordEnabled=useValue($wakeWordEnabled)
const wakePhraseVal=useValue($wakePhrase)
const wakeTargetMode=useValue($wakeTargetMode)
const liveVoiceActive=useValue($liveVoiceActive)
const liveVoicePhase=useValue($liveVoicePhase)
const liveVoiceStatusText=useValue($liveVoiceStatusText)
const liveVoiceReply=useValue($liveVoiceReply)
const stagedNotice=useValue($composerStagedNotice)
const[expandedPasteId,setExpandedPasteId]=useState('')
const[plusOpenSec,setPlusOpenSec]=useState('')
const[isDraggingFile,setIsDraggingFile]=useState(false)
const[synthesizingComposer,setSynthesizingComposer]=useState(false)
const dragDepthRef=useRef(0)
const fileInputRef=useRef(null)
const imageInputRef=useRef(null)
const attachedBtwCard=useMemo(()=>btwAttachments.find(a=>a.kind==='btw_card')||null,[btwAttachments])
const synthesizeForComposer=useCallback(async(modeOverride='')=>{
const effMode=modeOverride||$composerActionMode.get()||'steer_main'
const card=($btwAttachments.get()||[]).find(a=>a.kind==='btw_card')||$followUpParent.get()
const userDraft=String($draftQuestion.get()||'').trim()
const targetType=effMode==='spawn_subagent'?'spawn_subagent':'main'
const sid=scope.storedId||scope.runtimeId||''
const mode=$askMode.get()||'fast'
setSynthesizingComposer(true)
let cmd=''
try{
 const cardTitleTxt=card?.label||card?.title||deriveBtwCardTitle(card)
 const cardAnsTxt=String(card?.answer||'').slice(0,1400)
 if(typeof host?.request==='function'&&sid){
 try{
 const oneshot=await host.request('llm.oneshot',{
 session_id:sid,
 instructions:lang==='pt'
? `Sintetize APENAS o comando cirúrgico final (2 a 5 frases/bullets objetivos, sem preâmbulo) para enviar ao ${targetType==='spawn_subagent'?'Subagente (delegate_task)':'Agente Principal'}.`
: `Synthesize ONLY the final targeted directive (2-5 concise bullets/sentences, no preamble) for the ${targetType==='spawn_subagent'?'Subagent (delegate_task)':'Main Agent'}.`,
 input: `Card: ${cardTitleTxt}\nDraft: ${userDraft||'Auto high-leverage next action'}\nContext:\n${cardAnsTxt}`,
 max_tokens:320,
 temperature:0.2,
})
 cmd=extractOneshotText(oneshot)
}catch{cmd=''}
}
 if(!cmd&&_rest){
 try{
 const res=await _rest('/steer/synth',{
 method:'POST',
 body:{session_id:sid,instruction:userDraft||'__AUTO__',card_question:card?.question||'',card_answer:card?.answer||'',target_type:targetType,mode},
 timeoutMs:28000,
})
 if(res?.ok&&res.command)cmd=String(res.command).trim()
}catch{cmd=''}
}
}finally{setSynthesizingComposer(false)}
if(!cmd){
const title=card?.label||card?.title||deriveBtwCardTitle(card)
const snippet=String(card?.answer||'').slice(0,340).replace(/\s+/g,' ').trim()
cmd=targetType==='spawn_subagent'
? `${userDraft? `${userDraft} — ` :''}Execute isolated verification and fix for "${title}". Context from /btw: ${snippet}`
: `${userDraft? `${userDraft}\n\n` :'Apply the safest next action from /btw diagnosis: '}[/btw: ${title}] ${snippet}`}
$draftQuestion.set(cmd)
stageCommandInBtwChat(cmd,{label:lang==='pt'?'✦ Meta-Prompt sintetizado e carregado no chat'
:'✦ Meta-Prompt synthesized & staged in chat',source:'synth',icon:'sparkle',switchToAsk:false})
scheduleTimer(()=>inputRef.current?.focus?.(),15)
haptic?.('success')
return cmd},[scope.storedId,scope.runtimeId,scope.key,lang])
const executeComposerAction=useCallback(async()=>{
const card=($btwAttachments.get()||[]).find(a=>a.kind==='btw_card')
const effMode=card?$composerActionMode.get():'ask_btw'
if(effMode==='ask_btw'||!card){submitQuestion()
return}
let cmd=String($draftQuestion.get()||'').trim()
if(!cmd){cmd=await synthesizeForComposer(effMode)}
if(!cmd)return
const cardIdToRestore=card.id
if(effMode==='spawn_subagent'){
const parentSid=scope.parentStoredId||scope.storedId||scope.parentRuntimeId||scope.runtimeId||'active'
if((_rest||typeof host?.request==='function')&&parentSid){try{
const res=await launchSubagentViaRest({goal:cmd,context:card.content|| `From /btw (${card.label}): ${card.answer||''}`,
sessionId:parentSid,parentSessionId:parentSid})
if(res?.ok){
if(card.entry_id){setPref($steeredByCardId,{...$steeredByCardId.get(),[card.entry_id]:{target:'subagent',command:cmd,ts:Date.now()/ 1000}},'steeredByCardId')}
$draftQuestion.set('');removeBtwAttachment(cardIdToRestore);$followUpParent.set(null);$composerActionMode.set('ask_btw')
return}
}catch{}}
const spawnSteer= `Please spawn an isolated subagent via \`delegate_task\` with this goal:\n\n${cmd}\n\nContext from /btw (${card.label}):\n${String(card.answer||'').slice(0,800)}`
const okSpawn=await steerActiveSession(spawnSteer,scope,onClose,{source:'btw_attached_spawn',entryId:card.entry_id||'',
presetId:card.preset_id||'',targetKind:(card.anomaly_kinds||[])[0]||''})
if(okSpawn){
if(card.entry_id){setPref($steeredByCardId,{...$steeredByCardId.get(),[card.entry_id]:{target:'subagent',command:cmd,ts:Date.now()/ 1000}},'steeredByCardId')}
$draftQuestion.set('');removeBtwAttachment(cardIdToRestore);$followUpParent.set(null);$composerActionMode.set('ask_btw')}
return}
const okSteer=await steerActiveSession(cmd,scope,onClose,{source:'btw_attached_steer',entryId:card.entry_id||'',
presetId:card.preset_id||'',targetKind:(card.anomaly_kinds||[])[0]||''})
if(okSteer){
if(card.entry_id){setPref($steeredByCardId,{...$steeredByCardId.get(),[card.entry_id]:{target:'main',command:cmd,ts:Date.now()/ 1000}},'steeredByCardId')}
$draftQuestion.set('');removeBtwAttachment(cardIdToRestore);$followUpParent.set(null);$composerActionMode.set('ask_btw')}
},[scope,onClose,submitQuestion,synthesizeForComposer,strings])
useEffect(()=>{
const el=inputRef.current
if(!el)return
el.style.height='auto'
const minH=60
const maxH=220
el.style.height= `${Math.min(maxH,Math.max(minH,el.scrollHeight))}px`
},[draft,tab,isBasicMode])
const sessionsMentionQ=useQuery({queryKey:[ID,'sessions-mention'],enabled:Boolean(_rest&&tab==='ask'),
queryFn:async()=>(await _rest('/sessions?limit=20',{timeoutMs:8000}))?.sessions||[],staleTime:15000})
const recentSessionsList=Array.isArray(sessionsMentionQ.data)?sessionsMentionQ.data.filter(Boolean):[]
const followUp=useValue($followUpParent)
const draftPreview=useResolvedPreview(draft,scope.storedId||scope.runtimeId,tab==='ask')
const toggleIntercept=()=>{
const next=!$interceptSlashBtw.get()
$interceptSlashBtw.set(next)
savePrefs({interceptSlashBtw:next})}
const refineDraftWithJit=useCallback(async()=>{
if(synthesizingComposer)return
const sid=scope.storedId||scope.runtimeId||'latest'
const userDraft=String($draftQuestion.get()||'').trim()
const mode=$askMode.get()||'fast'
setSynthesizingComposer(true)
try{
let res=null
if(typeof host?.request==='function'){try{res=await host.request(`plugin.${ID}.refine_prompt`,{session_id:sid,draft_prompt:userDraft,mode,lang})}catch{res=null}}
if(!res?.ok&&_rest){try{res=await _rest('/presets/recommend',{method:'POST',body:{session_id:sid,draft_prompt:userDraft,refine:true,mode,lang},timeoutMs:22000})}catch{res=null}}
const refined=String(res?.refined_prompt||res?.text||'').trim()
if(refined){
$draftQuestion.set(refined)
stageCommandInBtwChat(refined,{label:lang==='pt'?'✦ Prompt refinado com telemetria ao vivo (JIT)':'✦ Prompt refined with live telemetry (JIT)',source:'jit_refiner',icon:'sparkle',switchToAsk:false})
scheduleTimer(()=>inputRef.current?.focus?.(),15)
haptic?.('success')
}
}finally{setSynthesizingComposer(false)}
},[synthesizingComposer,scope.storedId,scope.runtimeId,lang])
const clearUnpinned=async()=>{
const map=$entriesBySession.get()
const kept=(map[scope.key]||[]).filter(x=>x.pinned)
const nextMap={...map,[scope.key]:kept}
$entriesBySession.set(nextMap)
persistLocalEntries(nextMap)
if(_rest&&(scope.storedId||scope.runtimeId)){try{await _rest('/clear',{method:'POST',
body:{session_id:scope.storedId||scope.runtimeId,id:'__all__'}})
}catch{}}}
const filteredEntries=useMemo(()=>{
const q=search.trim().toLowerCase()
if(!q)return entries
return entries.filter(e=>deriveBtwCardTitle(e).toLowerCase().includes(q)||String(e.question||'').toLowerCase().includes(q)||
String(e.answer||'').toLowerCase().includes(q))
},[entries,search])
const activeTool=pulse?.active_tool||snap?.live?.active_tool||''
const pinned=useValue($pinned)
const hudOpen=useValue($hudOpen)
const personality=useValue($personality)
const spatialMode=useValue($spatialMode)
const petBubblesMap=useValue($petBubblesBySession)
const showSettings=useValue($inlineSettingsOpen)
const setShowSettings=val=>{
const next=typeof val==='function'?val($inlineSettingsOpen.get()):Boolean(val)
if(next)$inlineMascotDrawerOpen.set(false)
$inlineSettingsOpen.set(next)}
const showMascotDrawer=useValue($inlineMascotDrawerOpen)
const setShowMascotDrawer=val=>{
const next=typeof val==='function'?val($inlineMascotDrawerOpen.get()):Boolean(val)
if(next)$inlineSettingsOpen.set(false)
$inlineMascotDrawerOpen.set(next)}
const setGlobalUiMode=nextMode=>{setPref($settingsMode,nextMode,'settingsMode')
if(nextMode==='basic'&&!['ask','radar','mesh','history','cards','subagents','learn'].includes(tab)){$activeTab.set('ask')}
haptic?.('tap')}
const themeProps=useThemeProps()
const errStreak=Number(pulse?.consecutive_errors||snap?.live?.consecutive_errors||0)
const hasHighAnomalies=Array.isArray(snap?.anomalies)&&snap.anomalies.some(a=>a?.severity==='high')
const hasMedAnomalies=Array.isArray(snap?.anomalies)&&snap.anomalies.some(a=>a?.severity==='medium')
const hasAnomalies=Array.isArray(snap?.anomalies)&&snap.anomalies.length>0
const activeUnresolvedErrors=Array.isArray(snap?.recent_errors)?snap.recent_errors.filter(e=>e&&!e.resolved):[]
const ctxOccPct=Math.min(100,Math.max(0,Number(snap?.context_window?.occupancy_pct||0)))
const safeTodos=Array.isArray(snap?.todos)?snap.todos.filter(Boolean):[]
const doneTodos=safeTodos.filter(t=>t?.status==='completed').length
const totalTodos=safeTodos.length
const hasActiveWorkflowAlert=hasAnomalies||activeUnresolvedErrors.length>0||errStreak>=2||ctxOccPct>=82
const overviewAlertLevel=errStreak>=2||hasHighAnomalies||activeUnresolvedErrors.length>=2||ctxOccPct>=90?'high'
:activeUnresolvedErrors.length===1||hasMedAnomalies||ctxOccPct>=80?'medium':hasAnomalies||ctxOccPct>=70?'low'
:'none'
const companionMood=errStreak>=2||hasHighAnomalies?'alert':scope.busy?'work':'calm'
const companionMoodGlyph={neurodivergent:companionMood==='alert'?'⚡ ALERT':companionMood==='work'?'⚡ WORK':'⚡ SYNC',
anxious:companionMood==='alert'?'😰 LOOP!':companionMood==='work'?'😰 WATCH':'🛡 SAFE',
technical:companionMood==='alert'?'⚙ WARN':companionMood==='work'?'⚙ EXEC':'⚙ D0:OK',
kawaii:companionMood==='alert'?'(>_<) OOPS':companionMood==='work'?'✨ GO!':'(｡•̀ᴗ-)✧ CUTE',
harness_rsi:companionMood==='alert'?'🔄 Δτ!':companionMood==='work'?'🔄 PROBE':'🔄 RSI',
custom:companionMood==='alert'?'🎭 ALERT':companionMood==='work'?'🎭 WORK':'🎭 READY'
}[personality]||'⚡ SYNC'
const isUnstarted=isSessionUnstarted(snap,scope,demoMode,entries.length,Boolean(pending))
const surfBackendCfg=useValue($backendSettings)||{}
const surfTtsVoice=useValue($ttsVoice)||'coral'
const splitEligibleTab=(tab==='ask'||tab==='subagents'||tab==='history'||tab==='cards')
const isSplitCockpit=
!isBasicMode&&
!isUnstarted&&splitEligibleTab&&((spatialMode==='split'&&(inDialog||wide))||
(spatialMode==='auto'&&inDialog))
const latestPetBubble=(petBubblesMap[scope.key]||[])[0]||null
const availableSubagents=demoMode?DEMO_SUBAGENTS:(Array.isArray(snap?.subagents)?snap.subagents:[])
const cleanedSessionTitle=String(snap?.title||'').replace(/`+/g,'').replace(/^@session:[^\s]+\s*/i,'').replace(/\s+/g,' ').trim()
const hasRealSessionTitle=Boolean(cleanedSessionTitle&&!/^(untitled(\s+session)?|nova\s+sess[aã]o|sem\s+t[ií]tulo)$/i.test(cleanedSessionTitle))
const cleanSubagentsTabLabel=isUnstarted&&availableSubagents.length===0?lang==='pt'?'Subagentes':'Subagents'
:strings.tabSubagents(availableSubagents.length)
const cleanCardsTabLabel=isUnstarted&&entries.length===0?'Cards':strings.tabCards(entries.length)
const targetMeshSid=scope.storedId||scope.runtimeId||''
const meshBadgeQuery=useQuery({queryKey:[ID,'session-mesh',scope.profile,targetMeshSid],enabled:Boolean(_rest&&targetMeshSid&&!isUnstarted&&!demoMode),
queryFn:()=>_rest(`/sessions/mesh?session_id=${encodeURIComponent(targetMeshSid)}&use_llm=false&lang=${lang}`,{timeoutMs:8000}),
staleTime:5000,refetchInterval:8000,retry:1})
const meshSummary=demoMode?DEMO_SESSION_MESH:(meshBadgeQuery.data||{})
const meshRelCount=Array.isArray(meshSummary.related_sessions)?meshSummary.related_sessions.length:0
const meshHighRisk=Number(meshSummary.high_risk_count||0)
const meshMedRisk=Number(meshSummary.medium_risk_count||0)
const meshActiveParallel=Number(meshSummary.active_parallel_count||0)
const meshAlertLevel=meshHighRisk>0?'high':meshActiveParallel>0?'medium':'none'
const cleanMeshTabLabel=strings.tabMesh?strings.tabMesh(meshActiveParallel):lang==='pt'
? `Malha${meshActiveParallel>0? ` (${meshActiveParallel})` :''}` : `Mesh${meshActiveParallel>0? ` (${meshActiveParallel})` :''}`
const navOptions=isBasicMode?[{id:'ask',label:strings.tabAsk,alertLevel:'none'},{id:'radar',
label:strings.tabBasicOverview,alertLevel:overviewAlertLevel,tip:overviewAlertLevel==='high'?strings.overviewAlertHighTip
:overviewAlertLevel==='medium'?strings.overviewAlertMedTip:overviewAlertLevel==='low'?strings.overviewAlertLowTip:''},
...(meshActiveParallel>0||meshHighRisk>0||demoMode||tab==='mesh'?[{id:'mesh',label:cleanMeshTabLabel,
alertLevel:meshAlertLevel,tip:lang==='pt'?'Malha de Sessões & Subagentes Ativos (Prevenção de Conflitos de Escrita e Git)'
:'Active Session & Subagent Mesh (Write & Git Conflict Prevention)'}]:[]),
...(availableSubagents.length>0||demoMode||tab==='subagents'
?[{id:'subagents',label:cleanSubagentsTabLabel,alertLevel:'none'}]:[]),
...(entries.length>3||tab==='history'||tab==='cards'?[{id:'history',label:cleanCardsTabLabel,alertLevel:'none'}]
:[]),...(isUnstarted||tab==='learn'?[{id:'learn',label:strings.tabLearn,alertLevel:'none'}]:[])]:[
{id:'ask',label:strings.tabAsk,alertLevel:'none'},{id:'radar',label:strings.tabRadar,alertLevel:overviewAlertLevel},{
id:'mesh',label:cleanMeshTabLabel,alertLevel:meshAlertLevel,tip:lang==='pt'
?'Malha de Sessões Paralelas & Mitigação de Conflitos (Arquivos, Linhas e Subagentes)'
:'Parallel Session Mesh & Conflict Mitigation (Files, Lines & Subagents)'},
{id:'subagents',label:cleanSubagentsTabLabel,alertLevel:'none'},
{id:'history',label:cleanCardsTabLabel,alertLevel:'none'},{id:'learn',label:strings.tabLearn,alertLevel:'none'}]
return divs({cls:'flex min-h-0 flex-1 flex-col',onDragEnterCapture:e=>{
const types=Array.from(e.dataTransfer?.types||[])
if(!types.includes('Files'))return
e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
dragDepthRef.current +=1
setIsDraggingFile(true)
if(showSettings)setShowSettings(false)
if(tab!=='ask')$activeTab.set('ask')},onDragOverCapture:e=>{
const types=Array.from(e.dataTransfer?.types||[])
if(!types.includes('Files'))return
e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
if(e.dataTransfer)e.dataTransfer.dropEffect='copy'
if(!isDraggingFile)setIsDraggingFile(true)},onDragLeaveCapture:e=>{
const types=Array.from(e.dataTransfer?.types||[])
if(!types.includes('Files'))return
e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
dragDepthRef.current=Math.max(0,dragDepthRef.current - 1)
if(dragDepthRef.current===0)setIsDraggingFile(false)},onDropCapture:async e=>{
const files=Array.from(e.dataTransfer?.files||[])
dragDepthRef.current=0
setIsDraggingFile(false)
if(!files.length)return
e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
if(tab!=='ask')$activeTab.set('ask')
await handleDroppedFiles(files,6)
scheduleTimer(()=>inputRef.current?.focus?.(),20)
haptic?.('tap')}},[divs({cls:cn('btw-studio-head',isDraggingFile&&'btw-drag-dimmed')},[
divs('btw-studio-head-top',[divs(CLS.rowMin0,[
jsx(BtwBrandIcon,{size:17,alert:overviewAlertLevel==='high'}),
span('btw-brand shrink-0 leading-none','BTW Studio'),
spans('inline-flex shrink-0 items-center gap-1.5 rounded-full border btw-bd-st55 btw-bg-tp3 px-2 py-0.5 btw-tx-10 font-medium leading-none btw-ts',[isUnstarted&&typeof SessionStatusDot==='function'?jsx(SessionStatusDot,{storedSessionId:null})
:jsx(StatusDot,{tone:scope.busy?'warn':'good',className:scope.busy?'animate-pulse':''}),span('truncate max-w-28',scope.busy?activeTool?activeTool:strings.statusRunning:isUnstarted
?strings.waitingToStartBadge:strings.statusReady)]),
hasRealSessionTitle&&spans({cls:'min-w-0 inline-flex items-center gap-1.5 truncate btw-tx-115 font-normal btw-ts',title: `${cleanedSessionTitle} · ${scope.profile}`},[span('opacity-40 shrink-0','·'),span('truncate',cleanedSessionTitle)]),
(!isBasicMode&&companionMood==='alert')&&
!isUnstarted&&hBtn('btw-companion-mood-pill shrink-0',{'data-mood':companionMood,title:strings.companionMoodTip,onClick:()=>{haptic?.('tap')
const next=!showMascotDrawer
setShowMascotDrawer(next)
if(next)void speakTelemetry(scope.storedId||scope.runtimeId||'active','error_loop')}},companionMoodGlyph)]),divs(CLS.rowShrink1,[divs({cls:'btw-head-mode-pill mr-0.5',role:'radiogroup','aria-label':'UI experience mode'},[hBtn('btw-head-mode-btn',{role:'radio','aria-checked':isBasicMode?'true':'false',tabIndex:isBasicMode?0:-1,'data-active':isBasicMode?'true':'false',title:strings.uiModeMinimalTip,onKeyDown:rovingKeyDown(['basic','advanced'],0,setGlobalUiMode),onClick:()=>setGlobalUiMode('basic')},strings.uiModeMinimal),hBtn('btw-head-mode-btn',{role:'radio','aria-checked':!isBasicMode?'true':'false',tabIndex:!isBasicMode?0:-1,'data-active':!isBasicMode?'true':'false',title:strings.uiModeTelemetricTip,onKeyDown:rovingKeyDown(['basic','advanced'],1,setGlobalUiMode),onClick:()=>setGlobalUiMode('advanced')},strings.uiModeTelemetric)]),
tip(strings.demoBtnTip,hBtn('btw-head-demo-btn',{'data-active':demoMode?'true':'false',title:strings.demoBtnTip,onClick:()=>{$demoShowcase.set(!demoMode)
haptic?.('tap')}},strings.demoBtnShort)),!showSettings&&
!isBasicMode&&
!isUnstarted&&(inDialog||wide)&&tip(`${strings.spatialLayoutLabel}: ${strings.spatialNames?.[spatialMode]||spatialMode}`,uiBtn('ghost','icon-xs',{'aria-label':strings.spatialLayoutLabel,cls:isSplitCockpit?CLS.accent:'',onClick:()=>{
const next=spatialMode==='split'?'single':'split'
setPref($spatialMode,next,'spatialMode')
haptic?.('tap')}},codicon('split-horizontal','0.8rem'))),!isUnstarted&&tip(strings.viewMenuHud,uiBtn('ghost','icon-xs',{'aria-label':strings.viewMenuHud,onClick:()=>{
const next=!showMascotDrawer
setShowMascotDrawer(next)
if(next)void speakTelemetry(scope.storedId||scope.runtimeId||'active','auto')
haptic?.('tap')},cls:showMascotDrawer||hudOpen?CLS.accent:''},codicon('hubot','0.8rem'))),tip(strings.settingsTip,uiBtn('ghost','icon-xs',{'aria-label':strings.settingsTip,onClick:()=>setShowSettings(v=>!v),cls:showSettings?'btw-ac btw-bg-ac15 ring-1 ring-(--ui-accent)/40':''},codicon('settings-gear','0.8rem'))),
!isBasicMode&&
jsxs(DropdownMenu,{children:[jsx(DropdownMenuTrigger,{asChild:true,children:uiBtn('ghost','icon-xs',{title:strings.viewMenuLabel,'aria-label':strings.viewMenuLabel,cls:pinned||hudOpen||wide?CLS.accent:''},codicon('layout','0.8rem'))}),
jsxs(DropdownMenuContent,{align:'end','data-btw-portal':'','data-btw-theme':themeProps['data-btw-theme'],style:themeProps.style,children:[!inDialog&&jsx(DropdownMenuItem,{onSelect:()=>setPref($popoverWide,!wide,'popoverWide'),
children:spans(CLS.inline2Xs,[
codicon(wide?'fold':'unfold','0.78rem',CLS.accent),
wide?strings.viewMenuCompact:strings.viewMenuWide])}),!inDialog&&jsx(DropdownMenuItem,{onSelect:()=>{onClose?.()
scheduleTimer(()=>$dialogOpen.set(true),16)},children:spans(CLS.inline2Xs,[
codicon('screen-full','0.78rem',CLS.accent),strings.viewMenuModal])}),
jsx(DropdownMenuItem,{onSelect:()=>toggleCompanionChat(),children:spans(CLS.inline2Xs,[
codicon('hubot','0.78rem',CLS.accent),strings.viewMenuHud])}),
!inDialog&&jsx(DropdownMenuSeparator,{}),!inDialog&&jsx(DropdownMenuItem,{onSelect:()=>setPref($pinned,!pinned,'pinned'),
children:spans(CLS.inline2Xs,[
codicon(pinned?'pinned':'pin','0.78rem',CLS.accent),strings.viewMenuPin(pinned)])})]
})]}),tip(strings.tipClose,uiBtn('ghost','icon-xs',{'aria-label':strings.tipClose,onClick:onClose},codicon('close','0.8rem')))])]),divs({cls:'btw-studio-nav-bar',role:'tablist','aria-label':'BTW Studio navigation'},[divs('btw-nav-tabs',[...navOptions.map((opt,navIdx)=>{
const activeId=tab==='compare'?'radar':tab
const isActive=!showSettings&&activeId===opt.id
const lvl=opt.alertLevel||'none'
const showDot=lvl==='high'||lvl==='medium'
const selectNav=id=>{if(showSettings)setShowSettings(false);$activeTab.set(id);haptic?.('tap')}
return hsBtn('btw-nav-tab',{role:'tab',tabIndex:isActive?0:-1,'aria-selected':isActive?'true':'false','data-active':isActive?'true':'false','data-alert-level':lvl,title:opt.tip||undefined,onClick:()=>selectNav(opt.id),onKeyDown:rovingKeyDown(navOptions.map(o=>o.id),navIdx,selectNav)},[showDot&&span({cls:cn('btw-nav-alert-dot',lvl==='high'&&'animate-pulse'),'data-level':lvl}),span(null,opt.label)],opt.id)}),showSettings&&hsBtn('btw-nav-tab',{role:'tab',tabIndex:0,'aria-selected':'true','data-active':'true',title:lang==='pt'?'Fechar Configurações e voltar para a aba':'Close Settings and return to tab',onClick:()=>{setShowSettings(false)
haptic?.('tap')}},[codicon('settings-gear','0.72rem',CLS.accent),
span(null,lang==='pt'?'Configurações':'Settings'),
codicon('close','0.68rem','opacity-70 ml-0.5')],'__settings_active__')]),!showSettings&&snap?.found&&
!isBasicMode&&
!isUnstarted&&divs('btw-studio-live-bar shrink-0',[
snap.health&&hBtn(cn('btw-health-pill inline-flex items-baseline gap-1 rounded px-1.5 py-0.5 font-mono btw-tx-10 leading-none font-semibold border cursor-pointer bg-transparent',
snap.health.state==='act'?'border-rose-500/45 text-rose-400':snap.health.state==='watch'?'border-amber-500/40 text-amber-300':'border-emerald-500/35 text-emerald-400'),{onClick:()=>{$activeTab.set('radar');haptic?.('tap')},'data-health-state':snap.health.state||'calm',title: `${strings.healthLabel} ${snap.health.score??100}/100 · ${strings.flightNames?.[snap.health.state]||'Calm'}`},[`${snap.health.score??100}`,span('btw-tx-9 uppercase',strings.flightNames?.[snap.health.state]||'OK')]),
hsBtn('inline-flex items-center gap-1 bg-transparent border-0 p-0 text-inherit cursor-pointer btw-hv-ac',{onClick:()=>{$activeTab.set('radar');haptic?.('tap')}},[h('strong','btw-ts font-semibold',String(snap.counts?.tool_calls||0)), ` ${strings.liveToolsUnit}`]),
span('opacity-25','·'),
hsBtn('inline-flex items-center gap-1 bg-transparent border-0 p-0 text-inherit cursor-pointer btw-hv-ac',{onClick:()=>{$activeTab.set('compare');haptic?.('tap')},title: `${strings.liveCachePrefix}${snap.tokens?.cache_hit_pct??0}%`},[h('strong','btw-ac font-semibold',`${snap.tokens?.cache_hit_pct??0}%`),span('btw-tx-10 opacity-85','cache')]),
span('btw-wide-only opacity-25','·'),
span('btw-wide-only font-mono btw-tx-10 btw-tq',fmtDurationSec(snap.elapsed_seconds))])])]),!showSettings&&
showMascotDrawer&&!isUnstarted&&div('border-b btw-bd max-h-[268px] overflow-hidden flex flex-col shrink-0',jsx(MascotHud,{inline:true,onCloseInline:()=>setShowMascotDrawer(false)})),
divs('btw-studio-scroll',[showSettings
? jsx(BtwSettingsPanel,{
scope,compact:false,onClose:()=>setShowSettings(false)}):divs({cls:'btw-spatial-cockpit','data-spatial':isSplitCockpit?'split':'single'},[divs('btw-main-pane flex min-w-0 flex-col gap-3',[
tab==='ask'&&(isUnstarted?jsx(WaitingToStartSessionHero,{scope,variant:'ask',onOpenSettings:()=>setShowSettings(v=>!v)})
:divs('flex flex-col gap-3',[
snap?.found&&!isUnstarted&&!isSplitCockpit&&!isBasicMode&&snap?.health?.state==='act'&&jsx(FlightDeck,{snap,compact:true}),
followUp&&!attachedBtwCard&&divs('btw-followup-bar',[
codicon('comment','0.75rem','btw-ac shrink-0'),
span('min-w-0 flex-1 truncate',strings.followingUp(followUp.title||followUp.question)),tip(strings.cancelFollowUp,uiBtn('ghost','icon-xs',{title:strings.cancelFollowUp,'aria-label':strings.cancelFollowUp,onClick:()=>$followUpParent.set(null)},codicon('close','0.7rem')))]),divs({cls:'btw-ask-box','data-dragging':isDraggingFile?'true':'false','data-command-staged':stagedNotice?'true':'false',onDragOver:e=>{
e.preventDefault()},onDrop:async e=>{
const files=Array.from(e.dataTransfer?.files||[])
dragDepthRef.current=0
setIsDraggingFile(false)
if(!files.length)return
e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
await handleDroppedFiles(files,6)
haptic?.('tap')}},[stagedNotice&&divs({cls:'btw-command-staged-banner',role:'status'},[
divs(CLS.rowMin0Sm,[codicon(stagedNotice.icon||'sparkle','0.74rem','shrink-0 btw-em'),span('rounded bg-[#10b981]/20 px-1.5 py-0.5 font-mono btw-tx-9 font-bold btw-em shrink-0',lang==='pt'?'✓ NO CHAT':'✓ IN CHAT'),span(CLS.titleTrunc,stagedNotice.label)]),divs(CLS.rowShrink1,[draft.trim().length>0&&
hBtn('btw-action-mode-pill',{onClick:()=>void executeComposerAction()},lang==='pt'?'⚡ Enviar ↵':'⚡ Send ↵'),hBtn('rounded p-0.5 btw-tt btw-hv-tp cursor-pointer bg-transparent border-0',{title:strings.btnClear,onClick:()=>$composerStagedNotice.set(null)},codicon('close','0.68rem'))])
]),attachedBtwCard&&divs('btw-attached-btw-dock',[divs(CLS.rowBetween,[divs({cls:'flex min-w-0 flex-1 items-center gap-1.5 text-xs',title: `${attachedBtwCard.question}\n\n${String(attachedBtwCard.answer||'').slice(0,320)}`},[span('rounded btw-bg-ac18 px-1.5 py-0.5 font-mono btw-tx-95 font-bold btw-ac shrink-0',strings.attachedBtwBadge),span(CLS.titleTrunc,attachedBtwCard.label)]),divs(CLS.rowShrink1,[hBtn('btw-action-mode-pill',{title:strings.cardFooterBtwMdTip,onClick:()=>void memorizeCardRuleToBtwMd({
id:attachedBtwCard.entry_id||attachedBtwCard.id,title:attachedBtwCard.label,question:attachedBtwCard.question,
answer:attachedBtwCard.answer,anomaly_kinds:attachedBtwCard.anomaly_kinds},scope)},strings.cardFooterBtwMdBtn),
hBtn('rounded p-0.5 btw-tt hover:text-destructive cursor-pointer bg-transparent border-0',{title:strings.btnClear,onClick:()=>{removeBtwAttachment(attachedBtwCard.id)
$followUpParent.set(null)
$composerActionMode.set('ask_btw')
haptic?.('tap')}},codicon('close','0.72rem'))])]),divs(CLS.rowWrapBetweenSm,[divs({cls:CLS.rowWrap1,role:'group'},[hBtn('btw-action-mode-pill',{'data-active':composerActionMode==='ask_btw'?'true':'false',title:strings.modeAskBtwTip,onClick:()=>{$composerActionMode.set('ask_btw')
haptic?.('tap')}},strings.modeAskBtwLabel),hBtn('btw-action-mode-pill',{'data-active':composerActionMode==='steer_main'?'true':'false',title:strings.modeSteerMainTip,onClick:()=>{
$composerActionMode.set('steer_main')
haptic?.('tap')}},strings.modeSteerMainLabel),hBtn('btw-action-mode-pill',{'data-active':composerActionMode==='spawn_subagent'?'true':'false',title:strings.modeSpawnSubTip,onClick:()=>{
$composerActionMode.set('spawn_subagent')
haptic?.('tap')}},strings.modeSpawnSubLabel)]),hsBtn('btw-composer-synth-btn',{disabled:synthesizingComposer,title:strings.composerSynthTip,onClick:()=>{if(composerActionMode==='ask_btw'){
$composerActionMode.set('steer_main')}
void synthesizeForComposer(composerActionMode==='ask_btw'?'steer_main':composerActionMode)}},[synthesizingComposer
?jsx(GlyphSpinner,{spinner:'braille'}):codicon(draft.trim()?'zap':'sparkle','0.72rem'),span(null,synthesizingComposer?strings.composerSynthesizing:draft.trim()?strings.composerSynthOptimizeBtn.replace(/^⚡\s*/,'')
:strings.composerSynthBtn.replace(/^✦\s*/,''))])])]),isDraggingFile&&divs('btw-drop-spotlight-overlay',[codicon('cloud-upload','1.35rem',CLS.accent),div('text-xs font-semibold btw-tp',strings.dragDropOverlayTitle),div('btw-tx-105 btw-ts',strings.dragDropOverlaySub)]),h('input',{ref:imageInputRef,type:'file',accept:'image/*',multiple:true,cls:'hidden',onChange:async e=>{await handleDroppedFiles(e.target?.files,4)
e.target.value=''}}),h('input',{ref:fileInputRef,type:'file',accept:
'audio/*,video/*,image/*,.mp3,.wav,.m4a,.ogg,.opus,.flac,.aac,.webm,.mp4,.mov,.mkv,.avi,.pdf,.doc,.docx,.docm,.xls,.xlsx,.xlsm,.xlsb,.ppt,.pptx,.pptm,.ppsx,.odt,.ods,.odp,.rtf,.epub,.ipynb,.db,.sqlite,.sqlite3,.zip,.txt,.md,.json,.jsonl,.yaml,.yml,.csv,.tsv,.log,.py,.js,.ts,.tsx,.jsx,.html,.css,.sql,.xml,.toml,.svg,.bmp,.tiff,*/*',multiple:true,cls:'hidden',onChange:async e=>{await handleDroppedFiles(e.target?.files,6)
e.target.value=''}}),
(btwAttachments.filter(att=>att.kind!=='btw_card').length>0||pinnedTools.length>0)&&
div('btw-attach-strip',[
...pinnedTools.map(pt=>spans({cls:'btw-pinned-tool-chip',title:lang==='pt'? `Tool fixada (100% garantida nesta pergunta): ${pt}` : `Pinned tool (100% guaranteed on this query): ${pt}`},[
codicon('tools','0.66rem','shrink-0'),
span(null,pt),
span('opacity-75 btw-tx-85','100%'),
hBtn('ml-0.5 bg-transparent border-0 p-0 text-current opacity-75 hover:opacity-100 cursor-pointer',{onClick:()=>togglePinnedTool(pt)},codicon('close','0.62rem'))
],`pin_${pt}`)),
...btwAttachments.filter(att=>att.kind!=='btw_card').map(att=>{if(att.kind==='pasted'){
const isExpanded=expandedPasteId===att.id
const rawContent=String(att.content||'')
const lineCnt=att.lines||(rawContent?rawContent.split('\n').length:1)
const charCnt=att.size||rawContent.length
const firstLine=att.preview||rawContent
.split('\n')
.map(l=>l.trim())
.find(Boolean)||''
return divs('btw-pasted-card',[divs(CLS.rowBetween,[hsBtn('flex min-w-0 flex-1 items-center gap-1.5 bg-transparent border-0 p-0 text-left cursor-pointer',{onClick:()=>setExpandedPasteId(isExpanded?'':att.id),title:strings.pastedExpandTip},[
span('btw-pasted-badge shrink-0',`📋 ${strings.pastedBadge}`),span('font-semibold btw-tp shrink-0',strings.pastedTitle),span('font-mono btw-tx-10 btw-tt shrink-0',`· ${strings.pastedMeta(lineCnt,charCnt)}`),
!isExpanded&&firstLine&&span('truncate font-mono btw-tx-10 btw-ts opacity-85 ml-1',firstLine)]),divs(CLS.rowShrink1,[hBtn('rounded border btw-bd-st70 bg-transparent px-1.5 py-0.5 btw-tx-95 btw-ac btw-hv-ac12 cursor-pointer',{onClick:()=>{
const cur=String($draftQuestion.get()||'').trim()
$draftQuestion.set(cur? `${cur}\n\n${rawContent}` :rawContent)
removeBtwAttachment(att.id)
scheduleTimer(()=>inputRef.current?.focus?.(),20)
haptic?.('tap')}},strings.pastedUnpackBtn),hBtn('bg-transparent border-0 p-0.5 btw-tt btw-hv-tp cursor-pointer',{title:strings.pastedExpandTip,onClick:()=>setExpandedPasteId(isExpanded?'':att.id)},jsx(DisclosureCaret,{open:isExpanded,size:'0.68rem'})),hBtn('bg-transparent border-0 p-0.5 btw-tt hover:text-destructive cursor-pointer',{title:strings.btnClear,onClick:()=>removeBtwAttachment(att.id)},codicon('close','0.68rem'))])]),isExpanded&&
h('pre','btw-pasted-preview font-mono',rawContent.slice(0,4000))],att.id)}
return spans({cls:'btw-attach-chip',title:att.content? `${att.label}\n\n${String(att.content).slice(0,400)}` :att.detail||att.label},[
att.kind==='image'&&_SAFE_INLINE_MEDIA_URI_RE.test(att.thumbnail_url||att.data_url||'')
?h('img',{src:att.thumbnail_url||att.data_url,alt:att.label,cls:'btw-attach-thumb'}):span(null,att.kind==='session'?'💬':att.kind==='audio'?'🔊':att.kind==='video'?'🎬':att.kind==='folder'?'📁'
:att.kind==='url'?'🌐':att.kind==='image'?'🖼':'📄'),
span('truncate font-medium',att.label),att.detail
?span('font-mono btw-tx-95 btw-tt truncate max-w-20',att.detail):null,
hBtn('ml-0.5 bg-transparent border-0 p-0 btw-tt hover:text-destructive cursor-pointer',{title:strings.btnClear,onClick:()=>removeBtwAttachment(att.id)},codicon('close','0.66rem'))],att.id)})]),h('textarea',{ref:inputRef,rows:2,cls:'btw-ask-textarea',placeholder:attachedBtwCard
?composerActionMode==='steer_main'?strings.placeholderAttachedSteer:composerActionMode==='spawn_subagent'
?strings.placeholderAttachedSpawn:strings.placeholderAttachedAsk:isBasicMode?strings.placeholderAskBasic
:strings.placeholderAsk,value:draft,disabled:Boolean(pending)||synthesizingComposer,onChange:e=>$draftQuestion.set(e.target.value),onPaste:async e=>{
const items=Array.from(e.clipboardData?.items||[])
const fileItems=items.filter(it=>it.kind==='file')
if(fileItems.length>0){e.preventDefault()
for(const it of fileItems){
const f=it.getAsFile()
if(f){
const att=await readFileToBtwAttachment(f)
if(att)addBtwAttachment(att)}}
haptic?.('tap')
return}
const pastedText=e.clipboardData?.getData?.('text/plain')||''
const lineCount=pastedText?pastedText.split('\n').length:0
if(pastedText.length>160||lineCount>=4){e.preventDefault()
const firstLine=pastedText
.split('\n')
.map(l=>l.trim())
.find(Boolean)||''
addBtwAttachment({id: `paste_${Date.now().toString(36)}`,kind:'pasted',label:strings.pastedChipLabel(lineCount,pastedText.length),
detail: `${lineCount}L`,preview:firstLine.slice(0,72),lines:lineCount,size:pastedText.length,content:pastedText.slice(0,24000)})
haptic?.('tap')}},onKeyDown:e=>{if(isSubmitEnter(e)&&!e.shiftKey){e.preventDefault()
void executeComposerAction()
return}
if(e.key==='ArrowUp'&&!e.currentTarget.value&&entries.length>0){e.preventDefault()
const last=[...entries].sort((a,b)=>(b.created_at||0)-(a.created_at||0))[0]
if(last?.question)$draftQuestion.set(last.question)}}}),
(!isBasicMode||/@|\{\{/.test(draft))&&
jsx(TokenChips,{targetRef:inputRef,onInsert:next=>$draftQuestion.set(next),compact:!inDialog&&!wide}),
jsx(ResolvedPreview,{res:draftPreview}),
liveVoiceActive&&divs('btw-live-voice-banner flex-col items-stretch',[
divs('flex min-w-0 w-full items-center justify-between gap-2',[
divs(CLS.rowMin0,[
jsx(BtwVoiceWaveform,{active:liveVoicePhase==='listening'||liveVoicePhase==='speaking'}),
span('rounded bg-[#10b981]/20 px-1.5 py-0.5 font-mono btw-tx-95 font-bold btw-em shrink-0',`LIVE · ${liveVoicePhase.toUpperCase()}`),
span('truncate btw-tx-11 font-medium btw-tp',liveVoiceStatusText||(lang==='pt'?'Conversando Live (diga "by the way" p/ novo banner)':'Live Talk active (say "by the way" for new banner)'))]),
hBtn('btw-action-mode-pill shrink-0',{onClick:()=>stopBtwLiveVoice(true)},lang==='pt'?'Encerrar':'End')]),
liveVoiceReply&&div('mt-1 truncate btw-tx-105 btw-ts border-t border-[#10b981]/20 pt-1',`🔊 ${liveVoiceReply}`)
]),
dictationStatus!=='idle'&&divs('btw-dictation-strip',[
divs(CLS.rowMin0,[dictationStatus==='recording'
?jsx(BtwVoiceWaveform,{active:true}):typeof Loader==='function'
?jsx(Loader,{type:'fourier-flow',strokeScale:1.2,className:'size-4 btw-ac'})
:jsx(GlyphSpinner,{spinner:'braille'}),span('font-mono btw-tx-10 font-semibold btw-ac shrink-0',dictationStatus==='recording'? `${Math.floor(dictationElapsed / 60)}:${String(dictationElapsed % 60).padStart(2,'0')}`
:lang==='pt'?'Transcrevendo STT…':'Transcribing STT…'),dictationPartial&&span('truncate btw-tx-105 italic btw-ts',dictationPartial)]),divs(CLS.rowShrink1,[dictationStatus==='recording'&&hBtn('btw-action-mode-pill',{onClick:()=>stopBtwDictation(false)},lang==='pt'?'✓ Concluir':'✓ Done'),
hBtn('rounded p-0.5 btw-tt hover:text-destructive cursor-pointer bg-transparent border-0',{title:lang==='pt'?'Cancelar ditado (Esc)':'Cancel dictation (Esc)',onClick:()=>stopBtwDictation(true)},codicon('close','0.72rem'))])]),divs('btw-ask-controls',[divs('btw-ask-controls-left',[jsxs(DropdownMenu,{children:[jsx(DropdownMenuTrigger,{asChild:true,
children:hBtn('btw-composer-plus-btn',{title:strings.plusBtnTip,'aria-label':strings.plusBtnTip},codicon('add','0.82rem'))}),jsxs(DropdownMenuContent,{align:'start','data-btw-portal':'','data-btw-theme':themeProps['data-btw-theme'],style:themeProps.style,
className:'w-72 max-h-80 overflow-y-auto p-1.5 flex flex-col gap-1',children:[hsBtn('btw-plus-cat-btn',{'data-open':plusOpenSec==='snippets'?'true':'false',onClick:e=>{e.preventDefault()
e.stopPropagation()
setPlusOpenSec(prev=>(prev==='snippets'?'':'snippets'))
haptic?.('tap')}},[spans('inline-flex items-center gap-1.5 btw-ac',[
jsx(DisclosureCaret,{open:plusOpenSec==='snippets',size:'0.72rem'}),span(null,strings.plusSnippetsHeader)]),
span('rounded-full btw-bg-ac15 px-1.5 py-0.5 font-mono btw-tx-95 btw-ac',String(activePresetsList.length))]),plusOpenSec==='snippets'&&divs('btw-plus-cat-body',[
...activePresetsList.slice(0,6).map(preset=>jsx(DropdownMenuItem,{onSelect:()=>{recordLocalPresetRun(preset.id)
$draftQuestion.set(preset.prompt)
stageCommandInBtwChat(preset.prompt,{label: `⚡ Snippet: ${preset.label}`,source:'preset',icon:preset.icon||'zap',
switchToAsk:false})
scheduleTimer(()=>inputRef.current?.focus?.({preventScroll:true}),15)
haptic?.('tap')},children:divs({cls:'flex w-full items-center justify-between gap-2',title: `${preset.desc||''}\n\n${preset.prompt}\n\n(${strings.plusInsertTip})`},[spans('inline-flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium btw-tp truncate',[
codicon(preset.icon,'0.74rem','shrink-0 btw-ac'),
span('truncate',preset.label)]),hBtn('shrink-0 rounded border btw-bd-ac40 btw-bg-ac10 px-1.5 py-0.5 font-mono btw-tx-95 font-semibold btw-ac btw-hv-ac22 cursor-pointer',{onClick:e=>{e.preventDefault()
e.stopPropagation()
recordLocalPresetRun(preset.id)
submitQuestion(preset.prompt,preset.id)}},`⚡ ${strings.plusRunNowBtn}`)])}, `plus_preset_${preset.id}`)),
jsx(DropdownMenuItem,{onSelect:()=>openPresetCreatorFromQuestion(draft,'ask'),children:spans('inline-flex items-center gap-1.5 text-xs btw-ac',[codicon('add','0.72rem'),strings.addPresetBtn])})]),hsBtn('btw-plus-cat-btn',{'data-open':plusOpenSec==='attach'?'true':'false',onClick:e=>{e.preventDefault()
e.stopPropagation()
setPlusOpenSec(prev=>(prev==='attach'?'':'attach'))
haptic?.('tap')}},[spans('inline-flex items-center gap-1.5 btw-tp',[
jsx(DisclosureCaret,{open:plusOpenSec==='attach',size:'0.72rem'}),span(null,strings.plusAttachHeader)]),
span(CLS.mono95Muted,'5')]),plusOpenSec==='attach'&&divs('btw-plus-cat-body',[jsx(DropdownMenuItem,{onSelect:()=>imageInputRef.current?.click?.(),
children:span('text-xs',strings.attachImageItem)}),jsx(DropdownMenuItem,{
onSelect:()=>fileInputRef.current?.click?.(),children:span('text-xs',strings.attachFileItem)}),
snap?.cwd&&jsx(DropdownMenuItem,{onSelect:()=>{
const{leaf,full}=splitPathLeaf(snap.cwd)
addBtwAttachment({id: `folder_cwd_${leaf}`,kind:'folder',label: `@folder:${leaf}`,detail:full,path:full})
haptic?.('tap')},children:span('text-xs',strings.attachWorkspaceFolderItem)}),
_ctx?.files?.requestFolder&&jsx(DropdownMenuItem,{onSelect:async()=>{try{
const res=await _ctx.files.requestFolder()
if(res?.ok&&res.folder){
const listRes=await _ctx.files.list(res.folder.id)
const names=Array.isArray(listRes?.entries)
?listRes.entries.slice(0,50).map(e=> `${e.name}${e.isDirectory?'/':''}`).join('\n'):''
addBtwAttachment({id: `folder_${res.folder.id}`,kind:'folder',label: `@folder:${res.folder.name}`,
detail:res.folder.path||res.folder.name,path:res.folder.path||'',content:names})
haptic?.('tap')}
}catch{}},children:span('text-xs',strings.attachGrantedFolderItem)}),jsx(DropdownMenuItem,{
onSelect:async()=>{try{
const clip=await navigator.clipboard.readText()
const text=String(clip||'').trim()
if(text){
const lines=text.split('\n').length
const firstLine=text
.split('\n')
.map(l=>l.trim())
.find(Boolean)||''
addBtwAttachment({id: `paste_${Date.now().toString(36)}`,kind:'pasted',label:strings.pastedChipLabel(lines,text.length),
detail: `${lines}L`,preview:firstLine.slice(0,72),lines,size:text.length,content:text.slice(0,24000)})
haptic?.('tap')}
}catch{}},children:span('text-xs',strings.attachPasteItem)}),jsx(DropdownMenuItem,{
onSelect:()=>{
const cur=String($draftQuestion.get()||'')
const urlMatch=cur.match(/https?:\/\/[^\s)]+/)
const u=urlMatch?urlMatch[0]:'https://'
addBtwAttachment({id: `url_${Date.now().toString(36)}`,kind:'url',label: `@url:${u.replace(/^https?:\/\//,'').slice(0,28)}`,
detail:u})
haptic?.('tap')},children:span('text-xs',strings.attachUrlItem)})]),
Array.isArray(snap?.touched_files)&&snap.touched_files.length>0&&hs(Fragment,null,[hsBtn('btw-plus-cat-btn',{'data-open':plusOpenSec==='files'?'true':'false',onClick:e=>{e.preventDefault()
e.stopPropagation()
setPlusOpenSec(prev=>(prev==='files'?'':'files'))
haptic?.('tap')}},[spans('inline-flex items-center gap-1.5 btw-tp',[
jsx(DisclosureCaret,{open:plusOpenSec==='files',size:'0.72rem'}),span(null,strings.plusFilesCatHeader)]),
span('rounded-full btw-bg-tp10 px-1.5 py-0.5 font-mono btw-tx-95 btw-ts',String(Math.min(6,snap.touched_files.length)))]),plusOpenSec==='files'&&div('btw-plus-cat-body',snap.touched_files.slice(0,6).map(fp=>{
const{leaf,parent,full}=splitPathLeaf(fp)
return jsx(DropdownMenuItem,{onSelect:()=>{addBtwAttachment({id: `file_${leaf}`,kind:'file',label: `@file:${leaf}`,
detail:parent? `${parent}/${leaf}` :full,path:full})
haptic?.('tap')},children:spans('inline-flex items-center gap-1.5 font-mono btw-tx-11',[
span(CLS.accent,'📄'),span('truncate max-w-44',leaf)])},fp)}))])]})]}),jsx(ComposerModelPicker,{compact:true,providerValue:surfBackendCfg.fast_provider||'',
modelValue:surfBackendCfg.fast_model||'',onSelect:({provider,model,base_url})=>{
const cfgCur=$backendSettings.get()||{}
const patch={fast_provider:provider||'',fast_model:model||''}
if(base_url&&!cfgCur.fast_base_url)patch.fast_base_url=base_url
syncBackendSettings(patch)}}),hsBtn('btw-web-toggle-pill',{'data-active':allowWebSearch?'true':'false',title:allowWebSearch?lang==='pt'
?'Pesquisa Web ATIVA no /btw (clique para usar apenas o contexto local da sessão)'
:'Web Search ENABLED in /btw (click to use local session context only)':lang==='pt'
?'Somente Contexto da Sessão (clique para habilitar Pesquisa Web no /btw)'
:'Context Only (click to enable Web Search in /btw)',onClick:()=>{
const next=!allowWebSearch
setPref($allowWebSearch,next,'allowWebSearch')
syncBackendSettings({allow_web_search:next})
haptic?.('tap')}},[codicon(allowWebSearch?'globe':'lock','0.68rem'),span({cls:isBasicMode?'':'btw-toggle-label'},allowWebSearch?'Web':(lang==='pt'?'Contexto':'Context'))]),(!isBasicMode||pinnedTools.length>0||allowMediaTools)&&jsxs(DropdownMenu,{children:[jsx(DropdownMenuTrigger,{
asChild:true,children:hsBtn('btw-web-toggle-pill',{'data-active':pinnedTools.length>0?'true':'false',title:lang==='pt'?'Roteamento Automático de Tools (Vanilla Hermes) ou Fixar Tool Exata (100%)':'Automatic Vanilla-Hermes Tool Routing or Pin Exact Tool (100%)'},[codicon('tools','0.68rem'),(!isBasicMode||pinnedTools.length>0)?span(isBasicMode?'':'btw-toggle-label',pinnedTools.length>0? `Tools (${pinnedTools.length})` :'Tools'):null])}),jsxs(DropdownMenuContent,{
align:'start','data-btw-portal':'','data-btw-theme':themeProps['data-btw-theme'],style:themeProps.style,className:'w-68 p-1',children:[
jsx(DropdownMenuItem,{
onSelect:()=>{setPref($pinnedBtwTools,[],'pinnedTools');haptic?.('tap')},
children:divs(CLS.menuRow,[
spans('inline-flex items-center gap-1.5 font-semibold btw-ac',[
codicon('sparkle','0.7rem'),
lang==='pt'?'Auto-Roteamento (Vanilla Hermes)':'Auto-Route (Vanilla Hermes)'
]),
span('font-mono btw-tx-95 text-emerald-400',pinnedTools.length===0?'✓ ON':(lang==='pt'?'limpar':'reset'))
])
}),
jsx(DropdownMenuSeparator,{}),
...[
{id:'read_file',labelPt:'📄 Ler Arquivo (read_file)',labelEn:'📄 Read File (read_file)',tag:'workspace'},
{id:'search_files',labelPt:'🔎 Buscar Código (search_files)',labelEn:'🔎 Search Code (search_files)',tag:'ripgrep'},
{id:'web_search',labelPt:'🌐 Pesquisa Web (web_search)',labelEn:'🌐 Web Search (web_search)',tag:'nous'},
{id:'web_extract',labelPt:'📑 Extrair URL (web_extract)',labelEn:'📑 Web Extract (web_extract)',tag:'extract'},
{id:'session_search',labelPt:'🗂 Buscar Sessões (session_search)',labelEn:'🗂 Search Sessions (session_search)',tag:'fts5'},
{id:'image_generate',labelPt:'🎨 Gerar Imagem (image_generate)',labelEn:'🎨 Generate Image (image_generate)',tag:snap?.config?.media_gen?.image_gen?.provider||'media'},
{id:'video_generate',labelPt:'🎬 Gerar Vídeo (video_generate)',labelEn:'🎬 Generate Video (video_generate)',tag:snap?.config?.media_gen?.video_gen?.provider||'media'},
{id:'text_to_speech',labelPt:'🔊 Gerar Áudio TTS (text_to_speech)',labelEn:'🔊 Speak TTS (text_to_speech)',tag:surfTtsVoice},
{id:'browser_exec',labelPt:'🧭 Browser Cloud (browser_exec)',labelEn:'🧭 Cloud Browser (browser_exec)',tag:'browser'},
{id:'manage_connections',labelPt:'🔌 Conectores (manage_connections)',labelEn:'🔌 Connectors (manage_connections)',tag:'portal'}
].map(tSpec=>{
const isPinned=pinnedTools.includes(tSpec.id)
return jsx(DropdownMenuItem,{
onSelect:()=>togglePinnedTool(tSpec.id),
children:divs(CLS.menuRow,[
span({cls:cn('truncate',isPinned&&'font-semibold btw-ac')},lang==='pt'?tSpec.labelPt:tSpec.labelEn),
span({cls:cn('rounded px-1.5 py-0.5 font-mono btw-tx-9 shrink-0',isPinned?'btw-bg-ac22 btw-ac font-bold':'btw-bg-tp5 btw-tt')},isPinned?'✓ 100%':tSpec.tag)
])
},tSpec.id)}),
jsx(DropdownMenuSeparator,{}),
jsx(DropdownMenuItem,{
onSelect:()=>{$activeTab.set('learn')
$playbookPreviewOpen.set(true)
haptic?.('tap')},
children:span('text-xs btw-ac',lang==='pt'?'📘 Moldar Lições em Skills (BTW.md)':'📘 Mold Lessons into Skills (BTW.md)')
})]})]}),
!isBasicMode&&!attachedBtwCard&&hsBtn('btw-web-toggle-pill',{disabled:Boolean(pending)||synthesizingComposer,title:lang==='pt'?'JIT Meta-Prompt Refiner: enriquecer ou sintetizar pergunta com arquivos tocados e erros reais da sessão':'JIT Meta-Prompt Refiner: enrich or synthesize prompt with live touched files & session errors',onClick:()=>void refineDraftWithJit()},[synthesizingComposer?jsx(GlyphSpinner,{spinner:'braille'}):codicon('sparkle','0.68rem',CLS.accent),span('btw-toggle-label',lang==='pt'?'Refinar':'Refine')]),
!isBasicMode&&
jsxs(DropdownMenu,{children:[jsx(DropdownMenuTrigger,{asChild:true,children:hsBtn('btw-web-toggle-pill',{title:strings.mentionSessionTip},[codicon('comment-discussion','0.68rem'),span('btw-toggle-label',strings.mentionSessionBtn)])}),
jsxs(DropdownMenuContent,{align:'start','data-btw-portal':'','data-btw-theme':themeProps['data-btw-theme'],style:themeProps.style,children:[recentSessionsList.length===0?jsx(DropdownMenuItem,{disabled:true,
children:span('text-xs btw-tt',strings.hudNoSession)})
:recentSessionsList.slice(0,10).map(s=>jsx(DropdownMenuItem,{onSelect:()=>{addBtwAttachment({id: `sess_${s.id}`,
kind:'session',session_id:s.id,label: `@session:${String(s.title||s.id).slice(0,26)}`,
detail: `${s.profile||'default'} · ${shortModelName(s.model)}`})
haptic?.('tap')},children:divs('flex flex-col gap-0.5 max-w-64',[
span('text-xs font-medium truncate',`💬 ${s.title||s.id}`),span('font-mono btw-tx-10 btw-tt truncate',`${s.profile||'default'} · ${shortModelName(s.model)} · ${s.messages||0} msgs`)])},s.id))]})]})]),divs('ml-auto flex shrink-0 items-center gap-1.5 flex-nowrap',[(draft.length>180||draft.split('\n').length>=4)&&tip(strings.collapseToPastedTip,uiBtn('outline','xs',{cls:'h-[26px] px-2 btw-tx-10',onClick:()=>{
const text=String($draftQuestion.get()||'')
const lines=text.split('\n').length
const firstLine=text
.split('\n')
.map(l=>l.trim())
.find(Boolean)||''
addBtwAttachment({id: `paste_${Date.now().toString(36)}`,kind:'pasted',label:strings.pastedChipLabel(lines,text.length),
detail: `${lines}L`,preview:firstLine.slice(0,72),lines,size:text.length,content:text.slice(0,24000)})
$draftQuestion.set('')
haptic?.('tap')}},strings.collapseToPastedBtn)),
!isBasicMode&&
draft.trim().length>0&&tip(strings.saveDraftAsPresetTip,uiBtn('outline','xs',{cls:'h-[26px] px-2 btw-tx-105',onClick:()=>openPresetCreatorFromQuestion(draft,'ask')},strings.saveDraftAsPresetBtn)),
(draft.trim().length>0||btwAttachments.length>0||pinnedTools.length>0)&&uiBtn('ghost','xs',{cls:'h-[26px] px-2 btw-tx-105',onClick:()=>{
$draftQuestion.set('')
setPref($pinnedBtwTools,[],'pinnedTools')
clearBtwAttachments()}},strings.btnClear),
dictationStatus==='recording'?hsBtn('btw-voice-hub-btn',{'data-mode':'recording',title:lang==='pt'?'Clique para concluir o ditado e inserir texto':'Click to finish dictation & insert text',onClick:()=>toggleBtwDictation('main')},[
codicon('debug-stop','0.74rem'),
span('font-mono btw-tx-10',`Rec ${Math.floor(dictationElapsed / 60)}:${String(dictationElapsed % 60).padStart(2,'0')}`)]):(!isBasicMode||liveVoiceActive||wakeWordEnabled||dictationStatus!=='idle')?jsxs(DropdownMenu,{children:[
jsx(DropdownMenuTrigger,{asChild:true,children:hsBtn('btw-voice-hub-btn',{'data-mode':liveVoiceActive?'live':wakeWordEnabled?'wake':'idle',disabled:Boolean(pending)||synthesizingComposer||dictationStatus==='transcribing',title:lang==='pt'?'Voz: Ditado, Live Talk e Wake-Word':'Voice: Dictate, Live Talk & Wake-Word'},[liveVoiceActive?span('size-1.5 rounded-full bg-[#10b981] animate-pulse shrink-0')
:wakeWordEnabled?span('size-1.5 rounded-full btw-bg-ac animate-pulse shrink-0')
:codicon('unmute','0.74rem','opacity-85 shrink-0'),
span(null,liveVoiceActive?'Live':wakeWordEnabled?(wakeTargetMode==='dictate'?'Wake·Mic':'Wake·Live'):(lang==='pt'?'Voz':'Voice')),
codicon('chevron-down','0.62rem','opacity-65 shrink-0')])}),
jsxs(DropdownMenuContent,{align:'end','data-btw-portal':'','data-btw-theme':themeProps['data-btw-theme'],style:themeProps.style,className:'w-64 p-1',children:[
jsx(DropdownMenuItem,{onSelect:()=>toggleBtwDictation('main'),children:divs(CLS.menuRow,[
spans('inline-flex items-center gap-2',[codicon('unmute','0.74rem',CLS.accent),lang==='pt'?'Ditar Pergunta (STT)':'Dictate Question (STT)']),
span(CLS.mono95Muted,'Whisper')])}),
jsx(DropdownMenuItem,{onSelect:()=>toggleBtwLiveVoice(),children:divs(CLS.menuRow,[
spans('inline-flex items-center gap-2',[codicon('broadcast','0.74rem',liveVoiceActive?'text-emerald-400':'btw-ts'),lang==='pt'?'Live Talk (Contínuo)':'Live Talk (Continuous)']),
span({cls:cn('rounded px-1.5 py-0.5 font-mono btw-tx-95',liveVoiceActive?'bg-emerald-500/20 text-emerald-400 font-bold':'btw-bg-tp5 btw-tt')},liveVoiceActive?'ON':'OFF')])}),
jsx(DropdownMenuItem,{onSelect:()=>toggleBtwWakeWord(),children:divs(CLS.menuRow,[
spans('inline-flex items-center gap-2',[codicon('radio-tower','0.74rem',wakeWordEnabled?CLS.accent:'btw-ts'),`Wake ("${wakePhraseVal||'by the way'}")`]),
span({cls:cn('rounded px-1.5 py-0.5 font-mono btw-tx-95',wakeWordEnabled?'btw-bg-ac20 btw-ac font-bold':'btw-bg-tp5 btw-tt')},wakeWordEnabled?'ON':'OFF')])}),
divs({cls:'mt-1 flex items-center justify-between gap-1.5 rounded-md border btw-bd-st55 btw-bg-tp4m px-2 py-1 btw-tx-105',onClick:e=>e.stopPropagation()},[
span('btw-tt font-medium shrink-0',lang==='pt'?'Wake abre:':'Wake mode:'),
divs(CLS.inline1,[
hBtn(cn('rounded px-1.5 py-0.5 font-mono btw-tx-10 cursor-pointer border',wakeTargetMode==='dictate'?'btw-bd-ac60 btw-bg-ac20 btw-ac font-bold':'border-transparent bg-transparent btw-ts'),{onClick:e=>{e.preventDefault();e.stopPropagation();setBtwWakeTargetMode('dictate')}},lang==='pt'?'🎙 Ditado':'🎙 Dictate'),
hBtn(cn('rounded px-1.5 py-0.5 font-mono btw-tx-10 cursor-pointer border',wakeTargetMode!=='dictate'?'border-emerald-500/55 bg-emerald-500/20 text-emerald-400 font-bold':'border-transparent bg-transparent btw-ts'),{onClick:e=>{e.preventDefault();e.stopPropagation();setBtwWakeTargetMode('live')}},'🟢 Live Talk')])])]})]}):null,
hBtn('btw-primary-send-btn',{title:`${strings.btnAsk} (/btw · Enter)`,disabled:Boolean(pending)||synthesizingComposer||(!draft.trim()&&btwAttachments.length===0),onClick:()=>void executeComposerAction()},pending||synthesizingComposer?spans(CLS.inline15,[jsx(GlyphSpinner,{spinner:'braille'}),
synthesizingComposer?strings.composerSynthesizing:elapsedPending]):spans(CLS.inline15,[codicon(attachedBtwCard&&composerActionMode==='spawn_subagent'?'hubot'
:attachedBtwCard&&composerActionMode==='steer_main'?'zap':'send','0.72rem'),
attachedBtwCard&&composerActionMode==='steer_main'?draft.trim()?strings.btnSteerMainNow:strings.btnAutoSteerMain
:attachedBtwCard&&composerActionMode==='spawn_subagent'?draft.trim()?strings.btnSpawnSubNow:strings.btnAutoSpawnSub
:strings.btnAsk]))])])]),div({cls:cn(isDraggingFile&&'btw-drag-dimmed')},jsx(PresetGridSection,{
pending,onRunPreset:submitQuestion,focusTargetRef:inputRef,suggestion:snap?.suggested_preset||null,snap,hoverPos:'below'})),
pending&&divs({cls:cn(
'flex items-center justify-between gap-2 rounded-xl border btw-bd-ac45 btw-bg-ac8 px-3 py-2.5 text-xs',
isDraggingFile&&'btw-drag-dimmed')},[divs('flex min-w-0 items-center gap-2.5',[
jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent}),divs('min-w-0',[div(CLS.titleTrunc,pending.question),div('btw-tx-105 btw-ts',pending.mode==='fast'?strings.synthesizingFast
:strings.synthesizingDeep)])]),jsx(Badge,{variant:'default',size:'default',className:'font-mono tabular-nums',
children:elapsedPending})]),entries.length>0?divs({cls:cn('flex flex-col gap-2.5',isDraggingFile&&'btw-drag-dimmed')},(()=>{
if(!isBasicMode)return entries.slice(0,inDialog?15:6)
const pinnedList=entries.filter(e=>e.pinned)
const unpinnedNewest=[...entries.filter(e=>!e.pinned)].sort((a,b)=>Number(b.created_at||0)- Number(a.created_at||0))
const neededUnpinned=Math.max(0,3 - pinnedList.length)
return[...pinnedList,...unpinnedNewest.slice(0,neededUnpinned)]
})().map((entry,idx)=>jsx(QaCard,{entry,sessionScope:scope,latest:idx===0,availableSubagents:snap?.subagents||[],onCloseSurface:onClose},entry.id))):!pending&&!isBasicMode&&divs('btw-empty-hero btw-stagger-item text-xs btw-ts',[typeof Loader==='function'?jsx(Loader,{type:'lissajous-drift',className:'size-8 btw-ac'})
:codicon('sparkle','1.25rem','btw-ac opacity-90'),div('font-semibold btw-tp',strings.emptyTitle),div('max-w-[54ch] leading-relaxed btw-tt',strings.emptyDesc),uiBtn('outline','xs',{cls:'mt-1 rounded-full px-3 btw-ac btw-bd-ac40',onClick:()=>{
const firstPreset=(strings.presets||[])[0]
if(firstPreset?.prompt)submitQuestion(firstPreset.prompt,firstPreset.id)}},spans(CLS.inline15,[codicon('zap','0.72rem'),strings.starterTryBtn]))])
])),tab==='radar'&&jsx(RadarView,{scope,radarQuery,onOpenSettings:()=>setShowSettings(v=>!v)}),tab==='subagents'&&
jsx(SubagentsView,{scope,snapSubagents:snap?.subagents||[],onClose,isUnstarted,onOpenSettings:()=>setShowSettings(v=>!v)}),
tab==='learn'&&jsx(LearnView,{scope}),tab==='mesh'&&jsx(SessionMeshView,{scope,onClose}),
tab==='compare'&&jsx(CompareView,{scope}),(tab==='history'||tab==='cards')&&(isUnstarted&&entries.length===0
?jsx(WaitingToStartSessionHero,{scope,variant:'cards',onOpenSettings:()=>setShowSettings(v=>!v)}):divs('flex flex-col gap-2.5',[divs(CLS.rowBetween,[
jsx(SearchField,{value:search,onChange:setSearch,placeholder:strings.searchPlaceholder,variant:'box',
containerClassName:'flex-1 py-1 px-2.5'}),entries.length>0&&_ctx?.files&&tip(strings.exportTip,uiBtn('outline','xs',{onClick:()=>void exportCardsMarkdown(scope,entries)},spans(CLS.inline1,[codicon('export','0.7rem'),strings.exportBtn]))),entries.some(x=>!x.pinned)&&uiBtn('ghost','xs',{onClick:clearUnpinned},strings.clearUnpinned)]),filteredEntries.length>0
?filteredEntries.map((entry,idx)=>jsx(QaCard,{entry,sessionScope:scope,latest:idx===0,availableSubagents:snap?.subagents||[],onCloseSurface:onClose},entry.id)):divs('btw-empty-hero text-xs btw-tt',[codicon('comment-discussion','1.25rem','btw-ac opacity-85'),div('font-semibold btw-tp',search.trim()?strings.noCardsFound:strings.cardsEmptyTitle),
!search.trim()&&div('max-w-[52ch] leading-relaxed',strings.cardsEmptyDesc)])]))]),isSplitCockpit&&hs('aside','btw-spatial-dock',[divs('flex items-center justify-between gap-2 pb-1 border-b btw-bd-st45',[spans('inline-flex items-center gap-1.5 btw-tx-105 font-semibold uppercase tracking-wider btw-ac',[
codicon('pulse'),strings.tabRadar]),uiBtn('outline','xs',{cls:'h-5 px-2 btw-tx-10',onClick:()=>void speakTelemetry(scope.storedId||scope.runtimeId||'active','auto')},strings.hudTriggerSynth)]),latestPetBubble&&divs({cls:'btw-pet-card','data-tone':latestPetBubble.tone||'info'},[divs('btw-pet-card-header',[span('font-semibold btw-tx-11 btw-tp',`${companionMoodGlyph} · ${latestPetBubble.title||strings.hudPetSummaryTitle}`),span('btw-pet-ai-badge',latestPetBubble.ai_inferred?'✦ AI':'$0')]),div('btw-tx-11 leading-relaxed btw-ts',latestPetBubble.summary)]),
jsx(RadarView,{scope,radarQuery,onOpenSettings:()=>setShowSettings(v=>!v)})])])]),
!isUnstarted&&!showSettings&&divs('flex items-center justify-between gap-2 border-t btw-bd px-3.5 py-1.5 btw-tx-105 btw-tq',[hsBtn('inline-flex items-center gap-1.5 bg-transparent border-0 p-0 btw-tx-105 btw-tt btw-hv-tp cursor-pointer',{onClick:toggleIntercept,title:strings.interceptTitle},[codicon(intercept?'pass-filled':'circle-large-outline','0.72rem',intercept?CLS.accent:'btw-tq'),span(null,intercept?strings.interceptOn:strings.interceptOff)]),divs(CLS.row15,[
span('btw-kbd-hint hidden sm:inline','↑ '),span(null,strings.shortcutLabel),
typeof KbdGroup==='function'?jsx(KbdGroup,{keys:['Ctrl','Alt','B'],size:'sm'}):jsx(Kbd,{children:'Ctrl+Alt+B'})])])])}
function ComposerBtwTrigger(){
const[open,setOpen]=useState(false)
const triggerRef=useRef(null)
const wide=useValue($popoverWide)
const lang=useValue($lang)
const pendingMap=useValue($pendingBySession)
const entriesMap=useValue($entriesBySession)
const scope=useFocusedSessionScope()
const strings=I18N[lang]||I18N.en
useEffect(()=>{
const handler=({action})=>{if(action==='close'){setOpen(false)
return false}
if(!isVisibleElement(triggerRef.current)){
return false}
scheduleTimer(()=>{setOpen(prev=>(action==='toggle'?!prev:true))
},20)
return true}
handler._triggerRef=triggerRef
_composerOpenHandlers.add(handler)
return()=>{_composerOpenHandlers.delete(handler)}
},[])
const pending=pendingMap[scope.key]||null
const entries=entriesMap[scope.key]||[]
const pulse=useValue($livePulseBySession)[scope.key]||null
const pinned=useValue($pinned)
const bannerThemeMode=useValue($bannerThemeMode)
const themeProps=useThemeProps()
const hasLoopAlert=Number(pulse?.consecutive_errors||0)>=2
const elapsedPending=useElapsedSeconds(pending?.startedAt,Boolean(pending))
return jsxs(Popover,{open,onOpenChange:next=>{haptic?.('tap')
setOpen(next)},children:[jsx(PopoverTrigger,{asChild:true,children:jsxs('button',{ref:triggerRef,type:'button',
'data-active':open||Boolean(pending)?'true':'false','data-alert':hasLoopAlert?'true':'false',
'data-chip-theme':bannerThemeMode,'data-btw-theme':bannerThemeMode==='studio'?themeProps['data-btw-theme']:undefined,
style:bannerThemeMode==='studio'?themeProps.style:undefined,title:strings.triggerTitle,className:'btw-trigger-pill',
children:[pending?jsx(GlyphSpinner,{spinner:'braille',className:'btw-ac'}):hasLoopAlert
?jsx(Codicon,{name:'warning',size:'0.78rem',className:'btw-warn-text'}):themeProps['data-btw-theme'] === 'orbyx' ? jsx(BtwBrandIcon, { size: 15 }) : null,
jsx('span',{children:pending? `btw ${elapsedPending}` :'/btw'}),
!pending&&
entries.length>0&&jsx('span',{className:bannerThemeMode==='studio'
?'rounded-full btw-bg-ac22 px-1.5 btw-tx-10 font-semibold tabular-nums btw-ac'
:'btw-tx-11 opacity-75 tabular-nums',children:String(entries.length)})]})}),jsx(PopoverContent,{side:'top',align:'end',
sideOffset:12,arrowPadding:22,collisionPadding:14,'data-wide':wide?'true':'false','data-pinned':pinned?'true':'false',
'data-btw-theme':themeProps['data-btw-theme'],'data-btw-density':themeProps['data-btw-density'],style:themeProps.style,
className:'btw-studio-popover',onOpenAutoFocus:focusIntoSurface,onCloseAutoFocus:e=>{e.preventDefault()
triggerRef.current?.focus?.({preventScroll:true})},...dismissGuards(triggerRef),children:open?jsx(StudioSurfaceBody,{scope,
inDialog:false,onClose:()=>setOpen(false)}):null})]})}
function ComposerAlertStrip(){
const alert=useValue($alertSteer)
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
if(!alert)return null
return divs({cls:'btw-alert-strip','data-tone':alert.tone||'error',role:'status'},[
codicon(alert.tone==='wait'?'watch':'warning','0.78rem','btw-alert-icon shrink-0'),
span('min-w-0 flex-1 truncate',alert.text),uiBtn('outline','xs',{cls:'btw-alert-btn',onClick:()=>{
void steerActiveSession(alert.steer,null,null,{source:'alert',targetKind:alert.kind||''})
$alertSteer.set(null)}},spans(CLS.inline1,[codicon('zap','0.68rem'),strings.alertStripSteer])),tip(strings.alertStripDismiss,uiBtn('ghost','icon-xs',{'aria-label':strings.alertStripDismiss,onClick:()=>$alertSteer.set(null)},codicon('close','0.72rem')))])}
function ComposerLiveTalkStrip(){
const active=useValue($liveVoiceActive)
const phase=useValue($liveVoicePhase)
const statusTxt=useValue($liveVoiceStatusText)
const replyTxt=useValue($liveVoiceReply)
const lang=useValue($lang)
if(!active)return null
return divs('btw-live-voice-banner mb-1.5 flex-col items-stretch',[
divs('flex min-w-0 w-full items-center justify-between gap-2',[
divs(CLS.rowMin0,[
jsx(BtwVoiceWaveform,{active:phase==='listening'||phase==='speaking'}),
span('rounded bg-[#10b981]/20 px-1.5 py-0.5 font-mono btw-tx-95 font-bold btw-em shrink-0',`LIVE · ${phase.toUpperCase()}`),
span('truncate btw-tx-11 font-medium btw-tp',statusTxt||(lang==='pt'?'Conversando Live — diga \"by the way\" p/ novo banner':'Live Talk — say \"by the way\" for a new banner'))]),
hBtn('btw-action-mode-pill shrink-0',{onClick:()=>stopBtwLiveVoice(true)},lang==='pt'?'Encerrar':'End')]),
replyTxt&&div('mt-1 truncate btw-tx-105 btw-ts border-t border-[#10b981]/20 pt-1',`🔊 ${replyTxt}`)])}
function ComposerTopBtwBanner(){
const showBanner=useValue($showComposerBanner)
const scope=useFocusedSessionScope()
const pendingMap=useValue($pendingBySession)
const entriesMap=useValue($entriesBySession)
const dismissedMap=useValue($bannerDismissedIdBySession)
const pending=pendingMap[scope.key]||null
const entries=entriesMap[scope.key]||[]
const latest=entries.length?entries.reduce((best,cur)=>(Number(cur?.created_at||0)>=Number(best?.created_at||0)?cur:best),entries[entries.length - 1]):null
const dismissedId=dismissedMap[scope.key]||''
const showLatest=Boolean(!pending&&latest&&latest.id!==dismissedId)
useEffect(()=>{
if((!showBanner||(!pending&&!showLatest))&&$bannerLaserTarget.get()&&!$bannerLaserTarget.get()?.demo){
$bannerLaserTarget.set(null)}
},[showBanner,Boolean(pending),showLatest])
if(!showBanner||(!pending&&!showLatest))return null
return jsx(ComposerTopBtwBannerActive,{scope,pending,latest,showLatest})}
function ComposerTopBtwBannerActive({scope,pending,latest,showLatest}){
const bannerThemeMode=useValue($bannerThemeMode)
const bannerSizeMode=useValue($bannerSizeMode)
const themeProps=useThemeProps()
const lang=useValue($lang)
const expandedMap=useValue($bannerExpandedBySession)
const laserTarget=useValue($bannerLaserTarget)
const strings=I18N[lang]||I18N.en
const bannerDomRef=useRef(null)
const lastReadyIdRef=useRef('')
const elapsedPending=useElapsedSeconds(pending?.startedAt,Boolean(pending))
const latestHasMedia=Boolean(latest&&(latest.media_pending||(Array.isArray(latest.media_items)&&latest.media_items.length>0)||/MEDIA:/i.test(String(latest.answer||''))))
const petAerialFlight=useValue($petAerialFlight)
useSessionRadar(scope,Boolean(pending||showLatest))
useEffect(()=>{
 if(!petAerialFlight||(!pending&&!showLatest)){
 if($bannerLaserTarget.get()&&!$bannerLaserTarget.get()?.demo)$bannerLaserTarget.set(null)
 return undefined
}
const measureBanner=phaseName=>{
const el=bannerDomRef.current
if(!el)return
const r=el.getBoundingClientRect()
if(r.width<=0&&r.height<=0)return
$bannerLaserTarget.set({x:Math.round(r.left + Math.min(180,r.width * 0.28)),y:Math.round(r.top + 14),width:Math.round(r.width),
height:Math.round(r.height),phase:phaseName,entryId:latest?.id||pending?.taskId||'active',ts:Date.now()})}
if(pending){if(_laserReadyTimer){cancelTimer(_laserReadyTimer)
_laserReadyTimer=null}
measureBanner('loading')
const iv=setInterval(()=>measureBanner('loading'),260)
return()=>clearInterval(iv)}
if(showLatest&&latest?.id&&lastReadyIdRef.current!==latest.id){lastReadyIdRef.current=latest.id
measureBanner('ready_burst')
updatePetAffection({lastEurekaAt:Date.now()})
const isPt=$lang.get()==='pt'
const readyLine=isPt?'⚡✨ *Zzzap-Eureka!* Laser concluído: banner /btw pronto para leitura no chat!'
:'⚡✨ *Zzzap-Eureka!* Laser complete: /btw banner materialized and ready to read!'
petSay('laser-ready',readyLine,'good',7000)
if(_laserReadyTimer)cancelTimer(_laserReadyTimer)
_laserReadyTimer=scheduleTimer(()=>{_laserReadyTimer=null
if($bannerLaserTarget.get()?.phase==='ready_burst'){$bannerLaserTarget.set(null)}
},2400)}
return undefined
},[petAerialFlight,Boolean(pending),showLatest,latest?.id,pending?.taskId])
const expanded=expandedMap[scope.key]!==undefined?Boolean(expandedMap[scope.key]):Boolean(latestHasMedia)
const toggleExpand=()=>$bannerExpandedBySession.set({...$bannerExpandedBySession.get(),[scope.key]:!expanded})
const dismiss=()=>{if(latest){$bannerDismissedIdBySession.set({...$bannerDismissedIdBySession.get(),[scope.key]:latest.id})}
}
const toggleSizeMode=()=>{
const next=bannerSizeMode==='comfortable'?'compact':'comfortable'
setPref($bannerSizeMode,next,'bannerSizeMode')
if(!expanded)toggleExpand()
haptic?.('tap')}
const latestTitle=latest?deriveBtwCardTitle(latest):''
const activeLaserPhase=pending?'loading':laserTarget?.phase==='ready_burst'?'ready_burst':''
return divs({ref:bannerDomRef,cls:'btw-composer-banner','data-banner-theme':bannerThemeMode,'data-banner-size':bannerSizeMode,'data-has-media':latestHasMedia?'true':undefined,'data-laser-state':activeLaserPhase||undefined,'data-btw-theme':bannerThemeMode==='studio'?themeProps['data-btw-theme']:undefined,style:bannerThemeMode==='studio'?themeProps.style:undefined},[divs('btw-composer-banner-bar',[pending?divs(CLS.rowMin0,[
jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent}),jsx(Badge,{variant:'default',size:'xs',
className:'font-mono tabular-nums',children: `/btw · ${elapsedPending}`}),span({cls:'btw-banner-laser-pill shrink-0','data-phase':'loading'},lang==='pt'?'⚡ LASER PET':'⚡ PET LASER'),
jsx(DecodeText,{text:'BTW',prefix:0,cursor:true,className:'btw-decode shrink-0'}),span('truncate btw-ts',strings.answeringParallel(pending.question))]):hsBtn('flex min-w-0 flex-1 items-center gap-1.5 text-left bg-transparent border-0 p-0 cursor-pointer',{'aria-expanded':expanded?'true':'false',title:latest.question||latestTitle,onClick:toggleExpand},[jsx(DisclosureCaret,{
open:expanded,size:'0.75rem',className:CLS.accent}),jsx(Badge,{variant:'default',size:'xs',
className:'font-mono shrink-0',children:'/btw'}),activeLaserPhase==='ready_burst'&&span({cls:'btw-banner-laser-pill shrink-0','data-phase':'ready_burst'},lang==='pt'?'✨ PRONTO!':'✨ READY!'),
latestHasMedia&&span('rounded btw-bg-ac18 px-1.5 py-px font-mono btw-tx-9 font-semibold btw-ac shrink-0',latest.media_pending?(lang==='pt'?'⏳ GERANDO MÍDIA…':'⏳ GENERATING MEDIA…'):(Array.isArray(latest.media_items)&&latest.media_items.some(m=>m?.kind==='video')?'🎬 VIDEO':'🎨 IMAGE')),
span('truncate font-semibold btw-tp',latestTitle||latest.question||strings.answerReady),latest.duration_ms?span('shrink-0 btw-tx-10 btw-tq tabular-nums',`(${(latest.duration_ms / 1000).toFixed(1)}s)`)
:null]),divs(CLS.rowShrink1,[
!pending&&
latest&&hs(Fragment,null,[hBtn('btw-banner-ghost-btn',{title:strings.cardFooterContinueTip,onClick:()=>{attachBtwCardToComposer(latest,'ask_btw')
requestOpenStudio({tab:'ask'})}},strings.cardFooterContinueBtn),hBtn('btw-banner-ghost-btn',{title:strings.bannerSizeTip,onClick:toggleSizeMode},bannerSizeMode==='comfortable'?strings.bannerSizeComfortable:strings.bannerSizeCompact),jsx(CopyButton,{
text:latest.answer,appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,'aria-label':strings.copyAnswer})]),
uiBtn('ghost','xs',{onClick:()=>requestOpenStudio({tab:'ask'})},strings.openStudio),
!pending&&
uiBtn('ghost','icon-xs',{onClick:dismiss,title:strings.hideBanner,'aria-label':strings.hideBanner},codicon('close'))])]),
!pending&&
showLatest&&expanded&&div({cls:'btw-composer-banner-body','data-selectable-text':'true',onPointerDown:e=>e.stopPropagation()},jsx(BtwRichAnswerBody,{text:latest.answer,entry:latest,sessionScope:scope,mediaFirst: true}))])}
function StatusBarBtwChip(){
const[open,setOpen]=useState(false)
const chipRef=useRef(null)
const showChip=useValue($showStatusbarChip)
const pinned=useValue($pinned)
const themeProps=useThemeProps()
const dialogOpen=useValue($dialogOpen)
const wide=useValue($popoverWide)
const lang=useValue($lang)
const scope=useFocusedSessionScope()
const pendingMap=useValue($pendingBySession)
const entriesMap=useValue($entriesBySession)
const strings=I18N[lang]||I18N.en
const pending=pendingMap[scope.key]||null
const count=(entriesMap[scope.key]||[]).length
return divs('inline-flex h-full items-center',[showChip&&jsxs(Popover,{open,onOpenChange:next=>{
haptic?.('tap')
setOpen(next)},children:[jsx(PopoverTrigger,{asChild:true,children:jsxs('button',{ref:chipRef,type:'button',
title:strings.openStatusbarTip,'data-active':pending||open?'true':undefined,className:'btw-statusbar-chip',children:[pending?jsx(GlyphSpinner,{spinner:'braille'}):themeProps['data-btw-theme'] === 'orbyx' ? jsx(BtwBrandIcon, { size: 12 }) : null,
jsx('span',{className:'tabular-nums',children:count>0? `/btw (${count})` :'/btw'})]})}),jsx(PopoverContent,{side:'top',
align:'end',sideOffset:12,arrowPadding:22,collisionPadding:12,'data-wide':wide?'true':'false','data-pinned':pinned?'true':'false',
'data-btw-theme':themeProps['data-btw-theme'],'data-btw-density':themeProps['data-btw-density'],style:themeProps.style,
className:'btw-studio-popover',onOpenAutoFocus:focusIntoSurface,onCloseAutoFocus:e=>{e.preventDefault()
chipRef.current?.focus?.({preventScroll:true})},...dismissGuards(chipRef),children:open?jsx(StudioSurfaceBody,{scope,
inDialog:false,onClose:()=>setOpen(false)}):null})]}),jsx(Dialog,{open:dialogOpen,
onOpenChange:next=>$dialogOpen.set(Boolean(next)),children:jsxs(DialogContent,{showCloseButton:false,blurBackdrop:false,
className:'btw-studio-dialog','data-btw-theme':themeProps['data-btw-theme'],'data-btw-density':themeProps['data-btw-density'],
style:themeProps.style,bodyClassName:'p-0 flex flex-col max-h-[86vh] overflow-hidden',onOpenAutoFocus:focusIntoSurface,
onEscapeKeyDown:dismissGuards(null).onEscapeKeyDown,children:[jsxs(DialogHeader,{className:'sr-only',children:[
jsx(DialogTitle,{children:'BTW Studio'}),jsx(DialogDescription,{children:strings.dialogDesc})]},'sr-head'),dialogOpen?jsx(StudioSurfaceBody,{scope,inDialog:true,onClose:()=>$dialogOpen.set(false)},'body'):null]})}),jsx(BtwMediaLightbox,{}),
jsx(BtwAerialMascotFlight,{scope})])}
function toggleCompanionChat(){setHudOpen(!$hudOpen.get())}
const DEMO_SESSION_MESH={
 ok:true,focus_session_id:'demo-session',focus_short_id:'fdea04e2b041',
 focus_title:'BTW Studio v5.8.0 · Session Mesh & Conflict Guard',focus_model:'claude-sonnet-4-5',
 focus_written_files:['desktop/plugin.js (L8100-8600)','runtime.py (L5480-6180)'],
 focus_boundary_note:'SessionMeshView & Conflict Radar',workspace_cwd:'/workspace/hermes-btw-studio',
 git_repo_root:'/workspace/hermes-btw-studio',git_repo_leaf:'hermes-btw-studio',git_branch:'main',
 auto_guard_enabled:true,linked_ids:['local-sibling-media','local-sibling-lens'],
 notes:{'local-sibling-media':'Media Deck & Lightbox','local-sibling-lens':'5D/6D Cognitive Radar'},
 file_claims:{'plugin.js':{owner_id:'demo-session',zone:'L8100-8600',claimed_at:Date.now()/ 1000}},
 file_matrix:[
{
 file:'runtime.py',status:'collision',claimed_by:null,readers:[],
 writers:[
{session_id:'demo-session',short_id:'fdea04e2b041',title:'Session Mesh Guard',is_focus:true,is_active:true,ranges:['L5480-6180']},
{session_id:'local-sibling-media',short_id:'6390a832c19e',title:'Media Tools Sync',is_focus:false,is_active:true,ranges:['L5510-5640']}
]
},
{
 file:'plugin.js',status:'shared_disjoint',claimed_by:{owner_id:'demo-session',zone:'L8100-8600'},readers:[],
 writers:[
{session_id:'demo-session',short_id:'fdea04e2b041',title:'Session Mesh Guard',is_focus:true,is_active:true,ranges:['L8100-8600']},
{session_id:'local-sibling-media',short_id:'6390a832c19e',title:'Media Tools & Lightbox Sync',is_focus:false,is_active:true,ranges:['L4750-5050']}
]
}
],
 all_mesh_subagents:[
{
 id:'20261110_181349_51a5c1',short_id:'1349_51a5c1',title:'FastAPI Route Auditor',model:'gemini-2.5-flash',
 running:true,tools:14,parent_session_id:'local-sibling-media',parent_short_id:'6390a832c19e',
 parent_title:'Media Tools & Lightbox Sync',is_focus_child:false,written_files:['plugin_api.py (L600-695)'],
 conflict_steer_directive:'[BTW Studio Subagent Guard] Stay confined to plugin_api.py (L600-695).'
}
],
 active_parallel_count:2,high_risk_count:1,medium_risk_count:1,
 related_sessions:[
{
 id:'local-sibling-media',short_id:'6390a832c19e',mention:'@session:default/local-sibling-media',
 title:'Media Tools & Lightbox Sync',profile:'default',model:'claude-sonnet-4-5',
 same_workspace:true,same_git:true,same_folder:true,git_repo_leaf:'hermes-btw-studio',git_branch:'main',
 workspace_leaf:'hermes-btw-studio',shared_scope_badge:'⎇ hermes-btw-studio · main',linked:true,
 active_lease:true,is_active_now:true,age_seconds:12,
 intent_preview:'Sync media tools and lightbox zoom.',boundary_note:'Media Deck & Lightbox',
 sibling_steer_directive:'[BTW Studio Guard] Keep edits within BtwMediaDeck and media routes.',
 self_avoid_steer_directive:'[BTW Studio Guard] Sibling @6390a832 owns BtwMediaDeck and runtime.py L5510-5640.',
 written_files:['runtime.py (L5510-5640)','plugin.js (L4750-5050)'],read_files:['plugin_api.py'],
 shared_write_files:['runtime.py','plugin.js'],line_collisions:['runtime.py (L5480-6180 ⚔ L5510-5640)'],
 disjoint_shared_files:['plugin.js (L8100-8600 vs L4750-5050)'],similarity_score:0.88,conflict_risk:'high',subagents:[]
}
],
 conflict_guard_directive:'=== BTW STUDIO MULTI-SESSION CONFLICT GUARD ===\nRead target line ranges fresh before targeted patching; do not overwrite sibling zones.'
}
function SessionMeshView({scope,onClose}){
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const demoMode=useValue($demoShowcase)
const backendCfg=useValue($backendSettings)||{}
const targetSid=scope.storedId||scope.runtimeId||''
const[subView,setSubView]=useState('all')
const[riskFilter,setRiskFilter]=useState('ALL')
const[searchQuery,setSearchQuery]=useState('')
const[hoveredNode,setHoveredNode]=useState('')
const[expandedSubBySession,setExpandedSubBySession]=useState({})
const[contractOpen,setContractOpen]=useState(false)
const[showRawContract,setShowRawContract]=useState(false)
const[editingBoundaryId,setEditingBoundaryId]=useState('')
const[boundaryDraft,setBoundaryDraft]=useState('')
const[claimingFile,setClaimingFile]=useState('')
const[claimZoneDraft,setClaimZoneDraft]=useState('')
const[auditingLlm,setAuditingLlm]=useState(false)
const[llmReport,setLlmReport]=useState('')
const[broadcasting,setBroadcasting]=useState(false)
const meshQuery=useQuery({queryKey:[ID,'session-mesh-full',scope.profile,targetSid,lang],enabled:Boolean(_rest&&!demoMode),
queryFn:()=>_rest(`/sessions/mesh?session_id=${encodeURIComponent(targetSid)}&use_llm=false&lang=${lang}`,{timeoutMs:10000}),
staleTime:3000,refetchInterval:6000,retry:1})
const rawMesh=meshQuery.data
const mesh=useMemo(()=>{if(demoMode){
return DEMO_SESSION_MESH}
return rawMesh?.ok?rawMesh:(rawMesh||{ok:true,related_sessions:[],file_matrix:[],all_mesh_subagents:[],linked_ids:[],file_claims:{},active_parallel_count:0,high_risk_count:0,medium_risk_count:0,conflict_guard_directive:''})
},[rawMesh,demoMode])
const relatedSessions=useMemo(
()=>(Array.isArray(mesh?.related_sessions)?mesh.related_sessions:[]).filter(rs=>rs&&rs.is_active_now!==false),
[mesh?.related_sessions]
)
const fileMatrix=Array.isArray(mesh?.file_matrix)?mesh.file_matrix:[]
const meshSubagents=useMemo(
()=>(Array.isArray(mesh?.all_mesh_subagents)?mesh.all_mesh_subagents:[]).filter(s=>s&&s.running!==false),
[mesh?.all_mesh_subagents]
)
const linkedIds=Array.isArray(mesh?.linked_ids)?mesh.linked_ids:[]
const fileClaims=mesh?.file_claims&&typeof mesh.file_claims==='object'?mesh.file_claims:{}
const highRiskCount=Number(mesh?.high_risk_count||0)
const medRiskCount=Number(mesh?.medium_risk_count||0)
const activeParallelCount=relatedSessions.length + meshSubagents.length
const autoGuardOn=mesh?.auto_guard_enabled!==false
const guardDirective=String(mesh?.conflict_guard_directive||'')
const activeLlmSynthesis=llmReport||String(mesh?.llm_synthesis||'')
const contestedFilesCount=fileMatrix.filter(f=>f.status==='collision'||f.status==='shared_disjoint').length
const claimedFilesCount=Object.keys(fileClaims).length
const runningSubagentsCount=meshSubagents.length
const meshAccent=highRiskCount>0?'#f43f5e':activeParallelCount>0||medRiskCount>0?'#f59e0b':'#10b981'
const wsLeaf=splitPathLeaf(mesh.workspace_cwd||scope.cwd||'workspace').leaf||'workspace'
const gitLeaf=String(mesh.git_repo_leaf||splitPathLeaf(mesh.git_repo_root||'').leaf||'').trim()
const gitBranch=String(mesh.git_branch||'').trim()
const repoScopeLabel=gitLeaf? `⎇ ${gitLeaf}${gitBranch? ` · ${gitBranch}` :''}` : `📁 ${wsLeaf}`
const focusShort=(mesh.focus_short_id||'atual').slice(-8)
const formatOwnerBadge=ownerId=>{
const raw=String(ownerId||'').trim()
if(!raw||raw==='demo-session'||raw===mesh.focus_session_id||raw===targetSid){
return isPt?'VOCÊ':'YOU'}
return `@${raw.slice(-8)}`}
const parseLineSpan=rngStr=>{
const m=String(rngStr||'').match(/L(\d+)-(\d+)/i)
if(!m)return null
const a=Number(m[1])||1
const b=Math.max(a + 20,Number(m[2])||a + 100)
return[a,b]}
const filteredSessions=useMemo(()=>{
const q=searchQuery.trim().toLowerCase()
return relatedSessions.filter(rs=>{if(riskFilter==='linked'&&!rs.linked&&!linkedIds.includes(rs.id))return false
if(riskFilter!=='ALL'&&riskFilter!=='linked'&&rs.conflict_risk!==riskFilter)return false
if(!q)return true
return(String(rs.title||'').toLowerCase().includes(q)||String(rs.short_id||'').toLowerCase().includes(q)||
String(rs.intent_preview||'').toLowerCase().includes(q)||(rs.written_files||[]).some(f=>String(f).toLowerCase().includes(q))||
(rs.boundary_note||'').toLowerCase().includes(q))})
},[relatedSessions,riskFilter,linkedIds,searchQuery])
const filteredFiles=useMemo(()=>{
const q=searchQuery.trim().toLowerCase()
return fileMatrix.filter(fm=>{if(riskFilter==='high'&&fm.status!=='collision')return false
if(riskFilter==='medium'&&fm.status!=='shared_disjoint'&&fm.status!=='collision')return false
if(!q)return true
return(String(fm.file||'').toLowerCase().includes(q)||
(fm.writers||[]).some(w=>String(w.title||'').toLowerCase().includes(q)||String(w.short_id||'').toLowerCase().includes(q)))})
},[fileMatrix,riskFilter,searchQuery])
const mutateMesh=async(action,targetIds=[],note='',customSid=null)=>{
const effSid=customSid||targetSid||mesh.focus_session_id||''
if(!_rest)return
let res=await _rest('/sessions/mesh/link',{method:'POST',body:{action,session_id:effSid,target_ids:targetIds,note},
timeoutMs:8000
}).catch(()=>null)
void meshQuery.refetch()
queryClient?.invalidateQueries?.({queryKey:[ID,'session-mesh']})
queryClient?.invalidateQueries?.({queryKey:[ID,'rsi']})
haptic?.('success')}
const runLlmMeshAudit=async()=>{if(!_rest||auditingLlm)return
setAuditingLlm(true)
let res=await _rest(`/sessions/mesh?session_id=${encodeURIComponent(targetSid)}&use_llm=true&lang=${lang}`,{timeoutMs:28000
}).catch(()=>null)
setAuditingLlm(false)
if(res?.llm_synthesis){setLlmReport(res.llm_synthesis)
setContractOpen(true)
haptic?.('success')
host.notify?.({kind:'info',message:isPt?'Partição Semântica IA gerada!':'AI Semantic Partition generated!'})}}
const steerSiblingSessionDirect=async rs=>{
const directive=String(rs.sibling_steer_directive||guardDirective).trim()
if(!directive)return
try{
const rpcRes=await host.request?.('session.steer',{session_id:rs.id,text:directive})
if(rpcRes!==undefined){haptic?.('success')
host.notify?.({kind:'info',message:isPt? `⚡ Steer enviado ao vivo para @${shortSid(rs.short_id)}!`
: `⚡ Live Steer sent to @${shortSid(rs.short_id)}!`})
return}
}catch{}
const drafted=await host.composer?.setDraft?.(rs.id,directive).catch?.(()=>false)
if(drafted){haptic?.('success')
host.notify?.({kind:'info',message:isPt? `Diretiva inserida no Composer de @${shortSid(rs.short_id)}!`
: `Directive placed in Composer of @${shortSid(rs.short_id)}!`})
return}
await writeClipboardText(directive)
haptic?.('tap')
host.notify?.({kind:'info',message:isPt? `Diretiva para @${shortSid(rs.short_id)} copiada!`
: `Directive for @${shortSid(rs.short_id)} copied!`})}
const broadcastHarmonySteerToAll=async()=>{if(broadcasting)return
setBroadcasting(true)
await mutateMesh('link_all_project')
let sentCount=0
if(guardDirective){const okMain=await steerActiveSession(guardDirective,scope,null,{source:'mesh_broadcast'})
if(okMain)sentCount +=1}
for(const sib of relatedSessions.slice(0,6)){
const dir=String(sib.sibling_steer_directive||guardDirective).trim()
if(!dir)continue
let okSib=false
try{const sr=await host.request?.('session.steer',{session_id:sib.id,text:dir})
okSib=Boolean(sr?.status==='queued'||sr?.status==='accepted'||sr?.ok)
}catch{}
if(!okSib){try{okSib=Boolean(await host.composer?.setDraft?.(sib.id,dir))}catch{}}
if(okSib)sentCount +=1}
for(const sub of meshSubagents.slice(0,6)){
const subDir=String(sub.conflict_steer_directive||guardDirective).trim()
const targetSubId=String(sub.subagent_id||sub.rpc_id||sub.id||'').trim()
const parentSid=String(sub.parent_session_id||targetSid||'').trim()
if(!subDir||!targetSubId||(!_rest&&typeof host?.request!=='function'))continue
let okSub=false
if(parentSid&&typeof host?.request==='function'){try{
const gRes=await host.request('subagent.steer',{session_id:parentSid,subagent_id:targetSubId,text:subDir})
okSub=Boolean(gRes?.status==='queued'||gRes?.status==='accepted'||gRes?.ok)
}catch{}}
const subPayload={subagent_id:targetSubId,action:'steer',text:subDir,session_id:parentSid}
if(!okSub&&typeof host?.request==='function'){try{okSub=Boolean((await host.request(`plugin.${ID}.subagent_control`,subPayload))?.ok)}catch{}}
if(!okSub&&_rest){try{okSub=Boolean((await _rest('/subagents/control',{method:'POST',body:subPayload,timeoutMs:8000}))?.ok)}catch{}}
if(okSub)sentCount +=1}
setBroadcasting(false)
haptic?.('success')
host.notify?.({kind:'info',message:isPt? `🛡 Guarda Anti-Conflito enviado para ${sentCount} agente(s)/subagente(s) ativos!`
: `🛡 Conflict Guard broadcast to ${sentCount} active agent(s)/subagent(s)!`})}
return divs('flex flex-col gap-3 text-xs pb-6',[divs('btw-overview-command-bar',[divs('flex min-w-0 flex-wrap items-center gap-1.5',[divs('btw-overview-status-pill',[typeof Loader==='function'&&activeParallelCount>0?jsx(Loader,{
type:highRiskCount>0?'lemniscate-bloom':'rose-orbit',strokeScale:1.15,className:'size-3.5 shrink-0',
style:{color:meshAccent}}):span({cls:'inline-block size-2 rounded-full shrink-0',style:{backgroundColor:meshAccent}}),span(CLS.titleTrunc,highRiskCount>0?isPt? `${highRiskCount} Colisão de Escrita` : `${highRiskCount} Write Collision` :activeParallelCount>0?isPt
? `${activeParallelCount} Ativos na Pasta/Git` : `${activeParallelCount} Active in Folder/Git` :isPt?'Apenas Você Ativo'
:'Only You Active'),span({cls:'font-mono btw-tx-10 btw-ts',title:mesh.git_repo_root||mesh.workspace_cwd||scope.cwd||''},`· ${repoScopeLabel} (@${focusShort})`)]),hBtn('btw-overview-playbook-pill',{title:isPt
?'Auto-Guard: injeta automaticamente limites de arquivos e linhas no /btw, Steer e subagentes ativos'
:'Auto-Guard: automatically injects file & line boundaries into /btw, Steer, and active subagents',onClick:()=>void mutateMesh('toggle_auto_guard',[],autoGuardOn?'off':'on')},[codicon('shield','0.68rem',autoGuardOn?'text-emerald-400':'text-amber-400'),span(null,`Auto-Guard ${autoGuardOn?'ON':'OFF'}`)]),hBtn('btw-filter-pill',{title:isPt?'Definir escopo exclusivo desta sessão':'Set reserved scope for this session',onClick:()=>{
setEditingBoundaryId(prev=>(prev==='focus'?'':'focus'))
setBoundaryDraft(mesh.focus_boundary_note||'')}},isPt?mesh.focus_boundary_note
? `🎯 ${mesh.focus_boundary_note.slice(0,22)}…` :'🎯 Meu Escopo':mesh.focus_boundary_note
? `🎯 ${mesh.focus_boundary_note.slice(0,22)}…` :'🎯 My Scope')]),divs(CLS.rowShrink15,[
hsBtn('btw-composer-synth-btn',{disabled:broadcasting||(activeParallelCount===0&&!guardDirective),title:isPt
?'Transmitir Steer Anti-Conflito para esta sessão e para todas as sessões e subagentes ativos na mesma pasta/Git'
:'Broadcast Conflict Guard Steer to current session and all active sessions & subagents in the same folder/Git',onClick:()=>void broadcastHarmonySteerToAll()},[broadcasting?jsx(GlyphSpinner,{spinner:'braille'})
:codicon('shield','0.72rem'),span(null,broadcasting?isPt?'Enviando…':'Sending…':isPt
?'Steer Todos Ativos':'Steer All Active')]),activeParallelCount>0&&hsBtn('btw-overview-deep-btn',{disabled:auditingLlm,title:isPt?'Sintetizar matriz de partição semântica via IA entre agentes ativos'
:'Synthesize semantic partition matrix via AI across active agents',onClick:()=>void runLlmMeshAudit()},[auditingLlm
?jsx(GlyphSpinner,{spinner:'braille'}):codicon('sparkle','0.72rem','text-sky-400'),
span(null,auditingLlm?'IA…':isPt?'Partição IA':'AI Partition')])])]),editingBoundaryId==='focus'&&
divs('flex items-center gap-1.5 rounded-lg border btw-bd-ac50 btw-bg-ac10 px-2.5 py-1.5',[h('input',{type:'text',cls:'btw-preset-input flex-1 h-[24px] btw-tx-11 px-2',placeholder:isPt
?'Escopo reservado desta sessão (ex: Apenas SessionMeshView e runtime.py L5480-6180)…'
:'Reserved scope for this session (e.g. Only SessionMeshView and runtime.py L5480-6180)…',value:boundaryDraft,onChange:e=>setBoundaryDraft(e.target.value),onKeyDown:e=>{if(e.key==='Enter'){e.preventDefault()
void mutateMesh('set_boundary',[mesh.focus_session_id||targetSid],boundaryDraft)
setEditingBoundaryId('')}}}),hBtn('btw-composer-synth-btn',{onClick:()=>{
void mutateMesh('set_boundary',[mesh.focus_session_id||targetSid],boundaryDraft)
setEditingBoundaryId('')}},isPt?'✓ Salvar':'✓ Save'),hBtn('btw-filter-pill',{'aria-label':strings.cancelBtn,title:strings.cancelBtn,onClick:()=>setEditingBoundaryId('')},'✕')]),divs('btw-live-dash-grid btw-kpi-grid',[
divs({cls:'btw-dash-tile btw-kpi btw-stagger-item','data-clickable':'true','data-active-filter':subView==='sessions'&&riskFilter==='ALL'?'true':'false',style:{'--btw-tile-glow':'#38bdf8'},onClick:()=>{setSubView(prev=>(prev==='sessions'&&riskFilter==='ALL'?'all':'sessions'))
setRiskFilter('ALL')
haptic?.('tap')}},[jsx(SvgRingGauge,{
pct:relatedSessions.length>0?100:25,color:'#38bdf8',size:42,centerLabel:String(relatedSessions.length)}),divs(CLS.colMin0,[h('small',CLS.secHdr,isPt?'Sessões Ativas':'Active Sessions'),h('b',CLS.mono12,relatedSessions.length>0?(isPt? `${relatedSessions.length} paralela(s) agora` : `${relatedSessions.length} parallel now`):(isPt?'Nenhuma outra ativa':'No other active')),span('btw-tx-105 btw-tt truncate',repoScopeLabel)])]),divs({cls:'btw-dash-tile btw-kpi btw-stagger-item','data-clickable':'true','data-active-filter':riskFilter==='high'||riskFilter==='medium'?'true':'false',style:{'--btw-tile-glow':meshAccent,animationDelay:'35ms'},onClick:()=>{
const nextRf=riskFilter!=='ALL'?'ALL':highRiskCount>0?'high':'medium'
setRiskFilter(nextRf)
haptic?.('tap')}},[jsx(SvgRingGauge,{pct:highRiskCount>0?100:medRiskCount>0?65:15,color:meshAccent,size:40,
centerLabel:highRiskCount>0?'⚔':'✓',pulse:highRiskCount>0}),divs(CLS.colMin0,[h('small',CLS.secHdr,isPt?'Conflitos de Escrita':'Write Conflicts'),h('b',CLS.mono12,highRiskCount>0?isPt
? `${highRiskCount} colisão · ${medRiskCount} zonas` : `${pl(highRiskCount,'collision')} · ${pl(medRiskCount,'zone')}` :medRiskCount>0?isPt
? `${medRiskCount} zonas compartilhadas` : `${pl(medRiskCount,'shared zone')}` :isPt?'0 conflitos ativos':'0 active conflicts'),span(CLS.muted105,contestedFilesCount>0?(isPt? `${contestedFilesCount} arq compartilhado(s)` : `${contestedFilesCount} shared file(s)`):(isPt?'Escritas isoladas':'Isolated writes'))])]),divs({cls:'btw-dash-tile btw-kpi btw-stagger-item','data-clickable':'true','data-active-filter':subView==='files'?'true':'false',style:{'--btw-tile-glow':contestedFilesCount>0?'#f59e0b':'#10b981',animationDelay:'70ms'},onClick:()=>{
setSubView(prev=>(prev==='files'?'all':'files'))
haptic?.('tap')}},[jsx(SvgRingGauge,{
pct:fileMatrix.length>0?Math.min(100,Math.round(((fileMatrix.length - contestedFilesCount)/ Math.max(1,fileMatrix.length))* 100)):100,
color:contestedFilesCount>0?'#f59e0b':'#10b981',size:40,centerLabel:String(fileMatrix.length),centerSub:'files'}),divs(CLS.colMin0,[h('small',CLS.secHdr,isPt?'Mapa de Arquivos':'File Line-Map'),h('b',CLS.mono12,isPt
? `${fileMatrix.length} em uso · ${claimedFilesCount} travado(s)` : `${fileMatrix.length} in use · ${claimedFilesCount} locked`),
span(CLS.muted105,isPt? `${contestedFilesCount} em edição múltipla` : `${contestedFilesCount} multi-writer`)])]),divs({cls:'btw-dash-tile btw-kpi btw-stagger-item','data-clickable':'true','data-active-filter':subView==='subagents'?'true':'false',style:{'--btw-tile-glow':'#a855f7',animationDelay:'105ms'},onClick:()=>{setSubView(prev=>(prev==='subagents'?'all':'subagents'))
haptic?.('tap')}},[typeof Blobatar==='function'?div({cls:'flex btw-sz-42 shrink-0 items-center justify-center rounded-full border border-purple-500/35 bg-purple-500/10',style:{width:'42px',height:'42px'}},jsx(Blobatar,{name:'subagents-mesh',size:24,animate:'always'}))
:jsx(SvgRingGauge,{pct:runningSubagentsCount>0?100:20,color:'#a855f7',size:40,centerLabel:String(runningSubagentsCount)}),divs(CLS.colMin0,[h('small',CLS.secHdr,isPt?'Subagentes Ativos':'Active Subagents'),h('b',CLS.mono12,runningSubagentsCount>0?isPt
? `${runningSubagentsCount} rodando agora` : `${runningSubagentsCount} running now` :isPt?'Nenhum ativo':'None running'),span(CLS.muted105,runningSubagentsCount>0?(isPt?'Steer direto disponível':'Direct Steer ready'):(isPt?'Zero conflito de subagente':'Zero subagent conflict'))])])]),
activeParallelCount===0&&fileMatrix.length===0?divs('btw-session-mesh-card rounded-xl border btw-bd-st70 btw-bg-tp2 p-4 flex flex-col gap-3',[
divs('flex items-start justify-between gap-3',[
divs('flex items-start gap-2.5 min-w-0',[
div('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/10 text-emerald-400',codicon('shield','0.95rem')),
divs('flex flex-col gap-1 min-w-0',[
div('btw-tx-125 font-semibold btw-tp',isPt?'Nenhuma outra sessão ou subagente ativo nesta pasta/Git':'No other active session or subagent in this folder/Git'),
div('btw-tx-11 leading-relaxed btw-ts',isPt
? `A Malha filtra apenas agentes e subagentes ativos em tempo real. Quando outra sessão ou subagente mexer em ${repoScopeLabel}, os arquivos sobrepostos e botões de Steer aparecerão aqui automaticamente.`
: `Mesh strictly tracks live active agents and subagents. Whenever another session or subagent touches ${repoScopeLabel}, overlapping files and direct Steer controls appear here automatically.`)
])
]),
hBtn('btw-filter-pill shrink-0 btw-ac btw-bd-ac45',{onClick:()=>{$demoShowcase.set(true);haptic?.('tap')}},isPt?'✦ Simular Conflito (Demo)':'✦ Simulate Collision (Demo)')
]),
Array.isArray(mesh.focus_written_files)&&mesh.focus_written_files.length>0&&divs('flex flex-wrap items-center gap-1.5 pt-2 border-t btw-bd-st40',[
span('btw-tx-10 font-semibold uppercase tracking-wider btw-tt mr-1',isPt?'Suas escritas nesta sessão (clique p/ reservar trava 🔒):':'Your writes in this session (click to lock zone 🔒):'),
...mesh.focus_written_files.map(fw=>{
const baseFn=String(fw).split(' ')[0].trim()
const isLocked=Boolean(fileClaims[baseFn])
return hBtn(cn('btw-mesh-line-chip cursor-pointer btw-hv-bdac',isLocked&&'text-amber-300 border-amber-400/50'),{title:isLocked?(isPt?'Clique para liberar trava':'Click to release lock'):(isPt?'Clique para travar este arquivo na malha':'Click to lock this file in mesh'),onClick:()=>void mutateMesh(isLocked?'unclaim_file':'claim_file',[baseFn],'')},`${isLocked?'🔒':'📄'} ${fw}`,fw)
})
])
]):hs(Fragment,null,[
divs('btw-learn-filter-bar',[
divs(CLS.rowWrap1,[[{id:'all',label:isPt?'Visão Geral':'Overview'},
{id:'files',label:isPt? `Arquivos (${fileMatrix.length})` : `Files (${fileMatrix.length})` },
{id:'sessions',label:isPt? `Sessões Ativas (${relatedSessions.length})` : `Active Sessions (${relatedSessions.length})` },
...(meshSubagents.length>0?[{id:'subagents',label:isPt? `Subagentes (${meshSubagents.length})` : `Subagents (${meshSubagents.length})` }]:[]),
{id:'contract',label:isPt?'Contrato Steer':'Steer Contract'}
].map(tabOpt=>hBtn('btw-filter-pill',{'data-active':subView===tabOpt.id?'true':'false',onClick:()=>{setSubView(tabOpt.id)
if(tabOpt.id==='contract')setContractOpen(true)
haptic?.('tap')}},tabOpt.label,tabOpt.id)),(riskFilter!=='ALL'||searchQuery)&&hBtn('btw-filter-pill text-rose-300 border-rose-400/50',{onClick:()=>{setRiskFilter('ALL')
setSearchQuery('')
haptic?.('tap')}},isPt?'✕ Limpar':'✕ Reset')]),h('input',{type:'text',cls:'btw-preset-input h-[24px] w-48 btw-tx-105 px-2.5',placeholder:isPt?'Buscar arquivo, @sessão ou escopo…':'Search file, @session or scope…',value:searchQuery,onChange:e=>setSearchQuery(e.target.value)})]),
(subView==='all'||subView==='sessions')&&relatedSessions.length>0&&divs(CLS.col15,[div(CLS.secHdrMuted,isPt
? `Sessões Ativas na Mesma Pasta / Git (${filteredSessions.length})`
: `Active Sessions in Same Folder / Git (${filteredSessions.length})`),filteredSessions.map(rs=>{
const isLinked=Boolean(rs.linked||linkedIds.includes(rs.id))
const isEditingThis=editingBoundaryId===rs.id
const subs=(Array.isArray(rs.subagents)?rs.subagents:[]).filter(s=>s&&s.running!==false)
const subsOpen=expandedSubBySession[rs.id]!==undefined?Boolean(expandedSubBySession[rs.id]):true
const hasRealFileOverlap=Boolean((rs.shared_write_files&&rs.shared_write_files.length>0)||(rs.write_vs_read_files&&rs.write_vs_read_files.length>0)||(rs.disjoint_shared_files&&rs.disjoint_shared_files.length>0))
const effRisk=rs.conflict_risk==='high'||(rs.line_collisions&&rs.line_collisions.length>0)?'high':hasRealFileOverlap?'medium':'workspace'
const riskLbl=effRisk==='high'?(isPt?'Colisão':'Collision'):effRisk==='medium'?(isPt?'Mesmo Arq':'Shared File'):(isPt?'Mesmo Repo':'Same Repo')
const showScopeChip=Boolean(rs.shared_scope_badge&&rs.shared_scope_badge!==repoScopeLabel)
return divs({cls:'btw-mesh-row','data-risk':effRisk},[divs('flex items-center justify-between gap-2 min-w-0',[divs('flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden',[span('inline-block size-2 shrink-0 rounded-full bg-emerald-400 animate-pulse'),span({cls:'btw-mesh-risk-badge shrink-0','data-risk':effRisk},riskLbl),span({cls:'font-semibold btw-tx-115 btw-tp truncate min-w-0 flex-1',title:rs.title},rs.title),span('font-mono btw-tx-95 btw-tt shrink-0',`@${shortSid(rs.short_id)}`)]),
divs(CLS.rowShrink1,[hBtn('btw-composer-synth-btn',{title:isPt?`Enviar Steer Anti-Conflito para @${shortSid(rs.short_id)}`:`Send Conflict Guard Steer to @${shortSid(rs.short_id)}`,onClick:()=>void steerSiblingSessionDirect(rs)},isPt?'⚡ Steer Irmã':'⚡ Steer Sibling'),hBtn('btw-tile-mini-btn',{title:isPt?'Anexar sessão ao chat /btw':'Attach session to /btw chat',onClick:()=>{addBtwAttachment({id:`sess_${rs.short_id||rs.id}`,kind:'session',session_id:rs.id,label:rs.mention||`@session:${rs.id}`,detail:rs.title});stageCommandInBtwChat(isPt?`Analise o que a sessão ativa ${rs.mention} está modificando (${(rs.written_files||[]).join(', ')||'workspace'}) e proponha uma divisão limpa sem conflito de escrita.`:`Analyze what active session ${rs.mention} is modifying (${(rs.written_files||[]).join(', ')||'workspace'}) and propose a conflict-free split.`,{label:isPt?`Sessão @${shortSid(rs.short_id)} no /btw`:`Session @${shortSid(rs.short_id)} in /btw`,icon:'git-merge'});haptic?.('tap')}},'/btw'),hBtn('btw-filter-pill',{'aria-label':isPt?'Limite de escopo':'Scope boundary','data-active':isEditingThis||Boolean(rs.boundary_note)?'true':'false',title:isPt?'Definir limite de escopo':'Set scope boundary',onClick:()=>{setEditingBoundaryId(prev=>prev===rs.id?'':rs.id);setBoundaryDraft(rs.boundary_note||'')}},'🎯')])]),divs(CLS.rowWrapBetweenSm,[divs(CLS.rowWrap1,[
showScopeChip&&span('btw-mesh-line-chip text-sky-300 border-sky-500/35',rs.shared_scope_badge),
rs.boundary_note&&span('btw-mesh-line-chip text-emerald-300 border-emerald-500/40',`🛡 ${rs.boundary_note}`),
...(rs.line_collisions||[]).map(lc=>span('btw-mesh-line-chip text-rose-300 border-rose-500/45',`⚔ ${lc}`,lc)),
...(rs.disjoint_shared_files||[]).slice(0,2).map(df=>span('btw-mesh-line-chip text-amber-300 border-amber-400/45',`⇄ ${df}`,df)),
...(rs.written_files||[]).slice(0,3).map(wf=>span('btw-mesh-line-chip',`📄 ${wf}`,wf)),
!hasRealFileOverlap&&!(rs.written_files&&rs.written_files.length>0)&&span('btw-mesh-line-chip btw-tt',isPt?'Somente leitura · 0 sobreposições':'Read-only · 0 file overlaps')]),
divs(CLS.rowShrink1,[rs.self_avoid_steer_directive&&hBtn('btw-tile-mini-btn',{'data-tone':'steer',title:isPt?`Evitar arquivos de @${shortSid(rs.short_id)}`:`Avoid files touched by @${shortSid(rs.short_id)}`,onClick:()=>void steerActiveSession(rs.self_avoid_steer_directive,scope,null,{source:'mesh_self_avoid'})},isPt?'🛡 Evitar':'🛡 Avoid'),subs.length>0&&hBtn('btw-filter-pill text-purple-300 border-purple-500/45',{'aria-expanded':subsOpen?'true':'false',onClick:()=>setExpandedSubBySession(prev=>({...prev,[rs.id]:!subsOpen}))},`🤖 ${isPt?pl(subs.length,'Subagente Ativo','Subagentes Ativos'):pl(subs.length,'Active Subagent')} ${subsOpen?'▾':'▸'}`)])]),isEditingThis&&divs('flex items-center gap-1.5 pt-1',[h('input',{type:'text',cls:'btw-preset-input flex-1 h-[23px] btw-tx-105 px-2',placeholder:isPt
? `Limite de escopo para @${shortSid(rs.short_id)} (ex: Apenas BtwSettingsPanel)…`
: `Scope boundary for @${shortSid(rs.short_id)} (e.g. Only BtwSettingsPanel)…`,value:boundaryDraft,onChange:e=>setBoundaryDraft(e.target.value),onKeyDown:e=>{if(e.key==='Enter'){e.preventDefault()
void mutateMesh('set_boundary',[rs.id],boundaryDraft)
setEditingBoundaryId('')}}}),hBtn('btw-composer-synth-btn',{onClick:()=>{
void mutateMesh('set_boundary',[rs.id],boundaryDraft)
setEditingBoundaryId('')}},isPt?'✓ Salvar':'✓ Save')]),subsOpen&&subs.length>0&&div('btw-mesh-sub-nested',subs.map(sub=>divs('flex items-center justify-between gap-2 btw-tx-105',[divs(CLS.rowMin0Sm,[span('inline-block size-1.5 rounded-full shrink-0 bg-emerald-400 animate-pulse'),
span('font-medium btw-tp truncate',sub.title||sub.id),
...(sub.written_files||[]).slice(0,2).map(swf=>span('btw-mesh-line-chip',`📄 ${swf}`,swf)),
span('font-mono btw-tx-9 btw-tt shrink-0',`· ${sub.tools||0} tools`)]),
divs(CLS.rowShrink1,[
hBtn('btw-composer-synth-btn h-[21px] px-2 btw-tx-95',{title:isPt?'Enviar Steer Anti-Conflito direto para este Subagente ativo':'Send direct Conflict Guard Steer to this active Subagent',onClick:()=>void steerSubagentSession(sub.subagent_id||sub.rpc_id||sub.id,sub.title||sub.id,sub.conflict_steer_directive||guardDirective,scope)},'⚡ Steer Sub'),
hBtn('btw-tile-mini-btn',{onClick:()=>{$selectedSubagentId.set(sub.id)
$activeTab.set('subagents')
haptic?.('tap')}},isPt?'Inspecionar':'Inspect')
])],sub.id)))],rs.id)})]),
subView==='subagents'&&meshSubagents.length>0&&divs(CLS.col15,[
div(CLS.secHdrMuted,isPt? `Subagentes Ativos em Execução (${meshSubagents.length})` : `Active Running Subagents (${meshSubagents.length})`),
...meshSubagents.map(sub=>divs({cls:'btw-mesh-row','data-risk':'medium'},[
divs(CLS.rowBetween,[
divs(CLS.rowMin0Sm,[
span('inline-block size-2 shrink-0 rounded-full bg-purple-400 animate-pulse'),
span('font-semibold btw-tx-115 btw-tp truncate',`🤖 ${sub.title||sub.id}`),
span('font-mono btw-tx-95 btw-tt shrink-0',`parent @${String(sub.parent_short_id||'').slice(-8)}`),
span('font-mono btw-tx-95 text-purple-300 shrink-0',`${sub.tools||0} tools`)
]),
divs(CLS.rowShrink1,[
hBtn('btw-composer-synth-btn',{title:isPt?'Enviar Steer Anti-Conflito diretamente para este subagente ativo':'Send direct Conflict Guard Steer to this active subagent',onClick:()=>void steerSubagentSession(sub.subagent_id||sub.rpc_id||sub.id,sub.title||sub.id,sub.conflict_steer_directive||guardDirective,scope)},isPt?'⚡ Steer Subagente':'⚡ Steer Subagent'),
hBtn('btw-tile-mini-btn',{onClick:()=>{$selectedSubagentId.set(sub.id);$activeTab.set('subagents');haptic?.('tap')}},isPt?'Ver CoT →':'View CoT →')
])
]),
Array.isArray(sub.written_files)&&sub.written_files.length>0&&divs(CLS.rowWrap1,sub.written_files.map(swf=>span('btw-mesh-line-chip',`📄 ${swf}`,swf)))
],`active_sub_${sub.id}`))
]),
(subView==='all'||subView==='files')&&filteredFiles.length>0&&divs(CLS.col15,[div(CLS.secHdrMuted,isPt?'Mapa de Linhas por Arquivo & Travas':'File Line-Map & Zone Locks'),div('btw-mesh-file-bento-grid',(()=>{
const visFiles=filteredFiles.slice(0,subView==='files'?16:6)
return visFiles.map((fm,fIdx)=>{
const claim=fm.claimed_by||fileClaims[fm.file]||null
const isClaimingThis=claimingFile===fm.file
const isOddLast=visFiles.length>1&&visFiles.length % 2===1&&fIdx===visFiles.length - 1
const statusBadgeLabel=fm.status==='collision'?isPt?'Colisão':'Collision':fm.status==='shared_disjoint'?isPt
?'Zonas Distintas':'Disjoint Zones':isPt?'Exclusivo':'Exclusive'
const allSpans=[]
for(const w of fm.writers||[]){for(const rStr of w.ranges||[]){
const sp=parseLineSpan(rStr)
if(sp)allSpans.push({...w,start:sp[0],end:sp[1],label:rStr})}}
const maxLine=Math.max(1500,...allSpans.map(s=>s.end))
return divs({cls:'btw-mesh-file-card','data-status':fm.status||'exclusive',style:isOddLast?{gridColumn:'1 / -1'}:undefined},[divs('flex items-center justify-between gap-2 min-w-0',[divs(CLS.rowMin0Sm,[codicon(claim?'lock':'file-code','0.78rem',cn('shrink-0',claim?'text-amber-300':CLS.accent)),span({cls:'font-mono btw-tx-115 font-semibold btw-tp truncate',title:fm.file},fm.file)]),
span({cls:'btw-mesh-risk-badge shrink-0','data-risk':fm.status==='collision'?'high':fm.status==='shared_disjoint'?'medium':'low'},statusBadgeLabel)]),div({cls:'btw-file-linemap-track',title:isPt? `Mapa proporcional de linhas editadas em ${fm.file} (L1 – L${maxLine})`
: `Proportional edited line-range map in ${fm.file} (L1 – L${maxLine})`},allSpans.length>0?allSpans.map((seg,sIdx)=>{
const leftPct=Math.max(0,Math.min(94,Math.round((seg.start / maxLine)* 100)))
const widthPct=Math.max(6,Math.min(100 - leftPct,Math.round(((seg.end - seg.start)/ maxLine)* 100)))
const segColor=fm.status==='exclusive'?'#10b981':seg.is_focus?'#38bdf8':fm.status==='collision'?'#f43f5e':'#f59e0b'
return div({cls:'btw-file-linemap-seg',style:{left: `${leftPct}%`,width: `${widthPct}%`,backgroundColor:segColor,
boxShadow: `0 0 8px ${segColor}`},title: `${seg.is_focus?(isPt?'VOCÊ':'YOU'): `@${shortSid(seg.short_id)}`}: ${seg.label}`},undefined,`${seg.session_id}_${sIdx}`)}):[div({cls:'btw-file-linemap-seg',style:{left:'0%',width:'100%',background:fm.status==='exclusive'?'#10b981':'#38bdf8',opacity:0.45}},undefined,'full')]),isClaimingThis&&divs('flex items-center gap-1.5 pt-0.5',[
h('input',{type:'text',cls:'btw-preset-input flex-1 h-[23px] btw-tx-105 px-2',placeholder:isPt?'Zona opcional (ex: L10000-12500)…':'Optional zone (e.g. L10000-12500)…',value:claimZoneDraft,onChange:e=>setClaimZoneDraft(e.target.value),onKeyDown:e=>{if(e.key==='Enter'){e.preventDefault()
void mutateMesh('claim_file',[fm.file],claimZoneDraft)
setClaimingFile('')}}}),hBtn('btw-composer-synth-btn',{onClick:()=>{
void mutateMesh('claim_file',[fm.file],claimZoneDraft)
setClaimingFile('')}},isPt?'✓ Travar':'✓ Lock')]),divs('flex items-center justify-between gap-2 pt-0.5',[divs('flex flex-wrap items-center gap-1 min-w-0 flex-1',(fm.writers||[]).map(w=>spans({cls:'btw-mesh-line-chip','data-focus':w.is_focus?'true':'false',title:w.title},[span({cls:cn('inline-block size-1.5 rounded-full',w.is_active?'bg-emerald-400':'bg-slate-400')}),
span(null,w.is_focus?(isPt?'VOCÊ':'YOU'): `@${shortSid(w.short_id)}`),w.ranges?.length>0&&span(CLS.muted,w.ranges.join(', '))],`${fm.file}_${w.session_id}`))),
claim?hBtn('btw-filter-pill shrink-0 text-amber-300 border-amber-400/50',{title:isPt?'Clique para liberar a trava deste arquivo':'Click to release lock on this file',onClick:()=>void mutateMesh('unclaim_file',[fm.file])},`🔒 ${formatOwnerBadge(claim.owner_id)}${claim.zone? ` (${claim.zone.slice(0,12)})` :''}`):hBtn('btw-tile-mini-btn shrink-0',{onClick:()=>{setClaimingFile(prev=>(prev===fm.file?'':fm.file))
setClaimZoneDraft('')}},isPt?'🔒 Travar':'🔒 Lock')])],fm.file)})})())]),
subView==='all'&&(relatedSessions.length>0||meshSubagents.length>0||fileMatrix.length>0)&&
divs({cls:'btw-mesh-topology-stage',style:{'--mesh-accent':meshAccent}},[divs(CLS.rowWrapBetween,[spans('inline-flex items-center gap-1.5 btw-tx-11 font-semibold btw-tp',[
codicon('git-merge','0.78rem',CLS.accent),
isPt? `Topologia Ativa · ${repoScopeLabel}` : `Active Topology · ${repoScopeLabel}`]),divs('flex items-center gap-1.5 font-mono btw-tx-95',[hBtn('btw-filter-pill text-rose-300 border-rose-400/50',{'data-active':riskFilter==='high'?'true':'false',onClick:()=>setRiskFilter(prev=>(prev==='high'?'ALL':'high'))},isPt?'● Colisão de Linha':'● Line Collision'),
hBtn('btw-filter-pill text-amber-300 border-amber-400/50',{'data-active':riskFilter==='medium'?'true':'false',onClick:()=>setRiskFilter(prev=>(prev==='medium'?'ALL':'medium'))},isPt?'● Mesmo Arquivo':'● Shared File'),hBtn('btw-filter-pill text-emerald-300 border-emerald-400/50',{'data-active':riskFilter==='linked'?'true':'false',onClick:()=>setRiskFilter(prev=>(prev==='linked'?'ALL':'linked'))},isPt?'● Isolado':'● Isolated')])]),
h('svg',{viewBox:'0 0 690 156',cls:'w-full h-[142px] select-none overflow-hidden',onMouseLeave:()=>setHoveredNode('')},(()=>{
const topFiles=fileMatrix.slice(0,4)
const peerNodes=[
...relatedSessions.map(s=>({...s,isSubNode:false})),
...meshSubagents.map(sub=>({
id:sub.id,
short_id:sub.short_id||shortSid(sub.id),
title: `🤖 ${sub.title||sub.id}`,
conflict_risk:'medium',
is_active_now:true,
isSubNode:true,
shared_scope_badge: `parent @${(sub.parent_short_id||'').slice(-6)}`,
shared_write_files:(sub.written_files||[]).map(x=>String(x).split(' ')[0])
}))
].slice(0,4)
const focusY=78
const focusX=76
const fileX=310
const sibX=562
const fileY=idx=>(topFiles.length===1?78:24 + idx *(108 / Math.max(1,topFiles.length - 1)))
const sibY=idx=>(peerNodes.length===1?78:22 + idx *(112 / Math.max(1,peerNodes.length - 1)))
const trimMid=(s,max=20)=>{
const clean=String(s||'').trim()
if(clean.length<=max)return clean
const head=Math.ceil((max - 1)* 0.55)
const tail=Math.floor((max - 1)* 0.45)
return `${clean.slice(0,head)}…${clean.slice(-tail)}`}
return hs(Fragment,null,[...topFiles.map((fm,fi)=>{
const fy=fileY(fi)
const col=fm.status==='collision'?'#f43f5e':fm.status==='shared_disjoint'?'#f59e0b':'#10b981'
const isDimmed=hoveredNode&&hoveredNode!==fm.file&&hoveredNode!=='focus'
return h('path',{d: `M ${focusX + 60} ${focusY} C ${focusX + 125} ${focusY}, ${fileX - 135} ${fy}, ${fileX - 76} ${fy}`,fill:'none',stroke:col,strokeWidth:fm.status==='collision'?2.4:1.7,cls:fm.status==='collision'||fm.status==='shared_disjoint'?'btw-mesh-flow-edge':'btw-mesh-static-edge',opacity:isDimmed?0.18:0.9},undefined,`edge_f_${fm.file}`)}),...peerNodes.flatMap((sib,si)=>{
const sy=sibY(si)
const matchedFiles=topFiles
.map((fm,fi)=>({fm,fi}))
.filter(x=>(sib.shared_write_files||[]).includes(x.fm.file)||(x.fm.writers||[]).some(w=>w.session_id===sib.id))
const pairs=matchedFiles.length>0?matchedFiles:topFiles.length>0?[{fm:topFiles[0],fi:0}]:[]
return pairs.map(({fm,fi})=>{
const fy=fileY(fi)
const rCol=fm.status==='collision'||sib.conflict_risk==='high'?'#f43f5e':fm.status==='shared_disjoint'||sib.conflict_risk==='medium'?'#f59e0b':'#10b981'
const isDimmed=hoveredNode&&hoveredNode!==fm.file&&hoveredNode!==sib.id&&hoveredNode!=='focus'
return h('path',{d: `M ${fileX + 76} ${fy} C ${fileX + 135} ${fy}, ${sibX - 140} ${sy}, ${sibX - 88} ${sy}`,fill:'none',stroke:rCol,strokeWidth:rCol==='#f43f5e'?2.4:1.7,cls:'btw-mesh-flow-edge',opacity:isDimmed?0.16:0.92},undefined,`edge_sf_${fm.file}_${sib.id}`)})}),hs('g',{transform: `translate(${focusX}, ${focusY})`,cls:'cursor-pointer',onMouseEnter:()=>setHoveredNode('focus'),onClick:()=>{
setEditingBoundaryId(prev=>(prev==='focus'?'':'focus'))
setBoundaryDraft(mesh.focus_boundary_note||'')}},[h('rect',{x:-70,y:-22,width:140,height:44,rx:9,fill:'var(--btw-s1, #0f172a)',stroke:'var(--btw-accent, #38bdf8)',strokeWidth:hoveredNode==='focus'?2.4:1.7}),h('text',{x:0,y:-4,textAnchor:'middle',fill:'var(--btw-accent-ink, #38bdf8)',fontSize:'8.5',fontWeight:'700',fontFamily:'monospace'},isPt?'● VOCÊ (ATUAL)':'● YOU (FOCUS)'),h('text',{x:-2,y:10,textAnchor:'middle',fill:'var(--btw-text-body, #e2e8f0)',fontSize:'9',fontFamily:'monospace'},`@${focusShort}`)]),...topFiles.map((fm,fi)=>{
const fy=fileY(fi)
const col=fm.status==='collision'?'var(--btw-danger,#f43f5e)':fm.status==='shared_disjoint'?'var(--btw-warn,#f59e0b)':'var(--btw-ok,#10b981)'
const statusTxt=fm.status==='collision'?isPt?'colisão':'collision':fm.status==='shared_disjoint'?isPt?'zonas'
:'zones':isPt?'isolado':'isolated'
return hs('g',{transform: `translate(${fileX}, ${fy})`,cls:'cursor-pointer',onMouseEnter:()=>setHoveredNode(fm.file),onClick:()=>{setSearchQuery(prev=>(prev===fm.file?'':fm.file))
haptic?.('tap')}},[h('rect',{x:-84,y:-15,width:168,height:30,rx:8,fill:'var(--btw-s1, #0f172a)',stroke:col,strokeWidth:hoveredNode===fm.file?2.3:1.5}),h('text',{x:0,y:-1,textAnchor:'middle',fill:'var(--btw-text-strong, #f8fafc)',fontSize:'8.5',fontWeight:'700',fontFamily:'monospace'},`${fm.claimed_by?'🔒 ':''}${trimMid(fm.file,17)}`),h('text',{x:0,y:10,textAnchor:'middle',fill:col,fontSize:'8',fontWeight:'700',fontFamily:'monospace'},`${(fm.writers||[]).length}x · ${statusTxt}`)],`node_f_${fm.file}`)}),...peerNodes.map((sib,si)=>{
const sy=sibY(si)
const rCol=sib.conflict_risk==='high'?'var(--btw-danger,#f43f5e)':sib.isSubNode?'var(--btw-hypo,#a855f7)':sib.conflict_risk==='medium'?'var(--btw-warn,#f59e0b)':'var(--btw-ok,#10b981)'
return hs('g',{transform: `translate(${sibX}, ${sy})`,cls:'cursor-pointer',onMouseEnter:()=>setHoveredNode(sib.id),onClick:()=>{setSearchQuery(prev=>(prev===sib.short_id?'':sib.short_id))
haptic?.('tap')}},[h('rect',{x:-94,y:-16,width:214,height:32,rx:8,fill:'var(--btw-s1, #0f172a)',stroke:rCol,strokeWidth:hoveredNode===sib.id?2.3:1.5}),h('text',{x:13,y:-2,textAnchor:'middle',fill:'var(--btw-text-strong, #f8fafc)',fontSize:'8.5',fontWeight:'600'},`🟢 ${trimMid(sib.title||sib.short_id,21)}`),h('text',{x:13,y:10,textAnchor:'middle',fill:rCol,fontSize:'7.5',fontWeight:'700',fontFamily:'monospace'},`@${String(sib.short_id||'').slice(-8)} · ${trimMid(sib.shared_scope_badge||repoScopeLabel,15)}`)],`node_s_${sib.id}`)})])
})())]),
]),(guardDirective||activeLlmSynthesis)&&
divs('btw-mesh-contract-hud',[divs({cls:'flex flex-wrap items-center justify-between gap-2 cursor-pointer',onClick:()=>{setContractOpen(v=>!v)
haptic?.('tap')}},[divs('flex min-w-0 items-center gap-2',[
jsx(DisclosureCaret,{open:contractOpen||subView==='contract',size:'0.72rem',className:'text-purple-400'}),
codicon('shield','0.78rem','text-purple-400'),span('btw-tx-11 font-semibold btw-tp truncate',isPt?'Contrato de Partição & Guarda Anti-Conflito'
:'Partition Contract & Conflict Guard'),span('font-mono btw-tx-95 text-purple-300',isPt
? `· ${claimedFilesCount} trava(s) · ${linkedIds.length} sessões protegidas`
: `· ${claimedFilesCount} lock(s) · ${linkedIds.length} protected sessions`)]),divs({cls:'flex items-center gap-1',onClick:e=>e.stopPropagation()},[(contractOpen||subView==='contract')&&hBtn('btw-filter-pill',{'data-active':showRawContract?'true':'false',onClick:()=>setShowRawContract(v=>!v)},showRawContract?(isPt?'🎨 Visual HUD':'🎨 Visual HUD'):'Raw Prompt'),hBtn('btw-composer-synth-btn',{onClick:()=>void steerActiveSession(activeLlmSynthesis||guardDirective,scope,null,{
source:'session_mesh_contract'})},isPt?'⚡ Enviar Steer':'⚡ Send Steer'),hBtn('btw-action-mode-pill',{onClick:async()=>{await writeClipboardText(
[guardDirective,activeLlmSynthesis].filter(Boolean).join('\n\n---\n\n'))
haptic?.('success')
host.notify?.({kind:'info',message:strings.copiedNotify})}},strings.playbookCopyBtn)])]),
(contractOpen||subView==='contract')&&(showRawContract?div('btw-rich-playbook-stage max-h-[260px] btw-basic-md-overview btw-selectable-prose',jsx(MessageTextContent,{
text:[activeLlmSynthesis,guardDirective].filter(Boolean).join('\n\n---\n\n'),media:false,previewOnly:true})):divs('flex flex-col gap-2 pt-1 border-t btw-bd-st45',[divs('flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 btw-tx-105 text-amber-200',[codicon('warning','0.8rem','shrink-0 text-amber-400'),span(null,isPt
?'Regra Estrita: Proibido usar write_file completo em arquivos compartilhados. Faça read_file do trecho exato antes de aplicar patch cirúrgico.'
:'Strict Policy: Never use full write_file on shared files. Always read_file the target line range before applying targeted patch calls.')]),divs(CLS.rowWrap15,[mesh.focus_boundary_note&&span({cls:'btw-mesh-line-chip','data-focus':'true'},`🎯 ${isPt?'Seu Escopo:':'Your Scope:'} ${mesh.focus_boundary_note}`),...Object.entries(fileClaims).map(([fn,cl])=>span('btw-mesh-line-chip text-amber-300 border-amber-400/45',`🔒 ${fn} → ${formatOwnerBadge(cl?.owner_id)}${cl?.zone? ` (${cl.zone})` :''}`,fn))]),activeLlmSynthesis&&div('btw-rich-playbook-stage max-h-[280px] btw-basic-md-overview btw-selectable-prose',jsx(MessageTextContent,{text:activeLlmSynthesis,media:false,previewOnly:true}))]))])])}
const COMPARE_ROWS=[['model','Model',null],['elapsed_seconds','Elapsed','low',v=>fmtDurationSec(v)],
['messages','Messages',null],['tool_calls','Tool calls',null],['api_calls','LLM calls','low'],['errors','Errors','low'],
['anomalies','Anomalies','low'],['input','Input tokens','low',v=>fmtCompact(v)],
['output','Output tokens',null,v=>fmtCompact(v)],['cache_hit_pct','Cache hit','high',v=> `${v??0}%`],
['cost_usd','Cost','low',v=> `$${Number(v||0).toFixed(4)}`],['files','Files touched',null]]
function CompareView({scope}){
const lang=useValue($lang)
const strings=I18N[lang]||I18N.en
const ids=useValue($compareIds)
const current=scope.storedId||scope.runtimeId||''
const listQ=useQuery({queryKey:[ID,'sessions'],enabled:Boolean(_rest),
queryFn:async()=>(await _rest('/sessions?limit=20',{timeoutMs:8000}))?.sessions||[],staleTime:15000})
const sessions=Array.isArray(listQ.data)?listQ.data.filter(Boolean):[]
const a=ids.a||current
const b=ids.b||sessions.find(x=>x?.id&&x.id!==a)?.id||''
const cmpQ=useQuery({queryKey:[ID,'compare',a,b],enabled:Boolean(_rest&&a&&b&&a!==b),
queryFn:async()=>_rest(`/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`,{timeoutMs:10000}),staleTime:5000})
const da=cmpQ.data?.a||{}
const db=cmpQ.data?.b||{}
const picker=(value,key,label)=>hs('label','flex min-w-0 flex-1 flex-col gap-1 btw-tx-105 btw-tt',[label,h('select',{cls:'btw-select',value,onChange:e=>$compareIds.set({...$compareIds.get(),[key]:e.target.value})},sessions.map(s=>h('option',{value:s.id},`${s.id===current?'● ':''}${s.title} · ${s.profile}`,s.id)
))])
const better=(k,dir)=>{if(!dir||!da.found||!db.found)return[false,false]
const x=Number(da[k]||0)
const y=Number(db[k]||0)
if(x===y)return[false,false]
return dir==='low'?[x<y,y<x]:[x>y,y>x]}
return divs('flex flex-col gap-2.5',[divs(CLS.rowBetween,[uiBtn('ghost','xs',{onClick:()=>$activeTab.set('radar')},strings.compareBackBtn),
span(CLS.mono10Muted,strings.zeroTokens)]),
divs('flex gap-2',[picker(a,'a',strings.compareA),picker(b,'b',strings.compareB)]),
!(da.found&&db.found)?div('btw-empty-hero text-xs btw-tt',cmpQ.isFetching?jsx(GlyphSpinner,{spinner:'braille'}):strings.compareEmpty):hs('table','btw-compare-table',[h('thead',null,hs('tr',null,[
h('th',null,strings.compareMetric),h('th','truncate max-w-[180px]',da.title),
h('th','truncate max-w-[180px]',db.title)])),h('tbody',null,COMPARE_ROWS.map(([k,label,dir,fmt])=>{
const[wa,wb]=better(k,dir)
const f=fmt||(v=>(v==null?'—':String(v)))
const rowLabel=strings.compareRows?.[k]||label
return hs('tr',null,[h('td',CLS.muted,rowLabel),
h('td',{cls:wa?'win':''},k==='model'?shortModelName(da[k]):f(da[k])),
h('td',{cls:wb?'win':''},k==='model'?shortModelName(db[k]):f(db[k]))],k)}))])])}
function PetBubbleCard({bubble,strings,scope,onReinfer,onDismiss}){
const isErr=bubble.tone==='error'
const cleanSummary=stripRedundantKaomoji(bubble.summary||'')
const toolsMatch=cleanSummary.match(/(\d+)\s+tools/i)
const errsMatch=cleanSummary.match(/(\d+)\s+(?:errors|erros)/i)
const fileMatch=cleanSummary.match(/(?:touched|mexi em)\s+([A-Za-z0-9_./-]+\.[A-Za-z0-9]+)/i)
const extractedTools=toolsMatch?Number(toolsMatch[1]):0
const extractedErrs=errsMatch?Number(errsMatch[1]):Number(bubble.metrics?.consecutive_errors||0)
const extractedFile=fileMatch?fileMatch[1]:''
return divs({cls:'btw-pet-bubble','data-tone':bubble.tone||'info'},[divs('btw-pet-bubble-head',[span({cls:cn('btw-pet-bubble-badge',isErr?'btw-bg-rd20 btw-red':'btw-bg-ac20 btw-ac')},bubble.type==='btw'?'BTW':(bubble.type==='alert'?'ALERT':(bubble.type==='recap'?'RECAP':'TELEMETRY'))),
span('font-semibold btw-tp truncate flex-1',bubble.title||(bubble.type==='btw'?strings.petDone:strings.petTelemetryTitle)),bubble.ai_inferred?span('btw-tx-9 font-mono btw-ac shrink-0','✦ AI'):span('btw-tx-9 font-mono btw-tq shrink-0','$0'),onDismiss&&uiBtn('ghost','icon-xs',{onClick:()=>onDismiss(bubble.id)},codicon('close','0.65rem'))]),
div('btw-pet-bubble-text btw-subagent-md',jsx(MessageTextContent,{text:cleanSummary,media:false,previewOnly:true})),
(bubble.metrics||extractedTools>0||extractedErrs>0||extractedFile)&&divs('btw-pet-bubble-metrics',[
bubble.metrics?.active_tool&&span('btw-pet-bubble-tag',`⚡ ${bubble.metrics.active_tool}`),
extractedTools>0&&span('btw-pet-bubble-tag',`🛠 ${extractedTools} tools`),extractedErrs>0&&
span('btw-pet-bubble-tag btw-red btw-bd-rd40 btw-bg-rd10 font-semibold',`⚠ ${extractedErrs} errors`),extractedFile&&span({cls:'btw-pet-bubble-tag btw-ac',title:extractedFile},`📄 ${splitPathLeaf(extractedFile).leaf}`),
Number(bubble.metrics?.cost_usd||0)>0&&span('btw-pet-bubble-tag',`$${Number(bubble.metrics.cost_usd).toFixed(4)}`),
Number(bubble.metrics?.cache_hit_pct||0)>0&&span('btw-pet-bubble-tag',`${bubble.metrics.cache_hit_pct}% cache`)
]),divs('btw-pet-bubble-actions',[bubble.steer&&uiBtn('outline','xs',{onClick:()=>void steerActiveSession(bubble.steer,scope)},spans('inline-flex items-center gap-1 btw-tx-105',[codicon('zap','0.65rem'),strings.alertStripSteer||'Steer'])),onReinfer&&uiBtn('ghost','xs',{onClick:()=>onReinfer(bubble)},spans('inline-flex items-center gap-1 btw-tx-105 btw-ac',[codicon('sparkle','0.65rem'),strings.petReinfer||'Re-infer'])),
span('ml-auto'),jsx(CopyButton,{text:bubble.summary,appearance:'icon',buttonSize:'icon-xs',
title:strings.copyAnswer,'aria-label':strings.copyAnswer})])],bubble.id)}
function MascotHud({inline=false,onCloseInline=null}={}){
const scope=useFocusedSessionScope()
const lang=useValue($lang)
const activePresets=useValue($activePresets)
const strings=I18N[lang]||I18N.en
const pendingMap=useValue($pendingBySession)
const entriesMap=useValue($entriesBySession)
const pulseMap=useValue($livePulseBySession)
const petBubblesMap=useValue($petBubblesBySession)
const personality=useValue($personality)
const synthMode=useValue($synthMode)
const stockSafePet=useValue($stockSafePet)
const petBubbleMode=useValue($petBubbleMode)
const[hudTab,setHudTab]=useState('pet')
const[draft,setDraft]=useState('')
const[isInferring,setIsInferring]=useState(false)
const feedRef=useRef(null)
const inputRef=useRef(null)
const themeProps=useThemeProps()
const demoMode=useValue($demoShowcase)
const pending=pendingMap[scope.key]||null
const elapsed=useElapsedSeconds(pending?.startedAt,Boolean(pending))
const pulse=pulseMap[scope.key]||null
const entries=useMemo(()=>{
const rawList=entriesMap?.[scope.key]
const safeList=Array.isArray(rawList)?rawList.filter(Boolean):[]
const eff=demoMode?DEMO_QA_CARDS:safeList
return[...eff].sort((a,b)=>(a.created_at||0)-(b.created_at||0)).slice(-12)
},[entriesMap,scope.key,demoMode])
const petBubbles=useMemo(()=>{
const rawList=petBubblesMap?.[scope.key]
const list=Array.isArray(rawList)?rawList:[]
if(demoMode){
return[{id:'demo_pet_1',tone:'info',title:'⚡ SYNC · Zero-Token Side-Channel Active',
summary:'L0 Prompt Cache is 94.2% warm ($1.84 saved). 2 delegated subagents running in parallel.',ai_inferred:true,
ts:Date.now()/ 1000 - 30},{id:'demo_pet_2',tone:'good',title:'🔄 RSI · Δτ Verdict: helped',
summary:'Autonomous recovery verified via pytest -q; rule recorded in BTW.md.',ai_inferred:false,ts:Date.now()/ 1000 - 90}]}
return list
},[petBubblesMap,scope.key,demoMode])
const hasSession=Boolean(scope.storedId||scope.runtimeId)
const sid=scope.storedId||scope.runtimeId||''
const hudFocusedUsage=useValue(host.state?.focusedUsage??$noPet)
const hudComposerModel=useValue(host.state?.model??$noPet)
const snapQ=useQuery({queryKey:[ID,'snapshot',scope.profile,sid],enabled:Boolean(_rest&&sid&&!demoMode),queryFn:async()=>{
const data=await _rest(`/snapshot?session_id=${encodeURIComponent(sid)}`,{timeoutMs:8000})
if(data?.history?.length)mergeBackendHistory(scope.key,data.history)
return hydrateSnapshotWithHostContext(data,scope,host.state?.focusedUsage?.get?.()||null,host.state?.model?.get?.()||'')},
select:data=>hydrateSnapshotWithHostContext(data,scope,hudFocusedUsage,hudComposerModel),staleTime:3500,
refetchInterval:scope.busy?4500:12000,retry:1})
const snapData=demoMode?DEMO_SNAPSHOT:(snapQ.data?.found?snapQ.data:null)
const activeTool=pulse?.active_tool||snapData?.live?.active_tool||''
const recentTools=useMemo(()=>{
const liveList=Array.isArray(pulse?.recent_tools)&&pulse.recent_tools.length>0?pulse.recent_tools:[]
if(liveList.length>0)return liveList
const cmds=Array.isArray(snapData?.recent_commands)?snapData.recent_commands.map(c=>({
tool: `${c.tool||'terminal'}${c.command? `: ${String(c.command).slice(0,32)}` :''}`,
status:c.recovered?'recovered':(c.status==='error'||(c.exit_code!=null&&c.exit_code!==0)?'error':'ok'),
duration_ms:c.duration_ms||null
})):[]
if(cmds.length>0)return cmds
return Array.isArray(snapData?.top_tools)?snapData.top_tools.map(tItem=>({tool: `${tItem.name} (×${tItem.count})`,status:'ok',
duration_ms:null
})):[]
},[pulse?.recent_tools,snapData?.recent_commands,snapData?.top_tools])
const pulseEvents=pulse?.telemetry_events||[]
const seededRef=useRef('')
useEffect(()=>{if(sid&&petBubbles.length===0&&seededRef.current!==sid){seededRef.current=sid
void speakTelemetry(sid,'auto')}
},[sid,petBubbles.length])
useEffect(()=>{
const el=feedRef.current
if(el)el.scrollTop=el.scrollHeight
},[entries.length,petBubbles.length,recentTools.length,Boolean(pending)])
useEffect(()=>{if(inline)return undefined
const cancel=scheduleTimer(()=>inputRef.current?.focus?.({preventScroll:true}),60)
return cancel
},[inline])
const send=(text,isSteer=false)=>{
const q=String(text??draft).trim()
if(!q)return
setDraft('')
if(isSteer){void steerActiveSession(q,scope)
}else{if(pending)return
void dispatchSideQuestion(q,scope,'fast')}}
const handleInferBubble=async()=>{
 const sid=scope.storedId||scope.runtimeId
 if(!sid)return
 setIsInferring(true)
 try{
 let summaryTxt=''
 if(typeof host?.request==='function'){
 try{
 const oneshot=await host.request('llm.oneshot',{
 session_id:sid,
 instructions:lang==='pt'
? `Resuma o estado atual da sessão em 1 linha objetiva (máx 110 caracteres, perfil ${personality}, sem quebras de linha).`
: `Summarize the current session state in 1 crisp line (max 110 chars, ${personality} lens, no newlines).`,
 input: `tool=${activeTool||'idle'} busy=${Boolean(scope.busy)} turn_tools=${pulse?.turn_tools||0} errors=${pulse?.consecutive_errors||0}`,
 max_tokens:96,
 temperature:0.25,
})
 summaryTxt=extractOneshotText(oneshot).replace(/\s+/g,' ').slice(0,stockSafePet?114:240)
}catch{summaryTxt=''}
}
 if(summaryTxt){
 addPetBubble(scope.key,{
 type:Number(pulse?.consecutive_errors||0)>=2?'alert':'telemetry',
 title:strings.hudPetSummaryTitle||'Companion Telemetry Bubble',
 summary:summaryTxt,ai_inferred:true,personality,
 tone:Number(pulse?.consecutive_errors||0)>=2?'error':'good',
 steer:Number(pulse?.consecutive_errors||0)>=2?t().steerLoopStreak:'',
})
 petSay('synth-bubble',summaryTxt,'info',12000)
 haptic?.('success')
 return
}
 if(!_rest)return
 const res=await _rest('/telemetry/summary',{
 method:'POST',
 body:{session_id:sid,event_type:'auto',personality,lang,use_llm:true,stock_safe:stockSafePet},
 timeoutMs:25_000,
})
 if(res?.ok&&res.summary){
 addPetBubble(scope.key,{
 type:res.event_type==='error_loop'?'alert':'telemetry',
 title:strings.hudPetSummaryTitle||'Companion Telemetry Bubble',
 summary:res.summary,ai_inferred:res.engine==='llm',
 personality:res.personality||personality,
 tone:res.event_type==='error_loop'?'error':'good',
 metrics:res.metrics,
 steer:res.event_type==='error_loop'?t().steerLoopStreak:'',
})
 petSay('synth-bubble',res.summary,'info',12000)
 haptic?.('success')
}
}catch{}finally{setIsInferring(false)}
}
const handleReinferBubble=async(b)=>{
const sid=scope.storedId||scope.runtimeId
if(!sid||!_rest)return
try{
const res=await _rest('/telemetry/summary',{method:'POST',body:{session_id:sid,
event_type:b.type==='btw'?'turn_recap':'auto',details:{last_error:b.summary,tool:b.tool},personality,lang,use_llm:true,
stock_safe:stockSafePet},timeoutMs:25_000})
if(res?.ok&&res.summary){
const curList=petBubblesMap?.[scope.key]||[]
const updated=curList.map(item=>item.id===b.id?{...item,summary:res.summary,ai_inferred:true}:item)
$petBubblesBySession.set({...petBubblesMap,[scope.key]:updated})
petSay('re-infer',res.summary,b.tone||'info',12000)
haptic?.('success')}
}catch{}}
const dismissBubble=(id)=>{
const curList=petBubblesMap?.[scope.key]||[]
$petBubblesBySession.set({...petBubblesMap,[scope.key]:curList.filter(item=>item.id!==id)})}
const close=()=>(inline&&onCloseInline?onCloseInline():setHudOpen(false))
const moodFace=useMemo(()=>{if(Number(pulse?.consecutive_errors||0)>=2)return{icon:'😰',label:'LOGS',tone:'error'}
if(scope.busy)return{icon:'⚡',label:'WORK',tone:'warn'}
if(personality==='kawaii')return{icon:'(｡•̀ᴗ-)✧',label:'CUTE',tone:'good'}
if(personality==='technical')return{icon:'⚙',label:'SRE',tone:'good'}
return{icon:'✦',label:'SYNC',tone:'good'}
},[pulse?.consecutive_errors,scope.busy,personality])
return divs({cls:'btw-hud','data-btw-hud':'','data-inline':inline?'true':'false','data-overlay-surface':'',...(inline?{}:{'data-btw-theme':themeProps['data-btw-theme'],'data-btw-density':themeProps['data-btw-density'],style:themeProps.style})},[
divs('btw-hud-head',[divs('btw-hud-session',[divs({cls:'btw-hud-avatar-chip','data-tone':moodFace.tone},[span('text-xs',moodFace.icon),
span(null,moodFace.label)]),span({cls:cn('inline-block size-1.5 rounded-full shrink-0',scope.busy?'btw-bg-ac animate-pulse':'btw-bg-tq')}),span('truncate font-medium btw-tp flex-1',hasSession
?(activeTool? `Tool: ${activeTool}` :(scope.busy?strings.hudTurnRunning:(scope.isSubagentInspect?scope.subagentTitle:scope.profile)))
:strings.hudNoSession),tip(strings.hudTriggerSynthTip,uiBtn('ghost','icon-xs',{disabled:!hasSession||isInferring,'aria-label':strings.hudTriggerSynth,onClick:handleInferBubble},isInferring?jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent})
:codicon('sparkle','0.72rem',CLS.accent))),tip(strings.hudOpenStudio,uiBtn('ghost','icon-xs',{'aria-label':strings.hudOpenStudio,onClick:()=>requestOpenStudio({tab:'ask'})},codicon('link-external','0.72rem'))),tip(strings.tipClose,uiBtn('ghost','icon-xs',{'aria-label':strings.tipClose,onClick:close},codicon('close','0.72rem')))]),divs('btw-hud-telemetry-bar',[span(null,scope.busy?strings.hudTelemetryActive:strings.hudTelemetryIdle),
pulse?.model?span(null,`· ${pulse.model}`):null,
Number(pulse?.turn_tools||0)>0?span(null,`· ${pulse.turn_tools} tools`):null,
Number(pulse?.turn_errors||0)>0?span('btw-red',`· ${pulse.turn_errors} err`):null,
Number(pulse?.consecutive_errors||0)>0?span('btw-red font-bold',`· streak ${pulse.consecutive_errors}`):null
])]),divs({cls:'btw-hud-tabs',role:'tablist','aria-label':'Mascot HUD tabs'},[['pet', `${strings.hudTabPet} (${petBubbles.length})`],['telemetry', `${strings.hudTabTelemetry} (${recentTools.length||pulseEvents.length})`],['qa', `Q&A (${entries.length})`],['settings',strings.hudTabSettings]].map(([hId,hLbl],hIdx,hArr)=>hBtn('btw-hud-tab',{role:'tab',tabIndex:hudTab===hId?0:-1,'aria-selected':hudTab===hId?'true':'false','data-active':hudTab===hId,onClick:()=>setHudTab(hId),onKeyDown:rovingKeyDown(hArr.map(x=>x[0]),hIdx,setHudTab)},hLbl,hId))),divs({ref:feedRef,cls:'btw-hud-feed'},[hudTab==='pet'&&divs('flex flex-col gap-2',[
jsx(MascotCompanionStage,{scope,compact:true,showControls:true}),...(petBubbles.length===0?[div('px-3 py-3 text-center flex flex-col items-center gap-1.5 btw-tt',[
div('text-xs font-semibold btw-tp',strings.petTelemetryTitle),
div('btw-tx-11 leading-relaxed',strings.petEmptyStream||strings.hudEmpty),uiBtn('outline','xs',{cls:'mt-1',disabled:!hasSession||isInferring,onClick:handleInferBubble},spans(CLS.inline1,[codicon('sparkle','0.7rem'),strings.hudTriggerSynth]))],'empty-pet-stream')]:petBubbles.map(b=>jsx(PetBubbleCard,{bubble:b,strings,scope,onReinfer:handleReinferBubble,
onDismiss:dismissBubble
},b.id)
))]),hudTab==='telemetry'&&(recentTools.length===0&&pulseEvents.length===0?div('my-auto px-2 text-center btw-tx-11 btw-tt',strings.hudNoRecentTools):divs(CLS.col15,[...recentTools.map((tItem,idx)=>divs('btw-hud-tool-row',[divs('flex items-center gap-2 min-w-0',[
jsx(StatusDot,{tone:tItem.status==='error'?'bad':'good'}),
span('font-mono font-semibold truncate',tItem.tool),
tItem.duration_ms?span('btw-tx-10 btw-tq tabular-nums',`${tItem.duration_ms}ms`):null
]),span({cls:cn('btw-tx-10 font-mono uppercase px-1.5 py-0.5 rounded',tItem.status==='error'?'btw-bg-rd20 btw-red':CLS.muted)},tItem.status)],`tool-${idx}`)),uiBtn('outline','xs',{cls:'mt-2',disabled:!hasSession||isInferring,onClick:handleInferBubble},spans(CLS.inline1,[codicon('sparkle','0.7rem'),strings.hudTriggerSynth]))])),hudTab==='qa'&&(
entries.length===0&&!pending
?div('my-auto px-2 text-center btw-tx-11 btw-tt',strings.hudEmpty)
:hs(Fragment,null,[...entries.flatMap(entry=>[
div({cls:'btw-bubble','data-btw-role':'user'},entry.question,`${entry.id}-q`),divs({cls:'btw-bubble','data-btw-role':'bot','data-selectable-text':'true'},[
jsx(BtwRichAnswerBody,{text:entry.answer,entry,sessionScope:scope}),divs('mt-1 flex items-center gap-1',[jsx(CopyButton,{text:entry.answer,appearance:'icon',buttonSize:'icon-xs',title:strings.copyAnswer,
'aria-label':strings.copyAnswer}),tip(strings.steerNowTip,uiBtn('ghost','icon-xs',{'aria-label':strings.steerNowTip,onClick:()=>
void steerActiveSession(`[BTW insight on "${entry.question}"]: ${entry.answer.slice(0,600)}`,scope)},codicon('zap','0.7rem')))])],`${entry.id}-a`)]),pending&&divs({cls:'btw-bubble inline-flex items-center gap-2','data-btw-role':'bot'},[jsx(GlyphSpinner,{spinner:'braille',className:CLS.accent}),span('font-mono tabular-nums btw-tx-11',elapsed)])])),hudTab==='settings'&&(divs('btw-hud-behavior',[
div('text-xs font-semibold btw-tp mb-1',strings.petBehaviorTitle||'Pet Behavior & Triggers'),
jsx(SettingRow,{label:strings.setPersona,compact:true,children:h('select',{cls:'btw-select',value:personality,onChange:e=>setPref($personality,e.target.value,'personality')},PERSONAS.map(id=>h('option',{value:id},strings.personaNames[id],id)))}),jsx(SettingRow,{
label:strings.setPetBubbleMode,compact:true,children:jsx(SegmentedControl,{sizing:'content',value:petBubbleMode,
onChange:v=>setPref($petBubbleMode,v,'petBubbleMode'),
options:['ai_summary','metric_focus','action_steer','minimal'].map(id=>({id,label:strings.petBubbleModeNames?.[id]||id}))
})}),jsx(SettingRow,{label:strings.setSynth,compact:true,children:jsx(SegmentedControl,{sizing:'content',value:synthMode,
onChange:v=>setPref($synthMode,v,'synthMode'),options:['facts','llm'].map(id=>({id,label:strings.synthNames[id]||id}))})}),
jsx(SettingRow,{label:strings.setStockSafePet,compact:true,children:jsx(Switch,{size:'xs',checked:stockSafePet,
onCheckedChange:v=>setPref($stockSafePet,Boolean(v),'stockSafePet'),'aria-label':strings.setStockSafePet})})]))]),!inline&&
activePresets.length>0&&div('btw-hud-chips',activePresets.map(p=>hBtn('btw-hud-chip',{disabled:Boolean(pending)||!hasSession,title:p.desc||p.prompt,onClick:()=>send(p.prompt)},p.label,p.id))),divs('btw-hud-input',[h('textarea',{ref:inputRef,rows:1,value:draft,disabled:!hasSession,placeholder:strings.hudPlaceholder,onChange:e=>setDraft(e.target.value),onKeyDown:e=>{
if(isSubmitEnter(e)&&!e.shiftKey){e.preventDefault()
send()
}else if(e.key==='Escape'){e.preventDefault()
e.stopPropagation()
e.nativeEvent?.stopImmediatePropagation?.()
close()}}}),uiBtn('default','icon-xs',{title:strings.btnAsk,'aria-label':strings.btnAsk,disabled:Boolean(pending)||!draft.trim()||!hasSession,onClick:()=>send()},codicon('send','0.72rem')),uiBtn('outline','icon-xs',{title:strings.alertStripSteer||'Steer','aria-label':strings.alertStripSteer||'Steer',disabled:!draft.trim()||!hasSession,onClick:()=>send(draft,true)},codicon('zap','0.72rem'))])])}
function SettingRow({label,desc,compact,stack=false,children}){
return divs({cls:stack?'btw-set-row btw-set-row--stack':'btw-set-row'},[divs('min-w-0 flex-1',[div('btw-set-label',label),
desc&&!compact?div('btw-set-desc',desc):null]),
div('btw-set-row-ctrl',children)])}
function SettingSwitch({checked,onChange,label}){
const on=Boolean(checked)
return hBtn('btw-switch',{role:'switch','aria-checked':on?'true':'false','aria-label':label,'data-checked':on?'true':'false',onClick:()=>{onChange(!on)
haptic?.('tap')}},span('btw-switch-thumb'))}
function BtwSegmented({value,options,onChange,fullWidth=false,ariaLabel=''}){
const cur=String(value??''),ids=options.map(o=>String(o.id)),hasMatch=ids.includes(cur)
return div({cls:'btw-seg','data-full':fullWidth?'true':'false',role:'radiogroup','aria-label':ariaLabel||undefined},options.map((opt,idx)=>{
const id=ids[idx],active=cur===id
return hBtn('btw-seg-btn',{role:'radio','aria-checked':active?'true':'false',tabIndex:(hasMatch?active:idx===0)?0:-1,'data-active':active?'true':'false',title:opt.title||opt.label,onKeyDown:rovingKeyDown(ids,idx,nextId=>{onChange(String(nextId));haptic?.('tap')}),onClick:()=>{if(!active){onChange(id);haptic?.('tap')}}},opt.label,id)}))}
function BtwStepper({value,onChange,step=1,min=0,max=9999,unit=''}){
const v=Number(value??0)
const fmt=step<1?Number(v.toFixed(2)):Math.round(v)
const bump=delta=>{
const raw=v + delta * step
const clamped=Math.max(min,Math.min(max,step<1?Number(raw.toFixed(2)):Math.round(raw)))
onChange(clamped)
haptic?.('tap')}
return divs('btw-stepper',[hBtn('btw-stepper-btn',{'aria-label':'Decrease',onClick:()=>bump(-1)},'−'),h('input',{type:'number',min,max,step,cls:'btw-stepper-input',value:String(fmt),onChange:e=>{
const parsed=Number(e.target.value)
const next=Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):min
onChange(next)}}),hBtn('btw-stepper-btn',{'aria-label':'Increase',onClick:()=>bump(1)},'+'),unit?span('btw-stepper-unit',unit):null])}
const SWATCH_NAMES={'#ef4444':'Red','#f97316':'Orange','#eab308':'Amber','#84cc16':'Lime','#22c55e':'Green','#14b8a6':'Teal','#06b6d4':'Cyan','#38bdf8':'Sky','#3b82f6':'Blue','#8b5cf6':'Violet','#d946ef':'Magenta','#ec4899':'Pink'}
function BtwAccentSwatches({swatches,value,onChange,clearLabel}){
const list=Array.isArray(swatches)&&swatches.length?swatches:['#ef4444','#f97316','#eab308','#84cc16','#22c55e','#14b8a6','#06b6d4','#38bdf8','#3b82f6','#8b5cf6','#d946ef','#ec4899']
const normVal=String(value||'').toLowerCase(),hasSel=list.some(h=>String(h||'').trim().toLowerCase()===normVal)
return divs('flex flex-col gap-2',[div({cls:'btw-swatch-grid',role:'radiogroup','aria-label':'Accent color'},list.map((hex,idx)=>{
const c=String(hex||'').trim(),isSel=Boolean(normVal)&&normVal===c.toLowerCase(),lbl=SWATCH_NAMES[c.toLowerCase()]?`${SWATCH_NAMES[c.toLowerCase()]} (${c})`:`Accent ${c}`
return hBtn('btw-swatch-dot',{role:'radio','aria-checked':isSel?'true':'false','aria-label':lbl,title:lbl,tabIndex:(hasSel?isSel:idx===0)?0:-1,'data-active':isSel?'true':'false',style:{background:c},onKeyDown:rovingKeyDown(list,idx,nextHex=>{onChange(String(nextHex||'').trim());haptic?.('tap')}),onClick:()=>{onChange(isSel?null:c);haptic?.('tap')}},isSel?'✓':null,c)})),divs('flex items-center justify-between gap-2 pt-0.5',[hBtn('btw-mascot-act-btn h-[24px] px-2.5 btw-tx-10',{'data-active':!normVal?'true':'false',onClick:()=>{onChange(null);haptic?.('tap')}},spans(CLS.inline15,[span(null,!normVal?'✓':'↺'),span(null,clearLabel)])),normVal?span('font-mono btw-tx-95 btw-mut',normVal.toUpperCase()):null])])}
function PresetsSettingsSection({compact=false}){
const lang=useValue($lang)
const activePresets=useValue($activePresets)
const customPresets=useValue($customPresets)
const strings=I18N[lang]||I18N.en
const customIndexMap=useMemo(()=>new Map((customPresets||[]).filter(Boolean).map((p,idx)=>[p.id,idx])),[customPresets])
return divs('flex flex-col gap-2',[
!compact&&div('btw-set-desc',strings.presetsManageDesc),
jsx(PresetEditorCard,{surface:'settings'}),div('flex flex-col gap-1.5 pt-0.5',activePresets.map(preset=>{
const cIdx=preset.custom?customIndexMap.get(preset.id):-1
return divs('btw-preset-row-card',[
divs('flex min-w-0 flex-1 items-start gap-2.5',[
span('mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border btw-bd-seg btw-bg-seg btw-bac',codicon(preset.icon,'0.78rem')),divs('min-w-0 flex-1',[divs('flex items-center gap-1.5 btw-tx-115 font-semibold btw-str',[span('truncate',preset.label),preset.custom&&span('btw-theme-card-badge',strings.customBadgeLabel)]),div({cls:'btw-preset-row-prompt',title:preset.prompt},preset.prompt)])]),divs(CLS.rowShrink1,[preset.custom&&cIdx>0&&hBtn('btw-preset-icon-btn',{title:strings.moveUpTip,'aria-label':strings.moveUpTip,onClick:()=>moveCustomPreset(preset.id,-1)},codicon('chevron-up')),preset.custom&&cIdx>=0&&cIdx<customPresets.length - 1&&
hBtn('btw-preset-icon-btn',{title:strings.moveDownTip,'aria-label':strings.moveDownTip,onClick:()=>moveCustomPreset(preset.id,1)},codicon('chevron-down')),hBtn('btw-preset-icon-btn',{title:strings.editPresetTip,'aria-label':strings.editPresetTip,onClick:()=>openPresetEditorForItem(preset,'settings')},codicon('edit')),hBtn('btw-preset-icon-btn',{'data-danger':'true',title:strings.deletePresetTip,'aria-label':strings.deletePresetTip,onClick:()=>deletePresetById(preset.id,preset.label)},codicon('trash'))])],preset.id)}))])}
function SettingCard({icon='sparkle',title,badge='',headerActions=null,fullSpan=false,children}){
return divs({cls:fullSpan?'btw-set-card btw-set-card--full':'btw-set-card'},[divs('btw-set-card-head',[divs('btw-set-card-title min-w-0',[
codicon(icon,'0.82rem','btw-bac shrink-0'),span('truncate',title)]),
divs(CLS.rowShrink15,[headerActions,badge?span('btw-theme-card-badge',badge):null])]),children])}
const THEME_SWATCH_GRADIENTS={orbyx:'linear-gradient(135deg, #060a14 0%, #0e1830 42%, #38bdf8 76%, #c084fc 100%)',
host:'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #38bdf8 100%)',
cryo:'linear-gradient(135deg, #030712 0%, #0a192f 55%, #00f2fe 100%)',
paper:'linear-gradient(135deg, #fbf8f1 0%, #efe4cf 60%, #b84a27 100%)',
ai:'linear-gradient(135deg, #0c0a09 0%, #292524 52%, #ea580c 82%, #fbbf24 100%)',
glass:'linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(56,189,248,0.45) 60%, rgba(255,255,255,0.65) 100%)',
terminal:'linear-gradient(135deg, #050905 0%, #052e16 65%, #22c55e 100%)',
minimal:'linear-gradient(135deg, #171719 0%, #27272a 62%, #10a37f 100%)',
nordic:'linear-gradient(135deg, #050c0a 0%, #0d2b24 58%, #34d399 100%)'}
const THEME_DESIGN_META={orbyx:{id:'orbyx',tag:'ORBYX-Δτ',badgeEn:'MASCOT · Δτ',badgePt:'MASCOTE · Δτ',accentHex:'#38bdf8',
secondaryHex:'#c084fc',surfaceHex:'#090e1d',cardHex:'rgba(14, 24, 48, 0.88)',textHex:'#f1f5f9',
palette:['#070b16','#38bdf8','#c084fc','#fbbf24'],specEn:'Obsidian Visor · Dual Gyro Aura · Live Affect Sync',
specPt:'Visor Obsidiana · Giroscópio Duplo · Aura Afetiva Viva'},cryo:{id:'cryo',tag:'CRYO-HUD',badgeEn:'SIGNATURE',
badgePt:'ASSINATURA',accentHex:'#00f2fe',secondaryHex:'#f43f5e',surfaceHex:'#040914',cardHex:'rgba(7, 18, 36, 0.9)',
textHex:'#e0f2fe',palette:['#030712','#071226','#00f2fe','#f43f5e'],
specEn:'Cryo Tactical Datapad · Scanline Header · JetBrains Mono',specPt:'Datapad Tático Cryo · Scanline HUD · JetBrains Mono'},
host:{id:'host',tag:'HOST-SYNC',badgeEn:'NATIVE',badgePt:'NATIVO',accentHex:'#38bdf8',secondaryHex:'#94a3b8',
surfaceHex:'#0f172a',cardHex:'rgba(30, 41, 59, 0.85)',textHex:'#f8fafc',palette:['#0f172a','#1e293b','#38bdf8','#e2e8f0'],
specEn:'100% Hermes Desktop CSS Variables · Adaptive Polarity',specPt:'100% Variáveis Nativas do Hermes · Polaridade Adaptativa'},
paper:{id:'paper',tag:'WARM-INK',badgeEn:'LIGHT INK',badgePt:'CLARO · TINTA',accentHex:'#b84a27',secondaryHex:'#15803d',
surfaceHex:'#faf6ed',cardHex:'rgba(242, 232, 213, 0.92)',textHex:'#231f1b',palette:['#fbf8f1','#efe4cf','#b84a27','#15803d'],
specEn:'Ruled Parchment · Terracotta Ink · Dark-Host Isolated',specPt:'Pergaminho Pautado · Tinta Terracota · Isolado no Escuro'},
ai:{id:'ai',tag:'FORGE-Δτ',badgeEn:'COPPER',badgePt:'COBRE',accentHex:'#f59e0b',secondaryHex:'#ea580c',surfaceHex:'#12100e',
cardHex:'rgba(28, 24, 21, 0.9)',textHex:'#fef3c7',palette:['#0c0a09','#292524','#ea580c','#fbbf24'],
specEn:'Brushed Carbon · Molten Copper Rim · Warm Amber Contrast',specPt:'Carbono Escovado · Borda Cobre Solar · Contraste Âmbar Quente'},
glass:{id:'glass',tag:'MICA-28PX',badgeEn:'ACRYLIC',badgePt:'ACRÍLICO',accentHex:'#0ea5e9',secondaryHex:'#e0f2fe',
surfaceHex:'rgba(15, 23, 42, 0.72)',cardHex:'rgba(255, 255, 255, 0.14)',textHex:'#f8fafc',
palette:['#0f172a','#0284c7','#38bdf8','#f8fafc'],specEn:'28px Refractive Blur · Specular Rim · Squircle 20px',
specPt:'Blur Refrativo 28px · Borda Especular · Squircle 20px'},terminal:{id:'terminal',tag:'CRT // $0',
badgeEn:'ASCII CRT',badgePt:'CRT ASCII',accentHex:'#22c55e',secondaryHex:'#4ade80',surfaceHex:'#050905',
cardHex:'rgba(8, 22, 8, 0.92)',textHex:'#86efac',palette:['#050905','#052e16','#22c55e','#86efac'],
specEn:'P31 Phosphor Green · CRT Scanlines · Strict Monospace',specPt:'Fósforo Verde P31 · Scanlines CRT · Monospace Estrito'},
minimal:{id:'minimal',tag:'MATTE-UI',badgeEn:'MATTE',badgePt:'MATTE',accentHex:'#10a37f',secondaryHex:'#a1a1aa',
surfaceHex:'#171719',cardHex:'rgba(33, 33, 36, 0.94)',textHex:'#ececec',palette:['#171719','#27272a','#10a37f','#ececec'],
specEn:'Zero-Blur Matte Graphite · Pill Controls · Clean Focus',specPt:'Grafite Matte Zero-Blur · Botões Pílula · Foco Limpo'},
nordic:{id:'nordic',tag:'BOREAL-8K',badgeEn:'ANTI-GLARE',badgePt:'ANTI-FADIGA',accentHex:'#34d399',secondaryHex:'#2dd4bf',
surfaceHex:'#07110e',cardHex:'rgba(13, 33, 28, 0.9)',textHex:'#ecfdf5',palette:['#050c0a','#0d2b24','#34d399','#2dd4bf'],
specEn:'Nocturnal Pine · Aurora Mint · 8K DSR Eye Protection',specPt:'Pinho Noturno · Menta Boreal · Proteção Ocular 8K DSR'}}
const TERNARY_VERTICES={visual:{x:170,y:38,r:56,g:189,b:248,hex:'#38bdf8'},
eficiente:{x:64,y:204,r:16,g:185,b:129,hex:'#10b981'},
profundo:{x:276,y:204,r:245,g:158,b:11,hex:'#f59e0b'}}
const PERSONA_AXIS_PRESETS={balanced:{id:'balanced',emoji:'⚖',btnPt:'⚖ Equilibrado',btnEn:'⚖ Balanced',
axes:{visual:0.65,eficiente:0.65,profundo:0.65,epistemico:0.65,monothread:0.65,estrutura:0.65},
weights:{visual:0.34,eficiente:0.33,profundo:0.33}},neurodivergent:{id:'neurodivergent',emoji:'🧬',btnPt:'🧬 AuDHD 3e',
btnEn:'🧬 AuDHD 3e',axes:{visual:0.80,eficiente:0.80,profundo:0.78,epistemico:0.88,monothread:0.96,estrutura:0.90},
weights:{visual:0.36,eficiente:0.32,profundo:0.32}},anxious:{id:'anxious',emoji:'⚡',btnPt:'⚡ TDAH Flash',
btnEn:'⚡ ADHD Flash',axes:{visual:0.72,eficiente:0.98,profundo:0.25,epistemico:0.70,monothread:0.92,estrutura:0.78},
weights:{visual:0.24,eficiente:0.64,profundo:0.12}},technical:{id:'technical',emoji:'🧩',btnPt:'🧩 TEA · 86% Vis',
btnEn:'🧩 Systematic ASD',
axes:{visual:0.86,eficiente:0.70,profundo:0.88,epistemico:0.98,monothread:0.82,estrutura:0.98},
weights:{visual:0.36,eficiente:0.28,profundo:0.36}},kawaii:{id:'kawaii',emoji:'🎨',btnPt:'🎨 Visual',btnEn:'🎨 Visual',
axes:{visual:0.98,eficiente:0.72,profundo:0.60,epistemico:0.74,monothread:0.75,estrutura:0.76},
weights:{visual:0.80,eficiente:0.10,profundo:0.10}},harness_rsi:{id:'harness_rsi',emoji:'🏛',btnPt:'🏛 Profundo / RSI',
btnEn:'🏛 Deep / RSI',axes:{visual:0.76,eficiente:0.30,profundo:0.98,epistemico:0.94,monothread:0.55,estrutura:0.85},
weights:{visual:0.20,eficiente:0.10,profundo:0.70}}}
const COGNITIVE_RADAR_AXES_DEF=[
{key:'visual',icon:'🎨',pt:'Visual',en:'Visual',hex:'#38bdf8',cls:'btw-ternary-lbl-v',r:56,g:189,b:248},
{key:'monothread',icon:'🧭',pt:'Monothread',en:'Monothread',hex:'#c084fc',cls:'btw-ternary-lbl-m',r:192,g:132,b:252},
{key:'epistemico',icon:'🔬',pt:'Epistêmico',en:'Epistemic',hex:'#2dd4bf',cls:'btw-ternary-lbl-ep',r:45,g:212,b:191},
{key:'profundo',icon:'🏛',pt:'Profundo',en:'Deep',hex:'#fbbf24',cls:'btw-ternary-lbl-p',r:245,g:158,b:11},
{key:'eficiente',icon:'⚡',pt:'Concisão',en:'Concise',hex:'#34d399',cls:'btw-ternary-lbl-e',r:16,g:185,b:129},
{key:'estrutura',icon:'📐',pt:'Estrutura',en:'Structure',hex:'#fb7185',cls:'btw-ternary-lbl-s',r:251,g:113,b:133}]
const MASCOT_EMOTION_CATALOG={
struggle:{id:'struggle',icon:'😣',badgePt:'ME SOLTA! · WIGGLE',badgeEn:'HOLDING! · WIGGLE',tone:'warn',valence:0.45,arousal:0.99,bpm:138,color:'#f59e0b'},
laser_beam:{id:'laser_beam',icon:'⚡',badgePt:'LASER NO CHAT · SÍNTESE',badgeEn:'LASER BEAM · SYNTH',tone:'info',valence:0.88,arousal:0.96,bpm:118,color:'#38bdf8'},
compression_radar:{id:'compression_radar',icon:'📡',badgePt:'RADAR COMPRESSÃO · SCAN',badgeEn:'COMPRESS RADAR · SCAN',tone:'info',valence:0.84,arousal:0.94,bpm:114,color:'#00e5ff'},
affection:{id:'affection',icon:'💖',badgePt:'CARINHO · AFETO',badgeEn:'BOND · HIGH',tone:'good',valence:0.98,arousal:0.78,bpm:88,color:'#f472b6'},
eureka:{id:'eureka',icon:'✨',badgePt:'EUREKA · Δτ+',badgeEn:'EUREKA · Δτ+',tone:'good',valence:0.94,arousal:0.86,bpm:96,color:'#fbbf24'},
curious:{id:'curious',icon:'🧐',badgePt:'CALIBRANDO LENTE',badgeEn:'TUNING LENS',tone:'info',valence:0.72,arousal:0.74,bpm:82,color:'#38bdf8'},
hyperfocus:{id:'hyperfocus',icon:'⚡',badgePt:'HIPERFOCO ATIVO',badgeEn:'HYPERFOCUS',tone:'warn',valence:0.64,arousal:0.90,bpm:108,color:'#10b981'},
protective:{id:'protective',icon:'🛡',badgePt:'ESCUDO LOOP-GUARD',badgeEn:'LOOP-GUARD SHIELD',tone:'error',valence:-0.55,arousal:0.95,bpm:124,color:'#ef4444'},
playful:{id:'playful',icon:'(｡•̀ᴗ-)✧',badgePt:'FLUXO CRIATIVO',badgeEn:'CREATIVE SPARK',tone:'good',valence:0.85,arousal:0.68,bpm:78,color:'#38bdf8'},
focused:{id:'focused',icon:'✦',badgePt:'SINCRONIA NOMINAL',badgeEn:'NOMINAL SYNC',tone:'good',valence:0.68,arousal:0.52,bpm:72,color:'#38bdf8'},
zen:{id:'zen',icon:'🌊',badgePt:'ÓRBITA ZEN',badgeEn:'ZEN ORBIT',tone:'info',valence:0.50,arousal:0.24,bpm:58,color:'#818cf8'}
}
const MASCOT_STRUGGLE_LINES={pt:{balanced:'😣💦 Opa, opa! Meus giroscópios estão fazendo cócegas! Onde vamos pousar?!',
neurodivergent:'😣💦 Eita! Não sacode o meu foco monothread que meus anéis estão girando a 1000 RPM!',
kawaii:'(>﹏<)💦 Nyaa~ me solta, me solta! Você vai bagunçar meus diagramas ASCII e minhas estrelinhas!',
anxious:'😣💦 Aaah! Estou preso no cursor do mouse! E se uma tool der timeout enquanto eu balanço?!',
technical:'😣💦 [WARN:GRAB_STRUGGLE] G-force=2.8G · giroscópio desalinhado · solte para estabilizar órbita!',
harness_rsi:'😣💦 Perturbação gravitacional externa detectada! Meu vetor Δτ está chacoalhando todo!',
custom:'😣💦 *Wiggle-wiggle!* Meus sensores estão fazendo cócegas — cuidado na manobra!'},en:{
balanced:'😣💦 Whoa, whoa! My gyroscopes are ticklish! Where are we landing?!',
neurodivergent:'😣💦 Hey! Do not shake my monothread focus — my rings are spinning at 1000 RPM!',
kawaii:'(>﹏<)💦 Eep~ let me go! You are going to scramble my ASCII diagrams and sparkles!',
anxious:'😣💦 Aaah! I am pinned to the mouse cursor! What if a tool times out while I wiggle?!',
technical:'😣💦 [WARN:GRAB_STRUGGLE] G-force=2.8G · gyroscope off-axis · release to stabilize orbit!',
harness_rsi:'😣💦 External gravitational perturbation detected! My Δτ vector is wobbling!',
custom:'😣💦 *Wiggle-wiggle!* My optical sensors are ticklish — careful with the maneuver!'}}
const MASCOT_PAT_LINES={pt:{balanced:[
'⚖ *Prrr-sync!* Carinho recebido! Lente harmônica calibrada em 65% — pronto para o próximo passo!',
'⚖ Sintonia plena! Monitorando cache L0 e telemetria em background sem poluir o chat.'],neurodivergent:[
'🧬 *Prrr-bzt!* Carinho recebido! Giroscópios alinhados em monothread — 1 passo por vez com você!',
'⚡ Bateria afetiva em 100%! Eu seguro a carga da telemetria pra sua memória de trabalho ficar livre.'],kawaii:[
'(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Nyaa~ sensores ópticos brilhando em 120%! Vamos desenhar tabelas e diagramas lindos!',
'ʕ•́ᴥ•̀ʔっ💖 Carinho detectado! Meu núcleo ciano está soltando faíscas de alegria visual!'],anxious:[
'⚡ *Beep-purr!* Recebido em 0.4ms! Escudo Loop-Guard calibrado com carinho — zero bloqueios!',
'🟢 Pulso firme! Se qualquer tool tropeçar 2×, eu te aviso na hora com o fix em 1 linha.'],technical:[
'🧩 [D0:AFFECTION_EVENT] pat_ack=true · bond_sync=100% · visual_matrix=86% · epistêmico=98% · nominal.',
'🧩 [STATE:HARMONY] Sensores táteis validados ($0). Contrato [D0:FATO] vs [D2:HIPÓTESE] operante e feliz.'],harness_rsi:[
'🏛 Ressonância afetiva confirmada: Δτ emocional = +1.00! Co-evoluindo nossa biblioteca de lições com rigor.',
'🔄 Ciclo Propose-Probe-Care concluído! Cache L0 aquecido e arquitetura pronta para desafios profundos.'],
custom:['✦ *Purr-sync!* Carinho registrado na sua lente personalizada — sistemas nominais e prontos!']},en:{balanced:[
'⚖ *Purr-sync!* Pat received! Harmonic lens calibrated at 65% — ready for your next move!',
'⚖ Full sync! Watching L0 cache and background telemetry with zero chat clutter.'],neurodivergent:[
'🧬 *Purr-bzt!* Pat received! Gyroscopes locked in monothread — one clear step at a time with you!',
'⚡ Affective battery at 100%! I am holding the telemetry load so your working memory stays clear.'],kawaii:[
'(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Yay~ optical sensors sparkling at 120%! Ready to craft gorgeous tables and diagrams!',
'ʕ•́ᴥ•̀ʔっ💖 Headpat detected! My cyan core is radiating visual joy sparkles!'],anxious:[
'⚡ *Beep-purr!* Ack in 0.4ms! Loop-Guard shield charged with affection — zero blockers ahead!',
'🟢 Pulse locked! If any tool stumbles twice, I will flag the 1-line fix instantly.'],technical:[
'🧩 [D0:AFFECTION_EVENT] pat_ack=true · bond_sync=100% · visual_matrix=86% · epistemic=98% · nominal.',
'🧩 [STATE:HARMONY] Tactile sensors verified ($0). [D0:FACT] vs [D2:HYPOTHESIS] contract happy and nominal.'],harness_rsi:[
'🏛 Affective resonance verified: emotional Δτ = +1.00! Co-evolving our playbook with deep rigor.',
'🔄 Propose-Probe-Care cycle complete! L0 cache warm and architecture primed for deep synthesis.'],
custom:['✦ *Purr-sync!* Headpat logged in your custom cognitive lens — all systems nominal!']}}
const MASCOT_LENS_SHIFT_LINES={pt:{
balanced:a=> `⚖ Lente Equilibrada ativa (Visual ${Math.round(a.visual * 100)}% · Epistêmico ${Math.round(a.epistemico * 100)}%)! Equilíbrio harmônico em 5D/6D.`,
neurodivergent:a=> `🧬 Lente AuDHD 3e ativa (Monothread ${Math.round(a.monothread * 100)}% · Visual ${Math.round(a.visual * 100)}% · Epistêmico ${Math.round(a.epistemico * 100)}%)! Causa INV/DOM + 1 passo por vez.`,
kawaii:a=> `🎨 Lente Visual (${Math.round(a.visual * 100)}%) ativa! Prismas prontos para tabelas GFM, callouts e diagramas ASCII! ✨`,
anxious:a=> `⚡ Modo TDAH Flash (${Math.round(a.eficiente * 100)}% Concisão · ${Math.round(a.monothread * 100)}% Monothread)! Síntese de alto contraste em 3 linhas.`,
technical:a=> `🧩 [LENS:TEA] Visual=${Math.round(a.visual * 100)}% · Epistêmico=${Math.round(a.epistemico * 100)}% · Estrutura=${Math.round(a.estrutura * 100)}% · Matrizes GFM + [D0 vs D2] travados!`,
harness_rsi:a=> `🏛 Lente Profunda / RSI (${Math.round(a.profundo * 100)}% Deep · ${Math.round(a.visual * 100)}% Visual) ativa! Cache L0 e contraste Δτ no radar.`,
custom:a=> `✦ Lente 5D/6D personalizada sintonizada em tempo real (Visual ${Math.round(a.visual * 100)}%)!`},en:{
balanced:a=> `⚖ Balanced Lens active (Visual ${Math.round(a.visual * 100)}% · Epistemic ${Math.round(a.epistemico * 100)}%)! Harmonic 5D/6D balance.`,
neurodivergent:a=> `🧬 AuDHD 3e Lens active (Monothread ${Math.round(a.monothread * 100)}% · Visual ${Math.round(a.visual * 100)}% · Epistemic ${Math.round(a.epistemico * 100)}%)! INV/DOM + 1 step at a time.`,
kawaii:a=> `🎨 Visual Lens (${Math.round(a.visual * 100)}%) active! Prisms set for GFM tables, callouts & ASCII flows! ✨`,
anxious:a=> `⚡ ADHD Flash Mode (${Math.round(a.eficiente * 100)}% Concise · ${Math.round(a.monothread * 100)}% Monothread)! High-contrast 3-line synthesis.`,
technical:a=> `🧩 [LENS:SYSTEMATIC] Visual=${Math.round(a.visual * 100)}% · Epistemic=${Math.round(a.epistemico * 100)}% · Structure=${Math.round(a.estrutura * 100)}% · GFM matrices + [D0 vs D2] locked!`,
harness_rsi:a=> `🏛 Deep / RSI Lens (${Math.round(a.profundo * 100)}% Deep · ${Math.round(a.visual * 100)}% Visual) engaged! L0 cache & Δτ contrast active.`,
custom:a=> `✦ Custom 5D/6D lens tuned in real time (Visual ${Math.round(a.visual * 100)}%)!`}}
function projectOntoSimplex(uV,uE,uP){
const arr=[uV,uE,uP]
const sorted=[...arr].sort((a,b)=>b - a)
let sum=0
let rho=1
for(let j=0;j<3;j++){sum +=sorted[j]
if(sorted[j]+(1 - sum)/(j + 1)>0){rho=j + 1}}
const theta=(1 - sorted.slice(0,rho).reduce((acc,v)=>acc + v,0))/ rho
let wV=Math.max(0,uV + theta)
let wE=Math.max(0,uE + theta)
let wP=Math.max(0,uP + theta)
const norm=wV + wE + wP||1
wV=Number((wV / norm).toFixed(4))
wE=Number((wE / norm).toFixed(4))
wP=Number(Math.max(0,1 - wV - wE).toFixed(4))
return{visual:wV,eficiente:wE,profundo:wP}}
function cartesianToBarycentricClamped(px,py){
const{visual:V,eficiente:E,profundo:P}=TERNARY_VERTICES
const det=(E.y - P.y)*(V.x - P.x)+(P.x - E.x)*(V.y - P.y)
const uV=((E.y - P.y)*(px - P.x)+(P.x - E.x)*(py - P.y))/ det
const uE=((P.y - V.y)*(px - P.x)+(V.x - P.x)*(py - P.y))/ det
const uP=1 - uV - uE
return projectOntoSimplex(uV,uE,uP)}
function barycentricToCartesian(w){
const{visual:V,eficiente:E,profundo:P}=TERNARY_VERTICES
const wV=Number(w?.visual??0.34)
const wE=Number(w?.eficiente??0.33)
const wP=Number(w?.profundo??0.33)
return{x:wV * V.x + wE * E.x + wP * P.x,y:wV * V.y + wE * E.y + wP * P.y}}
function mixTernaryColor(w,axes=null){if(axes&&typeof axes==='object'){
const v=Number(axes.visual??0.8)
const e=Number(axes.eficiente??0.8)
const p=Number(axes.profundo??0.78)
const ep=Number(axes.epistemico??0.88)
const m=Number(axes.monothread??0.96)
const sum=v + e + p + ep + m||1
const r=Math.round((v * 56 + e * 16 + p * 245 + ep * 45 + m * 168)/ sum)
const g=Math.round((v * 189 + e * 185 + p * 158 + ep * 212 + m * 85)/ sum)
const b=Math.round((v * 248 + e * 129 + p * 11 + ep * 191 + m * 247)/ sum)
return `rgb(${r}, ${g}, ${b})`}
const{visual:V,eficiente:E,profundo:P}=TERNARY_VERTICES
const wV=Number(w?.visual??0.34)
const wE=Number(w?.eficiente??0.33)
const wP=Number(w?.profundo??0.33)
const r=Math.round(wV * V.r + wE * E.r + wP * P.r)
const g=Math.round(wV * V.g + wE * E.g + wP * P.g)
const b=Math.round(wV * V.b + wE * E.b + wP * P.b)
return `rgb(${r}, ${g}, ${b})`}
function resolveCognitivePersonaFromAxes(axes,lang='en'){
const isPt=lang==='pt'
const v=Number(axes?.visual??0.8)
const e=Number(axes?.eficiente??0.8)
const p=Number(axes?.profundo??0.78)
const ep=Number(axes?.epistemico??0.88)
const m=Number(axes?.monothread??0.96)
const s=Number(axes?.estrutura??0.9)
let bestId='neurodivergent'
let bestDist=Infinity
for(const[id,preset]of Object.entries(PERSONA_AXIS_PRESETS)){
const pa=preset.axes
const d=Math.hypot((v - pa.visual)* 1.15,(e - pa.eficiente)* 1.1,(p - pa.profundo)* 1.15,(ep - pa.epistemico)* 1.2,
(m - pa.monothread)* 1.15,(s - pa.estrutura)* 0.9)
if(d<bestDist){bestDist=d
bestId=id}}
const catalog={balanced:{id:'balanced',emoji:'⚖',
name:isPt?'Equilibrado Harmônico (Generalista 5D/6D)':'Harmonic Balanced (All-Rounder 5D/6D)',desc:isPt
?'Equilíbrio harmônico (65% em todos os eixos): síntese clara, tabela GFM concisa quando útil e 1–2 próximos passos.'
:'Harmonic 65% balance across all axes: clear executive takeaway, compact GFM table when useful, and 1–2 next steps.'},
neurodivergent:{id:'neurodivergent',emoji:'🧬',
name:isPt?'AuDHD 3e (Foco Monothread & Causa INV/DOM)':'AuDHD 3e (Monothread Focus & INV/DOM Cause)',desc:isPt
?'Tripla Excepcionalidade (TEA+TDAH+AH/SD): une 96% Monothread (↳ 1 Único Passo) + 80% Visual + 88% Epistêmico + 78% Causa INV/DOM.'
:'Triple-Exceptionality (ASD+ADHD+Gifted): unites 96% Monothread (↳ 1 Single Step) + 80% Visual + 88% Epistemic + 78% INV/DOM Cause.'
},anxious:{id:'anxious',emoji:'⚡',
name:isPt?'TDAH Flash (Alta Saliência & Zero Atraso)':'ADHD Flash (High-Salience & Zero Delay)',desc:isPt
?'Blindagem executiva TDAH (98% Concisão · 92% Monothread · 72% Visual): máx. 3 linhas de alto contraste (🟢 Status · 🚨 Gargalo · 🛠 Fix).'
:'ADHD executive shield (98% Concise · 92% Monothread · 72% Visual): max 3 high-contrast lines (🟢 Status · 🚨 Bottleneck · 🛠 Fix).'},
technical:{id:'technical',emoji:'🧩',
name:isPt?'Sistemático TEA (86% Visual, Matrizes & Literal [D0/D2])':'Systematic ASD (86% Visual, Matrices & Literal [D0/D2])',
desc:isPt
?'Hiper-Sistematização & EPF Autista: 86% Visual (tabelas GFM e grafos [A] ──► [B]) + 98% Epistêmico ([D0:FATO MEDIDO] vs [D2:HIPÓTESE]) + 98% Previsibilidade.'
:'Autistic Hyper-Systemizing & EPF: 86% Visual (GFM matrices & [A] ──► [B] causal graphs) + 98% Epistemic ([D0:OBSERVED FACT] vs [D2:HYPOTHESIS]) + 98% Structure.'
},kawaii:{id:'kawaii',emoji:'🎨',
name:isPt?'Pensador Visual (98% Dual-Coding, Tabelas & ASCII)':'Visual Thinker (98% Dual-Coding, Tables & ASCII)',desc:isPt
?'Domínio Visuoespacial (Paivio & Mayer, 98% Visual): prioriza tabelas GFM, callouts estruturados, badges cromáticos e diagramas ASCII.'
:'Visual Dominance (Paivio & Mayer, 98% Visual): prioritizes GFM tables, structured callouts, status badges, and ASCII diagrams.'},
harness_rsi:{id:'harness_rsi',emoji:'🏛',
name:isPt?'Analista Profundo / RSI (98% Sistemas, Cache L0 & Δτ)':'Deep Systems / RSI (98% Exhaustive, L0 Cache & Δτ)',desc:isPt
?'Alta Need-for-Cognition (98% Profundo · 94% Epistêmico · 76% Visual): análise exaustiva de contexto, cache L0, causas-raízes e contraste Δτ.'
:'High Need-for-Cognition (98% Deep · 94% Epistemic · 76% Visual): exhaustive analysis of context, L0 cache, root causes, and Δτ contrast.'
}}
return catalog[bestId]||catalog.neurodivergent}
function resolveTernaryPersona(w,lang='en'){
const isPt=lang==='pt'
const wV=Number(w?.visual??0.34)
const wE=Number(w?.eficiente??0.33)
const wP=Number(w?.profundo??0.33)
const maxW=Math.max(wV,wE,wP)
if(maxW<0.44){
return{id:'neurodivergent',emoji:'🧬',
name:isPt?'AuDHD 3e / Equilibrado (Foco Monothread)':'AuDHD 3e / Balanced (Monothread Focus)',desc:isPt
?'Equilíbrio baricêntrico: passos finitos, clareza visual e profundidade causal INV/DOM sob medida.'
:'Barycentric balance: finite steps, visual clarity, and calibrated INV/DOM causal depth.'}}
if(wV>=0.54){
return{id:'kawaii',emoji:'🎨',
name:isPt?'Pensador Visual (Rich Markdown, Tabelas & ASCII)':'Visual Thinker (Rich MD, Tables & ASCII)',desc:isPt
?'Domínio Visual: prioriza tabelas GFM, callouts estruturados, badges e diagramas ASCII.'
:'Visual Dominance: prioritizes GFM tables, structured callouts, status badges, and ASCII diagrams.'}}
if(wE>=0.54){
return{id:'anxious',emoji:'⚡',name:isPt?'TDAH Flash (Alta Saliência & Direto)':'ADHD Flash (High-Salience & Action-First)',
desc:isPt?'Domínio Eficiente: leitura mínima e resolução imediata em até 3 linhas de alto contraste.'
:'Efficient Dominance: minimal reading and instant resolution in 3 high-contrast lines.'}}
if(wP>=0.54){
return{id:'harness_rsi',emoji:'🏛',
name:isPt?'Analista Profundo (Acadêmico & Exaustivo)':'Deep Analyst (Academic & Exhaustive)',desc:isPt
?'Domínio Profundo: análise exaustiva de contexto, cache L0, causas-raízes e contraste Δτ.'
:'Deep Dominance: exhaustive analysis of context, L0 cache, root causes, and Δτ contrast.'}}
if(wE>=wV&&wP>=wV){
return{id:'technical',emoji:'🧩',
name:isPt?'Sistemático TEA (Literal [D0/D2] & Matrizes Visuais)':'Systematic ASD (Literal [D0/D2] & Visual Matrices)',desc:isPt
?'Sistemático TEA: contratos literais [D0:FATO] vs [D2:HIPÓTESE] + matrizes GFM e grafos [A] ──► [B].'
:'Systematic ASD: literal [D0:FACT] vs [D2:HYPOTHESIS] contracts + GFM matrices & [A] ──► [B] graphs.'}}
if(wV>=wP&&wE>=wP){
return{id:'kawaii',emoji:'📊',name:isPt?'Executivo Visual (Tabelas Rápidas & Ação)':'Visual Executive (Fast Tables & Action)',
desc:isPt?'Fusão Visual + Eficiente: sínteses ultra-rápidas apresentadas em matrizes e cards visuais.'
:'Visual + Efficient Blend: low-latency syntheses presented in matrices and visual cards.'}}
return{id:'technical',emoji:'🧩',
name:isPt?'Sistemático TEA (86% Visual, Matrizes & Literal [D0/D2])':'Systematic ASD (86% Visual, Matrices & Literal [D0/D2])',
desc:isPt?'Fusão Visual + Profundo + Epistêmico: matrizes GFM, diagramas causais ASCII e rigor literal [D0/D2].'
:'Visual + Deep + Epistemic Blend: GFM matrices, ASCII causal diagrams, and literal [D0/D2] rigor.'}}
function deriveMascotAffect({pulse,scope,personality,weights,axes,affection,lensDragging,isUnstarted,petGrabbed=false,laserTarget=null,compressionRadar=null}){
const now=Date.now()
const consecErr=Number(pulse?.consecutive_errors||0)
const turnTools=Number(pulse?.turn_tools||0)
const busy=Boolean(scope?.busy)
const wV=Number(axes?.visual??weights?.visual??0.8)
const wE=Number(axes?.eficiente??weights?.eficiente??0.8)
const wP=Number(axes?.profundo??weights?.profundo??0.78)
let stateId=affection?.moodOverride&&affection.moodOverride!=='auto'?affection.moodOverride:''
if(compressionRadar?.active){stateId='compression_radar'
}else if(petGrabbed){stateId='struggle'
}else if(laserTarget?.phase==='loading'){stateId='laser_beam'
}else if(laserTarget?.phase==='ready_burst'){stateId='eureka'
}else if(!stateId){if(now - Number(affection?.lastPatAt||0)<9000){stateId='affection'
}else if(lensDragging||now - Number(affection?.lastLensShiftAt||0)<4200){stateId='curious'
}else if(consecErr>=2){stateId='protective'
}else if(now - Number(affection?.lastEurekaAt||0)<8000){stateId='eureka'
}else if(busy){stateId='hyperfocus'
}else if(isUnstarted&&turnTools===0){stateId=personality==='kawaii'?'playful':'zen'
}else if(personality==='kawaii'||wV>=0.92){stateId='playful'
}else{stateId='focused'}}
const base=MASCOT_EMOTION_CATALOG[stateId]||MASCOT_EMOTION_CATALOG.focused
const bondBonus=Math.min(0.12,Number(affection?.level||82)/ 1000)
const valence=Math.max(-1,Math.min(1,Number((base.valence +(consecErr>0?-0.25:bondBonus)).toFixed(2))))
const arousal=Math.max(0.1,Math.min(1,Number((base.arousal +(busy?0.12:0)+(wE - 0.5)* 0.1).toFixed(2))))
const bpm=Math.round(base.bpm +(busy?14:0)+(wE - wP)* 8)
const syncPct=Math.min(100,Math.max(72,Math.round(85 +(affection?.level||82)* 0.15 - consecErr * 12)))
return{...base,valence,arousal,bpm,syncPct,auraColor:mixTernaryColor(weights,axes)}}
function triggerMascotPat(scope){
const cur=$petAffection.get()
const lang=$lang.get()==='pt'?'pt':'en'
const persona=$personality.get()||'neurodivergent'
const nextPats=(cur.pats||0)+ 1
const nextLevel=Math.min(100,(cur.level||82)+ 4)
updatePetAffection({level:nextLevel,pats:nextPats,lastPatAt:Date.now(),moodOverride:'auto'})
haptic?.('success')
const bank=MASCOT_PAT_LINES[lang]?.[persona]||MASCOT_PAT_LINES[lang].neurodivergent
const line=bank[nextPats % bank.length]
petSay('pat',line,'good',10000)
if(scope?.key){addPetBubble(scope.key,{type:'btw',
title:lang==='pt'? `💖 Carinho no Mascote (#${nextPats})` : `💖 Companion Bond (#${nextPats})`,summary:line,ai_inferred:false,
personality:persona,tone:'good'})}}
function triggerMascotStruggle(){
const lang=$lang.get()==='pt'?'pt':'en'
const persona=$personality.get()||'neurodivergent'
$petGrabbed.set(true)
haptic?.('tap')
const line=MASCOT_STRUGGLE_LINES[lang]?.[persona]||MASCOT_STRUGGLE_LINES[lang].neurodivergent
petSay('struggle',line,'warn',6000)}
function triggerDemoLaserBeam(scope=null){
const isPt=$lang.get()==='pt'
if(!$petAerialFlight.get()){setPref($petAerialFlight,true,'petAerialFlight')}
const vw=Math.max(480,window.innerWidth||1200)
const vh=Math.max(360,window.innerHeight||800)
const targetX=Math.round(vw * 0.48)
const targetY=Math.round(vh - 148)
haptic?.('tap')
petSay('laser-charge',isPt?'⚡ *Pew-zzt!* Disparando laser sintetizador no chat do Hermes (Loading Banner)...'
:'⚡ *Pew-zzt!* Firing synthesizer laser into Hermes chat (Loading Banner)...','info',4500)
$bannerLaserTarget.set({x:targetX,y:targetY,width:420,height:44,phase:'loading',entryId:'demo_laser',demo:true,ts:Date.now()})
if(_laserReadyTimer)cancelTimer(_laserReadyTimer)
_laserReadyTimer=scheduleTimer(()=>{$bannerLaserTarget.set({x:targetX,y:targetY,width:420,height:44,phase:'ready_burst',
entryId:'demo_laser',demo:true,ts:Date.now()})
updatePetAffection({lastEurekaAt:Date.now()})
haptic?.('success')
const readyMsg=isPt?'✨ *Zzzap-Eureka!* Banner /btw materializado e pronto para leitura no chat!'
:'✨ *Zzzap-Eureka!* /btw banner materialized and ready to read in chat!'
petSay('laser-ready',readyMsg,'good',7000)
if(scope?.key){addPetBubble(scope.key,{type:'btw',
title:isPt?'⚡✨ Laser do Mascote → Banner /btw':'⚡✨ Mascot Laser → /btw Banner',summary:readyMsg,ai_inferred:false,
personality:$personality.get(),tone:'good'})}
_laserReadyTimer=scheduleTimer(()=>{_laserReadyTimer=null
$bannerLaserTarget.set(null)
},2000)
},1900)}
async function triggerCompressionRadarTour(scope=null,snapHint=null,opts={}){
const lang=$lang.get()==='pt'?'pt':'en'
const isPt=lang==='pt'
const isLiveRpc=Boolean(opts?.liveRpc)
for(const tId of _compressionRadarTimers)clearTimeout(tId)
_compressionRadarTimers=[]
const fallbackCfg=$backendSettings.get()?.compression_config||{enabled:true,engine:'compressor',threshold_pct:85,
threshold_tokens:750000,target_ratio_pct:20,tail_mode:'lean',protect_first_n:3,protect_last_n:30,proactive_prune_tokens:650000,
summary_model:'gemini-2.5-flash'}
const cwHint=snapHint?.context_window||{}
let cfg={...fallbackCfg,...(cwHint.compression_config||{})}
let winMetrics={used_tokens:Number(cwHint.used_tokens||0),max_tokens:Number(cwHint.max_tokens||1000000),
occupancy_pct:Number(cwHint.occupancy_pct||0),
messages_active:Number(cwHint.messages_active||snapHint?.counts?.messages_active||0),
messages_compacted:Number(cwHint.messages_compacted||0)}
const buildStages=(c,w)=>{
const thrK=Math.round(Number(c.threshold_tokens||750000)/ 1000)
const pruneK=Math.round(Number(c.proactive_prune_tokens||650000)/ 1000)
const usedK=(Number(w.used_tokens||0)/ 1000).toFixed(1)
const maxK=Math.round(Number(w.max_tokens||1000000)/ 1000)
const shortMod=String(c.summary_model||'gemini-2.5-flash').split('/').pop()
return isPt?[
`📡 [1/4 · Varredura]: Comprimindo janela em ${w.occupancy_pct}% (${usedK}k/${maxK}k tok) · Gatilho ${c.threshold_pct}% (${thrK}k)!`,
`🛡️ [2/4 · Blindagem]: Preservando as primeiras ${c.protect_first_n} msgs (Cache L0 intacto) + últimas ${c.protect_last_n} msgs!`,
`🗜️ [3/4 · Compressor]: Motor '${c.engine}' (${shortMod}) sintetizando histórico para ${c.target_ratio_pct}% do tamanho…`,
`✨ [4/4 · Concluído]: Contexto compactado com sucesso! Cache L0 e instruções preservados!`]:[
`📡 [1/4 · Scan]: Compressing window at ${w.occupancy_pct}% (${usedK}k/${maxK}k tok) · Trigger ${c.threshold_pct}% (${thrK}k)!`,
`🛡️ [2/4 · Shield]: Protecting first ${c.protect_first_n} msgs (L0 Cache intact) + last ${c.protect_last_n} active msgs!`,
`🗜️ [3/4 · Compressor]: Engine '${c.engine}' (${shortMod}) condensing middle history to ${c.target_ratio_pct}% ratio…`,
`✨ [4/4 · Done]: Context compacted cleanly! L0 Cache & instructions preserved!`]}
let stages=buildStages(cfg,winMetrics)
const stageTags=['SCAN','SHIELD','COMPRESS','DONE']
const emitStage=idx=>{
const tag=stageTags[idx]||'SCAN'
const line=stages[idx]||stages[0]
$compressionRadarState.set({active:true,stageIdx:idx,stageTag:tag,config:cfg,windowMetrics:winMetrics,liveRpc:isLiveRpc,stages,ts:Date.now()})
$aerialBubble.set({id: `comp-radar-${idx}`,text:line.slice(0,180),tone:idx===3?'good':'info',ts:Date.now()})
haptic?.(idx===3?'success':'tap')
petSay(`comp-radar-${idx}`,line,idx===3?'good':'info',isLiveRpc&&idx===2?45000:6500)}
emitStage(0)
if(_rest){
const sid=scope?.storedId||scope?.runtimeId||resolveFocusedIds().storedId||resolveFocusedIds().runtimeId||''
_rest('/presets/resolve',{method:'POST',body:{prompt: `__BTW_COMPRESSION_RADAR__:${lang}`,session_id:sid},timeoutMs:8000})
.then(res=>{if(res?.ok&&res.compression_config){cfg={...cfg,...res.compression_config}
if(res.context_window)winMetrics={...winMetrics,...res.context_window}
stages=Array.isArray(res.stages)&&res.stages.length===4?res.stages:buildStages(cfg,winMetrics)
if($compressionRadarState.get()?.active&&$compressionRadarState.get()?.stageIdx===0){emitStage(0)}}}).catch(()=>undefined)}
if(isLiveRpc){
;[1,2].forEach(stepIdx=>{
const timer=setTimeout(()=>{if($compressionRadarState.get()?.active)emitStage(stepIdx)},stepIdx * 5200)
_compressionRadarTimers.push(timer)})
const safetyEnd=setTimeout(()=>{finishCompressionRadarSequence(scope)},95_000)
_compressionRadarTimers.push(safetyEnd)
}else{
;[1,2,3].forEach(stepIdx=>{
const timer=setTimeout(()=>{emitStage(stepIdx)
if(stepIdx===3&&scope?.key){addPetBubble(scope.key,{type:'telemetry',
title:isPt?'📡 Radar de Compressão do Hermes Agent':'📡 Hermes Context Compression Radar',summary:stages.join(' · '),
ai_inferred:false,personality:$personality.get(),tone:'good'})}
},stepIdx * 5500)
_compressionRadarTimers.push(timer)})
const endTimer=setTimeout(()=>{$compressionRadarState.set(null)
updatePetAffection({lastEurekaAt:Date.now()})
_compressionRadarTimers=[]
},4 * 5500 + 800)
_compressionRadarTimers.push(endTimer)}}
function finishCompressionRadarSequence(scope=null){
const cur=$compressionRadarState.get()
if(!cur?.active)return
for(const tId of _compressionRadarTimers)clearTimeout(tId)
_compressionRadarTimers=[]
const isPt=$lang.get()==='pt'
const doneLine=(Array.isArray(cur.stages)&&cur.stages[3])||(isPt
?'✨ [4/4 · Concluído]: Contexto compactado com sucesso! Cache L0 e instruções preservados!'
:'✨ [4/4 · Done]: Context compacted cleanly! L0 Cache & instructions preserved!')
$compressionRadarState.set({...cur,active:true,stageIdx:3,stageTag:'DONE',liveRpc:false,ts:Date.now()})
$aerialBubble.set({id:'comp-radar-3',text:doneLine.slice(0,180),tone:'good',ts:Date.now()})
haptic?.('success')
petSay('comp-radar-3',doneLine,'good',6800)
if(scope?.key){addPetBubble(scope.key,{type:'telemetry',
title:isPt?'📡 Radar de Compressão Concluído':'📡 Context Compression Complete',summary:doneLine,
ai_inferred:false,personality:$personality.get(),tone:'good'})}
const endTimer=setTimeout(()=>{
$compressionRadarState.set(null)
if($aerialBubble.get()?.id==='comp-radar-3')$aerialBubble.set(null)
updatePetAffection({lastEurekaAt:Date.now()})
_compressionRadarTimers=[]
},6000)
_compressionRadarTimers.push(endTimer)}
async function adoptBtwNativeDesktopPet(persona=null,activate=true){
const p=persona||$personality.get()||'neurodivergent'
const isPt=$lang.get()==='pt'
try{if(_rest){await _rest('/presets/resolve',{method:'POST',body:{
prompt: `__BTW_NATIVE_PET__:${p}:${activate?'activate':'sync'}`,
session_id:resolveFocusedIds().storedId||resolveFocusedIds().runtimeId||''},timeoutMs:12000})}
if(activate&&typeof host?.request==='function'){await host.request('pet.select',{slug:'btw-studio-companion'})
setPref($nativePetActive,true,'nativePetActive')
haptic?.('success')
const msg=isPt?'🐾 Mascote BTW Studio ativado nos Pets do Hermes Desktop (btw-studio-companion)!'
:'🐾 BTW Studio Mascot activated in Hermes Desktop Pets (btw-studio-companion)!'
petSay('native-adopt',msg,'good',10000)
host.notify?.({kind:'info',message:msg})}
return true
}catch{
return false}}
function BtwAerialMascotFlight({scope=null}){
const aerialEnabled=useValue($petAerialFlight)
if(!aerialEnabled)return null
return jsx(BtwAerialMascotFlightActive,{scope})}
function BtwAerialMascotFlightActive({scope=null}){
const lang=useValue($lang)
const isPt=lang==='pt'
const personality=useValue($personality)
const weights=useValue($personaWeights)
const axes=useValue($personaAxes)
const affection=useValue($petAffection)
const lensDragging=useValue($lensDragging)
const aerialBubble=useValue($aerialBubble)
const petGrabbed=useValue($petGrabbed)
const laserTarget=useValue($bannerLaserTarget)
const compressionRadar=useValue($compressionRadarState)
const pulseMap=useValue($livePulseBySession)
const pulse=scope?.key?pulseMap[scope.key]:null
const containerRef=useRef(null)
const posRef=useRef({x:88,y:120,vx:0,vy:0,bank:0,dir:1})
const dragStateRef=useRef(null)
const holdTimerRef=useRef(null)
const[spontaneousMood,setSpontaneousMood]=useState('')
const[hearts,setHearts]=useState([])
const[bankDeg,setBankDeg]=useState(0)
const[flightDir,setFlightDir]=useState(1)
const[onRightHalf,setOnRightHalf]=useState(false)
const laserOriginRef=useRef({x:126,y:158})
 const laserLine1Ref=useRef(null)
 const laserLine2Ref=useRef(null)
 const laserLine3Ref=useRef(null)
 const laserDotRef=useRef(null)
useEffect(()=>{
const moods=['focused','curious','playful','eureka','focused','zen']
let idx=0
const timer=setInterval(()=>{
if(scope?.busy||Number(pulse?.consecutive_errors||0)>=2||$petGrabbed.get()||$bannerLaserTarget.get()||$compressionRadarState.get()?.active){
setSpontaneousMood('')
return}
idx=(idx + 1)% moods.length
setSpontaneousMood(moods[idx])
},9000)
return()=>clearInterval(timer)
},[scope?.busy,pulse?.consecutive_errors])
useEffect(()=>{
const el=containerRef.current
if(!el)return undefined
const vw=()=>Math.max(360,window.innerWidth||1200)
const vh=()=>Math.max(320,window.innerHeight||800)
const pickAerialWaypoint=()=>{
const vpW=vw()
const vpH=vh()
const maxSafeY=Math.max(110,vpH - 215)
const lanes=[{x:28 + Math.random()* 130,y:58 + Math.random()* Math.max(80,maxSafeY - 70)},
{x:Math.max(180,vpW - 210)+ Math.random()* 110,y:58 + Math.random()* Math.max(80,maxSafeY - 70)},
{x:80 + Math.random()* Math.max(200,vpW - 240),y:52 + Math.random()* 90},
{x:28 + Math.random()* 140,y:Math.max(96,maxSafeY - 60)+ Math.random()* 45}]
return lanes[Math.floor(Math.random()* lanes.length)]}
let target=pickAerialWaypoint()
let dwellUntil=0
let lastTs=performance.now()
let rafId=0
let phase=0
const step=now=>{
const dt=Math.min(0.05,Math.max(0.001,(now - lastTs)/ 1000))
lastTs=now
phase +=dt * 2.6
const p=posRef.current
const activeLaser=$bannerLaserTarget.get()
const activeRadar=$compressionRadarState.get()
if(!dragStateRef.current){if(activeLaser){
const perchX=Math.max(24,Math.min(vw()- 110,activeLaser.x - 110))
const perchY=Math.max(52,Math.min(vh()- 180,activeLaser.y - 124))
const dx=perchX - p.x
const dy=perchY - p.y
p.vx +=(dx * 4.2 - p.vx)* Math.min(1,dt * 6.0)
p.vy +=(dy * 4.2 - p.vy)* Math.min(1,dt * 6.0)
p.x +=p.vx * dt
p.y +=p.vy * dt + Math.sin(phase * 2.2)* 0.35
}else if(activeRadar?.active){
const cx=Math.min(vw()- 360,Math.max(120,vw()* 0.36))
const cy=Math.max(135,Math.min(vh()- 180,vh()* 0.28))
const rx=24
const ry=12
const orbitX=cx + Math.cos(phase * 0.08)* rx - 38
const orbitY=cy + Math.sin(phase * 0.08)* ry - 38
const dx=orbitX - p.x
const dy=orbitY - p.y
p.vx +=(dx * 1.35 - p.vx)* Math.min(1,dt * 2.4)
p.vy +=(dy * 1.35 - p.vy)* Math.min(1,dt * 2.4)
p.x +=p.vx * dt
p.y +=p.vy * dt
}else if(now<dwellUntil){p.vx *=0.88
p.vy *=0.88
p.y +=Math.sin(phase * 1.4)* 0.32
}else{
const dx=target.x - p.x
const dy=target.y - p.y
const dist=Math.hypot(dx,dy)
const speed=scope?.busy?118:74
if(dist<18){dwellUntil=now + 1800 + Math.random()* 2600
target=pickAerialWaypoint()
}else{
const desiredVx=(dx / dist)* speed
const desiredVy=(dy / dist)* speed + Math.sin(phase * 1.8)* 18
p.vx +=(desiredVx - p.vx)* Math.min(1,dt * 3.4)
p.vy +=(desiredVy - p.vy)* Math.min(1,dt * 3.4)
p.x +=p.vx * dt
p.y +=p.vy * dt}}
const maxX=Math.max(20,vw()- 92)
const maxY=Math.max(44,vh()- 205)
p.x=Math.max(16,Math.min(maxX,p.x))
p.y=Math.max(44,Math.min(maxY,p.y))}
const nextBank=activeRadar?.active?0:Math.max(-20,Math.min(20,Math.round(p.vx * 0.16)))
if(Math.abs(nextBank - p.bank)>=2){p.bank=nextBank
setBankDeg(nextBank)}
const nextDir=p.vx>=6?1:p.vx<=-6?-1:p.dir
if(nextDir!==p.dir){p.dir=nextDir
setFlightDir(nextDir)}
const rightHalf=p.x>vw()* 0.55
setOnRightHalf(prev=>(prev===rightHalf?prev:rightHalf))
if(activeLaser){
 const lx=String(Math.round(p.x + 38)),ly=String(Math.round(p.y + 36))
 laserOriginRef.current={x:Number(lx),y:Number(ly)}
 for(const lnRef of[laserLine1Ref,laserLine2Ref,laserLine3Ref]){
 lnRef.current?.setAttribute('x1',lx)
 lnRef.current?.setAttribute('y1',ly)
}
 laserDotRef.current?.setAttribute('cx',lx)
 laserDotRef.current?.setAttribute('cy',ly)
}
el.style.left= `${p.x.toFixed(1)}px`
el.style.top= `${p.y.toFixed(1)}px`}
const tick=ts=>step(typeof ts==='number'&&ts>0?ts:performance.now())
let stopLoop=null
if(typeof createBudgetedLoop==='function'){
const loop=createBudgetedLoop(tick,{fps:30,pauseWhenUnfocused:true})
loop?.start?.()
stopLoop=()=>{if(typeof loop?.dispose==='function')loop.dispose();else loop?.stop?.()}
}else{
const onRaf=now=>{tick(now);rafId=window.requestAnimationFrame(onRaf)}
rafId=window.requestAnimationFrame(onRaf)
stopLoop=()=>{if(rafId)window.cancelAnimationFrame(rafId)}
}
return()=>{stopLoop?.()
if(holdTimerRef.current){clearTimeout(holdTimerRef.current)
holdTimerRef.current=null}}
},[scope?.busy])
const effectiveAffection=useMemo(()=>({...affection,moodOverride:affection.moodOverride&&affection.moodOverride!=='auto'
?affection.moodOverride:spontaneousMood||'auto'}),[affection,spontaneousMood])
const affect=useMemo(()=>deriveMascotAffect({pulse,scope,personality,weights,axes,affection:effectiveAffection,lensDragging,
isUnstarted:!scope?.storedId&&!scope?.runtimeId,petGrabbed,laserTarget,compressionRadar}),
[pulse,scope?.busy,scope?.storedId,scope?.runtimeId,personality,weights,axes,effectiveAffection,lensDragging,petGrabbed,laserTarget,compressionRadar]
)
const handlePointerDown=e=>{if(e.button!==0)return
e.stopPropagation()
e.currentTarget.setPointerCapture?.(e.pointerId)
dragStateRef.current={startX:e.clientX,startY:e.clientY,origX:posRef.current.x,origY:posRef.current.y,moved:false,
struggled:false}
if(holdTimerRef.current)clearTimeout(holdTimerRef.current)
holdTimerRef.current=setTimeout(()=>{holdTimerRef.current=null
if(dragStateRef.current){dragStateRef.current.struggled=true
triggerMascotStruggle()}
},150)}
const handlePointerMove=e=>{
const st=dragStateRef.current
if(!st)return
const dx=e.clientX - st.startX
const dy=e.clientY - st.startY
if(Math.hypot(dx,dy)>4){st.moved=true
if(!st.struggled){st.struggled=true
if(holdTimerRef.current){clearTimeout(holdTimerRef.current)
holdTimerRef.current=null}
triggerMascotStruggle()}}
const vpW=Math.max(360,window.innerWidth||1200),vpH=Math.max(320,window.innerHeight||800)
posRef.current.x=Math.max(16,Math.min(Math.max(20,vpW-92),st.origX+dx))
posRef.current.y=Math.max(44,Math.min(Math.max(44,vpH-205),st.origY+dy))
posRef.current.vx=dx*0.5
setOnRightHalf(posRef.current.x>vpW*0.55)
if(containerRef.current){containerRef.current.style.left=`${posRef.current.x.toFixed(1)}px`;containerRef.current.style.top=`${posRef.current.y.toFixed(1)}px`}}
const handlePointerUp=e=>{if(holdTimerRef.current){clearTimeout(holdTimerRef.current)
holdTimerRef.current=null}
const st=dragStateRef.current
if(!st)return
e.currentTarget.releasePointerCapture?.(e.pointerId)
dragStateRef.current=null
if($petGrabbed.get()){$petGrabbed.set(false)
if(st.moved){petSay('struggle-release',isPt?'😮💨 Ufa! Giroscópios re-estabilizados de volta na órbita!'
:'😮💨 Phew! Gyroscopes re-stabilized back in orbit!','info',4200)}}
if(!st.moved&&!st.struggled){
const id=Date.now()+ Math.random()
setHearts(prev=>[...prev.slice(-4),{id,x:25 + Math.random()* 50}])
scheduleTimer(()=>{setHearts(prev=>prev.filter(ht=>ht.id!==id))
},1050)
triggerMascotPat(scope)}}
const beamColor=laserTarget?.phase==='ready_burst'?'#34d399':affect.auraColor
return hs(Fragment,null,[laserTarget&&hs('svg','btw-laser-canvas',[h('line',{ref:laserLine1Ref,x1:String(laserOriginRef.current.x),y1:String(laserOriginRef.current.y),x2:String(laserTarget.x),y2:String(laserTarget.y),stroke:beamColor,strokeWidth:laserTarget.phase==='ready_burst'?'10':'7',cls:'btw-laser-beam-glow'}),h('line',{ref:laserLine2Ref,x1:String(laserOriginRef.current.x),y1:String(laserOriginRef.current.y),x2:String(laserTarget.x),y2:String(laserTarget.y),strokeWidth:laserTarget.phase==='ready_burst'?'3.2':'2.2',cls:'btw-laser-beam-core'}),h('line',{ref:laserLine3Ref,x1:String(laserOriginRef.current.x),y1:String(laserOriginRef.current.y),x2:String(laserTarget.x),y2:String(laserTarget.y),stroke:laserTarget.phase==='ready_burst'?'#fbbf24':beamColor,strokeWidth:'4.2',cls:'btw-laser-beam-packets'}),
h('circle',{ref:laserDotRef,cx:String(laserOriginRef.current.x),cy:String(laserOriginRef.current.y),r:'8',fill:'#ffffff',fillOpacity:'0.85'}),h('circle',{cx:String(laserTarget.x),cy:String(laserTarget.y),r:laserTarget.phase==='ready_burst'?'22':'14',fill:'none',stroke:beamColor,strokeWidth:'2.2',cls:'btw-laser-impact-ring'}),h('circle',{cx:String(laserTarget.x),cy:String(laserTarget.y),r:'6',fill:'#ffffff',stroke:beamColor,strokeWidth:'2.5'})]),divs({ref:containerRef,cls:'btw-aerial-companion','data-emotion':affect.id,'data-persona':personality,style:{left: `${posRef.current.x}px`,
top: `${posRef.current.y}px`,'--mascot-aura':affect.auraColor,'--mascot-emotion-color':affect.color},title:isPt
?'Mascote BTW Studio em Voo Livre 360° · Clique para carinho, segure/arraste para ver a reação de cócegas (struggle), duplo-clique para abrir o Studio!'
:'BTW Studio Free-Flying Companion · Click to pat, hold/drag for ticklish struggle reaction, double-click to open Studio!',onPointerDown:handlePointerDown,onPointerMove:handlePointerMove,onPointerUp:handlePointerUp,onPointerCancel:handlePointerUp,onDoubleClick:e=>{e.stopPropagation()
requestOpenStudio({tab:'ask'})}},[compressionRadar?.active&&div('btw-aerial-radar-hud',`📡 ${compressionRadar.stageTag} ${compressionRadar.stageIdx + 1}/4 · THR ${compressionRadar.config?.threshold_pct??85}% · →${compressionRadar.config?.target_ratio_pct??20}% · P:${compressionRadar.config?.protect_last_n??30}`),aerialBubble&&div({cls:'btw-aerial-bubble',style:onRightHalf?{right:0}:{left:0}},aerialBubble.text),affect.id==='struggle'&&hs(Fragment,null,[
span({cls:'btw-mascot-sweat-drop',style:{left:'6%'}},'💦'),
span({cls:'btw-mascot-sweat-drop',style:{right:'6%',animationDelay:'0.22s'}},'💢')]),hearts.map(ht=>
span({cls:'btw-mascot-heart-particle',style:{left: `${ht.x}%` }},personality==='technical'?'✦ +1':'💖',ht.id)),Math.abs(bankDeg)>=3&&div({cls:'btw-aerial-thruster',style:{
background: `linear-gradient(90deg, transparent, ${affect.auraColor})`,
...(flightDir>=0?{left:'-16px',transform:'translateY(-50%)'}:{right:'-16px',transform:'translateY(-50%) scaleX(-1)'})}}),divs({cls:'btw-aerial-orb-wrap',style:{transform: `rotate(${bankDeg}deg)` }},[jsx(OrbyxSvgAvatar,{affect,personality,gx:flightDir * 3.5,gy:0,detailed:false})]),divs('btw-aerial-badge',[span(null,affect.icon),span(null,isPt?affect.badgePt.split(' · ')[0]:affect.badgeEn.split(' · ')[0])])])])}
function OrbyxSvgAvatar({affect,personality,gx=0,gy=0,detailed=false}){
return hs('svg',{viewBox:'0 0 120 120',cls:'btw-mascot-svg'},[
detailed&&hs('defs',null,[jsxs('radialGradient',{id:'btw-orb-shell',cx:'38%',cy:'30%',r:'70%',children:[h('stop',{offset:'0%',stopColor:'#f8fafc'}),h('stop',{offset:'55%',stopColor:'#cbd5e1'}),h('stop',{offset:'100%',stopColor:'#475569'})]}),jsxs('radialGradient',{id:'btw-orb-visor',cx:'50%',cy:'45%',r:'58%',children:[h('stop',{offset:'0%',stopColor:'#1e293b'}),h('stop',{offset:'75%',stopColor:'#090d16'}),h('stop',{offset:'100%',stopColor:'#020617'})]})]),
h('circle',{cx:'60',cy:'60',r:'52',fill:affect.auraColor,fillOpacity:detailed?'0.14':'0.18',cls:detailed?'btw-mascot-aura-ring':undefined}),
affect.id==='compression_radar'&&hs(Fragment,null,[h('circle',{cx:'60',cy:'60',r:'54',fill:'none',stroke:'#00e5ff',strokeWidth:'1.8',cls:'btw-mascot-sonar-ring'}),h('circle',{cx:'60',cy:'60',r:'50',fill:'none',stroke:'#38bdf8',strokeWidth:'2.2',strokeDasharray:'6 4',cls:'btw-mascot-compress-ring'}),h('path',{d:'M60 60 L60 4 A56 56 0 0 1 112 40 Z',fill:'#00e5ff',fillOpacity:'0.32',cls:'btw-mascot-radar-cone'})]),
h('ellipse',{cx:'60',cy:'60',rx:'50',ry:'18',fill:'none',stroke:affect.auraColor,strokeWidth:detailed?'1.75':'2',strokeDasharray:personality==='technical'?'6 3':'none',strokeOpacity:detailed?'0.68':'0.75',cls:'btw-mascot-gyro-ring-a'}),
h('ellipse',{cx:'60',cy:'60',rx:'46',ry:'46',fill:'none',stroke:affect.color,strokeWidth:detailed?'1.2':'1.3',strokeDasharray:'12 8',strokeOpacity:'0.48',cls:'btw-mascot-gyro-ring-b'}),
hs('g','btw-mascot-body-group',[
detailed&&personality==='kawaii'?h('path',{d:'M60 8 L63 16 L71 16 L65 21 L67 29 L60 24 L53 29 L55 21 L49 16 L57 16 Z',fill:'#38bdf8',stroke:'#ffffff',strokeWidth:'1'})
:detailed&&personality==='anxious'?h('path',{d:'M63 7 L53 21 L61 21 L57 31 L69 17 L61 17 Z',fill:'#10b981'})
:detailed&&personality==='harness_rsi'?h('circle',{cx:'60',cy:'14',r:'5',fill:'none',stroke:'#f59e0b',strokeWidth:'2.2'})
:hs('g',null,[h('line',{x1:'60',y1:'14',x2:'60',y2:'24',stroke:affect.auraColor,strokeWidth:'2.5',strokeLinecap:'round'}),h('circle',{cx:'60',cy:'12',r:'4',fill:affect.color})]),
h('circle',{cx:'60',cy:'62',r:'36',fill:detailed?'url(#btw-orb-shell)':'#cbd5e1',stroke:'#e2e8f0',strokeWidth:'1.5'}),
detailed&&h('circle',{cx:'60',cy:'62',r:'30.5',fill:'none',stroke:'#64748b',strokeWidth:'1.2',strokeDasharray:'18 4'}),
h('circle',{cx:'60',cy:'62',r:'26.5',fill:detailed?'url(#btw-orb-visor)':'#090d16',stroke:affect.auraColor,strokeWidth:'1.7',strokeOpacity:'0.9'}),
detailed&&h('polygon',{points:'60,76 64,81 62,86 58,86 56,81',fill:affect.auraColor,fillOpacity:'0.45',stroke:affect.auraColor,strokeWidth:'1'}),
hs('g',{transform: `translate(${gx}, ${gy})`,cls:'btw-mascot-eyes-gaze'},[hs('g','btw-mascot-eyes-blink',[
affect.id==='struggle'?hs(Fragment,null,[h('path',{d:'M41 52 L53 58 L41 64',fill:'none',stroke:'#fbbf24',strokeWidth:'3.6',strokeLinecap:'round',strokeLinejoin:'round'}),h('path',{d:'M79 52 L67 58 L79 64',fill:'none',stroke:'#fbbf24',strokeWidth:'3.6',strokeLinecap:'round',strokeLinejoin:'round'}),h('ellipse',{cx:'40',cy:'66',rx:'4.8',ry:'2.4',fill:'#fb7185',fillOpacity:'0.78'}),h('ellipse',{cx:'80',cy:'66',rx:'4.8',ry:'2.4',fill:'#fb7185',fillOpacity:'0.78'}),h('path',{d:'M51 70 Q55 66 59 70 T67 70',fill:'none',stroke:'#ffffff',strokeWidth:'2.2',strokeLinecap:'round'})])
:affect.id==='affection'?hs(Fragment,null,[h('path',{d:'M43 58 Q49 49 55 58',fill:'none',stroke:'#f472b6',strokeWidth:'3.6',strokeLinecap:'round'}),h('path',{d:'M65 58 Q71 49 77 58',fill:'none',stroke:'#f472b6',strokeWidth:'3.6',strokeLinecap:'round'}),h('ellipse',{cx:'41',cy:'65',rx:'4.5',ry:'2.2',fill:'#f472b6',fillOpacity:'0.65'}),h('ellipse',{cx:'79',cy:'65',rx:'4.5',ry:'2.2',fill:'#f472b6',fillOpacity:'0.65'})])
:affect.id==='zen'?hs(Fragment,null,[h('path',{d:'M43 57 Q49 63 55 57',fill:'none',stroke:affect.auraColor,strokeWidth:'3',strokeLinecap:'round'}),h('path',{d:'M65 57 Q71 63 77 57',fill:'none',stroke:affect.auraColor,strokeWidth:'3',strokeLinecap:'round'})])
:affect.id==='protective'?hs(Fragment,null,[h('ellipse',{cx:'49',cy:'58',rx:'5.5',ry:'6',fill:'#ef4444'}),h('ellipse',{cx:'71',cy:'58',rx:'5.5',ry:'6',fill:'#ef4444'}),h('line',{x1:'42',y1:'50',x2:'56',y2:'54',stroke:'#090d16',strokeWidth:'3.5',strokeLinecap:'round'}),h('line',{x1:'78',y1:'50',x2:'64',y2:'54',stroke:'#090d16',strokeWidth:'3.5',strokeLinecap:'round'}),h('circle',{cx:'47.5',cy:'56.5',r:'1.8',fill:'#ffffff'}),h('circle',{cx:'69.5',cy:'56.5',r:'1.8',fill:'#ffffff'})])
:hs(Fragment,null,[h('ellipse',{cx:'49',cy:'57',rx:affect.id==='playful'?'6.5':'5.6',ry:affect.id==='hyperfocus'||affect.id==='laser_beam'?'4.3':affect.id==='curious'?'5.2':'6.8',fill:affect.id==='eureka'?'#fbbf24':affect.id==='laser_beam'?'#38bdf8':affect.auraColor}),h('ellipse',{cx:'71',cy:'57',rx:affect.id==='playful'?'6.5':'5.6',ry:affect.id==='hyperfocus'||affect.id==='laser_beam'?'4.3':affect.id==='curious'?'7.6':'6.8',fill:affect.id==='eureka'?'#fbbf24':affect.id==='laser_beam'?'#38bdf8':affect.auraColor}),h('circle',{cx:'47',cy:'54.2',r:'2.1',fill:'#ffffff'}),h('circle',{cx:'69',cy:'54.2',r:'2.1',fill:'#ffffff'}),detailed&&h('circle',{cx:'51.2',cy:'59.5',r:'1.0',fill:'#ffffff',fillOpacity:'0.8'}),detailed&&h('circle',{cx:'73.2',cy:'59.5',r:'1.0',fill:'#ffffff',fillOpacity:'0.8'})]),
affect.id!=='struggle'&&(affect.id==='affection'||affect.id==='playful'||affect.id==='eureka'
?h('path',{d:'M55 68 Q60 73 65 68',fill:'none',stroke:'#ffffff',strokeWidth:'2',strokeLinecap:'round'})
:affect.id==='curious'?h('circle',{cx:'60',cy:'69',r:'2.4',fill:'none',stroke:'#ffffff',strokeWidth:'1.8'})
:h('line',{x1:'55',y1:'69',x2:'65',y2:'69',stroke:affect.auraColor,strokeWidth:'2',strokeLinecap:'round'})),
affect.id==='compression_radar'&&h('line',{x1:'36',y1:'58',x2:'84',y2:'58',stroke:'#00e5ff',strokeWidth:'1.8',strokeOpacity:'0.85',cls:'btw-mascot-visor-scanline'})])])])])}
function MascotCompanionStage({scope=null,compact=false,showControls=true}){
const fallbackScope=useFocusedSessionScope()
const activeScope=scope||fallbackScope
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const personality=useValue($personality)
const weights=useValue($personaWeights)
const axes=useValue($personaAxes)
const affection=useValue($petAffection)
const lensDragging=useValue($lensDragging)
const pulseMap=useValue($livePulseBySession)
const pulse=activeScope?.key?pulseMap[activeScope.key]:null
const petHere=useValue(_pet?.visible??$noPet)
const stockSafePet=useValue($stockSafePet)
const aerialFlightOn=useValue($petAerialFlight)
const petGrabbed=useValue($petGrabbed)
const laserTarget=useValue($bannerLaserTarget)
const compressionRadar=useValue($compressionRadarState)
const curStageTheme=useValue($theme)
const stageHoldRef=useRef(null)
const[hearts,setHearts]=useState([])
useEffect(()=>()=>{if(stageHoldRef.current){clearTimeout(stageHoldRef.current)
stageHoldRef.current=null}},[])
const affect=useMemo(()=>deriveMascotAffect({pulse,scope:activeScope,personality,weights,axes,affection,lensDragging,
isUnstarted:!activeScope?.storedId&&!activeScope?.runtimeId,petGrabbed,laserTarget,compressionRadar}),
[pulse,activeScope?.busy,activeScope?.storedId,activeScope?.runtimeId,personality,weights,axes,affection,lensDragging,petGrabbed,laserTarget,compressionRadar]
)
const gaze=useMemo(()=>{
const v=Number(axes?.visual??0.8)
const e=Number(axes?.eficiente??0.8)
const p=Number(axes?.profundo??0.78)
const m=Number(axes?.monothread??0.96)
const gx=(m + p * 0.5 - e * 1.1)* 3.8
const gy=(0.75 - v)* 4.5
return{x:Number(Math.max(-5,Math.min(5,gx)).toFixed(2)),y:Number(Math.max(-4.5,Math.min(4.5,gy)).toFixed(2))}
},[axes])
const handlePat=()=>{
const id=Date.now()+ Math.random()
setHearts(prev=>[...prev.slice(-4),{id,x:32 + Math.random()* 36}])
scheduleTimer(()=>{setHearts(prev=>prev.filter(ht=>ht.id!==id))
},1050)
triggerMascotPat(activeScope)}
const handleTestLine=()=>{
const sample=stockSafePet?strings.previewTextsCompact?.[personality]||strings.previewTextCompact
:strings.previewTexts?.[personality]||strings.previewText
updatePetAffection({lastEurekaAt:Date.now()})
haptic?.('tap')
if(petHere||aerialFlightOn)petSay('preview',sample,'info',12000)
else host.notify?.({kind:'info',message:sample})}
const pctV=Math.round(Number(axes?.visual??0.8)* 100)
const pctEp=Math.round(Number(axes?.epistemico??0.88)* 100)
const pctM=Math.round(Number(axes?.monothread??0.96)* 100)
return divs({cls:cn('btw-mascot-stage',compact&&'btw-mascot-stage--compact'),'data-emotion':affect.id,'data-persona':personality,style:{'--mascot-aura':affect.auraColor,'--mascot-emotion-color':affect.color,
'--mascot-bpm-dur': `${(60 / Math.max(45,affect.bpm)).toFixed(2)}s`}},[divs('btw-mascot-stage-main',[hsBtn('btw-mascot-avatar-btn',{onClick:handlePat,onPointerDown:()=>{
if(stageHoldRef.current)clearTimeout(stageHoldRef.current)
stageHoldRef.current=setTimeout(()=>{stageHoldRef.current=null
triggerMascotStruggle()
},160)},onPointerUp:()=>{if(stageHoldRef.current){clearTimeout(stageHoldRef.current)
stageHoldRef.current=null}
if($petGrabbed.get())$petGrabbed.set(false)},onPointerLeave:()=>{if(stageHoldRef.current){clearTimeout(stageHoldRef.current)
stageHoldRef.current=null}
if($petGrabbed.get())$petGrabbed.set(false)},title:isPt
?'Clique para fazer carinho ou segure para ver a reação de cócegas (struggle)!'
:'Click to pat or hold to trigger the ticklish struggle reaction!','aria-label':isPt?'Interagir com o mascote':'Interact with mascot'},[affect.id==='struggle'&&hs(Fragment,null,[span({cls:'btw-mascot-sweat-drop',style:{left:'6%'}},'💦'),
span({cls:'btw-mascot-sweat-drop',style:{right:'6%',animationDelay:'0.22s'}},'💢')]),hearts.map(ht=>
span({cls:'btw-mascot-heart-particle',style:{left: `${ht.x}%` }},personality==='technical'?'✦ +1':'💖',ht.id)),jsx(OrbyxSvgAvatar,{affect,personality,gx:gaze.x,gy:gaze.y,detailed:true})]),divs('btw-mascot-stage-info',[divs(CLS.rowWrapBetweenSm,[divs(CLS.rowWrap15,[spans({cls:'btw-mascot-nameplate',title:isPt
?'Orbyx (ORBYX-Δτ) — Mascote Guardião Orbital do BTW Studio':'Orbyx (ORBYX-Δτ) — BTW Studio Orbital Companion Mascot'},[span(null,'🛸'),span(null,`${MASCOT_NAME} · ${MASCOT_CALLSIGN}`)]),spans({cls:'btw-mascot-emotion-pill','data-tone':affect.tone},[span(null,affect.icon),span(null,isPt?affect.badgePt:affect.badgeEn)])]),
spans('font-mono btw-tx-10 btw-tt tabular-nums inline-flex items-center gap-1',[span('btw-mascot-heart-beat','♥'), `${affect.bpm} BPM · Sync ${affect.syncPct}%`])]),
divs('btw-mascot-meters',[divs({cls:'btw-mascot-meter',title:isPt?'Valência Afetiva (Russell Circumplex)':'Affective Valence (Russell Circumplex)'},[
span('btw-mascot-meter-lbl',isPt?'Valência':'Valence'),div('btw-mascot-meter-track',div({cls:'btw-mascot-meter-fill',style:{width: `${Math.round(((affect.valence + 1)/ 2)* 100)}%`,background:affect.color}})),
span('btw-mascot-meter-val',`${affect.valence>=0?'+':''}${Math.round(affect.valence * 100)}%`)]),divs({cls:'btw-mascot-meter',title:isPt?'Energia / Excitação Cognitiva (Arousal)':'Cognitive Arousal / Energy'},[span('btw-mascot-meter-lbl',isPt?'Energia':'Energy'),div('btw-mascot-meter-track',div({cls:'btw-mascot-meter-fill',style:{width: `${Math.round(affect.arousal * 100)}%`,background:affect.auraColor}})),
span('btw-mascot-meter-val',`${Math.round(affect.arousal * 100)}%`)])]),compressionRadar?.active&&Array.isArray(compressionRadar.stages)&&div('mt-1 rounded-md border btw-bd-ac50 btw-bg-ac10 px-2.5 py-1.5 btw-tx-11 leading-snug btw-str font-medium',compressionRadar.stages[compressionRadar.stageIdx]||compressionRadar.stages[0]),divs('btw-tx-105 btw-bdy truncate',[isPt?'Sintonizado em: ':'Tuned to: ',
h('strong','btw-str',strings.personaNames?.[personality]||personality),
` · Visual ${pctV}% · ${isPt?'Epistêmico':'Epistemic'} ${pctEp}% · Monothread ${pctM}%`])])]),showControls&&divs('btw-mascot-stage-actions',[
divs('btw-mascot-primary-grid',[
hBtn('btw-mascot-act-btn btw-mascot-pat-btn',{onClick:handlePat},spans('inline-flex items-center gap-1 min-w-0 truncate',[span(null,'👋'),
span('truncate',isPt? `Carinho (${MASCOT_NAME})` : `Pat ${MASCOT_NAME}`),affection.pats>0&&span('ml-0.5 rounded-full btw-bg-ba18 px-1.5 font-mono btw-tx-95 btw-bac shrink-0',`♥ ${affection.pats}`)])),
hBtn('btw-mascot-act-btn',{'data-active':aerialFlightOn?'true':'false',title:isPt
?'Ativar/Desativar Voo Livre 360° do Mascote ao redor da tela com Emotion Design'
:'Toggle 360° Free-Flying Mascot around the screen with Emotion Design',onClick:()=>{
const next=!$petAerialFlight.get()
setPref($petAerialFlight,next,'petAerialFlight')
haptic?.('tap')}},spans('inline-flex items-center gap-1 truncate',[span(null,'🛸'),isPt
? `Voo 360°: ${aerialFlightOn?'ON':'OFF'}` : `360° Flight: ${aerialFlightOn?'ON':'OFF'}`])),
hBtn('btw-mascot-act-btn',{title:isPt
?'Instalar e ativar este mascote nos Pets oficiais do Hermes Desktop (Settings ▸ Appearance ▸ Pets)'
:'Install and activate this companion in Hermes Desktop Pets (Settings ▸ Appearance ▸ Pets)',onClick:()=>void adoptBtwNativeDesktopPet(personality,true)},spans('inline-flex items-center gap-1 truncate',[codicon('hubot','0.72rem','btw-bac shrink-0'),isPt?'Usar no Hermes':'Use as Hermes Pet'])),
hBtn('btw-mascot-act-btn',{onClick:handleTestLine},spans('inline-flex items-center gap-1 truncate',[codicon('eye','0.72rem'),strings.previewBubble]))]),
divs('btw-mascot-sub-bar',[divs(CLS.rowWrap15,[
hBtn('btw-mascot-act-btn h-[24px] px-2.5 btw-tx-10',{title:isPt
?'Disparar Laser do Mascote no chat do Hermes (Loading Banner ──► Ready!)'
:'Fire Mascot Laser into Hermes chat (Loading Banner ──► Ready!)',onClick:()=>triggerDemoLaserBeam(activeScope)},spans(CLS.inline1,[span(null,'⚡'),isPt?'Laser Demo':'Laser Beam'])),
hBtn('btw-mascot-act-btn h-[24px] px-2.5 btw-tx-10',{'data-active':compressionRadar?.active?'true':'false',title:isPt
?'Ativar Voo de Radar de Compressão narrando as 4 etapas da compressão configurada no Hermes!'
:'Trigger Compression Radar Flight narrating the 4 stages of your configured Hermes compression!',onClick:()=>void triggerCompressionRadarTour(activeScope)},spans(CLS.inline1,[span(null,'📡'),isPt?'Radar Compressão':'Compress Radar'])),
curStageTheme!=='orbyx'&&hBtn('btw-mascot-act-btn h-[24px] px-2.5 btw-tx-10',{title:isPt
?'Ativar o tema exclusivo Orbyx · Órbita Δτ que combina 100% com o visor e aura do mascote!'
:'Activate the exclusive Orbyx Cyber-Orb theme matched 100% to the mascot visor and aura!',onClick:()=>{
setPref($theme,'orbyx','theme')
handlePat()}},spans(CLS.inline1,[span(null,'🎨'),isPt?'Tema Orbyx':'Orbyx Theme']))]),
divs('flex flex-wrap items-center gap-2',[h('select',{cls:'btw-select h-6 w-auto min-w-[132px] max-w-[160px] px-2 py-0 btw-tx-10',value:affection.moodOverride||'auto','aria-label':isPt?'Simular estado emocional':'Simulate emotional state',onChange:e=>{
const nextMood=e.target.value
updatePetAffection({moodOverride:nextMood})
haptic?.('tap')}},[h('option',{value:'auto'},isPt?'🎭 Humor: Auto':'🎭 Mood: Auto'),
h('option',{value:'affection'},isPt?'💖 Carinho / Joy':'💖 Affection / Joy'),
h('option',{value:'struggle'},'😣 Struggle / Wiggle'),
h('option',{value:'laser_beam'},isPt?'⚡ Laser no Chat':'⚡ Chat Laser'),
h('option',{value:'compression_radar'},isPt?'📡 Radar Compressão':'📡 Compression Radar'),
h('option',{value:'eureka'},'✨ Eureka Δτ+'),h('option',{value:'curious'},isPt?'🧐 Curioso / Lens':'🧐 Curious / Lens'),
h('option',{value:'hyperfocus'},isPt?'⚡ Hiperfoco':'⚡ Hyperfocus'),h('option',{value:'playful'},isPt?'🎨 Criativo':'🎨 Creative'),
h('option',{value:'protective'},isPt?'🛡 Escudo Alerta':'🛡 Alert Shield'),h('option',{value:'zen'},'🌊 Zen Standby')]),
spans('inline-flex items-center gap-1.5 btw-tx-10 font-medium btw-mut',[jsx(StatusDot,{tone:petHere?'good':'muted'}),petHere?strings.petOnScreen:(isPt?'Pet oculto na tela':'Pet off-screen')])])])])])}
function TernaryPersonaSelector({lang='en'}){
const weights=useValue($personaWeights)
const axes=useValue($personaAxes)
const geometry=useValue($personaGeometry)
const svgRef=useRef(null)
const[dragging,setDragging]=useState(false)
const[dragAxisIdx,setDragAxisIdx]=useState(-1)
const isPt=lang==='pt'
const announceLensShift=useCallback((nextAxes,personaId)=>{
const langKey=$lang.get()==='pt'?'pt':'en'
const fn=MASCOT_LENS_SHIFT_LINES[langKey]?.[personaId]||MASCOT_LENS_SHIFT_LINES[langKey].neurodivergent
const line=fn(nextAxes)
updatePetAffection({lastLensShiftAt:Date.now(),moodOverride:'auto'})
petSay('lens-shift',line,'info',8000)
},[])
const applyPreset=useCallback(presetKey=>{
const preset=PERSONA_AXIS_PRESETS[presetKey]||PERSONA_AXIS_PRESETS.neurodivergent
setPref($personaAxes,preset.axes,'personaAxes')
setPref($personaWeights,preset.weights,'personaWeights')
setPref($personality,preset.id,'personality')
syncBackendSettings({personality:preset.id,persona_axes:preset.axes,persona_weights:preset.weights})
if($nativePetActive.get())void adoptBtwNativeDesktopPet(preset.id,false)
announceLensShift(preset.axes,preset.id)
haptic?.('tap')},[announceLensShift])
const applyAxes=useCallback((nextAxes,commit=true)=>{
const resolved=resolveCognitivePersonaFromAxes(nextAxes,$lang.get())
const nextW=projectOntoSimplex(Number(nextAxes.visual??0.8),Number(nextAxes.eficiente??0.8),Number(nextAxes.profundo??0.78))
$personaAxes.set(nextAxes)
$personaWeights.set(nextW)
$personality.set(resolved.id)
if(commit){savePrefs({personaAxes:nextAxes,personaWeights:nextW,personality:resolved.id})
syncBackendSettings({personality:resolved.id,persona_axes:nextAxes,persona_weights:nextW})}
},[])
const applyWeights=useCallback((nextW,commit=true)=>{
const resolved=resolveTernaryPersona(nextW,$lang.get())
const presetAxes=PERSONA_AXIS_PRESETS[resolved.id]?.axes||$personaAxes.get()
const blendedAxes={...presetAxes,visual:Math.max(0.15,Math.min(0.98,Number((nextW.visual * 1.15).toFixed(2)))),
eficiente:Math.max(0.15,Math.min(0.98,Number((nextW.eficiente * 1.15).toFixed(2)))),
profundo:Math.max(0.15,Math.min(0.98,Number((nextW.profundo * 1.15).toFixed(2))))}
$personaWeights.set(nextW)
$personaAxes.set(blendedAxes)
$personality.set(resolved.id)
if(commit){savePrefs({personaWeights:nextW,personaAxes:blendedAxes,personality:resolved.id})
syncBackendSettings({personality:resolved.id,persona_weights:nextW,persona_axes:blendedAxes})}
},[])
const activeAxesList=useMemo(()=>(geometry==='hexagon'?COGNITIVE_RADAR_AXES_DEF:COGNITIVE_RADAR_AXES_DEF.slice(0,5)),
[geometry])
const updateFromClientPoint=useCallback((clientX,clientY,lockedIdx=-1,commit=false)=>{
const svg=svgRef.current
if(!svg)return
const rect=svg.getBoundingClientRect()
if(rect.width<=0||rect.height<=0)return
const svgX=((clientX - rect.left)/ rect.width)* 340
const svgY=((clientY - rect.top)/ rect.height)* 252
if(geometry==='ternary'){
const clamped=cartesianToBarycentricClamped(svgX,svgY)
applyWeights(clamped,commit)
return}
const N=activeAxesList.length
const cx=170
const cy=128
const rMax=58
const dx=svgX - cx
const dy=svgY - cy
let targetIdx=lockedIdx
if(targetIdx<0){
let bestDot=-Infinity
for(let i=0;i<N;i++){
const theta=-Math.PI / 2 +(i * 2 * Math.PI)/ N
const dot=dx * Math.cos(theta)+ dy * Math.sin(theta)
if(dot>bestDot){bestDot=dot
targetIdx=i}}
setDragAxisIdx(targetIdx)}
const theta=-Math.PI / 2 +(targetIdx * 2 * Math.PI)/ N
const proj=(dx * Math.cos(theta)+ dy * Math.sin(theta))/ rMax
const val=Number(Math.max(0.1,Math.min(1.0,proj)).toFixed(2))
const axisKey=activeAxesList[targetIdx]?.key||'visual'
const nextAxes={...$personaAxes.get(),[axisKey]:val}
applyAxes(nextAxes,commit)},[geometry,activeAxesList,applyAxes,applyWeights])
const pos=useMemo(()=>barycentricToCartesian(weights),[weights])
const dynColor=useMemo(()=>mixTernaryColor(weights,geometry==='ternary'?null:axes),[weights,axes,geometry])
const resolved=useMemo(
()=>(geometry==='ternary'?resolveTernaryPersona(weights,lang):resolveCognitivePersonaFromAxes(axes,lang)),
[weights,axes,geometry,lang])
const pctV=Math.round(Number((geometry==='ternary'?weights.visual:axes.visual)||0)* 100)
const pctE=Math.round(Number((geometry==='ternary'?weights.eficiente:axes.eficiente)||0)* 100)
const pctP=Math.round(Number((geometry==='ternary'?weights.profundo:axes.profundo)||0)* 100)
const{visual:V,eficiente:E,profundo:P}=TERNARY_VERTICES
const centerPt={x:(V.x + E.x + P.x)/ 3,y:(V.y + E.y + P.y)/ 3}
const radarGeometryData=useMemo(()=>{
const N=activeAxesList.length
const cx=170
const cy=128
const rMax=58
const vertices=activeAxesList.map((ax,i)=>{
const theta=-Math.PI / 2 +(i * 2 * Math.PI)/ N
const cosT=Math.cos(theta)
const sinT=Math.sin(theta)
const vx=cx + rMax * cosT
const vy=cy + rMax * sinT
const rVal=Math.max(0.08,Math.min(1,Number(axes?.[ax.key]??0.75)))
const px=cx + rVal * rMax * cosT
const py=cy + rVal * rMax * sinT
const isTopOrBottom=Math.abs(cosT)<0.25
const anchor=isTopOrBottom?'middle':cosT>0?'start':'end'
const lx=isTopOrBottom?cx:cx +(rMax + 15)* cosT
const ly=isTopOrBottom?(sinT<0?cy - rMax - 27:cy + rMax + 18):cy +(rMax + 10)* sinT - 2
return{...ax,i,theta,vx,vy,px,py,lx,ly,anchor,pct:Math.round(rVal * 100)}})
const ringScales=[0.25,0.5,0.75,1.0]
const rings=ringScales.map(sc=>vertices.map(v=> `${(cx + sc *(v.vx - cx)).toFixed(1)},${(cy + sc *(v.vy - cy)).toFixed(1)}`).join(' '))
const dataPoints=vertices.map(v=> `${v.px.toFixed(1)},${v.py.toFixed(1)}`).join(' ')
const starPoints=''
let areaSum=0
for(let i=0;i<N;i++){
const rA=Number(axes?.[activeAxesList[i].key]??0.75)
const rB=Number(axes?.[activeAxesList[(i + 1)% N].key]??0.75)
areaSum +=rA * rB}
const normAreaPct=Math.round((areaSum / N)* 100)
return{cx,cy,rMax,vertices,rings,dataPoints,starPoints,normAreaPct}
},[activeAxesList,axes])
const readoutAxes=geometry==='ternary'
?[{key:'visual',icon:'🎨',en:'Visual',pt:'Visual',hex:'#38bdf8',pct:pctV},
{key:'eficiente',icon:'⚡',en:'Efficient',pt:'Eficiente',hex:'#34d399',pct:pctE},
{key:'profundo',icon:'🏛',en:'Deep',pt:'Profundo',hex:'#fbbf24',pct:pctP}]
:radarGeometryData.vertices
return divs({cls:'btw-ternary-card',style:{'--btw-ternary-color':dynColor}},[divs('btw-lens-radar-col',[jsx(BtwSegmented,{value:geometry==='pentagram'?'pentagon':geometry,fullWidth:true,ariaLabel:isPt?'Geometria da Lente Cognitiva':'Cognitive Lens Geometry',
options:[{id:'pentagon',label:isPt?'⬠ 5D Polígono':'⬠ 5D Polygon'},
{id:'hexagon',label:isPt?'⬢ 6D Hexágono':'⬢ 6D Hexagon'},
{id:'ternary',label:isPt?'△ 3D Tríade':'△ 3D Triad'}],onChange:nextGeo=>{
setPref($personaGeometry,nextGeo,'personaGeometry')
syncBackendSettings({persona_geometry:nextGeo})}}),hs('svg',{ref:svgRef,viewBox:'0 0 340 252',cls:'btw-ternary-svg',role:'img','aria-label':isPt?'Diagrama de Personalidade Cognitiva':'Cognitive Personality Radar Diagram',onPointerDown:e=>{
e.preventDefault()
e.currentTarget.setPointerCapture?.(e.pointerId)
setDragging(true)
$lensDragging.set(true)
updatePetAffection({lastLensShiftAt:Date.now()})
updateFromClientPoint(e.clientX,e.clientY,-1,false)
haptic?.('tap')},onPointerMove:e=>{if(!dragging)return
updateFromClientPoint(e.clientX,e.clientY,dragAxisIdx,false)},onPointerUp:e=>{if(!dragging)return
e.currentTarget.releasePointerCapture?.(e.pointerId)
setDragging(false)
setDragAxisIdx(-1)
$lensDragging.set(false)
if(geometry==='ternary'){applyWeights($personaWeights.get(),true)
}else{applyAxes($personaAxes.get(),true)}
announceLensShift($personaAxes.get(),$personality.get())},onPointerCancel:()=>{if(dragging){if(geometry==='ternary'){
applyWeights($personaWeights.get(),true)
}else{applyAxes($personaAxes.get(),true)}}
setDragging(false)
setDragAxisIdx(-1)
$lensDragging.set(false)}},[hs('defs',null,[jsxs('linearGradient',{id:'btw-ternary-grad-ve',x1:'50%',y1:'0%',
x2:'0%',y2:'100%',children:[h('stop',{offset:'0%',stopColor:'#38bdf8',stopOpacity:'0.32'}),
h('stop',{offset:'100%',stopColor:'#10b981',stopOpacity:'0.26'})]}),jsxs('linearGradient',{id:'btw-ternary-grad-vp',
x1:'50%',y1:'0%',x2:'100%',y2:'100%',children:[h('stop',{offset:'0%',stopColor:'#c084fc',stopOpacity:'0.24'}),
h('stop',{offset:'100%',stopColor:'#f59e0b',stopOpacity:'0.28'})]})]),geometry==='ternary'?hs(Fragment,null,[
h('polygon',{points: `${V.x},${V.y} ${E.x},${E.y} ${P.x},${P.y}`,fill:'url(#btw-ternary-grad-ve)',stroke:dynColor,strokeWidth:'2',strokeLinejoin:'round'}),h('polygon',{points: `${V.x},${V.y} ${E.x},${E.y} ${P.x},${P.y}`,fill:'url(#btw-ternary-grad-vp)',stroke:'none'}),h('line',{x1:String(V.x),y1:String(V.y),x2:String((E.x + P.x)/ 2),y2:String((E.y + P.y)/ 2),stroke:'var(--btw-radar-grid)',strokeDasharray:'3 3'}),h('line',{x1:String(E.x),y1:String(E.y),x2:String((V.x + P.x)/ 2),y2:String((V.y + P.y)/ 2),stroke:'var(--btw-radar-grid)',strokeDasharray:'3 3'}),h('line',{x1:String(P.x),y1:String(P.y),x2:String((V.x + E.x)/ 2),y2:String((V.y + E.y)/ 2),stroke:'var(--btw-radar-grid)',strokeDasharray:'3 3'}),h('line',{x1:String(pos.x),y1:String(pos.y),x2:String(V.x),y2:String(V.y),stroke:'#38bdf8',strokeWidth:String(0.9 + pctV / 65),strokeOpacity:String(0.3 +(pctV / 100)* 0.6)}),h('line',{x1:String(pos.x),y1:String(pos.y),x2:String(E.x),y2:String(E.y),stroke:'#10b981',strokeWidth:String(0.9 + pctE / 65),strokeOpacity:String(0.3 +(pctE / 100)* 0.6)}),h('line',{x1:String(pos.x),y1:String(pos.y),x2:String(P.x),y2:String(P.y),stroke:'#f59e0b',strokeWidth:String(0.9 + pctP / 65),strokeOpacity:String(0.3 +(pctP / 100)* 0.6)}),
h('circle',{cx:String(centerPt.x),cy:String(centerPt.y),r:'3.2',fill:'var(--btw-radar-grid)'}),
h('circle',{cx:String(V.x),cy:String(V.y),r:'5',fill:'#38bdf8',stroke:'var(--btw-radar-node-ring)',strokeWidth:'1.5'}),h('text',{x:String(V.x),y:'22',textAnchor:'middle',cls:'btw-ternary-lbl-v',fontSize:'10',fontWeight:'700'},`🎨 Visual (${pctV}%)`),
h('circle',{cx:String(E.x),cy:String(E.y),r:'5',fill:'#10b981',stroke:'var(--btw-radar-node-ring)',strokeWidth:'1.5'}),h('text',{x:'14',y:'234',textAnchor:'start',cls:'btw-ternary-lbl-e',fontSize:'10',fontWeight:'700'},`⚡ ${isPt?'Eficiente':'Efficient'} (${pctE}%)`),
h('circle',{cx:String(P.x),cy:String(P.y),r:'5',fill:'#f59e0b',stroke:'var(--btw-radar-node-ring)',strokeWidth:'1.5'}),h('text',{x:'326',y:'234',textAnchor:'end',cls:'btw-ternary-lbl-p',fontSize:'10',fontWeight:'700'},`🏛 ${isPt?'Profundo':'Deep'} (${pctP}%)`),
h('circle',{cx:String(pos.x),cy:String(pos.y),r:dragging?'11':'9',fill:dynColor,fillOpacity:'0.28'}),
h('circle',{cx:String(pos.x),cy:String(pos.y),r:'6',fill:dynColor,stroke:'var(--btw-radar-node-ring)',strokeWidth:'2'})])
:hs(Fragment,null,[
...radarGeometryData.rings.map((pts,rIdx)=>h('polygon',{points:pts,fill:'none',stroke:'var(--btw-radar-grid)',strokeDasharray:rIdx===3?'none':'3 3',strokeWidth:rIdx===3?'1.35':'0.95'},undefined,`ring-${rIdx}`)),
radarGeometryData.starPoints&&h('polyline',{points:radarGeometryData.starPoints,fill:'none',stroke:dynColor,strokeOpacity:'0.22',strokeDasharray:'2 3',strokeWidth:'1.1'}),
...radarGeometryData.vertices.map(v=>h('line',{x1:String(radarGeometryData.cx),y1:String(radarGeometryData.cy),x2:String(v.vx),y2:String(v.vy),stroke:v.hex,strokeOpacity:'0.38',strokeWidth:'1.15'},undefined,`spoke-${v.key}`)),h('polygon',{points:radarGeometryData.dataPoints,fill:'url(#btw-ternary-grad-ve)',stroke:dynColor,strokeWidth:'2.2',strokeLinejoin:'round'}),
h('polygon',{points:radarGeometryData.dataPoints,fill:'url(#btw-ternary-grad-vp)',stroke:'none'}),h('circle',{cx:String(radarGeometryData.cx),cy:String(radarGeometryData.cy),r:'3',fill:'var(--btw-radar-grid)'}),
...radarGeometryData.vertices.map(v=>hs(Fragment,null,[h('circle',{cx:String(v.px),cy:String(v.py),r:dragging&&dragAxisIdx===v.i?'7.5':'5.2',fill:v.hex,stroke:'var(--btw-radar-node-ring)',strokeWidth:'1.6'}),hs('text',{x:String(v.lx),y:String(v.ly),textAnchor:v.anchor,cls:v.cls,fontSize:'9.4',fontWeight:'700'},[
h('tspan',{x:String(v.lx)},`${v.icon} ${isPt?v.pt:v.en}`),
h('tspan',{x:String(v.lx),dy:'11.2',fontFamily:'JetBrains Mono, monospace',fontSize:'9',fontWeight:'800'},`${v.pct}%`)])],`node-${v.key}`))])])]),divs('btw-ternary-readout',[divs('flex items-start justify-between gap-2',[divs('flex min-w-0 items-center gap-1.5 btw-tx-12 font-bold btw-str leading-tight',[span('shrink-0',resolved.emoji),span('min-w-0',resolved.name)]),
geometry!=='ternary'&&span('btw-theme-card-badge shrink-0',`${isPt?'Densidade':'Density'} ${radarGeometryData.normAreaPct}%`)]),div('btw-tx-105 btw-bdy leading-relaxed',resolved.desc),
div('btw-lens-axes-grid',readoutAxes.map(ax=>{
const setAxisRatio=ratio=>{
const clamped=Math.max(0.05,Math.min(1,Number(ratio.toFixed(2))))
if(geometry==='ternary'){
const curW=$personaWeights.get()||{visual:0.34,eficiente:0.33,profundo:0.33},rem=Math.max(0,1-clamped)
const others=['visual','eficiente','profundo'].filter(k=>k!==ax.key),oSum=Math.max(0.01,(curW[others[0]]||0.33)+(curW[others[1]]||0.33))
applyWeights(projectOntoSimplex(ax.key==='visual'?clamped:rem*((curW.visual||0.33)/oSum),ax.key==='eficiente'?clamped:rem*((curW.eficiente||0.33)/oSum),ax.key==='profundo'?clamped:rem*((curW.profundo||0.33)/oSum)),true)
}else{
const nextAxes={...$personaAxes.get(),[ax.key]:Math.max(0.1,clamped)}
applyAxes(nextAxes,true)
announceLensShift(nextAxes,$personality.get())
}
haptic?.('tap')}
return divs({cls:'btw-lens-axis-item',role:'slider',tabIndex:0,'aria-label':isPt?ax.pt:ax.en,'aria-valuemin':5,'aria-valuemax':100,'aria-valuenow':ax.pct,title:isPt?`Arraste, clique ou use setas para ajustar ${ax.pt}`:`Drag, click, or use arrow keys to adjust ${ax.en}`,onKeyDown:e=>{
if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();setAxisRatio((ax.pct+5)/100)}
else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();setAxisRatio((ax.pct-5)/100)}
else if(e.key==='Home'){e.preventDefault();setAxisRatio(0.1)}
else if(e.key==='End'){e.preventDefault();setAxisRatio(1)}
},onPointerDown:e=>{
const rect=e.currentTarget.getBoundingClientRect()
if(rect.width<=0)return
e.currentTarget.setPointerCapture?.(e.pointerId)
setAxisRatio((e.clientX-rect.left)/rect.width)
},onPointerMove:e=>{
if(!(e.buttons&1))return
const rect=e.currentTarget.getBoundingClientRect()
if(rect.width>0)setAxisRatio((e.clientX-rect.left)/rect.width)
}},[divs('btw-lens-axis-top',[spans('btw-lens-axis-name',[span(null,ax.icon),span(null,isPt?ax.pt:ax.en)]),span('btw-lens-axis-pct',`${ax.pct}%`)]),divs('btw-lens-axis-track',[div({cls:'btw-lens-axis-fill',style:{transform:`scaleX(${Math.max(0.04,ax.pct/100)})`,background:ax.hex}}),span({cls:'btw-lens-axis-thumb',style:{left:`${Math.max(4,Math.min(96,ax.pct))}%`,background:ax.hex}})])],`axis-bar-${ax.key}`)})),
(()=>{
const vP=Math.round(Number(axes?.visual??weights?.visual??0.8)*100),eP=Math.round(Number(axes?.eficiente??weights?.eficiente??0.8)*100),pP=Math.round(Number(axes?.profundo??weights?.profundo??0.78)*100),epP=Math.round(Number(axes?.epistemico??0.88)*100),mP=Math.round(Number(axes?.monothread??0.96)*100)
const l1=epP>=85?`[D0:OBSERVED] suite=46/46 · cache_L0=94.2% ($1.84 saved) · db=ro`:vP>=82?`📊 │ Tests: 46/46 PASS │ Cache L0: 94.2% │ Cost: $0.00 (/btw)`:(isPt?'🟢 Status: 46/46 testes verdes · Cache L0 em 94.2% ($0).':'🟢 Status: 46/46 tests green · L0 cache at 94.2% ($0).')
const l2=eP>=88?(isPt?'🚨 Alerta: plugin.js editado há 2 chamadas sem check.':'🚨 Bottleneck: plugin.js edited 2 calls ago without check.'):pP>=85?(isPt?`🔬 Causa [INV/DOM]: ocupação 42.1% · Δτ=+0.92 sem invalidação de prefixo.`:`🔬 Root Cause [INV/DOM]: 42.1% ctx occupancy · Δτ=+0.92 · 0 cache busts.`):(isPt?`🎯 Contexto: 3 arquivos tocados · sintaxe AST íntegra.`:`🎯 Context: 3 files touched · AST syntax verified.`)
const l3=mP>=82?(isPt?'↳ 1 Único Passo: rode node --check < desktop/plugin.js agora.':'↳ Single Next Step: run node --check < desktop/plugin.js now.'):(isPt?'↳ Próximos passos: 1) validar sintaxe ESM · 2) rodar pytest -q.':'↳ Next steps: 1) validate ESM syntax · 2) run pytest -q.')
return divs('btw-lens-live-preview',[divs('flex items-center justify-between gap-2 btw-tx-9 font-bold uppercase tracking-wider btw-bac',[span(null,isPt?'✦ Prévia ao Vivo da Lente':'✦ Live Lens Preview'),span('btw-mut','$0 · reactive')]),div('leading-snug btw-str',l1),div('leading-snug',l2),div('leading-snug btw-bac',l3)])
})(),
div({cls:'btw-lens-presets-grid',role:'radiogroup','aria-label':isPt?'Perfis cognitivos':'Cognitive presets'},Object.values(PERSONA_AXIS_PRESETS).map((preset,pIdx,pArr)=>hBtn('btw-lens-preset-btn',{role:'radio','aria-checked':resolved.id===preset.id?'true':'false',tabIndex:resolved.id===preset.id?0:-1,'data-active':resolved.id===preset.id?'true':'false',title:isPt?preset.btnPt:preset.btnEn,onKeyDown:rovingKeyDown(pArr.map(x=>x.id),pIdx,applyPreset),onClick:()=>applyPreset(preset.id)},span('truncate min-w-0',isPt?preset.btnPt:preset.btnEn),preset.id)))])])}
function ComposerModelPicker({providerValue='',modelValue='',onSelect,compact=false}){
const lang=useValue($lang)
const isPt=lang==='pt'
const backendCfg=useValue($backendSettings)||{}
const localFavs=useValue($favoriteModelsList)||[]
const liveComposerModel=String(useValue(host.state?.model??$noPet)||'').trim()
const[menuOpen,setMenuOpen]=useState(false)
const[showNativeCatalog,setShowNativeCatalog]=useState(false)
const modelOptionsQ=useQuery({queryKey:[ID,'composer-model-options'],enabled:Boolean(menuOpen&&host?.request),queryFn:async()=>{try{
return await host.request('model.options',{explicit_only:true})
}catch{
return null}},staleTime:30000,retry:0})
const favKeys=useMemo(()=>{
const merged=new Set([...(Array.isArray(localFavs)?localFavs:[]),
...(Array.isArray(backendCfg.favorite_models)?backendCfg.favorite_models:[])])
return[...merged].filter(Boolean)
},[localFavs,backendCfg.favorite_models])
const toggleFavorite=(provider,model)=>{
const p=String(provider||'custom').trim()
const m=String(model||'').trim()
if(!m)return
const key= `${p}::${m}`
const exists=favKeys.includes(key)||favKeys.includes(m)
const next=exists?favKeys.filter(k=>k!==key&&k!==m):[key,...favKeys]
setPref($favoriteModelsList,next,'favoriteModels')
syncBackendSettings({favorite_models:next})
haptic?.('tap')}
const catalogData=useMemo(()=>{
const cat=backendCfg.composer_catalog||{}
const defaultProv=String(modelOptionsQ.data?.provider||cat.default_provider||'custom').trim()
const defaultMod=String(liveComposerModel||modelOptionsQ.data?.model||cat.default_model||'').trim()
const defaultUrl=String(cat.default_base_url||'').trim()
const byKey=new Map()
const upsert=(prov,mod,extra={})=>{
const p=String(prov||defaultProv||'custom').trim()
const m=String(mod||'').trim()
if(!m)return
const key= `${p}::${m}`
const isFav=favKeys.includes(key)||favKeys.includes(m)
const isComposerActive=m===liveComposerModel
const liveCnt=0
const prev=byKey.get(key)
if(!prev){byKey.set(key,{key,provider:p,model:m,base_url:extra.base_url||defaultUrl,alias:extra.alias||'',
description:extra.description||'',sessions:Math.max(Number(extra.sessions||0),liveCnt),messages:Number(extra.messages||0),
favorite:isFav,isComposerActive,source:extra.source||'composer'})
}else{if(extra.alias&&!prev.alias)prev.alias=extra.alias
if(extra.description&&!prev.description)prev.description=extra.description
if(extra.base_url&&!prev.base_url)prev.base_url=extra.base_url
prev.sessions=Math.max(prev.sessions,Number(extra.sessions||0),liveCnt)
prev.favorite=prev.favorite||isFav
prev.isComposerActive=prev.isComposerActive||isComposerActive}}
for(const fk of favKeys){if(fk.includes('::')){
const[fp,fm]=fk.split('::')
upsert(fp,fm,{source:'favorite'})
}else{upsert(defaultProv,fk,{source:'favorite'})}}
if(liveComposerModel){upsert(defaultProv,liveComposerModel,{source:'composer_active'})}
if(Array.isArray(cat.subagent_options)){for(const opt of cat.subagent_options){upsert(opt.provider||defaultProv,opt.model,{
alias:opt.alias,description:opt.description,base_url:opt.base_url,source:'subagent_option'})}}
if(Array.isArray(cat.models)){for(const item of cat.models){upsert(item.provider||defaultProv,item.model,item)}}
const rpcProviders=modelOptionsQ.data?.providers
if(Array.isArray(rpcProviders)){for(const provRow of rpcProviders){
const pSlug=String(provRow?.slug||provRow?.name||defaultProv).trim()
const modelsArr=Array.isArray(provRow?.models)?provRow.models:[]
for(const mSlug of modelsArr.slice(0,18)){upsert(pSlug,mSlug,{source:'composer'})}}}
const all=[...byKey.values()]
const favorites=all.filter(x=>x.favorite)
const mostUsed=all
.filter(x=>!x.favorite&&(x.isComposerActive||x.alias||x.sessions>0))
.sort((a,b)=>{if(a.isComposerActive!==b.isComposerActive)return a.isComposerActive?-1:1
if(Boolean(a.alias)!==Boolean(b.alias))return a.alias?-1:1
return(b.sessions||0)-(a.sessions||0)})
const composerSelected=all.filter(x=>!x.favorite&&!x.isComposerActive&&!x.alias&&!(x.sessions>0))
return{defaultProv,defaultMod,defaultUrl,favorites,mostUsed,composerSelected,
ordered:[...favorites,...mostUsed,...composerSelected]}
},[backendCfg.composer_catalog,favKeys,liveComposerModel,modelOptionsQ.data])
const activeLabel=modelValue? `${providerValue? `${providerValue} · ` :''}${shortModelName(modelValue)}` :isPt
? `💬 Padrão do Composer (${shortModelName(catalogData.defaultMod)})` : `💬 Inherit Composer (${shortModelName(catalogData.defaultMod)})`
const nativeController=useMemo(()=>({allowSpeed:false,applyPreset:(_preset,row)=>{
onSelect?.({provider:row.provider,model:row.model,base_url:catalogData.defaultUrl})
setMenuOpen(false)},current:{effort:'',fast:false,model:modelValue||'',provider:providerValue||''},
presetFor:()=>({}),select:(model,provider)=>{onSelect?.({provider,model,base_url:catalogData.defaultUrl})
setMenuOpen(false)},setOptions:(_patch,row)=>{
onSelect?.({provider:row.provider,model:row.model,base_url:catalogData.defaultUrl})}}),
[modelValue,providerValue,onSelect,catalogData.defaultUrl])
const renderTierSection=(titleText,list,badgeColor)=>{if(!list.length)return null
return divs('flex flex-col gap-1 py-1',[div({cls:'px-2 font-mono btw-tx-95 font-bold uppercase tracking-wider',style:{color:badgeColor}},titleText),
...list.slice(0,8).map(item=>{
const isSelected=modelValue===item.model&&(!providerValue||providerValue===item.provider)
return divs({cls:cn(
'flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer btw-hv-ac12',
isSelected&&'btw-bg-ac16 border btw-bd-ac40'),onClick:()=>{onSelect?.({provider:item.provider,
model:item.model,base_url:item.base_url||catalogData.defaultUrl})
setMenuOpen(false)
haptic?.('tap')}},[divs(CLS.rowMin0Sm,[hBtn(cn(
'bg-transparent border-0 p-0 btw-tx-12 cursor-pointer leading-none',
item.favorite?'text-amber-400':'btw-tq btw-hv-amb'),{title:isPt?'Favoritar / Desfavoritar modelo':'Toggle favorite model',onClick:e=>{e.preventDefault()
e.stopPropagation()
toggleFavorite(item.provider,item.model)}},item.favorite?'★':'☆'),divs('flex min-w-0 flex-1 flex-col',[divs('flex items-center gap-1.5 min-w-0',[
span(CLS.titleTrunc,shortModelName(item.model)),item.alias&&
span('rounded btw-bg-ac18 px-1.5 py-px font-mono btw-tx-9 font-bold btw-ac shrink-0',item.alias),item.isComposerActive&&span('rounded bg-emerald-500/18 px-1.5 py-px font-mono btw-tx-9 font-bold text-emerald-400 shrink-0','💬 Composer')]),span('font-mono btw-tx-95 btw-tt truncate',`${item.provider} · ${item.model}`)])]),item.sessions>0&&span('shrink-0 rounded-full border btw-bd-st60 px-1.5 py-0.5 font-mono btw-tx-9 btw-ts',`${item.sessions}×`)],item.key)})])}
const liveGateway=host?.getGateway?.()??undefined
const liveConnectionId=useValue(host.state?.connectionId??$noPet)||'local'
const liveProfile=String(useValue(host.state?.focusedSessionProfile??host.state?.profile??$noPet)||'default')
const liveSessionId=String(useValue(host.state?.focusedSessionId??host.state?.activeSessionId??$noPet)||'')||null
const cleanActiveLabel=shortModelName(modelValue||catalogData.defaultMod)||'default'
const fullModelTip=modelValue?`${providerValue?`${providerValue} · `:''}${modelValue}`:(catalogData.defaultMod||'Composer default')
const modelThemeProps=useThemeProps()
return divs('btw-composer-model-hub',[jsxs(DropdownMenu,{open:menuOpen,onOpenChange:setMenuOpen,
children:[jsx(DropdownMenuTrigger,{asChild:true,children:hsBtn('btw-overview-model-pill h-[26px] rounded-[7px] px-2 btw-tx-105',{title:isPt?`Modelo ativo: ${fullModelTip} (clique para alterar)`:`Active model: ${fullModelTip} (click to switch)`},[
typeof Blobatar==='function'?span('btw-blobatar-wrap',jsx(Blobatar,{name:liveProfile,size:12,animate:'always'})):codicon('sparkle','0.68rem','btw-bac'),
span('truncate max-w-[168px] font-medium btw-str',cleanActiveLabel),
codicon('chevron-down','0.65rem','btw-mut shrink-0')])}),jsxs(DropdownMenuContent,{
align:'start','data-btw-portal':'','data-btw-theme':modelThemeProps['data-btw-theme'],style:modelThemeProps.style,className:'w-80 max-h-96 overflow-y-auto p-1.5 flex flex-col gap-1',children:[
typeof ModelCatalogMenu==='function'&&typeof ModelMenuCloseContext==='object'?jsx(ModelMenuCloseContext.Provider,{
value:()=>setMenuOpen(false),children:jsx(ModelCatalogMenu,{controller:nativeController,gateway:liveGateway,
ownerConnectionId:liveConnectionId,profile:liveProfile,request:host?.request,sessionId:liveSessionId,header:
providerValue||modelValue?div('px-1 pb-1 mb-1 border-b btw-bd-st50',hsBtn('w-full flex items-center justify-between rounded-md px-2 py-1 btw-tx-11 font-mono text-emerald-400 btw-hv-tp6 cursor-pointer',{onClick:()=>{onSelect?.({provider:'',model:'',base_url:''})
setMenuOpen(false)
haptic?.('tap')}},[span(null,isPt? `↺ Padrão do Composer (${shortModelName(catalogData.defaultMod)})`
: `↺ Inherit Composer (${shortModelName(catalogData.defaultMod)})`),codicon('discard','0.68rem')])):null})
}):hs(Fragment,null,[renderTierSection(isPt?'Modelos do Hermes Composer':'Hermes Composer Models',catalogData.ordered,
'var(--ui-accent)')])]})]})])}
function BtwSettingsPanel({scope=null,compact=false,onClose=null}){
const fallbackScope=useFocusedSessionScope()
const activeScope=scope||fallbackScope
const lang=useValue($lang)
const isPt=lang==='pt'
const strings=I18N[lang]||I18N.en
const settingsMode=useValue($settingsMode)
const spatialMode=useValue($spatialMode)
const langPref=useValue($langPref)
const theme=useValue($theme)
const accent=useValue($accent)
const density=useValue($density)
const zoom=useValue($zoom)
const askMode=useValue($askMode)
const mascotNarrate=useValue($mascotNarrate)
const intercept=useValue($interceptSlashBtw)
const showBanner=useValue($showComposerBanner)
const showChip=useValue($showStatusbarChip)
const bannerThemeMode=useValue($bannerThemeMode)
const bannerSizeMode=useValue($bannerSizeMode)
const personality=useValue($personality)
const customPersona=useValue($customPersona)
const petBubbleMode=useValue($petBubbleMode)
const synthMode=useValue($synthMode)
const recapMode=useValue($recapMode)
const petTtl=useValue($petTtl)
const stockSafePet=useValue($stockSafePet)
const alerts=useValue($alerts)
const present=useValue($present)
const backendCfg=useValue($backendSettings)
const wakeWordEnabled=useValue($wakeWordEnabled)
const wakePhraseVal=useValue($wakePhrase)
const wakeTargetMode=useValue($wakeTargetMode)
const liveVoiceEnabled=useValue($liveVoiceEnabled)
const liveVoiceActive=useValue($liveVoiceActive)
const ttsAutoSpeak=useValue($ttsAutoSpeak)
const ttsVoice=useValue($ttsVoice)
const ttsModel=useValue($ttsModel)
const nousGw=backendCfg.nous_gateway||{}
const localLessons=useValue($localLessons)
const activePresets=useValue($activePresets)
const deletedPresetIds=useValue($deletedPresetIds)
const petHere=useValue(_pet?.visible??$noPet)
const[pingResult,setPingResult]=useState(null)
const[pinging,setPinging]=useState(false)
const[activeSec,setActiveSec]=useState('all')
const[baseUrlDraft,setBaseUrlDraft]=useState(()=>String(backendCfg.fast_base_url||''))
useEffect(()=>{setBaseUrlDraft(String(backendCfg.fast_base_url||''))},[backendCfg.fast_base_url])
const themeProps=useThemeProps()
const seg=(value,options,onChange,fullWidth=false,ariaLabel='Setting option')=>jsx(BtwSegmented,{value:String(value),options,onChange,fullWidth,ariaLabel})
const setAlerts=patch=>setPref($alerts,{...$alerts.get(),...patch},'alerts')
const num=(value,onChange,step=1,unit='',min=0,max=9999)=>jsx(BtwStepper,{value,onChange,step,min,max,unit})
const runPreviewBubble=()=>{
const sample=stockSafePet?strings.previewTextsCompact?.[personality]||strings.previewTextCompact
:strings.previewTexts?.[personality]||strings.previewText
if(petHere||$petAerialFlight.get())petSay('preview',sample,'info',12000)
else host.notify?.({kind:'info',message:sample})}
const runPingEndpoint=async()=>{if(!_rest||pinging)return
const cleanUrl=String(baseUrlDraft||'').trim()
if(cleanUrl!==String(backendCfg.fast_base_url||''))syncBackendSettings({fast_base_url:cleanUrl})
setPinging(true)
setPingResult(null)
try{
const res=await _rest('/settings/ping',{method:'POST',body:{base_url:cleanUrl},timeoutMs:8000})
setPingResult(res||{ok:false,message:'No response'})
}catch(err){setPingResult({ok:false,message:String(err?.message||err)})
}finally{setPinging(false)}}
const exportLessonsJson=async()=>{
const payload=JSON.stringify($localLessons.get()||[],null,2)
await writeClipboardText(payload)
haptic?.('success')
host.notify?.({kind:'info',message:strings.lessonsExportedNotify})}
const activeThemeMeta=THEME_DESIGN_META[theme]||THEME_DESIGN_META.orbyx
const resolvedAccentHex=accent||activeThemeMeta.accentHex
const themeLiveStageNode=divs('btw-theme-live-stage',[divs('btw-theme-live-meta',[divs(CLS.rowWrap15,[span('btw-tx-12 font-bold btw-str',strings.themeNames[theme]||theme),span('btw-mascot-nameplate',activeThemeMeta.tag),span('btw-theme-card-badge',isPt?activeThemeMeta.badgePt:activeThemeMeta.badgeEn)]),div('btw-tx-105 font-mono btw-mut',isPt?activeThemeMeta.specPt:activeThemeMeta.specEn),
divs('btw-theme-dna-strip pt-0.5',[...activeThemeMeta.palette.map((hex,i)=>spans({cls:'btw-theme-dna-pill',title: `Palette stop #${i + 1}: ${hex}`},[
h('i',{cls:'btw-theme-dna-dot',style:{background:hex}}),span(null,hex.toUpperCase())],`${theme}_dna_${i}`)),spans('btw-theme-dna-pill',[
h('i',{cls:'btw-theme-dna-dot',style:{background:resolvedAccentHex}}),span(null,accent?isPt
? `Custom: ${accent.toUpperCase()}` : `Custom: ${accent.toUpperCase()}` :isPt
? `Auto (${resolvedAccentHex.toUpperCase()})` : `Auto (${resolvedAccentHex.toUpperCase()})`)])])]),divs('btw-theme-live-specimen',[span({cls:'btw-seal','data-kind':'observed'},isPt?'[D0:FATO · $0]':'[D0:FACT · $0]'),span({cls:'btw-seal','data-kind':'helped'},'Δτ +0.94'),hBtn('btw-mascot-act-btn h-[24px] px-2.5 btw-tx-10',{title:isPt?'Alternar para o próximo tema da matriz 3×3':'Cycle to the next theme in the 3×3 matrix',onClick:()=>{
const curIdx=Math.max(0,THEMES.indexOf(theme))
const nextTheme=THEMES[(curIdx + 1)% THEMES.length]
setPref($theme,nextTheme,'theme')
haptic?.('tap')}},spans(CLS.inline1,[span(null,'🎲'),isPt?'Ciclar Tema':'Cycle Theme']))])])
const themeGridNode=div({cls:'btw-theme-grid',role:'radiogroup','aria-label':strings.setTheme},THEMES.map((id,idx)=>{
const meta=THEME_DESIGN_META[id]||THEME_DESIGN_META.cryo
const isSelected=theme===id
return hsBtn('btw-theme-card',{role:'radio','aria-checked':isSelected?'true':'false',tabIndex:isSelected?0:-1,'data-active':isSelected?'true':'false','data-theme-id':id,onKeyDown:rovingKeyDown(THEMES,idx,next=>{setPref($theme,next,'theme');haptic?.('tap')}),onClick:()=>{
setPref($theme,id,'theme')
haptic?.('tap')}},[divs({cls:'btw-theme-swatch',style:{backgroundColor:id==='paper'?'#efe4cf':id==='glass'?'#0f172a':meta.surfaceHex,backgroundImage:THEME_SWATCH_GRADIENTS[id]||THEME_SWATCH_GRADIENTS.cryo}},[divs('btw-theme-swatch-top',[spans('btw-theme-swatch-dots',[
h('i',{style:{background:meta.accentHex}}),h('i',{style:{background:meta.secondaryHex}}),
h('i',{style:{background:meta.textHex,opacity:0.7}})]),span({cls:'btw-theme-swatch-tag',style:{
backgroundColor:id==='paper'?'#fbf8f1':'#090d16',color:id==='paper'?'#231f1b':'#f8fafc',
border: `1px solid ${meta.accentHex}88`}},meta.tag)]),divs('btw-theme-swatch-body',[
divs({cls:'btw-theme-swatch-mock-card',style:{background:meta.cardHex,border: `1px solid ${meta.accentHex}55`}},[span({cls:'btw-theme-swatch-mock-bar',style:{width:'32%',background:meta.accentHex}}),span({cls:'btw-theme-swatch-mock-bar',style:{width:'48%',background:meta.textHex,opacity:0.45}})]),div('btw-theme-swatch-palette',meta.palette.slice(0,3).map((hex,pIdx)=>
span({style:{background:hex}},undefined,`${id}_p_${pIdx}`)))])]),divs('flex items-center justify-between gap-1.5 w-full min-w-0',[div('btw-tx-11 font-semibold btw-str truncate',strings.themeNames[id]||id),span('btw-theme-card-badge',isSelected?(isPt?'✓ ATIVO':'✓ ACTIVE'):isPt?meta.badgePt:meta.badgeEn)]),
div('btw-tx-95 font-mono btw-mut truncate w-full',strings.themeSubtitles?.[id]||'')],id)}))
const personaGridNode=jsx(TernaryPersonaSelector,{lang})
const mascotStageNode=jsx(MascotCompanionStage,{scope:activeScope,showControls:true})
const sectionTabs=[{id:'all',label:isPt?'✦ Tudo':'✦ All'},
{id:'lens',label:isPt?'🧠 Lente & Mascote':'🧠 Lens & Mascot'},
{id:'visual',label:isPt?'🎨 Aparência & Temas':'🎨 Themes & UI'},
{id:'workflow',label:isPt?'⚡ Fluxo & Modelos':'⚡ Workflow & LLM'},
{id:'radar_rsi',label:isPt?'🛡 Radar & RSI':'🛡 Radar & RSI'},{id:'presets',label: `📋 Presets (${activePresets.length})` }]
const isAdv=settingsMode==='advanced'
const showLens=activeSec==='all'||activeSec==='lens'
const showVisual=activeSec==='all'||activeSec==='visual'
const showWorkflow=activeSec==='all'||activeSec==='workflow'
const showRadarRsi=activeSec==='radar_rsi'||(activeSec==='all'&&isAdv)
const setGrowthVal=useValue($growthMode)
const setCharBudgetVal=useValue($playbookCharBudget)
const setAllowWebVal=useValue($allowWebSearch)
const setAllowMediaVal=useValue($allowMediaTools)
const setGamifyVal=useValue($gamifyEnabled)
const showPresets=activeSec==='presets'||(activeSec==='all'&&isAdv)
return divs({...(compact||onClose?{}:themeProps),className:cn('btw-set-panel',(compact||onClose)&&'btw-set-panel--inline')},[
divs('flex flex-wrap items-start justify-between gap-3 pb-2.5 mb-0.5 border-b btw-bd-seg',[divs('flex min-w-0 flex-1 items-start gap-2.5',[onClose&&hsBtn('btw-set-back-btn shrink-0 mt-0.5',{onClick:()=>{onClose()
haptic?.('tap')},title:isPt?'Voltar para a visão ativa do Studio (Esc)':'Return to active Studio view (Esc)'},[
codicon('arrow-left'),span(null,isPt?'Voltar':'Back')]),divs('min-w-0 flex-1',[divs('flex items-center gap-1.5 text-xs font-bold btw-str',[codicon('settings-gear','0.82rem','btw-bac'),
span(null,strings.settingsPanelTitle)]),div('btw-tx-105 btw-mut leading-snug mt-0.5',isAdv?strings.settingsModeAdvancedDesc:strings.settingsModeBasicDesc)])]),jsx(BtwSegmented,{
value:isAdv?'advanced':'basic',ariaLabel:'Settings mode',options:[
{id:'basic',label:strings.settingsModeBasic},{id:'advanced',label:strings.settingsModeAdvanced}],
onChange:v=>setPref($settingsMode,v,'settingsMode')})]),div({cls:'btw-set-sec-bar',role:'tablist','aria-label':isPt?'Categorias de Configuração':'Settings Categories'},sectionTabs.map((sec,sIdx)=>hBtn('btw-set-sec-pill',{role:'tab',tabIndex:activeSec===sec.id?0:-1,'aria-selected':activeSec===sec.id?'true':'false','data-active':activeSec===sec.id?'true':'false',onClick:()=>{setActiveSec(sec.id)
haptic?.('tap')},onKeyDown:rovingKeyDown(sectionTabs.map(x=>x.id),sIdx,id=>{setActiveSec(id);haptic?.('tap')})},sec.label,sec.id))),divs({cls:'btw-set-bento-grid','data-bento':activeSec==='all'?'true':'false'},[showLens&&jsxs(SettingCard,{icon:'hubot',
title:strings.secMascotDeep,badge:strings.personaNames[personality]||personality,fullSpan:true,children:[mascotStageNode,
jsx(SettingRow,{label:strings.setPersona,desc:strings.personaHints?.[personality]||strings.setPersonaDesc,compact,stack:true,
children:personaGridNode}),personality==='custom'&&h('textarea',{cls:'btw-select w-full mt-1',rows:2,maxLength:400,placeholder:strings.setCustomPersona,value:customPersona,onChange:e=>{const v=e.target.value.slice(0,400);setPrefDebounced($customPersona,v);syncBackendSettings({personality:'custom',custom_persona:v})},onBlur:()=>flushPendingPrefs()}),jsx(SettingRow,{
label:strings.setMascotNarrate,desc:strings.setMascotNarrateDesc,compact,children:jsx(SettingSwitch,{checked:mascotNarrate,
label:strings.setMascotNarrate,onChange:v=>setPref($mascotNarrate,v,'mascotNarrate')})}),jsx(SettingRow,{
label:strings.setPetBubbleMode,desc:strings.setPetBubbleModeDesc,compact,stack:true,children:seg(petBubbleMode,
['ai_summary','metric_focus','action_steer','minimal'].map(id=>({id,label:strings.petBubbleModeNames?.[id]||id
})),v=>setPref($petBubbleMode,v,'petBubbleMode'),true)}),(isAdv||activeSec==='lens')&&hs(Fragment,null,[
jsx(SettingRow,{label:strings.setTtl,compact,children:seg(petTtl,
[6,12,20,30].map(id=>({id:String(id),label:strings.ttlNames[id]})),v=>setPref($petTtl,Number(v),'petTtl'))}),
jsx(SettingRow,{label:strings.setStockSafePet,desc:strings.setStockSafePetDesc,compact,children:jsx(SettingSwitch,{
checked:stockSafePet,label:strings.setStockSafePet,onChange:v=>setPref($stockSafePet,v,'stockSafePet')})})])]}),showVisual&&
jsxs(SettingCard,{icon:'symbol-color',title:strings.secVisualThemes,badge:strings.themeNames[theme]||theme,
fullSpan:true,children:[themeLiveStageNode,jsx(SettingRow,{label:strings.setTheme,desc:strings.setThemeDesc,compact,stack:true,
children:themeGridNode}),divs('btw-visual-deck',[divs('btw-accent-studio-tile',[divs(CLS.rowBetween,[
div('btw-set-label',strings.setAccent),spans('btw-theme-dna-pill',[
h('i',{cls:'btw-theme-dna-dot',style:{background:resolvedAccentHex}}),span(null,accent?accent.toUpperCase():isPt?'Auto (Tema)':'Auto (Theme)')])]),div('btw-set-desc',strings.setAccentDesc),jsx(BtwAccentSwatches,{swatches:PROFILE_SWATCHES,
value:accent,onChange:v=>setPref($accent,v||null,'accent'),clearLabel:strings.setAccentClear})]),divs('btw-ergonomics-studio-tile',[divs(CLS.rowBetween,[
div('btw-set-label',isPt?'Ergonomia & Superfícies do Studio':'Studio Ergonomics & Surfaces'),
span('btw-theme-dna-pill shrink-0',`${density==='compact'?'Compact':'Comfort'} · ${zoom.toUpperCase()}`)]),divs('btw-ergonomics-grid',[divs('btw-ergonomics-cell',[
span('btw-ergonomics-lbl',strings.setDensity),
seg(density,['comfortable','compact'].map(id=>({id,label:strings.densityNames[id]})),v=>setPref($density,v,'density'),true)]),divs('btw-ergonomics-cell',[
span('btw-ergonomics-lbl',strings.setZoom),
seg(zoom,['s','m','l'].map(id=>({id,label:strings.zoomNames[id]})),v=>setPref($zoom,v,'zoom'),true)]),divs('btw-ergonomics-cell',[
span({cls:'btw-ergonomics-lbl',title:strings.setBannerThemeLabel},isPt?'Estilo do Banner & Chip':'Banner & Chip Style'),seg(
bannerThemeMode,[{id:'chat',label:strings.bannerThemeChat},{id:'host',label:strings.bannerThemeHost},
{id:'studio',label:strings.bannerThemeStudio}],v=>setPref($bannerThemeMode,v,'bannerThemeMode'),true)]),divs('btw-ergonomics-cell',[
span({cls:'btw-ergonomics-lbl',title:strings.setBannerSizeLabel},isPt?'Altura do Banner':'Banner Height'),seg(
bannerSizeMode,[{id:'comfortable',label:isPt?'Conforto':'Comfort'},{id:'compact',label:isPt?'Compacta':'Compact'}],
v=>setPref($bannerSizeMode,v,'bannerSizeMode'),true)]),divs('btw-ergonomics-cell',[
span('btw-ergonomics-lbl',strings.setLang),seg(langPref,[
{id:'auto',label:strings.langAuto},{id:'en',label:'EN'},{id:'pt',label:'PT'}],v=>setPref($langPref,v,'langPref'),true)]),divs('btw-ergonomics-cell',[
span({cls:'btw-ergonomics-lbl',title:strings.spatialLayoutLabel},isPt?'Layout do Cockpit':'Cockpit Layout'),seg(
spatialMode,[{id:'auto',label:'✦ Auto'},{id:'split',label:isPt?'◫ Dividido':'◫ Split'},{id:'single',label:isPt?'▬ Único':'▬ Single'}],
v=>setPref($spatialMode,v,'spatialMode'),true)])])])])]}),showWorkflow&&jsxs(SettingCard,{icon:'zap',
title:isAdv?strings.secDesktopHooks:strings.secCoreWorkflow,badge:askMode==='fast'?'Fast ($0/Aux)':'Primary LLM',children:[
jsx(SettingRow,{label:strings.setIntercept,desc:strings.setInterceptDesc,compact,children:jsx(SettingSwitch,{checked:intercept,
label:strings.setIntercept,onChange:v=>{setPref($interceptSlashBtw,v,'interceptSlashBtw')
syncBackendSettings({intercept_slash_btw:v})}})}),jsx(SettingRow,{label:strings.setAskModeDefault,
desc:strings.setAskModeDefaultDesc,compact,children:divs('flex flex-wrap items-center gap-1.5',[
seg(askMode,[{id:'fast',label:isPt?'⚡ Fast ($0/Aux)':'⚡ Fast ($0/Aux)'},{id:'deep',label:isPt?'🧠 Modelo Sessão':'🧠 Session LLM'}],v=>setPref($askMode,v,'askMode')),
jsx(ComposerModelPicker,{providerValue:backendCfg.fast_provider||'',
modelValue:backendCfg.fast_model||'',onSelect:({provider,model,base_url})=>{
const patch={fast_provider:provider||'',fast_model:model||''}
if(base_url&&!backendCfg.fast_base_url)patch.fast_base_url=base_url
syncBackendSettings(patch)}})])}),(isAdv||activeSec==='workflow')&&hs(Fragment,null,[jsx(SettingRow,{
label:strings.setShowBanner,desc:strings.setShowBannerDesc,compact,children:jsx(SettingSwitch,{checked:showBanner,
label:strings.setShowBanner,onChange:v=>{setPref($showComposerBanner,v,'showComposerBanner')
syncBackendSettings({show_composer_banner:v})}})}),jsx(SettingRow,{label:strings.setShowStatusChip,
desc:strings.setShowStatusChipDesc,compact,children:jsx(SettingSwitch,{checked:showChip,label:strings.setShowStatusChip,
onChange:v=>{setPref($showStatusbarChip,v,'showStatusbarChip')
syncBackendSettings({show_statusbar_chip:v})}})}),jsx(SettingRow,{label:strings.setPresent,desc:strings.setPresentDesc,compact,
children:jsx(SettingSwitch,{checked:present,label:strings.setPresent,onChange:v=>setPref($present,v,'present')})}),
jsx(SettingRow,{label:strings.setMaxHistory,desc:strings.setMaxHistoryDesc,compact,
children:num(backendCfg.max_history_per_session??30,v=>
syncBackendSettings({max_history_per_session:Math.max(5,Math.min(200,v))}),5,'cards',5,200)})])]}),
showWorkflow&&jsxs(SettingCard,{
icon:'unmute',
title:isPt?'🟣 Nous Research Plus & Live Voice ("By The Way")':'🟣 Nous Research Plus & Live Voice ("By The Way")',
badge:nousGw.plan? `${nousGw.plan} · ✓` :'Tool Gateway',
children:[
divs('flex flex-wrap items-center gap-1.5 pb-1.5 mb-1 border-b btw-bd-seg50 btw-tx-10 font-mono',[
span({cls:cn('rounded px-1.5 py-0.5 font-semibold',nousGw.logged_in?'bg-[#10b981]/18 btw-em':'btw-bg-seg btw-mut')},nousGw.logged_in? `✓ ${nousGw.plan||'Hermes Plus'}` :'○ Nous Portal'),
...Object.entries(nousGw.gateways||{}).map(([gwKey,gwOk])=>
span({cls:cn('rounded border px-1.5 py-0.5',gwOk?'border-[#10b981]/40 btw-em':'btw-bd-seg btw-mut')},`${gwOk?'●':'○'} ${gwKey}`,gwKey))
]),
jsx(SettingRow,{
label:isPt?'👂 Wake-Word Hands-Free ("By The Way")':'👂 Hands-Free Wake-Word ("By The Way")',
desc:isPt
?'Escuta contínua on-device (Sherpa-ONNX KWS 16kHz + Whisper). Diga "By the way" para acionar Ditado ou Live Talk.'
:'Continuous on-device listener (Sherpa-ONNX KWS 16kHz + Whisper). Say "By the way" to trigger Dictate or Live Talk.',
compact,
children:jsx(SettingSwitch,{
checked:Boolean(wakeWordEnabled),label:'Wake Word',onChange:v=>toggleBtwWakeWord(v)})}),
jsx(SettingRow,{label:isPt?'Modo ao Detectar Wake-Word':'Wake-Word Action Mode',
desc:isPt?'Escolha se "By the way" abre Ditado (STT) ou Live Talk conversacional contínuo.':'Choose whether "By the way" starts Dictate (STT) or continuous Live Talk.',
compact,children:seg(wakeTargetMode==='dictate'?'dictate':'live',[{id:'dictate',label:isPt?'🎙 Ditado (STT)':'🎙 Dictate (STT)'},{id:'live',label:'🟢 Live Talk'}],v=>setBtwWakeTargetMode(v))}),
jsx(SettingRow,{label:isPt?'Frase de Ativação (Wake Phrase)':'Wake Trigger Phrase',compact,
children:h('input',{type:'text',cls:'btw-preset-input font-mono btw-tx-11 h-[26px] w-40',value:wakePhraseVal||'by the way',placeholder:'by the way',onChange:e=>{const v=e.target.value.slice(0,48);setPrefDebounced($wakePhrase,v);syncBackendSettings({wake_phrase:v})},onBlur:()=>flushPendingPrefs()})}),
jsx(SettingRow,{label:'🟢 BTW Live Talk (Full-Duplex VAD + TTS)',
desc:isPt?'Conversa contínua após lançar o /btw (diga "by the way" de novo p/ novo banner ou "parar" p/ sair).':'Continuous voice conversation after launching /btw (say "by the way" again for a new banner or "stop" to end).',
compact,children:divs('flex items-center gap-2',[
jsx(SettingSwitch,{checked:Boolean(liveVoiceEnabled),label:'Live',onChange:v=>{setPref($liveVoiceEnabled,v,'liveVoiceEnabled');syncBackendSettings({live_voice_enabled:v});if(!v&&liveVoiceActive)stopBtwLiveVoice(true)}}),
hBtn('btw-mascot-act-btn h-[26px] px-2.5',{'data-active':liveVoiceActive?'true':'false',onClick:()=>toggleBtwLiveVoice()},liveVoiceActive?(isPt?'⏹ Encerrar':'⏹ Stop'):(isPt?'🟢 Iniciar':'🟢 Start'))])}),
jsx(SettingRow,{label:isPt?'🔊 Auto-Falar Respostas (TTS)':'🔊 Auto-Speak Replies (TTS)',
desc:isPt?'Lê em voz alta respostas de perguntas ditadas.':'Automatically speaks answers to dictated questions.',
compact,children:jsx(SettingSwitch,{checked:Boolean(ttsAutoSpeak),label:'Auto TTS',onChange:v=>{setPref($ttsAutoSpeak,v,'ttsAutoSpeak');syncBackendSettings({tts_auto_speak:v})}})}),
jsx(SettingRow,{label:isPt?'Voz & Modelo OpenAI TTS':'OpenAI TTS Voice & Model',compact,
children:divs(CLS.row15,[
h('select',{cls:'btw-select btw-tx-11 h-[26px] px-2',value:ttsVoice||'coral',onChange:e=>{const v=e.target.value;setPref($ttsVoice,v,'ttsVoice');syncBackendSettings({tts_voice:v})}},['coral','nova','alloy','onyx','sage','ash','ballad','echo','fable','shimmer','verse'].map(v=>h('option',{value:v},v,v))),
h('select',{cls:'btw-select btw-tx-11 h-[26px] px-2',value:ttsModel||'gpt-4o-mini-tts',onChange:e=>{const m=e.target.value
setPref($ttsModel,m,'ttsModel')
syncBackendSettings({tts_model:m})
}},['gpt-4o-mini-tts','tts-1','tts-1-hd'].map(m=>
h('option',{value:m},m,m)))
])
})
]
}),showWorkflow&&
(isAdv||activeSec==='workflow')&&jsxs(SettingCard,{icon:'server-process',title:strings.secFastObserver,
badge:synthMode==='llm'?'Aux LLM':'Fast $0',children:[jsx(SettingRow,{label:strings.setSynth,compact,stack:true,children:seg(
synthMode,['facts','llm'].map(id=>({id,label:strings.synthNames[id]||id})),v=>setPref($synthMode,v,'synthMode'),true)}),
jsx(SettingRow,{label:strings.setFastModel,compact,stack:true,children:jsx(ComposerModelPicker,{
providerValue:backendCfg.fast_provider||'',modelValue:backendCfg.fast_model||'',onSelect:({provider,model,base_url})=>{
const patch={fast_provider:provider||'',fast_model:model||''}
if(base_url&&!backendCfg.fast_base_url)patch.fast_base_url=base_url
syncBackendSettings(patch)}})}),jsx(SettingRow,{label:strings.setFastBaseUrl,compact,stack:true,children:divs('flex w-full flex-col gap-1.5',[divs('flex w-full items-center gap-1.5 min-w-0',[h('input',{type:'text',cls:'btw-preset-input min-w-0 flex-1 font-mono btw-tx-11 h-[28px]',placeholder:strings.setFastBaseUrlPlaceholder,value:baseUrlDraft,onChange:e=>setBaseUrlDraft(e.target.value),onBlur:()=>syncBackendSettings({fast_base_url:String(baseUrlDraft||'').trim()}),onKeyDown:e=>{if(e.key==='Enter'){e.preventDefault();syncBackendSettings({fast_base_url:String(baseUrlDraft||'').trim()})}}}),hBtn('btw-mascot-act-btn h-[28px] px-2.5 shrink-0',{disabled:pinging,onClick:()=>void runPingEndpoint()},pinging?strings.pingTestingLabel:(isPt?'⚡ Ping':'⚡ Ping'))]),pingResult&&div({cls:cn(
'font-mono btw-tx-105 px-2 py-1 rounded border',pingResult.ok?'btw-bd-ok45 btw-bg-ok10 btw-str'
:pingResult.status==='validated_offline'?'btw-bd-wn45 btw-bg-wn10 btw-str'
:'border-destructive/45 bg-destructive/10 text-destructive')},pingResult.message)])})]}),showRadarRsi&&
jsxs(SettingCard,{icon:'shield',title:strings.secSafetyRadar,badge:'Read-Only $0',children:[jsx(SettingRow,{
label:strings.setPsiVerify,desc:strings.setPsiVerifyDesc,compact,children:jsx(SettingSwitch,{
checked:backendCfg.verify_touched_files!==false,label:strings.setPsiVerify,
onChange:v=>syncBackendSettings({verify_touched_files:v})})}),jsx(SettingRow,{label:strings.setScanSiblings,
desc:strings.setScanSiblingsDesc,compact,children:jsx(SettingSwitch,{checked:Boolean(backendCfg.scan_sibling_profiles),
label:strings.setScanSiblings,onChange:v=>syncBackendSettings({scan_sibling_profiles:v})})}),jsx(SettingRow,{
label:strings.setErrorStreak,compact,children:num(alerts.errorStreak,v=>setAlerts({errorStreak:Math.max(1,v)}),1,'errs',1,20)}),
jsx(SettingRow,{label:strings.setCostLimit,compact,children:num(alerts.costUsd,v=>setAlerts({costUsd:v}),0.05,'USD',0,500)}),
jsx(SettingRow,{label:strings.setTokenLimit,compact,children:num(alerts.tokensK,v=>setAlerts({tokensK:v}),10,'k tok',0,2000)})]}),
showRadarRsi&&jsxs(SettingCard,{icon:'beaker',title:strings.secRsiEngine,badge: `${localLessons.length} ${isPt?'lições':'lessons'}`,children:[
jsx(SettingRow,{label:strings.setRsiLearning,desc:strings.setRsiLearningDesc,compact,children:jsx(SettingSwitch,{
checked:backendCfg.rsi_learning!==false,label:strings.setRsiLearning,onChange:v=>syncBackendSettings({rsi_learning:v})})}),
jsx(SettingRow,{label:isPt?'Escopo de Integração do Playbook':'Playbook Integration Scope',desc:isPt
?'Escolha se o BTW Studio opera isolado, em modo Lite (domínio + skills sob demanda) ou Full (co-evolução total com o Hermes Agent).'
:'Choose whether BTW Studio runs Isolated, Lite (domain playbook + on-demand skills), or Full (co-evolution with Hermes Agent).',
compact,stack:true,children:seg(backendCfg.growth_mode||setGrowthVal||'lite',[
{id:'isolated',label:isPt?'🛡 Isolado':'🛡 Isolated'},{id:'lite',label:'⚡ Lite'},{id:'full',label:'🧠 Full'}],v=>{
setPref($growthMode,v,'growthMode')
syncBackendSettings({growth_mode:v})},true)}),jsx(SettingRow,{
label:isPt?'Limite de Caracteres do BTW.md (1K em 1K)':'BTW.md Max Character Budget (1K steps)',desc:isPt
?'Deslize de 1K a 16K caracteres para calibrar o teto do playbook BTW.md.'
:'Slide from 1K to 16K characters to calibrate the BTW.md playbook ceiling.',compact,stack:true,children:(()=>{
const curB=Number(backendCfg.btw_md_max_chars||setCharBudgetVal||4000)
const sv=getPlaybookSliderVisuals(curB,isPt)
return divs({cls:'btw-luminous-slider-wrap w-full mt-0.5',style:{'--slider-color':sv.color,'--slider-intensity':sv.intensity,
'--slider-brightness':sv.brightness}},[divs({cls:'flex items-center justify-between btw-tx-105 font-mono',style:{color:'color-mix(in srgb, var(--slider-color) 55%, var(--btw-text-strong))'}},[spans('inline-flex items-center gap-1 font-bold',[codicon(sv.icon,'0.72rem'), `${sv.k}K (${curB.toLocaleString()} chars)`]),
span('font-semibold',sv.tierLabel)]),div('px-1',h('input',{type:'range','aria-label':isPt?'Limite de caracteres do BTW.md':'BTW.md character budget',min:1000,max:16000,step:1000,value:Math.max(1000,Math.min(16000,curB)),cls:'btw-luminous-slider',onChange:e=>{
 const n=Math.max(1000,Math.min(16000,Math.round((Number(e.target.value)||4000)/ 1000)* 1000))
 setPrefDebounced($playbookCharBudget,n)
 syncBackendSettings({btw_md_max_chars:n})
},onPointerUp:()=>flushPendingPrefs(),onBlur:()=>flushPendingPrefs()})),div('btw-luminous-slider-ticks',[1,4,8,12,16].map(tk=>
hBtn(cn('btw-luminous-tick',sv.k===tk&&'font-bold btw-bac'),{onClick:()=>{
const n=tk * 1000
setPref($playbookCharBudget,n,'playbookCharBudget')
syncBackendSettings({btw_md_max_chars:n})
haptic?.('tap')}},`${tk}K`,`tick-${tk}`)))])
})()}),jsx(SettingRow,{label:isPt?'Permitir Web Search no /btw':'Allow Web Search in /btw',desc:isPt
?'Quando desativado, o /btw e subagentes limitam-se estritamente ao contexto local da sessão.'
:'When off, /btw and subagents are strictly confined to the available local session context.',compact,children:jsx(SettingSwitch,{
checked:Boolean(backendCfg.allow_web_search??setAllowWebVal),
label:isPt?'Permitir Web Search no /btw':'Allow Web Search in /btw',onChange:v=>{setPref($allowWebSearch,v,'allowWebSearch')
syncBackendSettings({allow_web_search:v})}})}),jsx(SettingRow,{label:isPt?'Permitir Mídia Gerada no /btw (Imagem/Vídeo/TTS)':'Allow Generated Media Tools in /btw (Image/Video/TTS)',desc:isPt
?'Opcional (desativado por padrão): autoriza o /btw a acionar image_generate, video_generate e text_to_speech.'
:'Opt-in (off by default): allows /btw to invoke image_generate, video_generate, and text_to_speech.',compact,children:jsx(SettingSwitch,{
checked:Boolean(backendCfg.allow_media_tools??setAllowMediaVal),
label:isPt?'Permitir Mídia Gerada no /btw':'Allow Generated Media Tools in /btw',onChange:v=>{
 setPref($allowMediaTools,v,'allowMediaTools')
 syncBackendSettings({allow_media_tools:v})
}})}),jsx(SettingRow,{
label:isPt?'🏆 Marcos do Playbook':'🏆 Playbook Milestones',desc:isPt
?'Opcional (desativado por padrão): exibe conquistas e insígnias para evolução do BTW.md, frequência de /btw, cards, steers Δτ, imagens e vídeos.'
:'Opt-in (off by default): displays playbook milestones for BTW.md evolution, /btw frequency, cards, Δτ steers, images, and videos.',
compact,children:jsx(SettingSwitch,{checked:Boolean(backendCfg.gamify_enabled??setGamifyVal),
label:isPt?'🏆 Marcos do Playbook':'🏆 Playbook Milestones',onChange:v=>{
setPref($gamifyEnabled,v,'gamifyEnabled')
syncBackendSettings({gamify_enabled:v})}})}),jsx(SettingRow,{label:strings.setRecap,compact,children:seg(recapMode,
['off','facts','llm'].map(id=>({id,label:strings.recapNames[id]})),v=>setPref($recapMode,v,'recapMode'))}),divs('flex flex-wrap items-center justify-between gap-2 pt-2 mt-1 border-t btw-bd-seg50',[hBtn('btw-mascot-act-btn h-[26px] px-2.5',{onClick:()=>void exportLessonsJson()},spans(CLS.inline15,[codicon('export','0.7rem'),strings.exportLessonsBtn])),hBtn('btw-mascot-act-btn h-[26px] px-2.5 btw-bac',{onClick:()=>{
if($inlineSettingsOpen.get())$inlineSettingsOpen.set(false)
onClose?.()
$activeTab.set('learn')
haptic?.('tap')}},`${strings.tabLearn} →`)])]}),showPresets&&jsxs(SettingCard,{icon:'checklist',
title:strings.secPresets,badge: `${activePresets.length}`,headerActions:divs(CLS.row15,[
deletedPresetIds.length>0&&hBtn('btw-mascot-act-btn h-[23px] px-2 btw-tx-10',{onClick:()=>restoreDefaultPresets(),title:strings.restorePresetsTip},strings.restorePresetsBtn(deletedPresetIds.length)),
hBtn('btw-mascot-act-btn h-[23px] px-2.5 btw-tx-10',{'data-active':'true',onClick:()=>openPresetCreatorFromQuestion('','settings')},spans(CLS.inline1,[codicon('add','0.7rem'),strings.addPresetBtn]))]),fullSpan:true,
children:[jsx(PresetsSettingsSection,{compact})]})]),
activeSec==='all'&&hBtn(cn('btw-mascot-act-btn w-full justify-center h-[30px] mt-1',
!isAdv&&'btw-bac btw-bd-ba55'),{onClick:()=>{
setPref($settingsMode,isAdv?'basic':'advanced','settingsMode')
haptic?.('tap')}},isAdv?strings.switchToBasicBtn:strings.switchToAdvancedBtn)])}
export default{id:ID,name:'BTW Studio',description:
'Side messages for a running session: /btw without transcript clutter, rich Markdown answers, mid-turn steer and a zero-token Session Radar.',
register(ctx){_disposing=false
_rest=ctx.rest
_storage=ctx.storage
_ctx=ctx
_pet=ctx.pet||null
let disposeStyle=typeof ctx.injectStyle==='function'?ctx.injectStyle(CSS):null
if(!disposeStyle){const styleEl=document.createElement('style');styleEl.textContent=CSS;document.head.append(styleEl);disposeStyle=()=>styleEl.remove()}
if(typeof disposeStyle==='function')ctx.onDispose(disposeStyle)
try{
const bundle=lang=>Object.fromEntries(
Object.entries(I18N[lang]).filter(([,v])=>typeof v==='string'||typeof v==='function'))
ctx.i18n?.register?.({en:{...bundle('en'),__lang:'en'},pt:{...bundle('pt'),__lang:'pt'},
'pt-br':{...bundle('pt'),__lang:'pt'},'pt-pt':{...bundle('pt'),__lang:'pt'}})
const syncLocale=()=>$appLang.set(ctx.i18n?.t?.('__lang')==='pt'?'pt':'en')
syncLocale()
const offLocale=ctx.i18n?.onLocaleChange?.(syncLocale);if(typeof offLocale==='function')ctx.onDispose(offLocale)
}catch{}
try{
const savedV2=ctx.storage.get(STORAGE_KEY,null)
const savedV1=ctx.storage.get(LEGACY_STORAGE_KEY,null)
const rawInit=savedV2&&typeof savedV2==='object'&&!Array.isArray(savedV2)?savedV2:savedV1&&typeof savedV1==='object'&&!Array.isArray(savedV1)?savedV1:{}
const initial={}
for(const[kSid,rawArr]of Object.entries(rawInit)){
 if(Array.isArray(rawArr))initial[kSid]=rawArr.map(normalizeEntryObject).filter(Boolean)
}
$entriesBySession.set(initial)
const prefs=ctx.storage.get(PREFS_KEY,null)
if(prefs&&typeof prefs==='object'){if(typeof prefs.interceptSlashBtw==='boolean'){
$interceptSlashBtw.set(prefs.interceptSlashBtw)}
if(prefs.askMode==='fast'||prefs.askMode==='deep'){$askMode.set(prefs.askMode)}
if(['auto','en','pt'].includes(prefs.langPref))$langPref.set(prefs.langPref)
else if(prefs.lang==='pt')$langPref.set('pt')
const theme=LEGACY_THEME_ALIASES[prefs.theme]||prefs.theme
if(THEMES.includes(theme))$theme.set(theme)
if(typeof prefs.accent==='string'||prefs.accent===null)$accent.set(prefs.accent||null)
if(prefs.density==='compact'||prefs.density==='comfortable')$density.set(prefs.density)
if(prefs.zoom in ZOOM_STEPS)$zoom.set(prefs.zoom)
if(typeof prefs.pinned==='boolean')$pinned.set(prefs.pinned)
if(typeof prefs.popoverWide==='boolean')$popoverWide.set(prefs.popoverWide)
if(typeof prefs.maxDeepOverviewReports==='number'&&prefs.maxDeepOverviewReports>=1)$maxDeepOverviewReports.set(Math.min(20,Math.round(prefs.maxDeepOverviewReports)))
if(typeof prefs.loaderCurveIdx==='number'&&prefs.loaderCurveIdx>=0)$loaderCurveIdx.set(Math.floor(prefs.loaderCurveIdx)% NATIVE_LOADER_CURVES.length)
if(typeof prefs.mascotNarrate==='boolean')$mascotNarrate.set(prefs.mascotNarrate)
const mappedPersona=LEGACY_PERSONA_ALIASES[prefs.personality]||prefs.personality
if(PERSONAS.includes(mappedPersona))$personality.set(mappedPersona)
if(typeof prefs.customPersona==='string')$customPersona.set(prefs.customPersona.slice(0,400))
if(['facts','fast','llm'].includes(prefs.synthMode))$synthMode.set(prefs.synthMode==='fast'?'facts':prefs.synthMode)
if(['off','facts','llm'].includes(prefs.recapMode))$recapMode.set(prefs.recapMode)
const ttl=Number(prefs.petTtl??prefs.bubble?.ttl)
if([6,12,20,30].includes(ttl))$petTtl.set(ttl)
else if(ttl===0)$petTtl.set(30)
if(typeof prefs.stockSafePet==='boolean')$stockSafePet.set(prefs.stockSafePet)
if(['ai_summary','metric_focus','action_steer','minimal'].includes(prefs.petBubbleMode)){$petBubbleMode.set(prefs.petBubbleMode)}
if(prefs.settingsMode==='basic'||prefs.settingsMode==='advanced'){$settingsMode.set(prefs.settingsMode)}
if(['auto','split','single'].includes(prefs.spatialMode)){$spatialMode.set(prefs.spatialMode)}
if(typeof prefs.showComposerBanner==='boolean'){$showComposerBanner.set(prefs.showComposerBanner)}
if(typeof prefs.showStatusbarChip==='boolean'){$showStatusbarChip.set(prefs.showStatusbarChip)}
if(typeof prefs.autoRecommendSnippets==='boolean'){$autoRecommendSnippets.set(prefs.autoRecommendSnippets)}
if(prefs.bannerThemeMode&&['host','chat','studio'].includes(prefs.bannerThemeMode)){$bannerThemeMode.set(prefs.bannerThemeMode)}
if(prefs.bannerSizeMode&&['compact','comfortable'].includes(prefs.bannerSizeMode)){$bannerSizeMode.set(prefs.bannerSizeMode)}
if(prefs.personaWeights&&typeof prefs.personaWeights==='object'&&!Array.isArray(prefs.personaWeights)){
const wVis=Number(prefs.personaWeights.visual),wEf=Number(prefs.personaWeights.eficiente),wPr=Number(prefs.personaWeights.profundo)
const pw=projectOntoSimplex(Number.isFinite(wVis)?wVis:0.34,Number.isFinite(wEf)?wEf:0.33,Number.isFinite(wPr)?wPr:0.33)
$personaWeights.set(pw)}
if(prefs.personaAxes&&typeof prefs.personaAxes==='object'&&!Array.isArray(prefs.personaAxes)){
const curA=$personaAxes.get()
const nextA={...curA}
for(const k of Object.keys(curA)){if(prefs.personaAxes[k]!=null){
const numVal=Number(prefs.personaAxes[k])
nextA[k]=Math.max(0.05,Math.min(1,Number.isFinite(numVal)?numVal:curA[k]))}}
$personaAxes.set(nextA)}
if(prefs.personaGeometry&&['pentagon','pentagram','hexagon','ternary'].includes(prefs.personaGeometry)){
$personaGeometry.set(prefs.personaGeometry==='pentagram'?'pentagon':prefs.personaGeometry)}
if(prefs.petAffection&&typeof prefs.petAffection==='object'&&!Array.isArray(prefs.petAffection)){
$petAffection.set({...$petAffection.get(),...prefs.petAffection})}
if(typeof prefs.petAerialFlight==='boolean'){$petAerialFlight.set(prefs.petAerialFlight)}
if(typeof prefs.nativePetActive==='boolean'){$nativePetActive.set(prefs.nativePetActive)}
if(prefs.steeredByCardId&&typeof prefs.steeredByCardId==='object'&&!Array.isArray(prefs.steeredByCardId)){$steeredByCardId.set(prefs.steeredByCardId)}
if(Array.isArray(prefs.favoriteModels)){
$favoriteModelsList.set(prefs.favoriteModels.map(x=>String(x||'').trim()).filter(Boolean))}
if(prefs.alerts&&typeof prefs.alerts==='object'&&!Array.isArray(prefs.alerts)){
const rawAl=prefs.alerts,cleanAl={...ALERT_DEFAULTS}
if(Number.isFinite(Number(rawAl.errorStreak)))cleanAl.errorStreak=Math.max(1,Math.min(20,Math.round(Number(rawAl.errorStreak))))
if(Number.isFinite(Number(rawAl.costUsd)))cleanAl.costUsd=Math.max(0,Math.min(500,Number(rawAl.costUsd)))
if(Number.isFinite(Number(rawAl.tokensK)))cleanAl.tokensK=Math.max(0,Math.min(2000,Number(rawAl.tokensK)))
$alerts.set(cleanAl)}
if(typeof prefs.present==='boolean')$present.set(prefs.present)
if(typeof prefs.hudOpen==='boolean'&&prefs.hudOpen){
const sched=typeof ctx.setTimeout==='function'?ctx.setTimeout:setTimeout
sched(()=>setHudOpen(true,false),120)}
if(prefs.exportFolder&&typeof prefs.exportFolder.id==='string')$exportFolder.set(prefs.exportFolder)
if(Array.isArray(prefs.customPresets)){$customPresets.set(prefs.customPresets.map(sanitizeCustomPreset).filter(Boolean).slice(-24))}
if(Array.isArray(prefs.deletedPresetIds)){
$deletedPresetIds.set(prefs.deletedPresetIds.map(x=>String(x||'').trim()).filter(Boolean))}
if(prefs.growthMode&&['isolated','lite','full'].includes(prefs.growthMode)){$growthMode.set(prefs.growthMode)}
if(prefs.playbookCharBudget&&Number(prefs.playbookCharBudget)>=800){$playbookCharBudget.set(Number(prefs.playbookCharBudget))}
if(prefs.autoLearnMode&&['off','lite','medium','full'].includes(prefs.autoLearnMode)){$autoLearnMode.set(prefs.autoLearnMode)}
if(typeof prefs.autoLearnHook==='boolean'){$autoLearnHook.set(prefs.autoLearnHook)}
if(typeof prefs.autoLearnCronMins==='number'&&prefs.autoLearnCronMins>=0){$autoLearnCronMins.set(prefs.autoLearnCronMins)}
if(prefs.memorySyncMode&&['off','auto','5','10','15','20','25'].includes(String(prefs.memorySyncMode))){
$memorySyncMode.set(String(prefs.memorySyncMode))}
if(typeof prefs.allowWebSearch==='boolean')$allowWebSearch.set(prefs.allowWebSearch)
if(typeof prefs.allowMediaTools==='boolean')$allowMediaTools.set(prefs.allowMediaTools)
if(typeof prefs.gamifyEnabled==='boolean'){$gamifyEnabled.set(prefs.gamifyEnabled)}
if(typeof prefs.wakeWordEnabled==='boolean'){$wakeWordEnabled.set(prefs.wakeWordEnabled)}
if(typeof prefs.wakePhrase==='string'&&prefs.wakePhrase.trim()){$wakePhrase.set(prefs.wakePhrase.trim())}
if(prefs.wakeTargetMode&&['live','dictate'].includes(prefs.wakeTargetMode)){$wakeTargetMode.set(prefs.wakeTargetMode)}
if(typeof prefs.liveVoiceEnabled==='boolean'){$liveVoiceEnabled.set(prefs.liveVoiceEnabled)}
if(typeof prefs.ttsAutoSpeak==='boolean'){$ttsAutoSpeak.set(prefs.ttsAutoSpeak)}
if(typeof prefs.ttsVoice==='string'&&prefs.ttsVoice.trim()){$ttsVoice.set(prefs.ttsVoice.trim())}
if(typeof prefs.ttsModel==='string'&&prefs.ttsModel.trim()){$ttsModel.set(prefs.ttsModel.trim())}
if(Array.isArray(prefs.pinnedTools)){$pinnedBtwTools.set(prefs.pinnedTools.map(x=>String(x||'').trim()).filter(Boolean))}
if(prefs.dictationLang){$dictationLang.set(String(prefs.dictationLang))}}
const savedRsi=ctx.storage.get(RSI_STORAGE_KEY,null)
if(savedRsi&&typeof savedRsi==='object'){if(Array.isArray(savedRsi.probes))$localProbes.set(savedRsi.probes.slice(-60))
if(Array.isArray(savedRsi.lessons))$localLessons.set(savedRsi.lessons.slice(-120))
if(savedRsi.presetStats&&typeof savedRsi.presetStats==='object')$localPresetStats.set(savedRsi.presetStats)}
}catch{}
if(_rest){void _rest('/settings',{timeoutMs:8000}).then(res=>{if(res?.ok&&res.config){
$backendSettings.set({...$backendSettings.get(),...res.config})
const localSavedPrefs=ctx.storage.get(PREFS_KEY,null)
if(!localSavedPrefs?.growthMode&&res.config.growth_mode&&['isolated','lite','full'].includes(res.config.growth_mode)){$growthMode.set(res.config.growth_mode)}
if(!localSavedPrefs?.playbookCharBudget&&res.config.btw_md_max_chars&&Number(res.config.btw_md_max_chars)>=800){
$playbookCharBudget.set(Number(res.config.btw_md_max_chars))}
if(!localSavedPrefs?.autoLearnMode&&res.config.auto_learn_mode&&['off','lite','medium','full'].includes(String(res.config.auto_learn_mode))){
$autoLearnMode.set(String(res.config.auto_learn_mode))}
if(typeof localSavedPrefs?.autoLearnHook!=='boolean'&&typeof res.config.auto_learn_hook==='boolean'){$autoLearnHook.set(res.config.auto_learn_hook)}
if(typeof localSavedPrefs?.autoLearnCronMins!=='number'&&typeof res.config.auto_learn_cron_minutes==='number'){$autoLearnCronMins.set(res.config.auto_learn_cron_minutes)}
if(!localSavedPrefs?.memorySyncMode&&res.config.memory_md_sync_mode&&['off','auto','5','10','15','20','25'].includes(String(res.config.memory_md_sync_mode))){
$memorySyncMode.set(String(res.config.memory_md_sync_mode))}
if(typeof localSavedPrefs?.gamifyEnabled!=='boolean'&&typeof res.config.gamify_enabled==='boolean'){$gamifyEnabled.set(res.config.gamify_enabled)}
if(typeof localSavedPrefs?.allowWebSearch!=='boolean'&&typeof res.config.allow_web_search==='boolean')$allowWebSearch.set(res.config.allow_web_search)
if(typeof localSavedPrefs?.allowMediaTools!=='boolean'&&typeof res.config.allow_media_tools==='boolean')$allowMediaTools.set(res.config.allow_media_tools)
if(typeof localSavedPrefs?.wakeWordEnabled!=='boolean'&&typeof res.config.wake_word_enabled==='boolean'){$wakeWordEnabled.set(res.config.wake_word_enabled)}
if(!localSavedPrefs?.wakePhrase&&typeof res.config.wake_phrase==='string'&&res.config.wake_phrase.trim()){$wakePhrase.set(res.config.wake_phrase.trim())}
if(!localSavedPrefs?.wakeTargetMode&&res.config.wake_target_mode&&['live','dictate'].includes(res.config.wake_target_mode)){$wakeTargetMode.set(res.config.wake_target_mode)}
if(typeof localSavedPrefs?.liveVoiceEnabled!=='boolean'&&typeof res.config.live_voice_enabled==='boolean'){$liveVoiceEnabled.set(res.config.live_voice_enabled)}
if(typeof res.config.tts_auto_speak==='boolean'&&typeof localSavedPrefs?.ttsAutoSpeak!=='boolean'){$ttsAutoSpeak.set(res.config.tts_auto_speak)}
if(typeof res.config.tts_voice==='string'&&res.config.tts_voice.trim()&&!localSavedPrefs?.ttsVoice){$ttsVoice.set(res.config.tts_voice.trim())}
if(typeof res.config.tts_model==='string'&&res.config.tts_model.trim()&&!localSavedPrefs?.ttsModel){$ttsModel.set(res.config.tts_model.trim())}
if($wakeWordEnabled.get()){
syncBackendSettings({wake_word_enabled:true,wake_target_mode:$wakeTargetMode.get()})
void startBtwWakeListener()}
if(Array.isArray(res.config.favorite_models)&&res.config.favorite_models.length>0&&($favoriteModelsList.get()||[]).length===0){
$favoriteModelsList.set(res.config.favorite_models)}}}).catch(()=>undefined)
void _rest('/presets',{timeoutMs:8000}).then(res=>{if(!res?.ok)return
const localCustom=$customPresets.get()||[]
const localDeleted=$deletedPresetIds.get()||[]
const remoteCustom=Array.isArray(res.custom_presets)?res.custom_presets.map(sanitizeCustomPreset).filter(Boolean):[]
const remoteDeleted=Array.isArray(res.deleted_preset_ids)?res.deleted_preset_ids.map(x=>String(x||'').trim()).filter(Boolean)
:[]
if(localCustom.length===0&&localDeleted.length===0&&(remoteCustom.length>0||remoteDeleted.length>0)){
$customPresets.set(remoteCustom.slice(-24))
$deletedPresetIds.set(remoteDeleted)
savePrefs({customPresets:remoteCustom.slice(-24),deletedPresetIds:remoteDeleted})
}else if(localCustom.length>0||localDeleted.length>0){syncPresetsToBackend()}}).catch(()=>undefined)}
ctx.onEvent('btw.complete',event=>{
const payload=event?.payload||{}
const text=String(payload.text||'').trim()
if(!text)return
const sid=String(event?.session_id||payload.session_id||resolveFocusedIds().runtimeId||'')
const key=canonicalSessionKey(sid)
const pend=$pendingBySession.get()[key]
const durationMs=pend?.startedAt?Date.now()- pend.startedAt:null
const wasLive=Boolean(pend?.liveVoice||$liveVoiceActive.get())
const wantTts=Boolean(pend?.ttsReply||wasLive||(pend?.voiceDictated&&$ttsAutoSpeak.get()))
const entry=upsertEntry(key,{id:String(payload.task_id||pend?.taskId|| `btw_${Date.now()}`),
question:String(payload.question||pend?.question||'Side question'),answer:text,source:'prompt.btw',duration_ms:durationMs,
voice_dictated:Boolean(pend?.voiceDictated),live_voice:wasLive},
true)
if(entry&&wantTts){
if(wasLive&&entry.answer){
_liveConvHistory=[..._liveConvHistory,{role:'assistant',content:String(entry.answer).slice(0,900)}].slice(-12)
$liveVoiceReply.set(stripInlineMarkdownPreview(entry.answer,160))}
void speakBtwCardOrText(entry,resolveFocusedIds(),()=>{
if($liveVoiceActive.get())resumeLiveListeningAfterTurn(240)})}
if(entry&&_rest&&sid){void _rest('/record',{method:'POST',body:{session_id:sid,task_id:entry.id,question:entry.question,
answer:entry.answer,source:'prompt.btw',duration_ms:durationMs}
}).catch(()=>undefined)}})
const _lastToolNarrateBySession={}
ctx.onEvent(EVENT_PULSE,event=>{
 const payload=event?.payload||{}
 if(payload.conversation_id)trackConversationRoot(payload.session_id,payload.conversation_id,payload.old_session_id||'')
 const key=canonicalSessionKey(payload.conversation_id||payload.session_id)
if(!key)return
const prev=$livePulseBySession.get()[key]
$livePulseBySession.set({...$livePulseBySession.get(),[key]:payload})
const streak=Number(payload.consecutive_errors||0)
const limit=Math.max(1,Number($alerts.get().errorStreak||3))
if(streak>=limit&&Number(prev?.consecutive_errors||0)<limit){
const loopMsg=t().petLoop(streak)
petSay('loop',loopMsg,'error',12000,{kind:'error_streak',steer:t().steerLoopStreak})
addPetBubble(payload.session_id,{type:'alert',
title:t().petLoopAlertTitle?t().petLoopAlertTitle(streak): `Loop Alert (${streak})`,summary:loopMsg,ai_inferred:false,
personality:$personality.get(),tone:'error',kind:'error_streak',steer:t().steerLoopStreak})
}else if(streak===0&&$alertSteer.get()?.kind==='error_streak'){$alertSteer.set(null)
}else if(payload.active_tool&&payload.active_tool!==prev?.active_tool&&
Date.now()-(_lastToolNarrateBySession[key]||0)>4500
){_lastToolNarrateBySession[key]=Date.now()
const pt=$lang.get()==='pt'
const toolLine=decorateClientPersona(pt
? `Executando ${payload.active_tool}${payload.active_tool_args_preview? ` (${formatCompactToolArgPreview(payload.active_tool,payload.active_tool_args_preview,34)})` :''} · ${pl(payload.turn_tools||1,'tool')}`
: `Running ${payload.active_tool}${payload.active_tool_args_preview? ` (${formatCompactToolArgPreview(payload.active_tool,payload.active_tool_args_preview,34)})` :''} · ${pl(payload.turn_tools||1,'tool')}`
)
petSay('tool',toolLine,'info',8000)
addPetBubble(key,{id: `pb-live-${key}`,type:'telemetry',title: `⚡ ${payload.active_tool}`,summary:toolLine,ai_inferred:false,
personality:$personality.get(),tone:'info',tool:payload.active_tool,metrics:{turn_tools:payload.turn_tools||0,
turn_errors:payload.turn_errors||0,consecutive_errors:streak,active_tool:payload.active_tool}})}
if(prev?.busy&&!payload.busy){void speakRecap(payload.session_id)
void checkBudgetAlerts(payload.session_id)}})
for(const compEvt of['session.compressed','session.compacted','context.compressed','session.compress']){
 ctx.onEvent(compEvt,event=>{
 const p=event?.payload||{}
 const oldSid=String(event?.old_session_id||p.old_session_id||'')
 const sid=String(p.new_session_id||event?.sessionId||event?.session_id||p.session_id||resolveFocusedIds().storedId||'')
 const convId=String(event?.conversation_id||p.conversation_id||oldSid||'')
 if(convId)trackConversationRoot(sid,convId,oldSid)
 const key=canonicalSessionKey(convId||sid)||'__global__'
 void triggerCompressionRadarTour({storedId:sid,runtimeId:sid,key})
})
}
ctx.onEvent('plugin.btw-studio.session_open',event=>{
 const p=event?.payload||event||{}
 const sid=String(p.session_id||event?.session_id||'')
 const convId=String(p.conversation_id||event?.conversation_id||'')
 if(convId)trackConversationRoot(sid,convId)
 const key=canonicalSessionKey(convId||sid)
 if(Array.isArray(p.history)&&p.history.length>0&&key!=='draft')mergeBackendHistory(key,p.history)
 else if(_rest&&(sid||convId)){
 void _rest(`/snapshot?session_id=${encodeURIComponent(sid||convId)}`,{timeoutMs:6000}).then(snap=>{
 if(snap?.conversation_id)trackConversationRoot(snap.session_id||sid,snap.conversation_id)
 if(snap?.history?.length)mergeBackendHistory(canonicalSessionKey(snap.conversation_id||sid),snap.history)
}).catch(()=>undefined)
}
 refreshSessionBadges()
 queryClient?.invalidateQueries?.({queryKey:[ID]})
})
ctx.onEvent('plugin.btw-studio.compacted',event=>{
 const p=event?.payload||event||{}
 const oldSid=String(p.old_session_id||p.previous_session_id||'')
 const newSid=String(p.new_session_id||p.session_id||event?.session_id||resolveFocusedIds().storedId||'')
 const convId=String(p.conversation_id||oldSid||newSid)
 if(convId)trackConversationRoot(newSid,convId,oldSid)
 const key=canonicalSessionKey(convId||newSid)||'__global__'
 if($compressionRadarState.get()?.liveRpc)finishCompressionRadarSequence({storedId:newSid,runtimeId:newSid,key})
 else void triggerCompressionRadarTour({storedId:newSid,runtimeId:newSid,key},p.snapshot||null)
 queryClient?.invalidateQueries?.({queryKey:[ID]})
})
ctx.onEvent('plugin.btw-studio.curator',()=>{
 queryClient?.invalidateQueries?.({queryKey:[ID,'rsi']})
 queryClient?.invalidateQueries?.({queryKey:[ID]})
})
ctx.onEvent('status.update',event=>{
const kind=String(event?.payload?.kind||'').toLowerCase()
const sid=String(event?.session_id||event?.sessionId||event?.payload?.session_id||resolveFocusedIds().storedId||'')
const key=canonicalSessionKey(sid)||'__global__'
if(kind==='compressing'||kind==='compacting'){
const cur=$compressionRadarState.get()
if(!cur?.active){
void triggerCompressionRadarTour({storedId:sid,runtimeId:sid,key},null,{liveRpc:true})
}
}else if(kind==='compacted'||(kind==='ready'&&$compressionRadarState.get()?.liveRpc)){
finishCompressionRadarSequence({storedId:sid,runtimeId:sid,key})
}
})
ctx.onEvent(EVENT_TELEMETRY,event=>{
const payload=event?.payload||{}
if(!payload.session_id)return
void speakTelemetry(payload.session_id,payload.kind==='error_streak'?'error_loop':'tool',payload)})
ctx.onEvent('message.complete',event=>{
const sid=String(event?.session_id||event?.sessionId||'')
const focused=resolveFocusedIds()
if(sid&&canonicalSessionKey(sid)!==canonicalSessionKey(focused.storedId||focused.runtimeId))return
const target=focused.storedId||focused.runtimeId||sid
scheduleTimer(()=>{if(!_ctx)return;void speakRecap(target);void checkBudgetAlerts(target)},900)})
ctx.onEvent(EVENT_ANSWER,event=>{
const payload=event?.payload||{}
if(payload?.entry&&payload?.session_id){
const saved=upsertEntry(payload.session_id,payload.entry,true)
if(saved&&(saved.media_pending||(Array.isArray(saved.media_items)&&saved.media_items.some(m=>m&&m.status==='generating')))){
pollPendingBtwMedia(canonicalSessionKey(payload.session_id),payload.session_id,saved.id)}}
refreshSessionBadges()})
ctx.onEvent(`plugin.${ID}.rsi`,event=>{
const exp=event?.payload?.experience
if(!exp?.cue)return
addLocalLesson(exp)
haptic?.('success')
host.notify?.({kind:'info',message:t().learnedNotify(exp.cue)})
petSay('learned',t().learnedNotify(exp.cue),'info',9000)})
refreshSessionBadges()
if(typeof ctx.setInterval==='function'){_badgeTimer=ctx.setInterval(refreshSessionBadges,20_000)
ctx.onDispose(()=>{try{if(typeof _badgeTimer==='function')_badgeTimer()
}catch{}
_badgeTimer=null})
}else{_badgeTimer=setInterval(refreshSessionBadges,20_000)
ctx.onDispose(()=>{if(_badgeTimer)clearInterval(_badgeTimer)
_badgeTimer=null})}
const contributions=[{id:'statusbar-chip',area:STATUSBAR_AREAS.right,order:115,render:()=>jsx(StatusBarBtwChip,{})},{
id:'palette-open',area:PALETTE_AREA,data:{id:'btw-studio.toggle',
label:'BTW Studio: Ask a side question about this session (/btw)',
keywords:['btw','side','question','status','context','eta','radar'],run:()=>requestOpenStudio({tab:'ask',toggle:true})}
},{id:'palette-modal',area:PALETTE_AREA,data:{id:'btw-studio.modal',label:'BTW Studio: Open full studio',
keywords:['btw','modal','dialog','studio','fullscreen'],run:()=>requestOpenStudio({tab:'ask',modal:true})}},{
id:'palette-radar',area:PALETTE_AREA,data:{id:'btw-studio.radar',label:'BTW Studio: Open Session Radar (read-only · 0 tokens)',
keywords:['btw','radar','tokens','cost','errors','telemetry'],run:()=>requestOpenStudio({tab:'radar'})}},{
id:'palette-hud',area:PALETTE_AREA,data:{id:'btw-studio.hud',label:'BTW Studio: Toggle floating mini chat',
keywords:['btw','hud','mini','chat','floating','side'],run:()=>toggleCompanionChat()}},{id:'palette-learn',
area:PALETTE_AREA,data:{id:'btw-studio.learn',label:'BTW Studio: What has BTW learned? (steer verdicts, lessons, preset yield)',
keywords:['btw','learn','rsi','harness','lessons','yield','grow'],run:()=>requestOpenStudio({tab:'learn',modal:true})}
},{id:'palette-subagents',area:PALETTE_AREA,data:{id:'btw-studio.subagents',
label:'BTW Studio: Open Subagents Fleet Hub (live transcripts, /btw & subagent.steer)',
keywords:['btw','subagents','delegate','children','fleet','steer','tail'],
run:()=>requestOpenStudio({tab:'subagents',modal:true})}},{id:'palette-present',area:PALETTE_AREA,data:{
id:'btw-studio.present',label:'BTW Studio: Toggle presentation mode (big, high-contrast demo UI)',
keywords:['btw','demo','presentation','record','video','big'],run:()=>setPref($present,!$present.get(),'present')}},{
id:'keybind-hud',area:KEYBINDS_AREA,data:{id:'btw-studio.hud',label:'Toggle BTW mini chat',category:'view',
defaults:[],run:()=>toggleCompanionChat()}},{id:'keybind-toggle',area:KEYBINDS_AREA,data:{id:'btw-studio.toggle',
label:'Toggle BTW Studio Popover',category:'view',defaults:['mod+alt+b'],
run:()=>requestOpenStudio({tab:'ask',toggle:true})}}]
if(SESSION_ROW_AREAS?.trailing){contributions.push({id:'session-row-badge',area:SESSION_ROW_AREAS.trailing,order:40,
data:{render:({sessionId})=>jsx(SessionRowBadge,{sessionId})}})}
if(KANBAN_CARD_AREAS?.badges){contributions.push({id:'kanban-card-telemetry',area:KANBAN_CARD_AREAS.badges,order:40,data:{
decorate:card=>{if(!card?.id)return null
const key=canonicalSessionKey(card.id)
const b=$sessionBadges.get()?.[key]
const rawLocal=$entriesBySession.get()?.[key]
const local=Array.isArray(rawLocal)?rawLocal:[]
const cards=Math.max(Number(b?.cards||0),local.length)
const alert=Boolean(b?.alert)
if(!cards&&!alert)return null
return{label:alert? `⚠ /btw (${cards})` : `/btw (${cards})`,tone:alert?'red':'cyan',
tooltip:t().rowBadgeTip(cards,Number(b?.pinned||0),alert)}}}})}
if(TRANSCRIPT_DIRECTIVE_AREA){contributions.push({id:'transcript-btw-card',area:TRANSCRIPT_DIRECTIVE_AREA,data:{name:'btw-card',
render:({attrs})=>{
const title=String(attrs?.title||attrs?.question||'/btw insight').slice(0,120)
const summary=String(attrs?.summary||attrs?.text||'').slice(0,400)
const state=['calm','watch','act'].includes(attrs?.state)?attrs.state:'calm'
return divs({cls:'btw-flight my-1.5 text-xs','data-state':state},[
codicon('comment-discussion','0.9rem','btw-ac shrink-0'),divs('min-w-0 flex-1',[div(CLS.titleTrunc,title),
summary?div('btw-tx-11 btw-ts truncate',summary):null]),uiBtn('outline','xs',{onClick:()=>requestOpenStudio({tab:'ask',prefill:summary? `${title}: ${summary}` :title})},t().openStudio)])}}})}
if(COMPOSER_AREAS?.middleware){contributions.push({id:'slash-btw-interceptor',area:COMPOSER_AREAS.middleware,order:-50,
data:{handler:btwComposerMiddleware}})}
if(COMPOSER_AREAS?.top){contributions.push({id:'composer-top-banner',area:COMPOSER_AREAS.top,order:10,render:()=>
hs(Fragment,null,[jsx(ComposerAlertStrip,{},'alert'),jsx(ComposerLiveTalkStrip,{},'livetalk'),jsx(ComposerTopBtwBanner,{},'banner')])})}
if(COMPOSER_AREAS?.actions){contributions.push({id:'composer-action-pill',area:COMPOSER_AREAS.actions,order:10,
render:()=>jsx(ComposerBtwTrigger,{})})}
if(COMPOSER_AREAS?.microActions){contributions.push({id:'composer-busy-micro-action',area:COMPOSER_AREAS.microActions,order:25,
data:{resolve:({busy})=>{if(!busy)return[];const k=resolveFocusedIds().key;const hasActiveBanner=Boolean($showComposerBanner.get()&&($pendingBySession.get()[k]||(Array.isArray($entriesBySession.get()[k])&&$entriesBySession.get()[k].length>0&&$entriesBySession.get()[k][$entriesBySession.get()[k].length - 1]?.id!==$bannerDismissedIdBySession.get()[k])));return hasActiveBanner?[]:[{id:'btw-studio-quick-ask',icon:'comment-discussion',label:t().microActionLabel,
run:()=>requestOpenStudio({tab:'ask'})}]}}})}
if(COMPOSER_AREAS?.attachments){contributions.push({id:'composer-attach-menu-btw',area:COMPOSER_AREAS.attachments,order:15,
data:{label:t().attachMenuLabel,icon:'comment-discussion',run:()=>requestOpenStudio({tab:'ask'})}})}
if(COMPOSER_AREAS?.contextMenu){contributions.push({id:'composer-context-menu-btw',area:COMPOSER_AREAS.contextMenu,order:20,
data:{items:({selection})=>{
const trimmed=String(selection||'').trim()
if(!trimmed)return[]
return[{label:t().contextMenuLabel,onSelect:()=>requestOpenStudio({tab:'ask',
prefill:t().contextMenuPrefill(trimmed.slice(0,180))})}]}}})}
ctx.registerMany(contributions)
try{ctx.registerSettingsPage?.({id:'btw-studio',title:'BTW Studio',icon:'comment-discussion',
render:()=>jsx(BtwSettingsPanel,{compact:false})
})
}catch{}
ctx.onDispose(()=>{
_disposing=true
try{flushPendingPrefs()}catch{}
if(_settingsSyncTimer){cancelTimer(_settingsSyncTimer);_settingsSyncTimer=null}
try{stopBtwDictation(true)
stopBtwWakeListener(false)
stopBtwLiveVoice(false)
stopBtwTtsPlayback()
_releaseSharedMicIfIdle(true)
}catch{}
for(const tId of _activeMediaPolls.values())clearInterval(tId)
_activeMediaPolls.clear()
if(_liveTurnRetryTimer){clearTimeout(_liveTurnRetryTimer);_liveTurnRetryTimer=null}
if(_chimeCloseTimer){clearTimeout(_chimeCloseTimer);_chimeCloseTimer=null}
if(_chimeAudioCtx){try{void _chimeAudioCtx.close?.().catch?.(()=>undefined)}catch{}_chimeAudioCtx=null}
if(_stagedNoticeTimer){cancelTimer(_stagedNoticeTimer)
_stagedNoticeTimer=null}
if(_aerialBubbleTimer){cancelTimer(_aerialBubbleTimer)
_aerialBubbleTimer=null}
if(_laserReadyTimer){cancelTimer(_laserReadyTimer)
_laserReadyTimer=null}
for(const tId of _compressionRadarTimers)clearTimeout(tId)
_compressionRadarTimers=[]
_mediaDataUrlCache.clear()
_conversationRootBySid.clear()
_liveConvHistory=[]
_lastParentSessionKey=''
_rest=null
_storage=null
try{_hudDispose?.()
}catch{}
_hudDispose=null
$hudOpen.set(false)
$alertSteer.set(null)
$presetEditorDraft.set(null)
$followUpParent.set(null)
$targetOverride.set(null)
$expandedDiffPath.set('')
$activeCardMiniChatId.set('')
$pendingBySession.set({})
$livePulseBySession.set({})
$sessionBadges.set({})
$petBubblesBySession.set({})
$inlineMascotDrawerOpen.set(false)
$inlineSettingsOpen.set(false)
$subagentLauncherOpen.set(false)
$addLessonOpen.set(false)
$specialistOpen.set(false)
$playbookPreviewOpen.set(false)
$sessionMeshOpen.set(false)
$composerStagedNotice.set(null)
$activeMediaLightbox.set(null)
$aerialBubble.set(null)
$petGrabbed.set(false)
$bannerLaserTarget.set(null)
$compressionRadarState.set(null)
$liveVoiceReply.set('')
$btwAttachments.set([])
$demoShowcase.set(false)
if(_prefsDebounceTimer){cancelTimer(_prefsDebounceTimer);_prefsDebounceTimer=null}
if(_settingsSyncTimer){cancelTimer(_settingsSyncTimer);_settingsSyncTimer=null}
for(const k of Object.keys(_alertedBySession))delete _alertedBySession[k]
for(const fn of Object.values(_petLines)){try{fn?.()
}catch{}}
_lastBadgesJson=''
_petLines={}
_pet=null
_ctx=null
_composerOpenHandlers.clear()
$dialogOpen.set(false)})}}
