'use client';

import { useEffect, useRef, useState } from 'react';

interface Meta {
  title: string;
  date: string;
  url: string;
}

interface SummaryResult {
  summary: string;
  summaryFallback?: boolean;
  ollamaError?: string;
}

interface MatchedRisk {
  riskId: string;
  riskTitle: string;
}

interface AndroidRisksResult {
  isAndroid: boolean;
  matchedRisks: MatchedRisk[];
}

type SummaryState = { status: 'loading' } | { status: 'done'; data: SummaryResult };
type AndroidState = { status: 'loading' } | { status: 'done'; data: AndroidRisksResult };

function DailyReadingPost({ title, date, url }: Meta) {
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });
  const [androidState, setAndroidState] = useState<AndroidState>({ status: 'loading' });
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const encodedUrl = encodeURIComponent(url);

    fetch(`/api/daily-reading/summary?url=${encodedUrl}`, { signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Summary failed');
        setSummaryState({ status: 'done', data: json });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setSummaryState({ status: 'done', data: { summary: '', summaryFallback: true } });
      });

    fetch(`/api/daily-reading/android-risks?url=${encodedUrl}`, { signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Android risks failed');
        setAndroidState({ status: 'done', data: json as AndroidRisksResult });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setAndroidState({ status: 'done', data: { isAndroid: false, matchedRisks: [] } });
      });

    return () => controller.abort();
  }, [url]);

  const showChips =
    androidState.status === 'done' &&
    androidState.data.isAndroid &&
    androidState.data.matchedRisks.length > 0 &&
    summaryState.status === 'done' &&
    !summaryState.data.summaryFallback;

  const summary = summaryState.status === 'done' ? summaryState.data.summary : null;
  useEffect(() => {
    if (expanded || !summaryRef.current) return;
    setHasOverflow(summaryRef.current.scrollHeight > summaryRef.current.clientHeight);
  }, [summary, expanded]);

  const matchedRisks = androidState.status === 'done' ? androidState.data.matchedRisks : [];

  return (
    <div className="flex flex-col gap-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-[13px] font-semibold leading-snug hover:underline"
        style={{ color: 'var(--text)' }}
      >
        {title}
      </a>

      {date && (
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          {date}
        </span>
      )}

      {summaryState.status === 'loading' ? (
        <p className="m-0 text-[12px] italic" style={{ color: 'var(--text-3)' }}>
          Generating summary…
        </p>
      ) : summaryState.data.summaryFallback ? (
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          AI summary unavailable — {summaryState.data.ollamaError ?? 'Ollama not running'}
        </span>
      ) : summaryState.data.summary ? (
        <div>
          <p
            ref={summaryRef}
            className="m-0 text-[12.5px] leading-relaxed"
            style={{
              color: 'var(--text-2)',
              ...(!expanded && {
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {summaryState.data.summary}
          </p>
          {(hasOverflow || expanded) && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-[11px] font-medium"
              style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      ) : null}

      {showChips && (
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
            Matched Risks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedRisks.map((risk) => {
              return (
                <span
                  key={risk.riskId}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-3)',
                    fontWeight: 400,
                  }}
                >
                  {risk.riskTitle}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type PostsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; posts: Meta[] };

export default function DailyReading() {
  const [postsState, setPostsState] = useState<PostsState>({ status: 'loading' });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/daily-reading', { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load');
        setPostsState({ status: 'ok', posts: json.posts as Meta[] });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setPostsState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      });
    return () => controller.abort();
  }, []);

  if (postsState.status === 'loading') {
    return (
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 130 }}
      />
    );
  }

  if (postsState.status === 'error') {
    return (
      <div
        className="rounded-xl p-4 text-[12px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
      >
        Daily reading unavailable
      </div>
    );
  }

  const { posts } = postsState;
  const total = posts.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - 1;
  const activePost = posts[currentIndex];

  const navButtonStyle = (enabled: boolean): React.CSSProperties => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '1px solid var(--border)',
    background: 'none',
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'opacity 0.15s',
    flexShrink: 0,
  });

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
          Daily Reading
        </span>

        {total > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              aria-label="Previous post"
              style={navButtonStyle(canPrev)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6.5,2 3.5,5 6.5,8" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
              disabled={!canNext}
              aria-label="Next post"
              style={navButtonStyle(canNext)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3.5,2 6.5,5 3.5,8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {activePost && <DailyReadingPost key={activePost.url} {...activePost} />}
    </div>
  );
}
