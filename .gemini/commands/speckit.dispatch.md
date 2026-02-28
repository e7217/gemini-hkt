---
description: Prepare multiple features in parallel using isolated git worktrees. Each feature runs the full speckit.prepare pipeline concurrently.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command runs `speckit.prepare --auto` for multiple features in parallel, each isolated in its own git worktree to prevent branch conflicts. Results are collected and presented in a unified dispatch report.

**Maximum parallel features**: 5 per batch. If more than 5 features are provided, they are processed in sequential batches of up to 5.

---

## Step 1: Parse Feature List

Extract the list of features from `$ARGUMENTS`. Supported input formats:

**Format A** — Quoted strings (space-separated):
```
"피처1 설명" "피처2 설명" "피처3 설명"
```

**Format B** — One per line:
```
피처1 설명
피처2 설명
피처3 설명
```

**Format C** — Numbered list:
```
1. 피처1 설명
2. 피처2 설명
3. 피처3 설명
```

Parsing rules:
- Strip leading numbers and punctuation (e.g., `1.`, `1)`, `-`)
- Strip surrounding whitespace from each feature description
- Ignore empty lines
- If fewer than 2 features found: ERROR "speckit.dispatch requires at least 2 features. For a single feature, use /speckit.prepare"
- If 0 features found: ERROR "No feature descriptions provided. Usage: /speckit.dispatch \"Feature 1\" \"Feature 2\" ..."

Display parsed features before proceeding:

```
## 🚀 Dispatch Plan: N Features

| # | Feature Description |
|---|---------------------|
| 1 | <feature 1> |
| 2 | <feature 2> |
| N | <feature N> |

Processing in <M> batch(es) of up to 5 features each.
Starting parallel preparation...
```

---

## Step 2: Check Global Conditions (Once)

Before launching agents, check project-level conditions to generate accurate global warnings in the final report. Each worktree agent will independently load docs and constitution — this step is just for surfacing warnings upfront.

1. Check if `docs/` exists and count files
2. Check if `.specify/memory/constitution.md` exists
3. Note any global warnings to include in the dispatch report:
   - `docs/` not found → each agent will proceed with feature description only
   - constitution not found → Constitution Check will be skipped in all agents
   - `docs/` > 50 files → only 30 most recent will be used per agent

Output:
```
📋 Project Conditions:
- docs/: <N files found / not found>
- constitution: <found / not found>
```

---

## Step 3: Parallel Execution

For each batch of up to 5 features, launch agents in parallel using the Task tool with `isolation: "worktree"`.

### Agent Configuration

For each feature, spawn one agent with:
- **subagent_type**: `general-purpose`
- **isolation**: `"worktree"`
- **prompt**: The feature-specific prompt below

### Agent Prompt Template

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

### Batch Execution

Launch all agents in a batch simultaneously. Wait for all agents in the current batch to complete before proceeding to the next batch.

If a batch has fewer than 5 features, all are launched at once. If there are more than 5 features total, process in sequential batches:
- Batch 1: Features 1–5
- Batch 2: Features 6–10
- etc.

---

## Step 4: Collect Results

Wait for all agents in all batches to complete. Parse the JSON result from each agent.

If an agent fails to return valid JSON, create a fallback result:
```json
{
  "feature": "<FEATURE_DESCRIPTION>",
  "status": "FAILED",
  "branch": null,
  "feature_dir": null,
  "artifacts": { "spec": false, "plan": false, "tasks": false, "analysis": false },
  "task_count": 0,
  "analysis_summary": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "readiness": "BLOCKED",
  "errors": ["Agent did not return valid results"],
  "warnings": []
}
```

---

## Step 5: Unified Dispatch Report

Generate and output the comprehensive dispatch report:

```
## 📊 Dispatch Report: N Features Prepared

### Feature Status Matrix

| # | Feature | Branch | Spec | Plan | Tasks | Analysis | Readiness |
|---|---------|--------|------|------|-------|----------|-----------|
| 1 | <description truncated to 40 chars> | <branch> | ✅/❌ | ✅/❌ | ✅ (N) / ❌ | N CRIT / ✅ | READY/NEEDS ATTENTION/BLOCKED |
| 2 | ... | | | | | | |

### Summary

| Metric | Count |
|--------|-------|
| Total features | N |
| READY | N |
| NEEDS ATTENTION | N |
| BLOCKED | N |
| Total tasks generated | N |
| Total CRITICAL issues | N |

### READY Features
Features ready for implementation or issue creation:
- **<branch>**: <feature description>
  - Tasks: N | Analysis: N CRITICAL, N HIGH
  - Next: `/speckit.implement` or `/speckit.taskstoissues`

### NEEDS ATTENTION Features
Features with issues worth reviewing before proceeding:
- **<branch>**: <feature description>
  - Issues: <summary of HIGH/MEDIUM findings>
  - Next: Review analysis, then `/speckit.implement`

### BLOCKED Features
Features with CRITICAL issues requiring manual intervention:
- **<branch or "not created">**: <feature description>
  - CRITICAL: <error or issue summary>
  - Next: Manually resolve, then re-run `/speckit.prepare "<description>"`

### Worktree Information

Each feature was prepared in an isolated git worktree. Branches were created in the main repository.

To work on a specific feature:
```bash
git checkout <branch-name>
```

To view feature artifacts:
```bash
ls specs/<branch-name>/
```

### Global Warnings
<List any warnings from Step 2, e.g., docs/ not found, constitution not found>

---
**Dispatch complete.** All <N> features have been processed.
Use the branch names above to navigate to specific feature artifacts.
```

---

## Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| < 2 features provided | ERROR: suggest using `/speckit.prepare` instead |
| 0 features provided | ERROR with usage instructions |
| > 5 features | Process in sequential batches of 5, with progress updates between batches |
| Agent returns error | Mark feature as FAILED/BLOCKED, continue other features |
| Branch name collision | Each agent auto-increments (handled within worktree) |
| `docs/` not found | Note in global warnings, all agents proceed without docs context |
| Constitution not found | Note in global warnings, Constitution Check skipped in all agents |
| All features BLOCKED | Report is still generated; suggest reviewing errors per feature |
| Partial batch failure | Failed features reported as BLOCKED; successful features unaffected |

## Design Notes

- **Error isolation**: One feature failing does NOT affect other features. Each runs in its own worktree.
- **`--auto` mode**: All checkpoints in `speckit.prepare` are bypassed when launched from dispatch. This enables fully unattended parallel execution.
- **Worktree cleanup**: Worktrees with no changes are automatically cleaned up. Worktrees where branches were created persist until you choose to remove them or merge.
- **Result format**: Agents return structured JSON to enable reliable result parsing regardless of prose output.
