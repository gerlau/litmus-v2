import { db, init } from '../index';
import type { Feature, DemonstrationItem } from '../../../shared/types/domain';

interface RawFeatureRow {
  id: string;
  name: string;
  description: string;
  additionalContext: string | null;
  demonstration: string;
  createdAt: string;
  updatedAt: string;
}

function deserialize(row: RawFeatureRow): Feature {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    additionalContext: row.additionalContext ?? undefined,
    demonstration: JSON.parse(row.demonstration) as DemonstrationItem[],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function serialize(f: Feature): Record<string, unknown> {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    additionalContext: f.additionalContext ?? null,
    demonstration: JSON.stringify(f.demonstration),
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

export async function getAll(): Promise<Feature[]> {
  await init();
  const rows = await db<RawFeatureRow>('features').select('*');
  return rows.map(deserialize);
}

export async function getById(id: string): Promise<Feature | null> {
  await init();
  const row = await db<RawFeatureRow>('features').where({ id }).first();
  return row ? deserialize(row) : null;
}

export async function insert(feature: Feature): Promise<Feature> {
  await init();
  await db('features').insert(serialize(feature));
  return feature;
}

export async function update(
  id: string,
  changes: Partial<Omit<Feature, 'id' | 'createdAt'>>,
): Promise<Feature | null> {
  await init();
  const { updatedAt: _u, demonstration, additionalContext, ...rest } = changes;
  const patch: Record<string, unknown> = { ...rest, updatedAt: new Date().toISOString() };
  if (demonstration !== undefined) patch.demonstration = JSON.stringify(demonstration);
  if ('additionalContext' in changes) patch.additionalContext = additionalContext ?? null;
  const count = await db('features').where({ id }).update(patch);
  if (count === 0) return null;
  return getById(id);
}

export async function remove(id: string): Promise<boolean> {
  await init();
  const count = await db('features').where({ id }).del();
  return count > 0;
}

export async function count(): Promise<number> {
  await init();
  const rows = await db('features').count('* as count');
  return Number((rows[0] as { count: string | number }).count);
}
