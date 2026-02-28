# Data Models: FE-03 React Flow 캔버스 + 커스텀 노드 구현

**Created**: 2026-02-28

## Overview

This document defines the TypeScript types used exclusively by the React Flow visualization layer. These types extend the `@xyflow/react` base types and wrap the existing `PathMap` domain types from `types/path.ts` (defined in BE-02).

All types in this document belong in `types/flow.ts` unless otherwise noted.

---

## 1. TrackType

Discriminated union for the three life path tracks. This type may already exist in `types/path.ts` — import from there if so.

```typescript
// types/flow.ts
export type TrackType = 'fast' | 'deep' | 'risk'
```

---

## 2. NodeVariant

The four custom node type identifiers used in React Flow's `nodeTypes` registration.

```typescript
export type NodeVariant = 'startNode' | 'stepNode' | 'goalNode' | 'mergeNode'
```

---

## 3. CustomNodeData Interfaces

Each custom node component receives a `data` prop typed by one of these interfaces. They must NOT use `any`.

### StartNodeData

```typescript
export interface StartNodeData {
  label: string         // Display name, e.g. "시작"
  id: string            // PathNode.id from the original PathMap
}
```

### StepNodeData

```typescript
export interface StepNodeData {
  label: string              // Step name, e.g. "JavaScript 기초 학습"
  description: string        // Tooltip or panel detail text
  track: TrackType           // Determines border/glow color
  monthsFromNow: number      // Used by timeline slider for filtering
  difficulty?: number        // Optional 1-5 difficulty rating
  emoji?: string             // Optional emoji prefix (from BE-02 idea bank)
}
```

### GoalNodeData

```typescript
export interface GoalNodeData {
  label: string         // Goal name, e.g. "풀스택 개발자"
  description: string   // Final achievement description
}
```

### MergeNodeData

```typescript
export interface MergeNodeData {
  label: string               // Short label, e.g. "합류점"
  message: string             // Inspirational message, e.g. "어떤 길이든 괜찮다"
  connectedPaths: string[]    // Track IDs that converge here, e.g. ['fast', 'deep', 'risk']
  monthsFromNow: number       // Timeline position
}
```

---

## 4. FlowNode

Extends `@xyflow/react`'s `Node` type. Uses a discriminated union so the `data` field is correctly typed for each node variant.

```typescript
import type { Node } from '@xyflow/react'

export type StartFlowNode = Node<StartNodeData, 'startNode'>
export type StepFlowNode  = Node<StepNodeData,  'stepNode'>
export type GoalFlowNode  = Node<GoalNodeData,  'goalNode'>
export type MergeFlowNode = Node<MergeNodeData, 'mergeNode'>

export type FlowNode =
  | StartFlowNode
  | StepFlowNode
  | GoalFlowNode
  | MergeFlowNode
```

Usage in `pathMapToFlow`:
```typescript
const startNode: StartFlowNode = {
  id: pathMap.startNode.id,
  type: 'startNode',
  position: { x: 0, y: 0 },   // Overwritten by dagre layout
  data: {
    label: pathMap.startNode.label,
    id: pathMap.startNode.id,
  },
}
```

---

## 5. FlowEdgeData

Data payload attached to each edge, enabling the `TrackEdge` component to determine its color.

```typescript
export interface FlowEdgeData {
  track: TrackType        // Source track — determines edge stroke color
  label?: string          // Optional edge label (not used in MVP)
}
```

---

## 6. FlowEdge

Extends `@xyflow/react`'s `Edge` type with the `FlowEdgeData` payload.

```typescript
import type { Edge } from '@xyflow/react'

export type FlowEdge = Edge<FlowEdgeData>
```

Example instantiation:
```typescript
const edge: FlowEdge = {
  id: `${sourceId}->${targetId}`,
  source: sourceId,
  target: targetId,
  type: 'trackEdge',
  data: { track: 'fast' },
}
```

---

## 7. FlowData

The output type of `pathMapToFlow`. Passed directly to React Flow's `nodes` and `edges` props.

```typescript
export interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}
```

---

## 8. GraphTransformOptions

Optional configuration for the dagre layout step in `pathMapToFlow`. Allows callers to override default spacing without modifying `graphUtils.ts`.

```typescript
export interface GraphTransformOptions {
  nodeWidths?:  Partial<Record<NodeVariant, number>>
  nodeHeights?: Partial<Record<NodeVariant, number>>
  nodesep?:     number   // Horizontal spacing between sibling nodes (default: 80)
  ranksep?:     number   // Vertical spacing between ranks (default: 120)
  marginx?:     number   // Horizontal canvas margin (default: 40)
  marginy?:     number   // Vertical canvas margin (default: 40)
}
```

---

## 9. NodeDimensions (Constant — lib/graphUtils.ts)

Defined as a constant in `lib/graphUtils.ts`. Referenced by both the dagre layout step and any component that needs to know node sizes. This is the SINGLE SOURCE OF TRUTH for node dimensions.

```typescript
// lib/graphUtils.ts
export const NODE_DIMENSIONS: Record<NodeVariant, { width: number; height: number }> = {
  startNode: { width: 80,  height: 80  },
  stepNode:  { width: 200, height: 80  },
  goalNode:  { width: 100, height: 100 },
  mergeNode: { width: 100, height: 100 },
}
```

---

## 10. TrackColors (Constant — lib/graphUtils.ts or lib/colors.ts)

The single source of truth for CSS color values per track. Used by `StepNode`, `TrackEdge`, the legend component, and any other consumer. Importing from a shared location prevents color drift.

```typescript
export interface TrackColorSet {
  border: string          // Node border and edge stroke color
  glow:   string          // CSS box-shadow / drop-shadow RGBA value
  text:   string          // Text color (same as border in most cases)
  bg:     string          // Optional light background tint
}

export const TRACK_COLORS: Record<TrackType, TrackColorSet> = {
  fast: {
    border: '#FFD700',
    glow:   'rgba(255, 215,   0, 0.6)',
    text:   '#FFD700',
    bg:     'rgba(255, 215,   0, 0.08)',
  },
  deep: {
    border: '#4A9EFF',
    glow:   'rgba( 74, 158, 255, 0.6)',
    text:   '#4A9EFF',
    bg:     'rgba( 74, 158, 255, 0.08)',
  },
  risk: {
    border: '#A855F7',
    glow:   'rgba(168,  85, 247, 0.6)',
    text:   '#A855F7',
    bg:     'rgba(168,  85, 247, 0.08)',
  },
}
```

---

## 11. Relationship to Existing PathMap Types

These types layer on top of (do not replace) the `PathMap`, `PathNode`, and `MergePoint` types from `types/path.ts`:

```
PathMap (types/path.ts)
  ├── startNode: PathNode         → StartFlowNode (data.id, data.label)
  ├── goalNode:  PathNode         → GoalFlowNode  (data.label, data.description)
  ├── paths[]:   PathInfo
  │     └── nodes[]: PathNode     → StepFlowNode  (data.label, data.track, ...)
  └── mergePoints[]: MergePoint   → MergeFlowNode (data.label, data.message, ...)
```

`pathMapToFlow` performs the mapping between these two type hierarchies. No other component should access `PathMap` directly — all React Flow components consume only `FlowNode` / `FlowEdge` data shapes.
