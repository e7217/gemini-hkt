import type { Node, Edge } from '@xyflow/react';

export function filterNodesByMonths(nodes: Node[], maxMonths: number): Node[] {
  return nodes.filter(n => {
    if (n.type === 'startNode' || n.type === 'goalNode') return true;
    if (n.data?.monthsFromNow == null) return true;
    return (n.data.monthsFromNow as number) <= maxMonths;
  });
}

export function filterEdgesByNodes(edges: Edge[], visibleNodeIds: Set<string>): Edge[] {
  return edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
}
