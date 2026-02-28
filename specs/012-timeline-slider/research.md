# Research Findings: FE-05 타임라인 슬라이더

**Date**: 2026-02-28
**Branch**: `007-timeline-slider`

---

## 1. shadcn/ui Slider Component

### API Summary

The shadcn/ui `Slider` component wraps Radix UI's `@radix-ui/react-slider`. It is a controlled component that accepts a `value` array and fires `onValueChange` with a new array on drag.

```tsx
import { Slider } from '@/components/ui/slider'

// Controlled usage
<Slider
  min={12}
  max={60}
  step={1}
  value={[timelineMonths]}
  onValueChange={([value]) => setTimelineMonths(value)}
  className="w-full"
/>
```

**Key Props**:
- `min: number` — minimum value (use 12 for 1 year)
- `max: number` — maximum value (use 60 for 5 years)
- `step: number` — increment step (use 1 for month-level granularity; use 12 for year-snapping)
- `value: number[]` — controlled value array (single-thumb = one-element array)
- `onValueChange: (value: number[]) => void` — fires on every drag frame
- `defaultValue: number[]` — for uncontrolled usage (not recommended here)
- `disabled: boolean` — disables interaction

**Styling**: The component uses Tailwind classes. The track, range, and thumb are all styled via className on the root. Custom thumb position labels require a wrapper `<div>` with `relative` positioning.

**Installation check**: Verify `components/ui/slider.tsx` exists. If not, run `npx shadcn@latest add slider`.

### Native Fallback

If shadcn/ui is not available or adds too much complexity, use a native `<input type="range">`:

```tsx
<input
  type="range"
  min={12}
  max={60}
  step={1}
  value={timelineMonths}
  onChange={e => setTimelineMonths(Number(e.target.value))}
  className="w-full accent-amber-400"
/>
```

The `accent-color` CSS property styles the native range thumb and track in modern browsers. No JavaScript animation needed.

---

## 2. Debounce: Custom useDebounce Hook vs. lodash

### Recommendation: Custom Hook (No New Dependency)

A custom `useDebounce` hook avoids adding lodash to the bundle. The implementation is 10 lines and covers all required use cases.

```tsx
// hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debouncedValue
}
```

**Usage in useTimelineFilter**:

```tsx
const debouncedMonths = useDebounce(timelineMonths, 175) // 150–200ms midpoint
// Only runs dagre when debouncedMonths changes, not on every frame
useEffect(() => { /* dagre recalc */ }, [debouncedMonths])
```

### Alternative: useRef + setTimeout Pattern

If a hook abstraction feels like over-engineering, the debounce can be inlined in the parent effect:

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

const handleSliderChange = useCallback((months: number) => {
  setTimelineMonths(months) // immediate store update for label
  if (timerRef.current) clearTimeout(timerRef.current)
  timerRef.current = setTimeout(() => recalculateLayout(months), 175)
}, [setTimelineMonths, recalculateLayout])
```

**Verdict**: `useDebounce` hook is cleaner and reusable. `useRef` pattern is simpler if the hook feels like YAGNI.

---

## 3. dagre Layout Recalculation Pattern

### Existing Pattern from FE-03

FE-03 implements a `getLayoutedElements(nodes, edges)` utility (typically in `lib/dagre.ts` or `lib/layout.ts`). The function creates a new `dagre.graphlib.Graph`, adds nodes with their dimensions, adds edges, runs `dagre.layout(g)`, and returns nodes with updated `position` properties.

The key insight: **dagre layout must be called on the filtered node set**, not the full node set. Passing hidden nodes to dagre wastes computation and produces incorrect positions.

```ts
// Pattern: filter first, then layout
const visibleNodes = filterNodesByMonths(allNodes, timelineMonths)
const visibleEdges = filterEdgesByNodes(allEdges, new Set(visibleNodes.map(n => n.id)))
const { nodes: laidOutNodes, edges: laidOutEdges } = getLayoutedElements(visibleNodes, visibleEdges)
setNodes(laidOutNodes)
setEdges(laidOutEdges)
```

### Node Dimensions for dagre

dagre requires explicit width/height for each node to compute positions. The custom nodes from FE-03 should have these set in their data or as React Flow node properties:

```ts
const nodeWithDimensions = {
  ...node,
  width: node.width ?? 180,   // fallback to default width
  height: node.height ?? 60,  // fallback to default height
}
```

### fitView After setNodes

`fitView` must be called after React has committed the new node positions. The safest pattern:

```tsx
const { fitView } = useReactFlow()

// Inside the debounced effect:
setNodes(laidOutNodes)
setEdges(laidOutEdges)
// fitView in next microtask to ensure positions are committed
requestAnimationFrame(() => fitView({ duration: 400, padding: 0.1 }))
```

The `duration` option animates the viewport transition, enhancing the "growth" effect.

---

## 4. React Flow setNodes/setEdges for Filtering

### Using useReactFlow Hook

Inside a component wrapped by `<ReactFlowProvider>`, the `useReactFlow` hook provides `setNodes`, `setEdges`, and `fitView`:

```tsx
import { useReactFlow } from '@xyflow/react'

function useTimelineFilter(allNodes: Node[], allEdges: Edge[], months: number) {
  const { setNodes, setEdges, fitView } = useReactFlow()
  // ...
}
```

### Keeping Full Node/Edge Set in Ref

The Zustand store or a ref should hold the **complete** unfiltered node+edge set as the source of truth. The filtered set is derived and passed to React Flow. This prevents progressive data loss (e.g., a node filtered out at 12 months must still be available when the slider returns to 60 months).

```tsx
// In PathMap.tsx or the parent:
const allNodesRef = useRef<Node[]>(initialNodes)  // set once when pathMap loads
const allEdgesRef = useRef<Edge[]>(initialEdges)

// In useTimelineFilter:
const filtered = filterNodesByMonths(allNodesRef.current, months)
```

### Alternative: React Flow `hidden` Property

React Flow supports a `hidden: boolean` property on nodes and edges. Setting `node.hidden = true` removes the node from the canvas but keeps it in the internal store. This avoids the need to call `setNodes` on every slider change — instead, update only the `hidden` property.

```ts
// Simpler approach: toggle hidden flag
const updatedNodes = allNodes.map(node => ({
  ...node,
  hidden: !shouldBeVisible(node, months),
}))
setNodes(updatedNodes)
```

**Trade-off**: The `hidden` approach skips dagre recalculation (hidden nodes still occupy space in dagre's graph). Positions of visible nodes will have gaps where hidden nodes were. This is undesirable — the layout should reflow around only the visible nodes. Therefore, **full dagre recalculation is preferred** over the `hidden` flag approach.

---

## 5. CSS Transition for Node Appearance Animation

### Approach: CSS Class on New Nodes

Track which node IDs have been seen before (via a `useRef<Set<string>>`). When a node is newly visible, add a CSS class that triggers the animation via `@keyframes` or `transition`.

```css
/* globals.css or tailwind custom animation */
@keyframes nodeEnter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.node-enter {
  animation: nodeEnter 300ms ease-out forwards;
}
```

### Applying the Class in Custom Node Component

The custom node from FE-03 receives `data` props. Pass a `isNew: boolean` flag in node data to conditionally apply the class:

```tsx
// In custom node component:
<div className={`node-wrapper ${data.isNew ? 'node-enter' : ''}`}>
  {/* node content */}
</div>
```

Remove the flag after the animation completes to prevent re-triggering:

```tsx
// After setNodes in useTimelineFilter:
setTimeout(() => {
  setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, isNew: false } })))
}, 350) // slightly longer than 300ms animation
```

### Alternative: CSS transition Property

Instead of `@keyframes`, use CSS `transition` on the node wrapper and toggle a CSS class:

```css
.node-wrapper {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.node-wrapper.hidden {
  opacity: 0;
  transform: scale(0.8);
}
```

Start new nodes with the `hidden` class, then remove it in the next frame:

```tsx
// Add node with hidden class, then remove in next frame
requestAnimationFrame(() => {
  setNodes(prev => prev.map(n =>
    newNodeIds.has(n.id) ? { ...n, data: { ...n.data, isNew: false } } : n
  ))
})
```

**Verdict**: The `@keyframes nodeEnter` approach with a `isNew` flag is simpler to reason about and less prone to race conditions than toggling classes across render cycles.

---

## 6. Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Slider component | shadcn/ui `Slider` with native `<input type="range">` fallback | shadcn/ui preferred; native range as pivot fallback requires zero extra install |
| Debounce | Custom `useDebounce` hook, 175ms | No lodash dependency; reusable; simple implementation |
| Filtering approach | Full dagre recalculation on filtered set | Correct positions with no layout gaps; `hidden` flag approach avoids recalc but produces gaps |
| Source of truth | Unfiltered nodes/edges kept in `useRef` | Prevents data loss during repeated slider adjustments |
| Animation | CSS `@keyframes nodeEnter` + `isNew` flag in node data | Simpler than Framer Motion; no new dependency; easy to reason about |
| fitView timing | `requestAnimationFrame` after `setNodes`/`setEdges` | Ensures React commit cycle completes before viewport calculation |
