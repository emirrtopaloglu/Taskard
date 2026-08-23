import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { parseTOML } from "./toml.js"

export function loadConfig(projectDir, overrides = {}) {
  const globalPath = path.join(os.homedir(), ".taskard", "config.toml")
  const projectPath = path.join(projectDir, ".taskard", "config.toml")
  let cfg = defaults()
  for (const p of [globalPath, projectPath]) {
    if (fs.existsSync(p)) cfg = deepMerge(cfg, parseTOML(fs.readFileSync(p, "utf8")))
  }
  return deepMerge(cfg, overrides)
}

export function defaults() {
  return {
    defaults: { timeout_seconds: 1200, max_attempts: 2 },
    roles: {},
    adapters: {},
    risky_operations: { patterns: [] },
  }
}

function deepMerge(base, extra) {
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const [k, v] of Object.entries(extra)) {
    const bothObjects =
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      base[k] &&
      typeof base[k] === "object" &&
      !Array.isArray(base[k])
    out[k] = bothObjects ? deepMerge(base[k], v) : v
  }
  return out
}
