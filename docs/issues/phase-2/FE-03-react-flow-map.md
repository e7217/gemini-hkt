# [FE-03] React Flow 캔버스 + 커스텀 노드 구현

## 개요
- **Phase**: Phase 2 (핵심 구현, 1:30~3:00)
- **담당**: frontend-dev
- **예상 시간**: 90m
- **난이도**: 높음
- **상태**: done

## 의존성
- **선행 작업**:
  - [BE-01] 프로젝트 초기 세팅
  - [BE-02] 공유 TypeScript 타입 정의
  - [BE-06] 경로 시뮬레이션 API
  - [FE-02] 다크 테마 기본 + 트랙별 색상 체계
- **후행 작업**:
  - [FE-04] 노드 클릭 상세 패널 + 트랙 하이라이트
  - [FE-05] 타임라인 슬라이더

## 구현 범위
1. **React Flow 캔버스 기본** (C-1):
   - 줌, 팬, fitView 기능
   - `'use client'` 지시어 필수
   - dynamic import (ssr: false) 설정
2. **커스텀 노드 컴포넌트 4종**:
   - **시작 노드** (C-2): 원형 + 펄스 CSS 애니메이션
   - **일반 스텝 노드** (C-3): 둥근 사각형 + 트랙별 색상(금/파랑/보라) + 글로우
   - **목표 노드** (C-4): 별/스타 형태 + 강한 글로우 효과
   - **합류점 노드** (C-5): 큰 원형 + 다색 그라데이션 + ◆ 특별 디자인(3-4)
3. **커스텀 엣지** (C-6):
   - 트랙 색상 구분 라인
   - 적절한 곡률 (smoothstep 또는 bezier)
4. **dagre 수직 레이아웃** (C-7):
   - 하단(시작) → 상단(목표) 방향: `rankdir: 'BT'` (Bottom-to-Top)
   - 커스텀 노드별 width/height를 dagre에 전달
   - nodesep, ranksep 적절한 간격 설정
5. **데이터 변환 유틸** (C-8):
   - PathMap → React Flow nodes/edges 변환 함수
   - 노드 타입 자동 결정 (시작/일반/합류/목표)
   - 엣지 생성 로직 (같은 경로 내 순차 연결 + 합류점 연결)
6. **3경로 색상 구분** (3-3):
   - Fast Track: 금색 노드/엣지
   - Deep Dive: 파란색 노드/엣지
   - Risk Path: 보라색 노드/엣지

## 기술 요구사항
- **패키지**: `@xyflow/react` v12 (구버전 `reactflow` 아님)
- **레이아웃**: `@dagrejs/dagre` 패키지
- **파일 위치**: `components/PathMap/`, `components/nodes/`, `lib/graphUtils.ts`
- **참조 스펙**: 03-frontend-spec.md C-1~C-8, 노드 타입별 디자인 섹션
- 애니메이션은 CSS transition/keyframes 사용 (Framer Motion은 맵 외부에만)
- React Flow 관련 컴포넌트는 반드시 클라이언트 컴포넌트 (`'use client'`)

## 수용 기준 (Acceptance Criteria)
- [ ] React Flow 캔버스가 정상 렌더링 (줌/팬/fitView 동작)
- [ ] `'use client'` + dynamic import(ssr: false) 설정 완료
- [ ] 시작 노드 펄스 애니메이션 동작
- [ ] 일반 스텝 노드 트랙별 색상 구분 표시
- [ ] 목표 노드 글로우 효과 표시
- [ ] 합류점 노드 다색 그라데이션 표시
- [ ] dagre 레이아웃으로 Bottom-to-Top 수직 배치
- [ ] PathMap 데이터 → React Flow 노드/엣지 변환 정상 동작
- [ ] 3경로가 시각적으로 구분되어 표시

## 참조 문서
- `/docs/03-frontend-spec.md` - C. 경로 맵 핵심 (C-1~C-8), 노드 타입별 디자인 섹션
- `/docs/03-frontend-spec.md` - 3-3: 3경로 색상/아이콘 구분, 3-4: 합류점 특별 디자인
- `/docs/01-ideas.md` - C1: 상향식 나무 인터페이스

## 기술 검토 노트
- **핵심 주의**: `@xyflow/react` v12를 사용해야 함. 구버전 `reactflow` 패키지와 API가 다름
- **SSR 방지 필수**: React Flow는 브라우저 API에 의존하므로, `'use client'` 지시어와 `dynamic(() => import(...), { ssr: false })` 패턴 필수
- **dagre 설정**: `@dagrejs/dagre` 패키지 사용. `rankdir: 'BT'`로 Bottom-to-Top 배치. 커스텀 노드별로 실제 width/height를 dagre에 전달해야 레이아웃이 겹치지 않음
- **애니메이션 전략**: 맵 내부 노드/엣지 애니메이션은 CSS transition/keyframes로 구현. Framer Motion은 맵 외부 UI(패널, 슬라이더 등)에만 사용 가능
- Phase 2 핵심 작업으로, 전체 데모의 시각적 임팩트를 결정하는 가장 중요한 작업
- 피벗 플랜: 3:00 시점에 맵 시각화 난항 시 React Flow 포기 → CSS div 기반 정적 맵 대체

---

## 아이디어 뱅크 제안

- **노드 "타이핑" 효과**: 노드가 생성될 때 제목이 한 글자씩 타이핑되는 CSS 애니메이션. `@keyframes typing` + `steps()` 함수로 10줄 이내 구현. 정적 텍스트 대비 "나무가 자라나는" 생동감이 크게 높아짐.

- **합류점 "파문" 효과**: 합류점 노드에 물결이 퍼져나가는 CSS 리플 애니메이션. `@keyframes ripple`로 2~3개 원이 동심원으로 퍼짐. 합류의 감동적 순간을 시각적으로 강조. 데모 ACT 3 "어떤 길이든 괜찮다"와 시너지.

- **"경로 따라가기" 자동 스크롤**: 경로를 선택하면 시작 노드부터 목표 노드까지 카메라가 자동으로 천천히 따라 올라가는 기능. React Flow의 `setCenter`/`fitBounds`를 `setTimeout`으로 순차 호출. 데모에서 "나무를 따라 올라가는" 체험을 자동으로 보여줄 수 있음.

- **경로 선택 시 "나머지 서서히 사라짐" 효과**: 기존 D-2(트랙 하이라이트)에 CSS `transition: opacity 0.5s ease`만 추가하면, 선택 경로만 빛나고 나머지가 서서히 페이드되는 우아한 효과. 코드 1줄 수준.

- **노드에 이모지 표시**: BE-02에서 제안한 `emoji` 필드가 있다면, 커스텀 노드 컴포넌트에서 제목 옆에 이모지를 표시. 시각적 다양성과 재미를 한 번에 확보.
