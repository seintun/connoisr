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
    'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-[10px] font-extrabold uppercase tracking-wide sm:h-9 sm:px-2.5 sm:text-[11px]';
  const shortcutChipClass =
    'inline-flex h-8 items-center gap-1 rounded-md border border-cyan-500/35 bg-black/25 px-2 text-[10px] font-bold uppercase tracking-wide text-cyan-100 whitespace-nowrap shrink-0';

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-700 bg-black/90 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur"
      data-testid="kds-input-hint-bar"
    >
      <div className="mx-auto w-full px-3 sm:px-4 md:px-6">
        <div className="flex w-full min-w-0 items-center gap-1.5 pb-0.5 text-neutral-100 md:gap-2">
          <span
            className={`${controlBaseClass} min-w-[92px] border-neutral-500 bg-neutral-800 sm:min-w-[98px]`}
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
            className={`${controlBaseClass} min-w-0 flex-1 justify-start border-cyan-400/60 bg-cyan-500/10 text-cyan-100 normal-case`}
            data-testid="kds-action-hint-chip"
          >
            <span className="block truncate">{actionHint}</span>
          </span>
          <button
            type="button"
            onClick={onShowShortcuts}
            data-testid="kds-shortcuts-btn"
            className={`${controlBaseClass} border-neutral-500 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 normal-case`}
            aria-label="Show shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Shortcuts (?)</span>
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={!undoAvailable}
            data-testid="kds-undo-btn"
            className={`${controlBaseClass} border-amber-300/70 bg-amber-500/20 text-amber-100 normal-case disabled:cursor-not-allowed disabled:opacity-45`}
            aria-label="Undo last action"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Undo (U)</span>
          </button>
          <span className="hidden h-6 w-px bg-neutral-700 lg:block" aria-hidden="true" />
          <div className="hidden items-center gap-1.5 lg:flex" data-testid="kds-shortcuts-legend">
            {SHORTCUT_LEGEND.map((entry) => (
              <span key={entry.key} className={shortcutChipClass}>
                <span className="rounded border border-cyan-400/50 bg-cyan-500/10 px-1.5 py-0.5 font-black text-cyan-200">
                  {entry.key}
                </span>
                <span className="text-cyan-100/90">{entry.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

KDSInputHintBar.displayName = 'KDSInputHintBar';
