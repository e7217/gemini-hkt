'use client';

import { Handle, Position } from '@xyflow/react';
import type { StartNodeData } from '@/types/flow';

export default function StartNode({ data }: { data: StartNodeData }) {
  return (
    <div className="relative w-20 h-20 rounded-full border-4 border-white bg-white/10 flex items-center justify-center">
      <span className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" style={{ animationDuration: '2s' }}></span>
      <div className="text-white font-bold text-center text-sm z-10">{data.label}</div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
