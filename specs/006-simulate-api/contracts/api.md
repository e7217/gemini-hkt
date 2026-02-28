# API Contract: BE-06 경로 시뮬레이션 API

**Date**: 2026-02-28
**Feature**: `POST /api/paths/simulate`
**Base URL**: `/api` (relative to Next.js app root)

---

## Endpoint: POST /api/paths/simulate

Generates a life path map (PathMap) from a user-supplied goal and timeframe using the Gemini AI API. Returns three distinct paths (Fast Track, Deep Dive, Risk Path) with merge points.

### Request

**Method**: `POST`
**Path**: `/api/paths/simulate`
**Content-Type**: `application/json`

#### Request Body

```json
{
  "goal": "string (required, 1–500 characters)",
  "timeframe": "\"1y\" | \"3y\" | \"5y\" (optional, default: \"3y\")"
}
```

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `goal` | `string` | Yes | — | Min length: 1, Max length: 500 |
| `timeframe` | `"1y" \| "3y" \| "5y"` | No | `"3y"` | Must be one of the three enum values |

#### Example Request

```bash
curl -X POST https://your-app.vercel.app/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "풀스택 개발자 되기", "timeframe": "3y"}'
```

```bash
# Minimal request (timeframe defaults to "3y")
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "의사 되기"}'
```

---

### Response

#### HTTP 200 — Success

Returned when Gemini generates a valid PathMap, OR when mock fallback activates (Zod validation failed on both attempts), OR when `USE_MOCK=true`.

**Content-Type**: `application/json`

```json
{
  "startNode": {
    "id": "start",
    "type": "start",
    "label": "현재 위치",
    "description": "당신의 현재 상태",
    "monthsFromNow": 0,
    "track": "fast"
  },
  "goalNode": {
    "id": "goal",
    "type": "goal",
    "label": "풀스택 개발자",
    "description": "프론트엔드와 백엔드를 모두 다루는 개발자",
    "monthsFromNow": 36,
    "track": "fast"
  },
  "paths": [
    {
      "id": "path-fast-1",
      "type": "fast",
      "label": "빠른 성과 트랙",
      "nodes": [
        {
          "id": "fast-node-1",
          "type": "step",
          "label": "HTML/CSS/JS 기초",
          "description": "웹 개발의 기반을 빠르게 습득합니다.",
          "monthsFromNow": 1,
          "track": "fast",
          "difficulty": "low",
          "tips": ["무료 온라인 강의로 시작하세요", "매일 1시간씩 실습하면 충분합니다"]
        }
      ]
    },
    {
      "id": "path-deep-1",
      "type": "deep",
      "label": "깊이 있는 학습 트랙",
      "nodes": []
    },
    {
      "id": "path-risk-1",
      "type": "risk",
      "label": "모험적 탐험 트랙",
      "nodes": []
    }
  ],
  "mergePoints": [
    {
      "id": "merge-1",
      "label": "첫 번째 프로젝트 완성",
      "message": "어떤 길로 왔든, 여기서 만나는 우리는 이미 성장했습니다.",
      "connectedPaths": ["path-fast-1", "path-deep-1"],
      "monthsFromNow": 12
    }
  ]
}
```

#### HTTP 400 — Bad Request

Returned when request body fails Zod validation (missing `goal`, invalid `timeframe`, etc.).

```json
{
  "error": "Invalid request",
  "details": {
    "goal": {
      "_errors": ["goal은 필수 항목입니다."]
    }
  }
}
```

#### HTTP 405 — Method Not Allowed

Returned by Next.js when any HTTP method other than `POST` is used.

```json
{
  "error": "Method Not Allowed"
}
```

#### HTTP 500 — Internal Server Error

Returned only when Gemini throws an unrecoverable exception (network failure, auth error) AND the route handler itself encounters an unexpected error. Note: Zod validation failures trigger fallback (HTTP 200), not HTTP 500.

```json
{
  "error": "경로 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
}
```

---

### Error Code Summary

| HTTP Status | Condition | Response Body |
|-------------|-----------|---------------|
| `200 OK` | Gemini success, mock mode active, or fallback activated | PathMap JSON |
| `400 Bad Request` | Zod validation failure on request body | `{ error, details }` |
| `405 Method Not Allowed` | Non-POST request | Next.js default |
| `500 Internal Server Error` | Unrecoverable Gemini SDK error | `{ error: string }` |

---

### Behavior Matrix

| `USE_MOCK` | Gemini Result | Zod Validation | Retry | Final Result | HTTP Status |
|------------|---------------|----------------|-------|--------------|-------------|
| `true` | Not called | — | — | Mock PathMap | 200 |
| `false` | Success | Valid | — | Gemini PathMap | 200 |
| `false` | Success | Invalid | Success | Gemini PathMap (retry) | 200 |
| `false` | Success | Invalid | Invalid | Mock PathMap (fallback) | 200 |
| `false` | Exception | — | — | `{ error: "..." }` | 500 |
| `false` | Bad request body | — | — | `{ error, details }` | 400 |

---

### Headers

No custom request headers required. No authentication headers (Gemini API key is server-side only).

**Response Headers** (set by Next.js automatically):
- `Content-Type: application/json`
- `Cache-Control: no-store` (recommended for dynamic AI responses)

---

### Notes

- The endpoint is stateless. No session or user state is stored server-side.
- Response time depends on Gemini API latency (typically 2–10 seconds). Mock mode responds in under 100ms.
- The `_isMock: true` debug flag may be present on mock responses in development builds (controlled by BE-07). It is not part of the official PathMap schema and should not be relied upon by clients.
