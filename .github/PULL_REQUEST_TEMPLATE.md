## Description

<!-- Provide a brief, clear summary of what this PR introduces or fixes. -->

## Iron Laws & Quality Checklist

Please confirm your PR complies with Taskard's non-negotiable core principles:

- [ ] **Zero-Runtime in Core:** No runtime orchestration code is added to `skills/`, `agents/`, or `templates/`.
- [ ] **Explicit Role Name:** If a new role was added in `agents/`, YAML frontmatter includes mandatory `name:`, `model:`, `color:`, and `description:`.
- [ ] **Point-to-Range Standard:** No code snippets or functions are copied into briefs; file path and line pointers are preserved.
- [ ] **No Vendored Skills:** External skills are referenced in `docs/dependencies.md` rather than copied into the repo.
- [ ] **No Dogfooding / Private Names:** No private project names, internal URLs, or credentials exist in docs, examples, or tests.
- [ ] **Documentation Sync:** Both `README.md` and `README.tr.md` have been updated to reflect any workflow, command, or config changes.
- [ ] **Validation Passed:** `npm test` (`node test/validate.js`) and `bash -n install.sh` pass cleanly with zero errors.

## Testing & Evidence

<!-- Paste output of npm test or relevant eval scenario results. -->

```bash
$ npm test
```
