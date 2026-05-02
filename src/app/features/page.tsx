import { FeaturesPage } from '@/features/feature-form';
import * as featuresQ from '@/lib/db/queries/features';

export default async function Page() {
  const features = await featuresQ.getAll();
  return <FeaturesPage features={features} />;
}
