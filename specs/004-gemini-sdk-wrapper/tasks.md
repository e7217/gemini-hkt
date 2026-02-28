# Tasks: BE-04 Gemini SDK 세팅 + 래퍼 유틸

**Branch**: `001-gemini-sdk-wrapper`
**Input**: Design documents from `specs/001-gemini-sdk-wrapper/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create the file structure for `lib/gemini.ts`.

- [ ] T001 Install `@google/genai` and `zod` packages via npm in project root
- [ ] T002 [P] Add `GEMINI_API_KEY` to `.env.local` template (`.env.local.example` or `README` env section)
- [ ] T003 [P] Create empty `lib/gemini.ts` with `"server-only"` import guard at top of file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on — constants, error classes, and SDK client initialization.

**CRITICAL**: No user story implementation can begin until this phase is complete.

- [ ] T004 Define all constants in `lib/gemini.ts`: `GEMINI_MODEL`, `TIMEOUT_MS`, `MAX_RETRIES`, `BASE_DELAY_MS`, `RETRYABLE_STATUS_CODES`
- [ ] T005 [P] Implement `GeminiTimeoutError` class in `lib/gemini.ts` with `attemptNumber` and `timeoutMs` fields
- [ ] T006 [P] Implement `GeminiRetryExhaustedError` class in `lib/gemini.ts` with `cause` and `totalAttempts` fields
- [ ] T007 [P] Implement `GeminiValidationError` class in `lib/gemini.ts` with `cause: ZodError` and `issues` fields
- [ ] T008 [P] Implement `GeminiApiError` class in `lib/gemini.ts` with `statusCode` and `isRetryable` fields
- [ ] T009 Implement singleton `getClient()` function in `lib/gemini.ts` that reads `GEMINI_API_KEY` from `process.env` and throws descriptively if missing
- [ ] T010 [P] Implement internal `delay(ms: number): Promise<void>` utility in `lib/gemini.ts`
- [ ] T011 [P] Implement internal `isRetryableError(err: unknown): boolean` in `lib/gemini.ts` that checks error message/status for codes 429, 500, 503

**Checkpoint**: Foundation ready — SDK client, error classes, and utilities are in place. User story implementation can begin.

---

## Phase 3: User Story 1 - SDK Initialization and Basic JSON-mode Call (Priority: P1) 🎯 MVP

**Goal**: A working `callGemini()` function that sends a prompt to Gemini in JSON mode and returns a Zod-validated response.

**Independent Test**: Import `callGemini` in a test script or API Route, call it with a simple prompt and schema, verify a typed JSON response is returned.

### Implementation for User Story 1

- [ ] T012 [US1] Implement internal `withTimeout<T>(promise: Promise<T>, attemptNumber: number): Promise<T>` in `lib/gemini.ts` using `Promise.race` with a rejection timer of `TIMEOUT_MS` — throw `GeminiTimeoutError` on expiry
- [ ] T013 [US1] Implement internal `buildGenerateContentRequest(prompt: string, systemInstruction?: string)` in `lib/gemini.ts` that creates the `@google/genai` request payload with `responseMimeType: "application/json"` and optional system instruction
- [ ] T014 [US1] Implement public `callGemini<T>(params: GeminiCallParams<T>): Promise<T>` in `lib/gemini.ts` — happy path only (single attempt, no retry): call `getClient()`, build request, call `generateContent()`, parse JSON, run Zod validation, return typed result
- [ ] T015 [US1] Add `export` statements for `callGemini`, all error classes, and constants to `lib/gemini.ts`
- [ ] T016 [US1] Create `scripts/test-gemini.ts` validation script per `quickstart.md` Step 4 to confirm end-to-end SDK call works

**Checkpoint**: At this point, User Story 1 is fully functional — `callGemini()` makes real Gemini API calls and returns validated JSON.

---

## Phase 4: User Story 2 - Exponential Backoff Retry (Priority: P2)

**Goal**: `callGemini()` automatically retries on HTTP 429/500/503 with exponential backoff (1s → 2s → 4s + jitter), maximum 3 attempts.

**Independent Test**: Mock or simulate Gemini returning HTTP 429 twice, then success on attempt 3. Verify the function returns the successful response and logs retry attempts.

### Implementation for User Story 2

- [ ] T017 [US2] Refactor `callGemini()` in `lib/gemini.ts` to extract inner API call into `callGeminiOnce()` (single attempt without retry loop)
- [ ] T018 [US2] Implement retry loop in `callGemini()`: for each attempt 0..MAX_RETRIES-1, call `callGeminiOnce()`, on retryable error compute `delay = BASE_DELAY_MS * 2^attempt + Math.random() * 1000`, sleep, retry; after exhausting retries throw `GeminiRetryExhaustedError`
- [ ] T019 [US2] Add server-side console logging in retry loop: `console.warn(`[Gemini] Attempt ${attempt+1} failed (${statusCode}). Retrying in ${delay}ms...`)`
- [ ] T020 [US2] Ensure non-retryable errors (HTTP 400, 401, 403) are wrapped in `GeminiApiError` and thrown immediately without retrying

**Checkpoint**: At this point, User Stories 1 AND 2 work: basic call + automatic retry on transient errors.

---

## Phase 5: User Story 3 - 15-Second Timeout Enforcement (Priority: P3)

**Goal**: Every Gemini API call attempt is aborted after 15 seconds, throwing `GeminiTimeoutError`.

**Independent Test**: Provide a mock that delays indefinitely. Verify `GeminiTimeoutError` is thrown within ~15.5 seconds (allowing for test overhead).

### Implementation for User Story 3

- [ ] T021 [US3] Integrate `withTimeout()` (built in T012) into `callGeminiOnce()` so every attempt is wrapped in the 15-second timeout
- [ ] T022 [US3] Verify timeout interacts correctly with retry loop: a timeout on attempt 1 counts as a failed attempt and triggers retry if retries remain
- [ ] T023 [US3] Add timeout logging: `console.warn(`[Gemini] Attempt ${attempt+1} timed out after ${TIMEOUT_MS}ms`)`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 work: basic call + retry + timeout per attempt.

---

## Phase 6: User Story 4 - Zod Schema Validation (Priority: P4)

**Goal**: All Gemini responses are validated against the caller-provided Zod schema. Invalid responses throw `GeminiValidationError`.

**Independent Test**: Pass a strict Zod schema with required fields. Mock Gemini to return JSON missing required fields. Verify `GeminiValidationError` is thrown with clear issue details.

### Implementation for User Story 4

- [ ] T024 [US4] Ensure `callGeminiOnce()` runs `schema.safeParse(parsed)` on the parsed JSON response
- [ ] T025 [US4] If `safeParse` returns `success: false`, throw `GeminiValidationError` with the `ZodError` as `cause`
- [ ] T026 [US4] Ensure JSON parse errors (malformed JSON from Gemini) are caught separately and throw a descriptive error before Zod validation runs
- [ ] T027 [US4] Verify generic typing: `callGemini<T>()` with `schema: z.ZodSchema<T>` returns `Promise<T>` (TypeScript type check)

**Checkpoint**: All 4 user stories are complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final touches across all user stories.

- [ ] T028 [P] Add JSDoc comments to `callGemini()`, all error classes, and all constants in `lib/gemini.ts`
- [ ] T029 [P] Export all error classes and types from `lib/gemini.ts` for use by downstream features (BE-02, BE-05)
- [ ] T030 Run `quickstart.md` validation: execute `scripts/test-gemini.ts` and confirm real Gemini API call succeeds
- [ ] T031 [P] Verify with `next build` that `lib/gemini.ts` is not included in client bundle (check build output for API key exposure)
- [ ] T032 Document environment variable requirements in project README or `.env.example` file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — delivers MVP `callGemini()`
- **User Story 2 (Phase 4)**: Depends on Phase 3 (refactors `callGemini()`) — adds retry
- **User Story 3 (Phase 5)**: Depends on Phase 3 T012 — integrates timeout into each attempt
- **User Story 4 (Phase 6)**: Depends on Phase 3 T014 — adds validation to response handling
- **Polish (Phase 7)**: Depends on all user stories complete

### Within Each Phase

- Tasks marked [P] can run in parallel (different logical concerns, no file conflicts within same phase)
- T005–T011 (Phase 2) can all run in parallel after T003/T004
- T017 must complete before T018 (Phase 4, sequential refactor)
- T024 must be in same file context as T014 (Phase 6 extends Phase 3 work)

### Parallel Opportunities

```bash
# Phase 2: All error classes can be written in parallel (same file, different classes)
T005: GeminiTimeoutError
T006: GeminiRetryExhaustedError
T007: GeminiValidationError
T008: GeminiApiError
T010: delay() utility
T011: isRetryableError() utility
```

---

## MVP Scope

**Minimum Viable Increment**: Phase 1 (Setup) + Phase 2 (Foundation) + Phase 3 (US1)

After Phase 3, `callGemini()` works for the happy path and can be used immediately by BE-05 (prompt engineering) and BE-02 (simulate API). Retry and timeout can be added incrementally in Phases 4 and 5.

---

## Task Count Summary

| Phase | Tasks | Parallelizable [P] |
|-------|-------|--------------------|
| Setup | 3 | 2 |
| Foundational | 8 | 6 |
| User Story 1 (P1) | 5 | 0 |
| User Story 2 (P2) | 4 | 0 |
| User Story 3 (P3) | 3 | 0 |
| User Story 4 (P4) | 4 | 1 |
| Polish | 5 | 3 |
| **TOTAL** | **32** | **12** |
