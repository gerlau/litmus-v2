import { FindingsPage } from '@/features/findings';
import * as appsQ from '@/lib/db/queries/apps';
import * as featuresQ from '@/lib/db/queries/features';
import * as risksQ from '@/lib/db/queries/risks';
import * as findingsQ from '@/lib/db/queries/findings';

export default async function Page() {
  const [apps, features, risks, allFindings] = await Promise.all([
    appsQ.getAll(),
    featuresQ.getAll(),
    risksQ.getAll(),
    findingsQ.getAll(),
  ]);
  return <FindingsPage apps={apps} features={features} risks={risks} allFindings={allFindings} />;
}
