# Feature Specification: BE-01 프로젝트 초기 세팅

**Feature Branch**: `001-project-setup`
**Created**: 2026-02-27
**Status**: Draft
**Input**: BE-01 프로젝트 초기 세팅: Next.js 14+ App Router + TypeScript 프로젝트 생성, Tailwind CSS 설정, shadcn/ui 설치 및 기본 컴포넌트 설정, React Flow(@xyflow/react v12) + dagre(@dagrejs/dagre) 설치, Zustand 상태관리 설치

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Next.js + TypeScript Project Bootstrap (Priority: P1)

A developer setting up the LifePath project for the first time needs a working Next.js 14+ App Router project with TypeScript strict mode configured so that all subsequent frontend and backend work can begin immediately.

**Why this priority**: This is the foundational prerequisite for all other features (BE-02, BE-03, BE-04, FE-01, FE-02). Nothing can be implemented until the project runs. It is the very first task in the 6-hour hackathon timeline (0:00–0:20).

**Independent Test**: Can be fully tested by running `npm run dev` and observing a default Next.js page loading at `localhost:3000`, and by running `tsc --noEmit` to confirm zero TypeScript errors.

**Acceptance Scenarios**:

1. **Given** no project exists, **When** the developer runs `npm run dev`, **Then** the Next.js development server starts without errors and the default page loads at `localhost:3000`.
2. **Given** the project is initialized, **When** the developer runs `tsc --noEmit`, **Then** TypeScript strict mode compilation reports zero errors.
3. **Given** the project is initialized, **When** the developer inspects `tsconfig.json`, **Then** `strict: true` is present and `target` is set to ES2017 or later.

---

### User Story 2 - Tailwind CSS + shadcn/ui Integration (Priority: P2)

A developer needs Tailwind CSS configured and shadcn/ui components installed so that the LifePath dark-themed UI (dark mode default, track color system) can be built immediately.

**Why this priority**: shadcn/ui is referenced throughout the frontend spec as the UI component library. Tailwind CSS is the primary styling mechanism. Dark mode is a Must requirement (K-1). Both must be in place before any UI work begins.

**Independent Test**: Can be fully tested by importing a `Button` and `Input` component from shadcn/ui into a page and confirming they render correctly in the browser with Tailwind styles applied.

**Acceptance Scenarios**:

1. **Given** the project is initialized, **When** a developer adds `className="bg-background text-foreground"` to an element, **Then** the dark theme Tailwind colors are applied correctly in the browser.
2. **Given** shadcn/ui is installed, **When** a developer imports `import { Button } from "@/components/ui/button"`, **Then** the import resolves without errors and the component renders.
3. **Given** the project runs, **When** a developer checks `globals.css`, **Then** shadcn/ui CSS variables for dark mode are present.

---

### User Story 3 - React Flow + dagre Installation (Priority: P3)

A developer needs `@xyflow/react` v12 and `@dagrejs/dagre` installed and a basic React Flow canvas rendering so that the core path visualization feature (the vertical tree map) can be built.

**Why this priority**: React Flow is the core visualization engine for the entire LifePath experience. Without it, the main demo screen cannot be built. It must be installed before FE-03 (React Flow Map) work begins.

**Independent Test**: Can be fully tested by creating a simple React Flow canvas with two nodes and one edge and confirming it renders without console errors.

**Acceptance Scenarios**:

1. **Given** `@xyflow/react` is installed, **When** a developer renders a `<ReactFlow nodes={[]} edges={[]} />` component, **Then** the React Flow canvas mounts without errors and the `@xyflow/react` CSS styles are applied.
2. **Given** `@dagrejs/dagre` is installed, **When** a developer imports `import dagre from "@dagrejs/dagre"` and creates a graph, **Then** dagre layout calculation completes without errors.
3. **Given** both libraries are installed, **When** a developer checks `package.json`, **Then** `@xyflow/react` version is `^12.0.0` or later and `@dagrejs/dagre` is present.

---

### User Story 4 - Zustand State Management Setup (Priority: P4)

A developer needs Zustand installed and a basic store scaffold created so that global state (path data, selected track, timeline slider value) can be managed across the application.

**Why this priority**: Zustand is the state management solution referenced in the frontend spec (A-5). It is needed before any interactive feature (node selection, timeline slider, track highlighting) can be implemented.

**Independent Test**: Can be fully tested by creating a minimal Zustand store, reading its state in a component, and verifying the component renders the state value correctly.

**Acceptance Scenarios**:

1. **Given** Zustand is installed, **When** a developer creates a store with `create<StoreType>()(...)`, **Then** the store is created without TypeScript errors in strict mode.
2. **Given** a Zustand store exists, **When** a developer imports and uses `useStore` in a React component, **Then** the component renders the initial state value correctly.
3. **Given** the project runs, **When** a developer inspects `store/`, **Then** a typed Zustand store file for path/UI state exists.

---

### User Story 5 - Project Directory Structure & Environment Config (Priority: P5)

A developer needs the standard LifePath directory structure (`app/`, `components/`, `lib/`, `types/`, `data/`, `store/`) and environment variable files (`.env.local`, `.env.example`) in place so that the team can immediately begin placing code in the correct locations.

**Why this priority**: The directory structure is a prerequisite for all subsequent tasks. The environment variable setup ensures GEMINI_API_KEY can be configured safely without leaking secrets.

**Independent Test**: Can be fully tested by confirming all six directories exist and `.env.example` contains the expected variable placeholders.

**Acceptance Scenarios**:

1. **Given** the project is initialized, **When** a developer inspects the repository root, **Then** directories `app/`, `components/`, `lib/`, `types/`, `data/`, `store/` all exist.
2. **Given** `.env.example` exists, **When** a developer opens it, **Then** `GEMINI_API_KEY=` placeholder is present.
3. **Given** `.env.local` is created from `.env.example`, **When** the developer sets a dummy API key and runs `npm run dev`, **Then** the server starts and the environment variable is accessible in server-side code.

---

### Edge Cases

- What happens when `@xyflow/react` v12 is not available and the older `reactflow` package is installed instead? — React Flow must explicitly use the `@xyflow/react` package (not `reactflow`) as the API differs significantly in v12.
- How does the system handle Node.js version incompatibility? — The project should specify the required Node.js version (>=18) in `.nvmrc` or `package.json` engines field.
- What happens if shadcn/ui CLI initialization fails due to missing `components.json`? — The `components.json` configuration file must be committed so shadcn/ui components can be added without re-initialization.
- How does the system handle TypeScript path alias resolution for `@/` imports? — `tsconfig.json` must include `paths: { "@/*": ["./*"] }` and Next.js must be configured to resolve them.
- What happens when `GEMINI_API_KEY` is not set in `.env.local`? — API routes that require the key must return a descriptive error rather than crashing silently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize a Next.js 14+ project with App Router enabled and TypeScript strict mode active.
- **FR-002**: System MUST configure Tailwind CSS with the default Next.js + shadcn/ui integration.
- **FR-003**: System MUST install and configure shadcn/ui with dark mode as the default theme.
- **FR-004**: System MUST install `@xyflow/react` at version 12 or later (NOT the legacy `reactflow` package).
- **FR-005**: System MUST install `@dagrejs/dagre` for graph layout computation.
- **FR-006**: System MUST install Zustand for client-side state management.
- **FR-007**: System MUST create the directory structure: `app/`, `components/`, `lib/`, `types/`, `data/`, `store/`.
- **FR-008**: System MUST provide `.env.local` (gitignored) and `.env.example` (committed) files with `GEMINI_API_KEY` placeholder.
- **FR-009**: System MUST ensure all installed packages resolve without TypeScript compilation errors in strict mode.
- **FR-010**: System MUST configure the `@/` path alias so components and utilities can be imported with `@/components/...` and `@/lib/...`.

### Key Entities *(include if feature involves data)*

- **Project Configuration**: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `components.json` — the foundational configuration files that define the project's behavior.
- **Environment Variables**: `GEMINI_API_KEY` — sensitive API credentials that must only exist server-side and never be exposed to the client bundle.
- **Directory Structure**: `app/` (Next.js routes), `components/` (UI components), `lib/` (utilities), `types/` (TypeScript type definitions), `data/` (preset/static data), `store/` (Zustand stores).
- **shadcn/ui Component Registry**: `components/ui/` — the location where shadcn/ui generates component files (Button, Input, Card, etc.).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm run dev` starts the development server in under 30 seconds with zero startup errors.
- **SC-002**: `tsc --noEmit` reports zero TypeScript errors with strict mode enabled.
- **SC-003**: A developer can import and render a shadcn/ui `Button` component in under 60 seconds from project open, with no additional configuration steps.
- **SC-004**: A developer can import and render a basic `<ReactFlow>` canvas with zero console errors.
- **SC-005**: A developer can create and consume a Zustand store within a React component with zero TypeScript errors.
- **SC-006**: All six required directories (`app/`, `components/`, `lib/`, `types/`, `data/`, `store/`) exist at project root.
- **SC-007**: `.env.example` is committed to the repository and `.env.local` is listed in `.gitignore`.
- **SC-008**: The entire setup can be reproduced by a new team member following only the `quickstart.md` guide in under 10 minutes.
