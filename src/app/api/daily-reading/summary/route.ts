import { NextResponse } from 'next/server';
import { fetchPostMeta, getCacheKey } from '@/lib/daily-reading';

export const dynamic = 'force-dynamic';

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2';

// Summary cache separate from meta cache
const summaryCache = new Map<string, { summary: string; summaryFallback?: boolean }>();

export async function GET(request: Request) {
  const bust = new URL(request.url).searchParams.get('bust') === '1';
  if (bust) summaryCache.clear();

  const key = getCacheKey();
  const cached = summaryCache.get(key);
  if (cached) return NextResponse.json(cached);

  let body = '';
  try {
    const meta = await fetchPostMeta(bust);
    body = meta.body;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scrape failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const prompt = `Summarise the following cybersecurity blog post in 3-4 concise sentences suitable for an executive dashboard. Focus on the key threat, finding, or recommendation.\n\nArticle:\n${body.slice(0, 4000)}`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
    const json = await res.json() as { response?: string };
    const text = json.response?.trim();
    if (!text) throw new Error('Empty Ollama response');

    const result = { summary: text };
    summaryCache.set(key, result);
    return NextResponse.json(result);
  } catch {
    // Ollama unreachable — serve raw excerpt as fallback
    const result = { summary: body.slice(0, 400).trim(), summaryFallback: true };
    summaryCache.set(key, result);
    return NextResponse.json(result);
  }
}
