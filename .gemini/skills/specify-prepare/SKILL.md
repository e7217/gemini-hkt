---
name: specify-prepare
description: Orchestrates the pre-implementation pipeline (specify -> plan -> tasks). Supports single features, multi-feature dispatch, and auto-discovery from docs. Uses parallel sub-agents (via git worktrees) for efficiency.
---

# Specify Prepare Pipeline (Parallel Pre-Implementation)

This skill automates the "pre-implementation" phase for the `specify` workflow in Gemini CLI. It translates broad feature descriptions or existing documentation into concrete technical specifications (`spec.md`), implementation plans (`plan.md`), and actionable tasks (`tasks.md`).

It efficiently handles single features, explicit multi-feature dispatch, and auto-discovery of pending issues by utilizing `git worktrees` and Gemini sub-agents to process features in parallel.

## 1. Operating Modes

First, determine the operating mode based on the user's input:

### A. Auto-Discover (`--auto-discover`)
1.  **Scan Issues**: Use the `glob` tool to find all markdown files in `docs/issues/**/*.md`.
2.  **Filter Pending**: Read the files. Identify issues that have a status like `pending`, `todo`, `planned`, or `미구현` (or missing status). Ignore those marked as `done`, `in-progress`, etc.
3.  **Confirm with User**: Use the `ask_user` tool (with `type: choice` and `multiSelect: true`) to list the discovered candidates and ask the user which ones they want to prepare.
4.  **Extract Descriptions**: For each selected issue, extract a concise feature description (ID + Title + core scope).
5.  **Proceed to Dispatch**: Treat the selected descriptions as a Multi-Feature Dispatch.

### B. Multi-Feature Dispatch (Multiple descriptions provided)
If the user provides multiple feature descriptions separated by commas or quotes, proceed directly to **Section 2: Parallel Dispatch**.

### C. Single Feature
If the user provides a single feature description, proceed directly to **Section 2: Parallel Dispatch**, but with only one item.

---

## 2. Parallel Dispatch

For each feature description to be processed, perform the following steps:

1.  **Create Branch & Directory**: 
    Run the following command to initialize the feature branch and get the paths:
    ```bash
    .specify/scripts/bash/create-new-feature.sh --json "<feature_description>"
    ```
    Parse the JSON output to get `BRANCH_NAME`, `SPEC_FILE`, and `FEATURE_DIR`.

2.  **Setup Git Worktree**:
    Create a temporary git worktree to isolate the preparation process and avoid file locking conflicts:
    ```bash
    # Use the branch name for the worktree directory name to keep it organized
    git worktree add ../<project-name>-prep-<BRANCH_NAME> <BRANCH_NAME>
    ```

3.  **Launch Sub-Agent (Worker)**:
    Use the `run_shell_command` tool with `is_background: true` to run a Gemini sub-agent inside the worktree. Ensure it automatically bypasses interactive checkpoints (like the old `--auto` mode).
    
    *Example command*:
    ```bash
    cd ../<project-name>-prep-<BRANCH_NAME> && gemini "Activate the specify-prepare skill and run the Worker Pipeline for feature: '<feature_description>'. Target directory is '<FEATURE_DIR>'. Write spec.md, plan.md, and tasks.md based on .specify/templates/. Commit changes when done."
    ```
    *Keep track of the background PIDs.*

4.  **Monitor & Cleanup**:
    Wait for all sub-agents to complete their work. Then, for each worktree:
    ```bash
    git worktree remove ../<project-name>-prep-<BRANCH_NAME>
    ```
    *(The `<BRANCH_NAME>` remains in the main repository, ready for implementation).*

5.  **Final Report**:
    Output a summary table to the user showing: Feature Description, Branch Name, and Readiness Status.

---

## 3. Worker Pipeline (For Sub-Agents)

If you are a sub-agent executing inside a worktree (instructed by Step 2.3), follow these steps strictly (no user confirmation required):

1.  **Context Gathering**:
    - Load `.specify/memory/constitution.md` (if exists).
    - Read `docs/**/*.md` to understand domain entities, the tech stack, and constraints.
    
2.  **Generate Specification (`spec.md`)**:
    - Read `.specify/templates/spec-template.md`.
    - Create `<FEATURE_DIR>/spec.md` using the gathered context and feature description. Resolve any ambiguities internally using best practices.
    
3.  **Generate Plan (`plan.md`)**:
    - Run `.specify/scripts/bash/setup-plan.sh --json`.
    - Read `.specify/templates/plan-template.md`.
    - Create `<FEATURE_DIR>/plan.md` addressing architectural design, data models, and API contracts. Ensure your plan aligns with the constitution principles.
    
4.  **Generate Tasks (`tasks.md`)**:
    - Read `.specify/templates/tasks-template.md`.
    - Create `<FEATURE_DIR>/tasks.md` breaking down the plan into a checklist format (`- [ ] [TaskID] ...`). Group into standard phases: Phase 1 (Setup), Phase 2 (Foundational), Phase 3 (UI/Logic), Phase 4 (Polish). Identify tasks that can be parallelized with `[P]`.
    
5.  **Update Agent Context**:
    - Run the script to update context files for Gemini:
    ```bash
    .specify/scripts/bash/update-agent-context.sh gemini
    ```

6.  **Update Documentation**:
    - Call the `activate_skill` tool with the name `specify-update-docs`.
    - Following its instructions, update the corresponding feature file in `docs/issues/**/*.md` to change its status to `prepared` and add the `specs/` file links.

7.  **Commit Changes**:
    Stage and commit the generated specification files and the updated docs:
    ```bash
    git add <FEATURE_DIR> docs/issues/
    git commit -m "chore: Prepare specifications and update docs for <feature_description>"
    ```

7.  **Update Issue Status**:
    - If this feature was generated from an existing issue in `docs/issues/`, invoke the `specify-docs` skill to update the status of that issue to `in-progress`.
    - Stage and commit this documentation update to the feature branch.
