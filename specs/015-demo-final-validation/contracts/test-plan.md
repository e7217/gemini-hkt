# Test Plan Contract: ALL-01 데모 테스트 + 최종 검증

**Date**: 2026-02-28
**Feature**: Demo Validation — ACT 1–4, Plan A/B, CP3
**Contract Version**: 1.0
**Status**: Active

This document is the formal, step-by-step test execution contract for ALL-01. Each step is a binary pass/fail check. A single "severe" failure stops the current run immediately.

---

## Pre-Test Environment Setup

Before running any test, verify the environment is correctly configured.

### Plan A Setup Checklist

```
[ ] .env.local exists at project root
[ ] GEMINI_API_KEY is set to a valid, active API key
[ ] USE_MOCK is set to "false" OR the USE_MOCK line is absent from .env.local
[ ] npm run dev is running and accessible at localhost:3000 (or configured port)
[ ] Browser: Chrome (latest stable), opened in Incognito mode
[ ] DevTools is open, Network tab and Console tab visible
[ ] "Preserve log" is enabled in both Network and Console tabs
[ ] Network tab is cleared (no previous requests)
[ ] Console is cleared (no previous messages)
[ ] Active internet connection is confirmed
[ ] No VPN is active that may affect API calls (or VPN behavior is documented)
```

### Plan B Setup Checklist

```
[ ] .env.local exists at project root
[ ] USE_MOCK is set to "true"
[ ] npm run dev has been RESTARTED after changing USE_MOCK (Next.js requires restart for env var changes)
[ ] App loads at localhost:3000 without errors
[ ] Browser: Chrome (latest stable), opened in Incognito mode
[ ] DevTools is open, Network tab and Console tab visible
[ ] "Preserve log" is enabled
[ ] Network tab is cleared
[ ] Console is cleared
```

---

## ACT 1 Checklist: "누구나 시작할 수 있다" (30초)

These steps MUST be executed in order. Record pass/fail for each step.

| # | Action | Expected Result | Target | Result |
|---|---|---|---|---|
| 1.1 | Navigate to the app home page (`localhost:3000`) | Input screen displays with goal text field and 🎲 button visible | — | [ ] Pass / [ ] Fail |
| 1.2 | Confirm the goal input field is empty | Goal input shows placeholder text, no pre-filled content | — | [ ] Pass / [ ] Fail |
| 1.3 | Click the 🎲 (random goal) button | "풀스택 개발자 되기" auto-fills into the goal input field | ≤ 100ms | [ ] Pass / [ ] Fail |
| 1.4 | Verify no page navigation occurred | URL remains the same; no page reload flash | — | [ ] Pass / [ ] Fail |
| 1.5 | Click the "경로 생성하기" button | A loading animation appears immediately | ≤ 300ms | [ ] Pass / [ ] Fail |
| 1.6 | Observe loading state | Loading animation is visible and active (not frozen) | — | [ ] Pass / [ ] Fail |
| 1.7 | Wait for path map transition | Path map view appears, replacing the loading animation | ≤ 15s (Plan A) / ≤ 3s (Plan B) | [ ] Pass / [ ] Fail |
| 1.8 | Verify path map initial state | 3 vertical tracks are visible with at least 1 node each | — | [ ] Pass / [ ] Fail |
| 1.9 | Check console | Zero red (error) messages from LifePath code | — | [ ] Pass / [ ] Fail |
| 1.10 | (Plan A only) Check Network tab | Request to `/api/paths/simulate` shows ≤ 15000ms total time | ≤ 15000ms | [ ] Pass / [ ] Fail |
| 1.11 | (Plan B only) Check Network tab | Request to `/api/paths/simulate` shows ≤ 3000ms total time; no request to `generativelanguage.googleapis.com` | ≤ 3000ms | [ ] Pass / [ ] Fail |

**ACT 1 Result**: [ ] PASS (all steps passed) / [ ] FAIL (record failing step ID and severity)

**If FAIL**: Record `failedStepId`, `severity` (minor/severe), `observation`. If severe → STOP RUN.

---

## ACT 2 Checklist: "당신의 나무가 자랍니다" (50초)

Requires ACT 1 PASS.

| # | Action | Expected Result | Target | Result |
|---|---|---|---|---|
| 2.1 | Observe the 3-track vertical layout | Fast Track, Deep Dive, Risk Path are displayed as 3 distinct vertical columns | — | [ ] Pass / [ ] Fail |
| 2.2 | Confirm node presence | Each track shows at least 1 node in the default/initial timeline position | — | [ ] Pass / [ ] Fail |
| 2.3 | Locate the timeline slider | A slider or set of controls for "1년", "3년", "5년" is visible | — | [ ] Pass / [ ] Fail |
| 2.4 | Set timeline to "1년" (or confirm it starts there) | Only 1-year nodes are visible on each track | — | [ ] Pass / [ ] Fail |
| 2.5 | Move timeline slider from "1년" to "3년" | Additional nodes appear on each track within 300ms | ≤ 300ms | [ ] Pass / [ ] Fail |
| 2.6 | Confirm 3-year node count | Each track shows more nodes than at 1 year (path expanded) | — | [ ] Pass / [ ] Fail |
| 2.7 | Move timeline slider from "3년" to "5년" | Further nodes appear on each track within 300ms | ≤ 300ms | [ ] Pass / [ ] Fail |
| 2.8 | Confirm 5-year node count | Each track shows the maximum nodes, including goal/merge nodes near the top | — | [ ] Pass / [ ] Fail |
| 2.9 | Verify no console errors during slider interaction | Zero red error messages during all slider movements | — | [ ] Pass / [ ] Fail |
| 2.10 | Verify no visual glitches | No flickering, overlapping, or disappearing nodes during transitions | — | [ ] Pass / [ ] Fail |

**ACT 2 Result**: [ ] PASS / [ ] FAIL

---

## ACT 3 Checklist: "어떤 길이든 괜찮다" (30초)

Requires ACT 2 PASS with timeline at "5년".

| # | Action | Expected Result | Target | Result |
|---|---|---|---|---|
| 3.1 | Locate the merge point node | A visually distinct node is visible where the 3 tracks converge | — | [ ] Pass / [ ] Fail |
| 3.2 | Verify merge point visual | The merge point node displays a multi-color gradient (not a single solid color) | — | [ ] Pass / [ ] Fail |
| 3.3 | Click any step node on any track | A detail panel opens | ≤ 300ms | [ ] Pass / [ ] Fail |
| 3.4 | Verify detail panel content | Panel shows at minimum: node label, description, and track information | — | [ ] Pass / [ ] Fail |
| 3.5 | Verify panel readability | No text overflow, no empty content areas, all text is legible | — | [ ] Pass / [ ] Fail |
| 3.6 | Click on a different track or its label | That track becomes highlighted (visually emphasized) | ≤ 300ms | [ ] Pass / [ ] Fail |
| 3.7 | Verify de-emphasis of other tracks | The non-highlighted tracks appear dimmer or less prominent | — | [ ] Pass / [ ] Fail |
| 3.8 | Click on a second track | Highlight transfers to the new track; previous track de-emphasizes | ≤ 300ms | [ ] Pass / [ ] Fail |
| 3.9 | Verify no stuck highlight states | No track remains incorrectly highlighted after interacting with another | — | [ ] Pass / [ ] Fail |
| 3.10 | Check console during interactions | Zero red error messages during node click and track highlight interactions | — | [ ] Pass / [ ] Fail |

**ACT 3 Result**: [ ] PASS / [ ] FAIL

---

## ACT 4 Checklist: 마무리 (10초)

Requires ACT 3 PASS.

| # | Action | Expected Result | Target | Result |
|---|---|---|---|---|
| 4.1 | Observe final screen state | UI is in a clean, complete state — no active loading spinners | — | [ ] Pass / [ ] Fail |
| 4.2 | Verify no empty content areas | All UI sections show content, no placeholder or missing elements | — | [ ] Pass / [ ] Fail |
| 4.3 | Final console inspection | Zero red (error) messages from LifePath application code in the entire run | — | [ ] Pass / [ ] Fail |
| 4.4 | Count total console warnings | Record count of yellow warnings from LifePath code (informational, does not fail) | — | [ ] Pass / [ ] Fail |
| 4.5 | Test app reset | Navigate back to input screen (browser back, refresh, or reset button) | — | [ ] Pass / [ ] Fail |
| 4.6 | Verify clean reset | Input screen loads cleanly with empty goal field; no broken state from previous run | — | [ ] Pass / [ ] Fail |

**ACT 4 Result**: [ ] PASS / [ ] FAIL

---

## Plan A Verification Steps

Execute after completing a Plan A demo run (at minimum once, ideally all 3 Plan A runs).

| # | Check | Expected | Result |
|---|---|---|---|
| PA.1 | Network tab: confirm API call | Request to `/api/paths/simulate` present in Network tab | [ ] Pass / [ ] Fail |
| PA.2 | Network tab: API response time | Total time for `/api/paths/simulate` request ≤ 15000ms | [ ] Pass / [ ] Fail |
| PA.3 | Network tab: no mock indicator | Response body contains dynamic Gemini data (not static mock) | [ ] Pass / [ ] Fail |
| PA.4 | UI comparison to Plan B | Visually identical to what Plan B renders — no mock banner or mode indicator | [ ] Pass / [ ] Fail |

---

## Plan B Verification Steps

Execute after completing a Plan B demo run (at minimum once).

| # | Check | Expected | Result |
|---|---|---|---|
| PB.1 | Network tab: no Gemini call | No request to `generativelanguage.googleapis.com` in Network tab | [ ] Pass / [ ] Fail |
| PB.2 | Network tab: fast mock response | `/api/paths/simulate` responds in ≤ 100ms | [ ] Pass / [ ] Fail |
| PB.3 | UI: no mock mode indicator | No text, badge, or visual element indicates the app is in mock mode | [ ] Pass / [ ] Fail |
| PB.4 | UI comparison to Plan A | Path map layout, node count, and interactions look identical to Plan A | [ ] Pass / [ ] Fail |

---

## Performance Measurement Protocol

Record the following measurements for each run. Use the DevTools Network tab and console timing as described in `research.md`.

### Run Performance Log

| Run | Plan | API Response (ms) | Map Render (ms) | Slider Response (ms) | Click→Panel (ms) | Track Highlight (ms) | Meet All Targets? |
|---|---|---|---|---|---|---|---|
| Run 1 | A / B | | | | | | [ ] Yes / [ ] No |
| Run 2 | A / B | | | | | | [ ] Yes / [ ] No |
| Run 3 | A / B | | | | | | [ ] Yes / [ ] No |

**Performance Pass Criteria**:
- API Response: ≤ 15000ms (Plan A) or ≤ 3000ms (Plan B)
- Map Render: ≤ 3000ms
- Slider Response: ≤ 300ms
- Click to Panel: ≤ 300ms
- Track Highlight: ≤ 300ms

---

## CP3 Sign-Off Checklist

CP3 is achieved only when ALL of the following are true:

```
[ ] Run 1 complete: ACT 1–4 all PASS, 0 severe bugs, all performance targets met
[ ] Run 2 complete: ACT 1–4 all PASS, 0 severe bugs, all performance targets met
[ ] Run 3 complete: ACT 1–4 all PASS, 0 severe bugs, all performance targets met
[ ] Plan A tested: at least 1 run confirmed with live Gemini API
[ ] Plan B tested: at least 1 run confirmed with USE_MOCK=true
[ ] Plan A and Plan B are visually indistinguishable: confirmed
[ ] Console errors in all runs: 0 LifePath-originating errors across all 3 runs
[ ] App reset verified: app resets cleanly between runs
```

**CP3 Status**: [ ] ACHIEVED / [ ] NOT YET ACHIEVED

**CP3 Achieved At**: _______ (timestamp)

**Validated By**: _______

**Next Phase**: Phase 4 (발표 준비, 5:00–6:00) — 코딩 금지선 준수

---

## Bug Log

Record any bugs found during validation here. Minor bugs are accepted and noted; severe bugs require stopping and re-entering FE-07.

| Bug ID | ACT | Severity | Description | Resolution |
|---|---|---|---|---|
| | | | | |

**Severe Bug Rule**: If any severe bug is found, STOP the current run. Exit ALL-01 validation. Fix in FE-07. Then restart ALL-01 validation from Run 1 (all 3 runs must be re-executed from scratch).
