<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0

Modified Principles: 없음

Added Sections:
- V. TypeScript Strict Typing (신규)
- VI. Fail-Safe & Graceful Degradation (신규)

Removed Sections: 없음

Templates Status:
- ✅ .specify/templates/plan-template.md — Constitution Check 섹션은 /speckit.plan 명령이 런타임에 채움; 구조적 변경 불필요
- ✅ .specify/templates/spec-template.md — 헌법 직접 참조 없음; 변경 불필요
- ✅ .specify/templates/tasks-template.md — 헌법 직접 참조 없음; 변경 불필요

Deferred TODOs: 없음
-->

# LifePath Constitution

## Core Principles

### I. YAGNI & SOLID Principles

코드베이스 내 모든 구현체는 YAGNI(You Aren't Gonna Need It) 및 SOLID 원칙을 반드시 준수해야 한다.

- **YAGNI**: 현재 요구사항에서 실제로 필요한 기능만 구현한다. 미래의 가상 요구사항을 위한
  선제적 추상화, 설정 옵션, 확장 포인트를 추가해서는 안 된다.
- **SRP (단일 책임)**: 클래스와 함수는 단 하나의 변경 이유만 가진다.
- **OCP (개방-폐쇄)**: 확장에는 열려 있고, 수정에는 닫혀 있어야 한다.
- **LSP (리스코프 치환)**: 하위 타입은 상위 타입을 완전히 대체 가능해야 한다.
- **ISP (인터페이스 분리)**: 클라이언트는 사용하지 않는 인터페이스에 의존해서는 안 된다.
- **DIP (의존성 역전)**: 고수준 모듈이 저수준 모듈에 직접 의존해서는 안 된다;
  양쪽 모두 추상화에 의존해야 한다.

**검증 기준**: 모든 PR에서 YAGNI 위반(미사용 코드, 미래 대비 설계) 및 SOLID 위반 여부를
코드 리뷰 시 확인한다.

### II. Abstraction & Class Design

적절한 추상화와 클래스 설계를 적극 활용하여 모듈성과 재사용성을 확보한다.

- 관련 데이터와 행동은 반드시 클래스 또는 인터페이스로 캡슐화한다.
- 도메인 개념은 명시적인 추상 타입(인터페이스, 추상 클래스)으로 표현한다.
- 구체 구현은 추상화 뒤에 숨기고, 의존성 주입을 통해 교체 가능하게 설계한다.
- 단순 데이터 묶음에는 Value Object 또는 Data Class를 사용한다.

**검증 기준**: 도메인 모델은 클래스로 표현되어야 하며, 임의의 딕셔너리/맵 남용은
허용되지 않는다.

### III. Concise Code

코드는 간결하고 명확해야 하며, 불필요한 복잡성을 배제한다.

- 함수는 단일 작업을 수행하며, 20줄을 초과해서는 안 된다
  (합리적 예외는 주석으로 정당화 필요).
- 변수명과 함수명은 의도를 명확히 드러내야 한다.
- 중복 코드(DRY 위반)는 허용되지 않는다; 공통 로직은 반드시 추출한다.
- 주석은 "무엇"이 아닌 "왜"를 설명하는 경우에만 작성한다.

**검증 기준**: 코드 리뷰 시 과도한 함수 길이, 불명확한 네이밍, 중복 로직 여부를 검사한다.

### IV. Nesting Depth Limit

반복문(loop)과 조건문(conditional)의 중첩 깊이는 최대 2단계(depth)로 제한한다.

- 3단계 이상의 중첩이 필요하다면 반드시 해당 로직을 별도 함수 또는 메서드로 추출한다.
- Early return 패턴을 적극 활용하여 조건 중첩을 줄인다.
- 복잡한 반복 로직은 고차 함수(map, filter, reduce 등) 또는 전략 패턴으로 대체를 검토한다.

**검증 기준**: 정적 분석 도구(린터)를 통해 최대 중첩 깊이 2를 자동으로 강제한다.
자동화 불가 시 코드 리뷰에서 수동 확인한다.

### V. TypeScript Strict Typing

모든 TypeScript 코드는 strict 모드에서 타입 오류 없이 컴파일되어야 하며,
`any`의 사용을 금지한다.

- `any` 타입 사용은 허용되지 않는다; 불가피한 경우 `unknown`으로 수신 후
  type guard 또는 타입 단언을 명시적으로 적용한다.
- `PathMap`, `PathNode`, `MergePoint`, `Timeline` 등 도메인 공유 타입은
  단일 정의 파일(single source of truth)에서만 선언하고 재정의하지 않는다.
- API 요청/응답 타입은 반드시 명시적 인터페이스로 정의한다; 인라인 객체 타입 남용은 금지한다.
- 타입 단언(`as`)은 외부 데이터(API 응답, `JSON.parse` 결과) 경계에서만 허용하며,
  내부 코드 간 전달에는 사용할 수 없다.

**검증 기준**: `tsconfig.json`에 `"strict": true`를 설정하고, CI에서 `tsc --noEmit`이
통과해야 PR 병합을 허용한다.

### VI. Fail-Safe & Graceful Degradation

외부 의존성(Gemini API 등) 실패 시 서비스는 반드시 안전하게 복구되어야 하며,
사용자에게 빈 화면이나 크래시를 노출해서는 안 된다.

- Gemini API 호출에는 항상 fallback 경로를 구현해야 한다;
  AI 응답 실패 시 프리셋 데이터로 자동 대체한다.
- 에러는 사용자에게 명확하고 친절한 메시지로 노출한다;
  기술적 오류 메시지를 그대로 노출하는 것은 허용되지 않는다.
- 외부 API 응답 파싱은 방어적으로 수행한다; 스키마 불일치 시 예외를 던지지 않고
  안전한 기본값으로 대체한다.
- 네트워크 오류, 타임아웃, 예외는 모두 명시적으로 catch하고 로깅한다;
  unhandled rejection은 허용되지 않는다.

**검증 기준**: 모든 외부 API 호출 코드에 try-catch 및 fallback 분기가 존재하는지
코드 리뷰 시 확인한다.

## Code Quality Standards

- 린팅 및 정적 분석 도구를 프로젝트에 반드시 구성하며, CI 파이프라인에서 통과가 필수이다.
- 모든 공개 API(public interface)에는 타입 정보가 명시되어야 한다.
- 에러 처리는 도메인 예외 클래스를 통해 명시적으로 수행한다;
  일반 `Error` / `Exception`을 그대로 던지는 행위는 지양한다.
- 테스트 코드도 동일한 원칙(SOLID, YAGNI, 간결성, 중첩 제한)을 준수한다.

## Development Workflow

- 기능 구현 전, 해당 기능이 헌법 원칙에 위반되지 않는지 검토한다(Constitution Check).
- 복잡성 정당화가 필요한 경우 `plan.md`의 Complexity Tracking 테이블에 기록한다.
- 코드 리뷰는 기능 동작 검증과 헌법 원칙 준수 검증을 모두 포함한다.
- 리팩토링은 기능 추가와 분리하여 별도 커밋으로 진행한다.

## Governance

이 헌법은 프로젝트의 모든 코딩 관행보다 우선한다. 원칙 위반 사항이 발견되면 해당 PR은
병합 전 반드시 수정되어야 한다.

**개정 절차**:

1. 개정 제안을 문서로 작성하고 팀의 동의를 구한다.
2. 영향받는 기존 코드에 대한 마이그레이션 계획을 포함한다.
3. 버전 번호를 아래 정책에 따라 갱신한다.
4. `Last Amended` 날짜를 개정일로 업데이트한다.

**버전 정책**:

- **MAJOR**: 기존 원칙의 삭제 또는 호환 불가능한 재정의.
- **MINOR**: 새 원칙 또는 섹션 추가, 실질적 지침 확대.
- **PATCH**: 명확화, 표현 개선, 오탈자 수정.

**준수 검토**: 모든 PR은 이 헌법의 원칙 준수 여부를 확인하는 Constitution Check를
통과해야 한다.

**Version**: 1.1.0 | **Ratified**: 2026-02-27 | **Last Amended**: 2026-02-27
