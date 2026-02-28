# FE-01: 목표 입력 화면 UI — Developer Quickstart

This guide helps you quickly verify the GoalInput component and the Zustand store integration are working correctly.

---

## Prerequisites

Before testing FE-01, confirm the following are in place:

- [ ] `npm install` completed (BE-01 project setup)
- [ ] `data/presets.ts` exists with `getRandomGoal()` export (BE-03)
- [ ] `types/path.ts` exists with `PathMap` export (BE-02)
- [ ] shadcn/ui `Input` and `Button` components installed: `components/ui/input.tsx`, `components/ui/button.tsx`
- [ ] Zustand installed: `npm list zustand` shows v5+
- [ ] Dev server running: `npm run dev` → `http://localhost:3000`

---

## Step 1: Verify the GoalInput Renders

1. Open `http://localhost:3000`
2. You should see:
   - A centered input field with placeholder "이루고 싶은 목표를 입력하세요"
   - A 🎲 button (left of or below the input)
   - A "경로 생성하기" button (primary, disabled by default when input is empty)
3. The background should be dark (FE-02 dark theme)

**If nothing renders**: Check `app/page.tsx` imports `GoalInput` (or `LifePathView`) and that `'use client'` is present in the component file.

---

## Step 2: Test the Controlled Input

1. Click the input field and type "테스트 목표"
2. The "경로 생성하기" button should become enabled (no longer grayed out)
3. Clear the input — the button should be disabled again

**What to verify**:
- Input value updates on every keystroke
- Button disabled state tracks `goal.trim() === ''`

---

## Step 3: Test the 🎲 Random Button

1. Ensure the input is empty
2. Click the 🎲 button
3. The input should auto-fill with a Korean goal string (e.g., "풀스택 개발자 되기")
4. Click 🎲 multiple times — you should see different goals appear

**What to verify**:
- `getRandomGoal()` from `data/presets.ts` is being called
- The returned `title` field is set in the input
- Clicking 🎲 does not trigger API submission

**If the same goal always appears**: Check if `getRandomGoal()` is using `Math.random()` properly. A stub returning a fixed value would cause this.

---

## Step 4: Test the Loading State

1. Type any goal (e.g., "풀스택 개발자 되기")
2. Click "경로 생성하기"
3. While the API is in flight, verify:
   - "경로 생성하기" button shows a spinner or "생성 중..." text
   - "경로 생성하기" button is disabled
   - 🎲 button is disabled
   - Input field is disabled

**Extending the loading window for testing**: Temporarily add a `await new Promise(r => setTimeout(r, 3000))` before the fetch in `generatePath()` to hold loading state for 3 seconds.

**After testing**: Remove the delay.

---

## Step 5: Test the Error State

**Method A — Network disconnected**:
1. Open browser DevTools → Network tab → Set throttling to "Offline"
2. Type a goal and click "경로 생성하기"
3. After a moment, an error message should appear below the input
4. Error text should be user-friendly Korean (not a stack trace)
5. A dismiss button (×) should clear the error

**Method B — Mock error in store** (no network change needed):
Temporarily modify `generatePath()` in the store:
```typescript
// Temporary test code — remove after testing
generatePath: async () => {
  set({ isLoading: true, error: null });
  await new Promise(r => setTimeout(r, 1000));
  set({ error: '네트워크 오류가 발생했습니다. 연결을 확인해주세요.', isLoading: false });
},
```

Verify:
- Error message appears
- Input and buttons are re-enabled after error
- Clicking × (clearError) removes the message

---

## Step 6: Test Successful API Call

1. Ensure the dev server is running and the API route `POST /api/paths/simulate` is implemented (BE-06)
2. Type "풀스택 개발자 되기" (or use 🎲 to fill it)
3. Click "경로 생성하기"
4. After loading completes successfully:
   - The `GoalInput` component should no longer be visible
   - The `PathMap` component should render (or a placeholder if FE-03 is not yet implemented)

**If PathMap is not yet implemented**: Add a temporary placeholder in `app/page.tsx`:
```tsx
{pathMap ? (
  <pre className="text-xs text-white">{JSON.stringify(pathMap, null, 2)}</pre>
) : (
  <GoalInput />
)}
```
This lets you verify `pathMap` is populated correctly even before FE-03 is done.

---

## Step 7: Verify Zustand Store in Browser DevTools

Install the Zustand DevTools browser extension, or log store state:

```typescript
// Temporary debug — add to GoalInput.tsx
const state = useLifePathStore.getState();
console.log('Store state:', state);
```

Or use React DevTools → Components tab → find `useLifePathStore` context.

**Expected state after typing "풀스택 개발자 되기"**:
```json
{
  "goal": "풀스택 개발자 되기",
  "isLoading": false,
  "pathMap": null,
  "error": null
}
```

---

## Common Issues

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| "useLifePathStore is not a function" | Missing `'use client'` in GoalInput | Add `'use client'` as first line |
| Input doesn't update | `onChange` not wired to `setGoal` | Check `onChange={(e) => setGoal(e.target.value)}` |
| Button never enables | `goal.trim()` always empty | Verify controlled input is actually updating store |
| 🎲 does nothing | `data/presets.ts` not yet created | Use stub or check BE-03 status |
| Loading never ends | `generatePath()` not calling `set({isLoading: false})` in catch | Ensure finally block or both try/catch branches reset loading |
| Error shows raw HTTP message | Error not localized | Check error message mapping in `generatePath()` |
| PathMap never renders | `pathMap` not set on success | Check `set({ pathMap: data })` inside success branch |

---

## File Checklist

After implementation, these files should exist:

```
store/
  useLifePathStore.ts        ← Zustand store

components/
  GoalInput.tsx              ← Main UI component

app/
  page.tsx                   ← Conditionally renders GoalInput or PathMap
```
