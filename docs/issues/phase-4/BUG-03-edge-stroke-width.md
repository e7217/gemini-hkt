# [BUG-03] 선 굵기가 hardcode(3)로 고정되어 경로 정보 미전달

## 개요
- **Phase**: Phase 4 (기능 완성)
- **관련 이슈**: F4 - 경로 성공 확률
- **담당**: frontend-dev
- **상태**: open
- **우선순위**: Medium

## 문제 현상

Canvas의 모든 경로 엣지(선)의 굵기가 `strokeWidth: 3`으로 동일하게 고정되어 있다.
`Path.successProbability` 데이터가 Gemini 응답에 포함되어 있음에도 불구하고
선 굵기에 전혀 반영되지 않는다. 사용자는 선의 굵기만으로 어떤 경로가
더 성공 가능성이 높은지 직관적으로 파악할 수 없다.

## 원인 분석

`lib/graphUtils.ts`의 `getEdgeStyle()`이 track 색상만 반환하며 굵기는 고정:

```ts
export function getEdgeStyle(track: string) {
  const color = TRACK_COLORS[track as TrackId] || '#fff';
  return { stroke: color, strokeWidth: 3, filter: `drop-shadow(0 0 5px ${color})` };
  //                        ↑ 항상 3으로 고정
}
```

`TrackEdge.tsx`도 `getEdgeStyle()`에서 반환된 `strokeWidth`를 그대로 사용하며
`successProbability` 값을 전달받거나 활용하는 로직이 없음.

## 수정 방향

1. **`graphUtils.ts`에서 엣지 생성 시 `successProbability` 전달**:
   ```ts
   edges.push({
     ...
     data: { track: trackId, successProbability: track.successProbability }
   });
   ```

2. **`getEdgeStyle()`에 `probability` 파라미터 추가**:
   ```ts
   export function getEdgeStyle(track: string, probability?: number) {
     const color = TRACK_COLORS[track as TrackId] || '#fff';
     // 예: 85% → strokeWidth 5, 60% → 3, 40% 이하 → 2
     const strokeWidth = probability
       ? Math.round(2 + (probability / 100) * 4)  // 2~6 범위
       : 3;
     return { stroke: color, strokeWidth, filter: `drop-shadow(0 0 5px ${color})` };
   }
   ```

3. **`TrackEdge.tsx`에서 `data.successProbability` 활용**:
   ```ts
   const baseStyle = getEdgeStyle(data?.track ?? 'fast', data?.successProbability);
   ```

4. **TrackLegend에 굵기 범례 추가** (선택): 선 굵기 = 성공 확률 시각적 설명

## 수용 기준 (Acceptance Criteria)

- [ ] `successProbability`가 높을수록 엣지가 굵게 표시됨 (최소 2px, 최대 6px 권장)
- [ ] `successProbability`가 없는 경우 기본값 3px 유지 (하위 호환)
- [ ] Fast / Deep / Risk 트랙 간 선 굵기 차이가 육안으로 구분 가능
- [ ] 선 굵기 변화가 글로우 효과(`drop-shadow`)와 어울려 자연스럽게 표현됨

## 참조 파일

- `lib/graphUtils.ts` — `getEdgeStyle()` (L13~L16), 엣지 생성 (L66~L72, L107~L113)
- `components/PathMap/TrackEdge.tsx` — 엣지 렌더링 (전체)
- `types/path.ts` — `Path.successProbability` (L37)
- `docs/issues/phase-2/F4-path-success-probability.md`
