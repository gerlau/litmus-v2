'use client';

import { useState } from 'react';
import { SECTORS, CisoContact } from '@/shared/utils/data';
import DangerZone from '@/shared/components/DangerZone';
import CisoBlock from './CisoBlock';

const selectStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

const INITIAL_CISOS: CisoContact[] = [
  { name: 'Jane Doe', title: 'Chief Information Security Officer', email: 'jane.doe@northbank.example', phone: '+1 (555) 555-0101' },
];

export default function AppsPage() {
  const [name, setName] = useState('NorthBank Mobile');
  const [agency, setAgency] = useState('NorthBank Holdings');
  const [version, setVersion] = useState('4.12.1');
  const [sector, setSector] = useState('Financial Services');
  const [cisos, setCisos] = useState<CisoContact[]>(INITIAL_CISOS);

  const updateCiso = (i: number, v: CisoContact) => setCisos(cisos.map((c, j) => j === i ? v : c));
  const removeCiso = (i: number) => setCisos(cisos.filter((_, j) => j !== i));
  const addCiso = () => setCisos([...cisos, { name: '', title: '', email: '', phone: '' }]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold m-0 mb-1" style={{ letterSpacing: '-0.015em', color: 'var(--text)' }}>Apps</h2>
        <p className="m-0 text-[13.5px]" style={{ color: 'var(--text-3)' }}>Maintain the catalog of in-scope mobile applications and their owners.</p>
      </div>

      <div className="rounded-[14px] p-[22px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', maxWidth: 760 }}>
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
          <CisoBlock key={i} index={i} total={cisos.length} value={c} onChange={v => updateCiso(i, v)} onRemove={() => removeCiso(i)} />
        ))}
        <button className="rounded-md px-2.5 py-1.5 text-[12px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }} onClick={addCiso}>
          + Add another contact
        </button>

        <div className="mt-5">
          <button className="w-full py-3.5 rounded-lg text-[12.5px] font-semibold uppercase tracking-widest" style={{ background: 'var(--ink)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Update Application
          </button>
        </div>

        <DangerZone label="application" />
      </div>
    </div>
  );
}
