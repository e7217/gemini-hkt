---
name: specify-implement
description: Executes the spec-kit implementation phase. Parses tasks.md, identifies parallelizable tasks, and uses git worktrees and background sub-agents (gemini CLI) to implement them in parallel, then merges the results.
---

# Specify Implement (Parallel Execution)

This skill provides the `/specify.implement` functionality from the `spec-kit` workflow, enhanced with parallel execution using git worktrees and Gemini CLI sub-agents.

## Prerequisites

Before starting the implementation, verify the existence of the following files in the project context (usually under `specs/<feature>/` or `.specify/`):
- `constitution.md` (Core principles)
- `spec.md` (Technical specification)
- `plan.md` (Implementation plan)
- `tasks.md` (Task list)

## Workflow

### 1. Parse and Analyze Tasks
Read the `tasks.md` file to understand the sequence of tasks.
Identify tasks that can be executed in parallel. These may be explicitly marked with `[P]` or logically independent (e.g., independent UI components, separate API endpoints).

Group the tasks into:
- **Sequential Steps**: Tasks that depend on previous ones and must be executed in the main workspace.
- **Parallel Groups**: Sets of tasks that can be executed simultaneously without conflicts.

### 2. Parallel Execution Setup (for each parallel group)
For each independent task or task group that can be parallelized:

1. **Create a branch**:
   ```bash
   git branch implement-task-<id>
   ```
2. **Create a git worktree** outside the current project directory to avoid file locking and conflicts:
   ```bash
   git worktree add ../<project-name>-task-<id> implement-task-<id>
   ```
3. **Dispatch a Sub-agent**:
   Use `run_shell_command` with `is_background: true` to launch a new Gemini CLI instance in the worktree directory.
   Provide it with a clear prompt to implement the specific task, run tests, and commit the changes.
   
   *Example command*:
   ```bash
   cd ../<project-name>-task-<id> && gemini "You are a sub-agent. Implement task <id> from specs/<feature>/tasks.md. Refer to spec.md and constitution.md. When finished, ensure tests pass and commit your changes with 'git add . && git commit -m \"Implement task <id>\"'."
   ```

### 3. Monitor and Wait
Keep track of the background PIDs. Wait for the sub-agents to complete their work. You can periodically check the git branches using `git log implement-task-<id>` in the main workspace to see if the commits have been made.

### 4. Merge and Cleanup
Once a sub-agent has finished and committed its work:

1. **Merge the branch** into the main implementation branch:
   ```bash
   git merge implement-task-<id>
   ```
   *Resolve any merge conflicts if they arise.*
2. **Clean up the worktree and branch**:
   ```bash
   git worktree remove ../<project-name>-task-<id>
   git branch -d implement-task-<id>
   ```

### 5. Sequential Execution
For tasks that cannot be parallelized, execute them sequentially in the main workspace following the standard TDD approach (write tests -> implement -> validate).

## Best Practices

- **Avoid overlapping file edits**: Only parallelize tasks that touch different files or completely independent modules. If tasks modify the same files, they must be executed sequentially.
- **Clear Sub-agent Instructions**: Provide sub-agents with exact, self-contained instructions. They do not share your conversation history.
- **Validation**: After merging parallel tasks, always run the full project test suite to ensure the combined changes work harmoniously.
