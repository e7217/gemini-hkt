# [BE-05] 프롬프트 엔지니어링 (경로 생성용)

## 개요
- **Phase**: Phase 1 (로켓 발사, 0:20~0:50)
- **담당**: backend-dev
- **예상 시간**: 25m
- **난이도**: 높음
- **상태**: done

## 의존성
- **선행 작업**:
  - [BE-02] 공유 TypeScript 타입 정의
  - [BE-04] Gemini SDK 세팅 + 래퍼 유틸
- **후행 작업**: [BE-06] 경로 시뮬레이션 API

## 구현 범위
1. **System Instruction** 정의 (영어):
   - 인생 경로 시뮬레이터 역할 부여
   - JSON 출력 형식 명시
   - 합류점 생성 규칙 명시
2. **User Prompt 템플릿** (한국어 포함):
   - 목표 텍스트 + 타임프레임 입력
   - 한국어 응답 강제 명시
3. **JSON Schema** 정의:
   - PathMap 구조에 맞는 출력 형식
   - 필수 필드 명시
4. **Few-shot 예시** 1~2개:
   - 합류점(Merge Point)이 올바르게 포함된 예시 필수
5. **경로 유형 명세**:
   - Fast Track: 빠른 성과, 4~5개 노드
   - Deep Dive: 깊이 있는 학습, 5~6개 노드
   - Risk Path: 창의적/모험적 탐험, 4~5개 노드
6. **합류점 규칙**:
   - 최소 1~2개
   - isMergePoint: true
   - connectedPaths에 연결 경로 ID 명시
7. **노드별 monthsFromNow 규칙**:
   - 각 경로 내에서 monotonically increasing (단조 증가)
   - 타임프레임에 맞는 범위 내 분포

## 기술 요구사항
- **파일 위치**: `lib/prompts.ts`
- **참조 스펙**: 04-backend-spec.md B3, Gemini 프롬프트 전략 섹션
- System Instruction은 영어, Contents(User Prompt)는 한국어 혼합
- 출력은 반드시 한국어

## 수용 기준 (Acceptance Criteria)
- [ ] System Instruction (영어) 정의 완료
- [ ] User Prompt 템플릿 (한국어 응답 강제) 정의 완료
- [ ] JSON Schema가 PathMap 타입과 일치
- [ ] 합류점 포함 Few-shot 예시 1~2개 작성
- [ ] 프롬프트로 Gemini 호출 시 PathMap JSON 구조에 맞는 응답 생성
- [ ] 3경로(Fast/Deep/Risk) 각각 4~6개 노드 생성
- [ ] 합류점 최소 1개 이상 정상 생성
- [ ] monthsFromNow가 각 경로 내에서 단조 증가

## 참조 문서
- `/docs/04-backend-spec.md` - B3: 프롬프트 엔지니어링, Gemini 프롬프트 전략 섹션
- `/docs/04-backend-spec.md` - 응답 JSON 구조, 경로 시뮬레이션(핵심) 섹션
- `/docs/01-ideas.md` - B1: 3가지 경로 분기, B2: 합류점

## 기술 검토 노트
- **언어 분리 전략**: System Instruction은 영어로 작성하여 Gemini의 이해도를 높이고, User Prompt에 "반드시 한국어로 응답하세요"를 명시하여 한국어 출력 강제
- **합류점 Few-shot 필수**: 합류점은 Gemini가 자연스럽게 생성하기 어려운 구조이므로, 올바른 합류점 예시를 Few-shot으로 반드시 포함해야 함
- **monthsFromNow 단조 증가**: 프롬프트에 "monthsFromNow must be monotonically increasing within each path" 명시. 이를 지키지 않으면 타임라인 슬라이더에서 노드 순서가 꼬임
- 프롬프트 품질이 전체 서비스 품질을 결정하는 핵심 작업. 반복 테스트 및 개선 필요

---

## 아이디어 뱅크 제안

- **"성격 부여" 프롬프트 전략**: System Instruction에 "You are a warm but realistic life coach"라는 페르소나를 부여하면, 동일 목표라도 노드 설명이 더 인간적이고 공감가는 톤으로 생성됨. 프롬프트 한 줄 추가로 결과물 품질이 크게 달라짐.

- **Few-shot에 "감성 노드" 포함**: Few-shot 예시의 tips에 단순 행동 나열이 아닌 감정/마음가짐 요소를 포함시키면 Gemini 출력에도 자연스럽게 반영됨. 예: `"tips": ["이 시기에 조급함을 느낄 수 있지만, 기초가 탄탄해지는 시간입니다"]`.

- **합류점 메시지 전용 지시 추가**: 프롬프트에 "합류점의 message는 사용자에게 위로와 희망을 주는 감성적 한 문장으로 작성하세요"를 명시. 데모 ACT 3 "어떤 길이든 괜찮다"의 감동 포인트를 AI가 매번 신선하게 생성.

- **"나만의 경로명" 생성 지시**: 3경로에 Fast/Deep/Risk 대신 목표에 맞는 창의적 이름을 Gemini가 부여하도록 프롬프트에 추가. 예: "프리랜서 되기" 목표 시 "번개 독립러", "장인의 길", "모험가의 도전". 개인화 느낌 극대화.

- **노드별 `emoji` 선택 지시**: 프롬프트에 "각 노드에 어울리는 이모지 1개를 선택하세요"를 추가하면 시각적 재미가 크게 올라감. JSON Schema에 `emoji: string` 필드만 추가하면 됨.
