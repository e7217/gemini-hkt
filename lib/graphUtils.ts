import dagre from '@dagrejs/dagre';
import type { PathMap } from '@/types/path';
import type { FlowData, FlowNode, FlowEdge, GraphTransformOptions } from '@/types/flow';

export const TRACK_COLORS: Record<string, any> = {
  fast: { border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.1)', stroke: '#F59E0B' },
  deep: { border: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.1)', stroke: '#3B82F6' },
  risk: { border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)', bg: 'rgba(139, 92, 246, 0.1)', stroke: '#8B5CF6' }
};

export const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  startNode: { width: 80, height: 80 },
  stepNode: { width: 200, height: 80 },
  goalNode: { width: 120, height: 120 },
  mergeNode: { width: 100, height: 100 }
};

export function getEdgeStyle(track: string) {
  const color = TRACK_COLORS[track]?.stroke || '#fff';
  return { stroke: color, strokeWidth: 3, filter: `drop-shadow(0 0 5px ${color})` };
}

export function pathMapToFlow(pathMap: PathMap, options?: GraphTransformOptions): FlowData {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  if (!pathMap) return { nodes, edges };

  // Add start and goal
  nodes.push({
    id: pathMap.startNode.id,
    type: 'startNode',
    data: { label: pathMap.startNode.title },
    position: { x: 0, y: 0 }
  });

  nodes.push({
    id: pathMap.goalNode.id,
    type: 'goalNode',
    data: { label: pathMap.goalNode.title },
    position: { x: 0, y: 0 }
  });

  const processedMergeIds = new Set<string>();

  pathMap.paths.forEach(track => {
    let prevId = pathMap.startNode.id;
    track.nodes.forEach((node, idx) => {
      // Avoid duplicate step nodes if they are merge points
      if (node.isMergePoint) {
        const mp = pathMap.mergePoints?.find(m => m.id === node.id);
        if (mp && !processedMergeIds.has(mp.id)) {
          processedMergeIds.add(mp.id);
          nodes.push({
            id: mp.id,
            type: 'mergeNode',
            data: { ...mp, type: 'merge', label: mp.title },
            position: { x: 0, y: 0 }
          });
        }
        edges.push({
          id: `e-${prevId}-${node.id}`,
          source: prevId,
          target: node.id,
          type: 'trackEdge',
          data: { track: track.id }
        });
        prevId = node.id;
      } else {
        const uniqueId = `${track.id}-${node.id}`;
        nodes.push({
          id: uniqueId,
          type: 'stepNode',
          data: { ...node, label: node.title, track: track.id, nodeId: node.id },
          position: { x: 0, y: 0 }
        });
        edges.push({
          id: `e-${prevId}-${uniqueId}`,
          source: prevId,
          target: uniqueId,
          type: 'trackEdge',
          data: { track: track.id }
        });
        prevId = uniqueId;
      }
    });

    edges.push({
      id: `e-${prevId}-${pathMap.goalNode.id}`,
      source: prevId,
      target: pathMap.goalNode.id,
      type: 'trackEdge',
      data: { track: track.id }
    });
  });

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: options?.direction || 'BT', nodesep: 80, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(n => {
    const dim = NODE_DIMENSIONS[n.type as string] || { width: 100, height: 100 };
    g.setNode(n.id, { width: dim.width, height: dim.height });
  });

  edges.forEach(e => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  nodes.forEach(n => {
    const nodeWithPos = g.node(n.id);
    const dim = NODE_DIMENSIONS[n.type as string] || { width: 100, height: 100 };
    n.position = {
      x: nodeWithPos.x - dim.width / 2,
      y: nodeWithPos.y - dim.height / 2
    };
  });

  return { nodes, edges };
}
