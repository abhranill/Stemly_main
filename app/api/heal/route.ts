import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildHealSystemPrompt,
  buildHealUserPrompt,
} from '@/lib/prompts';
import { extractHtmlFromResponse } from '@/lib/sandbox';
import type {
  ApiErrorBody,
  HealRequestBody,
  HealResponseBody,
} from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'gemini-3.5-flash';

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json<ApiErrorBody>(
      {
        error:
          'The server is missing a GEMINI_API_KEY environment variable.',
      },
      { status: 500 }
    );
  }

  let body: HealRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiErrorBody>(
      { error: 'Malformed request.' },
      { status: 400 }
    );
  }

  const topic =
    typeof body?.topic === 'string'
      ? body.topic.trim()
      : '';

  const code =
    typeof body?.code === 'string'
      ? body.code
      : '';

  const error = body?.error;

  if (!topic || !code || !error?.message) {
    return NextResponse.json<ApiErrorBody>(
      {
        error:
          'Missing topic, code, or error details.',
      },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const prompt = `${buildHealSystemPrompt()}

${buildHealUserPrompt(topic, code, error)}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 8000,
        temperature: 0.2,
      },
    });

    const rawText = response.text ?? '';
    const html = extractHtmlFromResponse(rawText);

    if (!html) {
      return NextResponse.json<ApiErrorBody>(
        {
          error:
            'Gemini returned no usable repaired simulation.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json<HealResponseBody>({
      html,
    });
  } catch (err) {
    console.error('[STEMly] Gemini heal error:', err);

    return NextResponse.json<ApiErrorBody>(
      {
        error:
          'The self-healing attempt failed.',
      },
      { status: 500 }
    );
  }
}