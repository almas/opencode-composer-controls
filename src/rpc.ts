/**
 * Composer Controls — RPC contract shared by the server and GUI halves.
 *
 * Plain JSON Schema literals: the server validates input and output with
 * them, and the GUI types its client proxy from the same definition.
 */
import type { Rpc } from "@opencode/schema/rpc"

export const ComposerControlsRpc = {
  id: "composer-controls",
  methods: {
    // Current preferences.
    prefs: {
      input: { type: "object", properties: {} },
      output: {
        type: "object",
        properties: {
          sendKey: { type: "string" },
          heightPx: { type: "number" },
          rememberHeight: { type: "boolean" },
        },
        required: ["sendKey", "heightPx", "rememberHeight"],
      },
    },
    // Save preferences and return the stored values.
    setPrefs: {
      input: {
        type: "object",
        properties: {
          sendKey: { type: "string" },
          heightPx: { type: "number" },
          rememberHeight: { type: "boolean" },
        },
      },
      output: {
        type: "object",
        properties: {
          sendKey: { type: "string" },
          heightPx: { type: "number" },
          rememberHeight: { type: "boolean" },
        },
        required: ["sendKey", "heightPx", "rememberHeight"],
      },
    },
  },
  events: {},
} satisfies Rpc.PortableDefinition

export type SendKey = "ctrl+enter" | "enter"
export type Prefs = { sendKey: SendKey; heightPx: number; rememberHeight: boolean }
