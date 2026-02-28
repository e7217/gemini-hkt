'use client';

import { Handle, Position } from '@xyflow/react';
import type { MergeNodeData } from '@/types/flow';

export default function MergeNode({ data }: { data: MergeNodeData }) {
  return (
    <div className="relative w-[100px] h-[100px] rounded-full flex items-center justify-center"
         style={{ background: 'conic-gradient(#F59E0B, #3B82F6, #8B5CF6, #F59E0B)' }}>
      <div className="absolute inset-1 bg-background rounded-full flex flex-col items-center justify-center p-2">
        <span className="text-2xl text-foreground mb-1">◆</span>
        <span className="text-[10px] text-foreground text-center leading-tight line-clamp-2">
          {data.label}
        </span>
      </div>
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
