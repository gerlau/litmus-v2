'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Feature, DemoTableItem, DemoStepsItem, DemoRow, Step } from '@/shared/types/domain';
import { updateFeature, deleteFeature, createFeature } from '@/lib/actions/features';
import DemoTable from '@/shared/components/DemoTable';
import StepsBlock from '@/shared/components/StepsBlock';
import DangerZone from '@/shared/components/DangerZone';

function toRows(feature: Feature): DemoRow[] {
  const item = feature.demonstration.find(d => d.type === 'table') as DemoTableItem | undefined;
  return item?.rows.map(r => ({ k: r.Configuration, v: r.Detail })) ?? [];
}

function toSteps(feature: Feature): Step[] {
  const item = feature.demonstration.find(d => d.type === 'steps') as DemoStepsItem | undefined;
  return item?.items.map(s => ({ text: s.text, file: s.images[0] ?? '' })) ?? [];
}

function nextFeatureId(features: Feature[]): string {
  if (features.length === 0) return 'F-001';
  const max = features.reduce((best, f) => {
    const n = parseInt(f.id.replace(/^[A-Z]+-/, ''), 10);
    return isNaN(n) ? best : Math.max(best, n);
  }, 0);
  return `F-${String(max + 1).padStart(3, '0')}`;
}

interface Props {
  features: Feature[];
}

export default function FeaturesPage({ features }: Props) {
  const router = useRouter();
  const first = features[0];

  const [featureId, setFeatureId] = useState(first?.id ?? '');
  const [desc, setDesc] = useState(first?.description ?? '');
  const [ctx, setCtx] = useState(first?.additionalContext ?? '');
  const [rows, setRows] = useState<DemoRow[]>(() => first ? toRows(first) : []);
  const [steps, setSteps] = useState<Step[]>(() => first ? toSteps(first) : []);

  const [mode, setMode] = useState<'update' | 'add'>('update');
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'deleting' | 'deleted'>('idle');

  function selectFeature(id: string) {
    const f = features.find(x => x.id === id);
    if (!f) return;
    setFeatureId(id);
    setDesc(f.description);
    setCtx(f.additionalContext ?? '');
    setRows(toRows(f));
    setSteps(toSteps(f));
  }

  function enterAddMode() {
    setMode('add');
    setNewId(nextFeatureId(features));
    setNewName('');
    setNewPlatform('');
    setDesc('');
    setCtx('');
    setRows([]);
    setSteps([]);
  }

  function cancelAddMode() {
    setMode('update');
    if (featureId) selectFeature(featureId);
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
        items: steps.map((s, i) => ({ id: `step_${i + 1}`, text: s.text, images: s.file ? [s.file] : [] })),
      },
    ];
  }

  async function handleUpdate() {
    setStatus('saving');
    await updateFeature(featureId, { description: desc, additionalContext: ctx || undefined, demonstration: buildDemonstration() });
    router.refresh();
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  }

  async function handleAdd() {
    setStatus('saving');
    const created = await createFeature({
      id: newId,
      name: newName,
      platform: newPlatform,
      description: desc,
      additionalContext: ctx || undefined,
      demonstration: buildDemonstration(),
    });
    setMode('update');
    setFeatureId(created.id);
    router.refresh();
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  }

  async function handleDelete() {
    setStatus('deleting');
    await deleteFeature(featureId);
    const remaining = features.filter(f => f.id !== featureId);
    if (remaining.length > 0) selectFeature(remaining[0].id);
    router.refresh();
    setStatus('deleted');
    setTimeout(() => setStatus('idle'), 2500);
  }

  const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };
  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Features</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Document and maintain the security-relevant features of in-scope apps.</p>
      </div>

      <div className="rounded-[14px] p-[22px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', maxWidth: 760 }}>
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="text-[15px] font-semibold m-0" style={{ color: 'var(--text)' }}>Add / Update Feature</h3>
          {mode === 'update' && (
            <button
              onClick={enterAddMode}
              className="text-[12px] font-semibold rounded-md px-2.5 py-1.5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }}
            >
              + New Feature
            </button>
          )}
          {mode === 'add' && (
            <button
              onClick={cancelAddMode}
              className="text-[12px] font-medium"
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Feature ID</label>
          {mode === 'update' ? (
            <select
              className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-select appearance-none"
              style={selectStyle}
              value={featureId}
              onChange={e => selectFeature(e.target.value)}
            >
              {features.map(f => <option key={f.id} value={f.id}>{f.id} — {f.name}</option>)}
            </select>
          ) : (
            <input
              required
              className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-input"
              style={inputStyle}
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="e.g. F-004"
            />
          )}
        </div>

        {mode === 'add' && (
          <>
            <div className="flex flex-col gap-1.5 mb-3.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Feature Name</label>
              <input
                required
                className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-input"
                style={inputStyle}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Biometric Authentication"
              />
            </div>
            <div className="flex flex-col gap-1.5 mb-3.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Platform</label>
              <input
                required
                className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-input"
                style={inputStyle}
                value={newPlatform}
                onChange={e => setNewPlatform(e.target.value)}
                placeholder="e.g. iOS / Android"
              />
            </div>
          </>
        )}

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
        <StepsBlock steps={steps} setSteps={setSteps} context="features" />

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
            onClick={mode === 'update' ? handleUpdate : handleAdd}
            disabled={status === 'saving' || status === 'deleting'}
          >
            {status === 'saving' ? 'Saving…' : mode === 'update' ? 'Update Feature' : 'Add Feature'}
          </button>
        </div>

        {(status === 'saved' || status === 'deleted') && (
          <p className="mt-2 text-[12.5px]" style={{ color: '#22c55e' }}>
            ✓ {status === 'saved' ? 'Saved successfully' : 'Deleted successfully'}
          </p>
        )}

        {mode === 'update' && <DangerZone label="feature" onDelete={handleDelete} />}
      </div>
    </div>
  );
}
