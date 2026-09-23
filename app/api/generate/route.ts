import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildGenerateSystemPrompt,
  buildGenerateUserPrompt,
} from '@/lib/prompts';
import { extractHtmlFromResponse } from '@/lib/sandbox';
import type {
  ApiErrorBody,
  GenerateResponseBody,
} from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'gemini-3.5-flash';
const MAX_TOPIC_LENGTH = 200;

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

  let topic: string;

  try {
    const body = await req.json();
    topic =
      typeof body?.topic === 'string'
        ? body.topic.trim()
        : '';
  } catch {
    return NextResponse.json<ApiErrorBody>(
      { error: 'Malformed request.' },
      { status: 400 }
    );
  }

  if (!topic) {
    return NextResponse.json<ApiErrorBody>(
      { error: 'Enter a topic to visualize.' },
      { status: 400 }
    );
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return NextResponse.json<ApiErrorBody>(
      {
        error: `Keep the topic under ${MAX_TOPIC_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${buildGenerateSystemPrompt()}

${buildGenerateUserPrompt(topic)}`,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 8000,
        temperature: 0.4,
      },
    });

    const rawText = response.text ?? '';
    const html = extractHtmlFromResponse(rawText);

    if (!html) {
      return NextResponse.json<ApiErrorBody>(
        {
          error:
            'Gemini returned an empty simulation. Please try again.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json<GenerateResponseBody>({
      html,
    });
  } catch (err) {
    console.error('[STEMly] Gemini generate error:', err);

    return NextResponse.json<ApiErrorBody>(
      {
        error:
          'Something went wrong generating that simulation. Please try again.',
      },
      { status: 500 }
    );
  }
}