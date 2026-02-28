'use client';

import { Handle, Position } from '@xyflow/react';
import type { StartNodeData } from '@/types/flow';
import { Rocket } from 'lucide-react';

export default function StartNode({ data }: { data: StartNodeData }) {
  return (
    <div className="relative w-20 h-20 rounded-full border-4 border-foreground bg-foreground/10 flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer">
      <span className="absolute inset-0 rounded-full border-4 border-foreground/50 animate-ping" style={{ animationDuration: '2s' }}></span>
      <div className="z-10 flex items-center justify-center w-full h-full">
        <Rocket className="w-8 h-8 text-foreground" />
      </div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
