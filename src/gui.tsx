/**
 * Composer Controls — the GUI half of the plugin.
 *
 * Two behaviours, both living next to the composer DOM:
 *  - Send key: by default Enter inserts a newline and Ctrl/Cmd+Enter sends.
 *    We intercept plain Enter in the capture phase and preventDefault() it —
 *    the app's own key handling checks `event.defaultPrevented` and steps
 *    aside — then insert a real line break the same way Shift+Enter does.
 *  - Height: the app caps the composer scroll area at 180px unless the user
 *    dragged the history preview. We lift that cap with CSS variables and add
 *    a drag handle on the top edge of every composer; dragging resizes, a
 *    click collapses back to the default.
 */
import { Command, Plugin, SettingsPage, TitlebarItem } from "@opencode/plugin/gui"
import { createSignal, onCleanup } from "solid-js"
import { ComposerControlsRpc, type Prefs } from "./rpc"

/** The RPC client proxy is typed structurally; keep the calls honest here. */
interface RpcLike {
  prefs(input?: object): Promise<Prefs>
  setPrefs(input: Partial<Prefs>): Promise<Prefs>
}

/** Sync startup cache so the first paint already uses the remembered values. */
const CACHE_KEY = "opencode-composer-controls.prefs"
const COLLAPSE_KEY = "opencode-composer-controls.collapsed.v2"

/** 180px is the app's own cap; 360px shows roughly four lines at once. */
const DEFAULT_PREFS: Prefs = { sendKey: "ctrl+enter", heightPx: 360, rememberHeight: true }
const MIN_HEIGHT = 120
const MAX_HEIGHT = 2400

const STYLE_ID = "composer-controls-style"

function clampHeight(px: number): number {
  if (!Number.isFinite(px)) return DEFAULT_PREFS.heightPx
  const upper = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.floor(window.innerHeight * 0.8)))
  return Math.max(MIN_HEIGHT, Math.min(upper, Math.round(px)))
}

function normalizePrefs(value: unknown): Prefs {
  const stored = (value && typeof value === "object" ? value : {}) as Partial<Prefs>
  return {
    sendKey: stored.sendKey === "enter" || stored.sendKey === "ctrl+enter" ? stored.sendKey : DEFAULT_PREFS.sendKey,
    heightPx: clampHeight(typeof stored.heightPx === "number" ? stored.heightPx : DEFAULT_PREFS.heightPx),
    rememberHeight: stored.rememberHeight === undefined ? DEFAULT_PREFS.rememberHeight : stored.rememberHeight === true,
  }
}

function loadCache(): Prefs | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return undefined
    return normalizePrefs(JSON.parse(raw))
  } catch {
    return undefined
  }
}

function saveCache(value: Prefs) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  } catch {
    /* private mode: the server copy still covers us */
  }
}

function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return String(error)
}

/** The service may boot slightly after the GUI; back off and try again. */
async function retryRpc<T>(label: string, call: () => Promise<T>, attempts = 10, baseDelayMs = 800): Promise<T | undefined> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await call()
    } catch (error) {
      const last = attempt === attempts - 1
      console.warn(`[composer-controls] ${label} attempt ${attempt + 1} failed: ${errorText(error)}`)
      if (last) return undefined
      await new Promise<void>((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)))
    }
  }
  return undefined
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
/* The app sizes the form only for its history preview. Outside that mode we
   own the height: the form becomes a column, the scroll viewport flexes to
   fill it, and the contenteditable stretches over the whole viewport so the
   area you can actually type into grows with the box. */
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) {
  height: var(--oc-cr-h, 360px) !important;
  display: flex !important;
  flex-direction: column !important;
}
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) [data-slot="composer-content"] {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
}
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) [data-component="composer-scroll"] {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  max-height: none !important;
}
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) [data-component="composer-editor"] {
  /* Grow to fill the viewport, but never shrink below the text height. */
  flex: 1 0 auto !important;
}
form[data-component="composer"] [data-oc-composer-resize] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  touch-action: none;
  opacity: 0;
  transition: opacity 0.12s ease;
}
form[data-component="composer"] [data-oc-composer-resize]:hover,
form[data-component="composer"] [data-oc-composer-resize][data-oc-dragging] {
  opacity: 1;
}
form[data-component="composer"] [data-oc-composer-resize]::after {
  content: "";
  width: 36px;
  height: 3px;
  border-radius: 999px;
  background: var(--v2-border-border-base, rgba(128, 128, 128, 0.6));
}
/* The host styles every plugin TitlebarItem like an update pill: accent-blue
   text on a filled circle. A reload button is a routine control, not a
   notification, so tone it down to the muted gray the neighbouring ghost-muted
   titlebar icons use. :has() pins the rule to the pill whose icon is the
   rotate-clockwise sprite (the host draws it with <use href>, not an inline
   path), so other plugins' items keep their own look. */
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) {
  background: transparent !important;
  border-color: transparent !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button {
  background: transparent !important;
  color: var(--v2-icon-icon-muted, var(--v2-text-text-muted, rgba(145, 145, 145, 0.92))) !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button svg,
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button use {
  fill: currentColor !important;
  color: inherit !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button:hover {
  background: var(--v2-overlay-simple-overlay-hover, rgba(128, 128, 128, 0.16)) !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button:active {
  background: var(--v2-overlay-simple-overlay-pressed, rgba(128, 128, 128, 0.24)) !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) [data-slot="titlebar-update-label"] {
  color: var(--v2-text-text-muted, rgba(145, 145, 145, 0.92)) !important;
}
`
  document.head.appendChild(style)
}

export default Plugin.define({
  i18n: {
    en: {
      "composer-controls.settings.title": "Composer",
      "composer-controls.settings.sendKey": "Send key",
      "composer-controls.settings.sendKey.ctrlEnter": "⌘/Ctrl+Enter sends the message, Enter starts a new line",
      "composer-controls.settings.sendKey.enter": "Enter sends the message (app default)",
      "composer-controls.settings.height": "Input field height",
      "composer-controls.settings.remember": "Remember the height and restore it after restart",
      "composer-controls.settings.hint":
        "Drag the top edge of the input field to resize it; a single click on the edge restores the default height.",
      "composer-controls.handle.tooltip": "Drag to resize · click to restore the default height",
      "composer-controls.reload.label": "Reload UI",
      "composer-controls.reload.title": "Reload the window so updated plugin code takes effect",
    },
    ja: {
      "composer-controls.settings.title": "入力欄",
      "composer-controls.settings.sendKey": "送信キー",
      "composer-controls.settings.sendKey.ctrlEnter": "⌘/Ctrl+Enter で送信、Enter は改行",
      "composer-controls.settings.sendKey.enter": "Enter で送信（アプリの既定）",
      "composer-controls.settings.height": "入力欄の高さ",
      "composer-controls.settings.remember": "高さを記憶して再起動後も復元する",
      "composer-controls.settings.hint":
        "入力欄の上端をドラッグするとサイズ変更できます。上端をクリックすると既定の高さに戻ります。",
      "composer-controls.handle.tooltip": "ドラッグでサイズ変更・クリックで既定の高さに戻す",
      "composer-controls.reload.label": "再読み込み",
      "composer-controls.reload.title": "プラグインの更新を反映するためウィンドウを読み込み直します",
    },
  },
  setup(ctx) {
    type DictKey =
      | "composer-controls.settings.title"
      | "composer-controls.settings.sendKey"
      | "composer-controls.settings.sendKey.ctrlEnter"
      | "composer-controls.settings.sendKey.enter"
      | "composer-controls.settings.height"
      | "composer-controls.settings.remember"
      | "composer-controls.settings.hint"
      | "composer-controls.handle.tooltip"
      | "composer-controls.reload.label"
      | "composer-controls.reload.title"
    const t = (key: DictKey) => ctx.t(key)

    const rpc = ctx.client.rpc(ComposerControlsRpc) as unknown as RpcLike
    injectStyles()

    // ---------- reload ----------
    // The Ctrl+R accelerator is unreliable in some desktop environments, so the
    // same thing the app menu's "View → Reload" does — reloading the renderer —
    // gets an always-visible titlebar pill and a palette command.
    const reloadUi = () => window.location.reload()
    ctx.add(TitlebarItem, {
      id: "composer-controls-reload",
      get label() {
        return t("composer-controls.reload.label")
      },
      get title() {
        return t("composer-controls.reload.title")
      },
      icon: "outline-rotate-clockwise",
      run: reloadUi,
    })
    ctx.add(Command, {
      id: "composer-controls.reload",
      get title() {
        return t("composer-controls.reload.title")
      },
      run: reloadUi,
    })

    // ---------- preferences ----------
    const [prefs, setPrefs] = createSignal<Prefs>(loadCache() ?? { ...DEFAULT_PREFS })
    const [collapsed, setCollapsed] = createSignal(
      (() => {
        try {
          return localStorage.getItem(COLLAPSE_KEY) === "true"
        } catch {
          return false
        }
      })(),
    )
    let userEdited = false

    const writeCollapse = (value: boolean) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "true" : "false")
      } catch {
        /* ignore */
      }
    }

    const pushPrefs = () => {
      const next = prefs()
      void retryRpc("setPrefs", () => rpc.setPrefs({ ...next }), 3, 600).then((saved) => {
        // If the user changed something while we were saving, their value wins.
        if (!saved || prefs() !== next) return
        const normalized = normalizePrefs(saved)
        setPrefs(normalized)
        saveCache(normalized)
      })
    }

    const commitPrefs = (patch: Partial<Prefs>) => {
      userEdited = true
      const next = normalizePrefs({ ...prefs(), ...patch })
      setPrefs(next)
      saveCache(next)
      syncForms()
      pushPrefs()
    }

    // The cache may predate another device's change; the server is the source of truth.
    void retryRpc("prefs", () => rpc.prefs({})).then((value) => {
      if (!value) return
      if (userEdited) {
        pushPrefs()
        return
      }
      const next = normalizePrefs(value)
      setPrefs(next)
      saveCache(next)
      syncForms()
    })

    // ---------- composer DOM ----------
    function editorInside(target: EventTarget | null): HTMLElement | null {
      if (!(target instanceof HTMLElement)) return null
      const editor = target.closest('[data-component="composer-editor"]')
      return editor instanceof HTMLElement ? editor : null
    }

    function composerForm(node: HTMLElement): HTMLFormElement | null {
      const form = node.closest('form[data-component="composer"]')
      return form instanceof HTMLFormElement ? form : null
    }

    /** The @/: suggestion popover is a sibling of the form and only mounted while open. */
    function suggestionOpen(editor: HTMLElement): boolean {
      const scope = composerForm(editor)?.parentElement
      return !!scope?.querySelector('[data-component="composer-suggestions"]')
    }

    /** Dragging the history preview sets an inline height; the app owns the composer then. */
    function inHistoryMode(form: HTMLFormElement): boolean {
      return form.style.height !== ""
    }

    function rangeAtEditorEnd(editor: HTMLElement, range: Range): boolean {
      const probe = document.createRange()
      probe.selectNodeContents(editor)
      try {
        probe.setStart(range.endContainer, range.endOffset)
      } catch {
        return false
      }
      const rest = probe.cloneContents()
      if ((rest.textContent ?? "").trim() !== "") return false
      return rest.querySelector("br, img, [data-mention], [data-file], [data-skill]") === null
    }

    /** Manual `<br>` insert for engines without execCommand; mirrors native DOM exactly. */
    function manualNewline(editor: HTMLElement) {
      const selection = window.getSelection()
      let range: Range | null = null
      if (selection && selection.rangeCount > 0) {
        const candidate = selection.getRangeAt(0)
        if (editor.contains(candidate.startContainer)) range = candidate
      }
      if (!range) {
        range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
      range.collapse(true)
      const atEnd = rangeAtEditorEnd(editor, range)
      const first = document.createElement("br")
      range.insertNode(first)
      if (atEnd) {
        // A trailing line needs a second <br> to stay visible — native behaviour.
        const tail = document.createRange()
        tail.setStartAfter(first)
        tail.collapse(true)
        tail.insertNode(document.createElement("br"))
      }
      const caret = document.createRange()
      caret.setStartAfter(first)
      caret.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(caret)
      // The app re-reads the content on any input event; synthetic keeps them in sync.
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, inputType: "insertLineBreak" }))
    }

    /** Same code path the app's native Shift+Enter produces. */
    function insertNewline(editor: HTMLElement) {
      const before = editor.getElementsByTagName("br").length
      let handled = false
      try {
        handled = document.execCommand("insertLineBreak")
      } catch {
        handled = false
      }
      if (handled && editor.getElementsByTagName("br").length > before) return
      manualNewline(editor)
    }

    // ---------- send key ----------
    /**
     * Capture phase: a plain Enter is turned into a line break before the app
     * sees it. Without `stopPropagation` the editor's own Enter branch would
     * still call submit(); the app sends on Mod+Enter, so Ctrl/Cmd+Enter is
     * left untouched and lands in the native `submit({ alternate: true })`.
     */
    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return
      // IME confirmation: never intercept the Enter that commits a candidate.
      if (event.isComposing || event.keyCode === 229) return
      if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return
      const editor = editorInside(event.target)
      if (!editor) return
      if (suggestionOpen(editor)) return
      if (prefs().sendKey !== "ctrl+enter") return
      event.preventDefault()
      event.stopPropagation()
      if (event.repeat) return
      insertNewline(editor)
    }
    window.addEventListener("keydown", onKeyDownCapture, { capture: true })
    onCleanup(() => window.removeEventListener("keydown", onKeyDownCapture, { capture: true }))

    // ---------- height ----------
    /** Collapsed means "hand the composer back to the app's native sizing". */
    const [runtimeHeight, setRuntimeHeight] = createSignal<number | undefined>(undefined)
    const effectiveHeight = () => runtimeHeight() ?? prefs().heightPx

    const applyHeight = (form: HTMLFormElement, px: number) => {
      const value = `${px}px`
      if (form.style.getPropertyValue("--oc-cr-h") !== value) form.style.setProperty("--oc-cr-h", value)
      // Old caches used a min/max pair; drop it so it cannot fight the height.
      form.style.removeProperty("--oc-cr-max")
      form.style.removeProperty("--oc-cr-min")
    }

    const clearHeight = (form: HTMLFormElement) => {
      form.removeAttribute("data-oc-composer-controls")
      form.style.removeProperty("--oc-cr-h")
      form.style.removeProperty("--oc-cr-max")
      form.style.removeProperty("--oc-cr-min")
    }

    function createHandle(form: HTMLFormElement): HTMLElement {
      const handle = document.createElement("div")
      handle.setAttribute("data-oc-composer-resize", "")
      handle.title = t("composer-controls.handle.tooltip")
      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        const startHeight = Math.round(form.getBoundingClientRect().height)
        const startY = event.clientY
        let moved = false
        let lastHeight = startHeight

        handle.setPointerCapture(event.pointerId)
        handle.setAttribute("data-oc-dragging", "")

        const onMove = (move: PointerEvent) => {
          const delta = startY - move.clientY
          if (Math.abs(delta) >= 2) moved = true
          lastHeight = clampHeight(startHeight + delta)
          applyHeight(form, lastHeight)
        }
        const finish = (commit: boolean) => {
          handle.removeAttribute("data-oc-dragging")
          handle.removeEventListener("pointermove", onMove)
          handle.removeEventListener("pointerup", onUp)
          handle.removeEventListener("pointercancel", onCancel)
          try {
            handle.releasePointerCapture(event.pointerId)
          } catch {
            /* already released */
          }
          if (!commit) return
          if (moved) {
            if (collapsed()) {
              setCollapsed(false)
              writeCollapse(false)
            }
            if (prefs().rememberHeight) {
              setRuntimeHeight(undefined)
              commitPrefs({ heightPx: lastHeight })
            } else {
              setRuntimeHeight(lastHeight)
            }
          } else {
            // A plain click toggles between the chosen height and the small default.
            const next = !collapsed()
            setCollapsed(next)
            writeCollapse(next)
          }
          syncForms()
        }
        const onUp = () => finish(true)
        const onCancel = () => finish(false)
        handle.addEventListener("pointermove", onMove)
        handle.addEventListener("pointerup", onUp)
        handle.addEventListener("pointercancel", onCancel)
      })
      return handle
    }

    function syncForms() {
      const forms = document.querySelectorAll<HTMLFormElement>('form[data-component="composer"]')
      for (const form of forms) {
        // While a handle is being dragged its value wins over the stored one.
        if (form.querySelector("[data-oc-composer-resize][data-oc-dragging]")) continue
        // The history preview sizes the form itself; the app owns it in that mode.
        if (inHistoryMode(form)) {
          form.querySelector("[data-oc-composer-resize]")?.remove()
          clearHeight(form)
          continue
        }
        if (!form.querySelector("[data-oc-composer-resize]")) form.appendChild(createHandle(form))
        // Collapsed: no override at all, the app's own 180px cap applies.
        if (collapsed()) {
          clearHeight(form)
          continue
        }
        form.setAttribute("data-oc-composer-controls", "")
        applyHeight(form, effectiveHeight())
      }
    }

    let syncQueued = false
    const scheduleSync = () => {
      if (syncQueued) return
      syncQueued = true
      requestAnimationFrame(() => {
        syncQueued = false
        syncForms()
      })
    }
    const observer = new MutationObserver(scheduleSync)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] })
    onCleanup(() => observer.disconnect())
    syncForms()

    // ---------- settings ----------
    ctx.add(SettingsPage, {
      id: "composer-controls",
      get title() {
        return t("composer-controls.settings.title")
      },
      icon: "keyboard",
      render: () => <SettingsView />,
    })

    function SettingsView() {
      const rowStyle = { display: "flex", "align-items": "center", gap: "8px" } as const
      const labelStyle = { display: "flex", "flex-direction": "column", gap: "8px" } as const
      return (
        <div style={{ display: "flex", "flex-direction": "column", gap: "18px", padding: "4px 0", "font-size": "13px" }}>
          <div style={labelStyle}>
            <span style={{ "font-weight": "600" }}>{t("composer-controls.settings.sendKey")}</span>
            <label style={rowStyle}>
              <input
                type="radio"
                name="composer-controls-send-key"
                checked={prefs().sendKey === "ctrl+enter"}
                onChange={() => commitPrefs({ sendKey: "ctrl+enter" })}
              />
              <span>{t("composer-controls.settings.sendKey.ctrlEnter")}</span>
            </label>
            <label style={rowStyle}>
              <input
                type="radio"
                name="composer-controls-send-key"
                checked={prefs().sendKey === "enter"}
                onChange={() => commitPrefs({ sendKey: "enter" })}
              />
              <span>{t("composer-controls.settings.sendKey.enter")}</span>
            </label>
          </div>

          <label style={labelStyle}>
            <span style={{ "font-weight": "600" }}>{t("composer-controls.settings.height")}</span>
            <div style={rowStyle}>
              <input
                type="number"
                min={MIN_HEIGHT}
                max={MAX_HEIGHT}
                step={10}
                value={prefs().heightPx}
                style={{ width: "110px", padding: "4px 8px" }}
                onChange={(event) => {
                  const px = Number(event.currentTarget.value)
                  if (!Number.isFinite(px)) return
                  if (collapsed()) {
                    setCollapsed(false)
                    writeCollapse(false)
                  }
                  commitPrefs({ heightPx: px })
                }}
              />
              <span style={{ opacity: "0.7" }}>px</span>
            </div>
          </label>

          <label style={rowStyle}>
            <input
              type="checkbox"
              checked={prefs().rememberHeight}
              onChange={(event) => commitPrefs({ rememberHeight: event.currentTarget.checked })}
            />
            <span>{t("composer-controls.settings.remember")}</span>
          </label>

          <div style={{ opacity: "0.7", "max-width": "480px", "line-height": "1.5" }}>
            {t("composer-controls.settings.hint")}
          </div>
        </div>
      )
    }
  },
})
