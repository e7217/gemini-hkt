# [BE-01] 프로젝트 초기 세팅 (Next.js + TypeScript + Tailwind + shadcn/ui)

## 개요
- **Phase**: Phase 1 (로켓 발사, 0:00~0:20)
- **담당**: backend-dev
- **예상 시간**: 20m
- **난이도**: 낮음
- **상태**: done

## 의존성
- **선행 작업**: 없음 (최우선 시작 작업)
- **후행 작업**:
  - [BE-02] 공유 TypeScript 타입 정의
  - [BE-03] 프리셋 목표 데이터 생성
  - [BE-04] Gemini SDK 세팅
  - [FE-01] 목표 입력 화면 UI
  - [FE-02] 다크 테마 기본 + 트랙별 색상 체계

## 구현 범위
1. Next.js 14+ (App Router) + TypeScript 프로젝트 생성
2. Tailwind CSS 설정
3. shadcn/ui 설치 및 기본 컴포넌트 설정
4. React Flow (`@xyflow/react` v12) + dagre (`@dagrejs/dagre`) 설치
5. Zustand 상태관리 설치
6. 기본 프로젝트 구조 생성:
   ```
   app/
   components/
   lib/
   types/
   data/
   store/
   ```
7. `.env.local` 파일 설정 (GEMINI_API_KEY 등)
8. `.env.example` 파일 생성 (키 형식 안내용)

## 기술 요구사항
- **프레임워크**: Next.js 14+ (App Router)
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS + shadcn/ui
- **시각화**: `@xyflow/react` v12 + `@dagrejs/dagre`
- **상태관리**: Zustand
- **배포**: Vercel 호환 구조
- **참조 스펙**: 03-frontend-spec.md A-1~A-6, 04-backend-spec.md 기술 스택

## 수용 기준 (Acceptance Criteria)
- [ ] `npm run dev`로 기본 페이지 정상 로드
- [ ] TypeScript strict mode 컴파일 에러 없음
- [ ] Tailwind CSS 클래스 적용 확인
- [ ] shadcn/ui 기본 컴포넌트(Button, Input 등) import 가능
- [ ] React Flow 컴포넌트 렌더링 가능
- [ ] Zustand 스토어 기본 동작 확인
- [ ] `.env.local`에 GEMINI_API_KEY 변수 설정 가능
- [ ] 프로젝트 디렉토리 구조 생성 완료

## 참조 문서
- `/docs/03-frontend-spec.md` - A. 프로젝트 기반 섹션 (A-1~A-6)
- `/docs/04-backend-spec.md` - 기술 스택 섹션
- `/docs/05-demo-strategy.md` - Phase 1: 0:00~0:20 프로젝트 세팅

## 기술 검토 노트
- React Flow는 `@xyflow/react` v12를 사용해야 함 (구버전 `reactflow` 패키지 아님)
- dagre는 `@dagrejs/dagre` 패키지 사용
- Framer Motion은 옵션이므로 초기 세팅에서 제외 (CSS transition으로 대체 가능)
- Vercel 배포를 고려하여 Next.js App Router 구조 준수
