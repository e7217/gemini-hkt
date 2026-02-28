# Feature Specification: FE-04 노드 클릭 상세 패널 + 트랙 하이라이트

**Feature Branch**: `006-detail-panel`
**Created**: 2026-02-28
**Status**: Draft
**Issue**: [FE-04] 노드 클릭 상세 패널 + 트랙 하이라이트
**Depends On**: FE-03 (React Flow 캔버스 + 커스텀 노드)
**Phase**: Phase 2 (핵심 구현, 3:00~3:30)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Node Click Opens Detail Panel with Full Info (Priority: P1)

A user viewing the life path map clicks on any step node. A right-side panel slides in showing the node's full information: step name, description, expected duration, difficulty level, current track badge, and tips list. Clicking the close button or clicking outside dismisses the panel.

**Why this priority**: This is the primary interactive feature of the path map. Without it, nodes are static visuals with no way to access the detailed information that makes LifePath useful. The demo's ACT 2 ("노드 클릭 → 구체적 정보 확인") depends entirely on this working.

**Independent Test**: Click any non-start, non-goal node on the rendered PathMap. Verify the right panel appears with title, description, monthsFromNow-based duration text, difficulty badge, track badge in correct track color, and at least one tip item. Click the X button; verify panel closes.

**Acceptance Scenarios**:

1. **Given** a PathMap is rendered with step nodes, **When** a user clicks a step node, **Then** a right panel opens at 30% width showing the node's `label`, `description`, `track` badge (with correct color), `difficulty` badge, duration derived from `monthsFromNow`, and `tips` list.
2. **Given** the detail panel is open, **When** the user clicks the X close button, **Then** the panel closes with a slide-out transition and `isPanelOpen` is set to `false`.
3. **Given** the detail panel is open, **When** the user clicks a different node, **Then** the panel updates in place with the new node's information without closing and reopening.
4. **Given** a node with no `tips` field, **When** the node is clicked, **Then** the panel shows all other fields and omits the tips section entirely (no empty list rendered).
5. **Given** a `merge` type node is clicked, **When** the panel renders, **Then** it additionally shows the `connectedPaths` count and the `message` field displayed as a styled quote (italic, accent color).
6. **Given** the `start` or `goal` type node is clicked, **When** the click event fires, **Then** no panel opens (start and goal nodes are informational only).

---

### User Story 2 - Track Legend Enables Track Highlight and Dim (Priority: P2)

A user sees a track legend with three entries: Fast Track (gold), Deep Dive (blue), Risk Path (purple). Clicking a track entry highlights all nodes and edges belonging to that track at full opacity while dimming all other-track nodes and edges to opacity 0.3. Clicking the same track again deselects it, restoring all nodes and edges to full opacity.

**Why this priority**: The dim/highlight effect is the single most impactful visual interaction in the demo — it transforms the map from "three overlapping trees" into a focused single-path view. The demo script's ACT 2 references this as a key showcase moment.

**Independent Test**: Render the PathMap with all three tracks visible. Click "Fast Track" in the legend. Verify that Fast Track nodes have full opacity and non-Fast-Track nodes have opacity 0.3 in their React Flow style. Click "Fast Track" again. Verify all nodes return to full opacity.

**Acceptance Scenarios**:

1. **Given** no track is selected, **When** the user clicks "Fast Track" in the legend, **Then** `selectedTrack` is set to `'fast'`, Fast Track nodes/edges render with opacity 1, and all other nodes/edges render with opacity 0.3.
2. **Given** "Fast Track" is selected, **When** the user clicks "Deep Dive" in the legend, **Then** `selectedTrack` switches to `'deep'`, Deep Dive nodes/edges are at full opacity, and all others (including Fast Track) are dimmed.
3. **Given** a track is selected, **When** the user clicks the same track legend item again, **Then** `selectedTrack` is set to `null` and all nodes/edges return to full opacity (no dimming).
4. **Given** a track is selected, **When** the detail panel is open for a node on a dimmed track, **Then** the panel content still displays correctly — dim state affects map visuals only, not panel content.
5. **Given** no track is selected, **When** the PathMap renders, **Then** all nodes and edges display at full opacity (default state).

---

### User Story 3 - Panel Open/Close Transitions (Priority: P3)

The detail panel opens and closes with smooth CSS transitions (slide-in from right). The map canvas area either shrinks to accommodate the panel or the panel overlays the canvas. The transition must complete in under 300ms and must not cause React Flow canvas re-layout jank.

**Why this priority**: Visual polish differentiates a demo-quality product. A jarring panel appearance reduces perceived quality. However, this is lower priority than functional correctness — if time runs short, a hard-cut open/close is acceptable.

**Independent Test**: Click a node. Measure time from click to panel fully visible (target: ≤300ms). Click close. Measure time to panel fully hidden (target: ≤300ms). Verify no React Flow canvas viewport jump occurs during either transition.

**Acceptance Scenarios**:

1. **Given** the panel is closed, **When** a node is clicked, **Then** the panel slides in from the right with a CSS `translateX` or `width` transition completing in ≤300ms.
2. **Given** the panel is open, **When** closed, **Then** the panel slides out to the right and is no longer visible after the transition.
3. **Given** the panel transitions open, **When** the transition is in progress, **Then** React Flow canvas does not viewport-jump or re-fit (transitions are CSS-only, no React Flow viewport API calls during panel animation).
4. **Given** the panel is open in overlay mode, **When** the panel is visible, **Then** the React Flow canvas remains fully interactive (pan, zoom, node clicks still work through non-panel areas).

---

## Edge Cases

- **Merge point node click**: The `merge` node type does not carry a `track` property in the same way (it belongs to all connecting paths). The panel must display `connectedPaths` info and the `message` field. The track badge should show "합류점" or list connected track colors.
- **Node with no tips**: When `tips` is undefined or empty array, the tips section is completely omitted from the panel. No empty `<ul>` or "No tips" placeholder renders.
- **Node with no difficulty**: When `difficulty` is undefined, the difficulty badge is omitted. The panel renders only the fields that have data.
- **Panel on small desktop (1280px)**: At minimum supported width (L-1: 1280px+), the 30% panel must not overlap critical map controls. If space is insufficient, overlay mode is preferred over map-shrink mode.
- **Rapid node clicks**: If the user clicks multiple nodes in quick succession, the panel should update synchronously — each click updates `selectedNode` in Zustand, React re-renders with latest data. No race condition possible (synchronous state updates).
- **Clicking the map background**: Clicking an empty area of the React Flow canvas (not a node) does NOT close the panel. The close button is the only dismiss mechanism (overlay mode panning conflict prevention).
- **Track legend with panel open**: Opening/switching tracks while the detail panel is open is fully supported. Both `selectedTrack` and `selectedNode` are independent Zustand fields.
- **Dark theme readability**: All panel text, badges, and backgrounds must meet minimum contrast ratios in the dark theme (K-1 requirement). Track colors (#F59E0B, #3B82F6, #8B5CF6) are pre-validated for dark-background contrast.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST handle `onNodeClick` from `@xyflow/react` and set `selectedNode` in the Zustand store to the clicked `PathNode` data, and set `isPanelOpen` to `true`.
- **FR-002**: The `DetailPanel` component MUST display `label`, `description`, track badge (with track color), `difficulty` badge (when present), duration text derived from `monthsFromNow`, and `tips` list (when present).
- **FR-003**: For `merge` type nodes, `DetailPanel` MUST additionally display the `message` field as a styled quote and show the number of `connectedPaths`.
- **FR-004**: The `DetailPanel` MUST include a close button that sets `isPanelOpen` to `false` and clears `selectedNode` to `null`.
- **FR-005**: The `TrackLegend` component MUST display three items — Fast Track (#F59E0B), Deep Dive (#3B82F6), Risk Path (#8B5CF6) — and on click, set `selectedTrack` in the Zustand store.
- **FR-006**: When `selectedTrack` is non-null, the PathMap MUST apply `style: { opacity: 1 }` to matching-track nodes/edges and `style: { opacity: 0.3 }` to all other nodes/edges.
- **FR-007**: Clicking an already-selected track in `TrackLegend` MUST set `selectedTrack` to `null`, removing all opacity modifications.
- **FR-008**: The `DetailPanel` MUST open/close with a CSS transition (slide from right) completing in ≤300ms without triggering React Flow viewport recalculation.

### Key Entities *(include if feature involves data)*

- **DetailPanel**: A React client component rendering in a fixed right-side panel container. Accepts `node: PathNode | null` and `isOpen: boolean` props (or reads from Zustand store). Uses shadcn/ui `Card` as container and `Badge` for track/difficulty labels. File: `components/DetailPanel.tsx`.
- **TrackLegend**: A React client component rendering three clickable track indicator items with colored dots/swatches. Reads/writes `selectedTrack` from Zustand. File: `components/TrackLegend.tsx`.
- **LifePathStore (extensions)**: The existing Zustand store gains three new fields: `selectedNode: PathNode | null`, `selectedTrack: 'fast' | 'deep' | 'risk' | null`, `isPanelOpen: boolean`, plus actions `setSelectedNode`, `setSelectedTrack`, `setIsPanelOpen`.
- **PathNode**: Existing type from `types/path.ts`. Fields relevant to this feature: `id`, `type` (`'start'|'step'|'merge'|'goal'`), `label`, `description`, `monthsFromNow`, `track`, `difficulty?`, `tips?`.
- **Track color map**: A constant object mapping track keys to hex colors — `fast: '#F59E0B'`, `deep: '#3B82F6'`, `risk: '#8B5CF6'`. Used by both `DetailPanel` (badge color) and `TrackLegend` (swatch color) and the node opacity logic.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clicking any `step` or `merge` type node opens the detail panel and displays all required fields within one render cycle (no async delay).
- **SC-002**: The detail panel close button dismisses the panel in ≤300ms via CSS transition.
- **SC-003**: Clicking a track in `TrackLegend` changes the opacity of non-selected track nodes to 0.3 and selected track nodes to 1.0, verified by inspecting the `style` prop on React Flow node elements.
- **SC-004**: Clicking the active track in `TrackLegend` a second time restores all nodes to opacity 1.0 (deselect behavior).
- **SC-005**: No function in `DetailPanel.tsx` or `TrackLegend.tsx` exceeds 20 lines (Constitution III).
- **SC-006**: No JSX nesting exceeds 2 levels in any component (Constitution IV).
- **SC-007**: All TypeScript is strict-mode compliant with no `any` types (Constitution II).
- **SC-008**: Panel text remains readable (sufficient contrast) in dark theme for all track badge colors.
