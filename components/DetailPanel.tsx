'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TRACK_COLORS, TRACK_LABELS, TRACK_TEXT_COLORS, TrackId } from '@/lib/trackColors';
import { useLifePathStore } from '@/store/useLifePathStore';

interface DetailPanelProps {
  node: any | null; // Using any here to accommodate both PathNode and MergeNode data
  isOpen: boolean;
  onClose: () => void;
}

export function DetailPanel({ node, isOpen, onClose }: DetailPanelProps) {
  const { addBranch, isBranching } = useLifePathStore();
  const [condition, setCondition] = useState('');

  if (!node) return null;

  const handleAddBranch = async () => {
    if (!condition.trim()) return;
    // Assuming node.id contains the node ID and node.track contains the path ID.
    // In React Flow, node.id is the actual node ID. node.track should be the path ID.
    const pathId = node.track || 'custom';
    await addBranch(pathId, node.id, condition);
    setCondition('');
  };

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

          <section className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">🔀 조건 분기 (What-if)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              이 시점에서 만약 다른 선택을 한다면 어떻게 될까요?
            </p>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="예: 창업을 한다면?"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={isBranching}
              />
              <Button 
                onClick={handleAddBranch} 
                disabled={!condition.trim() || isBranching}
                className="w-full"
              >
                {isBranching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '새로운 경로 생성'
                )}
              </Button>
            </div>
          </section>
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
