'use client';

import { useState } from 'react';
import { Risk, FEATURES, FindingStatus, DemoRow, Step } from '@/shared/utils/data';
import { Icons } from '@/shared/components/Icon';
import StepsBlock from '@/shared/components/StepsBlock';
import RiskToggle from './RiskToggle';
import MetSeg from './MetSeg';

interface Props {
  risk: Risk;
  status: FindingStatus;
  onToggle: (id: string) => void;
}

type MetValue = 'met' | 'not';

export default function RiskRow({ risk, status, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const [descMet, setDescMet] = useState<MetValue>(status === 'reduced' ? 'met' : 'not');
  const [goalMet, setGoalMet] = useState<MetValue>(status === 'reduced' ? 'met' : 'not');
  const [desc, setDesc] = useState(risk.desc);
  const [goal, setGoal] = useState('Mitigate via secure storage and rate-limited authentication.');
  const [rows, setRows] = useState<DemoRow[]>([
    { k: 'Observed on', v: 'iOS 17.4 / Pixel 8 (Android 14)' },
    { k: 'Evidence', v: 'logcat-snippet.txt, charles-session.har' },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { text: 'Reproduce on a fresh install with default settings.', file: '' },
    { text: 'Capture network traffic during the affected flow.', file: '' },
  ]);

  const featureName = FEATURES.find(f => f.id === risk.featureId)?.name ?? '';
  const on = status === 'reduced';

  return (
    <div className="rounded-[10px] mb-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Row header */}
      <div className="flex items-center gap-3 px-[18px] py-3.5 cursor-pointer hover:bg-[var(--surface-2)]" onClick={() => setOpen(!open)}>
        <span className={`caret ${open ? 'open' : ''}`} style={{ color: 'var(--text-3)' }}><Icons.caret /></span>
        <span className="font-mono text-[10.5px] font-semibold px-[7px] py-[3px] rounded uppercase flex-shrink-0" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{risk.id}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{risk.title}</div>
          <div className="text-[12.5px] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{risk.desc}</div>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <RiskToggle on={on} onChange={() => onToggle(risk.id)} />
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="px-[18px] pb-[18px] pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Feature ID</label>
              <input readOnly className="w-full rounded-lg px-3 py-2.5 text-[13.5px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} value={`${risk.featureId} — ${featureName}`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Risk ID</label>
              <input readOnly className="w-full rounded-lg px-3 py-2.5 text-[13.5px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} value={`${risk.id} — ${risk.title}`} />
            </div>
          </div>

          {/* Description with Met/Not Met */}
          {[
            { label: 'Description', metVal: descMet, setMet: setDescMet, val: desc, setVal: setDesc, prompt: 'App meets description?' },
            { label: 'Goal', metVal: goalMet, setMet: setGoalMet, val: goal, setVal: setGoal, prompt: 'App meets goal?' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5 mb-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{f.label}</label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--text-3)', fontWeight: 500 }}>{f.prompt}</span>
                  <MetSeg value={f.metVal} onChange={f.setMet} />
                </div>
              </div>
              <textarea className="w-full rounded-lg px-3 py-2.5 text-[13.5px] resize-y field-textarea" style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }} value={f.val} onChange={e => f.setVal(e.target.value)} />
            </div>
          ))}

          {/* Demonstration inline table */}
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-4 mb-2.5" style={{ color: 'var(--text-2)' }}>Demonstration</div>
          <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <thead>
              <tr>
                <th className="text-left text-[12px] font-semibold px-3 py-2.5" style={{ width: '34%', background: 'var(--surface-2)', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Configuration</th>
                <th className="text-left text-[12px] font-semibold px-3 py-2.5" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Detail</th>
                <th style={{ width: 32, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2.5 text-[13px]" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <input className="w-full border-0 bg-transparent outline-none text-[13px]" style={{ color: 'var(--text)' }} value={r.k} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, k: e.target.value } : x))} />
                  </td>
                  <td className="px-3 py-2.5 text-[13px]" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <input className="w-full border-0 bg-transparent outline-none text-[13px]" style={{ color: 'var(--text)' }} value={r.v} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, v: e.target.value } : x))} />
                  </td>
                  <td className="text-center" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <button className="border-0 bg-transparent text-[14px] leading-none" style={{ color: 'var(--danger)' }} onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 mb-4">
            <button className="rounded-md px-2.5 py-1.5 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }} onClick={() => setRows([...rows, { k: '', v: '' }])}>+ Add row</button>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-4 mb-2.5" style={{ color: 'var(--text-2)' }}>Steps</div>
          <StepsBlock steps={steps} setSteps={setSteps} />

          <div className="flex gap-2.5 mt-4">
            <button className="inline-flex items-center justify-center rounded-lg px-[22px] py-3 text-[12.5px] font-semibold uppercase tracking-widest" style={{ background: 'var(--ink)', color: '#fff', border: 'none', cursor: 'pointer' }}>Save Finding</button>
            <button className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
