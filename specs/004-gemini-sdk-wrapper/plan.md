# Implementation Plan: BE-04 Gemini SDK 세팅 + 래퍼 유틸

**Branch**: `001-gemini-sdk-wrapper` | **Date**: 2026-02-27 | **Spec**: `specs/001-gemini-sdk-wrapper/spec.md`
**Input**: Feature specification from `/specs/001-gemini-sdk-wrapper/spec.md`

---

## Summary

Create `lib/gemini.ts`: a server-side TypeScript module that wraps the `@google/genai` SDK to provide a safe, production-ready Gemini API client for the LifePath Next.js application. The wrapper enforces JSON mode, exponential backoff retry (max 3 attempts for HTTP 429/500/503), 15-second timeout per attempt, Zod schema validation of responses, and complete API key isolation server-side. This is the foundational dependency for all AI path generation features.

---

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 14+ project standard)
**Primary Dependencies**: `@google/genai` (new unified SDK), `zod` ≥3.22.0, `next` 14+ (App Router)
**Storage**: N/A — this is a stateless utility module; no database interaction
**Testing**: Jest (optional, per project; `BE-04-gemini-sdk.md` does not require tests in scope)
**Target Platform**: Node.js 18+ server runtime (Vercel serverless functions via Next.js API Routes)
**Project Type**: Next.js library module (not a standalone service)
**Performance Goals**: < 15s per Gemini call (enforced by timeout); retry overhead adds max ~7s (1s + 2s + 4s delays)
**Constraints**: API key must never appear in client bundle; JSON mode required; 3 retry max; 15s timeout per attempt
**Scale/Scope**: Single utility file (`lib/gemini.ts`), ~150–200 lines; consumed by all AI API routes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution not available (`.specify/memory/constitution.md` not found). Constitution Check skipped.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-gemini-sdk-wrapper/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technical research and decisions
├── data-model.md        # Types, constants, error classes
├── quickstart.md        # Validation steps
├── contracts/
│   ├── callGemini.ts    # Primary function contract
│   └── errors.ts        # Error class contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
lib/
└── gemini.ts            # Primary implementation file

# Future: if Zod schemas become shared
lib/
├── gemini.ts
└── schemas/
    ├── pathMap.ts        # PathMapSchema (for BE-02)
    └── branch.ts         # BranchResponseSchema (for BE-04 branch API)
```

**Structure Decision**: Single project structure (Next.js monolith). The `lib/` directory is the standard location for server-side utilities in Next.js 14 App Router projects. No separate backend folder needed.

---

## Phase 0: Research (Complete)

See `research.md` for full findings. Key decisions resolved:

| Question | Decision |
|----------|----------|
| SDK package | `@google/genai` (not `@google/generative-ai`) |
| Model | `gemini-2.0-flash` (project standard per `04-backend-spec.md`) |
| Timeout mechanism | `Promise.race` with explicit timeout promise |
| Retry implementation | Recursive async function with exponential backoff + jitter |
| Server protection | `import "server-only"` + unprefixed env var |
| Zod integration | Generic `schema: z.ZodSchema<T>` parameter on `callGemini<T>()` |

---

## Phase 1: Design (Complete)

See `data-model.md` for types and `contracts/` for interfaces.

### Implementation Phases for `lib/gemini.ts`

#### 1. Constants Block
```typescript
const GEMINI_MODEL = "gemini-2.0-flash" as const;
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 503]);
```

#### 2. Error Classes (4 classes)
- `GeminiTimeoutError`
- `GeminiRetryExhaustedError`
- `GeminiValidationError`
- `GeminiApiError`

#### 3. SDK Client Singleton
```typescript
let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI { ... }
```

#### 4. Internal: isRetryableError(err)
Inspects error message/status to return boolean.

#### 5. Internal: delay(ms)
```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

#### 6. Internal: withTimeout<T>(promise, attemptNum)
Wraps a promise with `Promise.race` and a timeout promise.

#### 7. Internal: callGeminiWithRetry<T>(params, attempt)
Recursive retry loop calling the SDK, handling retryable errors.

#### 8. Public: callGemini<T>(params)
Exported wrapper orchestrating all of the above + Zod validation.

---

## Complexity Tracking

No constitution violations to justify. The design follows Next.js conventions:
- Single file utility
- No additional abstraction layers (repository, service bus, etc.)
- No additional projects beyond what exists
