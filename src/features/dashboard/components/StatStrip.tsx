import type { App, Feature, Risk } from '@/shared/types/domain';

interface Props {
  apps: App[];
  features: Feature[];
  risks: Risk[];
}

export default function StatStrip({ apps, features, risks }: Props) {
  const sectors = new Set(apps.map(a => a.sector));

  const cells = [
    { label: 'Apps', value: apps.length, color: '#fff', foot: 'Currently in scope' },
    { label: 'Sectors', value: sectors.size, color: '#fbbf24', foot: 'Across the portfolio' },
    { label: 'Features', value: features.length, color: '#60a5fa', foot: 'Tracked across apps' },
    { label: 'Risks', value: risks.length, color: '#f87171', foot: 'Documented risk types' },
  ];

  return (
    <div className="stat-strip rounded-[14px] grid overflow-hidden" style={{ gridTemplateColumns: 'repeat(4,1fr)', boxShadow: '0 8px 24px rgba(11,16,32,0.18)' }}>
      {cells.map((c, i) => (
        <div
          key={c.label}
          className="px-7 py-1.5"
          style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
        >
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{c.label}</div>
          <div className="text-[42px] font-extrabold leading-none mb-2 tabular-nums" style={{ color: c.color, letterSpacing: '-0.02em' }}>{c.value}</div>
          <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{c.foot}</div>
        </div>
      ))}
    </div>
  );
}
