# FE-06: 로딩 애니메이션 — Component Contract

**Feature ID**: FE-06
**Contract Type**: React Component + Zustand Integration
**Date**: 2026-02-28

---

## LoadingAnimation Component Contract

### Signature

```typescript
// File: components/LoadingAnimation.tsx

'use client'

/**
 * Full-screen loading overlay displayed while the path generation API call is in progress.
 *
 * Reads `isLoading` from `useLifePathStore` directly.
 * No props required.
 *
 * Lifecycle:
 *   - Renders overlay when isLoading transitions to true
 *   - Cycles through four progress messages every 2 seconds
 *   - Plays CSS treePulse animation continuously
 *   - When isLoading transitions to false: fades out over 500ms, then removes from DOM
 *
 * @returns JSX overlay element, or null when not active
 */
export function LoadingAnimation(): JSX.Element | null
```

### Props

None. The component accepts no props.

```typescript
// Correct usage:
<LoadingAnimation />

// Incorrect — no props exist:
<LoadingAnimation isLoading={true} />         // TypeScript error
<LoadingAnimation messages={[...]} />          // TypeScript error
```

### Return Value

- Returns `JSX.Element` (the overlay div) when `shouldRender` is `true`
- Returns `null` when `shouldRender` is `false` (not loading and fade-out complete)

---

## Consumed Zustand State

### Store: `useLifePathStore`

The component consumes exactly one field from the store.

```typescript
// Import:
import { useLifePathStore } from '@/store/useLifePathStore'

// Usage inside component:
const isLoading = useLifePathStore(s => s.isLoading)
```

#### `isLoading: boolean`

| Value | Meaning | LoadingAnimation Response |
|-------|---------|--------------------------|
| `true` | `generatePath()` dispatched; API call in progress | Overlay appears (opacity: 1, shouldRender: true) |
| `false` | API call resolved or rejected; or not yet started | Overlay begins 500ms fade-out, then unmounts |

**Read-only**: `LoadingAnimation` never writes to the store. It is a pure consumer.

**No store modifications required**: The existing `useLifePathStore` (from FE-01 / BE-01) already has `isLoading: boolean` managed by `generatePath()`. FE-06 introduces zero store changes.

---

## Side Effects Contract

### Effect 1: Message Cycling

```typescript
// Precondition: component is mounted
// Postcondition: messageIndex increments every 2000ms, wraps at 4
// Cleanup: interval is cleared when component unmounts

useEffect(() => {
  const id = setInterval(
    () => setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length),
    MESSAGE_INTERVAL_MS  // 2000
  )
  return () => clearInterval(id)
}, [])  // runs once on mount
```

**Invariants**:
- `messageIndex` is always in range `[0, LOADING_MESSAGES.length - 1]` (i.e., 0–3)
- Interval is always cleared on unmount (no memory leak)
- Interval is not paused/restarted when `isLoading` changes — cycling continues throughout the overlay's lifetime

### Effect 2: Fade-Out + Unmount

```typescript
// Precondition: isLoading value changes
// Postcondition:
//   if isLoading=true:  isVisible=true, shouldRender=true
//   if isLoading=false: isVisible=false (triggers CSS transition),
//                       shouldRender=false after 500ms (triggers null render)
// Cleanup: timeout is cleared if isLoading changes again before 500ms elapses

useEffect(() => {
  if (isLoading) {
    setShouldRender(true)
    setIsVisible(true)
    return
  }
  setIsVisible(false)
  const id = setTimeout(() => setShouldRender(false), FADE_OUT_DURATION_MS)  // 500
  return () => clearTimeout(id)
}, [isLoading])
```

**Invariants**:
- `isVisible` is always `false` when `isLoading` is `false` (no visible overlay after API call)
- `shouldRender` becomes `false` exactly 500ms after `isVisible` becomes `false`
- If `isLoading` rapidly toggles `false→true` within 500ms, the timeout is cleared and overlay remains visible

---

## Rendered DOM Contract

### When Active (`shouldRender = true`)

```html
<!-- Overlay: fixed, full-screen, z-50 -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center
         bg-gray-950/90 transition-opacity duration-500 ease-out
         [pointer-events:none when fading]"
  style="opacity: 1|0"
>
  <!-- Content column -->
  <div class="flex flex-col items-center gap-6">

    <!-- Tree animation (emoji or CSS shape) -->
    <div class="text-6xl loading-tree-pulse" aria-hidden="true">
      🌱
    </div>

    <!-- Spinner ring -->
    <div class="w-12 h-12 rounded-full border-4 border-gray-700
                border-t-emerald-400 animate-spin"
         aria-hidden="true"
    />

    <!-- Progress message (key triggers CSS fade-in animation) -->
    <p
      key="{messageIndex}"
      class="text-white text-lg font-medium tracking-wide
             loading-message-enter"
      role="status"
      aria-live="polite"
      aria-label="경로 생성 진행 상황"
    >
      {LOADING_MESSAGES[messageIndex]}
    </p>

    <!-- Optional sub-message -->
    <p class="text-gray-400 text-sm">잠시만 기다려 주세요...</p>

  </div>
</div>
```

### When Inactive (`shouldRender = false`)

```tsx
return null
// No DOM element rendered.
// No hidden elements that could block interaction.
```

---

## Accessibility Contract

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role="status"` | on message `<p>` | Announces to screen readers |
| `aria-live="polite"` | on message `<p>` | Non-urgent live region update |
| `aria-label` | "경로 생성 진행 상황" | Describes the live region |
| `aria-hidden="true"` | on decorative elements | Excludes emoji/spinner from SR |

**Focus trap**: Not implemented (YAGNI). The loading state is brief (2–5s) and no interactive elements are inside the overlay.

---

## Integration Contract: `app/page.tsx`

```tsx
// app/page.tsx — required change to integrate FE-06

import { LoadingAnimation } from '@/components/LoadingAnimation'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Always in component tree; self-manages DOM presence */}
      <LoadingAnimation />

      {/* Goal input (shown when pathMap is null) */}
      <GoalInputView />

      {/* Path map (shown when pathMap is populated) */}
      <PathMapView />
    </main>
  )
}
```

**Why `<LoadingAnimation />` is always in tree**: The component must be in the DOM during the 500ms fade-out transition to render the CSS `opacity` animation. If the parent unmounts it immediately when `isLoading` becomes `false`, the fade-out is never seen.

---

## Contract Stability

| Contract | Stable | Notes |
|----------|--------|-------|
| Component signature (no props) | Yes | Will not change unless messages or duration need customization |
| `isLoading` from Zustand | Yes | Existing store field; no modifications |
| `LOADING_MESSAGES` constant | Yes | May add/change messages without breaking behavior |
| CSS class names (`loading-tree-pulse`, etc.) | Yes | Defined in globals.css; consistent with other global styles |
| 500ms fade duration | Negotiable | Can be changed by updating `FADE_OUT_DURATION_MS` and matching CSS `duration-500` |
