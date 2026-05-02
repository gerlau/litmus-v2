'use client';

import { useState } from 'react';
import { APPS } from '@/shared/utils/data';
import StatStrip from './StatStrip';
import AppsBarChart from './AppsBarChart';
import AppRail from './AppRail';

export default function DashboardP1() {
  const [appId, setAppId] = useState(APPS[0].id);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Security posture overview</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>High-level view of mobile application risk across the portfolio.</p>
      </div>
      <StatStrip />
      <div className="h-[18px]" />
      <div className="grid gap-[18px] items-start" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <AppsBarChart selectedApp={appId} onSelect={setAppId} />
        <AppRail appId={appId} />
      </div>
    </div>
  );
}
