export default {
  name: "codex",
  command({ brief, model }) {
    const args = ["codex", "exec", "--json", "--skip-git-repo-check"]
    if (model) args.push("-m", model)
    args.push(brief)
    return { cmd: args[0], args: args.slice(1) }
  },
  env(env) {
    return env
  },
  parse(stdout) {
    let last = ""
    for (const line of stdout.split("\n")) {
      const t = line.trim()
      if (!t.startsWith("{")) continue
      try {
        const ev = JSON.parse(t)
        const msg =
          ev.msg ||
          ev.message ||
          ev.text ||
          (ev.item && (ev.item.text || ev.item.content)) ||
          (ev.type === "agent_message" ? ev.message ?? "" : "")
        if (typeof msg === "string" && msg.trim()) last = msg
      } catch {}
    }
    if (!last) last = stdout.trim()
    return { ok: last.length > 0, summary: last }
  },
}
