---
name: specify-docs
description: Manages and updates documentation in the docs/ folder. Use this to create new issue/feature documents, update issue status (e.g., pending -> in-progress -> done), or revise product/tech specs.
---

# Specify Docs Skill

This skill is responsible for maintaining the documentation in the `docs/` directory, keeping it in sync with the actual project state and implementation progress.

## 1. Operating Modes

When invoked, determine the user's intent:

### A. Update Issue Status
Use this to transition an issue's state (e.g., from `pending` to `in-progress` after `specify-prepare` is run, or `in-progress` to `done` after implementation).
1. Locate the target issue file in `docs/issues/**/*.md`.
2. Use the `replace` tool to update the `status:` field in the YAML frontmatter or the status badge/text in the markdown body.
3. Commit the change with a message like `docs: update <issue-id> status to <new-status>`.

### B. Add/Create Documentation
Use this to translate user ideas into formal documentation.
1. Determine the appropriate location (e.g., `docs/issues/phase-X/` for actionable issues, `docs/` for general specs).
2. Create the markdown file using `write_file`.
3. Include standard frontmatter (ID, title, status: pending).
4. Commit the new document.

### C. Revise Documentation
Use this to update the content of existing specifications based on architectural decisions or new constraints.
1. Read the target document.
2. Apply the requested changes using `replace` or `write_file`.
3. Commit the changes.

## 2. Guidelines
- Always ensure markdown is well-formatted.
- Preserve existing YAML frontmatter fields when updating.
- Keep commit messages prefixed with `docs: `.
