import { create } from 'zustand';
import type { PathMap } from '@/types/path';
import { TrackId } from '@/lib/trackColors';

interface LifePathStore {
  goal: string;
  isReverse: boolean;
  isLoading: boolean;
  isBranching: boolean;
  pathMap: PathMap | null;
  error: string | null;
  
  // UI State
  selectedTrack: TrackId | null;
  selectedNode: any | null;
  isPanelOpen: boolean;
  timelineMonths: number;

  setGoal: (goal: string) => void;
  setIsReverse: (isReverse: boolean) => void;
  generatePath: () => Promise<void>;
  addBranch: (pathId: string, nodeId: string, choice: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // UI Actions
  setSelectedTrack: (track: TrackId | null) => void;
  setSelectedNode: (node: any | null) => void;
  setIsPanelOpen: (isOpen: boolean) => void;
  setTimelineMonths: (months: number) => void;
}

export const useLifePathStore = create<LifePathStore>((set, get) => ({
  goal: '',
  isReverse: false,
  isLoading: false,
  isBranching: false,
  pathMap: null,
  error: null,
  
  selectedTrack: null,
  selectedNode: null,
  isPanelOpen: false,
  timelineMonths: 36,

  setGoal: (goal) => set({ goal }),
  setIsReverse: (isReverse) => set({ isReverse }),
  generatePath: async () => {
    if (get().goal.trim() === '') return;
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/paths/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: get().goal, isReverse: get().isReverse }),
      });

      if (!response.ok) {
        if (response.status >= 500) throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        if (response.status >= 400) throw new Error('요청이 올바르지 않습니다. 목표를 다시 확인해주세요.');
        throw new Error('경로 생성에 실패했습니다. 다시 시도해주세요.');
      }

      const data: PathMap = await response.json();
      set({ pathMap: data, isLoading: false, selectedTrack: null, selectedNode: null, isPanelOpen: false, timelineMonths: 36 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '경로 생성에 실패했습니다. 다시 시도해주세요.';
      set({ error: errorMessage, isLoading: false });
    }
  },
  addBranch: async (pathId, nodeId, choice) => {
    const { pathMap, goal, selectedNode } = get();
    if (!pathMap || !selectedNode) return;
    set({ isBranching: true, error: null });

    try {
      const response = await fetch('/api/paths/branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathId,
          currentNodeId: nodeId,
          choice,
          goal,
          nodeTitle: selectedNode.title || selectedNode.label,
          nodeMonths: selectedNode.monthsFromNow,
        }),
      });

      if (!response.ok) {
        throw new Error('조건 분기 생성에 실패했습니다.');
      }

      const newBranchData = await response.json();
      
      set((state) => {
        if (!state.pathMap) return state;
        
        // Find the node to connect the new branch to
        // Normally graphUtils would handle this if we structure it right, but for React Flow,
        // we might just need to ensure the new path starts at the right node.
        // For simplicity, we just append the paths and mergePoints. The UI will render them.
        
        return {
          ...state,
          pathMap: {
            ...state.pathMap,
            paths: [...state.pathMap.paths, ...(newBranchData.paths || [])],
            mergePoints: [...state.pathMap.mergePoints, ...(newBranchData.mergePoints || [])],
          },
          isBranching: false,
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '조건 분기 생성에 실패했습니다.';
      set({ error: errorMessage, isBranching: false });
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set({ goal: '', isReverse: false, isLoading: false, isBranching: false, pathMap: null, error: null, selectedTrack: null, selectedNode: null, isPanelOpen: false, timelineMonths: 36 }),
  
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setIsPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  setTimelineMonths: (months) => set({ timelineMonths: months }),
}));
