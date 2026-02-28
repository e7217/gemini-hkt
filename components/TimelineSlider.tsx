'use client';

import { useLifePathStore } from '@/store/useLifePathStore';
import { Slider } from '@/components/ui/slider';

export function TimelineSlider() {
  const { timelineMonths, setTimelineMonths } = useLifePathStore();

  const label = timelineMonths % 12 === 0 
    ? `${timelineMonths / 12}년` 
    : `${timelineMonths}개월`;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md z-10 px-4">
      <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-border/50">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-3 px-1">
          <span className="font-medium">1년</span>
          <span className="text-foreground font-bold bg-foreground/10 px-3 py-1 rounded-full">{label}</span>
          <span className="font-medium">5년</span>
        </div>
        <Slider
          min={12}
          max={60}
          step={6}
          value={[timelineMonths]}
          onValueChange={([v]) => setTimelineMonths(v)}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
