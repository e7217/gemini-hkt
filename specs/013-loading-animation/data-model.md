# FE-06: 로딩 애니메이션 — Data Models

**Feature ID**: FE-06
**Date**: 2026-02-28

---

## Overview

FE-06 introduces no new Zustand store state and no API data models. The only data artifacts are:

1. The `LoadingAnimation` React component with its internal state types
2. The `LOADING_MESSAGES` constant
3. CSS animation state (managed by the browser, not JavaScript)
4. The integration surface with the existing Zustand store

---

## 1. LoadingAnimation Component Props

### Props Interface

```typescript
// components/LoadingAnimation.tsx
// No external props — the component is fully self-contained.
// It reads isLoading directly from useLifePathStore.

// Props type: empty object (no props)
type LoadingAnimationProps = Record<string, never>

// Usage:
// <LoadingAnimation />
// No props required or accepted.
```

**Design Decision**: No props interface because:
- `isLoading` comes from the global Zustand store, not from a parent component
- SOLID SRP: the loading state ownership belongs to the store, not any parent component
- YAGNI: no current need for customizing messages, duration, or appearance via props

---

## 2. Loading Message Array Constant

```typescript
// components/LoadingAnimation.tsx (top of file, before component)

export const LOADING_MESSAGES = [
  '🔍 경로를 탐색 중...',
  '🌿 분기점을 찾는 중...',
  '🔗 합류점을 연결하는 중...',
  '🌱 나무를 심는 중...',
] as const

// Derived type: readonly ['🔍 경로를 탐색 중...', '🌿 분기점을 찾는 중...', ...]
export type LoadingMessage = typeof LOADING_MESSAGES[number]
// Equivalent to: '🔍 경로를 탐색 중...' | '🌿 분기점을 찾는 중...' | ...

export const LOADING_MESSAGES_COUNT = LOADING_MESSAGES.length
// = 4 (compile-time constant)

// Message cycle interval duration in milliseconds
export const MESSAGE_INTERVAL_MS = 2000

// Fade-out transition duration in milliseconds
// Must match the CSS transition-duration value in the component
export const FADE_OUT_DURATION_MS = 500
```

**Why `as const`**:
- Prevents TypeScript from widening the type to `string[]`
- Enables precise union type `LoadingMessage` for the currently displayed message
- Makes the array `readonly` at the type level (cannot be mutated)

**Why exported**: Constants exported from the module allow test files to import them directly without hardcoding values in assertions.

---

## 3. Animation State (Internal Component State)

These are React `useState` values internal to `LoadingAnimation`. They are not stored in Zustand because they are transient UI state that does not need to be shared across components.

```typescript
// Internal state shape (not an exported type; documented for clarity)

interface LoadingAnimationState {
  // Index into LOADING_MESSAGES array.
  // Range: 0 to LOADING_MESSAGES_COUNT - 1 (0 to 3).
  // Incremented by setInterval every MESSAGE_INTERVAL_MS.
  // Wraps around using modulo: (prev + 1) % LOADING_MESSAGES_COUNT
  messageIndex: number

  // Controls CSS opacity of the overlay.
  // true  → opacity: 1 (overlay fully visible)
  // false → opacity: 0 (overlay fading out via CSS transition)
  // Transitions: true when isLoading becomes true, false when isLoading becomes false
  isVisible: boolean

  // Controls whether the overlay div is rendered at all.
  // true  → overlay div in DOM
  // false → component returns null
  // Set to false by setTimeout(FADE_OUT_DURATION_MS) after isVisible becomes false
  // This prevents a hidden DOM element from blocking user interaction with the map
  shouldRender: boolean
}

// Initial values:
// messageIndex: 0
// isVisible: isLoading (from store at mount time)
// shouldRender: isLoading (from store at mount time)
```

### State Transition Table

| Event | messageIndex | isVisible | shouldRender |
|-------|-------------|-----------|--------------|
| Component mounts (isLoading=true) | 0 | true | true |
| setInterval fires (2s) | +1 (mod 4) | true | true |
| isLoading transitions to false | unchanged | false | true |
| setTimeout fires (500ms after above) | unchanged | false | false |
| Component renders null | — | — | — |
| Component mounts (isLoading=false) | 0 | false | false |

---

## 4. Zustand Store Integration (Read-Only)

`LoadingAnimation` consumes one field from the existing `useLifePathStore`. No modifications to the store are required.

```typescript
// Existing store shape (from store/useLifePathStore.ts — BE-01 / FE-01)
// LoadingAnimation reads only this field:

interface LifePathStore {
  // ... other fields (goal, pathMap, error, etc.) ...

  isLoading: boolean
  // true:  POST /api/paths/simulate is in progress
  // false: API call completed (success or error) or not yet started
  // Set to true by generatePath() action before fetch
  // Set to false by generatePath() action after fetch resolves or rejects
}

// Selector used in LoadingAnimation:
// const isLoading = useLifePathStore(s => s.isLoading)
// Using a selector (not the full store) avoids re-renders on unrelated state changes
```

**Why selector pattern**: `useLifePathStore(s => s.isLoading)` subscribes only to `isLoading` changes. If `goal`, `pathMap`, or `error` change, `LoadingAnimation` does not re-render. This is a minor optimization but a good practice for performance-conscious code.

---

## 5. CSS Animation Definitions (globals.css additions)

These are not TypeScript data models, but they are the CSS "data" that drives the visual animation state.

```css
/* app/globals.css — append after existing rules */

/* --- FE-06: Loading Animation --- */

/* Tree emoji pulse: scale + opacity oscillation */
@keyframes treePulse {
  0%,  100% { transform: scale(0.85); opacity: 0.65; }
  50%        { transform: scale(1.15); opacity: 1;    }
}

/* Message fade-in: used when key={messageIndex} triggers remount */
@keyframes messageFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}

/* Applied classes */
.loading-tree-pulse {
  animation: treePulse 1.5s ease-in-out infinite;
}

.loading-message-enter {
  animation: messageFadeIn 0.3s ease-out forwards;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  .loading-tree-pulse {
    animation: none;
  }
  .loading-message-enter {
    animation: none;
  }
}
```

**CSS class naming**: Prefixed with `loading-` to avoid conflicts with existing utilities or future additions to `globals.css`.

---

## 6. Type Summary

| Symbol | Type | Location | Purpose |
|--------|------|----------|---------|
| `LOADING_MESSAGES` | `readonly string[4]` | `LoadingAnimation.tsx` | Message array constant |
| `LoadingMessage` | `string` union (4 members) | `LoadingAnimation.tsx` | Individual message type |
| `MESSAGE_INTERVAL_MS` | `2000` | `LoadingAnimation.tsx` | Interval constant |
| `FADE_OUT_DURATION_MS` | `500` | `LoadingAnimation.tsx` | Transition duration constant |
| `LoadingAnimationProps` | `Record<string, never>` | `LoadingAnimation.tsx` | No-props type (documentation) |
| `messageIndex` | `number` (0–3) | internal state | Current message index |
| `isVisible` | `boolean` | internal state | CSS opacity driver |
| `shouldRender` | `boolean` | internal state | DOM render guard |
| `isLoading` | `boolean` | Zustand store | External trigger |
