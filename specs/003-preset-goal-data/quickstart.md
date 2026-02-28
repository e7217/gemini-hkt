# Quickstart: 001-preset-goal-data

**Feature**: BE-03 프리셋 목표 데이터
**Date**: 2026-02-27

## 전제 조건

- BE-01 (프로젝트 초기 세팅) 완료
- TypeScript strict 모드 활성화 (`"strict": true` in tsconfig.json)
- Next.js 14+ 프로젝트 구조 준비됨

## 구현 단계 (예상 15분)

### Step 1: 파일 생성

```bash
# 프로젝트 루트에서
mkdir -p data
touch data/presets.ts
```

### Step 2: 타입 및 상수 구현

`data/presets.ts`에 다음 순서로 작성:

1. `PresetCategory` 타입 (literal union)
2. `PresetGoal` 인터페이스
3. `ALL_PRESET_GOALS` 상수 배열 (36개)
4. `DEMO_PRESET_IDS` 내부 상수
5. 유틸 함수 3개

`data-model.md`의 코드를 참고하여 구현.

### Step 3: TypeScript 검증

```bash
npx tsc --noEmit
```

에러 없이 통과해야 함.

### Step 4: 동작 확인 (간단 테스트)

```typescript
// scripts/test-presets.ts (임시 테스트)
import { getRandomGoal, getGoalsByCategory, getDemoGoals, ALL_PRESET_GOALS } from '../data/presets';

console.log('Total presets:', ALL_PRESET_GOALS.length); // >= 30
console.log('Random goal:', getRandomGoal().title);
console.log('Career goals:', getGoalsByCategory('커리어').length); // >= 5
console.log('Demo goals include fullstack:', getDemoGoals().some(g => g.title === '풀스택 개발자 되기')); // true
```

```bash
npx ts-node scripts/test-presets.ts
```

### Step 5: FE-01 연동 확인

`FE-01` 구현 시 다음과 같이 import:

```typescript
import { getRandomGoal } from '@/data/presets';

// 🎲 버튼 핸들러
const handleRandomGoal = () => {
  const goal = getRandomGoal();
  setGoalInput(goal.title);
};
```

## 검증 체크리스트

```
[ ] data/presets.ts 파일 존재
[ ] ALL_PRESET_GOALS.length >= 30
[ ] 6개 카테고리 각각 5개 이상
[ ] getRandomGoal() 반환값이 PresetGoal 타입
[ ] getDemoGoals()에 '풀스택 개발자 되기' 포함
[ ] tsc --noEmit 에러 없음
[ ] any 타입 사용 없음
```

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| `tsc` 에러: Type 'string' is not assignable to 'PresetCategory' | category 값 오타 | PresetCategory 유니온의 정확한 한국어 값 확인 |
| `getGoalsByCategory` 빈 배열 반환 | 존재하지 않는 카테고리 | 허용된 6개 카테고리 값 사용 |
| `getDemoGoals` 빈 배열 반환 | DEMO_PRESET_IDS에 없는 ID | career-001이 ALL_PRESET_GOALS에 포함되어 있는지 확인 |
