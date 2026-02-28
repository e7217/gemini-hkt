# FE-06: 로딩 애니메이션 — Task List

**Feature ID**: FE-06
**Total Estimated Time**: 15m
**Date**: 2026-02-28

---

## Phase 1: Setup (2m)

### T-01: Verify prerequisites
**Duration**: 1m
**Files**: (read-only inspection)

- [ ] Confirm `app/globals.css` exists (from BE-01)
- [ ] Confirm `store/useLifePathStore.ts` exports `isLoading: boolean` (from FE-01)
- [ ] Confirm `app/page.tsx` exists and can accept new child components
- [ ] Confirm dark theme CSS variables are applied (from FE-02: `bg-background`, etc.)
- [ ] Confirm no existing `@keyframes treePulse` or `@keyframes treeGrow` in `globals.css` (avoid collision)

**Exit Criteria**: All five checks pass. If `useLifePathStore` does not have `isLoading`, stop and resolve FE-01 first.

---

### T-02: Create spec directory contracts subdirectory
**Duration**: 1m
**Files**: `specs/008-loading-animation/contracts/` (already created by speckit)

- [ ] Confirm `specs/008-loading-animation/contracts/loading-api.md` exists
- [ ] No implementation action needed in this task

---

## Phase 2: Foundational (3m)

### T-03: Add CSS keyframes to globals.css
**Duration**: 2m
**File**: `app/globals.css`

Append the following block at the end of `globals.css`, after all existing rules:

```css
/* --- FE-06: Loading Animation --- */

@keyframes treePulse {
  0%,  100% { transform: scale(0.85); opacity: 0.65; }
  50%        { transform: scale(1.15); opacity: 1;    }
}

@keyframes messageFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}

.loading-tree-pulse {
  animation: treePulse 1.5s ease-in-out infinite;
}

.loading-message-enter {
  animation: messageFadeIn 0.3s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .loading-tree-pulse   { animation: none; }
  .loading-message-enter { animation: none; }
}
```

- [ ] Block appended to end of `globals.css`
- [ ] No existing CSS rules overridden
- [ ] Names are prefixed with `loading-` to avoid conflicts
- [ ] `prefers-reduced-motion` block is included

---

### T-04: Define LOADING_MESSAGES constant
**Duration**: 1m
**File**: `components/LoadingAnimation.tsx` (new file, top section)

Create the file and add the constants block:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useLifePathStore } from '@/store/useLifePathStore'

// --- Constants ---

export const LOADING_MESSAGES = [
  '🔍 경로를 탐색 중...',
  '🌿 분기점을 찾는 중...',
  '🔗 합류점을 연결하는 중...',
  '🌱 나무를 심는 중...',
] as const

const MESSAGE_INTERVAL_MS = 2000
const FADE_OUT_DURATION_MS = 500
```

- [ ] File created at `components/LoadingAnimation.tsx`
- [ ] `'use client'` directive on line 1
- [ ] `LOADING_MESSAGES` typed with `as const`
- [ ] `MESSAGE_INTERVAL_MS = 2000` defined
- [ ] `FADE_OUT_DURATION_MS = 500` defined

---

## Phase 3: US1 — LoadingAnimation Component with Text Cycling (4m)

### T-05: Implement message cycling hook logic
**Duration**: 2m
**File**: `components/LoadingAnimation.tsx`

Add the component skeleton with the message cycling `useEffect`:

```typescript
export function LoadingAnimation(): JSX.Element | null {
  const isLoading = useLifePathStore(s => s.isLoading)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(isLoading)
  const [shouldRender, setShouldRender] = useState(isLoading)

  // Effect 1: Cycle through loading messages every 2 seconds
  useEffect(() => {
    const id = setInterval(
      () => setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length),
      MESSAGE_INTERVAL_MS
    )
    return () => clearInterval(id)
  }, [])

  if (!shouldRender) return null

  return (
    <div>
      <p>{LOADING_MESSAGES[messageIndex]}</p>
    </div>
  )
}
```

- [ ] Component function defined and exported
- [ ] `isLoading` read via selector (not full store subscription)
- [ ] `messageIndex`, `isVisible`, `shouldRender` state declared
- [ ] `setInterval` effect cycles `messageIndex` with modulo wrap
- [ ] `clearInterval` returned from effect (cleanup)
- [ ] `shouldRender` guard returns `null` when false
- [ ] Component renders current message string

---

### T-06: Build full overlay JSX structure
**Duration**: 2m
**File**: `components/LoadingAnimation.tsx`

Replace the minimal return with the complete overlay JSX:

```tsx
return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center
               bg-gray-950/90 transition-opacity duration-500 ease-out"
    style={{
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
    }}
  >
    <div className="flex flex-col items-center gap-6">
      <div
        className="text-6xl loading-tree-pulse select-none"
        aria-hidden="true"
      >
        🌱
      </div>
      <div
        className="w-12 h-12 rounded-full border-4 border-gray-700
                   border-t-emerald-400 animate-spin"
        aria-hidden="true"
      />
      <p
        key={messageIndex}
        className="text-white text-lg font-medium tracking-wide
                   loading-message-enter"
        role="status"
        aria-live="polite"
        aria-label="경로 생성 진행 상황"
      >
        {LOADING_MESSAGES[messageIndex]}
      </p>
      <p className="text-gray-400 text-sm">잠시만 기다려 주세요...</p>
    </div>
  </div>
)
```

- [ ] Overlay div: `fixed inset-0 z-50` for full-screen coverage
- [ ] Background: `bg-gray-950/90` (dark, semi-transparent)
- [ ] Opacity driven by `isVisible` state via inline style
- [ ] `pointerEvents` disabled when fading to allow map interaction
- [ ] Tree emoji with `loading-tree-pulse` class
- [ ] Spinner ring using Tailwind `animate-spin` + `border-t-emerald-400`
- [ ] Message `<p>` with `key={messageIndex}` to trigger CSS fade-in on change
- [ ] `role="status"` and `aria-live="polite"` on message element
- [ ] `aria-hidden="true"` on decorative elements
- [ ] Sub-message "잠시만 기다려 주세요..." in muted text

---

## Phase 4: US2 — CSS Animation (1m)

### T-07: Verify CSS animation renders in browser
**Duration**: 1m
**Files**: `app/globals.css`, browser DevTools

- [ ] Run `npm run dev` and navigate to the app
- [ ] Open browser DevTools → Elements → inspect `.loading-tree-pulse` class
- [ ] Confirm `animation: treePulse 1.5s ease-in-out infinite` is applied
- [ ] Observe tree emoji pulsing in the browser
- [ ] Confirm spinner is rotating (`animate-spin` from Tailwind)
- [ ] Confirm CSS only — no JavaScript animation library imported

**Note**: The CSS animation runs whenever the overlay is visible. If the API returns before the animation completes a full cycle, that is acceptable.

---

## Phase 5: US3 — Fade-Out Transition (3m)

### T-08: Implement fade-out + unmount effect
**Duration**: 2m
**File**: `components/LoadingAnimation.tsx`

Add the second `useEffect` for fade-out and unmount:

```typescript
// Effect 2: Handle show/hide based on isLoading changes
useEffect(() => {
  if (isLoading) {
    setShouldRender(true)
    setIsVisible(true)
    return
  }
  setIsVisible(false)
  const id = setTimeout(() => setShouldRender(false), FADE_OUT_DURATION_MS)
  return () => clearTimeout(id)
}, [isLoading])
```

- [ ] Effect depends on `[isLoading]`
- [ ] When `isLoading=true`: sets both `shouldRender` and `isVisible` to `true`
- [ ] When `isLoading=false`: sets `isVisible=false` (triggers CSS opacity transition)
- [ ] `setTimeout(FADE_OUT_DURATION_MS)` then sets `shouldRender=false` (unmounts)
- [ ] Cleanup: `clearTimeout` returned so stale timer is cancelled on rapid `isLoading` changes

---

### T-09: Verify fade-out behavior end-to-end
**Duration**: 1m
**Files**: browser DevTools

- [ ] Submit a goal in the app to trigger loading
- [ ] Wait for API response (or use `USE_MOCK=true`)
- [ ] Observe: overlay opacity transitions from 1 to 0 over ~500ms
- [ ] Observe: after 500ms, overlay div is removed from DOM (not just hidden)
- [ ] Verify: path map is visible beneath the fading overlay during the 500ms transition
- [ ] Verify: no pointer-event blocking after fade begins (hover over map elements works)

---

## Phase 6: Polish — isLoading Integration in page.tsx (2m)

### T-10: Add LoadingAnimation to app/page.tsx
**Duration**: 1m
**File**: `app/page.tsx`

```tsx
import { LoadingAnimation } from '@/components/LoadingAnimation'

// Add inside the page return:
<main className="relative min-h-screen bg-background">
  <LoadingAnimation />
  {/* ... existing GoalInput / PathMap rendering ... */}
</main>
```

- [ ] `LoadingAnimation` imported from `@/components/LoadingAnimation`
- [ ] Component rendered inside `<main>` (or equivalent root element)
- [ ] `<LoadingAnimation />` placed before other content in the DOM (ensures z-50 stacking works)
- [ ] No props passed to `<LoadingAnimation />`
- [ ] Existing page structure (GoalInput / PathMap) unaffected

---

### T-11: Final integration smoke test
**Duration**: 1m
**Files**: browser

Complete the full user flow:

- [ ] App loads at `http://localhost:3000` — no loading overlay visible
- [ ] Type a goal and click "경로 생성하기" — overlay appears immediately
- [ ] Observe: messages cycle every 2 seconds in the correct order
- [ ] Observe: tree emoji pulses, spinner spins
- [ ] API response arrives — overlay begins fading
- [ ] ~500ms later — overlay gone, path map fully visible
- [ ] No console errors in DevTools
- [ ] No React warnings about memory leaks or unmounted components
- [ ] Dark theme: all text readable, colors harmonious
- [ ] Z-index: overlay is above all other page content during loading

---

## Task Summary

| Phase | Task | Duration | File |
|-------|------|----------|------|
| Setup | T-01: Verify prerequisites | 1m | read-only |
| Setup | T-02: Confirm spec structure | 1m | read-only |
| Foundational | T-03: Add CSS keyframes | 2m | `app/globals.css` |
| Foundational | T-04: Define constants | 1m | `components/LoadingAnimation.tsx` |
| US1 | T-05: Message cycling hook | 2m | `components/LoadingAnimation.tsx` |
| US1 | T-06: Full overlay JSX | 2m | `components/LoadingAnimation.tsx` |
| US2 | T-07: Verify CSS animation | 1m | browser |
| US3 | T-08: Fade-out effect | 2m | `components/LoadingAnimation.tsx` |
| US3 | T-09: Verify fade-out | 1m | browser |
| Polish | T-10: Add to page.tsx | 1m | `app/page.tsx` |
| Polish | T-11: Final smoke test | 1m | browser |
| **Total** | | **15m** | |

---

## Files Modified

| File | Action | Notes |
|------|--------|-------|
| `app/globals.css` | Append | Add `@keyframes treePulse`, `@keyframes messageFadeIn`, CSS classes |
| `components/LoadingAnimation.tsx` | Create | Primary deliverable; ~60 lines total |
| `app/page.tsx` | Modify | Add `<LoadingAnimation />` import and usage |

## Files Read (No Changes)

| File | Purpose |
|------|---------|
| `store/useLifePathStore.ts` | Confirm `isLoading: boolean` field exists |
| `app/globals.css` | Inspect before appending (avoid name collisions) |
