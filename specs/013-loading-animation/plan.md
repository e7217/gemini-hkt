# FE-06: 로딩 애니메이션 — Implementation Plan

**Feature ID**: FE-06
**Phase**: Phase 2
**Estimated Time**: 15m
**Spec**: `specs/008-loading-animation/spec.md`

---

## Technical Context

### Stack

- **Next.js 14+ App Router** — `components/LoadingAnimation.tsx` is a Client Component (`'use client'`)
- **TypeScript strict mode** — no `any`, explicit return types on all functions
- **Tailwind CSS** — utility classes for layout, colors, z-index; `transition-opacity` for fade-out
- **CSS `@keyframes`** — `treeGrow` and `spin` defined in `app/globals.css`; no JavaScript animation libraries
- **Zustand** — `useLifePathStore` provides `isLoading: boolean`; no new store state needed
- **React `useEffect`** — manages `setInterval` for message cycling and `setTimeout` for unmount delay

### Key External Contracts

- `useLifePathStore().isLoading: boolean` — source of truth for show/hide trigger
- `app/globals.css` — append `@keyframes treeGrow` and `@keyframes spin` here
- `app/page.tsx` — renders `<LoadingAnimation />` alongside `<PathMap />`; both present in DOM simultaneously so fade-out reveals map beneath

### Performance Considerations

- Gemini API latency: 2–5 seconds typical; loading screen must be engaging across this range
- `setInterval` at 2000ms fires 1–4 times during typical API wait; lightweight
- CSS `@keyframes` runs on the GPU compositor thread — no JavaScript frame budget cost
- `setTimeout(500)` for unmount delay is negligible

---

## Constitution Check

| Principle | Check | Notes |
|-----------|-------|-------|
| **I. YAGNI & SOLID** | PASS | Only implement the three user stories. No Framer Motion, no skeleton map overlay. Single responsibility: show loading state with CSS animation. |
| **II. Abstraction & Class Design** | PASS | `LOADING_MESSAGES` is a typed `readonly string[]` constant. No raw literals scattered in JSX. |
| **III. Concise Code** | PASS | `LoadingAnimation` body split into: `useCyclingMessage()` hook (message index logic) and render return. Each ≤ 20 lines. |
| **IV. Nesting Depth Limit** | PASS | JSX: outer overlay div → flex column div → tree div + p tag. Max depth 2. No nested conditionals in JSX. |
| **V. TypeScript Strict Typing** | PASS | `messageIndex: number`, `isVisible: boolean`, no `any`. `LOADING_MESSAGES` typed `as const`. |
| **VI. Fail-Safe & Graceful Degradation** | PASS | If CSS animation not supported, static element still shows. `useEffect` cleanup prevents memory leaks. `prefers-reduced-motion` collapses transition. |

---

## Project Structure

### Documentation (this feature)

```text
specs/008-loading-animation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # CSS animation research
├── data-model.md        # Component props, constants, animation state
├── quickstart.md        # Testing guide
├── tasks.md             # Detailed task list
└── contracts/
    └── loading-api.md   # Component contract and Zustand integration
```

### Source Code (repository root)

```text
app/
└── globals.css                        # ADD: @keyframes treeGrow, @keyframes spin

components/
└── LoadingAnimation.tsx               # NEW: primary deliverable for FE-06

app/
└── page.tsx                           # MODIFY: render <LoadingAnimation /> alongside <PathMap />

store/
└── useLifePathStore.ts                # READ-ONLY: isLoading boolean consumed here
```

**Structure Decision**: Single component file. CSS keyframes go into the existing `globals.css` — no new stylesheet. The component reads `isLoading` from the existing Zustand store with no store modifications.

---

## Component Architecture

### `components/LoadingAnimation.tsx`

The component has two primary concerns separated into two `useEffect` calls:

**Effect 1 — Message Cycling**:
```
useEffect(() => {
  const id = setInterval(() => {
    setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
  }, 2000)
  return () => clearInterval(id)
}, [])
```

**Effect 2 — Fade-Out + Unmount**:
```
useEffect(() => {
  if (!isLoading) {
    setIsVisible(false)               // triggers CSS opacity transition
    const id = setTimeout(unmount, 500)
    return () => clearTimeout(id)
  }
}, [isLoading])
```

**Unmount Strategy**: The component is rendered conditionally by `app/page.tsx`. Rather than self-unmounting, the parent reads a `shouldRender` flag. Two valid patterns:

- **Pattern A (Recommended)**: `LoadingAnimation` manages its own `shouldRender` internal state; renders `null` after fade-out completes. No parent changes needed beyond adding `<LoadingAnimation />` to page.
- **Pattern B**: Parent passes `isLoading` as prop; parent delays removal. More explicit but adds prop drilling.

Pattern A is preferred for hackathon speed and encapsulation.

### Internal State Flow

```
Mount:
  isVisible = true
  messageIndex = 0
  interval starts (2s cycle)

While isLoading = true:
  messageIndex cycles 0→1→2→3→0...
  CSS opacity: 1 (visible)

When isLoading → false:
  isVisible = false
  CSS opacity transitions: 1 → 0 (500ms)
  setTimeout fires after 500ms:
    shouldRender = false → return null

Unmount:
  clearInterval
  clearTimeout
```

---

## JSX Structure

```
<div>  {/* shouldRender guard */}
  <div  {/* overlay: fixed, inset-0, z-50, flex, items-center, justify-center */}
        {/* style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 500ms ease-out' }} */}
  >
    <div>  {/* flex-col, items-center, gap-6 */}
      <div className="tree-grow-container">  {/* fixed size, relative */}
        <div className="tree-trunk" />       {/* CSS treeGrow animation */}
        <div className="tree-canopy" />      {/* CSS treeGrow animation, delayed */}
      </div>
      <div className="spinner" />            {/* optional: border-based spin */}
      <p>{LOADING_MESSAGES[messageIndex]}</p>
    </div>
  </div>
</div>
```

Max JSX nesting: 3 levels (overlay → column → leaf elements). Acceptable per Constitution rule (content elements at depth 3 are leaf nodes, not logic blocks).

---

## Styling Notes

- Overlay background: `bg-gray-950/90` (matches dark theme `#0a0f1a` equivalent at 90% opacity)
- Tree element color: `text-emerald-400` / `bg-emerald-500` (green, thematic, visible on dark)
- Spinner: `w-12 h-12 border-4 border-gray-700 border-t-emerald-400 rounded-full`; `animation: spin 1s linear infinite`
- Progress message: `text-white text-lg font-medium tracking-wide`
- Sub-message: `text-gray-400 text-sm` (optional "잠시만 기다려 주세요...")
- Z-index: `z-50` (above map and detail panel)

---

## Dependency Map

```
FE-06 depends on:
  BE-01 → Next.js project scaffolding + globals.css exists
  FE-02 → Dark theme CSS variables applied to root (LoadingAnimation inherits them)
  FE-01 → Zustand store (useLifePathStore) exists with isLoading state

FE-06 is depended on by:
  FE-07 → bug fix and UI polish pass
```

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `setInterval` memory leak if cleanup missing | Low | useEffect return always calls clearInterval |
| Overlay blocks map interaction after fade-out | Medium | `pointer-events: none` when `isVisible = false`; unmount after 500ms |
| `isLoading` never returns `false` (API hang) | Low | Zustand `generatePath()` has error handling that sets `isLoading = false`; timeout is upstream concern |
| CSS `@keyframes` name collision with existing globals | Low | Use prefixed names: `treeGrow`, not `grow`; check globals.css before adding |
| Fast API response (< 500ms) leaves no time for animation | Acceptable | Fade-out begins immediately; brief flash of overlay is acceptable for a hackathon |

---

## Implementation Order

1. Add `@keyframes treeGrow` and `@keyframes spin` to `app/globals.css`
2. Create `LOADING_MESSAGES` constant in `components/LoadingAnimation.tsx`
3. Implement message cycling `useEffect` hook
4. Implement fade-out + unmount `useEffect` hook
5. Build JSX with overlay, tree animation div, spinner, message paragraph
6. Add `<LoadingAnimation />` to `app/page.tsx`
7. Manual test: submit goal, observe cycling messages and tree animation
8. Manual test: receive response, verify 500ms fade-out
