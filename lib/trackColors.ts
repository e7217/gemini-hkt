export type TrackId = 'fast' | 'deep' | 'risk';
export const TRACK_COLORS: Record<TrackId, string> = { fast: '#F59E0B', deep: '#3B82F6', risk: '#8B5CF6' };
export const TRACK_LABELS: Record<TrackId, string> = { fast: 'Fast Track', deep: 'Deep Dive', risk: 'Risk Path' };
export const TRACK_TEXT_COLORS: Record<TrackId, string> = { fast: '#000000', deep: '#ffffff', risk: '#ffffff' };
