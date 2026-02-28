# Tasks: Light Theme Support

**Input**: Design documents from `/specs/016-light-theme/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Basic theme provider setup

- [x] T001 Install `next-themes` and `lucide-react` (if not present for icons)
- [x] T002 Implement `components/theme-provider.tsx` to wrap the application
- [x] T003 Update `app/layout.tsx` to include `ThemeProvider`

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: CSS variables and basic toggle UI

- [x] T004 [P] Update `app/globals.css` to define light theme variables in `:root` and dark in `.dark`
- [x] T005 Create `components/ThemeToggle.tsx` component
- [x] T006 Add `ThemeToggle` to the main layout or header in `app/page.tsx` or similar

## Phase 3: User Story 1 - Toggle Theme (Priority: P1) 🎯 MVP
**Goal**: Users can toggle and see basic UI color changes

- [x] T007 Ensure Tailwind config `tailwind.config.ts` has `darkMode: "class"` enabled
- [x] T008 [P] Review and update hardcoded dark utility classes (`bg-gray-900`, etc.) to use CSS variables or `dark:` prefixes across basic components (buttons, cards, badges)

## Phase 4: User Story 2 - React Flow Canvas Theme Adaptation (Priority: P2)
**Goal**: Path map canvas and nodes look good in light mode

- [x] T009 Update `components/PathMap/PathMapCanvas.tsx` Background component colors (`color` prop) based on current theme hook (`useTheme`)
- [x] T010 Adjust node components (`GoalNode.tsx`, `StepNode.tsx`) to ensure glow effects (`box-shadow`) and borders are visible and have good contrast in light mode
- [x] T011 Verify track colors (Fast, Deep, Risk) in `lib/trackColors.ts` or constants have sufficient contrast in light mode

## Phase 5: Polish & Cross-Cutting Concerns
- [x] T012 Verify all panels (`DetailPanel.tsx`, `TimelineSlider.tsx`) render correctly in light mode
- [x] T013 Update `docs/issues/phase-3/FE-08-light-theme.md` status to `in-progress`
