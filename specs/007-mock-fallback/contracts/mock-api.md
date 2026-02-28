# BE-07 Mock API - Function Contracts

**Feature ID**: BE-07
**File**: `lib/mockData.ts`
**Depends On**: `lib/types.ts` (PathNode, PathMap, MergePoint, PathInfo)

---

## 1. getMockPathMap

### Signature

```typescript
export function getMockPathMap(goal?: string): PathMap & { _isMock: boolean }
```

### Description

목표 문자열을 기반으로 적절한 Mock PathMap을 반환하는 순수 함수.

- 동기(synchronous) 함수. 비동기 처리 없음.
- 항상 유효한 PathMap을 반환한다. 절대 throw하지 않는다.
- `_isMock: true` 플래그를 응답에 포함한다.

### Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `goal` | `string \| undefined` | No | 사용자 목표 문자열. 키워드 매칭에 사용됨 |

### Returns

```typescript
PathMap & { _isMock: boolean }
```

실제 PathMap 구조에 `_isMock: true`가 추가된 객체.

### Keyword Matching Logic

```
1. goal이 undefined 또는 빈 문자열이면 → DEFAULT_MOCK_KEY ('fullstack') 세트 반환
2. goal.toLowerCase()가 MOCK_KEYWORDS 맵의 키워드를 includes()로 포함하면 → 해당 세트 반환
3. 어떤 키워드도 매칭되지 않으면 → DEFAULT_MOCK_KEY 세트 반환
```

**MOCK_KEYWORDS 맵**:
```typescript
const MOCK_KEYWORDS: Record<string, string[]> = {
  fullstack: ['풀스택', 'fullstack', 'full stack', '개발자', '프로그래밍'],
  generic:   [],  // 기본 폴백 세트, 키워드 매칭 불필요
};
```

### Examples

```typescript
getMockPathMap('풀스택 개발자 되기')
// → FULLSTACK_MOCK with _isMock: true

getMockPathMap('피아노 연주 마스터하기')
// → GENERIC_MOCK with _isMock: true (키워드 매칭 실패 → 기본 세트)

getMockPathMap()
// → FULLSTACK_MOCK with _isMock: true (undefined → DEFAULT_MOCK_KEY)

getMockPathMap('')
// → FULLSTACK_MOCK with _isMock: true (빈 문자열 → DEFAULT_MOCK_KEY)

getMockPathMap('나는 fullstack 개발자가 되고 싶어')
// → FULLSTACK_MOCK with _isMock: true ('fullstack' 키워드 매칭)
```

### Error Behavior

이 함수는 어떤 상황에서도 throw하지 않는다. 예외가 발생할 수 있는 코드 경로가 존재하지 않는다.

### Implementation Reference

```typescript
export function getMockPathMap(goal?: string): PathMap & { _isMock: boolean } {
  const normalizedGoal = goal?.toLowerCase() ?? '';

  const matchedKey = Object.entries(MOCK_KEYWORDS).find(([, keywords]) =>
    keywords.some((kw) => normalizedGoal.includes(kw))
  )?.[0] ?? DEFAULT_MOCK_KEY;

  const mockData = MOCK_PATH_MAPS[matchedKey] ?? MOCK_PATH_MAPS[DEFAULT_MOCK_KEY];

  return { ...mockData, _isMock: true };
}
```

---

## 2. withMockFallback

### Signature

```typescript
export async function withMockFallback<T extends PathMap>(
  fn: () => Promise<T>,
  goal?: string
): Promise<T & { _isMock?: boolean }>
```

### Description

비동기 함수 `fn`을 실행하고, 실패 시 Mock 데이터로 폴백하는 고차 함수.

- `fn` 성공 시: `fn`의 반환값을 그대로 반환 (`_isMock` 없음)
- `fn` 실패 시: `getMockPathMap(goal)` 결과 반환 (`_isMock: true` 포함)
- 폴백 발생 시 서버 콘솔에 경고 로그 출력

### Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `fn` | `() => Promise<T>` | Yes | 실행할 비동기 함수 (보통 Gemini API 호출) |
| `goal` | `string \| undefined` | No | 폴백 시 getMockPathMap에 전달할 목표 문자열 |

### Returns

```typescript
Promise<T & { _isMock?: boolean }>
```

- 성공 시: `T` (원본 반환값, `_isMock` 없음)
- 실패 시: `PathMap & { _isMock: true }`

### Side Effects

**폴백 발생 시 콘솔 경고**:
```
[MockFallback] Gemini API 호출 실패, Mock 데이터로 폴백합니다.
목표: "풀스택 개발자 되기"
원인: Error: Gemini API rate limit exceeded
```

### Examples

```typescript
// 성공 케이스
const result = await withMockFallback(
  () => callGeminiForPathMap('풀스택 개발자 되기'),
  '풀스택 개발자 되기'
);
// → Gemini 응답 PathMap (정상 반환, _isMock 없음)

// 실패 케이스 (Gemini 예외)
const result = await withMockFallback(
  () => { throw new Error('API Error'); },
  '풀스택 개발자 되기'
);
// → FULLSTACK_MOCK with _isMock: true
// 콘솔: [MockFallback] ...

// 목표 미지정 폴백
const result = await withMockFallback(
  () => Promise.reject(new Error('timeout')),
);
// → FULLSTACK_MOCK with _isMock: true (goal=undefined → default)
```

### Implementation Reference

```typescript
export async function withMockFallback<T extends PathMap>(
  fn: () => Promise<T>,
  goal?: string
): Promise<T & { _isMock?: boolean }> {
  try {
    return await fn();
  } catch (error) {
    console.warn(
      `[MockFallback] Gemini API 호출 실패, Mock 데이터로 폴백합니다.\n` +
      `목표: "${goal ?? 'unknown'}"\n` +
      `원인:`, error
    );
    return getMockPathMap(goal);
  }
}
```

---

## 3. MOCK_PATH_MAPS

### Type

```typescript
export const MOCK_PATH_MAPS: Record<string, PathMap>
```

### Description

사용 가능한 모든 Mock PathMap을 키로 조회할 수 있는 Record 객체.

| 키 | 값 | 설명 |
|---|---|------|
| `'fullstack'` | `FULLSTACK_MOCK` | "풀스택 개발자 되기" Mock 데이터 |
| `'generic'` | `GENERIC_MOCK` | 범용 목표 Mock 데이터 (백업) |

### Export

```typescript
export const MOCK_PATH_MAPS = {
  fullstack: FULLSTACK_MOCK,
  generic: GENERIC_MOCK,
} satisfies Record<string, PathMap>;
```

---

## 4. DEFAULT_MOCK_KEY

### Type

```typescript
export const DEFAULT_MOCK_KEY: string
```

### Value

```typescript
export const DEFAULT_MOCK_KEY = 'fullstack';
```

### Description

`getMockPathMap` 함수에서 키워드 매칭이 실패했을 때 사용하는 기본 Mock 세트 키.

---

## 5. USE_MOCK 환경변수 통합

`lib/mockData.ts` 자체는 환경변수를 읽지 않는다. 환경변수 체크는 `app/api/paths/simulate/route.ts`에서 담당한다.

### Route Handler 통합 예시

```typescript
// app/api/paths/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMockPathMap, withMockFallback } from '@/lib/mockData';
import { callGeminiForPathMap } from '@/lib/geminiClient';

export async function POST(req: NextRequest) {
  const { goal } = await req.json();

  // USE_MOCK 즉시 전환 (US-02)
  if (process.env.USE_MOCK === 'true') {
    return NextResponse.json(getMockPathMap(goal));
  }

  // 자동 폴백 (US-03)
  const pathMap = await withMockFallback(
    () => callGeminiForPathMap(goal),
    goal
  );

  return NextResponse.json(pathMap);
}
```

---

## 6. _isMock 플래그 처리

`_isMock` 플래그는 디버깅 전용이며, 프로덕션 환경에서는 응답에서 제거해야 한다.

### 권장 처리 방식 (Route Handler)

```typescript
// _isMock 제거 (프로덕션)
const { _isMock, ...cleanPathMap } = pathMap;
const responseData = process.env.NODE_ENV === 'production'
  ? cleanPathMap
  : pathMap;  // 개발/테스트 환경에서는 _isMock 포함

return NextResponse.json(responseData);
```

---

## 7. Type Definitions (참조)

```typescript
// lib/mockData.ts에 필요한 타입들 (lib/types.ts에서 import)
import type { PathMap, PathNode, MergePoint, PathInfo } from '@/lib/types';

// mockData.ts 내부 타입
type MockResponse = PathMap & { _isMock: boolean };
type MockKeywords = Record<string, string[]>;
```
