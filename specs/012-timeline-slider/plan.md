# Implementation Plan: FE-05 타임라인 슬라이더 (기간 전환)

**Branch**: `007-timeline-slider` | **Date**: 2026-02-28 | **Spec**: `specs/007-timeline-slider/spec.md`
**Input**: Feature specification from `specs/007-timeline-slider/spec.md`

---

## Summary

Implement the timeline slider for the LifePath map canvas. A `TimelineSlider` component is fixed at the bottom of the React Flow container. Its value is stored in Zustand as `timelineMonths` (default 36). A `filterNodesByMonths` pure function and a `filterEdgesByNodes` pure function produce a filtered node+edge set. A debounced effect triggers dagre layout recalculation and `fitView` whenever the filtered set changes. Newly visible nodes receive a CSS transition class for opacity+scale animation. A pivot plan (3 discrete buttons) is available if the continuous slider proves too complex within the 30-minute time budget.

---

## Technical Context

**Language/Version**: TypeScript 5.x with `"strict": true`

**Primary Dependencies**:
- `@xyflow/react` v12 — `Node`, `Edge`, `useReactFlow` hook, `setNodes`, `setEdges`
- `@dagrejs/dagre` — existing dagre layout util from FE-03
- `zustand` — `useLifePathStore` with new `timelineMonths` field
- `shadcn/ui` — `Slider` component (or native `<input type="range">` as fallback)

**Storage**: No persistence — `timelineMonths` is session-only ephemeral state.

**Testing**: Manual interaction testing. Verify by dragging slider and observing node visibility changes and animation. Debounce timing verified by adding a `console.log` timestamp in the dagre call during development.

**Target Platform**: Vercel (Next.js 14+ App Router, client components)

**Performance Goals**:
- Dagre recalculation fires at most once per 150–200ms during continuous drag
- `fitView` executes within one React render cycle after node positions are set
- CSS transition 300ms — no JavaScript animation library required

**Constraints**:
- All functions max 20 lines (Constitution III)
- Max 2 nesting depth (Constitution IV)
- No `any` types (Constitution V)
- No Framer Motion dependency — pure CSS transitions only
- `TimelineSlider` must not depend on `PathMap` internals — communicates only through Zustand store

**Scale/Scope**:
- 3 new files: `components/TimelineSlider.tsx`, `lib/timelineFilter.ts`, `hooks/useTimelineFilter.ts`
- 1 modified file: `store/useLifePathStore.ts` (add `timelineMonths` + `setTimelineMonths`)
- 1 modified file: `components/PathMap.tsx` or parent — mount `TimelineSlider` and wire up filter effect

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Notes |
|-----------|-------|-------|
| **I. YAGNI & SOLID** | PASS | `filterNodesByMonths` and `filterEdgesByNodes` each do one thing. `TimelineSlider` is UI only — no filtering logic inside it. `useTimelineFilter` encapsulates the dagre side-effect. No future-proofing for sound effects or auto-play. |
| **II. Abstraction & Class Design** | PASS | `Node` and `Edge` types from `@xyflow/react` are used throughout. `FilteredFlowData` defined in `types/timeline.ts` as the single return type. No raw object literals used as types. |
| **III. Concise Code** | PASS | `filterNodesByMonths` fits in ~8 lines. `filterEdgesByNodes` fits in ~5 lines. `useTimelineFilter` hook delegates to helpers. `TimelineSlider` JSX is simple. Each function under 20 lines. |
| **IV. Nesting Depth Limit** | PASS | Filter functions use `Array.filter` (no nesting). Hook uses `useEffect` + `useCallback` (depth 1 in each). JSX max depth 2. |
| **V. TypeScript Strict Typing** | PASS | `Node` and `Edge` from `@xyflow/react`. `timelineMonths: number` in store. Return types explicit on all functions. No `as any`. |
| **VI. Fail-Safe & Graceful Degradation** | PASS | Nodes with missing `monthsFromNow` are treated as always-visible. If dagre throws, the error is caught and existing nodes are preserved. Pivot plan guarantees a working demo even if slider is dropped. |

---

## Pivot Plan: Slider vs. 3 Discrete Buttons

**Decision Point**: If the continuous slider implementation is not stable by the 3:30 mark, switch to the pivot plan immediately.

### Slider (Primary)
- Uses shadcn/ui `Slider` or `<input type="range" min={12} max={60} />`
- Continuous value 12–60 months
- Debounce required
- More impressive for demo

### Pivot Buttons (Fallback)
- Three buttons: "1년" (12), "3년" (36), "5년" (60)
- Same `setTimelineMonths(months)` store action — zero logic change
- No debounce needed (button click is not continuous)
- Simpler implementation, faster to build

```tsx
// Pivot implementation — drop-in replacement for TimelineSlider
function TimelineButtons() {
  const setTimelineMonths = useLifePathStore(s => s.setTimelineMonths)
  const timelineMonths = useLifePathStore(s => s.timelineMonths)
  const options = [{ label: '1년', value: 12 }, { label: '3년', value: 36 }, { label: '5년', value: 60 }]
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button key={o.value} onClick={() => setTimelineMonths(o.value)}
          className={timelineMonths === o.value ? 'ring-2 ring-white' : ''}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
```

**Pivot Trigger Criteria**: If `TimelineSlider` + debounce + animation is not working in 20 minutes, pivot to buttons. The core demo value (1y→3y→5y expansion) is identical.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-timeline-slider/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Types and Zustand store extension
├── quickstart.md        # Testing guide
├── tasks.md             # Detailed task list
└── contracts/
    └── slider-api.md    # Component contracts
```

### Source Code (repository root)

```text
components/
├── TimelineSlider.tsx        # PRIMARY DELIVERABLE — slider UI component
└── PathMap.tsx               # MODIFIED — mount TimelineSlider, wire filter effect

lib/
└── timelineFilter.ts         # NEW — filterNodesByMonths, filterEdgesByNodes pure functions

hooks/
└── useTimelineFilter.ts      # NEW — debounced dagre recalc + fitView effect

store/
└── useLifePathStore.ts       # MODIFIED — add timelineMonths: number, setTimelineMonths

types/
└── timeline.ts               # NEW — FilteredFlowData type (optional, may inline in hook)
```

**File count**: 3 new files + 2 modified files. Within the 30-minute budget.

---

## Implementation Sequence

### Phase 0: Store Extension (2 min)
Add `timelineMonths: number` (default 36) and `setTimelineMonths(months: number)` to `useLifePathStore`.

### Phase 1: Filter Functions (5 min)
Write `filterNodesByMonths` and `filterEdgesByNodes` in `lib/timelineFilter.ts`. Both are pure functions — easy to verify in isolation.

### Phase 2: useTimelineFilter Hook (8 min)
Write `useTimelineFilter` hook in `hooks/useTimelineFilter.ts`. Debounce the `debouncedMonths` value. On change, call filter functions, run dagre layout, call `setNodes`/`setEdges`, then `fitView`.

### Phase 3: TimelineSlider Component (5 min)
Write `TimelineSlider` in `components/TimelineSlider.tsx`. Reads `timelineMonths` from store, calls `setTimelineMonths` on change. Add human-readable label. Position with absolute CSS at map bottom.

### Phase 4: Wire into PathMap (5 min)
Mount `TimelineSlider` inside the React Flow container. Call `useTimelineFilter` hook in `PathMap.tsx` (or the parent). Ensure `fitView` fires after layout.

### Phase 5: Animation (5 min)
Add CSS transition classes on node wrapper divs. Track previously visible node IDs to apply `node-enter` class only to newly appearing nodes.

**Total**: ~30 min. Matches hackathon time budget.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| `useEffect` with debounce + dagre — 2 responsibilities | Dagre recalc must be triggered reactively on `timelineMonths` change; splitting into two effects would create race conditions | One effect with clear comments is simpler than two coordinated effects |
| Node ID tracking for animation | Without tracking, all visible nodes re-animate on every slider move | Simple `Set<string>` ref avoids re-animation on already-visible nodes |
