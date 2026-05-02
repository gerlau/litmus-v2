'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Feature, Risk, DemoTableItem, DemoStepsItem } from '@/shared/types/domain';
import { type DemoRow, type Step } from '@/shared/utils/data';
import { updateRisk, deleteRisk } from '@/lib/actions/risks';
import DemoTable from '@/shared/components/DemoTable';
import StepsBlock from '@/shared/components/StepsBlock';
import DangerZone from '@/shared/components/DangerZone';

function toRows(risk: Risk): DemoRow[] {
  const item = risk.demonstration.find(d => d.type === 'table') as DemoTableItem | undefined;
  return item?.rows.map(r => ({ k: r.Configuration, v: r.Detail })) ?? [];
}

function toSteps(risk: Risk): Step[] {
  const item = risk.demonstration.find(d => d.type === 'steps') as DemoStepsItem | undefined;
  return item?.items.map(s => ({ text: s.text, file: '' })) ?? [];
}

const selectCls = 'w-full rounded-lg px-3 py-2.5 text-[13.5px] field-select appearance-none';
const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

interface Props {
  features: Feature[];
  risks: Risk[];
}

export default function RisksPage({ features, risks }: Props) {
  const router = useRouter();
  const first = risks[0];

  const [riskId, setRiskId] = useState(first?.id ?? '');
  const [featureId, setFeatureId] = useState(first?.featureId ?? '');
  const [desc, setDesc] = useState(first?.description ?? '');
  const [goal, setGoal] = useState(first?.goal ?? '');
  const [rows, setRows] = useState<DemoRow[]>(() => first ? toRows(first) : []);
  const [steps, setSteps] = useState<Step[]>(() => first ? toSteps(first) : []);

  function selectRisk(id: string) {
    const r = risks.find(x => x.id === id);
    if (!r) return;
    setRiskId(id);
    setFeatureId(r.featureId);
    setDesc(r.description);
    setGoal(r.goal);
    setRows(toRows(r));
    setSteps(toSteps(r));
  }

  async function handleUpdate() {
    const demonstration = [
      {
        id: 'setup_table',
        type: 'table' as const,
        label: 'Setup',
        rows: rows.map(r => ({ Configuration: r.k, Detail: r.v })),
      },
      {
        id: 'steps',
        type: 'steps' as const,
        label: 'Demonstration',
        items: steps.map((s, i) => ({ id: `step_${i + 1}`, text: s.text, images: [] as string[] })),
      },
    ];
    await updateRisk(riskId, { description: desc, goal, demonstration });
    router.refresh();
  }

  async function handleDelete() {
    await deleteRisk(riskId);
    const remaining = risks.filter(r => r.id !== riskId);
    if (remaining.length > 0) selectRisk(remaining[0].id);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Risks</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Document risks that can apply to one or more features across apps.</p>
      </div>

      <div className="rounded-[14px] p-[22px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', maxWidth: 760 }}>
        <h3 className="text-[15px] font-semibold m-0 mb-[18px]" style={{ color: 'var(--text)' }}>Add / Update Risk</h3>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Risk ID</label>
          <select className={selectCls} style={selectStyle} value={riskId} onChange={e => selectRisk(e.target.value)}>
            {risks.map(r => <option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Feature ID</label>
          <select className={selectCls} style={selectStyle} value={featureId} onChange={e => setFeatureId(e.target.value)}>
            {features.map(f => <option key={f.id} value={f.id}>{f.id} — {f.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Description</label>
          <textarea className="w-full rounded-lg px-3 py-2.5 text-[13.5px] resize-y field-textarea" style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }} value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Goal</label>
          <textarea className="w-full rounded-lg px-3 py-2.5 text-[13.5px] resize-y field-textarea" style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }} value={goal} onChange={e => setGoal(e.target.value)} placeholder="What outcome reduces this risk?" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-5 mb-2.5" style={{ color: 'var(--text-2)' }}>Demonstration</div>
        <DemoTable rows={rows} setRows={setRows} />

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-5 mb-2.5" style={{ color: 'var(--text-2)' }}>Steps</div>
        <StepsBlock steps={steps} setSteps={setSteps} />

        <div className="mt-5">
          <button
            className="w-full py-3.5 rounded-lg text-[12.5px] font-semibold uppercase tracking-widest"
            style={{ background: 'var(--ink)', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={handleUpdate}
          >
            Update Risk
          </button>
        </div>

        <DangerZone label="risk" onDelete={handleDelete} />
      </div>
    </div>
  );
}
