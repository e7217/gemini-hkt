# FE-07: Task List

**Feature ID**: FE-07
**Total Estimated Time**: 40m
**Phase**: Phase 3 (마무리, 4:00~4:40)

Tasks are ordered by priority for demo readiness. Complete each phase before moving to the next. Mark each task `[x]` when done.

---

## Phase 1: Critical Bug Fixes — 10m

These tasks fix behaviors that are explicitly specified but not yet correctly implemented. A failed demo flow will be caused by skipping these.

### TASK-001: Verify empty-input submit guard is wired to UI

**File**: `components/GoalInput.tsx`
**Time**: 2m
**Description**: Open `GoalInput.tsx`. Find the submit button. Confirm its `disabled` prop includes `goal.trim().length === 0`. If the check uses `goal === ''` instead of `goal.trim().length === 0`, update it. If the disabled condition is missing entirely, add `disabled={isLoading || goal.trim().length === 0}`.

```tsx
// Correct pattern
<Button disabled={isLoading || goal.trim().length === 0}>
  경로 생성하기
</Button>
```

**Acceptance**: Submitting with spaces-only input does not trigger an API call.

---

### TASK-002: Correct API error message string in store

**File**: `store/useLifePathStore.ts`
**Time**: 2m
**Description**: Find the `catch` block inside the `generatePath` async action. Verify the string assigned to `error` is exactly `'경로 생성을 실패했습니다. 다시 시도해 주세요.'`. Update the string if it differs. Import from `ERROR_MESSAGES` if `lib/errorMessages.ts` is being created.

```typescript
// Correct pattern in catch block
set({ error: '경로 생성을 실패했습니다. 다시 시도해 주세요.', isLoading: false });
```

**Acceptance**: A simulated API failure shows this exact message in Korean with no English or technical details.

---

### TASK-003: Add maxLength={100} to goal Input

**File**: `components/GoalInput.tsx`
**Time**: 1m
**Description**: Locate the `<Input>` component rendering the goal text field. Add `maxLength={100}` prop if not already present. Verify the prop is accepted (shadcn/ui Input passes through all HTML input attributes).

```tsx
<Input
  type="text"
  maxLength={100}
  placeholder="이루고 싶은 목표를 입력하세요"
  value={goal}
  onChange={(e) => setGoal(e.target.value)}
/>
```

**Acceptance**: Input stops accepting characters at 100. Test by counting characters in the field.

---

### TASK-004: Add empty-nodes guard in PathMap

**File**: `components/PathMap.tsx` (or the component that passes nodes to React Flow)
**Time**: 3m
**Description**: Find the point where `pathMap` or `pathMap.paths` is consumed to produce React Flow nodes. Add a guard before the React Flow canvas renders: if no paths exist, return a fallback message element.

```tsx
// Add near the top of the PathMap render function, before ReactFlow renders
if (!pathMap || pathMap.paths.length === 0) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요.
    </div>
  );
}
```

**Acceptance**: Mocking an empty `paths` array shows the fallback message without a React Flow error or blank canvas.

---

### TASK-005: Add null check for mergePoint access

**File**: `components/PathMap.tsx` (or node transformation utility)
**Time**: 2m
**Description**: Find where `pathMap.mergePoint` is accessed to build the React Flow nodes array. Add a null check so that accessing `.id`, `.label`, or other properties on `mergePoint` does not throw when the field is `null`.

```typescript
// Find the pattern that accesses mergePoint properties
// Before:
const mergeNode = buildMergeNode(pathMap.mergePoint.id, pathMap.mergePoint.label);

// After:
const mergeNode = pathMap.mergePoint
  ? buildMergeNode(pathMap.mergePoint.id, pathMap.mergePoint.label)
  : null;

// And when building the nodes array:
const allNodes = [...trackNodes, ...(mergeNode ? [mergeNode] : [])];
```

**Acceptance**: Mocking `mergePoint: null` in the API response produces a map with three tracks and no crash.

---

## Phase 2: Demo Flow Verification — 10m

### TASK-006: Execute full demo flow (Run 1)

**Time**: 3m
**Description**: Start the dev server. Open the app. Execute ACT 1 through ACT 4 in sequence:
1. Click 🎲 → goal auto-fills
2. Click "경로 생성하기" → loading animation appears
3. Wait for map → confirm three tracks and merge point render
4. Click a node → detail panel opens
5. Move timeline slider → map updates
6. Confirm zero console errors throughout

**Acceptance**: Zero `console.error` entries. Full flow completes without interruption.

---

### TASK-007: Execute full demo flow (Run 2)

**Time**: 3m
**Description**: Reset the app (reload the page). Execute the same ACT 1→4 flow a second time. This run specifically checks for state accumulation issues (leftover nodes from Run 1, stale error state, etc.).

**Acceptance**: Run 2 is identical in behavior to Run 1. No visual artifacts from Run 1.

---

### TASK-008: Execute full demo flow (Run 3)

**Time**: 2m
**Description**: Reset and execute ACT 1→4 a third time. This is the CP3 gate requirement ("데모 3회 연속 성공").

**Acceptance**: Three consecutive runs all succeed. Mark Phase 2 complete.

---

### TASK-009: Simulate API error and verify recovery

**Time**: 2m
**Description**: Use DevTools Network tab to block the `/api/paths/simulate` request (right-click → Block request URL). Submit a valid goal. Verify the error message appears and the form re-enables.

**Acceptance**: Error message "경로 생성을 실패했습니다. 다시 시도해 주세요." visible. Input and 🎲 button are interactive after error.

---

## Phase 3: UI Polish — 10m

### TASK-010: Add transition to all custom node components

**Files**: `components/nodes/*.tsx` (StepNode, MergeNode, StartNode, GoalNode, or equivalent)
**Time**: 4m
**Description**: Open each custom node component. On the root rendered element, add Tailwind transition classes or a CSS transition property.

```tsx
// Pattern to apply to each node's root element
<div
  className="
    rounded-lg border px-3 py-2
    transition-all duration-200 ease-in-out
    hover:scale-[1.02] hover:brightness-110
    cursor-pointer
  "
>
```

If any node already has a transition, confirm its duration is 200ms and timing is `ease` or `ease-in-out`. Do not change nodes that already have correct transitions.

**Acceptance**: Hovering any node produces a smooth, visible effect. No abrupt snap.

---

### TASK-011: Verify button hover transitions in GoalInput

**File**: `components/GoalInput.tsx`
**Time**: 2m
**Description**: Hover over the "경로 생성하기" button and the 🎲 button. If either shows an abrupt color change (no transition), add `transition-colors duration-200` class or confirm shadcn/ui default variant includes it.

shadcn/ui's default Button component already includes `transition-colors`. This task is primarily verification, with a correction only if custom styles have overridden or removed the transition.

**Acceptance**: Both buttons show smooth hover transitions.

---

### TASK-012: Normalize font size tokens

**Files**: `components/nodes/*.tsx`, `components/DetailPanel.tsx`
**Time**: 2m
**Description**: Audit `text-*` Tailwind classes across node labels and panel text. Normalize to:
- Node labels: `text-sm` (14px)
- Panel heading (step name): `text-base font-semibold` (16px, bold)
- Panel body text: `text-sm` (14px)
- Panel metadata (duration, difficulty): `text-xs text-muted-foreground` (12px, muted)

Fix any one-off sizes like `text-[13px]`, `text-lg` on nodes, or `text-xs` on panel headings.

**Acceptance**: Visually consistent text hierarchy across the map and detail panel.

---

### TASK-013: Verify WCAG color contrast

**Files**: `app/globals.css` (check `--muted-foreground` value)
**Time**: 2m
**Description**: Open DevTools → Elements. Select a muted text element (e.g., duration label in the detail panel). Check the Accessibility tab → Contrast ratio. If below 4.5:1, increase the `--muted-foreground` CSS variable value.

Reference from FE-02 research:
- `#6b7280` (gray-500) at ~4.5:1 against `#0a0a0f` — borderline, verify
- `#9ca3af` (gray-400) at ~6.6:1 — safe alternative if borderline fails

**Acceptance**: All text elements show ≥ 4.5:1 contrast in DevTools Accessibility panel.

---

## Phase 4: Edge Case Completion — 5m

### TASK-014: Add text-overflow to node labels

**Files**: `components/nodes/*.tsx`
**Time**: 2m
**Description**: In each node component, ensure the element containing the label text has `truncate` class (Tailwind) or equivalent CSS. Also ensure the label container has a defined `max-width` so truncation triggers for long strings.

```tsx
// Node label element
<span className="truncate block max-w-[160px]">{data.label}</span>
```

**Acceptance**: A node label containing a 50-character string does not overflow the node boundary.

---

### TASK-015: Add line-clamp to DetailPanel step name

**File**: `components/DetailPanel.tsx`
**Time**: 1m
**Description**: Find the element displaying the selected node's step name. Add `line-clamp-2` to cap it at two lines, preventing the panel from growing unboundedly.

```tsx
<h3 className="line-clamp-2 font-semibold text-base">{selectedNode?.label}</h3>
```

**Acceptance**: A step name of 80+ characters wraps to at most two lines in the panel.

---

### TASK-016: Test long-text flow end to end

**Time**: 2m
**Description**: Use a goal that is exactly 100 characters. Submit it. Wait for the map. Click a node. Verify: no layout overflow at any stage (input screen, map, detail panel).

**Acceptance**: Full flow with 100-character goal completes without any element overflowing its container.

---

## Phase 5: Final Verification — 5m

### TASK-017: Layout verification at 1280px

**Time**: 2m
**Description**: Open DevTools Device Toolbar. Set width to 1280px. Execute a full generation. Check:
- Map area and panel area are side by side, not overlapping
- No horizontal scrollbar
- Timeline slider fully visible

**Acceptance**: All layout checks pass at 1280px.

---

### TASK-018: Layout verification at 1920px

**Time**: 1m
**Description**: Set DevTools Device Toolbar width to 1920px. Verify layout holds. No extreme stretching.

**Acceptance**: Layout remains correct and proportional.

---

### TASK-019: Final console audit

**Time**: 1m
**Description**: After completing all phases, execute the demo flow one final time. Open the Console tab filtered to "Errors". Confirm zero errors from application code.

**Acceptance**: Zero `console.error` entries attributable to application code.

---

### TASK-020: Mark FE-07 complete and hand off to ALL-01

**Time**: 1m
**Description**: Update the issue status in `docs/issues/phase-3/FE-07-bug-fix-polish.md` from `pending` to `complete`. Notify the ALL-01 assignee that the demo validation pass can begin.

**Acceptance**: Status updated. ALL-01 can start.

---

## Task Summary

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| Phase 1: Critical Bug Fixes | TASK-001 through TASK-005 | 10m | P0 — must complete before any other phase |
| Phase 2: Demo Flow Verification | TASK-006 through TASK-009 | 10m | P1 — must complete before polish |
| Phase 3: UI Polish | TASK-010 through TASK-013 | 10m | P2 — complete if Phase 2 passes |
| Phase 4: Edge Case Completion | TASK-014 through TASK-016 | 5m | P2 — parallel with Phase 3 |
| Phase 5: Final Verification | TASK-017 through TASK-020 | 5m | P1 — gate for ALL-01 handoff |

**Total**: 20 tasks, 40 minutes
