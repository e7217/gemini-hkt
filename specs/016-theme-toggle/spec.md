# Feature Specification: Theme Toggle & Light Mode Color Scheme

**Feature Branch**: `016-theme-toggle`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User description: "라이트 모드/다크 모드 테마 전환(토글) 기능 추가 및 라이트 모드 색상 체계 구현"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 테마 토글 버튼 (Priority: P1)

사용자는 화면의 테마 토글 버튼을 클릭하여 라이트 모드와 다크 모드 간에 즉시 전환할 수 있어야 한다.

**Why this priority**: 라이트 모드 색상 체계를 확인하고 사용할 수 있는 진입점 역할을 하므로 가장 중요하다.

**Independent Test**: 토글 버튼 클릭 시 `<html>` 태그의 `class` 속성에 `dark`가 추가/제거되는지 확인한다.

**Acceptance Scenarios**:
1. **Given** 현재 다크 모드일 때, **When** 테마 토글 버튼을 클릭하면, **Then** 화면이 라이트 모드로 변경된다.
2. **Given** 현재 라이트 모드일 때, **When** 테마 토글 버튼을 클릭하면, **Then** 화면이 다크 모드로 변경된다.

---

### User Story 2 - 라이트 모드 색상 체계 적용 (React Flow 및 UI) (Priority: P1)

사용자가 라이트 모드를 선택했을 때, 일반 UI 요소뿐만 아니라 React Flow의 캔버스, 노드, 엣지가 라이트 모드에 최적화된 색상(배경, 텍스트, 보더 등)으로 자연스럽게 표시되어야 한다.

**Why this priority**: 기존 다크 모드 중심의 UI에서 라이트 모드를 제공하려면 가독성과 심미성을 보장하는 색상 체계가 필수적이다.

**Independent Test**: 테마를 라이트 모드로 설정한 후 노드의 텍스트 가독성, 배경색상, 엣지 색상이 정상적으로 보이는지 시각적으로 확인한다.

**Acceptance Scenarios**:
1. **Given** 테마가 라이트 모드일 때, **When** 경로 맵을 확인하면, **Then** 캔버스 배경이 밝은 색상으로 표시된다.
2. **Given** 테마가 라이트 모드일 때, **When** 노드를 확인하면, **Then** 노드 텍스트와 배경이 라이트 테마 색상 변수를 사용하여 명확하게 렌더링된다.

---

### User Story 3 - 시스템 테마 기본 적용 (Priority: P2)

사용자가 테마를 명시적으로 설정하지 않은 경우, 사용자의 OS 또는 브라우저의 시스템 테마 설정(prefers-color-scheme)을 기본으로 따른다.

**Why this priority**: 사용자 경험(UX) 개선을 위해 기본적으로 선호하는 테마를 자동으로 적용하는 것이 좋다.

**Independent Test**: 로컬 스토리지를 초기화하고 OS 테마를 변경했을 때 앱의 초기 테마가 동기화되는지 확인한다.

**Acceptance Scenarios**:
1. **Given** 사용자의 시스템 테마가 라이트 모드이고 로컬 스토리지에 테마 설정이 없을 때, **When** 앱에 접속하면, **Then** 라이트 모드가 기본으로 적용된다.

### Edge Cases

- 사용자가 여러 탭을 열어둔 상태에서 한 탭에서 테마를 변경했을 때 다른 탭에 즉각 반영되는가? (next-themes가 기본 지원)
- 라이트 모드에서 커스텀 노드의 색상(예: 글로우 효과, 특정 트랙 색상)이 가독성을 해치지 않는가?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST 라이트/다크/시스템 테마 전환이 가능한 토글 버튼(또는 드롭다운)을 제공해야 한다.
- **FR-002**: System MUST `next-themes`를 이용하여 현재 테마 상태를 관리하고 로컬 스토리지에 유지해야 한다.
- **FR-003**: System MUST 라이트 모드 활성화 시 React Flow 캔버스 배경 및 기본 컨트롤(미니맵 등)을 라이트 모드에 맞게 스타일링해야 한다.
- **FR-004**: System MUST 커스텀 노드(Start, Step, Goal, Merge)의 배경, 테두리, 텍스트 색상을 현재 테마(`useTheme`)에 따라 동적으로 변경하거나 CSS 변수를 사용해 대응해야 한다.

### Key Entities

- **Theme State**: `light`, `dark`, `system` 중 하나의 값을 가지는 상태.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 테마 토글 버튼 클릭 시 100ms 이내에 전체 UI(React Flow 포함)의 색상 테마가 전환되어야 한다.
- **SC-002**: 라이트 모드에서 노드의 텍스트 가독성(WCAG 대비율 기준)이 최소 AA 등급(4.5:1)을 만족해야 한다.
