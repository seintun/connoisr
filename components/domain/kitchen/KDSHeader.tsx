'use client';

import { APP_NAME } from '@/lib/constants';
import { ChefHat, Keyboard, Volume2, VolumeX } from 'lucide-react';

interface KDSHeaderMetrics {
  total: number;
  overdue: number;
  modified: number;
  ordered: number;
  cooking: number;
  ready: number;
}

interface KDSHeaderProps {
  metrics: KDSHeaderMetrics;
  now: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  inputMode: 'touch' | 'keyboard';
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-600 bg-black/30 px-3 py-2 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

export function KDSHeader({
  metrics,
  now,
  soundEnabled,
  onToggleSound,
  inputMode,
}: KDSHeaderProps) {
  return (
    <header className="mb-5 space-y-4" data-testid="kitchen-header">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-orange-300" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{APP_NAME} KDS</h1>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Hybrid Touch + Keyboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-md border border-neutral-600 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-wide text-neutral-200">
            {new Date(now).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-cyan-400/50 bg-cyan-500/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
            <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
            {inputMode}
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            data-testid="kds-sound-toggle"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-neutral-500 bg-neutral-800 px-3 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:grid-cols-6" data-testid="kds-header-metrics">
        <StatChip label="Active" value={metrics.total} />
        <StatChip label="Ordered" value={metrics.ordered} />
        <StatChip label="Cooking" value={metrics.cooking} />
        <StatChip label="Ready" value={metrics.ready} />
        <StatChip label="Modified" value={metrics.modified} />
        <StatChip label="Overdue" value={metrics.overdue} />
      </div>
    </header>
  );
}

KDSHeader.displayName = 'KDSHeader';
