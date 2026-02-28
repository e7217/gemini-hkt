---
description: Run the full pre-implementation pipeline (discover docs -> specify -> clarify -> plan -> tasks -> analyze) with user checkpoints between each phase.
handoffs:
  - label: Start Implementation
    agent: speckit.implement
    prompt: Start the implementation in phases
  - label: Create GitHub Issues
    agent: speckit.taskstoissues
    prompt: Convert tasks to GitHub issues
  - label: Dispatch Multiple Features
    agent: speckit.dispatch
    prompt: Prepare multiple features in parallel
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command orchestrates the full pre-implementation pipeline for a single feature in sequence:

**Phase 0: Discovery** → **Phase 1: Specify** → **[CHECKPOINT 1]** → **Phase 2: Clarify** → **[CHECKPOINT 2]** → **Phase 3: Plan** → **[CHECKPOINT 3]** → **Phase 4: Tasks** → **[CHECKPOINT 4]** → **Phase 5: Analyze** → **Final Report**

The pipeline stops after analysis. It does **not** proceed to implementation.

### `--auto` Mode

If `$ARGUMENTS` contains the `--auto` flag:
- All checkpoints are automatically approved without waiting for user input
- Clarify phase automatically selects recommended options
- Only the Final Report is returned at the end
- **This mode is exclusively for `speckit.dispatch` integration. Do NOT use directly unless you understand the implications.**

Extract the feature description by removing `--auto` from `$ARGUMENTS` before processing.

---

## Phase 0: Project Context Discovery

Goal: Build a `PROJECT_CONTEXT` object used by all subsequent phases. This phase is read-only and produces no files.

### 0.1 Load Project Constitution

Load `.specify/memory/constitution.md` if it exists. If missing, set `CONSTITUTION_AVAILABLE = false` and warn:
> ⚠️ Warning: `.specify/memory/constitution.md` not found. Constitution Check in Phase 3 will be skipped.

### 0.2 Discover and Load Documentation

1. Glob `docs/**/*.md` (exclude `docs/**/__init__.md` and `docs/**/index.md`).
2. If `docs/` directory does not exist:
   > ⚠️ Warning: `docs/` directory not found. Proceeding with feature description only.
   > Set `DOCS_AVAILABLE = false` and skip to 0.3.
3. If more than 50 files matched:
   > ⚠️ Warning: Found N docs files. Processing only the 30 most recently modified.
   > Sort by modification time descending, take top 30.
4. For each doc file, extract a structured summary:
   - **Title**: First H1 heading or filename
   - **Key Concepts**: Bullet list of domain terms, entities, features mentioned
   - **Technology Stack References**: Frameworks, languages, databases, services detected
   - **Entities**: Data models, classes, schemas referenced
   - **Requirements/Constraints**: Must/should/must-not statements found

### 0.3 Build PROJECT_CONTEXT

Synthesize all gathered information into an internal `PROJECT_CONTEXT` object with these fields:

```
PROJECT_CONTEXT = {
  feature_description: "<cleaned input without --auto>",
  docs_available: true|false,
  constitution_available: true|false,
  constitution_summary: "<core principles extracted>",
  tech_stack: ["<detected technologies>"],
  domain_entities: ["<key entities found across docs>"],
  key_concepts: ["<domain terms and concepts>"],
  constraints: ["<explicit requirements/constraints from docs>"],
  doc_count: N,
  doc_files_processed: ["<list of paths>"]
}
```

This object is passed implicitly to all subsequent phases. Do not output it to the user.

---

## Phase 1: Specify

Reference: `speckit.specify.md` steps 1–7

### 1.1 Generate branch short name

Analyze `PROJECT_CONTEXT.feature_description` and create a 2–4 word hyphenated short name.
- Use action-noun format when possible
- Preserve technical terms

### 1.2 Check existing branches

```bash
git fetch --all --prune
git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'
git branch | grep -E '^[* ]*[0-9]+-<short-name>$'
```

Also check `specs/` for existing directories. Find the highest N and use N+1.

### 1.3 Create feature branch and spec directory

```bash
.specify/scripts/bash/create-new-feature.sh --json "<feature_description>" --number N+1 --short-name "<short-name>"
```

Parse JSON output for:
- `BRANCH_NAME`
- `SPEC_FILE`
- `FEATURE_DIR`

### 1.4 Load spec template

Load `.specify/templates/spec-template.md`.

### 1.5 Generate spec.md

Using `PROJECT_CONTEXT` (tech stack, entities, constraints) and the spec template:
- Fill all mandatory sections
- Use `PROJECT_CONTEXT.domain_entities` to populate the data model section
- Use `PROJECT_CONTEXT.constraints` to inform non-functional requirements
- Use `PROJECT_CONTEXT.tech_stack` to provide context (but keep spec technology-agnostic)
- Maximum 3 `[NEEDS CLARIFICATION]` markers for truly ambiguous decisions

Write to `SPEC_FILE`.

### 1.6 Validate spec quality

Run quality validation as defined in `speckit.specify.md` step 6:
- Create `FEATURE_DIR/checklists/requirements.md`
- Check all quality criteria (max 3 iterations)
- If `[NEEDS CLARIFICATION]` markers remain:
  - In **interactive mode**: Present questions with suggested answers and wait for user response
  - In **`--auto` mode**: Automatically select the recommended option for each question; log choices

### CHECKPOINT 1

**In `--auto` mode**: Skip, auto-approve.

**In interactive mode**, output:

```
## ✅ Checkpoint 1: Spec Created

**Branch**: <BRANCH_NAME>
**Spec file**: <SPEC_FILE>

### Spec Summary
<3-5 bullet summary of what was specified>

### Context Applied from docs/
- Tech stack detected: <list or "none">
- Domain entities incorporated: <list or "none">
- Constraints applied: <count> items

### Quality Checklist
<pass/fail summary>

---
Type `continue` to proceed to Clarify, `skip` to skip Clarify and go to Plan, or `stop` to end here.
```

Wait for user response. On `stop`, output Final Report and exit.

---

## Phase 2: Clarify

Reference: `speckit.clarify.md` steps 1–8

### 2.1 Load prerequisites

```bash
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
```

Parse `FEATURE_DIR` and `FEATURE_SPEC`.

### 2.2 Ambiguity scan

Perform structured ambiguity scan across 11 taxonomy categories (see `speckit.clarify.md` step 2). Cross-reference `PROJECT_CONTEXT` to:
- Mark as "Clear" any category already addressed by docs context
- Only flag categories where docs context doesn't resolve the ambiguity

### 2.3 Generate clarification questions

Generate prioritized queue of up to 5 questions. Each question must:
- Have concrete recommended answer based on `PROJECT_CONTEXT` and best practices
- Only cover what docs context hasn't already resolved

**In `--auto` mode**:
- For each question in the queue: automatically select the recommended option
- Apply all clarifications to spec.md without user interaction
- Log: `[AUTO] Q: <question> → A: <recommended answer>`
- Proceed directly to Checkpoint 2

**In interactive mode**:
- Follow `speckit.clarify.md` step 4 sequential questioning loop
- Present one question at a time with recommended option prominently shown

### 2.4 Apply clarifications

Update `FEATURE_SPEC` with answers (following `speckit.clarify.md` step 5).

### CHECKPOINT 2

**In `--auto` mode**: Skip, auto-approve.

**In interactive mode**, output:

```
## ✅ Checkpoint 2: Clarification Complete

**Questions asked**: N
**Sections updated**: <list>

### Coverage Summary
| Category | Status |
|----------|--------|
| Functional Scope | Resolved / Clear / Deferred |
| Domain & Data Model | ... |
| ... | ... |

---
Type `continue` to proceed to Plan, or `stop` to end here.
```

Wait for user response. On `stop`, output Final Report and exit.
If user typed `skip` at Checkpoint 1, this checkpoint is reached with: "Clarify phase was skipped. Proceeding to Plan."

---

## Phase 3: Plan

Reference: `speckit.plan.md` steps 1–4

### 3.1 Setup plan

```bash
.specify/scripts/bash/setup-plan.sh --json
```

Parse JSON for `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`.

### 3.2 Load context

Read `FEATURE_SPEC` and `IMPL_PLAN` template. If `CONSTITUTION_AVAILABLE = true`, load constitution for Constitution Check.

### 3.3 Fill Technical Context

Using `PROJECT_CONTEXT.tech_stack` as primary source, fill the Technical Context section of `IMPL_PLAN`:
- Auto-populate known technologies from docs context
- Mark only truly unknown items as "NEEDS CLARIFICATION"
- This should result in fewer unknowns than running `speckit.plan` standalone

### 3.4 Constitution Check

If `CONSTITUTION_AVAILABLE = true`:
- Evaluate each constitution principle against the planned approach
- Flag violations as ERROR (do not proceed past violation without resolution)
- If `--auto` mode and violation detected: Log warning but continue (flag in Final Report as BLOCKED)

If `CONSTITUTION_AVAILABLE = false`:
- Note "Constitution Check skipped — constitution not found"

### 3.5 Execute plan workflow

Follow `speckit.plan.md` Phase 0 and Phase 1:
- **Phase 0 (Research)**: Generate `research.md` resolving all NEEDS CLARIFICATION items
- **Phase 1 (Design)**: Generate `data-model.md`, `contracts/`, `quickstart.md`
- Run `.specify/scripts/bash/update-agent-context.sh claude`

### CHECKPOINT 3

**In `--auto` mode**: Skip, auto-approve.

**In interactive mode**, output:

```
## ✅ Checkpoint 3: Planning Complete

**Branch**: <BRANCH>
**Plan file**: <IMPL_PLAN>

### Generated Artifacts
- ✅ research.md
- ✅ data-model.md
- ✅ contracts/ (<N> files)
- ✅ quickstart.md

### Tech Stack (from docs context + research)
<bullet list>

### Constitution Check
<PASS / FAIL with details>

---
Type `continue` to proceed to Tasks, or `stop` to end here.
```

Wait for user response. On `stop`, output Final Report and exit.

---

## Phase 4: Tasks

Reference: `speckit.tasks.md` steps 1–5

### 4.1 Setup

```bash
.specify/scripts/bash/check-prerequisites.sh --json
```

Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

### 4.2 Load design documents

Load from `FEATURE_DIR`:
- **Required**: `plan.md`, `spec.md`
- **Optional**: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

### 4.3 Generate tasks.md

Using `.specify/templates/tasks-template.md`, generate:
- **Phase 1**: Setup tasks
- **Phase 2**: Foundational tasks
- **Phase 3+**: One phase per user story (from spec.md, in priority order)
- **Final Phase**: Polish & cross-cutting concerns

All tasks must follow the strict checklist format:
```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

Write to `FEATURE_DIR/tasks.md`.

### 4.4 Validate task format

Confirm ALL tasks follow the format. Report violations.

### CHECKPOINT 4

**In `--auto` mode**: Skip, auto-approve.

**In interactive mode**, output:

```
## ✅ Checkpoint 4: Tasks Generated

**Tasks file**: <FEATURE_DIR>/tasks.md

### Task Distribution
| Phase | Task Count | Parallelizable |
|-------|-----------|----------------|
| Setup | N | - |
| Foundational | N | N [P] |
| User Story 1 | N | N [P] |
| ... | | |
| Polish | N | N [P] |
| **TOTAL** | **N** | **N** |

### MVP Scope
<Suggested minimum viable increment — typically Phase 1+2+User Story 1>

---
Type `continue` to proceed to Analysis, or `stop` to end here.
```

Wait for user response. On `stop`, output Final Report and exit.

---

## Phase 5: Analyze

Reference: `speckit.analyze.md` steps 1–8

**STRICTLY READ-ONLY**: Do not modify any files in this phase.

### 5.1 Initialize analysis

```bash
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
```

Parse paths for `spec.md`, `plan.md`, `tasks.md`.

### 5.2 Load artifacts

Progressive disclosure loading (see `speckit.analyze.md` step 2):
- From `spec.md`: Overview, Functional Requirements, Non-Functional Requirements, User Stories, Edge Cases
- From `plan.md`: Architecture/stack, Data Model, Phases, Constraints
- From `tasks.md`: Task IDs, Descriptions, Phase grouping, Parallel markers, File paths
- From constitution: Principles (if available)

### 5.3 Build semantic models

Internal representations (not output to user):
- Requirements inventory with stable keys
- Task coverage mapping
- Constitution rule set

### 5.4 Detection passes

Run all 6 detection passes:
- **A. Duplication Detection**
- **B. Ambiguity Detection**
- **C. Underspecification**
- **D. Constitution Alignment**
- **E. Coverage Gaps**
- **F. Inconsistency**

Assign severity: CRITICAL / HIGH / MEDIUM / LOW

### 5.5 Produce analysis report

Generate structured markdown report (no file writes) with:
- Findings table (Category, Severity, Location, Summary, Recommendation)
- Coverage Summary table
- Constitution Alignment Issues (if any)
- Unmapped Tasks (if any)
- Metrics (Total Requirements, Total Tasks, Coverage %, Ambiguity Count, Duplication Count, Critical Issues Count)

---

## Final Report

Output a comprehensive summary after all phases complete (or after early stop):

```
## 🏁 speckit.prepare: Pipeline Complete

**Feature**: <feature_description>
**Branch**: <BRANCH_NAME>
**Feature Directory**: <FEATURE_DIR>

### Pipeline Execution Summary

| Phase | Status | Key Output |
|-------|--------|------------|
| Phase 0: Discovery | ✅ Complete | N docs processed, M entities found |
| Phase 1: Specify | ✅ Complete | spec.md created |
| Phase 2: Clarify | ✅ Complete / ⏭️ Skipped | N questions answered |
| Phase 3: Plan | ✅ Complete | research.md, data-model.md, contracts/ |
| Phase 4: Tasks | ✅ Complete | N tasks generated |
| Phase 5: Analyze | ✅ Complete | N issues found |

### Generated Artifacts
- `<FEATURE_DIR>/spec.md`
- `<FEATURE_DIR>/checklists/requirements.md`
- `<FEATURE_DIR>/plan.md`
- `<FEATURE_DIR>/research.md`
- `<FEATURE_DIR>/data-model.md`
- `<FEATURE_DIR>/contracts/` (N files)
- `<FEATURE_DIR>/quickstart.md`
- `<FEATURE_DIR>/tasks.md`

### Analysis Results
| Severity | Count |
|----------|-------|
| CRITICAL | N |
| HIGH | N |
| MEDIUM | N |
| LOW | N |

### Readiness Assessment

**[READY / NEEDS ATTENTION / BLOCKED]**

- **READY**: No CRITICAL issues. Feature is ready for implementation.
- **NEEDS ATTENTION**: HIGH or MEDIUM issues found. Review before implementing.
- **BLOCKED**: CRITICAL issues detected. Must resolve before proceeding.

### Next Steps

1. Review the analysis report above
2. If READY or NEEDS ATTENTION:
   - `/speckit.implement` — Start implementation
   - `/speckit.taskstoissues` — Convert tasks to GitHub issues
3. If BLOCKED:
   - Address CRITICAL issues in the relevant artifact
   - Re-run the specific phase command (e.g., `/speckit.specify`, `/speckit.plan`)
   - Then run `/speckit.analyze` to verify resolution
```

**IMPORTANT**: This command ends here. Do NOT proceed to implementation automatically.

---

## Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| Empty feature description | ERROR: "No feature description provided. Usage: /speckit.prepare <description>" |
| `docs/` does not exist | Warn and proceed with feature description only |
| `.specify/memory/constitution.md` not found | Warn, skip Constitution Check |
| Script failure (non-zero exit) | STOP with error message. In `--auto` mode: mark phase as FAILED in Final Report |
| Branch name collision | Auto-increment number (check all sources) |
| `docs/` > 50 files | Process most recent 30, warn about remainder |
| Clarify phase skipped by user | Warn "downstream rework risk increases", proceed to Plan |
| Constitution violation | ERROR in interactive mode; WARNING + BLOCKED status in `--auto` mode |
| Phase stopped early by user | Generate Final Report with completed phases only |

## General Guidelines

- Use absolute paths for all file operations
- Run each prerequisite script exactly once per phase
- Do not re-run phases already completed in this session
- In interactive mode, never advance past a checkpoint without explicit user approval
- In `--auto` mode, log all automated decisions for transparency in the Final Report
