---
id: FE-08
title: Light Theme Support
status: in-progress
---

# [FE-08] 라이트 테마 지원 (다크/라이트 토글)

## 개요
- **Phase**: Phase 3 (UI 고도화)
- **담당**: frontend-dev
- **예상 시간**: 2h
- **난이도**: 중간
- **상태**: in-progress

## 의존성
- **선행 작업**: [FE-02] 다크 테마 기본 + 트랙별 색상 체계
- **후행 작업**: 없음

## 구현 범위
1. **테마 토글 기능 구현**:
   - `next-themes`를 활용하여 라이트/다크 테마 전환 토글 버튼 추가 (우측 상단).
   - 시스템 기본 테마 설정 지원 (System/Dark/Light).
2. **라이트 테마용 색상 체계 정의**:
   - `globals.css`의 라이트 테마 변수(`:root`) 업데이트.
   - 배경은 밝은 색상 (white 또는 #f8fafc), 텍스트는 어두운 색상 (#0f172a)으로 변경.
3. **트랙별 색상 및 글로우 효과 조정**:
   - 기존 다크 테마에 맞춰진 Fast/Deep/Risk 트랙 색상이 라이트 테마에서도 잘 보이도록 대비 조정 (필요시 라이트 테마용 별도 트랙 색상 토큰 적용).
   - 노드 글로우 효과(box-shadow)를 라이트 테마 환경에 맞게 조정 (예: 더 부드러운 그림자나 테두리 강조).
4. **React Flow 캔버스 배경 변경**:
   - 캔버스 배경(Background) 컴포넌트의 색상 및 도트/그리드 색상을 현재 테마에 맞게 동적으로 변경.

## 기술 요구사항
- **파일 위치**: `components/theme-provider.tsx`, `components/ThemeToggle.tsx`, `app/globals.css`, `tailwind.config.ts`, `components/PathMap/PathMapCanvas.tsx`
- Tailwind CSS 다크 모드 (`class` 전략) 활용.

## 수용 기준 (Acceptance Criteria)
- [ ] UI 상단에 테마 토글 버튼이 존재하며 작동한다.
- [ ] 라이트 테마 적용 시 텍스트와 배경의 가독성이 우수하다.
- [ ] 노드, 엣지, 미니맵, 컨트롤 등 React Flow 구성요소가 라이트 테마에서도 명확하게 보인다.
- [ ] 새로고침 시 설정된 테마가 유지된다.

## 기술 검토 노트
- 현재 프로젝트는 기본적으로 다크 테마로만 구성되어 있으므로, 기존 하드코딩된 다크 계열 클래스(`bg-gray-900`, `text-white` 등)를 Tailwind의 다크 모드 유틸리티(`dark:bg-gray-900 bg-white text-gray-900 dark:text-white` 형태) 또는 CSS 변수로 리팩토링해야 합니다.
- Shadcn UI 컴포넌트들은 이미 CSS 변수를 사용하므로 `globals.css`의 `:root` 설정만 잘 맞추면 큰 문제 없이 전환될 것입니다.
