'use client';

import { Keyboard, Pointer } from 'lucide-react';

interface KDSInputHintBarProps {
  inputMode: 'touch' | 'keyboard';
  actionHint: string;
  undoAvailable: boolean;
}

export function KDSInputHintBar({ inputMode, actionHint, undoAvailable }: KDSInputHintBarProps) {
  return (
    <aside
      className="sticky bottom-0 z-20 mt-4 border border-neutral-700 bg-black/80 p-3 backdrop-blur"
      data-testid="kds-input-hint-bar"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-100">
        <span className="inline-flex items-center gap-1 rounded-md border border-neutral-500 bg-neutral-800 px-2 py-1 text-xs font-bold uppercase tracking-wide">
          {inputMode === 'keyboard' ? (
            <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Pointer className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {inputMode}
        </span>
        <span className="rounded-md border border-cyan-400/60 bg-cyan-500/10 px-2 py-1 text-cyan-100">
          {actionHint}
        </span>
        <span className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1">
          ? for shortcuts
        </span>
        {undoAvailable && (
          <span className="rounded-md border border-amber-300/70 bg-amber-500/20 px-2 py-1 text-amber-100">
            U to undo
          </span>
        )}
      </div>
    </aside>
  );
}

KDSInputHintBar.displayName = 'KDSInputHintBar';
