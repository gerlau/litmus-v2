import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { context: string; filename: string } },
) {
  const { context, filename } = params;

  if (context.includes('..') || filename.includes('..') || filename.includes('/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const filePath = path.join(homedir(), '.litmus-v2', 'uploads', context, filename);

  try {
    const bytes = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    return new NextResponse(bytes, {
      headers: { 'Content-Type': MIME[ext] ?? 'application/octet-stream' },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
