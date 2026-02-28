# [BUG-01] 단계 상세 분해 결과가 Canvas에 미반영

## 개요
- **Phase**: Phase 4 (기능 완성)
- **관련 이슈**: C9 - 마인드맵 노드 확장
- **담당**: frontend-dev
- **상태**: open
- **우선순위**: High

## 문제 현상

"🔍 단계 상세 분해" 버튼 클릭 시 Gemini API가 subNodes를 정상적으로 반환하고,
DetailPanel 내부에는 "📋 상세 액션 플랜" 목록이 텍스트로 표시된다.
**그러나 Canvas(React Flow) 위에는 subNode가 그래프 노드로 추가되지 않는다.**

## 원인 분석

1. `graphUtils.ts`의 `pathMapToFlow()`에 subNode 렌더링 로직은 구현되어 있음
2. 그러나 `PathMapCanvas.tsx`에서 `pathMap`을 `useMemo` 의존성으로 사용 중:
   ```ts
   const { nodes, edges } = useMemo(() => pathMapToFlow(pathMap), [pathMap]);
   ```
3. `expandNode()` store 액션이 `pathMap.paths[n].nodes[i].subNodes`를 업데이트하므로
   `pathMap` 객체 참조는 변경되지만, 업데이트 직후 `fitView` 타이밍 이슈 및
   레이아웃 재계산이 subNode를 올바르게 배치하지 못할 수 있음
4. `graphUtils.ts`의 subNode 엣지가 `animated: true`와 `style: { strokeDasharray }` 두 곳에
   동시에 스타일을 설정하여 `TrackEdge`에서 충돌 가능성 있음

## 수정 방향

1. **Canvas 노드 확인**: `expandNode` 호출 후 실제로 Canvas에 stepNode가 추가되는지 확인
2. **레이아웃 재계산 강제화**: subNode 추가 후 `fitView`를 명시적으로 재호출
3. **subNode 시각적 구분**: `isSubNode: true` 데이터를 `StepNode`에서 읽어 크기/스타일 차별화
4. **TrackEdge 스타일 충돌 해소**: `animated`와 `strokeDasharray` 전달 방식 일원화

## 수용 기준 (Acceptance Criteria)

- [ ] "단계 상세 분해" 클릭 후 Canvas에 3~5개의 subNode가 점선 엣지로 연결되어 나타남
- [ ] subNode는 부모 노드보다 시각적으로 구분됨 (크기 축소 또는 투명도 차이)
- [ ] subNode 추가 후 `fitView`로 뷰가 자동 조정됨
- [ ] DetailPanel의 텍스트 목록과 Canvas 그래프 노드가 동일한 데이터를 표시

## 참조 파일

- `lib/graphUtils.ts` — subNode 렌더링 로직 (L75~L96)
- `store/useLifePathStore.ts` — `expandNode()` 액션 (L123~L178)
- `components/DetailPanel.tsx` — subNodes 텍스트 표시 (L114~L135)
- `components/nodes/StepNode.tsx` — 노드 컴포넌트
- `docs/issues/phase-2/C9-mindmap-node-expansion.md`
