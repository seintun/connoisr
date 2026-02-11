'use client';

import { APP_NAME } from '@/lib/constants';
import { Clock3, ChefHat, Keyboard, Volume2, VolumeX } from 'lucide-react';

interface KDSHeaderMetrics {
  total: number;
  overdue: number;
  ordered: number;
  cooking: number;
  ready: number;
}

interface KDSHeaderProps {
  metrics: KDSHeaderMetrics;
  now: number | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  inputMode: 'touch' | 'keyboard';
}

function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'alert';
}) {
  const toneClass =
    tone === 'alert' ? 'border-orange-400/75 bg-orange-500/15' : 'border-neutral-600 bg-black/35';

  return (
    <div className={`rounded-md border px-1.5 py-0.5 text-center sm:px-2 sm:py-1 ${toneClass}`}>
      <p className="text-[8px] font-bold uppercase tracking-wide text-neutral-400 sm:text-[9px]">
        {label}
      </p>
      <p className="text-lg font-black leading-none text-white sm:text-xl">{value}</p>
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
  const controlBaseClass =
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2 text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap sm:h-10 sm:px-2.5 sm:text-[11px]';

  const formattedTime =
    now === null
      ? '--:--:--'
      : new Date(now).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

  return (
    <header
      className="sticky top-0 z-40 mb-2 space-y-1.5 border-b border-neutral-700/80 bg-[#0a0c0f]/95 py-1.5 backdrop-blur sm:mb-3 sm:space-y-2 sm:py-2"
      data-testid="kitchen-header"
    >
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-orange-300 sm:h-7 sm:w-7" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-[2rem] font-black leading-none tracking-tight text-white sm:text-[2.1rem]">
                {APP_NAME} KDS
              </h1>
              <span
                className="inline-flex h-7 items-center gap-1 rounded-md border border-cyan-300/70 bg-cyan-500/10 px-2 text-[10px] font-extrabold uppercase tracking-wide text-cyan-100"
                data-testid="kds-active-chip"
              >
                <span className="text-cyan-200/85">Active</span>
                <span className="text-base font-black leading-none text-white">
                  {metrics.total}
                </span>
              </span>
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-300 sm:text-xs">
              Hybrid Touch + Keyboard
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-1 md:w-auto md:flex md:items-center">
          <div
            className={`${controlBaseClass} min-w-0 border-neutral-500 bg-neutral-900 text-neutral-100 tabular-nums sm:min-w-[126px]`}
          >
            <Clock3 className="h-3 w-3 text-neutral-300 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span suppressHydrationWarning>{formattedTime}</span>
          </div>
          <div
            className={`${controlBaseClass} min-w-0 border-cyan-400/50 bg-cyan-500/10 text-cyan-100 sm:min-w-[98px]`}
          >
            <Keyboard className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            {inputMode.toUpperCase()}
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            data-testid="kds-sound-toggle"
            className={`${controlBaseClass} min-w-0 border-neutral-500 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:min-w-[128px]`}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            )}
            <span className="sm:hidden">SOUND</span>
            <span className="hidden sm:inline">{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1" data-testid="kds-header-metrics">
        <div data-testid="kds-metric-overdue">
          <StatChip label="Overdue" value={metrics.overdue} tone="alert" />
        </div>
        <div data-testid="kds-metric-ready">
          <StatChip label="Ready" value={metrics.ready} />
        </div>
        <div data-testid="kds-metric-cooking">
          <StatChip label="Cooking" value={metrics.cooking} />
        </div>
        <div data-testid="kds-metric-ordered">
          <StatChip label="Ordered" value={metrics.ordered} />
        </div>
      </div>
    </header>
  );
}

KDSHeader.displayName = 'KDSHeader';
