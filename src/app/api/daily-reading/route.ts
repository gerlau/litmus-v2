import { NextResponse } from 'next/server';
import { fetchPostMeta } from '@/lib/daily-reading';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const bust = new URL(request.url).searchParams.get('bust') === '1';
  try {
    const { title, date, url } = await fetchPostMeta(bust);
    return NextResponse.json({ title, date, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
