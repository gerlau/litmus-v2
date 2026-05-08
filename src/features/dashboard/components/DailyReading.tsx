'use client';

import { useEffect, useState } from 'react';

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

type MetaState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: Meta };
type SummaryState = { status: 'loading' } | { status: 'done'; data: SummaryResult };

export default function DailyReading() {
  const [meta, setMeta] = useState<MetaState>({ status: 'loading' });
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch('/api/daily-reading', { signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load');
        setMeta({ status: 'ok', data: json });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setMeta({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      });

    fetch('/api/daily-reading/summary', { signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Summary failed');
        setSummaryState({ status: 'done', data: json });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setSummaryState({ status: 'done', data: { summary: '', summaryFallback: true } });
      });

    return () => controller.abort();
  }, []);

  if (meta.status === 'loading') {
    return (
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 130 }}
      />
    );
  }

  if (meta.status === 'error') {
    return (
      <div
        className="rounded-xl p-4 text-[12px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
      >
        Daily reading unavailable
      </div>
    );
  }

  const { title, date, url } = meta.data;

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
        Daily Reading
      </span>

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
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[11px] font-medium"
            style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
