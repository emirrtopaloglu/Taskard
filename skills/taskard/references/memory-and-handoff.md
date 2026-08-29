# Taskard — Memory & Handoff Standards

## 1. Personal Memory (`memory/personal.md`)
- **Write Rule:** Write only when the user explicitly declares a persistent preference or rule (e.g., *"remember this"*, *"always use pnpm"*).
- **Read Rule:** Read at session startup if the file exists.
- **Bound:** Maximum 100 lines; keep focused and bulleted.

## 2. Session Handoff (`handoff/<ts>-<topic>.md`)
- **Write Rule:** Write when concluding a session with in-progress tasks or before a long pause requiring critical decision context.
- **Required Fields:**
  - `STATUS`: Current pending state
  - `COMPLETED`: Finished steps
  - `NEXT_STEPS`: Immediate next actions for following session
  - `REJECTED`: Discarded approaches and why (mandatory)

## 3. Orientation Sequence
- **Nano:** Read target file directly.
- **Express:** Read latest `brief.md` and `git diff`.
- **Full:** Read `tasks/*.md` frontmatter -> latest lane reports -> `personal.md` -> newest `handoff/`.
