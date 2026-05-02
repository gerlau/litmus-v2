'use client';

interface Props {
  on: boolean;
  onChange: (v: boolean) => void;
}

export default function RiskToggle({ on, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: on ? 'var(--text-3)' : 'var(--danger)' }}>At Risk</span>
      <button className={`risk-switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: on ? 'var(--success)' : 'var(--text-3)' }}>Reduced Risk</span>
    </div>
  );
}
