# Implementation Plan: BE-06 경로 시뮬레이션 API

**Branch**: `001-simulate-api` | **Date**: 2026-02-28 | **Spec**: `specs/001-simulate-api/spec.md`
**Input**: Feature specification from `specs/001-simulate-api/spec.md`

## Summary

Implement `POST /api/paths/simulate` as a Next.js 14+ App Router route handler that accepts a goal string and optional timeframe, calls the Gemini SDK wrapper (`lib/gemini.ts`) with the prompt from `lib/prompts.ts`, validates the response against the Zod PathMap schema, retries once on validation failure, and falls back to mock data (`lib/mockData.ts`) if both attempts fail. When `USE_MOCK=true` is set, the handler bypasses Gemini entirely and returns mock data directly.

## Technical Context

**Language/Version**: TypeScript 5.x with `"strict": true`
**Primary Dependencies**: Next.js 14+ App Router, Zod, `@google/genai` SDK (via `lib/gemini.ts`), mock data from `lib/mockData.ts`
**Storage**: Stateless — no database interaction. Request/response only.
**Testing**: Manual `curl` / HTTP client testing against dev server; mock mode enables offline validation.
**Target Platform**: Vercel (Node.js serverless runtime via Next.js)
**Project Type**: Web service — Next.js App Router API route
**Performance Goals**: Sub-3s response time for Gemini path (Gemini SDK handles its own 15s timeout); sub-100ms for mock mode.
**Constraints**: `GEMINI_API_KEY` must be server-side only (never exposed to client). All functions ≤ 20 lines. Nesting depth ≤ 2. No `any` types.
**Scale/Scope**: Single route file. Depends on BE-04 (`lib/gemini.ts`), BE-05 (`lib/prompts.ts`), BE-07 (`lib/mockData.ts`), BE-02 (`types/path.ts`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Notes |
|-----------|-------|-------|
| **I. YAGNI & SOLID** | PASS | Route handler has one responsibility: validate input, call Gemini or mock, validate output, return. No future-proofing abstractions added. SRP: each helper function does one thing. |
| **II. Abstraction & Class Design** | PASS | Zod schemas are the domain type boundary. PathMap, PathNode etc. are defined once in `types/path.ts`. No raw object literals used as types. |
| **III. Concise Code** | PASS | Route handler split into small helpers: `parseRequest`, `callGeminiWithRetry`, `buildResponse`. Each ≤ 20 lines. |
| **IV. Nesting Depth Limit** | PASS | Retry logic uses early-return pattern. No nested if/try blocks beyond depth 2. |
| **V. TypeScript Strict Typing** | PASS | All types imported from `types/path.ts`. No `any`. Zod `parse` provides type-safe output. External data (Gemini JSON) crosses boundary via Zod schema, not `as` assertion. |
| **VI. Fail-Safe & Graceful Degradation** | PASS | Fallback to mock on Zod failure. All try-catch blocks present. Unhandled rejections prevented. HTTP 500 only for unrecoverable errors; fallback returns 200. |

## Project Structure

### Documentation (this feature)

```text
specs/001-simulate-api/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Zod schemas and TypeScript types
├── quickstart.md        # Developer guide
├── tasks.md             # Detailed task list
└── contracts/
    └── api.md           # API contract
```

### Source Code (repository root)

```text
app/
└── api/
    └── paths/
        └── simulate/
            └── route.ts      # POST handler — primary deliverable for BE-06

lib/
├── gemini.ts                 # Gemini SDK wrapper (BE-04 — prerequisite)
├── prompts.ts                # Prompt template builder (BE-05 — prerequisite)
└── mockData.ts               # Mock PathMap data + fallback logic (BE-07 — prerequisite)

types/
└── path.ts                   # Shared TypeScript interfaces: PathMap, PathNode, etc. (BE-02 — prerequisite)
```

**Structure Decision**: Single Next.js project, App Router convention. The route file is the sole deliverable for BE-06. All library dependencies (lib/, types/) are owned by other issues (BE-02, BE-04, BE-05, BE-07) and treated as external contracts.

## Complexity Tracking

> No constitution violations requiring justification. Retry logic (try + single re-call) is within depth-2 nesting when implemented with early-return helpers.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | — | — |
