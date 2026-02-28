# Task List: FE-03 React Flow 캔버스 + 커스텀 노드 구현

**Feature Branch**: `005-react-flow-map`
**Created**: 2026-02-28
**Estimated Total Time**: 90 minutes
**Status**: Not Started

---

## Phase 1: Setup (10 min)

### TASK-001: Verify package installation
**Status**: pending
**Time estimate**: 3 min

Check that `@xyflow/react` and `@dagrejs/dagre` are in `package.json`. If missing, install them.

```bash
# Verify
cat package.json | grep -E "@xyflow|dagre"

# Install if missing
npm install @xyflow/react @dagrejs/dagre
```

**Done when**: Both packages appear in `package.json` dependencies with correct package names.

---

### TASK-002: Create directory structure
**Status**: pending
**Time estimate**: 2 min

Create the required directories if they don't already exist.

```bash
mkdir -p components/PathMap
mkdir -p components/nodes
```

**Files to create (empty stubs)**:
- `components/PathMap/index.tsx`
- `components/PathMap/PathMapCanvas.tsx`
- `components/PathMap/TrackEdge.tsx`
- `components/nodes/StartNode.tsx`
- `components/nodes/StepNode.tsx`
- `components/nodes/GoalNode.tsx`
- `components/nodes/MergeNode.tsx`
- `lib/graphUtils.ts`
- `types/flow.ts`

**Done when**: All directories and stub files exist.

---

### TASK-003: Create type definitions
**Status**: pending
**Time estimate**: 5 min
**File**: `types/flow.ts`

Implement all TypeScript interfaces from `data-model.md`:
- `TrackType`
- `NodeVariant`
- `StartNodeData`, `StepNodeData`, `GoalNodeData`, `MergeNodeData`
- `FlowNode` (discriminated union)
- `FlowEdge`, `FlowEdgeData`
- `FlowData`
- `GraphTransformOptions`
- `TrackColorSet`

**Done when**: `types/flow.ts` compiles with no TypeScript errors (`npx tsc --noEmit`).

---

## Phase 2: Foundational Utility (20 min)

### TASK-004: Implement TRACK_COLORS and NODE_DIMENSIONS constants
**Status**: pending
**Time estimate**: 5 min
**File**: `lib/graphUtils.ts`

```typescript
export const TRACK_COLORS: Record<TrackType, TrackColorSet> = { ... }
export const NODE_DIMENSIONS: Record<NodeVariant, { width: number; height: number }> = { ... }
```

See `data-model.md` for exact values. These constants are referenced by node components, edge component, and the layout function.

**Done when**: Constants are exported and TypeScript compiles cleanly.

---

### TASK-005: Implement getNodeType helper
**Status**: pending
**Time estimate**: 5 min
**File**: `lib/graphUtils.ts`

```typescript
export function getNodeType(node: PathNode, pathMap: PathMap): NodeVariant
```

See `contracts/graph-utils.md` for classification logic. Test with:
- `pathMap.startNode` → `'startNode'`
- `pathMap.goalNode` → `'goalNode'`
- `pathMap.mergePoints[0]` → `'mergeNode'`
- `pathMap.paths[0].nodes[0]` → `'stepNode'`

**Done when**: Function handles all four cases; no TypeScript errors.

---

### TASK-006: Implement getEdgeStyle helper
**Status**: pending
**Time estimate**: 3 min
**File**: `lib/graphUtils.ts`

```typescript
export function getEdgeStyle(track: TrackType): EdgeStyle
```

Returns `{ stroke, strokeWidth, filter }` from `TRACK_COLORS`. See `contracts/graph-utils.md`.

**Done when**: Returns correct stroke color for 'fast', 'deep', 'risk'.

---

### TASK-007: Implement buildFlowNodes helper
**Status**: pending
**Time estimate**: 7 min
**File**: `lib/graphUtils.ts`

Creates unpositioned `FlowNode[]` from a `PathMap`. Handles deduplication by `id`. Calls `getNodeType` to determine each node's variant.

**Done when**: Called with the `mockPathMap` fixture, returns the correct count and types of nodes with no duplicates.

---

### TASK-008: Implement buildFlowEdges helper
**Status**: pending
**Time estimate**: 8 min
**File**: `lib/graphUtils.ts`

Creates `FlowEdge[]` from a `PathMap`. Handles:
1. Entry edges: `startNode` → first node of each track
2. Sequential edges: within each track
3. Merge point edges: last track node → merge point
4. Goal edge: merge point (or last track node) → `goalNode`

See `contracts/graph-utils.md` for full logic.

**Done when**: Edge count matches manually calculated expected value for `mockPathMap`. No duplicate edge IDs.

---

### TASK-009: Implement applyDagreLayout helper
**Status**: pending
**Time estimate**: 8 min
**File**: `lib/graphUtils.ts`

Applies `dagre` BT layout to a nodes array. Key steps:
1. Create dagre graph with `rankdir: 'BT'`, `nodesep: 80`, `ranksep: 120`
2. Register all nodes with correct `width`/`height` from `NODE_DIMENSIONS`
3. Register all edges
4. Run `dagre.layout(graph)`
5. Convert center coords to top-left: `x = dagre.x - width/2`, `y = dagre.y - height/2`
6. Return new node array with positions set

**Done when**: `startNode.position.y > goalNode.position.y` (BT means start has larger Y in React Flow coords). No nodes at `(0, 0)`.

---

### TASK-010: Implement pathMapToFlow (main export)
**Status**: pending
**Time estimate**: 5 min
**File**: `lib/graphUtils.ts`
**Depends on**: TASK-007, TASK-008, TASK-009

```typescript
export function pathMapToFlow(pathMap: PathMap, options?: GraphTransformOptions): FlowData
```

Orchestrates the three helpers. Handles the empty `paths`/`mergePoints` edge cases (returns minimal valid `FlowData` without crashing).

**Done when**: `pathMapToFlow(mockPathMap)` returns a `FlowData` object where all node positions are non-zero and distinct.

---

## Phase 3: US1 — React Flow Canvas Component (15 min)

### TASK-011: Implement PathMapCanvas with basic ReactFlow setup
**Status**: pending
**Time estimate**: 10 min
**File**: `components/PathMap/PathMapCanvas.tsx`

Requirements:
- `'use client'` directive at top
- Import `@xyflow/react/dist/style.css`
- Define `nodeTypes` and `edgeTypes` at MODULE LEVEL (not inside component)
- Accept `pathMap: PathMap` prop
- Call `pathMapToFlow(pathMap)` to get initial nodes/edges
- Render `<ReactFlow>` with `fitView`, `minZoom: 0.3`, `maxZoom: 2.0`
- Include `<Background variant={BackgroundVariant.Dots} />`

```typescript
'use client'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
// ... imports

const nodeTypes = { startNode: StartNode, ... }
const edgeTypes = { trackEdge: TrackEdge }

export default function PathMapCanvas({ pathMap }: { pathMap: PathMap }) {
  const { nodes, edges } = pathMapToFlow(pathMap)
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        ...
      >
        <Background variant={BackgroundVariant.Dots} color="#333" gap={20} />
      </ReactFlow>
    </div>
  )
}
```

**Done when**: Canvas renders without errors. `fitView` activates on mount. Zoom and pan work.

---

### TASK-012: Implement PathMap/index.tsx (dynamic import boundary)
**Status**: pending
**Time estimate**: 5 min
**File**: `components/PathMap/index.tsx`

The SSR boundary. Uses `'use client'` and re-exports `PathMapCanvas`. The PARENT (page) uses `dynamic(..., { ssr: false })` when importing this file.

```typescript
'use client'
import PathMapCanvas from './PathMapCanvas'
import type { PathMap } from '@/types/path'

export default function PathMap({ pathMap }: { pathMap: PathMap }) {
  return (
    <div className="w-full h-full">
      <PathMapCanvas pathMap={pathMap} />
    </div>
  )
}
```

**Done when**: `next build` completes without SSR-related errors.

---

## Phase 4: US2 — Four Custom Node Components (20 min)

### TASK-013: Implement StartNode
**Status**: pending
**Time estimate**: 5 min
**File**: `components/nodes/StartNode.tsx`

- `'use client'` directive
- Circular shape (border-radius 50%)
- Tailwind `animate-ping` class on an absolutely positioned span for pulse ring
- White border, semi-transparent background
- Source handle on `Position.Top` only (no target — nothing connects to start)

**Done when**: Pulse animation runs continuously. Node is circular.

---

### TASK-014: Implement StepNode
**Status**: pending
**Time estimate**: 5 min
**File**: `components/nodes/StepNode.tsx`

- `'use client'` directive
- Rounded rectangle shape
- Border color from `TRACK_COLORS[data.track].border`
- `box-shadow` glow from `TRACK_COLORS[data.track].glow`
- Background tint from `TRACK_COLORS[data.track].bg`
- Display `data.label` (truncate at ~25 chars with ellipsis)
- Target handle on `Position.Bottom`, source handle on `Position.Top`

**Done when**: Gold/blue/purple glow visible for fast/deep/risk tracks respectively. Label fits within node box.

---

### TASK-015: Implement GoalNode
**Status**: pending
**Time estimate**: 5 min
**File**: `components/nodes/GoalNode.tsx`

- `'use client'` directive
- Star shape via CSS `clip-path` polygon (10-point star from `research.md`)
- Multi-color intense glow: combine all three track colors in `box-shadow`
- Target handle on `Position.Bottom` only (nothing leaves goal)

**Done when**: Star shape visible. Intense multi-color glow visible around the star shape.

---

### TASK-016: Implement MergeNode
**Status**: pending
**Time estimate**: 5 min
**File**: `components/nodes/MergeNode.tsx`

- `'use client'` directive
- Large circular shape (100x100px)
- Conic gradient background using all three track colors (see `research.md`)
- Dark inner circle (80% size) to create ring effect
- ◆ diamond Unicode character in center
- Message text from `data.message` (small font, positioned below diamond)
- Multiple target handles on `Position.Bottom` for three incoming tracks
- Source handle on `Position.Top` (exits to goal)

**Done when**: Tri-color gradient ring visible. ◆ icon visible in center.

---

## Phase 5: US3 — Custom Edges (10 min)

### TASK-017: Implement TrackEdge
**Status**: pending
**Time estimate**: 10 min
**File**: `components/PathMap/TrackEdge.tsx`

- `'use client'` directive
- Import `getBezierPath` or `getSmoothStepPath` from `@xyflow/react`
- Use `getEdgeStyle(data.track)` to get `stroke`, `strokeWidth`, `filter`
- Render an SVG `<path>` with the computed edge path
- Wrap in SVG group for proper rendering in React Flow edge overlay

```typescript
'use client'
import { EdgeProps, getBezierPath } from '@xyflow/react'
import { getEdgeStyle } from '@/lib/graphUtils'
import type { FlowEdgeData } from '@/types/flow'

export default function TrackEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data
}: EdgeProps<FlowEdgeData>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const style = getEdgeStyle(data?.track ?? 'fast')

  return (
    <path
      id={id}
      d={edgePath}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      style={{ filter: style.filter }}
      fill="none"
    />
  )
}
```

**Done when**: Edges render as curved lines with correct track color. No straight lines.

---

## Phase 6: US4 — Integration and Page Wiring (5 min)

### TASK-018: Wire PathMap into the main page
**Status**: pending
**Time estimate**: 5 min
**File**: `app/page.tsx` (or the relevant page)

Add `dynamic` import with `ssr: false` for `PathMap`. Wire it to accept a `PathMap` prop from the app state (Zustand store or local state during testing).

For hackathon demo purposes, start with the `mockPathMap` fixture to verify end-to-end rendering before connecting to the real API.

**Done when**: Full canvas visible on page load. No SSR errors on `npm run build`.

---

## Phase 7: Polish — Animations and Glow Effects (10 min)

### TASK-019: Verify and refine StartNode pulse animation
**Status**: pending
**Time estimate**: 3 min

- Confirm `animate-ping` creates a 2-second loop
- Verify the ring color and opacity are visible on dark background
- Adjust `animationDuration` or animation delay if needed

**Done when**: Pulse animation is clearly visible, not too fast, not too slow.

---

### TASK-020: Verify StepNode glow visibility
**Status**: pending
**Time estimate**: 3 min

- Confirm `box-shadow` glow is visible on dark canvas background
- Adjust `TRACK_COLORS` glow opacity if too subtle
- Ensure selected state shows increased glow (React Flow adds `selected` class)

**Done when**: Glow is visible without being distracting. Selected nodes are noticeably brighter.

---

### TASK-021: Verify GoalNode star shape and glow
**Status**: pending
**Time estimate**: 2 min

- Confirm `clip-path` polygon renders the star shape correctly across browsers
- Verify intense glow is visually prominent from a distance (zoomed out view)

**Done when**: Star shape is recognizable at any zoom level. Glow creates visual hierarchy with step nodes.

---

### TASK-022: Verify MergeNode gradient and ◆ icon
**Status**: pending
**Time estimate**: 2 min

- Confirm conic gradient renders with all three colors visible
- Confirm ◆ character is centered and readable
- Verify `data.message` is accessible on hover or visible in the node

**Done when**: All three track colors visible in gradient ring. Diamond icon centered and legible.

---

## Summary

| Phase | Tasks | Time | Deliverable |
|-------|-------|------|-------------|
| 1: Setup | 001–003 | 10 min | Types, directories, dependencies |
| 2: Foundational | 004–010 | 20 min | `lib/graphUtils.ts` complete |
| 3: US1 | 011–012 | 15 min | Canvas renders with BT layout |
| 4: US2 | 013–016 | 20 min | All 4 custom node types |
| 5: US3 | 017 | 10 min | Track-colored custom edges |
| 6: US4 | 018 | 5 min | Page integration |
| 7: Polish | 019–022 | 10 min | Animations and glow finalized |
| **Total** | **22 tasks** | **90 min** | |

## Acceptance Criteria Checklist

- [ ] React Flow canvas renders (zoom/pan/fitView work)
- [ ] `'use client'` + dynamic import `ssr: false` in place
- [ ] StartNode pulse animation running
- [ ] StepNode track color gold/blue/purple visible
- [ ] GoalNode star shape + glow visible
- [ ] MergeNode tri-color gradient + ◆ visible
- [ ] dagre BT layout: start at bottom, goal at top, no overlaps
- [ ] PathMap → nodes/edges transform correct (right counts, right types)
- [ ] Three tracks visually distinct on canvas
- [ ] `npm run build` completes without SSR errors
