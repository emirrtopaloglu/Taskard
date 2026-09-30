# External Skills and Harness Support

Taskard does not vendor external skills. `docs/dependencies.md` records optional upstream skill sources and the role triggers that may use them. The default installer leaves external skills unchanged. Explicit global skill resolution may use `npx skills`; external skills remain independently maintained and can change outside Taskard releases.

Upstream sources: [obra/superpowers](https://github.com/obra/superpowers) · [mattpocock/skills](https://github.com/mattpocock/skills).

## Skill Routing

| Skill | Source | Trigger | Fallback when absent |
|---|---|---|---|
| `using-superpowers` | superpowers | Workflow entry, when installed | Use the Taskard workflow table |
| `brainstorming` | superpowers | Unclear product scope or creative work | Write a compact specification |
| `grilling` | mattpocock | High-risk assumptions need alignment | Ask focused questions and record decisions |
| `domain-modeling` | mattpocock | Terminology or domain boundaries are unclear | Record terms in the spec |
| `writing-plans` | superpowers | Max plan or lane breakdown | Write concise actionable briefs |
| `codebase-design` | mattpocock | A real architectural seam must be decided | Record the seam and constraints |
| `dispatching-parallel-agents` | superpowers | Two or more independent lanes | Run lanes sequentially |
| `using-git-worktrees` | superpowers | Independent work needs isolation | Use the repository's available isolation |
| `receiving-code-review` | superpowers | Review feedback arrives | Verify each finding before changing code |
| `systematic-debugging` | superpowers | Root cause remains unclear | Trace callers and reproduce the defect |
| `finishing-a-development-branch` | superpowers | Work is complete and a human must choose next steps | Present the available choices |

Role-specific optional skills are selected only when their documented trigger applies. A missing optional skill does not prevent a task from following the native TDD, evidence, review, or QA contracts in `agents/`.

## Harness Compatibility

| Harness | Status | Boundary |
|---|---|---|
| Claude Code | **tested** | Package checks cover installer/profile output, including native reviewer/explorer allowlists. Live agent behavior is untested. |
| OpenCode | **tested** | Package checks cover role export, `mode: subagent`, and read-only permission output. Live agent behavior is untested. |
| Codex | **partial** | Shared skill/project instructions are available; native role export and read-only setup are not covered. |
| Antigravity | **recipe** | Use the conventions through project instructions; no native installer integration is claimed. |
| Cursor | **recipe** | Use the conventions through project instructions; no native installer integration is claimed. |

The complete model and permission profile data is in [`templates/harness-profiles.json`](../templates/harness-profiles.json); support semantics and caveats are in [`cross-harness.md`](../skills/taskard/references/cross-harness.md). “Tested” refers to deterministic local installer or fixture checks only. It does not mean live agent tests, verified model availability, or a comparative benchmark.

## Install Optional Skills

```bash
./install.sh --global --install-skills
```

The install script requires Git only when it must clone the repository from a remote source. By default it installs Taskard without touching optional external skills. The explicit `--install-skills` flag may use the network and writes to global skill directories. Resolution is non-interactive, has a 30-second timeout per package, and checks for the expected user skill paths. A resolution failure is reported as a partial result while the core install completes; default installs and dry runs make no optional-skill network request. Project installs reject this flag because it writes to user-level directories. To install upstream skill collections manually:

```bash
npx skills add obra/superpowers --global
npx skills add mattpocock/skills --global
```
