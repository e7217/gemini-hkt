# [BUG-04] 기회 비용이 DetailPanel에만 표시되고 Canvas 노드에 미반영

## 개요
- **Phase**: Phase 4 (기능 완성)
- **관련 이슈**: F1 - 시간의 가격표 (기회비용)
- **담당**: frontend-dev
- **상태**: open
- **우선순위**: Medium

## 문제 현상

`PathNode.opportunityCost` 데이터가 Gemini 응답에 포함되어 있고,
DetailPanel에서는 주황색 박스로 올바르게 표시된다.
**그러나 Canvas의 StepNode에는 기회 비용 존재 여부를 나타내는 시각적 표시가
전혀 없어서, 사용자가 노드를 클릭하기 전까지 해당 단계에 기회비용이 있는지
알 수 없다. 정보 탐색 동선이 방해받는다.**

## 원인 분석

`components/nodes/StepNode.tsx`가 `data.opportunityCost`를 받지만
이를 시각적으로 표현하는 코드가 없다. 기존 스펙(`F1-opportunity-cost.md`)에서
"맵 렌더링 시 아이콘화하여 제공"을 명시했으나 미구현 상태.

## 수정 방향

### StepNode에 기회 비용 아이콘 배지 추가 (권장)

`StepNode.tsx`에서 `opportunityCost`가 존재하는 경우 노드 우측 상단에
소형 경고 아이콘(💸 또는 `⚠`)을 오버레이로 표시:

```tsx
// StepNode.tsx 예시
{data.opportunityCost && (
  <div
    title={data.opportunityCost}
    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500
               text-white text-xs flex items-center justify-center shadow-md
               cursor-help z-10"
  >
    💸
  </div>
)}
```

### 추가 개선 (선택)
- 노드 호버 시 `opportunityCost` 텍스트를 툴팁으로 표시
- `timeEstimate`도 동일하게 아이콘 배지로 노드에 노출 (⏱)

## 수용 기준 (Acceptance Criteria)

- [ ] `opportunityCost` 값이 있는 노드에 Canvas 상에서 시각적 표시(아이콘/배지)가 보임
- [ ] 아이콘에 마우스를 올리면 기회 비용 텍스트가 툴팁으로 확인 가능
- [ ] `opportunityCost`가 없는 노드에는 아이콘이 표시되지 않음
- [ ] 배지가 React Flow 핸들 또는 다른 노드와 겹치지 않음

## 참조 파일

- `components/nodes/StepNode.tsx` — 캔버스 노드 컴포넌트 (전체)
- `components/DetailPanel.tsx` — 기회 비용 표시 (L79~L87)
- `lib/graphUtils.ts` — 노드 data 전달 (L60~L63)
- `types/path.ts` — `PathNode.opportunityCost` (L21)
- `docs/issues/phase-2/F1-opportunity-cost.md`
