'use client';

import dynamic from 'next/dynamic';
import type { PathMap } from '@/types/path';

const PathMapCanvas = dynamic(() => import('./PathMapCanvas'), { ssr: false });

import { ReactFlowProvider } from '@xyflow/react';

export default function PathMap({ pathMap }: { pathMap: PathMap }) {
  if (!pathMap || !pathMap.paths || pathMap.paths.length === 0) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center border border-border rounded-xl bg-muted/20 text-muted-foreground">
        경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] border border-border rounded-xl overflow-hidden relative">
      <ReactFlowProvider>
        <PathMapCanvas pathMap={pathMap} />
      </ReactFlowProvider>
    </div>
  );
}
