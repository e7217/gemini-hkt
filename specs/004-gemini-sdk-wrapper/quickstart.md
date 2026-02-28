# Quickstart: BE-04 Gemini SDK 세팅 + 래퍼 유틸

**Branch**: `001-gemini-sdk-wrapper`
**Prerequisites**: BE-01 (project setup complete), Next.js 14+ project running

---

## Step 1: Install Dependencies

```bash
npm install @google/genai zod
```

Verify installation:
```bash
npm ls @google/genai zod
```

---

## Step 2: Configure Environment Variable

Add to `.env.local` (never commit this file):
```env
GEMINI_API_KEY=your_actual_api_key_here
```

Verify it is NOT prefixed with `NEXT_PUBLIC_` — this ensures it stays server-side only.

---

## Step 3: Create the Wrapper File

Create `lib/gemini.ts` with the following structure:

```typescript
// lib/gemini.ts
import "server-only"; // Prevents client-side import
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const GEMINI_MODEL = "gemini-2.0-flash";
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;
const RETRYABLE_CODES = [429, 500, 503];

// Singleton client
let _client: GoogleGenAI | null = null;
function getClient() {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

// Primary export
export async function callGemini<T>(params: {
  prompt: string;
  systemInstruction?: string;
  schema: z.ZodSchema<T>;
  useCache?: boolean;
}): Promise<T> {
  // Implementation: retry loop + timeout + JSON parse + Zod validate
}
```

---

## Step 4: Validate Installation

Create a quick test script `scripts/test-gemini.ts`:

```typescript
// scripts/test-gemini.ts (run with: npx ts-node scripts/test-gemini.ts)
import { callGemini } from "../lib/gemini";
import { z } from "zod";

const TestSchema = z.object({ message: z.string() });

async function main() {
  const result = await callGemini({
    prompt: 'Respond with JSON: { "message": "hello from Gemini" }',
    schema: TestSchema,
  });
  console.log("✅ Success:", result);
}

main().catch(console.error);
```

Expected output:
```
✅ Success: { message: 'hello from Gemini' }
```

---

## Step 5: Test Error Handling

Test retry behavior (requires mocking or rate-limit trigger):
```typescript
// In your API route test
try {
  const result = await callGemini({ prompt: "...", schema: MySchema });
} catch (err) {
  if (err instanceof GeminiTimeoutError) {
    console.error("Request timed out after 15s");
  } else if (err instanceof GeminiRetryExhaustedError) {
    console.error("All 3 retries failed");
  }
}
```

---

## Step 6: Integration with Next.js API Route

```typescript
// app/api/paths/simulate/route.ts
import { callGemini } from "@/lib/gemini";
import { PathMapSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const { goal } = await request.json();

  const pathMap = await callGemini({
    prompt: `Generate 3 life paths for goal: ${goal}`,
    systemInstruction: "You are a life path coach. Return valid JSON.",
    schema: PathMapSchema,
  });

  return Response.json(pathMap);
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `Error: GEMINI_API_KEY is not set` | Add key to `.env.local`, restart dev server |
| `GeminiValidationError` | Check that Gemini prompt explicitly requests the expected JSON structure |
| `GeminiTimeoutError` | Simplify the prompt or reduce expected output size |
| `import "server-only"` build error | You accidentally imported `lib/gemini.ts` from a client component. Move call to an API Route. |
| `Cannot find module '@google/genai'` | Run `npm install @google/genai` |
