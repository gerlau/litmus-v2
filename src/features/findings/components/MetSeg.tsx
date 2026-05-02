'use client';

type MetValue = 'met' | 'not';

interface Props {
  value: MetValue;
  onChange: (v: MetValue) => void;
}

export default function MetSeg({ value, onChange }: Props) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg" style={{ border: '1px solid var(--border)' }}>
      {(['met', 'not'] as const).map((opt, i) => (
        <button
          key={opt}
          className="px-3.5 py-2 text-[12px] font-semibold border-0"
          style={{
            background: value === opt
              ? opt === 'met' ? 'var(--success-soft)' : 'var(--danger-soft)'
              : 'var(--surface)',
            color: value === opt
              ? opt === 'met' ? 'var(--success)' : 'var(--danger)'
              : 'var(--text-2)',
            borderRight: i === 0 ? '1px solid var(--border)' : 'none',
            cursor: 'pointer',
          }}
          onClick={() => onChange(opt)}
        >
          {opt === 'met' ? 'Met' : 'Not Met'}
        </button>
      ))}
    </div>
  );
}
