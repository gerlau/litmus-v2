import { parse } from 'node-html-parser';

export interface PostMeta {
  title: string;
  date: string;
  url: string;
  body: string;
}

// Shared in-process cache keyed by ISO date
const metaCache = new Map<string, PostMeta>();

const LISTING_URL = 'https://zimperium.com/blog-tag?tag=zlabs';
const POST_SLUG_RE = /zimperium\.com\/blog\/(?!tag\/)[\w-]+/;

export function getCacheKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getCachedMeta(key: string) {
  return metaCache.get(key) ?? null;
}

export async function fetchPostMeta(bust = false): Promise<PostMeta> {
  const key = getCacheKey();
  if (!bust && metaCache.has(key)) return metaCache.get(key)!;

  const listingRes = await fetch(LISTING_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!listingRes.ok) throw new Error(`Listing fetch failed: ${listingRes.status}`);
  const listingDoc = parse(await listingRes.text());

  const postLink = listingDoc
    .querySelectorAll('a[href]')
    .find((a) => POST_SLUG_RE.test(a.getAttribute('href') ?? ''));

  if (!postLink) throw new Error('No post link found on listing page');

  let postHref = postLink.getAttribute('href') ?? '';
  if (!postHref.startsWith('http')) postHref = `https://zimperium.com${postHref}`;

  const postRes = await fetch(postHref, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!postRes.ok) throw new Error(`Post fetch failed: ${postRes.status}`);
  const postDoc = parse(await postRes.text());

  const title =
    postDoc.querySelector('h1.post-header__title span')?.text.trim() ??
    postDoc.querySelector('h1')?.text.trim() ??
    'Untitled';

  const date = postDoc.querySelector('div.post-header__date')?.text.trim() ?? '';

  const bodyEl =
    postDoc.querySelector('#hs_cos_wrapper_post_body') ??
    postDoc.querySelector('div.s-blog-post__body');
  const body = bodyEl?.text.replace(/\s+/g, ' ').trim() ?? '';

  const meta: PostMeta = { title, date, url: postHref, body };
  metaCache.set(key, meta);
  return meta;
}
