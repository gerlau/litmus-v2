'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import * as q from '@/lib/db/queries/incidents';
import type { Incident, IncidentRisk } from '@/shared/types/domain';

export async function saveIncident(
  postDate: string,
  postUrl: string,
  summary: string | null,
  risks: IncidentRisk[],
): Promise<Incident> {
  const incident: Incident = {
    id: randomUUID(),
    postDate,
    postUrl,
    summary,
    risks,
    createdAt: new Date(),
  };
  await q.insert(incident);
  revalidatePath('/');
  return incident;
}

export async function getIncidentByUrl(postUrl: string): Promise<Incident | null> {
  return q.getByUrl(postUrl);
}

export async function deleteIncident(id: string): Promise<void> {
  await q.remove(id);
  revalidatePath('/');
}
