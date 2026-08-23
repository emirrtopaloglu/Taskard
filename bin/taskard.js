#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { dispatch, availableHarnesses } from "../src/dispatch.js"
import { appendEvent, readEvents } from "../src/events.js"

const [, , command, ...rest] = process.argv

async function main() {
  const flags = parseFlags(rest)
  if (command === "dispatch") return cmdDispatch(flags)
  if (command === "lane") return cmdLane(flags, rest)
  if (command === "status") return cmdStatus(flags)
  usage()
}

function parseFlags(args) {
  const out = { _: [] }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith("--")) {
      const next = args[i + 1]
      if (next === undefined || next.startsWith("--")) out[a.slice(2)] = true
      else {
        out[a.slice(2)] = next
        i++
      }
    } else out._.push(a)
  }
  return out
}

async function cmdDispatch(f) {
  if (!f.lane) throw new Error("--lane gerekli")
  if (!f.harness) throw new Error(`--harness gerekli (${availableHarnesses().join(", ")})`)
  const result = await dispatch({
    laneDir: path.resolve(f.lane),
    harness: f.harness,
    model: f.model,
    briefPath: f.brief ? path.resolve(f.brief) : undefined,
    projectDir: f.project ? path.resolve(f.project) : undefined,
    timeoutSeconds: f.timeout ? Number(f.timeout) : undefined,
  })
  console.log(JSON.stringify(result, null, 2))
  if (result.status === "BLOCKED") process.exitCode = 1
}

function cmdLane(f, rest) {
  const sub = rest[0]
  if (sub !== "new") return usage()
  const slug = rest[1]
  if (!slug) throw new Error("Kullanım: taskard lane new <slug> [--base branch] [--project dir]")
  const projectDir = path.resolve(f.project || process.cwd())
  const id = `${stamp()}-${slug}`
  const laneDir = path.join(projectDir, ".taskard", "lanes", id)
  fs.mkdirSync(laneDir, { recursive: true })
  fs.writeFileSync(path.join(laneDir, "brief.md"), "# Brief\n\n(görev tanımı buraya)\n")
  fs.writeFileSync(path.join(laneDir, "worklog.md"), "")
  fs.writeFileSync(path.join(laneDir, "report.md"), "")
  appendEvent(laneDir, "created", { slug, base: f.base || null })
  console.log(laneDir)
}

function cmdStatus(f) {
  const projectDir = path.resolve(f.project || process.cwd())
  const lanesDir = path.join(projectDir, ".taskard", "lanes")
  if (!fs.existsSync(lanesDir)) return console.log("(lane yok)")
  for (const id of fs.readdirSync(lanesDir)) {
    const dir = path.join(lanesDir, id)
    if (!fs.statSync(dir).isDirectory()) continue
    const events = readEvents(dir)
    const last = events[events.length - 1]
    console.log(`${id}\t${last ? last.type : "?"}\t${last ? last.ts : ""}`)
  }
}

function stamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-")
}

function usage() {
  console.log(`taskard — çoklu-harness agent orchestration

Komutlar:
  dispatch --lane <dir> --harness <claude|codex|opencode> [--model m] [--brief p] [--project dir] [--timeout sn]
  lane new <slug> [--base branch] [--project dir]
  status [--project dir]`)
}

main().catch((err) => {
  console.error(String(err.message || err))
  process.exitCode = 1
})
