# External Skill Dependencies

Taskard **does not vendor** external skills into the repository. It references skills installed on your system. When upstream packages update, your system receives the latest improvements automatically with zero synchronization overhead. The installer resolves missing packages via `npx skills`.

Upstream Sources: [obra/superpowers](https://github.com/obra/superpowers) · [mattpocock/skills](https://github.com/mattpocock/skills)

*(Note: `test-driven-development` and `verification-before-completion` contracts are embedded natively into the `implementer` role; they do not require external skill loading.)*

---

## Discipline Routing Table

| Skill | Upstream Source | Trigger Condition | Fallback (If Absent) |
|---|---|---|---|
| `using-superpowers` | superpowers | Workflow entry point | Consult SKILL.md router table |
| `brainstorming` | superpowers | Creative/feature addition | Proceed with compact specification |
| `grilling` | mattpocock | High-risk alignment | Question assumptions directly |
| `grill-with-docs` | mattpocock | Product decisions (project-context; CONTEXT.md/ADR -> `.taskard/context/`) | Fall back to `grilling` |
| `grill-me` | mattpocock | Product decisions (conceptual / repo-external) | Fall back to `grilling` |
| `domain-modeling` | mattpocock | Terminology / ADR capture during grilling | Manually record terms in CONTEXT.md |
| `wayfinder` | mattpocock | Multi-session task with ambiguous scope | Decompose task into standard gears |
| `writing-plans` | superpowers | Standard plan generation | Decompose spec directly into briefs |
| `codebase-design` | mattpocock | Interface seam discussions | Write modularity principles into brief |
| `subagent-driven-development` | superpowers | Standard delegate execution loop | Taskard native lane/gate flow suffices |
| `executing-plans` | superpowers | Inline plan execution | Execute lanes sequentially |
| `dispatching-parallel-agents` | superpowers | ≥2 independent lanes (Full mode) | Sequential lane execution |
| `using-git-worktrees` | superpowers | Worktree lane isolation | Single checkout execution |
| `resolving-merge-conflicts` | superpowers | Worktree merge conflicts | Escalate conflict to human |
| `requesting-code-review` | superpowers | Review calibration (reviewer agent) | Embedded review criteria |
| `receiving-code-review` | superpowers | Applying review findings | Verify-then-apply rule in SKILL.md |
| `systematic-debugging` | superpowers | 2nd failure diagnosis (Circuit Breaker) | Prompt root-cause questions |
| `finishing-a-development-branch` | superpowers | Post-green merge menu | Escalate merge decision to human |
| `improve-codebase-architecture` | mattpocock | Periodic codebase maintenance | Manual request |

---

## Role-Specific Additional Skills

The following skills are referenced in **agent role contracts**. If installed, delegates utilize them dynamically:

| Skill | Associated Role | Source |
|---|---|---|
| `web-design-guidelines` | `reviewer` (UI diff), `ui-developer` (self-check) | Vercel Skill Collection |
| `security-review` | `reviewer` (security-sensitive diffs) | Anthropic Skill Collection |
| `diagnosing-bugs` | `debugger` | obra/superpowers |
| `find-docs` | `explorer` | Local installation |
| `webapp-testing` · `agent-browser` | `qa-tester` (web runtime verification) | Local installation |
| `frontend-design` | `ui-developer` (web) | Anthropic Claude Code plugin |
| `expo-*` (`native-ui`, `router`, `data-fetching`, `ui`, `tailwind-setup`) | `ui-developer` (mobile) | Expo OSS Collection |

---

## Installation

Automatic installation:
```bash
./install.sh   # installs missing packages via npx skills
```

Manual installation:
```bash
npx skills add obra/superpowers --global
npx skills add mattpocock/skills --global
```
