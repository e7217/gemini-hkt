# Data Models: FE-05 타임라인 슬라이더

**Branch**: `007-timeline-slider`
**Date**: 2026-02-28

---

## 1. Zustand Store Extension

### Addition to `useLifePathStore`

```ts
// store/useLifePathStore.ts — additions only
// (existing state: goal, isLoading, pathMap, error, setGoal, generatePath, clearError, reset)

interface LifePathStore {
  // --- existing state ---
  goal: string
  isLoading: boolean
  pathMap: PathMap | null
  error: string | null

  // --- FE-05 additions ---
  timelineMonths: number          // current slider value; range 12–60; default 36

  // --- existing actions ---
  setGoal: (goal: string) => void
  generatePath: () => Promise<void>
  clearError: () => void
  reset: () => void

  // --- FE-05 additions ---
  setTimelineMonths: (months: number) => void
}

// Store slice (Zustand create body):
timelineMonths: 36,
setTimelineMonths: (months) => set({ timelineMonths: months }),
```

**Constraints**:
- `timelineMonths` is always in the range `[12, 60]` — enforced by slider min/max, not by the store itself
- Default value of 36 shows the 3-year view on first load, matching the default demo scenario
- The store does NOT hold the filtered nodes/edges — those are derived in the hook and passed directly to React Flow

---

## 2. FilteredFlowData Type

```ts
// types/timeline.ts
import type { Node, Edge } from '@xyflow/react'

/**
 * The result of applying timeline filtering + dagre layout.
 * Passed directly to React Flow setNodes / setEdges.
 */
export interface FilteredFlowData {
  nodes: Node[]
  edges: Edge[]
}
```

**Note**: This type may be inlined in `hooks/useTimelineFilter.ts` if a separate file feels like YAGNI. The interface is defined here as the canonical contract.

---

## 3. TimelineSlider Component Props

```ts
// components/TimelineSlider.tsx

/**
 * TimelineSlider has no external props.
 * All state is read from and written to the Zustand store.
 * This is intentional: the component is a pure UI adapter for the store.
 */
type TimelineSliderProps = Record<string, never>
```

**Rationale**: Props-free design prevents prop drilling and makes the component reusable from any location in the tree without wiring.

---

## 4. Node Data Extension for Animation

The custom node data type from FE-03 must be extended to support the `isNew` animation flag:

```ts
// types/path.ts (or types/nodes.ts) — extension
interface StepNodeData {
  // --- existing fields from FE-03 ---
  label: string
  description?: string
  monthsFromNow?: number
  track?: 'fast' | 'deep' | 'risk'
  difficulty?: 'easy' | 'medium' | 'hard'

  // --- FE-05 addition ---
  isNew?: boolean    // true when node first appears in current filter window; triggers animation
}
```

**Lifecycle of `isNew`**:
1. Set to `true` when `filterNodesByMonths` returns the node for the first time (node not in `seenNodeIds` ref)
2. Set to `false` after 350ms (via `setTimeout` in `useTimelineFilter`) to prevent re-animation
3. After being set to `false`, the node ID is added to the `seenNodeIds` ref — not re-animated unless the slider goes back below the node's `monthsFromNow` and then forward again

---

## 5. Filter Function Signatures

```ts
// lib/timelineFilter.ts

import type { Node, Edge } from '@xyflow/react'

/**
 * Returns nodes that should be visible at the given monthsFromNow threshold.
 * Start and goal nodes are always included.
 * Nodes with undefined monthsFromNow are always included (fail-safe).
 */
export function filterNodesByMonths(
  nodes: Node[],
  maxMonths: number
): Node[]

/**
 * Returns edges where both source and target node IDs are in the visible set.
 * Edges connected to hidden nodes are excluded to prevent dangling connections.
 */
export function filterEdgesByNodes(
  edges: Edge[],
  visibleNodeIds: Set<string>
): Edge[]
```

---

## 6. useTimelineFilter Hook Signature

```ts
// hooks/useTimelineFilter.ts

import type { Node, Edge } from '@xyflow/react'

interface UseTimelineFilterOptions {
  allNodes: Node[]           // complete unfiltered node set — source of truth
  allEdges: Edge[]           // complete unfiltered edge set — source of truth
  timelineMonths: number     // current slider value from Zustand store
  debounceMs?: number        // default: 175
}

/**
 * Debounces the timeline filter and triggers dagre layout recalculation.
 * Calls setNodes, setEdges, and fitView from useReactFlow internally.
 * Must be called inside a ReactFlowProvider context.
 */
export function useTimelineFilter(options: UseTimelineFilterOptions): void
```

**Why `void` return?**: The hook operates as a side-effect manager (calls `setNodes`, `setEdges`, `fitView`). It does not need to return data because React Flow's internal state is the consumer. Returning `void` keeps the API minimal and YAGNI-compliant.

---

## 7. useDebounce Hook Signature

```ts
// hooks/useDebounce.ts

/**
 * Returns a debounced copy of value that updates only after delayMs
 * of inactivity. Used to debounce the dagre recalculation trigger.
 */
export function useDebounce<T>(value: T, delayMs: number): T
```

---

## 8. Type Dependency Map

```text
@xyflow/react
  └── Node, Edge                (used in: timelineFilter.ts, useTimelineFilter.ts, TimelineSlider context)

types/timeline.ts
  └── FilteredFlowData          (used in: useTimelineFilter.ts internal)

types/path.ts (or nodes.ts)
  └── StepNodeData.isNew        (used in: custom node components from FE-03, useTimelineFilter.ts)

store/useLifePathStore.ts
  └── timelineMonths: number    (read by: TimelineSlider.tsx)
  └── setTimelineMonths         (called by: TimelineSlider.tsx)
```

---

## 9. Pivot Plan Data Model

If pivot buttons are used instead of the slider, **no data model changes are required**. The same `timelineMonths: number` field in the Zustand store is used. The `setTimelineMonths` action is called with discrete values (12, 36, 60) instead of continuous values. All filtering and animation logic is identical.
