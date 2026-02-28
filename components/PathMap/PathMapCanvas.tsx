'use client';

import { ReactFlow, Background, BackgroundVariant, NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { pathMapToFlow } from '@/lib/graphUtils';
import type { PathMap } from '@/types/path';
import StartNode from '../nodes/StartNode';
import StepNode from '../nodes/StepNode';
import GoalNode from '../nodes/GoalNode';
import MergeNode from '../nodes/MergeNode';
import TrackEdge from './TrackEdge';
import { useMemo } from 'react';
import { useLifePathStore } from '@/store/useLifePathStore';
import { TrackLegend } from '../TrackLegend';
import { DetailPanel } from '../DetailPanel';
import { TrackId } from '@/lib/trackColors';
import { useDebounce } from '@/hooks/useDebounce';
import { filterNodesByMonths, filterEdgesByNodes } from '@/lib/timelineFilter';
import { TimelineSlider } from '../TimelineSlider';

const nodeTypes = {
  startNode: StartNode,
  stepNode: StepNode,
  goalNode: GoalNode,
  mergeNode: MergeNode,
};

const edgeTypes = {
  trackEdge: TrackEdge,
};

export default function PathMapCanvas({ pathMap }: { pathMap: PathMap }) {
  const { selectedTrack, setSelectedTrack, selectedNode, setSelectedNode, isPanelOpen, setIsPanelOpen, timelineMonths } = useLifePathStore();

  const { nodes, edges } = useMemo(() => pathMapToFlow(pathMap), [pathMap]);
  const debouncedMonths = useDebounce(timelineMonths, 200);

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
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedNode(null), 300); // delay to let slide out animation finish
  };

  return (
    <div className="relative w-full h-full min-h-[600px]" style={{ flex: 1 }}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.3}
        maxZoom={2.0}
        style={{ width: '100%', height: '100%' }}
      >
        <Background variant={BackgroundVariant.Dots} color="#333" gap={20} />
      </ReactFlow>

      <TrackLegend selectedTrack={selectedTrack} onSelectTrack={handleSelectTrack} />
      <TimelineSlider />
      <DetailPanel node={selectedNode} isOpen={isPanelOpen} onClose={handlePanelClose} />
    </div>
  );
}
