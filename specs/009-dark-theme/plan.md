# FE-02 Implementation Plan: 다크 테마 기본 + 트랙별 색상 체계

## Summary

| Field | Value |
|-------|-------|
| Feature | FE-02 다크 테마 기본 + 트랙별 색상 체계 |
| Estimated Time | 15 minutes |
| Affected Files | 3 files |
| Risk | Low |

---

## Technical Context

### Tailwind CSS v3 Dark Mode

Tailwind CSS v3에서 다크 모드는 두 가지 전략을 지원한다:
- `media`: `prefers-color-scheme` 미디어 쿼리 기반 (시스템 설정 따름)
- `class`: `html` 또는 상위 요소의 `dark` 클래스 기반 (명시적 제어)

LifePath는 다크 전용 앱이므로 `class` 전략을 선택하고 `html` 태그에 `dark` 클래스를 정적으로 부여한다. 이렇게 하면 시스템 설정에 관계없이 항상 다크 테마가 적용된다.

### CSS Custom Properties (변수)

`app/globals.css`에서 CSS 변수를 활용하면 JavaScript에서도 색상을 참조할 수 있고, 테마 변경 시 단일 파일만 수정하면 된다. shadcn/ui는 이미 `--background`, `--foreground` 등의 변수를 사용하므로 트랙 색상은 `--track-fast`, `--track-deep`, `--track-risk` 네임스페이스로 분리한다.

### Tailwind `extend.colors`

`tailwind.config.ts`의 `theme.extend.colors`에 커스텀 색상을 등록하면 `bg-track-fast`, `text-track-deep`, `border-track-risk` 등의 유틸리티 클래스를 바로 사용할 수 있다. CSS 변수를 참조하도록 설정하면 단일 진실 원천(single source of truth)이 유지된다.

---

## Constitution Check

| Principle | Compliance | Notes |
|-----------|------------|-------|
| YAGNI | Pass | 라이트 모드 토글 미구현, 다크 전용만 구현 |
| SOLID (SRP) | Pass | 상수 파일이 색상 정의만 담당 |
| TypeScript no-any | Pass | `TrackType`, `TrackColors`, `GlowStyles` 명시적 타입 |
| Fail-Safe with fallback | Pass | TRACK_COLORS 미설정 시 빌드 타임에 타입 오류로 감지 |
| Max 2 nesting depth | Pass | 상수 객체는 depth 1 |
| Max 20 line functions | Pass | 함수 없음, 순수 상수 선언 |

---

## Project Structure

```
project-root/
├── app/
│   └── globals.css          (MODIFY) CSS 변수 + 다크 테마 base 스타일
├── lib/
│   └── constants.ts         (CREATE) TRACK_COLORS, GLOW_STYLES 상수
└── tailwind.config.ts       (MODIFY) darkMode: 'class', extend.colors
```

### File Responsibilities

**`lib/constants.ts`**
- `TrackType` 유니온 타입 정의
- `TrackColors` 타입 정의
- `GlowStyles` 타입 정의
- `TRACK_COLORS` 상수 export
- `GLOW_STYLES` 상수 export

**`tailwind.config.ts`**
- `darkMode: 'class'` 설정
- `theme.extend.colors`에 `track-fast`, `track-deep`, `track-risk` 등록 (CSS 변수 참조)

**`app/globals.css`**
- `:root` 및 `.dark` 블록에 CSS 변수 정의
- `body` 기본 배경/텍스트 색상 적용
- shadcn/ui 다크 테마 변수 오버라이드 (필요 시)

---

## Implementation Steps

### Phase 1: Setup (0-3min)
1. `lib/` 디렉토리 존재 확인 (없으면 생성)
2. `lib/constants.ts` 파일 생성

### Phase 2: Type Definitions (3-5min)
3. `lib/constants.ts`에 `TrackType`, `TrackColors`, `GlowStyles` 타입 작성
4. `TRACK_COLORS`, `GLOW_STYLES` 상수 작성 및 export

### Phase 3: Tailwind Config (5-8min)
5. `tailwind.config.ts` 열기
6. `darkMode: 'class'` 추가
7. `theme.extend.colors`에 트랙 색상 등록

### Phase 4: Global CSS (8-12min)
8. `app/globals.css` 열기
9. `:root` 블록에 `--track-*` CSS 변수 추가
10. `.dark body` 또는 `body`에 배경/텍스트 색상 적용
11. `html` 태그에 `dark` 클래스 부여 (layout.tsx에서)

### Phase 5: Verification (12-15min)
12. TypeScript 컴파일 오류 없음 확인
13. 브라우저에서 다크 배경 확인
14. 개발자 도구에서 CSS 변수 확인

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| shadcn/ui CSS 변수 충돌 | Low | Medium | `--track-*` 네임스페이스로 분리 |
| Tailwind 빌드 오류 | Low | Medium | `tailwind.config.ts` 타입 확인 |
| TypeScript strict 오류 | Very Low | Low | 명시적 타입 선언으로 방지 |
| 색상 대비율 미달 | Very Low | Medium | 사전 계산값 확인 완료 (모두 WCAG AA 통과) |
