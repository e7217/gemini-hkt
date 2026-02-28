# Contract: `lib/constants.ts` (FE-02)

## Contract Overview

| Field | Value |
|-------|-------|
| File | `lib/constants.ts` |
| Feature | FE-02 다크 테마 기본 + 트랙별 색상 체계 |
| Contract Type | Constants & Type Definitions |
| Consumers | FE-03 (React Flow 노드), FE-05 (맵 캔버스), FE-06 (로딩 애니메이션), FE-07 (타임라인 슬라이더) |

---

## Type Definitions

### `TrackType`

```typescript
export type TrackType = 'fast' | 'deep' | 'risk';
```

| Property | Description |
|----------|-------------|
| `'fast'` | Fast Track - 빠른 길 (황금색 경로) |
| `'deep'` | Deep Dive - 깊은 길 (파란색 경로) |
| `'risk'` | Risk Path - 도전 길 (보라색 경로) |

**Breaking Change Policy**: 이 타입에 새 값을 추가하면 모든 `Record<TrackType, T>` 타입 객체에서 컴파일 오류가 발생한다. 트랙 추가는 해당 타입과 모든 Record 상수를 함께 업데이트해야 한다.

---

### `TrackColors`

```typescript
export type TrackColors = Record<TrackType, string>;
```

세 트랙 각각에 HEX 색상 문자열을 매핑. `string` 값은 `#RRGGBB` 형식의 CSS 색상 값이다.

---

### `GlowStyles`

```typescript
export type GlowStyles = Record<TrackType, string>;
```

세 트랙 각각에 CSS `box-shadow` 값 문자열을 매핑. 값은 `box-shadow` 속성에 직접 할당 가능한 형식이다 (`box-shadow:` 키워드 제외).

---

## Constants

### `TRACK_COLORS`

```typescript
export const TRACK_COLORS: TrackColors = {
  fast: '#F59E0B',
  deep: '#3B82F6',
  risk: '#8B5CF6',
} as const;
```

| Key | HEX Value | RGB | Color Name | Tailwind Equivalent |
|-----|-----------|-----|------------|---------------------|
| `fast` | `#F59E0B` | `rgb(245, 158, 11)` | Amber 500 | `amber-500` |
| `deep` | `#3B82F6` | `rgb(59, 130, 246)` | Blue 500 | `blue-500` |
| `risk` | `#8B5CF6` | `rgb(139, 92, 246)` | Violet 500 | `violet-500` |

**Usage**:
```typescript
import { TRACK_COLORS, TrackType } from '@/lib/constants';

// 직접 접근
const fastColor = TRACK_COLORS.fast;       // '#F59E0B'
const deepColor = TRACK_COLORS['deep'];    // '#3B82F6'

// 동적 접근 (타입 안전)
function getColor(track: TrackType): string {
  return TRACK_COLORS[track];
}

// React 인라인 스타일
<div style={{ borderColor: TRACK_COLORS[trackType] }} />

// React Flow 엣지 색상
{ stroke: TRACK_COLORS[track] }
```

---

### `GLOW_STYLES`

```typescript
export const GLOW_STYLES: GlowStyles = {
  fast: '0 0 12px rgba(245, 158, 11, 0.5)',
  deep: '0 0 12px rgba(59, 130, 246, 0.5)',
  risk: '0 0 12px rgba(139, 92, 246, 0.5)',
} as const;
```

| Key | Value | Blur | Spread | Opacity |
|-----|-------|------|--------|---------|
| `fast` | `'0 0 12px rgba(245, 158, 11, 0.5)'` | 12px | 0px | 50% |
| `deep` | `'0 0 12px rgba(59, 130, 246, 0.5)'` | 12px | 0px | 50% |
| `risk` | `'0 0 12px rgba(139, 92, 246, 0.5)'` | 12px | 0px | 50% |

**Usage**:
```typescript
import { GLOW_STYLES, TrackType } from '@/lib/constants';

// React 인라인 스타일
<div style={{ boxShadow: GLOW_STYLES[trackType] }} />

// 조건부 글로우 (선택된 노드만)
<div style={{ boxShadow: isSelected ? GLOW_STYLES[trackType] : 'none' }} />

// 강화된 글로우 (hover 상태)
// GLOW_STYLES 값을 직접 사용하지 않고 CSS hover로 처리 권장
```

---

## Full File Contract

```typescript
// lib/constants.ts
// FE-02: 다크 테마 기본 + 트랙별 색상 체계

export type TrackType = 'fast' | 'deep' | 'risk';

export type TrackColors = Record<TrackType, string>;

export type GlowStyles = Record<TrackType, string>;

export const TRACK_COLORS: TrackColors = {
  fast: '#F59E0B',
  deep: '#3B82F6',
  risk: '#8B5CF6',
} as const;

export const GLOW_STYLES: GlowStyles = {
  fast: '0 0 12px rgba(245, 158, 11, 0.5)',
  deep: '0 0 12px rgba(59, 130, 246, 0.5)',
  risk: '0 0 12px rgba(139, 92, 246, 0.5)',
} as const;
```

---

## Invariants (불변 조건)

1. `TRACK_COLORS`의 값은 항상 유효한 6자리 HEX 색상(`#RRGGBB`)이어야 한다.
2. `GLOW_STYLES`의 값은 항상 유효한 CSS `box-shadow` 값이어야 한다 (`box-shadow:` 키워드 제외).
3. 두 상수 모두 `TrackType`의 모든 키(`fast`, `deep`, `risk`)를 포함해야 한다.
4. 상수는 런타임에 변경되지 않는다 (`as const` 보장).
5. 이 파일은 외부 의존성(import)을 가지지 않는다.

---

## Versioning

| Version | Change | Impact |
|---------|--------|--------|
| 1.0.0 | 초기 정의 (FE-02) | None |

**Future**: 새 트랙 타입이 추가되는 경우, `TrackType` 유니온에 값을 추가하고 `TRACK_COLORS`, `GLOW_STYLES` 모두에 해당 키를 추가해야 한다. TypeScript가 누락된 키를 컴파일 타임에 감지한다.
