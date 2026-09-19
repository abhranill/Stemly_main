import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { buildHealSystemPrompt, buildHealUserPrompt } from '@/lib/prompts';
import { extractHtmlFromResponse } from '@/lib/sandbox';
import type { ApiErrorBody, HealRequestBody, HealResponseBody } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-5';

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<ApiErrorBody>(
      { error: 'The server is missing an ANTHROPIC_API_KEY environment variable.' },
      { status: 500 },
    );
  }

  let body: HealRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiErrorBody>({ error: 'Malformed request.' }, { status: 400 });
  }

  const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
  const code = typeof body?.code === 'string' ? body.code : '';
  const error = body?.error;

  if (!topic || !code || !error?.message) {
    return NextResponse.json<ApiErrorBody>({ error: 'Missing topic, code, or error details.' }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: buildHealSystemPrompt(),
      messages: [{ role: 'user', content: buildHealUserPrompt(topic, code, error) }],
    });

    const html = extractHtmlFromResponse(response);
    if (!html) {
      return NextResponse.json<ApiErrorBody>(
        { error: 'The repair attempt returned nothing usable.' },
        { status: 502 },
      );
    }

    return NextResponse.json<HealResponseBody>({ html });
  } catch (err) {
    console.error('[STEMly] heal error:', err);
    return NextResponse.json<ApiErrorBody>({ error: 'The self-healing attempt failed.' }, { status: 500 });
  }
}
