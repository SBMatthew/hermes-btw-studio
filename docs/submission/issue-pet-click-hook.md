# [Feature]: Desktop SDK — let plugins react to a click on the pet (`ctx.pet.onClick`) and read its anchor

**Consumer:** `btw-studio` (catalog submission in progress).

## What I need
The pet bubble door (`ctx.pet.say / clear / visible`) covers output. There is no input door:
a plugin cannot tell that the user clicked the pet, and cannot anchor a popover next to it.

Proposed, mirroring the existing door:

```ts
interface PluginPet {
  say(text, opts?): () => void
  clear(id?): void
  visible: ReadableAtom<boolean>
  /** Fires on a click (not a drag) on the in-window pet. Returns a disposer. */
  onClick?(listener: (e: { x: number; y: number }) => void): () => void
  /** Current on-screen rect of the in-window pet, or null when hidden/popped out. */
  anchor?: ReadableAtom<{ left: number; top: number; width: number; height: number } | null>
}
```

## Why
BTW Studio v3 opened a mini chat when the pet was clicked. Doing that today means scanning
`<canvas>` elements and listening to window-level pointer events — exactly the pattern the SDK
guide lists under "Migrating off DOM reach-in" (pet-wallet, #135178). For the catalog build I
removed it and open the chat from a palette command, `Ctrl+Shift+H` and the status bar chip instead.
With `onClick` + `anchor` the interaction comes back through a supported seam, and other pet
plugins (wallets, quota pets) get the same door.

## Notes
- Click vs drag can reuse the host's existing drag threshold.
- `anchor` updates only while a listener is subscribed, so idle cost is zero.
