# FE-01: 목표 입력 화면 UI — Task List

**Total Estimated Time**: 30m
**Phase**: Phase 1

---

## Phase 1: Setup (2m)

### T-01 Verify prerequisites
- Check that `types/path.ts` exports `PathMap` (from BE-02)
- Check that `data/presets.ts` exports `getRandomGoal()` (from BE-03)
- Check that `components/ui/input.tsx` and `components/ui/button.tsx` exist (shadcn/ui)
- Check that `zustand` is in `package.json` (v5+)
- If any are missing: create stubs (see notes below each task)

**Stub for PathMap** (if BE-02 not merged):
```typescript
// types/path.ts — minimal stub
export interface PathMap { paths: unknown[] }
```

**Stub for getRandomGoal** (if BE-03 not merged):
```typescript
// data/presets.ts — minimal stub
export function getRandomGoal() { return { title: '풀스택 개발자 되기' }; }
```

---

## Phase 2: Foundational — Zustand Store Skeleton (8m)

### T-02 Create `store/useLifePathStore.ts`

Create the file with:
- Import `create` from `zustand`
- Import `PathMap` from `@/types/path`
- Define `LifePathStore` interface (state + actions)
- Implement initial state: `goal: ''`, `isLoading: false`, `pathMap: null`, `error: null`
- Implement `setGoal(goal: string)` — simple `set({ goal })`
- Implement `clearError()` — `set({ error: null })`
- Implement `reset()` — `set(initialState)`
- Export `useLifePathStore` as default named export

**File**: `store/useLifePathStore.ts`

```typescript
'use client'; // Not required for Zustand store files, but harmless

import { create } from 'zustand';
import type { PathMap } from '@/types/path';

interface LifePathStore {
  goal: string;
  isLoading: boolean;
  pathMap: PathMap | null;
  error: string | null;
  setGoal: (goal: string) => void;
  generatePath: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useLifePathStore = create<LifePathStore>((set, get) => ({
  goal: '',
  isLoading: false,
  pathMap: null,
  error: null,
  setGoal: (goal) => set({ goal }),
  generatePath: async () => { /* T-03 */ },
  clearError: () => set({ error: null }),
  reset: () => set({ goal: '', isLoading: false, pathMap: null, error: null }),
}));
```

**Verification**: TypeScript compiles with no errors on this file.

---

### T-03 Implement `generatePath()` async action

Inside `useLifePathStore`, fill in the `generatePath` action:

1. Guard: `if (get().goal.trim() === '') return;`
2. `set({ isLoading: true, error: null })`
3. `const response = await fetch('/api/paths/simulate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ goal: get().goal }) })`
4. If `!response.ok`: throw with appropriate error message based on status code
5. `const data: PathMap = await response.json()`
6. `set({ pathMap: data, isLoading: false })`
7. In catch: `set({ error: <localized-message>, isLoading: false })`

**Error message localization**:
```typescript
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Response) {
    if (err.status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (err.status >= 400) return '요청이 올바르지 않습니다. 목표를 다시 확인해주세요.';
  }
  return '경로 생성에 실패했습니다. 다시 시도해주세요.';
};
```

**Verification**:
- Mock the fetch to return a 200 with valid PathMap JSON → `state.pathMap` populated
- Mock the fetch to throw → `state.error` set, `state.isLoading` false

---

## Phase 3: US-1 — GoalInput Component + Generate Flow (8m)

### T-04 Create `components/GoalInput.tsx` skeleton

Create the file with:
- `'use client'` directive (first line)
- Import `useLifePathStore`
- Import `Input` from `@/components/ui/input`
- Import `Button` from `@/components/ui/button`
- Export `GoalInput` function component
- Connect all store selectors: `goal`, `isLoading`, `error`, `setGoal`, `generatePath`, `clearError`

**File skeleton**:
```tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLifePathStore } from '@/store/useLifePathStore';

export function GoalInput() {
  const goal = useLifePathStore((s) => s.goal);
  const isLoading = useLifePathStore((s) => s.isLoading);
  const error = useLifePathStore((s) => s.error);
  const setGoal = useLifePathStore((s) => s.setGoal);
  const generatePath = useLifePathStore((s) => s.generatePath);
  const clearError = useLifePathStore((s) => s.clearError);

  // T-05: form submit handler
  // T-06: JSX layout

  return <div>TODO</div>;
}
```

---

### T-05 Implement form submit handler in `GoalInput`

```tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  void generatePath();
};
```

**Notes**:
- `void` suppresses the floating Promise warning from `generatePath()`
- No additional empty-input guard needed here — store's `generatePath()` already guards internally, and the button is disabled when input is empty

---

### T-06 Build the core JSX layout in `GoalInput`

Implement the full render return:

```tsx
return (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col gap-4 w-full max-w-lg px-4">
      <h1 className="text-2xl font-bold text-center text-foreground">
        나의 인생 경로를 탐색하세요
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          placeholder="이루고 싶은 목표를 입력하세요"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={isLoading}
        />
        {/* T-07: button row with 🎲 */}
        {/* T-08: loading indicator */}
        {/* T-09: error display */}
      </form>
    </div>
  </div>
);
```

**Verification**: Page renders with input and centered layout. Dark theme background visible.

---

## Phase 4: US-2 — 🎲 Random Button + Preset Integration (4m)

### T-07 Add 🎲 button and "경로 생성하기" button row

1. Import `getRandomGoal` from `@/data/presets`
2. Implement `handleRandomGoal`:
   ```tsx
   const handleRandomGoal = () => {
     setGoal(getRandomGoal().title);
   };
   ```
3. Add the button row in the JSX:
   ```tsx
   <div className="flex gap-2">
     <Button
       type="button"
       variant="outline"
       size="icon"
       onClick={handleRandomGoal}
       disabled={isLoading}
       aria-label="랜덤 목표 선택"
     >
       🎲
     </Button>
     <Button
       type="submit"
       disabled={isLoading || goal.trim() === ''}
       className="flex-1"
     >
       경로 생성하기
     </Button>
   </div>
   ```

**Verification**:
- 🎲 click populates the input with a preset goal string
- Clicking 🎲 multiple times produces varied results
- "경로 생성하기" enables once input is non-empty

---

## Phase 5: US-3 — Loading and Error States (5m)

### T-08 Add loading indicator

Import `Loader2` from `lucide-react` and update the submit button:

```tsx
import { Loader2 } from 'lucide-react';

// Inside the Button:
<Button type="submit" disabled={isLoading || goal.trim() === ''} className="flex-1">
  {isLoading ? (
    <span className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      생성 중...
    </span>
  ) : (
    '경로 생성하기'
  )}
</Button>
```

**Verification**: While `isLoading` is true, button shows spinner and "생성 중..." text.

---

### T-09 Add error display

Below the button row:

```tsx
{error && (
  <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
    <span>{error}</span>
    <button
      type="button"
      onClick={clearError}
      className="ml-2 font-bold hover:opacity-70"
      aria-label="에러 닫기"
    >
      ×
    </button>
  </div>
)}
```

**Verification**:
- Error message appears when `state.error !== null`
- Clicking × calls `clearError()` and the message disappears
- Error container does not render when `state.error === null`

---

## Phase 6: Polish — `app/page.tsx` Integration (3m)

### T-10 Update `app/page.tsx` to conditionally render GoalInput or PathMap

**Option A** — Client Component wrapper (recommended):

Create `components/LifePathView.tsx`:
```tsx
'use client';

import { useLifePathStore } from '@/store/useLifePathStore';
import { GoalInput } from './GoalInput';

export function LifePathView() {
  const pathMap = useLifePathStore((s) => s.pathMap);

  if (pathMap) {
    // FE-03 (PathMap) not yet implemented — render placeholder
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">경로 맵 (FE-03에서 구현)</p>
      </div>
    );
  }

  return <GoalInput />;
}
```

Update `app/page.tsx`:
```tsx
import { LifePathView } from '@/components/LifePathView';

export default function Page() {
  return <LifePathView />;
}
```

**Option B** — Direct Client Component (hackathon shortcut):
```tsx
'use client'; // Add this line to page.tsx

import { useLifePathStore } from '@/store/useLifePathStore';
import { GoalInput } from '@/components/GoalInput';

export default function Page() {
  const pathMap = useLifePathStore((s) => s.pathMap);
  return pathMap ? <div>경로 맵 준비 중...</div> : <GoalInput />;
}
```

**Verification**:
- `GoalInput` renders on initial page load
- After successful `generatePath()`, the PathMap placeholder (or real FE-03 component) renders instead of GoalInput

---

## Task Summary

| ID | Task | Phase | Est. |
|----|------|-------|------|
| T-01 | Verify prerequisites + create stubs if needed | Setup | 2m |
| T-02 | Create `useLifePathStore` skeleton with state + simple actions | Foundational | 4m |
| T-03 | Implement `generatePath()` async action with error handling | Foundational | 4m |
| T-04 | Create `GoalInput.tsx` skeleton with store connections | US-1 | 2m |
| T-05 | Implement form submit handler | US-1 | 1m |
| T-06 | Build core JSX layout | US-1 | 5m |
| T-07 | Add 🎲 button + "경로 생성하기" button row | US-2 | 4m |
| T-08 | Add loading indicator (Loader2 spinner) | US-3 | 2m |
| T-09 | Add error display with dismiss button | US-3 | 3m |
| T-10 | Update `app/page.tsx` for conditional GoalInput/PathMap rendering | Polish | 3m |
| **Total** | | | **30m** |
