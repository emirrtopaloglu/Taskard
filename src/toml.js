export function parseTOML(text) {
  const root = {}
  let current = root
  for (const rawLine of text.split(/\r?\n/)) {
    const line = stripComment(rawLine).trim()
    if (!line) continue
    if (line.startsWith("[")) {
      const name = line.replace(/^\[+/, "").replace(/\]+$/, "").trim()
      current = getSection(root, name)
      continue
    }
    const eq = line.indexOf("=")
    if (eq === -1) continue
    const key = line
      .slice(0, eq)
      .trim()
      .replace(/^["']|["']$/g, "")
    current[key] = parseValue(line.slice(eq + 1).trim())
  }
  return root
}

function getSection(root, name) {
  let node = root
  for (const part of name.split(".")) {
    if (typeof node[part] !== "object" || node[part] === null) node[part] = {}
    node = node[part]
  }
  return node
}

function stripComment(line) {
  let out = ""
  let inStr = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"' && line[i - 1] !== "\\") inStr = !inStr
    if (ch === "#" && !inStr) break
    out += ch
  }
  return out
}

function parseValue(raw) {
  const v = raw.trim()
  if (v.startsWith("[")) return parseArray(v)
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
    return v
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
  if (v === "true") return true
  if (v === "false") return false
  if (/^-?\d+$/.test(v)) return parseInt(v, 10)
  if (/^-?\d*\.\d+$/.test(v)) return parseFloat(v)
  return v
}

function parseArray(v) {
  const inner = v.slice(1, v.lastIndexOf("]")).trim()
  if (!inner) return []
  const items = []
  let buf = ""
  let depth = 0
  let inStr = false
  let quote = ""
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (inStr) {
      buf += ch
      if (ch === quote) inStr = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inStr = true
      quote = ch
      buf += ch
      continue
    }
    if (ch === "[") depth++
    if (ch === "]") depth--
    if (ch === "," && depth === 0) {
      items.push(buf.trim())
      buf = ""
      continue
    }
    buf += ch
  }
  if (buf.trim()) items.push(buf.trim())
  return items.map(parseValue)
}
