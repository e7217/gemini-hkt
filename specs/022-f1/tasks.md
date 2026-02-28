# Tasks: F1 Opportunity Cost
**Input**: Design documents from `/specs/022-f1/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 Update `types/path.ts` Step schema to include `opportunityCost` (string) and `timeEstimate` (string).
- [ ] T002 Update `lib/prompts.ts` instructing Gemini to fill in these new fields.

## Phase 2: User Story 1 (P1)
- [ ] T003 Update `components/nodes/StepNode.tsx` to display a small icon or badge if opportunity cost exists.
- [ ] T004 Update `components/DetailPanel.tsx` to prominently show the time estimate and opportunity cost text.