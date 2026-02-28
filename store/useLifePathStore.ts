import { create } from 'zustand';
import type { PathMap } from '@/types/path';

interface LifePathStore {
  goal: string;
  isLoading: boolean;
  pathMap: PathMap | null;
  error: string | null;
  setGoal: (goal: string) => void;
  generatePath: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
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
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set({ goal: '', isLoading: false, pathMap: null, error: null }),
}));
