# API Contract: POST /api/paths/branch

**Feature**: BE-02 공유 타입 정의 | **Date**: 2026-02-27

## Overview

This contract defines the request and response types for the branch selection API endpoint. When a user selects a branch point, this endpoint generates 2 sub-paths from the current position.

## Endpoint

```
POST /api/paths/branch
```

## Request

**Type**: `BranchRequest`

```typescript
type BranchRequest = {
  pathId: string;              // Current path ID (e.g., "fast")
  currentNodeId: string;       // Node ID where branching occurs
  choice?: string;             // Optional user-expressed preference
  currentPathMap: PathMap;     // Full current PathMap (server is stateless)
};
```

**Example**:
```json
{
  "pathId": "fast",
  "currentNodeId": "fast_node_2",
  "choice": "더 실무 중심으로 배우고 싶다",
  "currentPathMap": {
    "startNode": { "id": "start", "title": "현재 위치", "description": "..." },
    "goalNode": { "id": "goal", "title": "풀스택 개발자", "description": "..." },
    "paths": [...],
    "mergePoints": [...]
  }
}
```

**Why `currentPathMap` is required**: The server is stateless and does not store session data. The client must send the full current PathMap so the Gemini prompt can generate contextually appropriate branch sub-paths.

## Response

**Type**: `BranchResponse`

```typescript
type BranchResponse = {
  paths: Path[];               // Exactly 2 new sub-paths
  mergePoints?: MergePoint[];  // Optional new merge points
};
```

**Example**:
```json
{
  "paths": [
    {
      "id": "fast_branch_a",
      "name": "실무 부트캠프",
      "color": "#F59E0B",
      "nodes": [
        {
          "id": "fast_branch_a_node_1",
          "title": "부트캠프 참여",
          "description": "집중 과정으로 실무 스킬 빠르게 확보",
          "duration": "3개월",
          "difficulty": "High",
          "isMergePoint": false,
          "tips": ["국비지원 부트캠프 탐색", "포트폴리오 동시 준비"],
          "monthsFromNow": 5
        }
      ]
    },
    {
      "id": "fast_branch_b",
      "name": "독학 프로젝트",
      "color": "#F59E0B",
      "nodes": [...]
    }
  ],
  "mergePoints": [
    {
      "id": "branch_merge_1",
      "title": "첫 취업",
      "connectedPaths": ["fast_branch_a", "fast_branch_b"],
      "message": "두 길 모두 여기로 이어집니다"
    }
  ]
}
```

## Error Responses

| Status | Condition |
|--------|-----------|
| 400 | `pathId`, `currentNodeId`, or `currentPathMap` is missing |
| 500 | Gemini API call failed |
| 503 | Gemini API rate limit exceeded |

## Notes

- Branch sub-path IDs are dynamically generated (e.g., `fast_branch_a`) — this is why `Path.id` is `string` not a literal union
- This type contract is defined in `types/path.ts` (BE-02)
- The actual Gemini branch prompt is implemented in BE-05
- Runtime validation is implemented in BE-04
