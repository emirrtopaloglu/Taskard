# Taskard — Project Setup Guide

The CLI requires Node.js 18 or newer and has no external Node runtime dependencies. Git is required only when an installer needs to clone the repository; a local checkout can be installed without a network fetch.

Follow these steps to initialize Taskard in a new repository:

## 1. Directory Tree
Create the `.taskard/` structure in the project root:

```bash
mkdir -p .taskard/{context/specs,context/decisions,lanes,tasks,handoff,memory,tmp}
```

## 2. Directive Block
Add the static Taskard directive block to the project's `CLAUDE.md` and/or `AGENTS.md`.
Source template: `~/.taskard/templates/directive-block.md`

Include the enclosing markers verbatim:
`<!-- taskard:start -->` ... `<!-- taskard:end -->`

## 3. Gitignore
Add runtime directories to `.gitignore` to prevent committing runtime states:

```gitignore
.taskard/lanes/
.taskard/tmp/
```

Configuration and harness profiles are read as data. Installation may copy templates and add supported harness files, but no workflow mutates configuration at runtime. The default installer leaves optional external skills unchanged; request global resolution explicitly with `./install.sh --global --install-skills`. Review `references/cross-harness.md` for the tested, partial, and recipe support boundaries.
