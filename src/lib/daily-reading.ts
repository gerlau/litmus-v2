import { parse } from 'node-html-parser';

export interface PostMeta {
  title: string;
  date: string;
  url: string;
  body: string;
}

// Shared in-process cache keyed by ISO date, stores array of posts
const metaCache = new Map<string, PostMeta[]>();

const LISTING_URL = 'https://zimperium.com/blog-tag?tag=zlabs';
const POST_SLUG_RE = /zimperium\.com\/blog\/(?!tag\/)[\w-]+/;

export function getCacheKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getCachedPostByUrl(key: string, url: string): PostMeta | null {
  const posts = metaCache.get(key) ?? [];
  return posts.find((p) => p.url === url) ?? null;
}

function sectionHtmlAfterHeading(html: string, headingOuterHtml: string): string {
  const pos = html.indexOf(headingOuterHtml);
  if (pos === -1) return '';
  const after = html.slice(pos + headingOuterHtml.length);
  const cut = after.search(/<h[1-6][\s>]/i);
  return cut === -1 ? after : after.slice(0, cut);
}

function cleanText(html: string): string {
  const el = parse(html);
  el.querySelectorAll('style,script').forEach((n) => n.remove());
  return el.text.replace(/\s+/g, ' ').trim();
}

function extractMitreDescriptions(sectionEl: ReturnType<typeof parse>): string {
  const descTexts: string[] = [];

  for (const table of sectionEl.querySelectorAll('table')) {
    const headerCells = table.querySelectorAll('th');
    let descColIndex = -1;

    if (headerCells.length > 0) {
      headerCells.forEach((th, i) => {
        if (th.text.trim().toLowerCase() === 'description') descColIndex = i;
      });
    }

    if (descColIndex >= 0) {
      for (const row of table.querySelectorAll('tbody tr, tr')) {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) continue;
        const cell = cells[descColIndex];
        if (cell) {
          const t = cell.text.replace(/\s+/g, ' ').trim();
          if (t) descTexts.push(t);
        }
      }
    } else {
      for (const row of table.querySelectorAll('tr')) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2 && cells[0].text.trim().toLowerCase() === 'description') {
          const t = cells[1].text.replace(/\s+/g, ' ').trim();
          if (t) descTexts.push(t);
        }
      }
    }
  }

  return descTexts.join(' | ');
}

function extractSections(bodyEl: ReturnType<typeof parse>): string {
  const html = bodyEl.innerHTML;
  const parts: string[] = [];
  const allHeadings = bodyEl.querySelectorAll('h1,h2,h3,h4,h5,h6');

  const execH = allHeadings.find((h) =>
    h.text.replace(/\s+/g, ' ').trim().toLowerCase().includes('executive summary')
  );
  if (execH) {
    const sectionHtml = sectionHtmlAfterHeading(html, execH.outerHTML);
    const text = cleanText(sectionHtml);
    if (text) parts.push(`Executive Summary:\n${text}`);
  }

  const mitreH = allHeadings.find((h) => {
    const t = h.text.toLowerCase();
    return t.includes('mitre') && (t.includes('att') || t.includes('ck'));
  });
  if (mitreH) {
    const sectionHtml = sectionHtmlAfterHeading(html, mitreH.outerHTML);
    const sectionEl = parse(sectionHtml);
    const descriptions = extractMitreDescriptions(sectionEl);
    if (descriptions) parts.push(`MITRE ATT&CK Techniques – Description:\n${descriptions}`);
  }

  return parts.join('\n\n');
}

export function isAndroidPost(post: PostMeta): boolean {
  const haystack = `${post.title} ${post.body}`.toLowerCase();
  return haystack.includes('android');
}

export function matchRiskTitles(
  postBody: string,
  risks: Array<{ id: string; title: string }>,
): Array<{ riskId: string; riskTitle: string }> {
  const body = postBody.toLowerCase();
  return risks.filter(({ title }) => {
    const words = title.split(/\s+/).filter((w) => w.length > 3);
    return words.some((w) => body.includes(w.toLowerCase()));
  }).map(({ id, title }) => ({ riskId: id, riskTitle: title }));
}

export async function fetchPostsMeta(bust = false, limit = 3): Promise<PostMeta[]> {
  const key = getCacheKey();
  if (!bust && metaCache.has(key)) return metaCache.get(key)!;

  const listingRes = await fetch(LISTING_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!listingRes.ok) throw new Error(`Listing fetch failed: ${listingRes.status}`);
  const listingDoc = parse(await listingRes.text());

  const postLinks = listingDoc
    .querySelectorAll('a[href]')
    .filter((a) => POST_SLUG_RE.test(a.getAttribute('href') ?? ''))
    .slice(0, 10);

  if (postLinks.length === 0) throw new Error('No post links found on listing page');

  const results: PostMeta[] = [];

  for (const postLink of postLinks) {
    if (results.length >= limit) break;

    let postHref = postLink.getAttribute('href') ?? '';
    if (!postHref.startsWith('http')) postHref = `https://zimperium.com${postHref}`;

    // Skip duplicates (listing page may repeat links)
    if (results.some((p) => p.url === postHref)) continue;

    const postRes = await fetch(postHref, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!postRes.ok) continue;
    const postDoc = parse(await postRes.text());

    const title =
      postDoc.querySelector('h1.post-header__title span')?.text.trim() ??
      postDoc.querySelector('h1')?.text.trim() ??
      'Untitled';

    const date = postDoc.querySelector('div.post-header__date')?.text.trim() ?? '';

    const bodyEl =
      postDoc.querySelector('#hs_cos_wrapper_post_body') ??
      postDoc.querySelector('div.s-blog-post__body');
    bodyEl?.querySelectorAll('style, script').forEach((el) => el.remove());

    const body = bodyEl ? extractSections(bodyEl) : '';

    if (body) {
      results.push({ title, date, url: postHref, body });
    }
  }

  metaCache.set(key, results);
  return results;
}
