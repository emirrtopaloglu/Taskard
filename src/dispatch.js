import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { loadConfig } from "./config.js"
import { appendEvent } from "./events.js"
import claude from "./adapters/claude.js"
import codex from "./adapters/codex.js"
import opencode from "./adapters/opencode.js"

const ADAPTERS = { claude, codex, opencode }

export function availableHarnesses() {
  return Object.keys(ADAPTERS)
}

export async function dispatch({ laneDir, harness, model, briefPath, projectDir, timeoutSeconds }) {
  const adapter = ADAPTERS[harness]
  if (!adapter) {
    throw new Error(`Bilinmeyen harness: ${harness} — mevcut: ${availableHarnesses().join(", ")}`)
  }
  if (!fs.existsSync(laneDir)) throw new Error(`Lane dizini yok: ${laneDir}`)

  const briefFile = briefPath || path.join(laneDir, "brief.md")
  if (!fs.existsSync(briefFile)) throw new Error(`Brief yok: ${briefFile}`)
  const brief = fs.readFileSync(briefFile, "utf8")

  const config = loadConfig(projectDir || laneDir)
  const timeout = (timeoutSeconds || config.defaults.timeout_seconds) * 1000
  const spawnCwd =
    projectDir && fs.existsSync(projectDir) ? projectDir : laneDir
  const { cmd, args } = adapter.command({ brief, model, config })
  const env = adapter.env(process.env)

  appendEvent(laneDir, "dispatch", { harness, model })

  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: spawnCwd, env })
    let stdout = ""
    let stderr = ""
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGTERM")
      setTimeout(() => child.kill("SIGKILL"), 5000)
    }, timeout)

    child.stdout.on("data", (d) => (stdout += d))
    child.stderr.on("data", (d) => (stderr += d))

    child.on("error", (err) => {
      clearTimeout(timer)
      appendEvent(laneDir, "blocked", { reason: String(err) })
      resolve({ status: "BLOCKED", error: String(err) })
    })

    child.on("close", (code) => {
      clearTimeout(timer)
      if (timedOut) {
        appendEvent(laneDir, "blocked", { reason: `timeout ${timeout / 1000}s` })
        resolve({ status: "BLOCKED", error: `Timeout ${timeout / 1000}s`, stdoutTail: tail(stdout) })
        return
      }
      if (code !== 0 && !stdout.trim()) {
        appendEvent(laneDir, "blocked", { reason: `exit ${code}`, stderrTail: tail(stderr) })
        resolve({ status: "BLOCKED", error: `Exit kodu ${code}`, stderrTail: tail(stderr) })
        return
      }
      const result = adapter.parse(stdout, stderr)
      appendEvent(laneDir, result.ok ? "update" : "blocked", { exit: code })
      const reportFile = path.join(laneDir, "report.md")
      const written = fs.existsSync(reportFile) ? fs.readFileSync(reportFile, "utf8").trim() : ""
      const report = written || result.summary
      resolve({
        status: result.ok ? "DONE" : "DONE_WITH_CONCERNS",
        report,
        stdoutTail: tail(stdout),
        stderrTail: tail(stderr),
      })
    })
  })
}

function tail(s, n = 2000) {
  const t = s.trim()
  return t.length > n ? "…" + t.slice(-n) : t
}
