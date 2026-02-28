# Data Model: 001-preset-goal-data

**Date**: 2026-02-27
**Branch**: `001-preset-goal-data`

## Core Types

### PresetCategory (Literal Union)

```typescript
/**
 * 프리셋 목표 카테고리 타입.
 * YAGNI: enum 대신 literal union 사용.
 */
export type PresetCategory =
  | '커리어'
  | '건강'
  | '재무'
  | '창업'
  | '교육'
  | '여행';
```

### PresetGoal (Interface)

```typescript
/**
 * 프리셋 목표 데이터 단위.
 * 불변 상수로만 사용 (런타임 생성 불가).
 */
export interface PresetGoal {
  /** 고유 식별자 (예: 'career-001') */
  readonly id: string;
  /** 카테고리 분류 */
  readonly category: PresetCategory;
  /** 목표 제목 (사용자에게 표시) */
  readonly title: string;
  /** 목표 설명 (프롬프트 및 UI에 활용) */
  readonly description: string;
}
```

## Constants

### ALL_PRESET_GOALS

```typescript
/**
 * 전체 프리셋 목표 목록. Single source of truth.
 * 36개 (6카테고리 × 6개).
 */
export const ALL_PRESET_GOALS: readonly PresetGoal[] = [
  // 커리어 (6개)
  { id: 'career-001', category: '커리어', title: '풀스택 개발자 되기', description: '프론트엔드와 백엔드를 모두 다루는 풀스택 개발자로 성장한다' },
  { id: 'career-002', category: '커리어', title: 'IT 기업 취업하기', description: '원하는 IT 기업에 개발자로 취업해 커리어를 시작한다' },
  { id: 'career-003', category: '커리어', title: '개발자 이직 성공하기', description: '현 직장에서 더 좋은 조건의 회사로 이직에 성공한다' },
  { id: 'career-004', category: '커리어', title: '프리랜서 개발자 되기', description: '고정 직장을 벗어나 자유롭게 일하는 프리랜서로 독립한다' },
  { id: 'career-005', category: '커리어', title: 'PM/기획자 되기', description: '기술 이해를 바탕으로 프로덕트 매니저나 기획자로 전환한다' },
  { id: 'career-006', category: '커리어', title: '개발팀 리드 되기', description: '팀을 이끄는 테크 리드 또는 엔지니어링 매니저로 성장한다' },

  // 건강 (6개)
  { id: 'health-001', category: '건강', title: '마라톤 완주하기', description: '42.195km 풀마라톤을 완주해 체력과 끈기를 증명한다' },
  { id: 'health-002', category: '건강', title: '체중 10kg 감량하기', description: '건강한 식단과 꾸준한 운동으로 10kg 감량을 달성한다' },
  { id: 'health-003', category: '건강', title: '헬스 루틴 만들기', description: '1년 이상 지속 가능한 규칙적인 헬스 운동 습관을 만든다' },
  { id: 'health-004', category: '건강', title: '금연 성공하기', description: '흡연을 완전히 끊고 건강한 삶을 시작한다' },
  { id: 'health-005', category: '건강', title: '채식 생활 시작하기', description: '환경과 건강을 위해 채식 또는 비건 라이프스타일로 전환한다' },
  { id: 'health-006', category: '건강', title: '수영 완벽하게 배우기', description: '자유형, 배영, 평영을 자유롭게 구사하는 수준으로 수영을 익힌다' },

  // 재무 (6개)
  { id: 'finance-001', category: '재무', title: '1억 모으기', description: '저축과 투자로 첫 번째 1억 원 자산을 만든다' },
  { id: 'finance-002', category: '재무', title: '부동산 투자 시작하기', description: '첫 투자용 부동산을 구입해 자산 포트폴리오를 다각화한다' },
  { id: 'finance-003', category: '재무', title: '투자 포트폴리오 만들기', description: '주식, ETF, 채권을 조합한 균형 잡힌 투자 포트폴리오를 구성한다' },
  { id: 'finance-004', category: '재무', title: '부업으로 월 100만원 벌기', description: '본업 외 부업으로 안정적인 월 100만원 추가 수입을 만든다' },
  { id: 'finance-005', category: '재무', title: '재무 독립 달성하기', description: '투자 수익만으로 생활비를 충당할 수 있는 재무 독립을 이룬다' },
  { id: 'finance-006', category: '재무', title: '내 집 마련하기', description: '자가 주택을 구매해 주거 안정성과 자산을 동시에 확보한다' },

  // 창업 (6개)
  { id: 'startup-001', category: '창업', title: '스타트업 창업하기', description: '아이디어를 실현해 팀을 꾸리고 스타트업을 설립한다' },
  { id: 'startup-002', category: '창업', title: '사이드 프로젝트로 첫 매출 달성하기', description: '개인 사이드 프로젝트로 첫 번째 유료 고객을 확보한다' },
  { id: 'startup-003', category: '창업', title: '앱 출시하기', description: '아이디어를 구현한 모바일 또는 웹 앱을 정식 출시한다' },
  { id: 'startup-004', category: '창업', title: '카페 창업하기', description: '나만의 카페를 열어 요식업 창업에 도전한다' },
  { id: 'startup-005', category: '창업', title: '온라인 쇼핑몰 창업하기', description: '온라인 커머스 플랫폼에서 상품을 판매하는 쇼핑몰을 운영한다' },
  { id: 'startup-006', category: '창업', title: '1인 기업 만들기', description: '혼자서 지속 가능한 비즈니스 모델을 구축해 1인 기업을 운영한다' },

  // 교육 (6개)
  { id: 'edu-001', category: '교육', title: '영어 원어민 수준 달성하기', description: '영어로 자유롭게 소통하고 비즈니스 협상도 가능한 수준에 도달한다' },
  { id: 'edu-002', category: '교육', title: '박사 학위 취득하기', description: '연구를 통해 특정 분야의 최고 전문가 자격인 박사 학위를 취득한다' },
  { id: 'edu-003', category: '교육', title: '코딩 부트캠프 수료하기', description: '집중적인 코딩 교육 과정을 완주하고 개발 기초를 탄탄히 다진다' },
  { id: 'edu-004', category: '교육', title: '자격증 취득하기', description: '목표 분야의 공인 자격증(정보처리기사, AWS 등)을 취득한다' },
  { id: 'edu-005', category: '교육', title: '온라인 강의 만들기', description: '전문 지식을 담은 온라인 강의를 제작하고 플랫폼에 출시한다' },
  { id: 'edu-006', category: '교육', title: '독서 100권 달성하기', description: '1년 안에 다양한 분야의 책 100권을 완독해 지식의 폭을 넓힌다' },

  // 여행 (6개)
  { id: 'travel-001', category: '여행', title: '세계 일주하기', description: '여러 대륙을 탐험하며 다양한 문화와 사람들을 만나는 세계 일주를 완성한다' },
  { id: 'travel-002', category: '여행', title: '배낭여행 1개월 하기', description: '최소한의 짐으로 자유롭게 1개월간 배낭여행을 떠난다' },
  { id: 'travel-003', category: '여행', title: '워킹홀리데이 가기', description: '원하는 나라에서 일하며 여행하는 워킹홀리데이를 경험한다' },
  { id: 'travel-004', category: '여행', title: '제주 한 달 살기', description: '제주도에서 한 달간 현지인처럼 생활하며 여유로운 삶을 경험한다' },
  { id: 'travel-005', category: '여행', title: '유럽 여행 완주하기', description: '유럽의 주요 국가들을 여행하며 역사와 문화를 체험한다' },
  { id: 'travel-006', category: '여행', title: '해외 이민하기', description: '새로운 나라에서 삶을 시작하는 해외 이민을 실현한다' },
] as const;
```

### DEMO_PRESETS

```typescript
/**
 * 데모 시나리오 최적화 프리셋 ID 목록.
 * 05-demo-strategy.md ACT 1 참조.
 */
const DEMO_PRESET_IDS = ['career-001', 'startup-001', 'finance-001', 'health-001', 'travel-001'] as const;
```

## Utility Functions

### getRandomGoal
```typescript
/**
 * 전체 프리셋에서 무작위로 1개를 반환한다.
 * Constitution III: 20줄 이하.
 */
export function getRandomGoal(): PresetGoal {
  const idx = Math.floor(Math.random() * ALL_PRESET_GOALS.length);
  return ALL_PRESET_GOALS[idx];
}
```

### getGoalsByCategory
```typescript
/**
 * 특정 카테고리의 프리셋 목록을 반환한다.
 * 존재하지 않는 카테고리는 빈 배열 반환 (에러 없음).
 */
export function getGoalsByCategory(category: PresetCategory): readonly PresetGoal[] {
  return ALL_PRESET_GOALS.filter((goal) => goal.category === category);
}
```

### getDemoGoals
```typescript
/**
 * 데모 시나리오에 최적화된 프리셋 부분집합을 반환한다.
 * "풀스택 개발자 되기" (career-001) 포함 필수.
 */
export function getDemoGoals(): readonly PresetGoal[] {
  return ALL_PRESET_GOALS.filter((goal) => DEMO_PRESET_IDS.includes(goal.id as typeof DEMO_PRESET_IDS[number]));
}
```

## File Structure

```
data/
└── presets.ts   # 단일 파일, 모든 타입/상수/함수 포함
```

## Entity Relationships

```
PresetCategory (literal union)
        │
        │ category field
        ▼
PresetGoal (interface)
        │
        │ contained in
        ▼
ALL_PRESET_GOALS (readonly array, 36개)
        │
    ┌───┴───┐
    ▼       ▼
getRandomGoal()  getGoalsByCategory()  getDemoGoals()
```
