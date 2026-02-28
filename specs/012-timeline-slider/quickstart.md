# Quickstart & Testing Guide: FE-05 타임라인 슬라이더

**Branch**: `007-timeline-slider`
**Date**: 2026-02-28

---

## Prerequisites

Before testing FE-05, ensure the following are in place:

- [ ] FE-03 (React Flow canvas + custom nodes) is implemented and the map renders correctly
- [ ] The Zustand store (`useLifePathStore`) has `timelineMonths: number` and `setTimelineMonths` added
- [ ] `lib/timelineFilter.ts` exists with `filterNodesByMonths` and `filterEdgesByNodes` exported
- [ ] `hooks/useDebounce.ts` exists
- [ ] `hooks/useTimelineFilter.ts` exists and is wired into `PathMap.tsx`
- [ ] `components/TimelineSlider.tsx` is rendered inside the ReactFlow container

---

## Local Dev Setup

```bash
# 1. Start the dev server
npm run dev

# 2. Open the app
open http://localhost:3000

# 3. Generate a path map (or use mock mode for reliable data)
# In .env.local:
USE_MOCK=true

# 4. Submit any goal string to load the map view
```

---

## Manual Test Scenarios

### Test 1: Slider Renders at Correct Position

**Steps**:
1. Load the app and generate a path
2. The path map canvas renders
3. Inspect the bottom of the canvas

**Expected**:
- Slider bar is visible at the bottom of the map, inside the canvas area
- Slider does not overlap the lowest visible node
- Slider label shows "3년" (default value of 36 months)
- Slider thumb is positioned at the midpoint of the track

**Pass Criteria**: Visual inspection confirms correct position and default state.

---

### Test 2: Slider Filtering — 1 Year (12 months)

**Steps**:
1. Load the map with a full path (5-year data)
2. Drag the slider to the leftmost position (12 months / 1년)
3. Wait for the debounce to fire (~200ms after releasing)

**Expected**:
- Only nodes with `monthsFromNow <= 12` are visible
- Start node is always visible
- Goal node is always visible
- Nodes with `monthsFromNow > 12` are not rendered
- Edges connected to hidden nodes are not rendered
- Visible nodes are re-laid-out by dagre (no empty gaps)
- `fitView` fires and the viewport adjusts to show all visible nodes

**Pass Criteria**: Node count in the DOM matches expected visible count. No dangling edge stubs visible.

---

### Test 3: Slider Filtering — 5 Years (60 months)

**Steps**:
1. Start from 1-year view (Test 2 state)
2. Drag slider to the rightmost position (60 months / 5년)
3. Wait for debounce

**Expected**:
- All nodes from the path data are visible
- All edges are visible
- Dagre layout recalculates for the full node set
- fitView adjusts to show the full map

**Pass Criteria**: Node count matches the total nodes in the original PathMap data.

---

### Test 4: Progressive Node Appearance — 1y → 3y → 5y

**Steps**:
1. Set slider to 12 months (1년)
2. Drag to 36 months (3년) — observe
3. Drag to 60 months (5년) — observe

**Expected**:
- Moving from 12 to 36: nodes with `monthsFromNow` between 13 and 36 appear
- Moving from 36 to 60: nodes with `monthsFromNow` between 37 and 60 appear
- Each newly appearing node shows a fade-in + scale animation (opacity 0→1, scale 0.8→1, 300ms)
- Already-visible nodes do not re-animate

**Pass Criteria**: Animation is visually observable for newly revealed nodes. Previously visible nodes remain static.

---

### Test 5: Debounce — Fast Drag Performance

**Steps**:
1. Open browser DevTools → Console tab
2. Add a temporary `console.log('dagre recalc', Date.now())` at the start of the dagre call in `useTimelineFilter`
3. Drag the slider rapidly from 12 to 60 (approximately 1 second of continuous motion)
4. Count the number of console log lines

**Expected**:
- Console log appears at most every 175ms during the drag
- For a 1-second continuous drag, expect at most 6–7 log entries (not 60+)
- No visible jank or frame drops during the drag
- The map updates smoothly after each debounce window

**Pass Criteria**: Log count confirms debounce is working. UI remains responsive.

---

### Test 6: Start and Goal Nodes Always Visible

**Steps**:
1. Set slider to 12 months
2. Verify the start node (person icon, pulsing) is visible
3. Verify the goal node (star/glow) is visible even if its `monthsFromNow` is 60

**Expected**:
- Both nodes visible at all slider values (12, 36, 60)
- No slider position makes either node disappear

**Pass Criteria**: Manual inspection at slider minimum confirms both nodes present.

---

### Test 7: Pivot Button Mode (if slider is not implemented)

**Steps**:
1. If `TimelineSlider` is replaced with pivot buttons ("1년" / "3년" / "5년"):
2. Click "1년" button
3. Wait for recalculation
4. Click "3년" button
5. Wait for recalculation
6. Click "5년" button

**Expected**:
- Same filtering behavior as Tests 2–4 above
- Active button has a visual highlight (ring or background change)
- No debounce needed (button click is instantaneous)
- Animation still fires for newly visible nodes

**Pass Criteria**: All Test 2–4 pass criteria apply. Functionally equivalent to slider.

---

### Test 8: Slider Label Accuracy

**Steps**:
1. Drag slider to various positions and read the label

**Expected**:
- Position 12 → label shows "1년"
- Position 24 → label shows "2년"
- Position 36 → label shows "3년"
- Position 48 → label shows "4년"
- Position 60 → label shows "5년"
- Intermediate position 18 → label shows "18개월"

**Pass Criteria**: All 5 year-boundary labels are correct.

---

## Verifying the Animation CSS

To confirm the CSS animation is working:

1. Open DevTools → Elements
2. Find a custom node element that just appeared
3. Inspect the class list — it should contain `node-enter` (or equivalent)
4. After 350ms, the class should be removed

Alternatively, in DevTools → Animations panel, observe the `nodeEnter` keyframe animation when a new node appears.

---

## Common Issues and Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Slider renders outside the canvas | `TimelineSlider` not inside the ReactFlow container div | Move `<TimelineSlider />` inside the `<div className="relative">` wrapping `<ReactFlow>` |
| All nodes disappear at slider minimum | Start/goal node type check missing in `filterNodesByMonths` | Add `node.type === 'start' \|\| node.type === 'goal'` check |
| dagre fires on every frame during drag | `useDebounce` not applied, or `useTimelineFilter` watching raw `timelineMonths` | Ensure the `useEffect` in the hook watches `debouncedMonths`, not `timelineMonths` |
| Dangling edges visible | `filterEdgesByNodes` not called, or called with wrong node ID set | Verify `new Set(filteredNodes.map(n => n.id))` is passed to `filterEdgesByNodes` |
| Animation re-fires on every slider change | `seenNodeIds` ref not persisting between renders | Use `useRef<Set<string>>` (not `useState`) for `seenNodeIds` |
| fitView does not center visible nodes | `fitView` called before React commits node positions | Wrap `fitView` call in `requestAnimationFrame` |
| Nodes from previous time window missing | `allNodesRef` being overwritten on re-render | Set `allNodesRef.current` only in a `useEffect` with an empty or `[pathMap]` dependency array |
