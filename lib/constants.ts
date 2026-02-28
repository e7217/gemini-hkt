/**
 * Application-wide constants and shared type definitions.
 */

export type TrackType = 'fast' | 'deep' | 'risk';

export type TrackColors = Record<TrackType, string>;
export type GlowStyles = Record<TrackType, string>;

export const TRACK_COLORS: TrackColors = {
  fast: '#F59E0B',
  deep: '#3B82F6',
  risk: '#8B5CF6',
} as const;

export const GLOW_STYLES: GlowStyles = {
  fast: '0 0 12px rgba(245, 158, 11, 0.5)',
  deep: '0 0 12px rgba(59, 130, 246, 0.5)',
  risk: '0 0 12px rgba(139, 92, 246, 0.5)',
} as const;
