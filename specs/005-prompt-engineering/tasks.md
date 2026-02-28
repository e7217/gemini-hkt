# Tasks: BE-05 프롬프트 엔지니어링

**Input**: Design documents from `/specs/001-prompt-engineering/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- File paths follow Next.js project structure with `lib/` at repository root

---

## Phase 1: Setup (공유 인프라)

**Purpose**: `lib/prompts.ts` 파일의 기본 구조와 버전 관리 인프라 생성

- [x] T001 `lib/prompts.ts` 파일 생성 및 JSDoc 헤더(버전, changelog 블록) 작성
- [x] T002 `PROMPT_VERSION = "1.0.0"` 상수 정의 및 내보내기
- [x] T003 [P] `TIMEFRAME_MONTHS` 상수 정의 ("1y"→12, "3y"→36, "5y"→60) 및 내보내기
- [x] T004 [P] BE-02 공유 타입(`PathMap`, `PathNode`, `MergePoint`, `Path`) 임포트 경로 확인

---

## Phase 2: Foundational (핵심 구조 정의)

**Purpose**: 모든 User Story 구현의 기반이 되는 JSON 스키마와 System Instruction 정의

**이 Phase가 완료되어야 US2-US5 작업 시작 가능**

- [x] T005 `PATH_MAP_SCHEMA` 객체 정의: `startNode`, `goalNode`, `paths[]`, `mergePoints[]` 최상위 구조
- [x] T006 [P] `PATH_MAP_SCHEMA` - `paths[]` 항목 스키마 정의: `id` (enum: fast/deep/explorer), `name`, `color`, `nodes[]`
- [x] T007 [P] `PATH_MAP_SCHEMA` - `PathNode` 스키마 정의: 모든 필수 필드 (`id`, `title`, `description`, `duration`, `difficulty` enum, `isMergePoint`, `tips[]`, `monthsFromNow`)
- [x] T008 `PATH_MAP_SCHEMA` - `mergePoints[]` 스키마 정의: `id`, `title`, `connectedPaths[]` (minItems: 2), `message`
- [x] T009 `PATH_MAP_SCHEMA` 내보내기 및 TypeScript 타입 호환성 확인

**Checkpoint**: JSON 스키마 정의 완료 - US1/US3 작업 시작 가능

---

## Phase 3: User Story 1 - System Instruction 정의 및 경로 생성 (Priority: P1) 🎯 MVP

**Goal**: 영어로 작성된 완전한 System Instruction을 `SYSTEM_INSTRUCTION` 상수로 내보내기

**Independent Test**: `SYSTEM_INSTRUCTION`을 Gemini API에 전달했을 때 PathMap 구조의 JSON이 반환되는지 확인 (BE-06에서 end-to-end 검증)

### Implementation for User Story 1

- [x] T010 [US1] `SYSTEM_INSTRUCTION` 초안 작성: 역할 부여 섹션 ("You are a life path simulator...")
- [x] T011 [US1] `SYSTEM_INSTRUCTION` - 경로 유형 정의 섹션 추가: fast (4-5 nodes), deep (5-6 nodes), explorer (4-5 nodes), 각 경로의 성격 설명
- [x] T012 [US1] `SYSTEM_INSTRUCTION` - JSON 전용 출력 지시 섹션 추가: "Respond ONLY with valid JSON. No markdown, no explanation."
- [x] T013 [US1] `SYSTEM_INSTRUCTION` - 합류점 생성 규칙 섹션 추가: 최소 1-2개, isMergePoint: true 규칙, connectedPaths 필수, 감성적 message 한국어 작성 지시
- [x] T014 [US1] `SYSTEM_INSTRUCTION` - monthsFromNow 단조 증가 규칙 섹션 추가
- [x] T015 [US1] `SYSTEM_INSTRUCTION` 내보내기 및 문자열 형식 최종 확인
- [x] T016 [US1] `SYSTEM_INSTRUCTION` 토큰 길이 검토 (Gemini Flash 컨텍스트 적합성)

**Checkpoint**: US1 완료 - SYSTEM_INSTRUCTION 내보내기 가능, BE-06에서 사용 준비됨

---

## Phase 4: User Story 2 - 한국어 출력 강제 및 User Prompt 템플릿 (Priority: P2)

**Goal**: `buildUserPrompt(goal, timeframe)` 함수 구현. 한국어 응답 강제 및 타임프레임 범위 지시 포함.

**Independent Test**: `buildUserPrompt("카페 창업하기", "1y")`를 호출하여 반환 문자열에 "한국어", "12개월" 관련 내용이 포함되는지 확인

### Implementation for User Story 2

- [x] T017 [US2] `buildUserPrompt` 함수 시그니처 정의: `(goal: string, timeframe: "1y" | "3y" | "5y") => string`
- [x] T018 [US2] `buildUserPrompt` - 목표 및 타임프레임 섹션 구성: goal 변수 삽입, `TIMEFRAME_MONTHS[timeframe]`으로 개월 수 계산
- [x] T019 [US2] `buildUserPrompt` - 한국어 응답 강제 지시 추가: "반드시 한국어로 응답하세요" 명시
- [x] T020 [US2] `buildUserPrompt` - monthsFromNow 범위 지시 추가: 0부터 해당 타임프레임 개월 수까지 범위 명시
- [x] T021 [US2] `buildUserPrompt` 내보내기 및 TypeScript 반환 타입 확인

**Checkpoint**: US2 완료 - buildUserPrompt 함수 사용 준비됨

---

## Phase 5: User Story 3 - JSON 스키마 정의 및 PathMap 일치 검증 (Priority: P3)

**Goal**: Phase 2에서 정의한 `PATH_MAP_SCHEMA`가 BE-02 `PathMap` 인터페이스와 완전히 일치하는지 검증하고 최종화

**Independent Test**: `PATH_MAP_SCHEMA`를 Gemini의 `responseSchema`로 사용했을 때 반환된 JSON이 `PathMap` 타입으로 파싱되는지 확인

### Implementation for User Story 3

- [x] T022 [US3] BE-02의 `PathMap`, `PathNode`, `MergePoint`, `Path` 인터페이스와 `PATH_MAP_SCHEMA` 필드별 대조 검증
- [x] T023 [US3] `difficulty` enum ["Low", "Medium", "High"] 스키마 일치 확인
- [x] T024 [US3] `paths[].id` enum ["fast", "deep", "explorer"] 스키마 일치 확인
- [x] T025 [US3] `mergePoints[].connectedPaths` minItems: 2 제약 조건 확인
- [x] T026 [US3] `PATH_MAP_SCHEMA` TypeScript 타입 안전성 최종 확인 (tsc --noEmit)

**Checkpoint**: US3 완료 - JSON 스키마가 TypeScript 인터페이스와 완전히 일치함

---

## Phase 6: User Story 4 - Few-shot 예시 및 합류점 생성 품질 (Priority: P4)

**Goal**: 합류점 구조가 올바르게 포함된 Few-shot 예시 1개를 `buildUserPrompt` 내에 통합

**Independent Test**: Few-shot 예시를 포함한 프롬프트로 Gemini를 호출하여 mergePoints 배열에 최소 1개 이상의 항목이 존재하는지 확인 (BE-06 통합 테스트에서 검증)

### Implementation for User Story 4

- [x] T027 [US4] Few-shot 예시 목표 선정: "소프트웨어 엔지니어 되기" (타임프레임 3년)
- [x] T028 [US4] Few-shot 예시 - fast 경로 노드 4개 작성 (한국어, monthsFromNow 단조 증가)
- [x] T029 [P] [US4] Few-shot 예시 - deep 경로 노드 5개 작성 (한국어, monthsFromNow 단조 증가)
- [x] T030 [P] [US4] Few-shot 예시 - explorer 경로 노드 4개 작성 (한국어, monthsFromNow 단조 증가)
- [x] T031 [US4] Few-shot 예시 - mergePoints 배열 1개 작성: connectedPaths ["fast", "deep"] 또는 전체 경로, 감성적 한국어 message
- [x] T032 [US4] Few-shot 예시를 `buildUserPrompt` 함수에 통합 (User Prompt 내 별도 섹션으로 구분)
- [x] T033 [US4] Few-shot 예시 포함 후 전체 프롬프트 토큰 길이 재검토

**Checkpoint**: US4 완료 - Few-shot 포함 buildUserPrompt 함수 완성

---

## Phase 7: User Story 5 - 프롬프트 버전 관리 (Priority: P5)

**Goal**: `lib/prompts.ts` 파일의 버전 관리 체계 완성 및 검증

**Independent Test**: `lib/prompts.ts`에서 `PROMPT_VERSION` import 가능하고 "1.0.0" 값이 반환되는지 확인

### Implementation for User Story 5

- [x] T034 [US5] Phase 1에서 생성한 `PROMPT_VERSION = "1.0.0"` 최종 확인
- [x] T035 [US5] 파일 상단 JSDoc changelog 블록 완성: `@version 1.0.0`, `@changelog` 섹션에 날짜/변경내용 기록
- [x] T036 [US5] `PROMPT_VERSION` 내보내기 TypeScript 컴파일 확인

**Checkpoint**: US5 완료 - 버전 관리 체계 완성

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 전체 모듈 품질 향상 및 BE-06 통합 준비

- [x] T037 [P] `lib/prompts.ts` 전체 내보내기 목록 최종 점검: `PROMPT_VERSION`, `SYSTEM_INSTRUCTION`, `PATH_MAP_SCHEMA`, `buildUserPrompt`, `TIMEFRAME_MONTHS`
- [x] T038 [P] TypeScript strict 모드 호환성 확인 (`tsc --strict --noEmit`)
- [x] T039 [P] ESLint 검사 실행 및 경고 해결
- [x] T040 `quickstart.md`의 검증 단계 따라 프롬프트 문자열 출력 확인 (scripts/test-prompt.ts)
- [x] T041 BE-06 개발자를 위한 `contracts/prompts-module.md` 정확성 최종 검토

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 시작 (T001-T004 완료 필요)
- **US1 (Phase 3)**: Phase 2 완료 후 시작 (PATH_MAP_SCHEMA 정의 필요) - SYSTEM_INSTRUCTION 독립 작성 가능
- **US2 (Phase 4)**: Phase 1 완료 후 독립적으로 시작 가능 (buildUserPrompt는 스키마 독립적)
- **US3 (Phase 5)**: Phase 2 완료 후 시작 (PATH_MAP_SCHEMA 검증 필요)
- **US4 (Phase 6)**: Phase 4(US2) 완료 후 시작 (buildUserPrompt에 Few-shot 통합)
- **US5 (Phase 7)**: Phase 1 완료 후 독립 시작 가능 (버전 상수는 독립적)
- **Polish (Phase 8)**: 모든 User Story 완료 후

### Within Each User Story

- T010→T011→T012→T013→T014→T015→T016 (US1: 순차적, 각 섹션이 이전 섹션 기반)
- T017→T018→T019→T020→T021 (US2: buildUserPrompt 순차 구축)
- T022→T023→T024→T025→T026 (US3: 스키마 검증 순차)
- T027→T028/T029/T030(병렬)→T031→T032→T033 (US4)
- T034→T035→T036 (US5: 순차)

### Parallel Opportunities

- T003, T004 (Phase 1): 서로 병렬 가능
- T006, T007 (Phase 2): 서로 병렬 가능
- T029, T030 (US4): 서로 병렬 가능 (다른 경로 노드 작성)
- T037, T038, T039 (Phase 8): 서로 병렬 가능

---

## MVP Scope

**최소 실행 가능 제품** (BE-06 시작을 위한 최소 요건):

Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (US1: SYSTEM_INSTRUCTION) + Phase 4 (US2: buildUserPrompt 기본) + Phase 6의 T027-T032 (US4: Few-shot 통합)

총 핵심 태스크: T001-T021, T027-T032 = 25개 태스크

**전체 완료**: 41개 태스크 (T001-T041)

---

## Notes

- [P] 태스크 = 다른 파일 또는 독립적 내용, 병렬 실행 가능
- BE-05의 핵심은 품질: 프롬프트 한 줄 차이가 전체 서비스 경험을 결정
- Few-shot 예시(T027-T031)는 신중하게 작성 필요 - 합류점 구조 정확성이 핵심
- Gemini API 실제 호출 검증은 BE-06 구현 후 수행
- 각 User Story 완료 후 TypeScript 컴파일(`tsc --noEmit`) 실행 권장
