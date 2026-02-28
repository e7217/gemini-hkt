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
  const { addBranch, isBranching, expandNode, isExpanding } = useLifePathStore();
  const [condition, setCondition] = useState('');

  if (!node) return null;

  const handleAddBranch = async () => {
    if (!condition.trim()) return;
    const pathId = node.track || 'custom';
    await addBranch(pathId, node.id, condition);
    setCondition('');
  };

  const handleExpandNode = async () => {
    await expandNode(node.id);
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
            {node.timeEstimate && (
              <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                시간: {node.timeEstimate}
              </Badge>
            )}
          </div>
          
          {node.opportunityCost && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md text-orange-800 dark:text-orange-300 text-sm flex gap-2 items-start">
              <span className="text-orange-500 font-bold mt-0.5">!</span>
              <div>
                <strong className="block mb-1">기회 비용 (Opportunity Cost)</strong>
                {node.opportunityCost}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {renderMergeInfo(node)}
          
          <section className="mt-4">
            <Button
              variant="outline"
              className="w-full border-dashed border-2 hover:border-primary hover:text-primary transition-all py-6 h-auto flex flex-col gap-1"
              onClick={handleExpandNode}
              disabled={isExpanding}
            >
              {isExpanding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mb-1" />
                  단계 분해 중...
                </>
              ) : (
                <>
                  <span className="font-bold text-base">🔍 단계 상세 분해</span>
                  <span className="text-xs text-muted-foreground">AI가 이 단계를 실천 가능한 작은 단위로 나누어줍니다</span>
                </>
              )}
            </Button>
          </section>

          {node.subNodes && node.subNodes.length > 0 && (
            <section className="mt-8 animate-in fade-in slide-in-from-top-2 duration-500">
              <h3 className="font-semibold mb-4 flex items-center gap-2">📋 상세 액션 플랜</h3>
              <div className="space-y-4">
                {node.subNodes.map((sub: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/30 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{sub.title}</h4>
                      <Badge variant="outline" className="text-[10px] h-4 px-1">{sub.duration}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{sub.description}</p>
                    {sub.tips && sub.tips.length > 0 && (
                      <div className="bg-background/50 p-2 rounded text-[10px] text-muted-foreground italic">
                        " {sub.tips[0]} "
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

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
