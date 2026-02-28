'use client';

import { Handle, Position } from '@xyflow/react';
import { TRACK_COLORS, getTrackBgColor, getTrackGlowColor, TrackId } from '@/lib/trackColors';
import { useTheme } from 'next-themes';
import { AlertCircle } from 'lucide-react';
import type { StepNodeData } from '@/types/flow';

export default function StepNode({ data }: { data: StepNodeData }) {
  const { resolvedTheme } = useTheme();
  const trackId = (data.track as TrackId) || 'fast';
  const borderColor = TRACK_COLORS[trackId];
  const bgColor = getTrackBgColor(trackId, resolvedTheme);
  const glowColor = getTrackGlowColor(trackId, resolvedTheme);

  // BUG-04: opportunityCost 아이콘은 이미 구현됨.
  // 추가: timeEstimate도 아이콘으로 표시하여 정보 밀도 향상
  const hasTimeEstimate = !!data.timeEstimate;
  const hasOpportunityCost = !!data.opportunityCost;

  return (
    <div
      className="w-[200px] h-[80px] rounded-lg border-2 flex flex-col items-center justify-center p-3 text-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110 cursor-pointer relative shadow-sm"
      style={{
        borderColor: borderColor,
        backgroundColor: bgColor,
        boxShadow: `0 0 12px ${glowColor}`
      }}
    >
      <Handle type="target" position={Position.Bottom} className="opacity-0" />

      {/* BUG-04: 기회비용 아이콘 — 주황색 경고 (우측 상단) */}
      {hasOpportunityCost && (
        <div
          className="absolute top-1 right-1 text-orange-500 hover:text-orange-400 transition-colors"
          title={`💸 기회 비용: ${data.opportunityCost}`}
        >
          <AlertCircle size={14} />
        </div>
      )}

      {/* BUG-04 추가: 예상 시간 아이콘 — 파란색 시계 (우측 상단, 기회비용과 구분) */}
      {hasTimeEstimate && (
        <div
          className={`absolute top-1 text-blue-400 hover:text-blue-300 transition-colors ${hasOpportunityCost ? 'right-6' : 'right-1'}`}
          title={`⏱ 예상 시간: ${data.timeEstimate}`}
        >
          <span className="text-[9px] font-bold leading-none select-none">⏱</span>
        </div>
      )}

      <div className="text-foreground font-medium text-sm truncate block max-w-[160px]">
        {data.label}
      </div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
    </div>
  );
}
