# [BUG-02] 조건 분기된 경로가 분기점 대신 Start 노드에 연결됨

## 개요
- **Phase**: Phase 4 (기능 완성)
- **관련 이슈**: B5 - 조건부 분기
- **담당**: frontend-dev
- **상태**: open
- **우선순위**: Critical

## 문제 현상

DetailPanel에서 "🔀 조건 분기 (What-if)" 조건을 입력하고 "새로운 경로 생성" 버튼을 누르면
Gemini API가 새로운 sub-path를 정상적으로 반환한다.
**그러나 Canvas에서 새 경로의 첫 노드가 사용자가 클릭한 노드(분기점)가 아닌
Start 노드에 연결되어 있다. 사실상 독립된 4번째 경로가 추가되는 것처럼 동작한다.**

## 원인 분석

`graphUtils.ts`의 `pathMapToFlow()`에서 모든 경로의 시작점이 하드코딩되어 있음:

```ts
pathMap.paths.forEach(track => {
  let prevId = pathMap.startNode.id;  // ← 항상 Start에서 시작
  track.nodes.forEach((node) => {
    prevId = addNodesAndEdges(node, track.id, prevId);
  });
  ...
});
```

`addBranch()` store 액션이 새 Path를 `pathMap.paths` 배열에 단순 append하며,
branch의 origin(어느 노드에서 분기했는지)을 저장하지 않는다.

## 수정 방향

### 방법 A: `Path` 타입에 `originNodeId` 추가 (권장)
1. `types/path.ts`의 `Path` 인터페이스에 `originNodeId?: string` 필드 추가
2. `addBranch()` 호출 시 `selectedNode`의 canvas node ID를 `originNodeId`로 저장
3. `pathMapToFlow()`에서 `path.originNodeId`가 있으면 해당 노드에서 첫 엣지를 시작

```ts
// graphUtils.ts 수정 예시
pathMap.paths.forEach(track => {
  const startId = track.originNodeId ?? pathMap.startNode.id;
  let prevId = startId;
  track.nodes.forEach((node) => { ... });
});
```

### 방법 B: `BranchResponse`에 `originNodeId` 포함
서버 응답에 분기 origin 정보를 포함시켜 클라이언트에서 활용

## 수용 기준 (Acceptance Criteria)

- [ ] 노드 A에서 조건 분기 생성 시 새 경로의 첫 노드가 노드 A에 엣지로 연결됨
- [ ] 분기된 경로는 Start 노드에 연결되지 않음
- [ ] 분기 경로의 색상이 기존 3개 트랙과 시각적으로 구분됨 (다른 색상 또는 점선)
- [ ] TrackLegend에 새 분기 경로가 추가 항목으로 표시됨

## 참조 파일

- `types/path.ts` — `Path` 인터페이스 (L33~L40)
- `lib/graphUtils.ts` — `pathMapToFlow()` (L101~L114)
- `store/useLifePathStore.ts` — `addBranch()` 액션 (L75~L122)
- `app/api/paths/branch/route.ts` — 분기 API 엔드포인트
- `docs/issues/phase-2/B5-conditional-branching.md`
