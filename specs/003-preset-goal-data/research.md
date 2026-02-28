# Research: 001-preset-goal-data

**Date**: 2026-02-27
**Branch**: `001-preset-goal-data`
**Feature**: BE-03 프리셋 목표 데이터

## 1. 기술 컨텍스트 확인

### 프로젝트 기술 스택 (docs/04-backend-spec.md 참조)
- **언어**: TypeScript (strict mode)
- **프레임워크**: Next.js 14+ (App Router)
- **파일 위치**: `data/presets.ts` (BE-03 명세 명시)
- **빌드 환경**: Vercel
- **테스트**: Jest / Vitest (B51, 옵션)

### 의존성 분석
- **선행 작업**: BE-01 (프로젝트 초기 세팅) — TypeScript 설정 완료 필요
- **후행 작업**: FE-01 (목표 입력 화면 UI) — 랜덤 버튼 구현 시 `getRandomGoal()` import
- **관련 파일**: BE-02의 `PathNode`, `PathMap` 등 공유 타입과 독립적 (프리셋은 별도 도메인)

## 2. 유사 패턴 분석

### TypeScript 상수 파일 패턴 (best practice)
```typescript
// 패턴 1: as const assertion으로 타입 안전성 확보
export const ALL_PRESET_GOALS = [...] as const;

// 패턴 2: 명시적 타입 정의 후 배열 선언
export interface PresetGoal {
  id: string;
  category: PresetCategory;
  title: string;
  description: string;
}
export const ALL_PRESET_GOALS: readonly PresetGoal[] = [...];
```

### 랜덤 선택 유틸 패턴
```typescript
// 표준 Fisher-Yates 기반 단일 랜덤 선택
export function getRandomGoal(): PresetGoal {
  const idx = Math.floor(Math.random() * ALL_PRESET_GOALS.length);
  return ALL_PRESET_GOALS[idx];
}
```

## 3. 카테고리별 목표 조사

### 커리어 (Career) 카테고리 목표 예시
문서(BE-03)에서 명시된 예시:
- "풀스택 개발자 되기" (데모 필수)
- "스타트업 창업하기" (창업 카테고리와 중복 주의 → 커리어로 분류)

추가 보편적 목표 (공감도 높음):
- "IT 기업 취업하기", "개발자 이직 성공하기", "프리랜서 개발자 되기", "PM/기획자 되기"

### 건강 (Health) 카테고리 목표 예시
문서 명시: "마라톤 완주하기", "체중 10kg 감량"
추가: "1년 안에 헬스 루틴 만들기", "금연 성공하기", "채식 생활 시작하기"

### 재무 (Finance) 카테고리 목표 예시
문서 명시: "1억 모으기", "부동산 투자 시작하기"
추가: "투자 포트폴리오 만들기", "부업으로 월 100만원 벌기", "재무 독립 달성하기"

### 창업 (Startup) 카테고리 목표 예시
- "사이드 프로젝트로 첫 매출 달성하기", "앱 출시하기", "카페 창업하기"
- "1인 기업 만들기", "온라인 쇼핑몰 창업하기"

### 교육 (Education) 카테고리 목표 예시
- "영어 원어민 수준 달성하기", "박사 학위 취득하기", "온라인 강의 완주하기"
- "자격증 취득하기 (정보처리기사, TOEIC 900점 등)", "코딩 부트캠프 수료하기"

### 여행 (Travel) 카테고리 목표 예시
- "세계 일주하기", "배낭여행 1개월 하기", "워킹홀리데이 가기"
- "제주 한 달 살기", "유럽 여행 완주하기", "해외 이민하기"

## 4. 데이터 설계 결정

### ID 전략
- 패턴: `{category_abbr}-{number}` (예: `career-001`, `health-001`)
- 3자리 패딩으로 정렬 가능성 유지

### 카테고리 타입
- TypeScript literal union 사용 (enum 대신 YAGNI 원칙)
- `type PresetCategory = '커리어' | '건강' | '재무' | '창업' | '교육' | '여행'`

### 배열 불변성
- `readonly PresetGoal[]` 또는 `as const` assertion 사용
- 런타임 수정 방지

## 5. Constitution 준수 확인

| 원칙 | 상태 | 비고 |
|------|------|------|
| YAGNI | ✅ | 필요한 3개 함수만 정의, 미래 대비 추상화 없음 |
| SRP | ✅ | 각 함수가 단일 책임 |
| Concise Code | ✅ | 모든 함수 10줄 이하 예상 |
| Nesting Depth | ✅ | 중첩 없음 (배열 인덱스 접근) |
| TypeScript Strict | ✅ | any 없음, 명시적 타입 |
| Fail-Safe | ✅ | 이 파일 자체가 API 장애 폴백 |

## 6. 결론

- 구현 파일: `data/presets.ts` (단일 파일)
- 목표 수: 36개 (6카테고리 × 6개, 요구사항 30-50개 범위)
- 공개 API: `PresetGoal` 인터페이스, `PresetCategory` 타입, `ALL_PRESET_GOALS` 상수, `getRandomGoal()`, `getGoalsByCategory()`, `getDemoGoals()`
- 복잡도: 낮음 (데이터 파일 + 3개 유틸 함수)
- 예상 구현 시간: 15분 (BE-03 명세와 일치)
