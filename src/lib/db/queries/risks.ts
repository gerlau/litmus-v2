import { db, init } from '../index';
import type { Risk, DemonstrationItem } from '../../../shared/types/domain';

interface RawRiskRow {
  id: string;
  featureId: string;
  mitreAttackMobileTechniqueId: string | null;
  lastSeenAt: string | null;
  lastSeenUrl: string | null;
  title: string;
  description: string;
  goal: string;
  isBlocking: number; // 0 | 1 in SQLite
  demonstration: string;
  createdAt: string;
  updatedAt: string;
}

function deserialize(row: RawRiskRow): Risk {
  return {
    id: row.id,
    featureId: row.featureId,
    mitreAttackMobileTechniqueId: row.mitreAttackMobileTechniqueId,
    lastSeenAt: row.lastSeenAt,
    lastSeenUrl: row.lastSeenUrl,
    title: row.title,
    description: row.description,
    goal: row.goal,
    isBlocking: row.isBlocking !== 0,
    demonstration: JSON.parse(row.demonstration) as DemonstrationItem[],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function serialize(r: Risk): Record<string, unknown> {
  return {
    id: r.id,
    featureId: r.featureId,
    mitreAttackMobileTechniqueId: r.mitreAttackMobileTechniqueId,
    lastSeenAt: r.lastSeenAt,
    lastSeenUrl: r.lastSeenUrl,
    title: r.title,
    description: r.description,
    goal: r.goal,
    isBlocking: r.isBlocking ? 1 : 0,
    demonstration: JSON.stringify(r.demonstration),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getAll(): Promise<Risk[]> {
  await init();
  const rows = await db<RawRiskRow>('risks').select('*');
  return rows.map(deserialize);
}

export async function getByFeatureId(featureId: string): Promise<Risk[]> {
  await init();
  const rows = await db<RawRiskRow>('risks').where({ featureId }).select('*');
  return rows.map(deserialize);
}

export async function getById(id: string): Promise<Risk | null> {
  await init();
  const row = await db<RawRiskRow>('risks').where({ id }).first();
  return row ? deserialize(row) : null;
}

export async function insert(risk: Risk): Promise<Risk> {
  await init();
  await db('risks').insert(serialize(risk));
  return risk;
}

export async function update(
  id: string,
  changes: Partial<Omit<Risk, 'id' | 'featureId' | 'createdAt'>>,
): Promise<Risk | null> {
  await init();
  const {
    updatedAt: _u,
    demonstration,
    isBlocking,
    mitreAttackMobileTechniqueId,
    lastSeenAt,
    lastSeenUrl,
    ...rest
  } = changes;
  const patch: Record<string, unknown> = { ...rest, updatedAt: new Date().toISOString() };
  if (demonstration !== undefined) patch.demonstration = JSON.stringify(demonstration);
  if (isBlocking !== undefined) patch.isBlocking = isBlocking ? 1 : 0;
  if (mitreAttackMobileTechniqueId !== undefined) patch.mitreAttackMobileTechniqueId = mitreAttackMobileTechniqueId;
  if (lastSeenAt !== undefined) patch.lastSeenAt = lastSeenAt;
  if (lastSeenUrl !== undefined) patch.lastSeenUrl = lastSeenUrl;
  const count = await db('risks').where({ id }).update(patch);
  if (count === 0) return null;
  return getById(id);
}

function normalizeLastSeenDate(input: string): string | null {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export async function updateLastSeenByMitreTechniqueIds(
  techniqueIds: string[],
  postDate: string,
  postUrl: string,
): Promise<void> {
  await init();
  const uniqueTechniqueIds = Array.from(new Set(techniqueIds.filter(Boolean)));
  if (uniqueTechniqueIds.length === 0) return;

  const normalizedDate = normalizeLastSeenDate(postDate);
  if (!normalizedDate) return;

  const rows = await db<RawRiskRow>('risks')
    .whereIn('mitreAttackMobileTechniqueId', uniqueTechniqueIds)
    .select('*');

  for (const row of rows) {
    const currentDate = row.lastSeenAt ?? null;
    const shouldUpdate = !currentDate || currentDate < normalizedDate;
    if (!shouldUpdate) continue;

    await db('risks')
      .where({ id: row.id })
      .update({
        lastSeenAt: normalizedDate,
        lastSeenUrl: postUrl,
        updatedAt: new Date().toISOString(),
      });
  }
}

export async function remove(id: string): Promise<boolean> {
  await init();
  const count = await db('risks').where({ id }).del();
  return count > 0;
}

export async function count(): Promise<number> {
  await init();
  const rows = await db('risks').count('* as count');
  return Number((rows[0] as { count: string | number }).count);
}
