import { NextResponse } from 'next/server';
import { fetchPostsMeta, getCacheKey, getCachedPostByUrl } from '@/lib/daily-reading';

export const dynamic = 'force-dynamic';

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:latest';
const SUMMARY_INPUT_MAX_CHARS = Number(process.env.OLLAMA_SUMMARY_INPUT_MAX_CHARS ?? '8000');

// Summary cache keyed by post URL
const summaryCache = new Map<string, { summary: string; summaryFallback?: boolean; ollamaError?: string }>();

async function generateSummary(model: string, prompt: string) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Ollama returned ${res.status}${errorText ? `: ${errorText}` : ''}`);
  }

  const json = await res.json() as { response?: string };
  const text = json.response?.trim();
  if (!text) throw new Error('Empty Ollama response');
  return text;
}

function latestTagCandidate(model: string): string | null {
  if (model.includes(':')) return null;
  return `${model}:latest`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bust = searchParams.get('bust') === '1';
  const postUrl = searchParams.get('url');

  if (bust) summaryCache.clear();

  if (!postUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  const cached = summaryCache.get(postUrl);
  if (cached) return NextResponse.json(cached);

  let body = '';
  try {
    // Ensure the array cache is populated, then look up by URL
    await fetchPostsMeta(bust);
    const post = getCachedPostByUrl(getCacheKey(), postUrl);
    body = post?.body ?? '';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scrape failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!body) {
    const result = { summary: "No suitable post found for today's daily read." };
    summaryCache.set(postUrl, result);
    return NextResponse.json(result);
  }

  const prompt = `Summarize the extracted cybersecurity blog content in one paragraph, max 700 characters. Mention only details explicitly stated in the content: target platform or technology, victims, and attacker techniques. No assumptions, no bullet points, no headings.\n\nContent:\n${body.slice(0, SUMMARY_INPUT_MAX_CHARS)}`;

  try {
    let text: string;
    try {
      text = await generateSummary(OLLAMA_MODEL, prompt);
    } catch (err) {
      const fallbackModel = latestTagCandidate(OLLAMA_MODEL);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (!fallbackModel || !message.includes('Ollama returned 404')) throw err;
      text = await generateSummary(fallbackModel, prompt);
    }

    const result = { summary: text };

    summaryCache.set(postUrl, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[summary] Ollama error:', err);
    const ollamaError = err instanceof Error ? err.message : 'Unknown error';
    const result = { summary: '', summaryFallback: true, ollamaError };
    summaryCache.set(postUrl, result);
    return NextResponse.json(result);
  }
}
