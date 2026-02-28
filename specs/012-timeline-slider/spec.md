# FE-05: 타임라인 슬라이더 (기간 전환) — Feature Specification

**Feature ID**: FE-05
**Phase**: Phase 2 (핵심 구현, 3:30~4:00)
**Assignee**: frontend-dev
**Estimated Time**: 30m
**Difficulty**: High
**Status**: pending
**Dependencies**: FE-03 (React Flow canvas + custom nodes), FE-04 (detail panel — optional)

---

## Overview

The timeline slider enables users to explore life paths across different time horizons. Dragging the slider from 1 year to 5 years progressively reveals nodes that fall within the selected timeframe, creating a compelling "life path growth" animation that is the centrepiece of the ACT 2 demo scenario.

The slider is fixed at the bottom of the map canvas. Node filtering is based on each node's `monthsFromNow` value relative to the slider position. A debounce prevents expensive dagre layout recalculations during rapid dragging. A pivot fallback (3 discrete buttons) is available if continuous slider implementation proves too risky within the hackathon time budget.

---

## User Stories

### US-1 (P1): Slider Drag Filters Nodes by monthsFromNow

**As a** user on the path map screen,
**I want to** drag the timeline slider from 1 year to 5 years,
**So that** I can watch my life path expand progressively as more milestones become visible.

**Acceptance Criteria**:
- [ ] Slider UI is rendered at the bottom of the map canvas and does not overlap node content
- [ ] Slider range is 12 (1 year) to 60 (5 years) months, with a default of 36 (3 years)
- [ ] Dragging the slider to a value of N shows only nodes whose `monthsFromNow <= N`
- [ ] Start node (type `'start'`) is always visible regardless of slider value
- [ ] Goal node (type `'goal'`) is always visible regardless of slider value
- [ ] Edges connected to hidden nodes are also hidden (no dangling edges)
- [ ] After filtering, dagre layout is recalculated for the visible node set
- [ ] After dagre recalculation, `fitView` is called so the visible graph fills the viewport
- [ ] Moving slider from 12 to 36 to 60 months reveals nodes in increasing order of `monthsFromNow`

---

### US-2 (P2): New Nodes Appear with Fade-In and Scale Animation

**As a** user watching the timeline expand,
**I want to** see new nodes animate into view when they enter the visible timeframe,
**So that** the experience feels alive and the appearance of each milestone feels meaningful.

**Acceptance Criteria**:
- [ ] A node that was hidden and becomes visible transitions from `opacity: 0; transform: scale(0.8)` to `opacity: 1; transform: scale(1)`
- [ ] The CSS transition duration is 300ms with `ease-out` easing
- [ ] Nodes already visible before the slider moved do not re-trigger the animation
- [ ] Animation is applied via a CSS class added dynamically when a node first appears
- [ ] Animation works correctly after repeated slider adjustments (no accumulation of stale animation states)

---

### US-3 (P3): Debounce Prevents Performance Degradation During Fast Drag

**As a** developer and user,
**I want to** the slider to debounce its input at 150–200ms,
**So that** rapid dragging does not trigger a dagre recalculation on every animation frame, keeping the UI responsive.

**Acceptance Criteria**:
- [ ] Slider value updates the Zustand `timelineMonths` state immediately (for live label display)
- [ ] The dagre layout recalculation and `setNodes`/`setEdges` calls are debounced to fire only after 150–200ms of inactivity
- [ ] During a continuous drag, dagre is called at most once per 150–200ms window
- [ ] No visible lag or frame drops during a fast drag from 12 to 60 months
- [ ] Debounce is implemented via a `useDebounce` hook or `useCallback` + `setTimeout` ref pattern — no lodash dependency required

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Slider at minimum (12 months) — no step nodes qualify | Only start node and goal node are visible; dagre renders a two-node graph; fitView centers them |
| Slider at maximum (60 months) — all nodes qualify | All nodes and all edges are visible; layout identical to unfiltered full map |
| `monthsFromNow` is `undefined` or `null` on a node | Node treated as always-visible (defensive: shown at all slider values) |
| Node `type` is `'start'` or `'goal'` | Always included in filtered set regardless of `monthsFromNow` value |
| Node `type` is `'merge'` (convergence node) | Filtered by `monthsFromNow` like regular step nodes unless it has no `monthsFromNow` |
| Edge connects two visible nodes | Edge included in filtered edge set |
| Edge connects a visible node to a hidden node | Edge excluded from filtered edge set |
| Slider is dragged then released at the same value | Debounce fires; dagre recalculates idempotently with no visible change |
| Rapid toggle between two slider values | Only the final resting value triggers dagre; intermediate values are skipped |
| React Flow `fitView` called before layout settles | Wrapped in `requestAnimationFrame` to ensure React has committed node positions |
| Pivot mode active (3 buttons instead of slider) | Same filtering logic applies; buttons set `timelineMonths` to 12, 36, or 60 |

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | Render a `TimelineSlider` component fixed at the bottom of the React Flow map canvas | Must | `position: absolute; bottom: 0` inside the ReactFlow container |
| FR-002 | Slider range is 12–60 (months); default value is 36; Zustand `timelineMonths` initialized to 36 | Must | shadcn/ui `Slider` or native `<input type="range">` |
| FR-003 | Changing the slider value updates `timelineMonths` in the Zustand store immediately | Must | Live label update requires instant state sync |
| FR-004 | `filterNodesByMonths(nodes, maxMonths)` returns nodes where `monthsFromNow <= maxMonths`, always including start and goal nodes | Must | Pure function, no side effects |
| FR-005 | `filterEdgesByNodes(edges, visibleNodeIds)` returns only edges where both `source` and `target` are in `visibleNodeIds` | Must | Prevents dangling edges |
| FR-006 | After filtering, dagre layout recalculation runs on the filtered node+edge set | Must | Reuse existing dagre util from FE-03 |
| FR-007 | After dagre recalculation, React Flow `fitView` is called to adjust viewport | Must | Call via `useReactFlow().fitView()` |
| FR-008 | New nodes (not present in the previous render) receive a CSS animation class for opacity 0→1 and scale 0.8→1 over 300ms | Must | CSS `transition` property on node wrapper |
| FR-009 | Dagre recalculation + setNodes/setEdges is debounced at 150–200ms | Should | Implemented via `useDebounce` hook |
| FR-010 | Slider displays a human-readable label (e.g., "1년", "3년", "5년" or "N개월") above or beside the thumb | Should | Improves demo clarity |

---

## Key Entities

### TimelineSlider Component

```
TimelineSlider
  - Renders at the bottom of the map canvas (absolute positioned)
  - Reads timelineMonths from Zustand store via useLifePathStore
  - Updates timelineMonths via setTimelineMonths() on slider change
  - Displays human-readable month/year label
  - Props: none (all state from store)
  - File: components/TimelineSlider.tsx
```

### FilteredNodes Logic

```
filterNodesByMonths(nodes: Node[], maxMonths: number): Node[]
  - Includes node if node.data.monthsFromNow <= maxMonths
  - Always includes node if node.type === 'start' || node.type === 'goal'
  - Treats missing monthsFromNow as always-visible (defensive)
  - Returns new array (no mutation)
  - File: lib/timelineFilter.ts

filterEdgesByNodes(edges: Edge[], visibleNodeIds: Set<string>): Edge[]
  - Includes edge only if both source and target are in visibleNodeIds
  - Returns new array (no mutation)
  - File: lib/timelineFilter.ts
```

### useTimelineFilter Hook

```
useTimelineFilter(nodes: Node[], edges: Edge[], timelineMonths: number)
  - Calls filterNodesByMonths and filterEdgesByNodes
  - Runs dagre layout on filtered nodes/edges
  - Returns { filteredNodes, filteredEdges }
  - Debounced internally at 150–200ms
  - File: hooks/useTimelineFilter.ts
```

### Zustand Store Extension

```
useLifePathStore (additions)
  State:
    - timelineMonths: number   — current slider value (default: 36)
  Actions:
    - setTimelineMonths(months: number) — update slider position
```

---

## Non-Functional Requirements

- `TimelineSlider` must be a Client Component (`'use client'` directive)
- No `any` types: Node and Edge types from `@xyflow/react`
- All functions max 20 lines (Constitution III)
- Max 2 nesting depth in JSX and logic (Constitution IV)
- YAGNI: no auto-play, sound effects, or tick marks unless pivot buttons are chosen
- The pivot (3 buttons) must be a drop-in replacement requiring no logic changes — same `setTimelineMonths` action, different UI only

---

## Success Criteria

1. Slider renders at the bottom of the map and does not obscure node content
2. Moving slider from 12 to 36 to 60 months reveals nodes in `monthsFromNow` order
3. Start node and goal node remain visible at all slider positions
4. Dagre layout recalculates after each debounced slider change; fitView fires correctly
5. New nodes animate in with opacity + scale transition visible to the user
6. During a fast drag, dagre fires at most once per 150–200ms (verified by console log in dev)
7. All 10 acceptance criteria items across US-1, US-2, US-3 pass
8. Pivot button variant (if used) passes the same filtering acceptance criteria with the same store actions
