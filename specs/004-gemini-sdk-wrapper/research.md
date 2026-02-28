# Research: BE-04 Gemini SDK 세팅 + 래퍼 유틸

**Branch**: `001-gemini-sdk-wrapper`
**Date**: 2026-02-27
**Purpose**: Resolve technical unknowns before implementation design

---

## 1. SDK Package: `@google/genai`

**Finding**: The correct package is `@google/genai` (new unified SDK, released 2024–2025), NOT `@google/generative-ai` (legacy SDK). The project's `BE-04-gemini-sdk.md` explicitly notes this distinction.

**Installation**:
```bash
npm install @google/genai zod
```

**Key API surface**:
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
```

**JSON Mode** (via `responseMimeType`):
```typescript
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
  },
});
const text = result.response.text();
const parsed = JSON.parse(text);
```

---

## 2. Model Specification

**Decision**: Use `gemini-2.0-flash` as specified in `docs/04-backend-spec.md` and `docs/issues/phase-1/BE-04-gemini-sdk.md`.

Note: The feature description mentions `gemini-3.1-flash-preview` but no project documentation supports this model name. The established project standard is `gemini-2.0-flash`. If the model needs to be upgraded in the future, it can be changed in a single constant.

**Model constant location**: `lib/gemini.ts` → `const GEMINI_MODEL = "gemini-2.0-flash" as const`

---

## 3. Exponential Backoff Implementation

**Retryable status codes**: HTTP 429 (rate limit), 500 (internal server error), 503 (service unavailable).

**Standard exponential backoff with jitter**:
```
delay(attempt) = baseDelay * 2^attempt + random(0, 1000ms)
attempt 0 (first retry): 1000ms + jitter
attempt 1 (second retry): 2000ms + jitter
attempt 2 (third retry): 4000ms + jitter
```

**Implementation approach**: `async/await` with recursive retry wrapper. The `@google/genai` SDK throws errors with HTTP status information accessible via `error.status` or `error.message`.

**Error detection**: Parse error message or status code from the thrown `GoogleGenerativeAIError` to determine if it's retryable.

---

## 4. Timeout: AbortController Pattern

**Chosen approach**: `AbortController` + `Promise.race` (preferred over `Promise.race` alone for proper cleanup).

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

try {
  const result = await model.generateContent({
    contents: [...],
    // Pass signal if SDK supports it, or use Promise.race
  });
  clearTimeout(timeoutId);
  return result;
} catch (err) {
  if (controller.signal.aborted) throw new TimeoutError();
  throw err;
}
```

**Alternative if SDK doesn't support AbortSignal**:
```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new TimeoutError("Gemini API timeout")), TIMEOUT_MS)
);
const result = await Promise.race([apiCall(), timeoutPromise]);
```

**Decision**: Use `Promise.race` as the fallback since `@google/genai` SDK's signal support varies by version.

---

## 5. Zod Integration

**Package**: `zod` (already used in project per `docs/04-backend-spec.md` B48).

**Generic wrapper pattern**:
```typescript
import { z, ZodSchema } from "zod";

async function callGemini<T>(params: {
  prompt: string;
  systemInstruction?: string;
  schema: ZodSchema<T>;
}): Promise<T> {
  const raw = await callWithRetryAndTimeout(params);
  const parsed = JSON.parse(raw);
  return params.schema.parse(parsed); // throws ZodError if invalid
}
```

**Zod schema usage by downstream features**: `PathMapSchema` (for BE-02 simulate API), `BranchResponseSchema` (for BE-04 branch API). The wrapper is generic and accepts any schema.

---

## 6. Server-Side Protection

**Approach**:
1. Environment variable: `GEMINI_API_KEY` accessed only via `process.env.GEMINI_API_KEY` in server-side code.
2. Next.js convention: Files in `app/api/` routes or `lib/` server utilities are not bundled client-side unless explicitly imported.
3. Optional: Add `import "server-only"` at the top of `lib/gemini.ts` to throw a build-time error if accidentally imported from a client component.

**Environment variable in Next.js**:
- Variables WITHOUT `NEXT_PUBLIC_` prefix are never exposed to the browser.
- `GEMINI_API_KEY` (no prefix) → server-only ✅

---

## 7. File Location and Interface

**Location**: `lib/gemini.ts` (per `BE-04-gemini-sdk.md`)

**Primary exported function**:
```typescript
export async function callGemini<T>(params: {
  prompt: string;
  systemInstruction?: string;
  schema: z.ZodSchema<T>;
  useCache?: boolean; // Future extension point
}): Promise<T>
```

**Supporting exports**:
```typescript
export class GeminiTimeoutError extends Error { ... }
export class GeminiRetryExhaustedError extends Error { ... }
export class GeminiValidationError extends Error { ... }
```

---

## 8. Dependency Versions

| Package | Version | Notes |
|---------|---------|-------|
| `@google/genai` | Latest stable (≥0.7.0) | New unified SDK |
| `zod` | ≥3.22.0 | Schema validation |
| `typescript` | ≥5.0 | Already in project (Next.js 14) |
| `next` | 14+ | Already in project |

---

## 9. Known Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `@google/genai` API changes between versions | Medium | Pin to specific version in `package.json` |
| `gemini-2.0-flash` model deprecation | Low | Centralize model name in constant for easy update |
| Timeout during retry causing jitter with total budget | Low | Document that timeout is per-attempt |
| Zod schema mismatch between wrapper and actual Gemini output | High | Integration test with real API in dev environment |
