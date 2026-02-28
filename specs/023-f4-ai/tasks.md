# Tasks: F4 Path Success Probability
**Input**: Design documents from `/specs/023-f4-ai/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 Update `types/path.ts` Track schema to include `successProbability` (number) and `difficulty` (enum).
- [ ] T002 Update `lib/prompts.ts` with instructions to estimate these metrics realistically based on resource requirements.

## Phase 2: User Story 1 (P1)
- [ ] T003 Update `components/TrackLegend.tsx` to display the probability and difficulty alongside track names.
- [ ] T004 (Optional) Add visual indicators (e.g., color-coded progress bars for probability).