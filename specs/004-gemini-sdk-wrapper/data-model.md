# Data Model: BE-04 Gemini SDK 세팅 + 래퍼 유틸

**Branch**: `001-gemini-sdk-wrapper`
**Date**: 2026-02-27

---

## Core Types (lib/gemini.ts)

### GeminiCallParams<T>

Input parameters for the primary wrapper function.

```typescript
interface GeminiCallParams<T> {
  prompt: string;                    // User/system prompt text
  systemInstruction?: string;        // Optional system instruction (Gemini system prompt)
  schema: z.ZodSchema<T>;           // Zod schema for response validation
  useCache?: boolean;               // Future: cache layer hook (default: false)
}
```

### RetryPolicy (constants)

```typescript
const RETRY_POLICY = {
  maxRetries: 3,
  baseDelayMs: 1000,           // 1 second base delay
  retryableStatusCodes: [429, 500, 503],
} as const;
```

### TimeoutPolicy (constants)

```typescript
const TIMEOUT_MS = 15_000;    // 15 seconds per call attempt
```

### GeminiModel (constant)

```typescript
const GEMINI_MODEL = "gemini-2.0-flash" as const;
```

---

## Error Classes

### GeminiTimeoutError

Thrown when a Gemini API call exceeds the 15-second timeout.

```typescript
class GeminiTimeoutError extends Error {
  constructor(attemptNumber: number) {
    super(`Gemini API call timed out after ${TIMEOUT_MS}ms (attempt ${attemptNumber})`);
    this.name = "GeminiTimeoutError";
  }
}
```

### GeminiRetryExhaustedError

Thrown when all retry attempts have been exhausted.

```typescript
class GeminiRetryExhaustedError extends Error {
  constructor(lastError: Error, totalAttempts: number) {
    super(`Gemini API failed after ${totalAttempts} attempts. Last error: ${lastError.message}`);
    this.name = "GeminiRetryExhaustedError";
    this.cause = lastError;
  }
}
```

### GeminiValidationError

Thrown when Zod schema validation fails on the API response.

```typescript
class GeminiValidationError extends Error {
  constructor(zodError: ZodError) {
    super(`Gemini response failed schema validation: ${zodError.message}`);
    this.name = "GeminiValidationError";
    this.cause = zodError;
  }
}
```

### GeminiApiError

Thrown for non-retryable API errors (e.g., HTTP 400, 401, 403).

```typescript
class GeminiApiError extends Error {
  constructor(statusCode: number, message: string) {
    super(`Gemini API error (HTTP ${statusCode}): ${message}`);
    this.name = "GeminiApiError";
    this.statusCode = statusCode;
  }
  statusCode: number;
}
```

---

## Downstream Zod Schemas (defined in consuming modules, not in lib/gemini.ts)

These schemas are defined by downstream features and passed to `callGemini()`. Listed here for reference:

### PathNodeSchema (used by BE-02, BE-05)

```typescript
const PathNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  difficulty: z.enum(["Low", "Medium", "High"]),
  isMergePoint: z.boolean(),
  tips: z.array(z.string()),
  monthsFromNow: z.number(),
});
```

### PathSchema (used by BE-02)

```typescript
const PathSchema = z.object({
  id: z.enum(["fast", "deep", "explorer"]),
  name: z.string(),
  color: z.string(),
  nodes: z.array(PathNodeSchema),
});
```

### PathMapSchema (used by BE-02)

```typescript
const PathMapSchema = z.object({
  startNode: PathNodeSchema,
  goalNode: PathNodeSchema,
  paths: z.array(PathSchema),
  mergePoints: z.array(z.object({
    id: z.string(),
    title: z.string(),
    connectedPaths: z.array(z.string()),
    message: z.string(),
  })),
});
```

---

## Internal State

The Gemini wrapper is stateless — no database or persistent storage involved. The `GoogleGenAI` client instance may be module-level singleton for connection reuse but holds no mutable state.

```typescript
// Module-level singleton (initialized once on first import)
let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}
```
