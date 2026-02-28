# FE-01: 목표 입력 화면 UI — Feature Specification

**Feature ID**: FE-01
**Phase**: Phase 1 (로켓 발사, 0:50~1:30)
**Assignee**: frontend-dev
**Estimated Time**: 30m
**Difficulty**: Medium
**Status**: pending
**Dependencies**: BE-01 (project setup), BE-03 (preset goals), FE-02 (dark theme)

---

## Overview

The goal input screen is the entry point for the LifePath application. Users type a life goal, then trigger AI-powered path generation. The screen conditionally renders either the `GoalInput` component (initial state) or the `PathMap` visualization (after successful API response). A Zustand store (`useLifePathStore`) holds all relevant state.

This screen creates the first impression in the demo scenario. It must feel clean, responsive, and confidence-inspiring.

---

## User Stories

### US-1 (P1): Goal Input + Path Generation

**As a** user visiting the LifePath app,
**I want to** type my life goal and click "경로 생성하기",
**So that** the system calls the API and renders my personalized path map.

**Acceptance Criteria**:
- [ ] Input field renders with placeholder "이루고 싶은 목표를 입력하세요"
- [ ] "경로 생성하기" button is visible and clickable when input is non-empty
- [ ] Clicking the button dispatches `generatePath()` action from the Zustand store
- [ ] The store calls `POST /api/paths/simulate` with `{ goal: string }`
- [ ] On success, `pathMap` state is populated and the main page renders the `PathMap` component
- [ ] Button is disabled while `isLoading` is `true`
- [ ] Empty input prevents submission (button disabled or validation guard)

---

### US-2 (P2): Random Goal via Dice Button

**As a** user who is unsure what goal to type,
**I want to** click the 🎲 random button,
**So that** a preset goal is auto-filled into the input field for me.

**Acceptance Criteria**:
- [ ] 🎲 button is visible next to the input field
- [ ] Clicking 🎲 calls `getRandomGoal()` from `data/presets.ts` (BE-03)
- [ ] The selected preset title is set as the `goal` value in the store via `setGoal()`
- [ ] Input field reflects the new value immediately
- [ ] Demo scenario: clicking 🎲 can produce "풀스택 개발자 되기" (preset guaranteed present)

---

### US-3 (P3): Loading State + Error State Handling

**As a** user waiting for the API response or encountering an error,
**I want to** see clear feedback about what is happening,
**So that** I understand the system status and can take appropriate action.

**Acceptance Criteria**:
- [ ] While `isLoading` is `true`: button shows loading indicator (spinner or "생성 중..." text), button is disabled
- [ ] While `isLoading` is `true`: 🎲 button is also disabled to prevent conflicting state changes
- [ ] Input field is disabled during loading
- [ ] On API error: `error` state is set and a user-friendly error message is displayed below the input
- [ ] Error message includes actionable context (e.g., "다시 시도해주세요")
- [ ] "X" or `clearError()` action dismisses the error message
- [ ] After error dismissal, the form is re-enabled for user input

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | Render a text input field with placeholder "이루고 싶은 목표를 입력하세요" | Must | shadcn/ui `Input` |
| FR-002 | Render a "경로 생성하기" submit button that calls `generatePath()` on click | Must | shadcn/ui `Button` |
| FR-003 | Disable submit button and input when `isLoading` is `true` | Must | Prevents double-submit |
| FR-004 | Show loading indicator within or below the button while `isLoading` is `true` | Must | Spinner or text |
| FR-005 | Render a 🎲 button that auto-fills a random preset goal from `data/presets.ts` | Must | Calls `getRandomGoal()` |
| FR-006 | Display `error` message when store `error` field is non-null | Must | Below input or as toast |
| FR-007 | Provide a way to dismiss the error (`clearError()` action) | Must | Button or auto-dismiss |
| FR-008 | Conditionally render `GoalInput` or `PathMap` on `app/page.tsx` based on `pathMap` state | Must | Null check on `pathMap` |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User submits empty input | Button is disabled; no API call made |
| Input exceeds 200 characters | Input still accepted; no hard truncation in MVP |
| API returns 500 error | `error` state set to user-friendly message; loading ends |
| API returns malformed JSON | Caught in `generatePath()`; `error` state set |
| User clicks 🎲 while loading | 🎲 button disabled during loading; no state change |
| User clicks "경로 생성하기" twice | Second click ignored; button disabled on first dispatch |
| Network timeout | Error boundary catches; `error` state set with retry prompt |
| `getRandomGoal()` returns undefined | Fallback to "풀스택 개발자 되기" (guaranteed preset) |

---

## Key Entities

### GoalInput Component

```
GoalInput
  - Controlled input bound to store.goal via setGoal()
  - Submit button triggers store.generatePath()
  - 🎲 button calls getRandomGoal() then setGoal()
  - Renders error message when store.error is non-null
  - All interactive elements disabled when store.isLoading
  - Uses shadcn/ui: Input, Button
```

### LifePathStore State

```
useLifePathStore
  State:
    - goal: string           — current input value
    - isLoading: boolean     — API call in progress
    - pathMap: PathMap | null — result from simulate API
    - error: string | null   — user-facing error message
  Actions:
    - setGoal(goal)          — update goal text
    - generatePath()         — async: call API, update pathMap or error
    - clearError()           — reset error to null
    - reset()                — clear all state back to initial
```

---

## Non-Functional Requirements

- Component must be a Client Component (`'use client'` directive)
- No prop drilling: all state accessed via `useLifePathStore` hook
- TypeScript strict mode: no `any`, proper return types
- Function body max 20 lines (Constitution rule)
- Max 2 nesting depth in JSX (Constitution rule)
- YAGNI: no features beyond the three user stories

---

## Success Criteria

1. `GoalInput` component renders correctly in dark theme environment
2. Submitting a goal triggers `POST /api/paths/simulate` exactly once
3. Loading state visually disables all interactive elements
4. 🎲 button successfully populates the input with a valid preset string
5. API errors surface as readable messages without crashing the app
6. `app/page.tsx` transitions cleanly from `GoalInput` to `PathMap` on success
7. All 7 acceptance criteria items across US-1, US-2, US-3 pass
