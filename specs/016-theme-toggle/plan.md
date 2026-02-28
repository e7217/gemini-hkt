# Implementation Plan: Theme Toggle & Light Mode Color Scheme

**Branch**: `016-theme-toggle` | **Date**: 2026-02-28 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/016-theme-toggle/spec.md`

## Summary

라이트/다크 모드 전환 기능과 라이트 모드 전용 색상 체계를 구현한다. `next-themes`를 활용하여 테마 상태를 관리하고, Tailwind CSS 변수 및 React Flow 커스텀 노드에 라이트 모드 색상 팔레트를 적용하여 가독성 및 심미성을 확보한다.

## Technical Context

**Language/Version**: TypeScript, Next.js 14+ (App Router)
**Primary Dependencies**: `next-themes`, Tailwind CSS v4, `lucide-react`, React Flow
**Storage**: localStorage (via `next-themes`)
**Target Platform**: Web Desktop & Mobile
**Project Type**: Web Application
**Performance Goals**: 테마 전환 시 깜빡임(FOUC) 최소화, 100ms 이내 전환
**Constraints**: 기존의 다크 모드 특화 색상(트랙 색상 등)과 라이트 모드의 조화 (접근성 대비율 준수)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **YAGNI & SOLID**: 테마 토글은 필수 옵션(K-4)으로 지정됨. 복잡한 다중 테마(커스텀 테마 K-8)를 배제하고 오직 라이트/다크 모드만 집중 구현한다. (YAGNI 준수)
- **Concise Code**: 테마 상태 조회와 적용은 React Flow 커스텀 노드 내에서 간단히 처리하거나 글로벌 CSS 변수로 일괄 처리하여 코드 중복을 피한다.
- **Fail-Safe & Graceful Degradation**: JS 비활성화 환경에서도 기본 배경색이 유지되거나 최소한의 가독성을 보장해야 한다 (NextThemesProvider의 기본 동작).

## Project Structure

### Documentation (this feature)

```text
specs/016-theme-toggle/
├── plan.md              
├── spec.md        
└── tasks.md             
```

### Source Code (repository root)

```text
app/
├── globals.css          # 라이트 모드용 CSS 변수 추가
├── layout.tsx           # ThemeProvider 및 ThemeToggle 부착
components/
├── ThemeToggle.tsx      # 신규 생성 컴포넌트
├── theme-provider.tsx   # 기존 Provider 확인/수정
├── nodes/
│   ├── StartNode.tsx    # 테마에 따른 스타일 분기
│   ├── StepNode.tsx     
│   ├── GoalNode.tsx     
│   └── MergeNode.tsx    
└── PathMap/
    ├── PathMapCanvas.tsx# React Flow Background 테마 동기화
lib/
└── trackColors.ts       # 라이트 모드 트랙 색상 보정
```

**Structure Decision**: 단일 프로젝트 구조(Next.js App Router)를 따르며, 글로벌 스타일과 기존 커스텀 노드들을 수정하여 라이트 모드 대응을 처리한다.
