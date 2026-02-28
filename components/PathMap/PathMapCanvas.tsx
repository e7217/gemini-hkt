'use client';

import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { pathMapToFlow } from '@/lib/graphUtils';
import type { PathMap } from '@/types/path';
import StartNode from '../nodes/StartNode';
import StepNode from '../nodes/StepNode';
import GoalNode from '../nodes/GoalNode';
import MergeNode from '../nodes/MergeNode';
import TrackEdge from './TrackEdge';
import { useMemo } from 'react';

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
  const { nodes, edges } = useMemo(() => pathMapToFlow(pathMap), [pathMap]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2.0}
      >
        <Background variant={BackgroundVariant.Dots} color="#333" gap={20} />
      </ReactFlow>
    </div>
  );
}
