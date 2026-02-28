# Contract: Preset Goals Public API

**Module**: `data/presets.ts`
**Type**: TypeScript Module Export Contract
**Date**: 2026-02-27

## Exported Types

### PresetCategory

```typescript
export type PresetCategory =
  | '커리어'
  | '건강'
  | '재무'
  | '창업'
  | '교육'
  | '여행';
```

**Contract**:
- Exactly 6 literal values
- All Korean strings
- Exhaustive — no additional categories without spec update

### PresetGoal

```typescript
export interface PresetGoal {
  readonly id: string;
  readonly category: PresetCategory;
  readonly title: string;
  readonly description: string;
}
```

**Contract**:
- All fields required, no optional fields (YAGNI)
- All fields readonly (immutable data)
- `id` format: `{category_abbr}-{number}` (e.g., `career-001`)
- `title` and `description` in Korean

## Exported Constants

### ALL_PRESET_GOALS

```typescript
export const ALL_PRESET_GOALS: readonly PresetGoal[]
```

**Contract**:
- `length >= 30 && length <= 50` (spec requirement)
- Each `PresetCategory` value represented by `>= 5` entries
- Contains entry with `id === 'career-001'` and `title === '풀스택 개발자 되기'`
- Immutable at runtime (`readonly`)
- No duplicate `id` values

## Exported Functions

### getRandomGoal()

```typescript
export function getRandomGoal(): PresetGoal
```

**Preconditions**: `ALL_PRESET_GOALS.length > 0` (guaranteed by constant file)

**Postconditions**:
- Returns a valid `PresetGoal` object from `ALL_PRESET_GOALS`
- Result is one of the items in `ALL_PRESET_GOALS`
- No side effects

**Error behavior**: No throws (precondition always satisfied for constant file)

---

### getGoalsByCategory()

```typescript
export function getGoalsByCategory(category: PresetCategory): readonly PresetGoal[]
```

**Preconditions**: `category` is a valid `PresetCategory` value

**Postconditions**:
- Returns array of `PresetGoal` where every item has `goal.category === category`
- Returns empty array if no goals match (no throws)
- Result is a subset of `ALL_PRESET_GOALS`

**Error behavior**: No throws

---

### getDemoGoals()

```typescript
export function getDemoGoals(): readonly PresetGoal[]
```

**Preconditions**: None

**Postconditions**:
- Returns `length >= 1`
- Result contains entry with `title === '풀스택 개발자 되기'`
- Result is a subset of `ALL_PRESET_GOALS`

**Error behavior**: No throws

## Usage Example

```typescript
import {
  PresetGoal,
  PresetCategory,
  ALL_PRESET_GOALS,
  getRandomGoal,
  getGoalsByCategory,
  getDemoGoals,
} from '@/data/presets';

// 랜덤 목표 선택 (🎲 버튼)
const randomGoal: PresetGoal = getRandomGoal();
console.log(randomGoal.title); // e.g., "풀스택 개발자 되기"

// 카테고리별 필터링
const careerGoals = getGoalsByCategory('커리어');
console.log(careerGoals.length); // >= 5

// 데모 모드
const demoGoals = getDemoGoals();
const hasDemoPreset = demoGoals.some((g) => g.title === '풀스택 개발자 되기'); // true
```

## Breaking Change Policy

Any of the following changes are **breaking**:
1. Removing a field from `PresetGoal`
2. Changing `id` format
3. Removing a `PresetCategory` value
4. Changing function signatures
5. Making `getRandomGoal()` potentially return `undefined`

The following are **non-breaking**:
1. Adding new preset goals
2. Adding a new `PresetCategory` value (requires spec update)
3. Updating `title` or `description` text
