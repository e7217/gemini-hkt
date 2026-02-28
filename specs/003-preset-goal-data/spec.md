# Feature Specification: 프리셋 목표 데이터 (Preset Goal Data)

**Feature Branch**: `001-preset-goal-data`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "BE-03 프리셋 목표 데이터: 카테고리별 프리셋 목표 30~50개 상수 파일 생성 (커리어, 건강, 재무, 창업, 교육, 여행 카테고리), 랜덤 선택 유틸 함수"

## Overview

LifePath 애플리케이션에서 사용자가 목표를 빠르게 선택할 수 있도록 카테고리별로 정리된 프리셋 목표 데이터 상수 파일과 랜덤 선택 유틸리티 함수를 구현한다. 이 데이터는 Gemini API 장애 시 폴백(fallback)으로도 활용되며, 데모 시나리오(랜덤 버튼 → "풀스택 개발자 되기" 자동 채움)의 핵심 인프라다.

**참조**: 04-backend-spec.md B13, 02-product-spec.md 1-2, 05-demo-strategy.md ACT 1

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 랜덤 목표 버튼으로 프리셋 선택 (Priority: P1)

사용자가 목표 입력 화면에서 🎲 랜덤 버튼을 클릭하면, 전체 프리셋 목표 중 1개가 무작위로 선택되어 입력 필드에 자동으로 채워진다.

**Why this priority**: 데모 시나리오 ACT 1의 핵심 기능으로, 랜덤 버튼 없이는 데모 오프닝이 불가능하다. FE-01(목표 입력 화면)의 직접 의존성이다.

**Independent Test**: `getRandomGoal()` 함수를 직접 호출하여 반환값이 유효한 `PresetGoal` 객체인지, 매 호출마다 다른 결과가 나오는지 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** 프리셋 데이터가 로드된 상태에서, **When** `getRandomGoal()`을 호출하면, **Then** `{ id, category, title, description }` 형태의 유효한 `PresetGoal` 객체가 반환된다.
2. **Given** 프리셋 데이터가 로드된 상태에서, **When** `getRandomGoal()`을 10회 연속 호출하면, **Then** 적어도 2개 이상의 서로 다른 결과가 반환된다(통계적 다양성).
3. **Given** 목표 입력 화면이 표시된 상태에서, **When** 사용자가 🎲 버튼을 클릭하면, **Then** 입력 필드에 랜덤 목표의 `title`이 채워진다.

---

### User Story 2 - 카테고리별 프리셋 목표 조회 (Priority: P2)

개발자(또는 프론트엔드 컴포넌트)가 특정 카테고리의 프리셋 목표 목록을 조회할 수 있다. 이를 통해 카테고리 선택 UI(B-7)를 구현하거나 카테고리별 필터링이 가능해진다.

**Why this priority**: 랜덤 선택(P1)보다는 후순위이지만, 카테고리별 UI를 구현할 때 필요한 기반 기능이다. 없어도 데모는 가능하므로 P2.

**Independent Test**: `getGoalsByCategory('커리어')` 등의 유틸 함수를 호출하여 해당 카테고리 목표만 반환되는지 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** 프리셋 데이터가 로드된 상태에서, **When** `getGoalsByCategory('커리어')`를 호출하면, **Then** `category === '커리어'`인 `PresetGoal[]`이 반환된다.
2. **Given** 프리셋 데이터가 로드된 상태에서, **When** 존재하지 않는 카테고리로 조회하면, **Then** 빈 배열(`[]`)이 반환된다(에러 없음).
3. **Given** 전체 프리셋 데이터를 확인할 때, **When** 카테고리별 목표 수를 세면, **Then** 각 카테고리에 최소 5개 이상의 목표가 존재한다.

---

### User Story 3 - 데모용 프리셋 목표 조회 (Priority: P3)

데모 모드 또는 특별 연출이 필요한 상황에서, 데모에 최적화된 프리셋 목표 세트(예: "풀스택 개발자 되기" 포함)를 조회할 수 있다.

**Why this priority**: 데모 안정성을 위한 추가 기능이지만, 기본 랜덤 선택(P1)만으로도 데모는 가능하므로 P3.

**Independent Test**: `DEMO_PRESETS` 상수 또는 `getDemoGoals()` 함수를 확인하여 "풀스택 개발자 되기"가 포함되어 있는지 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** 데모용 프리셋 목록이 정의된 상태에서, **When** `getDemoGoals()`를 호출하면, **Then** "풀스택 개발자 되기" 제목의 프리셋이 포함된 배열이 반환된다.
2. **Given** 데모용 프리셋 목록을 확인할 때, **When** 전체 프리셋과 비교하면, **Then** 데모용 프리셋은 전체 프리셋의 부분집합이다.

---

### Edge Cases

- **빈 카테고리**: 존재하지 않는 카테고리로 `getGoalsByCategory()`를 호출하면 빈 배열 반환(에러 없음).
- **전체 목표 수가 0**: `ALL_PRESET_GOALS` 배열이 비어있는 경우 `getRandomGoal()`은 `undefined`를 반환할 수 있음 — 실제로는 상수 파일이므로 빌드 타임에 보장됨.
- **TypeScript strict 모드**: `any` 타입 사용 금지; `PresetGoal` 인터페이스를 명시적으로 정의.
- **함수 길이 제한**: 모든 함수는 20줄 이하로 구현(Constitution III).
- **중첩 깊이 제한**: 조건문/반복문 중첩 최대 2단계(Constitution IV).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 최소 30개 이상의 프리셋 목표 데이터를 상수 파일(`data/presets.ts`)에 정의해야 한다.
- **FR-002**: 프리셋 목표는 커리어, 건강, 재무, 창업, 교육, 여행 6개 카테고리에 균형 있게 배분되어야 하며, 각 카테고리당 최소 5개 이상이어야 한다.
- **FR-003**: 각 프리셋 목표는 `{ id: string, category: string, title: string, description: string }` 타입을 만족해야 한다.
- **FR-004**: `getRandomGoal()` 함수는 전체 프리셋 목록에서 1개를 무작위로 반환해야 한다.
- **FR-005**: `getGoalsByCategory(category: string)` 함수는 해당 카테고리의 프리셋 목록을 반환해야 한다.
- **FR-006**: 데모 시나리오에서 사용되는 "풀스택 개발자 되기" 목표는 반드시 포함되어야 한다.
- **FR-007**: 모든 목표 텍스트는 한국어로 작성되어야 한다.
- **FR-008**: 상수 파일은 순수 TypeScript 파일이어야 하며, API 호출이나 외부 의존성이 없어야 한다.
- **FR-009**: `getDemoGoals()` 함수는 데모에 최적화된 프리셋 부분집합을 반환해야 한다.

### Key Entities *(include if feature involves data)*

- **PresetGoal**: 프리셋 목표 데이터 단위. `id`(고유 식별자), `category`(카테고리명), `title`(목표 제목), `description`(목표 설명)으로 구성. 불변(immutable) 상수.
- **PresetCategory**: 카테고리 구분값. `커리어`, `건강`, `재무`, `창업`, `교육`, `여행` 중 하나. 타입 안전성을 위해 리터럴 타입 또는 enum으로 정의.
- **ALL_PRESET_GOALS**: 전체 프리셋 목표의 불변 배열. 단일 소스(single source of truth).
- **DEMO_PRESETS**: 데모 시나리오용 프리셋 부분집합. "풀스택 개발자 되기" 포함 필수.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 상수 파일에 정의된 프리셋 목표 수가 30개 이상 50개 이하.
- **SC-002**: 6개 카테고리 각각에 5개 이상의 목표가 균등 배분됨.
- **SC-003**: `getRandomGoal()` 함수가 TypeScript strict 모드에서 컴파일 에러 없이 동작함.
- **SC-004**: `tsc --noEmit` 실행 시 `data/presets.ts`에서 오류 없음.
- **SC-005**: `getDemoGoals()` 반환값에 "풀스택 개발자 되기" 포함 확인.
- **SC-006**: 모든 유틸 함수가 20줄 이하로 구현됨.
