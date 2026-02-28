'use client';

import { TrackId, TRACK_COLORS, TRACK_LABELS } from '@/lib/trackColors';
import { useLifePathStore } from '@/store/useLifePathStore';
import { Badge } from '@/components/ui/badge';

interface TrackLegendProps {
  selectedTrack: TrackId | null;
  onSelectTrack: (track: TrackId | null) => void;
}

export function TrackLegend({ selectedTrack, onSelectTrack }: TrackLegendProps) {
  const tracks: TrackId[] = ['fast', 'deep', 'risk'];
  const pathMap = useLifePathStore((s) => s.pathMap);

  return (
    <div className="absolute top-16 left-4 z-10 bg-background/60 backdrop-blur-md rounded-xl p-3 flex flex-col gap-2">
      {tracks.map((track) => {
        const pathData = pathMap?.paths?.find(p => p.id === track);
        
        return (
          <button
            key={track}
            onClick={() => onSelectTrack(track)}
            aria-pressed={selectedTrack === track}
            className={`flex flex-col gap-1.5 p-2 rounded-lg transition-all text-left ${
              selectedTrack === track ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background/60 bg-foreground/10' : ''
            } ${selectedTrack && selectedTrack !== track ? 'opacity-60' : 'opacity-100'}`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: TRACK_COLORS[track] }}
              />
              <span className="text-sm font-medium text-foreground">{TRACK_LABELS[track]}</span>
            </div>
            
            {pathData && (pathData.successProbability !== undefined || pathData.difficulty) && (
              <div className="flex items-center gap-1.5 pl-5">
                {pathData.successProbability !== undefined && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    성공 확률 {pathData.successProbability}%
                  </Badge>
                )}
                {pathData.difficulty && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 opacity-80">
                    난이도 {pathData.difficulty}
                  </Badge>
                )}
              </div>
            )}
            
            {pathData?.successProbability !== undefined && (
              <div className="w-full h-1 bg-muted rounded-full mt-0.5 ml-5 max-w-[calc(100%-1.25rem)] overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${pathData.successProbability}%`,
                    backgroundColor: TRACK_COLORS[track] 
                  }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
