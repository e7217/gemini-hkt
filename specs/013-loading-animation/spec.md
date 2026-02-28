# FE-06: 로딩 애니메이션 (경로 생성 시) — Feature Specification

**Feature ID**: FE-06
**Phase**: Phase 2 (핵심 구현)
**Assignee**: frontend-dev
**Estimated Time**: 15m
**Difficulty**: Low
**Status**: pending
**Dependencies**: BE-01 (project setup), FE-02 (dark theme + color system)

---

## Overview

When the user submits a goal and the `POST /api/paths/simulate` API call begins, the Zustand store sets `isLoading = true`. At this moment, the `LoadingAnimation` component renders as a full-screen overlay covering the map area. It cycles through four Korean-language progress messages every 2 seconds using `setInterval`, accompanied by a CSS `@keyframes`-based growing tree silhouette animation. When the API response arrives and `isLoading` becomes `false`, the overlay fades out with a CSS `opacity` transition, revealing the rendered path map beneath.

The entire implementation uses CSS `@keyframes` and `transition` only — no Framer Motion dependency. The design is dark-theme-first, harmonizing with the LifePath color system (`#F59E0B`, `#3B82F6`, `#8B5CF6`).

---

## User Stories

### US-1 (P1): Loading Overlay Appears with Cycling Progress Text

**As a** user who just clicked "경로 생성하기",
**I want to** see a full-screen loading overlay with descriptive progress messages,
**So that** I understand the system is working and feel engaged during the API wait time.

**Acceptance Criteria**:
- [ ] When `isLoading` is `true` in `useLifePathStore`, `LoadingAnimation` renders as a full-screen overlay (`position: fixed`, `inset: 0`)
- [ ] The overlay has a dark semi-transparent background (`bg-gray-950/90` or equivalent)
- [ ] A progress message is displayed prominently in the center of the overlay
- [ ] Messages cycle in order every 2 seconds using `setInterval`:
  1. "🔍 경로를 탐색 중..."
  2. "🌿 분기점을 찾는 중..."
  3. "🔗 합류점을 연결하는 중..."
  4. "🌱 나무를 심는 중..."
- [ ] Message cycling restarts from index 0 when it reaches the last message
- [ ] The `setInterval` is cleared when the component unmounts (no memory leak)
- [ ] When `isLoading` is `false`, `LoadingAnimation` is not rendered (conditional rendering)

---

### US-2 (P2): CSS Animation Plays During Loading

**As a** user waiting for path generation,
**I want to** see a visually engaging animation that communicates the "growing" metaphor,
**So that** the wait feels thematic and the app feels alive.

**Acceptance Criteria**:
- [ ] A tree silhouette animation plays continuously while the overlay is visible
- [ ] The animation is implemented using CSS `@keyframes` defined in `globals.css`
- [ ] The tree uses `height` and `opacity` keyframes to convey a "growing" feeling
- [ ] The animation loops infinitely (`animation-iteration-count: infinite`)
- [ ] The animation is no longer than 15 lines of CSS total
- [ ] No JavaScript animation libraries are imported (no Framer Motion, no GSAP, no anime.js)
- [ ] The animated element is visually harmonious with the dark theme (uses greens or neutrals)
- [ ] A spinner ring (`border` + `border-t` + CSS `spin` keyframe) optionally accompanies the tree visual

---

### US-3 (P3): Smooth Fade-Out Transition to Map

**As a** user whose API response has arrived,
**I want to** see the loading overlay fade away naturally as the map appears,
**So that** the transition from waiting to exploration feels fluid, not jarring.

**Acceptance Criteria**:
- [ ] The `LoadingAnimation` component has an `isVisible` internal state initialized from `isLoading`
- [ ] When `isLoading` transitions from `true` to `false`, the overlay opacity transitions to `0` over `500ms` using a CSS `transition`
- [ ] After the transition completes (500ms), the component unmounts (removes from DOM)
- [ ] The `PathMap` component beneath is already rendered before fade-out completes, so the map is visible through the fading overlay
- [ ] The transition uses only CSS `opacity` and `transition`; no JavaScript animation frames
- [ ] `prefers-reduced-motion` media query is respected: if set, transition duration collapses to `0ms`

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | `LoadingAnimation` renders as a `position: fixed`, `inset: 0`, `z-index: 50` overlay when `isLoading` is `true` | Must | Full-screen coverage |
| FR-002 | Four cycling messages displayed using `setInterval(fn, 2000)` cleared on unmount | Must | No memory leak |
| FR-003 | CSS `@keyframes treeGrow` defined in `globals.css` animates height from `0%` to `100%` | Must | Thematic animation |
| FR-004 | Fade-out achieved via CSS `opacity` transition on `isVisible` state change | Must | Natural transition |
| FR-005 | Component unmounts 500ms after `isLoading` becomes `false` via `setTimeout` | Must | Clean DOM |
| FR-006 | All animation via CSS only; zero animation library imports | Must | Constitution: YAGNI |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| API responds in under 500ms (very fast) | Overlay begins fade-out before all messages cycle; fade-out starts as soon as `isLoading` is `false` |
| API responds before first 2-second message tick | First message stays displayed until fade-out begins |
| User navigates away during loading | Component unmounts; `setInterval` and `setTimeout` are cleared in `useEffect` cleanup |
| `prefers-reduced-motion: reduce` is active | `transition-duration` collapses to `0ms`; overlay disappears instantly |
| `isLoading` toggles rapidly (edge case in dev) | `useEffect` cleanup prevents stale intervals; latest `isLoading` value governs behavior |
| Animation not supported by browser | CSS fallback: static tree element visible; no JavaScript dependency |

---

## Key Entities

### LoadingAnimation Component

```
LoadingAnimation
  - Props: none (reads isLoading from useLifePathStore)
  - Internal State:
    - messageIndex: number (0-3, cycles via setInterval)
    - isVisible: boolean (controls opacity / unmount timing)
  - Renders:
    - Fixed full-screen overlay div (z-50, bg-gray-950/90)
    - Centered flex column:
      - .tree-grow animated div (CSS @keyframes treeGrow)
      - <p> with LOADING_MESSAGES[messageIndex]
    - CSS transition: opacity 500ms ease-out on isVisible change
  - Side Effects:
    - useEffect: start setInterval(2000) on mount, clear on unmount
    - useEffect: when isLoading=false, set isVisible=false,
                  schedule unmount via setTimeout(500)
```

### LOADING_MESSAGES Constant

```
LOADING_MESSAGES: readonly string[]
  [0] "🔍 경로를 탐색 중..."
  [1] "🌿 분기점을 찾는 중..."
  [2] "🔗 합류점을 연결하는 중..."
  [3] "🌱 나무를 심는 중..."
```

### CSS Keyframes (globals.css)

```css
@keyframes treeGrow {
  0%   { height: 0%;   opacity: 0; }
  50%  { height: 60%;  opacity: 0.7; }
  100% { height: 100%; opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

### Zustand Store Integration

```
useLifePathStore (existing)
  - isLoading: boolean — read by LoadingAnimation to trigger show/hide
  - No new state or actions needed for this feature
```

---

## Non-Functional Requirements

- Component file: `components/LoadingAnimation.tsx`
- Must be a Client Component (`'use client'` directive)
- No prop drilling: `isLoading` read directly from `useLifePathStore`
- TypeScript strict mode: no `any`, explicit return types
- Function body max 20 lines (Constitution rule)
- Max 2 nesting depth in JSX (Constitution rule)
- YAGNI: no features beyond the three user stories (no Framer Motion, no skeleton map)
- CSS keyframes in `app/globals.css`; no inline `<style>` tags

---

## Success Criteria

1. `LoadingAnimation` appears immediately when `generatePath()` is called and `isLoading` becomes `true`
2. All four messages cycle visibly during a 3–8 second API wait
3. CSS `treeGrow` animation plays continuously and loops without JavaScript
4. When `isLoading` returns `false`, the overlay fades to invisible over exactly 500ms
5. After fade-out, `LoadingAnimation` is removed from the DOM (no hidden overlay blocking interaction)
6. Dark theme rendering shows no color contrast issues against `#0f172a` background
7. No console errors or memory leak warnings related to `setInterval` / `setTimeout` after unmount
