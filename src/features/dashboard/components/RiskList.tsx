'use client';

import type { App, Risk, Finding, Incident } from '@/shared/types/domain';

interface Props {
  apps: App[];
  risks: Risk[];
  findings: Finding[];
  incidents: Incident[];
  activeRisk: string;
  onSelect: (id: string) => void;
}

export default function RiskList({ apps, risks, findings, incidents, activeRisk, onSelect }: Props) {
  return (
    <div>
      {risks.map(r => {
        const atRiskApps: App[] = [];
        let atRisk = 0;
        let reduced = 0;

        apps.forEach(a => {
          const finding = findings.find(f => f.appId === a.id && f.riskId === r.id);
          if (finding?.status === 'at-risk') { atRisk++; atRiskApps.push(a); }
          else if (finding?.status === 'reduced') reduced++;
        });

        const total = atRisk + reduced;
        const reducedPct = total ? Math.round((reduced / total) * 100) : 0;
        const isActive = activeRisk === r.id;
        return (
          <div
            key={r.id}
            className="rounded-xl p-4 mb-3 cursor-pointer"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: isActive ? '0 0 0 3px color-mix(in oklch,var(--accent) 18%,transparent)' : 'var(--shadow-sm)',
            }}
            onClick={() => onSelect(r.id)}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-start gap-3 min-w-0">
                <span className="font-mono text-[11px] font-semibold px-2 py-1 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{r.id}</span>
                <span className="flex-1 text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{r.title}</span>
              </div>
              {r.lastSeenAt && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                    Last seen
                  </div>
                  {r.lastSeenUrl ? (
                    <a
                      href={r.lastSeenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11.5px] hover:underline"
                      style={{ color: 'var(--text-2)' }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {new Date(r.lastSeenAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </a>
                  ) : (
                    <div className="text-[11.5px]" style={{ color: 'var(--text-2)' }}>
                      {new Date(r.lastSeenAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[13px] m-0 leading-snug" style={{ color: 'var(--text-2)' }}>{r.description}</p>
            <div className="flex items-center gap-2.5 mt-3 pt-2.5 text-[12px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>{atRisk} at risk</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>{reduced} reduced</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div className="h-full rounded-full" style={{ width: `${reducedPct}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' }} />
              </div>
              <span className="tabular-nums">{reducedPct}%</span>
            </div>
            {atRiskApps.length > 0 && (
              <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px dashed var(--border)' }}>
                <div className="text-[10.5px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--danger)' }}>Apps at risk</div>
                <div className="flex flex-wrap gap-1.5">
                  {atRiskApps.map(a => (
                    <span key={a.id} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                      <span className="font-mono text-[10px] opacity-70">{a.id}</span>
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
