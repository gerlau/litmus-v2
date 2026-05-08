import { NextResponse } from 'next/server';
import { fetchPostMeta, isAndroidPost, matchRiskTitles } from '@/lib/daily-reading';
import * as risksQ from '@/lib/db/queries/risks';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const post = await fetchPostMeta();
    if (!isAndroidPost(post)) {
      return NextResponse.json({ isAndroid: false, matchedRisks: [] });
    }
    const allRisks = await risksQ.getAll();
    const matchedRisks = matchRiskTitles(post.body, allRisks.map((r) => ({ id: r.id, title: r.title })));
    return NextResponse.json({ isAndroid: true, matchedRisks });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
