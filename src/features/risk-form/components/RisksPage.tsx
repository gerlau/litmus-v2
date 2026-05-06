'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Feature, Risk, DemoTableItem, DemoStepsItem, DemoRow, Step } from '@/shared/types/domain';
import { createRisk, updateRisk, deleteRisk } from '@/lib/actions/risks';
import DemoTable from '@/shared/components/DemoTable';
import StepsBlock from '@/shared/components/StepsBlock';
import DangerZone from '@/shared/components/DangerZone';

function toRows(risk: Risk): DemoRow[] {
  const item = risk.demonstration.find(d => d.type === 'table') as DemoTableItem | undefined;
  return item?.rows.map(r => ({ k: r.Configuration, v: r.Detail })) ?? [];
}

function toSteps(risk: Risk): Step[] {
  const item = risk.demonstration.find(d => d.type === 'steps') as DemoStepsItem | undefined;
  return item?.items.map(s => ({ text: s.text, file: s.images[0] ?? '', commands: s.commands ?? [] })) ?? [];
}

const selectCls = 'w-full rounded-lg px-3 py-2.5 text-[13.5px] field-select appearance-none';
const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

interface Props {
  features: Feature[];
  risks: Risk[];
}

const NEW = '__new__';

export default function RisksPage({ features, risks }: Props) {
  const router = useRouter();

  const firstFeature = features[0];
  const firstFeatureRisks = risks.filter(r => r.featureId === firstFeature?.id);
  const firstRisk = firstFeatureRisks[0];

  const [selectedFeatureId, setSelectedFeatureId] = useState(firstFeature?.id ?? '');
  const [isNew, setIsNew] = useState(!firstRisk);
  const [riskId, setRiskId] = useState(firstRisk?.id ?? '');
  const [title, setTitle] = useState(firstRisk?.title ?? '');
  const [desc, setDesc] = useState(firstRisk?.description ?? '');
  const [goal, setGoal] = useState(firstRisk?.goal ?? '');
  const [rows, setRows] = useState<DemoRow[]>(() => firstRisk ? toRows(firstRisk) : []);
  const [steps, setSteps] = useState<Step[]>(() => firstRisk ? toSteps(firstRisk) : []);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'deleting' | 'deleted'>('idle');

  const featureRisks = risks.filter(r => r.featureId === selectedFeatureId);

  function loadRisk(r: Risk) {
    setIsNew(false);
    setRiskId(r.id);
    setTitle(r.title);
    setDesc(r.description);
    setGoal(r.goal);
    setRows(toRows(r));
    setSteps(toSteps(r));
  }

  function enterNewMode() {
    setIsNew(true);
    setRiskId('');
    setTitle('');
    setDesc('');
    setGoal('');
    setRows([]);
    setSteps([]);
  }

  function selectFeature(id: string) {
    setSelectedFeatureId(id);
    const forFeature = risks.filter(r => r.featureId === id);
    if (forFeature.length > 0) {
      loadRisk(forFeature[0]);
    } else {
      enterNewMode();
    }
  }

  function selectRiskOrNew(val: string) {
    if (val === NEW) {
      enterNewMode();
    } else {
      const r = risks.find(x => x.id === val);
      if (r) loadRisk(r);
    }
  }

  function buildDemonstration() {
    return [
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
        items: steps.map((s, i) => ({ id: `step_${i + 1}`, text: s.text, images: s.file ? [s.file] : [], commands: s.commands })),
      },
    ];
  }

  async function handleSave() {
    setStatus('saving');
    const demonstration = buildDemonstration();
    if (isNew) {
      const created = await createRisk({ featureId: selectedFeatureId, title, description: desc, goal, demonstration });
      setIsNew(false);
      setRiskId(created.id);
    } else {
      await updateRisk(riskId, { title, description: desc, goal, demonstration });
    }
    router.refresh();
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  }

  async function handleDelete() {
    setStatus('deleting');
    await deleteRisk(riskId);
    const remaining = featureRisks.filter(r => r.id !== riskId);
    if (remaining.length > 0) {
      loadRisk(remaining[0]);
    } else {
      enterNewMode();
    }
    router.refresh();
    setStatus('deleted');
    setTimeout(() => setStatus('idle'), 2500);
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
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Feature</label>
          <select className={selectCls} style={selectStyle} value={selectedFeatureId} onChange={e => selectFeature(e.target.value)}>
            {features.map(f => <option key={f.id} value={f.id}>{f.id} — {f.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Risk</label>
          <select className={selectCls} style={selectStyle} value={isNew ? NEW : riskId} onChange={e => selectRiskOrNew(e.target.value)}>
            <option value={NEW}>— New Risk —</option>
            {featureRisks.map(r => <option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Title</label>
          <input className="w-full rounded-lg px-3 py-2.5 text-[13.5px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Short name for this risk" />
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
        <StepsBlock steps={steps} setSteps={setSteps} context="risks" />

        <div className="mt-5">
          <button
            className="w-full py-3.5 rounded-lg text-[12.5px] font-semibold uppercase tracking-widest"
            style={{
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              cursor: (status === 'saving' || status === 'deleting') ? 'not-allowed' : 'pointer',
              opacity: (status === 'saving' || status === 'deleting') ? 0.65 : 1,
            }}
            onClick={handleSave}
            disabled={status === 'saving' || status === 'deleting'}
          >
            {status === 'saving' ? 'Saving…' : isNew ? 'Add Risk' : 'Update Risk'}
          </button>
        </div>

        {(status === 'saved' || status === 'deleted') && (
          <p className="mt-2 text-[12.5px]" style={{ color: '#22c55e' }}>
            ✓ {status === 'saved' ? 'Saved successfully' : 'Deleted successfully'}
          </p>
        )}

        {!isNew && <DangerZone label="risk" onDelete={handleDelete} />}
      </div>
    </div>
  );
}
