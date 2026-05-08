'use client';

import { useEffect, useState } from 'react';
import { saveIncident, getIncidentByUrl, deleteIncident } from '@/lib/actions/incidents';
import type { Incident, IncidentRisk } from '@/shared/types/domain';

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

interface AndroidRisksResult {
  isAndroid: boolean;
  matchedRisks: IncidentRisk[];
}

type MetaState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: Meta };
type SummaryState = { status: 'loading' } | { status: 'done'; data: SummaryResult };
type AndroidState = { status: 'loading' } | { status: 'done'; data: AndroidRisksResult };

export default function DailyReading() {
  const [meta, setMeta] = useState<MetaState>({ status: 'loading' });
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });
  const [androidState, setAndroidState] = useState<AndroidState>({ status: 'loading' });
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [savedIncident, setSavedIncident] = useState<Incident | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch('/api/daily-reading', { signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load');
        const data = json as Meta;
        setMeta({ status: 'ok', data });

        // Check if an incident already exists for this post
        getIncidentByUrl(data.url).then((existing) => {
          if (existing) {
            setSavedIncident(existing);
            setSelectedRisks(new Set(existing.risks.map((r) => r.riskId)));
          }
        });
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

    fetch('/api/daily-reading/android-risks', { signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Android risks failed');
        const result = json as AndroidRisksResult;
        setAndroidState({ status: 'done', data: result });
        // Only pre-select matched risks if no saved incident (saved incident controls selection)
        setSavedIncident((prev) => {
          if (!prev) setSelectedRisks(new Set(result.matchedRisks.map((r) => r.riskId)));
          return prev;
        });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setAndroidState({ status: 'done', data: { isAndroid: false, matchedRisks: [] } });
      });

    return () => controller.abort();
  }, []);

  const toggleRisk = (riskId: string) => {
    if (savedIncident) return; // locked when saved
    setSelectedRisks((prev) => {
      const next = new Set(prev);
      if (next.has(riskId)) next.delete(riskId);
      else next.add(riskId);
      return next;
    });
  };

  const handleThumbsUp = async () => {
    if (busy || meta.status !== 'ok') return;
    setBusy(true);
    try {
      if (savedIncident) {
        // Toggle off — delete the incident
        await deleteIncident(savedIncident.id);
        setSavedIncident(null);
        // Restore selection to matched risks
        const matchedRisks = androidState.status === 'done' ? androidState.data.matchedRisks : [];
        setSelectedRisks(new Set(matchedRisks.map((r) => r.riskId)));
      } else {
        // Save new incident
        if (selectedRisks.size === 0) return;
        const matchedRisks = androidState.status === 'done' ? androidState.data.matchedRisks : [];
        const risksToSave = matchedRisks.filter((r) => selectedRisks.has(r.riskId));
        const summary =
          summaryState.status === 'done' && !summaryState.data.summaryFallback
            ? summaryState.data.summary
            : null;
        const incident = await saveIncident(meta.data.date, meta.data.url, summary, risksToSave);
        setSavedIncident(incident);
      }
    } finally {
      setBusy(false);
    }
  };

  const isSaved = savedIncident !== null;

  const showThumbsUp =
    androidState.status === 'done' &&
    androidState.data.isAndroid &&
    androidState.data.matchedRisks.length > 0 &&
    summaryState.status === 'done' &&
    !summaryState.data.summaryFallback;

  const showChips =
    androidState.status === 'done' &&
    androidState.data.isAndroid &&
    androidState.data.matchedRisks.length > 0 &&
    summaryState.status === 'done' &&
    !summaryState.data.summaryFallback;

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
  const matchedRisks = androidState.status === 'done' ? androidState.data.matchedRisks : [];

  const thumbsUpOpacity = isSaved ? 1 : selectedRisks.size > 0 ? 1 : 0.4;
  const thumbsUpCursor = busy ? 'wait' : isSaved || selectedRisks.size > 0 ? 'pointer' : 'default';

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
          Daily Reading
        </span>

        {showThumbsUp && (
          <button
            onClick={handleThumbsUp}
            disabled={busy || (!isSaved && selectedRisks.size === 0)}
            title={isSaved ? 'Remove incident' : 'Save incident'}
            style={{
              background: 'none',
              border: 'none',
              cursor: thumbsUpCursor,
              padding: '2px 4px',
              opacity: thumbsUpOpacity,
              transition: 'opacity 0.15s',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isSaved ? 'var(--text-3)' : 'none'}
              stroke="var(--text-3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
        )}
      </div>

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

      {/* Risk chips — shown below summary once it loads */}
      {showChips && (
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
            Matched Risks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedRisks.map((risk) => {
              const selected = selectedRisks.has(risk.riskId);
              return (
                <button
                  key={risk.riskId}
                  onClick={() => toggleRisk(risk.riskId)}
                  disabled={isSaved}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    cursor: isSaved ? 'default' : 'pointer',
                    background: selected ? 'var(--text-3)' : 'transparent',
                    color: selected ? 'var(--surface)' : 'var(--text-3)',
                    transition: 'background 0.15s, color 0.15s',
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  {risk.riskTitle}
                </button>
              );
            })}
          </div>
          {isSaved && (
            <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
              Incident saved.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
