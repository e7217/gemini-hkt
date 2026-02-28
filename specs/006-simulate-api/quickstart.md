# Quickstart: BE-06 경로 시뮬레이션 API

**Date**: 2026-02-28
**For**: Developers implementing or testing `POST /api/paths/simulate`

---

## Prerequisites

Before working on BE-06, ensure these are completed:

| Prerequisite | Issue | File | Status Check |
|---|---|---|---|
| Shared TypeScript types | BE-02 | `types/path.ts` | `PathMap`, `PathNode`, `MergePoint`, `PathInfo` interfaces exist |
| Gemini SDK wrapper | BE-04 | `lib/gemini.ts` | `generatePathMap(goal, timeframe)` function exported |
| Prompt template | BE-05 | `lib/prompts.ts` | `buildPrompt(goal, timeframe)` or similar exported |
| Mock data + fallback | BE-07 | `lib/mockData.ts` | `getMockPathMap()` function exported |

---

## Environment Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd <project-root>
npm install
```

### 2. Create `.env.local`

```bash
# .env.local (at project root — gitignored by default)

# Required for live Gemini mode
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: set to "true" for mock mode (no API key needed)
USE_MOCK=false
```

To get a Gemini API key, visit [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Start the development server

```bash
npm run dev
# App available at http://localhost:3000
```

---

## Testing the Endpoint

### Option A: curl (quickest)

**Basic request with goal only (timeframe defaults to "3y")**:
```bash
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "풀스택 개발자 되기"}' \
  | jq .
```

**Request with explicit timeframe**:
```bash
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "의사 되기", "timeframe": "5y"}' \
  | jq .
```

**Verify validation — missing goal (expect HTTP 400)**:
```bash
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Verify validation — invalid timeframe (expect HTTP 400)**:
```bash
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "목표", "timeframe": "10y"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

### Option B: Postman / Insomnia

- Method: `POST`
- URL: `http://localhost:3000/api/paths/simulate`
- Body → raw → JSON:
```json
{
  "goal": "풀스택 개발자 되기",
  "timeframe": "3y"
}
```

### Option C: Node.js / fetch

```javascript
const response = await fetch('http://localhost:3000/api/paths/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ goal: '풀스택 개발자 되기', timeframe: '3y' }),
});
const pathMap = await response.json();
console.log(JSON.stringify(pathMap, null, 2));
```

---

## Mock Mode Usage

Mock mode bypasses Gemini entirely and returns pre-defined data from `lib/mockData.ts`. Use this for:
- Local development without a Gemini API key
- Demo preparation and rehearsals
- Offline testing
- CI/CD environments

### Activate mock mode

**Option 1: Environment variable**
```bash
# In .env.local
USE_MOCK=true
```
Restart the dev server after changing `.env.local`.

**Option 2: Inline for a single request (dev only)**
```bash
# Override environment variable inline (bash)
USE_MOCK=true curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "풀스택 개발자 되기"}'
```
Note: The env var must be set before the Next.js process starts; this inline approach only works if the server is started with `USE_MOCK=true`.

### Verifying mock mode is active

The response body may include `"_isMock": true` in development builds. You can also confirm by checking:
1. Response arrives in under 100ms (Gemini would take 2–10s).
2. Network tab in browser DevTools shows no request to `generativelanguage.googleapis.com`.

---

## Validating the Response Shape

Use this checklist to manually verify a successful response:

```bash
# Save response to file and inspect
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "풀스택 개발자 되기"}' \
  -o response.json

# Check: paths array has exactly 3 entries
cat response.json | jq '.paths | length'  # should output 3

# Check: each path has 4–6 nodes
cat response.json | jq '.paths[].nodes | length'  # should output 4, 5, or 6

# Check: mergePoints has at least 1 entry
cat response.json | jq '.mergePoints | length'  # should output >= 1

# Check: path types
cat response.json | jq '.paths[].type'  # should output "fast", "deep", "risk"
```

---

## Deployment

### Vercel

1. Push to the connected GitHub branch.
2. Set environment variables in Vercel dashboard:
   - Settings → Environment Variables → Add:
     - `GEMINI_API_KEY` = your key (mark as Production Secret)
     - `USE_MOCK` = `false` (or omit; defaults to falsy)
3. Deploy and verify via the Vercel deployment URL.

### Environment Variable Reference

| Variable | Required | Example | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes (live mode) | `AIza...` | Never prefix with `NEXT_PUBLIC_` |
| `USE_MOCK` | No | `true` / `false` | Unset = live mode |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| HTTP 500 on every request | `GEMINI_API_KEY` not set or invalid | Check `.env.local`; restart dev server |
| HTTP 500 with "generatePathMap is not a function" | BE-04 (`lib/gemini.ts`) not implemented | Complete BE-04 first |
| Response returns instantly but has wrong shape | Mock fallback activating; Gemini response failing Zod validation | Check Gemini API key validity; inspect Zod errors in server logs |
| HTTP 400 despite correct body | Wrong `Content-Type` header | Ensure `Content-Type: application/json` is set |
| `USE_MOCK=true` not taking effect | Dev server not restarted after changing `.env.local` | Stop and restart `npm run dev` |
