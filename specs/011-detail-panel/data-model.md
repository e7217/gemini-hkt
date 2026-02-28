# Data Models: FE-04 노드 클릭 상세 패널 + 트랙 하이라이트

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28

---

## 1. Zustand Store Extensions

### Store interface additions (extend `store/useLifePathStore.ts`)

```typescript
// Types imported from types/path.ts (defined in BE-02)
import type { PathNode } from '@/types/path'

// Track type — narrow string union, not generic string
type TrackId = 'fast' | 'deep' | 'risk'

interface LifePathStoreExtensions {
  // State
  selectedNode: PathNode | null
  selectedTrack: TrackId | null
  isPanelOpen: boolean

  // Actions
  setSelectedNode: (node: PathNode | null) => void
  setSelectedTrack: (track: TrackId | null) => void
  setIsPanelOpen: (open: boolean) => void
}
```

### Initial state values

```typescript
const initialPanelState = {
  selectedNode: null,
  selectedTrack: null,
  isPanelOpen: false,
}
```

### Action implementations

```typescript
setSelectedNode: (node) => set({ selectedNode: node }),
setSelectedTrack: (track) => set({ selectedTrack: track }),
setIsPanelOpen: (open) => set({ isPanelOpen: open }),
```

**State invariants**:
- `isPanelOpen === true` implies `selectedNode !== null` (a panel cannot be open without a selected node).
- `selectedNode !== null` does NOT imply `isPanelOpen === true` (the selected node can be stored while panel is closing).
- `selectedTrack` is fully independent of `selectedNode` and `isPanelOpen`.

---

## 2. Track Color Constant

### `lib/trackColors.ts` (create or extend)

```typescript
export type TrackId = 'fast' | 'deep' | 'risk'

export const TRACK_COLORS: Record<TrackId, string> = {
  fast: '#F59E0B',   // Amber/Gold — Fast Track
  deep: '#3B82F6',   // Blue — Deep Dive
  risk: '#8B5CF6',   // Purple — Risk Path
} as const

export const TRACK_LABELS: Record<TrackId, string> = {
  fast: 'Fast Track',
  deep: 'Deep Dive',
  risk: 'Risk Path',
} as const

export const TRACK_TEXT_COLORS: Record<TrackId, string> = {
  fast: '#000000',   // Black text on gold badge
  deep: '#ffffff',   // White text on blue badge
  risk: '#ffffff',   // White text on purple badge
} as const
```

**Why a separate constant file**: Both `DetailPanel.tsx` and `TrackLegend.tsx` need the same color map. Centralizing it avoids duplication and ensures consistency. If a color changes, it changes in one place.

---

## 3. DetailPanel Props Interface

```typescript
// components/DetailPanel.tsx

import type { PathNode } from '@/types/path'

interface DetailPanelProps {
  node: PathNode | null
  isOpen: boolean
  onClose: () => void
}
```

**Props design rationale**:
- Props are passed explicitly rather than reading directly from Zustand, making the component testable in isolation (pure render based on props).
- The parent component (e.g., `PathMap.tsx` or the page) reads from Zustand and passes the values down. This follows the pattern used in FE-03.
- `onClose` is a callback rather than a Zustand action reference — this keeps the component decoupled from the store shape.

**Alternative considered**: Reading from Zustand directly inside `DetailPanel`. Rejected because it couples the component to the global store, making isolated rendering and future testing harder.

---

## 4. TrackLegend Props Interface

```typescript
// components/TrackLegend.tsx

import type { TrackId } from '@/lib/trackColors'

interface TrackLegendProps {
  selectedTrack: TrackId | null
  onSelectTrack: (track: TrackId | null) => void
}
```

**Props design rationale**:
- Same pattern as `DetailPanel` — props-driven rendering, parent handles Zustand reads/writes.
- `onSelectTrack` accepts `TrackId | null` to allow the parent to implement toggle logic (passing `null` when the currently selected track is clicked again).

**Toggle logic in the parent**:

```typescript
// In PathMap.tsx or the page component
const selectedTrack = useLifePathStore((s) => s.selectedTrack)
const setSelectedTrack = useLifePathStore((s) => s.setSelectedTrack)

const handleSelectTrack = (track: TrackId | null) => {
  setSelectedTrack(selectedTrack === track ? null : track)
}
```

---

## 5. PathNode Type (reference — defined in BE-02)

The following is the existing type from `types/path.ts` that this feature reads from. No changes are made to this type.

```typescript
interface PathNode {
  id: string
  type: 'start' | 'step' | 'merge' | 'goal'
  label: string
  description: string
  monthsFromNow: number
  track: 'fast' | 'deep' | 'risk'
  difficulty?: 'low' | 'medium' | 'high'
  tips?: string[]
}
```

**Fields used by DetailPanel**:

| Field | Usage | Required? |
|---|---|---|
| `id` | React key | Always present |
| `type` | Gate merge-specific rendering | Always present |
| `label` | Panel title (`CardTitle`) | Always present |
| `description` | Panel subtitle (`CardDescription`) | Always present |
| `monthsFromNow` | Duration text (e.g., "6개월 후") | Always present |
| `track` | Track `Badge` color and label | Always present |
| `difficulty` | Difficulty `Badge` | Optional — omit badge if undefined |
| `tips` | Tips `<ul>` list | Optional — omit section if undefined or empty |

**MergePoint fields** (when `type === 'merge'`, additional data from `MergePoint`):

The merge node data may be constructed from the `MergePoint` type during FE-03 graph transformation. The relevant fields for the panel:

```typescript
interface MergePoint {
  id: string
  label: string
  message: string            // Displayed as styled quote in panel
  connectedPaths: string[]   // Path IDs; count shown in panel
  monthsFromNow: number
}
```

**Note**: The `merge` type `PathNode` in the graph may embed `message` and `connectedPaths` in its `data` object. The exact shape depends on how FE-03 constructs merge nodes. If `message` and `connectedPaths` are not present on the `PathNode` type directly, they will be accessed via `node.data` in the React Flow node click handler and stored in `selectedNode` only if the `PathNode` interface is extended (or if a union type is used).

**Recommended approach**: Extend the store's `selectedNode` type to:

```typescript
type SelectedNodeData = PathNode & {
  message?: string
  connectedPaths?: string[]
}
```

This allows merge-specific fields to flow through without changing the core `PathNode` type.

---

## 6. React Flow Node Data Shape (integration with FE-03)

When FE-03 creates React Flow nodes from `PathMap`, each node's `data` field contains the `PathNode`. The expected shape:

```typescript
// React Flow Node type from @xyflow/react v12
type FlowNode = Node<PathNode>

// Each node in the nodes array passed to <ReactFlow>:
{
  id: 'node-1',
  type: 'stepNode',    // registered custom node type
  position: { x: 0, y: 0 },  // set by dagre
  data: {              // PathNode data
    id: 'node-1',
    type: 'step',
    label: '포트폴리오 구축',
    description: '...',
    monthsFromNow: 6,
    track: 'fast',
    difficulty: 'medium',
    tips: ['...']
  }
}
```

The `onNodeClick` handler casts `node.data as PathNode` to retrieve the typed data. This cast is safe as long as FE-03 constructs nodes with `PathNode` in `data`.
