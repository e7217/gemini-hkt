# Demo Runner Guide: ALL-01 데모 테스트 + 최종 검증

**Date**: 2026-02-28
**Purpose**: Step-by-step guide for executing the LifePath demo validation and achieving CP3

**Time Budget**: 20 minutes total
**Goal**: Confirm "데모 3회 연속 성공" (CP3)

---

## Overview

You will run the 3-minute demo scenario 3 times in a row. Each run must complete all 4 ACTs without a severe error.

There are two environment modes:
- **Plan A** — Live Gemini API (the real experience)
- **Plan B** — Mock data mode (the safety net)

Both should be tested. Run at least 2 consecutive successful runs under Plan A. Run at least 1 successful run under Plan B. All 3 runs count toward CP3 regardless of plan.

---

## Environment Setup

### Setting Up Plan A (Live Gemini API)

1. Open `.env.local` at the project root:

```bash
# .env.local (Plan A)
GEMINI_API_KEY=your_actual_api_key_here
USE_MOCK=false
```

2. Start (or confirm) the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000` in Chrome Incognito (`Cmd+Shift+N`)
4. Open DevTools (`Cmd+Option+I`), go to Network and Console tabs
5. Enable "Preserve log" in both tabs
6. Confirm you have an active internet connection

### Setting Up Plan B (Mock Mode)

1. Edit `.env.local`:

```bash
# .env.local (Plan B)
USE_MOCK=true
```

2. Stop the dev server (`Ctrl+C` in the terminal) and restart it:

```bash
npm run dev
```

   **Important**: Next.js requires a server restart when environment variables change.

3. Open `http://localhost:3000` in Chrome Incognito
4. Open DevTools, Network and Console tabs with "Preserve log" enabled
5. Internet connection is NOT required for Plan B

---

## Step-by-Step Demo Script

Follow this script for each run. This mirrors the 3-minute demo scenario exactly.

### ACT 1 — "누구나 시작할 수 있다" (30 seconds)

1. Confirm the home/input screen is displayed.
2. Click the **🎲 (dice) button**.
   - Expected: "풀스택 개발자 되기" auto-fills in the goal input field.
3. Click **"경로 생성하기"**.
   - Expected: A loading animation appears immediately.
4. Wait for the path map to load.
   - Plan A target: within **15 seconds**
   - Plan B target: within **3 seconds**
5. Confirm the path map is displayed with 3 tracks visible.

### ACT 2 — "당신의 나무가 자랍니다" (50 seconds)

6. Confirm 3 vertical path tracks are visible (Fast Track, Deep Dive, Risk Path).
7. Locate the **timeline slider**.
8. Move the slider to **"1년"** (1 year).
   - Expected: Nodes for the 1-year range are visible.
9. Move the slider to **"3년"** (3 years).
   - Expected: Additional nodes appear within 300ms, expanding each track.
10. Move the slider to **"5년"** (5 years).
    - Expected: Full path expanded, goal/merge nodes visible at the top.

### ACT 3 — "어떤 길이든 괜찮다" (30 seconds)

11. Locate the **merge point node** at the top where all 3 tracks converge.
    - Expected: It shows a multi-color gradient, visually distinct from other nodes.
12. Click any **step node** on any track.
    - Expected: A detail panel opens within 300ms, showing the node's name and description.
13. Click on a **track lane or track label**.
    - Expected: That track highlights (brighter); other tracks dim.

### ACT 4 — 마무리 (10 seconds)

14. Observe the final screen state.
    - Expected: Clean, complete UI. No loading spinners. No error messages on screen.
15. Open the browser **Console tab** and check for red error messages.
    - Expected: Zero LifePath-related errors.
16. Navigate back to the input screen (use browser back button, a reset button, or refresh).
    - Expected: Input screen loads cleanly, ready for the next run.

---

## What to Do If Something Fails

### Before panicking — classify the issue:

**Severe (stop now)**:
- White screen / app crash
- Loading animation spins forever (> 30 seconds, no recovery)
- Path map does not appear at all
- Console shows an uncaught React error (red error with React stack trace)
- Plan B shows visually different content than Plan A (mode indicator visible)

**If severe**:
1. Stop the current run
2. Document: which ACT, which step, exact error message from console
3. Exit ALL-01 validation
4. Re-enter FE-07 (bug fix phase) with the bug report
5. After the fix, restart ALL-01 validation from Run 1

**Minor (keep going)**:
- Slider is slightly slow (350ms instead of 300ms) but still responds
- Detail panel text is slightly truncated
- Minor visual glitch that doesn't hide any information
- Console warning (yellow, not red)

**If minor**:
1. Document the observation in the bug log
2. Continue the current run
3. Note it in the final CP3 report as a known minor issue

---

## Verifying Plan A vs Plan B

**How to confirm you are in Plan A**:
- DevTools Network tab shows a request to `/api/paths/simulate`
- The request takes 3–12 seconds (live Gemini processing)
- The response body contains a unique, freshly generated PathMap (node labels may vary between runs)

**How to confirm you are in Plan B**:
- DevTools Network tab shows a request to `/api/paths/simulate` completing in < 100ms
- No request to `generativelanguage.googleapis.com` is visible in the Network tab
- The response body is identical between runs (same mock data every time)

**Visually, Plan A and Plan B must look the same**:
- If you see any text like "MOCK", "TEST MODE", "Using cached data", or any banner/badge — that is a severe bug.

---

## CP3 Completion Checklist

When all 3 runs are done, confirm the following before declaring CP3:

```
[ ] Run 1: ACT 1 PASS, ACT 2 PASS, ACT 3 PASS, ACT 4 PASS — 0 severe bugs
[ ] Run 2: ACT 1 PASS, ACT 2 PASS, ACT 3 PASS, ACT 4 PASS — 0 severe bugs
[ ] Run 3: ACT 1 PASS, ACT 2 PASS, ACT 3 PASS, ACT 4 PASS — 0 severe bugs
[ ] At least 1 run done on Plan A (live API)
[ ] At least 1 run done on Plan B (mock mode)
[ ] All performance targets met across all runs
[ ] Zero console errors from LifePath code in all runs
```

If all boxes are checked: **CP3 ACHIEVED**.

Record the completion time and move to Phase 4 (발표 준비).

**After CP3: 5:00 이후는 절대 코딩 금지선 준수.**

---

## Quick Reference

| Item | Plan A Value | Plan B Value |
|---|---|---|
| `.env.local` key | `USE_MOCK=false` | `USE_MOCK=true` |
| Dev server restart needed? | No (if already running) | YES — restart required |
| Internet needed? | Yes | No |
| ACT 1 load target | ≤ 15 seconds | ≤ 3 seconds |
| Map render target | ≤ 3 seconds | ≤ 3 seconds |
| Slider response target | ≤ 300ms | ≤ 300ms |
| Node click target | ≤ 300ms | ≤ 300ms |
| Console errors allowed | 0 | 0 |
| Gemini API call visible? | Yes (in Network tab) | No |
| UI difference from other plan | None (visually identical) | None (visually identical) |
