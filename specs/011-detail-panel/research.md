# Research Findings: FE-04 노드 클릭 상세 패널 + 트랙 하이라이트

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28

---

## 1. shadcn/ui Card Usage

### Official Pattern

shadcn/ui `Card` is a compound component with the following sub-components:

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
```

**Usage for DetailPanel**:

```tsx
<Card className="h-full rounded-none border-l border-border bg-background">
  <CardHeader>
    <CardTitle>{node.label}</CardTitle>
    <CardDescription>{node.description}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* badges, tips, duration */}
  </CardContent>
</Card>
```

**Key observations**:
- `rounded-none` removes rounded corners on the panel edge adjacent to the canvas (right panel flush to viewport edge).
- `border-l` draws only the left border (the panel's visible edge against the canvas).
- `bg-background` uses the shadcn/ui CSS variable which resolves to the dark theme background color automatically.
- `CardDescription` renders with muted text color — appropriate for the description field.

**Dark theme compatibility**: shadcn/ui components use CSS custom properties (`--background`, `--foreground`, `--muted-foreground`) that automatically respond to the `.dark` class on `<html>`. No manual dark-mode overrides needed.

---

## 2. shadcn/ui Badge Usage

### Official Pattern

```typescript
import { Badge } from "@/components/ui/badge"
```

**Variants available**: `default`, `secondary`, `destructive`, `outline`

**Usage for track and difficulty badges**:

```tsx
// Track badge with custom background color
<Badge
  style={{ backgroundColor: TRACK_COLORS[node.track], color: '#000' }}
  className="font-medium"
>
  {TRACK_LABELS[node.track]}
</Badge>

// Difficulty badge using variant
<Badge variant="secondary">
  {node.difficulty}
</Badge>
```

**Key observations**:
- Track badges use inline `style` for the dynamic hex color since Tailwind cannot generate arbitrary color classes at runtime.
- The text color `#000` (black) is appropriate for the gold (#F59E0B) track but may need adjustment for blue (#3B82F6) and purple (#8B5CF6). Use `#fff` (white) for blue and purple for adequate contrast.
- Difficulty badges use `variant="secondary"` which uses the muted background — visually distinct from track badges without needing custom colors.

**Contrast check for track badges on dark theme**:
- Fast Track `#F59E0B` on dark bg: sufficient — bright gold is highly visible
- Deep Dive `#3B82F6` on dark bg: sufficient — bright blue on dark is readable
- Risk Path `#8B5CF6` on dark bg: sufficient — purple on dark is readable

---

## 3. React Flow onNodeClick Handler

### API Reference (@xyflow/react v12)

The `onNodeClick` prop on the `<ReactFlow>` component accepts a `NodeMouseHandler`:

```typescript
import { ReactFlow, NodeMouseHandler, Node } from '@xyflow/react'

const handleNodeClick: NodeMouseHandler = (event, node) => {
  // node is a React Flow Node object
  // node.data contains the custom data passed when creating the node
  // node.type is the node type string registered in nodeTypes
}
```

**Type signature**:
```typescript
type NodeMouseHandler = (event: React.MouseEvent, node: Node) => void
```

**Accessing PathNode data**:

When FE-03 constructs React Flow nodes from `PathMap` data, each node's `data` field should contain the original `PathNode`. The cast is:

```typescript
const pathNode = node.data as PathNode
```

This is the only necessary cast and is type-safe as long as FE-03 builds nodes consistently.

**Filtering non-interactive nodes**:

Start and goal nodes should not open the panel (per FR-001 and spec US1 scenario 6):

```typescript
const handleNodeClick: NodeMouseHandler = (_event, node) => {
  const pathNode = node.data as PathNode
  if (pathNode.type === 'start' || pathNode.type === 'goal') return
  setSelectedNode(pathNode)
  setIsPanelOpen(true)
}
```

**Note on event propagation**: React Flow handles its own click events internally. There is no need to call `event.stopPropagation()` for the node click handler. Clicking empty canvas areas triggers `onPaneClick` (not `onNodeClick`), so no additional guard is needed to prevent panel from closing on canvas click.

---

## 4. CSS Transition for Panel Slide-In

### Approach: translateX animation

The panel slides in from the right using CSS `transform: translateX`. This approach:
- Does not affect document layout flow (no reflow, no React Flow viewport recalculation)
- Is GPU-accelerated (composite layer)
- Works with `overflow: hidden` on the parent for clean clip

**Tailwind implementation**:

```tsx
<div
  className={`
    fixed top-0 right-0 h-full w-[30%] z-50
    transform transition-transform duration-300 ease-in-out
    ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
  `}
>
  {selectedNode && <DetailPanelContent node={selectedNode} />}
</div>
```

**Key details**:
- `translate-x-full` moves the panel 100% of its own width off-screen to the right (hidden state).
- `translate-x-0` brings it back to its natural position (visible state).
- `duration-300` matches the 300ms requirement from SC-002.
- `ease-in-out` provides natural deceleration.
- `fixed` positioning + high `z-index` ensures overlay mode (does not affect React Flow layout).

**Alternative: width animation**

```tsx
<div className={`transition-[width] duration-300 ${isPanelOpen ? 'w-[30%]' : 'w-0'}`}>
```

This approach shrinks the map canvas by triggering a layout reflow and would cause React Flow viewport recalculation. **Do not use** — this violates FR-008 and SC-002.

---

## 5. Zustand Store Extension Patterns

### Extending an existing Zustand store

If FE-03 created a store at `store/useLifePathStore.ts`, the extension adds new slice fields:

```typescript
import { create } from 'zustand'
import type { PathNode } from '@/types/path'

interface LifePathStore {
  // ... existing fields from prior features ...

  // FE-04 additions
  selectedNode: PathNode | null
  selectedTrack: 'fast' | 'deep' | 'risk' | null
  isPanelOpen: boolean
  setSelectedNode: (node: PathNode | null) => void
  setSelectedTrack: (track: 'fast' | 'deep' | 'risk' | null) => void
  setIsPanelOpen: (open: boolean) => void
}

export const useLifePathStore = create<LifePathStore>((set) => ({
  // ... existing initial state ...

  // FE-04 initial state
  selectedNode: null,
  selectedTrack: null,
  isPanelOpen: false,
  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
}))
```

**Pattern notes**:
- Each setter is a dedicated action function — no combined "updatePanel" action that takes a partial object. This follows the single-responsibility principle.
- `setSelectedTrack` is a toggle-aware action: the `TrackLegend` component passes `null` when the current track is clicked again (the component handles the toggle logic, not the store).
- Zustand `set` is synchronous — no async concerns for these UI state fields.

### Selector pattern for consumers

Components read from the store using individual selectors to avoid unnecessary re-renders:

```typescript
// DetailPanel reads only what it needs
const selectedNode = useLifePathStore((s) => s.selectedNode)
const isPanelOpen = useLifePathStore((s) => s.isPanelOpen)
const setIsPanelOpen = useLifePathStore((s) => s.setIsPanelOpen)

// TrackLegend reads only track state
const selectedTrack = useLifePathStore((s) => s.selectedTrack)
const setSelectedTrack = useLifePathStore((s) => s.setSelectedTrack)
```

This pattern is preferred over destructuring the entire store object, as it minimizes re-renders by subscribing only to the specific fields needed.

---

## 6. Track Highlight / Dim Implementation in React Flow

### Applying opacity via node style

React Flow nodes accept a `style` prop of type `React.CSSProperties`. To apply opacity:

```typescript
const applyTrackOpacity = (
  nodes: Node[],
  selectedTrack: 'fast' | 'deep' | 'risk' | null
): Node[] => {
  if (!selectedTrack) return nodes
  return nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      opacity: node.data.track === selectedTrack ? 1 : 0.3,
      transition: 'opacity 0.3s ease',
    },
  }))
}
```

**Edge treatment**: Edges similarly accept a `style` prop. The edge's `data.track` field (set during FE-03 graph construction) determines the opacity:

```typescript
const applyEdgeTrackOpacity = (
  edges: Edge[],
  selectedTrack: 'fast' | 'deep' | 'risk' | null
): Edge[] => {
  if (!selectedTrack) return edges
  return edges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: edge.data?.track === selectedTrack ? 1 : 0.3,
      transition: 'opacity 0.3s ease',
    },
  }))
}
```

**Performance note**: These transformations create new arrays on each render when `selectedTrack` changes. For the hackathon scale (≤30 nodes, ≤40 edges), this is negligible. `useMemo` can be added if needed.

**Merge node special case**: Merge nodes connect multiple tracks. When a track is selected, merge nodes should remain at full opacity if any of their `connectedPaths` includes the selected track. In practice, the simplest approach is to always render merge nodes at opacity 1 regardless of `selectedTrack` (since they are convergence points for all paths).
