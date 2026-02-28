# Feature Specification: BE-05 프롬프트 엔지니어링

**Feature Branch**: `001-prompt-engineering`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "BE-05 프롬프트 엔지니어링: System Instruction 정의(영어, 인생 경로 시뮬레이터 역할, JSON 출력 형식, 합류점 규칙), User Prompt 템플릿(한국어 목표 포함), 응답 JSON 스키마, 프롬프트 버전 관리"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Instruction 정의 및 경로 생성 (Priority: P1)

백엔드 개발자가 `lib/prompts.ts`에 정의된 System Instruction과 User Prompt 템플릿을 사용하여 Gemini API를 호출하면, LifePath 서비스의 목표(예: "풀스택 개발자 되기")에 대한 3가지 경로(Fast Track, Deep Dive, Risk Path)와 최소 1개 이상의 합류점(Merge Point)이 포함된 유효한 PathMap JSON 구조를 반환받는다.

**Why this priority**: 이 기능은 BE-06 경로 시뮬레이션 API의 직접적인 선행 요건이며, LifePath 서비스의 핵심 가치(AI 기반 다중 경로 생성)를 결정짓는 가장 중요한 백엔드 기반 작업이다. 프롬프트 품질이 전체 서비스 품질을 결정한다.

**Independent Test**: `lib/prompts.ts`에서 내보낸 `generatePathsSystemInstruction`과 `generatePathsUserPrompt(goal, timeframe)` 함수를 직접 사용하여 Gemini API를 호출하고, 반환된 JSON이 PathMap 스키마를 만족하는지 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** Gemini SDK가 초기화되어 있고, **When** `generatePathsUserPrompt("풀스택 개발자 되기", "3y")`로 생성된 프롬프트로 Gemini API를 호출하면, **Then** `paths` 배열에 3개의 경로(id: "fast", "deep", "explorer")가 포함된 유효한 PathMap JSON이 반환된다.
2. **Given** 유효한 프롬프트로 Gemini를 호출할 때, **When** 응답 JSON을 파싱하면, **Then** `mergePoints` 배열에 최소 1개 이상의 합류점이 포함되며, 각 합류점의 `connectedPaths`에 연결된 경로 ID 목록이 명시된다.
3. **Given** 생성된 경로 노드들을 검사할 때, **When** 각 경로의 노드 `monthsFromNow` 값을 확인하면, **Then** 각 경로 내에서 값이 단조 증가(monotonically increasing)한다.

---

### User Story 2 - 한국어 출력 강제 및 User Prompt 템플릿 (Priority: P2)

한국어 목표를 입력했을 때, Gemini가 노드 제목, 설명, 팁 등 모든 콘텐츠 필드를 한국어로 반환한다. User Prompt 템플릿은 목표 텍스트와 타임프레임을 받아 동적으로 생성되며, 한국어 응답을 명시적으로 강제한다.

**Why this priority**: LifePath 서비스의 주요 사용자는 한국어 사용자이며, 데모 시 한국어 콘텐츠 출력이 필수다. User Prompt에 한국어 응답 지시를 명시하지 않으면 Gemini가 영어로 응답하는 경우가 발생한다.

**Independent Test**: 한국어 목표("카페 창업하기")를 입력하고 생성된 PathMap에서 `paths[0].nodes[0].title`, `paths[0].nodes[0].description`, `paths[0].nodes[0].tips[0]`이 모두 한국어인지 검증한다.

**Acceptance Scenarios**:

1. **Given** 한국어 목표 텍스트가 주어졌을 때, **When** 생성된 User Prompt로 Gemini를 호출하면, **Then** 응답 JSON의 모든 콘텐츠 필드(title, description, tips, message)가 한국어로 작성된다.
2. **Given** `generatePathsUserPrompt(goal, timeframe)` 함수에 목표와 타임프레임이 주어졌을 때, **When** 생성된 프롬프트 문자열을 확인하면, **Then** 목표 텍스트, 타임프레임 정보, "반드시 한국어로 응답하세요" 지시가 포함된다.
3. **Given** 타임프레임으로 "1y", "3y", "5y" 중 하나가 주어졌을 때, **When** 프롬프트가 생성되면, **Then** 해당 타임프레임에 맞는 `monthsFromNow` 범위 지시가 프롬프트에 반영된다.

---

### User Story 3 - JSON 스키마 정의 및 PathMap 일치 검증 (Priority: P3)

`lib/prompts.ts`에 정의된 JSON 스키마 또는 응답 형식 지시가 `PathMap` TypeScript 인터페이스(BE-02에서 정의)와 정확히 일치하여, Gemini가 반환하는 JSON을 별도 변환 없이 `PathMap` 타입으로 바로 사용할 수 있다.

**Why this priority**: JSON 스키마와 TypeScript 타입의 불일치는 런타임 오류나 데이터 손실을 유발하여 BE-06 API 구현을 어렵게 만든다. 스키마 정확성은 선행 작업으로 확정되어야 한다.

**Independent Test**: Gemini가 반환한 JSON을 `PathMap` 타입으로 파싱하고, `startNode`, `goalNode`, `paths`, `mergePoints` 필드가 모두 존재하며 각 하위 필드의 타입이 일치하는지 단위 테스트로 검증한다.

**Acceptance Scenarios**:

1. **Given** Gemini API 응답 JSON이 파싱되었을 때, **When** `PathMap` 인터페이스로 타입 캐스팅하면, **Then** `startNode`, `goalNode`, `paths[]`, `mergePoints[]` 필드가 모두 존재하고 타입 오류 없이 접근할 수 있다.
2. **Given** 경로 노드를 검사할 때, **When** `PathNode` 인터페이스의 필수 필드 목록(`id`, `title`, `description`, `duration`, `difficulty`, `isMergePoint`, `tips`, `monthsFromNow`)을 확인하면, **Then** 모든 노드에 해당 필드가 존재하고 타입이 일치한다.
3. **Given** `difficulty` 필드를 확인할 때, **When** 각 노드의 값을 검사하면, **Then** 값이 `"Low"`, `"Medium"`, `"High"` 중 하나다.

---

### User Story 4 - Few-shot 예시 및 합류점 생성 품질 (Priority: P4)

프롬프트에 포함된 Few-shot 예시(1~2개)가 올바른 합류점 구조를 보여주어, Gemini가 실제 요청에서도 `isMergePoint: true`인 노드와 `mergePoints` 배열을 올바르게 생성한다.

**Why this priority**: 합류점(Merge Point)은 LifePath의 핵심 감성 경험("어떤 길이든 괜찮다")을 전달하는 데 필수적이지만, Few-shot 없이는 Gemini가 이 구조를 정확히 생성하지 못할 가능성이 높다.

**Independent Test**: Few-shot 예시가 없는 기본 프롬프트와 Few-shot이 포함된 프롬프트로 각각 Gemini를 호출하여, 후자에서 합류점 생성률이 높은지 비교 검증한다.

**Acceptance Scenarios**:

1. **Given** Few-shot 예시가 포함된 프롬프트로 Gemini를 호출할 때, **When** 응답 JSON의 `mergePoints`를 확인하면, **Then** 최소 1개의 합류점이 존재하고 `connectedPaths`가 2개 이상의 경로 ID를 참조한다.
2. **Given** 생성된 경로의 노드들을 검사할 때, **When** `isMergePoint: true`인 노드를 찾으면, **Then** 해당 노드의 ID가 `mergePoints` 배열에서 참조된다.
3. **Given** 합류점 노드의 `message` 필드를 확인할 때, **When** 내용을 검사하면, **Then** 사용자에게 위로와 희망을 주는 한국어 한 문장이 포함된다.

---

### User Story 5 - 프롬프트 버전 관리 (Priority: P5)

`lib/prompts.ts`에 현재 사용 중인 프롬프트의 버전 정보(버전 번호, 변경 이력)가 상수로 정의되어 있어, 향후 프롬프트 개선 시 이전 버전과 비교하고 추적할 수 있다.

**Why this priority**: 프롬프트는 서비스 운영 중 반복 개선이 필요한 핵심 자산이다. 버전 관리 없이는 변경사항 추적과 롤백이 어렵다.

**Independent Test**: `PROMPT_VERSION` 상수가 내보내기되어 있고 현재 버전 번호(예: "1.0.0")와 변경 이력 주석이 파일 상단에 존재하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** `lib/prompts.ts` 파일을 검사할 때, **When** 파일 상단을 확인하면, **Then** `PROMPT_VERSION` 상수와 버전 변경 이력 주석이 존재한다.
2. **Given** 프롬프트를 개선할 때, **When** 새 버전으로 업데이트하면, **Then** 이전 버전의 내용이 주석으로 보존되거나 변경 이력에 기록된다.

---

### Edge Cases

- 목표 텍스트가 매우 짧거나(1~2단어) 모호할 때, Gemini가 유효한 PathMap을 생성하는가?
- 목표 텍스트에 특수문자나 이모지가 포함될 때 프롬프트가 올바르게 전달되는가?
- Gemini가 `mergePoints` 배열을 비어 있게 반환할 때, 시스템이 이를 어떻게 처리하는가? [AUTO: JSON 유효성 검증 및 재시도는 BE-04 Gemini SDK 래퍼 범위로 분리 - 관심사 분리 원칙]
- `monthsFromNow`가 단조 증가 규칙을 위반한 응답을 Gemini가 반환할 때, 이를 감지하고 처리하는 메커니즘이 있는가?
- 타임프레임 "1y"로 요청했을 때 노드의 `monthsFromNow` 값이 12를 초과하지 않는가?
- `difficulty` 값이 스키마에 정의되지 않은 값(예: "Very High")으로 반환될 때 어떻게 처리하는가?
- System Instruction이 Gemini의 최대 토큰 한계에 영향을 미치는가?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 `lib/prompts.ts` 파일에 영어로 작성된 System Instruction을 정의해야 한다. System Instruction에는 (a) 인생 경로 시뮬레이터 역할 부여, (b) JSON 전용 출력 형식 명시, (c) 합류점 생성 규칙 명시, (d) 경로 유형(Fast Track 4~5개 노드, Deep Dive 5~6개 노드, Risk Path 4~5개 노드) 명시가 포함되어야 한다.
- **FR-002**: 시스템은 목표 텍스트와 타임프레임을 매개변수로 받는 User Prompt 생성 함수(`generatePathsUserPrompt(goal: string, timeframe: string)`)를 제공해야 한다. 생성된 프롬프트는 반드시 한국어 응답을 명시적으로 요청해야 한다.
- **FR-003**: 시스템은 `PathMap` TypeScript 인터페이스와 일치하는 JSON 응답 스키마를 프롬프트 내에 정의해야 한다. 스키마는 `startNode`, `goalNode`, `paths[]`, `mergePoints[]` 구조를 포함해야 한다.
- **FR-004**: 프롬프트는 합류점이 포함된 Few-shot 예시를 최소 1개 포함해야 한다 (초기 버전 1.0.0). 예시에는 `isMergePoint: true`인 노드와 `mergePoints` 배열 구조가 올바르게 표현되어야 한다. [AUTO: 초기 버전 1개 Few-shot 자동 선택 - 최소 유효 접근법]
- **FR-005**: 프롬프트는 각 경로 내 노드의 `monthsFromNow` 값이 단조 증가(monotonically increasing)해야 함을 명시해야 한다.
- **FR-006**: 시스템은 합류점 규칙을 명시해야 한다: 최소 1~2개의 합류점, `isMergePoint: true` 설정, `connectedPaths`에 연결 경로 ID 목록 포함.
- **FR-007**: `lib/prompts.ts`는 `PROMPT_VERSION` 상수를 내보내야 하며, 형식은 시맨틱 버전(예: `"1.0.0"`)을 따른다. 파일 상단에 `/** CHANGELOG */` 형태의 JSDoc 블록으로 버전 변경 이력을 관리한다. [AUTO: 시맨틱 버전 형식 자동 선택 - 표준 유지보수 관행]
- **FR-008**: `generatePathsSystemInstruction` 또는 동등한 상수/함수가 내보내져야 하며, BE-06(경로 시뮬레이션 API)에서 재사용 가능해야 한다.
- **FR-009**: 경로 유형은 id로 `"fast"`, `"deep"`, `"explorer"` 세 가지를 지원해야 하며, 각각 Fast Track, Deep Dive, Risk Path에 대응한다.
- **FR-010**: 합류점의 `message` 필드에는 사용자에게 위로와 희망을 주는 감성적 한국어 문장이 생성되도록 프롬프트에 지시가 포함되어야 한다.

### Key Entities

- **SystemInstruction**: Gemini에 전달되는 역할 및 출력 형식 지시문. 영어로 작성. 역할(인생 경로 시뮬레이터), 출력 형식(JSON only), 합류점 규칙, 경로 유형별 노드 수 규칙 포함.
- **UserPromptTemplate**: 목표와 타임프레임을 받아 동적 생성되는 사용자 프롬프트. 한국어 응답 강제, 타임프레임 범위 지시, Few-shot 예시 포함.
- **PathMapJsonSchema**: Gemini 응답이 따라야 하는 JSON 구조 정의. `PathMap` TypeScript 인터페이스와 1:1 대응.
- **PromptVersion**: 프롬프트 버전 정보 상수. 현재 버전 번호와 변경 이력 관리.
- **PathMap**: 경로 맵 전체 구조 (`startNode`, `goalNode`, `paths[]`, `mergePoints[]`). BE-02에서 정의된 TypeScript 인터페이스.
- **PathNode**: 개별 경로 노드 (`id`, `title`, `description`, `duration`, `difficulty`, `isMergePoint`, `tips[]`, `monthsFromNow`).
- **MergePoint**: 합류점 구조 (`id`, `title`, `connectedPaths[]`, `message`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `lib/prompts.ts`의 System Instruction과 User Prompt 템플릿을 사용하여 Gemini API를 호출했을 때, 유효한 PathMap JSON 응답 성공률이 95% 이상이다.
- **SC-002**: 생성된 PathMap에서 3개의 경로(fast, deep, explorer)가 항상 존재하며, 각각 Fast Track 4~5개, Deep Dive 5~6개, Risk Path 4~5개의 노드를 포함한다.
- **SC-003**: 생성된 PathMap에서 합류점(`mergePoints`)이 최소 1개 이상 존재하는 비율이 90% 이상이다.
- **SC-004**: 모든 노드의 `monthsFromNow` 값이 각 경로 내에서 단조 증가하는 비율이 100%다.
- **SC-005**: 한국어 목표 입력 시 생성된 PathMap의 모든 콘텐츠 필드(title, description, tips, message)가 한국어로 반환되는 비율이 95% 이상이다.
- **SC-006**: Gemini 응답 JSON이 `PathMap` TypeScript 인터페이스와 일치하여 별도 변환 없이 사용 가능한 비율이 95% 이상이다.
- **SC-007**: `PROMPT_VERSION` 상수와 변경 이력이 `lib/prompts.ts` 파일에 존재한다.
