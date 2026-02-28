# FE-01: 목표 입력 화면 UI — Implementation Plan

**Feature ID**: FE-01
**Phase**: Phase 1
**Estimated Time**: 30m

---

## Technical Context

### Stack
- **Next.js 14+ App Router** — `app/page.tsx` is a Server Component by default; `GoalInput` must be a Client Component
- **TypeScript strict mode** — all types explicit, no `any`
- **shadcn/ui** — `Input` and `Button` pre-installed via BE-01 setup
- **Zustand** — lightweight state management for client-side goal/loading/error/pathMap state
- **Tailwind CSS** — utility-first styling, dark theme via `dark:` prefix or CSS variables
- **`data/presets.ts`** — static preset goals from BE-03; `getRandomGoal()` imported directly

### Key External Contracts
- `POST /api/paths/simulate` — accepts `{ goal: string }`, returns `PathMap`
- `getRandomGoal()` from `data/presets.ts` — returns `{ id, category, title, description }`
- `PathMap` type from `types/path.ts` (BE-02)

---

## Constitution Check

| Rule | Applied How |
|------|-------------|
| YAGNI | Only implement B-1 through B-4 (no optional B-6 through B-12) |
| TypeScript no-any | All store fields and component props fully typed |
| Fail-Safe with fallback | `generatePath()` catches all errors; fallback message set in `error` |
| Max 2 nesting depth | Extract sub-components or helper render functions if JSX nests > 2 levels |
| Max 20 line functions | `generatePath()` action split into fetch + parse + set steps if needed |
| SOLID (SRP) | Store handles state logic; component handles rendering only |

---

## Project Structure

```
app/
  page.tsx                    — Server Component shell; conditionally renders GoalInput or PathMap

components/
  GoalInput.tsx               — 'use client' component: input + buttons + error display

store/
  useLifePathStore.ts         — Zustand store: goal, isLoading, pathMap, error + actions

data/
  presets.ts                  — [BE-03] Static preset goals + getRandomGoal() util
                                (already implemented; FE-01 imports it)

types/
  path.ts                     — [BE-02] Shared TypeScript types: PathMap, PathNode, etc.
                                (already implemented; FE-01 imports PathMap)
```

---

## Component Architecture

### `app/page.tsx` (Server Component wrapper)

```tsx
// Minimal: delegates all rendering logic to client components
// Renders <GoalInput /> or <PathMap /> based on Zustand store state
// Must be a thin shell — actual conditional logic lives in a client wrapper
```

Because `page.tsx` is a Server Component, the conditional rendering based on Zustand state must happen inside a Client Component. Two valid patterns:

**Pattern A (Recommended)**: Wrap both views in a single Client Component `<LifePathView />` inside `page.tsx`.

```
app/page.tsx → <LifePathView /> (client)
                 → if !pathMap: <GoalInput />
                 → if pathMap:  <PathMap pathMap={pathMap} />
```

**Pattern B**: Make `page.tsx` a Client Component directly (simpler for hackathon scope, acceptable).

For hackathon speed, Pattern B is acceptable. Pattern A is preferred for scalability.

---

### `components/GoalInput.tsx`

```
Props: none (all state from useLifePathStore)

Renders:
  - Heading/subtitle (brand copy)
  - Input (shadcn/ui) — controlled, bound to goal/setGoal
  - Button row:
    - 🎲 random button (disabled when isLoading)
    - "경로 생성하기" button (disabled when isLoading or goal.trim() === '')
  - Loading indicator (conditional on isLoading)
  - Error display (conditional on error !== null)
```

---

### `store/useLifePathStore.ts`

```
State shape:
  goal: string = ''
  isLoading: boolean = false
  pathMap: PathMap | null = null
  error: string | null = null

Actions:
  setGoal(goal: string): void
  generatePath(): Promise<void>
    - guard: if goal.trim() === '' return
    - set isLoading = true, error = null
    - fetch POST /api/paths/simulate
    - on success: set pathMap = data, isLoading = false
    - on error: set error = message, isLoading = false
  clearError(): void
    - set error = null
  reset(): void
    - set all fields back to initial state
```

---

## Styling Notes

- Dark theme background: `bg-background` (CSS variable from FE-02)
- Center layout: `min-h-screen flex items-center justify-center`
- Input max width: `max-w-lg w-full`
- 🎲 button: `variant="outline"` or `variant="ghost"` to distinguish from primary CTA
- "경로 생성하기": `variant="default"` primary button
- Error text: `text-destructive text-sm` (shadcn/ui color token)
- Loading spinner: inline `<Loader2 className="animate-spin" />` from lucide-react (pre-installed with shadcn/ui)

---

## Dependency Map

```
FE-01 depends on:
  BE-01 → Next.js project scaffolding exists
  BE-02 → types/path.ts exports PathMap (used in store)
  BE-03 → data/presets.ts exports getRandomGoal()
  FE-02 → dark theme CSS variables applied to root (GoalInput inherits them)

FE-01 is depended on by:
  FE-07 → bug fix and polish pass
```

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `page.tsx` Server/Client boundary confusion | Medium | Use explicit `'use client'` in GoalInput; thin page.tsx shell |
| Zustand hydration mismatch (SSR) | Low | Store only used in Client Components; no SSR issue |
| `getRandomGoal()` import not yet available (BE-03 pending) | Medium | Add stub `getRandomGoal()` locally until BE-03 merges |
| `PathMap` type not yet available (BE-02 pending) | Medium | Define inline stub type in store until BE-02 merges |
| shadcn/ui components not installed | Low | BE-01 should include them; verify at start |

---

## Implementation Order

1. Create `store/useLifePathStore.ts` (state foundation, everything depends on it)
2. Create `components/GoalInput.tsx` (main UI, depends on store)
3. Update `app/page.tsx` (wires GoalInput into routing, depends on both)
4. Verify 🎲 button with live `data/presets.ts` (once BE-03 available)
5. Manual test: loading state, error state, success transition
