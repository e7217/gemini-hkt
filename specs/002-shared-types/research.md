# Research: BE-02 공유 타입 정의 (Shared TypeScript Types)

**Phase 0 Research** | **Date**: 2026-02-27 | **Branch**: `001-shared-types`

## Research Questions Resolved

### RQ-1: What is the exact schema for PathNode as used in the Gemini prompt?

**Source**: `docs/04-backend-spec.md` — Gemini 프롬프트 전략 > 노드 구조 section

**Answer**:
```yaml
id: string (unique)
title: string
description: string
duration: string (e.g., "1-3개월")
difficulty: "Low" | "Medium" | "High"
isMergePoint: boolean
tips: string[]
monthsFromNow: number (타임라인 계산용)
```

All 8 fields confirmed. `difficulty` is a string union type (not numeric). `tips` is an array. `monthsFromNow` is a number for timeline slider filtering.

---

### RQ-2: What is the exact Path interface structure?

**Source**: `docs/04-backend-spec.md` — TypeScript 타입 정의 section + BE-02 tech note

**Answer**:
```typescript
interface Path {
  id: string;      // NOT "fast" | "deep" | "explorer" — string for branch sub-paths
  name: string;
  color: string;
  nodes: PathNode[];
}
```

Key decision: `id` is `string` not a literal union. The BE-02 issue doc explicitly notes: "Path.id 타입 변경: 기존 `'fast' | 'deep' | 'explorer'` 리터럴 유니온 대신 `string`으로 변경. branch API에서 하위 경로가 동적으로 생성되므로 고정 리터럴로는 대응 불가."

---

### RQ-3: What is the TrackType enum and why is it "Risk" not "Explorer"?

**Source**: `docs/issues/phase-1/BE-02-shared-types.md` — 기술 검토 노트 section

**Answer**:
```typescript
enum TrackType {
  Fast = "fast",
  Deep = "deep",
  Risk = "risk"
}
```

The BE-02 issue doc notes: "경로명 통일: 기존 'explorer'를 'risk'로 통일 (01-ideas.md의 Risk Path와 일치시킴)."

The product spec (`docs/02-product-spec.md`) also uses "Fast/Deep/Risk" as the three path types. The color scheme in `docs/03-frontend-spec.md` confirms: Fast(금/#F59E0B), Deep(파랑/#3B82F6), Risk(보라/#8B5CF6).

---

### RQ-4: What is StartGoalNode and why is it separate from PathNode?

**Source**: `docs/issues/phase-1/BE-02-shared-types.md` — 기술 검토 노트 section

**Answer**:
```typescript
interface StartGoalNode {
  id: string;
  title: string;
  description: string;
}
```

Rationale: "startNode/goalNode는 PathNode의 모든 필드가 필요하지 않음 (duration, difficulty, monthsFromNow 등 불필요). 간소화 타입으로 분리하여 타입 안전성 확보."

The Gemini prompt response JSON structure (`docs/04-backend-spec.md`) shows `startNode` and `goalNode` as simpler objects with only `id`, `title`, `description`.

---

### RQ-5: What is the MergePoint interface?

**Source**: `docs/04-backend-spec.md` — TypeScript 타입 정의 and 응답 JSON 구조 sections

**Answer**:
```typescript
interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];  // path IDs that converge at this point
  message: string;           // motivational message displayed in UI
}
```

---

### RQ-6: What are the API request/response contracts?

**Source**: `docs/issues/phase-1/BE-02-shared-types.md` — API Request/Response 타입 section

**Answer**:
```typescript
// POST /api/paths/simulate
type SimulateRequest = {
  goal: string;
  timeframe?: "1y" | "3y" | "5y";
};
type SimulateResponse = PathMap;

// POST /api/paths/branch
type BranchRequest = {
  pathId: string;
  currentNodeId: string;
  choice?: string;
  currentPathMap: PathMap;  // full current state (server is stateless)
};
type BranchResponse = {
  paths: Path[];
  mergePoints?: MergePoint[];
};
```

Key architectural note: `BranchRequest` includes `currentPathMap` because the server is stateless — the client must send full context for branch generation.

---

### RQ-7: Where should the types file be located?

**Source**: `docs/issues/phase-1/BE-02-shared-types.md` — 기술 요구사항 section

**Answer**: `types/path.ts` at the project root (or `types/index.ts`). The Next.js `tsconfig.json` should already support root-relative imports with `"paths": { "@/*": ["./*"] }`. Recommendation: use `types/path.ts` with named exports (not barrel index) for clarity.

---

### RQ-8: Do we need TimelineMetadata and AnonymousSession types?

**Source**: `docs/04-backend-spec.md` — TypeScript 타입 정의 section

**Answer**: These are backend-internal types defined in the broader backend spec (B34, B22). However, BE-02 issue doc's 구현 범위 includes TimelineMetadata and AnonymousSession.

**Decision** (AUTO): Include both as specified in BE-02 scope. They are part of the complete shared types file even if they are not directly referenced in the MVP API contracts. This prevents needing to create a second type file later.

---

## Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| TrackType implementation | `enum` | Feature description explicitly says "enum"; provides named constants for switch/case usage |
| PathMap | `interface` | Consistent with other entity interfaces; better TypeScript error messages |
| Type file location | `types/path.ts` | Specified in BE-02; separates from app code |
| Export style | Named exports | Enables tree-shaking and explicit import tracking |
| Path.id type | `string` | Branch API generates dynamic sub-path IDs |

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Circular import between types/path.ts and app/ files | Low | High | Keep types file as pure declarations with no app imports |
| Type mismatch between Gemini JSON output and TypeScript types | Medium | High | Add runtime validation (Zod) at API layer — separate from BE-04 |
| Future need to add fields (emoji, actionItem, catchphrase per ideas bank) | Medium | Low | Types are additive-compatible; new optional fields can be added without breaking existing code |
