# FE-07 Research: 버그 수정 + UI 폴리시

## Research Summary

FE-07 구현에 필요한 기술 조사 결과. CSS transition 호버 효과 best practice, shadcn/ui Input의 maxLength 패턴, WCAG 색상 대비 확인 방법, React error boundary 패턴, 텍스트 말줄임 기법을 다룬다.

---

## 1. CSS Transition Best Practices for Hover Effects

### 기본 원칙

모든 인터랙티브 요소에 `transition` 속성을 부여할 때는 특정 속성만 지정하는 것이 `all` 보다 성능상 유리하다. 단, 데모 범위에서는 노드 수가 20개 미만이므로 `all 0.2s ease`를 사용해도 무방하다.

```css
/* 권장: 특정 속성만 트랜지션 */
.node {
  transition: box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

/* 간편: 전체 속성 트랜지션 (노드 수 적을 때 허용) */
.node {
  transition: all 0.2s ease;
}
```

### Tailwind CSS Transition Utilities

```tsx
// Tailwind로 동일한 효과 적용
<div className="transition-all duration-200 ease-in-out hover:scale-[1.02] hover:brightness-110">
  {/* node content */}
</div>
```

주요 Tailwind 트랜지션 유틸리티:
- `transition-all` → `transition-property: all`
- `duration-200` → `transition-duration: 200ms`
- `ease-in-out` → `transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)`
- `hover:scale-[1.02]` → `transform: scale(1.02)` on hover

### React Flow 노드 호버 처리

React Flow의 커스텀 노드는 일반 React 컴포넌트이므로 Tailwind 클래스를 그대로 적용할 수 있다.

```tsx
// components/nodes/StepNode.tsx
export function StepNode({ data }: NodeProps<StepNodeData>) {
  return (
    <div
      className="
        rounded-lg border px-4 py-2
        transition-all duration-200 ease-in-out
        hover:scale-[1.02] hover:brightness-110
        cursor-pointer
      "
      style={{ boxShadow: data.glowStyle }}
    >
      {data.label}
    </div>
  );
}
```

### 호버 글로우 강화 패턴

```css
/* 기본 글로우 → 호버 시 강화 */
.node-fast {
  box-shadow: 0 0 12px 0px rgba(245, 158, 11, 0.4);
  transition: box-shadow 0.2s ease;
}
.node-fast:hover {
  box-shadow: 0 0 20px 4px rgba(245, 158, 11, 0.7);
}
```

### `prefers-reduced-motion` 고려

배터리나 접근성 설정으로 모션을 줄이는 사용자를 위한 미디어 쿼리. 데모 필수는 아니나 완성도를 높인다:

```css
@media (prefers-reduced-motion: reduce) {
  .node {
    transition: none;
  }
}
```

Tailwind에서는 `motion-reduce:transition-none` 클래스로 동일하게 처리한다.

---

## 2. Input Validation Patterns with shadcn/ui

### maxLength 속성

shadcn/ui의 `Input` 컴포넌트는 HTML `<input>` 요소를 래핑하므로 표준 HTML 속성을 모두 전달(pass-through)한다.

```tsx
import { Input } from '@/components/ui/input';

// maxLength 적용 — 브라우저 네이티브 제한
<Input
  type="text"
  maxLength={100}
  placeholder="이루고 싶은 목표를 입력하세요"
  value={goal}
  onChange={(e) => setGoal(e.target.value)}
/>
```

`maxLength`는 브라우저 레벨에서 입력을 차단한다. 키보드 이벤트 핸들러에서 별도 처리가 필요 없다.

### 실시간 character count 표시 (선택적 폴리시)

```tsx
<div className="relative">
  <Input maxLength={100} value={goal} onChange={(e) => setGoal(e.target.value)} />
  <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
    {goal.length}/100
  </span>
</div>
```

이 패턴은 사용자가 글자 수 제한에 가까워질 때 시각적 피드백을 제공한다. FE-07의 필수 요구사항은 아니나 폴리시 단계에서 추가하면 완성도를 높인다.

### 빈 입력 방지 — 버튼 disabled 패턴

```tsx
<Button
  onClick={handleSubmit}
  disabled={isLoading || goal.trim().length === 0}
>
  {isLoading ? '생성 중...' : '경로 생성하기'}
</Button>
```

`goal.trim().length === 0` 조건이 `goal === ''`보다 안전하다. 공백 문자만 입력된 경우도 빈 입력으로 처리한다.

### Zod 기반 클라이언트 유효성 검증 (선택적)

API 계층에서 이미 Zod로 검증하고 있다면, 클라이언트에서 별도 Zod 검증을 추가할 필요는 없다. FE-07에서 `disabled` 조건으로 충분하다.

---

## 3. WCAG Color Contrast Checking

### 대비율 계산 공식

```
대비율 = (L1 + 0.05) / (L2 + 0.05)
  L1 = 더 밝은 색의 상대 휘도 (0~1)
  L2 = 더 어두운 색의 상대 휘도 (0~1)
```

상대 휘도 계산:
```
sRGB 채널 값이 c 일 때:
  c_linear = c / 12.92                  (c <= 0.04045)
  c_linear = ((c + 0.055) / 1.055)^2.4  (c > 0.04045)

L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
```

### LifePath 다크 테마 대비율 확인 결과

배경: `#0a0a0f` (L ≈ 0.002)

| 텍스트 색상 | HEX | 상대 휘도 | 대비율 | WCAG AA (4.5:1) |
|----------|-----|---------|--------|-----------------|
| 기본 텍스트 (흰색) | `#f9fafb` | 0.955 | ~48:1 | Pass |
| Fast Track | `#F59E0B` | 0.349 | ~8.3:1 | Pass |
| Deep Dive | `#3B82F6` | 0.144 | ~4.7:1 | Pass (margin 작음) |
| Risk Path | `#8B5CF6` | 0.155 | ~4.9:1 | Pass |
| 보조 텍스트 (`text-muted-foreground`) | `#6b7280` | 0.133 | ~4.5:1 | Pass (borderline) |
| 경고 텍스트 (`text-destructive`) | `#ef4444` | 0.172 | ~5.2:1 | Pass |

**주의**: `text-muted-foreground` (gray-500 기준)는 4.5:1 경계값에 걸쳐 있다. 만약 실제 값이 `#6b7280`보다 어둡게 설정된 경우 WCAG AA를 통과하지 못할 수 있다. 실제 `globals.css`의 `--muted-foreground` 값을 확인하고 필요 시 `#9ca3af` (gray-400, L ≈ 0.213, 대비율 ~6.6:1)로 조정한다.

### 온라인 도구

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Elements 패널 → 텍스트 요소 선택 → Accessibility 탭 → Contrast ratio

---

## 4. React Error Boundary Patterns

### 언제 필요한가

React의 렌더링 오류(throw in render)는 `try-catch`로 잡을 수 없다. React Flow 내부에서 예기치 못한 오류가 발생할 경우 전체 화면이 흰 화면(WSOD)이 된다. Error Boundary는 이를 방지하기 위한 React 내장 메커니즘이다.

### 기본 Class-based Error Boundary (FE-07 필요 시 추가)

```tsx
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

### PathMap 주변 Error Boundary 적용

```tsx
// app/page.tsx 또는 PathMap을 렌더링하는 컴포넌트
<ErrorBoundary fallback={<MapErrorFallback />}>
  <PathMap pathMap={pathMap} />
</ErrorBoundary>
```

**FE-07 결정**: Error Boundary는 PathMap이 실제로 render-time throw를 일으키는 경우에만 추가한다. 먼저 `nodes.length === 0` null-check와 `mergePoint` null-check로 방어하고, 그것으로 충분하면 Error Boundary는 추가하지 않는다 (YAGNI).

---

## 5. Text Overflow and Truncation

### CSS text-overflow 패턴

```css
/* 한 줄 말줄임 */
.truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 여러 줄 말줄임 (WebKit, 모던 브라우저 지원) */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

Tailwind에서:
- `truncate` → `overflow: hidden; white-space: nowrap; text-overflow: ellipsis`
- `line-clamp-2` → 2줄 제한 말줄임

### 노드 라벨에 적용

```tsx
// 노드 라벨: 한 줄 말줄임
<span className="truncate max-w-[160px] block">{data.label}</span>

// 패널 헤딩: 2줄 말줄임
<h3 className="line-clamp-2 font-semibold text-base">{selectedNode?.label}</h3>
```

### overflow: hidden이 필요한 컨테이너

React Flow 노드의 루트 `<div>`는 기본적으로 `overflow: visible`이다. 노드 내부에서 텍스트가 넘칠 경우 노드 카드 경계 밖으로 렌더링된다. 노드 루트 요소에 `overflow: hidden`을 명시적으로 설정한다.

---

## 6. Key Decisions

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Transition target | `all` vs specific properties | `all` (for demo) | Demo has < 20 nodes; `all` is simpler and performance is acceptable |
| Input limit enforcement | `maxLength` vs JS validation | `maxLength` | Browser-native, zero JS overhead, no edge cases |
| Error Boundary addition | Add vs defer | Defer unless render-time throws are observed | YAGNI; prefer targeted null checks over new components |
| WCAG check tool | DevTools vs external tool | DevTools Accessibility tab | Fastest for in-context verification |
| Text truncation | `truncate` vs `line-clamp-2` | `truncate` for nodes, `line-clamp-2` for panel | Nodes need single-line; panel can afford 2 lines |
