export default {
  name: "claude",
  command({ brief, model, config }) {
    const args = ["claude", "-p"]
    if (model) args.push("--model", model)
    const mode = config?.adapters?.claude?.permission_mode || "acceptEdits"
    args.push("--permission-mode", mode, "--output-format", "json", brief)
    return { cmd: args[0], args: args.slice(1) }
  },
  env(env) {
    return env
  },
  parse(stdout) {
    try {
      const parsed = JSON.parse(stdout)
      const text =
        typeof parsed.result === "string" ? parsed.result : JSON.stringify(parsed.result ?? parsed)
      return { ok: !parsed.is_error && text.trim().length > 0, summary: text }
    } catch {
      const text = stdout.trim()
      return { ok: text.length > 0, summary: text }
    }
  },
}
