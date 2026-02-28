# Feature Specification: BE-04 Gemini SDK 세팅 + 래퍼 유틸

**Feature Branch**: `001-gemini-sdk-wrapper`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "BE-04 Gemini SDK 세팅 + 래퍼 유틸: @google/genai SDK 설치 및 초기화, Gemini 3.1 Flash 모델 설정, API 키 서버 사이드 보호, JSON mode 설정, 지수 백오프 재시도(최대 3회), 15초 타임아웃, Zod 스키마 검증 래퍼"

## Overview

This feature establishes the foundational Gemini AI SDK integration for the LifePath application. It creates a server-side wrapper utility (`lib/gemini.ts`) that safely encapsulates all Gemini API calls with proper error handling, retry logic, timeout enforcement, and schema validation. This is a prerequisite for all AI-powered path generation features (BE-05 prompt engineering, BE-02 path simulation API).

**Key references from project docs**:
- `docs/04-backend-spec.md` → B1 (Gemini SDK setup), B50 (API key protection)
- `docs/issues/phase-1/BE-04-gemini-sdk.md` → detailed acceptance criteria

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - SDK Initialization and Basic JSON-mode Call (Priority: P1)

A backend developer (or the application) initializes the Gemini SDK and successfully makes a JSON-mode call to retrieve a structured response from the API.

**Why this priority**: This is the atomic foundation. Without a working SDK client that returns valid JSON, no other AI feature can function. P1 because it unblocks all downstream work.

**Independent Test**: Can be tested by calling a helper function that sends a simple prompt to Gemini and receives a JSON response. Success means structured data returns without errors and passes schema validation. No frontend, no database required.

**Acceptance Scenarios**:

1. **Given** `GEMINI_API_KEY` is set as a server-side environment variable, **When** `callGemini({ prompt: "...", schema: SomeZodSchema })` is invoked from a Next.js API Route, **Then** the API call succeeds and returns a validated JavaScript object matching `SomeZodSchema`.
2. **Given** the SDK is initialized, **When** a request is made with `responseMimeType: "application/json"`, **Then** the raw response is valid JSON parseable without errors.
3. **Given** the API key is not set, **When** any Gemini wrapper function is called, **Then** an informative error is thrown server-side (never exposed to client).

---

### User Story 2 - Exponential Backoff Retry on Transient Errors (Priority: P2)

The wrapper automatically retries failed calls (HTTP 429, 500, 503) with exponential backoff, up to 3 attempts, without requiring the caller to implement retry logic.

**Why this priority**: API rate limits and transient server errors are expected in production. Retry logic must be built into the wrapper so all callers benefit automatically.

**Independent Test**: Can be tested by mocking the Gemini API to return HTTP 429 twice, then succeed on the third attempt. Verifies that the wrapper retries exactly 3 times with increasing delays and ultimately returns the successful response.

**Acceptance Scenarios**:

1. **Given** Gemini API returns HTTP 429 (rate limit), **When** the wrapper calls the API, **Then** it retries up to 3 times with exponential backoff (1s → 2s → 4s delays with jitter) before propagating the error.
2. **Given** Gemini API returns HTTP 500, **When** the wrapper calls, **Then** retry behavior is identical to 429.
3. **Given** Gemini API returns HTTP 503, **When** the wrapper calls, **Then** retry behavior is identical to 429.
4. **Given** the API succeeds on the 2nd retry, **When** the call resolves, **Then** the successful response is returned and no error is thrown.
5. **Given** all 3 retries fail, **When** the wrapper exhausts retries, **Then** a descriptive error is thrown indicating retry exhaustion.

---

### User Story 3 - 15-Second Timeout Enforcement (Priority: P3)

Any Gemini API call that takes longer than 15 seconds is automatically aborted and an error is thrown.

**Why this priority**: Prevents hanging requests from blocking Next.js API Route handlers, which could exhaust server connections. Critical for production stability but testable independently.

**Independent Test**: Can be tested by mocking the Gemini API to delay indefinitely. Verifies that the wrapper throws a timeout error after 15 seconds using `AbortController` or `Promise.race`.

**Acceptance Scenarios**:

1. **Given** a Gemini API call takes longer than 15 seconds, **When** the timeout fires, **Then** the request is aborted and a `TimeoutError` (or equivalent) is thrown.
2. **Given** a Gemini API call completes in 14 seconds, **When** it returns, **Then** no timeout error occurs and the response is processed normally.
3. **Given** a timeout occurs during a retry attempt, **When** the error propagates, **Then** the timeout counts as a failed attempt toward the 3-retry maximum.

---

### User Story 4 - Zod Schema Validation of Responses (Priority: P4)

All Gemini API responses are validated against a caller-provided Zod schema before being returned. Invalid responses trigger an error.

**Why this priority**: Gemini is an LLM and may return unexpected JSON shapes. Schema validation acts as a safety net ensuring downstream code always receives well-typed data.

**Independent Test**: Can be tested by calling the wrapper with a strict Zod schema and a mock API response that is missing required fields. Verifies validation error is thrown rather than passing invalid data to the caller.

**Acceptance Scenarios**:

1. **Given** Gemini returns a JSON response that matches the provided Zod schema, **When** validation runs, **Then** the parsed and typed object is returned to the caller.
2. **Given** Gemini returns JSON with missing required fields, **When** Zod validation runs, **Then** a `ZodError` (or wrapped validation error) is thrown.
3. **Given** Gemini returns malformed JSON (not parseable), **When** the wrapper processes it, **Then** a JSON parse error is thrown before Zod validation even runs.
4. **Given** a validation error occurs, **When** the caller handles it, **Then** the error message clearly indicates which fields failed validation.

---

### Edge Cases

- What happens when `GEMINI_API_KEY` environment variable is missing or empty at startup? → Throw at call time with a clear error message; do not crash on module import.
- What happens when the Gemini API returns a non-retryable error (e.g., HTTP 400 invalid request)? → Throw immediately without retrying (only 429/500/503 trigger retries).
- What happens when JSON.parse succeeds but the result is `null` or an empty object? → Zod schema validation should catch this case.
- What happens when jitter calculation produces a delay longer than the timeout? → The timeout always wins; `AbortController` signal is shared across all retry attempts.
- What happens when the SDK is called from a client-side component? → This must be impossible by design; the wrapper file uses `server-only` package or enforces server-side constraints.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize the `@google/genai` SDK (not `@google/generative-ai`) using the `GEMINI_API_KEY` environment variable, accessible only server-side.
- **FR-002**: System MUST configure the Gemini model as `gemini-2.0-flash` (the project's standardized model; note: feature description mentions 3.1 Flash but project docs consistently use `gemini-2.0-flash`).
- **FR-003**: System MUST set `responseMimeType: "application/json"` on all API calls to enforce JSON mode.
- **FR-004**: System MUST retry failed calls for HTTP status codes 429, 500, and 503 with exponential backoff (base delays: 1s, 2s, 4s) plus random jitter, for a maximum of 3 retry attempts.
- **FR-005**: System MUST enforce a 15-second timeout on each Gemini API call using `AbortController` or `Promise.race`.
- **FR-006**: System MUST validate all Gemini API responses against a caller-provided Zod schema before returning data.
- **FR-007**: System MUST expose a primary wrapper function: `callGemini<T>(params: { prompt: string; systemInstruction?: string; schema: ZodSchema<T>; useCache?: boolean }): Promise<T>`.
- **FR-008**: System MUST prevent client-side imports of the Gemini wrapper (API key must never be exposed to the browser).
- **FR-009**: System MUST parse Gemini's JSON string response before running Zod validation.
- **FR-010**: System MUST throw descriptive errors distinguishing between: timeout errors, retry exhaustion, schema validation errors, and non-retryable API errors.

### Key Entities *(include if feature involves data)*

- **GeminiClient**: Singleton or module-level initialized `@google/genai` client bound to `GEMINI_API_KEY`.
- **CallGeminiParams**: Input type for the wrapper — includes `prompt`, optional `systemInstruction`, required Zod `schema`, optional `useCache` flag.
- **RetryPolicy**: Configuration object or constants defining `maxRetries: 3`, `baseDelayMs: 1000`, `retryableStatusCodes: [429, 500, 503]`.
- **TimeoutPolicy**: Configuration constant `TIMEOUT_MS: 15000`.
- **GeminiError**: Structured error class (or discriminated union) with subtypes: `TimeoutError`, `RetryExhaustedError`, `ValidationError`, `ApiError`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `callGemini()` successfully returns a Zod-validated object on a happy-path call (no mocking required in integration test).
- **SC-002**: When Gemini returns HTTP 429 twice, the wrapper retries and returns the successful 3rd response within the expected time window (< 15 seconds total).
- **SC-003**: A call that takes > 15 seconds is aborted within 15.5 seconds (tolerance for test overhead).
- **SC-004**: When Gemini returns JSON that fails Zod validation, a `ZodError` or equivalent is thrown — never silent data corruption.
- **SC-005**: The `GEMINI_API_KEY` does not appear in any client-side bundle (verified by build-time check or `server-only` import enforcement).
- **SC-006**: All retry attempts are logged with attempt number, delay, and error code (observable in server logs).
- **SC-007**: The wrapper function signature is generic enough to accept any Zod schema, confirmed by successful use with at least two different schemas in downstream features.
