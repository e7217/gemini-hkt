# Feature Specification: FE-03 React Flow 캔버스 + 커스텀 노드 구현

**Feature Branch**: `005-react-flow-map`
**Created**: 2026-02-28
**Status**: Draft
**Issue**: [FE-03] React Flow 캔버스 + 커스텀 노드 구현

## User Scenarios & Testing *(mandatory)*

### User Story 1 - React Flow Canvas Renders PathMap with Correct BT Layout (Priority: P1)

A user who has completed goal input and received a PathMap from the simulate API sees a React Flow canvas that renders all paths in a bottom-to-top vertical tree layout. The start node appears at the bottom, the goal node at the top, and all three tracks (Fast/Deep/Risk) branch upward with dagre-computed positions that prevent node overlap.

**Why this priority**: This is the visual centerpiece of the LifePath hackathon demo. Without a correctly rendered, non-overlapping BT-layout canvas, the entire product's visual impact is lost. All other features (detail panel, timeline slider) are meaningless if the map does not render.

**Independent Test**: Provide a mock PathMap object directly to the `PathMapCanvas` component (bypassing the API). Verify the React Flow canvas renders with all nodes visible, no node overlaps, start node positioned at the bottom, and goal node at the top. Test zoom, pan, and fitView interactions manually.

**Acceptance Scenarios**:

1. **Given** a valid `PathMap` with 3 paths (fast/deep/risk) and at least 1 merge point is passed to `PathMapCanvas`, **When** the component mounts, **Then** the React Flow canvas renders with all nodes positioned using dagre BT layout, start node at the bottom, goal node at the top.
2. **Given** the canvas is rendered, **When** the user scrolls or pinches, **Then** zoom behavior works (min zoom: 0.3, max zoom: 2.0).
3. **Given** the canvas is rendered, **When** the user drags the canvas, **Then** pan behavior works within configured bounds.
4. **Given** the canvas is rendered, **When** `fitView` is triggered on mount, **Then** all nodes fit within the viewport with appropriate padding.
5. **Given** the component is imported in a Next.js page, **When** the page is server-side rendered, **Then** no hydration errors occur because the component is loaded via `dynamic(() => import(...), { ssr: false })`.
6. **Given** a PathMap where all 3 paths converge at a single merge point, **When** the canvas renders, **Then** the merge node appears at a rank shared by all three tracks and edges from all tracks connect to it without crossing in a visually confusing way.

---

### User Story 2 - Four Custom Node Types Display Correctly with Colors and Animations (Priority: P2)

A user viewing the canvas sees four visually distinct node types: a pulsing circular start node, rounded-rectangle step nodes color-coded by track (gold/blue/purple), a star-shaped goal node with strong glow, and a large circular merge point node with multi-color gradient.

**Why this priority**: Visual differentiation is the primary UX mechanism that communicates path hierarchy and track identity. Without correct node styling, the canvas is functionally rendered but visually fails the demo's "wow factor" requirement.

**Independent Test**: Render each of the four custom node components in isolation (Storybook or a standalone test page) with representative props. Visually verify: StartNode has a pulsing ring animation, StepNode shows gold/blue/purple glow by track, GoalNode has a star/polygon shape with intense glow, MergeNode shows a multi-color gradient with a ◆ icon.

**Acceptance Scenarios**:

1. **Given** a `StartNode` component is rendered, **When** the component mounts, **Then** a CSS `@keyframes pulse` animation runs continuously on a circular ring around the node, creating an outward-expanding ring effect.
2. **Given** a `StepNode` with `track: "fast"` is rendered, **When** the component displays, **Then** the node border and `box-shadow` glow are gold (`#FFD700`-family).
3. **Given** a `StepNode` with `track: "deep"` is rendered, **When** the component displays, **Then** the node border and glow are blue (`#4A9EFF`-family).
4. **Given** a `StepNode` with `track: "risk"` is rendered, **When** the component displays, **Then** the node border and glow are purple (`#A855F7`-family).
5. **Given** a `GoalNode` component is rendered, **When** the component displays, **Then** the node shape uses a CSS `clip-path` polygon (star shape) and has a high-intensity multi-color `box-shadow` glow.
6. **Given** a `MergeNode` component is rendered, **When** the component displays, **Then** the node displays a circular shape with a conic or linear gradient background incorporating all three track colors, and a ◆ diamond icon is visible inside.

---

### User Story 3 - PathMap to Nodes/Edges Transform Works Correctly (Priority: P3)

A developer calls `pathMapToFlow(pathMap)` and receives correctly typed React Flow `nodes` and `edges` arrays. Node types are auto-determined from the PathMap data. Sequential edges connect nodes within each track. Merge point edges connect track nodes to the shared merge node.

**Why this priority**: The data transform is the glue layer between the backend API output and the React Flow rendering layer. Bugs here cascade into wrong node types being displayed, missing connections, or overlapping positions.

**Independent Test**: Import `pathMapToFlow` from `lib/graphUtils.ts` and call it with the canonical mock PathMap fixture. Assert: `startNode` maps to type `'startNode'`, `goalNode` maps to `'goalNode'`, merge point IDs map to `'mergeNode'`, all others map to `'stepNode'`. Assert edge count equals (total sequential connections within tracks) + (connections from track nodes into merge points).

**Acceptance Scenarios**:

1. **Given** a PathMap with `startNode` having type `'start'`, **When** `pathMapToFlow` is called, **Then** the returned nodes array contains a node with `type: 'startNode'` and `id` matching `startNode.id`.
2. **Given** a PathMap with `goalNode` having type `'goal'`, **When** `pathMapToFlow` is called, **Then** the returned nodes array contains a node with `type: 'goalNode'` and `id` matching `goalNode.id`.
3. **Given** a PathMap with `mergePoints` array containing items, **When** `pathMapToFlow` is called, **Then** each merge point ID maps to a node with `type: 'mergeNode'`.
4. **Given** a PathMap where `paths[0].nodes` has 4 sequential step nodes, **When** `pathMapToFlow` is called, **Then** the edges array contains 3 sequential edges connecting node[0]→node[1]→node[2]→node[3] for that track.
5. **Given** a merge point with `connectedPaths: ['fast', 'deep', 'risk']`, **When** `pathMapToFlow` is called, **Then** edges exist from the last node of each connected path to the merge node.
6. **Given** an edge connecting a Fast Track node to another Fast Track node, **When** `pathMapToFlow` returns it, **Then** that edge has `data.track: 'fast'` so the custom edge renderer can apply gold color.

---

### User Story 4 - Custom Edges Show Track Colors (Priority: P4)

A user viewing the canvas sees the connecting lines between nodes rendered in the color of their respective track (gold for Fast, blue for Deep, purple for Risk). Edges use smoothstep or bezier curve style for a polished look, not straight lines.

**Why this priority**: Edge color reinforces the track identity established by node color. Without colored edges, the three tracks visually blur together and the separate-paths concept becomes unclear.

**Independent Test**: Render the full canvas with a mock PathMap. Inspect the SVG path elements in the DOM and verify their `stroke` attribute matches the track color for each edge. Confirm no edges are rendered as straight `polyline` elements (must use curve).

**Acceptance Scenarios**:

1. **Given** an edge with `data.track: 'fast'` is rendered by `TrackEdge`, **When** the SVG renders, **Then** the path `stroke` color is the gold track color (`#FFD700` or equivalent).
2. **Given** an edge with `data.track: 'deep'` is rendered, **When** the SVG renders, **Then** the path `stroke` is the blue track color.
3. **Given** an edge with `data.track: 'risk'` is rendered, **When** the SVG renders, **Then** the path `stroke` is the purple track color.
4. **Given** any edge rendered by `TrackEdge`, **When** inspected, **Then** it uses `EdgeType.SmoothStep` or `EdgeType.Bezier` curve type, not straight lines.
5. **Given** an edge connecting to a merge node (multi-track context), **When** rendered, **Then** the edge inherits the source track's color.

---

### Edge Cases

- **Empty PathMap**: If `pathMapToFlow` receives a PathMap where `paths` is empty, it returns `{ nodes: [startNode, goalNode], edges: [] }` without crashing. A single edge from start to goal is created as fallback.
- **No merge points**: If `mergePoints` is an empty array, no merge nodes are created. Tracks connect directly to the goal node. The function handles this without errors.
- **Single track**: If only one path is present in `paths` (e.g., only "fast"), the transform produces a linear chain from start to goal without branch edges.
- **Duplicate node IDs**: If the PathMap contains duplicate node IDs across paths (data bug), the transform deduplicates by ID; the last occurrence wins. This prevents React Flow's "duplicate node key" console error.
- **Zero-node track**: If a path has an empty `nodes` array, no sequential edges are created for that track, and no crash occurs.
- **Very long node labels**: Node components must truncate labels exceeding ~30 characters with CSS `text-overflow: ellipsis` to prevent layout overflow in the fixed-dimension node containers.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a React Flow canvas in `components/PathMap/PathMapCanvas.tsx` using `@xyflow/react` v12 with zoom, pan, and `fitView` on mount.
- **FR-002**: System MUST use `'use client'` directive in all React Flow component files and wrap the canvas container with `dynamic(() => import(...), { ssr: false })` in the parent page/component.
- **FR-003**: System MUST apply dagre `rankdir: 'BT'` layout via `@dagrejs/dagre` to position nodes before passing them to React Flow, using per-node-type width/height values to prevent overlap.
- **FR-004**: System MUST implement `StartNode` in `components/nodes/StartNode.tsx` as a circular node with a continuous CSS `@keyframes pulse` ring animation.
- **FR-005**: System MUST implement `StepNode` in `components/nodes/StepNode.tsx` as a rounded-rectangle node with border color and `box-shadow` glow determined by the `track` prop (gold=fast, blue=deep, purple=risk).
- **FR-006**: System MUST implement `GoalNode` in `components/nodes/GoalNode.tsx` as a star/polygon-shaped node using CSS `clip-path` with a high-intensity multi-color glow effect.
- **FR-007**: System MUST implement `MergeNode` in `components/nodes/MergeNode.tsx` as a large circular node with a multi-color gradient background (incorporating all three track colors) and a ◆ icon.
- **FR-008**: System MUST implement `TrackEdge` in `components/PathMap/TrackEdge.tsx` as a custom edge that renders an SVG path with stroke color derived from `data.track`, using smoothstep or bezier curve type.
- **FR-009**: System MUST implement `pathMapToFlow(pathMap: PathMap): FlowData` in `lib/graphUtils.ts` that transforms PathMap to React Flow nodes and edges, auto-determining node types and creating correct sequential and merge-point edges.
- **FR-010**: System MUST register all custom node types and the custom edge type in the `nodeTypes` and `edgeTypes` objects passed to the `ReactFlow` component, following `@xyflow/react` v12 registration patterns.

### Key Entities *(include if feature involves data)*

- **FlowNode**: Extends `@xyflow/react` `Node<TData>` type. `type` is one of `'startNode' | 'stepNode' | 'goalNode' | 'mergeNode'`. `data` is the corresponding `CustomNodeData` interface. `position` is set by dagre after layout computation.
- **FlowEdge**: Extends `@xyflow/react` `Edge<TData>` type. `type` is `'trackEdge'`. `data.track` is `TrackType` for color selection. `data.label` is optional display text.
- **StartNodeData**: `{ label: string; id: string }` — minimal data for the start node.
- **StepNodeData**: `{ label: string; description: string; track: TrackType; monthsFromNow: number; difficulty?: number }` — data for step nodes.
- **GoalNodeData**: `{ label: string; description: string }` — data for the goal node.
- **MergeNodeData**: `{ label: string; message: string; connectedPaths: string[] }` — data for merge nodes, includes the inspirational message.
- **FlowData**: `{ nodes: FlowNode[]; edges: FlowEdge[] }` — the output type of `pathMapToFlow`.
- **GraphTransformOptions**: `{ nodeWidths: Record<NodeVariant, number>; nodeHeights: Record<NodeVariant, number>; nodesep: number; ranksep: number }` — optional configuration for dagre layout tuning.
- **TrackType**: `'fast' | 'deep' | 'risk'` — union type used for color mapping.
- **TrackColors**: `Record<TrackType, { border: string; glow: string; text: string }>` — constant map of CSS color values per track, defined in `lib/graphUtils.ts` or `lib/colors.ts`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The React Flow canvas renders a PathMap with 3 tracks and 1 merge point in under 200ms on a standard development machine without any console errors or hydration warnings.
- **SC-002**: All four custom node types (`StartNode`, `StepNode`, `GoalNode`, `MergeNode`) render with visually distinct styles; no node type falls back to the default React Flow node appearance.
- **SC-003**: `pathMapToFlow` called with the canonical mock PathMap produces the exact expected node count (startNode + goalNode + all track step nodes + all merge nodes) and edge count (sum of sequential edges per track + merge-point connections).
- **SC-004**: The dagre BT layout positions the start node with the lowest Y coordinate and the goal node with the highest Y coordinate (remember: React Flow Y axis is inverted from screen space — dagre BT maps to lower Y = higher on screen); no two nodes share overlapping bounding boxes.
- **SC-005**: The `PathMapCanvas` component (and all sub-components) contain no function longer than 20 lines and no nesting deeper than 2 levels, per Constitution III and IV.
- **SC-006**: SSR builds (e.g., `next build`) complete without errors related to `window`, `document`, or `ResizeObserver` — confirming proper dynamic import with `ssr: false` isolation.
- **SC-007**: Custom edges render with the correct track color stroke; inspecting the rendered SVG in the browser DevTools shows `stroke` values matching the defined `TrackColors` constants.
