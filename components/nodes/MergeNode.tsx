'use client';

import { Handle, Position } from '@xyflow/react';
import type { MergeNodeData } from '@/types/flow';

export default function MergeNode({ data }: { data: MergeNodeData }) {
  return (
    <div className="relative w-[100px] h-[100px] rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer"
         style={{ background: 'conic-gradient(#F59E0B, #3B82F6, #8B5CF6, #F59E0B)' }}>
      <div className="absolute inset-1 bg-background rounded-full flex flex-col items-center justify-center p-2">
        <span className="text-2xl text-foreground mb-1">◆</span>
        <span className="text-xs text-foreground text-center leading-tight truncate block w-full max-w-[70px]">
          {data.label}
        </span>
      </div>
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
