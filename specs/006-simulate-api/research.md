# Research Findings: BE-06 경로 시뮬레이션 API

**Date**: 2026-02-28
**Feature**: `POST /api/paths/simulate`
**Sources**: Next.js 14 App Router docs, Zod docs, @google/genai SDK docs, project constitution

---

## 1. Next.js 14+ App Router API Route Pattern

### Route Handler File Convention

App Router API routes use the file path `app/api/[...]/route.ts` and export named HTTP method functions.

```typescript
// app/api/paths/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  // ... handler logic
  return NextResponse.json(data, { status: 200 });
}
```

Key points:
- The file must be named `route.ts` (not `page.ts`).
- Export named functions matching HTTP verbs: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
- `NextRequest` extends the Web `Request` API; `request.json()` returns `Promise<unknown>`.
- `NextResponse.json()` serializes the response body and sets `Content-Type: application/json`.
- Error responses use `NextResponse.json({ error: "message" }, { status: 400 })`.

### Request Body Parsing

```typescript
// Always type body as unknown, then validate with Zod
const rawBody: unknown = await request.json();
const parsed = SimulateRequestSchema.safeParse(rawBody);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}
const { goal, timeframe } = parsed.data; // fully typed, no any
```

`request.json()` throws on malformed JSON; Next.js itself catches this and returns a 400 before reaching the handler in most cases. Wrapping in try-catch is still recommended for safety.

---

## 2. Zod Validation Patterns

### Request Validation

```typescript
import { z } from 'zod';

const SimulateRequestSchema = z.object({
  goal: z.string().min(1, 'Goal is required').max(500, 'Goal too long'),
  timeframe: z.enum(['1y', '3y', '5y']).default('3y'),
});

type SimulateRequest = z.infer<typeof SimulateRequestSchema>;
```

`safeParse` returns `{ success: true, data }` or `{ success: false, error }` — never throws. Use `safeParse` at API boundaries, `parse` only in internal contexts where failure is a programming error.

### Response Validation (PathMap)

The Zod schema for PathMap mirrors the TypeScript interface in `types/path.ts`. The schema is defined in `data-model.md` and imported into the route handler for validating Gemini output.

```typescript
const result = PathMapSchema.safeParse(geminiOutput);
if (!result.success) {
  // trigger retry logic
}
const pathMap: PathMap = result.data; // type-safe
```

### Retry Pattern with Zod

```typescript
async function callGeminiWithRetry(
  goal: string,
  timeframe: string
): Promise<PathMap | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await generatePathMap(goal, timeframe);
    const parsed = PathMapSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
  }
  return null; // both attempts failed validation
}
```

This keeps nesting at depth 1 inside the for loop with an early return, complying with Constitution IV.

---

## 3. Gemini SDK Usage (`@google/genai`)

### SDK Initialization

The BE-04 spec requires using `@google/genai` (not `@google/generative-ai`). The SDK is initialized server-side only.

```typescript
// lib/gemini.ts (BE-04 deliverable — not implemented here)
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

The `GEMINI_API_KEY` environment variable must never appear in client-side code. In Next.js, any env var without the `NEXT_PUBLIC_` prefix is server-only — safe for use in `lib/` and `app/api/` but inaccessible from `app/` page components.

### JSON Mode

The `gemini-2.0-flash` model (noted in the task description; the BE-04 issue also references `gemini-2.0-flash` via the task's stated model) supports structured JSON output via `responseMimeType`:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  config: {
    systemInstruction: systemInstruction,
    responseMimeType: 'application/json',
  },
});
const text = response.text(); // JSON string
const parsed: unknown = JSON.parse(text);
```

The BE-06 route handler calls `generatePathMap(goal, timeframe)` from `lib/gemini.ts`, which encapsulates all SDK interaction. The route handler does not instantiate the SDK directly.

### Model Note

The task description specifies `gemini-2.0-flash`. The BE-04 issue references `gemini-3.1-flash-preview`. For BE-06 implementation, use whatever model is configured in `lib/gemini.ts` (BE-04). The route handler does not hard-code the model name.

---

## 4. Retry Pattern Implementation

### Design Constraints

- Retry count: exactly 1 retry (2 total attempts) for Zod validation failures.
- Scope: only Zod schema validation failures trigger retry. Network errors, 429/500/503 from Gemini are handled by the SDK wrapper's exponential backoff (BE-04), not by this retry.
- Result on double failure: return `null` to signal fallback needed.

### Implementation Strategy

```typescript
// Helper: call Gemini and validate — returns PathMap or null
async function tryGemini(goal: string, timeframe: string): Promise<PathMap | null> {
  const raw: unknown = await generatePathMap(goal, timeframe);
  const result = PathMapSchema.safeParse(raw);
  return result.success ? result.data : null;
}

// Retry wrapper: try twice, return null if both fail
async function callWithRetry(goal: string, timeframe: string): Promise<PathMap | null> {
  return (await tryGemini(goal, timeframe)) ?? (await tryGemini(goal, timeframe));
}
```

This keeps both functions under 20 lines and nesting at depth 1, satisfying Constitution III and IV.

---

## 5. Environment Variable Pattern

### Required Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes (for live mode) | — | Gemini API authentication key |
| `USE_MOCK` | No | `undefined` (falsy) | Set to `"true"` to bypass Gemini |

### Access Pattern in Next.js

```typescript
// Server-side only (safe in app/api/ and lib/)
const useMock = process.env.USE_MOCK === 'true';
const apiKey = process.env.GEMINI_API_KEY; // never NEXT_PUBLIC_GEMINI_API_KEY
```

### Local Development Setup

Create `.env.local` at the project root (gitignored by default in Next.js):

```bash
GEMINI_API_KEY=your_api_key_here
USE_MOCK=false
```

For mock-only development (no API key needed):

```bash
USE_MOCK=true
```

### Vercel Deployment

Environment variables are set in the Vercel project dashboard under Settings → Environment Variables. `GEMINI_API_KEY` should be marked as a production secret.

---

## 6. Error Response Shape

Consistent error shape across all failure modes:

```typescript
// 400 Bad Request (validation failure)
{ "error": "Invalid request", "details": { ... } }  // Zod flatten() output

// 500 Internal Server Error (Gemini unrecoverable failure)
{ "error": "Path generation failed. Please try again." }
```

Never expose raw stack traces, Gemini error messages, or API key hints in HTTP responses.

---

## 7. Key Decisions

| Decision | Rationale |
|----------|-----------|
| Use `safeParse` for all boundary validation | Never throws; allows graceful 400 response |
| Retry only on Zod validation failure, not network errors | Network retry is BE-04's responsibility (exponential backoff). Mixing concerns would violate SRP. |
| Fallback returns HTTP 200 | User experience must not show an error when mock data is available. Constitution VI requires safe degradation. |
| `USE_MOCK` check is the first branch in the handler | Fast path for demos; short-circuits all Gemini logic |
| Route handler delegates to small helpers | Keeps each function ≤ 20 lines, satisfying Constitution III |
