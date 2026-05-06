'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { App } from '@/shared/types/domain';
import { SECTORS } from '@/shared/utils/data';
import { createApp, updateApp, deleteApp } from '@/lib/actions/apps';
import DangerZone from '@/shared/components/DangerZone';
import CisoBlock from './CisoBlock';

const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

interface Props {
  apps: App[];
}

export default function AppsPage({ apps }: Props) {
  const router = useRouter();
  const [appId, setAppId] = useState(apps[0]?.id ?? '');
  const [isNew, setIsNew] = useState(apps.length === 0);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'deleting' | 'deleted'>('idle');

  const selected = apps.find(a => a.id === appId) ?? apps[0];

  const [name, setName] = useState(selected?.name ?? '');
  const [agency, setAgency] = useState(selected?.agency ?? '');
  const [version, setVersion] = useState(selected?.version ?? '');
  const [sector, setSector] = useState(selected?.sector ?? '');
  const [cisos, setCisos] = useState(selected?.cisos ?? []);

  function selectApp(id: string) {
    const app = apps.find(a => a.id === id);
    if (!app) return;
    setAppId(id);
    setName(app.name);
    setAgency(app.agency);
    setVersion(app.version);
    setSector(app.sector);
    setCisos(app.cisos);
  }

  async function handleSave() {
    setStatus('saving');
    if (isNew) {
      await createApp({ name, agency, version, sector, cisos, createdAt: new Date(), updatedAt: new Date() });
      setIsNew(false);
    } else {
      await updateApp(appId, { name, agency, version, sector, cisos });
    }
    router.refresh();
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  }

  async function handleDelete() {
    setStatus('deleting');
    await deleteApp(appId);
    const remaining = apps.filter(a => a.id !== appId);
    if (remaining.length > 0) selectApp(remaining[0].id);
    router.refresh();
    setStatus('deleted');
    setTimeout(() => setStatus('idle'), 2500);
  }

  if (!selected && !isNew) return null;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Apps</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Maintain the catalog of in-scope mobile applications and their owners.</p>
      </div>

      <div className="rounded-[14px] p-[22px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', maxWidth: 760 }}>
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Select Application</label>
            {isNew && apps.length > 0 ? (
              <button
                className="text-[12px] font-medium"
                style={{ color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => { setIsNew(false); selectApp(appId); }}
              >
                Cancel
              </button>
            ) : !isNew ? (
              <button
                className="text-[12px] font-medium"
                style={{ color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => { setIsNew(true); setName(''); setAgency(''); setVersion(''); setSector(SECTORS[0]); setCisos([]); }}
              >
                + New
              </button>
            ) : null}
          </div>
          {!isNew && (
            <select
              className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-select appearance-none"
              style={selectStyle}
              value={appId}
              onChange={e => selectApp(e.target.value)}
            >
              {apps.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
            </select>
          )}
        </div>

        {apps.length === 0 && isNew && (
          <p className="text-[13px] mb-4 mt-0" style={{ color: 'var(--text-3)' }}>
            No applications yet. Fill in the details below to add your first one.
          </p>
        )}
        <h3 className="text-[15px] font-semibold m-0 mb-[18px]" style={{ color: 'var(--text)' }}>Application Details</h3>

        <div className="grid grid-cols-2 gap-3.5">
          {[
            { label: 'App Name', value: name, set: setName, placeholder: 'App name' },
            { label: 'Version', value: version, set: setVersion, placeholder: '1.0.0' },
            { label: 'Agency / Owner', value: agency, set: setAgency, placeholder: 'Organization name' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{f.label}</label>
              <input className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-input" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} value={f.value} placeholder={f.placeholder} onChange={e => f.set(e.target.value)} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Sector</label>
            <select className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-select appearance-none" style={selectStyle} value={sector} onChange={e => setSector(e.target.value)}>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] mt-5 mb-2.5" style={{ color: 'var(--text-2)' }}>CISO Points of Contact</div>
        {cisos.map((c, i) => (
          <CisoBlock
            key={i}
            index={i}
            total={cisos.length}
            value={c}
            onChange={v => setCisos(cisos.map((x, j) => j === i ? v : x))}
            onRemove={() => setCisos(cisos.filter((_, j) => j !== i))}
          />
        ))}
        <button
          className="rounded-md px-2.5 py-1.5 text-[12px] font-medium"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }}
          onClick={() => setCisos([...cisos, { name: '', email: '' }])}
        >
          + Add another contact
        </button>

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
            {status === 'saving' ? 'Saving…' : isNew ? 'Add Application' : 'Update Application'}
          </button>
          {(status === 'saved' || status === 'deleted') && (
            <p className="mt-2 text-[12.5px]" style={{ color: '#22c55e' }}>
              ✓ {status === 'saved' ? 'Saved successfully' : 'Deleted successfully'}
            </p>
          )}
        </div>

        {!isNew && <DangerZone label="application" onDelete={handleDelete} />}
      </div>
    </div>
  );
}
