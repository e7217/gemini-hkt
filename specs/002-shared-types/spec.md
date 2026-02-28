# Feature Specification: BE-02 공유 타입 정의 (Shared TypeScript Types)

**Feature Branch**: `001-shared-types`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "BE-02 공유 타입 정의: PathNode 인터페이스(id, title, description, duration, difficulty, isMergePoint, tips, monthsFromNow), Path 인터페이스(id, name, color, nodes), StartGoalNode 인터페이스, PathMap 타입, TrackType enum(Fast/Deep/Risk)"

## Overview

This feature defines the shared TypeScript type definitions used across both frontend and backend of the LifePath application. These types represent the core data model for AI-generated career/life path maps, including path nodes, tracks, merge points, and API request/response contracts.

The types serve as a single source of truth for all path-related data flowing between the Gemini AI backend (Next.js API routes) and the React Flow-based frontend visualization.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Developer Imports Shared Types (Priority: P1)

A backend developer implementing the `/api/paths/simulate` endpoint needs to use `PathMap`, `PathNode`, `Path`, and `StartGoalNode` types to define the Gemini AI response shape and return a type-safe API response.

**Why this priority**: This is the foundational contract between AI output and the application. Without it, neither the API endpoint nor the frontend can be built safely. All other features (BE-03, BE-04, BE-05, FE-03) depend on these type definitions being correct.

**Independent Test**: Can be fully tested by creating a TypeScript file that imports all types from `types/path.ts` and constructs a valid `PathMap` object — compilation succeeding with `tsc --noEmit` delivers value.

**Acceptance Scenarios**:

1. **Given** a backend developer creates a TypeScript file in the project, **When** they import `{ PathNode, Path, PathMap, StartGoalNode, MergePoint }` from `types/path.ts`, **Then** the TypeScript compiler resolves all types without errors.
2. **Given** a `PathMap` object is constructed with a `startNode: StartGoalNode`, `goalNode: StartGoalNode`, `paths: Path[]`, and `mergePoints: MergePoint[]`, **When** TypeScript strict-mode compilation runs, **Then** no type errors are reported.
3. **Given** a `PathNode` object is created with all required fields (id, title, description, duration, difficulty, isMergePoint, tips, monthsFromNow), **When** the `difficulty` field is assigned a value other than `"Low" | "Medium" | "High"`, **Then** TypeScript raises a compile-time error.

---

### User Story 2 - Frontend Developer Uses Types for React Flow Visualization (Priority: P2)

A frontend developer building the React Flow path map canvas needs to type the data received from the `/api/paths/simulate` API and transform it into React Flow nodes and edges.

**Why this priority**: The frontend visualization (FE-03) is a core Must feature. Type safety between the API response and the React Flow transformation utility prevents runtime errors in the path map rendering.

**Independent Test**: Can be fully tested by importing `PathMap` in a frontend utility file, writing a function signature `(map: PathMap) => { nodes: Node[], edges: Edge[] }`, and verifying TypeScript compiles without errors.

**Acceptance Scenarios**:

1. **Given** a frontend file imports `PathMap` from `types/path.ts`, **When** the imported type is used to annotate an API response variable, **Then** TypeScript IntelliSense provides field-level autocompletion for all nested properties.
2. **Given** a `Path` object from a `PathMap`, **When** its `nodes` property is iterated, **Then** each element is correctly typed as `PathNode` with all fields accessible.

---

### User Story 3 - API Request/Response Contract Definition (Priority: P3)

A developer implementing the simulate and branch API endpoints needs typed request bodies and response shapes for `POST /api/paths/simulate` and `POST /api/paths/branch`.

**Why this priority**: Typed API contracts prevent malformed requests and enable end-to-end type safety from API handler to frontend fetch call, but the API implementation itself (BE-04, BE-05) is separate from the type definition.

**Independent Test**: Can be tested independently by verifying that `SimulateRequest`, `SimulateResponse`, `BranchRequest`, and `BranchResponse` types exist and compile correctly in isolation.

**Acceptance Scenarios**:

1. **Given** a developer constructs a `SimulateRequest` object, **When** `timeframe` is set to a value other than `"1y" | "3y" | "5y"`, **Then** TypeScript raises a type error.
2. **Given** `BranchRequest` includes `currentPathMap: PathMap`, **When** it is used without the `currentPathMap` field, **Then** TypeScript raises a missing-required-property error.
3. **Given** `TrackType` enum is used to reference path track identifiers, **When** a developer uses `TrackType.Fast`, `TrackType.Deep`, or `TrackType.Risk`, **Then** these values are correctly typed and available for comparison.

---

### Edge Cases

- What happens when `PathNode.tips` is an empty array? — The type must allow `string[]` to be empty (no minimum length constraint at the type level).
- How does the system handle `PathNode.monthsFromNow` of 0 or negative values? — The type must allow any `number`; range validation is handled at the API layer (BE-04), not the type definition.
- What if `MergePoint.connectedPaths` references a path ID not present in `PathMap.paths`? — This is a semantic constraint, not enforced at the TypeScript type level. The API layer (BE-05 prompt engineering) must ensure consistency.
- What if `Path.id` needs to represent a dynamically generated branch sub-path? — `Path.id` is typed as `string` (not a union literal) to accommodate dynamic branch path IDs from the branch API.
- What if `StartGoalNode` and `PathNode` need to be used interchangeably? — They are distinct types; `StartGoalNode` has fewer fields. Functions expecting `PathNode` cannot accept `StartGoalNode` without explicit conversion.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define a `PathNode` interface with fields: `id: string`, `title: string`, `description: string`, `duration: string`, `difficulty: "Low" | "Medium" | "High"`, `isMergePoint: boolean`, `tips: string[]`, `monthsFromNow: number`.
- **FR-002**: System MUST define a `Path` interface with fields: `id: string`, `name: string`, `color: string`, `nodes: PathNode[]`.
- **FR-003**: System MUST define a `StartGoalNode` interface with fields: `id: string`, `title: string`, `description: string` — representing simplified start/goal nodes that do not carry timeline or difficulty metadata.
- **FR-004**: System MUST define a `MergePoint` interface with fields: `id: string`, `title: string`, `connectedPaths: string[]`, `message: string`.
- **FR-005**: System MUST define a `PathMap` type/interface aggregating: `startNode: StartGoalNode`, `goalNode: StartGoalNode`, `paths: Path[]`, `mergePoints: MergePoint[]`.
- **FR-006**: System MUST define a `TrackType` enum with values: `Fast = "fast"`, `Deep = "deep"`, `Risk = "risk"` — corresponding to the three AI-generated path tracks.
- **FR-007**: System MUST define `SimulateRequest` type: `{ goal: string; timeframe?: "1y" | "3y" | "5y" }`.
- **FR-008**: System MUST define `SimulateResponse` type as an alias or equivalent to `PathMap`.
- **FR-009**: System MUST define `BranchRequest` type: `{ pathId: string; currentNodeId: string; choice?: string; currentPathMap: PathMap }`.
- **FR-010**: System MUST define `BranchResponse` type: `{ paths: Path[]; mergePoints?: MergePoint[] }`.
- **FR-011**: The type definitions file MUST be importable from both the `app/` (frontend, Next.js App Router) and `app/api/` (backend API routes) directories.
- **FR-012**: All type definitions MUST be compatible with TypeScript strict mode (`"strict": true` in tsconfig.json).

### Key Entities

- **PathNode**: A single step or milestone in a life/career path. Contains timeline metadata (`monthsFromNow`, `duration`) and difficulty classification. When `isMergePoint: true`, this node is a convergence point accessible from multiple paths.
- **Path**: A track (Fast/Deep/Risk) containing an ordered sequence of `PathNode` objects. The `id` field uses `string` type (not a literal union) to support dynamically generated branch sub-paths from the branch API.
- **StartGoalNode**: A simplified node representing either the user's current position (startNode) or final goal (goalNode). Contains only identity and descriptive fields without timeline metadata.
- **MergePoint**: A convergence point where multiple paths meet. References connected path IDs and carries a motivational message displayed in the UI.
- **PathMap**: The top-level container for a complete Gemini AI path simulation response. Aggregates start/goal nodes, all paths, and all merge points.
- **TrackType**: An enum representing the three predefined track types. Values are lowercase strings matching the `Path.id` convention from the backend prompt schema.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: TypeScript compilation (`tsc --noEmit`) completes with zero errors when `types/path.ts` is imported in both `app/api/` and `app/` directories.
- **SC-002**: All 10 type definitions (PathNode, Path, StartGoalNode, MergePoint, PathMap, TrackType, SimulateRequest, SimulateResponse, BranchRequest, BranchResponse) are present and exported from a single file.
- **SC-003**: A developer can construct a complete mock `PathMap` object that satisfies all type constraints, verified by TypeScript strict-mode compilation — completing this task in under 5 minutes using IntelliSense autocompletion.
- **SC-004**: The `TrackType` enum values (`Fast`, `Deep`, `Risk`) match the path ID strings (`"fast"`, `"deep"`, `"risk"`) used in the Gemini prompt schema defined in `docs/04-backend-spec.md`.
- **SC-005**: `StartGoalNode` is structurally distinct from `PathNode` — a function typed to accept `StartGoalNode` cannot silently accept a `PathNode` without explicit handling.
