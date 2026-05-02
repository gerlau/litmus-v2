'use client';

import { useState } from 'react';
import DashboardP1 from './DashboardP1';
import DashboardP2 from './DashboardP2';

type Tab = 'p1' | 'p2';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('p1');

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Dashboard</h2>
          <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Stakeholder view: portfolio posture, top risks, prioritization insights.</p>
        </div>
        <div className="flex overflow-hidden rounded-lg" style={{ border: '1px solid var(--border)' }}>
          {(['p1', 'p2'] as const).map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3.5 py-2 text-[13px] font-semibold border-0"
              style={{
                background: tab === t ? 'var(--surface-3)' : 'var(--surface)',
                color: tab === t ? 'var(--text)' : 'var(--text-2)',
                borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}
            >
              {t === 'p1' ? 'Overview' : 'Risk Distribution'}
            </button>
          ))}
        </div>
      </div>
      {tab === 'p1' ? <DashboardP1 /> : <DashboardP2 />}
    </div>
  );
}
