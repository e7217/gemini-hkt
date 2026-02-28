# Tasks: Timeline Scroll Sync

**Input**: Design documents from `/specs/017-timeline-scroll-sync/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup & Foundational
**Purpose**: Update store and intercept scroll events.

- [x] T001 Update `components/PathMap/PathMapCanvas.tsx` to capture `onWheel` events and optionally prevent default React Flow zoom based on user preferences or interaction mode.
- [x] T002 Implement a debounced or throttled scroll handler (`lib/timelineFilter.ts` or directly in component) to translate vertical scroll deltas into `month` increments/decrements.

## Phase 2: User Story 1 - Time Travel via Scrolling (Priority: P1)
**Goal**: Update the timeline state based on scroll.

- [x] T003 Connect the scroll handler in `PathMapCanvas.tsx` to the Zustand store (`store/useLifePathStore.ts` or `usePathStore.ts`) to adjust `currentMonths`.
- [x] T004 Ensure timeline value respects `0` to `maxMonths` boundaries when scrolling.

## Phase 3: User Story 2 - Smooth Viewport Updates (Priority: P2)
**Goal**: Auto-focus on newly revealed nodes.

- [x] T005 Update `components/PathMap/PathMapCanvas.tsx` to use `useReactFlow()` and observe the `visibleNodes` or global `timelineState`.
- [x] T006 Implement logic: When a new node is revealed (timeline advances past its `startMonth`), use `setCenter` or `fitView` to smoothly pan to the new node.
- [x] T007 Ensure reverse scrolling (hiding nodes) pans back to the previously active node by tracking the most recent visible node in the current timeline state.

## Phase 4: Polish & Cross-Cutting Concerns
- [x] T008 Test and adjust scroll sensitivity and debounce timing for smooth UX, preventing jittering.
- [x] T009 Ensure desktop mouse wheel and trackpad scroll behave consistently.
- [x] T010 Resolve interaction conflicts between scrolling for time and native map panning (e.g., consider requiring a modifier key like Shift, or a toggle button in the UI for "Time Travel Mode").
