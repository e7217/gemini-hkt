'use client';

import { EdgeProps, Edge, getBezierPath } from '@xyflow/react';
import { getEdgeStyle } from '@/lib/graphUtils';

// BUG-03 FIX: extended edge data type to include successProbability
type CustomEdgeData = { track: string; successProbability?: number; isSubEdge?: boolean };
type CustomEdge = Edge<CustomEdgeData>;

export default function TrackEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, animated, style: styleProp
}: EdgeProps<CustomEdge>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  // BUG-03 FIX: pass successProbability to getEdgeStyle for dynamic strokeWidth
  const baseStyle = getEdgeStyle(data?.track ?? 'fast', data?.successProbability);

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        stroke={baseStyle.stroke}
        strokeWidth={baseStyle.strokeWidth}
        strokeDasharray={styleProp?.strokeDasharray}
        style={{
          filter: baseStyle.filter,
          ...styleProp
        }}
        className={animated ? 'react-flow__edge-path animated' : 'react-flow__edge-path'}
        fill="none"
      />
    </g>
  );
}
