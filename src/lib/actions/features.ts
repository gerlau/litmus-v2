'use server';

import { revalidatePath } from 'next/cache';
import * as q from '@/lib/db/queries/features';
import type { Feature } from '@/shared/types/domain';

export async function getFeatures(): Promise<Feature[]> {
  return q.getAll();
}

export async function getFeature(id: string): Promise<Feature | null> {
  return q.getById(id);
}

export async function createFeature(
  feature: Omit<Feature, 'createdAt' | 'updatedAt'>,
): Promise<Feature> {
  const now = new Date();
  const full: Feature = { ...feature, createdAt: now, updatedAt: now };
  const result = await q.insert(full);
  revalidatePath('/features');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  return result;
}

export async function updateFeature(
  id: string,
  changes: Partial<Omit<Feature, 'id' | 'createdAt'>>,
): Promise<Feature | null> {
  const result = await q.update(id, changes);
  revalidatePath('/features');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  return result;
}

export async function deleteFeature(id: string): Promise<boolean> {
  const result = await q.remove(id);
  revalidatePath('/features');
  revalidatePath('/risks');
  revalidatePath('/findings');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  return result;
}
