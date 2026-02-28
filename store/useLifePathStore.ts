import { create } from 'zustand';
import type { PathMap } from '@/types/path';
import { TrackId } from '@/lib/trackColors';

interface LifePathStore {
  goal: string;
  isReverse: boolean;
  isLoading: boolean;
  isBranching: boolean;
  isExpanding: boolean;
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
  expandNode: (nodeId: string) => Promise<void>;
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
  isExpanding: false,
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

      // BUG-02 FIX: determine the canvas node ID of the selected node
      // selectedNode carries the canvas node's id via `nodeId` field set in graphUtils,
      // but its full canvas ID is `${track}-${nodeId}`. We stored it as data.id in PathMapCanvas.
      // The clicked node's React Flow id is available via selectedNode._flowNodeId if we pass it,
      // but for simplicity we reconstruct it: `${pathId}-${nodeId}` matches addNodesAndEdges logic.
      const originCanvasNodeId = `${pathId}-${nodeId}`;

      set((state) => {
        if (!state.pathMap) return state;

        // BUG-02 FIX: inject originNodeId into each new path so graphUtils connects from there
        const patchedPaths = (newBranchData.paths || []).map((p: any) => ({
          ...p,
          originNodeId: originCanvasNodeId,
        }));

        return {
          ...state,
          pathMap: {
            ...state.pathMap,
            paths: [...state.pathMap.paths, ...patchedPaths],
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

  expandNode: async (nodeId) => {
    const { pathMap, goal, selectedNode } = get();
    if (!pathMap || !selectedNode) return;
    set({ isExpanding: true, error: null });

    try {
      const response = await fetch('/api/paths/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId,
          nodeTitle: selectedNode.title || selectedNode.label,
          nodeDescription: selectedNode.description,
          goal,
        }),
      });

      if (!response.ok) {
        throw new Error('단계 확장 생성에 실패했습니다.');
      }

      const expandData = await response.json();

      set((state) => {
        if (!state.pathMap) return state;

        const updateNodeRecursively = (nodes: any[]): any[] => {
          return nodes.map((node) => {
            if (node.id === nodeId) {
              return { ...node, subNodes: expandData.nodes };
            }
            if (node.subNodes) {
              return { ...node, subNodes: updateNodeRecursively(node.subNodes) };
            }
            return node;
          });
        };

        const updatedPaths = state.pathMap.paths.map((path) => ({
          ...path,
          nodes: updateNodeRecursively(path.nodes),
        }));

        return {
          ...state,
          pathMap: { ...state.pathMap, paths: updatedPaths },
          isExpanding: false,
          // Update selectedNode so DetailPanel reflects the change
          selectedNode: { ...state.selectedNode, subNodes: expandData.nodes }
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '단계 확장 생성에 실패했습니다.';
      set({ error: errorMessage, isExpanding: false });
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set({ goal: '', isReverse: false, isLoading: false, isBranching: false, isExpanding: false, pathMap: null, error: null, selectedTrack: null, selectedNode: null, isPanelOpen: false, timelineMonths: 36 }),

  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setIsPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  setTimelineMonths: (months) => set({ timelineMonths: months }),
}));
