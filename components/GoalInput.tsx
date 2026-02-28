'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLifePathStore } from '@/store/useLifePathStore';
import { getRandomGoal } from '@/data/presets';
import { Loader2, GitBranch } from 'lucide-react';

export function GoalInput() {
  const goal = useLifePathStore((s) => s.goal);
  const isLoading = useLifePathStore((s) => s.isLoading);
  const error = useLifePathStore((s) => s.error);
  const setGoal = useLifePathStore((s) => s.setGoal);
  const isReverse = useLifePathStore((s) => s.isReverse);
  const setIsReverse = useLifePathStore((s) => s.setIsReverse);
  const generatePath = useLifePathStore((s) => s.generatePath);
  const clearError = useLifePathStore((s) => s.clearError);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void generatePath();
  };

  const handleRandomGoal = () => {
    setGoal(getRandomGoal().title);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col gap-4 w-full max-w-lg px-4">
        <h1 className="text-3xl font-bold text-center text-foreground flex items-center justify-center gap-2">
          <GitBranch className="h-8 w-8 text-primary" />
          Branch
        </h1>
        <p className="text-muted-foreground text-center mb-4">
          나의 인생 경로를 탐색하세요
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="이루고 싶은 목표를 입력하세요"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="reverse-planning"
              checked={isReverse}
              onChange={(e) => setIsReverse(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="reverse-planning" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
              역산 기법 (목표에서 역순으로 계획)
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRandomGoal}
              disabled={isLoading}
              aria-label="랜덤 목표 선택"
            >
              🎲
            </Button>
            <Button
              type="submit"
              disabled={isLoading || goal.trim() === ''}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </span>
              ) : (
                '경로 생성하기'
              )}
            </Button>
          </div>
          {error && (
            <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="ml-2 font-bold hover:opacity-70"
                aria-label="에러 닫기"
              >
                ×
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
