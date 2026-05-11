'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import type { App, Risk, Finding } from '@/shared/types/domain';
import { Icons } from '@/shared/components/Icon';

interface Props {
  apps: App[];
  risks: Risk[];
  findings: Finding[];
  selectedApp: string;
  onSelect: (id: string) => void;
}

export default function AppsBarChart({ apps, risks, findings, selectedApp, onSelect }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const totalRisks = risks.length;

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
    link.download = 'apps-by-risk-count.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const appsWithStats = apps.map(a => {
    const appFindings = findings.filter(f => f.appId === a.id);
    const atRisk = appFindings.filter(f => f.status === 'at-risk').length;
    return { ...a, atRisk, totalRisks };
  });

  const sorted = [...appsWithStats].sort((a, b) => b.atRisk - a.atRisk);
  const max = Math.max(...appsWithStats.map(a => a.atRisk), 1);

  return (
    <div ref={chartRef} className="rounded-[14px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-3 px-[22px] py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 className="text-[14.5px] font-semibold m-0" style={{ color: 'var(--text)' }}>Apps by open risk count</h3>
          <div className="text-[12.5px]" style={{ color: 'var(--text-3)' }}>Click an app to inspect its risk checklist →</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>Sort: At Risk</button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }}>
            <Icons.download /> Export
          </button>
        </div>
      </div>
      <div className="p-[22px]">
        {sorted.map(a => {
          const highlight = selectedApp === a.id;
          return (
            <div
              key={a.id}
              className="grid items-center gap-3.5 cursor-pointer"
              style={{
                gridTemplateColumns: '200px 1fr 56px',
                background: highlight ? 'color-mix(in oklch, var(--accent) 8%, transparent)' : 'transparent',
                borderRadius: 6,
                padding: '6px 6px',
              }}
              onClick={() => onSelect(a.id)}
            >
              <div className="text-[13px] text-right whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: highlight ? 'var(--text)' : 'var(--text-2)', fontWeight: highlight ? 600 : 400 }}>{a.name}</div>
              <div className="h-6 rounded-[4px] relative overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div
                  className={`bar-fill h-full rounded-[3px] ${highlight ? 'highlight' : ''}`}
                  style={{ width: `${(a.atRisk / max) * 100}%` }}
                />
              </div>
              <div className="text-[12px] whitespace-nowrap tabular-nums" style={{ color: 'var(--text-3)' }}>{a.atRisk} / {a.totalRisks}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
