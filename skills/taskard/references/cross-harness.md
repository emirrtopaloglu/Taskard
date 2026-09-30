# Cross-Harness Support

Taskard profiles are declarative data in `templates/harness-profiles.json`. They describe install scope, model inheritance, and native permission fields; they are not a runtime adapter. Support levels report repository coverage, not universal compatibility:

- **tested** — deterministic local installer or profile fixture checks cover the declared integration. This does not mean live agent behavior was tested.
- **partial** — a shared skill or project directive is installed, but native role export or permission setup is not covered.
- **recipe** — follow the documented convention manually; no native install integration is claimed.

| Harness | Level | What this repository covers | Read-only roles | Model selection |
|---|---|---|---|---|
| Claude Code | tested | User skill/agent links and install-time role profile output are covered by deterministic package checks. | Reviewer and explorer use a positive `tools` allowlist. | Role aliases use the selected Claude model family unless a session overrides them. |
| OpenCode | tested | Agent export, `mode: subagent`, color mapping, and permission profile output are covered by deterministic package checks. | Reviewer and explorer deny all tools except documented read/search tools. | Optional full `provider/model` values in `[harness_preferences.models.opencode]`; otherwise use the selected provider's model. |
| Codex | partial | Shared skill and project directive are available; native role export and read-only profiles are not covered. | Instruction only; use the harness's own permission controls. | Session or selected-provider model. |
| Antigravity | recipe | Use the shared conventions and project instructions manually. | Instruction only; no native profile is claimed. | Harness-selected model. |
| Cursor | recipe | Use the shared conventions and project instructions manually. | Instruction only; no native profile is claimed. | Harness-selected model. |

The tested labels cover deterministic installer/profile fixtures only. No live agent runs, current model availability checks, or comparative benchmarks are included. A harness may change its format after these checks; review its current native permissions before relying on a profile.

Model aliases such as `sonnet`, `opus`, and `haiku` are defaults, not immutable provider identifiers. Session instructions take precedence. Taskard does not automatically switch harnesses, choose a paid fallback, or mutate configuration at runtime.
