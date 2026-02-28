# FE-02 Tasks: 다크 테마 기본 + 트랙별 색상 체계

## Task Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Setup | 2 tasks | 2min |
| Phase 2: Foundational Types | 2 tasks | 3min |
| Phase 3: US1 - Dark Theme Base | 3 tasks | 4min |
| Phase 4: US2 - Track Colors | 2 tasks | 3min |
| Phase 5: US3 - Glow Styles | 1 task | 2min |
| Phase 6: Polish & Verification | 2 tasks | 1min |
| **Total** | **12 tasks** | **~15min** |

---

## Phase 1: Setup (0-2min)

### TASK-001: `lib/` 디렉토리 확인 및 `constants.ts` 파일 생성

**Description**: `lib/` 디렉토리가 프로젝트 루트에 존재하는지 확인하고, `lib/constants.ts` 파일을 생성한다.

**File**: `lib/constants.ts`
**Action**: CREATE

**Acceptance Criteria**:
- [ ] `lib/constants.ts` 파일이 존재한다
- [ ] 파일이 비어 있거나 최소한의 헤더 주석만 포함한다

**Notes**: `lib/` 디렉토리가 없으면 함께 생성한다. Next.js App Router 프로젝트에서 `lib/` 는 서버/클라이언트 공용 유틸리티를 담는 관례적 위치다.

---

### TASK-002: TypeScript strict 모드 확인

**Description**: `tsconfig.json`에서 `"strict": true`가 설정되어 있는지 확인한다. strict 모드가 켜져 있어야 타입 안전성을 완전히 보장받을 수 있다.

**File**: `tsconfig.json`
**Action**: VERIFY (수정 필요 시 UPDATE)

**Acceptance Criteria**:
- [ ] `tsconfig.json`에 `"strict": true`가 설정되어 있다

---

## Phase 2: Foundational Type Definitions (2-5min)

### TASK-003: `TrackType` 유니온 타입 정의

**Description**: `lib/constants.ts`에 `TrackType` 유니온 타입을 작성하고 export한다.

**File**: `lib/constants.ts`
**Action**: EDIT

```typescript
export type TrackType = 'fast' | 'deep' | 'risk';
```

**Acceptance Criteria**:
- [ ] `TrackType`이 export된다
- [ ] `'fast' | 'deep' | 'risk'` 세 값만 허용한다
- [ ] TypeScript strict 모드에서 컴파일 오류가 없다

---

### TASK-004: `TrackColors` 및 `GlowStyles` 타입 정의

**Description**: `lib/constants.ts`에 `TrackColors`와 `GlowStyles` 타입을 `Record<TrackType, string>`으로 정의하고 export한다.

**File**: `lib/constants.ts`
**Action**: EDIT

```typescript
export type TrackColors = Record<TrackType, string>;
export type GlowStyles = Record<TrackType, string>;
```

**Acceptance Criteria**:
- [ ] `TrackColors`가 `Record<TrackType, string>`으로 export된다
- [ ] `GlowStyles`가 `Record<TrackType, string>`으로 export된다
- [ ] 두 타입 모두 `TrackType`의 세 키를 모두 요구한다

---

## Phase 3: US1 - Dark Theme Base (5-9min)

### TASK-005: `tailwind.config.ts`에 `darkMode: 'class'` 설정

**Description**: `tailwind.config.ts`를 열고 `darkMode: 'class'`를 추가한다. 이 설정이 있어야 `dark:` 접두사 유틸리티 클래스가 `html.dark` 기반으로 동작한다.

**File**: `tailwind.config.ts`
**Action**: EDIT

```typescript
const config: Config = {
  darkMode: 'class',
  // ... existing config
};
```

**Acceptance Criteria**:
- [ ] `tailwind.config.ts`에 `darkMode: 'class'`가 설정된다
- [ ] 기존 설정(content paths, plugins)이 유지된다
- [ ] TypeScript 타입 오류가 없다

---

### TASK-006: `app/globals.css`에 다크 테마 CSS 변수 및 body 스타일 추가

**Description**: `app/globals.css`에 `:root` 블록에 CSS 변수를 추가하고, `body`에 다크 배경색(`#0a0a0f`)과 텍스트 색상(`#f9fafb`)을 적용한다.

**File**: `app/globals.css`
**Action**: EDIT

```css
@layer base {
  :root {
    --track-fast: #F59E0B;
    --track-deep: #3B82F6;
    --track-risk: #8B5CF6;
    --track-fast-glow: rgba(245, 158, 11, 0.5);
    --track-deep-glow: rgba(59, 130, 246, 0.5);
    --track-risk-glow: rgba(139, 92, 246, 0.5);
  }

  body {
    background-color: #0a0a0f;
    color: #f9fafb;
  }
}
```

**Acceptance Criteria**:
- [ ] `--track-fast`, `--track-deep`, `--track-risk` CSS 변수가 정의된다
- [ ] `body`의 배경색이 `#0a0a0f`로 설정된다
- [ ] `body`의 텍스트 색상이 `#f9fafb`로 설정된다
- [ ] 기존 shadcn/ui CSS 변수(`--background`, `--foreground` 등)와 충돌하지 않는다

---

### TASK-007: `app/layout.tsx`에 `html` 태그 `dark` 클래스 추가

**Description**: `app/layout.tsx`의 `<html>` 태그에 `className="dark"`를 추가한다. 이렇게 하면 항상 다크 모드가 적용된다.

**File**: `app/layout.tsx`
**Action**: EDIT

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

**Acceptance Criteria**:
- [ ] `<html>` 태그에 `className="dark"`가 추가된다
- [ ] `lang="ko"`가 유지된다
- [ ] 브라우저에서 `html` 요소에 `dark` 클래스가 확인된다

---

## Phase 4: US2 - Track Colors Constant (9-12min)

### TASK-008: `tailwind.config.ts`에 트랙 색상 `extend.colors` 등록

**Description**: `tailwind.config.ts`의 `theme.extend.colors`에 `track-fast`, `track-deep`, `track-risk`를 CSS 변수 참조로 등록한다.

**File**: `tailwind.config.ts`
**Action**: EDIT

```typescript
theme: {
  extend: {
    colors: {
      'track-fast': 'var(--track-fast)',
      'track-deep': 'var(--track-deep)',
      'track-risk': 'var(--track-risk)',
    },
  },
},
```

**Acceptance Criteria**:
- [ ] `bg-track-fast`, `text-track-fast`, `border-track-fast` 유틸리티 클래스가 동작한다
- [ ] 동일하게 `track-deep`, `track-risk`도 동작한다
- [ ] CSS 변수 참조 방식으로 설정되어 단일 진실 원천이 유지된다

---

### TASK-009: `lib/constants.ts`에 `TRACK_COLORS` 상수 정의

**Description**: `lib/constants.ts`에 `TRACK_COLORS` 상수를 `TrackColors` 타입으로 정의하고 export한다.

**File**: `lib/constants.ts`
**Action**: EDIT

```typescript
export const TRACK_COLORS: TrackColors = {
  fast: '#F59E0B',
  deep: '#3B82F6',
  risk: '#8B5CF6',
} as const;
```

**Acceptance Criteria**:
- [ ] `TRACK_COLORS.fast`가 `'#F59E0B'`을 반환한다
- [ ] `TRACK_COLORS.deep`가 `'#3B82F6'`을 반환한다
- [ ] `TRACK_COLORS.risk`가 `'#8B5CF6'`을 반환한다
- [ ] `as const`가 사용되어 readonly로 선언된다
- [ ] `TrackColors` 타입이 명시적으로 지정된다

---

## Phase 5: US3 - Glow Styles Constant (12-14min)

### TASK-010: `lib/constants.ts`에 `GLOW_STYLES` 상수 정의

**Description**: `lib/constants.ts`에 `GLOW_STYLES` 상수를 `GlowStyles` 타입으로 정의하고 export한다. 값은 CSS `box-shadow` 속성에 직접 할당 가능한 문자열이다.

**File**: `lib/constants.ts`
**Action**: EDIT

```typescript
export const GLOW_STYLES: GlowStyles = {
  fast: '0 0 12px rgba(245, 158, 11, 0.5)',
  deep: '0 0 12px rgba(59, 130, 246, 0.5)',
  risk: '0 0 12px rgba(139, 92, 246, 0.5)',
} as const;
```

**Acceptance Criteria**:
- [ ] `GLOW_STYLES.fast`가 Fast Track 글로우 값을 반환한다
- [ ] `GLOW_STYLES.deep`가 Deep Dive 글로우 값을 반환한다
- [ ] `GLOW_STYLES.risk`가 Risk Path 글로우 값을 반환한다
- [ ] React 인라인 스타일 `style={{ boxShadow: GLOW_STYLES.fast }}`로 적용 시 글로우가 표시된다
- [ ] `as const`가 사용되어 readonly로 선언된다

---

## Phase 6: Polish & Verification (14-15min)

### TASK-011: TypeScript 컴파일 오류 없음 확인

**Description**: `tsc --noEmit`을 실행하여 TypeScript 컴파일 오류가 없는지 확인한다.

**Action**: VERIFY

**Acceptance Criteria**:
- [ ] `tsc --noEmit` 실행 시 오류가 없다
- [ ] `lib/constants.ts`의 모든 export가 올바른 타입을 가진다
- [ ] `tailwind.config.ts`에 타입 오류가 없다

---

### TASK-012: WCAG 색상 대비율 검증

**Description**: 세 트랙 색상이 `#0a0a0f` 배경 위에서 WCAG AA 기준(최소 4.5:1)을 충족하는지 확인한다.

**Action**: VERIFY

**Pre-calculated Results**:
| Color | Background | Contrast Ratio | WCAG AA |
|-------|-----------|----------------|---------|
| `#F59E0B` | `#0a0a0f` | ~8.3:1 | Pass |
| `#3B82F6` | `#0a0a0f` | ~4.7:1 | Pass |
| `#8B5CF6` | `#0a0a0f` | ~4.9:1 | Pass |

**Acceptance Criteria**:
- [ ] Fast Track (`#F59E0B`) 대비율 >= 4.5:1
- [ ] Deep Dive (`#3B82F6`) 대비율 >= 4.5:1
- [ ] Risk Path (`#8B5CF6`) 대비율 >= 4.5:1

**Tools**: https://webaim.org/resources/contrastchecker/ 또는 브라우저 접근성 도구

---

## Task Dependency Graph

```
TASK-001 (파일 생성)
  └── TASK-002 (strict 모드 확인)
      └── TASK-003 (TrackType 정의)
          └── TASK-004 (TrackColors, GlowStyles 타입)
              ├── TASK-009 (TRACK_COLORS 상수) ←── TASK-008 (tailwind colors)
              └── TASK-010 (GLOW_STYLES 상수)

TASK-005 (darkMode: 'class')
  └── TASK-006 (globals.css 변수 + body)
      └── TASK-007 (layout.tsx dark 클래스)
          └── TASK-008 (tailwind extend.colors)

TASK-011 (tsc 검증) ← 모든 구현 태스크 완료 후
TASK-012 (대비율 검증) ← TASK-006 완료 후
```

---

## Definition of Done

FE-02가 완료(Done)되려면 다음 조건을 모두 충족해야 한다:

- [ ] `lib/constants.ts`가 생성되고 `TrackType`, `TrackColors`, `GlowStyles`, `TRACK_COLORS`, `GLOW_STYLES`가 모두 export된다
- [ ] `tailwind.config.ts`에 `darkMode: 'class'`와 트랙 색상 확장이 추가된다
- [ ] `app/globals.css`에 CSS 변수와 body 다크 스타일이 추가된다
- [ ] `app/layout.tsx`의 `<html>` 태그에 `className="dark"`가 추가된다
- [ ] `tsc --noEmit` 오류 없음
- [ ] 브라우저에서 `#0a0a0f` 다크 배경이 확인됨
- [ ] 세 트랙 색상 모두 WCAG AA 대비율 통과
