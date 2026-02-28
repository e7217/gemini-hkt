'use client';

import dynamic from 'next/dynamic';
import type { PathMap } from '@/types/path';

const PathMapCanvas = dynamic(() => import('./PathMapCanvas'), { ssr: false });

export default function PathMap({ pathMap }: { pathMap: PathMap }) {
  return (
    <div className="w-full h-full min-h-[600px] border border-border rounded-xl overflow-hidden">
      <PathMapCanvas pathMap={pathMap} />
    </div>
  );
}
