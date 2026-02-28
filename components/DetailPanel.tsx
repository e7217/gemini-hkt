'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TRACK_COLORS, TRACK_LABELS, TRACK_TEXT_COLORS, TrackId } from '@/lib/trackColors';

interface DetailPanelProps {
  node: any | null; // Using any here to accommodate both PathNode and MergeNode data
  isOpen: boolean;
  onClose: () => void;
}

export function DetailPanel({ node, isOpen, onClose }: DetailPanelProps) {
  if (!node) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[30%] min-w-[320px] z-50 bg-background border-l shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <Card className="h-full border-0 rounded-none overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            aria-label="패널 닫기"
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full"
          >
            ✕
          </button>
          <CardTitle className="text-base font-semibold pr-8 line-clamp-2 leading-tight">
            {node.label || node.title}
          </CardTitle>
          {node.description && <CardDescription className="text-sm">{node.description}</CardDescription>}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {node.track && TRACK_COLORS[node.track as TrackId] && (
              <Badge
                style={{
                  backgroundColor: TRACK_COLORS[node.track as TrackId],
                  color: TRACK_TEXT_COLORS[node.track as TrackId],
                }}
              >
                {TRACK_LABELS[node.track as TrackId]}
              </Badge>
            )}
            {node.difficulty && (
              <Badge variant="secondary">난이도: {node.difficulty}</Badge>
            )}
            {node.monthsFromNow !== undefined && (
              <Badge variant="outline">{node.monthsFromNow}개월 후</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {renderMergeInfo(node)}
          {renderTips(node)}
        </CardContent>
      </Card>
    </div>
  );
}

function renderTips(node: any) {
  if (!node.tips || node.tips.length === 0) return null;
  return (
    <section className="mt-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">💡 Tips</h3>
      <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
        {node.tips.map((tip: string, i: number) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

function renderMergeInfo(node: any) {
  if (node.type !== 'merge' && node.nodeType !== 'mergeNode' && !node.message) return null;
  
  return (
    <section className="mt-4 p-4 bg-muted/50 rounded-lg">
      {node.connectedPaths && node.connectedPaths.length > 0 && (
        <Badge variant="outline" className="mb-3">
          {node.connectedPaths.length}개의 경로 합류
        </Badge>
      )}
      {node.message && (
        <blockquote className="italic text-primary border-l-2 border-primary pl-3">
          "{node.message}"
        </blockquote>
      )}
    </section>
  );
}
