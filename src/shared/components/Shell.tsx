'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './Icon';

const NAV_ITEMS = [
  { key: '/', label: 'Dashboard', icon: 'dashboard' as const, section: 'stakeholder' },
  { key: '/features', label: 'Features', icon: 'features' as const, badge: 6, section: 'practitioner' },
  { key: '/risks', label: 'Risks', icon: 'risks' as const, badge: 7, section: 'practitioner' },
  { key: '/apps', label: 'Apps', icon: 'apps' as const, badge: 7, section: 'practitioner' },
  { key: '/findings', label: 'Findings', icon: 'findings' as const, section: 'practitioner' },
] as const;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/features': 'Features',
  '/risks': 'Risks',
  '/apps': 'Applications',
  '/findings': 'Findings',
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('mobsec-theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('mobsec-theme', theme);
  }, [theme]);

  const title = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="flex flex-col gap-1 p-[14px] sticky top-0 h-screen overflow-y-auto flex-shrink-0"
        style={{ width: 232, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-[10px] pb-[18px] mb-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-[30px] h-[30px] rounded-lg grid place-items-center text-white text-[13px] font-bold" style={{ background: 'var(--ink)' }}>M</div>
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>MobSec</div>
            <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>Assessment Platform</div>
          </div>
        </div>

        <div className="text-[10px] font-semibold uppercase tracking-widest px-2.5 pt-3 pb-1.5" style={{ color: 'var(--text-3)' }}>Stakeholder</div>
        {NAV_ITEMS.filter(i => i.section === 'stakeholder').map(item => (
          <NavItem key={item.key} item={item} active={pathname === item.key} />
        ))}

        <div className="text-[10px] font-semibold uppercase tracking-widest px-2.5 pt-3 pb-1.5" style={{ color: 'var(--text-3)' }}>Practitioner</div>
        {NAV_ITEMS.filter(i => i.section === 'practitioner').map(item => (
          <NavItem key={item.key} item={item} active={pathname === item.key} />
        ))}

        <div className="mt-auto pt-3.5 flex items-center gap-2.5" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            {theme === 'dark' ? <Icons.sun /> : <Icons.moon />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <div className="flex items-center gap-2 text-[12px] ml-auto" style={{ color: 'var(--text-2)' }}>
            <div className="w-[26px] h-[26px] rounded-full grid place-items-center text-white text-[11px] font-semibold" style={{ background: 'linear-gradient(135deg,#5b6bdb,#8b5cf6)' }}>SK</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 flex items-center px-6 gap-4 sticky top-0 z-10" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-3)' }}>
            MobSec / <b style={{ color: 'var(--text)' }}>{title}</b>
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', width: 280, color: 'var(--text-3)' }}>
            <Icons.search />
            <input placeholder="Search apps, risks, findings…" className="bg-transparent border-0 outline-none flex-1 text-[13px]" style={{ color: 'var(--text)' }} />
            <kbd className="font-mono text-[10.5px] rounded px-1.5 py-0.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>⌘K</kbd>
          </div>
          <button className="w-8 h-8 rounded-lg grid place-items-center" style={{ color: 'var(--text-2)' }}>
            <Icons.bell />
          </button>
        </div>
        <div className="p-6 pb-20 max-w-[1320px] w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  item: typeof NAV_ITEMS[number];
  active: boolean;
}

function NavItem({ item, active }: NavItemProps) {
  const Icon = Icons[item.icon];
  return (
    <Link
      href={item.key}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium no-underline"
      style={{
        color: active ? 'var(--text)' : 'var(--text-2)',
        background: active ? 'var(--surface-3)' : 'transparent',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <span style={{ color: active ? 'var(--text)' : 'var(--text-3)' }}><Icon /></span>
      <span>{item.label}</span>
      {'badge' in item && item.badge != null && (
        <span className="ml-auto text-[11px] px-[7px] py-px rounded-full font-medium" style={{ background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}
