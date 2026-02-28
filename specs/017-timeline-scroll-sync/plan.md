# Implementation Plan: Timeline Scroll Sync

**Branch**: `017-timeline-scroll-sync` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-timeline-scroll-sync/spec.md`

## Summary
Implement mouse wheel and trackpad scroll interactions to control the timeline state, automatically synchronizing the React Flow canvas viewport to focus on newly revealed nodes.

## Technical Context
**Language/Version**: TypeScript, React 18, Next.js 15
**Primary Dependencies**: reactflow, zustand
**Target Platform**: Web Browsers

## Constitution Check
*GATE: Passed. Enhances user experience by providing an intuitive navigation method aligned with the core vision of exploring life paths.*

## Project Structure

### Documentation (this feature)
```text
specs/017-timeline-scroll-sync/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)
```text
components/
├── PathMap/
│   ├── PathMapCanvas.tsx
│   └── index.tsx
store/
├── usePathStore.ts
└── useLifePathStore.ts
lib/
└── timelineFilter.ts
```

**Structure Decision**: Integrate scroll event listeners within the `PathMapCanvas` or wrapper component, modifying the global timeline state in the Zustand store. Use `reactflow`'s `useReactFlow` hook to programmatically pan/zoom to active nodes.

## Complexity Tracking
**Risk**: Conflicting with native React Flow scroll/zoom behavior.
**Mitigation**: Disable native scroll zoom when `timeline-scroll-sync` is active. For MVP, we will capture `onWheel` events and call `e.preventDefault()`, then manually update the timeline state and use `fitBounds` or `setCenter` for the newly revealed nodes.