import { RisksPage } from '@/features/risk-form';
import * as featuresQ from '@/lib/db/queries/features';
import * as risksQ from '@/lib/db/queries/risks';

export default async function Page() {
  const [features, risks] = await Promise.all([
    featuresQ.getAll(),
    risksQ.getAll(),
  ]);
  return <RisksPage features={features} risks={risks} />;
}
