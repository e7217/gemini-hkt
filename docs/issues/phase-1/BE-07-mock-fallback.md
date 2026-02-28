# [BE-07] Mock 데이터 + 폴백 시스템

## 개요
- **Phase**: Phase 1 (데모 안전장치)
- **담당**: backend-dev
- **예상 시간**: 20m
- **난이도**: 중간
- **상태**: done

## 의존성
- **선행 작업**: [BE-02] 공유 TypeScript 타입 정의
- **후행 작업**: 없음 (BE-06에서 참조하여 사용)

## 구현 범위
1. **완전한 PathMap Mock 데이터** 1~2세트 생성:
   - 세트 1: "풀스택 개발자 되기" (데모 메인 시나리오)
   - 세트 2: 범용 목표 1개 (백업)
2. **Mock 데이터 요구사항**:
   - 3경로(Fast/Deep/Risk) 완비
   - 각 경로 4~6개 노드
   - 합류점(MergePoint) 1~2개 포함
   - 시작 노드(startNode) + 목표 노드(goalNode)
   - monthsFromNow 값 포함 (타임라인 호환)
   - 한국어 콘텐츠
3. **USE_MOCK 환경변수 전환**:
   - `USE_MOCK=true` → Mock 데이터 즉시 반환
4. **폴백 로직**:
   - Gemini API 호출 실패 → 자동으로 Mock 데이터 반환
   - Zod 검증 실패 + 재시도 실패 → Mock 폴백
5. **폴백 응답에 메타 정보 추가**:
   - `_isMock: true` 플래그 (디버그용, 프로덕션에서는 제거)

## 기술 요구사항
- **파일 위치**: `lib/mockData.ts`
- **참조 스펙**: 05-demo-strategy.md 데모 안전장치 섹션, 02-product-spec.md 8-8
- PathMap 타입에 완전히 부합하는 Mock 데이터
- 타임라인 슬라이더와 호환되는 monthsFromNow 값 분포

## 수용 기준 (Acceptance Criteria)
- [ ] "풀스택 개발자 되기" Mock 데이터 세트 완성
- [ ] 3경로(Fast/Deep/Risk) + 합류점 1~2개 포함
- [ ] monthsFromNow가 각 경로 내에서 단조 증가
- [ ] PathMap TypeScript 타입과 완전히 일치
- [ ] USE_MOCK=true 시 Mock 데이터 정상 반환
- [ ] Gemini API 실패 시 자동 폴백 동작

## 참조 문서
- `/docs/05-demo-strategy.md` - 데모 안전장치 (3단계 백업), Plan B
- `/docs/02-product-spec.md` - 8-8: API 실패 대비 프리셋 폴백
- `/docs/04-backend-spec.md` - 응답 JSON 구조 섹션

## 기술 검토 노트
- 데모 시나리오의 핵심 안전장치. Gemini API가 불안정할 때 데모가 중단되지 않도록 보장
- Mock 데이터의 품질이 데모 품질과 직결됨. 실제 Gemini 응답과 유사한 수준의 자연스러운 한국어 콘텐츠 필요
- monthsFromNow 분포 예시: Fast Track(1,3,6,9,12), Deep Dive(2,6,12,18,24,30), Risk(1,4,8,14,18)
- 합류점의 connectedPaths에 실제 경로 ID가 정확히 매칭되어야 함

---

## 아이디어 뱅크 제안

- **"프리셋 + AI 하이브리드" 캐시 전략**: Mock 데이터를 단순 폴백용이 아닌, 데모용 "사전 캐싱 데이터"로도 활용. 데모에서 자주 쓰이는 목표("풀스택 개발자 되기") 외에 2~3개 추가 목표의 이상적인 Gemini 응답을 사전에 생성하여 Mock으로 저장. 네트워크 불안정 시에도 자연스러운 라이브 데모 가능.

- **네트워크 불안정 대비 "오프라인 퍼스트" 전략**: `USE_MOCK=true` 외에 `OFFLINE_CACHE=true` 모드를 추가. 이 모드에서는 성공한 Gemini 응답을 자동으로 localStorage에 캐싱하고, 다음 동일 요청 시 캐시에서 반환. 데모 리허설에서 한 번 성공하면 본 데모에서는 항상 안정적으로 동작.

- **Mock 데이터에 감성 요소 포함**: Mock 데이터의 합류점 message에 감동적인 메시지를 정성껏 작성. 예: "돌아가도 괜찮아요, 결국 여기서 만나니까요." Mock 데이터가 실제로 데모에서 쓰일 가능성이 높으므로 품질이 중요.
