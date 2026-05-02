'use client';

import { DemoRow } from '@/shared/utils/data';

interface DemoTableProps {
  rows: DemoRow[];
  setRows: (rows: DemoRow[]) => void;
}

export default function DemoTable({ rows, setRows }: DemoTableProps) {
  const update = (i: number, field: 'k' | 'v', val: string) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, [field]: val } : r)));

  return (
    <div>
      <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <thead>
          <tr>
            <th className="text-left text-[12px] font-semibold px-3 py-2.5" style={{ width: '34%', background: 'var(--surface-2)', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Configuration</th>
            <th className="text-left text-[12px] font-semibold px-3 py-2.5" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Detail</th>
            <th style={{ width: 32, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="px-3 py-2.5 text-[13px]" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <input className="w-full border-0 bg-transparent outline-none text-[13px]" style={{ color: 'var(--text)' }} value={row.k} placeholder="e.g. Endpoint, Header…" onChange={e => update(i, 'k', e.target.value)} />
              </td>
              <td className="px-3 py-2.5 text-[13px]" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <input className="w-full border-0 bg-transparent outline-none text-[13px]" style={{ color: 'var(--text)' }} value={row.v} placeholder="Value" onChange={e => update(i, 'v', e.target.value)} />
              </td>
              <td className="text-center" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <button className="border-0 bg-transparent text-[14px] leading-none" style={{ color: 'var(--danger)' }} onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2">
        <button className="rounded-md px-2.5 py-1.5 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }} onClick={() => setRows([...rows, { k: '', v: '' }])}>
          + Add row
        </button>
      </div>
    </div>
  );
}
