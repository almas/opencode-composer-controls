// @vitest-environment node
import { describe, expect, it } from "vitest"
import { DEFAULT_PREFS, loadHeight, loadPrefsValue, loadSendKey } from "../src/index"

describe("loadSendKey", () => {
  it("accepts only the two supported modes", () => {
    expect(loadSendKey("enter", "ctrl+enter")).toBe("enter")
    expect(loadSendKey("ctrl+enter", "enter")).toBe("ctrl+enter")
  })

  it("falls back on anything else", () => {
    for (const raw of [undefined, null, "ENTER", "shift+enter", 1, {}, "cmd+enter"]) {
      expect(loadSendKey(raw, "ctrl+enter")).toBe("ctrl+enter")
    }
  })
})

describe("loadHeight", () => {
  it("clamps into the usable band (120..2400)", () => {
    expect(loadHeight(50, 360)).toBe(120)
    expect(loadHeight(5000, 360)).toBe(2400)
    expect(loadHeight(360, 180)).toBe(360)
  })

  it("rounds fractional pixels", () => {
    expect(loadHeight(300.6, 180)).toBe(301)
  })

  it("falls back on non-numeric values", () => {
    for (const raw of ["300", NaN, Infinity, null, {}, undefined]) {
      expect(loadHeight(raw, 360)).toBe(360)
    }
  })
})

describe("loadPrefsValue", () => {
  it("returns defaults for missing or malformed storage", () => {
    for (const raw of [undefined, null, "prefs", 7, []]) {
      expect(loadPrefsValue(raw)).toEqual(DEFAULT_PREFS)
    }
  })

  it("sanitizes each field independently", () => {
    const prefs = loadPrefsValue({ sendKey: "nope", heightPx: 9999, rememberHeight: false })
    expect(prefs).toEqual({ sendKey: "ctrl+enter", heightPx: 2400, rememberHeight: false })
  })

  it("reads rememberHeight strictly (undefined keeps the default)", () => {
    expect(loadPrefsValue({ rememberHeight: true }).rememberHeight).toBe(true)
    expect(loadPrefsValue({ rememberHeight: false }).rememberHeight).toBe(false)
    expect(loadPrefsValue({ rememberHeight: "true" }).rememberHeight).toBe(false)
    expect(loadPrefsValue({}).rememberHeight).toBe(DEFAULT_PREFS.rememberHeight)
  })

  it("ships Ctrl+Enter as the default send key so plain Enter stays a newline", () => {
    expect(DEFAULT_PREFS.sendKey).toBe("ctrl+enter")
  })
})
