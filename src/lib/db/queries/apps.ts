import { db, init } from '../index';
import type { App, CISO } from '../../../shared/types/domain';

interface RawAppRow {
  id: string;
  name: string;
  sector: string;
  agency: string;
  version: string;
  cisos: string;
  createdAt: string;
  updatedAt: string;
}

function deserialize(row: RawAppRow): App {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    agency: row.agency,
    version: row.version,
    cisos: JSON.parse(row.cisos) as CISO[],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function serialize(a: App): Record<string, unknown> {
  return {
    id: a.id,
    name: a.name,
    sector: a.sector,
    agency: a.agency,
    version: a.version,
    cisos: JSON.stringify(a.cisos),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function getAll(): Promise<App[]> {
  await init();
  const rows = await db<RawAppRow>('apps').select('*');
  return rows.map(deserialize);
}

export async function getById(id: string): Promise<App | null> {
  await init();
  const row = await db<RawAppRow>('apps').where({ id }).first();
  return row ? deserialize(row) : null;
}

export async function nextId(): Promise<string> {
  await init();
  const rows = await db<{ id: string }>('apps').select('id');
  const max = rows.reduce((acc, { id }) => {
    const m = id.match(/^A-(\d+)$/);
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  return `A-${String(max + 1).padStart(3, '0')}`;
}

export async function insert(app: App): Promise<App> {
  await init();
  await db('apps').insert(serialize(app));
  return app;
}

export async function update(
  id: string,
  changes: Partial<Omit<App, 'id' | 'createdAt'>>,
): Promise<App | null> {
  await init();
  const { updatedAt: _u, cisos, ...rest } = changes;
  const patch: Record<string, unknown> = { ...rest, updatedAt: new Date().toISOString() };
  if (cisos !== undefined) patch.cisos = JSON.stringify(cisos);
  const count = await db('apps').where({ id }).update(patch);
  if (count === 0) return null;
  return getById(id);
}

export async function remove(id: string): Promise<boolean> {
  await init();
  const count = await db('apps').where({ id }).del();
  return count > 0;
}
