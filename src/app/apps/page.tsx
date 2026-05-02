import { AppsPage } from '@/features/apps-form';
import * as appsQ from '@/lib/db/queries/apps';

export default async function Page() {
  const apps = await appsQ.getAll();
  return <AppsPage apps={apps} />;
}
