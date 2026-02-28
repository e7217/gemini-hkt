# Implementation Plan: B5 Conditional Branching
**Branch**: `019-b5` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

## Summary
Implement a feature that lets users select a node and prompt Gemini for a conditional sub-path which is dynamically injected into the current map.

## Technical Context
**Dependencies**: reactflow, zustand

## Project Structure
- `app/api/paths/branch/route.ts` (new)
- `components/PathMap/PathMapCanvas.tsx`
- `store/usePathStore.ts`