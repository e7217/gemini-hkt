# Task List: FE-05 타임라인 슬라이더 (기간 전환)

**Branch**: `007-timeline-slider`
**Date**: 2026-02-28
**Spec**: `specs/007-timeline-slider/spec.md`
**Total Estimated Time**: 30 minutes

---

## Phase 1: Setup (2 min)

### TASK-001: Verify Dependencies
- **File**: n/a (verification only)
- **Time**: 1 min
- **Action**:
  - Confirm `@xyflow/react` v12 is in `package.json`
  - Confirm `@dagrejs/dagre` is in `package.json`
  - Confirm shadcn/ui `Slider` exists at `components/ui/slider.tsx`
  - If `Slider` missing: run `npx shadcn@latest add slider` OR plan to use native `<input type="range">`
  - Confirm FE-03 dagre layout utility exists (e.g., `lib/layout.ts` or `lib/dagre.ts`) and identify its export signature
- **Done When**: All dependencies confirmed; dagre util import path noted

### TASK-002: Create New Files
- **Files**: `lib/timelineFilter.ts`, `hooks/useDebounce.ts`, `hooks/useTimelineFilter.ts`, `types/timeline.ts`
- **Time**: 1 min
- **Action**:
  - Create empty files with `'use client'` or plain module headers as appropriate
  - `lib/timelineFilter.ts` — no `'use client'` needed (pure functions)
  - `hooks/useDebounce.ts` — no `'use client'` needed (generic hook)
  - `hooks/useTimelineFilter.ts` — no `'use client'` needed (React hook)
  - `types/timeline.ts` — no `'use client'` needed (types only)
- **Done When**: All 4 files exist and are importable without errors

---

## Phase 2: Foundational — Zustand Store + Debounce Hook (5 min)

### TASK-003: Extend Zustand Store with timelineMonths
- **File**: `store/useLifePathStore.ts`
- **Time**: 2 min
- **Action**:
  - Add `timelineMonths: number` to the store interface (default value: 36)
  - Add `setTimelineMonths: (months: number) => void` to the store interface
  - Add implementation in the `create` body: `timelineMonths: 36, setTimelineMonths: (months) => set({ timelineMonths: months })`
  - Ensure TypeScript strict mode — no `any`
- **Done When**: `useLifePathStore(s => s.timelineMonths)` returns 36 on fresh load; `setTimelineMonths(12)` updates the store

### TASK-004: Implement useDebounce Hook
- **File**: `hooks/useDebounce.ts`
- **Time**: 3 min
- **Action**:
  - Implement generic `useDebounce<T>(value: T, delayMs: number): T`
  - Use `useState` + `useEffect` with `setTimeout` / `clearTimeout` pattern
  - Cleanup function must call `clearTimeout` to prevent memory leaks
  - Max 12 lines total
- **Done When**: Hook returns the same value immediately; after `delayMs` of no change, returns the new value; cancels pending timeout on re-render with new value

---

## Phase 3: US-1 — Filtering Logic + dagre Recalculation (8 min)

### TASK-005: Implement filterNodesByMonths
- **File**: `lib/timelineFilter.ts`
- **Time**: 3 min
- **Action**:
  - Import `Node` from `@xyflow/react`
  - Implement `filterNodesByMonths(nodes: Node[], maxMonths: number): Node[]`
  - Logic: include if `type === 'start'` OR `type === 'goal'` OR `monthsFromNow == null` OR `monthsFromNow <= maxMonths`
  - Return new array, do not mutate input
  - Max 10 lines
- **Done When**: Unit-testable in isolation. `filterNodesByMonths(nodes, 12)` returns only nodes within 12 months plus start/goal nodes

### TASK-006: Implement filterEdgesByNodes
- **File**: `lib/timelineFilter.ts`
- **Time**: 2 min
- **Action**:
  - Import `Edge` from `@xyflow/react`
  - Implement `filterEdgesByNodes(edges: Edge[], visibleNodeIds: Set<string>): Edge[]`
  - Logic: include edge only if `visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)`
  - Return new array, do not mutate input
  - Max 5 lines
- **Done When**: `filterEdgesByNodes(edges, new Set(['start', 'goal']))` returns only edges between start and goal

### TASK-007: Implement useTimelineFilter Hook
- **File**: `hooks/useTimelineFilter.ts`
- **Time**: 3 min
- **Action**:
  - Import `useReactFlow` from `@xyflow/react`
  - Import `useDebounce` from `./useDebounce`
  - Import `filterNodesByMonths`, `filterEdgesByNodes` from `../lib/timelineFilter`
  - Import `getLayoutedElements` (or equivalent) from FE-03's dagre util
  - Use `useDebounce(timelineMonths, debounceMs ?? 175)` to get `debouncedMonths`
  - In a `useEffect` on `[debouncedMonths]`:
    1. Call `filterNodesByMonths(allNodes, debouncedMonths)`
    2. Build `visibleNodeIds = new Set(filteredNodes.map(n => n.id))`
    3. Call `filterEdgesByNodes(allEdges, visibleNodeIds)`
    4. Identify new nodes: IDs not in `seenNodeIds` ref → set `isNew: true` in their data
    5. Call `getLayoutedElements(filteredNodes, filteredEdges)` → `{ nodes, edges }`
    6. Call `setNodes(laidOutNodes)`, `setEdges(laidOutEdges)`
    7. `requestAnimationFrame(() => fitView({ duration: 400, padding: 0.1 }))`
  - After 350ms, clear `isNew` flags via `setNodes`
  - Use `useRef<Set<string>>` for `seenNodeIds` to persist across renders
  - Each helper sub-function max 15 lines; total hook body max 20 lines (split helpers if needed)
- **Done When**: Hook wired into `PathMap.tsx` causes nodes to filter and layout update on slider change

---

## Phase 4: US-2 — Appearance Animation for New Nodes (5 min)

### TASK-008: Add CSS Animation for nodeEnter
- **File**: `app/globals.css` or `styles/animations.css`
- **Time**: 2 min
- **Action**:
  - Add `@keyframes nodeEnter` with `from { opacity: 0; transform: scale(0.8); }` to `to { opacity: 1; transform: scale(1); }`
  - Add `.node-enter { animation: nodeEnter 300ms ease-out forwards; }`
  - Ensure the stylesheet is imported in `app/layout.tsx` or `app/globals.css`
- **Done When**: Manually applying `node-enter` class to a div in the browser shows the animation

### TASK-009: Apply isNew Flag to Custom Node Component
- **File**: Custom node component from FE-03 (e.g., `components/nodes/StepNode.tsx`)
- **Time**: 3 min
- **Action**:
  - Destructure `isNew` from `data` props: `const { label, monthsFromNow, isNew } = data`
  - Add `isNew` to the node data type: `isNew?: boolean`
  - Apply class conditionally on the outer wrapper div: `className={cn('node-wrapper', isNew && 'node-enter')}`
  - Verify `cn` (or `clsx`) is imported for class merging
  - Do not add `isNew` to any node that is not newly appearing (verify TASK-007 sets it only for new nodes)
- **Done When**: Newly appearing nodes show the fade+scale animation; already-visible nodes do not re-animate

---

## Phase 5: US-3 — TimelineSlider UI Component (5 min)

### TASK-010: Implement TimelineSlider Component
- **File**: `components/TimelineSlider.tsx`
- **Time**: 5 min
- **Action**:
  - Add `'use client'` directive
  - Import `useLifePathStore` from `../store/useLifePathStore`
  - Import `Slider` from `../components/ui/slider` (or use native `<input type="range">`)
  - Read `timelineMonths` and `setTimelineMonths` from store
  - Compute human-readable label: if `months % 12 === 0` → `${months / 12}년`; else → `${months}개월`
  - Render:
    ```
    <div style={{ position: 'absolute', bottom: 16, left: 24, right: 24 }}>
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>1년</span>
          <span className="text-white font-medium">{label}</span>
          <span>5년</span>
        </div>
        <Slider min={12} max={60} step={1} value={[timelineMonths]}
          onValueChange={([v]) => setTimelineMonths(v)} />
      </div>
    </div>
    ```
  - If using native `<input type="range">`, replace `Slider` with `<input type="range" min={12} max={60} step={1} value={timelineMonths} onChange={e => setTimelineMonths(Number(e.target.value))} className="w-full accent-amber-400" />`
  - Max 20 lines total in component body
- **Done When**: Slider renders at the bottom of the map with correct default position, label, and drag behavior

### TASK-011: Mount TimelineSlider in PathMap
- **File**: `components/PathMap.tsx` (or equivalent map container)
- **Time**: 2 min (included in TASK-010 budget)
- **Action**:
  - Ensure the ReactFlow container div has `position: relative`
  - Render `<TimelineSlider />` as a sibling to `<ReactFlow>` (not inside it) but inside the relative wrapper
  - Wire `useTimelineFilter` hook in this component with `allNodesRef.current` and `allEdgesRef.current`
  - Set `allNodesRef.current = convertPathMapToNodes(pathMap)` in a `useEffect([pathMap])` (runs once per path generation)
- **Done When**: Slider is visible on the map; dragging it changes visible nodes

---

## Phase 6: Polish — Pivot Buttons Option (5 min, conditional)

### TASK-012: Implement TimelineButtons Pivot Component (if slider fails)
- **File**: `components/TimelineButtons.tsx`
- **Time**: 5 min (only if TASK-010/011 incomplete at 3:50)
- **Action**:
  - Add `'use client'` directive
  - Import `useLifePathStore`
  - Define `OPTIONS = [{ label: '1년', value: 12 }, { label: '3년', value: 36 }, { label: '5년', value: 60 }]` as a const
  - Render 3 buttons that call `setTimelineMonths(option.value)` on click
  - Active button (matching `timelineMonths`) receives `ring-2 ring-amber-400` class
  - Style: `bg-black/60 backdrop-blur-sm rounded-xl p-3 flex gap-2` container
  - Replace `<TimelineSlider />` with `<TimelineButtons />` in `PathMap.tsx` — no other changes needed
  - Max 15 lines total
- **Done When**: 3 buttons render; clicking each triggers the same filtering as the slider; active button highlighted

---

## Task Summary

| Phase | Task | File | Time | US |
|-------|------|------|------|----|
| 1 | TASK-001: Verify deps | n/a | 1m | — |
| 1 | TASK-002: Create files | multiple | 1m | — |
| 2 | TASK-003: Zustand store | `useLifePathStore.ts` | 2m | All |
| 2 | TASK-004: useDebounce | `hooks/useDebounce.ts` | 3m | US-3 |
| 3 | TASK-005: filterNodesByMonths | `lib/timelineFilter.ts` | 3m | US-1 |
| 3 | TASK-006: filterEdgesByNodes | `lib/timelineFilter.ts` | 2m | US-1 |
| 3 | TASK-007: useTimelineFilter | `hooks/useTimelineFilter.ts` | 3m | US-1, US-3 |
| 4 | TASK-008: CSS animation | `globals.css` | 2m | US-2 |
| 4 | TASK-009: Custom node class | `components/nodes/*.tsx` | 3m | US-2 |
| 5 | TASK-010: TimelineSlider | `components/TimelineSlider.tsx` | 5m | US-1, US-3 |
| 5 | TASK-011: Mount in PathMap | `components/PathMap.tsx` | (in 010) | US-1 |
| 6 | TASK-012: Pivot buttons | `components/TimelineButtons.tsx` | 5m (if needed) | US-1 |

**Critical Path**: TASK-003 → TASK-005 → TASK-006 → TASK-007 → TASK-010/011

**Parallel Opportunities**: TASK-004 (useDebounce) can be written in parallel with TASK-005/006 by a second developer.

**Pivot Decision Point**: At 3:50 (20 minutes into FE-05), if TASK-010/011 is not working, pivot immediately to TASK-012. All prior tasks (003–009) remain valid.
