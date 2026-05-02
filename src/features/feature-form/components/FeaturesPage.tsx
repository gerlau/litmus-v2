'use client';

import { useState } from 'react';
import { FEATURES, DemoRow, Step } from '@/shared/utils/data';
import DemoTable from '@/shared/components/DemoTable';
import StepsBlock from '@/shared/components/StepsBlock';
import DangerZone from '@/shared/components/DangerZone';

const INITIAL_ROWS: DemoRow[] = [
  { k: 'Platform', v: 'iOS / Android' },
  { k: 'Auth method', v: 'Biometric prompt (LAContext / BiometricPrompt)' },
];
const INITIAL_STEPS: Step[] = [
  { text: 'Launch the application on a device with biometrics enrolled.', file: '' },
  { text: 'Tap "Sign in with biometrics" on the login screen.', file: '' },
];

export default function FeaturesPage() {
  const [featureId, setFeatureId] = useState('F-001');
  const [desc, setDesc] = useState('Fingerprint and Face ID login flow used to unlock the application.');
  const [ctx, setCtx] = useState('');
  const [rows, setRows] = useState<DemoRow[]>(INITIAL_ROWS);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Features</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Document and maintain the security-relevant features of in-scope apps.</p>
      </div>

      <div className="rounded-[14px] p-[22px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', maxWidth: 760 }}>
        <h3 className="text-[15px] font-semibold m-0 mb-[18px]" style={{ color: 'var(--text)' }}>Add / Update Feature</h3>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Feature ID</label>
          <select className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-select appearance-none" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }} value={featureId} onChange={e => setFeatureId(e.target.value)}>
            {FEATURES.map(f => <option key={f.id} value={f.id}>{f.id} — {f.name}</option>)}
          </select>
          <div className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>
            Select an existing ID to update, or pick the next one (<span className="font-mono font-semibold text-[11px]" style={{ color: 'var(--text-2)' }}>F-007</span>) to add new.
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Description</label>
          <textarea className="w-full rounded-lg px-3 py-2.5 text-[13.5px] resize-y field-textarea" style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }} value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Additional Context</label>
          <textarea className="w-full rounded-lg px-3 py-2.5 text-[13.5px] resize-y field-textarea" style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }} value={ctx} onChange={e => setCtx(e.target.value)} placeholder="Notes, edge cases, related platform capabilities…" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-5 mb-2.5" style={{ color: 'var(--text-2)' }}>Demonstration</div>
        <DemoTable rows={rows} setRows={setRows} />

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-5 mb-2.5" style={{ color: 'var(--text-2)' }}>Steps</div>
        <StepsBlock steps={steps} setSteps={setSteps} />

        <div className="mt-5">
          <button className="w-full py-3.5 rounded-lg text-[12.5px] font-semibold uppercase tracking-widest" style={{ background: 'var(--ink)', color: '#fff', border: 'none' }}>
            Update Feature
          </button>
        </div>

        <DangerZone label="feature" />
      </div>
    </div>
  );
}
