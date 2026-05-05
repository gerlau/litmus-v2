import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;
const VALID_CONTEXTS = ['features', 'risks', 'findings'];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const context = formData.get('context') as string | null;
  const stepIndex = parseInt(formData.get('stepIndex') as string, 10);
  const imageCount = parseInt(formData.get('imageCount') as string, 10);

  if (!file || !context || !VALID_CONTEXTS.includes(context)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed. Use PNG, JPG, or PDF.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10MB limit.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const filename = `${Date.now()}-step_${stepIndex + 1}_img${imageCount + 1}.${ext}`;
  const mode = process.env.LITMUS_USE_MOCK === 'true' ? 'mock' : 'real';
  const uploadDir = path.join(homedir(), '.litmus-v2', 'uploads', mode, context);

  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({ path: `/api/uploads/${mode}/${context}/${filename}` });
}
