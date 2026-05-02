'use server';

import { revalidatePath } from 'next/cache';
import * as q from '@/lib/db/queries/risks';
import type { Risk } from '@/shared/types/domain';

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
  return result;
}

export async function deleteRisk(id: string): Promise<boolean> {
  const result = await q.remove(id);
  revalidatePath('/risks');
  revalidatePath('/findings');
  revalidatePath('/');
  return result;
}
