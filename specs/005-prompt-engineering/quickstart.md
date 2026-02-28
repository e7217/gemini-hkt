# Quickstart: BE-05 프롬프트 엔지니어링

**Feature**: 001-prompt-engineering
**Date**: 2026-02-27

## Prerequisites

Before implementing BE-05, confirm the following are complete:
- [ ] BE-02: 공유 TypeScript 타입 정의 (`PathMap`, `PathNode`, `MergePoint`, `Path` 인터페이스 존재)
- [ ] BE-04: Gemini SDK 세팅 (`@google/generative-ai` 설치, Gemini 클라이언트 초기화 유틸 존재)

## Implementation Target

**File**: `lib/prompts.ts`
**Estimated Time**: 25분
**Difficulty**: 높음 (프롬프트 품질이 서비스 전체 품질을 결정)

## Step 1: 파일 구조 생성

```typescript
// lib/prompts.ts

/**
 * @module prompts
 * @description LifePath Gemini 프롬프트 엔지니어링 모듈
 * @version 1.0.0
 * @changelog
 * - 1.0.0 (2026-02-27): Initial version.
 */

// ─── Version ──────────────────────────────────────────────────────────────
export const PROMPT_VERSION = "1.0.0";

// ─── Timeframe Mapping ────────────────────────────────────────────────────
export const TIMEFRAME_MONTHS: Record<"1y" | "3y" | "5y", number> = {
  "1y": 12,
  "3y": 36,
  "5y": 60,
};

// ─── System Instruction (English) ─────────────────────────────────────────
export const SYSTEM_INSTRUCTION = `...`;  // See Step 2

// ─── JSON Schema ──────────────────────────────────────────────────────────
export const PATH_MAP_SCHEMA = {...};  // See Step 3

// ─── User Prompt Builder ──────────────────────────────────────────────────
export function buildUserPrompt(goal: string, timeframe: "1y" | "3y" | "5y"): string {
  // See Step 4
}
```

## Step 2: System Instruction 작성 (영어)

System Instruction에 포함해야 할 내용:
1. **역할 정의**: "You are a life path simulator..."
2. **경로 유형 정의**: fast (4-5 nodes), deep (5-6 nodes), explorer (4-5 nodes)
3. **JSON 전용 출력**: "Respond ONLY with valid JSON. No markdown, no explanation."
4. **합류점 규칙**: 최소 1-2개, isMergePoint: true, connectedPaths 필수
5. **monthsFromNow 규칙**: monotonically increasing within each path
6. **언어 규칙**: All content fields MUST be in Korean

## Step 3: JSON Schema 정의

`PATH_MAP_SCHEMA`는 Gemini의 `responseSchema` 형식을 따른다:
- `paths`: minItems 3, maxItems 3
- `paths[].id`: enum ["fast", "deep", "explorer"]
- `mergePoints`: minItems 1
- `difficulty`: enum ["Low", "Medium", "High"]
- `monthsFromNow`: number, minimum 0

참조: `specs/001-prompt-engineering/data-model.md` - Gemini Response JSON Schema 섹션

## Step 4: User Prompt Builder 구현

`buildUserPrompt(goal, timeframe)` 함수 구현 포인트:
1. `TIMEFRAME_MONTHS[timeframe]`으로 개월 수 계산
2. "반드시 한국어로 응답하세요" 명시
3. `monthsFromNow` 범위 지시 (0 ~ maxMonths)
4. Few-shot 예시 1개 포함 (합류점 구조 필수)
5. 실제 요청(goal + timeframe) 구분하여 마지막에 배치

## Step 5: 검증

구현 완료 후 다음을 확인:
```typescript
// 빠른 검증 스크립트 (scripts/test-prompt.ts)
import { SYSTEM_INSTRUCTION, buildUserPrompt, PROMPT_VERSION } from '../lib/prompts';

console.log('Version:', PROMPT_VERSION);
console.log('System Instruction length:', SYSTEM_INSTRUCTION.length);
console.log('User Prompt (goal=풀스택 개발자 되기, 3y):');
console.log(buildUserPrompt("풀스택 개발자 되기", "3y"));
```

Gemini API 호출 테스트는 BE-06 구현 단계에서 수행한다.

## Step 6: Acceptance Criteria 확인

구현 완료 후 BE-05 issue spec의 수용 기준 체크:
- [ ] System Instruction (영어) 정의 완료
- [ ] User Prompt 템플릿 (한국어 응답 강제) 정의 완료
- [ ] JSON Schema가 PathMap 타입과 일치
- [ ] 합류점 포함 Few-shot 예시 1개 작성
- [ ] PROMPT_VERSION 상수 내보내기 확인

## Reference Documents

- `specs/001-prompt-engineering/spec.md` - 기능 명세
- `specs/001-prompt-engineering/data-model.md` - JSON 스키마 상세
- `specs/001-prompt-engineering/contracts/prompts-module.md` - 모듈 계약
- `docs/04-backend-spec.md` - B3 항목 및 Gemini 프롬프트 전략 섹션
- `docs/issues/phase-1/BE-05-prompt-engineering.md` - 원본 이슈 스펙
