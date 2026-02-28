# FE-01: 목표 입력 화면 UI — Data Models

---

## 1. LifePathStore Interface

The Zustand store for the LifePath application. This is the single source of truth for client-side state in Phase 1.

**File**: `store/useLifePathStore.ts`

```typescript
import { PathMap } from '@/types/path';

// --- State ---

interface LifePathState {
  /** Current goal text entered by the user */
  goal: string;

  /** True while POST /api/paths/simulate is in flight */
  isLoading: boolean;

  /**
   * The full path map returned by the simulate API.
   * null = no path generated yet (shows GoalInput screen).
   * non-null = path generated (shows PathMap screen).
   */
  pathMap: PathMap | null;

  /**
   * User-facing error message from the last failed generatePath() call.
   * null = no error.
   */
  error: string | null;
}

// --- Actions ---

interface LifePathActions {
  /**
   * Update the goal text field.
   * Called on every keystroke in the Input component.
   */
  setGoal: (goal: string) => void;

  /**
   * Async action: POST /api/paths/simulate with current goal.
   * Sets isLoading=true before request, false after.
   * On success: populates pathMap.
   * On failure: populates error with user-friendly message.
   * Guard: does nothing if goal.trim() === ''.
   */
  generatePath: () => Promise<void>;

  /**
   * Dismisses the current error message (sets error to null).
   * Called when user clicks the dismiss button on the error display.
   */
  clearError: () => void;

  /**
   * Resets all state to initial values.
   * Used when navigating back to the goal input screen from the PathMap.
   */
  reset: () => void;
}

// --- Combined Store Type (export this) ---

export type LifePathStore = LifePathState & LifePathActions;
```

### Initial State Values

```typescript
const initialState: LifePathState = {
  goal: '',
  isLoading: false,
  pathMap: null,
  error: null,
};
```

### State Transition Diagram

```
Initial State
  goal: ''
  isLoading: false
  pathMap: null
  error: null
        |
        | setGoal(text)
        v
Typing State
  goal: 'text...'
  isLoading: false
  pathMap: null
  error: null
        |
        | generatePath()
        v
Loading State
  goal: 'text...'
  isLoading: true     ← UI disables all interactive elements
  pathMap: null
  error: null
        |
        |-------------- API fails
        |                    |
        | API succeeds        v
        v               Error State
Success State             goal: 'text...'
  goal: 'text...'         isLoading: false
  isLoading: false        pathMap: null
  pathMap: PathMap        error: 'message'
  error: null                  |
        |                      | clearError()
        | (PathMap shown)       v
        |               Back to Typing State
        | reset()
        v
Initial State
```

---

## 2. PathMap Type (from `types/path.ts`, defined in BE-02)

`GoalInput` does not directly consume `PathMap`, but the Zustand store holds it as the post-generation state. Included here for completeness.

```typescript
// types/path.ts (implemented by BE-02)

export interface StartGoalNode {
  id: string;
  title: string;
  description: string;
}

export interface PathNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'low' | 'medium' | 'high';
  isMergePoint: boolean;
  tips: string[];
  monthsFromNow: number;
}

export interface Path {
  id: string;          // e.g., "fast", "deep", "risk" — or dynamic string for branches
  name: string;
  color: string;       // hex color from track color system
  nodes: PathNode[];
}

export interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];   // Path IDs that converge here
  message: string;            // Inspirational message at merge point
}

export interface PathMap {
  startNode: StartGoalNode;
  goalNode: StartGoalNode;
  paths: Path[];
  mergePoints: MergePoint[];
}
```

---

## 3. GoalInput Component Props

The `GoalInput` component is self-contained and takes no props. All state is derived from `useLifePathStore`.

```typescript
// components/GoalInput.tsx

// No props interface needed — component reads from Zustand store directly
export function GoalInput(): JSX.Element
```

If in the future GoalInput needs to be tested in isolation (outside Zustand context), an optional props override pattern can be introduced:

```typescript
// Future-compatible interface (not required for Phase 1)
interface GoalInputProps {
  /** Override for Storybook/testing only */
  defaultGoal?: string;
}
```

**For Phase 1 (YAGNI)**: No props. Pure Zustand store consumer.

---

## 4. PresetGoal Type (from `data/presets.ts`, defined in BE-03)

Used by the 🎲 random button in `GoalInput`.

```typescript
// data/presets.ts (implemented by BE-03)

export interface PresetGoal {
  id: string;           // e.g., "career-001"
  category: string;     // e.g., "커리어", "건강", "재무"
  title: string;        // e.g., "풀스택 개발자 되기" — this is set as goal
  description: string;  // longer description (not used in GoalInput directly)
}

// Utility used in GoalInput
export function getRandomGoal(): PresetGoal;
```

**GoalInput usage**: Only `title` from `PresetGoal` is used — `setGoal(getRandomGoal().title)`.

---

## 5. API Request/Response Types (from `types/path.ts`, defined in BE-02)

```typescript
// Used internally by generatePath() in the Zustand store

export interface SimulateRequest {
  goal: string;
  timeframe?: '1y' | '3y' | '5y';  // optional; defaults to '3y' on backend
}

export type SimulateResponse = PathMap;
```

**generatePath() fetch call**:

```typescript
const response = await fetch('/api/paths/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ goal } satisfies SimulateRequest),
});

if (!response.ok) {
  throw new Error('경로 생성에 실패했습니다. 다시 시도해주세요.');
}

const data: SimulateResponse = await response.json();
```
