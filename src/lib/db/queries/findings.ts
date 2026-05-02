import { db, init } from '../index';
import type { Finding, ObservationItem } from '../../../shared/types/domain';

interface RawFindingRow {
  id: string;
  appId: string;
  riskId: string;
  status: 'at-risk' | 'reduced';
  observation: string;
  createdAt: string;
  updatedAt: string;
}

function deserialize(row: RawFindingRow): Finding {
  return {
    id: row.id,
    appId: row.appId,
    riskId: row.riskId,
    status: row.status,
    observation: JSON.parse(row.observation) as ObservationItem[],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function serialize(f: Finding): Record<string, unknown> {
  return {
    id: f.id,
    appId: f.appId,
    riskId: f.riskId,
    status: f.status,
    observation: JSON.stringify(f.observation),
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

export async function getAll(): Promise<Finding[]> {
  await init();
  const rows = await db<RawFindingRow>('findings').select('*');
  return rows.map(deserialize);
}

export async function getByAppId(appId: string): Promise<Finding[]> {
  await init();
  const rows = await db<RawFindingRow>('findings').where({ appId }).select('*');
  return rows.map(deserialize);
}

export async function getByRiskId(riskId: string): Promise<Finding[]> {
  await init();
  const rows = await db<RawFindingRow>('findings').where({ riskId }).select('*');
  return rows.map(deserialize);
}

export async function getById(id: string): Promise<Finding | null> {
  await init();
  const row = await db<RawFindingRow>('findings').where({ id }).first();
  return row ? deserialize(row) : null;
}

export async function upsert(finding: Finding): Promise<Finding> {
  await init();
  const serialized = serialize(finding);
  await db('findings')
    .insert(serialized)
    .onConflict(['appId', 'riskId'])
    .merge(['status', 'observation', 'updatedAt']);
  const row = await db<RawFindingRow>('findings')
    .where({ appId: finding.appId, riskId: finding.riskId })
    .first();
  return deserialize(row!);
}

export async function remove(id: string): Promise<boolean> {
  await init();
  const count = await db('findings').where({ id }).del();
  return count > 0;
}
