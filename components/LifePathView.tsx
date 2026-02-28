'use client';

import { useLifePathStore } from '@/store/useLifePathStore';
import { GoalInput } from './GoalInput';
import PathMap from './PathMap';

export function LifePathView() {
  const { pathMap } = useLifePathStore();

  if (pathMap) {
    return (
      <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col">
        <PathMap pathMap={pathMap} />
      </div>
    );
  }

  return <GoalInput />;
}
