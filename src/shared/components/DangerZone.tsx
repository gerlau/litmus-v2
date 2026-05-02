'use client';

import { useState } from 'react';

interface DangerZoneProps {
  label: string;
}

export default function DangerZone({ label }: DangerZoneProps) {
  const [val, setVal] = useState('');
  const armed = val === 'DELETE';

  return (
    <div className="mt-7">
      <hr className="my-5" style={{ height: 1, background: 'var(--border)', border: 0 }} />
      <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--danger)' }}>Danger Zone</div>
      <div className="text-[12.5px] mb-2.5" style={{ color: 'var(--text-2)' }}>
        Type{' '}
        <code className="font-mono rounded px-1.5 py-px" style={{ background: 'var(--surface-3)', color: 'var(--danger)', fontSize: 12 }}>DELETE</code>
        {' '}to confirm permanent removal of this {label}.
      </div>
      <input
        className="w-full rounded-lg px-3 py-2.5 text-[13.5px] mb-2.5 field-input"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${armed ? 'var(--danger)' : 'var(--border)'}`,
          color: armed ? 'var(--danger)' : 'var(--text)',
          outline: 'none',
        }}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder='Type "DELETE" to enable button'
      />
      <button
        disabled={!armed}
        className="w-full py-3.5 rounded-[10px] text-[12.5px] font-semibold uppercase tracking-widest"
        style={armed
          ? { background: 'var(--danger)', color: '#fff', border: 0, cursor: 'pointer' }
          : { background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)', cursor: 'not-allowed' }
        }
      >
        Delete {label}
      </button>
    </div>
  );
}
