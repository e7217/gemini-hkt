'use client';

import { Handle, Position } from '@xyflow/react';
import { TRACK_COLORS, getTrackBgColor, getTrackGlowColor, TrackId } from '@/lib/trackColors';
import { useTheme } from 'next-themes';
import { AlertCircle } from 'lucide-react';

// BUG-01: isSubNode flag for visual distinction of expanded sub-steps
interface StepNodeData {
  label: string;
  track: string;
  nodeId: string;
  timeEstimate?: string;
  opportunityCost?: string;
  isSubNode?: boolean;
}

export default function StepNode({ data }: { data: StepNodeData }) {
  const { resolvedTheme } = useTheme();
  const trackId = (data.track as TrackId) || 'fast';
  const borderColor = TRACK_COLORS[trackId];
  const bgColor = getTrackBgColor(trackId, resolvedTheme);
  const glowColor = getTrackGlowColor(trackId, resolvedTheme);

  // BUG-01 FIX: subNode gets a smaller, dashed-border style to distinguish visually
  const isSubNode = data.isSubNode === true;
  // BUG-04: track presence of metadata icons
  const hasOpportunityCost = !!data.opportunityCost;
  const hasTimeEstimate = !!data.timeEstimate;

  return (
    <div
      className={`rounded-lg border-2 flex flex-col items-center justify-center p-3 text-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer relative shadow-sm ${isSubNode
          ? 'w-[160px] h-[64px] border-dashed opacity-90'
          : 'w-[200px] h-[80px]'
        }`}
      style={{
        borderColor: borderColor,
        backgroundColor: bgColor,
        boxShadow: isSubNode ? `0 0 6px ${glowColor}` : `0 0 12px ${glowColor}`,
      }}
    >
      <Handle type="target" position={Position.Bottom} className="opacity-0" />

      {/* BUG-04: 기회비용 아이콘 — 주황색 경고 (우측 상단) */}
      {hasOpportunityCost && (
        <div
          className="absolute top-1 right-1 text-orange-500 hover:text-orange-400 transition-colors"
          title={`💸 기회 비용: ${data.opportunityCost}`}
        >
          <AlertCircle size={isSubNode ? 10 : 14} />
        </div>
      )}

      {/* BUG-04: 예상 시간 아이콘 — 파란색 시계 (기회비용이 있으면 그 왼쪽) */}
      {hasTimeEstimate && (
        <div
          className={`absolute top-1 text-blue-400 hover:text-blue-300 transition-colors ${hasOpportunityCost ? (isSubNode ? 'right-5' : 'right-6') : 'right-1'
            }`}
          title={`⏱ 예상 시간: ${data.timeEstimate}`}
        >
          <span className={`font-bold leading-none select-none ${isSubNode ? 'text-[8px]' : 'text-[9px]'}`}>⏱</span>
        </div>
      )}

      <div className={`text-foreground font-medium truncate block ${isSubNode ? 'text-xs max-w-[130px]' : 'text-sm max-w-[160px]'}`}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
