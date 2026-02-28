# Implementation Plan: B3 Reverse Planning
**Branch**: `018-b3-gemini` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

## Summary
Add a reverse planning option that switches the Gemini prompt to generate steps from the final goal down to the present, and visualizes this backwards tree.

## Technical Context
**Language/Version**: TypeScript, Next.js 15, Zustand

## Project Structure
- `lib/prompts.ts`
- `components/GoalInput.tsx`
- `app/api/paths/route.ts`