# FE-06: 로딩 애니메이션 — Quickstart Testing Guide

**Feature ID**: FE-06
**Date**: 2026-02-28

---

## Prerequisites

- `npm run dev` running at `http://localhost:3000`
- FE-01 complete (goal input form with Zustand store)
- FE-02 complete (dark theme applied)
- BE-01 complete (Next.js project scaffolding, `app/globals.css` exists)
- The `useLifePathStore` Zustand store has `isLoading: boolean`

---

## Quick Verification (2 minutes)

### Step 1: Confirm overlay appears on form submit

1. Open `http://localhost:3000` in a browser
2. Type any goal in the input field (e.g., "풀스택 개발자 되기")
3. Click "경로 생성하기"
4. **Expected**: A dark semi-transparent overlay appears immediately, covering the screen
5. **Expected**: The text "🔍 경로를 탐색 중..." is visible in the center of the overlay
6. **Expected**: A small spinner is spinning below the tree emoji

If the overlay does not appear: check that `<LoadingAnimation />` is rendered in `app/page.tsx` and that `isLoading` is set to `true` in `generatePath()` before the fetch call.

### Step 2: Confirm message cycling

1. While the overlay is visible (API call in progress), wait and watch
2. **Expected**: After 2 seconds, the message changes to "🌿 분기점을 찾는 중..."
3. **Expected**: After 4 seconds, message changes to "🔗 합류점을 연결하는 중..."
4. **Expected**: After 6 seconds, message changes to "🌱 나무를 심는 중..."
5. **Expected**: After 8 seconds, cycles back to "🔍 경로를 탐색 중..."

If messages do not cycle: check `useEffect` and `setInterval` setup; verify `MESSAGE_INTERVAL_MS = 2000`.

### Step 3: Confirm tree animation plays

1. While the overlay is visible, observe the large emoji/tree in the center
2. **Expected**: The emoji pulses (scales up and down) continuously
3. **Expected**: Animation loops without pausing

If animation is static: check that `loading-tree-pulse` CSS class is applied and `@keyframes treePulse` exists in `app/globals.css`.

### Step 4: Confirm fade-out on API response

1. Wait for the API to respond (or use mock mode: `USE_MOCK=true` in `.env.local`)
2. **Expected**: The overlay begins to fade to transparent over approximately 500ms
3. **Expected**: The path map is visible beneath the fading overlay during the transition
4. **Expected**: After ~500ms, the overlay is completely gone from the DOM

To inspect: open browser DevTools, Elements tab, and observe the `<div class="fixed inset-0...">` element disappear after fade-out.

If overlay does not fade: check `isVisible` state transition and the `style={{ opacity: isVisible ? 1 : 0 }}` inline style.

If overlay does not unmount: check `setTimeout(() => setShouldRender(false), 500)` in the effect.

---

## Mock Mode Testing (faster iteration)

Set `USE_MOCK=true` in `.env.local` to bypass the Gemini API. The mock returns instantly, so the loading overlay will appear and immediately begin fading. This is useful for testing the fade-out behavior.

```bash
# .env.local
USE_MOCK=true
```

Restart the dev server after changing `.env.local`. In mock mode:
- Overlay appears when "경로 생성하기" is clicked
- Overlay begins fading almost immediately (API resolves in < 100ms)
- This tests the fast-response edge case: overlay should still fade gracefully

---

## Manual Test: Memory Leak Check

1. Open browser DevTools, Console tab
2. Submit a goal to trigger loading
3. Before the API responds, navigate away or rapidly re-submit
4. **Expected**: No console errors about "Can't perform a React state update on an unmounted component"
5. **Expected**: No errors about leaked `setInterval` or `setTimeout`

If warnings appear: verify that `useEffect` cleanup returns `clearInterval` and `clearTimeout` correctly.

---

## Manual Test: Dark Theme Compatibility

1. Verify the LifePath app is in dark mode (dark background)
2. Trigger the loading overlay
3. **Expected**: Overlay background is dark (`bg-gray-950/90` or similar), not white
4. **Expected**: Message text is white or light-colored, readable against dark background
5. **Expected**: Spinner has a visible colored segment (emerald-400) against dark ring (gray-700)
6. **Expected**: Tree emoji is visible and not blending into the background

---

## Manual Test: prefers-reduced-motion

1. On macOS: System Settings → Accessibility → Display → Reduce Motion (ON)
   On Windows: Settings → Ease of Access → Display → Show animations (OFF)
2. Trigger the loading overlay
3. **Expected**: Tree animation does NOT play (static emoji displayed)
4. **Expected**: When API responds, overlay disappears instantly (no 500ms fade)

---

## Checklist

- [ ] Overlay appears when `isLoading` becomes `true`
- [ ] All four messages cycle in correct order
- [ ] Messages cycle at 2-second intervals
- [ ] Tree/emoji animation plays continuously
- [ ] Spinner rotates continuously
- [ ] `isLoading=false` triggers fade-out (opacity 0 over 500ms)
- [ ] Overlay is removed from DOM after fade-out completes
- [ ] No memory leak warnings in console
- [ ] Dark theme: colors are readable
- [ ] Z-index: overlay appears above the map and input form
- [ ] pointer-events disabled during fade-out (can interact with map beneath)
