# Validation Tasks: ALL-01 데모 테스트 + 최종 검증

**Branch**: `010-demo-final-validation`
**Date**: 2026-02-28
**Type**: VALIDATION ONLY — No code changes permitted

All tasks in this file are validation and testing tasks. No source code modifications are allowed. If a severe bug is found, exit this task list, re-enter FE-07, fix the bug, then restart ALL-01 from Task 0.

**Time Budget**: 20 minutes
**Completion Criteria**: CP3 — "데모 3회 연속 성공"

---

## Task 0: Pre-Flight Check

*Prerequisite: FE-07 (버그 수정 + UI 폴리시) is complete.*

- [ ] **TASK-000**: Confirm FE-07 is marked complete and the dev server is running without startup errors
- [ ] **TASK-001**: Confirm `package.json` dependencies are installed (`npm install` if needed)
- [ ] **TASK-002**: Confirm `.env.local` exists at the project root with `GEMINI_API_KEY` set
- [ ] **TASK-003**: Open Chrome (latest stable) in Incognito mode
- [ ] **TASK-004**: Open DevTools — keep Network tab and Console tab visible throughout all phases
- [ ] **TASK-005**: Enable "Preserve log" in both the Network tab and Console tab

**Phase 0 Gate**: Dev server running, Chrome Incognito open with DevTools, environment confirmed.

---

## Phase 1: Plan A Environment Setup

*Configure and verify Plan A (live Gemini API) environment.*

- [ ] **TASK-010**: Verify `.env.local` has `USE_MOCK=false` (or `USE_MOCK` is absent)
- [ ] **TASK-011**: Verify `GEMINI_API_KEY` value is present and non-empty in `.env.local`
- [ ] **TASK-012**: Confirm internet connection is active (open `https://google.com` in a different tab)
- [ ] **TASK-013**: Navigate to `http://localhost:3000` and confirm the input screen loads without console errors
- [ ] **TASK-014**: Confirm the goal input field is empty and the 🎲 button is visible
- [ ] **TASK-015**: Clear Network tab (remove prior requests)
- [ ] **TASK-016**: Clear Console tab (remove prior messages)

**Phase 1 Gate**: Plan A environment confirmed active. Input screen clean. DevTools cleared.

---

## Phase 2: ACT 1 Validation

*Validate the opening sequence: dice → auto-fill → generate → loading → path map.*

### Run 1, Plan A — ACT 1

- [ ] **TASK-020**: Click the 🎲 button — confirm "풀스택 개발자 되기" auto-fills in ≤ 100ms
- [ ] **TASK-021**: Click "경로 생성하기" — confirm loading animation appears in ≤ 300ms
- [ ] **TASK-022**: Wait for path map transition — confirm it completes in ≤ 15 seconds
- [ ] **TASK-023**: Record API response time from Network tab → `/api/paths/simulate` total time
  - Measured: _____ ms | Target: ≤ 15000ms | [ ] Met / [ ] Not Met
- [ ] **TASK-024**: Confirm 3 vertical tracks are visible with at least 1 node each
- [ ] **TASK-025**: Check Console for red errors from LifePath code → Expected: 0 errors
- [ ] **TASK-026**: Record ACT 1 result: [ ] PASS / [ ] FAIL (note step and severity if fail)

**If TASK-026 = FAIL + Severe**: STOP. Exit to FE-07. Restart ALL-01 from Task 0 after fix.

---

## Phase 3: ACT 2 Validation

*Validate the 3-track map display and timeline slider interaction.*

### Run 1, Plan A — ACT 2

- [ ] **TASK-030**: Confirm exactly 3 vertical tracks visible (Fast Track, Deep Dive, Risk Path)
- [ ] **TASK-031**: Locate and confirm timeline slider is visible on screen
- [ ] **TASK-032**: Set slider to "1년" — confirm only 1-year nodes are displayed
- [ ] **TASK-033**: Move slider to "3년" — confirm additional nodes appear in ≤ 300ms
  - Response time observation: _____ ms | Target: ≤ 300ms | [ ] Met / [ ] Not Met
- [ ] **TASK-034**: Move slider to "5년" — confirm full path expanded with goal/merge nodes visible in ≤ 300ms
  - Response time observation: _____ ms | Target: ≤ 300ms | [ ] Met / [ ] Not Met
- [ ] **TASK-035**: Confirm no visual glitches (no flickering, overlapping, disappearing nodes) during slider transitions
- [ ] **TASK-036**: Check Console for red errors during slider interactions → Expected: 0 errors
- [ ] **TASK-037**: Record ACT 2 result: [ ] PASS / [ ] FAIL

**If TASK-037 = FAIL + Severe**: STOP. Exit to FE-07. Restart ALL-01 from Task 0 after fix.

---

## Phase 4: ACT 3 Validation

*Validate merge point visual, node detail panel, and track highlight.*

### Run 1, Plan A — ACT 3

- [ ] **TASK-040**: Locate merge point node — confirm it is visible where all 3 tracks converge
- [ ] **TASK-041**: Confirm merge point displays a multi-color gradient (not a solid single color)
- [ ] **TASK-042**: Click any step node on any track — confirm detail panel opens in ≤ 300ms
  - Response time observation: _____ ms | Target: ≤ 300ms | [ ] Met / [ ] Not Met
- [ ] **TASK-043**: Verify detail panel content: label, description, and metadata are readable; no overflow
- [ ] **TASK-044**: Click on a track lane or label — confirm that track highlights and others dim in ≤ 300ms
  - Response time observation: _____ ms | Target: ≤ 300ms | [ ] Met / [ ] Not Met
- [ ] **TASK-045**: Click a second track — confirm highlight transfers correctly with no stuck state
- [ ] **TASK-046**: Check Console for red errors during interactions → Expected: 0 errors
- [ ] **TASK-047**: Record ACT 3 result: [ ] PASS / [ ] FAIL

**If TASK-047 = FAIL + Severe**: STOP. Exit to FE-07. Restart ALL-01 from Task 0 after fix.

---

## Phase 5: ACT 4 Validation

*Validate closing screen state and app reset.*

### Run 1, Plan A — ACT 4

- [ ] **TASK-050**: Observe final screen state — confirm no active loading spinners, no empty content areas
- [ ] **TASK-051**: Final console inspection — count LifePath-originating red errors → Target: 0
  - Total LifePath console errors this run: _____
- [ ] **TASK-052**: Count total console warnings (yellow) from LifePath code (informational)
  - Total LifePath warnings this run: _____
- [ ] **TASK-053**: Navigate back to input screen (browser back / refresh / reset button)
- [ ] **TASK-054**: Confirm input screen loads cleanly — empty goal field, no broken state from prior run
- [ ] **TASK-055**: Record ACT 4 result: [ ] PASS / [ ] FAIL
- [ ] **TASK-056**: Record overall Run 1 result: [ ] PASS (all ACTs passed) / [ ] FAIL

**Run 1 complete.** If PASS, proceed to Phase 6 (Performance Measurement), then continue to Runs 2 and 3.

---

## Phase 6: Performance Measurement

*Record and evaluate all measured performance metrics.*

### After Run 1

- [ ] **TASK-060**: Record API response time (from TASK-023): _____ ms
- [ ] **TASK-061**: Record map render time (estimate from Network tab timing + browser paint): _____ ms
- [ ] **TASK-062**: Record slider response time 1y→3y (from TASK-033): _____ ms
- [ ] **TASK-063**: Record slider response time 3y→5y (from TASK-034): _____ ms
- [ ] **TASK-064**: Record node click to panel time (from TASK-042): _____ ms
- [ ] **TASK-065**: Record track highlight time (from TASK-044): _____ ms
- [ ] **TASK-066**: Evaluate all metrics against targets (see `data-model.md` PERFORMANCE_TARGETS)
  - [ ] All targets met → Continue
  - [ ] One or more targets missed → Record as minor bug if the overage is < 500ms; severe if egregiously over (> 2x target)

---

## Phase 6B: Plan B Validation

*Validate Plan B (USE_MOCK=true) environment and run at least 1 successful demo.*

- [ ] **TASK-070**: Edit `.env.local` — set `USE_MOCK=true`
- [ ] **TASK-071**: Stop the dev server (`Ctrl+C` in terminal)
- [ ] **TASK-072**: Restart dev server (`npm run dev`)
- [ ] **TASK-073**: Navigate to `http://localhost:3000` and confirm it loads without errors
- [ ] **TASK-074**: Clear Network tab and Console tab
- [ ] **TASK-075**: Execute the full ACT 1–4 demo script (same as Phase 2–5 steps)
  - ACT 1: [ ] PASS / [ ] FAIL
  - ACT 2: [ ] PASS / [ ] FAIL
  - ACT 3: [ ] PASS / [ ] FAIL
  - ACT 4: [ ] PASS / [ ] FAIL
- [ ] **TASK-076**: Verify Plan B Network behavior — confirm no request to `generativelanguage.googleapis.com`
- [ ] **TASK-077**: Verify Plan B response time — `/api/paths/simulate` responds in ≤ 100ms
- [ ] **TASK-078**: Verify Plan B UI — confirm no visual indicator of mock mode in the UI
- [ ] **TASK-079**: Verify Plan B visual parity — path map looks identical to Plan A output
- [ ] **TASK-080**: Record Plan B run result: [ ] PASS / [ ] FAIL

**If Plan B run FAILs with a severe bug**: Stop. Exit to FE-07. After fix, restart ALL-01 from Task 0.

---

## Phase 7: 3x Consecutive Test (CP3)

*Execute the demo scenario 3 consecutive times. All 3 must pass for CP3.*

**Note**: Runs 1 and 2 may both be Plan A. Run 3 may be Plan A or Plan B. The combination must include at least 1 Plan A run and at least 1 Plan B run across the 3 runs.

### Run 2

- [ ] **TASK-090**: Restore Plan A environment if needed (set `USE_MOCK=false`, restart dev server)
- [ ] **TASK-091**: Clear Network and Console tabs
- [ ] **TASK-092**: Execute ACT 1–4 demo script
- [ ] **TASK-093**: ACT 1 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-094**: ACT 2 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-095**: ACT 3 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-096**: ACT 4 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-097**: Console errors: _____ (LifePath-originating) | Target: 0
- [ ] **TASK-098**: All performance targets met: [ ] Yes / [ ] No
- [ ] **TASK-099**: Overall Run 2 result: [ ] PASS / [ ] FAIL

**If Run 2 FAIL**: If severe bug — STOP, exit to FE-07. If minor issues only — note and continue to Run 3 (minor bugs do not invalidate CP3).

### Run 3

- [ ] **TASK-100**: Select plan for Run 3 (Plan A if Runs 1+2 were both Plan A; Plan B if not yet tested)
- [ ] **TASK-101**: Configure environment accordingly, restart dev server if switching plans
- [ ] **TASK-102**: Clear Network and Console tabs
- [ ] **TASK-103**: Execute ACT 1–4 demo script
- [ ] **TASK-104**: ACT 1 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-105**: ACT 2 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-106**: ACT 3 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-107**: ACT 4 result: [ ] PASS / [ ] FAIL | Severe? [ ] Yes / [ ] No
- [ ] **TASK-108**: Console errors: _____ (LifePath-originating) | Target: 0
- [ ] **TASK-109**: All performance targets met: [ ] Yes / [ ] No
- [ ] **TASK-110**: Overall Run 3 result: [ ] PASS / [ ] FAIL

---

## Phase 8: Final Sign-Off

*Confirm CP3 and transition to Phase 4 (발표 준비).*

- [ ] **TASK-120**: Confirm Run 1: PASS
- [ ] **TASK-121**: Confirm Run 2: PASS
- [ ] **TASK-122**: Confirm Run 3: PASS
- [ ] **TASK-123**: Confirm at least 1 Plan A run completed successfully
- [ ] **TASK-124**: Confirm at least 1 Plan B run completed successfully
- [ ] **TASK-125**: Confirm 0 LifePath-originating console errors across all 3 runs
- [ ] **TASK-126**: Confirm all performance targets met across all 3 runs (or minor overages documented)
- [ ] **TASK-127**: Record known minor bugs in the bug log (see `contracts/test-plan.md`)
- [ ] **TASK-128**: Optional — Record one of the 3 runs as a Plan C screen recording ("Golden Path" video backup)
- [ ] **TASK-129**: Mark ALL-01 as COMPLETE
- [ ] **TASK-130**: Declare CP3: "데모 3회 연속 성공" ✓

**CP3 Achieved At**: _______

**Transition**: Phase 4 (발표 준비, 5:00~6:00) begins now. **코딩 금지선 준수.**

---

## Task Summary Table

| Phase | Task Range | Description | Output |
|---|---|---|---|
| 0 | TASK-000–005 | Pre-flight check | Dev server + DevTools ready |
| 1 | TASK-010–016 | Plan A environment setup | Plan A confirmed active |
| 2 | TASK-020–026 | ACT 1 validation | ACT 1 pass/fail + API timing |
| 3 | TASK-030–037 | ACT 2 validation | ACT 2 pass/fail + slider timing |
| 4 | TASK-040–047 | ACT 3 validation | ACT 3 pass/fail + interaction timing |
| 5 | TASK-050–056 | ACT 4 validation | ACT 4 pass/fail + console summary |
| 6 | TASK-060–066 | Performance measurement | All metrics recorded |
| 6B | TASK-070–080 | Plan B validation | Plan B confirmed working |
| 7 | TASK-090–110 | 3x consecutive test (CP3) | Runs 2 and 3 completed |
| 8 | TASK-120–130 | Final sign-off | CP3 declared, Phase 4 begins |
