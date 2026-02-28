# Component Contracts: FE-04 Panel API

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28

---

## DetailPanel Component Contract

### File

`components/DetailPanel.tsx`

### Props Interface

```typescript
import type { PathNode } from '@/types/path'

interface DetailPanelProps {
  node: PathNode | null
  isOpen: boolean
  onClose: () => void
}
```

### Rendered Output Contract

| Prop state | Expected output |
|---|---|
| `isOpen: false` | Panel container is rendered but visually off-screen (translateX(100%)), not removed from DOM |
| `isOpen: true, node: null` | Panel container is on-screen but renders empty content (guard case — should not occur in normal flow) |
| `isOpen: true, node: { type: 'step' }` | Full panel with label, description, track badge, difficulty badge (if present), duration text, tips list (if present) |
| `isOpen: true, node: { type: 'merge' }` | Full panel with all step fields plus styled `message` quote and connected paths count |
| `isOpen: true, node: { tips: [] }` | Panel renders without tips section — empty array is treated same as undefined |

### Behavior Contract

1. **Mount**: Component is always mounted in the DOM (not conditionally rendered). Visibility is controlled by CSS transform, not by `display: none` or conditional rendering. This avoids remount jank on repeated open/close cycles.

2. **Close trigger**: When `onClose` is called (via the X button), the parent component updates `isPanelOpen` to `false` in the Zustand store, which flows back as `isOpen: false` prop, triggering the CSS transition out.

3. **Node update**: When `isOpen: true` and a new `node` prop is received (user clicked a different node), the panel content updates in place without a close-open cycle. The panel remains open.

4. **CSS transition**: The panel container uses `transition-transform duration-300 ease-in-out`. State `isOpen: true` → `translate-x-0`. State `isOpen: false` → `translate-x-full`. No JS animation — pure CSS.

5. **Close button**: An `<button>` element inside the panel header with an accessible label (`aria-label="패널 닫기"` or equivalent). On click, calls `onClose()`.

### Visual Layout Contract

```
┌─────────────────────────────────┐
│ [label]              [X close]  │  ← CardHeader
│ [description]                   │
├─────────────────────────────────┤
│ [Track Badge] [Difficulty Badge]│  ← CardContent row 1
│ 예상 기간: N개월 후              │  ← CardContent row 2
├─────────────────────────────────┤
│ 💡 Tips                         │  ← CardContent row 3 (if tips exist)
│  • tip 1                        │
│  • tip 2                        │
├─────────────────────────────────┤
│ [Merge: message quote]          │  ← CardContent row 4 (merge only)
│ [Merge: N개의 경로 합류]         │
└─────────────────────────────────┘
```

### Size and Positioning Contract

- Width: `w-[30%]` (30% of viewport width)
- Height: `h-full` (full viewport height)
- Position: `fixed top-0 right-0` (right edge of viewport)
- Z-index: `z-50` (above React Flow canvas which uses z-index in the 0-10 range)
- Background: `bg-background` (shadcn/ui CSS variable — dark theme safe)
- Left border: `border-l border-border` (visual separator from canvas)

### Accessibility Contract

- Panel has `role="complementary"` or `role="dialog"` with `aria-label="노드 상세 정보"`
- Close button has `aria-label="패널 닫기"`
- When `isOpen` transitions to `true`, focus is NOT automatically moved to the panel (hackathon scope — keyboard navigation is optional per L-5)
- Track badge has sufficient color contrast as verified in research.md

---

## TrackLegend Component Contract

### File

`components/TrackLegend.tsx`

### Props Interface

```typescript
import type { TrackId } from '@/lib/trackColors'

interface TrackLegendProps {
  selectedTrack: TrackId | null
  onSelectTrack: (track: TrackId | null) => void
}
```

### Rendered Output Contract

| Prop state | Expected output |
|---|---|
| `selectedTrack: null` | Three legend items, none highlighted |
| `selectedTrack: 'fast'` | Fast Track item highlighted (full opacity, ring or border indicator), Deep Dive and Risk Path items at reduced opacity (0.6) |
| `selectedTrack: 'deep'` | Deep Dive item highlighted, others at reduced opacity |
| `selectedTrack: 'risk'` | Risk Path item highlighted, others at reduced opacity |

### Behavior Contract

1. **Click same track**: When `onSelectTrack` receives the currently selected track, the parent passes `null` (deselect). The legend item returns to normal state and all map nodes return to full opacity.

2. **Click different track**: `onSelectTrack` is called with the new `TrackId`. The previously highlighted item becomes normal; the new item becomes highlighted.

3. **Click any track when none selected**: `onSelectTrack` is called with the clicked `TrackId`. That item becomes highlighted.

4. **Visual indicator for selected state**: Selected item has a visible indicator — a ring/border using `ring-2 ring-white` or an underline — in addition to the color swatch. Opacity of non-selected items is reduced to 0.6 (legend items are dimmed, but less aggressively than map nodes which go to 0.3).

### Visual Layout Contract

```
┌─────────────────────────────────┐
│ ● Fast Track                    │   ← gold dot (#F59E0B) + label
│ ● Deep Dive                     │   ← blue dot (#3B82F6) + label
│ ● Risk Path                     │   ← purple dot (#8B5CF6) + label
└─────────────────────────────────┘
```

- Each item: a 12px colored circle + track label text
- Selected state: circle has a white ring (`ring-2 ring-white ring-offset-1 ring-offset-background`)
- Container: semi-transparent dark background card, positioned `absolute top-4 left-4` within the PathMap container

### Positioning Contract

- Position: `absolute top-4 left-4` within the PathMap's `relative` container
- This places it top-left of the canvas, not overlapping the panel (which is on the right)
- The legend does not overlap React Flow controls (MiniMap on bottom-right, controls on bottom-left if used)

### Accessibility Contract

- Each item is a `<button>` element
- `aria-pressed={selectedTrack === trackId}` on each button
- `aria-label={TRACK_LABELS[trackId] + ' 트랙 선택'}` on each button

---

## Store Selectors for Panel

The following selectors are the canonical way to read and write panel state from any component.

### Reading state

```typescript
import { useLifePathStore } from '@/store/useLifePathStore'

// In DetailPanel parent or page component
const selectedNode = useLifePathStore((s) => s.selectedNode)
const isPanelOpen = useLifePathStore((s) => s.isPanelOpen)

// In TrackLegend parent or page component
const selectedTrack = useLifePathStore((s) => s.selectedTrack)
```

### Writing state

```typescript
// Close panel and clear selection
const setIsPanelOpen = useLifePathStore((s) => s.setIsPanelOpen)
const setSelectedNode = useLifePathStore((s) => s.setSelectedNode)

const handleClose = () => {
  setIsPanelOpen(false)
  setSelectedNode(null)
}

// Select a node (called from onNodeClick in PathMap)
const setSelectedNode = useLifePathStore((s) => s.setSelectedNode)
const setIsPanelOpen = useLifePathStore((s) => s.setIsPanelOpen)

const handleNodeClick = (node: PathNode) => {
  setSelectedNode(node)
  setIsPanelOpen(true)
}

// Toggle track selection (called from TrackLegend's onSelectTrack)
const selectedTrack = useLifePathStore((s) => s.selectedTrack)
const setSelectedTrack = useLifePathStore((s) => s.setSelectedTrack)

const handleSelectTrack = (track: TrackId) => {
  setSelectedTrack(selectedTrack === track ? null : track)
}
```

### Computed selector: opacity-modified nodes

This derived computation runs in the component that passes nodes to `<ReactFlow>`. It is not stored in Zustand — it is a pure transformation applied at render time:

```typescript
// In PathMap.tsx
const selectedTrack = useLifePathStore((s) => s.selectedTrack)

// Applied before passing to <ReactFlow nodes={visibleNodes}>
const visibleNodes = selectedTrack
  ? nodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.data.track === selectedTrack || n.data.type === 'merge' ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
      },
    }))
  : nodes
```

**Note on merge nodes**: Merge nodes are always at opacity 1 when any track is selected, because they are connection points for all tracks. This is handled by the `|| n.data.type === 'merge'` guard.
