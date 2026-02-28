# Implementation Plan: BE-03 프리셋 목표 데이터

**Branch**: `001-preset-goal-data` | **Date**: 2026-02-27 | **Spec**: specs/001-preset-goal-data/spec.md
**Input**: Feature specification from `/specs/001-preset-goal-data/spec.md`

## Summary

카테고리별 프리셋 목표 데이터(36개)를 순수 TypeScript 상수 파일(`data/presets.ts`)로 구현하고, 랜덤 선택(`getRandomGoal`), 카테고리 필터(`getGoalsByCategory`), 데모용 반환(`getDemoGoals`) 유틸 함수를 제공한다. 이 데이터는 FE-01(목표 입력 화면)의 랜덤 버튼과 Gemini API 폴백의 핵심 인프라다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: None (순수 TypeScript 상수 파일)
**Storage**: N/A (인메모리 상수)
**Testing**: Jest / Vitest (선택적; BE-03은 Must 항목이나 테스트는 옵션)
**Target Platform**: Next.js 14+ (App Router), Vercel
**Project Type**: Library (유틸리티 모듈)
**Performance Goals**: N/A (정적 데이터, 런타임 연산 최소)
**Constraints**: any 타입 금지, 함수 20줄 이하, 중첩 깊이 2단계 이하
**Scale/Scope**: 단일 파일, 36개 상수 데이터, 3개 유틸 함수

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|------------|--------|
| I. YAGNI & SOLID | 단순 상수 파일 + 3개 필요 함수만 구현. 미래 대비 추상화 없음. SRP 충족. | ✅ PASS |
| II. Abstraction & Class Design | `PresetGoal` 인터페이스로 도메인 표현. `PresetCategory` 타입으로 카테고리 안전성 보장. | ✅ PASS |
| III. Concise Code | 모든 함수 10줄 이하 (getRandomGoal 3줄, getGoalsByCategory 3줄, getDemoGoals 3줄). | ✅ PASS |
| IV. Nesting Depth | 유틸 함수 내 중첩 없음 (단순 배열 접근/필터링). | ✅ PASS |
| V. TypeScript Strict | `any` 없음. 명시적 `PresetGoal`, `PresetCategory` 타입. `readonly` 배열. | ✅ PASS |
| VI. Fail-Safe & Graceful Degradation | 이 파일 자체가 Gemini API 실패 시 폴백 데이터. | ✅ PASS |

**Constitution Check Result**: ✅ **ALL PASS** — 구현 진행 가능

## Project Structure

### Documentation (this feature)

```text
specs/001-preset-goal-data/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── presets-api.md   # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
data/
└── presets.ts           # 단일 구현 파일

# 선택적 테스트 (옵션)
__tests__/
└── presets.test.ts
```

**Structure Decision**: 단일 파일 구조. 프리셋 데이터는 DB/API가 필요 없는 정적 상수이므로 가장 단순한 구조 채택 (YAGNI).

## Complexity Tracking

> **No violations found** — Constitution Check PASS, complexity justification not required.

## Implementation Phases

### Phase 0: Research (완료)
- [x] 기술 스택 확인 (TypeScript strict, Next.js 14+)
- [x] 카테고리별 목표 데이터 조사 (36개, 6카테고리 × 6개)
- [x] 유틸 함수 패턴 결정 (literal union, readonly array, as const)
- [x] Constitution 준수 확인

### Phase 1: Design (완료)
- [x] data-model.md 작성 (타입/상수/함수 설계)
- [x] contracts/presets-api.md 작성 (공개 API 계약)
- [x] quickstart.md 작성 (구현 가이드)

## Dependency Notes

- **선행**: BE-01 (프로젝트 초기 세팅) — TypeScript 환경 필요
- **후행**: FE-01 (목표 입력 화면 UI) — `getRandomGoal()` import
- **후행**: BE-07 (Mock Fallback) — `ALL_PRESET_GOALS` 활용
- **독립적**: BE-02 (공유 타입) — 프리셋 타입은 BE-02의 PathNode 등과 독립

## Estimated Effort

- 구현: 10~15분 (데이터 입력 중심)
- 검증: 5분 (tsc --noEmit)
- 총계: 약 15~20분 (BE-03 원래 예상과 일치)
