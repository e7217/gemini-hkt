# BE-07 Mock 데이터 + 폴백 시스템 - Developer Quickstart

**Feature ID**: BE-07
**대상**: LifePath 개발자, 데모 발표자

---

## 1. Mock 모드 활성화 (데모 준비)

### 즉시 전환 방법 (USE_MOCK=true)

```bash
# .env.local 파일에 추가
echo "USE_MOCK=true" >> .env.local

# 또는 직접 편집
# .env.local
USE_MOCK=true
```

서버 재시작 후 모든 `/api/paths/simulate` 요청이 Mock 데이터를 즉시 반환한다.

```bash
# 서버 재시작
npm run dev
```

### 확인 방법

```bash
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "풀스택 개발자 되기"}'
```

응답에 `"_isMock": true` 필드가 포함되면 Mock 모드가 활성화된 것이다.

```json
{
  "_isMock": true,
  "startNode": { "id": "fs-start", ... },
  "goalNode": { ... },
  "paths": [ ... ],
  "mergePoints": [ ... ]
}
```

### Mock 모드 비활성화

```bash
# .env.local에서 제거하거나 false로 변경
USE_MOCK=false
# 또는 줄 자체를 삭제
```

---

## 2. Mock 데이터 세트 확인

### 사용 가능한 세트

| 키 | 목표 | 트리거 키워드 |
|----|------|-------------|
| `fullstack` | 풀스택 개발자 되기 | 풀스택, fullstack, 개발자, 프로그래밍 |
| `generic` | 나만의 목표 달성하기 | (매칭 실패 시 자동 선택) |

### 특정 세트 강제 사용

환경변수 외에 코드에서 직접 선택할 수도 있다:

```typescript
import { getMockPathMap, MOCK_PATH_MAPS } from '@/lib/mockData';

// 특정 세트 직접 조회
const fullstackMock = MOCK_PATH_MAPS['fullstack'];
const genericMock = MOCK_PATH_MAPS['generic'];

// 키워드 매칭으로 자동 선택
const mock = getMockPathMap('풀스택 개발자 되기');  // → fullstack 세트
const mock2 = getMockPathMap('피아노 연주 마스터');  // → generic 세트 (키워드 없음)
```

---

## 3. 새 Mock 데이터 세트 추가

새로운 Mock 세트가 필요할 때 (예: "영어 마스터하기" 데모 준비) 아래 절차를 따른다.

### Step 1: 새 Mock 데이터 상수 작성

`lib/mockData.ts` 파일에 새 상수를 추가한다:

```typescript
// lib/mockData.ts에 추가

const ENGLISH_MOCK = {
  startNode: {
    id: 'eng-start',
    type: 'start' as const,
    label: '영어 학습 여정 시작',
    description: '영어는 하나의 언어가 아닌, 새로운 세계로의 문입니다.',
    monthsFromNow: 0,
    track: 'fast' as const,
    difficulty: 'low' as const,
    tips: ['매일 30분 영어 노출을 습관화하세요', '좋아하는 콘텐츠로 시작하세요'],
  },
  goalNode: {
    id: 'eng-goal',
    type: 'goal' as const,
    label: '비즈니스 영어 유창자',
    description: '24개월의 꾸준한 학습 끝에 자신감 있게 영어로 소통할 수 있게 되었습니다.',
    monthsFromNow: 24,
    track: 'deep' as const,
    difficulty: 'high' as const,
    tips: ['영어로 일기를 써보세요', '원어민과의 대화를 즐기세요'],
  },
  paths: [
    {
      id: 'fast',
      type: 'fast' as const,
      label: '집중 속성 코스',
      nodes: [
        // ... 4~5개 노드, monthsFromNow 단조 증가
      ],
    },
    {
      id: 'deep',
      type: 'deep' as const,
      label: '체계적 영어 학습',
      nodes: [
        // ... 5~6개 노드
      ],
    },
    {
      id: 'risk',
      type: 'risk' as const,
      label: '완전 몰입 챌린지',
      nodes: [
        // ... 4~5개 노드
      ],
    },
  ],
  mergePoints: [
    {
      id: 'eng-merge-1',
      label: '모든 길에서 영어가 열립니다',
      message: '어떤 방법으로 배우든, 결국 영어는 열립니다. 여기서 만나게 될 줄 알았어요.',
      connectedPaths: ['fast', 'deep', 'risk'],
      monthsFromNow: 12,
    },
  ],
} satisfies PathMap;
```

### Step 2: MOCK_PATH_MAPS에 등록

```typescript
// lib/mockData.ts - MOCK_PATH_MAPS 수정
export const MOCK_PATH_MAPS = {
  fullstack: FULLSTACK_MOCK,
  generic: GENERIC_MOCK,
  english: ENGLISH_MOCK,  // ← 추가
} satisfies Record<string, PathMap>;
```

### Step 3: 키워드 매칭 등록

```typescript
// lib/mockData.ts - MOCK_KEYWORDS 수정
const MOCK_KEYWORDS: Record<string, string[]> = {
  fullstack: ['풀스택', 'fullstack', 'full stack', '개발자', '프로그래밍'],
  english: ['영어', 'english', '토익', '토플', '영어 회화'],  // ← 추가
  generic:  [],
};
```

### Step 4: 타입 검증

```bash
npx tsc --noEmit
```

오류 없으면 완료.

### Step 5: 수동 테스트

```bash
curl -X POST http://localhost:3000/api/paths/simulate \
  -H "Content-Type: application/json" \
  -d '{"goal": "영어 마스터하기"}'
```

응답이 `english` 세트 데이터인지 확인.

---

## 4. 자동 폴백 동작 확인

Gemini API가 실제로 실패하는 상황을 시뮬레이션하여 폴백 동작을 확인한다.

### 방법 1: 환경변수에서 API 키 제거

```bash
# .env.local에서 GOOGLE_GENERATIVE_AI_API_KEY를 잘못된 값으로 변경
GOOGLE_GENERATIVE_AI_API_KEY=invalid_key_for_testing
```

API 호출 시 인증 오류 → 폴백 발생.

### 방법 2: 코드에서 임시 테스트

`lib/geminiClient.ts`에서 임시로 예외를 throw한 후 테스트:

```typescript
// 임시 테스트용 (커밋하지 말 것)
export async function callGeminiForPathMap(goal: string): Promise<PathMap> {
  throw new Error('[TEST] 강제 폴백 테스트');
}
```

API 호출 시 콘솔에서 아래 로그 확인:
```
[MockFallback] Gemini API 호출 실패, Mock 데이터로 폴백합니다.
목표: "풀스택 개발자 되기"
원인: Error: [TEST] 강제 폴백 테스트
```

응답에 `"_isMock": true` 포함 확인.

---

## 5. 데모 당일 체크리스트

```
□ .env.local에 USE_MOCK=true 설정 완료
□ npm run dev 서버 정상 실행 확인
□ curl 테스트로 Mock 응답 확인
□ 브라우저에서 "풀스택 개발자 되기" 시나리오 1회 완주 확인
□ 응답 JSON에 3경로 + 합류점 포함 확인
□ .env.local 백업 (USB/메모에 USE_MOCK=true 기록)
```

---

## 6. 트러블슈팅

### 문제: USE_MOCK=true인데 Mock이 반환되지 않는다

1. 서버를 재시작했는지 확인 (`npm run dev` 재실행)
2. `.env.local` 파일 위치가 프로젝트 루트인지 확인 (`/` 위치에 있어야 함)
3. 환경변수 값에 따옴표가 없는지 확인: `USE_MOCK=true` (O), `USE_MOCK="true"` (X)

### 문제: TypeScript 타입 오류 발생

Mock 데이터 수정 후 타입 오류가 발생하면:

```bash
# 타입 오류 확인
npx tsc --noEmit

# 주로 발생하는 오류:
# - 'string' is not assignable to type 'fast' | 'deep' | 'risk'
#   → as const 추가 또는 satisfies PathMap 사용 확인

# - Property 'XXX' is missing
#   → PathNode, MergePoint 필수 필드 누락 확인
```

### 문제: _isMock이 응답에 없다

`getMockPathMap` 결과를 사용했는지 확인. 직접 `MOCK_PATH_MAPS['fullstack']`을 반환하면 `_isMock`이 없다.

```typescript
// Wrong
return NextResponse.json(MOCK_PATH_MAPS['fullstack']);

// Correct
return NextResponse.json(getMockPathMap(goal));
```

### 문제: mergePoints.connectedPaths 매칭 오류

`connectedPaths` 배열의 값이 `paths` 배열의 `id`와 정확히 일치해야 한다:

```typescript
// paths의 id: 'fast', 'deep', 'risk'
// mergePoints의 connectedPaths: ['fast', 'deep', 'risk'] (동일해야 함)
```
