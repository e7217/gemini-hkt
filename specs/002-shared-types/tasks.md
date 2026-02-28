# Tasks: BE-02 공유 타입 정의 (Shared TypeScript Types)

**Input**: Design documents from `/specs/001-shared-types/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the project structure required for the shared types file.

- [ ] T001 Create `types/` directory at project root
- [ ] T002 [P] Verify `tsconfig.json` has `"strict": true` and `"paths": { "@/*": ["./*"] }` configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type infrastructure that MUST be complete before any downstream feature (BE-04, BE-05, BE-07, FE-03) can be implemented.

**⚠️ CRITICAL**: All subsequent LifePath features depend on this phase being complete.

- [ ] T003 [US1] Define `TrackType` enum with Fast/Deep/Risk values in `types/path.ts`
- [ ] T004 [US1] Define `PathNode` interface (id, title, description, duration, difficulty, isMergePoint, tips, monthsFromNow) in `types/path.ts`
- [ ] T005 [US1] Define `StartGoalNode` interface (id, title, description) in `types/path.ts`
- [ ] T006 [US1] Define `Path` interface (id: string, name, color, nodes: PathNode[]) in `types/path.ts`
- [ ] T007 [US1] Define `MergePoint` interface (id, title, connectedPaths, message) in `types/path.ts`
- [ ] T008 [US1] Define `PathMap` interface (startNode, goalNode, paths, mergePoints) in `types/path.ts`

**Checkpoint**: Core PathMap domain types complete. US1 is independently testable at this point.

---

## Phase 3: User Story 1 - Backend Developer Imports Shared Types (Priority: P1) — MVP

**Goal**: Core domain types (PathNode, Path, PathMap, StartGoalNode, MergePoint, TrackType) are defined, exported, and TypeScript-compilable from `types/path.ts`.

**Independent Test**: Run `tsc --noEmit` from project root — must complete with zero errors. Construct a `PathMap` object in a test file and verify TypeScript autocomplete.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Define `TimelineMetadata` interface (duration, monthsFromNow, estimatedEndDate?) in `types/path.ts`
- [ ] T010 [P] [US1] Define `AnonymousSession` interface (sessionId, createdAt, expiresAt, pathHistory) in `types/path.ts`
- [ ] T011 [US1] Verify all named exports are present: PathNode, Path, StartGoalNode, MergePoint, PathMap, TrackType, TimelineMetadata, AnonymousSession in `types/path.ts`
- [ ] T012 [US1] Run `npx tsc --noEmit` and confirm zero compilation errors

**Checkpoint**: US1 complete. All 8 core and supporting interfaces/enum defined, exported, and TypeScript-verified.

---

## Phase 4: User Story 2 - Frontend Developer Uses Types for React Flow (Priority: P2)

**Goal**: Types are importable from the `app/` (frontend) directory, confirming cross-context import compatibility.

**Independent Test**: Add `import type { PathMap, PathNode, TrackType } from "@/types/path";` to a frontend file (e.g., `app/page.tsx`) and run `tsc --noEmit` — must pass.

### Implementation for User Story 2

- [ ] T013 [US2] Verify `@/types/path` import resolves correctly from `app/` directory by adding a test import to `app/page.tsx` (or any existing frontend file)
- [ ] T014 [US2] Confirm `PathNode.isMergePoint` and `monthsFromNow` fields are accessible via TypeScript IntelliSense in frontend context
- [ ] T015 [US2] Remove test import from `app/page.tsx` after verification

**Checkpoint**: US2 complete. Frontend import compatibility verified.

---

## Phase 5: User Story 3 - API Request/Response Contract Definition (Priority: P3)

**Goal**: API contract types (SimulateRequest, SimulateResponse, BranchRequest, BranchResponse) are defined and importable from `app/api/` directory.

**Independent Test**: Add `import type { SimulateRequest, SimulateResponse, BranchRequest, BranchResponse } from "@/types/path";` to `app/api/paths/simulate/route.ts` and run `tsc --noEmit` — must pass.

### Implementation for User Story 3

- [ ] T016 [US3] Define `SimulateRequest` type (goal: string, timeframe?: "1y" | "3y" | "5y") in `types/path.ts`
- [ ] T017 [US3] Define `SimulateResponse` type as alias for `PathMap` in `types/path.ts`
- [ ] T018 [US3] Define `BranchRequest` type (pathId, currentNodeId, choice?, currentPathMap: PathMap) in `types/path.ts`
- [ ] T019 [US3] Define `BranchResponse` type (paths: Path[], mergePoints?: MergePoint[]) in `types/path.ts`
- [ ] T020 [US3] Verify API contract types import from `app/api/` directory (test import in any existing `route.ts`)
- [ ] T021 [US3] Confirm `BranchRequest.currentPathMap` is required (not optional) by attempting to construct without it — TypeScript must error

**Checkpoint**: US3 complete. All 4 API contract types defined, exported, and backend-import-verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and cleanup.

- [ ] T022 [P] Add JSDoc comments to all exported types in `types/path.ts` explaining each field's purpose
- [ ] T023 [P] Add inline comment on `Path.id` explaining why it is `string` not a union literal (branch API dynamic IDs)
- [ ] T024 Run complete TypeScript compilation one final time with `npx tsc --noEmit` to confirm clean build
- [ ] T025 Verify `types/path.ts` has no imports from `app/` or any runtime module (must be purely type declarations)
- [ ] T026 Update quickstart.md if any implementation deviations occurred

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — highest priority, complete first
- **User Stories 2 & 3 (Phase 4 & 5)**: Depend on Phase 3 — can proceed in parallel after US1
- **Polish (Phase 6)**: Depends on all user stories

### Parallel Opportunities

- T001 and T002 can run in parallel (Setup phase)
- T009 and T010 can run in parallel (supporting interfaces)
- T003-T008 should run sequentially (dependency: PathNode before Path, Path before PathMap)
- T013-T015 (US2) and T016-T021 (US3) can run in parallel after US1 completes
- T022 and T023 can run in parallel (Polish phase)

### Within Each User Story

- Core types (T003-T008) must be defined before supporting types (T009-T010)
- Supporting types must exist before verification steps (T011-T012)
- API contract types (T016-T019) must be defined before verification (T020-T021)

---

## Implementation Strategy

### MVP First (User Stories 1 only — ~10 minutes)

1. Complete Phase 1: Create `types/` directory and verify tsconfig
2. Complete Phase 2: Define TrackType + 5 core interfaces (T003-T008)
3. Complete Phase 3: Add TimelineMetadata, AnonymousSession, verify (T009-T012)
4. **STOP and VALIDATE**: `tsc --noEmit` passes, core types work
5. This is the minimum deliverable for BE-02

### Full Implementation (~15 minutes)

1. MVP (above)
2. Phase 4: Verify frontend import compatibility
3. Phase 5: Add API contract types and verify backend imports
4. Phase 6: Add JSDoc comments and final validation

---

## Notes

- This is a zero-runtime-logic feature — all tasks produce only type declarations
- No test files are generated (tests are TypeScript compilation checks only)
- The 15-minute estimate from BE-02 issue doc is realistic for this scope
- Downstream features (BE-04, BE-05, BE-07, FE-03) are unblocked after Phase 3 (US1) completion
