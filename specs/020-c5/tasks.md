# Tasks: C5 Interactive Branch Selection
**Input**: Design documents from `/specs/020-c5/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 Update `types/flow.ts` to support `isSelected` or `isDimmed` state on nodes and edges.

## Phase 2: User Story 1 (P1)
- [ ] T002 Implement `selectBranch` action in `store/usePathStore.ts` that cascades dimming to unselected paths.
- [ ] T003 Update `components/PathMap/PathMapCanvas.tsx` to handle branch selection clicks.
- [ ] T004 Apply CSS transitions for `opacity` to dimmed nodes/edges.