'use client';

import { Handle, Position } from '@xyflow/react';
import type { MergeNodeData } from '@/types/flow';
import { GitMerge } from 'lucide-react';

export default function MergeNode({ data }: { data: MergeNodeData }) {
  return (
    <div className="relative w-[100px] h-[100px] rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer"
         style={{ background: 'conic-gradient(#F59E0B, #3B82F6, #8B5CF6, #F59E0B)' }}>

      {/* Floating Speech Bubble */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-4 py-2 rounded-xl shadow-lg border border-border text-sm font-medium whitespace-nowrap animate-float z-50">
        {data.label}
        {/* Bubble Tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-popover border-b border-r border-border transform rotate-45"></div>
      </div>

      <div className="absolute inset-1 bg-background rounded-full flex flex-col items-center justify-center p-2">
        <GitMerge className="w-8 h-8 text-foreground" />
      </div>

      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
