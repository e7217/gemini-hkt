# Feature Specification: C5 Interactive Branch Selection
**Feature Branch**: `020-c5`
**Status**: Draft
**Input**: Issue docs/issues/phase-2/C5-interactive-branch-selection.md

## User Story 1 - Select Branch (Priority: P1)
As a user, I want to actively choose a path at a junction and see the non-selected paths fade out, so I can commit to a specific direction.

## Functional Requirements
- FR-001: Nodes with multiple outgoing edges should be clickable as "decision points".
- FR-002: Selecting a branch fades out alternative branches.
- FR-003: Smooth layout transition and state tracking for selected branch.