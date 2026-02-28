# Tasks: C9 Mindmap Node Expansion
**Input**: Design documents from `/specs/021-c9/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 [P] Create `app/api/paths/expand/route.ts` to ask Gemini for a detailed breakdown of a single step.

## Phase 2: User Story 1 (P1)
- [ ] T002 Update `components/nodes/StepNode.tsx` to include an "Expand" button.
- [ ] T003 Add logic in `store/usePathStore.ts` to merge expanded child nodes and trigger `getLayoutedElements` from `lib/graphUtils.ts`.
- [ ] T004 Handle loading state during expansion on the specific node.