# Taskard — Project Setup Guide

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
