import { NextResponse } from 'next/server';
import { z } from 'zod';
import { callGemini } from '@/lib/gemini';
import { buildUserPrompt, SYSTEM_INSTRUCTION } from '@/lib/prompts';
import { getMockPathMap, withMockFallback } from '@/lib/mockData';
import type { PathMap } from '@/types/path';

export const SimulateRequestSchema = z.object({
  goal: z.string().min(1).max(500),
  timeframe: z.enum(['1y', '3y', '5y']).default('3y'),
});

const PathNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  difficulty: z.enum(['Low', 'Medium', 'High']),
  isMergePoint: z.boolean(),
  tips: z.array(z.string()),
  monthsFromNow: z.number(),
});

const MergePointSchema = z.object({
  id: z.string(),
  title: z.string(),
  connectedPaths: z.array(z.string()),
  message: z.string(),
});

const PathInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  nodes: z.array(PathNodeSchema),
});

const StartGoalNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const PathMapSchema = z.object({
  startNode: StartGoalNodeSchema,
  goalNode: StartGoalNodeSchema,
  paths: z.array(PathInfoSchema).length(3),
  mergePoints: z.array(MergePointSchema).min(1),
});

function parseRequest(rawBody: unknown) {
  const result = SimulateRequestSchema.safeParse(rawBody);
  if (!result.success) {
    return { error: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) };
  }
  return { data: result.data };
}

async function callGeminiApi(goal: string, timeframe: '1y'|'3y'|'5y'): Promise<PathMap | null> {
  try {
    const prompt = buildUserPrompt(goal, timeframe);
    const response = await callGemini({
      prompt,
      systemInstruction: SYSTEM_INSTRUCTION,
      schema: PathMapSchema,
    });
    return response as PathMap;
  } catch (error) {
    throw error;
  }
}

async function callGeminiWithRetry(goal: string, timeframe: '1y'|'3y'|'5y'): Promise<PathMap | null> {
  const attempt1 = await callGeminiApi(goal, timeframe);
  if (attempt1) return attempt1;
  const attempt2 = await callGeminiApi(goal, timeframe);
  return attempt2;
}

export async function POST(request: Request) {
  if (process.env.USE_MOCK === 'true') {
    return NextResponse.json(getMockPathMap());
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const parsed = parseRequest(rawBody);
  if (parsed.error) return parsed.error;

  const { goal, timeframe } = parsed.data;
  console.log(`[Simulate API] Request received: goal length=${goal.length}, timeframe=${timeframe}`);

  try {
    const pathMap = await withMockFallback(async () => {
      const result = await callGeminiWithRetry(goal, timeframe);
      if (!result) {
        throw new Error('Gemini validation failed twice');
      }
      return result;
    }, goal);

    return NextResponse.json(pathMap);
  } catch (error) {
    console.error('[Simulate API] Error:', error);
    return NextResponse.json({ error: '경로 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }
}
