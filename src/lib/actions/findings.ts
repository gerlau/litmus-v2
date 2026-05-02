'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import * as q from '@/lib/db/queries/findings';
import type { Finding, FindingStatus, ObservationItem } from '@/shared/types/domain';

export async function getFindings(): Promise<Finding[]> {
  return q.getAll();
}

export async function getFindingsByApp(appId: string): Promise<Finding[]> {
  return q.getByAppId(appId);
}

export async function upsertFinding(
  appId: string,
  riskId: string,
  status: FindingStatus,
  observation?: ObservationItem[],
): Promise<Finding> {
  const now = new Date();
  const finding: Finding = {
    id: randomUUID(),
    appId,
    riskId,
    status,
    observation: observation ?? [
      { id: 'risk_status', text: status },
      { id: 'description_status', label: 'Description', text: status === 'reduced' ? 'met' : 'not-met' },
      { id: 'goal_status', label: 'Goal', text: status === 'reduced' ? 'met' : 'not-met' },
    ],
    createdAt: now,
    updatedAt: now,
  };
  const result = await q.upsert(finding);
  revalidatePath('/findings');
  revalidatePath('/');
  return result;
}
