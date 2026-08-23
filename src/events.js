import fs from "node:fs"
import path from "node:path"

export function appendEvent(laneDir, type, data = {}) {
  const file = path.join(laneDir, "events.jsonl")
  const event = { ts: new Date().toISOString(), type, ...data }
  fs.appendFileSync(file, JSON.stringify(event) + "\n")
  return event
}

export function readEvents(laneDir) {
  const file = path.join(laneDir, "events.jsonl")
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}
