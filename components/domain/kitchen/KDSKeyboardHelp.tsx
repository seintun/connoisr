'use client';

interface KDSKeyboardHelpProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '↑ / ↓', action: 'Move focused ticket' },
  { key: 'Enter', action: 'Advance focused ticket status' },
  { key: 'M', action: 'Jump to next modified ticket' },
  { key: 'O', action: 'Jump to next overdue ticket' },
  { key: 'N', action: 'Jump to next new ticket' },
  { key: 'U', action: 'Undo last status change (5s)' },
  { key: '?', action: 'Toggle keyboard help' },
  { key: 'Esc', action: 'Close keyboard help' },
];

export function KDSKeyboardHelp({ open, onClose }: KDSKeyboardHelpProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="w-full max-w-xl rounded-2xl border border-neutral-600 bg-[#0f1114] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Keyboard Shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-500 px-3 py-1.5 text-sm font-bold text-neutral-100 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Close
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between rounded-lg border border-neutral-700 bg-black/30 px-3 py-2"
            >
              <span className="text-sm font-black text-cyan-200">{shortcut.key}</span>
              <span className="text-sm font-semibold text-neutral-100">{shortcut.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

KDSKeyboardHelp.displayName = 'KDSKeyboardHelp';
