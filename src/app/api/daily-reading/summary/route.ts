import { NextResponse } from 'next/server';
import { fetchPostsMeta, getCacheKey, getCachedPostByUrl } from '@/lib/daily-reading';

export const dynamic = 'force-dynamic';

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'gemma4';

// Summary cache keyed by post URL
const summaryCache = new Map<string, { summary: string; summaryFallback?: boolean; ollamaError?: string }>();

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

  console.log(body);
  const prompt = `You are analyzing key sections extracted from a cybersecurity threat intelligence blog post. Write a smooth, storytelling-style paragraph with a maximum length of 700 characters. Clearly explain what platform or technology is targeted (such as Android, iOS — only if explicitly mentioned), who the victims are, and the techniques or methods used by the attackers. Use only information directly stated in the provided content. Do not add assumptions, external context, bullet points, or headings.\n\nContent:\n${body.slice(0, 25000)}`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
    const json = await res.json() as { response?: string };
    const text = json.response?.trim();
    if (!text) throw new Error('Empty Ollama response');

    const result = { summary: text };
    console.log(result);

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
