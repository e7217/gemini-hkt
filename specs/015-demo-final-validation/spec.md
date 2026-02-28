# Feature Specification: ALL-01 데모 테스트 + 최종 검증

**Feature Branch**: `010-demo-final-validation`
**Created**: 2026-02-28
**Status**: Draft
**Issue**: [ALL-01] 데모 테스트 + 최종 검증
**Phase**: Phase 3 (마무리) — 코드 수정 없음. 검증 및 테스트만.

## Overview

This feature is the final validation gate for the LifePath hackathon project. It is a **testing and validation task only** — no code changes are permitted. The goal is to confirm the 3-minute demo scenario runs end-to-end three consecutive times without errors, meeting all performance targets, under both Plan A (live Gemini API) and Plan B (mock mode).

Success is defined by a single checkpoint: **CP3 — "데모 3회 연속 성공"**.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — ACT 1: Demo Opening (Priority: P1)

A demo presenter clicks the dice button on the goal input screen. The app auto-fills "풀스택 개발자 되기" as the goal. The presenter clicks "경로 생성하기". A loading animation appears and then transitions to the path map. This takes no longer than 15 seconds.

**Why this priority**: ACT 1 is the very first thing judges see. If the opening fails, the entire demo is compromised. All other ACTs are unreachable without a successful ACT 1.

**Independent Test**: Navigate to the app home page. Click the 🎲 (random) button. Confirm "풀스택 개발자 되기" appears in the goal input field. Click "경로 생성하기". Confirm loading animation appears immediately. Confirm path map appears within 15 seconds.

**Acceptance Scenarios**:

1. **Given** the app is loaded at the home/input page, **When** the 🎲 button is clicked, **Then** the goal input field is auto-filled with "풀스택 개발자 되기" within 100ms, with no page reload or navigation.
2. **Given** the goal input field contains "풀스택 개발자 되기", **When** "경로 생성하기" is clicked, **Then** a loading animation is displayed immediately (within 300ms of the click).
3. **Given** the loading animation is displayed, **When** the Gemini API (Plan A) or mock data (Plan B) responds, **Then** the UI transitions to the path map view with 3 distinct tracks visible, completing within 15 seconds.
4. **Given** Plan A (live API) is active, **When** the transition to path map completes, **Then** no console errors are present, and the map renders with start node, 3 path tracks, and at least 1 merge point.
5. **Given** Plan B (USE_MOCK=true) is active, **When** the transition to path map completes, **Then** the result is visually identical to Plan A — the same 3-path layout is displayed with no indication of mock mode in the UI.

---

### User Story 2 — ACT 2: Path Map Exploration (Priority: P1)

A demo presenter, now viewing the 3-path vertical map, demonstrates path growth by using the timeline slider. The slider moves from 1 year to 3 years to 5 years, causing nodes to progressively appear. Each slider movement responds within 300ms.

**Why this priority**: ACT 2 is the core visual demonstration of LifePath's value — showing that a life path grows over time. The timeline slider is the primary interactive element showcasing this. Failure here undermines the "당신의 나무가 자랍니다" narrative.

**Independent Test**: With the path map visible, verify the 3-track vertical layout is correct. Move the timeline slider from "1년" to "3년" to "5년". Confirm nodes progressively appear at each interval. Confirm each slider movement responds within 300ms.

**Acceptance Scenarios**:

1. **Given** the path map is displayed, **When** the presenter observes the map, **Then** exactly 3 vertical tracks (Fast Track, Deep Dive, Risk Path) are visible as separate columns, each with at least 1 node rendered at the default timeline position.
2. **Given** the timeline slider is at the "1년" position, **When** the slider is dragged to "3년", **Then** additional nodes appear on each track within 300ms, visually expanding the paths.
3. **Given** the timeline slider is at the "3년" position, **When** the slider is dragged to "5년", **Then** further nodes appear within 300ms, extending each track toward the goal node.
4. **Given** the timeline slider moves to any position, **When** the transition completes, **Then** no console errors occur and the node count for each track matches the expected count for that timeframe.
5. **Given** the path map is fully rendered at "5년", **When** the presenter observes the layout, **Then** nodes appear in a logical vertical sequence (start → intermediate → merge → goal) on each track, with consistent visual styling across tracks.

---

### User Story 3 — ACT 3: Merge Point Interaction (Priority: P1)

A demo presenter, at the climactic moment, highlights the merge point node at the top of the map. The merge point displays a multi-color gradient visual indicating convergence of all 3 tracks. Clicking any node opens a detail panel. Clicking a track highlights it distinctly.

**Why this priority**: ACT 3 is the emotional climax — "어떤 길이든 괜찮다". The merge point visual and the detail panel interaction together deliver the core message. A failure in this ACT destroys the most impactful part of the demo.

**Independent Test**: With the 5-year path map visible, locate the merge point node. Confirm it displays a multi-color gradient. Click any step node. Confirm a detail panel opens with the node's label, description, and relevant data. Click on a track/path. Confirm that track is highlighted while others are de-emphasized.

**Acceptance Scenarios**:

1. **Given** the full path map is visible, **When** the presenter observes the merge point node, **Then** it displays a visually distinct multi-color gradient (not a single solid color) indicating the convergence of all 3 tracks.
2. **Given** the merge point is visible, **When** a step node on any track is clicked, **Then** a detail panel opens within 300ms, displaying the node's label, description, and at least the node type and track information.
3. **Given** a detail panel is open, **When** the presenter observes the panel, **Then** no console errors are present and the panel content is fully readable (no overflow, no missing text).
4. **Given** the path map is visible with multiple tracks, **When** the presenter clicks on a specific track or its nodes, **Then** that track becomes visually highlighted (brighter or more opaque) and the other tracks are de-emphasized, within 300ms of the click.
5. **Given** a track is highlighted, **When** the presenter clicks elsewhere or on a different track, **Then** the highlight transitions correctly without UI glitches or stuck highlight states.

---

### User Story 4 — ACT 4: Closing Screen (Priority: P2)

A demo presenter reaches the closing state of the demo. The final visual clearly presents the LifePath message. The app has no lingering errors, no spinning loaders, and is ready for a clean restart if needed for a subsequent run.

**Why this priority**: ACT 4 is 10 seconds but serves as the punctuation mark. Judges see the final state. An error message or broken UI at the end leaves a negative last impression. It is P2 because failure here does not technically break the demo, but it damages the overall presentation.

**Independent Test**: After completing ACT 1-3, confirm the closing screen or final state displays cleanly. Confirm the browser console shows zero errors. Confirm the app can be reset (navigate back to input screen or refresh) to start a new demo run without page errors.

**Acceptance Scenarios**:

1. **Given** the demo has progressed through ACT 1–3, **When** ACT 4 is reached (final map state with merge point highlighted), **Then** the screen displays a clean, complete state — no loading spinners, no empty content areas.
2. **Given** the final demo state is displayed, **When** the browser console is inspected, **Then** zero JavaScript errors or React rendering errors are present.
3. **Given** the demo has completed one run, **When** the presenter navigates back to the input screen (via browser back, refresh, or a reset control), **Then** the input screen loads cleanly without leftover state from the previous run.
4. **Given** the app is reset, **When** the demo cycle starts again from ACT 1, **Then** the app is fully functional for a fresh run — no degradation of performance or state from the previous run.

---

## Edge Cases

- **API timeout (Plan A)**: If the Gemini API takes longer than 15 seconds to respond, the loading animation must still be visible and not stuck. The app should not freeze. The fallback mechanism (if implemented in previous phases) should activate.
- **Network interruption mid-demo (Plan A)**: If the network drops after the request is sent, the loading animation must not spin indefinitely. Verify that either a graceful error message appears or the mock fallback activates.
- **Plan B switch during the session**: Switching from Plan A to Plan B requires restarting the dev server with `USE_MOCK=true`. Confirm the app starts cleanly and the UI looks identical to Plan A mode.
- **Browser console errors from third-party scripts**: Distinguish between errors from the LifePath application code versus injected browser extensions or third-party scripts. Only LifePath-originating errors are in scope.
- **Rapid slider dragging**: Moving the timeline slider very quickly across all positions should not produce race conditions, duplicate nodes, or console errors.
- **Node detail panel re-open**: Clicking a second node while the detail panel is already open for a different node should either update the panel cleanly or close and reopen it — not show stacked or corrupted panel states.
- **3rd consecutive run state**: After 2 prior runs, the app must not show accumulated state from previous runs (e.g., duplicate nodes, cached incorrectly). Each run must be as clean as the first.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The demo MUST complete ACT 1 (dice click → goal auto-fill → generate click → loading → path map) within 15 seconds, end-to-end.
- **FR-002**: The dice button MUST auto-fill "풀스택 개발자 되기" (or a designated demo goal) into the goal input field without requiring manual typing.
- **FR-003**: The loading animation MUST appear within 300ms of clicking "경로 생성하기" and MUST remain visible until the path map is ready.
- **FR-004**: The path map MUST display exactly 3 vertical tracks (Fast Track, Deep Dive, Risk Path) with nodes for each track.
- **FR-005**: The timeline slider MUST progressively reveal nodes as it moves from "1년" → "3년" → "5년", with each transition completing within 300ms.
- **FR-006**: The merge point node MUST display a visually distinct multi-color gradient differentiating it from standard step nodes.
- **FR-007**: Clicking any path node MUST open a detail panel within 300ms showing the node's label, description, and metadata.
- **FR-008**: Clicking on a track (path lane) MUST highlight that track and de-emphasize the others within 300ms.
- **FR-009**: Plan B mode (USE_MOCK=true) MUST produce a UI visually identical to Plan A mode — no "mock" label, banner, or visual difference.
- **FR-010**: The browser console MUST show zero JavaScript errors from the LifePath application during any complete demo run.
- **FR-011**: The app MUST support at least 3 consecutive full demo runs (ACT 1–4) without requiring a server restart between runs.
- **FR-012**: The app MUST be resettable to the input screen state between demo runs by navigating back or refreshing, with no lingering broken UI state.

### Non-Functional Requirements

**Performance**:
- API response time (Gemini, Plan A): ≤ 15 seconds (measured from "경로 생성하기" click to path map fully rendered).
- Map rendering time (Plan B mock, Plan A after API response): ≤ 3 seconds from receiving data to full map display.
- Timeline slider response: ≤ 300ms from slider interaction to node appearance.
- Node click to detail panel open: ≤ 300ms.
- Track highlight on click: ≤ 300ms.

**Reliability**:
- 3 consecutive demo runs with 0 console errors, 0 UI crashes, 0 stuck loading states.
- Plan B mode must be 100% reliable (no network dependency).

**Compatibility**:
- Primary demo browser: Chrome (latest stable version).
- Secondary validation: Firefox (latest stable).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The complete 3-minute demo scenario (ACT 1 → ACT 2 → ACT 3 → ACT 4) runs successfully end-to-end, measured 3 consecutive times.
- **SC-002**: Plan A (live Gemini API) completes ACT 1 API call within 15 seconds in all 3 runs.
- **SC-003**: Plan B (USE_MOCK=true) completes ACT 1 path map load within 3 seconds in all 3 runs.
- **SC-004**: Timeline slider transitions (1년 → 3년 → 5년) complete within 300ms per movement in all 3 runs.
- **SC-005**: Node detail panel opens within 300ms of click in all 3 runs.
- **SC-006**: Track highlight activates within 300ms of click in all 3 runs.
- **SC-007**: Browser console shows 0 JavaScript errors from LifePath application code in all 3 runs.
- **SC-008**: Plan A and Plan B are visually indistinguishable — no UI element indicates which mode is active.
- **SC-009**: CP3 is achieved — "데모 3회 연속 성공" confirmed and documented.
