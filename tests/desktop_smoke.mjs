import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as nodeModule from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const PLUGIN_JS = path.join(ROOT_DIR, 'desktop', 'plugin.js')

const SDK_STUB = `
export function atom(v) {
  let cur = v; const subs = new Set();
  return { get: () => cur, set: (n) => { cur = n; subs.forEach(fn => fn(cur)); }, subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); } };
}
export function computed(stores, fn) {
  return { get: () => fn(...stores.map(s => s.get())), subscribe: () => () => {} };
}
export const useValue = (s) => s?.get ? s.get() : s;
export const useQuery = () => ({ data: null, isFetching: false, refetch: async () => ({}) });
export const cn = (...a) => a.filter(Boolean).join(' ');
export const haptic = () => {};
export const isSubmitEnter = (e) => e?.key === 'Enter';
export const writeClipboardText = async () => true;
export const createBudgetedLoop = () => ({ start: () => {}, stop: () => {} });
export const queryClient = { invalidateQueries: () => {} };
export const host = {
  state: { busy: atom(false), busyBySession: atom({}), focusedSessionId: atom('s1'), model: atom('claude-sonnet-4-5') },
  request: async () => ({ ok: true, subagent_id: 'sa-smoke-1', refined_prompt: 'Refined prompt OK' }),
  notify: () => {},
  composer: { insertText: async () => true, focus: () => {} }
};
const noop = () => null;
export const Badge = noop, Blobatar = noop, Button = noop, Codicon = noop, CopyButton = noop, DecodeText = noop, Dialog = noop, DialogContent = noop, DialogDescription = noop, DialogHeader = noop, DialogTitle = noop, DisclosureCaret = noop, DropdownMenu = noop, DropdownMenuContent = noop, DropdownMenuItem = noop, DropdownMenuSeparator = noop, DropdownMenuTrigger = noop, GlyphSpinner = noop, Kbd = noop, KbdGroup = noop, Loader = noop, MessageTextContent = noop, ModelCatalogMenu = noop, ModelMenuCloseContext = {}, PanelPill = noop, Popover = noop, PopoverContent = noop, PopoverTrigger = noop, SearchField = noop, SegmentedControl = noop, SessionStatusDot = noop, StatusDot = noop, Switch = noop, Tip = noop;
export const PROFILE_SWATCHES = ['#38bdf8', '#10b981'];
export const COMPOSER_AREAS = { middleware: 'cm', top: 'ct', actions: 'ca', microActions: 'cma', attachments: 'cat', contextMenu: 'ccm' };
export const STATUSBAR_AREAS = { right: 'sbr' };
export const SESSION_ROW_AREAS = { trailing: 'srt' };
export const KANBAN_CARD_AREAS = { badges: 'kcb' };
export const TRANSCRIPT_DIRECTIVE_AREA = 'tda', PANES_AREA = 'pa', PALETTE_AREA = 'pla', KEYBINDS_AREA = 'kba';
`

const REACT_STUB = `
export const Fragment = 'Fragment';
export const useState = (v) => [typeof v === 'function' ? v() : v, () => {}];
export const useEffect = () => {};
export const useMemo = (fn) => fn();
export const useCallback = (fn) => fn;
export const useRef = (v) => ({ current: v });
`

const JSX_RUNTIME_STUB = `
export const jsx = (type, props, key) => ({ type, props, key });
export const jsxs = (type, props, key) => ({ type, props, key });
`

function resolveStubUrl(specifier) {
  if (specifier === '@hermes/plugin-sdk') {
    return 'data:text/javascript,' + encodeURIComponent(SDK_STUB)
  }
  if (specifier === 'react') {
    return 'data:text/javascript,' + encodeURIComponent(REACT_STUB)
  }
  if (specifier === 'react/jsx-runtime') {
    return 'data:text/javascript,' + encodeURIComponent(JSX_RUNTIME_STUB)
  }
  return null
}

if (typeof nodeModule.registerHooks === 'function') {
  nodeModule.registerHooks({
    resolve(specifier, context, nextResolve) {
      const stubUrl = resolveStubUrl(specifier)
      if (stubUrl) return { shortCircuit: true, url: stubUrl }
      return nextResolve(specifier, context)
    },
  })
} else {
  const asyncLoader = `
    const map = ${JSON.stringify({
      '@hermes/plugin-sdk': 'data:text/javascript,' + encodeURIComponent(SDK_STUB),
      react: 'data:text/javascript,' + encodeURIComponent(REACT_STUB),
      'react/jsx-runtime': 'data:text/javascript,' + encodeURIComponent(JSX_RUNTIME_STUB),
    })};
    export async function resolve(specifier, context, nextResolve) {
      if (map[specifier]) return { shortCircuit: true, url: map[specifier] };
      return nextResolve(specifier, context);
    }
  `
  nodeModule.register('data:text/javascript,' + encodeURIComponent(asyncLoader))
}

let domStyleCaptured = ''
globalThis.document = {
  createElement: () => {
    let txt = ''
    return {
      style: {},
      setAttribute: () => {},
      remove: () => {},
      get textContent() { return txt },
      set textContent(v) { txt = String(v || ''); domStyleCaptured += txt },
    }
  },
  head: { append: () => {}, appendChild: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
}
globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const jsBuffer = fs.readFileSync(PLUGIN_JS)
const jsSource = jsBuffer.toString('utf8')
const mod = await import(pathToFileURL(PLUGIN_JS).href)
const pluginDef = mod.default || mod

let injectedCss = ''
function createMockCtx(storeMap = new Map()) {
  const registered = []
  const eventHandlers = new Map()
  let disposeFn = null
  let settingsPage = null
  const ctx = {
    storage: {
      get: (k, d) => (storeMap.has(k) ? storeMap.get(k) : d),
      set: (k, v) => storeMap.set(k, v),
    },
    i18n: { register: () => {}, t: () => 'en', onLocaleChange: () => () => {} },
    pet: { visible: { get: () => true }, say: () => () => {} },
    rest: async (p) => (
      p === '/settings'
        ? { ok: true, config: { growth_mode: 'lite', btw_md_max_chars: 4000, auto_learn_hook: true, auto_learn_cron_minutes: 0 } }
        : { ok: true }
    ),
    injectStyle: (css) => { injectedCss = String(css || '') },
    registerMany: (items) => registered.push(...items),
    registerSettingsPage: (cfg) => { settingsPage = cfg },
    onEvent: (ev, fn) => { eventHandlers.set(ev, fn); return () => eventHandlers.delete(ev) },
    onDispose: (fn) => { disposeFn = fn },
    setTimeout: (fn) => { const id = setTimeout(fn, 5); return () => clearTimeout(id) },
    setInterval: () => () => {},
  }
  return { ctx, storeMap, registered, eventHandlers, getDispose: () => disposeFn, getSettingsPage: () => settingsPage }
}

{
  const boot = createMockCtx(
    new Map([
      ['history.v1', { sess_legacy: [{ id: 'old1', question: 'Q?', text: 'Legacy text answer' }] }],
      ['prefs.v2', { theme: 'paper', askMode: 'deep', growthMode: 'full', playbookCharBudget: 9000 }],
    ])
  )
  pluginDef.register(boot.ctx)
  await new Promise((r) => setTimeout(r, 25))
  boot.getDispose()?.()
}
const fullCss = injectedCss || domStyleCaptured

test('1. bundle size stays strictly under 925 KiB and exports register(ctx)', () => {
  assert.ok(jsBuffer.byteLength < 925 * 1024, `Expected < 925 KiB (947200 B), got ${jsBuffer.byteLength} B`)
  assert.equal(typeof pluginDef.register, 'function')
})

test('2. savePrefs and loadPrefs maintain key symmetry and round-trip across themes', async () => {
  const mSave = jsSource.match(/function savePrefs\(overrides\s*=\s*\{\}\)\s*\{[\s\S]*?_storage\.set\(PREFS_KEY,\s*\{([\s\S]*?)\.\.\.overrides/)
  assert.ok(mSave, 'savePrefs PREFS_KEY object literal must exist')
  const savedKeys = [...mSave[1].matchAll(/([a-zA-Z0-9_]+)\s*:/g)].map((m) => m[1])
  assert.ok(savedKeys.length >= 58, `Expected >= 58 persisted preference keys, got ${savedKeys.length}`)
  const mLoad = jsSource.match(/const\s+prefs\s*=\s*ctx\.storage\.get\(PREFS_KEY,\s*null\)([\s\S]*?)const\s+savedRsi/)
  const loadScope = mLoad ? mLoad[1] : jsSource
  for (const key of savedKeys) {
    assert.ok(
      loadScope.includes(`prefs.${key}`) || loadScope.includes(`prefs?.${key}`),
      `Saved preference key "${key}" is never restored in loadPrefs`
    )
  }

  // Verify paper theme design metadata is registered cleanly without legacy tag coupling
  const mPaperMeta = jsSource.match(/paper\s*:\s*\{[^}]*id\s*:\s*'paper'[^}]*surfaceHex\s*:\s*'#([0-9a-fA-F]{6})'/)
  assert.ok(mPaperMeta, 'THEME_DESIGN_META.paper must define a light hex surface without legacy tag coupling')

  // Verify functional round-trip through register(ctx) -> loadPrefs -> dispose() -> savePrefs
  const seedPrefs = {
    theme: 'paper',
    askMode: 'deep',
    personaGeometry: 'hexagon',
    growthMode: 'full',
    playbookCharBudget: 9000,
    stockSafePet: true,
  }
  const rtStore = new Map([['prefs.v2', seedPrefs]])
  const harness = createMockCtx(rtStore)
  pluginDef.register(harness.ctx)
  await new Promise((r) => setTimeout(r, 20))
  harness.getDispose()?.()
  const persisted = rtStore.get('prefs.v2')
  assert.equal(persisted?.theme, 'paper')
  assert.equal(persisted?.askMode, 'deep')
  assert.equal(persisted?.personaGeometry, 'hexagon')
  assert.equal(persisted?.growthMode, 'full')
  assert.equal(persisted?.playbookCharBudget, 9000)
})

test('3. boot /settings sync respects local user preferences and registers >= 10 SDK contributions', async () => {
  const store = new Map([
    ['prefs.v2', { theme: 'paper', askMode: 'deep', growthMode: 'full', playbookCharBudget: 9000 }],
  ])
  const h = createMockCtx(store)
  pluginDef.register(h.ctx)
  await new Promise((r) => setTimeout(r, 30))

  assert.ok(h.registered.length >= 10, `Expected >= 10 SDK area contributions, got ${h.registered.length}`)
  assert.equal(h.getSettingsPage()?.id, 'btw-studio')
  const dispose = h.getDispose()
  assert.equal(typeof dispose, 'function')
  dispose()

  const saved = store.get('prefs.v2')
  assert.equal(saved.theme, 'paper')
  assert.equal(saved.askMode, 'deep')
  assert.equal(saved.growthMode, 'full')
  assert.equal(saved.playbookCharBudget, 9000)
})

test('4. [data-btw-theme="host"] contains zero var(--accent, dark-surface capture or W3C variable cycle', () => {
  assert.ok(fullCss.length > 1000, 'Injected CSS must be captured from register(ctx)')
  const hostThemeDecls = [...fullCss.matchAll(/\[data-btw-theme="host"\][^{]*\{([^}]*)\}/g)].map((m) => m[1]).join('\n')
  assert.ok(hostThemeDecls.length > 0, '[data-btw-theme="host"] rule block must exist')
  assert.ok(!hostThemeDecls.includes('var(--accent,'), 'Must not capture shadcn dark hover --accent or form var(--ui-accent) cycle')
  assert.ok(!hostThemeDecls.includes('var(--accent)'), 'Must not capture bare var(--accent) in host theme')
})

test('5. .btw-primary-send-btn:disabled has explicit legible styling (not bare opacity alone)', () => {
  const disabledMatches = [...fullCss.matchAll(/\.btw-primary-send-btn:disabled\s*\{([^}]*)\}/g)].map((m) => m[1]).join(';')
  assert.ok(disabledMatches.length > 0, '.btw-primary-send-btn:disabled CSS rule must exist')
  assert.ok(
    disabledMatches.includes('background') && disabledMatches.includes('color'),
    `.btw-primary-send-btn:disabled must define explicit background and color, got: ${disabledMatches}`
  )
})

test('6. zero z-index > 50 anywhere in injected CSS (Radix popover/dialog layering invariant)', () => {
  const zMatches = [...fullCss.matchAll(/z-index\s*:\s*(-?\d+)/gi)]
  assert.ok(zMatches.length > 0, 'Expected z-index declarations in CSS')
  const violations = zMatches
    .map((m) => ({ raw: m[0], val: Number(m[1]) }))
    .filter((item) => item.val > 50)
  assert.deepEqual(violations, [], `Found z-index > 50 in CSS: ${JSON.stringify(violations)}`)
})

test('7. zero arbitrary/phantom Tailwind v4 classes (size-[, text-[, text-(--, bg-(--, border-(--)', () => {
  for (const phantomPrefix of ['size-[', 'text-[', 'text-(--', 'bg-(--', 'border-(--']) {
    assert.ok(
      !jsSource.includes(phantomPrefix),
      `Phantom uncompiled Tailwind arbitrary class "${phantomPrefix}" remained in desktop/plugin.js`
    )
  }
})

test('8. zero legacy theme or local path leaks in desktop/plugin.js', () => {
  const forbiddenTokens = [
    'usePetGhost',
    'btw-grok-',
    '[data-btw-theme="starwars"]',
    '[data-btw-theme="nous"]',
    'D:/AGENTIC_HUB',
  ]
  for (const tok of forbiddenTokens) {
    assert.ok(!jsSource.includes(tok), `Forbidden legacy/path string "${tok}" found in desktop/plugin.js`)
  }
})

test('9. all host-isolation warm RPC endpoints and fallback wiring exist', () => {
  const warmRpcs = [
    'subagent_launch',
    'subagent_control',
    'refine_prompt',
    'playbook_save',
    'media_read',
    'entry_status',
  ]
  for (const slug of warmRpcs) {
    assert.ok(jsSource.includes(slug), `Missing warm RPC wiring for "${slug}"`)
  }
})

test('10. all 9 themes and Paper-on-Dark surface isolation are defined in CSS', () => {
  for (const themeId of ['orbyx', 'host', 'paper', 'cryo', 'ai', 'glass', 'terminal', 'minimal', 'nordic']) {
    assert.ok(fullCss.includes(`[data-btw-theme="${themeId}"]`), `Missing theme selector for "${themeId}"`)
  }
  assert.ok(fullCss.includes(':root.dark [data-btw-theme="paper"]'), 'Paper theme must isolate against :root.dark host')
  assert.ok(!fullCss.includes('rgba(11,18,32,0.95)'), 'Hardcoded dark card background must not leak into light/paper themes')
})

test('11. zero forbidden host DOM reach-in or browser storage globals (Catalog Rule 8)', () => {
  const forbiddenDom = [
    'querySelector',
    'getElementsByTagName',
    'getElementsByClassName',
    'MutationObserver',
    'localStorage',
    'sessionStorage',
    'data-slot',
    'data-testid',
    'new Function',
  ]
  for (const item of forbiddenDom) {
    assert.ok(!jsSource.includes(item), `Forbidden DOM/global token "${item}" found in desktop/plugin.js`)
  }
})

test('12. every MessageTextContent JSX invocation enforces previewOnly: true and media: false', () => {
  const occurrences = [...jsSource.matchAll(/jsxs?\(\s*MessageTextContent\s*,/g)]
  assert.ok(occurrences.length >= 10, `Expected >= 10 MessageTextContent JSX renders, found ${occurrences.length}`)
  for (const m of occurrences) {
    const windowSlice = jsSource.slice(m.index, m.index + 260)
    assert.ok(
      windowSlice.includes('previewOnly') && windowSlice.includes('media'),
      `MessageTextContent at offset ${m.index} missing previewOnly/media confinement: ${windowSlice}`
    )
  }
})

test('13. _SAFE_INLINE_MEDIA_URI_RE is end-anchored ($) against attribute breakout payloads', () => {
  const reLine = jsSource.match(/const\s+_SAFE_INLINE_MEDIA_URI_RE\s*=\s*(\/[^\n]+\/[a-z]*)/)
  assert.ok(reLine, '_SAFE_INLINE_MEDIA_URI_RE declaration must exist')
  assert.ok(reLine[1].includes('$'), `_SAFE_INLINE_MEDIA_URI_RE must anchor end of string ($): ${reLine[1]}`)
})

test('14. keyboard accessibility rovingKeyDown and procedural OrbyxSvgAvatar are wired', () => {
  assert.ok(jsSource.includes('function rovingKeyDown('))
  assert.ok(jsSource.includes('function OrbyxSvgAvatar('))
  assert.ok(fullCss.replace(/\s+/g, '').includes('container-type:inline-size;container-name:btwsurface'))
})

test('15. governance defaults are strictly opt-in for external writes, voice, aerial pet, and gamify', () => {
  const compact = jsSource.replace(/\s+/g, '')
  assert.ok(compact.includes("$memorySyncMode=atom('off')"))
  assert.ok(compact.includes('$petAerialFlight=atom(false)'))
  assert.ok(compact.includes('$liveVoiceEnabled=atom(false)'))
  assert.ok(compact.includes('$gamifyEnabled=atom(false)'))
})

test('16. singular/plural grammar and STEER HELP RATE separation avoid metric inflation', () => {
  assert.ok(!jsSource.includes('${moldedSkills.length} skills'), 'Must pluralize 1 skill vs N skills properly')
  assert.ok(
    !jsSource.includes('Number(v.helped || 0) + Number(v.self_recovered || 0)') || !jsSource.includes("'HELP RATE'"),
    'Must not label helped + self_recovered sum as raw HELP RATE'
  )
})

test('17. host event listeners register cleanly and dispose() flushes state without throwing', () => {
  const store = new Map([['prefs.v2', { theme: 'nordic', askMode: 'fast' }]])
  const h = createMockCtx(store)
  pluginDef.register(h.ctx)
  assert.ok(h.eventHandlers.size >= 1, 'Expected gateway status/plugin event listeners to register')
  assert.ok(h.eventHandlers.has('status.update'), 'Must subscribe to status.update for /compress radar')
  const dispose = h.getDispose()
  assert.equal(typeof dispose, 'function')
  assert.doesNotThrow(() => dispose())
  assert.equal(store.get('prefs.v2')?.theme, 'nordic')
})

test('18. composer toolbar CSS enforces text-overflow ellipsis and single-line nowrap discipline', () => {
  const compactCss = fullCss.replace(/\s+/g, '')
  assert.ok(compactCss.includes('text-overflow:ellipsis'), 'Toolbar pills must define text-overflow:ellipsis')
  assert.ok(compactCss.includes('white-space:nowrap'), 'Toolbar controls must enforce white-space:nowrap')
})

test('19. $0 offline DEMO_SNAPSHOT and DEMO_QA_CARDS are bundled without external network calls', () => {
  assert.ok(jsSource.includes('DEMO_SNAPSHOT'), 'DEMO_SNAPSHOT must exist for $0 1-click showcase')
  assert.ok(jsSource.includes('DEMO_QA_CARDS'), 'DEMO_QA_CARDS must exist')
  assert.ok(jsSource.includes('DEMO_SESSION_MESH'), 'DEMO_SESSION_MESH must exist')
})

test('20. multi-axis Cognitive Reading Lens and Barycentric Ternary geometry helpers are wired', () => {
  for (const sym of [
    'COGNITIVE_RADAR_AXES_DEF',
    'PERSONA_AXIS_PRESETS',
    'resolveCognitivePersonaFromAxes',
    'TernaryPersonaSelector',
  ]) {
    assert.ok(jsSource.includes(sym), `Missing Cognitive Lens symbol: ${sym}`)
  }
})

test('21. multimodal attachment strip, session mentions, and lightbox controls are wired', () => {
  for (const sym of [
    'addBtwAttachment',
    'normalizeHostComposerAttachments',
    'BtwMediaLightbox',
    'BtwRichAnswerBody',
  ]) {
    assert.ok(jsSource.includes(sym), `Missing multimodal UI symbol: ${sym}`)
  }
})

test('22. repeated register(ctx) -> dispose() lifecycle cycles are idempotent', async () => {
  for (const theme of ['orbyx', 'cryo', 'minimal']) {
    const store = new Map([['prefs.v2', { theme }]])
    const h = createMockCtx(store)
    pluginDef.register(h.ctx)
    await new Promise((r) => setTimeout(r, 10))
    h.getDispose()?.()
    assert.equal(store.get('prefs.v2')?.theme, theme)
  }
})
