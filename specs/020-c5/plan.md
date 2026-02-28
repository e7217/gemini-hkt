# Implementation Plan: C5 Interactive Branch Selection
**Branch**: `020-c5` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

## Summary
Add interactive decision points to the map, allowing users to commit to a branch, visually dimming alternative routes using React Flow edge/node styling.

## Technical Context
**Dependencies**: reactflow

## Project Structure
- `components/nodes/MergeNode.tsx` or new `DecisionNode.tsx`
- `store/usePathStore.ts`