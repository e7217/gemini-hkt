# Implementation Plan: H5 Calendar Integration
**Branch**: `024-h5` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

## Summary
Add a calendar integration feature that computes the absolute dates of a path's milestones and provides an option to download them as an `.ics` file or push them to Google Calendar.

## Technical Context
**Language/Version**: TypeScript, Next.js 15
**Dependencies**: `ics` (for creating iCal files) or Google APIs

## Project Structure
- `lib/calendarUtils.ts` (new: for date arithmetic and generating calendar events)
- `components/DetailPanel.tsx` (or new `ExportPanel.tsx`)
- `app/api/calendar/route.ts` (optional, if server-side generation is needed)