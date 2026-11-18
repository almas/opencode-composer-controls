/**
 * Composer Controls — the server half of the plugin.
 *
 * Registers the `composer-controls` RPC domain, which only reads and writes
 * user preferences (send key, composer height) in plugin storage. All the
 * behaviour lives in the GUI half, next to the composer DOM it controls.
 */
import { Plugin } from "@opencode/plugin"
import { ComposerControlsRpc, type Prefs, type SendKey } from "./rpc"

const PREFS_KEY = "composer-controls/prefs"

/** 180px is the app's own cap; 360px shows roughly four lines at once. */
export const DEFAULT_PREFS: Prefs = { sendKey: "ctrl+enter", heightPx: 360, rememberHeight: true }
export const APP_DEFAULT_HEIGHT = 180
const MIN_HEIGHT = 120
const MAX_HEIGHT = 2400

function loadSendKey(value: unknown, fallback: SendKey): SendKey {
  return value === "enter" || value === "ctrl+enter" ? value : fallback
}

function loadHeight(value: unknown, fallback: number): number {
  const px = typeof value === "number" && Number.isFinite(value) ? value : fallback
  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(px)))
}

function loadPrefsValue(value: unknown): Prefs {
  const stored = (value && typeof value === "object" ? value : {}) as Partial<Prefs>
  return {
    sendKey: loadSendKey(stored.sendKey, DEFAULT_PREFS.sendKey),
    heightPx: loadHeight(stored.heightPx, DEFAULT_PREFS.heightPx),
    rememberHeight: stored.rememberHeight === undefined ? DEFAULT_PREFS.rememberHeight : stored.rememberHeight === true,
  }
}

export default Plugin.define({
  id: "composer-controls",
  async setup(ctx) {
    const loadPrefs = async (): Promise<Prefs> => {
      try {
        return loadPrefsValue(await ctx.storage.get(PREFS_KEY))
      } catch {
        return { ...DEFAULT_PREFS }
      }
    }

    await ctx.rpc.register(ComposerControlsRpc, {
      prefs: async () => await loadPrefs(),
      setPrefs: async (raw) => {
        const input = (raw ?? {}) as Partial<Prefs>
        const current = await loadPrefs()
        const next: Prefs = {
          sendKey: input.sendKey === undefined ? current.sendKey : loadSendKey(input.sendKey, current.sendKey),
          heightPx: input.heightPx === undefined ? current.heightPx : loadHeight(input.heightPx, current.heightPx),
          rememberHeight:
            input.rememberHeight === undefined ? current.rememberHeight : input.rememberHeight === true,
        }
        await ctx.storage.set(PREFS_KEY, { ...next })
        return next
      },
    })
  },
})
