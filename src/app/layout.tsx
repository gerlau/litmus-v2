import type { Metadata } from 'next';
import './globals.css';
import ShellServer from '@/shared/components/ShellServer';

export const metadata: Metadata = {
  title: 'MobSec — Mobile Security Assessment',
  description: 'Security posture dashboard and practitioner tooling for mobile application assessments.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Set theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('mobsec-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ShellServer>{children}</ShellServer>
      </body>
    </html>
  );
}
