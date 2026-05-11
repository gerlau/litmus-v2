'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import type { App, Risk, Finding } from '@/shared/types/domain';
import { Icons } from '@/shared/components/Icon';

interface Props {
  apps: App[];
  risks: Risk[];
  findings: Finding[];
  activeRisk: string;
}

export default function DivergentChart({ apps, risks, findings, activeRisk }: Props) {
  const max = apps.length || 1;
  const chartRef = useRef<HTMLDivElement>(null);

  async function handleExport() {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, {
      useCORS: true,
      scale: 2,
      onclone: (_doc, el) => {
        el.querySelectorAll<HTMLElement>('[style]').forEach(node => {
          if (node.style.background.includes('oklch')) node.style.background = 'transparent';
          if (node.style.backgroundColor.includes('oklch')) node.style.backgroundColor = 'transparent';
        });
      },
    });
    const link = document.createElement('a');
    link.download = 'risk-distribution-chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div ref={chartRef} className="rounded-[14px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="px-[22px] py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 className="text-[14.5px] font-semibold m-0" style={{ color: 'var(--text)' }}>Risk distribution across apps</h3>
          <div className="text-[12.5px]" style={{ color: 'var(--text-3)' }}>At Risk ← • → Reduced Risk</div>
        </div>
        <button
          onClick={handleExport}
          title="Export as image"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }}
        >
          <Icons.download /> Export
        </button>
      </div>
      <div className="p-[22px]">
        {risks.map(r => {
          let atRisk = 0;
          let reduced = 0;
          findings.forEach(f => {
            if (f.riskId !== r.id) return;
            if (f.status === 'at-risk') atRisk++;
            else if (f.status === 'reduced') reduced++;
          });
          const isActive = activeRisk === r.id;

          return (
            <div
              key={r.id}
              className="grid items-center py-1 rounded-md"
              style={{
                gridTemplateColumns: '200px 1fr 1fr',
                background: isActive ? 'color-mix(in oklch,var(--accent) 8%,transparent)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2 px-3" style={{ color: isActive ? 'var(--text)' : 'var(--text-3)', fontWeight: isActive ? 500 : 400, fontSize: 13 }}>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">{r.title}</span>
              </div>
              <div className="flex items-center justify-end h-[22px] pr-px">
                <div className="div-seg-l rounded-l h-full flex items-center justify-center" style={{ width: `${(atRisk / max) * 100}%` }}>
                  {atRisk > 0 && <span className="text-[11px] font-semibold text-white">{atRisk}</span>}
                </div>
              </div>
              <div className="flex items-center justify-start h-[22px] pl-px">
                <div className="div-seg-r rounded-r h-full flex items-center justify-center" style={{ width: `${(reduced / max) * 100}%` }}>
                  {reduced > 0 && <span className="text-[11px] font-semibold text-white">{reduced}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div className="grid pt-2 mt-1.5 text-[11px]" style={{ gridTemplateColumns: '200px 1fr 1fr', borderTop: '1px solid var(--border)' }}>
          <div />
          <div className="text-right pr-3 font-semibold" style={{ color: 'var(--danger)' }}>At Risk ←</div>
          <div className="text-left pl-3 font-semibold" style={{ color: 'var(--success)' }}>→ Reduced Risk</div>
        </div>
      </div>
    </div>
  );
}
