import * as featuresQ from '@/lib/db/queries/features';
import * as risksQ from '@/lib/db/queries/risks';
import * as appsQ from '@/lib/db/queries/apps';
import Shell from './Shell';

export default async function ShellServer({ children }: { children: React.ReactNode }) {
  const [featuresCount, risksCount, appsCount] = await Promise.all([
    featuresQ.count(),
    risksQ.count(),
    appsQ.count(),
  ]);
  return (
    <Shell badgeCounts={{ features: featuresCount, risks: risksCount, apps: appsCount }}>
      {children}
    </Shell>
  );
}
