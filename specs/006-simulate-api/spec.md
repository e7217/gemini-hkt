# Feature Specification: BE-06 경로 시뮬레이션 API

**Feature Branch**: `001-simulate-api`
**Created**: 2026-02-28
**Status**: Draft
**Issue**: [BE-06] POST /api/paths/simulate

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Path Simulation API Call (Priority: P1)

A developer or frontend client sends a valid goal and optional timeframe to the simulate endpoint. Gemini generates three distinct life paths (Fast Track, Deep Dive, Risk Path) with merge points and returns a structured PathMap JSON response.

**Why this priority**: This is the core feature of LifePath. Without a working simulate endpoint, the entire product has no value. Everything else depends on this path working end-to-end.

**Independent Test**: Can be fully tested with a single `curl` or HTTP client call to `POST /api/paths/simulate` with `{ "goal": "풀스택 개발자 되기" }`. Delivers a valid PathMap JSON with three paths.

**Acceptance Scenarios**:

1. **Given** a valid request body `{ "goal": "풀스택 개발자 되기", "timeframe": "3y" }`, **When** `POST /api/paths/simulate` is called, **Then** response is HTTP 200 with a PathMap containing `startNode`, `goalNode`, `paths` (3 entries: fast/deep/risk), and `mergePoints` (at least 1).
2. **Given** a request with only `{ "goal": "의사 되기" }` (no timeframe), **When** the endpoint is called, **Then** response is HTTP 200 with PathMap generated using the default `"3y"` timeframe.
3. **Given** a valid request, **When** Gemini returns a well-formed JSON, **Then** the response `paths` array contains exactly 3 entries with types `"fast"`, `"deep"`, and `"risk"`, each having 4–6 nodes with monotonically increasing `monthsFromNow` values.
4. **Given** an empty `goal` string `{ "goal": "" }`, **When** the endpoint is called, **Then** response is HTTP 400 with a descriptive error message.
5. **Given** a missing `goal` field `{}`, **When** the endpoint is called, **Then** response is HTTP 400 with validation error details.
6. **Given** an invalid `timeframe` value `{ "goal": "목표", "timeframe": "10y" }`, **When** the endpoint is called, **Then** response is HTTP 400.

---

### User Story 2 - Mock Mode for Safe Demo and Development (Priority: P2)

When the `USE_MOCK=true` environment variable is set, the endpoint returns pre-defined mock data immediately without calling the Gemini API. This enables reliable demos and local development without network dependency.

**Why this priority**: Demo safety is critical for a hackathon project. If Gemini is unavailable during a live demo, the product must still function. This is the primary safety net.

**Independent Test**: Set `USE_MOCK=true` in `.env.local`, call `POST /api/paths/simulate` with any goal. Verify no Gemini API call is made (no network request to generativelanguage.googleapis.com) and response is HTTP 200 with valid PathMap mock data.

**Acceptance Scenarios**:

1. **Given** `USE_MOCK=true` is set in the environment, **When** `POST /api/paths/simulate` is called with `{ "goal": "풀스택 개발자 되기" }`, **Then** response is HTTP 200 with the predefined "풀스택 개발자 되기" mock PathMap, and no Gemini API call is made.
2. **Given** `USE_MOCK=true` is set, **When** called with any arbitrary goal, **Then** response is still HTTP 200 with a valid PathMap mock (the generic fallback mock), confirming mock mode bypasses Gemini entirely.
3. **Given** `USE_MOCK=false` (or unset) in the environment, **When** the endpoint is called, **Then** Gemini API is called normally (mock mode is inactive).

---

### User Story 3 - Retry and Fallback on Gemini Response Validation Failure (Priority: P3)

When Gemini returns a response that fails Zod schema validation, the system automatically retries once. If the retry also fails validation, the endpoint falls back to mock data and returns HTTP 200 with valid data rather than crashing.

**Why this priority**: Gemini output can be inconsistent. This resilience layer guarantees the user always receives a usable PathMap rather than a 500 error, upholding the Fail-Safe constitution principle.

**Independent Test**: Inject a mock Gemini wrapper that returns malformed JSON (fails PathMap Zod schema) on the first two calls. Verify the endpoint returns HTTP 200 with mock PathMap data (not a 500 error).

**Acceptance Scenarios**:

1. **Given** Gemini returns a JSON response that fails PathMap Zod validation on the first attempt, **When** the endpoint processes the response, **Then** the system retries the Gemini call exactly once more before falling back.
2. **Given** Gemini fails Zod validation on both the initial call and the retry, **When** fallback is triggered, **Then** response is HTTP 200 with mock PathMap data (not HTTP 500).
3. **Given** Gemini fails Zod validation on the first attempt but succeeds on the retry, **When** the retry returns valid data, **Then** response is HTTP 200 with the Gemini-generated PathMap (retry success, no fallback needed).
4. **Given** the Gemini SDK throws a network error or non-validation exception, **When** the endpoint catches the error, **Then** response is HTTP 500 with a generic error message (network failures are not retried by this layer; the SDK wrapper handles its own exponential backoff).

---

### Edge Cases

- What happens when `goal` is a very long string (e.g., 10,000 characters)? Zod should enforce a max length and return HTTP 400.
- What happens when Gemini returns valid JSON but `paths` has fewer than 3 entries? Zod validation fails and triggers the retry/fallback flow.
- What happens when a `PathNode`'s `monthsFromNow` values are not monotonically increasing within a path? This is a Zod refinement check; validation fails and triggers retry.
- What happens when `mergePoints[].connectedPaths` references a path ID not present in `paths`? This is detected at the application layer or left to the frontend (the spec does not require deep cross-reference validation at the API level).
- What happens when the request body is not valid JSON (malformed)? Next.js returns a 400 before the route handler runs.
- What happens when `GEMINI_API_KEY` is not set? The Gemini SDK wrapper should throw on initialization; the route handler catches this and returns HTTP 500.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a `POST /api/paths/simulate` endpoint in `app/api/paths/simulate/route.ts` using Next.js 14+ App Router conventions.
- **FR-002**: System MUST validate the incoming request body with Zod; `goal` is required (non-empty string), `timeframe` is optional with allowed values `"1y" | "3y" | "5y"` and defaults to `"3y"` when omitted.
- **FR-003**: System MUST call the Gemini SDK wrapper from BE-04 (`lib/gemini.ts`) using the prompt template from BE-05 (`lib/prompts.ts`) when `USE_MOCK` is not `"true"`.
- **FR-004**: System MUST validate the Gemini response against the Zod PathMap schema before returning it; on validation failure, retry the Gemini call exactly once.
- **FR-005**: System MUST fall back to mock data from BE-07 (`lib/mockData.ts`) if the Gemini response fails Zod validation on both the initial attempt and the single retry.
- **FR-006**: System MUST return HTTP 200 with a valid PathMap when `USE_MOCK=true` is set, without making any Gemini API call.
- **FR-007**: System MUST return HTTP 400 for invalid request input (Zod validation failure) and HTTP 500 for unrecoverable Gemini API errors; fallback success always returns HTTP 200.

### Key Entities *(include if feature involves data)*

- **SimulateRequest**: The incoming request payload. Contains `goal: string` (required, 1–500 chars) and `timeframe?: "1y" | "3y" | "5y"` (optional, defaults to `"3y"`). Validated with Zod at the route handler entry point.
- **PathMap**: The primary response entity. Contains `startNode: PathNode`, `goalNode: PathNode`, `paths: PathInfo[]` (exactly 3, types fast/deep/risk), and `mergePoints: MergePoint[]` (at least 1). Validated with Zod before returning to the client. Defined in `types/path.ts` as the single source of truth (Constitution V).
- **PathNode**: A single step on a life path. Fields: `id`, `type` (`'start' | 'step' | 'merge' | 'goal'`), `label`, `description`, `monthsFromNow`, `track`, `difficulty?`, `tips?`.
- **MergePoint**: A convergence point where multiple paths meet. Fields: `id`, `label`, `message`, `connectedPaths: string[]`, `monthsFromNow`.
- **PathInfo**: A complete path definition. Fields: `id`, `type` (`'fast' | 'deep' | 'risk'`), `label`, `nodes: PathNode[]`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `POST /api/paths/simulate` with a valid request body returns HTTP 200 and a valid PathMap JSON in 100% of cases where either Gemini succeeds or mock fallback activates.
- **SC-002**: Request validation rejects malformed input with HTTP 400 in under 50ms (no Gemini call made).
- **SC-003**: When `USE_MOCK=true`, the endpoint responds in under 100ms (no network I/O).
- **SC-004**: In mock mode and fallback mode, the returned PathMap passes the same Zod PathMap schema validation used for Gemini responses.
- **SC-005**: The retry-then-fallback flow results in HTTP 200 (not HTTP 500) for Gemini validation failures, guaranteeing the demo never shows a broken state due to AI inconsistency.
- **SC-006**: The route file (`app/api/paths/simulate/route.ts`) contains no function longer than 20 lines and no nesting deeper than 2 levels, per Constitution III and IV.
