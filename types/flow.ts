import type { Edge, Node } from '@xyflow/react';
import type { PathNode, StartGoalNode, MergePoint } from '@/types/path';

export type NodeVariant = 'startNode' | 'stepNode' | 'goalNode' | 'mergeNode';

export interface StartNodeData {
  label: string;
}

export interface StepNodeData {
  label: string;
  track: string;
  nodeId: string;
  timeEstimate?: string;
  opportunityCost?: string;
}

export interface GoalNodeData {
  label: string;
}

export interface MergeNodeData {
  label: string;
  message: string;
}

export type FlowNode = Node;
export type FlowEdge = Edge;
export type FlowEdgeData = { track: string };

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface GraphTransformOptions {
  direction?: 'BT' | 'LR';
}

export interface TrackColorSet {
  border: string;
  glow: string;
  bg: string;
  stroke: string;
}
