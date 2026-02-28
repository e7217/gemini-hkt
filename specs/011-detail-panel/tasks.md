# Task List: FE-04 노드 클릭 상세 패널 + 트랙 하이라이트

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28
**Total Estimated Time**: 30 minutes
**Depends On**: FE-03 complete (PathMap renders, PathNode types exist, Zustand store exists)

---

## Phase 1: Setup (2 minutes)

### TASK-001: Verify prerequisites and identify existing store shape

- Read `store/useLifePathStore.ts` to understand the existing fields and the `create()` call structure.
- Read `types/path.ts` to confirm `PathNode` interface is defined with `id`, `type`, `label`, `description`, `monthsFromNow`, `track`, `difficulty?`, `tips?`.
- Read `components/PathMap/PathMap.tsx` to confirm `<ReactFlow>` is rendered and identify where `onNodeClick` can be added.
- Confirm `@/components/ui/card` and `@/components/ui/badge` are installed (check `components/ui/` directory).
- **Output**: Clear picture of existing store shape, PathNode type, and PathMap component structure.
- **Time**: 2 min

---

## Phase 2: Foundational — Zustand Store Extensions (5 minutes)

### TASK-002: Create track color constants

- Create `lib/trackColors.ts` (or add to existing `lib/` utility file if one already covers colors).
- Define and export:
  - `TrackId` type: `'fast' | 'deep' | 'risk'`
  - `TRACK_COLORS: Record<TrackId, string>` — `{ fast: '#F59E0B', deep: '#3B82F6', risk: '#8B5CF6' }`
  - `TRACK_LABELS: Record<TrackId, string>` — `{ fast: 'Fast Track', deep: 'Deep Dive', risk: 'Risk Path' }`
  - `TRACK_TEXT_COLORS: Record<TrackId, string>` — `{ fast: '#000000', deep: '#ffffff', risk: '#ffffff' }`
- No function body — pure constant exports only.
- **Verification**: File can be imported without TypeScript errors.
- **Time**: 1 min

### TASK-003: Extend Zustand store with panel state

- Open `store/useLifePathStore.ts`.
- Add to the store interface:
  - `selectedNode: PathNode | null`
  - `selectedTrack: TrackId | null`
  - `isPanelOpen: boolean`
  - `setSelectedNode: (node: PathNode | null) => void`
  - `setSelectedTrack: (track: TrackId | null) => void`
  - `setIsPanelOpen: (open: boolean) => void`
- Add initial state values: `selectedNode: null`, `selectedTrack: null`, `isPanelOpen: false`.
- Add action implementations using `set`.
- Import `PathNode` from `@/types/path` and `TrackId` from `@/lib/trackColors`.
- **Verification**: TypeScript compiles without errors. `useLifePathStore` still exports correctly.
- **Time**: 4 min

---

## Phase 3: US1 — DetailPanel Component (10 minutes)

### TASK-004: Create DetailPanel component shell

- Create `components/DetailPanel.tsx` with `'use client'` directive.
- Define `DetailPanelProps` interface: `{ node: PathNode | null; isOpen: boolean; onClose: () => void }`.
- Create the outer container `<div>` with positioning and transition classes:
  - `fixed top-0 right-0 h-full w-[30%] z-50`
  - `transform transition-transform duration-300 ease-in-out`
  - `translate-x-0` when `isOpen`, `translate-x-full` when not `isOpen`
- Return early render (empty container) when `node` is null.
- **Verification**: Component renders and slides in/out based on `isOpen` prop. No TypeScript errors.
- **Time**: 3 min

### TASK-005: Implement DetailPanel content — core fields

- Import `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from `@/components/ui/card`.
- Import `Badge` from `@/components/ui/badge`.
- Import `TRACK_COLORS`, `TRACK_LABELS`, `TRACK_TEXT_COLORS` from `@/lib/trackColors`.
- Render inside the panel container:
  - `CardHeader` with `CardTitle` (node.label) and a close `<button>` with `aria-label="패널 닫기"` that calls `onClose`.
  - `CardDescription` with `node.description`.
  - Track `Badge` with inline `style={{ backgroundColor: TRACK_COLORS[node.track], color: TRACK_TEXT_COLORS[node.track] }}`.
  - Difficulty `Badge` (variant="secondary") — render only if `node.difficulty` is defined.
  - Duration text: derive from `node.monthsFromNow` — e.g., `"${node.monthsFromNow}개월 후"`.
- Each render section is a separate small function (≤10 lines each) to stay within the 20-line function limit.
- **Verification**: Panel shows correct content when opened with a step node. Difficulty badge absent when undefined.
- **Time**: 5 min

### TASK-006: Implement DetailPanel content — tips section

- Add conditional tips rendering inside `CardContent`:
  - Guard: `node.tips && node.tips.length > 0`
  - If truthy: render a `<section>` with a "💡 Tips" heading and a `<ul>` with `node.tips.map((tip) => <li key={tip}>{tip}</li>)`.
  - If falsy: render nothing (no empty section, no placeholder text).
- **Verification**: Tips appear for nodes with tips. Section is absent for nodes without tips.
- **Time**: 1 min

### TASK-007: Implement DetailPanel content — merge node special case

- Add a branch inside `CardContent` for `node.type === 'merge'`:
  - Access `message` and `connectedPaths` from the node data. These fields may be accessed via type assertion or a type guard if the base `PathNode` interface does not include them.
  - If `message` is present: render as a `<blockquote>` with italic styling and accent text color.
  - If `connectedPaths` is present: render `"${connectedPaths.length}개의 경로 합류"` as a small badge or text.
- Keep the merge-specific rendering in a separate ≤15-line helper function `renderMergeInfo`.
- **Verification**: Clicking a merge node shows the message and path count. Clicking a step node does not show the merge section.
- **Time**: 1 min

---

## Phase 4: US2 — TrackLegend + Highlight Logic (8 minutes)

### TASK-008: Create TrackLegend component

- Create `components/TrackLegend.tsx` with `'use client'` directive.
- Define `TrackLegendProps` interface: `{ selectedTrack: TrackId | null; onSelectTrack: (track: TrackId | null) => void }`.
- Import `TrackId`, `TRACK_COLORS`, `TRACK_LABELS` from `@/lib/trackColors`.
- Render a `<div>` positioned `absolute top-4 left-4` with a semi-transparent background card.
- For each `TrackId` in `['fast', 'deep', 'risk']`:
  - Render a `<button>` with:
    - A 12×12px colored circle (inline `style={{ backgroundColor: TRACK_COLORS[trackId] }}`)
    - The track label text
    - `aria-pressed={selectedTrack === trackId}`
    - Visual ring indicator when selected: `ring-2 ring-white ring-offset-1` via conditional className
    - Reduced opacity when another track is selected: `opacity-60` via conditional className
    - `onClick`: calls `onSelectTrack(trackId)`
- **Verification**: Three legend items render with correct colors. Click events fire correctly.
- **Time**: 5 min

### TASK-009: Add opacity logic to PathMap

- Open `components/PathMap/PathMap.tsx`.
- Import `useLifePathStore` and read `selectedTrack` from the store.
- Before the `return` statement (before `<ReactFlow>`), apply the opacity transformation to `nodes`:
  ```typescript
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
- Apply the same transformation to `edges` using `edge.data?.track`.
- Pass `visibleNodes` and `visibleEdges` to `<ReactFlow>`.
- **Verification**: Selecting a track in the legend changes node opacity. Merge nodes remain visible.
- **Time**: 3 min

### TASK-010: Wire TrackLegend into PathMap

- In `components/PathMap/PathMap.tsx`, import `TrackLegend` from `@/components/TrackLegend`.
- Read `selectedTrack` and `setSelectedTrack` from Zustand store.
- Add toggle handler:
  ```typescript
  const handleSelectTrack = (track: TrackId) => {
    setSelectedTrack(selectedTrack === track ? null : track)
  }
  ```
- Render `<TrackLegend selectedTrack={selectedTrack} onSelectTrack={handleSelectTrack} />` inside the PathMap container, as a sibling of `<ReactFlow>`, within the same `relative`-positioned parent div.
- **Verification**: TrackLegend appears overlaid on the map, top-left. Clicking items updates node opacity.
- **Time**: 2 min (included in TASK-009 budget if done together)

---

## Phase 5: US3 — Wire DetailPanel and onNodeClick (5 minutes)

### TASK-011: Add onNodeClick handler to PathMap

- In `components/PathMap/PathMap.tsx`, import `NodeMouseHandler` from `@xyflow/react`.
- Import `useLifePathStore` actions: `setSelectedNode`, `setIsPanelOpen`.
- Create the handler (≤10 lines):
  ```typescript
  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    const pathNode = node.data as PathNode
    if (pathNode.type === 'start' || pathNode.type === 'goal') return
    setSelectedNode(pathNode)
    setIsPanelOpen(true)
  }
  ```
- Pass `onNodeClick={handleNodeClick}` to `<ReactFlow>`.
- **Verification**: Clicking step/merge nodes sets store state. Clicking start/goal nodes does nothing.
- **Time**: 3 min

### TASK-012: Render DetailPanel in PathMap

- In `components/PathMap/PathMap.tsx`, import `DetailPanel` from `@/components/DetailPanel`.
- Read `selectedNode`, `isPanelOpen`, `setSelectedNode`, `setIsPanelOpen` from Zustand.
- Create the close handler:
  ```typescript
  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedNode(null)
  }
  ```
- Render `<DetailPanel node={selectedNode} isOpen={isPanelOpen} onClose={handlePanelClose} />` as a sibling of the ReactFlow container (outside `<ReactFlow>`, inside the page/layout).
- **Note**: `DetailPanel` uses `position: fixed` so it does not need to be positioned relative to the PathMap container. It can be rendered anywhere in the component tree.
- **Verification**: Node click opens panel. Close button dismisses panel with slide-out animation.
- **Time**: 2 min

---

## Phase 6: Polish (remaining time)

### TASK-013: Dark theme validation

- With the app running and dark theme active (FE-02), open the panel for each track type (fast, deep, risk).
- Verify track badge text is readable (gold badge: black text, blue/purple badge: white text).
- Verify panel background contrasts sufficiently with the badge and body text.
- Fix any contrast issues by adjusting `TRACK_TEXT_COLORS` or Tailwind utility classes.
- **Verification**: All badge text is legible in dark theme.
- **Time**: 2 min

### TASK-014: Function size and nesting depth audit

- Review each function in `DetailPanel.tsx`, `TrackLegend.tsx`, and the additions to `PathMap.tsx`.
- Ensure no function exceeds 20 lines (Constitution III).
- Ensure JSX nesting depth does not exceed 2 levels (Constitution IV).
- Extract any oversized functions into small helpers named with clear intent (e.g., `renderTips`, `renderMergeInfo`, `renderTrackBadge`).
- **Verification**: TypeScript compiler finds no errors. Manual line count confirms ≤20 lines per function.
- **Time**: 2 min

### TASK-015: TypeScript strict mode check

- Run `npx tsc --noEmit` (or `npm run type-check` if configured).
- Fix any `any` type usages, missing return types, or implicit `any` from untyped `node.data` access.
- Ensure `TRACK_COLORS` indexing uses `TrackId` type (no string index signatures).
- **Verification**: `tsc --noEmit` exits with code 0.
- **Time**: 1 min

---

## Task Summary

| Phase | Tasks | Est. Time |
|---|---|---|
| Phase 1: Setup | TASK-001 | 2 min |
| Phase 2: Foundational | TASK-002, TASK-003 | 5 min |
| Phase 3: US1 DetailPanel | TASK-004, TASK-005, TASK-006, TASK-007 | 10 min |
| Phase 4: US2 TrackLegend | TASK-008, TASK-009, TASK-010 | 8 min |
| Phase 5: US3 Wire Panel | TASK-011, TASK-012 | 5 min |
| Phase 6: Polish | TASK-013, TASK-014, TASK-015 | 5 min |
| **Total** | **15 tasks** | **35 min** |

**Note**: The estimate is 35 minutes against a 30-minute budget. TASK-013 (dark theme validation) and TASK-015 (TypeScript strict check) can be deferred to FE-07 (Bug Fix + UI Polish) if time is tight. The core functionality (TASK-001 through TASK-012) fits within 30 minutes.

---

## Acceptance Criteria Checklist

Before marking FE-04 complete, verify:

- [ ] Node click opens right-side detail panel
- [ ] Panel displays: step name, description, duration, difficulty badge (when present), track badge
- [ ] Panel displays tips list (when present); tips section absent when not present
- [ ] Merge node click displays message quote and connectedPaths count
- [ ] Panel close button dismisses panel with CSS slide-out transition
- [ ] Track legend renders with Fast Track, Deep Dive, Risk Path items and correct colors
- [ ] Clicking a track legend item highlights that track (others dimmed to 0.3)
- [ ] Clicking the active legend item deselects it (all nodes return to full opacity)
- [ ] Panel open/close transition completes in ≤300ms
- [ ] Dark theme: all badge text is readable
- [ ] No TypeScript `any` types in new or modified files
- [ ] All functions ≤20 lines, JSX nesting ≤2 levels
