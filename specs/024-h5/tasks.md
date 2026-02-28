# Tasks: H5 Calendar Integration
**Input**: Design documents from `/specs/024-h5/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Foundational
- [ ] T001 Install `ics` package or prepare a simple `.ics` string builder.
- [ ] T002 Implement `lib/calendarUtils.ts` with a function to calculate absolute milestone dates based on current date + estimated time per node.

## Phase 2: User Story 1 (P1)
- [ ] T003 Implement `generateICS` function in `lib/calendarUtils.ts` that takes a `Path` and returns `.ics` file content.
- [ ] T004 Update `components/DetailPanel.tsx` to include an "Add to Calendar" button for the active path.
- [ ] T005 Wire the button to download the generated `.ics` file.