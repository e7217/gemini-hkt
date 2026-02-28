# LifePath 백엔드 스펙

**전체: 53개 (Must 9 / Nice-to-have 44)**

---

## 기술 스택

- **프레임워크**: Next.js API Routes (모노리스)
- **AI**: Gemini 3.1 Flash (통일)
- **DB**: Supabase/PostgreSQL (옵션, MVP는 클라이언트 state)
- **배포**: Vercel
- **언어**: TypeScript

---

## 카테고리 1: Gemini AI 연동 (12개)

### Must (4개)

| ID  | 항목                            | 설명                                                         |
| --- | ------------------------------- | ------------------------------------------------------------ |
| B1  | **Gemini SDK 세팅 + 래퍼 유틸** | API 키 관리, JSON mode, 에러 핸들링, 재시도 로직             |
| B2  | **경로 시뮬레이션 API**         | `POST /api/paths/simulate` - 목표 입력 → 3경로 생성 + 합류점 |
| B3  | **프롬프트 엔지니어링**         | System Instruction, JSON Schema, Few-shot 정의               |
| B4  | **분기점 선택 API**             | `POST /api/paths/branch` - 방향 전환 시 하위 경로 2개 재생성 |

### Nice-to-have (8개)

| ID  | 항목               | 설명                       |
| --- | ------------------ | -------------------------- |
| B5  | 목표 생성 API      | Gemini 기반 맞춤 목표 생성 |
| B6  | 타임라인 변형 생성 | 1년/3년/5년 한 번에 생성   |
| B7  | SSE 스트리밍       | 노드 점진적 전달           |
| B8  | 역방향 플래닝 API  | 목표 → 현재 역추적         |
| B9  | 편향 탐지 API      | 선택 패턴 분석             |
| B10 | 경로 비교 분석 API | 경로 간 비교 분석          |
| B11 | 프롬프트 버전 관리 | 프롬프트 히스토리 관리     |
| B12 | 모델 라우팅        | Flash / Pro 자동 분기      |

---

## 카테고리 2: 데이터 & 저장소 (9개)

### Must (2개)

| ID  | 항목                          | 설명                                       |
| --- | ----------------------------- | ------------------------------------------ |
| B13 | **프리셋 목표 데이터**        | 카테고리별 30~50개 상수 파일               |
| B14 | **공유 TypeScript 타입 정의** | PathMap, PathNode, MergePoint, Timeline 등 |

### Nice-to-have (7개)

| ID  | 항목               | 설명                                         |
| --- | ------------------ | -------------------------------------------- |
| B15 | 경로 저장 API      | `POST /api/paths` 저장                       |
| B16 | 경로 조회 API      | `GET /api/paths/:id` 조회                    |
| B17 | DB 세팅            | Supabase/PostgreSQL 스키마                   |
| B18 | 노드 완료 처리 API | `POST /api/paths/:id/nodes/:nodeId/complete` |
| B19 | 경로 수정 API      | `PATCH /api/paths/:id`                       |
| B20 | 경로 공유          | URL 기반 공유 링크                           |
| B21 | 경로 내보내기      | JSON / PDF / 이미지 포맷                     |

---

## 카테고리 3: 사용자 & 인증 (4개)

### Must (1개)

| ID  | 항목               | 설명                        |
| --- | ------------------ | --------------------------- |
| B22 | **익명 세션 관리** | localStorage + 임시 세션 ID |

### Nice-to-have (3개)

| ID  | 항목               | 설명                           |
| --- | ------------------ | ------------------------------ |
| B23 | 소셜 로그인        | OAuth (Google/GitHub)          |
| B24 | 사용자 프로필 API  | `GET/PATCH /api/users/profile` |
| B25 | 온보딩 데이터 수집 | `POST /api/users/onboarding`   |

---

## 카테고리 4: 게이미피케이션 & 소셜 (8개, 전부 옵션)

| ID  | 항목                  | 설명                          |
| --- | --------------------- | ----------------------------- |
| B26 | 노드 완료 보상 데이터 | 포인트, 배지 로직             |
| B27 | 고스트 모드 API       | 선택 비중 집계 반환           |
| B28 | 고스트 데이터 수집    | 익명 사용자 선택 집계         |
| B29 | 고스트 시드 데이터    | 초기 선택 통계                |
| B30 | 진행률 추적 API       | `GET /api/paths/:id/progress` |
| B31 | 이벤트 카드 API       | Gemini 기반 상황별 이벤트     |
| B32 | 리더보드 API          | 상위 사용자 순위              |
| B33 | 배지/업적 시스템 API  | 배지 해제 로직                |

---

## 카테고리 5: 타임라인 & 시각화 지원 (3개)

### Must (1개)

| ID  | 항목                     | 설명                                             |
| --- | ------------------------ | ------------------------------------------------ |
| B34 | **타임라인 데이터 구조** | 노드별 시간 메타데이터 (duration, monthsFromNow) |

### Nice-to-have (2개)

| ID  | 항목                      | 설명                         |
| --- | ------------------------- | ---------------------------- |
| B35 | 타임라인 프론트 변환 로직 | medium ↔ short/long 알고리즘 |
| B36 | 노드 위치 계산 API        | 그래프 레이아웃 좌표 계산    |

---

## 카테고리 6: 알림 & 리마인더 (3개, 전부 옵션)

| ID  | 항목        | 설명                       |
| --- | ----------- | -------------------------- |
| B37 | 푸시 알림   | Web Push Notification      |
| B38 | 이메일 알림 | 주간 리마인더              |
| B39 | 스케줄러    | Cron Job (node-cron, Bull) |

---

## 카테고리 7: 운영 & 인프라 (8개, 전부 옵션)

| ID  | 항목             | 설명              |
| --- | ---------------- | ----------------- |
| B40 | Rate Limiting    | API 호출 제한     |
| B41 | 응답 캐싱        | Redis / ISR 캐싱  |
| B42 | 에러 모니터링    | Sentry 통합       |
| B43 | API 로깅 & 분석  | 요청/응답 로깅    |
| B44 | CI/CD 파이프라인 | GitHub Actions    |
| B45 | 환경 변수 관리   | .env 설정         |
| B46 | API 문서화       | Swagger / OpenAPI |
| B47 | 헬스 체크 API    | `GET /api/health` |

---

## 카테고리 8: 보안 (3개)

### Must (1개)

| ID  | 항목            | 설명                         |
| --- | --------------- | ---------------------------- |
| B50 | **API 키 보호** | 서버 사이드 Gemini 호출 강제 |

### Nice-to-have (2개)

| ID  | 항목      | 설명                       |
| --- | --------- | -------------------------- |
| B48 | 입력 검증 | Zod / Yup 검증 스키마      |
| B49 | CORS 설정 | 안전한 도메인 화이트리스트 |

---

## 카테고리 9: 테스트 (3개, 전부 옵션)

| ID  | 항목             | 설명             |
| --- | ---------------- | ---------------- |
| B51 | API 단위 테스트  | Jest / Vitest    |
| B52 | Gemini 응답 목업 | Mock 데이터      |
| B53 | 통합 테스트      | 전체 흐름 테스트 |

---

## Gemini 프롬프트 전략

### 경로 시뮬레이션 (핵심)

```yaml
모델: gemini-3.1-flash-preview
역할: 인생 경로 시뮬레이터

경로 유형:
  - Fast Track: 빠른 성과, 4~5개 노드
  - Deep Dive: 깊이 있는 학습, 5~6개 노드
  - Explorer: 창의적 탐험, 4~5개 노드

합류점 규칙:
  - 최소 1~2개, isMergePoint: true
  - 경로 간 자연스러운 수렴점

노드 구조:
  id: string (unique)
  title: string
  description: string
  duration: string (e.g., "1-3개월")
  difficulty: "Low" | "Medium" | "High"
  isMergePoint: boolean
  tips: string[]
  monthsFromNow: number (타임라인 계산용)
```

### 응답 JSON 구조

```json
{
  "startNode": {
    "id": "start",
    "title": "현재 위치",
    "description": "당신의 현재 상태"
  },
  "goalNode": {
    "id": "goal",
    "title": "목표",
    "description": "목표 설명"
  },
  "paths": [
    {
      "id": "fast|deep|explorer",
      "name": "경로명",
      "color": "#hex",
      "nodes": [
        {
          "id": "node_id",
          "title": "노드 제목",
          "description": "상세 설명",
          "duration": "기간",
          "difficulty": "난이도",
          "isMergePoint": false,
          "tips": ["팁1", "팁2"],
          "monthsFromNow": 1
        }
      ]
    }
  ],
  "mergePoints": [
    {
      "id": "merge_id",
      "title": "합류점 제목",
      "connectedPaths": ["fast", "deep"],
      "message": "여기서 만나요"
    }
  ]
}
```

### 분기점 선택

```yaml
입력:
  - 현재 경로 ID (fast/deep/explorer)
  - 현재 노드 ID
  - 사용자 선택사항

출력:
  - 하위 경로 2개
  - 각 경로 2~3개 노드
  - 새로운 합류점 (해당하면)
```

---

## API 엔드포인트 (MVP)

### 핵심 2개

```typescript
// 경로 시뮬레이션
POST /api/paths/simulate
├─ Request: { goal: string, timeframe?: "1y"|"3y"|"5y" }
└─ Response: PathMapResponse (위 JSON 구조)

// 분기점 선택
POST /api/paths/branch
├─ Request: { pathId: string, currentNodeId: string, choice?: string }
└─ Response: BranchResponse (2개 경로)
```

### 부가 엔드포인트 (Nice)

```typescript
GET  /api/paths/:id              # 경로 조회
POST /api/paths                  # 경로 저장
PATCH /api/paths/:id             # 경로 수정
POST /api/paths/:id/nodes/:nodeId/complete  # 노드 완료
GET  /api/paths/:id/progress     # 진행률
GET  /api/health                 # 헬스 체크
```

---

## TypeScript 타입 정의

```typescript
// Core Types (B14)
interface PathNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Low" | "Medium" | "High";
  isMergePoint: boolean;
  tips: string[];
  monthsFromNow: number;
}

interface Path {
  id: "fast" | "deep" | "explorer";
  name: string;
  color: string;
  nodes: PathNode[];
}

interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];
  message: string;
}

interface PathMap {
  startNode: PathNode;
  goalNode: PathNode;
  paths: Path[];
  mergePoints: MergePoint[];
}

// Timeline (B34)
interface TimelineMetadata {
  duration: string;
  monthsFromNow: number;
  estimatedEndDate?: Date;
}

// Session (B22)
interface AnonymousSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  pathHistory: string[];
}

// Gamification (B26)
interface NodeReward {
  points: number;
  badge?: string;
  milestone?: string;
}
```

---

## 구현 우선순위

### Phase 1: Core (필수 기능)
1. **B1** → Gemini SDK 세팅
2. **B14** → TypeScript 타입 정의
3. **B13** → 프리셋 목표 데이터
4. **B3** → 프롬프트 엔지니어링
5. **B2** → 경로 시뮬레이션 API
6. **B34** → 타임라인 데이터 구조
7. **B50** → API 키 보호
8. **B22** → 익명 세션 관리
9. **B4** → 분기점 선택 API

### Phase 2: 고급 AI
- B5, B6, B7, B8, B9, B10, B11, B12

### Phase 3: 데이터 지속성
- B17, B15, B16, B18, B19, B23, B24, B25, B20, B21

### Phase 4: 게이미피케이션
- B26, B30, B27, B28, B29, B31, B33, B32

### Phase 5: 운영 & 인프라
- B40~B53

---

## 주요 구현 체크리스트

### 필수 (Must)

- [ ] B1: Gemini SDK + 에러 핸들링 + 재시도 로직
- [ ] B2: `/api/paths/simulate` 동작 (3경로 생성)
- [ ] B3: 프롬프트 정의 (System + JSON Schema)
- [ ] B4: `/api/paths/branch` 동작
- [ ] B13: 30~50개 프리셋 목표
- [ ] B14: 공유 타입 정의
- [ ] B22: localStorage + 세션 ID 관리
- [ ] B34: monthsFromNow 포함 타임라인 구조
- [ ] B50: 서버 사이드 API 키 호출

### 권장 (Phase 1에 추가)

- [ ] B45: .env 환경 변수 설정
- [ ] B47: `/api/health` 엔드포인트
- [ ] B48: 입력 검증 (Zod)
- [ ] B49: CORS 설정
- [ ] B51: Jest 테스트 (기본 setup)

---

## 아이디어 뱅크 추가 제안

### Gemini 프롬프트 최적화

- **"성격 부여" 프롬프트 전략**: System Instruction에 "당신은 따뜻하지만 현실적인 인생 코치입니다"라는 페르소나를 부여. 동일 목표라도 노드 설명이 더 인간적이고 공감가는 톤으로 생성됨. 프롬프트 한 줄 추가로 결과물 품질이 크게 달라짐.

- **Few-shot에 "감성 노드" 포함**: Few-shot 예시에 단순 스텝 나열이 아닌, 각 단계에서의 기대 감정이나 마음가짐을 포함시키면 Gemini 출력에도 감성적 요소가 자연스럽게 반영됨. 예: `"tips": ["이 시기에 조급함을 느낄 수 있지만, 기초가 탄탄해지는 시간입니다"]`.

- **합류점 메시지 전용 프롬프트**: 합류점의 `message` 필드를 위한 별도 지시를 프롬프트에 추가. "합류점 메시지는 사용자에게 위로와 희망을 주는 한 문장으로 작성하세요." 핵심 감동 포인트를 AI가 매번 신선하게 생성.

### API 효율화

- **"프리셋 + AI 하이브리드" 전략**: 프리셋 목표 30~50개에 대해 Gemini 경로를 미리 생성해 JSON 캐시로 보관. 데모 시 프리셋 목표는 즉시 로딩(0초), 커스텀 목표만 API 호출. 데모 안정성과 속도를 동시에 확보.

- **경로 생성 "스트리밍 파싱"**: Gemini 응답을 SSE로 받으면서 JSON 파싱을 점진적으로 수행. 첫 번째 경로(Fast Track)가 파싱되면 즉시 렌더링 시작, 나머지 경로는 순차 추가. 체감 로딩 시간을 절반으로 줄임. 구현이 복잡하면 Nice-to-have로 분류.

### 데이터 구조 개선

- **노드에 `emoji` 필드 추가**: 각 노드에 관련 이모지 하나를 Gemini가 선택하도록 스키마에 `emoji: string` 필드 추가. 프롬프트에 "각 노드에 어울리는 이모지 1개를 선택하세요"만 추가하면 됨. 프론트에서 노드 위에 이모지를 표시하면 시각적 재미와 직관성이 크게 올라감.

- **`actionItem` 필드 추가**: 각 노드에 "오늘 당장 할 수 있는 한 가지"를 담는 `actionItem: string` 필드. Gemini가 각 단계에서 즉시 실행 가능한 구체적 행동을 제안. 실행력 있는 도구라는 인상을 심사위원에게 줌.

- **경로별 `catchphrase` 필드**: Path 타입에 `catchphrase: string` 추가. Gemini가 각 경로의 성격을 한 줄로 요약. 경로 선택 UI에서 이름 아래 표시하면 사용자의 직관적 판단을 도움.
