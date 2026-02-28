# Implementation Plan: FE-03 React Flow 캔버스 + 커스텀 노드 구현

**Feature Branch**: `005-react-flow-map`
**Created**: 2026-02-28
**Status**: Draft

## Technical Context

### Package Versions

- **`@xyflow/react` v12** (NOT `reactflow`): This is the renamed, rewritten package. Import paths, hook names, and component APIs have changed significantly from the legacy `reactflow` package. Specifically:
  - Import from `@xyflow/react`, not `reactflow`
  - `useNodesState` / `useEdgesState` hooks are available
  - `ReactFlow` component is the default export
  - Node type registration uses `nodeTypes` prop (same concept, but ensure v12 compatibility)
  - Handle components and connection APIs differ from v9/v10

- **`@dagrejs/dagre`**: The maintained fork of the original `dagre` package. Import as `import dagre from '@dagrejs/dagre'`. The API is unchanged from `dagre`, but the package name differs.

### SSR Prevention Strategy (CRITICAL)

React Flow depends on browser APIs (`window`, `ResizeObserver`, DOM measurement). Next.js App Router runs components on the server by default. Two layers of protection are required:

**Layer 1 — `'use client'` directive**: Every file that imports from `@xyflow/react` must begin with `'use client'`. This applies to:
- `components/PathMap/PathMapCanvas.tsx`
- `components/PathMap/TrackEdge.tsx`
- `components/nodes/StartNode.tsx`
- `components/nodes/StepNode.tsx`
- `components/nodes/GoalNode.tsx`
- `components/nodes/MergeNode.tsx`

**Layer 2 — `dynamic()` with `ssr: false`**: The `PathMapCanvas` component (or the containing `PathMap` wrapper) must be imported via `next/dynamic` with `{ ssr: false }` in the parent server component or page. This prevents any import-time side effects from running on the server.

```typescript
// In the page or parent server component:
import dynamic from 'next/dynamic'

const PathMap = dynamic(() => import('@/components/PathMap'), { ssr: false })
```

The `PathMap/index.tsx` wrapper can be the dynamic import boundary — it re-exports `PathMapCanvas` and handles the loading state with a skeleton/spinner fallback.

### dagre BT Layout Configuration

```typescript
const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))
dagreGraph.setGraph({
  rankdir: 'BT',   // Bottom-to-Top: start at bottom, goal at top
  nodesep: 80,     // Horizontal spacing between nodes in the same rank
  ranksep: 120,    // Vertical spacing between ranks
  marginx: 40,
  marginy: 40,
})
```

Per-node dimensions passed to dagre must match the actual rendered CSS dimensions:

| Node Type  | Width (px) | Height (px) |
|------------|-----------|-------------|
| startNode  | 80        | 80          |
| stepNode   | 200       | 80          |
| goalNode   | 100       | 100         |
| mergeNode  | 100       | 100         |

After dagre computes positions, convert to React Flow coordinates. Note: dagre returns center-based coordinates; React Flow expects top-left. Apply offset: `x = dagreX - width/2`, `y = dagreY - height/2`.

### @xyflow/react v12 API Key Differences from Legacy reactflow

| Concern              | Legacy `reactflow`               | `@xyflow/react` v12                     |
|----------------------|----------------------------------|-----------------------------------------|
| Package import       | `import ReactFlow from 'reactflow'` | `import { ReactFlow } from '@xyflow/react'` |
| Stylesheet           | `import 'reactflow/dist/style.css'` | `import '@xyflow/react/dist/style.css'` |
| Background           | `<Background />`                 | `<Background />` (same, from `@xyflow/react`) |
| Controls             | `<Controls />`                   | `<Controls />` (same)                  |
| Node handle          | `<Handle />`                     | `<Handle />` (same)                    |
| NodeProps type       | `NodeProps<TData>`               | `NodeProps<TData>` (same interface)     |
| EdgeProps type       | `EdgeProps<TData>`               | `EdgeProps<TData>` (same interface)     |
| `getBezierPath`      | named export from `reactflow`    | named export from `@xyflow/react`       |
| `getSmoothStepPath`  | named export from `reactflow`    | named export from `@xyflow/react`       |

## Constitution Check

- **YAGNI**: Implement only the 8 required items (C-1 through C-8). Do not implement C-9 (diamond node), C-10 (animated edges), C-11 (minimap), or C-12 (map controls) unless explicitly requested.
- **SOLID / Single Responsibility**: Each node component (`StartNode`, `StepNode`, `GoalNode`, `MergeNode`) handles only its own rendering. `graphUtils.ts` handles only data transformation. `PathMapCanvas` handles only canvas setup and composition.
- **TypeScript no-any**: All node data types use explicit interfaces. Never use `data: any` in node props. Import `NodeProps` from `@xyflow/react` and parameterize with the specific data interface.
- **Fail-Safe**: If `pathMapToFlow` receives a null or undefined PathMap, return `{ nodes: [], edges: [] }` rather than throwing. The canvas renders an empty state gracefully.
- **Max 2 nesting depth**: Avoid deeply nested JSX conditionals. Extract helper components or use early returns.
- **Max 20 line functions**: `pathMapToFlow` will exceed 20 lines if written naively. Break it into focused helpers: `buildNodes()`, `buildEdges()`, `applyDagreLayout()`.

## Project Structure

```
components/
  PathMap/
    index.tsx              # Dynamic import wrapper (SSR boundary)
    PathMapCanvas.tsx      # 'use client' — ReactFlow canvas + nodeTypes/edgeTypes
    TrackEdge.tsx          # 'use client' — Custom edge component
  nodes/
    StartNode.tsx          # 'use client' — Circular pulsing start node
    StepNode.tsx           # 'use client' — Rounded rect step node with track color
    GoalNode.tsx           # 'use client' — Star-shaped goal node with glow
    MergeNode.tsx          # 'use client' — Large circle with gradient + ◆

lib/
  graphUtils.ts            # Pure utility (no React) — pathMapToFlow, dagre layout
  colors.ts                # TrackColors constant (may already exist from FE-02)

types/
  flow.ts                  # FlowNode, FlowEdge, CustomNodeData interfaces
```

`lib/graphUtils.ts` does NOT need `'use client'` — it is a pure TypeScript module with no React imports. It can run anywhere.

## Key Implementation Decisions

1. **Node size constants**: Define `NODE_DIMENSIONS` as a constant in `lib/graphUtils.ts` to ensure dagre receives the same values that CSS applies. Discrepancy causes visual overlap.

2. **Edge source/target handles**: For `StepNode`, place `<Handle type="target" position={Position.Bottom} />` and `<Handle type="source" position={Position.Top} />` to align with dagre BT direction (edges flow from bottom to top).

3. **`pathMapToFlow` decomposition**:
   - `buildFlowNodes(pathMap)` → raw nodes without positions
   - `buildFlowEdges(pathMap)` → edges with track data
   - `applyDagreLayout(nodes, edges)` → mutates positions using dagre
   - `pathMapToFlow(pathMap)` → calls all three and returns `{ nodes, edges }`

4. **CSS animations in Tailwind**: Use `@layer utilities` or inline `style` tags with `@keyframes` for the pulse animation on `StartNode`. Avoid Framer Motion inside the canvas.

5. **Track color mapping**: Define a single `TRACK_COLORS` constant shared by node components, edge component, and any legend. Single source of truth avoids color inconsistencies.

```typescript
export const TRACK_COLORS = {
  fast: { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)', text: '#FFD700' },
  deep: { border: '#4A9EFF', glow: 'rgba(74, 158, 255, 0.6)', text: '#4A9EFF' },
  risk: { border: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)', text: '#A855F7' },
} as const
```

## Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SSR hydration error | High | Layer 1 + Layer 2 SSR prevention enforced by constitution |
| Node overlap in dagre | Medium | Pass correct node dimensions per type; verify with visual test |
| @xyflow/react v12 API mismatch | Medium | Read research.md v12 API table before writing any ReactFlow code |
| Performance on large PathMaps | Low | PathMaps are bounded (3 tracks × 4-6 nodes = max ~25 nodes); no virtualization needed |
| CSS animation interference | Low | Pulse animation uses `will-change: transform` to isolate compositing layer |

## Pivot Plan

If React Flow implementation is blocked at the 3:00 mark (per issue notes), the pivot is:
- Replace `PathMapCanvas` with a static CSS div-based tree layout
- `graphUtils.ts` transform stays intact (reusable)
- Custom node components become regular divs with the same CSS styling
- Lose zoom/pan but retain visual correctness
