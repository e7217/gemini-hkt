# Feature Specification: Light Theme Support

**Feature Branch**: `016-light-theme`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User description: "FE-08 Light Theme Support"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Theme (Priority: P1)
As a user, I want to toggle between light and dark themes, so that I can use the application comfortably in different lighting conditions.

**Why this priority**: Essential for supporting a light theme feature.
**Independent Test**: Can be fully tested by clicking the theme toggle button and observing the UI changing colors.

**Acceptance Scenarios**:
1. **Given** the app is in dark mode, **When** the user clicks the toggle button to light mode, **Then** the UI background becomes light and text becomes dark.
2. **Given** the app is in light mode, **When** the user refreshes the page, **Then** the app remains in light mode.

### User Story 2 - React Flow Canvas Theme Adaptation (Priority: P2)
As a user viewing the career path map, I want the canvas background and track colors to remain legible and visually appealing in light mode.

**Why this priority**: The core feature of the app is the path map.
**Independent Test**: Can be tested by viewing the React Flow canvas in light mode and ensuring nodes, edges, and grid are visible.

**Acceptance Scenarios**:
1. **Given** the app is in light mode, **When** viewing the path map, **Then** the canvas background is light and the dots/grid are visible.
2. **Given** the app is in light mode, **When** viewing nodes, **Then** the track colors (Fast, Deep, Risk) have proper contrast against the light background.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a theme toggle button in the UI header.
- **FR-002**: System MUST support `next-themes` for theme state management.
- **FR-003**: System MUST adjust Tailwind CSS variables in `globals.css` for light mode.
- **FR-004**: System MUST dynamically change React Flow canvas background colors based on the current theme.
- **FR-005**: System MUST ensure node glow effects (`box-shadow`) are visible in light mode.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Users can successfully switch themes using the toggle button.
- **SC-002**: No contrast accessibility issues (WCAG AA) for text and core map elements in light mode.