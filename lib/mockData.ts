import type { PathMap } from '@/types/path';

export const DEFAULT_MOCK_KEY = 'fullstack';

const MOCK_KEYWORDS: Record<string, string[]> = {
  fullstack: ['풀스택', 'fullstack', 'full stack', '개발자', '프로그래밍'],
  generic:   [],
};

const FULLSTACK_MOCK: PathMap = {
  startNode: { id: 'fs-start', title: '시작', description: '현재 상태' },
  goalNode: { id: 'fs-goal', title: '풀스택 개발자', description: '목표 달성' },
  paths: [
    {
      id: 'fast',
      name: 'Fast Track',
      color: '#F59E0B',
      nodes: [
        { id: 'fast-1', title: 'HTML/CSS/JS 기초', description: '웹 프론트엔드 기초', duration: '1개월', difficulty: 'Low', isMergePoint: false, tips: [], monthsFromNow: 1 },
        { id: 'fast-2', title: 'React 기초', description: 'SPA 개발', duration: '2개월', difficulty: 'Medium', isMergePoint: false, tips: [], monthsFromNow: 3 },
        { id: 'fast-3', title: 'Node.js API', description: '백엔드 기초', duration: '3개월', difficulty: 'Medium', isMergePoint: false, tips: [], monthsFromNow: 6 },
        { id: 'fast-4', title: '포트폴리오', description: '프로젝트 완성', duration: '3개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 9 },
        { id: 'fast-5', title: '취업 준비', description: '이력서 및 면접', duration: '3개월', difficulty: 'Medium', isMergePoint: false, tips: [], monthsFromNow: 12 },
      ]
    },
    {
      id: 'deep',
      name: 'Deep Dive',
      color: '#3B82F6',
      nodes: [
        { id: 'deep-1', title: 'CS 기초', description: '컴퓨터 구조', duration: '2개월', difficulty: 'Medium', isMergePoint: false, tips: [], monthsFromNow: 2 },
        { id: 'deep-2', title: 'JS 심화', description: 'TypeScript 포함', duration: '4개월', difficulty: 'Medium', isMergePoint: false, tips: [], monthsFromNow: 6 },
        { id: 'deep-3', title: 'React/Next.js', description: '프론트 심화', duration: '6개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 12 },
        { id: 'deep-4', title: '백엔드 아키텍처', description: 'DB 설계', duration: '6개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 18 },
        { id: 'deep-5', title: '대규모 프로젝트', description: '실무 수준 프로젝트', duration: '6개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 24 },
        { id: 'deep-6', title: '시니어 준비', description: '창업 또는 취업', duration: '6개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 30 },
      ]
    },
    {
      id: 'risk',
      name: 'Risk Path',
      color: '#8B5CF6',
      nodes: [
        { id: 'risk-1', title: '실전 투입', description: '첫 외주 수주', duration: '1개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 1 },
        { id: 'risk-2', title: '수익 창출', description: '월 100만원 달성', duration: '3개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 4 },
        { id: 'risk-3', title: '사이드 프로젝트', description: '서비스 론칭', duration: '4개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 8 },
        { id: 'risk-4', title: '팀 빌딩', description: '첫 고객 확보', duration: '6개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 14 },
        { id: 'risk-5', title: '독립 개발자', description: '안정적 수익', duration: '4개월', difficulty: 'High', isMergePoint: false, tips: [], monthsFromNow: 18 },
      ]
    }
  ],
  mergePoints: [
    { id: 'merge-1', title: '1차 합류', connectedPaths: ['fast', 'deep', 'risk'], message: '기본기 완성' },
    { id: 'merge-2', title: '2차 합류', connectedPaths: ['fast', 'deep', 'risk'], message: '실무 레벨 도달' }
  ]
};

const GENERIC_MOCK: PathMap = {
  ...FULLSTACK_MOCK,
  goalNode: { id: 'gen-goal', title: '일반 목표', description: '목표 달성' }
};

export const MOCK_PATH_MAPS: Record<string, PathMap> = {
  fullstack: FULLSTACK_MOCK,
  generic:   GENERIC_MOCK,
};

export function getMockPathMap(goal?: string): PathMap & { _isMock: boolean } {
  let matchedKey = DEFAULT_MOCK_KEY;
  if (goal) {
    const lowerGoal = goal.toLowerCase();
    const entry = Object.entries(MOCK_KEYWORDS).find(([_, keywords]) => 
      keywords.some(kw => lowerGoal.includes(kw))
    );
    if (entry) {
      matchedKey = entry[0];
    }
  }
  return { ...MOCK_PATH_MAPS[matchedKey], _isMock: true };
}

export async function withMockFallback<T extends PathMap>(
  fn: () => Promise<T>,
  goal?: string
): Promise<T & { _isMock?: boolean }> {
  try {
    return await fn();
  } catch (error) {
    console.warn('[MockFallback] Falling back to mock data due to error:', error);
    return getMockPathMap(goal) as T & { _isMock: boolean };
  }
}
