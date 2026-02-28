# BE-07 Mock 데이터 + 폴백 시스템 - Task List

**Feature ID**: BE-07
**Total Estimated Time**: 20분
**Phase**: Phase 1

---

## Phase 1: Setup (2분)

### T-01: lib/types.ts 확인
- **시간**: 2분
- **담당**: backend-dev
- **설명**: BE-02에서 정의된 타입이 PathNode, PathMap, MergePoint, PathInfo를 모두 포함하는지 확인
- **체크포인트**:
  - [x] `PathNode` 인터페이스 존재 확인 (id, type, label, description, monthsFromNow, track, difficulty?, tips?)
  - [x] `MergePoint` 인터페이스 존재 확인 (id, label, message, connectedPaths, monthsFromNow)
  - [x] `PathInfo` 인터페이스 존재 확인 (id, type, label, nodes)
  - [x] `PathMap` 인터페이스 존재 확인 (startNode, goalNode, paths, mergePoints)
- **실패 시 대응**: BE-02 미완성이면 `lib/mockData.ts` 상단에 타입 임시 정의 후 BE-02 완성 후 import로 교체
- **의존성**: BE-02

---

## Phase 2: Foundational (3분)

### T-02: lib/mockData.ts 파일 생성 및 기본 구조 작성
- **시간**: 3분
- **담당**: backend-dev
- **설명**: 파일 생성, import 선언, 타입 정의, 빈 상수 skeleton 작성
- **체크포인트**:
  - [x] `lib/mockData.ts` 파일 생성
  - [x] `PathMap`, `PathNode`, `MergePoint`, `PathInfo` import 추가
  - [x] `DEFAULT_MOCK_KEY = 'fullstack'` 상수 선언
  - [x] `MOCK_KEYWORDS` 객체 skeleton 선언
  - [x] `FULLSTACK_MOCK` 변수 선언 (값은 Phase 3에서 채움)
  - [x] `GENERIC_MOCK` 변수 선언 (값은 Phase 3에서 채움)
  - [x] `MOCK_PATH_MAPS` 객체 선언

**파일 골격 예시**:
```typescript
import type { PathMap, PathNode, MergePoint, PathInfo } from '@/lib/types';

export const DEFAULT_MOCK_KEY = 'fullstack';

const MOCK_KEYWORDS: Record<string, string[]> = {
  fullstack: ['풀스택', 'fullstack', 'full stack', '개발자', '프로그래밍'],
  generic:   [],
};

const FULLSTACK_MOCK = { /* ... */ } satisfies PathMap;
const GENERIC_MOCK   = { /* ... */ } satisfies PathMap;

export const MOCK_PATH_MAPS = {
  fullstack: FULLSTACK_MOCK,
  generic:   GENERIC_MOCK,
} satisfies Record<string, PathMap>;

export function getMockPathMap(goal?: string): PathMap & { _isMock: boolean } {
  // Phase 4에서 구현
  return { ...FULLSTACK_MOCK, _isMock: true };
}

export async function withMockFallback<T extends PathMap>(
  fn: () => Promise<T>,
  goal?: string
): Promise<T & { _isMock?: boolean }> {
  // Phase 5에서 구현
  return fn();
}
```

---

## Phase 3: US1 - 풀스택 Mock 데이터 완성 (8분)

### T-03: FULLSTACK_MOCK startNode + goalNode 작성
- **시간**: 1분
- **담당**: backend-dev
- **설명**: 풀스택 시나리오의 시작 노드와 목표 노드 작성
- **체크포인트**:
  - [x] `startNode.id = 'fs-start'`, `type = 'start'`, `monthsFromNow = 0`
  - [x] `goalNode.id = 'fs-goal'`, `type = 'goal'`, `monthsFromNow = 30`
  - [x] 한국어 label, description 작성
  - [x] tips 2~3개 작성
  - [x] `satisfies PathMap` 부분 타입 적용 (컴파일 오류 없음 확인)

### T-04: FULLSTACK_MOCK Fast Track 노드 5개 작성
- **시간**: 2분
- **담당**: backend-dev
- **설명**: 빠른 취업 경로 5개 노드 작성
- **monthsFromNow 분포**: 1, 3, 6, 9, 12
- **체크포인트**:
  - [x] `fast-1` (monthsFromNow=1): HTML/CSS + JS 기초
  - [x] `fast-2` (monthsFromNow=3): React 기초 + 첫 SPA
  - [x] `fast-3` (monthsFromNow=6): Node.js + Express API
  - [x] `fast-4` (monthsFromNow=9): 포트폴리오 프로젝트 완성
  - [x] `fast-5` (monthsFromNow=12): 취업 활동 시작
  - [x] 모든 노드의 `track: 'fast'` 설정
  - [x] 모든 노드의 `type: 'step'` 설정
  - [x] 각 노드에 tips 2~3개 작성
  - [x] monthsFromNow 단조 증가 확인: 1 < 3 < 6 < 9 < 12

### T-05: FULLSTACK_MOCK Deep Dive 노드 6개 작성
- **시간**: 2분
- **담당**: backend-dev
- **설명**: 체계적 학습 경로 6개 노드 작성
- **monthsFromNow 분포**: 2, 6, 12, 18, 24, 30
- **체크포인트**:
  - [x] `deep-1` (monthsFromNow=2): CS 기초 + 프로그래밍 원리
  - [x] `deep-2` (monthsFromNow=6): JS 심화 + TypeScript
  - [x] `deep-3` (monthsFromNow=12): React + Next.js + 상태관리
  - [x] `deep-4` (monthsFromNow=18): 백엔드 아키텍처 + DB 설계
  - [x] `deep-5` (monthsFromNow=24): 대규모 풀스택 프로젝트
  - [x] `deep-6` (monthsFromNow=30): 시니어 레벨 취업/창업 준비
  - [x] 모든 노드의 `track: 'deep'` 설정
  - [x] monthsFromNow 단조 증가 확인: 2 < 6 < 12 < 18 < 24 < 30

### T-06: FULLSTACK_MOCK Risk Track 노드 5개 작성
- **시간**: 1분
- **담당**: backend-dev
- **설명**: 프리랜서/창업 도전 경로 5개 노드 작성
- **monthsFromNow 분포**: 1, 4, 8, 14, 18
- **체크포인트**:
  - [x] `risk-1` (monthsFromNow=1): 즉시 실전 투입, 첫 클라이언트 수주
  - [x] `risk-2` (monthsFromNow=4): 월 100만원 프리랜서 수익
  - [x] `risk-3` (monthsFromNow=8): 사이드 프로젝트 론칭
  - [x] `risk-4` (monthsFromNow=14): 첫 유료 고객 또는 팀 빌딩
  - [x] `risk-5` (monthsFromNow=18): 독립 개발자/창업자 자리잡기
  - [x] 모든 노드의 `track: 'risk'` 설정
  - [x] monthsFromNow 단조 증가 확인: 1 < 4 < 8 < 14 < 18

### T-07: FULLSTACK_MOCK MergePoints 2개 작성
- **시간**: 1분
- **담당**: backend-dev
- **설명**: 1차 합류점(monthsFromNow=12)과 2차 합류점(monthsFromNow=18) 작성
- **체크포인트**:
  - [x] `merge-1.id = 'merge-1'`, `monthsFromNow = 12`
  - [x] `merge-1.connectedPaths = ['fast', 'deep', 'risk']` (paths ID와 정확히 매칭)
  - [x] `merge-1.message`: 감동적인 한국어 메시지 작성
  - [x] `merge-2.id = 'merge-2'`, `monthsFromNow = 18`
  - [x] `merge-2.connectedPaths = ['fast', 'deep', 'risk']`
  - [x] `merge-2.message`: 최종 합류 감성 메시지 작성

### T-08: GENERIC_MOCK 작성
- **시간**: 1분
- **담당**: backend-dev
- **설명**: 범용 목표 백업 Mock 데이터 작성 (간략화 허용)
- **체크포인트**:
  - [x] startNode: `gen-start`
  - [x] goalNode: `gen-goal`
  - [x] Fast Track 4개 노드 (monthsFromNow: 2, 5, 9, 12)
  - [x] Deep Track 5개 노드 (monthsFromNow: 3, 8, 14, 20, 24)
  - [x] Risk Track 4개 노드 (monthsFromNow: 1, 5, 10, 15)
  - [x] mergePoints 1개 (monthsFromNow=12)
  - [x] `satisfies PathMap` 타입 적용

---

## Phase 4: US2 - USE_MOCK 환경변수 (3분)

### T-09: getMockPathMap 함수 완전 구현
- **시간**: 2분
- **담당**: backend-dev
- **설명**: 키워드 매칭 로직 및 `_isMock` 플래그 추가 구현
- **체크포인트**:
  - [x] `goal?.toLowerCase()` 정규화 처리
  - [x] `Object.entries(MOCK_KEYWORDS).find()` 키워드 매칭 로직
  - [x] 매칭 실패 시 `DEFAULT_MOCK_KEY` 폴백
  - [x] `MOCK_PATH_MAPS[matchedKey]` 안전한 접근 (undefined 방어)
  - [x] `{ ...mockData, _isMock: true }` 반환
  - [x] 함수 20줄 이하 확인

### T-10: simulate/route.ts에 USE_MOCK 체크 추가
- **시간**: 1분
- **담당**: backend-dev
- **설명**: BE-06의 route handler에 USE_MOCK 즉시 전환 로직 추가
- **체크포인트**:
  - [x] `import { getMockPathMap, withMockFallback } from '@/lib/mockData'` 추가
  - [x] `if (process.env.USE_MOCK === 'true')` 분기 추가
  - [x] Mock 반환 시 `NextResponse.json(getMockPathMap(goal))` 사용

---

## Phase 5: US3 - 자동 폴백 함수 (3분)

### T-11: withMockFallback 함수 완전 구현
- **시간**: 2분
- **담당**: backend-dev
- **설명**: try-catch 폴백 래퍼 함수 구현
- **체크포인트**:
  - [x] `try { return await fn(); }` 성공 경로
  - [x] `catch (error) { ... }` 실패 경로
  - [x] `console.warn('[MockFallback] ...')` 로그 출력 (목표 + 원인 포함)
  - [x] `return getMockPathMap(goal)` 폴백 반환
  - [x] 제네릭 `<T extends PathMap>` 타입 파라미터 유지
  - [x] 함수 20줄 이하 확인

### T-12: simulate/route.ts에 withMockFallback 적용
- **시간**: 1분
- **담당**: backend-dev
- **설명**: Gemini API 호출을 withMockFallback으로 래핑
- **체크포인트**:
  - [x] `callGeminiForPathMap(goal)` 호출을 `withMockFallback(() => callGeminiForPathMap(goal), goal)`으로 교체
  - [x] 반환 타입 호환성 확인 (`PathMap & { _isMock?: boolean }`)

---

## Phase 6: Polish (1분)

### T-13: 타입 검증 + 최종 확인
- **시간**: 1분
- **담당**: backend-dev
- **설명**: 컴파일 타임 타입 검증 및 수동 동작 확인
- **체크포인트**:
  - [x] `npx tsc --noEmit` 오류 없음
  - [x] `.env.local`에 `USE_MOCK=true` 설정 후 API 응답에 `_isMock: true` 확인
  - [x] `USE_MOCK` 제거 후 정상 Gemini 호출 확인 (또는 폴백 로그 확인)
  - [x] data-model.md의 검증 체크리스트 항목 모두 통과
  - [x] 코드 리뷰: 함수 20줄 이하, nesting 2단계 이하 확인

---

## Task Summary

| Phase | Task | 예상 시간 | 상태 |
|-------|------|----------|------|
| Phase 1 | T-01: lib/types.ts 확인 | 2분 | pending |
| Phase 2 | T-02: lib/mockData.ts skeleton 생성 | 3분 | pending |
| Phase 3 | T-03: FULLSTACK_MOCK start/goal 노드 | 1분 | pending |
| Phase 3 | T-04: FULLSTACK_MOCK Fast Track 5개 | 2분 | pending |
| Phase 3 | T-05: FULLSTACK_MOCK Deep Dive 6개 | 2분 | pending |
| Phase 3 | T-06: FULLSTACK_MOCK Risk Track 5개 | 1분 | pending |
| Phase 3 | T-07: FULLSTACK_MOCK MergePoints 2개 | 1분 | pending |
| Phase 3 | T-08: GENERIC_MOCK 작성 | 1분 | pending |
| Phase 4 | T-09: getMockPathMap 구현 | 2분 | pending |
| Phase 4 | T-10: route.ts USE_MOCK 체크 추가 | 1분 | pending |
| Phase 5 | T-11: withMockFallback 구현 | 2분 | pending |
| Phase 5 | T-12: route.ts withMockFallback 적용 | 1분 | pending |
| Phase 6 | T-13: 타입 검증 + 최종 확인 | 1분 | pending |
| **합계** | | **20분** | |

---

## 완료 기준 (Done Definition)

모든 Task 완료 후 아래 기준을 모두 만족해야 BE-07이 완료 처리된다:

- [x] `lib/mockData.ts` 파일 생성 완료
- [x] FULLSTACK_MOCK: 3경로(fast/deep/risk) + 2합류점 + startNode + goalNode 완비
- [x] GENERIC_MOCK: 3경로 + 1합류점 + startNode + goalNode 완비
- [x] 모든 경로의 monthsFromNow 단조 증가 확인
- [x] `getMockPathMap` 함수 동작 확인
- [x] `withMockFallback` 함수 동작 확인
- [x] `USE_MOCK=true` 환경변수 전환 동작 확인
- [x] `tsc --noEmit` 컴파일 오류 없음
- [x] spec.md의 모든 AC(Acceptance Criteria) 만족
