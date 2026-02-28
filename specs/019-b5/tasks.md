# Tasks: B5 Conditional Branching
**Input**: Design documents from `/specs/019-b5/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 [P] Create `app/api/paths/branch/route.ts` for handling sub-path generation requests.

## Phase 2: User Story 1 (P1)
- [ ] T002 Update `components/PathMap/PathMapCanvas.tsx` to show a "Add Condition" button on node selection.
- [ ] T003 Implement `addBranch` action in `store/usePathStore.ts` to merge new nodes/edges.
- [ ] T004 Integrate UI to call the branch API and update the store.