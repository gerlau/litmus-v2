'use client';

import { Step } from '@/shared/utils/data';
import { Icons } from './Icon';

interface StepsBlockProps {
  steps: Step[];
  setSteps: (steps: Step[]) => void;
}

export default function StepsBlock({ steps, setSteps }: StepsBlockProps) {
  const updateText = (i: number, text: string) =>
    setSteps(steps.map((s, j) => (j === i ? { ...s, text } : s)));

  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className="rounded-lg p-3.5 mt-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>Step {i + 1}</span>
            <button
              className="border-0 bg-transparent text-[11.5px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--danger)' }}
              onClick={() => setSteps(steps.filter((_, j) => j !== i))}
            >Remove</button>
          </div>
          <textarea
            className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-textarea resize-y"
            style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }}
            placeholder="Describe what to do in this step…"
            value={s.text}
            onChange={e => updateText(i, e.target.value)}
          />
          <div className="flex items-center gap-2.5 mt-2 text-[12px]" style={{ color: 'var(--text-3)' }}>
            <label className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              <Icons.upload />
              <span>Attach file</span>
              <input type="file" className="hidden" />
            </label>
            <span>{s.file || 'PNG, JPG or PDF up to 10MB'}</span>
          </div>
        </div>
      ))}
      <div className="mt-2.5">
        <button
          className="rounded-md px-2.5 py-1.5 text-[12px] font-medium"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          onClick={() => setSteps([...steps, { text: '', file: '' }])}
        >+ Add step</button>
      </div>
    </div>
  );
}
