# Tasks: B3 Reverse Planning
**Input**: Design documents from `/specs/018-b3-gemini/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 Update `lib/prompts.ts` with `REVERSE_PLANNING_PROMPT`.

## Phase 2: User Story 1 (P1)
- [ ] T002 Update `components/GoalInput.tsx` to include a switch for Reverse Planning.
- [ ] T003 Update `types/path.ts` to include `isReverse` in path request.
- [ ] T004 Modify `app/api/paths/route.ts` to utilize reverse prompt.