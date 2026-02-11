'use client';

import type { KDSModifierToken } from '@/features/kitchen/domain/kdsModifiers';
import { StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KDSModifierBlockProps {
  orderId: string;
  itemKey: string;
  tokens: KDSModifierToken[];
  kitchenNote: string | null;
}

function tokenClassForTone(tone: KDSModifierToken['tone']): string {
  switch (tone) {
    case 'danger':
      return 'border-red-400/70 bg-red-500/15 text-red-100';
    case 'warn':
      return 'border-amber-400/70 bg-amber-500/15 text-amber-100';
    case 'info':
      return 'border-sky-400/70 bg-sky-500/15 text-sky-100';
    default:
      return 'border-neutral-400/50 bg-neutral-700/40 text-neutral-100';
  }
}

export function KDSModifierBlock({ orderId, itemKey, tokens, kitchenNote }: KDSModifierBlockProps) {
  if (tokens.length === 0 && !kitchenNote) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid={`kds-modifier-block-${orderId}-${itemKey}`}>
      {tokens.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tokens.map((token) => (
            <span
              key={`${itemKey}-${token.id}`}
              data-testid={`kds-modifier-token-${token.label.toLowerCase()}-${orderId}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide',
                tokenClassForTone(token.tone),
              )}
            >
              <span>{token.label}</span>
              <span className="font-bold">{token.value}</span>
            </span>
          ))}
        </div>
      )}

      {kitchenNote && (
        <div
          className="rounded-lg border border-yellow-300/70 bg-yellow-300/20 p-3"
          data-testid={`kds-note-${orderId}-${itemKey}`}
        >
          <div className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-yellow-100">
            <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
            Kitchen Note
          </div>
          <p className="text-sm font-semibold text-yellow-50">{kitchenNote}</p>
        </div>
      )}
    </div>
  );
}

KDSModifierBlock.displayName = 'KDSModifierBlock';
