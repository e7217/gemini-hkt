# Feature Specification: Timeline Scroll Sync

**Feature Branch**: `017-timeline-scroll-sync`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User description: "스크롤에 따라서 해당 날짜의 노드로 이동하면 어떨까? 경로마다 대략적인 날짜가 있을거 아니야"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Time Travel via Scrolling (Priority: P1)

As a user exploring my life path, I want to use my mouse wheel or trackpad scroll to move forward and backward in time, so that I can intuitively reveal or hide future steps without manually interacting with a slider component.

**Why this priority**: This provides a more natural, fluid, and immersive way to navigate the chronological progression of the life path map, directly addressing the core request.

**Independent Test**: Can be fully tested by hovering over the map canvas and scrolling up/down. The timeline state should update, and nodes should appear/disappear according to the new timeline value.

**Acceptance Scenarios**:

1. **Given** the user is viewing the life path map at a specific timeline state, **When** they scroll down (or swipe up on a trackpad), **Then** the timeline should advance (increase months) and reveal future nodes.
2. **Given** the user has advanced the timeline, **When** they scroll up (or swipe down), **Then** the timeline should reverse (decrease months) and hide future nodes.

---

### User Story 2 - Smooth Viewport Updates (Priority: P2)

As a user navigating through time, I want the map to automatically adjust its view to focus on the newly revealed nodes, so that I don't lose track of where I am in my life path.

**Why this priority**: It ensures that as the map expands or contracts over time, the user's focal point remains on the relevant active nodes.

**Independent Test**: Can be fully tested by scrolling to reveal a node that would normally appear outside the current viewport. The map should automatically pan/zoom to include it.

**Acceptance Scenarios**:

1. **Given** the user scrolls to advance the timeline, **When** a new node is added to the visible map, **Then** the map viewport should smoothly update to ensure the new node is visible.

### Edge Cases

- What happens when the user scrolls very fast? (System should debounce or throttle the scroll events to prevent performance lag or skipping too many months too quickly).
- What happens when the timeline reaches its minimum or maximum bounds (e.g., 0 months or end of path)? (The scroll should simply stop updating the timeline, and visual feedback could indicate the limit).
- How does the system handle conflicting trackpad gestures (e.g., pinch-to-zoom vs. two-finger scroll)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect vertical scroll wheel and trackpad scroll events within the map canvas area.
- **FR-002**: The system MUST translate scroll events into incremental changes to the global timeline state (e.g., months).
- **FR-003**: The system MUST define a reasonable "scroll step" so that one notch of a mouse wheel corresponds to a logical jump in time (e.g., 1 month or 3 months per step).
- **FR-004**: The system MUST respect the minimum and maximum boundaries of the timeline (e.g., from 0 to the maximum duration of the generated path).
- **FR-005**: The system MUST resolve interaction conflicts between scrolling for time and the default map behaviors [NEEDS CLARIFICATION: Should time-scrolling completely replace the map's native zoom/pan-on-scroll behavior, or should it require a modifier key like Shift or Ctrl?]
- **FR-006**: The system MUST visually update the map by filtering nodes and edges based on the scroll-updated timeline state.

### Key Entities

- **Timeline State**: Represents the current chronological point in the user's life path.
- **Scroll Event**: The user's input mechanism used to modify the Timeline State.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from the start to the end of their life path using only the scroll wheel in under 5 seconds.
- **SC-002**: The timeline updates in real-time without perceived jitter or performance degradation during continuous scrolling.
- **SC-003**: 100% of newly revealed nodes remain within the visible boundaries of the map viewport after a scroll interaction completes.