# Developer Quickstart: FE-04 Panel Interactions

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28

---

## Prerequisites

Before testing this feature, verify the following are in place:

1. FE-03 is complete — the React Flow map renders with nodes from a `PathMap` response.
2. The app runs locally (`npm run dev`, `http://localhost:3000`).
3. A `PathMap` is loaded — either via the goal input form triggering `POST /api/paths/simulate`, or via mock mode (`USE_MOCK=true` in `.env.local`).

---

## Quick Environment Setup

```bash
# Enable mock mode so the map always loads with stable test data
echo "USE_MOCK=true" >> .env.local

# Start the dev server
npm run dev
```

Navigate to `http://localhost:3000`, enter any goal, click "경로 생성하기". The map should render with three tracks of nodes.

---

## Testing Panel Interactions

### Test 1: Node Click Opens Detail Panel

1. Look at the React Flow map. Identify any non-circular node (step nodes are rounded rectangles).
2. Click the node.
3. **Expected**: A panel slides in from the right (30% width). Panel should show:
   - Node title (bold, large)
   - Description text (muted color)
   - Track badge (gold/blue/purple background matching the node's track color)
   - Difficulty badge (if the node has difficulty)
   - Duration text like "6개월 후" or "12개월 후"
   - Tips list (if the node has tips)
4. **If it fails**: Check browser console for errors. Verify `onNodeClick` is wired in `PathMap.tsx`. Verify Zustand store has `selectedNode` and `isPanelOpen` fields.

### Test 2: Panel Close Button

1. Open the panel via node click (Test 1).
2. Click the X button in the panel header.
3. **Expected**: Panel slides out to the right over ~300ms. Map returns to full-width view.
4. **If it fails**: Verify `onClose` prop is passed to `DetailPanel` and calls `setIsPanelOpen(false)`.

### Test 3: Switching Nodes Without Closing

1. Open the panel by clicking a node.
2. Without closing, click a different node on the map.
3. **Expected**: Panel content updates to show the new node's information. Panel does NOT close and reopen.
4. **If it fails**: Verify `setSelectedNode` updates the store and that `DetailPanel` re-renders with the new node prop.

### Test 4: Track Legend Highlight

1. Locate the track legend in the top-left area of the map canvas.
2. Click "Fast Track" (gold item).
3. **Expected**: Fast Track nodes are at full opacity. Deep Dive and Risk Path nodes are dimmed (visibly darker/faded). Merge point nodes (large circles) remain at full opacity.
4. **If it fails**: Check `applyTrackOpacity` function in `PathMap.tsx`. Verify nodes have `data.track` set correctly.

### Test 5: Track Deselect

1. Click "Fast Track" to select it (Test 4).
2. Click "Fast Track" again.
3. **Expected**: All nodes return to full opacity. No dimming on any track.
4. **If it fails**: Verify the toggle logic: `setSelectedTrack(selectedTrack === track ? null : track)`.

### Test 6: Track Switch

1. Click "Deep Dive" in the legend.
2. Observe Deep Dive nodes highlighted, others dimmed.
3. Click "Risk Path".
4. **Expected**: Risk Path nodes are now highlighted. Deep Dive nodes are now dimmed. Transition between tracks is immediate (no animation delay on the selection switch).

### Test 7: Merge Node Panel Content

1. Identify the merge node on the map — it is a larger circle where multiple paths converge (typically positioned near the middle or top of the map).
2. Click the merge node.
3. **Expected**: The panel shows the merge node's label and description, plus a styled quote displaying the `message` field (italic, accent color), and a line indicating how many paths connect at this point (e.g., "3개의 경로 합류").
4. **If it fails**: Check that the `merge` type check in `DetailPanel` renders the `message` and `connectedPaths` section.

### Test 8: Node with No Tips

1. To test this, you need a node without `tips` in the mock data. Check `lib/mockData.ts` for a node definition.
2. Click a node that has no `tips` field.
3. **Expected**: Panel renders without a tips section. No empty bullet list, no "No tips available" placeholder.
4. **If it fails**: Verify the `tips && tips.length > 0 && <TipsSection />` conditional render pattern.

---

## Verifying Zustand Store State (Browser DevTools)

Install the Redux DevTools browser extension, then open `__REDUX_DEVTOOLS_EXTENSION__` in the browser console. Alternatively, use Zustand's built-in devtools middleware if enabled.

A simpler approach — add temporary debug output to the page:

```tsx
// Temporary debug panel (remove before demo)
const { selectedNode, selectedTrack, isPanelOpen } = useLifePathStore()
console.log({ selectedNode: selectedNode?.id, selectedTrack, isPanelOpen })
```

---

## Common Issues and Fixes

### Panel does not appear on node click

- Check `onNodeClick` is passed to `<ReactFlow onNodeClick={handleNodeClick}>`.
- Verify `handleNodeClick` calls `setSelectedNode` and `setIsPanelOpen(true)`.
- Ensure `DetailPanel` is rendered in the JSX (not accidentally commented out or conditionally excluded).

### Panel appears but content is empty

- Check that `node.data` contains the full `PathNode` object. Add `console.log(node.data)` inside the click handler.
- Verify `DetailPanel` receives `node` prop correctly from the parent.

### CSS transition not working (panel jumps instead of slides)

- Verify the panel container has `transition-transform duration-300` classes.
- Verify `translate-x-0` / `translate-x-full` are being toggled correctly via the `isOpen` prop.
- Check that Tailwind is not purging these classes — if using dynamic class names, ensure they are in the safelist or use a fixed conditional pattern.

### Opacity not changing on track select

- Verify `selectedTrack` is being read from the Zustand store in `PathMap.tsx`.
- Verify the `applyTrackOpacity` function is applied to the `nodes` array before passing to `<ReactFlow>`.
- Check that `node.data.track` is set correctly in the graph construction utility (`lib/graphUtils.ts`).

### Dark theme panel is unreadable

- Check that `bg-background` uses the correct CSS variable for dark mode (requires `.dark` class on `<html>`).
- Verify the dark theme is active (FE-02 prerequisite).
- If badge text is unreadable, review `TRACK_TEXT_COLORS` in `lib/trackColors.ts` and ensure the correct text color is applied via inline `style`.

---

## File Locations Reference

| File | Purpose |
|---|---|
| `components/DetailPanel.tsx` | Right-side detail panel component |
| `components/TrackLegend.tsx` | Track selector legend component |
| `lib/trackColors.ts` | Track color constants (TRACK_COLORS, TRACK_LABELS, TRACK_TEXT_COLORS) |
| `store/useLifePathStore.ts` | Zustand store (selectedNode, selectedTrack, isPanelOpen + actions) |
| `components/PathMap/PathMap.tsx` | React Flow canvas — wires onNodeClick, applies opacity, renders TrackLegend + DetailPanel |
| `types/path.ts` | PathNode, PathMap, MergePoint type definitions (from BE-02) |
