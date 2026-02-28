# Data Models: ALL-01 데모 테스트 + 최종 검증

**Date**: 2026-02-28
**Feature**: Demo Validation

These types represent the validation and test tracking data structures used during ALL-01. They are conceptual TypeScript types used to structure test results and demo execution tracking — not production application types.

---

## 1. TestResult

Represents the outcome of a single complete demo run (ACT 1–4).

### TypeScript Interface

```typescript
interface TestResult {
  runId: string;                    // e.g. "run-1", "run-2", "run-3"
  plan: 'A' | 'B';                  // Plan A = live API, Plan B = mock mode
  timestamp: string;                // ISO 8601, e.g. "2026-02-28T17:42:00Z"
  overallResult: 'pass' | 'fail';   // fail if any ACT has severity 'severe'
  acts: ActResult[];                // results for ACT 1 through 4
  performanceMetrics: PerformanceMetrics;
  consoleErrors: ConsoleError[];    // LifePath-originating errors only
  notes: string;                    // free-form notes from the tester
}

interface ActResult {
  actNumber: 1 | 2 | 3 | 4;
  actName: string;                  // e.g. "ACT 1: 시작", "ACT 2: 성장"
  result: 'pass' | 'fail' | 'skip';
  severity: 'none' | 'minor' | 'severe';
  observations: string;             // free-form description of what was observed
  bugs: BugObservation[];
}

interface BugObservation {
  id: string;                       // e.g. "BUG-001"
  description: string;
  severity: 'minor' | 'severe';
  actNumber: 1 | 2 | 3 | 4;
  screenshotPath?: string;          // optional path to screenshot evidence
}

interface ConsoleError {
  level: 'error' | 'warning';
  message: string;
  source: 'lifepath' | 'library' | 'extension' | 'unknown';
  actNumber: 1 | 2 | 3 | 4;
}
```

### Example Usage

```typescript
const run1Result: TestResult = {
  runId: 'run-1',
  plan: 'A',
  timestamp: '2026-02-28T17:42:00Z',
  overallResult: 'pass',
  acts: [
    {
      actNumber: 1,
      actName: 'ACT 1: 시작',
      result: 'pass',
      severity: 'none',
      observations: '주사위 클릭 → 자동 채움 → 경로 생성. 로딩 애니메이션 표시. 맵 11.2초만에 표시.',
      bugs: [],
    },
    // ... ACT 2, 3, 4
  ],
  performanceMetrics: {
    apiResponseTimeMs: 11200,
    mapRenderTimeMs: 800,
    sliderResponseTimeMs: 150,
    nodeClickToPanelMs: 120,
    trackHighlightMs: 80,
  },
  consoleErrors: [],
  notes: 'Run 1 completed cleanly. API was slightly slow at 11.2s but within 15s target.',
};
```

---

## 2. DemoScenario

Represents the structured definition of the 3-minute demo scenario used as the reference for validation.

### TypeScript Interface

```typescript
interface DemoScenario {
  scenarioId: string;               // e.g. "fullstack-demo-v1"
  name: string;                     // e.g. "풀스택 개발자 되기 — 3분 데모"
  targetGoal: string;               // The goal string used in the demo
  totalDurationSeconds: number;     // Total expected duration (180s = 3min)
  acts: DemoAct[];
}

interface DemoAct {
  actNumber: 1 | 2 | 3 | 4;
  name: string;
  tagline: string;                  // The emotional message, e.g. "누구나 시작할 수 있다"
  durationSeconds: number;          // Expected duration for this ACT
  steps: DemoStep[];
}

interface DemoStep {
  stepNumber: number;               // Sequential within the ACT
  description: string;              // What the presenter does
  expectedOutcome: string;          // What should happen in the UI
  performanceTarget?: string;       // Optional: e.g. "≤ 15s", "≤ 300ms"
  isMandatory: boolean;             // If false, the step can be skipped without failing the ACT
}
```

### Canonical Demo Scenario Definition

```typescript
const lifepathDemoScenario: DemoScenario = {
  scenarioId: 'fullstack-demo-v1',
  name: '풀스택 개발자 되기 — 3분 데모',
  targetGoal: '풀스택 개발자 되기',
  totalDurationSeconds: 180,
  acts: [
    {
      actNumber: 1,
      name: 'ACT 1: 시작',
      tagline: '누구나 시작할 수 있다',
      durationSeconds: 30,
      steps: [
        {
          stepNumber: 1,
          description: '🎲 버튼 클릭',
          expectedOutcome: '"풀스택 개발자 되기"가 입력란에 자동 채워짐',
          performanceTarget: '≤ 100ms',
          isMandatory: true,
        },
        {
          stepNumber: 2,
          description: '"경로 생성하기" 버튼 클릭',
          expectedOutcome: '로딩 애니메이션 즉시 표시',
          performanceTarget: '≤ 300ms',
          isMandatory: true,
        },
        {
          stepNumber: 3,
          description: '로딩 완료 대기',
          expectedOutcome: '3경로 수직 맵으로 전환',
          performanceTarget: '≤ 15s (Plan A), ≤ 3s (Plan B)',
          isMandatory: true,
        },
      ],
    },
    {
      actNumber: 2,
      name: 'ACT 2: 성장',
      tagline: '당신의 나무가 자랍니다',
      durationSeconds: 50,
      steps: [
        {
          stepNumber: 1,
          description: '3경로 수직 맵 확인',
          expectedOutcome: 'Fast Track, Deep Dive, Risk Path 3개 트랙 보임',
          isMandatory: true,
        },
        {
          stepNumber: 2,
          description: '타임라인 슬라이더를 1년으로 설정',
          expectedOutcome: '1년 기준 노드들만 표시',
          performanceTarget: '≤ 300ms',
          isMandatory: true,
        },
        {
          stepNumber: 3,
          description: '타임라인 슬라이더를 3년으로 이동',
          expectedOutcome: '추가 노드들이 등장하며 경로 확장',
          performanceTarget: '≤ 300ms',
          isMandatory: true,
        },
        {
          stepNumber: 4,
          description: '타임라인 슬라이더를 5년으로 이동',
          expectedOutcome: '목표 노드까지 전체 경로 표시',
          performanceTarget: '≤ 300ms',
          isMandatory: true,
        },
      ],
    },
    {
      actNumber: 3,
      name: 'ACT 3: 합류',
      tagline: '어떤 길이든 괜찮다',
      durationSeconds: 30,
      steps: [
        {
          stepNumber: 1,
          description: '합류점 노드 가리키기',
          expectedOutcome: '다색 그라데이션 합류점 노드 확인',
          isMandatory: true,
        },
        {
          stepNumber: 2,
          description: '경로 노드 클릭',
          expectedOutcome: '상세 패널이 300ms 이내 열림',
          performanceTarget: '≤ 300ms',
          isMandatory: true,
        },
        {
          stepNumber: 3,
          description: '트랙 클릭하여 하이라이트',
          expectedOutcome: '클릭한 트랙이 강조, 나머지 트랙 흐려짐',
          performanceTarget: '≤ 300ms',
          isMandatory: true,
        },
      ],
    },
    {
      actNumber: 4,
      name: 'ACT 4: 마무리',
      tagline: '인생에 오답은 없습니다',
      durationSeconds: 10,
      steps: [
        {
          stepNumber: 1,
          description: '최종 화면 확인',
          expectedOutcome: '깨끗한 최종 상태. 로딩 스피너 없음. 에러 없음.',
          isMandatory: true,
        },
        {
          stepNumber: 2,
          description: '콘솔 에러 확인',
          expectedOutcome: 'LifePath 관련 에러 0개',
          isMandatory: true,
        },
      ],
    },
  ],
};
```

---

## 3. PerformanceMetrics

Represents measured performance values from a single demo run.

### TypeScript Interface

```typescript
interface PerformanceMetrics {
  apiResponseTimeMs: number | null;   // null if Plan B (no API call)
  mapRenderTimeMs: number;            // From data received to all nodes painted
  sliderResponseTimeMs: number;       // Worst-case slider movement response
  nodeClickToPanelMs: number;         // From node click to panel visible
  trackHighlightMs: number;           // From track click to highlight visible
}
```

### Performance Targets Reference

```typescript
const PERFORMANCE_TARGETS = {
  apiResponseTimeMs: 15000,    // 15 seconds maximum for Plan A
  mapRenderTimeMs: 3000,       // 3 seconds maximum
  sliderResponseTimeMs: 300,   // 300ms maximum
  nodeClickToPanelMs: 300,     // 300ms maximum
  trackHighlightMs: 300,       // 300ms maximum
} as const;

function meetsAllTargets(metrics: PerformanceMetrics): boolean {
  const planA = metrics.apiResponseTimeMs !== null
    ? metrics.apiResponseTimeMs <= PERFORMANCE_TARGETS.apiResponseTimeMs
    : true; // Plan B has no API call
  return (
    planA &&
    metrics.mapRenderTimeMs <= PERFORMANCE_TARGETS.mapRenderTimeMs &&
    metrics.sliderResponseTimeMs <= PERFORMANCE_TARGETS.sliderResponseTimeMs &&
    metrics.nodeClickToPanelMs <= PERFORMANCE_TARGETS.nodeClickToPanelMs &&
    metrics.trackHighlightMs <= PERFORMANCE_TARGETS.trackHighlightMs
  );
}
```

---

## 4. CP3ValidationReport

Represents the final CP3 sign-off report confirming "데모 3회 연속 성공".

### TypeScript Interface

```typescript
interface CP3ValidationReport {
  reportId: 'CP3';
  completedAt: string;              // ISO 8601 timestamp
  planATested: boolean;
  planBTested: boolean;
  runs: TestResult[];               // Must have exactly 3 consecutive passing runs
  cp3Achieved: boolean;             // true only if all 3 runs pass with 0 severe bugs
  validatedBy: string;              // Name or identifier of the validator
  nextPhase: 'Phase 4: 발표 준비';  // Fixed — coding is done after CP3
  notes: string;
}
```

### CP3 Determination Logic

```typescript
function isCP3Achieved(report: CP3ValidationReport): boolean {
  if (report.runs.length < 3) return false;
  const lastThree = report.runs.slice(-3);
  return lastThree.every(run => run.overallResult === 'pass');
}
```

---

## 5. Type Dependency Summary

```
data-model.md (ALL-01 validation types — not in production source)
  ├── TestResult
  │     ├── ActResult[]
  │     │     └── BugObservation[]
  │     ├── PerformanceMetrics
  │     └── ConsoleError[]
  ├── DemoScenario
  │     └── DemoAct[]
  │           └── DemoStep[]
  └── CP3ValidationReport
        └── TestResult[]

PERFORMANCE_TARGETS (const) — referenced by PerformanceMetrics validation
```

These types are used for documentation, checklist tracking, and test result recording only. They are not imported into the LifePath production application.
