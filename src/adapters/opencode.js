const CLEAN_ENV = ["OPENCODE_SERVER_PASSWORD", "OPENCODE_SERVER_USERNAME"]

export default {
  name: "opencode",
  command({ brief, model }) {
    const args = ["opencode", "run"]
    if (model) args.push("-m", model)
    args.push(brief)
    return { cmd: args[0], args: args.slice(1) }
  },
  env(env) {
    const clean = { ...env }
    for (const key of CLEAN_ENV) delete clean[key]
    return clean
  },
  parse(stdout) {
    const text = stdout.trim()
    return { ok: text.length > 0, summary: text }
  },
}
