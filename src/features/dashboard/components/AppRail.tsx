'use client';

import type { App, Risk, Finding } from '@/shared/types/domain';
import { Icons } from '@/shared/components/Icon';

interface Props {
  appId: string;
  apps: App[];
  risks: Risk[];
  findings: Finding[];
}

export default function AppRail({ appId, apps, risks, findings }: Props) {
  const app = apps.find(a => a.id === appId) ?? apps[0];
  const appFindings = findings.filter(f => f.appId === app?.id);
  const reduced = appFindings.filter(f => f.status === 'reduced').length;
  const atRisk = appFindings.filter(f => f.status === 'at-risk').length;
  const classified = reduced + atRisk;
  const pct = classified > 0 ? Math.round((reduced / classified) * 100) : 0;

  if (!app) return null;

  return (
    <div className="rounded-[14px] p-[18px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h4 className="flex items-center gap-2 m-0 mb-3 text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
        <span>{app.name}</span>
        <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>{app.sector}</span>
      </h4>
      <div className="text-[12px] mb-3.5" style={{ color: 'var(--text-3)' }}>v{app.version} · {app.agency}</div>

      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-[32px] font-extrabold tabular-nums" style={{ letterSpacing: '-0.02em', color: 'var(--text)' }}>{pct}%</div>
        <div className="text-[12px]" style={{ color: 'var(--text-3)' }}>posture score</div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--surface-2)' }}>
        <div className="posture-bar h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>

      <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>Risk checklist</div>
      {risks.map(r => {
        const status = appFindings.find(f => f.riskId === r.id)?.status ?? 'unclassified';
        const isReduced = status === 'reduced';
        const isAtRisk = status === 'at-risk';
        return (
          <div key={r.id} className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <div
              className="w-4 h-4 rounded grid place-items-center flex-shrink-0"
              style={{
                border: isReduced ? 'none' : `1.5px solid ${isAtRisk ? 'var(--border-strong)' : 'var(--border)'}`,
                background: isReduced ? 'var(--ink)' : 'transparent',
                color: isReduced ? '#fff' : 'transparent',
              }}
            >
              {isReduced && <Icons.check />}
            </div>
            <div className="flex-1" style={{ textDecoration: isReduced ? 'line-through' : 'none', color: isReduced ? 'var(--text-3)' : 'var(--text)' }}>{r.title}</div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={
              isReduced ? { background: 'var(--success-soft)', color: 'var(--success)' }
              : isAtRisk ? { background: 'var(--danger-soft)', color: 'var(--danger)' }
              : { background: 'var(--surface-3)', color: 'var(--text-3)' }
            }>{isReduced ? 'Reduced' : isAtRisk ? 'At risk' : 'Unclassified'}</span>
          </div>
        );
      })}
    </div>
  );
}
