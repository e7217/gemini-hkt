# Function Contracts: lib/graphUtils.ts

**Module**: `lib/graphUtils.ts`
**Created**: 2026-02-28
**Dependencies**: `@dagrejs/dagre`, `types/path.ts`, `types/flow.ts`

This module is a **pure TypeScript utility**. It has NO React imports and NO `'use client'` directive. All functions are pure (no side effects, no global state mutation).

---

## Exported Constants

### NODE_DIMENSIONS

```typescript
export const NODE_DIMENSIONS: Record<NodeVariant, { width: number; height: number }>
```

The authoritative source of node size values used by both dagre layout computation and CSS styling. See `data-model.md` for values.

---

### TRACK_COLORS

```typescript
export const TRACK_COLORS: Record<TrackType, TrackColorSet>
```

The authoritative source of CSS color values per track. See `data-model.md` for values.

---

## Function: pathMapToFlow

```typescript
export function pathMapToFlow(
  pathMap: PathMap,
  options?: GraphTransformOptions
): FlowData
```

### Purpose

Transforms a `PathMap` domain object (from the simulate API) into a `FlowData` object containing React Flow `nodes` and `edges` with dagre-computed positions.

### Parameters

| Parameter | Type                     | Required | Description |
|-----------|--------------------------|----------|-------------|
| `pathMap` | `PathMap`                | Yes      | The path map from the simulate API |
| `options` | `GraphTransformOptions`  | No       | Overrides for dagre spacing and node dimensions |

### Return Value

```typescript
{
  nodes: FlowNode[],  // Positioned with dagre BT layout
  edges: FlowEdge[],  // With track data for color rendering
}
```

### Behavior

1. Calls `buildFlowNodes(pathMap)` to create unpositioned nodes.
2. Calls `buildFlowEdges(pathMap)` to create edges.
3. Calls `applyDagreLayout(nodes, edges, options)` to assign positions.
4. Returns the positioned `{ nodes, edges }`.

### Guarantees

- Never throws on a valid `PathMap` (Zod-validated input from the API).
- If `pathMap.paths` is empty, returns only `startNode` and `goalNode` with a single fallback edge connecting them.
- If `pathMap.mergePoints` is empty, connects the last node of each track directly to `goalNode`.
- Deduplicates nodes by `id` if the same ID appears in multiple paths.

### Example

```typescript
import { pathMapToFlow } from '@/lib/graphUtils'
import { mockPathMap } from '@/lib/mockData'

const { nodes, edges } = pathMapToFlow(mockPathMap)
// nodes.length === 1 (start) + 1 (goal) + N_step_nodes + N_merge_nodes
// edges: sequential within each track + merge connections
```

---

## Function: buildFlowNodes (internal helper)

```typescript
function buildFlowNodes(pathMap: PathMap): FlowNode[]
```

### Purpose

Creates the React Flow node objects from a PathMap WITHOUT assigning positions (positions are set by dagre in a subsequent step).

### Behavior

1. Creates a `StartFlowNode` from `pathMap.startNode`.
2. Creates a `GoalFlowNode` from `pathMap.goalNode`.
3. For each `pathMap.mergePoints[i]`, creates a `MergeFlowNode`.
4. For each `pathMap.paths[i].nodes[j]`, creates a `StepFlowNode` if not already in the node set (deduplication by `id`).
5. Returns the combined array. Node type is determined by `getNodeType`.

---

## Function: buildFlowEdges (internal helper)

```typescript
function buildFlowEdges(pathMap: PathMap): FlowEdge[]
```

### Purpose

Creates all React Flow edge objects from a PathMap.

### Behavior

1. **Sequential edges**: For each path, connect `nodes[i]` → `nodes[i+1]` for all consecutive pairs. Edge `data.track` = path's track type.
2. **Entry edge from start**: For each path, create an edge from `pathMap.startNode.id` → `path.nodes[0].id`.
3. **Merge point edges**: For each `mergePoint`, for each `connectedPath` in `mergePoint.connectedPaths`, find the last node of that track before the merge point and create an edge from that node → `mergePoint.id`.
4. **Exit edge to goal**: Create an edge from the merge point (or last track node if no merge) → `pathMap.goalNode.id`.
5. Edge IDs use the pattern `${source}->${target}` to ensure uniqueness.

### Edge Construction Note

For the merge-to-goal connection, use a special track value. Since the merge node represents convergence of all tracks, the exit edge to goal uses `data.track: 'fast'` as a default (gold color) unless a more specific design is required.

---

## Function: applyDagreLayout (internal helper)

```typescript
function applyDagreLayout(
  nodes: FlowNode[],
  edges: FlowEdge[],
  options?: GraphTransformOptions
): FlowNode[]
```

### Purpose

Applies dagre BT layout to compute `position.x` and `position.y` for every node. Returns a new array of nodes with positions set; does not mutate the input.

### Behavior

1. Creates a new `dagre.graphlib.Graph` instance.
2. Sets graph options: `rankdir: 'BT'`, `nodesep`, `ranksep`, `marginx`, `marginy` (merged with defaults from `options`).
3. Calls `dagreGraph.setNode(node.id, { width, height })` for each node. Width/height from `NODE_DIMENSIONS[node.type]`, overridable via `options.nodeWidths` / `options.nodeHeights`.
4. Calls `dagreGraph.setEdge(edge.source, edge.target)` for each edge.
5. Calls `dagre.layout(dagreGraph)`.
6. Maps each node to `{ ...node, position: { x: dagreNode.x - width/2, y: dagreNode.y - height/2 } }`.
7. Returns the new nodes array.

### Coordinate System

Dagre returns center-based coordinates; React Flow expects top-left corner. The conversion formula is: `rf_x = dagre_x - width/2`, `rf_y = dagre_y - height/2`.

---

## Function: getNodeType

```typescript
export function getNodeType(node: PathNode, pathMap: PathMap): NodeVariant
```

### Purpose

Determines the React Flow node variant for a given `PathNode` based on its role in the `PathMap`.

### Parameters

| Parameter | Type       | Description |
|-----------|------------|-------------|
| `node`    | `PathNode` | The node from the PathMap to classify |
| `pathMap` | `PathMap`  | The full PathMap for context lookup |

### Return Value

`'startNode' | 'stepNode' | 'goalNode' | 'mergeNode'`

### Classification Logic

| Condition | Result |
|-----------|--------|
| `node.id === pathMap.startNode.id` | `'startNode'` |
| `node.id === pathMap.goalNode.id`  | `'goalNode'`  |
| `pathMap.mergePoints.some(mp => mp.id === node.id)` | `'mergeNode'` |
| Otherwise | `'stepNode'` |

### Example

```typescript
getNodeType(pathMap.startNode, pathMap)   // → 'startNode'
getNodeType(pathMap.goalNode, pathMap)    // → 'goalNode'
getNodeType(pathMap.mergePoints[0], pathMap) // → 'mergeNode'
getNodeType(pathMap.paths[0].nodes[0], pathMap) // → 'stepNode'
```

---

## Function: getEdgeStyle

```typescript
export function getEdgeStyle(track: TrackType): EdgeStyle
```

### Purpose

Returns the CSS style object for a given track's edge, used by `TrackEdge` to apply inline styles to the SVG path.

### Return Type

```typescript
interface EdgeStyle {
  stroke: string          // CSS color value, e.g. '#FFD700'
  strokeWidth: number     // Pixel width of the line, e.g. 2
  filter?: string         // CSS filter for glow, e.g. 'drop-shadow(0 0 6px rgba(255,215,0,0.8))'
}
```

### Behavior

Maps `track` to `TRACK_COLORS[track].border` for `stroke`, uses `2` for `strokeWidth`, and computes a `drop-shadow` filter from `TRACK_COLORS[track].glow`.

### Example

```typescript
getEdgeStyle('fast')
// → { stroke: '#FFD700', strokeWidth: 2, filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.8))' }

getEdgeStyle('deep')
// → { stroke: '#4A9EFF', strokeWidth: 2, filter: 'drop-shadow(0 0 6px rgba(74,158,255,0.8))' }

getEdgeStyle('risk')
// → { stroke: '#A855F7', strokeWidth: 2, filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.8))' }
```

---

## Constitution Compliance

| Rule | Compliance |
|------|------------|
| TypeScript no-any | All parameters and return types are explicitly typed |
| Max 20 line functions | `pathMapToFlow` delegates to 3 helpers; each helper stays under 20 lines |
| Max 2 nesting depth | No nested loops within nested conditionals; helpers keep logic flat |
| YAGNI | No unused functions; no over-engineering for cases beyond the current PathMap schema |
| Fail-Safe | `pathMapToFlow` handles empty `paths` and `mergePoints` arrays without throwing |
