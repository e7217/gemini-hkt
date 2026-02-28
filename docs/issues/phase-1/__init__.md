# Phase 1 (로켓 발사, 0:00~1:30) 문서 인덱스

**목표**: CP1 달성 — "입력 → Gemini → JSON 콘솔 출력" 확인

## 백엔드 (7개)

| 문서 | 담당 | 요약 |
|------|------|------|
| [BE-01-project-setup.md](./BE-01-project-setup.md) | backend-dev | Next.js 14+ / TypeScript / Tailwind / shadcn/ui / React Flow / Zustand 프로젝트 초기 세팅 |
| [BE-02-shared-types.md](./BE-02-shared-types.md) | backend-dev | PathNode, Path, MergePoint, PathMap 등 프론트/백 공유 TypeScript 타입 정의 |
| [BE-03-preset-goals.md](./BE-03-preset-goals.md) | backend-dev | 6개 카테고리 30~50개 프리셋 목표 데이터 및 랜덤 선택 유틸 |
| [BE-04-gemini-sdk.md](./BE-04-gemini-sdk.md) | backend-dev | @google/genai SDK 초기화, 지수 백오프 재시도, 15초 타임아웃, Zod 검증 래퍼 |
| [BE-05-prompt-engineering.md](./BE-05-prompt-engineering.md) | backend-dev | System Instruction(영어) + 한국어 응답 강제, 3경로+합류점 JSON 생성 프롬프트 |
| [BE-06-simulate-api.md](./BE-06-simulate-api.md) | backend-dev | POST /api/paths/simulate 엔드포인트, Zod 검증+재시도+Mock 폴백 체인 |
| [BE-07-mock-fallback.md](./BE-07-mock-fallback.md) | backend-dev | "풀스택 개발자 되기" Mock 데이터 세트, USE_MOCK 전환, API 실패 자동 폴백 |

## 프론트엔드 (2개)

| 문서 | 담당 | 요약 |
|------|------|------|
| [FE-01-goal-input-ui.md](./FE-01-goal-input-ui.md) | frontend-dev | 목표 텍스트 입력 + 랜덤 🎲 버튼 + "경로 생성하기" API 호출 + Zustand 스토어 |
| [FE-02-dark-theme.md](./FE-02-dark-theme.md) | frontend-dev | 다크 테마 기본, 트랙별 색상 체계(금/파랑/보라), 노드 글로우 CSS |
