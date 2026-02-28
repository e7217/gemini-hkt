# FE-06: 로딩 애니메이션 — Research Findings

**Feature ID**: FE-06
**Date**: 2026-02-28
**Status**: Complete

---

## 1. CSS @keyframes Animation for Growing Tree

### Core Technique

A CSS-only growing tree silhouette uses `height` and `opacity` keyframes to simulate upward growth. The key insight is animating `height` from `0` to a fixed value (not `auto`) so the browser can interpolate smoothly.

```css
/* app/globals.css */
@keyframes treeGrow {
  0%   { height: 0px;   opacity: 0;   transform: scaleY(0); }
  30%  { height: 40px;  opacity: 0.4; transform: scaleY(0.3); }
  70%  { height: 90px;  opacity: 0.8; transform: scaleY(0.8); }
  100% { height: 120px; opacity: 1;   transform: scaleY(1); }
}

@keyframes treeCanopy {
  0%   { opacity: 0; transform: scale(0) translateY(10px); }
  60%  { opacity: 0; transform: scale(0) translateY(10px); }
  80%  { opacity: 0.6; transform: scale(0.7) translateY(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
```

**Why `transform-origin: bottom center`**: The trunk should appear to grow upward from the ground. Setting `transform-origin: bottom center` on the trunk element makes `scaleY()` expand from the bottom.

**CSS class in component**:
```css
.tree-trunk {
  width: 8px;
  background: #10b981; /* emerald-500 */
  border-radius: 4px;
  transform-origin: bottom center;
  animation: treeGrow 2s ease-out infinite alternate;
}

.tree-canopy {
  width: 48px;
  height: 48px;
  background: #059669; /* emerald-600 */
  border-radius: 50% 50% 40% 40%;
  animation: treeCanopy 2s ease-out infinite alternate;
}
```

**Alternative — Unicode tree character**: A simpler approach uses a `🌱` or `🌳` emoji with a CSS `scale` keyframe from `0.5` to `1.2` and back. Requires only 5 lines of CSS and is immediately thematic. Acceptable for hackathon scope.

```css
@keyframes treePulse {
  0%, 100% { transform: scale(0.8); opacity: 0.6; }
  50%       { transform: scale(1.2); opacity: 1;   }
}
.tree-emoji {
  font-size: 3rem;
  animation: treePulse 1.5s ease-in-out infinite;
}
```

**Recommendation**: Use the emoji-based approach for hackathon speed (5 lines CSS, zero HTML structure complexity), with the CSS shape approach as an upgrade path.

---

## 2. CSS Text Cycling with JavaScript setInterval

### React Pattern

Text cycling in React uses `useState` for the current index and `useEffect` with `setInterval`. The critical requirement is cleanup in the effect return to prevent memory leaks after component unmount.

```tsx
const MESSAGES = [
  '🔍 경로를 탐색 중...',
  '🌿 분기점을 찾는 중...',
  '🔗 합류점을 연결하는 중...',
  '🌱 나무를 심는 중...',
] as const

function useCyclingMessage(): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return MESSAGES[index]
}
```

**Why `as const`**: Narrows the type to `readonly ['🔍 경로를 탐색 중...', ...]` which prevents accidental mutation and lets TypeScript infer element types precisely.

**Why `prev =>` functional update**: Using the functional form of `setIndex` avoids capturing a stale closure value of `index` in the interval callback. This is a React best practice for `setInterval` with state.

**Fade between messages (optional enhancement)**:
Add a CSS opacity transition triggered by a key change:

```tsx
<p
  key={index}
  className="animate-fade-in text-white"
>
  {MESSAGES[index]}
</p>
```

With Tailwind custom animation:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

Using `key={index}` causes React to remount the `<p>` element on each message change, triggering the CSS animation from scratch. Zero JavaScript animation library needed.

---

## 3. Tailwind Animation Utilities

### Built-in Tailwind Utilities

| Class | CSS | Use Case |
|-------|-----|----------|
| `animate-spin` | `animation: spin 1s linear infinite` | Spinner ring |
| `animate-pulse` | `animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite` | Pulsing glow |
| `animate-bounce` | `animation: bounce 1s infinite` | Bouncing indicator |
| `animate-ping` | `animation: ping 1s cubic-bezier(0,0,0.2,1) infinite` | Ripple effect |
| `transition-opacity` | `transition-property: opacity` | Fade transitions |
| `duration-500` | `transition-duration: 500ms` | 500ms transition |
| `ease-out` | `transition-timing-function: cubic-bezier(0,0,0.2,1)` | Ease out timing |

### Overlay Fade-Out Pattern

The overlay uses inline style for the dynamic opacity value (controlled by React state), combined with Tailwind's `transition-opacity` and `duration-500` for the animated CSS property:

```tsx
<div
  className="transition-opacity duration-500 ease-out"
  style={{ opacity: isVisible ? 1 : 0 }}
>
```

When `isVisible` flips to `false`, the browser interpolates `opacity` from `1` to `0` over 500ms. The element remains in the DOM during the transition (needed for the animation to be visible), then unmounts via `setTimeout`.

### Spinner Construction (Tailwind-only)

```tsx
<div className="
  w-12 h-12
  rounded-full
  border-4
  border-gray-700
  border-t-emerald-400
  animate-spin
" />
```

This produces a ring where the top segment is colored (`emerald-400`) and the rest is dark (`gray-700`), spinning indefinitely. Zero custom CSS required.

---

## 4. React Conditional Rendering for Overlay

### Pattern: Self-Managing Visibility Component

The `LoadingAnimation` component manages its own "should render" state internally, preventing leaking fade-out timing concerns into the parent.

```tsx
'use client'

export function LoadingAnimation() {
  const isLoading = useLifePathStore(s => s.isLoading)
  const [shouldRender, setShouldRender] = useState(isLoading)
  const [isVisible, setIsVisible] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
      setIsVisible(true)
    } else {
      setIsVisible(false)
      const id = setTimeout(() => setShouldRender(false), 500)
      return () => clearTimeout(id)
    }
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-gray-950/90 transition-opacity duration-500 ease-out"
      style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* content */}
    </div>
  )
}
```

**Why `pointerEvents: 'none'` during fade-out**: Prevents the fading-out overlay from blocking clicks on the map that is appearing beneath it. During the 500ms fade, the user could interact with the map.

**Why `useState(isLoading)` as initial value**: If the component mounts while `isLoading` is already `true` (which is the normal case — it is added to the page before the API call completes), the overlay starts visible. If it mounts while `isLoading` is `false`, it immediately renders `null`.

### Integration in `app/page.tsx`

```tsx
// app/page.tsx — simplified
export default function Home() {
  return (
    <main>
      <LoadingAnimation />   {/* always in DOM; self-manages visibility */}
      <GoalInput />          {/* shown when pathMap is null */}
      <PathMap />            {/* shown when pathMap is populated */}
    </main>
  )
}
```

Having `LoadingAnimation` always present in the component tree (rendering `null` when inactive) is simpler than conditionally mounting/unmounting it from the parent, because the fade-out requires the component to exist in the DOM for the CSS transition duration.

---

## 5. prefers-reduced-motion Handling

Users who have enabled the operating system "reduce motion" accessibility setting should not see animated transitions. CSS provides a media query for this:

```css
@media (prefers-reduced-motion: reduce) {
  .loading-overlay {
    transition-duration: 0ms !important;
  }
  .tree-grow-animation {
    animation: none !important;
  }
  .animate-spin {
    animation: none !important;
  }
}
```

Or via Tailwind's `motion-reduce:` variant:

```tsx
<div className="transition-opacity duration-500 motion-reduce:duration-0" />
```

For the hackathon scope, adding `motion-reduce:duration-0` to the overlay `transition` is sufficient.

---

## Summary: Recommended Implementation

| Decision | Choice | Reason |
|----------|--------|--------|
| Tree animation | Emoji `🌱` with `treePulse` keyframe | 5 lines CSS, instantly thematic, no HTML complexity |
| Spinner | Tailwind `animate-spin` border trick | Zero custom CSS, reliable, standard pattern |
| Message cycling | `setInterval` + `useState` + `useEffect` cleanup | Standard React pattern, no libraries |
| Fade-out | `opacity` CSS transition via `isVisible` state | CSS-only, no JavaScript animation frames |
| Unmount delay | `setTimeout(500)` matching transition duration | Prevents premature DOM removal |
| Overlay structure | Self-managing component (`shouldRender` internal state) | Encapsulated, no parent complexity |
