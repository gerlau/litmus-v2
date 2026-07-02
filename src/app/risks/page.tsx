import { RisksPage } from '@/features/risk-form';
import * as featuresQ from '@/lib/db/queries/features';
import * as mitreTechniquesQ from '@/lib/db/queries/mitre-mobile-techniques';
import * as risksQ from '@/lib/db/queries/risks';

export default async function Page() {
  const [features, risks, mitreAttackMobileTechniques] = await Promise.all([
    featuresQ.getAll(),
    risksQ.getAll(),
    mitreTechniquesQ.getAll(),
  ]);
  return (
    <RisksPage
      features={features}
      risks={risks}
      mitreAttackMobileTechniques={mitreAttackMobileTechniques}
    />
  );
}
