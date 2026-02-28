---
description: "Task list for BE-03 프리셋 목표 데이터"
---

# Tasks: BE-03 프리셋 목표 데이터

**Input**: Design documents from `/specs/001-preset-goal-data/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/presets-api.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (공유 인프라)

**Purpose**: 파일 구조 준비

- [ ] T001 `data/` 디렉토리 생성 및 `data/presets.ts` 빈 파일 생성

---

## Phase 2: Foundational (핵심 타입 및 상수)

**Purpose**: 모든 유저 스토리가 의존하는 타입/상수 정의

**⚠️ CRITICAL**: 이 단계 완료 전에는 유저 스토리 구현 불가

- [ ] T002 [P] `PresetCategory` 타입 정의 (`data/presets.ts`) — literal union: '커리어' | '건강' | '재무' | '창업' | '교육' | '여행'
- [ ] T003 [P] `PresetGoal` 인터페이스 정의 (`data/presets.ts`) — `{ id, category, title, description }` 모두 readonly
- [ ] T004 `ALL_PRESET_GOALS` 상수 배열 구현 (`data/presets.ts`) — 36개 (6카테고리 × 6개) readonly PresetGoal[], career-001 "풀스택 개발자 되기" 포함
- [ ] T005 `DEMO_PRESET_IDS` 내부 상수 정의 (`data/presets.ts`) — ['career-001', 'startup-001', 'finance-001', 'health-001', 'travel-001']

**Checkpoint**: 타입/상수 정의 완료 — 유저 스토리 구현 시작 가능

---

## Phase 3: User Story 1 - 랜덤 목표 선택 (Priority: P1) 🎯 MVP

**Goal**: `getRandomGoal()` 함수를 구현하여 🎲 버튼에서 활용 가능하게 함

**Independent Test**: `getRandomGoal()` 직접 호출 → 유효한 PresetGoal 반환 확인

### Implementation for User Story 1

- [ ] T006 [US1] `getRandomGoal()` 함수 구현 (`data/presets.ts`) — `Math.random()`으로 ALL_PRESET_GOALS에서 1개 반환, 반환 타입 `PresetGoal` 명시

**Checkpoint**: T006 완료 후 `getRandomGoal()`이 독립적으로 동작함. FE-01에서 즉시 사용 가능

---

## Phase 4: User Story 2 - 카테고리별 필터링 (Priority: P2)

**Goal**: `getGoalsByCategory()` 함수로 카테고리 필터 UI 지원

**Independent Test**: `getGoalsByCategory('커리어')` 호출 → 커리어 목표만 반환 확인

### Implementation for User Story 2

- [ ] T007 [US2] `getGoalsByCategory()` 함수 구현 (`data/presets.ts`) — `PresetCategory` 파라미터, `ALL_PRESET_GOALS.filter()` 사용, 빈 배열 반환(에러 없음)

**Checkpoint**: T007 완료 후 카테고리 필터 기능이 독립적으로 동작함

---

## Phase 5: User Story 3 - 데모용 프리셋 반환 (Priority: P3)

**Goal**: `getDemoGoals()` 함수로 데모 최적화 프리셋 접근

**Independent Test**: `getDemoGoals()`에서 "풀스택 개발자 되기" 포함 확인

### Implementation for User Story 3

- [ ] T008 [US3] `getDemoGoals()` 함수 구현 (`data/presets.ts`) — DEMO_PRESET_IDS 기반 필터링, career-001('풀스택 개발자 되기') 포함 보장

**Checkpoint**: T008 완료 후 데모 모드 프리셋이 독립적으로 동작함

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 품질 검증 및 내보내기 정리

- [ ] T009 [P] 모든 export 정리 확인 (`data/presets.ts`) — PresetCategory, PresetGoal, ALL_PRESET_GOALS, getRandomGoal, getGoalsByCategory, getDemoGoals 모두 export
- [ ] T010 [P] `tsc --noEmit` 실행하여 TypeScript strict 모드 컴파일 오류 없음 확인
- [ ] T011 quickstart.md의 검증 체크리스트 수동 실행 (ALL_PRESET_GOALS.length >= 30, 카테고리별 5개 이상, 데모 프리셋 포함)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 — 모든 유저 스토리 블로킹
- **User Stories (Phase 3-5)**: Foundational 완료 후 순차 또는 병렬 진행 가능
- **Polish (Phase 6)**: 원하는 유저 스토리 완료 후

### Within Each Phase

- T002, T003: 병렬 가능 (서로 다른 타입 정의)
- T004: T002, T003 완료 후
- T005: T002 완료 후
- T006: T004 완료 후
- T007: T004 완료 후 (T006과 병렬 가능)
- T008: T004, T005 완료 후

### MVP Scope

Phase 1 + Phase 2 + Phase 3 (T001~T006) = **MVP**: 랜덤 목표 선택 기능 동작

### Parallel Opportunities

- T002, T003: 동시 작업 가능
- T006, T007: T004 완료 후 동시 작업 가능
- T009, T010: 동시 작업 가능

---

## Implementation Strategy

### MVP First (User Story 1 Only, ~10분)

1. Phase 1 완료 (T001)
2. Phase 2 완료 (T002~T005) — 타입/상수 정의
3. Phase 3 완료 (T006) — getRandomGoal()
4. **STOP and VALIDATE**: `tsc --noEmit` + `getRandomGoal()` 호출 확인
5. FE-01에 통합 가능

### Full Implementation (~15~20분)

1. MVP (위 4단계)
2. Phase 4 (T007) — getGoalsByCategory()
3. Phase 5 (T008) — getDemoGoals()
4. Phase 6 (T009~T011) — 최종 검증

---

## Notes

- 모든 함수는 20줄 이하 (실제로 3~5줄 예상)
- `any` 타입 사용 금지 — Constitution V
- DEMO_PRESET_IDS는 내부 상수로 export 불필요 (YAGNI)
- 파일 하나로 모든 것이 완결됨 — 추가 파일 불필요
