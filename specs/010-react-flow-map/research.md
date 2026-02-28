# Research Findings: FE-03 React Flow 캔버스 + 커스텀 노드 구현

**Created**: 2026-02-28

## 1. @xyflow/react v12 vs Legacy reactflow

### Package Rename History

The `reactflow` package was rebranded to `@xyflow/react` starting with version 12. The old `reactflow` package remains at v11.x but will not receive new features. **Always install and import from `@xyflow/react`.**

```bash
# Correct
npm install @xyflow/react

# Wrong — legacy, do not use
npm install reactflow
```

### Breaking Changes from v11 to v12

**Import paths changed**:
```typescript
// v12 (@xyflow/react)
import { ReactFlow, Background, Controls, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// v11 (reactflow) — DO NOT USE
import ReactFlow, { Background, Controls, Handle, Position } from 'reactflow'
import 'reactflow/dist/style.css'
```

**NodeProps generic type**: In v12, `NodeProps` uses the full node type as a generic rather than just the data type.
```typescript
// v12 — NodeProps<NodeType> where NodeType extends Node
import { NodeProps, Node } from '@xyflow/react'
type StepNodeType = Node<StepNodeData, 'stepNode'>
const StepNode = ({ data, selected }: NodeProps<StepNodeType>) => { ... }

// Alternative simpler pattern (also works in v12)
import { NodeProps } from '@xyflow/react'
const StepNode = ({ data }: NodeProps<{ track: TrackType; label: string }>) => { ... }
```

**EdgeProps**:
```typescript
import { EdgeProps, getBezierPath, getSmoothStepPath } from '@xyflow/react'

const TrackEdge = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data
}: EdgeProps<{ track: TrackType }>) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  return <path id={id} d={edgePath} stroke={TRACK_COLORS[data.track].border} strokeWidth={2} fill="none" />
}
```

**Node type registration** (unchanged concept, same syntax):
```typescript
const nodeTypes = {
  startNode: StartNode,
  stepNode: StepNode,
  goalNode: GoalNode,
  mergeNode: MergeNode,
} as const

<ReactFlow nodeTypes={nodeTypes} edgeTypes={edgeTypes} ... />
```

**CRITICAL**: `nodeTypes` and `edgeTypes` objects must be defined OUTSIDE the component render function or memoized with `useMemo`. Defining them inside the component causes React Flow to re-register types on every render, triggering full canvas remounts.

```typescript
// Correct — defined at module level
const nodeTypes = { startNode: StartNode, ... }

// Wrong — causes remount on every render
const MyCanvas = () => {
  const nodeTypes = { startNode: StartNode, ... } // BAD
  return <ReactFlow nodeTypes={nodeTypes} />
}
```

### ReactFlow Component Props (v12)

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  fitViewOptions={{ padding: 0.2 }}
  minZoom={0.3}
  maxZoom={2.0}
  defaultEdgeOptions={{ type: 'trackEdge' }}
  proOptions={{ hideAttribution: true }}  // Hides React Flow attribution (acceptable for demos)
>
  <Background variant={BackgroundVariant.Dots} color="#333" gap={20} />
</ReactFlow>
```

### Handle Positioning for BT Layout

Since dagre uses `rankdir: 'BT'` (Bottom-to-Top), edges flow upward. Handles must be oriented accordingly:
- **Source handle** (where edges leave): `Position.Top` — edges leave from the TOP of the node
- **Target handle** (where edges arrive): `Position.Bottom` — edges arrive at the BOTTOM of the node

```typescript
<Handle type="source" position={Position.Top} />
<Handle type="target" position={Position.Bottom} />
```

Exception: The `StartNode` only has a source handle (nothing connects into the start). The `GoalNode` only has a target handle.

---

## 2. dagre BT Layout Configuration

### Setup Pattern

```typescript
import dagre from '@dagrejs/dagre'

const getLayoutedElements = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: 'BT',
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  })

  nodes.forEach((node) => {
    const { width, height } = NODE_DIMENSIONS[node.type as NodeVariant]
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id)
    const { width, height } = NODE_DIMENSIONS[node.type as NodeVariant]
    return {
      ...node,
      position: {
        x: x - width / 2,   // dagre gives center; RF needs top-left
        y: y - height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
```

### Key Insight: Coordinate System Offset

Dagre returns center-point coordinates. React Flow uses top-left corner coordinates. Always subtract `width / 2` from X and `height / 2` from Y when converting.

### Recommended nodesep/ranksep Values

| Parameter | Minimum | Recommended | Description |
|-----------|---------|-------------|-------------|
| nodesep   | 50      | 80          | Horizontal gap between sibling nodes |
| ranksep   | 80      | 120         | Vertical gap between levels (ranks) |
| marginx   | 20      | 40          | Horizontal canvas margin |
| marginy   | 20      | 40          | Vertical canvas margin |

Smaller values cause nodes to overlap when labels are long. The 200px width for `stepNode` combined with `nodesep: 80` means three parallel tracks need at least 3 * 200 + 2 * 80 = 760px canvas width — ensure the container is wide enough or `fitView` will handle the initial zoom.

---

## 3. Dynamic Import with ssr: false in Next.js

### Why It Is Needed

React Flow uses `ResizeObserver`, `window.devicePixelRatio`, `getBoundingClientRect`, and other browser-only APIs during its initialization. If any of these are called during Next.js SSR, a `ReferenceError: window is not defined` error occurs (or worse, a silent hydration mismatch).

### Implementation Pattern

```typescript
// app/page.tsx or any Server Component
import dynamic from 'next/dynamic'
import type { PathMap } from '@/types/path'

// PathMap component is loaded only in the browser
const PathMap = dynamic(() => import('@/components/PathMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">
    <span className="text-white/50">맵 불러오는 중...</span>
  </div>,
})

// Usage in the page component
export default function HomePage() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PathMap pathMap={somePathMapData} />
    </div>
  )
}
```

### components/PathMap/index.tsx (Dynamic Import Boundary)

```typescript
'use client'

import PathMapCanvas from './PathMapCanvas'
import type { PathMap } from '@/types/path'

interface PathMapProps {
  pathMap: PathMap
}

export default function PathMap({ pathMap }: PathMapProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <PathMapCanvas pathMap={pathMap} />
    </div>
  )
}
```

### Why Both `'use client'` AND `dynamic({ ssr: false })` Are Needed

- `'use client'` marks the component boundary for React's client/server split. Without it, Next.js may attempt to render the component on the server despite the dynamic import.
- `dynamic({ ssr: false })` prevents the module from being included in the server bundle at all. This is the only way to guarantee browser-only APIs are never called server-side.
- Using only `'use client'` is insufficient: the module is still imported server-side, and import-time side effects (e.g., module-level code in `@xyflow/react`) can still trigger browser API calls.

---

## 4. Custom Node Type Registration

### Registration Rules (v12)

1. Define `nodeTypes` and `edgeTypes` **outside** any React component (module level or via `useMemo`).
2. Each key in `nodeTypes` must exactly match the `type` field set on nodes in the nodes array.
3. Each value is a React component satisfying the `NodeProps` interface.
4. Custom nodes must render `<Handle>` components to enable edge connections; otherwise edges have no connection points.

```typescript
// components/PathMap/PathMapCanvas.tsx
'use client'

import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import StartNode from '@/components/nodes/StartNode'
import StepNode from '@/components/nodes/StepNode'
import GoalNode from '@/components/nodes/GoalNode'
import MergeNode from '@/components/nodes/MergeNode'
import TrackEdge from './TrackEdge'

// MUST be outside component
const nodeTypes = {
  startNode: StartNode,
  stepNode: StepNode,
  goalNode: GoalNode,
  mergeNode: MergeNode,
}

const edgeTypes = {
  trackEdge: TrackEdge,
}
```

### Handle IDs (Optional but Recommended)

For nodes with multiple handles (e.g., MergeNode that receives edges from 3 tracks), use explicit `id` props on handles:
```typescript
<Handle type="target" position={Position.Bottom} id="fast-in" />
<Handle type="target" position={Position.Bottom} id="deep-in" style={{ left: '40%' }} />
<Handle type="target" position={Position.Bottom} id="risk-in" style={{ left: '60%' }} />
```
Then in `pathMapToFlow`, set `targetHandle: 'fast-in'` etc. on the corresponding edge. This prevents all edges from connecting to the same point on the merge node.

---

## 5. CSS Animations for Pulse Effect

### StartNode Pulse Ring

The pulse animation simulates a signal broadcasting outward — appropriate for the "journey begins here" metaphor.

```css
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
```

### Implementation in StartNode (Tailwind + inline styles)

React Flow custom nodes render inside a `div` managed by React Flow. CSS animations work normally inside that div.

```typescript
// components/nodes/StartNode.tsx
'use client'
import { Handle, Position } from '@xyflow/react'

export default function StartNode({ data }: { data: { label: string } }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing ring — absolutely positioned behind the node */}
      <span
        className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping"
        style={{ animationDuration: '2s' }}
      />
      {/* Node circle */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 border-2 border-white flex items-center justify-center">
        <span className="text-white text-xs font-bold text-center leading-tight px-1">
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Top} className="!bg-white" />
    </div>
  )
}
```

Tailwind's `animate-ping` class implements a pulse ring using `@keyframes ping` with `transform: scale(2)` and `opacity: 0` — identical to the custom CSS above. Use it to avoid a separate `@keyframes` declaration.

### GoalNode Star Shape via clip-path

```css
clip-path: polygon(
  50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%,
  50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%
);
```

This 10-point polygon creates a standard 5-pointed star. Apply via inline `style` or a Tailwind plugin.

### MergeNode Gradient

Multi-color gradient incorporating all three track colors:
```css
background: conic-gradient(
  from 0deg,
  #FFD700 0deg 120deg,   /* Fast — gold */
  #4A9EFF 120deg 240deg, /* Deep — blue */
  #A855F7 240deg 360deg  /* Risk — purple */
);
```

Wrap in a circular container with `border-radius: 50%` and a dark inner circle to create a ring effect rather than a fully colored disc.

---

## 6. Summary of Critical Implementation Rules

1. Import from `@xyflow/react`, NOT `reactflow`
2. Import stylesheet: `import '@xyflow/react/dist/style.css'`
3. `'use client'` on EVERY file that imports from `@xyflow/react`
4. Wrap the canvas in `dynamic(..., { ssr: false })` in the parent
5. Define `nodeTypes` / `edgeTypes` at module level, NOT inside components
6. Source handles on `Position.Top`, target handles on `Position.Bottom` (BT layout)
7. Dagre center coords → subtract `width/2`, `height/2` for React Flow top-left
8. `nodesep: 80`, `ranksep: 120` recommended for 3-track layout
9. Use Tailwind `animate-ping` for StartNode pulse (no extra CSS files needed)
10. `TRACK_COLORS` constant is the single source of truth for gold/blue/purple values
