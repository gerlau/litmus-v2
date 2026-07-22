import { parse } from 'node-html-parser';

export interface PostMeta {
  title: string;
  date: string;
  url: string;
  body: string;
  mitreAttackTechniqueIds: string[];
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

function normalizeHeader(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function extractMitreTechniqueIds(sectionEl: ReturnType<typeof parse>): string[] {
  const ids = new Set<string>();

  for (const table of sectionEl.querySelectorAll('table')) {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) continue;

    const headerRow = rows.find((row) => row.querySelectorAll('th').length > 0) ?? rows[0];
    const headerCells = headerRow.querySelectorAll('th,td').map((cell) => normalizeHeader(cell.text));
    const idColumnIndex = headerCells.findIndex((header) => header === 'id');
    const hasExpectedShape =
      idColumnIndex >= 0 &&
      headerCells.includes('tactic') &&
      headerCells.includes('name') &&
      headerCells.includes('description');

    if (!hasExpectedShape) continue;

    for (const row of rows.slice(rows.indexOf(headerRow) + 1)) {
      const cells = row.querySelectorAll('td');
      if (cells.length <= idColumnIndex) continue;
      const id = cells[idColumnIndex].text.replace(/\s+/g, ' ').trim().toUpperCase();
      if (id) ids.add(id);
    }
  }

  return Array.from(ids);
}

function extractSections(bodyEl: ReturnType<typeof parse>): {
  text: string;
  mitreAttackTechniqueIds: string[];
} {
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

  const mitreH = allHeadings.find((h) => normalizeHeader(h.text) === 'mitre att&ck techniques');
  let mitreAttackTechniqueIds: string[] = [];
  if (mitreH) {
    const sectionHtml = sectionHtmlAfterHeading(html, mitreH.outerHTML);
    const sectionEl = parse(sectionHtml);
    mitreAttackTechniqueIds = extractMitreTechniqueIds(sectionEl);
    const descriptions = extractMitreDescriptions(sectionEl);
    if (descriptions) parts.push(`MITRE ATT&CK Techniques – Description:\n${descriptions}`);
  }

  return {
    text: parts.join('\n\n'),
    mitreAttackTechniqueIds,
  };
}

export function isAndroidPost(post: PostMeta): boolean {
  const haystack = `${post.title} ${post.body}`.toLowerCase();
  return haystack.includes('android');
}

export function matchRisksByMitreTechniqueIds(
  techniqueIds: string[],
  risks: Array<{ id: string; title: string; mitreAttackMobileTechniqueId: string | null }>,
): Array<{ riskId: string; riskTitle: string }> {
  const ids = new Set(techniqueIds.map((id) => id.toUpperCase()));
  return risks
    .filter(({ mitreAttackMobileTechniqueId }) =>
      mitreAttackMobileTechniqueId ? ids.has(mitreAttackMobileTechniqueId.toUpperCase()) : false,
    )
    .map(({ id, title }) => ({ riskId: id, riskTitle: title }));
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

    const { text: body, mitreAttackTechniqueIds } = bodyEl
      ? extractSections(bodyEl)
      : { text: '', mitreAttackTechniqueIds: [] };

    if (body || mitreAttackTechniqueIds.length > 0) {
      results.push({ title, date, url: postHref, body, mitreAttackTechniqueIds });
    }
  }

  metaCache.set(key, results);
  return results;
}
