# Tasks: BE-06 경로 시뮬레이션 API

**Input**: Design documents from `specs/001-simulate-api/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.md`
**Feature**: `POST /api/paths/simulate` — `app/api/paths/simulate/route.ts`

**Note**: Tests are not included in this task list (not requested in the feature spec). BE-04, BE-05, BE-07 are external prerequisites — their tasks are tracked in their respective issues.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are relative to the project root.

---

## Phase 1: Setup (File Creation)

**Purpose**: Create the route file and confirm all prerequisite libraries are importable. No logic implemented yet.

- [ ] T001 Confirm prerequisites exist: verify `types/path.ts` exports `PathMap`, `PathNode`, `MergePoint`, `PathInfo` (BE-02 complete check)
- [ ] T002 Confirm prerequisites exist: verify `lib/gemini.ts` exports `generatePathMap(goal: string, timeframe: string): Promise<unknown>` (BE-04 complete check)
- [ ] T003 Confirm prerequisites exist: verify `lib/prompts.ts` is used internally by `lib/gemini.ts` (BE-05 complete check)
- [ ] T004 Confirm prerequisites exist: verify `lib/mockData.ts` exports `getMockPathMap(): PathMap` (BE-07 complete check)
- [ ] T005 Create `app/api/paths/simulate/route.ts` with an empty `POST` export that returns `NextResponse.json({ status: "ok" })` — confirms directory structure and Next.js routing works

**Checkpoint**: `curl -X POST http://localhost:3000/api/paths/simulate -H "Content-Type: application/json" -d '{}'` returns `{ "status": "ok" }` with HTTP 200.

---

## Phase 2: Foundational (Types and Schemas)

**Purpose**: Define the Zod schemas and internal types used by all three user stories. This phase must complete before any user story logic is implemented.

- [ ] T006 [P] Define `SimulateRequestSchema` (Zod) in `app/api/paths/simulate/route.ts`: `goal` (string, min 1, max 500), `timeframe` (enum `"1y" | "3y" | "5y"`, default `"3y"`) — see `data-model.md` section 1
- [ ] T007 [P] Define `PathNodeSchema` (Zod) in `app/api/paths/simulate/route.ts` matching `PathNode` interface from `types/path.ts` — see `data-model.md` section 2
- [ ] T008 [P] Define `MergePointSchema` (Zod) in `app/api/paths/simulate/route.ts` matching `MergePoint` interface from `types/path.ts`
- [ ] T009 [P] Define `PathInfoSchema` (Zod) in `app/api/paths/simulate/route.ts` matching `PathInfo` interface from `types/path.ts`
- [ ] T010 Define `PathMapSchema` (Zod) composing `PathNodeSchema`, `MergePointSchema`, `PathInfoSchema` — `paths` must be `z.array(PathInfoSchema).length(3)`, `mergePoints` must be `.min(1)` (depends on T007–T009)
- [ ] T011 [P] Add `parseRequest` helper function that calls `SimulateRequestSchema.safeParse(rawBody)` and returns either the parsed data or a `NextResponse` with HTTP 400 — max 15 lines, no nesting beyond depth 1

**Checkpoint**: TypeScript compiler (`tsc --noEmit`) reports no errors. All schemas are defined and `z.infer<typeof PathMapSchema>` produces a type compatible with `PathMap` from `types/path.ts`.

---

## Phase 3: User Story 1 — Basic Gemini API Call (Priority: P1)

**Goal**: Implement the live Gemini path — validate request, call `generatePathMap`, validate response with Zod, return PathMap. No retry or mock logic yet.

**Independent Test**: With `USE_MOCK` unset and valid `GEMINI_API_KEY`, `POST /api/paths/simulate` with `{ "goal": "풀스택 개발자 되기", "timeframe": "3y" }` returns HTTP 200 with a valid PathMap containing 3 paths and at least 1 merge point.

- [ ] T012 [US1] Implement `callGemini` helper: calls `generatePathMap(goal, timeframe)`, validates with `PathMapSchema.safeParse`, returns `PathMap | null` — max 10 lines, in `app/api/paths/simulate/route.ts`
- [ ] T013 [US1] Implement core `POST` handler body: parse request body with `parseRequest`, call `callGemini`, return `NextResponse.json(pathMap)` on success — no retry/fallback/mock branching yet, just the happy path (depends on T011, T012)
- [ ] T014 [US1] Add HTTP 500 error response when `callGemini` returns `null` (Gemini returned non-validating JSON): `NextResponse.json({ error: "경로 생성에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 })`
- [ ] T015 [US1] Wrap `request.json()` call in try-catch to handle malformed JSON request bodies; return HTTP 400 on parse failure

**Checkpoint (US1)**: `POST /api/paths/simulate` with valid body calls Gemini, validates the response, and returns HTTP 200 PathMap. Bad input returns HTTP 400. Invalid Gemini response returns HTTP 500.

---

## Phase 4: User Story 2 — Mock Mode (Priority: P2)

**Goal**: Add `USE_MOCK=true` short-circuit at the start of the handler. When active, skip all Gemini logic and return mock data immediately.

**Independent Test**: Set `USE_MOCK=true` in `.env.local`, restart dev server. `POST /api/paths/simulate` with any body returns HTTP 200 PathMap without any Gemini API call (verify with network logs or response time < 100ms).

- [ ] T016 [US2] Add mock-mode check as the first branch in the `POST` handler: `if (process.env.USE_MOCK === 'true') { return NextResponse.json(getMockPathMap()); }` — insert before request parsing to ensure no Gemini call is possible (depends on T013)
- [ ] T017 [US2] Verify mock response passes PathMap type: assert that `getMockPathMap()` return type is `PathMap` — add explicit type annotation at call site; TypeScript compiler enforces shape compatibility
- [ ] T018 [P] [US2] Manual validation: confirm response time under mock mode is under 100ms and no network call to Gemini is made (verify via browser DevTools or server logs)

**Checkpoint (US2)**: `USE_MOCK=true` → instant response with valid PathMap, no Gemini call. `USE_MOCK=false` → normal Gemini flow from US1.

---

## Phase 5: User Story 3 — Retry and Fallback (Priority: P3)

**Goal**: Replace single `callGemini` attempt with a retry-then-fallback flow. Two attempts at Gemini; on double failure, return mock data with HTTP 200.

**Independent Test**: Replace `generatePathMap` import with a stub that always returns malformed JSON. Confirm endpoint returns HTTP 200 with mock PathMap data (not HTTP 500).

- [ ] T019 [US3] Extract retry wrapper `callGeminiWithRetry` function: calls `callGemini` twice (two sequential attempts), returns `PathMap` from the first successful attempt or `null` if both fail — max 10 lines, early-return pattern, nesting depth ≤ 1 (depends on T012)
- [ ] T020 [US3] Update `POST` handler to use `callGeminiWithRetry` instead of `callGemini` (depends on T019)
- [ ] T021 [US3] Update failure branch: when `callGeminiWithRetry` returns `null`, return `NextResponse.json(getMockPathMap())` with HTTP 200 (fallback), not HTTP 500 — reserve HTTP 500 for exceptions thrown by `generatePathMap` (depends on T020)
- [ ] T022 [US3] Ensure the outer try-catch in the handler still catches exceptions thrown by `generatePathMap` (network errors, auth errors) and returns HTTP 500 with user-friendly message; Zod validation failures must not reach HTTP 500 (depends on T021)

**Checkpoint (US3)**: With a Gemini stub that always returns bad JSON: endpoint returns HTTP 200 with mock PathMap. With a Gemini stub that returns bad JSON once then valid JSON: endpoint returns HTTP 200 with the valid Gemini PathMap. With Gemini throwing a network exception: endpoint returns HTTP 500.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Final cleanup, logging, and constitution compliance verification.

- [ ] T023 [P] Verify all functions in `route.ts` are ≤ 20 lines — refactor if any exceed the limit (Constitution III)
- [ ] T024 [P] Verify maximum nesting depth is 2 throughout `route.ts` — use early-return pattern to flatten if needed (Constitution IV)
- [ ] T025 [P] Verify no `any` types are used in `route.ts` — all `unknown` boundaries use Zod or explicit type guards (Constitution V)
- [ ] T026 Add server-side console logging for key events: request received (goal length, timeframe), Gemini call started, Zod validation result (pass/fail), retry triggered, fallback activated, response sent — use `console.error` for errors, `console.log` for info
- [ ] T027 Run `tsc --noEmit` to confirm zero TypeScript errors across the project after BE-06 changes
- [ ] T028 [P] Run quickstart.md validation: execute each `curl` command from `quickstart.md` against the dev server and verify expected HTTP status codes and response shapes

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately after BE-02, BE-04, BE-05, BE-07 are confirmed complete.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion. Blocks all user story phases.
- **Phase 3 (US1 — Basic API)**: Depends on Phase 2 completion.
- **Phase 4 (US2 — Mock Mode)**: Depends on Phase 3 completion (adds a branch to the handler built in Phase 3).
- **Phase 5 (US3 — Retry + Fallback)**: Depends on Phase 3 completion (replaces the single call with a retry wrapper).
- **Phase 6 (Polish)**: Depends on Phases 3–5 completion.

### Within Each Phase

- Tasks marked `[P]` can run in parallel (no shared file edits).
- All others run sequentially in the order listed.
- Checkpoints must pass before the next phase begins.

### Parallel Opportunities

```
Phase 2: T006, T007, T008, T009 can all run in parallel (different schema definitions, same file is OK since they are non-conflicting additions)
Phase 6: T023, T024, T025, T028 can run in parallel (all read-only verification tasks)
```

---

## Implementation Strategy

### MVP First (US1 Only — ~15 minutes)

1. Phase 1: Setup (T001–T005)
2. Phase 2: Foundational schemas (T006–T011)
3. Phase 3: US1 basic Gemini call (T012–T015)
4. **STOP AND VALIDATE**: Live Gemini call works end-to-end.

### Full Implementation (~25 minutes total per BE-06 estimate)

1. Complete MVP above.
2. Phase 4: US2 mock mode (T016–T018) — 3 tasks, ~5 min.
3. Phase 5: US3 retry + fallback (T019–T022) — 4 tasks, ~5 min.
4. Phase 6: Polish (T023–T028) — ~3 min.

---

## Notes

- `[P]` tasks = different concerns, no blocking dependencies.
- `[USN]` label maps each task to a user story for traceability.
- Checkpoints at end of each phase must pass before proceeding.
- The route file (`app/api/paths/simulate/route.ts`) is the only file created or modified by BE-06.
- All `lib/` and `types/` files are owned by BE-02, BE-04, BE-05, BE-07.
