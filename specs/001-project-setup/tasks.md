# Tasks: BE-01 프로젝트 초기 세팅

**Input**: Design documents from `/specs/001-project-setup/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Paths are relative to the Next.js project root (to be created)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Next.js project scaffold that all subsequent tasks depend on.

- [ ] T001 [US1] Bootstrap Next.js 14+ App Router + TypeScript project via `create-next-app@latest` with flags `--typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
- [ ] T002 [US1] Verify `tsconfig.json` has `"strict": true`, correct `paths` alias (`@/*`), and `moduleResolution: "bundler"`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tooling that ALL user stories depend on. Must complete before any story-level work.

**Warning: No user story work can begin until this phase is complete.**

- [ ] T003 [US2] Initialize shadcn/ui via `npx shadcn@latest init` with Default style, Slate base color, and CSS variables enabled
- [ ] T004 [US2] Install `next-themes` for class-based dark mode support: `npm install next-themes`
- [ ] T005 [P] [US3] Install `@xyflow/react@^12` and `@dagrejs/dagre` via `npm install @xyflow/react @dagrejs/dagre`
- [ ] T006 [P] [US4] Install Zustand via `npm install zustand`
- [ ] T007 [P] [US5] Create required directory structure: `mkdir -p types data store` (Next.js auto-creates `app/`, `components/`, `lib/` via scaffolding)
- [ ] T008 [US5] Create `.env.example` at project root per `contracts/env-contract.md` with `GEMINI_API_KEY` and `USE_MOCK` placeholders
- [ ] T009 [US5] Create `.env.local` from `.env.example` and verify it is in `.gitignore`

**Checkpoint**: Foundation ready — all packages installed, directories created, environment configured.

---

## Phase 3: User Story 1 — Next.js + TypeScript Project Bootstrap (Priority: P1) MVP

**Goal**: A working Next.js 14+ App Router project with TypeScript strict mode that passes `tsc --noEmit` with zero errors.

**Independent Test**: Run `npm run dev` and confirm http://localhost:3000 loads; run `npx tsc --noEmit` and confirm 0 errors.

### Implementation for User Story 1

- [ ] T010 [US1] Update `app/layout.tsx` to import `@xyflow/react/dist/style.css` and wrap children with `ThemeProvider` (from `next-themes`) configured with `defaultTheme="dark"` and `attribute="class"`
- [ ] T011 [US1] Replace `app/page.tsx` with a minimal placeholder page (heading + placeholder text) using dark Tailwind classes to confirm dark theme
- [ ] T012 [US1] Verify `npm run dev` starts without errors and page loads at http://localhost:3000
- [ ] T013 [US1] Verify `npx tsc --noEmit` reports zero TypeScript errors

**Checkpoint**: User Story 1 complete — Next.js dev server runs, TypeScript compiles cleanly.

---

## Phase 4: User Story 2 — Tailwind CSS + shadcn/ui Integration (Priority: P2)

**Goal**: Dark-themed Tailwind CSS with shadcn/ui `Button`, `Input`, and `Card` components available and rendering correctly.

**Independent Test**: Import `Button` and `Input` from `@/components/ui/` into `app/page.tsx` and confirm they render with dark theme styles in the browser.

### Implementation for User Story 2

- [ ] T014 [US2] Add shadcn/ui base components via `npx shadcn@latest add button input card`
- [ ] T015 [US2] Verify `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx` exist after shadcn/ui add
- [ ] T016 [US2] Update `app/page.tsx` placeholder to import and render `Button` and `Input` to validate component availability
- [ ] T017 [US2] Confirm dark mode CSS variables are present in `app/globals.css` (`.dark` selector with `--background`, `--foreground` etc.)

**Checkpoint**: User Story 2 complete — shadcn/ui components render with dark theme.

---

## Phase 5: User Story 3 — React Flow + dagre Installation (Priority: P3)

**Goal**: `@xyflow/react` v12 and `@dagrejs/dagre` installed and a basic React Flow canvas rendering without errors.

**Independent Test**: Create `components/FlowTest.tsx` with a minimal `<ReactFlow nodes={[]} edges={[]} />`, import it into a page, and confirm it renders with no console errors.

### Implementation for User Story 3

- [ ] T018 [US3] Create `components/FlowTest.tsx` as a `"use client"` component that renders a minimal `<ReactFlow nodes={[]} edges={[]} style={{ width: '400px', height: '300px' }} />` to validate the package works
- [ ] T019 [US3] Import `ReactFlow` from `@xyflow/react` (NOT from `reactflow`) in `FlowTest.tsx` to confirm correct package is used
- [ ] T020 [US3] Import and call `dagre.graphlib.Graph` with `rankdir: 'BT'` in a test utility to confirm dagre layout engine works with Bottom-to-Top direction
- [ ] T021 [US3] Confirm `@xyflow/react/dist/style.css` is imported in `app/layout.tsx` (from T010); verify Flow canvas renders without missing CSS warnings
- [ ] T022 [US3] Remove `FlowTest.tsx` smoke-test component after validation (keep real Flow implementation for FE-03)

**Checkpoint**: User Story 3 complete — React Flow v12 and dagre both confirmed working.

---

## Phase 6: User Story 4 — Zustand State Management Setup (Priority: P4)

**Goal**: A typed Zustand store scaffold at `store/usePathStore.ts` that compiles cleanly in TypeScript strict mode.

**Independent Test**: Import `usePathStore` in a client component, read `goal` and call `setGoal('test')`, and confirm TypeScript has no errors and the value updates.

### Implementation for User Story 4

- [ ] T023 [US4] Create `store/usePathStore.ts` with the full store scaffold from `data-model.md` (goal, pathMap, selectedTrack, timelineMonths, isLoading state + setters + reset)
- [ ] T024 [US4] Import `PathMap` and `PathId` types from `@/types` in the store and verify TypeScript strict mode compilation passes
- [ ] T025 [US4] Verify store compiles without errors by running `npx tsc --noEmit` after creating the store

**Checkpoint**: User Story 4 complete — Zustand store scaffold compiles cleanly.

---

## Phase 7: User Story 5 — Directory Structure & Environment Config (Priority: P5)

**Goal**: All 6 required directories exist and environment variable files are correctly configured and gitignored.

**Independent Test**: Run `ls` at project root and confirm `app/`, `components/`, `lib/`, `types/`, `data/`, `store/` exist. Run `git status` and confirm `.env.local` does not appear as a tracked file.

### Implementation for User Story 5

- [ ] T026 [US5] Create `types/index.ts` with the TypeScript type scaffold from `data-model.md` (Difficulty, PathId, TimeframeOption, PathNode, Path, MergePoint, PathMap interfaces)
- [ ] T027 [P] [US5] Create `data/.gitkeep` placeholder (populated by BE-03)
- [ ] T028 [P] [US5] Verify `app/`, `components/`, `lib/`, `types/`, `data/`, `store/` all exist at project root
- [ ] T029 [US5] Verify `.gitignore` contains `.env.local` entry (Next.js default should include it)
- [ ] T030 [US5] Commit `.env.example` to version control; confirm `git status` shows it as tracked and `.env.local` as untracked

**Checkpoint**: User Story 5 complete — directory structure set, env vars configured.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup before BE-02 can begin.

- [ ] T031 [P] Run `npx tsc --noEmit` and confirm 0 errors across all created files
- [ ] T032 [P] Run `npm run dev` and verify clean startup with no console errors or warnings
- [ ] T033 Verify `package.json` dependencies match the expected versions in `data-model.md` section 5
- [ ] T034 Follow `quickstart.md` from start to finish to verify a new developer can reproduce the setup
- [ ] T035 [P] Confirm `@xyflow/react` (v12) is in `node_modules` and legacy `reactflow` package is NOT present
- [ ] T036 Commit initial project setup with message: `feat: initialize project with Next.js 14, Tailwind, shadcn/ui, React Flow v12, Zustand`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately with `create-next-app`
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational phase (Phase 2)
  - US1 (Phase 3) must complete before US4 (Phase 6) — store imports types from US5
  - US5 (Phase 7) `types/index.ts` should be created before US4 store references it
  - Otherwise, US2, US3, US4, US5 can proceed in parallel after Phase 2
- **Polish (Phase 8)**: Depends on all user stories being complete

### Within Each User Story

- Installation tasks before configuration tasks
- Configuration before validation/verification
- Verification before next story

### Parallel Opportunities

- T005 (React Flow install) and T006 (Zustand install) and T007 (mkdir) can run in parallel
- T027 and T028 can run in parallel within US5
- T031 and T032 and T035 can run in parallel in Polish phase

---

## Implementation Strategy

### MVP First (Minimum Required for Next Feature)

1. Complete Phase 1: `create-next-app` — 5 min
2. Complete Phase 2: Install all packages + env setup — 8 min
3. Complete Phase 3 (US1): Layout + dark theme verification — 3 min
4. Complete Phase 4 (US2): shadcn/ui components verification — 2 min
5. **STOP and VALIDATE**: `npm run dev` + `tsc --noEmit` both pass
6. Hand off to BE-02, BE-03, BE-04, FE-01, FE-02

Total estimated time: **~20 minutes** (matches hackathon Phase 1 target of 0:00–0:20)
