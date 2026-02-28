'use client';

import { Handle, Position } from '@xyflow/react';
import type { GoalNodeData } from '@/types/flow';
import { Trophy } from 'lucide-react';

export default function GoalNode({ data }: { data: GoalNodeData }) {
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer">
      {/* Floating Speech Bubble */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-4 py-2 rounded-xl shadow-lg border border-border text-sm font-medium whitespace-nowrap animate-float z-50">
        {data.label}
        {/* Bubble Tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-popover border-b border-r border-border transform rotate-45"></div>
      </div>

      <div 
        className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-blue-500 to-purple-500 animate-pulse"
        style={{
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.6), 0 0 30px rgba(59, 130, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.6)'
        }}
      ></div>

      <div className="z-10 flex items-center justify-center w-full h-full drop-shadow-md">
        <Trophy className="w-10 h-10 text-white" />
      </div>

      <Handle type="target" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
