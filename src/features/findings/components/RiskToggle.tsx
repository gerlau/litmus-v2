'use client';

interface Props {
  on: boolean | null;  // null = unclassified (no finding yet)
  onChange: (v: boolean) => void;
}

export default function RiskToggle({ on, onChange }: Props) {
  const switchClass = on === null ? 'unclassified' : on ? 'on' : '';
  const atRiskColor = on === null ? 'var(--text-3)' : on ? 'var(--text-3)' : 'var(--danger)';
  const reducedColor = on === null ? 'var(--text-3)' : on ? 'var(--success)' : 'var(--text-3)';

  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: atRiskColor }}>At Risk</span>
      <button className={`risk-switch ${switchClass}`} onClick={() => onChange(on === null ? false : !on)} />
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: reducedColor }}>Reduced Risk</span>
    </div>
  );
}
