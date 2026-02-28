# [BE-02] 공유 TypeScript 타입 정의

## 개요
- **Phase**: Phase 1 (로켓 발사, 0:00~0:20)
- **담당**: backend-dev
- **예상 시간**: 15m
- **난이도**: 낮음
- **상태**: done

## 의존성
- **선행 작업**: [BE-01] 프로젝트 초기 세팅
- **후행 작업**:
  - [BE-05] 프롬프트 엔지니어링
  - [BE-07] Mock 데이터 + 폴백 시스템
  - [FE-03] React Flow 캔버스 + 커스텀 노드 구현

## 구현 범위
1. **PathNode** 인터페이스:
   - id, title, description, duration, difficulty, isMergePoint, tips, monthsFromNow
2. **Path** 인터페이스:
   - id (string), name, color, nodes: PathNode[]
3. **StartGoalNode** 인터페이스 (간소화 타입):
   - id, title, description (startNode/goalNode 전용)
4. **MergePoint** 인터페이스:
   - id, title, connectedPaths, message
5. **PathMap** 인터페이스:
   - startNode: StartGoalNode, goalNode: StartGoalNode, paths: Path[], mergePoints: MergePoint[]
6. **TimelineMetadata** 인터페이스:
   - duration, monthsFromNow, estimatedEndDate?
7. **AnonymousSession** 인터페이스:
   - sessionId, createdAt, expiresAt, pathHistory
8. **API Request/Response 타입**:
   - SimulateRequest: { goal: string, timeframe?: "1y" | "3y" | "5y" }
   - SimulateResponse: PathMap
   - BranchRequest: { pathId: string, currentNodeId: string, choice?: string, currentPathMap: PathMap }
   - BranchResponse: { paths: Path[], mergePoints?: MergePoint[] }

## 기술 요구사항
- **파일 위치**: `types/path.ts` (또는 `types/index.ts`)
- **참조 스펙**: 04-backend-spec.md B14, TypeScript 타입 정의 섹션
- 프론트엔드와 백엔드 모두에서 import 가능한 공유 타입
- TypeScript strict mode 호환

## 수용 기준 (Acceptance Criteria)
- [ ] PathNode, Path, MergePoint, PathMap 인터페이스 정의 완료
- [ ] StartGoalNode 간소화 타입 분리 완료
- [ ] SimulateRequest, SimulateResponse, BranchRequest, BranchResponse 타입 정의 완료
- [ ] Path.id가 string 타입으로 정의 (branch API 하위 경로 대응)
- [ ] 프론트엔드/백엔드 양쪽에서 import 가능
- [ ] TypeScript 컴파일 에러 없음

## 참조 문서
- `/docs/04-backend-spec.md` - B14: 공유 TypeScript 타입 정의, TypeScript 타입 정의 섹션
- `/docs/04-backend-spec.md` - B22: AnonymousSession
- `/docs/04-backend-spec.md` - B34: TimelineMetadata

## 기술 검토 노트
- **Path.id 타입 변경**: 기존 `"fast" | "deep" | "explorer"` 리터럴 유니온 대신 `string`으로 변경. branch API에서 하위 경로가 동적으로 생성되므로 고정 리터럴로는 대응 불가
- **경로명 통일**: 기존 "explorer"를 "risk"로 통일 (01-ideas.md의 Risk Path와 일치시킴). 다만 Path.id가 string이므로 실제 값은 프롬프트에서 제어
- **StartGoalNode 분리**: startNode/goalNode는 PathNode의 모든 필드가 필요하지 않음 (duration, difficulty, monthsFromNow 등 불필요). 간소화 타입으로 분리하여 타입 안전성 확보
- **BranchRequest에 currentPathMap 포함**: branch API는 서버에 상태를 저장하지 않으므로, 클라이언트가 현재 PathMap 전체를 body에 포함하여 전송하는 방식 채택

---

## 아이디어 뱅크 제안

- **노드에 `emoji` 필드 추가**: PathNode에 `emoji: string` 필드를 추가하면 Gemini가 각 노드에 어울리는 이모지를 선택하여 시각적 재미와 직관성을 높일 수 있음. 프론트에서 노드 위에 이모지를 표시하는 것만으로 큰 효과.

- **노드에 `actionItem` 필드 추가**: PathNode에 `actionItem: string` 필드를 두면, 각 단계에서 "오늘 당장 할 수 있는 한 가지"를 Gemini가 제안. 심사위원에게 실행력 있는 도구라는 인상을 줌.

- **Path에 `catchphrase` 필드 추가**: Path 타입에 `catchphrase: string`을 추가하여 Gemini가 각 경로를 한 줄로 요약. 예: "6개월 안에 첫 이직을 성공시키는 스프린트". 경로 선택 UI에서 이름 아래 표시하면 직관적 판단에 도움.

- **MergePoint `message`에 감성 톤 명시**: MergePoint의 message 필드에 대한 가이드를 타입 주석으로 남겨두면 프롬프트 엔지니어링 시 참고 가능. "위로와 희망을 주는 한 문장"이라는 의도를 공유.
