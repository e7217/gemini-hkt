# BE-07 Mock 데이터 + 폴백 시스템 - Feature Specification

**Feature ID**: BE-07
**Phase**: Phase 1 (데모 안전장치)
**Priority**: P0 - 데모 안정성 핵심
**Estimated Time**: 20m
**Difficulty**: Medium
**Dependencies**: BE-02 (공유 TypeScript 타입 정의), BE-06 (simulate API)

---

## 1. Overview

LifePath 데모의 핵심 안전장치. Gemini API 호출이 실패하거나 느릴 때 사전 준비된 고품질 Mock 데이터를 즉시 반환하여 데모가 중단되지 않도록 보장한다.

**핵심 가치**: API 장애 여부와 무관하게 "풀스택 개발자 되기" 데모 시나리오를 항상 완주할 수 있어야 한다.

---

## 2. User Stories

### US-01 (P1): 데모 메인 시나리오 Mock 데이터

**As a** 데모 발표자
**I want** "풀스택 개발자 되기" 목표에 대한 완전한 PathMap이 Mock으로 항상 준비되어 있기를
**So that** API 장애 시에도 3경로(Fast/Deep/Risk) + 합류점을 포함한 완전한 데모를 진행할 수 있다

**Acceptance Criteria**:
- AC-01-1: `FULLSTACK_MOCK` PathMap은 startNode, goalNode, paths(3개), mergePoints(1~2개)를 모두 포함한다
- AC-01-2: Fast Track은 monthsFromNow 기준 1, 3, 6, 9, 12 분포의 4~5개 노드를 포함한다
- AC-01-3: Deep Dive는 monthsFromNow 기준 2, 6, 12, 18, 24, 30 분포의 5~6개 노드를 포함한다
- AC-01-4: Risk Track은 monthsFromNow 기준 1, 4, 8, 14, 18 분포의 4~5개 노드를 포함한다
- AC-01-5: 모든 노드의 monthsFromNow 값은 각 경로 내에서 단조 증가한다
- AC-01-6: 모든 텍스트 콘텐츠는 자연스러운 한국어로 작성된다
- AC-01-7: Mock 데이터는 PathMap TypeScript 타입과 완전히 일치하며 Zod 검증을 통과한다
- AC-01-8: 합류점의 connectedPaths 배열이 실제 존재하는 path ID와 정확히 매칭된다

### US-02 (P1): USE_MOCK 환경변수 즉시 전환

**As a** 개발자/데모 발표자
**I want** `USE_MOCK=true` 환경변수 설정만으로 Mock 데이터로 즉시 전환할 수 있기를
**So that** 데모 전 네트워크 상태와 무관하게 안정적인 데모 환경을 보장할 수 있다

**Acceptance Criteria**:
- AC-02-1: `process.env.USE_MOCK === 'true'`일 때 Gemini API 호출 없이 즉시 Mock 데이터를 반환한다
- AC-02-2: Mock 반환 시 `_isMock: true` 플래그가 응답에 포함된다
- AC-02-3: `USE_MOCK`이 설정되지 않거나 `false`일 때는 정상적으로 Gemini API를 호출한다
- AC-02-4: Mock 전환 시 응답 형태는 실제 API 응답과 동일하다 (타입 호환)

### US-03 (P1): API 실패 시 자동 폴백

**As a** 시스템
**I want** Gemini API 호출이나 Zod 검증이 실패할 때 자동으로 Mock 데이터를 폴백으로 반환하기를
**So that** 사용자가 오류 화면을 보지 않고 항상 완전한 PathMap을 받을 수 있다

**Acceptance Criteria**:
- AC-03-1: Gemini API 호출이 예외를 throw할 때 Mock 데이터로 자동 폴백한다
- AC-03-2: Zod 검증 실패 후 재시도도 실패할 경우 Mock 데이터로 폴백한다
- AC-03-3: 폴백 발생 시 서버 콘솔에 `[MockFallback]` 접두사와 함께 실패 원인을 로깅한다
- AC-03-4: 폴백 응답에 `_isMock: true` 플래그가 포함된다
- AC-03-5: 폴백은 목표 문자열을 기준으로 가장 유사한 Mock 세트를 선택한다 (없으면 기본 세트)

---

## 3. Functional Requirements

### FR-001: Mock 데이터 파일 구조

Mock 데이터는 `lib/mockData.ts` 단일 파일에 TypeScript const assertion으로 정의된다.

```typescript
// lib/mockData.ts
export const MOCK_PATH_MAPS: Record<string, PathMap> = {
  fullstack: FULLSTACK_MOCK,
  generic: GENERIC_MOCK,
} as const;

export const DEFAULT_MOCK_KEY = 'fullstack';
```

### FR-002: 풀스택 개발자 Mock 데이터 세트

- **목표**: "풀스택 개발자 되기"
- **3경로**: Fast Track (빠른 취업), Deep Dive (체계적 학습), Risk Track (프리랜서 도전)
- **노드 수**: Fast 5개, Deep 6개, Risk 5개
- **합류점**: 2개 (중간 합류, 최종 합류)
- **시간 분포**: 각 경로별 명시된 monthsFromNow 분포 준수

### FR-003: 범용 목표 Mock 데이터 세트 (백업)

- **목표**: "나만의 목표 달성하기"
- **3경로**: 동일한 구조, 일반적인 자기계발 컨텐츠
- **용도**: 알 수 없는 목표에 대한 기본 폴백

### FR-004: getMockPathMap 함수

```typescript
export function getMockPathMap(goal?: string): PathMap & { _isMock: boolean }
```

- `goal` 파라미터로 키워드 매칭을 시도한다
- 매칭 실패 시 `DEFAULT_MOCK_KEY` 세트를 반환한다
- 항상 `_isMock: true`를 포함한다

### FR-005: withMockFallback 래퍼 함수

```typescript
export async function withMockFallback<T extends PathMap>(
  fn: () => Promise<T>,
  goal?: string
): Promise<T & { _isMock?: boolean }>
```

- `fn` 실행 성공 시 결과를 그대로 반환한다
- `fn` 실행 실패(예외) 시 Mock 폴백을 반환한다
- 실패 원인을 `[MockFallback]` 로그로 출력한다

### FR-006: 환경변수 기반 즉시 전환

simulate API route handler에서 요청 처리 전 `USE_MOCK` 환경변수를 확인한다.

```typescript
if (process.env.USE_MOCK === 'true') {
  return NextResponse.json(getMockPathMap(goal));
}
```

---

## 4. Key Entities

### PathNode

```typescript
interface PathNode {
  id: string;
  type: 'start' | 'step' | 'merge' | 'goal';
  label: string;
  description: string;
  monthsFromNow: number;
  track: 'fast' | 'deep' | 'risk';
  difficulty?: 'low' | 'medium' | 'high';
  tips?: string[];
}
```

### MergePoint

```typescript
interface MergePoint {
  id: string;
  label: string;
  message: string;
  connectedPaths: string[];
  monthsFromNow: number;
}
```

### PathInfo

```typescript
interface PathInfo {
  id: string;
  type: 'fast' | 'deep' | 'risk';
  label: string;
  nodes: PathNode[];
}
```

### PathMap

```typescript
interface PathMap {
  startNode: PathNode;
  goalNode: PathNode;
  paths: PathInfo[];
  mergePoints: MergePoint[];
}
```

### MockResponse

```typescript
type MockResponse = PathMap & { _isMock: boolean };
```

---

## 5. Edge Cases

| Edge Case | 기대 동작 |
|-----------|----------|
| `goal`이 undefined일 때 getMockPathMap 호출 | DEFAULT_MOCK_KEY ('fullstack') 세트 반환 |
| 알 수 없는 목표 키워드 | 부분 문자열 매칭 시도 후 실패 시 기본 세트 반환 |
| `USE_MOCK=true`이고 목표가 "풀스택" 키워드 포함 | fullstack Mock 세트 반환 |
| `USE_MOCK=true`이고 목표가 아무 키워드도 매칭 안 됨 | generic Mock 세트 반환 |
| Gemini 응답이 빈 string일 때 | JSON.parse 실패 → Zod 검증 실패 → Mock 폴백 |
| Gemini 응답이 유효하지 않은 PathMap 구조일 때 | Zod 검증 실패 → Mock 폴백 |
| 네트워크 타임아웃 | fetch 예외 → Mock 폴백 |
| Mock 데이터 자체의 타입 오류 | TypeScript 컴파일 시 감지 (const assertion으로 방지) |

---

## 6. Non-Functional Requirements

- **응답 속도**: Mock 반환은 1ms 이내 (동기적 객체 반환)
- **타입 안전성**: 모든 Mock 데이터는 TypeScript 컴파일 타임에 타입 검증
- **_isMock 플래그**: 프로덕션 빌드에서는 응답에서 제거 (`NODE_ENV === 'production'` 시 omit)
- **파일 크기**: `lib/mockData.ts`는 200줄 이하 유지 (YAGNI 원칙)

---

## 7. Out of Scope

- localStorage 기반 오프라인 캐싱 (아이디어 뱅크 항목, 별도 구현 고려)
- Mock 데이터 3세트 이상 (데모 안전장치로 2세트면 충분)
- Mock 데이터 동적 수정 API
- `_isMock` 플래그의 프론트엔드 UI 표시

---

## 8. Success Criteria

| 기준 | 측정 방법 |
|------|----------|
| "풀스택 개발자 되기" 시나리오 완전성 | 3경로 + 2합류점 + startNode + goalNode 모두 존재 |
| monthsFromNow 단조 증가 | 각 PathInfo.nodes 배열에서 순서대로 값이 증가하는지 확인 |
| TypeScript 타입 완전 일치 | `tsc --noEmit` 오류 없음 |
| USE_MOCK 전환 동작 | `.env.local`에 `USE_MOCK=true` 설정 후 API 응답 확인 |
| 자동 폴백 동작 | Gemini SDK를 throw로 모킹 후 API 호출 시 Mock 응답 반환 확인 |
| 자연스러운 한국어 콘텐츠 | 노드 label/description/tips 검토 |
