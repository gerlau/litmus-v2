'use client';

import { useState } from 'react';
import { type Step } from '@/shared/types/domain';
import { Icons } from './Icon';

type UploadContext = 'features' | 'risks' | 'findings';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface StepsBlockProps {
  steps: Step[];
  setSteps: (steps: Step[]) => void;
  context: UploadContext;
}

function Spinner() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
      className="flex-shrink-0"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export default function StepsBlock({ steps, setSteps, context }: StepsBlockProps) {
  const [uploadState, setUploadState] = useState<Record<number, UploadStatus>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateText = (i: number, text: string) =>
    setSteps(steps.map((s, j) => (j === i ? { ...s, text } : s)));

  const updateCommand = (stepIdx: number, cmdIdx: number, value: string) =>
    setSteps(steps.map((s, j) =>
      j === stepIdx
        ? { ...s, commands: s.commands.map((c, k) => (k === cmdIdx ? value : c)) }
        : s
    ));

  const addCommand = (stepIdx: number) =>
    setSteps(steps.map((s, j) => (j === stepIdx ? { ...s, commands: [...s.commands, ''] } : s)));

  const removeCommand = (stepIdx: number, cmdIdx: number) =>
    setSteps(steps.map((s, j) =>
      j === stepIdx ? { ...s, commands: s.commands.filter((_, k) => k !== cmdIdx) } : s
    ));

  async function copyCommand(stepIdx: number, cmdIdx: number, value: string) {
    await navigator.clipboard.writeText(value);
    const key = `${stepIdx}-${cmdIdx}`;
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 1500);
  }

  async function handleFile(i: number, file: File | null) {
    if (!file) return;
    setUploadState(prev => ({ ...prev, [i]: 'uploading' }));

    const imageCount = steps[i].file ? 1 : 0;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);
    formData.append('stepIndex', String(i));
    formData.append('imageCount', String(imageCount));

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      const { path } = await res.json();
      setSteps(steps.map((s, j) => (j === i ? { ...s, file: path } : s)));
      setUploadState(prev => ({ ...prev, [i]: 'success' }));
    } catch {
      setUploadState(prev => ({ ...prev, [i]: 'error' }));
    }
  }

  return (
    <div>
      {steps.map((s, i) => {
        const status = uploadState[i] ?? 'idle';
        const filename = s.file ? s.file.split('/').pop() : null;
        const isUploading = status === 'uploading';

        return (
          <div key={i} className="rounded-lg p-3.5 mt-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>Step {i + 1}</span>
              <button
                className="border-0 bg-transparent text-[11.5px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--danger)' }}
                onClick={() => setSteps(steps.filter((_, j) => j !== i))}
              >Remove</button>
            </div>
            <textarea
              className="w-full rounded-lg px-3 py-2.5 text-[13.5px] field-textarea resize-y"
              style={{ minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }}
              placeholder="Describe what to do in this step…"
              value={s.text}
              onChange={e => updateText(i, e.target.value)}
            />

            {/* Commands */}
            <div className="mt-2.5">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Commands</span>
              {s.commands.map((cmd, k) => {
                const isCopied = copiedKey === `${i}-${k}`;
                return (
                  <div key={k} className="mt-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <button
                        className="border-0 bg-transparent text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => removeCommand(i, k)}
                      >× Remove</button>
                      <button
                        className="rounded px-2 py-0.5 text-[11.5px] font-medium"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: isCopied ? 'var(--text-2)' : 'var(--text-3)', cursor: 'pointer' }}
                        onClick={() => copyCommand(i, k, cmd)}
                      >{isCopied ? 'Copied!' : 'Copy'}</button>
                    </div>
                    <textarea
                      className="w-full rounded-lg px-3 py-2 text-[12.5px] resize-y"
                      style={{ minHeight: 48, fontFamily: 'var(--font-mono, monospace)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.55 }}
                      placeholder="Paste command here…"
                      value={cmd}
                      onChange={e => updateCommand(i, k, e.target.value)}
                    />
                  </div>
                );
              })}
              <div className="mt-1.5">
                <button
                  className="rounded-md px-2.5 py-1.5 text-[12px] font-medium"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  onClick={() => addCommand(i)}
                >+ Add command</button>
              </div>
            </div>

            {/* File attachment */}
            <div className="flex items-center gap-2.5 mt-2 text-[12px]" style={{ color: 'var(--text-3)' }}>
              <label
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: isUploading ? 'var(--text-3)' : 'var(--text-2)',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.65 : 1,
                }}
              >
                {isUploading ? <Spinner /> : <Icons.upload />}
                <span>{isUploading ? 'Uploading…' : 'Attach file'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  disabled={isUploading}
                  onChange={e => handleFile(i, e.target.files?.[0] ?? null)}
                />
              </label>
              {status === 'error' ? (
                <span style={{ color: 'var(--danger)' }}>Upload failed — try again</span>
              ) : filename ? (
                <span style={{ color: 'var(--text-2)' }}>{filename}</span>
              ) : (
                <span>PNG, JPG or PDF up to 10MB</span>
              )}
            </div>
          </div>
        );
      })}
      <div className="mt-2.5">
        <button
          className="rounded-md px-2.5 py-1.5 text-[12px] font-medium"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          onClick={() => setSteps([...steps, { text: '', file: '', commands: [] }])}
        >+ Add step</button>
      </div>
    </div>
  );
}
