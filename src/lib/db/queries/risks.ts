import { db, init } from '../index';
import type { Risk, DemonstrationItem } from '../../../shared/types/domain';

interface RawRiskRow {
  id: string;
  featureId: string;
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
  const { updatedAt: _u, demonstration, isBlocking, ...rest } = changes;
  const patch: Record<string, unknown> = { ...rest, updatedAt: new Date().toISOString() };
  if (demonstration !== undefined) patch.demonstration = JSON.stringify(demonstration);
  if (isBlocking !== undefined) patch.isBlocking = isBlocking ? 1 : 0;
  const count = await db('risks').where({ id }).update(patch);
  if (count === 0) return null;
  return getById(id);
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
