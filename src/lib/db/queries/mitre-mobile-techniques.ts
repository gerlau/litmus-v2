import { db, init } from '../index';
import type { MitreAttackMobileTechnique } from '../../../shared/types/domain';

interface RawMitreAttackMobileTechniqueRow {
  id: string;
  name: string;
  description: string;
}

function deserialize(row: RawMitreAttackMobileTechniqueRow): MitreAttackMobileTechnique {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
  };
}

export async function getAll(): Promise<MitreAttackMobileTechnique[]> {
  await init();
  const rows = await db<RawMitreAttackMobileTechniqueRow>('mitre_mobile_techniques')
    .select('id', 'name', 'description')
    .orderBy('id', 'asc');
  return rows.map(deserialize);
}
