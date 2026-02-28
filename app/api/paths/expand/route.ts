import { NextResponse } from 'next/server';
import { z } from 'zod';
import { callGemini } from '@/lib/gemini';
import { buildExpandPrompt, EXPAND_SYSTEM_INSTRUCTION, EXPAND_RESPONSE_SCHEMA } from '@/lib/prompts';

export const ExpandRequestSchema = z.object({
  nodeId: z.string(),
  nodeTitle: z.string(),
  nodeDescription: z.string().optional(),
  goal: z.string(),
});

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = ExpandRequestSchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  const { nodeTitle, nodeDescription, goal } = result.data;

  try {
    const prompt = buildExpandPrompt(nodeTitle, nodeDescription || '', goal);
    const geminiResponse = await callGemini({
      prompt,
      systemInstruction: EXPAND_SYSTEM_INSTRUCTION,
      schema: EXPAND_RESPONSE_SCHEMA,
    });
    
    return NextResponse.json(geminiResponse);
  } catch (err) {
    console.error('[Expand API] Internal server error:', err);
    return NextResponse.json(
      { error: '단계 확장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
