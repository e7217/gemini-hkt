import { LifePathView } from '@/components/LifePathView';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background">
      <LoadingAnimation />
      <LifePathView />
    </main>
  );
}
