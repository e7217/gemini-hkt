---
description: "Task list template for feature implementation"
---

# Tasks: Theme Toggle & Light Mode Color Scheme

**Input**: Design documents from `/specs/016-theme-toggle/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup & Foundational

**Purpose**: 글로벌 CSS 테마 변수 설정 및 Theme Provider 점검

- [ ] T001 [P] [US2] `app/globals.css`에 라이트 모드 전용 CSS 변수(배경, 텍스트, 보더 등) 세팅 (현재 다크 모드 위주의 설정을 분리)
- [ ] T002 [P] [US3] `app/layout.tsx`에서 `ThemeProvider`가 시스템 테마 기본 적용을 올바르게 지원하는지 확인 (`defaultTheme="system" enableSystem`)

---

## Phase 2: User Story 1 & 3 - Theme Toggle Button (Priority: P1)

**Goal**: 사용자가 테마를 수동으로 변경할 수 있는 토글 UI 제공

- [ ] T003 [US1] `lucide-react`와 shadcn `Button`을 활용하여 `components/ThemeToggle.tsx` 구현
- [ ] T004 [US1] `app/layout.tsx` (또는 메인 내비게이션/헤더 컴포넌트)에 `ThemeToggle` 컴포넌트 배치

**Checkpoint**: 화면에서 토글 버튼을 클릭할 때 `<html>` 태그에 `dark` 클래스가 토글되는지 확인

---

## Phase 3: User Story 2 - Light Mode Colors for React Flow (Priority: P1)

**Goal**: 라이트 모드에서 React Flow 캔버스와 노드들이 명확히 보이도록 스타일 개선

- [ ] T005 [P] [US2] `lib/trackColors.ts` 수정: 라이트 모드에서도 가독성이 유지되는 트랙별 색상 변형(Variant) 추가
- [ ] T006 [P] [US2] `components/PathMap/PathMapCanvas.tsx`에서 `<Background>` 컴포넌트가 현재 테마(다크/라이트)에 맞춰 그리드/도트 색상을 변경하도록 수정
- [ ] T007 [P] [US2] `components/nodes/StartNode.tsx`의 펄스 효과 및 배경색을 테마(또는 CSS 변수)에 맞게 대응
- [ ] T008 [P] [US2] `components/nodes/StepNode.tsx`의 배경, 텍스트, 트랙 배지 색상을 라이트 모드 대응으로 수정
- [ ] T009 [P] [US2] `components/nodes/GoalNode.tsx`의 스타 아이콘과 글로우 효과가 라이트 모드에서 잘 보이도록 수정
- [ ] T010 [P] [US2] `components/nodes/MergeNode.tsx`의 그라데이션 및 텍스트 색상 수정

**Checkpoint**: 라이트 모드 전환 시 경로 맵의 모든 노드와 선이 가독성 있게 렌더링되며 기존 다크 모드 퀄리티를 유지하는지 확인

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T011 반응형 모바일 환경에서 테마 토글 버튼이 UI를 가리지 않는지 확인
- [ ] T012 테마 전환 시 노드 색상이 변경될 때 FOUC 또는 부자연스러운 깜빡임이 없는지 점검하고 필요시 CSS transition 추가
