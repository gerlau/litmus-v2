'use client';

import { CisoContact } from '@/shared/utils/data';

interface Props {
  index: number;
  total: number;
  value: CisoContact;
  onChange: (v: CisoContact) => void;
  onRemove: () => void;
}

const fields: { key: keyof CisoContact; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Full name', placeholder: 'Jane Doe' },
  { key: 'title', label: 'Title', placeholder: 'Chief Information Security Officer' },
  { key: 'email', label: 'Email', placeholder: 'jane.doe@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '+1 (555) 555-0123' },
];

export default function CisoBlock({ index, total, value, onChange, onRemove }: Props) {
  return (
    <div className="rounded-[10px] p-4 mb-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <b className="text-[13px]" style={{ color: 'var(--text)' }}>CISO Point of Contact #{index + 1}</b>
        {total > 1 && (
          <button className="border-0 bg-transparent text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--danger)', cursor: 'pointer' }} onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {fields.map(f => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{f.label}</label>
            <input
              className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-input"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
              value={value[f.key]}
              placeholder={f.placeholder}
              onChange={e => onChange({ ...value, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
