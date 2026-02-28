# Data Model: 001-prompt-engineering

**Feature**: BE-05 프롬프트 엔지니어링
**Date**: 2026-02-27
**References**: docs/04-backend-spec.md, docs/issues/phase-1/BE-02-shared-types.md, docs/issues/phase-1/BE-05-prompt-engineering.md

## Note

BE-05는 데이터 지속성 레이어를 생성하지 않는다. 이 문서는 `lib/prompts.ts`가 생성하는 프롬프트의 **출력 데이터 모델**(JSON Schema)과 이를 TypeScript로 표현하는 방식을 정의한다. 실제 TypeScript 인터페이스는 BE-02에서 정의된다.

## Module Structure: `lib/prompts.ts`

```typescript
// lib/prompts.ts

/**
 * @module prompts
 * @description LifePath Gemini 프롬프트 엔지니어링 모듈
 * @version 1.0.0
 * @changelog
 * - 1.0.0 (2026-02-27): Initial version. System Instruction, User Prompt template,
 *   JSON Schema, Few-shot example for path simulation.
 */

// ─── Version Management ────────────────────────────────────────────────────
export const PROMPT_VERSION = "1.0.0";

// ─── System Instruction ────────────────────────────────────────────────────
export const SYSTEM_INSTRUCTION: string;

// ─── JSON Response Schema ──────────────────────────────────────────────────
export const PATH_MAP_SCHEMA: object; // Gemini responseSchema 형식

// ─── User Prompt Builder ───────────────────────────────────────────────────
export function buildUserPrompt(goal: string, timeframe: "1y" | "3y" | "5y"): string;

// ─── Timeframe Mapping ─────────────────────────────────────────────────────
export const TIMEFRAME_MONTHS: Record<"1y" | "3y" | "5y", number>;
// { "1y": 12, "3y": 36, "5y": 60 }
```

## Gemini Response JSON Schema (PathMap)

This is the JSON structure that Gemini is instructed to produce, and that BE-06 will consume:

```json
{
  "type": "object",
  "required": ["startNode", "goalNode", "paths", "mergePoints"],
  "properties": {
    "startNode": {
      "type": "object",
      "required": ["id", "title", "description"],
      "properties": {
        "id": { "type": "string", "const": "start" },
        "title": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "goalNode": {
      "type": "object",
      "required": ["id", "title", "description"],
      "properties": {
        "id": { "type": "string", "const": "goal" },
        "title": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "paths": {
      "type": "array",
      "minItems": 3,
      "maxItems": 3,
      "items": {
        "type": "object",
        "required": ["id", "name", "color", "nodes"],
        "properties": {
          "id": { "type": "string", "enum": ["fast", "deep", "explorer"] },
          "name": { "type": "string" },
          "color": { "type": "string" },
          "nodes": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "title", "description", "duration", "difficulty", "isMergePoint", "tips", "monthsFromNow"],
              "properties": {
                "id": { "type": "string" },
                "title": { "type": "string" },
                "description": { "type": "string" },
                "duration": { "type": "string" },
                "difficulty": { "type": "string", "enum": ["Low", "Medium", "High"] },
                "isMergePoint": { "type": "boolean" },
                "tips": { "type": "array", "items": { "type": "string" } },
                "monthsFromNow": { "type": "number", "minimum": 0 }
              }
            }
          }
        }
      }
    },
    "mergePoints": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "title", "connectedPaths", "message"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "connectedPaths": {
            "type": "array",
            "minItems": 2,
            "items": { "type": "string" }
          },
          "message": { "type": "string" }
        }
      }
    }
  }
}
```

## TypeScript Interfaces (from BE-02, used by BE-05)

```typescript
// 이 인터페이스들은 BE-02에서 정의되며, BE-05는 이를 임포트하여 사용함
// lib/types.ts 또는 types/index.ts에서 가져옴

interface PathNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Low" | "Medium" | "High";
  isMergePoint: boolean;
  tips: string[];
  monthsFromNow: number;
}

interface Path {
  id: "fast" | "deep" | "explorer";
  name: string;
  color: string;
  nodes: PathNode[];
}

interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];
  message: string;
}

interface PathMap {
  startNode: Pick<PathNode, "id" | "title" | "description">;
  goalNode: Pick<PathNode, "id" | "title" | "description">;
  paths: Path[];
  mergePoints: MergePoint[];
}
```

## Prompt Content Structure

### System Instruction (English) - Conceptual Content

```
Role: You are a life path simulator. Given a Korean life goal, generate exactly 3 paths.

Path Types:
- fast: Fast Track (4-5 nodes) - Quick achievement, practical steps
- deep: Deep Dive (5-6 nodes) - Thorough learning, deep expertise
- explorer: Explorer/Risk Path (4-5 nodes) - Creative, unconventional approach

Output Format: JSON only. Strictly follow the provided schema.

Merge Point Rules:
- Include 1-2 merge points where paths converge
- Set isMergePoint: true on nodes that are merge points
- List connectedPaths for each merge point
- Write message as a warm, hopeful Korean sentence

monthsFromNow Rules:
- Must be monotonically increasing within each path
- Stay within the requested timeframe (1y=12mo, 3y=36mo, 5y=60mo)

Language: All content fields (title, description, tips, message) MUST be in Korean.
```

### User Prompt Template - Conceptual Content

```
목표: {goal}
기간: {timeframe} ({months}개월)

위 목표를 달성하기 위한 3가지 인생 경로를 생성해주세요.
반드시 한국어로 응답하세요.

[Few-shot Example]
{1 complete example with merge point}

[Actual Request]
이제 실제 요청을 처리해주세요:
목표: {goal}
기간: {timeframe}
```

## Dependency Mapping

| Depends On | Dependency Type | What We Need |
|------------|----------------|--------------|
| BE-02 (공유 TypeScript 타입) | Hard dependency | `PathMap`, `PathNode`, `MergePoint`, `Path` 인터페이스 |
| BE-04 (Gemini SDK 래퍼) | Hard dependency | Gemini API 클라이언트 인스턴스, JSON 모드 설정 |
| BE-06 (경로 시뮬레이션 API) | Downstream consumer | `SYSTEM_INSTRUCTION`, `buildUserPrompt()` 임포트 |
