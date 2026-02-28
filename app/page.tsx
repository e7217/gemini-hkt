import { LifePathView } from '@/components/LifePathView';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GitBranch } from 'lucide-react';

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <GitBranch className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight text-foreground">Branch</span>
      </div>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <LoadingAnimation />
      <LifePathView />
    </main>
  );
}
