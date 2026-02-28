# Validation Plan: ALL-01 데모 테스트 + 최종 검증

**Branch**: `010-demo-final-validation` | **Date**: 2026-02-28 | **Spec**: `specs/010-demo-final-validation/spec.md`
**Input**: Feature specification from `specs/010-demo-final-validation/spec.md`

## CRITICAL CONSTRAINT: No Code Changes

This is a **validation-only task**. No source code modifications are permitted. If a bug is found:

- **Severe** (demo-stopping): Record, stop this validation, re-enter FE-07 bug fix phase, then restart ALL-01 validation from scratch.
- **Minor** (visual discomfort, non-blocking): Document, accept, continue validation.

The sole deliverable of this task is a confirmed CP3: **"데모 3회 연속 성공"**.

---

## Summary

Validate the complete LifePath demo scenario under two environment configurations (Plan A: live Gemini API, Plan B: mock mode). Execute the 3-minute scenario (ACT 1–4) three consecutive times per plan, verifying all performance targets, UI correctness, and zero console errors.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 14+ App Router
**Test Environment**: Local dev server (`npm run dev`) and optionally the Vercel preview deployment
**Performance Measurement Tools**: Browser DevTools (Network tab, Performance tab, Console)
**Primary Demo Browser**: Chrome (latest stable)
**Secondary Validation**: Firefox (latest stable)

---

## Plan A vs Plan B Test Strategy

### Plan A — Live Gemini API

**Environment Setup**:
```bash
# .env.local
GEMINI_API_KEY=<your_api_key>
USE_MOCK=false  # or leave unset
```

**Characteristics**:
- Real network call to `generativelanguage.googleapis.com`
- Variable response time (typically 3–12s, max allowed: 15s)
- Tests actual end-to-end integration
- Requires a valid API key and active network connection
- Higher variance in response time between runs

**What to verify in Plan A specifically**:
- Network tab shows a request to the Gemini API endpoint
- Response arrives within 15-second timeout
- The returned PathMap data renders correctly into the UI
- No fallback/mock data is used (network request is confirmed)

### Plan B — Mock Mode

**Environment Setup**:
```bash
# .env.local
USE_MOCK=true
# GEMINI_API_KEY not required
```

**Dev server restart required** after changing `.env.local`:
```bash
# Stop dev server, then:
npm run dev
```

**Characteristics**:
- No network call to Gemini API
- Deterministic, consistent response (same mock data each run)
- Target path map load time: ≤ 3 seconds
- Tests UI rendering, interaction, and animations in isolation from API variance
- Guaranteed to work without network

**What to verify in Plan B specifically**:
- Network tab shows NO request to `generativelanguage.googleapis.com`
- Path map renders within 3 seconds
- UI is visually identical to Plan A — no visual indicator of mock mode
- All interactions (slider, node click, track highlight) work identically to Plan A

---

## Performance Measurement Approach

### Tool: Chrome DevTools

**Network Tab** (for API timing):
1. Open DevTools → Network tab
2. Clear prior requests
3. Click "경로 생성하기"
4. Find the request to `/api/paths/simulate`
5. Note the "Time" column value — this is the total round-trip time
6. Target: ≤ 15000ms (Plan A), ≤ 3000ms (Plan B)

**Performance Tab** (for rendering timing):
1. Start recording before clicking "경로 생성하기"
2. Stop recording after path map is fully visible
3. Measure from "경로 생성하기" click event to last paint event on path map
4. Target: path map fully painted within 3000ms of data arrival

**Manual Stopwatch** (for slider and click interactions):
- Use browser console: `console.time('slider')` → move slider → `console.timeEnd('slider')`
- Or observe visually: interaction should feel instant, not laggy
- Target: ≤ 300ms for slider response, detail panel open, track highlight

**Console Tab** (for error detection):
1. Keep Console tab visible or open throughout the demo
2. After each full demo run, check for any red (error) messages
3. Distinguish LifePath errors from browser extension warnings
4. Target: 0 LifePath-originating errors per run

### Timing Reference Points

| Measurement | Start Event | End Event | Target |
|---|---|---|---|
| API response time (Plan A) | "경로 생성하기" click | Path map visible | ≤ 15s |
| Map render time (Plan B) | Data received | All nodes painted | ≤ 3s |
| Slider response | Slider release/stop | Nodes appear | ≤ 300ms |
| Node click → panel | Node click | Detail panel visible | ≤ 300ms |
| Track highlight | Track click | Highlight visible | ≤ 300ms |

---

## Bug Triage Criteria

### Severe Bugs (Demo-Stopping) — Stop and Fix

A bug is classified as severe if it prevents a judge from seeing the core demo scenario complete:

| Symptom | Classification | Action |
|---|---|---|
| App crashes or white screen at any point | Severe | Stop → FE-07 |
| Loading animation appears but never resolves | Severe | Stop → FE-07 |
| Path map does not render (blank map area) | Severe | Stop → FE-07 |
| "경로 생성하기" button does not respond to click | Severe | Stop → FE-07 |
| API response time exceeds 15 seconds consistently | Severe | Stop → FE-07 |
| Timeline slider does not change node visibility | Severe | Stop → FE-07 |
| Node click produces JS error and no panel | Severe | Stop → FE-07 |
| Plan B mode shows different content than Plan A | Severe | Stop → FE-07 |
| Console shows uncaught React error | Severe | Stop → FE-07 |

### Minor Bugs (Visual Discomfort) — Document and Continue

A bug is classified as minor if the demo can still proceed and the core value is communicated:

| Symptom | Classification | Action |
|---|---|---|
| Merge point gradient is slightly off-color | Minor | Document, continue |
| Detail panel opens slightly slower than 300ms (e.g., 350ms) | Minor | Document, continue |
| Track highlight animation is not perfectly smooth | Minor | Document, continue |
| Minor text truncation in detail panel | Minor | Document, continue |
| Timeline slider label position is slightly misaligned | Minor | Document, continue |
| Console warning (not error) from a library | Minor | Document, continue |
| Flickering of a node on first render | Minor | Document, continue |

---

## Project Structure

### Documentation (this feature)

```text
specs/010-demo-final-validation/
├── spec.md              # Feature specification (ACT 1-4 user stories, FR-001-012)
├── plan.md              # This file (validation plan, Plan A/B strategy, bug triage)
├── research.md          # Browser DevTools measurement techniques
├── data-model.md        # TestResult, DemoScenario, PerformanceMetrics types
├── quickstart.md        # Demo runner guide for the presenter
├── tasks.md             # Phase-by-phase validation task checklist
└── contracts/
    └── test-plan.md     # Formal ACT 1-4 checklist and pass/fail criteria
```

### No Source Code Deliverables

This spec produces no new source files. All validation is performed against the existing codebase as built by previous phases (BE-01 through FE-07).

---

## Constitution Check

| Principle | Check | Notes |
|-----------|-------|-------|
| **I. YAGNI & SOLID** | PASS | No code written. Validation scope is minimal and necessary for CP3. |
| **II. Abstraction & Class Design** | N/A | No code produced. |
| **III. Concise Code** | N/A | No code produced. |
| **IV. Nesting Depth Limit** | N/A | No code produced. |
| **V. TypeScript Strict Typing** | N/A | No code produced. |
| **VI. Fail-Safe & Graceful Degradation** | PASS | Plan B provides safe fallback for demo. Plan A failure triggers Plan B. |

---

## Complexity Tracking

> No violations. This task is entirely a manual validation workflow.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | — | — |
