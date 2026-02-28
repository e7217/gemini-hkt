'use client';

import { EdgeProps, Edge, getBezierPath } from '@xyflow/react';
import { getEdgeStyle } from '@/lib/graphUtils';

// BUG-01 + BUG-03 merged: strokeDasharray (from data) + successProbability
type CustomEdgeData = {
  track: string;
  successProbability?: number;  // BUG-03: for dynamic strokeWidth
  isSubEdge?: boolean;
  strokeDasharray?: string;     // BUG-01: passed via data instead of style prop
};
type CustomEdge = Edge<CustomEdgeData>;

export default function TrackEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, animated,
}: EdgeProps<CustomEdge>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  // BUG-03 FIX: pass successProbability for dynamic strokeWidth
  const baseStyle = getEdgeStyle(data?.track ?? 'fast', data?.successProbability);
  // BUG-01 FIX: read strokeDasharray from data (subnodes) instead of style prop
  const strokeDasharray = data?.strokeDasharray;

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        stroke={baseStyle.stroke}
        strokeWidth={baseStyle.strokeWidth}
        strokeDasharray={strokeDasharray}
        style={{ filter: baseStyle.filter }}
        className={animated ? 'react-flow__edge-path animated' : 'react-flow__edge-path'}
        fill="none"
      />
    </g>
  );
}
