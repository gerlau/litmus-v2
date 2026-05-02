'use client';

import { useState } from 'react';
import { RISKS } from '@/shared/utils/data';
import { Icons } from '@/shared/components/Icon';
import RiskList from './RiskList';
import DivergentChart from './DivergentChart';

export default function DashboardP2() {
  const [activeRisk, setActiveRisk] = useState(RISKS[0].id);

  return (
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
        <RiskList activeRisk={activeRisk} onSelect={setActiveRisk} />
      </div>
      <DivergentChart activeRisk={activeRisk} />
    </div>
  );
}
