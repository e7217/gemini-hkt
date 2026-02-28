'use client';

import { useLifePathStore } from '@/store/useLifePathStore';
import { GoalInput } from './GoalInput';

export function LifePathView() {
  const pathMap = useLifePathStore((s) => s.pathMap);

  if (pathMap) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          경로가 생성되었습니다!
        </h1>
        <p className="text-foreground">
          (경로 맵 렌더링은 FE-03 React Flow 맵 이슈에서 구현됩니다.)
        </p>
        <button
          onClick={() => useLifePathStore.getState().reset()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          다시 하기
        </button>
      </div>
    );
  }

  return <GoalInput />;
}
