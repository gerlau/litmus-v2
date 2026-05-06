'use client';

import { useState, useTransition } from 'react';
import type { App, Feature, Risk, Finding, FindingStatus } from '@/shared/types/domain';
import { upsertFinding } from '@/lib/actions/findings';
import RiskRow from './RiskRow';

const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

interface Props {
  apps: App[];
  features: Feature[];
  risks: Risk[];
  allFindings: Finding[];
}

export default function FindingsPage({ apps, features, risks, allFindings }: Props) {
  const [appId, setAppId] = useState(apps[0]?.id ?? '');
  const [optimistic, setOptimistic] = useState<Record<string, FindingStatus>>({});
  const [, startTransition] = useTransition();

  const appFindings = allFindings.filter(f => f.appId === appId);

  function getStatus(riskId: string): FindingStatus {
    if (riskId in optimistic) return optimistic[riskId];
    return appFindings.find(f => f.riskId === riskId)?.status ?? 'unclassified';
  }

  function getFinding(riskId: string): Finding | null {
    return appFindings.find(f => f.riskId === riskId) ?? null;
  }

  function toggle(riskId: string) {
    const current = getStatus(riskId);
    const next: FindingStatus = current === 'reduced' ? 'at-risk' : current === 'at-risk' ? 'reduced' : 'at-risk';
    setOptimistic(o => ({ ...o, [riskId]: next }));
    startTransition(async () => {
      await upsertFinding(appId, riskId, next);
      setOptimistic(o => { const { [riskId]: _, ...rest } = o; return rest; });
    });
  }

  function handleAppChange(id: string) {
    setAppId(id);
    setOptimistic({});
  }

  const reducedCount = risks.filter(r => getStatus(r.id) === 'reduced').length;
  const atRiskCount = risks.filter(r => getStatus(r.id) === 'at-risk').length;
  const classifiedCount = reducedCount + atRiskCount;
  const unclassifiedCount = risks.length - classifiedCount;
  const pct = classifiedCount > 0 ? Math.round((reducedCount / classifiedCount) * 100) : 0;

  const byFeature = risks.reduce<Record<string, Risk[]>>((acc, r) => {
    if (!acc[r.featureId]) acc[r.featureId] = [];
    acc[r.featureId].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Findings</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Per-application findings: mark each risk as At Risk or Reduced and document the assessment.</p>
      </div>

      <div className="rounded-[14px] p-[22px] mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div style={{ minWidth: 280, flex: 1 }}>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Application</label>
            <select className="w-full rounded-lg px-3 py-2.5 text-[13.5px] appearance-none field-select" style={selectStyle} value={appId} onChange={e => handleAppChange(e.target.value)}>
              {apps.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
            </select>
          </div>
          <div className="flex gap-[18px]">
            {[
              { label: 'Posture', value: `${pct}%`, color: 'var(--text)' },
              { label: 'Reduced', value: reducedCount, color: 'var(--success)' },
              { label: 'At Risk', value: atRiskCount, color: 'var(--danger)' },
              { label: 'Unclassified', value: unclassifiedCount, color: 'var(--text-3)' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>{s.label}</div>
                <div className="text-[24px] font-extrabold tabular-nums" style={{ letterSpacing: '-0.02em', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(byFeature).map(fid => {
        const feat = features.find(f => f.id === fid);
        if (!feat) return null;
        return (
          <div key={fid} className="mb-5">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-[10.5px] font-semibold px-[7px] py-[3px] rounded uppercase" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{feat.id}</span>
              <h3 className="m-0 text-[14.5px] font-semibold" style={{ color: 'var(--text)' }}>{feat.name}</h3>
              <span className="ml-auto text-[12px]" style={{ color: 'var(--text-3)' }}>{byFeature[fid].length} risk{byFeature[fid].length > 1 ? 's' : ''}</span>
            </div>
            {byFeature[fid].map(r => (
              <RiskRow
                key={`${appId}-${r.id}`}
                risk={r}
                features={features}
                appId={appId}
                finding={getFinding(r.id)}
                status={getStatus(r.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
