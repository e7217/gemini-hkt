# [BE-06] 경로 시뮬레이션 API (POST /api/paths/simulate)

## 개요
- **Phase**: Phase 1 (로켓 발사, 0:20~0:50)
- **담당**: backend-dev
- **예상 시간**: 25m
- **난이도**: 중간
- **상태**: done

## 의존성
- **선행 작업**:
  - [BE-04] Gemini SDK 세팅 + 래퍼 유틸
  - [BE-05] 프롬프트 엔지니어링
- **후행 작업**: [FE-03] React Flow 캔버스 + 커스텀 노드 구현

## 구현 범위
1. **POST /api/paths/simulate** 엔드포인트 생성
2. **Request 처리**:
   ```typescript
   { goal: string, timeframe?: "1y" | "3y" | "5y" }
   ```
   - timeframe 기본값: `"3y"`
   - Zod로 입력 검증
3. **Gemini API 호출**:
   - 프롬프트 적용 (BE-05)
   - SDK 래퍼 사용 (BE-04)
4. **응답 검증**:
   - Zod로 PathMap 스키마 검증
   - 검증 실패 시 재시도 1회
   - 재시도 실패 시 Mock 폴백 (BE-07)
5. **Response**:
   ```typescript
   PathMap (startNode, goalNode, paths[], mergePoints[])
   ```
6. **에러 핸들링**:
   - 400: 잘못된 입력
   - 500: Gemini API 실패
   - 폴백 성공 시 200 + mock 데이터 반환
7. **Mock 모드**: `USE_MOCK=true` 환경변수 시 Gemini 호출 없이 Mock 반환

## 기술 요구사항
- **파일 위치**: `app/api/paths/simulate/route.ts`
- **참조 스펙**: 04-backend-spec.md B2, API 엔드포인트 섹션
- Next.js App Router API Route 패턴
- Zod로 request/response 양쪽 검증

## 수용 기준 (Acceptance Criteria)
- [ ] POST /api/paths/simulate 엔드포인트 정상 동작
- [ ] goal 필수, timeframe 선택(기본값 "3y") 검증 통과
- [ ] Gemini API 호출 → 3경로 + 합류점 JSON 정상 반환
- [ ] Zod 응답 검증 실패 시 재시도 1회 동작
- [ ] 재시도 실패 시 Mock 폴백 정상 동작
- [ ] USE_MOCK=true 시 Gemini 호출 없이 Mock 반환
- [ ] 에러 시 적절한 HTTP 상태 코드 반환 (400, 500)

## 참조 문서
- `/docs/04-backend-spec.md` - B2: 경로 시뮬레이션 API, API 엔드포인트 (MVP) 섹션
- `/docs/02-product-spec.md` - 8-8: API 실패 대비 프리셋 폴백
- `/docs/05-demo-strategy.md` - 데모 안전장치 (Plan A/B)

## 기술 검토 노트
- **timeframe 기본값 "3y"**: 명시하지 않은 경우 3년 타임프레임으로 생성. 데모 시나리오에서도 3년이 적절한 기본값
- **Zod 검증 + 재시도 전략**: Gemini 응답이 스키마에 맞지 않을 경우 1회 재시도. 재시도에도 실패하면 Mock 데이터로 폴백하여 사용자 경험 보장
- **branch API 컨텍스트**: branch API(POST /api/paths/branch)는 별도 이슈로 분리되지 않았으나, 클라이언트에서 PathMap 전체를 body에 포함하는 방식으로 구현 예정. 서버는 stateless로 유지
- **CP1 달성 기준**: 이 API가 정상 동작하면 "입력 → Gemini → JSON 콘솔 출력" 체크포인트 달성
- Mock 폴백 데이터는 [BE-07]에서 생성

---

## 아이디어 뱅크 제안

- **목표 자동 구체화 (Goal Refinement) 옵션**: 사용자가 "행복해지고 싶어"처럼 모호한 목표를 입력하면, simulate API 내부에서 Gemini에게 먼저 목표를 구체화하도록 요청한 뒤 경로를 생성하는 2단계 파이프라인. 구현 시간이 부족하면 프롬프트 내에서 "모호한 목표를 먼저 구체화한 뒤 경로를 생성하세요"라는 지시를 추가하는 것만으로도 효과.

- **경로 간 "트레이드오프" 요약 반환**: 응답 PathMap에 각 경로의 핵심 트레이드오프를 한 줄씩 추가 반환. 예: Fast Track - "빠르지만 기초가 얕을 수 있음". 프롬프트에 지시를 추가하고 Path 타입에 `catchphrase` 필드를 활용하면 됨.
