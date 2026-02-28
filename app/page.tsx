import { LifePathView } from '@/components/LifePathView';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <LoadingAnimation />
      <LifePathView />
    </main>
  );
}
