import { NextResponse } from 'next/server';
import { z } from 'zod';
import { callGemini } from '@/lib/gemini';
import { buildBranchPrompt, BRANCH_SYSTEM_INSTRUCTION, BRANCH_RESPONSE_SCHEMA } from '@/lib/prompts';
import type { BranchResponse } from '@/types/path';

export const BranchRequestSchema = z.object({
  pathId: z.string(),
  currentNodeId: z.string(),
  choice: z.string().min(1).max(500),
  goal: z.string(),
  nodeTitle: z.string(),
  nodeMonths: z.number(),
});

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = BranchRequestSchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  const { choice, goal, nodeTitle, nodeMonths } = result.data;

  try {
    const prompt = buildBranchPrompt(choice, nodeTitle, nodeMonths, goal);
    const geminiResponse = await callGemini({
      prompt,
      systemInstruction: BRANCH_SYSTEM_INSTRUCTION,
      schema: BRANCH_RESPONSE_SCHEMA,
    });
    
    return NextResponse.json(geminiResponse as unknown as BranchResponse);
  } catch (err) {
    console.error('[Branch API] Internal server error:', err);
    return NextResponse.json(
      { error: '조건 분기 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
