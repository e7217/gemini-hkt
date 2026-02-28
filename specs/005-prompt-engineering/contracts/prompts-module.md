# Contract: lib/prompts.ts Module API

**Feature**: 001-prompt-engineering (BE-05)
**Date**: 2026-02-27
**Type**: TypeScript Module Export Contract
**Consumer**: BE-06 경로 시뮬레이션 API (`app/api/paths/simulate/route.ts`)

## Module Exports

### `PROMPT_VERSION`

```typescript
export const PROMPT_VERSION: string;
// Example: "1.0.0"
```

**Purpose**: 현재 프롬프트 버전. API 응답에 포함하거나 로깅에 활용.
**Contract**: 시맨틱 버전 형식 ("major.minor.patch"). 변경 시 파일 상단 changelog 업데이트 필수.

---

### `SYSTEM_INSTRUCTION`

```typescript
export const SYSTEM_INSTRUCTION: string;
```

**Purpose**: Gemini API 호출 시 `systemInstruction.parts[0].text`로 전달되는 영어 지시문.
**Contract**:
- 항상 영어로 작성
- 인생 경로 시뮬레이터 역할 정의 포함
- JSON 전용 출력 지시 포함
- 합류점 생성 규칙 포함
- 경로 유형(fast/deep/explorer) 및 노드 수 규칙 포함
- `monthsFromNow` 단조 증가 규칙 포함

**Usage by Consumer**:
```typescript
import { SYSTEM_INSTRUCTION } from '@/lib/prompts';

const result = await geminiModel.generateContent({
  systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
});
```

---

### `buildUserPrompt(goal, timeframe)`

```typescript
export function buildUserPrompt(
  goal: string,
  timeframe: "1y" | "3y" | "5y"
): string;
```

**Purpose**: 목표와 타임프레임을 받아 Gemini User Prompt 문자열을 생성한다.
**Parameters**:
- `goal`: 한국어 목표 텍스트 (예: "풀스택 개발자 되기")
- `timeframe`: 타임프레임 선택 ("1y", "3y", "5y")

**Returns**: Gemini contents[0].parts[0].text로 전달할 프롬프트 문자열

**Contract**:
- 반환된 프롬프트에는 "반드시 한국어로 응답하세요" 지시 포함
- 타임프레임에 해당하는 monthsFromNow 범위 지시 포함
- Few-shot 예시 1개 포함 (합류점 구조 시연)
- 빈 goal에 대한 동작: 구현에서 처리 (BE-06 범위)

**Usage by Consumer**:
```typescript
import { buildUserPrompt } from '@/lib/prompts';

const userPrompt = buildUserPrompt("풀스택 개발자 되기", "3y");
const result = await geminiModel.generateContent({
  systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  generationConfig: { responseMimeType: "application/json" },
});
```

---

### `PATH_MAP_SCHEMA`

```typescript
export const PATH_MAP_SCHEMA: object;
```

**Purpose**: Gemini `generationConfig.responseSchema`로 전달 가능한 JSON Schema 객체.
**Contract**:
- PathMap TypeScript 인터페이스와 1:1 대응
- `paths` 배열: minItems 3, maxItems 3
- `mergePoints` 배열: minItems 1
- `difficulty` 필드: enum ["Low", "Medium", "High"]
- `paths[].id` 필드: enum ["fast", "deep", "explorer"]

**Usage by Consumer**:
```typescript
import { PATH_MAP_SCHEMA } from '@/lib/prompts';

const result = await geminiModel.generateContent({
  // ...
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: PATH_MAP_SCHEMA,
  },
});
```

---

### `TIMEFRAME_MONTHS`

```typescript
export const TIMEFRAME_MONTHS: Record<"1y" | "3y" | "5y", number>;
// { "1y": 12, "3y": 36, "5y": 60 }
```

**Purpose**: 타임프레임 문자열을 개월 수로 변환하는 매핑 상수.
**Contract**: 불변(immutable) 상수. 값 변경 시 PROMPT_VERSION 패치 업데이트 필요.

## Error Cases (Not handled by this module)

| Scenario | Responsibility |
|----------|---------------|
| Gemini API 호출 실패 | BE-04 (Gemini SDK 래퍼) |
| 응답 JSON 파싱 실패 | BE-06 (시뮬레이션 API) |
| PathMap 스키마 검증 실패 | BE-06 (Zod 검증) |
| 빈 goal 문자열 | BE-06 (입력 검증) |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-27 | Initial version. System Instruction, buildUserPrompt, PATH_MAP_SCHEMA, TIMEFRAME_MONTHS. |
