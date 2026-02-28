'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLifePathStore } from '@/store/useLifePathStore';
import { getRandomGoal } from '@/data/presets';
import { Loader2 } from 'lucide-react';

export function GoalInput() {
  const goal = useLifePathStore((s) => s.goal);
  const isLoading = useLifePathStore((s) => s.isLoading);
  const error = useLifePathStore((s) => s.error);
  const setGoal = useLifePathStore((s) => s.setGoal);
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
        <h1 className="text-2xl font-bold text-center text-foreground">
          나의 인생 경로를 탐색하세요
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="text"
            maxLength={100}
            placeholder="이루고 싶은 목표를 입력하세요"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRandomGoal}
              disabled={isLoading}
              className="transition-colors duration-200"
              aria-label="랜덤 목표 선택"
            >
              🎲
            </Button>
            <Button
              type="submit"
              disabled={isLoading || goal.trim().length === 0}
              className="flex-1 transition-colors duration-200"
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
            <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive mt-2">
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
