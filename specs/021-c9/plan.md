# Implementation Plan: C9 Mindmap Node Expansion
**Branch**: `021-c9` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

## Summary
Allow nodes to be expanded like a mindmap, requesting a detailed sub-step breakdown from Gemini and injecting it into the graph with auto-layout.

## Technical Context
**Dependencies**: reactflow, dagre

## Project Structure
- `app/api/paths/expand/route.ts`
- `lib/graphUtils.ts`