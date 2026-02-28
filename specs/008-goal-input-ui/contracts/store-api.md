# FE-01: 목표 입력 화면 UI — Store API Contract

**Store**: `useLifePathStore`
**File**: `store/useLifePathStore.ts`
**Type**: Zustand store (client-side, no persistence)

---

## State Fields

### `goal: string`

| Property | Value |
|----------|-------|
| Initial value | `''` (empty string) |
| Type | `string` |
| Updated by | `setGoal()` |
| Consumers | `GoalInput` (controlled input), `generatePath()` (reads before fetch) |

The current value of the goal text input. Reflects every keystroke in real time.

---

### `isLoading: boolean`

| Property | Value |
|----------|-------|
| Initial value | `false` |
| Type | `boolean` |
| Set to `true` | At the start of `generatePath()`, before the fetch call |
| Set to `false` | After fetch resolves (success or error) |
| Consumers | `GoalInput` (disables input + buttons), `app/page.tsx` (optional loading overlay) |

While `isLoading` is `true`:
- Submit button is disabled
- 🎲 button is disabled
- Input field is disabled
- Loading indicator is shown

---

### `pathMap: PathMap | null`

| Property | Value |
|----------|-------|
| Initial value | `null` |
| Type | `PathMap \| null` |
| Set to `PathMap` | On successful `generatePath()` response |
| Set to `null` | On `reset()` |
| Consumers | `app/page.tsx` (conditional rendering: null → GoalInput, non-null → PathMap component) |

`null` means no path has been generated. Non-null means the simulate API returned successfully and the PathMap visualization should be shown.

---

### `error: string | null`

| Property | Value |
|----------|-------|
| Initial value | `null` |
| Type | `string \| null` |
| Set to `string` | When `generatePath()` throws or API returns non-OK response |
| Set to `null` | By `clearError()` or at the start of the next `generatePath()` call |
| Consumers | `GoalInput` (renders error message when non-null) |

The error string is a user-facing Korean message. It must not expose technical details (stack traces, HTTP status codes).

---

## Actions

### `setGoal(goal: string): void`

**Purpose**: Update the `goal` state field.

**Behavior**:
- Accepts any string (no validation at store level)
- Immediately updates `goal` via Zustand `set`
- No side effects

**When called**: On every `onChange` event of the Input component.

**Contract**:
```typescript
setGoal('풀스택 개발자 되기');
// → state.goal === '풀스택 개발자 되기'
```

---

### `generatePath(): Promise<void>`

**Purpose**: Call the simulate API with the current goal and update store state.

**Preconditions**:
- `goal.trim() !== ''` — function is a no-op if goal is empty
- `isLoading === false` — duplicate calls while loading are silently ignored by the disabled button state

**Behavior sequence**:
1. Guard: if `goal.trim() === ''`, return immediately
2. `set({ isLoading: true, error: null })` — clear previous error, start loading
3. `fetch('POST /api/paths/simulate', { body: JSON.stringify({ goal }) })`
4. **On success** (response.ok === true):
   - Parse response as `PathMap`
   - `set({ pathMap: data, isLoading: false })`
5. **On failure** (response.ok === false or network error or parse error):
   - Extract user-friendly message
   - `set({ error: message, isLoading: false })`
6. `pathMap` is never updated on failure; previous `pathMap` is preserved (null on first attempt)

**Error message mapping**:

| Failure type | User-facing message (Korean) |
|--------------|------------------------------|
| Network error / timeout | `'네트워크 오류가 발생했습니다. 연결을 확인해주세요.'` |
| HTTP 4xx | `'요청이 올바르지 않습니다. 목표를 다시 확인해주세요.'` |
| HTTP 5xx | `'서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'` |
| JSON parse error | `'응답을 처리하는 중 오류가 발생했습니다.'` |
| Unknown | `'경로 생성에 실패했습니다. 다시 시도해주세요.'` |

**Contract**:
```typescript
// Initial state
// state.goal === '풀스택 개발자 되기'
// state.isLoading === false

await generatePath();
// During fetch:   state.isLoading === true, state.error === null
// After success:  state.isLoading === false, state.pathMap !== null
// After failure:  state.isLoading === false, state.error !== null, state.pathMap === null
```

**Does NOT**:
- Navigate to another route (navigation is handled by page.tsx watching `pathMap`)
- Validate goal content beyond empty check
- Retry automatically on failure

---

### `clearError(): void`

**Purpose**: Dismiss the current error message.

**Behavior**:
- `set({ error: null })`
- No other state changes

**When called**: When user clicks the error dismiss button in `GoalInput`.

**Contract**:
```typescript
// state.error === '네트워크 오류가 발생했습니다.'
clearError();
// state.error === null
```

---

### `reset(): void`

**Purpose**: Return all state to initial values (for "back" navigation from PathMap to GoalInput).

**Behavior**:
- `set({ goal: '', isLoading: false, pathMap: null, error: null })`

**When called**: When user navigates back from PathMap to GoalInput (e.g., "처음으로" button in PathMap, or browser back).

**Contract**:
```typescript
// state.pathMap === PathMap { ... }
reset();
// state === { goal: '', isLoading: false, pathMap: null, error: null }
```

---

## Invariants

These conditions must always hold. Any state transition that would violate them is a bug:

1. `isLoading === true` → `pathMap` is not updated until `isLoading` returns to `false`
2. `isLoading === true` → `error` is `null` (cleared at start of generatePath)
3. `pathMap !== null` and `error !== null` cannot coexist after a single `generatePath()` call
4. `goal` is never `undefined` — it is always a `string` (empty string as default)

---

## Usage Example

```typescript
// In GoalInput.tsx
'use client';
import { useLifePathStore } from '@/store/useLifePathStore';

export function GoalInput() {
  const goal = useLifePathStore((s) => s.goal);
  const isLoading = useLifePathStore((s) => s.isLoading);
  const error = useLifePathStore((s) => s.error);
  const setGoal = useLifePathStore((s) => s.setGoal);
  const generatePath = useLifePathStore((s) => s.generatePath);
  const clearError = useLifePathStore((s) => s.clearError);

  return (
    <form onSubmit={(e) => { e.preventDefault(); void generatePath(); }}>
      <Input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        disabled={isLoading}
        placeholder="이루고 싶은 목표를 입력하세요"
      />
      <Button type="submit" disabled={isLoading || !goal.trim()}>
        경로 생성하기
      </Button>
      {error && (
        <p className="text-destructive text-sm">
          {error}
          <button onClick={clearError}>×</button>
        </p>
      )}
    </form>
  );
}
```
