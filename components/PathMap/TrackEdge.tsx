'use client';

import { EdgeProps, Edge, getBezierPath } from '@xyflow/react';
import { getEdgeStyle } from '@/lib/graphUtils';

type CustomEdge = Edge<{ track: string }>;

export default function TrackEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, animated, style: styleProp
}: EdgeProps<CustomEdge>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const baseStyle = getEdgeStyle(data?.track ?? 'fast');

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
