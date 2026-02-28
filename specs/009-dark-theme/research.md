# FE-02 Research: 다크 테마 기본 + 트랙별 색상 체계

## Research Summary

FE-02 구현에 필요한 기술 조사 결과. Tailwind CSS v3 다크 모드 설정, CSS 변수 테마 토큰 패턴, box-shadow 글로우 기법, WCAG 색상 대비 요구사항을 다룬다.

---

## 1. Tailwind CSS v3 Dark Mode Configuration

### `class` vs `media` Strategy

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',   // 'media' 대신 'class' 사용
  // ...
};
```

- `'media'` 전략: `@media (prefers-color-scheme: dark)` 에 반응. 사용자 OS 설정에 의존.
- `'class'` 전략: `<html class="dark">` 처럼 DOM에 `dark` 클래스가 있을 때 활성화. 앱에서 직접 제어 가능.

LifePath는 라이트 모드가 없으므로 `'class'` 전략 + `layout.tsx`의 `<html>` 태그에 `dark` 클래스를 정적으로 부여하면 항상 다크 모드로 고정된다.

### Extend Colors

```typescript
theme: {
  extend: {
    colors: {
      'track-fast': '#F59E0B',
      'track-deep': '#3B82F6',
      'track-risk': '#8B5CF6',
      // CSS 변수 참조 방식 (권장)
      'track-fast': 'var(--track-fast)',
      'track-deep': 'var(--track-deep)',
      'track-risk': 'var(--track-risk)',
    },
  },
},
```

CSS 변수 참조 방식을 사용하면 나중에 테마를 변경할 때 CSS 파일 한 곳만 수정하면 된다.

---

## 2. CSS Custom Properties for Theme Tokens

### 패턴: Single Source of Truth

```css
/* app/globals.css */
:root {
  --background: 10 10 15;      /* #0a0a0f in RGB */
  --foreground: 249 250 251;   /* #f9fafb in RGB */
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
```

### shadcn/ui와의 통합

shadcn/ui는 내부적으로 `hsl(var(--background))` 형식의 CSS 변수를 사용한다. 이 변수들은 `components.json`을 통해 `globals.css`에 자동 삽입된다. 트랙 색상 변수는 shadcn/ui 변수와 다른 네임스페이스(`--track-*`)를 사용하므로 충돌이 없다.

shadcn/ui의 기본 dark 모드 변수 예시:
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

LifePath는 이 변수를 직접 오버라이드하거나, `body` 배경을 명시적으로 `#0a0a0f`로 재지정하는 방식을 선택할 수 있다. 명시적 `body` 스타일링이 더 간단하고 명확하다.

---

## 3. Box-Shadow Glow Technique

### 기본 원리

CSS `box-shadow`는 `inset`, `offset-x`, `offset-y`, `blur-radius`, `spread-radius`, `color` 값을 받는다. 글로우 효과를 만들려면 offset을 `0`으로, blur를 크게, spread를 작게, color를 반투명으로 설정한다.

```css
/* 글로우 공식 */
box-shadow: 0 0 {blur}px {spread}px {color};

/* Fast Track 예시 */
box-shadow: 0 0 12px 0px rgba(245, 158, 11, 0.5);

/* 더 강한 글로우 (hover 등) */
box-shadow: 0 0 20px 4px rgba(245, 158, 11, 0.7);
```

### React에서 적용

```tsx
// 인라인 스타일 방식
<div style={{ boxShadow: GLOW_STYLES[trackType] }}>

// CSS 변수 방식 (Tailwind와 함께)
<div className="shadow-[var(--glow-fast)]">

// Tailwind extend boxShadow 방식 (권장)
<div className="shadow-glow-fast">
```

### 성능 고려사항

`box-shadow`는 페인트(paint) 단계에서 렌더링된다. `transform`이나 `opacity`와 달리 GPU 레이어 최적화가 어렵다. 노드 수가 많아질 경우(50개 이상) 성능 저하가 발생할 수 있으므로, 글로우 애니메이션은 선택된 노드나 호버 상태에만 적용하는 것이 좋다. 기본 정적 글로우는 영향이 미미하다.

---

## 4. WCAG Color Contrast Requirements

### 기준

| Level | Small Text (<18pt/14pt bold) | Large Text (>=18pt/14pt bold) | UI Components |
|-------|------------------------------|-------------------------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | N/A |

LifePath의 목표: **WCAG AA** 최소 준수.

### 트랙 색상 대비율 계산

배경색: `#0a0a0f` (상대 휘도: ~0.002)

| 색상 | HEX | 상대 휘도 | 대비율 (`#0a0a0f` 대비) | WCAG AA |
|------|-----|----------|------------------------|---------|
| Fast Track | `#F59E0B` | ~0.349 | ~8.3:1 | Pass |
| Deep Dive | `#3B82F6` | ~0.144 | ~4.7:1 | Pass |
| Risk Path | `#8B5CF6` | ~0.155 | ~4.9:1 | Pass |

계산 공식: `contrast = (L1 + 0.05) / (L2 + 0.05)` (L1 > L2)

모든 트랙 색상이 `#0a0a0f` 배경에서 WCAG AA (4.5:1)를 통과한다.

### 노드 내부 텍스트 주의사항

노드 카드의 텍스트는 트랙 색상 배경이 아닌 어두운 카드 배경(예: `#1a1a2e`) 위에 흰색 텍스트로 표시되어야 한다. 트랙 색상은 테두리(border)나 글로우에만 적용하고, 텍스트를 트랙 색상으로 직접 표시할 때는 대비율을 별도로 검증해야 한다.

---

## 5. Referenced Specs

- `docs/03-frontend-spec.md` K-1: 다크 테마 기본
- `docs/03-frontend-spec.md` K-2: 트랙별 색상 체계 (금/파랑/보라)
- `docs/03-frontend-spec.md` K-3: 노드 글로우 (box-shadow)
- `docs/03-frontend-spec.md` L-1: 데스크탑 1280px+
- `docs/issues/phase-1/FE-02-dark-theme.md`: 이슈 상세

---

## 6. Key Decisions

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Dark mode strategy | `media` vs `class` | `class` | 라이트 모드 없이 다크 전용, 명시적 제어 필요 |
| Color source | Hardcoded vs CSS variables | CSS variables + TS constants | 단일 진실 원천, JS/CSS 양쪽 접근 가능 |
| Glow value format | `box-shadow` shorthand vs CSS var | `box-shadow` string in constants | React 인라인 스타일 적용 용이 |
| Tailwind color registration | Direct hex vs CSS var reference | CSS var reference | 테마 변경 시 유연성 확보 |
