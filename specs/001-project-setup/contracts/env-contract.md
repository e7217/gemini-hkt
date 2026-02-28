# Contract: Environment Variables — BE-01 프로젝트 초기 세팅

**Branch**: `001-project-setup` | **Date**: 2026-02-27

## Purpose

Define the environment variable contract for the LifePath project. This contract specifies which variables are required, their format, and security constraints.

## Variables

### GEMINI_API_KEY

| Property | Value |
|----------|-------|
| **Name** | `GEMINI_API_KEY` |
| **Required** | Yes (for production; optional if `USE_MOCK=true`) |
| **Location** | `.env.local` (server-side only) |
| **Format** | String; Google AI Studio API key format (`AIza...`) |
| **Access** | Server-side only (Next.js API routes, Server Components) — NEVER use `NEXT_PUBLIC_` prefix |
| **Validation** | Must be non-empty string when `USE_MOCK=false`; API route should return HTTP 500 with descriptive message if missing |

**Consumer**: `lib/gemini.ts` (created by BE-04)

### USE_MOCK

| Property | Value |
|----------|-------|
| **Name** | `USE_MOCK` |
| **Required** | No (defaults to `false`) |
| **Location** | `.env.local` |
| **Format** | `"true"` or `"false"` (string) |
| **Access** | Server-side only |
| **Purpose** | Switch between live Gemini API and pre-cached mock data; used for demo stability (Plan B fallback) |

**Consumer**: API routes (created by BE-02, BE-04)

## Security Rules

1. **NEVER** prefix Gemini-related variables with `NEXT_PUBLIC_` — this would expose the API key to the client bundle.
2. `.env.local` MUST be listed in `.gitignore`.
3. `.env.example` MUST be committed to the repository as a reference template with placeholder values only.
4. Any API route that requires `GEMINI_API_KEY` must check for its presence and return a clear error if missing, rather than crashing with an unhandled exception.

## .env.example Content

```
# ============================================================
# LifePath Environment Variables
# ============================================================
# Copy this file to .env.local and fill in your values.
# NEVER commit .env.local to version control.

# Google Gemini API Key (required for path generation)
# Get your key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Use mock data instead of live Gemini API (for demo fallback)
# Set to 'true' during demos if API is unavailable
USE_MOCK=false
```

## Validation Behavior

When an API route is called and `GEMINI_API_KEY` is not set:

```typescript
// Expected behavior in API route
if (!process.env.GEMINI_API_KEY && process.env.USE_MOCK !== 'true') {
  return Response.json(
    { error: 'GEMINI_API_KEY is not configured. Set it in .env.local.' },
    { status: 500 }
  );
}
```
