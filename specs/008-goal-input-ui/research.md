# FE-01: 목표 입력 화면 UI — Research Findings

---

## 1. Zustand v5 Usage Patterns

### Store Creation

Zustand v5 uses `create` from `zustand`. For TypeScript, the store type is passed as a generic:

```typescript
import { create } from 'zustand';

interface BearStore {
  bears: number;
  addBear: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
}));
```

**Key change from v4**: The `immer` middleware and `devtools` are still available but the core `create` API is the same. The `StateCreator` type is used for modular slice patterns.

### Async Actions in Zustand

Async actions are plain async functions inside `create`. They use `set` and `get` to read/update state:

```typescript
const useStore = create<MyStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      set({ data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      set({ error: message, isLoading: false });
    }
  },
}));
```

**For FE-01**: `generatePath()` follows this exact pattern.

### Consuming Store in Components

```typescript
// Select specific slices (prevents unnecessary re-renders)
const goal = useLifePathStore((state) => state.goal);
const setGoal = useLifePathStore((state) => state.setGoal);

// Or destructure multiple fields (causes re-render on any field change)
const { goal, isLoading, generatePath } = useLifePathStore();
```

**Recommended for FE-01**: Use individual selectors for `goal`, `isLoading`, `error`, and actions to minimize re-renders.

### Shallow Equality (optional optimization)

```typescript
import { useShallow } from 'zustand/react/shallow';

const { goal, isLoading } = useLifePathStore(
  useShallow((state) => ({ goal: state.goal, isLoading: state.isLoading }))
);
```

Use `useShallow` when selecting multiple primitive values together.

---

## 2. shadcn/ui Input and Button Components

### Input Component

```typescript
import { Input } from "@/components/ui/input";

// Basic usage
<Input
  type="text"
  placeholder="이루고 싶은 목표를 입력하세요"
  value={goal}
  onChange={(e) => setGoal(e.target.value)}
  disabled={isLoading}
/>
```

**Key props**:
- `value` + `onChange` — controlled input pattern
- `disabled` — grays out and prevents interaction
- `className` — Tailwind overrides via `cn()` merge
- `placeholder` — shown when value is empty

### Button Component

```typescript
import { Button } from "@/components/ui/button";

// Primary CTA
<Button
  onClick={generatePath}
  disabled={isLoading || goal.trim() === ''}
>
  {isLoading ? '생성 중...' : '경로 생성하기'}
</Button>

// Secondary / ghost variant for 🎲
<Button
  variant="outline"
  onClick={handleRandomGoal}
  disabled={isLoading}
  aria-label="랜덤 목표 선택"
>
  🎲
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

**Size variants**: `default`, `sm`, `lg`, `icon` — use `size="icon"` for the 🎲 button if icon-only.

### Loading Spinner with Lucide

```typescript
import { Loader2 } from 'lucide-react';

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? '생성 중...' : '경로 생성하기'}
</Button>
```

`lucide-react` is installed automatically as a peer dependency of shadcn/ui.

---

## 3. Next.js App Router Client Components

### The `'use client'` Directive

Any component that uses React hooks (`useState`, `useEffect`, `useRef`) or browser APIs must be a Client Component. Add `'use client'` at the top of the file:

```typescript
'use client';

import { useLifePathStore } from '@/store/useLifePathStore';

export function GoalInput() {
  const goal = useLifePathStore((state) => state.goal);
  // ...
}
```

**Rules**:
- `'use client'` must be the first line (before imports)
- All child components of a Client Component are automatically treated as Client Components
- Server Components cannot import Client Components with hooks

### Server Component Boundary in `app/page.tsx`

`app/page.tsx` is a Server Component by default. To use Zustand state for conditional rendering, wrap logic in a dedicated Client Component:

```typescript
// app/page.tsx (Server Component — no hooks allowed)
import { LifePathView } from '@/components/LifePathView';

export default function Page() {
  return <LifePathView />;
}

// components/LifePathView.tsx (Client Component)
'use client';
import { useLifePathStore } from '@/store/useLifePathStore';
import { GoalInput } from './GoalInput';
import { PathMap } from './PathMap';

export function LifePathView() {
  const pathMap = useLifePathStore((state) => state.pathMap);
  return pathMap ? <PathMap pathMap={pathMap} /> : <GoalInput />;
}
```

**Alternative for hackathon**: Convert `page.tsx` to a Client Component directly by adding `'use client'` — simpler but loses RSC benefits (acceptable for MVP).

---

## 4. Form Handling Patterns

### Controlled Input + Zustand

The idiomatic pattern for controlled inputs with Zustand:

```typescript
'use client';

export function GoalInput() {
  const goal = useLifePathStore((s) => s.goal);
  const setGoal = useLifePathStore((s) => s.setGoal);
  const generatePath = useLifePathStore((s) => s.generatePath);
  const isLoading = useLifePathStore((s) => s.isLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim() === '') return;
    void generatePath();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
      <Button type="submit" disabled={isLoading || !goal.trim()}>
        경로 생성하기
      </Button>
    </form>
  );
}
```

Using `<form>` with `onSubmit` also enables Enter key submission without extra keydown handlers.

### Error Display Pattern

```typescript
const error = useLifePathStore((s) => s.error);
const clearError = useLifePathStore((s) => s.clearError);

{error && (
  <div className="flex items-center gap-2 text-destructive text-sm">
    <span>{error}</span>
    <button onClick={clearError} aria-label="에러 닫기">×</button>
  </div>
)}
```

### Preventing Double Submission

Zustand's `isLoading` flag gates the submit button's `disabled` prop. This is sufficient for MVP — no need for `useRef` or `useCallback` guards.

---

## 5. Preset Data Integration (BE-03)

```typescript
// data/presets.ts (implemented by BE-03)
export interface PresetGoal {
  id: string;
  category: string;
  title: string;
  description: string;
}

export const PRESET_GOALS: PresetGoal[] = [ /* ... */ ];

export function getRandomGoal(): PresetGoal {
  return PRESET_GOALS[Math.floor(Math.random() * PRESET_GOALS.length)];
}
```

**Usage in GoalInput**:

```typescript
import { getRandomGoal } from '@/data/presets';

const handleRandomGoal = () => {
  const preset = getRandomGoal();
  setGoal(preset.title);
};
```

**Stub if BE-03 not yet merged**:

```typescript
// Temporary stub in store or GoalInput until data/presets.ts is available
function getRandomGoal() {
  return { title: '풀스택 개발자 되기' };
}
```

---

## Summary of Key Patterns for FE-01

| Concern | Pattern |
|---------|---------|
| Store creation | `create<LifePathStore>((set, get) => ({ ... }))` |
| Async action | `async (set) => { set({isLoading:true}); try/catch; set({isLoading:false}) }` |
| Controlled input | `value={goal} onChange={(e) => setGoal(e.target.value)}` |
| Submit guard | `disabled={isLoading \|\| goal.trim() === ''}` |
| Client component | `'use client'` at top of GoalInput.tsx and store consumer |
| Spinner | `<Loader2 className="animate-spin" />` from lucide-react |
| Error display | `{error && <p className="text-destructive">{error}</p>}` |
| Random preset | `setGoal(getRandomGoal().title)` on 🎲 click |
