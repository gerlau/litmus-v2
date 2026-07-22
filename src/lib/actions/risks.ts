'use server';

import { revalidatePath } from 'next/cache';
import * as q from '@/lib/db/queries/risks';
import type { Risk, DemonstrationItem } from '@/shared/types/domain';

export async function getRisks(): Promise<Risk[]> {
  return q.getAll();
}

export async function getRisk(id: string): Promise<Risk | null> {
  return q.getById(id);
}

export async function updateRisk(
  id: string,
  changes: Partial<Omit<Risk, 'id' | 'featureId' | 'createdAt'>>,
): Promise<Risk | null> {
  const result = await q.update(id, changes);
  revalidatePath('/risks');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  return result;
}

export async function deleteRisk(id: string): Promise<boolean> {
  const result = await q.remove(id);
  revalidatePath('/risks');
  revalidatePath('/findings');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  return result;
}

async function nextRiskId(featureId: string): Promise<string> {
  const forFeature = await q.getByFeatureId(featureId);
  const nums = forFeature
    .map(r => { const m = r.id.match(/-R-(\d+)$/); return m ? parseInt(m[1], 10) : NaN; })
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${featureId}-R-${String(next).padStart(3, '0')}`;
}

export async function createRisk(data: {
  featureId: string;
  mitreAttackMobileTechniqueId: string | null;
  title: string;
  description: string;
  goal: string;
  demonstration: DemonstrationItem[];
}): Promise<Risk> {
  const now = new Date();
  const risk: Risk = {
    id: await nextRiskId(data.featureId),
    featureId: data.featureId,
    mitreAttackMobileTechniqueId: data.mitreAttackMobileTechniqueId,
    lastSeenAt: null,
    lastSeenUrl: null,
    title: data.title,
    description: data.description,
    goal: data.goal,
    isBlocking: false,
    demonstration: data.demonstration,
    createdAt: now,
    updatedAt: now,
  };
  const result = await q.insert(risk);
  revalidatePath('/risks');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  return result;
}
