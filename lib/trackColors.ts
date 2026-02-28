import { useTheme } from 'next-themes';

export type TrackId = 'fast' | 'deep' | 'risk';

export const TRACK_LABELS: Record<TrackId, string> = { 
  fast: 'Fast Track', 
  deep: 'Deep Dive', 
  risk: 'Risk Path' 
};

// Colors optimized for both dark and light modes
export const TRACK_COLORS: Record<TrackId, string> = { 
  fast: '#F59E0B', // Amber 500
  deep: '#3B82F6', // Blue 500
  risk: '#8B5CF6'  // Violet 500
};

export const TRACK_TEXT_COLORS: Record<TrackId, string> = { 
  fast: '#ffffff', 
  deep: '#ffffff', 
  risk: '#ffffff' 
};

// Helper to get translucent background colors based on theme
export function getTrackBgColor(track: TrackId, theme: string | undefined) {
  const isDark = theme === 'dark';
  const color = TRACK_COLORS[track];
  
  if (isDark) {
    return `${color}1A`; // 10% opacity in hex
  } else {
    return `${color}0D`; // 5% opacity in hex for light mode to keep it subtle
  }
}

export function getTrackGlowColor(track: TrackId, theme: string | undefined) {
  const isDark = theme === 'dark';
  const color = TRACK_COLORS[track];
  
  if (isDark) {
    return `${color}66`; // 40% opacity
  } else {
    return `${color}33`; // 20% opacity for light mode
  }
}
