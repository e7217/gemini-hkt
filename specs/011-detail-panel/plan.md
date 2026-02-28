# Implementation Plan: FE-04 노드 클릭 상세 패널 + 트랙 하이라이트

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28
**Estimated Time**: 30 minutes
**Complexity**: Medium

---

## Technical Context

### Dependencies (must be complete before starting)

- **FE-03**: React Flow canvas and custom nodes must be implemented. This feature requires the `onNodeClick` handler to exist on the `<ReactFlow>` component, the PathMap data transformation utilities in `lib/graphUtils.ts`, and the existing Zustand store structure.
- **BE-02**: Shared TypeScript types (`PathNode`, `PathMap`, `PathInfo`, `MergePoint`) from `types/path.ts` must be defined and exported.
- **FE-02**: Dark theme CSS variables and track color tokens must be in place.

### Key Libraries

| Library | Version | Usage in this feature |
|---|---|---|
| `@xyflow/react` | v12 | `onNodeClick` event, node `style` prop for opacity |
| `zustand` | latest | store extensions: `selectedNode`, `selectedTrack`, `isPanelOpen` |
| `shadcn/ui` Card | installed | `DetailPanel` outer container |
| `shadcn/ui` Badge | installed | Track and difficulty labels in panel |
| Tailwind CSS | v3 | Layout, transitions, dark theme utilities |

### Approach Decision: Overlay vs. Map-Shrink

Two panel layout approaches exist:

**Option A — Overlay**: Panel floats over the React Flow canvas (fixed or absolute positioning). Map canvas keeps full width. Panel has semi-transparent background or sharp boundary.

**Option B — Map-Shrink**: Panel occupies 30% of the parent flex container. React Flow canvas shrinks to 70% width. Triggers React Flow viewport recalculation on each open/close.

**Decision: Overlay (Option A)** for the following reasons:
1. Map-shrink causes React Flow to recalculate layout and potentially re-run `fitView`, causing jank (violates SC-002).
2. Overlay avoids any React Flow viewport side effects during panel transition.
3. The overlay approach is simpler to implement within the 30-minute budget.
4. The demo resolution target is 1280px+ (L-1), where overlay does not obscure critical map nodes.

The panel will use `position: fixed` on the right side with a high `z-index`, sliding in/out via `transform: translateX`.

---

## Constitution Check

| Principle | Requirement | Implementation approach |
|---|---|---|
| YAGNI | Build only what is specified | No hover tooltips (D-4), no long-press preview, no difficulty star visualization (F-5) — these are optional features |
| SOLID / Single Responsibility | Each component has one job | `DetailPanel` renders node info only. `TrackLegend` renders track selector only. Store actions are granular. |
| TypeScript no-any | Strict types throughout | `PathNode` type from `types/path.ts` used directly. No `as any` casts. Node click handler typed as `NodeMouseHandler` from `@xyflow/react`. |
| Fail-Safe with fallback | Graceful rendering with missing data | Optional fields (`difficulty`, `tips`) guarded with `&&` conditional rendering. Merge node handled with a `type === 'merge'` branch. |
| Max 2 nesting depth | JSX and logic depth | Panel content extracted into sub-render functions or small sub-components to keep JSX flat. |
| Max 20 line functions | Function size | Each render helper (renderTips, renderDifficultyBadge, renderTrackBadge) is ≤20 lines. |

---

## Project Structure

### New files to create

```
components/
  DetailPanel.tsx           # Right-side detail panel component
  TrackLegend.tsx           # Track selector legend component

lib/
  trackColors.ts            # Track color constant map (may already exist; extend if so)
```

### Files to modify

```
store/
  useLifePathStore.ts       # Add selectedNode, selectedTrack, isPanelOpen + actions

components/PathMap/
  PathMap.tsx               # Add onNodeClick handler, pass selectedTrack to node style logic
                            # Import and render TrackLegend and DetailPanel
```

### File layout within components/PathMap/ (assumed from FE-03)

```
components/PathMap/
  PathMap.tsx               # Main canvas component (modify)
  index.ts                  # Re-export (no change)

components/nodes/
  StartNode.tsx             # (no change)
  StepNode.tsx              # (no change — opacity applied via data prop or style from parent)
  MergeNode.tsx             # (no change)
  GoalNode.tsx              # (no change)
```

---

## Integration Points

### 1. onNodeClick in PathMap.tsx

The `PathMap.tsx` component (from FE-03) renders `<ReactFlow>`. Add the `onNodeClick` prop:

```typescript
// NodeMouseHandler type from @xyflow/react
const handleNodeClick: NodeMouseHandler = (_event, node) => {
  const pathNode = node.data as PathNode
  if (pathNode.type === 'start' || pathNode.type === 'goal') return
  setSelectedNode(pathNode)
  setIsPanelOpen(true)
}
```

This handler is ≤10 lines and uses the `PathNode` type from `types/path.ts` — no `any`.

### 2. Opacity logic in PathMap.tsx

When `selectedTrack` is non-null, the nodes/edges arrays must be mapped to include opacity styles. This transformation happens inside `PathMap.tsx` before passing to `<ReactFlow>`:

```typescript
const visibleNodes = selectedTrack
  ? nodes.map(n => ({
      ...n,
      style: { ...n.style, opacity: n.data.track === selectedTrack ? 1 : 0.3 }
    }))
  : nodes
```

A parallel transformation applies to edges using the edge's `data.track` field.

### 3. TrackLegend placement

`TrackLegend` renders as an absolutely positioned overlay inside the PathMap container, top-left or top-center of the canvas. It uses `position: absolute` within the relative-positioned PathMap wrapper.

### 4. DetailPanel placement

`DetailPanel` renders outside the `<ReactFlow>` component, as a sibling in the page layout. It uses `position: fixed` on the right edge of the viewport.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| React Flow node data shape mismatch | Low | High | Confirm FE-03 stores `PathNode` in `node.data`; adjust cast if needed |
| CSS transition conflicts with Tailwind | Low | Low | Use explicit `transition-transform duration-300` Tailwind classes |
| Zustand store shape conflict with existing fields | Low | Medium | Read existing store before extending; use separate slice if needed |
| Panel overlapping map controls (zoom buttons) | Medium | Low | Position panel on right, legend on top-left; no conflicts expected |

---

## Implementation Sequence (30-minute budget)

| Step | Task | Time |
|---|---|---|
| 1 | Extend Zustand store with 3 fields + 3 actions | 5 min |
| 2 | Implement `DetailPanel.tsx` with shadcn Card + Badge | 10 min |
| 3 | Implement `TrackLegend.tsx` with click handler | 5 min |
| 4 | Wire `onNodeClick` in PathMap + opacity logic | 5 min |
| 5 | CSS transition polish + dark theme validation | 5 min |
