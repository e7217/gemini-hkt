'use client';

import { Handle, Position } from '@xyflow/react';
import type { StartNodeData } from '@/types/flow';

export default function StartNode({ data }: { data: StartNodeData }) {
  return (
    <div className="relative w-20 h-20 rounded-full border-4 border-foreground bg-foreground/10 flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer">
      <span className="absolute inset-0 rounded-full border-4 border-foreground/50 animate-ping" style={{ animationDuration: '2s' }}></span>
      <div className="text-foreground font-bold text-center text-sm z-10 truncate block w-full max-w-[60px] px-1">{data.label}</div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
