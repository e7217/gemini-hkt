# [BE-04] Gemini SDK 세팅 + 래퍼 유틸

## 개요
- **Phase**: Phase 1 (로켓 발사, 0:20~0:50)
- **담당**: backend-dev
- **예상 시간**: 20m
- **난이도**: 중간
- **상태**: done

## 의존성
- **선행 작업**: [BE-01] 프로젝트 초기 세팅
- **후행 작업**: [BE-05] 프롬프트 엔지니어링

## 구현 범위
1. `@google/genai` SDK 설치 및 초기화
2. Gemini 3.1 Flash 모델 설정
3. API 키 서버 사이드 보호 (클라이언트에서 직접 호출 차단)
4. JSON mode 설정 (responseMimeType: application/json)
5. 에러 핸들링 래퍼:
   - 지수 백오프 재시도 (HTTP 429, 500, 503 대응)
   - 최대 3회 재시도
   - 15초 타임아웃 설정
6. 응답 파싱 유틸:
   - JSON 파싱
   - Zod 스키마 기반 응답 검증
7. 래퍼 함수 인터페이스:
   ```typescript
   async function generatePathMap(goal: string, timeframe: string): Promise<PathMap>
   ```

## 기술 요구사항
- **SDK**: `@google/genai` (주의: `@google/generative-ai` 아님)
- **모델**: Gemini 3.1 Flash (`gemini-3.1-flash-preview`)
- **검증**: Zod 라이브러리로 응답 스키마 검증
- **파일 위치**: `lib/gemini.ts`
- **참조 스펙**: 04-backend-spec.md B1, B50

## 수용 기준 (Acceptance Criteria)
- [ ] `@google/genai` SDK 설치 및 초기화 완료
- [ ] API 키가 서버 사이드에서만 접근 가능 (환경변수)
- [ ] JSON mode로 Gemini 호출 시 구조화된 JSON 응답 반환
- [ ] HTTP 429/500/503 에러 시 지수 백오프 재시도 동작 (최대 3회)
- [ ] 15초 타임아웃 초과 시 에러 throw
- [ ] Zod 스키마로 응답 검증 통과
- [ ] Gemini API 호출 실패 시 적절한 에러 메시지 반환

## 참조 문서
- `/docs/04-backend-spec.md` - B1: Gemini SDK 세팅 + 래퍼 유틸
- `/docs/04-backend-spec.md` - B50: API 키 보호
- Gemini API 공식 문서 (google/genai SDK)

## 기술 검토 노트
- **SDK 패키지명 주의**: `@google/genai`을 사용해야 함. `@google/generative-ai`는 구버전 SDK
- **지수 백오프 구현**: 재시도 간격을 1초 → 2초 → 4초로 증가시키며, jitter 추가 권장
- **Zod 검증**: 응답 JSON이 PathMap 스키마에 맞지 않으면 검증 실패 처리. 검증 실패 시 재시도 1회 후 Mock 폴백으로 전환하는 로직은 BE-06(simulate API)에서 구현
- **타임아웃**: AbortController 또는 Promise.race 패턴으로 15초 타임아웃 구현
- Zod 라이브러리도 함께 설치 필요 (`zod`)

---

## 아이디어 뱅크 제안

- **경로 생성 "스트리밍 파싱" 준비**: SDK 래퍼에 스트리밍 응답 옵션을 미리 고려해두면, 추후 SSE로 노드를 점진적으로 전달하여 체감 로딩 시간을 절반으로 줄일 수 있음. 당장 구현하지 않더라도 래퍼 인터페이스에 `stream?: boolean` 옵션을 두면 확장성 확보.

- **"프리셋 + AI 하이브리드" 캐시 전략 대비**: 래퍼 함수에 캐시 레이어를 추가할 수 있는 구조로 설계하면, 나중에 프리셋 목표에 대한 사전 생성 결과를 캐싱하여 데모 시 즉시 로딩(0초)이 가능. 래퍼 함수 시그니처에 `useCache?: boolean`을 미리 고려.
