# FE-07: Validation Contracts

**Scope**: Client-side input validation for the goal input field. These contracts define the behavior of the `validateGoalInput` utility function and the error message constants used throughout the application.

---

## Function Contract: `validateGoalInput`

### Signature

```typescript
// lib/validation.ts

import { ValidationResult } from '@/types/validation';

export function validateGoalInput(goal: string): ValidationResult
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `goal` | `string` | The raw input value from the goal text field. May be empty, whitespace-only, or any string. |

### Return Value

```typescript
interface ValidationResult {
  valid: boolean;
  message: string | null;
}
```

| Field | Type | When populated |
|-------|------|----------------|
| `valid` | `boolean` | Always present. `true` if submission is allowed. |
| `message` | `string \| null` | Non-null only when `valid` is `false`. Contains a Korean user-facing error message. |

### Behavior Specification

| Input | `valid` | `message` |
|-------|---------|-----------|
| `""` (empty string) | `false` | `"목표를 입력해 주세요."` |
| `"   "` (whitespace only) | `false` | `"목표를 입력해 주세요."` |
| `"\t\n"` (tabs and newlines) | `false` | `"목표를 입력해 주세요."` |
| `"풀스택 개발자 되기"` (normal input) | `true` | `null` |
| `"a"` (single character) | `true` | `null` |
| 100-character string (at limit) | `true` | `null` |
| 101-character string (over limit — should not occur if `maxLength={100}` is applied, but must be handled defensively) | `false` | `"목표는 100자 이내로 입력해 주세요."` |

### Implementation

```typescript
// lib/validation.ts

import { ValidationResult } from '@/types/validation';
import { ERROR_MESSAGES } from '@/lib/errorMessages';

export function validateGoalInput(goal: string): ValidationResult {
  if (goal.trim().length === 0) {
    return { valid: false, message: ERROR_MESSAGES.EMPTY_GOAL };
  }
  if (goal.length > 100) {
    return { valid: false, message: '목표는 100자 이내로 입력해 주세요.' };
  }
  return { valid: true, message: null };
}
```

### Usage in GoalInput Component

```typescript
// The primary usage is as a button disabled condition:
const isSubmitDisabled = isLoading || !validateGoalInput(goal).valid;

<Button disabled={isSubmitDisabled}>경로 생성하기</Button>
```

**Alternative usage** (if inline error message is desired on blur):

```typescript
const [touched, setTouched] = useState(false);
const validation = validateGoalInput(goal);

<Input
  maxLength={100}
  value={goal}
  onChange={(e) => setGoal(e.target.value)}
  onBlur={() => setTouched(true)}
/>
{touched && !validation.valid && (
  <p className="text-sm text-destructive mt-1">{validation.message}</p>
)}
```

---

## Error Message Constants

All user-facing error strings are defined in `lib/errorMessages.ts` as a const object. Components and store actions must import from this file rather than using inline string literals.

### Full Constants Table

```typescript
// lib/errorMessages.ts

export const ERROR_MESSAGES = {
  EMPTY_GOAL: '목표를 입력해 주세요.',
  API_FAILURE: '경로 생성을 실패했습니다. 다시 시도해 주세요.',
  EMPTY_PATH_DATA: '경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요.',
  GOAL_TOO_LONG: '목표는 100자 이내로 입력해 주세요.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
```

### Constant Usage Map

| Constant | Used In | Trigger |
|----------|---------|---------|
| `EMPTY_GOAL` | `validateGoalInput()`, `GoalInput.tsx` | `goal.trim().length === 0` |
| `API_FAILURE` | `useLifePathStore.ts` (`generatePath` catch block) | API call throws or returns error status |
| `EMPTY_PATH_DATA` | `PathMap.tsx` | `pathMap.paths.length === 0` or `pathMap === null` |
| `GOAL_TOO_LONG` | `validateGoalInput()` | `goal.length > 100` (defensive; `maxLength` prevents this in normal use) |

---

## Store Error Assignment Contract

The Zustand store's `generatePath` action sets `error` on failure. This contract specifies the exact string to use:

```typescript
// store/useLifePathStore.ts

import { ERROR_MESSAGES } from '@/lib/errorMessages';

// In generatePath():
try {
  // ... fetch logic
} catch (err) {
  set({ error: ERROR_MESSAGES.API_FAILURE, isLoading: false });
}
```

**Contract invariants**:
1. `error` is set to `null` at the start of every `generatePath()` call (`set({ error: null, isLoading: true })`).
2. `error` is set to `ERROR_MESSAGES.API_FAILURE` in every catch branch of `generatePath()`.
3. `error` is never set to a raw JavaScript Error `message` string (e.g., `err.message`), as those may expose technical details.
4. `clearError()` unconditionally sets `error` to `null`.

---

## Boundary Conditions

### `validateGoalInput` is not called on the API side

This function is client-side only. The API route (`app/api/paths/simulate/route.ts`) has its own Zod validation for the `goal` field. The two validations are independent.

### `maxLength` and `validateGoalInput` are complementary

`maxLength={100}` prevents the user from typing more than 100 characters. `validateGoalInput` provides a defensive check for the `> 100` case in case the input value is set programmatically (e.g., by `setGoal()` in the store) bypassing the HTML attribute.

### No client-side validation for API response shape

FE-07 does not introduce client-side Zod parsing of the API response. The existing behavior (Zod validation happens server-side in the route handler) is retained. The client only checks for empty `paths` array and null `mergePoint` after receiving a successful HTTP response.
