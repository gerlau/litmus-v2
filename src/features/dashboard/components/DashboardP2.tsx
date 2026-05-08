'use client';

import { useState } from 'react';
import type { App, Risk, Finding } from '@/shared/types/domain';
import { Icons } from '@/shared/components/Icon';
import RiskList from './RiskList';
import DivergentChart from './DivergentChart';
import DailyReading from './DailyReading';

interface Props {
  apps: App[];
  risks: Risk[];
  findings: Finding[];
}

export default function DashboardP2({ apps, risks, findings }: Props) {
  const [activeRisk, setActiveRisk] = useState(risks[0]?.id ?? '');

  return (
    <div className="flex flex-col gap-[18px]">
      <DailyReading />
      <div className="grid gap-[18px] items-start" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="m-0 text-[14.5px] font-semibold" style={{ color: 'var(--text)' }}>Top risks requiring attention</h3>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                Sort: Severity
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold" style={{ background: 'var(--ink)', color: '#fff', border: 'none' }}>
                <Icons.download /> Export Report
              </button>
            </div>
          </div>
          <RiskList apps={apps} risks={risks} findings={findings} activeRisk={activeRisk} onSelect={setActiveRisk} />
        </div>
        <DivergentChart apps={apps} risks={risks} findings={findings} activeRisk={activeRisk} />
      </div>
    </div>
  );
}
