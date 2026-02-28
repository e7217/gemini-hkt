# Developer Quickstart: FE-03 React Flow 캔버스 + 커스텀 노드 구현

**Created**: 2026-02-28

This guide covers how to run, test, and verify the React Flow PathMap visualization during development.

---

## Prerequisites

Ensure the following are installed (check `package.json`):

```json
{
  "@xyflow/react": "^12.0.0",
  "@dagrejs/dagre": "^1.0.0",
  "next": "^14.0.0",
  "typescript": "^5.0.0"
}
```

If missing, install with:
```bash
npm install @xyflow/react @dagrejs/dagre
```

---

## 1. Testing the PathMap Component with Mock Data

The fastest way to verify the canvas renders correctly is to use the mock PathMap directly, bypassing the Gemini API entirely.

### Step 1: Import the mock PathMap

```typescript
// In any page or test component:
import { mockPathMap } from '@/lib/mockData'
```

If `lib/mockData.ts` does not yet export a `mockPathMap`, create a minimal fixture:

```typescript
// lib/mockData.ts (minimal fixture for canvas testing)
import type { PathMap } from '@/types/path'

export const mockPathMap: PathMap = {
  startNode: {
    id: 'start-1',
    type: 'start',
    label: '시작',
    description: '지금 이 순간',
    monthsFromNow: 0,
    track: 'fast',
  },
  goalNode: {
    id: 'goal-1',
    type: 'goal',
    label: '풀스택 개발자',
    description: '목표 달성!',
    monthsFromNow: 36,
    track: 'fast',
  },
  paths: [
    {
      id: 'fast',
      type: 'fast',
      label: 'Fast Track',
      nodes: [
        { id: 'fast-1', type: 'step', label: 'JavaScript 기초', description: '기본 문법 학습', monthsFromNow: 3, track: 'fast', difficulty: 2 },
        { id: 'fast-2', type: 'step', label: 'React 입문', description: '컴포넌트 기초', monthsFromNow: 6, track: 'fast', difficulty: 3 },
      ],
    },
    {
      id: 'deep',
      type: 'deep',
      label: 'Deep Dive',
      nodes: [
        { id: 'deep-1', type: 'step', label: 'CS 기초 이론', description: '알고리즘/자료구조', monthsFromNow: 4, track: 'deep', difficulty: 4 },
        { id: 'deep-2', type: 'step', label: '시스템 설계', description: '아키텍처 패턴', monthsFromNow: 10, track: 'deep', difficulty: 5 },
      ],
    },
    {
      id: 'risk',
      type: 'risk',
      label: 'Risk Path',
      nodes: [
        { id: 'risk-1', type: 'step', label: '스타트업 합류', description: '실전 경험', monthsFromNow: 2, track: 'risk', difficulty: 4 },
        { id: 'risk-2', type: 'step', label: '프로젝트 주도', description: '리더십 경험', monthsFromNow: 8, track: 'risk', difficulty: 5 },
      ],
    },
  ],
  mergePoints: [
    {
      id: 'merge-1',
      label: '합류점',
      message: '어떤 길이든 괜찮다',
      connectedPaths: ['fast', 'deep', 'risk'],
      monthsFromNow: 18,
    },
  ],
}
```

### Step 2: Use the PathMap component

```typescript
// app/page.tsx (or app/test/page.tsx for isolated testing)
import dynamic from 'next/dynamic'
import { mockPathMap } from '@/lib/mockData'

const PathMap = dynamic(() => import('@/components/PathMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full text-white/50">
      Loading canvas...
    </div>
  ),
})

export default function TestPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <PathMap pathMap={mockPathMap} />
    </div>
  )
}
```

### Step 3: Run the dev server

```bash
npm run dev
# Open http://localhost:3000 (or /test if on a separate route)
```

---

## 2. Verifying dagre BT Layout

### Visual Verification Checklist

Open the page in the browser and verify:

- [ ] **Start node is at the bottom** of the canvas (lowest Y position in screen space).
- [ ] **Goal node is at the top** of the canvas (highest Y position in screen space).
- [ ] **No nodes overlap** — each node has clear separation both horizontally and vertically.
- [ ] **Edges flow upward** — all connection lines go from lower nodes to upper nodes.
- [ ] **Three tracks fan out** horizontally from the start node.
- [ ] **Merge point** appears at a shared rank above the track step nodes.

### Console Verification

Open browser DevTools and paste this in the Console to inspect node positions:

```javascript
// Inspect React Flow internal state (development only)
// Works with React DevTools or by reading the data attributes
document.querySelectorAll('[data-id]').forEach(el => {
  const transform = el.style.transform
  console.log(el.dataset.id, transform)
})
```

Verify that Y transform values increase as you go up the tree (in React Flow, lower Y = higher on screen).

### Programmatic Layout Test

If you want to test the dagre layout without rendering, call `pathMapToFlow` directly in a browser console or test file:

```typescript
import { pathMapToFlow } from '@/lib/graphUtils'
import { mockPathMap } from '@/lib/mockData'

const { nodes } = pathMapToFlow(mockPathMap)

const startNode = nodes.find(n => n.type === 'startNode')
const goalNode = nodes.find(n => n.type === 'goalNode')

// In BT layout, lower Y = higher on screen
// Start should have higher Y number, goal should have lower Y number
console.assert(startNode.position.y > goalNode.position.y,
  'Start node should have higher Y than goal node (BT layout)')

// No two nodes should overlap
nodes.forEach((a, i) => {
  nodes.slice(i + 1).forEach((b) => {
    const dx = Math.abs(a.position.x - b.position.x)
    const dy = Math.abs(a.position.y - b.position.y)
    const aW = 200 // stepNode width
    const aH = 80
    if (dx < aW && dy < aH) {
      console.warn(`Potential overlap: ${a.id} and ${b.id}`)
    }
  })
})
```

---

## 3. Testing Individual Node Components in Isolation

To verify each node component's appearance without the full canvas, render them directly:

```typescript
// app/node-test/page.tsx
'use client'

import StartNode from '@/components/nodes/StartNode'
import StepNode from '@/components/nodes/StepNode'
import GoalNode from '@/components/nodes/GoalNode'
import MergeNode from '@/components/nodes/MergeNode'

// Minimal mock of NodeProps (omit React Flow internals for visual testing)
export default function NodeTestPage() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen flex flex-col gap-8">
      <h1 className="text-white text-2xl">Node Visual Test</h1>

      <div className="flex gap-8 items-center">
        <div>
          <p className="text-white/50 text-xs mb-2">StartNode</p>
          {/* @ts-ignore — mocking NodeProps */}
          <StartNode data={{ label: '시작', id: 'start-1' }} />
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">StepNode (fast)</p>
          {/* @ts-ignore */}
          <StepNode data={{ label: 'JavaScript 기초', description: '기본 문법', track: 'fast', monthsFromNow: 3 }} />
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">StepNode (deep)</p>
          {/* @ts-ignore */}
          <StepNode data={{ label: 'CS 기초 이론', description: '알고리즘', track: 'deep', monthsFromNow: 4 }} />
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">StepNode (risk)</p>
          {/* @ts-ignore */}
          <StepNode data={{ label: '스타트업 합류', description: '실전 경험', track: 'risk', monthsFromNow: 2 }} />
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">GoalNode</p>
          {/* @ts-ignore */}
          <GoalNode data={{ label: '풀스택 개발자', description: '목표 달성!' }} />
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">MergeNode</p>
          {/* @ts-ignore */}
          <MergeNode data={{ label: '합류점', message: '어떤 길이든 괜찮다', connectedPaths: ['fast', 'deep', 'risk'], monthsFromNow: 18 }} />
        </div>
      </div>
    </div>
  )
}
```

### Node Visual Checklist

- [ ] **StartNode**: Circle shape, pulsing ring animation visible (ring expands and fades repeatedly).
- [ ] **StepNode (fast)**: Gold border, gold glow (`box-shadow`).
- [ ] **StepNode (deep)**: Blue border, blue glow.
- [ ] **StepNode (risk)**: Purple border, purple glow.
- [ ] **GoalNode**: Star polygon shape, intense multi-color glow visible.
- [ ] **MergeNode**: Circle with tri-color gradient background, ◆ diamond icon visible in center.

---

## 4. Verifying SSR Safety

Run a production build to confirm no SSR errors:

```bash
npm run build
```

Watch the build output for any errors containing:
- `window is not defined`
- `ResizeObserver is not defined`
- `document is not defined`
- Hydration mismatch warnings

If the dynamic import with `ssr: false` is correctly set up, none of these should appear. If they do, check that:
1. The `PathMapCanvas` import in the page uses `dynamic(..., { ssr: false })`.
2. All files that import from `@xyflow/react` have `'use client'` as the first line.

---

## 5. Common Issues and Solutions

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Blank canvas, no nodes visible | `nodeTypes` defined inside component | Move `nodeTypes` to module level |
| Nodes all at position (0,0) | dagre layout not applied before passing to ReactFlow | Ensure `applyDagreLayout` is called in `pathMapToFlow` |
| `window is not defined` build error | Missing `dynamic({ ssr: false })` | Wrap PathMap in `next/dynamic` with `ssr: false` |
| Hydration error in browser | `'use client'` missing on a node file | Add `'use client'` to the failing component |
| Edges not showing | `edgeTypes` not registered / wrong type string | Verify `edgeTypes = { trackEdge: TrackEdge }` at module level |
| Nodes overlap | Wrong dimensions passed to dagre | Verify `NODE_DIMENSIONS` matches actual CSS sizes |
| React Flow shows default node | Node type string mismatch | Verify `node.type === 'stepNode'` matches `nodeTypes` key |
| Import error: `reactflow` not found | Using old package name | Change all imports to `@xyflow/react` |
