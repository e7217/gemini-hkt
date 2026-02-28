# FE-02 Quickstart: 다크 테마 + 트랙 색상 사용 가이드

개발자를 위한 빠른 시작 가이드. FE-02에서 정의한 다크 테마, 트랙 색상, 글로우 효과를 컴포넌트에서 사용하는 방법을 설명한다.

---

## 1. Import

```typescript
import { TRACK_COLORS, GLOW_STYLES, TrackType } from '@/lib/constants';
```

---

## 2. Track Colors in Components

### 인라인 스타일로 노드 테두리 색상 적용

```tsx
// components/nodes/StepNode.tsx
import { TRACK_COLORS, TrackType } from '@/lib/constants';

interface StepNodeProps {
  trackType: TrackType;
  label: string;
}

export function StepNode({ trackType, label }: StepNodeProps) {
  return (
    <div
      className="rounded-lg px-4 py-2 bg-gray-900 text-white"
      style={{ borderColor: TRACK_COLORS[trackType], borderWidth: '2px', borderStyle: 'solid' }}
    >
      {label}
    </div>
  );
}
```

### Tailwind 유틸리티 클래스 사용 (tailwind.config.ts에 등록 후)

```tsx
// tailwind.config.ts에 track-fast, track-deep, track-risk 등록 필요
const trackBorderClass: Record<TrackType, string> = {
  fast: 'border-track-fast',
  deep: 'border-track-deep',
  risk: 'border-track-risk',
};

export function StepNode({ trackType, label }: StepNodeProps) {
  return (
    <div className={`rounded-lg px-4 py-2 bg-gray-900 text-white border-2 ${trackBorderClass[trackType]}`}>
      {label}
    </div>
  );
}
```

### React Flow 엣지 색상

```typescript
// utils/flowTransform.ts
import { Edge } from '@xyflow/react';
import { TRACK_COLORS, TrackType } from '@/lib/constants';

function createEdge(source: string, target: string, track: TrackType): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    style: { stroke: TRACK_COLORS[track], strokeWidth: 2 },
  };
}
```

### 레전드 컴포넌트

```tsx
// components/TrackLegend.tsx
import { TRACK_COLORS, TrackType } from '@/lib/constants';

const TRACK_LABELS: Record<TrackType, string> = {
  fast: '빠른 길',
  deep: '깊은 길',
  risk: '도전 길',
};

export function TrackLegend() {
  const tracks: TrackType[] = ['fast', 'deep', 'risk'];

  return (
    <div className="flex gap-4">
      {tracks.map((track) => (
        <div key={track} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: TRACK_COLORS[track] }}
          />
          <span className="text-sm text-gray-300">{TRACK_LABELS[track]}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Glow Effects on Nodes

### 기본 글로우 (항상 표시)

```tsx
import { GLOW_STYLES, TrackType } from '@/lib/constants';

export function GlowNode({ trackType, label }: { trackType: TrackType; label: string }) {
  return (
    <div
      className="rounded-lg px-4 py-2 bg-gray-900 text-white"
      style={{ boxShadow: GLOW_STYLES[trackType] }}
    >
      {label}
    </div>
  );
}
```

### 선택된 노드에만 글로우 표시

```tsx
export function SelectableNode({
  trackType,
  label,
  isSelected,
}: {
  trackType: TrackType;
  label: string;
  isSelected: boolean;
}) {
  return (
    <div
      className="rounded-lg px-4 py-2 bg-gray-900 text-white transition-shadow duration-300"
      style={{
        boxShadow: isSelected ? GLOW_STYLES[trackType] : 'none',
        borderColor: TRACK_COLORS[trackType],
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
    >
      {label}
    </div>
  );
}
```

### Hover 글로우 (CSS transition)

```tsx
// CSS 방식 (globals.css 또는 CSS module)
// .node-fast:hover { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }

// 또는 Tailwind arbitrary values
const hoverGlowClass: Record<TrackType, string> = {
  fast: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.8)]',
  deep: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]',
  risk: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.8)]',
};

export function HoverGlowNode({ trackType, label }: { trackType: TrackType; label: string }) {
  return (
    <div
      className={`rounded-lg px-4 py-2 bg-gray-900 text-white transition-shadow duration-300 ${hoverGlowClass[trackType]}`}
      style={{ boxShadow: GLOW_STYLES[trackType] }}
    >
      {label}
    </div>
  );
}
```

---

## 4. Theme Extension Instructions

### Step 1: `tailwind.config.ts`에 색상 등록

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'track-fast': 'var(--track-fast)',
        'track-deep': 'var(--track-deep)',
        'track-risk': 'var(--track-risk)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Step 2: `app/globals.css`에 CSS 변수 추가

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

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

### Step 3: `app/layout.tsx`에 `dark` 클래스 추가

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

---

## 5. Quick Reference

| 목적 | 방법 |
|------|------|
| 노드 테두리 색상 | `style={{ borderColor: TRACK_COLORS[trackType] }}` |
| React Flow 엣지 색상 | `style: { stroke: TRACK_COLORS[track] }` |
| 노드 글로우 | `style={{ boxShadow: GLOW_STYLES[trackType] }}` |
| Tailwind 배경색 | `className="bg-track-fast"` |
| Tailwind 텍스트색 | `className="text-track-deep"` |
| 타입 안전 트랙 파라미터 | `(track: TrackType) => ...` |

---

## 6. Common Mistakes

**실수 1: `box-shadow:` 프리픽스 포함**
```typescript
// Wrong
style={{ boxShadow: `box-shadow: ${GLOW_STYLES[trackType]}` }}

// Correct
style={{ boxShadow: GLOW_STYLES[trackType] }}
```

**실수 2: string으로 TrackType 전달**
```typescript
// Wrong (런타임 오류 가능)
function getColor(track: string) { return TRACK_COLORS[track as TrackType]; }

// Correct (컴파일 타임 안전)
function getColor(track: TrackType) { return TRACK_COLORS[track]; }
```

**실수 3: 다크 클래스 누락**
```tsx
// Wrong: 라이트 모드로 표시됨
<html lang="ko">

// Correct: 항상 다크 모드 유지
<html lang="ko" className="dark">
```
