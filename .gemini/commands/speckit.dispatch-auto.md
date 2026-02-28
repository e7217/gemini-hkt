---
description: Auto-discover unimplemented features from docs/ and prepare them in parallel using isolated git worktrees. Scans for pending issues and requirements, presents candidates for user confirmation, then runs speckit.prepare for each.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command automatically discovers unimplemented features from project documentation and runs the full `speckit.prepare --auto` pipeline for each confirmed feature in parallel, using isolated git worktrees.

**Workflow**: Scan docs → Filter unimplemented → Present candidates → User confirms → Parallel dispatch → Unified report

---

## Step 1: Discover Feature Candidates

Scan the project documentation to find features that haven't been implemented or specified yet.

### 1.1 Primary scan: `docs/issues/` directory

If `docs/issues/` exists, glob `docs/issues/**/*.md` (exclude `__init__.md` and `index.md`).

For each file, parse:
- **ID**: First heading pattern `# [ID]` or filename (e.g., `BE-04`, `FE-01`)
- **Title**: First H1 heading after the ID
- **Status**: The value after `**상태**:` or `status:` in the file (case-insensitive)
- **Phase**: Value after `**Phase**:` if present
- **Scope**: First 3 bullet points from a `## 구현 범위` or `## Implementation` or `## Scope` section

A file is a **feature candidate** if:
- Status is `pending`, `todo`, `planned`, `미구현`, or status field is absent

A file is **excluded** if:
- Status is `in-progress`, `진행중`, `done`, `completed`, `완료`, `closed`
- Filename matches an existing `specs/` subdirectory (already specified)

### 1.2 Secondary scan: `docs/**/*.md` (non-issue docs)

For any `docs/**/*.md` file that is NOT in `docs/issues/`:
- Skip `docs/__init__.md`, `docs/index.md`, `docs/**/index.md`
- Scan for "backlog-style" sections: headings or list items preceded by `TODO`, `PLANNED`, `미구현`, `예정`, `- [ ]` at section level
- These produce lower-confidence candidates (mark as `source: "docs"` vs `source: "issues"`)

### 1.3 Cross-reference with `specs/`

If `specs/` directory exists:
- List all `specs/*/` subdirectory names
- If a candidate's ID or title closely matches an existing spec directory, mark as `already_specified: true` and exclude it

### 1.4 Sort and limit

Sort candidates:
1. By Phase number (Phase 1 first)
2. Within same phase: by ID / filename order

If more than 15 candidates found, show top 15 (by phase and priority order) and note that more exist.

---

## Step 2: Present Candidates to User

Output the discovered feature candidates for user confirmation before dispatching:

```
## 🔍 Auto-Discovered Features

Scanned N doc files. Found M pending feature candidates.

| # | ID | Title | Phase | Source | Description |
|---|----|-------|-------|--------|-------------|
| 1 | FE-01 | 목표 입력 화면 UI | Phase 1 | issues | 목표 텍스트 입력 필드, "경로 생성하기" 버튼, 로딩 상태 UI |
| 2 | BE-04 | Gemini SDK 세팅 + 래퍼 유틸 | Phase 1 | issues | @google/genai 설치, JSON mode 설정, 에러핸들링 래퍼 |
| 3 | ... | ... | ... | ... | ... |

---
Which features would you like to dispatch?

- Type `all` to dispatch all N features
- Type numbers separated by commas (e.g., `1,2,5`) to select specific features
- Type `1-5` for a range
- Type `stop` to cancel
```

Wait for user response.

### Parsing user selection

- `all` → select all candidates
- `1,3,5` → select features at those positions
- `1-4` → select positions 1 through 4
- `1-3,5,7` → mixed range and individual
- `stop` → exit with message "Dispatch cancelled."

If selected count < 1: "No features selected. Run again and select at least one feature."
If selected count > 5: Process in sequential batches of 5 (note this to the user).

---

## Step 3: Build Feature Descriptions

For each selected candidate, construct a feature description string for `speckit.prepare`:

**For `source: "issues"` candidates**:
```
[ID] Title: Scope item 1, scope item 2, scope item 3
```
Example: `FE-01 목표 입력 화면 UI: 목표 텍스트 입력 필드, "경로 생성하기" 버튼, 로딩 상태 UI, 랜덤 목표 버튼 🎲`

**For `source: "docs"` candidates**:
Use the section title and first 2-3 bullet points as the description.

---

## Step 4: Parallel Execution

Same as `speckit.dispatch` Step 3. For each batch of up to 5 selected features:

For each feature, spawn one agent with the Task tool:
- **subagent_type**: `general-purpose`
- **isolation**: `"worktree"`
- **prompt**: (same template as `speckit.dispatch`)

```
You are running the speckit.prepare pipeline for a single feature in an isolated git worktree.

Feature description: "<FEATURE_DESCRIPTION>"

Use the Skill tool to invoke the `speckit.prepare` skill with the following arguments:
  --auto <FEATURE_DESCRIPTION>

The `--auto` flag means:
- All checkpoints are automatically approved (do NOT wait for user input at any checkpoint)
- Clarify phase automatically selects recommended options
- Constitution violations are noted as warnings but do NOT block execution

Follow all steps in the speckit.prepare skill exactly. Proceed through all phases autonomously.

When the pipeline is complete, return a JSON result in this exact format (wrap it in a markdown code block labeled json):
{
  "feature": "<FEATURE_DESCRIPTION>",
  "status": "SUCCESS" | "FAILED" | "BLOCKED",
  "branch": "<BRANCH_NAME or null>",
  "feature_dir": "<FEATURE_DIR or null>",
  "artifacts": {
    "spec": true | false,
    "plan": true | false,
    "tasks": true | false,
    "analysis": true | false
  },
  "task_count": N,
  "analysis_summary": {
    "critical": N,
    "high": N,
    "medium": N,
    "low": N
  },
  "readiness": "READY" | "NEEDS ATTENTION" | "BLOCKED",
  "errors": ["<error message if any>"],
  "warnings": ["<warning message if any>"]
}
```

---

## Step 5: Collect Results and Report

Same as `speckit.dispatch` Steps 4–5. Generate a unified dispatch report after all agents complete.

Additionally, include a **Doc Coverage** section:

```
### Doc Coverage

| Issue ID | Title | Dispatched | Branch |
|----------|-------|------------|--------|
| FE-01 | 목표 입력 화면 UI | ✅ | 001-goal-input-ui |
| BE-04 | Gemini SDK 세팅 | ✅ | 002-gemini-sdk |
| FE-02 | 다크 테마 | ⏭️ Skipped by user | - |
| BE-05 | 프롬프트 엔지니어링 | - Pending | - |

**Total unimplemented issues**: N
**Dispatched this run**: M
**Remaining pending**: N-M
```

---

## Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| `docs/` does not exist | ERROR: "No docs/ directory found. Use /speckit.dispatch to provide features manually." |
| No pending features found | "All features in docs/ appear to be implemented or in-progress. Nothing to dispatch." |
| `docs/issues/` absent but `docs/` exists | Fall back to secondary scan of all docs |
| User selects `all` with > 5 features | Process in sequential batches of 5 |
| Feature description too vague (short title only) | Use full scope from the issue file to enrich description |
| `specs/` not found | Skip cross-reference filtering; note this |
| Issue file has no status field | Treat as `pending` (assume not started) |
| Agent fails for one feature | Mark BLOCKED in report; continue others |
| Already-specified features appear | List them separately in a "Already Specified" section in the report |

## Design Notes

- **Separation from `speckit.dispatch`**: This skill handles auto-discovery. Use `speckit.dispatch "desc1" "desc2"` for explicit feature lists.
- **User confirmation required**: Unlike `speckit.dispatch`, this skill always shows candidates and waits for confirmation before launching. The scope of "auto" is the *discovery*, not the approval.
- **Rich descriptions**: Feature descriptions are enriched with scope details from the issue file to give `speckit.prepare`'s Phase 0 a better starting point.
- **Issue structure agnostic**: The primary heuristic works for any issue format using status markers. The specific `docs/issues/` structure of this project is the happy path, not a hard requirement.
