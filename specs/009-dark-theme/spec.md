# FE-02 Spec: 다크 테마 기본 + 트랙별 색상 체계

## Overview

| Field | Value |
|-------|-------|
| Feature ID | FE-02 |
| Feature Name | 다크 테마 기본 + 트랙별 색상 체계 |
| Phase | Phase 1 (기반 세팅) |
| Priority | P1 |
| Estimated Time | 15m |
| Difficulty | Low |
| Status | pending |
| Owner | frontend-dev |

## Dependencies

- **Upstream**: BE-01 (프로젝트 초기 세팅)
- **Downstream**: FE-01, FE-03, FE-06

---

## User Stories

### US-1 (P1): 다크 테마 기본 적용

**As a** LifePath 사용자,
**I want** 앱 전체에 일관된 다크 테마가 기본 적용되어 있기를,
**So that** 어두운 환경에서 눈의 피로 없이 경로 탐색에 집중할 수 있다.

**Acceptance Criteria:**
- `body` 배경색이 `#0a0a0f` (deep space black)으로 설정된다
- 기본 텍스트 색상이 `#f9fafb` (gray-50, near-white)로 설정된다
- shadcn/ui 컴포넌트들이 다크 테마와 일관성 있게 표시된다
- 라이트 모드 전환 없이 항상 다크 모드만 사용한다
- 1280px 이상 데스크탑 뷰포트에서 레이아웃이 올바르게 표시된다

---

### US-2 (P2): 트랙별 색상 체계 적용

**As a** LifePath 사용자,
**I want** 세 가지 경로(Fast Track, Deep Dive, Risk Path)가 각각 고유한 색상으로 구분되기를,
**So that** 맵을 한눈에 보고 어떤 경로가 어떤 성격인지 직관적으로 파악할 수 있다.

**Acceptance Criteria:**
- Fast Track(빠른 길)에 `#F59E0B` (amber/gold) 색상이 적용된다
- Deep Dive(깊은 길)에 `#3B82F6` (blue) 색상이 적용된다
- Risk Path(도전 길)에 `#8B5CF6` (purple) 색상이 적용된다
- `TRACK_COLORS` 상수가 `lib/constants.ts`에 정의된다
- Tailwind `tailwind.config.ts`의 `extend.colors`에 `track-fast`, `track-deep`, `track-risk`가 등록된다
- 모든 트랙 색상이 `#0a0a0f` 배경 위에서 WCAG AA 기준(최소 4.5:1 대비율)을 충족한다

---

### US-3 (P3): 노드 글로우 효과

**As a** LifePath 사용자,
**I want** 경로 맵의 노드들이 각 트랙 색상으로 은은하게 빛나는 글로우 효과를 가지기를,
**So that** 데모 시 시각적 임팩트가 높고 "우주에서 나의 길을 찾는" 세계관을 강화할 수 있다.

**Acceptance Criteria:**
- `GLOW_STYLES` 상수가 `lib/constants.ts`에 정의된다
- Fast Track 글로우: `box-shadow: 0 0 12px rgba(245, 158, 11, 0.5)`
- Deep Dive 글로우: `box-shadow: 0 0 12px rgba(59, 130, 246, 0.5)`
- Risk Path 글로우: `box-shadow: 0 0 12px rgba(139, 92, 246, 0.5)`
- 글로우가 노드 컴포넌트에서 인라인 스타일 또는 CSS 클래스로 적용 가능하다

---

## Functional Requirements

| ID | Requirement | Priority | User Story |
|----|-------------|----------|------------|
| FR-001 | `app/globals.css`에서 `body` 배경색을 `#0a0a0f`로 설정한다 | Must | US-1 |
| FR-002 | `app/globals.css`에서 기본 텍스트 색상을 `#f9fafb`로 설정한다 | Must | US-1 |
| FR-003 | `tailwind.config.ts`에 다크 모드를 `class` 전략으로 설정하고 `html` 태그에 `dark` 클래스를 적용한다 | Must | US-1 |
| FR-004 | `tailwind.config.ts`의 `extend.colors`에 세 트랙 색상을 `track-fast`, `track-deep`, `track-risk`로 등록한다 | Must | US-2 |
| FR-005 | `lib/constants.ts`에 `TRACK_COLORS` 타입과 상수를 정의한다 | Must | US-2 |
| FR-006 | `lib/constants.ts`에 `GLOW_STYLES` 타입과 상수를 정의한다 | Must | US-3 |

---

## Key Entities

### TrackType

```typescript
type TrackType = 'fast' | 'deep' | 'risk';
```

세 가지 경로 유형을 나타내는 유니온 타입. 앱 전반에서 타입 안전성을 보장하기 위해 string 대신 사용한다.

### TrackColors

```typescript
type TrackColors = Record<TrackType, string>;
```

각 트랙 유형에 대응하는 HEX 색상 문자열을 담는 타입.

### GlowStyles

```typescript
type GlowStyles = Record<TrackType, string>;
```

각 트랙 유형에 대응하는 CSS `box-shadow` 문자열을 담는 타입.

### TRACK_COLORS (constant)

```typescript
const TRACK_COLORS: TrackColors = {
  fast: '#F59E0B',
  deep: '#3B82F6',
  risk: '#8B5CF6',
};
```

### GLOW_STYLES (constant)

```typescript
const GLOW_STYLES: GlowStyles = {
  fast: '0 0 12px rgba(245, 158, 11, 0.5)',
  deep: '0 0 12px rgba(59, 130, 246, 0.5)',
  risk: '0 0 12px rgba(139, 92, 246, 0.5)',
};
```

---

## Edge Cases

### 색상 대비 및 접근성

| Scenario | Concern | Mitigation |
|----------|---------|------------|
| `#F59E0B` on `#0a0a0f` | 대비율 충분 여부 | 대비율 ~8.3:1 → WCAG AA 통과 |
| `#3B82F6` on `#0a0a0f` | 파란색 가독성 | 대비율 ~4.7:1 → WCAG AA 통과 |
| `#8B5CF6` on `#0a0a0f` | 보라색 가독성 | 대비율 ~4.9:1 → WCAG AA 통과 |
| 작은 텍스트 (12px 미만) | WCAG AAA 기준 7:1 필요 | 본 스펙 범위 외, 노드 레이블에서 별도 확인 필요 |
| 글로우 효과 + 낮은 opacity | 글로우가 너무 약하거나 강할 때 | opacity 0.5로 고정, 필요 시 조정 |

### 다크 모드 전용 전략

shadcn/ui는 기본적으로 CSS 변수 기반 테마를 사용한다. `class` 전략으로 `dark` 클래스를 `html` 요소에 강제 적용하면 라이트 모드 토글 없이 항상 다크 모드가 유지된다. `prefers-color-scheme` 미디어 쿼리와 충돌하지 않도록 `class` 전략을 우선시한다.

### CSS 변수 스코프 충돌

`globals.css`에서 정의한 CSS 변수가 shadcn/ui의 `@layer base` 변수와 충돌할 수 있다. shadcn/ui의 `:root.dark` 블록을 덮어쓰지 않도록 변수 이름을 `--track-*` 네임스페이스로 분리한다.

---

## Success Criteria

- [ ] `app/globals.css`가 `#0a0a0f` 배경과 `#f9fafb` 텍스트를 적용한다
- [ ] `tailwind.config.ts`에 `track-fast`, `track-deep`, `track-risk` 색상이 등록된다
- [ ] `lib/constants.ts`에 `TRACK_COLORS`와 `GLOW_STYLES`가 타입 안전하게 정의된다
- [ ] TypeScript strict 모드에서 컴파일 오류가 없다
- [ ] 1280px 데스크탑 뷰포트에서 다크 배경이 정상 표시된다
- [ ] 세 트랙 색상 모두 WCAG AA 대비율(4.5:1)을 충족한다
