'use client';

import { useEffect, useState } from 'react';
import { APPS, FEATURES, RISKS, FINDINGS, FindingStatus } from '@/shared/utils/data';
import RiskRow from './RiskRow';

export default function FindingsPage() {
  const [appId, setAppId] = useState(APPS[0].id);
  const [findings, setFindings] = useState<Record<string, FindingStatus>>({ ...FINDINGS[appId] });

  useEffect(() => { setFindings({ ...FINDINGS[appId] }); }, [appId]);

  const toggle = (rid: string) =>
    setFindings(f => ({ ...f, [rid]: f[rid] === 'reduced' ? 'at-risk' : 'reduced' }));

  const reducedCount = Object.values(findings).filter(v => v === 'reduced').length;
  const total = RISKS.length;
  const pct = Math.round((reducedCount / total) * 100);

  // Group risks by feature
  const byFeature = RISKS.reduce<Record<string, typeof RISKS>>((acc, r) => {
    if (!acc[r.featureId]) acc[r.featureId] = [];
    acc[r.featureId].push(r);
    return acc;
  }, {});

  const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Findings</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Per-application findings: mark each risk as At Risk or Reduced and document the assessment.</p>
      </div>

      {/* App selector + summary */}
      <div className="rounded-[14px] p-[22px] mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div style={{ minWidth: 280, flex: 1 }}>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Application</label>
            <select className="w-full rounded-lg px-3 py-2.5 text-[13.5px] appearance-none field-select" style={selectStyle} value={appId} onChange={e => setAppId(e.target.value)}>
              {APPS.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
            </select>
          </div>
          <div className="flex gap-[18px]">
            {[
              { label: 'Posture', value: `${pct}%`, color: 'var(--text)' },
              { label: 'Reduced', value: reducedCount, color: 'var(--success)' },
              { label: 'At Risk', value: total - reducedCount, color: 'var(--danger)' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>{s.label}</div>
                <div className="text-[24px] font-extrabold tabular-nums" style={{ letterSpacing: '-0.02em', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risks grouped by feature */}
      {Object.keys(byFeature).map(fid => {
        const feat = FEATURES.find(f => f.id === fid);
        if (!feat) return null;
        return (
          <div key={fid} className="mb-5">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-[10.5px] font-semibold px-[7px] py-[3px] rounded uppercase" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{feat.id}</span>
              <h3 className="m-0 text-[14.5px] font-semibold" style={{ color: 'var(--text)' }}>{feat.name}</h3>
              <span className="text-[10.5px] font-semibold px-2 py-[3px] rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>{feat.platform}</span>
              <span className="ml-auto text-[12px]" style={{ color: 'var(--text-3)' }}>{byFeature[fid].length} risk{byFeature[fid].length > 1 ? 's' : ''}</span>
            </div>
            {byFeature[fid].map(r => (
              <RiskRow key={r.id} risk={r} status={findings[r.id] ?? 'at-risk'} onToggle={toggle} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
