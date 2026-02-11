'use client';

import { Keyboard, Pointer, Undo2 } from 'lucide-react';

interface KDSInputHintBarProps {
  inputMode: 'touch' | 'keyboard';
  actionHint: string;
  undoAvailable: boolean;
  onUndo: () => void;
  onShowShortcuts: () => void;
}

const SHORTCUT_LEGEND = [
  { key: '↑/↓', label: 'Focus' },
  { key: 'Enter', label: 'Advance' },
  { key: 'M', label: 'Modified' },
  { key: 'O', label: 'Overdue' },
  { key: 'N', label: 'Newest' },
  { key: 'U', label: 'Undo' },
];

export function KDSInputHintBar({
  inputMode,
  actionHint,
  undoAvailable,
  onUndo,
  onShowShortcuts,
}: KDSInputHintBarProps) {
  const controlBaseClass =
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-extrabold uppercase tracking-wide whitespace-nowrap';

  return (
    <aside
      className="sticky bottom-0 z-20 mt-4 border border-neutral-700 bg-black/80 p-3 backdrop-blur"
      data-testid="kds-input-hint-bar"
    >
      <div className="flex flex-wrap items-center gap-2 text-neutral-100">
        <span
          className={`${controlBaseClass} min-w-[98px] border-neutral-500 bg-neutral-800`}
          data-testid="kds-input-mode-chip"
        >
          {inputMode === 'keyboard' ? (
            <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Pointer className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {inputMode.toUpperCase()}
        </span>
        <span
          className={`${controlBaseClass} border-cyan-400/60 bg-cyan-500/10 text-cyan-100 normal-case`}
          data-testid="kds-action-hint-chip"
        >
          {actionHint}
        </span>
        <button
          type="button"
          onClick={onShowShortcuts}
          data-testid="kds-shortcuts-btn"
          className={`${controlBaseClass} border-neutral-500 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 normal-case`}
        >
          <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          Shortcuts (?)
        </button>
        <button
          type="button"
          onClick={onUndo}
          disabled={!undoAvailable}
          data-testid="kds-undo-btn"
          className={`${controlBaseClass} border-amber-300/70 bg-amber-500/20 text-amber-100 normal-case disabled:cursor-not-allowed disabled:opacity-45`}
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
          Undo (U)
        </button>
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-2 py-2"
        data-testid="kds-shortcuts-legend"
      >
        {SHORTCUT_LEGEND.map((entry) => (
          <span
            key={entry.key}
            className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-black/30 px-2 py-1 text-[11px] font-bold text-cyan-100"
          >
            <span className="rounded border border-cyan-400/50 bg-cyan-500/10 px-1.5 py-0.5 font-black text-cyan-200">
              {entry.key}
            </span>
            <span className="uppercase tracking-wide text-cyan-100/90">{entry.label}</span>
          </span>
        ))}
      </div>
    </aside>
  );
}

KDSInputHintBar.displayName = 'KDSInputHintBar';
