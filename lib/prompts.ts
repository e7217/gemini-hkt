/**
 * @module prompts
 * @description LifePath Gemini 프롬프트 엔지니어링 모듈
 * @version 1.0.0
 * @changelog
 * - 1.0.0 (2026-02-28): Initial version. System Instruction, User Prompt template,
 *   JSON Schema, Few-shot example for path simulation.
 */

import { z } from "zod";

export const PROMPT_VERSION = "1.0.0";

export const TIMEFRAME_MONTHS = {
  "1y": 12,
  "3y": 36,
  "5y": 60,
} as const;

export const PATH_MAP_SCHEMA = z.object({
  startNode: z.object({
    id: z.literal("start").or(z.string()),
    title: z.string(),
    description: z.string(),
  }),
  goalNode: z.object({
    id: z.literal("goal").or(z.string()),
    title: z.string(),
    description: z.string(),
  }),
  paths: z.array(
    z.object({
      id: z.enum(["fast", "deep", "risk"]),
      name: z.string(),
      color: z.string(),
      nodes: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          duration: z.string(),
          difficulty: z.enum(["Low", "Medium", "High"]),
          isMergePoint: z.boolean(),
          tips: z.array(z.string()),
          monthsFromNow: z.number().min(0),
        })
      ),
    })
  ).length(3),
  mergePoints: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      connectedPaths: z.array(z.string()).min(2),
      message: z.string(),
    })
  ).min(1),
});

export const SYSTEM_INSTRUCTION = `Role: You are a life path simulator. Given a Korean life goal, generate exactly 3 paths.

Path Types:
- fast: Fast Track (4-5 nodes) - Quick achievement, practical steps
- deep: Deep Dive (5-6 nodes) - Thorough learning, deep expertise
- risk: Risk Path (4-5 nodes) - Creative, unconventional approach

Output Format: Respond ONLY with valid JSON. No markdown, no explanation. Strictly follow the provided JSON schema.

Merge Point Rules:
- Include 1-2 merge points where paths converge
- For nodes that are merge points, their \`id\` MUST exactly match the \`id\` in the \`mergePoints\` array (e.g., "merge-1", "merge-2").
- Set \`isMergePoint: true\` on these merge point nodes.
- Both paths that converge must include a node with the same merge point \`id\` in their \`nodes\` array.
- List \`connectedPaths\` for each merge point in the \`mergePoints\` array (e.g., ["fast", "risk"])
- Write \`message\` as a warm, hopeful Korean sentence

monthsFromNow Rules:
- Must be monotonically increasing within each path
- Stay within the requested timeframe (1y=12mo, 3y=36mo, 5y=60mo)

Language: All content fields (title, description, tips, message) MUST be in Korean.`;

export function buildUserPrompt(goal: string, timeframe: "1y" | "3y" | "5y", isReverse: boolean = false): string {
  const months = TIMEFRAME_MONTHS[timeframe];

  const instruction = isReverse
    ? `위 목표를 달성하기 위한 3가지 인생 경로를 '역산 기법(Reverse Planning)'을 적용하여 생성해주세요. 최종 목표부터 현재로 거슬러 내려오는 방식으로 단계적 사고를 하되, 결과물인 \`monthsFromNow\`는 반드시 0개월(현재)부터 ${months}개월(목표 시점) 방향으로 단조 증가하도록 올바르게 정렬해서 출력해주세요.\n반드시 한국어로 응답하세요.`
    : `위 목표를 달성하기 위한 3가지 인생 경로를 생성해주세요.\n각 경로의 노드들은 0개월부터 ${months}개월 사이의 \`monthsFromNow\` 값을 가져야 하며, 경로 내에서 반드시 단조 증가해야 합니다.\n반드시 한국어로 응답하세요.`;

  return `목표: ${goal}
기간: ${timeframe} (${months}개월)

${instruction}

[Few-shot Example]
{
  "startNode": { "id": "start", "title": "소프트웨어 엔지니어 되기", "description": "소프트웨어 엔지니어로서의 커리어를 시작합니다." },
  "goalNode": { "id": "goal", "title": "시니어 소프트웨어 엔지니어", "description": "3년 후 목표 달성" },
  "paths": [
    {
      "id": "fast",
      "name": "Fast Track",
      "color": "#F59E0B",
      "nodes": [
        { "id": "fast-1", "title": "부트캠프 등록", "description": "단기 집중 코딩 부트캠프 수강", "duration": "3개월", "difficulty": "High", "isMergePoint": false, "tips": ["포트폴리오 완성에 집중하세요"], "monthsFromNow": 3 },
        { "id": "merge-1", "title": "스타트업 인턴십", "description": "실무 경험 쌓기", "duration": "3개월", "difficulty": "Medium", "isMergePoint": true, "tips": ["사수에게 많은 피드백을 요청하세요"], "monthsFromNow": 6 },
        { "id": "fast-3", "title": "주니어 개발자 취업", "description": "정규직 입사", "duration": "6개월", "difficulty": "Medium", "isMergePoint": false, "tips": ["팀 문화에 적응하세요"], "monthsFromNow": 12 },
        { "id": "fast-4", "title": "핵심 프로젝트 리딩", "description": "주도적인 개발 경험", "duration": "1년", "difficulty": "High", "isMergePoint": false, "tips": ["책임감을 가지고 진행하세요"], "monthsFromNow": 24 },
        { "id": "merge-2", "title": "시니어 승진", "description": "기술 스택의 깊이 확보", "duration": "1년", "difficulty": "Medium", "isMergePoint": true, "tips": ["후배 양성에도 힘쓰세요"], "monthsFromNow": 36 }
      ]
    },
    {
      "id": "deep",
      "name": "Deep Dive",
      "color": "#3B82F6",
      "nodes": [
        { "id": "deep-1", "title": "컴퓨터 공학 기초", "description": "CS 기초 지식 학습", "duration": "6개월", "difficulty": "Medium", "isMergePoint": false, "tips": ["자료구조와 알고리즘을 탄탄히 하세요"], "monthsFromNow": 6 },
        { "id": "deep-2", "title": "오픈소스 기여", "description": "글로벌 프로젝트 참여", "duration": "6개월", "difficulty": "High", "isMergePoint": false, "tips": ["작은 이슈부터 시작하세요"], "monthsFromNow": 12 },
        { "id": "deep-3", "title": "심화 기술 세미나", "description": "아키텍처 설계 학습", "duration": "6개월", "difficulty": "High", "isMergePoint": false, "tips": ["블로그에 배운 것을 정리하세요"], "monthsFromNow": 18 },
        { "id": "merge-2", "title": "시니어 승진", "description": "안정적인 커리어 시작", "duration": "6개월", "difficulty": "Medium", "isMergePoint": true, "tips": ["면접 준비에 시간을 투자하세요"], "monthsFromNow": 24 },
        { "id": "deep-5", "title": "사내 기술 강사", "description": "전문성 공유", "duration": "1년", "difficulty": "High", "isMergePoint": false, "tips": ["발표 자료를 체계적으로 만드세요"], "monthsFromNow": 36 }
      ]
    },
    {
      "id": "risk",
      "name": "Risk Path",
      "color": "#8B5CF6",
      "nodes": [
        { "id": "risk-1", "title": "해외 개발자 커뮤니티", "description": "글로벌 네트워킹", "duration": "6개월", "difficulty": "Medium", "isMergePoint": false, "tips": ["영어 소통 능력을 기르세요"], "monthsFromNow": 4 },
        { "id": "merge-1", "title": "스타트업 인턴십", "description": "실무 등등", "duration": "6개월", "difficulty": "High", "isMergePoint": true, "tips": ["자기 관리가 중요합니다"], "monthsFromNow": 10 },
        { "id": "risk-3", "title": "사이드 프로젝트 창업", "description": "자체 서비스 론칭", "duration": "1년", "difficulty": "High", "isMergePoint": false, "tips": ["마케팅도 함께 고민하세요"], "monthsFromNow": 24 },
        { "id": "merge-2", "title": "시니어 승진", "description": "개인 브랜딩 완성", "duration": "1년", "difficulty": "Medium", "isMergePoint": true, "tips": ["꾸준함이 생명입니다"], "monthsFromNow": 36 }
      ]
    }
  ],
  "mergePoints": [
    {
      "id": "merge-1",
      "title": "실무 경험의 교차점",
      "connectedPaths": ["fast", "risk"],
      "message": "어떤 방식으로든 실무에 부딪히며 성장하는 시기입니다. 당신의 도전을 응원합니다."
    },
    {
      "id": "merge-2",
      "title": "전문가로의 도약",
      "connectedPaths": ["fast", "deep", "risk"],
      "message": "각자의 길을 걸어왔지만, 결국 전문가라는 하나의 목표에서 만나게 됩니다."
    }
  ]
}

[Actual Request]
이제 실제 요청을 처리해주세요:
목표: ${goal}
기간: ${timeframe}`;
}

export const BRANCH_RESPONSE_SCHEMA = z.object({
  paths: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      nodes: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          duration: z.string(),
          difficulty: z.enum(["Low", "Medium", "High"]),
          isMergePoint: z.boolean(),
          tips: z.array(z.string()),
          monthsFromNow: z.number().min(0),
        })
      ),
    })
  ).min(1),
  mergePoints: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      connectedPaths: z.array(z.string()).min(2),
      message: z.string(),
    })
  ).optional(),
});

export const BRANCH_SYSTEM_INSTRUCTION = `Role: You are a life path simulator. You are generating a conditional branch path ("what-if" scenario) starting from a specific node in an existing life path.

Output Format: Respond ONLY with valid JSON. Strictly follow the provided JSON schema. Do not include startNode or goalNode.

Rules:
- The generated sub-path should represent an alternative route based on the provided condition.
- The sub-path MUST logically follow the starting node's timeline (monthsFromNow should be strictly greater than the starting node's monthsFromNow).
- You may include merge points if the new branch eventually connects back to an existing path, but it's optional.
- All content fields MUST be in Korean.`;

export function buildBranchPrompt(condition: string, startingNodeTitle: string, startingNodeMonths: number, goal: string): string {
  return `최종 목표: ${goal}
분기 시작점: ${startingNodeTitle} (${startingNodeMonths}개월 시점)
조건/상황: "만약 ${condition}?"

위 조건이 발생했을 때 나타날 수 있는 1개의 새로운 하위 경로(sub-path)를 생성해주세요.
이 새로운 경로의 첫 번째 노드는 분기 시작점 이후(${startingNodeMonths}개월 초과)의 시점을 가져야 합니다.
결과를 JSON으로 반환하세요.`;
}
