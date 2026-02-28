# FE-07: 버그 수정 + UI 폴리시 — Implementation Plan

**Feature ID**: FE-07
**Phase**: Phase 3 (마무리)
**Estimated Time**: 40m

---

## CRITICAL: Scope Constraint

**No new features.** Every task in this plan is either:
1. A bug fix — correcting behavior that was specified but incorrectly implemented
2. A polish pass — refining the quality of existing, working behavior
3. A verification — confirming existing behavior works as specified

If any task requires creating a new component, introducing a new state field, or calling a new API endpoint, it is out of scope. Apply the minimum change that makes the existing code correct.

---

## Technical Context

### Existing Components (FE-01 through FE-06)

| Component | File(s) | What FE-07 May Touch |
|-----------|---------|----------------------|
| FE-01: Goal input UI | `components/GoalInput.tsx`, `store/useLifePathStore.ts` | Validate `maxLength`, verify error message text, check empty-guard wiring |
| FE-02: Dark theme | `app/globals.css`, `tailwind.config.ts` | WCAG contrast check on text over dark backgrounds |
| FE-03: React Flow map | `components/PathMap.tsx`, `components/nodes/*` | Empty-path fallback, missing merge-point null check, node hover transition |
| FE-04: Detail panel + highlight | `components/DetailPanel.tsx` | Panel boundary overflow on long text |
| FE-05: Timeline slider | `components/TimelineSlider.tsx` | Layout clip at 1280px viewport |
| FE-06: Loading animation | `components/LoadingAnimation.tsx` | Verify loading animation stops correctly on error |

### State Shape (Zustand Store)

```typescript
// store/useLifePathStore.ts — existing fields
interface LifePathStore {
  goal: string;
  isLoading: boolean;
  pathMap: PathMap | null;
  error: string | null;
  // actions
  setGoal: (goal: string) => void;
  generatePath: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}
```

FE-07 does not add new state fields. It may correct the value of `error` messages set within `generatePath()`.

---

## Constitution Check

| Rule | FE-07 Application |
|------|-------------------|
| YAGNI | Fix what is broken. Do not add maxLength if it already exists. Do not add hover effects to elements that already have them. |
| TypeScript no-any | All patches must use typed parameters and return types. No `as any` casts introduced. |
| Fail-Safe | Every null check added must have a visible fallback (message, empty state, or silent skip). Never `throw` at render time. |
| Max 2 nesting depth | Any new conditional render blocks must not nest deeper than 2 levels. Extract a helper variable if needed. |
| Max 20 line functions | If a bug fix extends a function beyond 20 lines, extract the fix into a named helper. |
| SOLID (SRP) | Do not mix validation logic into render functions. Keep fixes in the same layer as the original code. |

---

## Implementation Checklist

Work through phases in order. Mark each item complete before moving to the next phase.

### Phase 1: Critical Bug Fixes (validation + error messages) — 10m

- [ ] **P1-1**: Open `components/GoalInput.tsx`. Verify the submit button has `disabled={isLoading || goal.trim() === ''}`. If the `trim()` check is missing, add it.
- [ ] **P1-2**: Open `store/useLifePathStore.ts`. Find the `catch` block in `generatePath()`. Verify the error string is exactly `'경로 생성을 실패했습니다. 다시 시도해 주세요.'`. Correct it if different.
- [ ] **P1-3**: Open `components/GoalInput.tsx`. Find the `<Input>` component. Add `maxLength={100}` prop if absent.
- [ ] **P1-4**: Open `components/PathMap.tsx` (or equivalent). Locate where `nodes` are passed to React Flow. Add a guard: if `nodes.length === 0`, return a fallback `<div>` with a message instead of rendering the React Flow canvas.
- [ ] **P1-5**: Locate where merge-point node data is accessed. Add a null check: if `mergePoint` is `null` or `undefined`, skip rendering that node rather than crashing.

### Phase 2: Demo Flow Verification — 10m

- [ ] **P2-1**: Start the dev server. Execute the full ACT 1→4 scenario manually: 🎲 → auto-fill → generate → map → node click → panel → timeline slider.
- [ ] **P2-2**: Open the browser DevTools Console. Confirm zero `console.error` entries after the full flow.
- [ ] **P2-3**: Reset the app state (reload or call `reset()`). Execute the full flow a second time. Confirm no state corruption (e.g., previous path's nodes still visible).
- [ ] **P2-4**: Execute the full flow a third time. Mark P2 complete only if all three runs succeed.
- [ ] **P2-5**: Simulate an API error (e.g., set `USE_MOCK=false` with an invalid API key, or intercept in DevTools). Verify the error message appears and the form re-enables.

### Phase 3: UI Polish (hover effects + transitions) — 10m

- [ ] **P3-1**: Open node component files under `components/nodes/`. For each custom node, confirm there is a `transition` property on the root element. If absent, add `className="transition-all duration-200 ease-in-out"` (Tailwind) or `style={{ transition: 'all 0.2s ease' }}`.
- [ ] **P3-2**: In `components/GoalInput.tsx`, confirm the submit button and 🎲 button both have a hover style. If using shadcn/ui `Button`, the default variant already includes hover. If overriding styles, ensure `transition` is preserved.
- [ ] **P3-3**: Audit `text-*` Tailwind classes across node labels, panel headings, and body text. Normalize to a consistent scale: node labels `text-sm`, panel headings `text-base font-semibold`, body text `text-sm`. Fix any one-off sizes.
- [ ] **P3-4**: Open `app/globals.css` and `tailwind.config.ts`. Verify the three track colors (`#F59E0B`, `#3B82F6`, `#8B5CF6`) against the dark background (`#0a0a0f`). Confirm WCAG AA (4.5:1) is maintained. (Reference: FE-02 research confirms all three pass — no change needed unless colors were overridden.)
- [ ] **P3-5**: Open `components/DetailPanel.tsx`. Check the panel heading for long text: ensure `overflow: hidden` and `text-overflow: ellipsis` (or `line-clamp-2`) are applied to the step name element.

### Phase 4: Edge Case Completion (long text + empty path) — 5m

- [ ] **P4-1**: Test with a goal string of exactly 100 characters. Confirm the input accepts it. Test with 101 characters. Confirm the 101st character is rejected.
- [ ] **P4-2**: Temporarily mock an API response with an empty `paths` array. Confirm the fallback message appears and React Flow does not render.
- [ ] **P4-3**: Temporarily mock an API response where `mergePoint` is `null`. Confirm the map renders the three tracks correctly without crashing.
- [ ] **P4-4**: Open node component files. Verify node labels have `overflow: hidden` and `text-overflow: ellipsis` (or equivalent truncation) to handle long strings from API responses.

### Phase 5: Final Verification — 5m

- [ ] **P5-1**: Open browser DevTools. Set viewport to 1280px width. Verify: map area and panel area do not overlap, no horizontal scrollbar, timeline slider fully visible.
- [ ] **P5-2**: Set viewport to 1920px. Confirm layout still holds (no extreme stretching or misalignment).
- [ ] **P5-3**: Run the full demo scenario once more at 1280px viewport. Confirm all AC from US-1 pass.
- [ ] **P5-4**: Check the browser DevTools Console one final time. Confirm zero errors and zero warnings that indicate broken behavior (deprecation warnings are acceptable).

---

## Files Likely Modified

| File | Expected Change |
|------|-----------------|
| `components/GoalInput.tsx` | Add `maxLength={100}` to Input; verify disabled condition on submit button |
| `store/useLifePathStore.ts` | Correct error message string in `generatePath()` catch block |
| `components/PathMap.tsx` | Add empty-nodes guard; add null check for merge-point access |
| `components/nodes/*.tsx` | Add `transition` CSS to hover states |
| `components/DetailPanel.tsx` | Add `overflow: hidden` + ellipsis to long-text elements |

**Files that should NOT be modified**: `types/path.ts`, `data/presets.ts`, `app/api/paths/simulate/route.ts`, `lib/gemini.ts`

---

## Dependency Map

```
FE-07 depends on:
  FE-01 → GoalInput component and Zustand store exist
  FE-03 → PathMap and custom nodes exist
  FE-04 → DetailPanel exists
  FE-05 → TimelineSlider exists
  FE-06 → LoadingAnimation exists

FE-07 is depended on by:
  ALL-01 → Demo test and final validation (next task)
```

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Phase 2 reveals a deeper bug in FE-03 that takes > 10m to fix | Medium | Apply the minimal visible fix (e.g., error boundary with fallback UI) rather than root-cause fixing the React Flow issue |
| Polish changes introduce regressions in hover behavior | Low | Test each changed component in isolation before running the full demo flow again |
| `maxLength` on Input conflicts with existing character counter logic | Low | Inspect GoalInput for any character-count display before adding `maxLength` |
| 1280px layout issue requires CSS refactor of the layout grid | Medium | Identify the conflicting CSS rule and apply a targeted override rather than restructuring the grid |
