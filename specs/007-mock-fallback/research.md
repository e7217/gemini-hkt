# BE-07 Mock 데이터 + 폴백 시스템 - Research Notes

**Feature ID**: BE-07
**Research Focus**: 한국어 콘텐츠 설계, monthsFromNow 분포 전략, TypeScript const assertion 패턴

---

## 1. 한국어 콘텐츠 설계 (Korean Content Design)

### 1.1 자연스러운 노드 레이블 원칙

실제 Gemini 응답 수준의 자연스러운 한국어 콘텐츠를 위한 가이드라인:

**레이블 (label) 원칙**:
- 동사 명사화 형태: "HTML/CSS 기초 학습" (O), "HTML 배우기" (X - 너무 단순)
- 구체적 결과물 포함: "포트폴리오 사이트 1차 완성" (O), "포트폴리오 만들기" (X)
- 경로 성격 반영: Fast Track은 "빠른 취업용", Deep Dive는 "체계적", Risk Track은 "도전적"

**설명 (description) 원칙**:
- 2~3문장. 첫 문장: 무엇을 하는가. 둘째 문장: 왜 중요한가. 셋째 문장(선택): 다음 단계와의 연결.
- 격려하는 어조 유지: "...하게 됩니다", "...할 수 있어요"
- 수치 포함 시 신뢰성 향상: "하루 2시간", "30개 이상", "3개 프로젝트"

**팁 (tips) 원칙**:
- 각 노드에 2~3개
- 실행 가능한 구체적 행동 지침
- "...하세요" 보다 "...해보세요" - 권유형 어조

### 1.2 경로별 어조 차이

| 경로 | 어조 | 강조점 | 예시 레이블 |
|------|------|--------|------------|
| Fast Track | 빠르고 실용적 | 결과물, 취업 준비 | "프론트엔드 기초 속성 완성" |
| Deep Dive | 차분하고 깊이 있는 | 이해, 원리, 탄탄함 | "컴퓨터 과학 기초 체계 정립" |
| Risk Track | 도전적이고 자유로운 | 실전, 수익, 독립 | "사이드 프로젝트로 첫 수익 달성" |

### 1.3 합류점 메시지 감성 설계

합류점은 "어떤 길이든 괜찮다"는 핵심 감성 메시지를 전달해야 한다.

**중간 합류점** (monthsFromNow 12~14):
- 세 경로가 처음 만나는 지점
- 메시지 톤: 놀라움, 안도감
- 예시: "속도가 달랐을 뿐, 결국 같은 곳을 향하고 있었네요."

**최종 합류점** (monthsFromNow 18~24):
- 목표 직전 마지막 수렴
- 메시지 톤: 감동, 완성감
- 예시: "빠른 길이든, 깊은 길이든, 모험의 길이든 — 여기서 하나가 됩니다. 당신이 선택한 모든 길은 옳았습니다."

---

## 2. monthsFromNow 분포 전략

### 2.1 분포 원칙

**Fast Track**: 12개월 내 목표 도달. 노드 간격이 짧고 압축적.
```
monthsFromNow: [1, 3, 6, 9, 12]
설명: 첫 달부터 활동 시작, 분기별 마일스톤, 1년 내 취업
```

**Deep Dive**: 30개월(2.5년)에 걸친 체계적 학습. 초반 밀도 높고 후반 여유.
```
monthsFromNow: [2, 6, 12, 18, 24, 30]
설명: 기초에 2개월 투자, 이후 6개월 단위 진행, 2.5년에 완성
```

**Risk Track**: 18개월. 초반 빠르게 시작하고 중반 집중 기간.
```
monthsFromNow: [1, 4, 8, 14, 18]
설명: 즉시 시작, 4개월 내 첫 수익, 1년 내 안정화
```

### 2.2 단조 증가 검증

각 경로의 nodes 배열에서 `monthsFromNow` 값은 반드시 엄격히 단조 증가(strictly monotonically increasing)해야 한다:

```typescript
// 검증 예시
function validateMonotonicity(nodes: PathNode[]): boolean {
  return nodes.every((node, i) =>
    i === 0 || node.monthsFromNow > nodes[i - 1].monthsFromNow
  );
}
```

### 2.3 합류점 monthsFromNow 선택 기준

합류점의 `monthsFromNow`는 연결된 모든 경로의 노드 중 **해당 시점에 가장 가까운 노드**의 monthsFromNow를 기준으로 설정한다.

**1차 합류점** (Fast 6개월 + Deep 12개월 + Risk 8개월 → 교차점 근처):
- Fast의 monthsFromNow=9와 Deep의 monthsFromNow=12 사이
- 합류점 monthsFromNow = 12 (세 경로가 처음으로 모두 도달하는 최소 시점)

**2차 합류점** (최종 합류):
- Fast의 monthsFromNow=12와 Deep의 monthsFromNow=18 사이
- 합류점 monthsFromNow = 18

---

## 3. TypeScript Const Assertion 패턴

### 3.1 문제: 타입 추론 범위 축소

일반적인 객체 리터럴은 타입이 너무 넓게 추론된다:

```typescript
// Bad: type은 { type: string, track: string, ... }
const node = {
  type: 'start',
  track: 'fast',
};

// 이 경우 type을 PathNode로 할당 불가 (string != 'start' | 'step' | 'merge' | 'goal')
```

### 3.2 해결책 1: 명시적 타입 annotation (권장)

```typescript
const startNode: PathNode = {
  id: 'start',
  type: 'start',       // TypeScript가 'start' 리터럴로 검증
  track: 'fast',       // TypeScript가 'fast' 리터럴로 검증
  label: '현재 위치',
  description: '...',
  monthsFromNow: 0,
};
```

**장점**: 타입 오류를 선언 시점에 즉시 발견. IDE 자동완성 완벽 지원.
**단점**: 객체 전체에 타입을 지정해야 하므로 Mock 데이터 전체 구조 선언 필요.

### 3.3 해결책 2: satisfies 연산자 (TypeScript 4.9+)

```typescript
const FULLSTACK_MOCK = {
  startNode: { ... },
  ...
} satisfies PathMap;
```

**장점**: `as const`처럼 리터럴 타입을 보존하면서 동시에 타입 검증.
**단점**: TypeScript 4.9+ 필요. Next.js 14는 TS 5.x 지원하므로 사용 가능.

### 3.4 권장 패턴: satisfies PathMap

```typescript
// lib/mockData.ts

const FULLSTACK_MOCK = {
  startNode: {
    id: 'start-fullstack',
    type: 'start',
    label: '풀스택 개발자로의 여정 시작',
    description: '...',
    monthsFromNow: 0,
    track: 'fast',  // startNode는 track 무관, 편의상 fast
  },
  // ...
} satisfies PathMap;
```

### 3.5 MOCK_PATH_MAPS Record 타입

```typescript
export const MOCK_PATH_MAPS = {
  fullstack: FULLSTACK_MOCK,
  generic: GENERIC_MOCK,
} satisfies Record<string, PathMap>;
```

이 패턴으로 `Object.keys(MOCK_PATH_MAPS)`가 `string[]`로 추론되어 키워드 매칭 로직이 타입 안전하게 동작한다.

### 3.6 MockResponse 타입 인터섹션

```typescript
// _isMock 플래그를 PathMap에 추가하는 타입
type MockResponse = PathMap & { _isMock: boolean };

// 반환 시
return { ...pathMap, _isMock: true } satisfies MockResponse;
```

---

## 4. 폴백 패턴 설계 연구

### 4.1 try-catch 래퍼 패턴

```typescript
// 일반적인 패턴
async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn('[Fallback]', error);
    return fallback;
  }
}
```

### 4.2 Next.js App Router에서의 주의사항

- `NextResponse.json()`은 서버 컴포넌트/Route Handler에서만 사용 가능
- `withMockFallback`은 순수 비즈니스 로직으로 분리 (NextResponse 미포함)
- Route Handler에서 `withMockFallback` 결과를 `NextResponse.json()`으로 감쌈

### 4.3 로깅 전략

```typescript
// 개발 환경에서만 상세 로그
const isDev = process.env.NODE_ENV === 'development';

console.warn(
  `[MockFallback] Gemini API 실패, Mock 데이터 반환. 목표: "${goal ?? 'unknown'}"`,
  isDev ? error : (error instanceof Error ? error.message : 'Unknown error')
);
```

---

## 5. 참조 자료

- TypeScript Handbook - `satisfies` operator: https://www.typescriptlang.org/docs/handbook/2/satisfies.html
- Next.js 14 Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- 해커톤 데모 전략: `/docs/05-demo-strategy.md` - "Plan B: 사전 캐싱 데이터"
- PathMap 타입 정의: `/docs/04-backend-spec.md` - "응답 JSON 구조" 섹션
- BE-06 spec: `/specs/001-simulate-api/` - 연동 구조 참조
