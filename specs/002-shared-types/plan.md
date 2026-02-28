# Implementation Plan: BE-02 공유 타입 정의 (Shared TypeScript Types)

**Branch**: `001-shared-types` | **Date**: 2026-02-27 | **Spec**: `/specs/001-shared-types/spec.md`
**Input**: Feature specification from `/specs/001-shared-types/spec.md`

## Summary

Define a single TypeScript file (`types/path.ts`) at the project root that exports all shared type definitions for the LifePath path map domain. This file will serve as the single source of truth for 10 type definitions (6 interfaces, 1 enum, 3 API contract types) shared between the Next.js App Router frontend and the `/api/` backend routes.

The implementation is a pure TypeScript declaration file with no runtime logic. It requires no external dependencies beyond the existing TypeScript configuration. All types are derived directly from the Gemini AI prompt schema defined in `docs/04-backend-spec.md`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: None — pure type declarations only
**Storage**: N/A
**Testing**: TypeScript compiler (`tsc --noEmit`) for type validation
**Target Platform**: Next.js 14+ (App Router) monorepo — runs on Vercel
**Project Type**: Shared type library within a Next.js web application
**Performance Goals**: N/A — compile-time types have no runtime cost
**Constraints**: Must be importable from both `app/` (frontend) and `app/api/` (backend) without circular dependencies; TypeScript strict mode compliant
**Scale/Scope**: Single file, ~80-120 lines, 10 type exports

## Constitution Check

Constitution Check skipped — `.specify/memory/constitution.md` not found.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-types/
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model output
├── quickstart.md        # Phase 1 quickstart output
├── contracts/           # Phase 1 API contracts
│   ├── simulate-api.md
│   └── branch-api.md
└── tasks.md             # Phase 2 tasks output
```

### Source Code (repository root)

```text
types/
└── path.ts              # Single shared type definitions file

# Next.js App Router structure (existing)
app/
├── api/
│   └── paths/
│       ├── simulate/
│       │   └── route.ts    # imports from types/path.ts
│       └── branch/
│           └── route.ts    # imports from types/path.ts
└── [page components]       # import from types/path.ts
```

**Structure Decision**: Single project (Next.js monorepo). Type definitions live at the project root `types/` directory — accessible from both `app/` and `app/api/` without path aliasing issues (Next.js supports root-relative imports or `@/types/path` with `tsconfig.json` path alias).

## Complexity Tracking

No constitution violations detected. Implementation is intentionally minimal — a single file with pure type declarations.

## Implementation Phases

### Phase 0: Research (Complete — see research.md)

- Verified all type field names and types against `docs/04-backend-spec.md`
- Confirmed `TrackType` enum values against prompt schema (`fast`, `deep`, `risk` — "explorer" renamed to "risk" per `docs/issues/phase-1/BE-02-shared-types.md`)
- Confirmed `Path.id` must be `string` (not literal union) per BE-02 tech note
- Confirmed `StartGoalNode` separation rationale (startNode/goalNode don't need timeline fields)

### Phase 1: Design (Complete — see data-model.md and contracts/)

- All 10 types designed and cross-validated
- API contracts defined for simulate and branch endpoints
