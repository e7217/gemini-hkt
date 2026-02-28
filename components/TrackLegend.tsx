'use client';

import { TrackId, TRACK_COLORS, TRACK_LABELS } from '@/lib/trackColors';

interface TrackLegendProps {
  selectedTrack: TrackId | null;
  onSelectTrack: (track: TrackId | null) => void;
}

export function TrackLegend({ selectedTrack, onSelectTrack }: TrackLegendProps) {
  const tracks: TrackId[] = ['fast', 'deep', 'risk'];

  return (
    <div className="absolute top-4 left-4 z-10 bg-background/60 backdrop-blur-md rounded-xl p-3 flex flex-col gap-2">
      {tracks.map((track) => (
        <button
          key={track}
          onClick={() => onSelectTrack(track)}
          aria-pressed={selectedTrack === track}
          className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${
            selectedTrack === track ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background/60 bg-foreground/10' : ''
          } ${selectedTrack && selectedTrack !== track ? 'opacity-60' : 'opacity-100'}`}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: TRACK_COLORS[track] }}
          />
          <span className="text-sm font-medium text-foreground">{TRACK_LABELS[track]}</span>
        </button>
      ))}
    </div>
  );
}
