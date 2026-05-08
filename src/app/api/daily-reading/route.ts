import { NextResponse } from 'next/server';
import { fetchPostsMeta } from '@/lib/daily-reading';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const bust = new URL(request.url).searchParams.get('bust') === '1';
  try {
    const posts = await fetchPostsMeta(bust);
    return NextResponse.json({ posts: posts.map(({ title, date, url }) => ({ title, date, url })) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
