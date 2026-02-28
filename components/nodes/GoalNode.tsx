'use client';

import { Handle, Position } from '@xyflow/react';
import type { GoalNodeData } from '@/types/flow';

export default function GoalNode({ data }: { data: GoalNodeData }) {
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer">
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-blue-500 to-purple-500 animate-pulse"
        style={{
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.6), 0 0 30px rgba(59, 130, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.6)'
        }}
      ></div>
      <div className="z-10 text-white font-bold text-center text-sm px-2 drop-shadow-md truncate block w-full max-w-[90px]">
        {data.label}
      </div>
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
