# [FE-02] 다크 테마 기본 + 트랙별 색상 체계

## 개요
- **Phase**: Phase 1 (기반 세팅 시 함께)
- **담당**: frontend-dev
- **예상 시간**: 15m
- **난이도**: 낮음
- **상태**: done

## 의존성
- **선행 작업**: [BE-01] 프로젝트 초기 세팅
- **후행 작업**:
  - [FE-01] 목표 입력 화면 UI
  - [FE-06] 로딩 애니메이션
  - [FE-03] React Flow 캔버스 + 커스텀 노드 구현

## 구현 범위
1. **다크 테마 기본 설정** (K-1):
   - Tailwind dark mode 설정
   - body 기본 배경색 어둡게 (#0a0a0f 또는 유사)
   - 텍스트 색상 밝게 (white/gray-100)
2. **트랙별 색상 체계 정의** (K-2):
   - Fast Track: `#F59E0B` (금색/amber)
   - Deep Dive: `#3B82F6` (파란색/blue)
   - Risk Path: `#8B5CF6` (보라색/violet)
3. **노드 글로우 효과 CSS** (K-3):
   - box-shadow 기반 글로우
   - 트랙별 색상에 맞는 글로우 색상
4. **CSS 변수 / Tailwind 커스텀 색상**:
   - tailwind.config.ts에 커스텀 색상 등록
   - 트랙 색상 상수 파일 (lib/constants.ts)
5. **데스크탑 레이아웃 기준** (L-1):
   - 최소 1280px 너비 기준

## 기술 요구사항
- **파일 위치**: `tailwind.config.ts`, `app/globals.css`, `lib/constants.ts`
- **참조 스펙**: 03-frontend-spec.md K-1~K-3, 색상 체계 섹션, L-1
- Tailwind CSS 커스텀 설정
- CSS 변수로 일관된 색상 관리

## 수용 기준 (Acceptance Criteria)
- [ ] 다크 배경 기본 적용 (밝은 테마 없이 다크만)
- [ ] Fast Track 금색(#F59E0B) 색상 적용 가능
- [ ] Deep Dive 파란색(#3B82F6) 색상 적용 가능
- [ ] Risk Path 보라색(#8B5CF6) 색상 적용 가능
- [ ] 노드 글로우 효과 CSS 클래스 사용 가능
- [ ] 1280px+ 데스크탑에서 레이아웃 정상 표시

## 참조 문서
- `/docs/03-frontend-spec.md` - K. 비주얼/테마 (K-1~K-3), 색상 체계 섹션
- `/docs/03-frontend-spec.md` - L-1: 데스크탑 (1280px+)

## 기술 검토 노트
- shadcn/ui의 다크 테마 지원과 통합하여 일관된 색상 체계 유지
- 글로우 효과는 box-shadow와 opacity를 조합하여 은은한 발광 효과 구현
- 트랙 색상은 노드, 엣지, 레전드, 상세 패널 등 여러 곳에서 재사용되므로 상수로 관리 필수
- Tailwind의 extend colors에 track-fast, track-deep, track-risk로 등록하면 편리

---

## 아이디어 뱅크 제안

- **"다크 우주" 배경 테마**: 기본 다크 모드에 미세한 별 반짝임 파티클을 배경에 추가. CSS로 50개 정도의 작은 점(`width: 1~2px`)을 랜덤 위치에 `@keyframes twinkle`로 깜빡이게 하면 "우주에서 나의 길을 찾는" 세계관 강화. 데모 스크린샷/영상의 비주얼 퀄리티가 크게 올라감. 구현 15분 이내.

- **글로우 효과 강화**: 기본 box-shadow 글로우 외에, 호버 시 글로우 강도가 높아지는 인터랙티브 효과 추가. `transition: box-shadow 0.3s ease`로 부드러운 전환. 마우스를 올릴 때마다 노드가 살아 숨쉬는 느낌.
