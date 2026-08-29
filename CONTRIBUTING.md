# Contributing to Taskard

Thank you for your interest in contributing to **Taskard**! Taskard is a zero-runtime multi-agent orchestration convention package designed for developer CLI harnesses (Claude Code, OpenCode, Codex, Antigravity, Cursor).

---

## 🏛️ Core Principles & Iron Laws

Before submitting a pull request, please review and adhere to our non-negotiable architectural principles:

1. **Zero Runtime in Core:** The core package contains **no runtime orchestration code**. Taskard is a pure convention package composed of markdown instructions, YAML frontmatter, and configuration templates (`skills/`, `agents/`, `templates/`).
2. **Explicitly Named Roles:** Anonymous subagents are strictly forbidden. Every delegate must be an explicitly named role. When proposing or defining an agent role in `agents/<name>.md`, the frontmatter must include:
   ```yaml
   ---
   name: your-role-name
   color: blue | purple | cyan | green | yellow | red | orange
   model: sonnet | opus | haiku
   description: One or two sentence precise contract of what this role does and doesn't do.
   ---
   ```
3. **Point-to-Range Brief Standard:** Briefs must **never** contain raw code snippets or copy-pasted function bodies. They must specify file paths with line ranges (e.g., `## Context Files: src/auth/session.ts#L40-L65`) so subagents read only the required slice.
4. **No Vendoring External Skills:** Do not copy or vendor third-party skills into this repository. External skills are referenced dynamically in `docs/dependencies.md` and resolved at install time via `npx skills`.
5. **No Private Project Names:** Never commit private dogfooding project names or internal credentials in documentation, tests, or examples. Use generic terms like "test project".
6. **Keep Documentation Synchronized:** Any change to a skill, agent role, config schema, or workflow **MUST** be reflected in both `README.md` and `README.tr.md`.
7. **Run Evals Before Proposing Changes:** If you modify doctrine or add an agent role, verify behavior against the scenarios in `evals/` (e.g., `evals/05-agent-roloji.md`).

---

## 🛠️ How to Contribute

### 1. Proposing a New Agent Role
We keep our default role roster lean (currently 7 roles: `planner`, `implementer`, `reviewer`, `debugger`, `ui-developer`, `explorer`, `qa-tester`). If you believe a missing capability warrants a new named role:
- Open an issue using the **🎭 New Role Proposal** template.
- Explain why the task cannot be achieved by a skill discipline routed to an existing role (e.g., stack roles like `backend-developer` are avoided in favor of `implementer` + skill router).
- Include the proposed YAML frontmatter and strict input/output contract (≤15 line `report.md`).
- Add a corresponding micro-eval scenario in `evals/`.

### 2. Improving Skills & Doctrine
- Skill changes live in `skills/taskard/SKILL.md`.
- Deep reference documents belong in `skills/taskard/references/` to preserve token efficiency via progressive disclosure.
- Ensure all rules follow the 3-speed gear system (⚡ Nano, 🚀 Express, 🏛️ Full).

### 3. CLI & Distribution (`bin/taskard.js`, `install.sh`)
- Taskard's CLI initializer (`bin/taskard.js`) is strictly **zero external runtime dependencies** (uses Node.js standard libraries only).
- Test shell scripts with `bash -n install.sh`.
- Test CLI syntax with `node --check bin/taskard.js`.

---

## 🧪 Local Verification

Before creating a pull request, run the following verification checks:

```bash
# 1. Shell syntax verification
bash -n install.sh

# 2. Node CLI syntax verification
node --check bin/taskard.js

# 3. CLI dry-run
node bin/taskard.js --help
node bin/taskard.js init --dry-run
```

---

## 📜 Pull Request Process

1. Fork the repository and create your feature branch: `git checkout -b feature/my-new-feature`.
2. Commit your changes following conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`).
3. Ensure both `README.md` and `README.tr.md` are updated if user-facing behavior changed.
4. Open a Pull Request referencing any related issues.
5. All CI checks must pass before merging.

Thank you for building the future of zero-runtime multi-agent engineering! 🚀
