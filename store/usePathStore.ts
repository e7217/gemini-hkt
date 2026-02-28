// store/usePathStore.ts — initial scaffold
'use client';

import { create } from 'zustand';
import type { PathMap } from '@/types/path';

interface PathStore {
  // Goal input state
  goal: string;
  setGoal: (goal: string) => void;

  // Path data (populated after API call)
  pathMap: PathMap | null;
  setPathMap: (pathMap: PathMap | null) => void;

  // UI state
  selectedTrack: string | null;
  setSelectedTrack: (track: string | null) => void;
  timelineMonths: number;
  setTimelineMonths: (months: number) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

export const usePathStore = create<PathStore>()((set) => ({
  goal: '',
  setGoal: (goal) => set({ goal }),
  pathMap: null,
  setPathMap: (pathMap) => set({ pathMap }),
  selectedTrack: null,
  setSelectedTrack: (selectedTrack) => set({ selectedTrack }),
  timelineMonths: 36, // default: 3 years
  setTimelineMonths: (timelineMonths) => set({ timelineMonths }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set({
    goal: '', pathMap: null, selectedTrack: null,
    timelineMonths: 36, isLoading: false,
  }),
}));
