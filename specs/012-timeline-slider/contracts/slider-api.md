# Component Contracts: FE-05 타임라인 슬라이더

**Branch**: `007-timeline-slider`
**Date**: 2026-02-28

---

## 1. TimelineSlider Component

### Contract

```ts
// components/TimelineSlider.tsx
'use client'

/**
 * TimelineSlider
 *
 * A slider UI component fixed at the bottom of the React Flow map canvas.
 * Reads timelineMonths from the Zustand store and updates it on drag.
 * Has no external props — fully driven by global store state.
 *
 * Constraints:
 * - Must be rendered inside the ReactFlow container div (not outside the canvas wrapper)
 * - Must use absolute positioning: { position: 'absolute', bottom: 16, left: 24, right: 24 }
 * - Must NOT contain dagre or filtering logic — pure UI adapter only
 *
 * @example
 * // Inside PathMap.tsx, inside the <ReactFlow> container:
 * <div className="relative w-full h-full">
 *   <ReactFlow nodes={...} edges={...} />
 *   <TimelineSlider />
 * </div>
 */
export function TimelineSlider(): JSX.Element
```

### Behavior Contract

| Input Event | Expected Side Effect |
|-------------|----------------------|
| User drags slider | Calls `setTimelineMonths(value)` on every drag frame (immediate store update) |
| User releases slider | No additional action — debounce in `useTimelineFilter` handles layout recalc |
| `timelineMonths` changes in store | Slider thumb position updates to reflect new value |
| Rendered at `timelineMonths = 36` | Slider thumb is at the midpoint of the range |
| Rendered at `timelineMonths = 12` | Slider thumb is at the left end |
| Rendered at `timelineMonths = 60` | Slider thumb is at the right end |

### Visual Contract

```
+--------------------------------------------------+
|  1년  [====|===========================]  5년    |
|            ^ thumb at current value              |
|         현재: 3년 (label above or beside thumb)  |
+--------------------------------------------------+
```

- Label shows human-readable time: `12` → "1년", `24` → "2년", `36` → "3년", `48` → "4년", `60` → "5년"
- For values not on year boundaries: "N개월" (e.g., "18개월")
- Background: semi-transparent dark panel (`bg-black/60 backdrop-blur-sm`)
- Fixed at bottom, full width minus 24px padding on each side

---

## 2. filterNodesByMonths Function

### Contract

```ts
// lib/timelineFilter.ts

/**
 * Returns the subset of nodes that should be visible at the given time horizon.
 *
 * Rules:
 * 1. Include node if node.data.monthsFromNow <= maxMonths
 * 2. Always include node if node.type === 'start'
 * 3. Always include node if node.type === 'goal'
 * 4. Always include node if node.data.monthsFromNow is undefined or null (fail-safe)
 *
 * @param nodes   - Complete unfiltered node array (source of truth)
 * @param maxMonths - Current slider value (12–60)
 * @returns New array of visible nodes. Does not mutate input.
 */
export function filterNodesByMonths(nodes: Node[], maxMonths: number): Node[]
```

### Behavior Table

| Node type | monthsFromNow | maxMonths | Included? |
|-----------|---------------|-----------|-----------|
| `'start'` | 0 | 12 | YES (always) |
| `'goal'` | 60 | 12 | YES (always) |
| `'step'` | 6 | 12 | YES (6 <= 12) |
| `'step'` | 18 | 12 | NO (18 > 12) |
| `'step'` | 18 | 24 | YES (18 <= 24) |
| `'merge'` | 36 | 36 | YES (36 <= 36) |
| `'merge'` | undefined | 12 | YES (fail-safe) |
| `'step'` | 0 | 12 | YES (0 <= 12) |

### Implementation Reference

```ts
export function filterNodesByMonths(nodes: Node[], maxMonths: number): Node[] {
  return nodes.filter(node => {
    if (node.type === 'start' || node.type === 'goal') return true
    const months = node.data?.monthsFromNow as number | undefined
    if (months == null) return true  // fail-safe: show unknown-timing nodes
    return months <= maxMonths
  })
}
```

---

## 3. filterEdgesByNodes Function

### Contract

```ts
// lib/timelineFilter.ts

/**
 * Returns edges where both source and target node IDs are present in visibleNodeIds.
 * Edges with a hidden source or hidden target are excluded to prevent dangling connections.
 *
 * @param edges          - Complete unfiltered edge array (source of truth)
 * @param visibleNodeIds - Set of node IDs that are currently visible
 * @returns New array of visible edges. Does not mutate input.
 */
export function filterEdgesByNodes(edges: Edge[], visibleNodeIds: Set<string>): Edge[]
```

### Behavior Table

| source visible | target visible | Edge included? |
|----------------|----------------|----------------|
| YES | YES | YES |
| YES | NO | NO |
| NO | YES | NO |
| NO | NO | NO |

### Implementation Reference

```ts
export function filterEdgesByNodes(edges: Edge[], visibleNodeIds: Set<string>): Edge[] {
  return edges.filter(edge =>
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  )
}
```

---

## 4. useTimelineFilter Hook

### Contract

```ts
// hooks/useTimelineFilter.ts

interface UseTimelineFilterOptions {
  allNodes: Node[]
  allEdges: Edge[]
  timelineMonths: number
  debounceMs?: number   // default 175
}

/**
 * Side-effect hook that:
 * 1. Debounces timelineMonths by debounceMs
 * 2. On debounced change: filters nodes and edges
 * 3. Annotates newly visible nodes with isNew: true in their data
 * 4. Runs dagre layout on the filtered set
 * 5. Calls setNodes and setEdges with laid-out results
 * 6. Calls fitView via requestAnimationFrame
 * 7. After 350ms, clears isNew flags from node data
 *
 * Must be called inside a ReactFlowProvider context.
 * Must be called in the same component that owns allNodes and allEdges.
 *
 * @returns void — all output is applied via React Flow's setNodes/setEdges
 */
export function useTimelineFilter(options: UseTimelineFilterOptions): void
```

### Side Effects Timeline

```
Slider drag starts
  ↓ (every frame)
timelineMonths updates in store (immediate — for label display)

Drag pauses or ends
  ↓ (after 175ms of inactivity)
debouncedMonths updates
  ↓
filterNodesByMonths(allNodes, debouncedMonths)
  ↓
filterEdgesByNodes(allEdges, visibleNodeIds)
  ↓
Mark newly visible nodes with isNew: true
  ↓
getLayoutedElements(filteredNodes, filteredEdges)
  ↓
setNodes(laidOutNodes)
setEdges(laidOutEdges)
  ↓ (requestAnimationFrame)
fitView({ duration: 400, padding: 0.1 })

  ↓ (350ms later)
Clear isNew: true from node data
```

---

## 5. useDebounce Hook

### Contract

```ts
// hooks/useDebounce.ts

/**
 * Returns a debounced copy of the input value.
 * The returned value only updates after the input value has been stable
 * for at least delayMs milliseconds.
 *
 * @param value   - The value to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * const debouncedMonths = useDebounce(timelineMonths, 175)
 * // debouncedMonths updates 175ms after the last timelineMonths change
 */
export function useDebounce<T>(value: T, delayMs: number): T
```

---

## 6. Store Action Contracts

### setTimelineMonths

```ts
// store/useLifePathStore.ts

/**
 * Updates the timeline slider position.
 * Called on every slider frame (not debounced at store level).
 * The debounce lives in useTimelineFilter, not here.
 *
 * @param months - New slider value, must be in range [12, 60]
 */
setTimelineMonths: (months: number) => void
```

**Contract**: The store does NOT validate the range. The slider UI enforces min=12 and max=60 via HTML attributes. If called with an out-of-range value, the store sets it as-is (defensive: the filtering logic handles edge cases gracefully).

---

## 7. Integration Contract: PathMap + TimelineSlider

```ts
// Wiring contract in components/PathMap.tsx (or equivalent)

// 1. Keep full node/edge set in refs (not derived state)
const allNodesRef = useRef<Node[]>([])  // populated once when pathMap loads
const allEdgesRef = useRef<Edge[]>([])

// 2. Read timelineMonths from store
const timelineMonths = useLifePathStore(s => s.timelineMonths)

// 3. Wire the filter hook
useTimelineFilter({
  allNodes: allNodesRef.current,
  allEdges: allEdgesRef.current,
  timelineMonths,
  debounceMs: 175,
})

// 4. Render TimelineSlider inside the ReactFlow container
// (TimelineSlider reads from and writes to the store independently)
```

**Invariant**: `allNodesRef.current` is set exactly once when `pathMap` is first received from the API. It is never mutated by the timeline filter. The timeline filter always reads from the full unfiltered set.
