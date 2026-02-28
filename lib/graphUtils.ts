import dagre from '@dagrejs/dagre';
import type { PathMap, PathNode } from '@/types/path';
import type { FlowData, FlowNode, FlowEdge, GraphTransformOptions } from '@/types/flow';
import { TRACK_COLORS, TrackId } from '@/lib/trackColors';

export const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  startNode: { width: 80, height: 80 },
  stepNode: { width: 200, height: 80 },
  subStepNode: { width: 160, height: 64 }, // BUG-01: smaller dimensions for subnodes
  goalNode: { width: 120, height: 120 },
  mergeNode: { width: 100, height: 100 }
};

/**
 * BUG-03 FIX: getEdgeStyle now accepts successProbability to vary strokeWidth.
 * Probability 0-100 maps to strokeWidth 2-6.
 * Falls back to 3 when no probability is given (backward compatible).
 */
export function getEdgeStyle(track: string, successProbability?: number) {
  const color = TRACK_COLORS[track as TrackId] || '#fff';
  const strokeWidth = successProbability != null
    ? Math.max(2, Math.min(6, Math.round(2 + (successProbability / 100) * 4)))
    : 3;
  return { stroke: color, strokeWidth, filter: `drop-shadow(0 0 ${strokeWidth + 2}px ${color})` };
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

  const addNodesAndEdges = (node: PathNode, trackId: string, prevId: string, successProbability?: number) => {
    const mp = node.isMergePoint ? pathMap.mergePoints?.find(m => m.id === node.id) : undefined;
    let currentId = '';

    if (mp) {
      currentId = mp.id;
      if (!processedMergeIds.has(mp.id)) {
        processedMergeIds.add(mp.id);
        nodes.push({
          id: mp.id,
          type: 'mergeNode',
          data: { ...mp, type: 'merge', label: mp.title },
          position: { x: 0, y: 0 }
        });
      }
    } else {
      currentId = `${trackId}-${node.id}`;
      nodes.push({
        id: currentId,
        type: 'stepNode',
        data: { ...node, label: node.title, track: trackId, nodeId: node.id },
        position: { x: 0, y: 0 }
      });
    }

    edges.push({
      id: `e-${prevId}-${currentId}`,
      source: prevId,
      target: currentId,
      type: 'trackEdge',
      // BUG-03 FIX: pass successProbability into edge data
      data: { track: trackId, successProbability }
    });

    // BUG-01 FIX: Handle subNodes (Expansion C9)
    // Use 'subStepNode' type for smaller visual + proper dagre dimensions
    if (node.subNodes && node.subNodes.length > 0) {
      node.subNodes.forEach((sub: PathNode, subIdx: number) => {
        const subId = `sub-${currentId}-${sub.id || subIdx}`;
        nodes.push({
          id: subId,
          type: 'subStepNode', // distinct type for dagre sizing + StepNode styling
          data: { ...sub, label: sub.title, track: trackId, nodeId: sub.id, isSubNode: true },
          position: { x: 0, y: 0 },
        });
        edges.push({
          id: `e-${currentId}-${subId}`,
          source: currentId,
          target: subId,
          type: 'trackEdge',
          // BUG-01 FIX: pass strokeDasharray via data, not style, so TrackEdge can read it
          data: { track: trackId, isSubEdge: true, strokeDasharray: '5 5' },
          animated: true,
        });
      });
    }

    return currentId;
  };

  pathMap.paths.forEach(track => {
    // BUG-02 FIX: if path has an originNodeId, start the first edge from there
    // This makes branch paths connect from their divergence point instead of Start
    let prevId = track.originNodeId ?? pathMap.startNode.id;
    track.nodes.forEach((node) => {
      prevId = addNodesAndEdges(node, track.id, prevId, track.successProbability);
    });

    edges.push({
      id: `e-${prevId}-${pathMap.goalNode.id}`,
      source: prevId,
      target: pathMap.goalNode.id,
      type: 'trackEdge',
      // BUG-03 FIX: pass successProbability for the final edge too
      data: { track: track.id, successProbability: track.successProbability }
    });
  });


  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: options?.direction || 'BT', nodesep: 80, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(n => {
    // BUG-01 FIX: subStepNode uses smaller dimensions so dagre lays them out correctly
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
