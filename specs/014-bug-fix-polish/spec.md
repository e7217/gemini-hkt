# FE-07: 버그 수정 + UI 폴리시 — Feature Specification

**Feature ID**: FE-07
**Phase**: Phase 3 (마무리, 4:00~4:40)
**Assignee**: frontend-dev
**Estimated Time**: 40m
**Difficulty**: Medium
**Status**: pending
**Dependencies**: FE-01, FE-03, FE-04, FE-05, FE-06 (all complete)

---

## Overview

FE-07 is the final stabilization pass before the demo. Its purpose is not to add features but to ensure the existing implementation of FE-01 through FE-06 works flawlessly across the four-act demo scenario. This pass covers edge case handling, UI polish, desktop layout verification, and end-to-end demo flow validation.

**Critical constraint**: No new features. Every change must target stability, correctness, or perceptible quality improvement. If fixing something requires introducing a new abstraction, the fix is out of scope — apply the minimal targeted patch instead.

---

## User Stories

### US-1 (P1): Demo Flow Uninterrupted — ACT 1 through ACT 4

**As a** presenter running the LifePath hackathon demo,
**I want** ACT 1 (🎲 → goal → generate), ACT 2 (map + timeline), ACT 3 (merge point), and ACT 4 (close) to complete without errors, freezes, or visual glitches,
**So that** the demo scenario can be executed three consecutive times successfully.

**Acceptance Criteria**:
- [ ] 🎲 button click auto-fills the goal input with a preset string (e.g., "풀스택 개발자 되기")
- [ ] "경로 생성하기" click triggers the API call and shows the loading animation (FE-06)
- [ ] After successful response, the map renders all three tracks (Fast/Deep/Risk) and the merge point node
- [ ] Clicking a node opens the detail panel (FE-04) without console errors
- [ ] Timeline slider (FE-05) transitions between 1y/3y/5y views without crashes
- [ ] Full ACT 1→4 flow completes without any `console.error` or unhandled promise rejection
- [ ] Three consecutive full-flow executions all succeed (no accumulated state corruption)

---

### US-2 (P2): Edge Cases Handled Gracefully

**As a** user who makes unexpected inputs or encounters network problems,
**I want** the application to recover gracefully and show helpful messages,
**So that** the app never crashes or leaves me in an unrecoverable state.

**Acceptance Criteria**:
- [ ] Submitting an empty input shows a warning or the submit button remains disabled
- [ ] API error (5xx or network failure) shows "경로 생성을 실패했습니다. 다시 시도해 주세요." and re-enables the form
- [ ] Goal text longer than 100 characters is either truncated to 100 characters on input, or the excess characters are visually indicated without layout overflow
- [ ] A path with zero nodes does not render a broken map — a fallback message is shown instead
- [ ] A path data without a merge point node renders the three tracks without crashing

---

### US-3 (P3): UI Polish Applied

**As a** demo audience member,
**I want** all interactive elements to feel polished and responsive,
**So that** the product demonstrates attention to craft beyond just functionality.

**Acceptance Criteria**:
- [ ] All node hover states apply a smooth `transition: all 0.2s ease` without jitter
- [ ] All button hover states have a visible and consistent transition (no abrupt color changes)
- [ ] Font sizes are consistent: node labels use one size, panel headings use one size, body text uses one size — no arbitrary one-off sizes
- [ ] All text in dark theme has minimum 4.5:1 contrast ratio against its background (WCAG AA)
- [ ] Spacing between UI elements is visually consistent (8px grid or 4px grid adherence)

---

### US-4 (P4): Desktop 1280px+ Layout Verified

**As a** presenter on a laptop or external display,
**I want** the layout to render correctly at 1280px and wider viewports,
**So that** the demo looks professional on any standard presentation screen.

**Acceptance Criteria**:
- [ ] At 1280px viewport width, the map area and detail panel do not overlap
- [ ] The map area occupies approximately 70% of the viewport width; the detail panel occupies approximately 30%
- [ ] The goal input screen is centered and usable at 1280px
- [ ] No horizontal scrollbar appears at 1280px or 1920px viewports
- [ ] The timeline slider is fully visible and does not clip below the viewport

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | Empty goal input prevents form submission (button disabled or inline warning) | Must | Existing check in FE-01 store guard — verify it is wired to UI |
| FR-002 | API error sets `error` state and renders user-friendly message "경로 생성을 실패했습니다. 다시 시도해 주세요." | Must | FE-01 US-3 AC — verify message text matches |
| FR-003 | Goal input field enforces maximum 100 character limit via `maxLength` attribute | Must | shadcn/ui `Input` accepts `maxLength` prop |
| FR-004 | Path with empty `nodes` array renders a fallback UI element instead of broken React Flow canvas | Must | Guard in PathMap component or calling code |
| FR-005 | Path data without a `mergePoint` node renders gracefully without crash | Must | Null-check in node rendering logic |
| FR-006 | All interactive nodes apply `transition: all 0.2s ease` on hover | Should | CSS or Tailwind `transition` utility |
| FR-007 | All buttons apply a consistent hover style (brightness or opacity shift) | Should | `hover:brightness-110` or equivalent |
| FR-008 | At 1280px viewport, map area and panel area do not overlap or overflow | Must | CSS layout verification |
| FR-009 | No `console.error` output during three consecutive demo flow executions | Must | Manual smoke test criterion |
| FR-010 | Font size and weight tokens are applied consistently across all text elements | Should | Audit and normalize one-off `text-*` classes |

---

## Edge Cases

### Empty Input

| Scenario | Expected Behavior |
|----------|-------------------|
| User clicks "경로 생성하기" with empty input | Button is disabled (disabled state) or an inline validation message appears |
| User clears input after filling it | Button transitions back to disabled state immediately |
| Input contains only whitespace | `goal.trim() === ''` guard treats it as empty; button remains disabled |

### API Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| API returns HTTP 500 | `error` state set to "경로 생성을 실패했습니다. 다시 시도해 주세요."; form re-enabled |
| Network request times out | Same error message as 500; no infinite loading state |
| API returns malformed JSON (non-PathMap shape) | Caught at parse boundary; same error message; no crash |
| User retries after error | `clearError()` runs on new submission attempt; previous error message hidden |

### Long Goal Text

| Scenario | Expected Behavior |
|----------|-------------------|
| User types 101+ characters | Input stops accepting characters at 100 (via `maxLength`) |
| Node label contains a long string from API response | Node label truncates with CSS `text-overflow: ellipsis` and `overflow: hidden` |
| Panel heading contains a very long step name | Heading wraps or truncates; no layout overflow beyond panel boundary |

### Empty Path Data

| Scenario | Expected Behavior |
|----------|-------------------|
| API returns `paths` array with 0 paths | Fallback message: "경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요." |
| A path has 0 nodes in its `nodes` array | That path is excluded from rendering or shown as an empty track label |
| `mergePoint` field is `null` or absent | Map renders without merge point node; no React Flow `undefined node` error |

### Network and Timeout

| Scenario | Expected Behavior |
|----------|-------------------|
| Request takes longer than 30 seconds | Loading animation continues (FE-06 handles this); no crash |
| User navigates away mid-request | No lingering state mutation after component unmount |

---

## Success Criteria

1. All 24 acceptance criteria across US-1 through US-4 are checked green.
2. Zero `console.error` entries during a full demo flow (ACT 1→4).
3. Three consecutive demo executions complete without state corruption or visual breakage.
4. Input validation prevents empty-goal API calls in 100% of test attempts.
5. API error message "다시 시도해 주세요" appears within 2 seconds of a simulated error condition.
6. At 1280px viewport, no layout element overflows its container.
7. All node and button hover transitions are visually smooth (no frame drops or abrupt jumps).
