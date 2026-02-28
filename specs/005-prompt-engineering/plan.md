# Implementation Plan: BE-05 프롬프트 엔지니어링

**Branch**: `001-prompt-engineering` | **Date**: 2026-02-27 | **Spec**: specs/001-prompt-engineering/spec.md
**Input**: Feature specification from `/specs/001-prompt-engineering/spec.md`

## Summary

`lib/prompts.ts` 파일에 LifePath 경로 생성을 위한 Gemini 프롬프트 엔지니어링 모듈을 구현한다. 이 모듈은 영어로 작성된 System Instruction(인생 경로 시뮬레이터 역할, JSON 출력 형식, 합류점 생성 규칙 포함), 목표와 타임프레임을 받는 User Prompt 생성 함수(`buildUserPrompt`), PathMap 인터페이스와 일치하는 JSON 스키마, Few-shot 예시(합류점 구조 포함), 그리고 시맨틱 버전 관리 상수를 내보낸다.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 14+ App Router)
**Primary Dependencies**: `@google/generative-ai` (BE-04에서 설치됨), 공유 타입 (BE-02에서 정의됨)
**Storage**: N/A (프롬프트는 정적 모듈, 데이터 지속성 없음)
**Testing**: Jest / Vitest (선택적 단위 테스트)
**Target Platform**: Node.js 18+ (Vercel 서버리스 환경)
**Project Type**: TypeScript 라이브러리 모듈 (Next.js 프로젝트 내)
**Performance Goals**: 프롬프트 생성 자체는 즉시(< 1ms). Gemini API 응답 시간은 BE-06 범위.
**Constraints**: 프롬프트 토큰 수 최소화 (Gemini Flash 컨텍스트 한계 고려), Few-shot 예시 포함 시에도 합리적 토큰 사용
**Scale/Scope**: 단일 파일 (`lib/prompts.ts`), 4-5개 내보내기 심벌

## Constitution Check

*CONSTITUTION_AVAILABLE = false - Constitution Check 건너뜀*

Constitution 파일이 `.specify/memory/constitution.md`에 존재하지 않으므로 이 단계를 건너뜁니다.

## Project Structure

### Documentation (this feature)

```text
specs/001-prompt-engineering/
├── plan.md              # This file
├── research.md          # Phase 0 output (완료)
├── data-model.md        # Phase 1 output (완료)
├── quickstart.md        # Phase 1 output (완료)
├── contracts/
│   └── prompts-module.md  # Phase 1 output (완료)
├── checklists/
│   └── requirements.md  # Phase 1 output (완료)
└── tasks.md             # Phase 2 output (다음 단계)
```

### Source Code (repository root)

```text
lib/
└── prompts.ts           # 이 기능의 구현 대상 파일 (단일 파일)

# 참조 파일 (수정 없음, BE-02에서 생성됨)
lib/
└── types.ts             # 또는 types/index.ts (PathMap, PathNode, MergePoint, Path 인터페이스)

# 참조 파일 (수정 없음, BE-04에서 생성됨)
lib/
└── gemini.ts            # 또는 utils/gemini.ts (Gemini 클라이언트 초기화)
```

**Structure Decision**: Next.js 모노리스 구조 (`lib/` 디렉토리). BE-05는 `lib/prompts.ts` 단일 파일만 생성. 테스트는 선택적으로 `lib/__tests__/prompts.test.ts` 또는 `__tests__/lib/prompts.test.ts`.

## Implementation Phases

### Phase 0: Research (완료)

- [x] Gemini JSON 모드 동작 방식 확인
- [x] System Instruction 영어 작성의 효과성 검증
- [x] Few-shot 최적 수량 결정 (1개)
- [x] monthsFromNow 단조 증가 강제 전략 결정
- [x] 경로 ID 명칭 통일 (fast/deep/explorer)
- [x] 프롬프트 버전 관리 전략 결정 (시맨틱 버전)
- [x] 유효성 검증 책임 분리 확인 (BE-04/BE-06 범위)

### Phase 1: Design (완료)

- [x] `data-model.md`: JSON 스키마 정의, TypeScript 인터페이스 매핑, 모듈 구조 설계
- [x] `contracts/prompts-module.md`: 내보내기 계약, 사용 예시, 버전 히스토리
- [x] `quickstart.md`: 구현 가이드, 검증 방법, 참조 문서

### Phase 2: Tasks (다음 단계)

tasks.md에서 상세 구현 태스크 정의 예정.

**핵심 구현 태스크**:
1. `lib/prompts.ts` 파일 생성 및 기본 구조(버전, 타임프레임 매핑) 작성
2. System Instruction 작성 (영어, 역할/규칙/형식 포함)
3. JSON 스키마(`PATH_MAP_SCHEMA`) 정의
4. Few-shot 예시 작성 (합류점 포함 완전한 예시)
5. `buildUserPrompt` 함수 구현
6. 내보내기 확인 및 TypeScript 타입 체크
7. 선택적: 프롬프트 품질 단위 테스트

## Key Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Few-shot 예시가 합류점을 충분히 시연하지 못함 | 중간 | 높음 | 구체적이고 완전한 예시(3경로+1합류점) 필수 |
| monthsFromNow 단조 증가 위반 | 중간 | 중간 | System Instruction + User Prompt 이중 강제 |
| 한국어 출력 미준수 | 낮음 | 높음 | "반드시 한국어" 명시 + Few-shot 예시를 한국어로 작성 |
| JSON 스키마와 TypeScript 타입 불일치 | 낮음 | 높음 | data-model.md 스키마 기반 수작업 검증 |
| 프롬프트 토큰 과다 | 낮음 | 낮음 | Few-shot 예시 간결하게 유지 |

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| BE-02 공유 TypeScript 타입 | Hard prerequisite | 완료 필요 |
| BE-04 Gemini SDK 세팅 | Hard prerequisite | 완료 필요 |
| BE-06 경로 시뮬레이션 API | Downstream consumer | BE-05 완료 후 시작 가능 |
