# Feature Specification: C9 Mindmap Node Expansion
**Feature Branch**: `021-c9`
**Status**: Draft
**Input**: Issue docs/issues/phase-2/C9-mindmap-node-expansion.md

## User Story 1 - Node Expansion (Priority: P1)
As a user, I want to click a specific node and expand it into a detailed sub-mindmap to explore specific action plans for that step.

## Functional Requirements
- FR-001: Provide an "Expand details" action on nodes.
- FR-002: Dynamically query Gemini for detailed breakdown of the selected step.
- FR-003: Render the newly generated breakdown as child nodes around the selected node (Dagre layout dynamic re-calc).