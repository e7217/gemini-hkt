# FE-07: Testing Guide — Demo Scenario & Edge Cases

**Purpose**: Step-by-step testing guide for verifying FE-07 changes before ALL-01 (final demo validation). Run this guide after completing each phase in `plan.md`.

---

## Prerequisites

- Development server is running: `npm run dev` (or `pnpm dev`)
- Browser DevTools Console is open (F12 → Console tab)
- Viewport is set to 1280px wide (DevTools → Toggle Device Toolbar → set width to 1280)

---

## Part 1: Demo Scenario Test Script

This script mirrors the four-act demo scenario from `docs/05-demo-strategy.md`. Execute all steps in order without pausing.

### ACT 1: Start (30 seconds)

1. Open `http://localhost:3000`
2. Confirm: Goal input field is visible with placeholder text "이루고 싶은 목표를 입력하세요"
3. Confirm: 🎲 button is visible next to the input
4. Click the 🎲 button
5. Confirm: Input field auto-fills with a preset goal string (e.g., "풀스택 개발자 되기")
6. Confirm: DevTools Console shows no errors after 🎲 click
7. Click "경로 생성하기"
8. Confirm: Button becomes disabled and shows loading state (spinner or "생성 중...")
9. Confirm: Loading animation (FE-06) appears on the screen

**Expected**: Smooth transition to loading state within 1 second of click.

### ACT 2: Growth (50 seconds)

10. Wait for API response (up to 30 seconds)
11. Confirm: Map renders with at least three visible tracks (Fast/Deep/Risk colors present)
12. Confirm: Nodes are visible and labelled
13. Confirm: DevTools Console shows no errors after map renders
14. Click the Timeline Slider to advance from "1년" to "3년"
15. Confirm: Map updates — additional nodes may appear or become visible
16. Confirm: Timeline slider transition is smooth (no flash or layout jump)
17. Click the Timeline Slider to advance to "5년"
18. Confirm: Map updates again without crashing

**Expected**: Map renders cleanly; timeline transitions are smooth.

### ACT 3: Merge (30 seconds)

19. Scroll or zoom the map to find the merge point node (top of the map)
20. Confirm: Merge point node is rendered (gradient or multi-color circle)
21. Click any regular path node (not the merge point)
22. Confirm: Detail panel opens on the right side showing step name, description, duration, difficulty
23. Confirm: The clicked track is highlighted; other tracks are dimmed
24. Confirm: DevTools Console shows no errors after node click

**Expected**: Detail panel opens; track highlight/dim effect works.

### ACT 4: Close (10 seconds)

25. Close the detail panel (if a close button exists, click it)
26. Confirm: Panel closes; map returns to normal (no tracks dimmed)
27. Confirm: DevTools Console shows no errors after panel close

**Expected**: Clean close with no residual visual artifacts.

### Repeat Test

28. Refresh the page (or click a reset button if available)
29. Execute ACT 1 through ACT 4 a second time
30. Execute ACT 1 through ACT 4 a third time

**Pass Criterion**: All three runs complete without console errors and without visual breakage.

---

## Part 2: Edge Case Test Checklist

Work through each case independently. Reset app state between each test.

### 2-A: Empty Input Prevention

- [ ] Load the app fresh
- [ ] Do NOT click 🎲 and do NOT type anything
- [ ] Click "경로 생성하기" (or try to)
- [ ] PASS: Button is disabled (not clickable) OR an inline warning "목표를 입력해 주세요." appears
- [ ] FAIL: API call is made despite empty input (check Network tab for a request to `/api/paths/simulate`)

- [ ] Type several spaces ("     ") into the input
- [ ] Attempt to submit
- [ ] PASS: Button remains disabled (whitespace-only input treated as empty)
- [ ] FAIL: API call is made with whitespace-only goal

### 2-B: API Error Message

**Method A (if using `USE_MOCK`)**:
- [ ] Set `USE_MOCK=error` (or temporarily return an error from the route handler)
- [ ] Submit a valid goal
- [ ] PASS: Error message "경로 생성을 실패했습니다. 다시 시도해 주세요." appears below or near the input
- [ ] PASS: Form is re-enabled after error (input is not permanently disabled)
- [ ] PASS: Loading animation stops when error appears
- [ ] FAIL: App crashes (blank screen or React error overlay)
- [ ] FAIL: Error message is in English or shows a stack trace

**Method B (DevTools Network interception)**:
- [ ] Open DevTools → Network tab
- [ ] Right-click the `/api/paths/simulate` request after submission → Block request URL
- [ ] Submit a valid goal
- [ ] PASS: Error message appears; form re-enables

### 2-C: Long Goal Text

- [ ] Click in the input field
- [ ] Type or paste a string exactly 100 characters long
- [ ] Confirm: Input accepts all 100 characters
- [ ] Type one more character (the 101st)
- [ ] PASS: The 101st character is rejected (input stays at 100 characters)
- [ ] FAIL: Input accepts 101+ characters

- [ ] Submit the 100-character goal
- [ ] Wait for map to render
- [ ] PASS: No layout overflow in node labels; long text is truncated with "..." where necessary
- [ ] PASS: Detail panel heading does not overflow its container

### 2-D: Empty Path Data

- [ ] Temporarily modify the mock data or route handler to return `{ paths: [], mergePoint: null }`
- [ ] Submit any goal
- [ ] PASS: A fallback message appears ("경로 데이터를 불러올 수 없습니다. 다시 시도해 주세요.") instead of an empty React Flow canvas
- [ ] FAIL: App shows a blank map area, React Flow canvas with no nodes, or crashes

### 2-E: Missing Merge Point

- [ ] Temporarily modify the mock data or route handler to return a valid path with `mergePoint: null`
- [ ] Submit any goal
- [ ] PASS: Map renders the three track paths without a merge point node — no crash
- [ ] FAIL: App throws `TypeError: Cannot read properties of null` or shows React error overlay

### 2-F: Console Error Audit

After completing all edge case tests:
- [ ] Open DevTools Console
- [ ] Filter by "Errors" only
- [ ] PASS: Zero errors in the console
- [ ] Acceptable: `console.warn` messages from Next.js development mode (these do not indicate bugs)
- [ ] FAIL: Any `console.error` originating from the application code (not from browser extensions)

---

## Part 3: Layout Verification at 1280px

- [ ] Open DevTools → Toggle Device Toolbar → Set width to exactly 1280px, height to 800px
- [ ] Load the app and complete a full generation
- [ ] Verify: Map area occupies ~70% of viewport width; detail panel occupies ~30%
- [ ] Verify: No element overflows horizontally (no horizontal scrollbar)
- [ ] Verify: Timeline slider is fully visible at the bottom (not clipped)
- [ ] Verify: Goal input screen is centered when viewed before generation

- [ ] Change viewport width to 1920px
- [ ] Verify: Layout still holds; no extreme stretching or broken grid

---

## Part 4: Hover Effect Spot-Check

- [ ] Hover over a path node on the map
- [ ] Verify: Node applies a visible hover effect (scale increase, glow intensification, or brightness increase)
- [ ] Verify: The transition is smooth — no instant jump from unhovered to hovered state
- [ ] Move mouse away from the node
- [ ] Verify: Node returns to its base state smoothly

- [ ] Hover over the "경로 생성하기" button on the goal input screen
- [ ] Verify: Button shows a hover state (background color shift or brightness change)
- [ ] Verify: Transition is smooth

- [ ] Hover over the 🎲 button
- [ ] Verify: Button shows a hover state with smooth transition

---

## Part 5: Final Sign-off

All the following must be true before marking FE-07 complete:

- [ ] Part 1 completed three times consecutively without errors
- [ ] All Part 2 edge case checks are marked PASS
- [ ] Part 3 layout checks pass at both 1280px and 1920px
- [ ] Part 4 hover effects verified on nodes and buttons
- [ ] DevTools Console shows zero application errors after a full demo run
- [ ] FE-07 is ready to hand off to ALL-01 (demo test + final validation)
