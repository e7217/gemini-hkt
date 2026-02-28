# Data Models: BE-06 경로 시뮬레이션 API

**Date**: 2026-02-28
**Feature**: `POST /api/paths/simulate`

All TypeScript types referenced here are defined in `types/path.ts` as the single source of truth (Constitution V). Zod schemas are defined alongside or adjacent to their TypeScript counterparts for runtime validation.

---

## 1. Request Schema

### TypeScript Interface

```typescript
// types/path.ts (BE-02 deliverable)
interface SimulateRequest {
  goal: string;
  timeframe?: '1y' | '3y' | '5y';
}
```

### Zod Schema

```typescript
// app/api/paths/simulate/route.ts (or lib/schemas.ts)
import { z } from 'zod';

export const SimulateRequestSchema = z.object({
  goal: z
    .string()
    .min(1, { message: 'goal은 필수 항목입니다.' })
    .max(500, { message: 'goal은 500자를 초과할 수 없습니다.' }),
  timeframe: z
    .enum(['1y', '3y', '5y'])
    .default('3y'),
});

export type SimulateRequestParsed = z.infer<typeof SimulateRequestSchema>;
// => { goal: string; timeframe: '1y' | '3y' | '5y' }
// (timeframe always present after parse due to .default('3y'))
```

**Validation rules**:
- `goal`: required, non-empty string, max 500 characters.
- `timeframe`: optional, must be one of `"1y"`, `"3y"`, `"5y"`. Defaults to `"3y"` when omitted.

---

## 2. Response Schema (PathMap)

### TypeScript Interfaces (from BE-02 `types/path.ts`)

```typescript
interface PathNode {
  id: string;
  type: 'start' | 'step' | 'merge' | 'goal';
  label: string;
  description: string;
  monthsFromNow: number;
  track: 'fast' | 'deep' | 'risk';
  difficulty?: 'low' | 'medium' | 'high';
  tips?: string[];
}

interface MergePoint {
  id: string;
  label: string;
  message: string;
  connectedPaths: string[];
  monthsFromNow: number;
}

interface PathInfo {
  id: string;
  type: 'fast' | 'deep' | 'risk';
  label: string;
  nodes: PathNode[];
}

interface PathMap {
  startNode: PathNode;
  goalNode: PathNode;
  paths: PathInfo[];
  mergePoints: MergePoint[];
}
```

### Zod Schemas for PathMap Validation

```typescript
// lib/schemas.ts (or co-located in route.ts)
import { z } from 'zod';

const PathNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['start', 'step', 'merge', 'goal']),
  label: z.string().min(1),
  description: z.string().min(1),
  monthsFromNow: z.number().int().nonnegative(),
  track: z.enum(['fast', 'deep', 'risk']),
  difficulty: z.enum(['low', 'medium', 'high']).optional(),
  tips: z.array(z.string()).optional(),
});

const MergePointSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  message: z.string().min(1),
  connectedPaths: z.array(z.string()).min(2),
  monthsFromNow: z.number().int().nonnegative(),
});

const PathInfoSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['fast', 'deep', 'risk']),
  label: z.string().min(1),
  nodes: z.array(PathNodeSchema).min(4).max(6),
});

export const PathMapSchema = z.object({
  startNode: PathNodeSchema,
  goalNode: PathNodeSchema,
  paths: z.array(PathInfoSchema).length(3),
  mergePoints: z.array(MergePointSchema).min(1),
});

export type PathMapValidated = z.infer<typeof PathMapSchema>;
```

**Validation rules enforced by Zod**:
- `paths` must contain exactly 3 entries.
- Each `PathInfo.nodes` must have between 4 and 6 nodes.
- `mergePoints` must have at least 1 entry.
- `MergePoint.connectedPaths` must reference at least 2 path IDs.
- All `monthsFromNow` values are non-negative integers.
- All string fields are non-empty.

**Note**: Monotonically increasing `monthsFromNow` within each path is enforced in the prompt (BE-05) and is expected from Gemini output. It is not enforced by a Zod `.refine()` at the schema level to keep schema definitions simple (YAGNI — if Gemini respects the prompt constraint, validation at this level adds complexity without benefit). If this becomes a source of bugs, a `.refine()` can be added later.

---

## 3. Error Response Types

### TypeScript Interfaces

```typescript
// Returned for HTTP 400 (request validation failure)
interface ValidationErrorResponse {
  error: 'Invalid request';
  details: z.ZodFormattedError<SimulateRequest>;
}

// Returned for HTTP 500 (unrecoverable Gemini failure)
interface ServerErrorResponse {
  error: string; // user-friendly message, never raw stack trace
}
```

### Example Error Responses

**HTTP 400 — missing goal**:
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

**HTTP 400 — invalid timeframe**:
```json
{
  "error": "Invalid request",
  "details": {
    "timeframe": {
      "_errors": ["Invalid enum value. Expected '1y' | '3y' | '5y', received '10y'"]
    }
  }
}
```

**HTTP 500 — Gemini API failure**:
```json
{
  "error": "경로 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
}
```

---

## 4. Internal Types (Route Handler)

These types are internal to the route handler and not exposed in API responses.

```typescript
// Intermediate result type for Gemini call attempts
type GeminiResult =
  | { success: true; data: PathMap }
  | { success: false; reason: 'validation' | 'network' };
```

---

## 5. Type Dependency Graph

```
types/path.ts (BE-02)
  └── PathMap, PathNode, MergePoint, PathInfo (TypeScript interfaces)

lib/schemas.ts  [or route.ts]
  └── PathMapSchema, SimulateRequestSchema (Zod schemas)
  └── Derives types matching types/path.ts via z.infer<>

app/api/paths/simulate/route.ts (BE-06)
  ├── imports: PathMap from types/path.ts
  ├── imports: PathMapSchema, SimulateRequestSchema from lib/schemas.ts
  ├── imports: generatePathMap from lib/gemini.ts (BE-04)
  └── imports: getMockPathMap from lib/mockData.ts (BE-07)
```
