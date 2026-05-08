import { db, init } from '../index';
import type { Incident, IncidentRisk } from '../../../shared/types/domain';

interface RawIncidentRow {
  id: string;
  postDate: string;
  postUrl: string;
  summary: string | null;
  risks: string;
  createdAt: string;
}

function deserialize(row: RawIncidentRow): Incident {
  return {
    id: row.id,
    postDate: row.postDate,
    postUrl: row.postUrl,
    summary: row.summary,
    risks: JSON.parse(row.risks) as IncidentRisk[],
    createdAt: new Date(row.createdAt),
  };
}

function serialize(incident: Incident): Record<string, unknown> {
  return {
    id: incident.id,
    postDate: incident.postDate,
    postUrl: incident.postUrl,
    summary: incident.summary,
    risks: JSON.stringify(incident.risks),
    createdAt: incident.createdAt.toISOString(),
  };
}

export async function insert(incident: Incident): Promise<Incident> {
  await init();
  await db('incidents').insert(serialize(incident));
  return incident;
}

export async function getAll(): Promise<Incident[]> {
  await init();
  const rows = await db<RawIncidentRow>('incidents').select('*').orderBy('createdAt', 'desc');
  return rows.map(deserialize);
}

export async function getByUrl(postUrl: string): Promise<Incident | null> {
  await init();
  const row = await db<RawIncidentRow>('incidents').where({ postUrl }).first();
  return row ? deserialize(row) : null;
}

export async function remove(id: string): Promise<void> {
  await init();
  await db('incidents').where({ id }).del();
}
