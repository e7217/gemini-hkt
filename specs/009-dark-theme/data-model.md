# FE-02 Data Model: 다크 테마 기본 + 트랙별 색상 체계

## Overview

FE-02는 런타임 상태(state)가 없는 순수 정적 구성 피처다. 데이터 모델은 TypeScript 타입과 상수로만 구성된다. Zustand 스토어나 API 응답 스키마는 이 피처에 해당하지 않는다.

---

## Type Definitions

### `TrackType`

```typescript
// lib/constants.ts
type TrackType = 'fast' | 'deep' | 'risk';
```

**역할**: 세 가지 경로 유형을 나타내는 리터럴 유니온 타입. `string` 타입 대신 사용하여 잘못된 트랙 키 사용 시 TypeScript 컴파일 타임에 오류를 발생시킨다.

**사용 예시**:
```typescript
function getTrackColor(track: TrackType): string {
  return TRACK_COLORS[track];
}

// OK
getTrackColor('fast');
getTrackColor('deep');
getTrackColor('risk');

// Error: Argument of type '"unknown"' is not assignable to parameter of type 'TrackType'
getTrackColor('unknown');
```

---

### `TrackColors`

```typescript
// lib/constants.ts
type TrackColors = Record<TrackType, string>;
```

**역할**: 각 `TrackType` 키에 대해 HEX 색상 문자열을 매핑하는 타입. `Record<TrackType, string>`은 세 키(`fast`, `deep`, `risk`) 모두 반드시 정의되어야 함을 보장한다.

**실제 값**:
| Key | Value | Color Name | Usage |
|-----|-------|------------|-------|
| `fast` | `#F59E0B` | Amber 500 | Fast Track (빠른 길) 노드 테두리, 엣지, 레전드 |
| `deep` | `#3B82F6` | Blue 500 | Deep Dive (깊은 길) 노드 테두리, 엣지, 레전드 |
| `risk` | `#8B5CF6` | Violet 500 | Risk Path (도전 길) 노드 테두리, 엣지, 레전드 |

---

### `GlowStyles`

```typescript
// lib/constants.ts
type GlowStyles = Record<TrackType, string>;
```

**역할**: 각 `TrackType` 키에 대해 CSS `box-shadow` 속성 값 문자열을 매핑하는 타입. React 인라인 스타일의 `boxShadow` 프로퍼티에 직접 할당할 수 있다.

**실제 값**:
| Key | Value | Visual |
|-----|-------|--------|
| `fast` | `'0 0 12px rgba(245, 158, 11, 0.5)'` | 황금색 글로우 (blur 12px, 50% 불투명) |
| `deep` | `'0 0 12px rgba(59, 130, 246, 0.5)'` | 파란색 글로우 (blur 12px, 50% 불투명) |
| `risk` | `'0 0 12px rgba(139, 92, 246, 0.5)'` | 보라색 글로우 (blur 12px, 50% 불투명) |

---

## Constants

### `TRACK_COLORS`

```typescript
// lib/constants.ts
export const TRACK_COLORS: TrackColors = {
  fast: '#F59E0B',
  deep: '#3B82F6',
  risk: '#8B5CF6',
} as const;
```

**`as const` 사용 이유**: 객체를 읽기 전용(readonly)으로 만들어 실수로 값을 변경하지 못하게 한다. 또한 타입이 `string`이 아닌 리터럴 타입(`'#F59E0B'`)으로 좁혀진다.

---

### `GLOW_STYLES`

```typescript
// lib/constants.ts
export const GLOW_STYLES: GlowStyles = {
  fast: '0 0 12px rgba(245, 158, 11, 0.5)',
  deep: '0 0 12px rgba(59, 130, 246, 0.5)',
  risk: '0 0 12px rgba(139, 92, 246, 0.5)',
} as const;
```

**값 형식**: CSS `box-shadow` 속성 값 형식(`offset-x offset-y blur-radius color`). `box-shadow:` 프리픽스 없이 값만 포함. React 인라인 스타일에서 `style={{ boxShadow: GLOW_STYLES.fast }}`로 직접 사용한다.

---

## CSS Variables

`app/globals.css`에서 정의되는 CSS 변수. Tailwind 유틸리티 클래스가 이를 참조한다.

```css
/* app/globals.css */
:root {
  /* Track Colors */
  --track-fast: #F59E0B;
  --track-deep: #3B82F6;
  --track-risk: #8B5CF6;

  /* Track Glow Colors (rgba) */
  --track-fast-glow: rgba(245, 158, 11, 0.5);
  --track-deep-glow: rgba(59, 130, 246, 0.5);
  --track-risk-glow: rgba(139, 92, 246, 0.5);
}

body {
  background-color: #0a0a0f;
  color: #f9fafb;
}
```

---

## Tailwind Custom Colors

`tailwind.config.ts`에서 CSS 변수를 참조하는 Tailwind 색상 확장.

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'track-fast': 'var(--track-fast)',   // -> bg-track-fast, text-track-fast, border-track-fast
      'track-deep': 'var(--track-deep)',   // -> bg-track-deep, text-track-deep, border-track-deep
      'track-risk': 'var(--track-risk)',   // -> bg-track-risk, text-track-risk, border-track-risk
    },
  },
},
```

---

## Data Flow Diagram

```
lib/constants.ts
  └── TRACK_COLORS       ──→ React 컴포넌트 (노드, 엣지, 레전드)
  └── GLOW_STYLES        ──→ React 인라인 스타일 (노드 boxShadow)
  └── TrackType          ──→ 타입 안전 props/params

app/globals.css
  └── CSS 변수 (--track-*) ──→ tailwind.config.ts (extend.colors)
                             └── Tailwind 유틸리티 클래스 (bg-track-fast 등)

tailwind.config.ts
  └── darkMode: 'class'  ──→ app/layout.tsx <html className="dark">
  └── extend.colors      ──→ 컴포넌트 className
```

---

## Constraints

- `TrackType`은 `'fast' | 'deep' | 'risk'` 세 값만 허용. 추가 트랙은 이 스펙 범위 외.
- `TRACK_COLORS`와 `GLOW_STYLES`는 readonly. 런타임 변경 금지.
- HEX 값은 대문자 6자리 형식(`#F59E0B`) 사용. 단축 형식(`#F9B`) 사용 금지.
- `GlowStyles` 값은 `box-shadow` 값 문자열만 포함. `box-shadow:` 프리픽스 없음.
