# API Contract: POST /api/paths/simulate

**Feature**: BE-02 공유 타입 정의 | **Date**: 2026-02-27

## Overview

This contract defines the request and response types for the path simulation API endpoint. The endpoint accepts a user's goal and generates a 3-path `PathMap` using the Gemini AI model.

## Endpoint

```
POST /api/paths/simulate
```

## Request

**Type**: `SimulateRequest`

```typescript
type SimulateRequest = {
  goal: string;             // Required. User's goal in natural language.
  timeframe?: "1y" | "3y" | "5y";  // Optional. Default: "3y" (convention)
};
```

**Example**:
```json
{
  "goal": "풀스택 개발자가 되고 싶다",
  "timeframe": "1y"
}
```

**Validation**:
- `goal` must be non-empty string (runtime validation at API layer)
- `timeframe` is optional; if omitted, prompt defaults to 3-year planning horizon

## Response

**Type**: `SimulateResponse` (= `PathMap`)

```typescript
type SimulateResponse = PathMap;

// Expanded:
interface PathMap {
  startNode: StartGoalNode;    // User's current position
  goalNode: StartGoalNode;     // User's target goal
  paths: Path[];               // Exactly 3 paths (Fast, Deep, Risk)
  mergePoints: MergePoint[];   // 1-2 merge points across paths
}
```

**Example**:
```json
{
  "startNode": {
    "id": "start",
    "title": "현재 위치",
    "description": "현재 당신의 상태"
  },
  "goalNode": {
    "id": "goal",
    "title": "풀스택 개발자",
    "description": "프론트엔드와 백엔드를 모두 다루는 개발자"
  },
  "paths": [
    {
      "id": "fast",
      "name": "Fast Track",
      "color": "#F59E0B",
      "nodes": [
        {
          "id": "fast_node_1",
          "title": "기초 문법 완성",
          "description": "HTML/CSS/JS 핵심 개념 빠르게 습득",
          "duration": "1-2개월",
          "difficulty": "Low",
          "isMergePoint": false,
          "tips": ["유데미 강의 집중 수강", "매일 2시간 코딩"],
          "monthsFromNow": 2
        }
      ]
    }
  ],
  "mergePoints": [
    {
      "id": "merge_1",
      "title": "첫 프로젝트 배포",
      "connectedPaths": ["fast", "deep"],
      "message": "어떤 길을 걸어도 여기서 만날 수 있어요"
    }
  ]
}
```

## Error Responses

| Status | Condition |
|--------|-----------|
| 400 | `goal` is missing or empty |
| 500 | Gemini API call failed |
| 503 | Gemini API rate limit exceeded |

## Notes

- This type contract is defined in `types/path.ts` (BE-02)
- The actual Gemini prompt and JSON schema enforcement is implemented in BE-05
- Runtime validation of the request body is implemented in BE-04
