# Research: 001-prompt-engineering

**Feature**: BE-05 프롬프트 엔지니어링
**Date**: 2026-02-27
**Status**: Complete

## Research Questions & Resolutions

### Q1: Gemini API의 JSON 모드(JSON Mode) 지원 방식

**Question**: Gemini 2.0 Flash에서 구조화된 JSON 출력을 강제하는 가장 효과적인 방법은 무엇인가?

**Findings**:
- Gemini API는 `responseMimeType: "application/json"` 옵션을 통해 JSON 전용 출력 모드를 지원한다.
- `responseSchema`를 사용하여 출력 스키마를 명시적으로 지정할 수 있으나, 복잡한 중첩 구조의 경우 프롬프트 내 JSON 예시와 병행 사용이 더 효과적이다.
- BE-04(Gemini SDK 래퍼)에서 이미 `responseSchema` 또는 `responseMimeType` 설정이 되어 있다고 가정하고, BE-05 프롬프트에서는 System Instruction 내 JSON 예시 및 출력 형식 지시로 보완한다.
- 결론: `lib/prompts.ts`는 Gemini SDK의 JSON 모드 설정을 위한 `responseSchema` 객체와 System Instruction을 모두 내보내야 한다.

### Q2: System Instruction 언어 선택 (영어 vs 한국어)

**Question**: System Instruction을 영어로 작성하는 것이 왜 더 효과적인가?

**Findings**:
- Gemini는 훈련 데이터의 대부분이 영어 기반이므로, System Instruction을 영어로 작성할 때 역할 이해도와 지시 이행 정확도가 높다.
- 콘텐츠 출력(노드 제목, 설명 등)은 User Prompt에서 한국어 응답을 명시적으로 요청하여 분리 관리한다.
- 이 전략(영어 System Instruction + 한국어 User Prompt)은 업계 표준 패턴이다.
- 결론: BE-05 issue spec의 기술 검토 노트와 일치. System Instruction은 영어, User Prompt에서 한국어 강제.

### Q3: Few-shot 예시 크기와 효과성

**Question**: Few-shot 예시를 몇 개 포함해야 하고, 어떤 구조여야 하는가?

**Findings**:
- 합류점(Merge Point)은 Gemini가 자연스럽게 추론하기 어려운 커스텀 개념이므로, Few-shot 예시가 필수적이다.
- 1개의 완전한 예시(3경로, 1개 합류점 포함)가 2개의 부분적 예시보다 더 효과적이다 (연구 결과: 품질 > 수량).
- Few-shot 예시의 노드는 실제 서비스와 동일한 스키마를 따라야 한다.
- 초기 버전 1.0.0에서는 "소프트웨어 엔지니어 되기" 같은 일반적인 목표를 예시로 사용한다.
- 결론: 1개의 완전한 한국어 Few-shot 예시 포함. 예시는 "소프트웨어 엔지니어 되기" 목표, Fast/Deep/Explorer 3경로, 1개 합류점 구조.

### Q4: monthsFromNow 단조 증가 강제 방법

**Question**: Gemini가 monthsFromNow를 단조 증가 방식으로 생성하도록 강제하는 최선의 방법은?

**Findings**:
- System Instruction에 규칙을 명시하는 것만으로는 때때로 위반이 발생한다.
- User Prompt에도 동일한 규칙을 반복하면 준수율이 높아진다 (dual reinforcement 기법).
- Few-shot 예시에서 올바른 단조 증가 예시를 보여주는 것이 가장 효과적이다.
- 결론: System Instruction + User Prompt 두 곳에 규칙 명시 + Few-shot에서 올바른 예시 제공.

### Q5: 경로 유형 명칭 (Fast/Deep/Risk vs Fast/Deep/Explorer)

**Question**: 경로 ID를 "fast/deep/risk"로 할지 "fast/deep/explorer"로 할지?

**Findings**:
- docs/04-backend-spec.md의 "Gemini 프롬프트 전략" 섹션에서 "Fast Track", "Deep Dive", "Explorer" 명칭 사용.
- 같은 문서의 PathMap 응답 JSON 구조 예시에서 경로 ID로 "fast|deep|explorer" 사용.
- docs/issues/phase-1/BE-05-prompt-engineering.md에서 "Fast Track", "Deep Dive", "Risk Path" 명칭과 각각 4~5, 5~6, 4~5 노드 수 명시.
- docs/02-product-spec.md에서 "2-1: Fast/Deep/Risk" 명칭 사용.
- 결론: BE-05 issue spec을 우선 따라 "fast", "deep", "explorer" ID 사용 (Risk Path = Explorer로 통일). 노드 수: Fast 4~5개, Deep 5~6개, Explorer(Risk) 4~5개.

### Q6: 프롬프트 버전 관리 전략

**Question**: `lib/prompts.ts`에서 프롬프트 버전을 어떻게 관리해야 하는가?

**Findings**:
- 시맨틱 버전(SemVer) 형식이 표준적이며 변경의 의미를 명확히 전달한다.
- JSDoc `@version`, `@changelog` 태그를 파일 상단에 배치하여 IDE에서 즉시 확인 가능.
- 변경 이력은 파일 내 주석으로 관리하고, 대규모 변경 시 별도 `prompts.v{N}.ts` 파일 보존 전략 채택.
- 결론: `PROMPT_VERSION = "1.0.0"` 상수 내보내기 + 파일 상단 JSDoc changelog 블록.

### Q7: Gemini 응답 유효성 검증 책임 분리

**Question**: 유효하지 않은 JSON 응답에 대한 처리를 BE-05에서 담당해야 하는가?

**Findings**:
- BE-04(Gemini SDK 래퍼)가 이미 재시도 로직과 에러 핸들링을 담당한다.
- BE-05는 프롬프트 품질을 통해 유효하지 않은 응답의 발생 가능성 자체를 최소화하는 역할이다.
- JSON 유효성 검증(`PathMap` 스키마 검증)은 BE-06(경로 시뮬레이션 API)에서 Zod 등으로 수행한다.
- 결론: BE-05 범위에서 JSON 파싱/검증 제외. 프롬프트를 통한 예방에 집중.

## Technology Stack Confirmed

```yaml
Language: TypeScript (Next.js 14+ App Router)
AI Model: Gemini 2.0 Flash
Framework: Next.js API Routes
File Location: lib/prompts.ts
Dependencies:
  - @google/generative-ai (BE-04에서 설치됨)
  - 공유 TypeScript 타입 (BE-02에서 정의됨)
Testing: Jest / Vitest (선택사항, 기본 단위 테스트)
```

## Key Implementation Decisions

1. **파일 구조**: 단일 `lib/prompts.ts` 파일에 System Instruction 상수, User Prompt 생성 함수, JSON 스키마, Few-shot 예시, 버전 상수 모두 포함.
2. **내보내기 전략**: 명명된 내보내기(named exports) 사용. BE-06에서 `import { SYSTEM_INSTRUCTION, buildUserPrompt, PROMPT_VERSION } from '@/lib/prompts'`로 가져올 수 있도록.
3. **Few-shot 통합**: User Prompt 생성 함수 내 Few-shot 예시 포함 (System Instruction에 JSON 스키마 정의, User Prompt 함수에 Few-shot 예시 + 실제 요청).
4. **타임프레임 처리**: `"1y"` → 12개월, `"3y"` → 36개월, `"5y"` → 60개월 매핑 포함.
