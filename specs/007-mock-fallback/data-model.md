# BE-07 Mock 데이터 + 폴백 시스템 - Data Models

**Feature ID**: BE-07
**Scope**: 완전한 Mock 데이터 구조 명세 (구현 시 복사하여 사용)

---

## 1. PathMap 타입 요약

```typescript
interface PathNode {
  id: string;
  type: 'start' | 'step' | 'merge' | 'goal';
  label: string;
  description: string;
  monthsFromNow: number;
  track: 'fast' | 'deep' | 'risk';
  difficulty?: 'low' | 'medium' | 'high';
  tips?: string[];
}

interface MergePoint {
  id: string;
  label: string;
  message: string;
  connectedPaths: string[];
  monthsFromNow: number;
}

interface PathInfo {
  id: string;
  type: 'fast' | 'deep' | 'risk';
  label: string;
  nodes: PathNode[];
}

interface PathMap {
  startNode: PathNode;
  goalNode: PathNode;
  paths: PathInfo[];
  mergePoints: MergePoint[];
}
```

---

## 2. FULLSTACK_MOCK - "풀스택 개발자 되기"

### 2.1 startNode

```typescript
{
  id: 'fs-start',
  type: 'start',
  label: '풀스택 개발자로의 여정 시작',
  description: '지금 이 순간이 모든 것의 시작입니다. 어떤 경로를 선택하든 목표는 하나 — 자신만의 서비스를 만드는 풀스택 개발자가 되는 것입니다.',
  monthsFromNow: 0,
  track: 'fast',
  difficulty: 'low',
  tips: [
    '지금 당장 코드 에디터를 설치하세요 (VS Code 추천)',
    '첫 날은 환경 세팅과 목표 정의에 집중하세요',
    '완벽한 준비보다 빠른 시작이 중요합니다',
  ],
}
```

### 2.2 goalNode

```typescript
{
  id: 'fs-goal',
  type: 'goal',
  label: '풀스택 개발자로 활동 시작',
  description: '프론트엔드부터 백엔드, 데이터베이스까지 혼자서 서비스를 만들 수 있는 풀스택 개발자가 되었습니다. 이제 원하는 것을 만들 수 있습니다.',
  monthsFromNow: 30,
  track: 'deep',
  difficulty: 'high',
  tips: [
    '취업 후에도 사이드 프로젝트를 계속 유지하세요',
    '오픈소스 기여로 포트폴리오를 강화하세요',
    '커뮤니티에 적극적으로 참여하여 네트워크를 넓히세요',
  ],
}
```

### 2.3 Fast Track (빠른 취업 경로)

**PathInfo**:
```typescript
{
  id: 'fast',
  type: 'fast',
  label: '빠른 취업 경로',
}
```

**노드 목록** (monthsFromNow: 1, 3, 6, 9, 12):

```typescript
// fast-1: monthsFromNow=1
{
  id: 'fast-1',
  type: 'step',
  label: 'HTML/CSS + JavaScript 기초 속성 완성',
  description: '1개월 동안 웹의 기본 3요소를 집중적으로 학습합니다. 하루 4시간 이상 투자하면 이 기간 안에 기본 웹 페이지를 만들 수 있어요. 지루해도 기초가 전부입니다.',
  monthsFromNow: 1,
  track: 'fast',
  difficulty: 'low',
  tips: [
    'freeCodeCamp의 Responsive Web Design 인증 과정을 활용하세요',
    '배운 내용을 즉시 실습하는 "배운 즉시 만들기" 원칙을 지키세요',
    'JavaScript는 ES6+ 문법 위주로 학습하세요',
  ],
}

// fast-2: monthsFromNow=3
{
  id: 'fast-2',
  type: 'step',
  label: 'React 기초 + 첫 번째 SPA 완성',
  description: '2개월에 걸쳐 React의 핵심 개념(컴포넌트, 상태, 이벤트)을 익히고 단일 페이지 애플리케이션을 완성합니다. 취업 시장에서 React는 필수입니다.',
  monthsFromNow: 3,
  track: 'fast',
  difficulty: 'medium',
  tips: [
    '공식 React 문서를 처음부터 끝까지 읽어보세요 (최신화되어 훨씬 좋아졌습니다)',
    'useState, useEffect, useContext 세 가지 훅만 마스터해도 대부분의 앱을 만들 수 있어요',
    '첫 프로젝트는 "할 일 목록"이나 "날씨 앱"같은 작고 완성 가능한 것으로 시작하세요',
  ],
}

// fast-3: monthsFromNow=6
{
  id: 'fast-3',
  type: 'step',
  label: 'Node.js + Express API 서버 구축',
  description: '프론트엔드의 기반을 다진 후 백엔드로 확장합니다. Node.js와 Express로 REST API를 만들고, 데이터베이스(PostgreSQL 또는 MongoDB)와 연동하는 풀스택 경험을 쌓아요.',
  monthsFromNow: 6,
  track: 'fast',
  difficulty: 'medium',
  tips: [
    'Express보다 Next.js API Routes로 시작하면 프론트-백 통합이 더 쉬워요',
    'CRUD 기능이 완전히 동작하는 작은 프로젝트를 반드시 완성하세요',
    'Postman이나 Thunder Client로 API를 직접 테스트하는 습관을 들이세요',
  ],
}

// fast-4: monthsFromNow=9
{
  id: 'fast-4',
  type: 'step',
  label: '포트폴리오 프로젝트 완성 + 이력서 작성',
  description: '취업을 위한 핵심 단계입니다. 3개월 동안 실제 서비스처럼 동작하는 풀스택 프로젝트 2~3개를 완성하고, 이를 GitHub에 정리하며 이력서를 작성합니다.',
  monthsFromNow: 9,
  track: 'fast',
  difficulty: 'high',
  tips: [
    '포트폴리오 프로젝트는 "본인이 실제로 쓰고 싶은 서비스"로 만들어야 열정이 보입니다',
    'README.md에 기술 선택 이유와 개발 과정을 자세히 작성하세요',
    '배포까지 완료된 프로젝트가 GitHub 링크만 있는 것보다 훨씬 인상적입니다',
  ],
}

// fast-5: monthsFromNow=12
{
  id: 'fast-5',
  type: 'step',
  label: '취업 활동 시작 + 첫 개발자 포지션 획득',
  description: '1년간의 준비를 마치고 본격적인 취업 활동에 돌입합니다. 이력서 제출, 기술 면접, 코딩 테스트 등을 경험하며 첫 개발자 포지션을 찾아냅니다.',
  monthsFromNow: 12,
  track: 'fast',
  difficulty: 'high',
  tips: [
    '1일 1 알고리즘 문제를 풀며 코딩 테스트를 준비하세요',
    '기술 면접에서는 모르는 것을 솔직하게 인정하는 것이 오히려 좋은 인상을 줍니다',
    '거절을 두려워하지 마세요. 평균 50~100개를 지원해야 1개가 됩니다',
  ],
}
```

### 2.4 Deep Dive (체계적 학습 경로)

**PathInfo**:
```typescript
{
  id: 'deep',
  type: 'deep',
  label: '체계적 학습 경로',
}
```

**노드 목록** (monthsFromNow: 2, 6, 12, 18, 24, 30):

```typescript
// deep-1: monthsFromNow=2
{
  id: 'deep-1',
  type: 'step',
  label: '컴퓨터 과학 기초 + 프로그래밍 원리 정립',
  description: '표면적인 문법 암기가 아닌 컴퓨터가 동작하는 원리부터 이해합니다. 자료구조, 알고리즘 기초, 네트워크 기본 개념을 익히며 탄탄한 토대를 쌓아요. 느리게 가지만 가장 오래 갑니다.',
  monthsFromNow: 2,
  track: 'deep',
  difficulty: 'medium',
  tips: [
    'CS50x(하버드 무료 강의)로 컴퓨터 과학 기초를 체계적으로 학습하세요',
    '자료구조는 배열, 연결 리스트, 스택, 큐, 해시맵 다섯 가지를 완전히 이해하는 것이 목표예요',
    '이론을 배운 후 반드시 직접 코드로 구현해보세요',
  ],
}

// deep-2: monthsFromNow=6
{
  id: 'deep-2',
  type: 'step',
  label: 'JavaScript 심화 + TypeScript 도입',
  description: 'JavaScript의 내부 동작 원리(클로저, 프로토타입, 이벤트 루프, 비동기)를 깊이 이해하고, TypeScript로 타입 안전한 코드 작성법을 익힙니다. 이 단계를 마치면 다른 개발자들이 어려워하는 코드를 쉽게 읽을 수 있어요.',
  monthsFromNow: 6,
  track: 'deep',
  difficulty: 'high',
  tips: [
    '"You Don\'t Know JS" 시리즈를 읽어보세요 (무료 온라인 제공)',
    'TypeScript 공식 핸드북은 처음부터 끝까지 한 번은 읽어야 합니다',
    '코드 리뷰 문화가 있는 오픈소스 프로젝트에 기여해보세요',
  ],
}

// deep-3: monthsFromNow=12
{
  id: 'deep-3',
  type: 'step',
  label: 'React + Next.js + 상태 관리 마스터',
  description: '프론트엔드 생태계를 깊이 파악합니다. React의 내부 동작(Virtual DOM, Reconciliation), Next.js의 렌더링 전략(SSR/SSG/ISR), Zustand나 Jotai 같은 현대적 상태 관리를 학습해요.',
  monthsFromNow: 12,
  track: 'deep',
  difficulty: 'high',
  tips: [
    'React 공식 문서의 "Thinking in React" 섹션을 반복해서 읽으세요',
    'Next.js App Router와 Pages Router의 차이를 실제로 구현하며 이해하세요',
    '상태 관리 라이브러리는 3개 이상 써보고 각각의 장단점을 비교해보세요',
  ],
}

// deep-4: monthsFromNow=18
{
  id: 'deep-4',
  type: 'step',
  label: '백엔드 아키텍처 + 데이터베이스 설계',
  description: '서버 사이드 개발의 원칙을 배웁니다. RESTful API 설계, 데이터베이스 정규화, 인덱싱 전략, 인증/인가 구현을 학습하며 확장 가능한 서비스를 만드는 방법을 이해해요.',
  monthsFromNow: 18,
  track: 'deep',
  difficulty: 'high',
  tips: [
    'Martin Fowler의 "Patterns of Enterprise Application Architecture"를 참고하세요',
    'PostgreSQL과 Redis를 함께 사용하는 프로젝트를 만들어보세요',
    'SQL 쿼리 최적화(EXPLAIN ANALYZE)를 직접 해보며 인덱스의 중요성을 체감하세요',
  ],
}

// deep-5: monthsFromNow=24
{
  id: 'deep-5',
  type: 'step',
  label: '대규모 풀스택 프로젝트 + 기술 블로그 운영',
  description: '지금까지 배운 모든 것을 통합한 대규모 프로젝트를 진행합니다. 동시에 학습 내용을 기술 블로그에 정리하며 지식을 공고히 하고 커뮤니티에서 이름을 알리기 시작해요.',
  monthsFromNow: 24,
  track: 'deep',
  difficulty: 'high',
  tips: [
    '프로젝트는 실제 사용자가 있는 서비스를 목표로 하세요',
    '기술 블로그는 "내가 3개월 전의 나에게 알려주고 싶은 것"을 쓰면 인기 있어요',
    '코드 리뷰를 요청하고 피드백을 적극적으로 수용하세요',
  ],
}

// deep-6: monthsFromNow=30
{
  id: 'deep-6',
  type: 'step',
  label: '시니어 레벨 취업 또는 창업 준비',
  description: '2.5년의 체계적 학습을 마쳤습니다. 탄탄한 CS 기반과 깊은 실력으로 시니어 개발자에 가까운 수준에 도달했어요. 좋은 회사에 주니어로 입사하거나 직접 서비스를 만드는 창업도 선택지가 됩니다.',
  monthsFromNow: 30,
  track: 'deep',
  difficulty: 'high',
  tips: [
    '취업 시 연봉 협상에서 자신감을 가지세요. 당신의 실력은 증명되었습니다',
    '창업을 선택한다면 첫 MVP는 2~4주 안에 출시할 수 있을 만큼 작게 시작하세요',
    '어떤 선택이든 지금까지의 여정이 헛되지 않았습니다',
  ],
}
```

### 2.5 Risk Track (프리랜서/창업 도전 경로)

**PathInfo**:
```typescript
{
  id: 'risk',
  type: 'risk',
  label: '프리랜서 도전 경로',
}
```

**노드 목록** (monthsFromNow: 1, 4, 8, 14, 18):

```typescript
// risk-1: monthsFromNow=1
{
  id: 'risk-1',
  type: 'step',
  label: '즉시 실전 투입 - 첫 클라이언트 프로젝트 수주',
  description: '배우면서 동시에 돈을 버는 전략입니다. 간단한 랜딩 페이지나 WordPress 커스터마이징부터 시작하여 실전 경험과 수익을 동시에 얻어요. 두렵겠지만, 도전이 당신을 성장시킵니다.',
  monthsFromNow: 1,
  track: 'risk',
  difficulty: 'high',
  tips: [
    '크몽, 라우드소싱, Upwork에서 소규모 프로젝트를 찾아보세요',
    '처음에는 낮은 가격으로 시작해서 후기와 신뢰를 쌓는 것이 먼저예요',
    '모르는 것이 있어도 "배우면서 해낼 수 있다"는 자신감이 중요합니다',
  ],
}

// risk-2: monthsFromNow=4
{
  id: 'risk-2',
  type: 'step',
  label: '월 100만원 프리랜서 수익 달성',
  description: '3개월간의 도전 끝에 안정적인 프리랜서 수익 기반을 만들었습니다. 레퍼런스가 쌓이면서 더 좋은 프로젝트를 받을 수 있게 되고, 시간당 단가도 올라가기 시작해요.',
  monthsFromNow: 4,
  track: 'risk',
  difficulty: 'high',
  tips: [
    '각 프로젝트를 포트폴리오로 꼼꼼히 정리하세요',
    '클라이언트와의 커뮤니케이션 스킬이 기술만큼 중요합니다',
    '계약서 작성을 절대 생략하지 마세요',
  ],
}

// risk-3: monthsFromNow=8
{
  id: 'risk-3',
  type: 'step',
  label: '사이드 프로젝트 론칭 + 자체 서비스 도전',
  description: '프리랜서 수익을 안정화한 후 자신만의 서비스를 만들기 시작합니다. 클라이언트 일을 하면서 남는 시간에 원하는 서비스를 만들어 론칭해보세요. 실패해도 배움이 됩니다.',
  monthsFromNow: 8,
  track: 'risk',
  difficulty: 'high',
  tips: [
    'Product Hunt에 론칭하여 초기 사용자 피드백을 받으세요',
    'MVP는 핵심 기능 하나만으로 시작하세요. 나머지는 사용자가 원할 때 추가해요',
    'IndieHackers 커뮤니티에서 같은 도전을 하는 사람들과 연결하세요',
  ],
}

// risk-4: monthsFromNow=14
{
  id: 'risk-4',
  type: 'step',
  label: '서비스 첫 유료 고객 획득 또는 팀 빌딩',
  description: '자체 서비스가 첫 유료 구독자를 얻거나, 함께할 팀원을 찾기 시작하는 분기점입니다. 이 단계에서 방향을 결정해야 해요 — 1인 개발자로 성장하거나, 스타트업으로 발전하거나.',
  monthsFromNow: 14,
  track: 'risk',
  difficulty: 'high',
  tips: [
    '첫 유료 고객은 가장 소중한 피드백 소스입니다. 정기적으로 대화하세요',
    '팀을 꾸린다면 기술이 아닌 가치관이 맞는 사람을 먼저 찾으세요',
    '번아웃 예방을 위해 주 1일은 반드시 쉬는 날로 지키세요',
  ],
}

// risk-5: monthsFromNow=18
{
  id: 'risk-5',
  type: 'step',
  label: '독립 개발자 또는 스타트업 창업자로 자리잡기',
  description: '18개월의 도전 끝에 자신만의 길을 개척했습니다. 안정적인 수익을 가진 1인 개발자이거나, 성장 가능성이 있는 스타트업의 창업자가 되었어요. 이 길은 쉽지 않았지만, 당신만의 이야기가 생겼습니다.',
  monthsFromNow: 18,
  track: 'risk',
  difficulty: 'high',
  tips: [
    '지금까지의 여정을 글로 정리하세요. 당신의 이야기는 누군가에게 큰 영감이 됩니다',
    '수익이 안정되면 재투자 계획을 세우세요 (학습, 마케팅, 팀 확장)',
    '커뮤니티에 베풀기 시작하세요. 도움받은 것을 돌려줄 차례입니다',
  ],
}
```

### 2.6 MergePoints (합류점 2개)

```typescript
// merge-1: 1차 합류점 (모든 경로가 처음 만나는 지점)
{
  id: 'merge-1',
  label: '첫 번째 만남 — 기술 스택 정착',
  message: '속도가 달랐을 뿐, 결국 같은 곳을 향하고 있었네요. 빠르게 달린 분도, 깊이 파고든 분도, 모험을 택한 분도 — 이 지점에서 여러분 모두 기본기를 갖춘 개발자가 되었습니다.',
  connectedPaths: ['fast', 'deep', 'risk'],
  monthsFromNow: 12,
}

// merge-2: 2차 합류점 (최종 합류)
{
  id: 'merge-2',
  label: '마지막 합류 — 풀스택의 문 앞에서',
  message: '빠른 길이든, 깊은 길이든, 모험의 길이든 — 여기서 하나가 됩니다. 어떤 경로를 선택했든 당신의 선택은 옳았습니다. 이제 풀스택 개발자라는 목표가 눈앞에 있습니다.',
  connectedPaths: ['fast', 'deep', 'risk'],
  monthsFromNow: 18,
}
```

---

## 3. GENERIC_MOCK - "나만의 목표 달성하기" (백업 세트)

범용 목표에 대한 백업 Mock 데이터. 구조는 FULLSTACK_MOCK과 동일하며 콘텐츠만 일반화됨.

### 3.1 요약

| 항목 | 값 |
|------|---|
| startNode | 현재 위치에서의 출발 |
| goalNode | 목표 달성 |
| Fast 노드 수 | 4개 (monthsFromNow: 2, 5, 9, 12) |
| Deep 노드 수 | 5개 (monthsFromNow: 3, 8, 14, 20, 24) |
| Risk 노드 수 | 4개 (monthsFromNow: 1, 5, 10, 15) |
| mergePoints | 1개 (monthsFromNow: 12) |

### 3.2 핵심 노드 (요약)

```typescript
// generic startNode
{
  id: 'gen-start',
  type: 'start',
  label: '새로운 목표를 향한 출발',
  description: '모든 위대한 여정은 첫 발걸음에서 시작됩니다. 어떤 경로를 선택하든 지금 이 순간이 변화의 시작입니다.',
  monthsFromNow: 0,
  track: 'fast',
  difficulty: 'low',
  tips: ['목표를 글로 적어보세요', '작은 것부터 시작하세요', '완벽한 시작보다 불완전한 시작이 낫습니다'],
}

// generic goalNode
{
  id: 'gen-goal',
  type: 'goal',
  label: '목표 달성 완료',
  description: '선택한 경로를 끝까지 걸어온 당신. 결과보다 중요한 것은 이 여정에서 성장한 자신입니다.',
  monthsFromNow: 24,
  track: 'deep',
  difficulty: 'high',
  tips: ['다음 목표를 설정하세요', '지금까지의 여정을 기록하세요'],
}

// generic merge-1
{
  id: 'gen-merge-1',
  label: '어떤 길이든 여기서 만납니다',
  message: '돌아가도 괜찮아요, 결국 여기서 만나니까요. 빠르게 왔든 천천히 왔든, 여러분 모두 앞으로 나아가고 있습니다.',
  connectedPaths: ['fast', 'deep', 'risk'],
  monthsFromNow: 12,
}
```

---

## 4. Mock 데이터 구조 검증 체크리스트

구현 완료 후 아래 항목을 수동으로 확인하세요:

- [ ] FULLSTACK_MOCK: `paths` 배열에 'fast', 'deep', 'risk' ID를 가진 PathInfo 3개 존재
- [ ] FULLSTACK_MOCK: Fast Track 노드 monthsFromNow 오름차순 정렬: 1 < 3 < 6 < 9 < 12
- [ ] FULLSTACK_MOCK: Deep Dive 노드 monthsFromNow 오름차순 정렬: 2 < 6 < 12 < 18 < 24 < 30
- [ ] FULLSTACK_MOCK: Risk Track 노드 monthsFromNow 오름차순 정렬: 1 < 4 < 8 < 14 < 18
- [ ] FULLSTACK_MOCK: `mergePoints[0].connectedPaths`에 ['fast', 'deep', 'risk'] 모두 포함
- [ ] FULLSTACK_MOCK: `mergePoints[1].connectedPaths`에 ['fast', 'deep', 'risk'] 모두 포함
- [ ] GENERIC_MOCK: 최소 1개의 mergePoint 존재
- [ ] 모든 PathNode의 `type` 값이 'start' | 'step' | 'merge' | 'goal' 중 하나
- [ ] 모든 PathNode의 `track` 값이 'fast' | 'deep' | 'risk' 중 하나
- [ ] 모든 difficulty 값이 'low' | 'medium' | 'high' 중 하나 (또는 undefined)
- [ ] TypeScript: `tsc --noEmit` 오류 없음
