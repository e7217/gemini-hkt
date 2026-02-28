# BE-07 Mock 데이터 + 폴백 시스템 - Implementation Plan

**Feature ID**: BE-07
**Phase**: Phase 1
**Estimated Time**: 20분
**Constitution Reference**: YAGNI+SOLID, TypeScript no-any, Fail-Safe, max 20 line functions

---

## 1. Technical Context

### 의존 관계

```
BE-02 (공유 타입 정의)
  └─ lib/types.ts (PathNode, PathMap, MergePoint, PathInfo)
       └─ BE-07 lib/mockData.ts (이 파일)
            └─ BE-06 app/api/paths/simulate/route.ts (참조)
```

### 환경변수

| 변수명 | 타입 | 기본값 | 용도 |
|--------|------|--------|------|
| `USE_MOCK` | `'true' \| undefined` | undefined | Mock 즉시 반환 전환 |
| `NODE_ENV` | `'development' \| 'production' \| 'test'` | - | `_isMock` 플래그 노출 여부 |

---

## 2. Constitution Check

### YAGNI

- Mock 세트는 2개만 생성 (풀스택 + 범용). 3개 이상은 오버엔지니어링.
- `_isMock` 플래그는 응답 객체에만 포함. 별도 로깅 인프라 불필요.
- 키워드 매칭은 단순 `includes()` 검사로 충분. 정교한 NLP 매칭 불필요.

### SOLID

- **Single Responsibility**: `getMockPathMap`은 Mock 선택만, `withMockFallback`은 폴백 래핑만.
- **Open/Closed**: 새 Mock 세트 추가 시 `MOCK_PATH_MAPS` 객체에 항목만 추가 (기존 코드 수정 없음).
- **Dependency Inversion**: `withMockFallback`은 구체적인 API 함수가 아닌 `() => Promise<T>` 콜백을 받는다.

### TypeScript no-any

- `PathMap` 타입을 `as const` 대신 명시적 타입 annotation으로 검증.
- `withMockFallback<T extends PathMap>`으로 제네릭 타입 안전성 확보.
- `_isMock` 플래그는 `MockResponse = PathMap & { _isMock: boolean }` 인터섹션 타입으로 표현.

### Fail-Safe

- `withMockFallback`이 Mock 반환 중에도 예외를 throw하면 안 됨.
- getMockPathMap 내부에서 예외가 발생할 수 없도록 Pure Function으로 구현.

### Max 20 Line Functions

- `getMockPathMap`: ~15줄 (키워드 매칭 + 반환)
- `withMockFallback`: ~10줄 (try-catch + 로깅 + 반환)
- Mock 데이터 객체 자체는 상수 선언이므로 함수 길이 제한 미적용

### Max 2 Nesting Depth

- `withMockFallback` 내부: try-catch (depth 1) + if 조건 (depth 2). 준수.
- getMockPathMap 내부: for-of 없이 Object.entries + find (flat 구조).

---

## 3. Project Structure

```
lib/
├── types.ts              ← BE-02 정의 (수정 없음)
├── mockData.ts           ← BE-07 신규 생성
│   ├── FULLSTACK_MOCK     (const: PathMap)
│   ├── GENERIC_MOCK       (const: PathMap)
│   ├── MOCK_PATH_MAPS     (const: Record<string, PathMap>)
│   ├── DEFAULT_MOCK_KEY   (const: string)
│   ├── getMockPathMap()   (export function)
│   └── withMockFallback() (export async function)
└── geminiClient.ts       ← BE-04 정의 (수정 없음)

app/api/paths/simulate/
└── route.ts              ← BE-06 정의, USE_MOCK 체크 로직 추가
```

---

## 4. Integration Point: simulate route.ts

`lib/mockData.ts` 완성 후 `app/api/paths/simulate/route.ts`에 아래 변경사항 적용:

**변경 전 (BE-06 완료 상태)**:
```typescript
export async function POST(req: Request) {
  const { goal } = await req.json();
  const pathMap = await callGeminiForPathMap(goal);
  return NextResponse.json(pathMap);
}
```

**변경 후 (BE-07 적용)**:
```typescript
import { getMockPathMap, withMockFallback } from '@/lib/mockData';

export async function POST(req: Request) {
  const { goal } = await req.json();

  if (process.env.USE_MOCK === 'true') {
    return NextResponse.json(getMockPathMap(goal));
  }

  const pathMap = await withMockFallback(
    () => callGeminiForPathMap(goal),
    goal
  );
  return NextResponse.json(pathMap);
}
```

---

## 5. Implementation Sequence

```
Step 1: types.ts 확인 (PathMap, PathNode 등 타입 존재 확인)
  ↓
Step 2: FULLSTACK_MOCK 데이터 작성 (lib/mockData.ts 생성)
  ↓
Step 3: GENERIC_MOCK 데이터 작성 (동일 파일)
  ↓
Step 4: getMockPathMap 함수 구현
  ↓
Step 5: withMockFallback 함수 구현
  ↓
Step 6: simulate/route.ts에 USE_MOCK 체크 + withMockFallback 적용
  ↓
Step 7: tsc --noEmit으로 타입 검증
  ↓
Step 8: .env.local에 USE_MOCK=true 설정 후 수동 테스트
```

---

## 6. Risk Assessment

| 리스크 | 가능성 | 영향 | 대응 |
|--------|--------|------|------|
| BE-02 타입 정의 누락 | 낮음 | 높음 | 구현 전 types.ts 확인 필수 |
| monthsFromNow 분포 오류 | 중간 | 낮음 | 데이터 작성 시 순서 검토 |
| `_isMock` 타입 충돌 | 낮음 | 중간 | 인터섹션 타입 사용으로 해결 |
| BE-06 미완성 시 통합 불가 | 낮음 | 높음 | lib/mockData.ts 독립적으로 작성 가능 |

---

## 7. Testing Strategy

### 수동 테스트

1. `.env.local`에 `USE_MOCK=true` 추가
2. `curl -X POST /api/paths/simulate -d '{"goal":"풀스택 개발자 되기"}'`
3. 응답의 `_isMock: true` 및 3경로 + 합류점 구조 확인

### 타입 검증

```bash
npx tsc --noEmit
```

### 폴백 테스트

`lib/geminiClient.ts`의 `callGeminiForPathMap`를 일시적으로 `throw new Error('test')`로 변경 후 API 호출 시 Mock 응답 반환 확인.
