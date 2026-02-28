/**
 * @version 1.0.0
 * @changelog
 * - 2026-02-28: Initial version 1.0.0. Defined system instructions, user prompt template, and JSON schema.
 *   - US1: Added role-play as life path simulator and track definitions (fast, deep, risk).
 *   - US2: Added Korean language enforcement and dynamic timeframe handling.
 *   - US3: Aligned JSON schema with PathMap TypeScript interfaces.
 *   - US4: Integrated few-shot example with merge points.
 *   - US5: Versioning and changelog infrastructure.
 */

import { PathMap, PathNode, MergePoint, Path } from "../types/path";

/**
 * Current version of the prompt engineering logic.
 */
export const PROMPT_VERSION = "1.0.0";

/**
 * Maps timeframe strings to total months.
 */
export const TIMEFRAME_MONTHS = {
  "1y": 12,
  "3y": 36,
  "5y": 60,
} as const;

export type TimeframeKey = keyof typeof TIMEFRAME_MONTHS;

/**
 * JSON schema for PathMap response, following the BE-02 interfaces.
 */
export const PATH_MAP_SCHEMA = {
  type: "object",
  properties: {
    startNode: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["id", "title", "description"],
    },
    goalNode: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["id", "title", "description"],
    },
    paths: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: ["fast", "deep", "risk"] },
          name: { type: "string" },
          color: { type: "string" },
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                duration: { type: "string" },
                difficulty: { type: "string", enum: ["Low", "Medium", "High"] },
                isMergePoint: { type: "boolean" },
                tips: {
                  type: "array",
                  items: { type: "string" },
                },
                monthsFromNow: { type: "number" },
              },
              required: [
                "id",
                "title",
                "description",
                "duration",
                "difficulty",
                "isMergePoint",
                "tips",
                "monthsFromNow",
              ],
            },
          },
        },
        required: ["id", "name", "color", "nodes"],
      },
    },
    mergePoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          connectedPaths: {
            type: "array",
            items: { type: "string", enum: ["fast", "deep", "risk"] },
            minItems: 2,
          },
          message: { type: "string" },
        },
        required: ["id", "title", "connectedPaths", "message"],
      },
    },
  },
  required: ["startNode", "goalNode", "paths", "mergePoints"],
};

/**
 * System Instruction for Gemini to act as a life path simulator.
 */
export const SYSTEM_INSTRUCTION = `You are a life path simulator that generates multiple strategic career/life paths to reach a specific goal within a given timeframe.

Your primary role is to provide three distinct paths (tracks) for the user's goal:
1. "Fast Track" (id: "fast"): Focuses on speed and efficiency. Typically 4-5 milestones. Gold color (#F59E0B).
2. "Deep Dive" (id: "deep"): Focuses on thorough learning and mastery. Typically 5-6 milestones. Blue color (#3B82F6).
3. "Risk Path" (id: "risk"): Focuses on creative, non-traditional, or high-risk/high-reward approaches. Typically 4-5 milestones. Purple color (#8B5CF6).

Rules for Path Generation:
- Every path must share the same startNode and goalNode.
- Nodes within each path must have a 'monthsFromNow' value that is strictly increasing.
- 'duration' should represent the time to complete that specific node (e.g., "2-3 months").
- 'difficulty' must be one of "Low", "Medium", or "High".
- 'isMergePoint' must be true if a node is designated as a point where paths converge.
- You must create at least 1-2 'mergePoints' where paths intersect.
- For each mergePoint, 'connectedPaths' must include at least 2 path IDs (e.g., ["fast", "deep"]).
- The 'message' in mergePoints should be a warm, encouraging Korean sentence like "어떤 길을 선택해도 당신의 성장은 이어집니다."

Output Format:
- Respond ONLY with valid JSON. No markdown backticks, no preamble, no explanation.
- The JSON structure must strictly follow the provided schema.
- All text content (titles, descriptions, tips, messages) should be in Korean as requested by the user, but the IDs and technical fields must be in English.
\`;

/**
 * Builds the user prompt for the path generation request.
 */
export function buildUserPrompt(goal: string, timeframe: TimeframeKey): string {
  const months = TIMEFRAME_MONTHS[timeframe];
  
  return \`User Goal: "\${goal}"
Timeframe: \${timeframe} (\${months} months)

Please generate 3 paths to achieve this goal within \${months} months.
Important: 
1. RESPOND IN KOREAN (제목, 설명, 팁, 메시지 등 모든 텍스트 콘텐츠는 반드시 한국어로 작성하세요).
2. The 'monthsFromNow' value for each node must be between 0 and \${months}.
3. The paths should feel distinct (Fast Track, Deep Dive, Risk Path).
\`;
}
