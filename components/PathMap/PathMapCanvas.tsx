'use client';

import { ReactFlow, Background, BackgroundVariant, NodeMouseHandler, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { pathMapToFlow } from '@/lib/graphUtils';
import type { PathMap } from '@/types/path';
import StartNode from '../nodes/StartNode';
import StepNode from '../nodes/StepNode';
import GoalNode from '../nodes/GoalNode';
import MergeNode from '../nodes/MergeNode';
import TrackEdge from './TrackEdge';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useLifePathStore } from '@/store/useLifePathStore';
import { TrackLegend } from '../TrackLegend';
import { DetailPanel } from '../DetailPanel';
import { TrackId } from '@/lib/trackColors';
import { useDebounce } from '@/hooks/useDebounce';
import { filterNodesByMonths, filterEdgesByNodes } from '@/lib/timelineFilter';
import { TimelineSlider } from '../TimelineSlider';
import { useTheme } from 'next-themes';

const nodeTypes = {
  startNode: StartNode,
  stepNode: StepNode,
  subStepNode: StepNode, // BUG-01 FIX: register subStepNode type (reuses StepNode with isSubNode=true)
  goalNode: GoalNode,
  mergeNode: MergeNode,
};

const edgeTypes = {
  trackEdge: TrackEdge,
};

export default function PathMapCanvas({ pathMap }: { pathMap: PathMap }) {
  const { resolvedTheme } = useTheme();
  const { selectedTrack, setSelectedTrack, selectedNode, setSelectedNode, isPanelOpen, setIsPanelOpen, timelineMonths, setTimelineMonths, isExpanding } = useLifePathStore();
  const { fitView } = useReactFlow();
  // BUG-01 FIX: track previous isExpanding to detect when expand finishes
  const prevIsExpanding = useRef(false);

  const [isTimeTravelMode, setIsTimeTravelMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsTimeTravelMode(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsTimeTravelMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isTimeTravelMode) {
      const deltaY = e.deltaY;
      const step = 6;
      let newMonths = timelineMonths + (deltaY > 0 ? step : -step);
      if (newMonths < 0) newMonths = 0;
      if (newMonths > 60) newMonths = 60;
      if (newMonths !== timelineMonths) {
        setTimelineMonths(newMonths);
      }
    }
  }, [isTimeTravelMode, timelineMonths, setTimelineMonths]);

  const { nodes, edges } = useMemo(() => pathMapToFlow(pathMap), [pathMap]);
  const debouncedMonths = useDebounce(timelineMonths, 200);

  useEffect(() => {
    // Optional: when timeline changes and nodes appear, re-fit view or pan
    if (visibleNodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 50);
    }
  }, [debouncedMonths, fitView]); // Only trigger when the debounced timeline filter applies

  // BUG-01 FIX: when expandNode finishes (isExpanding flips false→true→false), re-fit view
  useEffect(() => {
    if (prevIsExpanding.current && !isExpanding) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
    }
    prevIsExpanding.current = isExpanding;
  }, [isExpanding, fitView]);

  const filteredNodes = useMemo(() => {
    return filterNodesByMonths(nodes, debouncedMonths);
  }, [nodes, debouncedMonths]);

  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return filterEdgesByNodes(edges, visibleNodeIds);
  }, [edges, filteredNodes]);

  const visibleNodes = useMemo(() => {
    if (!selectedTrack) return filteredNodes;
    return filteredNodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.data?.track === selectedTrack || n.type === 'mergeNode' || n.type === 'startNode' || n.type === 'goalNode' ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
      },
    }));
  }, [filteredNodes, selectedTrack]);

  const visibleEdges = useMemo(() => {
    if (!selectedTrack) return filteredEdges;
    return filteredEdges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: e.data?.track === selectedTrack ? 1 : 0.1,
        transition: 'opacity 0.3s ease',
      },
    }));
  }, [filteredEdges, selectedTrack]);

  const handleSelectTrack = (track: TrackId | null) => {
    setSelectedTrack(selectedTrack === track ? null : track);
  };

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    if (node.type === 'startNode' || node.type === 'goalNode') return;
    setSelectedNode(node.data as any);
    setIsPanelOpen(true);
    // Highlight branch if the node belongs to a specific track
    if (node.data?.track) {
      setSelectedTrack(node.data.track as TrackId);
    }
  };

  const handleEdgeClick = (_event: React.MouseEvent, edge: any) => {
    if (edge.data?.track) {
      setSelectedTrack(edge.data.track as TrackId);
    }
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedNode(null), 300); // delay to let slide out animation finish
  };

  return (
    <div className="relative w-full h-full min-h-[600px]" style={{ flex: 1 }} onWheel={handleWheel}>
      {isTimeTravelMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
          ⏳ 타임 트래블 모드 활성화 (스크롤하여 시간 이동)
        </div>
      )}
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2.0}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        colorMode={resolvedTheme === 'light' ? 'light' : 'dark'}
        zoomOnScroll={!isTimeTravelMode}
        panOnScroll={!isTimeTravelMode}
      >
        <Background variant={BackgroundVariant.Dots} color={resolvedTheme === 'light' ? '#ccc' : '#555'} gap={20} />
      </ReactFlow>

      <TrackLegend selectedTrack={selectedTrack} onSelectTrack={handleSelectTrack} />
      <TimelineSlider />
      <DetailPanel node={selectedNode} isOpen={isPanelOpen} onClose={handlePanelClose} />
    </div>
  );
}
