'use client';

import { EdgeProps, Edge, getBezierPath } from '@xyflow/react';
import { getEdgeStyle } from '@/lib/graphUtils';

type CustomEdge = Edge<{ track: string }>;

export default function TrackEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data
}: EdgeProps<CustomEdge>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const style = getEdgeStyle(data?.track ?? 'fast');

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        style={{ filter: style.filter }}
        fill="none"
      />
    </g>
  );
}
