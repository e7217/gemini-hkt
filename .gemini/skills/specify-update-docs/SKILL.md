---
name: specify-update-docs
description: Updates the project documentation (docs/issues/**/*.md) to reflect the current status of a feature. Finds the corresponding issue file, updates its status, and links the generated specification files.
---

# Specify Update Docs Pipeline

This skill automates the process of keeping `docs/issues` synchronized with the actual state of the implementation and specification generation.

When invoked, the agent should follow these steps:

## 1. Context Gathering
- **Target Feature**: Determine the feature or issue ID being updated from the user prompt.
- **New Status**: Determine the intended new status (e.g., `prepared`, `implemented`, `done`). If not specified, default to `prepared`.
- **Target Files**: Use the `glob` tool to find the matching issue file in `docs/issues/**/*.md` and the generated spec files in `specs/<feature>/*.md` (if applicable).
- **Existence Check**: If no matching issue file is found in `docs/issues/**/*.md`, determine that a **new issue document must be created**.

## 2. Update or Create Issue Markdown
If the target issue file exists, read it and apply the following changes. If it does not exist, use the `write_file` tool to create a new one (e.g., under `docs/issues/backlog/` or an appropriate phase directory) before applying the changes.

1.  **Create (If Missing)**:
    Create a new markdown file with a basic structure:
    ```markdown
    # [FEATURE-ID] Feature Title
    
    ## 개요
    - **Phase**: Backlog
    - **담당**: TBD
    - **상태**: pending
    ```

2.  **Update Status**:
    Locate the `- **상태**: ...` line under the `## 개요` section and update it to the new status.
    *(Example: Change `- **상태**: pending` to `- **상태**: prepared`)*

3.  **Add Specification Links** (if status is `prepared` or similar):
    Append links to the generated `specs/` documents under a new or existing `## 산출물 (Artifacts)` or `## 참조 문서` heading at the bottom of the file.
    *Example formatting to append*:
    ```markdown
    ## 산출물 (Artifacts)
    - [Spec (요구사항)](../../../../specs/<feature-name>/spec.md)
    - [Plan (설계 및 계획)](../../../../specs/<feature-name>/plan.md)
    - [Tasks (작업 목록)](../../../../specs/<feature-name>/tasks.md)
    ```

## 3. Update Issue Index (Optional)
If there is an index file like `docs/issues/__init__.md` or `docs/issues/phase-X/__init__.md` that manually tracks overall status, check if it needs to reflect this change (e.g., if it maintains a table of issue statuses). If so, update the corresponding table row for the feature.

## 4. Verification
Read the updated issue markdown file and verify that the status has been changed correctly and the relative links point to the right `specs/` paths.