import { create } from 'zustand';
import type { PathMap, PathNode } from '@/types/path';
import type { TrackId } from '@/lib/trackColors';

interface LifePathStore {
  goal: string;
  isLoading: boolean;
  pathMap: PathMap | null;
  error: string | null;
  selectedNode: PathNode | null;
  selectedTrack: TrackId | null;
  isPanelOpen: boolean;
  timelineMonths: number;
  setGoal: (goal: string) => void;
  generatePath: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  setSelectedNode: (node: PathNode | null) => void;
  setSelectedTrack: (track: TrackId | null) => void;
  setIsPanelOpen: (open: boolean) => void;
  setTimelineMonths: (months: number) => void;
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Response) {
    if (err.status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (err.status >= 400) return '요청이 올바르지 않습니다. 목표를 다시 확인해주세요.';
  }
  return '경로 생성에 실패했습니다. 다시 시도해주세요.';
};

export const useLifePathStore = create<LifePathStore>((set, get) => ({
  goal: '',
  isLoading: false,
  pathMap: null,
  error: null,
  selectedNode: null,
  selectedTrack: null,
  isPanelOpen: false,
  timelineMonths: 36,
  setGoal: (goal) => set({ goal }),
  generatePath: async () => {
    if (get().goal.trim() === '') return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/paths/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: get().goal })
      });
      if (!response.ok) {
        throw response;
      }
      const data: PathMap = await response.json();
      set({ pathMap: data, isLoading: false });
    } catch (error) {
      set({ error: '경로 생성을 실패했습니다. 다시 시도해 주세요.', isLoading: false });
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set({ goal: '', isLoading: false, pathMap: null, error: null }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  setTimelineMonths: (months) => set({ timelineMonths: months }),
}));
