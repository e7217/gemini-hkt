'use client';

import { EdgeProps, Edge, getBezierPath } from '@xyflow/react';
import { getEdgeStyle } from '@/lib/graphUtils';

type CustomEdgeData = { track: string; isSubEdge?: boolean; strokeDasharray?: string };
type CustomEdge = Edge<CustomEdgeData>;

export default function TrackEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, animated,
}: EdgeProps<CustomEdge>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const baseStyle = getEdgeStyle(data?.track ?? 'fast');
  // BUG-01 FIX: read strokeDasharray from data instead of style prop to avoid conflicts
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
