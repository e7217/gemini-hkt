# Feature Specification: B5 Conditional Branching
**Feature Branch**: `019-b5`
**Status**: Draft
**Input**: Issue docs/issues/phase-2/B5-conditional-branching.md

## User Story 1 - Conditional Branches (Priority: P1)
As a user, I want to explore "what-if" scenarios at specific milestones, so I can understand alternative paths if a condition is met.

## Functional Requirements
- FR-001: Allow users to click a node and add a conditional branch ("What if I do X?").
- FR-002: Call Gemini API with the context of the selected node and the new condition to generate a sub-path.
- FR-003: Inject the new sub-path dynamically into the React Flow map.