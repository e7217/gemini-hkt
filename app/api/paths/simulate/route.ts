import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMockPathMap } from '@/lib/mockData';
import { callGemini } from '@/lib/gemini';
import { buildUserPrompt, SYSTEM_INSTRUCTION, PATH_MAP_SCHEMA } from '@/lib/prompts';
import type { PathMap } from '@/types/path';

export const SimulateRequestSchema = z.object({
  goal: z.string().min(1).max(500),
  timeframe: z.enum(['1y', '3y', '5y']).default('3y'),
});

function parseRequest(rawBody: unknown) {
  const result = SimulateRequestSchema.safeParse(rawBody);
  if (!result.success) return null;
  return result.data;
}

async function callGeminiForMap(goal: string, timeframe: '1y' | '3y' | '5y'): Promise<PathMap | null> {
  const prompt = buildUserPrompt(goal, timeframe);
  try {
    const result = await callGemini({
      prompt,
      systemInstruction: SYSTEM_INSTRUCTION,
      schema: PATH_MAP_SCHEMA,
    });
    // Schema matches PathMap interface, so it's safe to cast or treat as PathMap
    return result as unknown as PathMap;
  } catch (err) {
    console.error('[Simulate API] Gemini validation/generation failed:', err);
    return null;
  }
}

async function callGeminiWithRetry(goal: string, timeframe: '1y' | '3y' | '5y'): Promise<PathMap | null> {
  console.log(`[Simulate API] Calling Gemini for goal: ${goal} (${timeframe}) - Attempt 1`);
  let result = await callGeminiForMap(goal, timeframe);
  if (result) return result;

  console.log(`[Simulate API] Attempt 1 failed. Calling Gemini for goal: ${goal} (${timeframe}) - Attempt 2`);
  result = await callGeminiForMap(goal, timeframe);
  return result;
}

export async function POST(request: Request) {
  // Mock mode check
  if (process.env.USE_MOCK === 'true') {
    return NextResponse.json(getMockPathMap());
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = parseRequest(rawBody);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  try {
    const pathMap = await callGeminiWithRetry(parsed.goal, parsed.timeframe);
    if (!pathMap) {
      console.warn(`[Simulate API] Gemini failed twice. Falling back to mock data.`);
      return NextResponse.json(getMockPathMap(parsed.goal));
    }
    console.log(`[Simulate API] Successfully generated path map for goal: ${parsed.goal}`);
    return NextResponse.json(pathMap);
  } catch (err) {
    console.error('[Simulate API] Internal server error:', err);
    return NextResponse.json(
      { error: '경로 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
