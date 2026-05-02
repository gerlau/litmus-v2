'use server';

import { revalidatePath } from 'next/cache';
import * as q from '@/lib/db/queries/apps';
import type { App } from '@/shared/types/domain';

export async function getApps(): Promise<App[]> {
  return q.getAll();
}

export async function getApp(id: string): Promise<App | null> {
  return q.getById(id);
}

export async function updateApp(
  id: string,
  changes: Partial<Omit<App, 'id' | 'createdAt'>>,
): Promise<App | null> {
  const result = await q.update(id, changes);
  revalidatePath('/apps');
  revalidatePath('/');
  return result;
}

export async function deleteApp(id: string): Promise<boolean> {
  const result = await q.remove(id);
  revalidatePath('/apps');
  revalidatePath('/');
  return result;
}
