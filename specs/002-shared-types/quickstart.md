# Quickstart: BE-02 공유 타입 정의 (Shared TypeScript Types)

**Date**: 2026-02-27 | **Branch**: `001-shared-types` | **Estimated Time**: 15 minutes

## What Will Be Built

A single TypeScript file `types/path.ts` containing 10 shared type definitions (7 interfaces, 1 enum, 2 type aliases + 2 type aliases for API contracts) used across the entire LifePath application.

## Prerequisites

- [ ] BE-01 (Project Setup) complete — Next.js + TypeScript project exists
- [ ] `tsconfig.json` configured with `"strict": true`
- [ ] Recommended: `"paths": { "@/*": ["./*"] }` in tsconfig for clean imports

## Implementation Steps

### Step 1: Create types directory

```bash
mkdir -p types
```

### Step 2: Create types/path.ts

Create `/types/path.ts` with the following content (from `data-model.md`):

```typescript
// ===== ENUMS =====

/**
 * TrackType represents the three predefined life path tracks.
 * Values match the path IDs used in the Gemini prompt schema.
 */
export enum TrackType {
  Fast = "fast",   // Fast Track: 빠른 성과 (#F59E0B gold)
  Deep = "deep",   // Deep Dive: 깊이 있는 학습 (#3B82F6 blue)
  Risk = "risk",   // Risk Path: 창의적 탐험 (#8B5CF6 purple)
}

// ===== CORE INTERFACES =====

/**
 * PathNode represents a single step or milestone in a life/career path.
 */
export interface PathNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Low" | "Medium" | "High";
  isMergePoint: boolean;
  tips: string[];
  monthsFromNow: number;
}

/**
 * Path represents a single track with an ordered sequence of nodes.
 */
export interface Path {
  id: string;
  name: string;
  color: string;
  nodes: PathNode[];
}

/**
 * StartGoalNode is a simplified node for startNode and goalNode.
 */
export interface StartGoalNode {
  id: string;
  title: string;
  description: string;
}

/**
 * MergePoint represents a convergence point where multiple paths meet.
 */
export interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];
  message: string;
}

/**
 * PathMap is the top-level container for a complete path simulation.
 */
export interface PathMap {
  startNode: StartGoalNode;
  goalNode: StartGoalNode;
  paths: Path[];
  mergePoints: MergePoint[];
}

// ===== SUPPORTING INTERFACES =====

export interface TimelineMetadata {
  duration: string;
  monthsFromNow: number;
  estimatedEndDate?: Date;
}

export interface AnonymousSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  pathHistory: string[];
}

// ===== API CONTRACT TYPES =====

export type SimulateRequest = {
  goal: string;
  timeframe?: "1y" | "3y" | "5y";
};

export type SimulateResponse = PathMap;

export type BranchRequest = {
  pathId: string;
  currentNodeId: string;
  choice?: string;
  currentPathMap: PathMap;
};

export type BranchResponse = {
  paths: Path[];
  mergePoints?: MergePoint[];
};
```

### Step 3: Verify TypeScript compilation

```bash
npx tsc --noEmit
```

Expected: zero errors.

### Step 4: Test import in backend

Create a temporary test file to verify imports work from both contexts:

```typescript
// app/api/paths/simulate/route.ts (import test)
import type { SimulateRequest, SimulateResponse, PathMap } from "@/types/path";
```

```typescript
// app/components/PathMap.tsx (import test)
import type { PathMap, PathNode, TrackType } from "@/types/path";
```

### Step 5: Remove test imports

Once verified, remove the temporary import tests (the actual API route and component implementations are separate features).

## Acceptance Criteria Verification

- [ ] `types/path.ts` exists at project root
- [ ] All 10 type definitions exported (PathNode, Path, StartGoalNode, MergePoint, PathMap, TrackType, TimelineMetadata, AnonymousSession, SimulateRequest, SimulateResponse, BranchRequest, BranchResponse)
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `Path.id` is typed as `string` (not literal union)
- [ ] `TrackType` enum has Fast/Deep/Risk values
- [ ] `difficulty` field uses `"Low" | "Medium" | "High"` union
- [ ] `BranchRequest.currentPathMap` is required

## Common Pitfalls

1. **Do not** use `interface PathMap` with `PathMap = PathMap` circular alias — use `interface` directly.
2. **Do not** add runtime logic to this file — it must be purely type declarations.
3. **Do not** import from `app/` or any non-type file — keep this file dependency-free.
4. If `tsc --noEmit` reports path alias errors, ensure `tsconfig.json` has `"paths": { "@/*": ["./*"] }`.

## Next Steps After Completion

- **BE-05** (Prompt Engineering): Use `PathMap` interface to define the Gemini JSON Schema for structured output
- **BE-04** (Gemini SDK): Use `SimulateRequest`/`SimulateResponse` in the API route handler
- **BE-07** (Mock Fallback): Use `PathMap` to type mock data
- **FE-03** (React Flow): Import `PathMap`, `PathNode`, `Path` for canvas transformation utility
