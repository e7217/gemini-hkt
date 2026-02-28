# Implementation Plan: F4 Path Success Probability
**Branch**: `023-f4-ai` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

## Summary
Add path-level metrics (success probability and difficulty) calculated by Gemini, and display them in the UI to guide user choices.

## Technical Context
**Dependencies**: Zod

## Project Structure
- `types/path.ts`
- `lib/prompts.ts`
- `components/TrackLegend.tsx`