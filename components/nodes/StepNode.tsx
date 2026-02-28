'use client';

import { Handle, Position } from '@xyflow/react';
import { TRACK_COLORS } from '@/lib/graphUtils';
import { AlertCircle } from 'lucide-react';
import type { StepNodeData } from '@/types/flow';

export default function StepNode({ data }: { data: StepNodeData }) {
  const trackColors = TRACK_COLORS[data.track] || TRACK_COLORS.fast;

  return (
    <div 
      className="w-[200px] h-[80px] rounded-lg border-2 flex flex-col items-center justify-center p-3 text-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer relative"
      style={{ 
        borderColor: trackColors.border,
        backgroundColor: trackColors.bg,
        boxShadow: `0 0 15px ${trackColors.glow}`
      }}
    >
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      
      {data.opportunityCost && (
        <div className="absolute top-1 right-1 text-orange-500" title={`기회 비용: ${data.opportunityCost}`}>
          <AlertCircle size={14} />
        </div>
      )}

      <div className="text-foreground font-medium text-sm truncate block max-w-[160px]">
        {data.label}
      </div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
