# FE-07: Data Models

**Note**: FE-07 introduces no new database entities or major data structures. All core types (`PathMap`, `PathNode`, `PathEdge`) are defined in `types/path.ts` (BE-02 deliverable) and remain unchanged. This document describes only the minimal types added or clarified during the polish pass.

---

## New Types

### `ValidationResult`

Used by the `validateGoalInput` utility to communicate validation state from the input guard to the UI.

```typescript
// types/validation.ts (new file, minimal)

export interface ValidationResult {
  /** Whether the input is valid and submission should be allowed */
  valid: boolean;
  /** User-facing error message in Korean. Null when valid. */
  message: string | null;
}
```

**Usage**:

```typescript
import { ValidationResult } from '@/types/validation';
import { validateGoalInput } from '@/lib/validation';

const result: ValidationResult = validateGoalInput(goal);
if (!result.valid) {
  // show result.message to the user
}
```

---

### `ErrorMessage`

A string union type for the set of user-facing error messages in the application. Centralizing these as typed constants prevents message drift across components.

```typescript
// types/errors.ts (new file, minimal)

export type ErrorMessage =
  | '목표를 입력해 주세요.'
  | '경로 생성을 실패했습니다. 다시 시도해 주세요.'
  | '경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요.';
```

**Note**: `ErrorMessage` is a documentation-first type. The Zustand store's `error` field is typed as `string | null` (not `ErrorMessage`) to avoid requiring a cast at every assignment. However, all `error` assignments within the store must use one of the `ErrorMessage` literal values.

---

## Existing Types (No Changes)

These types are defined in `types/path.ts` and must not be modified by FE-07:

```typescript
// types/path.ts — excerpt for reference only

export interface PathMap {
  goal: string;
  paths: Path[];
  mergePoint: MergePoint | null;
}

export interface Path {
  id: string;
  trackType: 'fast' | 'deep' | 'risk';
  nodes: PathNode[];
  edges: PathEdge[];
}

export interface PathNode {
  id: string;
  label: string;
  description: string;
  durationMonths: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface MergePoint {
  id: string;
  label: string;
  description: string;
}
```

**Key FE-07 note**: `mergePoint` is typed as `MergePoint | null`. Rendering code that accesses `mergePoint.id` without a null check will throw at runtime when Gemini returns a path without a merge point. The fix is a single null guard:

```typescript
// Correct pattern
if (pathMap.mergePoint) {
  // render merge point node
}

// Incorrect pattern (crashes when mergePoint is null)
const mergeId = pathMap.mergePoint.id; // TypeError: Cannot read properties of null
```

---

## Zustand Store State (No Changes)

The store state shape is defined in FE-01 and is not modified by FE-07. For reference:

```typescript
// store/useLifePathStore.ts — state interface (FE-01 definition)

interface LifePathState {
  goal: string;
  isLoading: boolean;
  pathMap: PathMap | null;
  error: string | null;
}
```

FE-07 only corrects the string literal value assigned to `error` in the catch block of `generatePath()`. The type itself remains `string | null`.

---

## Constants

Error message constants are defined as named exports to ensure consistency across the codebase:

```typescript
// lib/errorMessages.ts (new file, minimal)

export const ERROR_MESSAGES = {
  EMPTY_GOAL: '목표를 입력해 주세요.',
  API_FAILURE: '경로 생성을 실패했습니다. 다시 시도해 주세요.',
  EMPTY_PATH_DATA: '경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
```

**Usage in store**:

```typescript
import { ERROR_MESSAGES } from '@/lib/errorMessages';

// In generatePath() catch block:
set({ error: ERROR_MESSAGES.API_FAILURE, isLoading: false });
```

**Usage in PathMap**:

```typescript
// Empty paths fallback
if (!pathMap || pathMap.paths.length === 0) {
  return <p>{ERROR_MESSAGES.EMPTY_PATH_DATA}</p>;
}
```
