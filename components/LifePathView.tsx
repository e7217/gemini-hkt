'use client';

import { useLifePathStore } from '@/store/useLifePathStore';
import { GoalInput } from './GoalInput';
import PathMap from './PathMap';

export function LifePathView() {
  const pathMap = useLifePathStore((s) => s.pathMap);

  if (pathMap) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-4 gap-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            나의 인생 경로
          </h1>
          <button
            onClick={() => useLifePathStore.getState().reset()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
          >
            다시 하기
          </button>
        </div>
        <div className="flex-1 w-full h-full relative">
          <PathMap pathMap={pathMap} />
        </div>
      </div>
    );
  }

  return <GoalInput />;
}
