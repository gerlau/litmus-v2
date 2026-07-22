import { NextResponse } from 'next/server';
import { fetchPostsMeta, getCacheKey, getCachedPostByUrl, isAndroidPost, matchRisksByMitreTechniqueIds } from '@/lib/daily-reading';
import * as risksQ from '@/lib/db/queries/risks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const postUrl = new URL(request.url).searchParams.get('url');

  if (!postUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    await fetchPostsMeta();
    const post = getCachedPostByUrl(getCacheKey(), postUrl);
    if (!post) {
      return NextResponse.json({ isAndroid: false, matchedRisks: [] });
    }
    if (!isAndroidPost(post)) {
      return NextResponse.json({ isAndroid: false, matchedRisks: [] });
    }
    const allRisks = await risksQ.getAll();
    await risksQ.updateLastSeenByMitreTechniqueIds(post.mitreAttackTechniqueIds, post.date, post.url);
    const matchedRisks = matchRisksByMitreTechniqueIds(
      post.mitreAttackTechniqueIds,
      allRisks.map((r) => ({
        id: r.id,
        title: r.title,
        mitreAttackMobileTechniqueId: r.mitreAttackMobileTechniqueId,
      })),
    );
    return NextResponse.json({ isAndroid: true, matchedRisks });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
