'use client';

import { KDSModifierBlock } from '@/components/domain/kitchen/KDSModifierBlock';
import { KDSStatusAction } from '@/components/domain/kitchen/KDSStatusAction';
import type { KDSOrderViewModel } from '@/features/kitchen/domain/kdsSelectors';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock3 } from 'lucide-react';

interface KDSOrderCardProps {
  viewModel: KDSOrderViewModel;
  isFocused: boolean;
  onFocus: (orderId: string) => void;
  onStatusUpdate: (orderId: string, status: KDSOrderViewModel['order']['status']) => void;
}

function statusClass(status: KDSOrderViewModel['order']['status']): string {
  switch (status) {
    case 'ordered':
      return 'border-emerald-500/80 bg-emerald-500/20 text-emerald-50';
    case 'cooking':
      return 'border-orange-500/80 bg-orange-500/20 text-orange-50';
    case 'ready':
      return 'border-sky-500/80 bg-sky-500/20 text-sky-50';
    default:
      return 'border-neutral-600 bg-neutral-700/30 text-neutral-100';
  }
}

export function KDSOrderCard({ viewModel, isFocused, onFocus, onStatusUpdate }: KDSOrderCardProps) {
  const { order, groupedItems } = viewModel;
  const collapsedPreviewCount = 3;
  const visibleItems = isFocused ? groupedItems : groupedItems.slice(0, collapsedPreviewCount);
  const hiddenItemsCount = Math.max(groupedItems.length - visibleItems.length, 0);
  const focusedColumnsClass = isFocused
    ? groupedItems.length >= 18
      ? 'grid grid-cols-3 gap-2 content-start'
      : 'grid grid-cols-2 gap-2 content-start'
    : 'space-y-3';
  const compactFocusedItems = isFocused && groupedItems.length >= 7;
  const modifiedItemCount = groupedItems.reduce(
    (sum, item) => sum + (item.isModified ? item.count : 0),
    0,
  );
  const standardItemCount = groupedItems.reduce(
    (sum, item) => sum + (!item.isModified ? item.count : 0),
    0,
  );

  return (
    <article
      tabIndex={0}
      aria-label={`Table ${order.tableId} order`}
      data-testid={`kitchen-order-card-${order.id}`}
      className={cn(
        'flex h-[clamp(24rem,62vh,40rem)] min-h-[24rem] flex-col overflow-hidden rounded-2xl border bg-[#121417] shadow-lg shadow-black/40 outline-none transition',
        isFocused && 'md:col-span-2',
        viewModel.isOverdue ? 'border-orange-500/80' : 'border-neutral-700',
        isFocused && 'ring-4 ring-cyan-400/90 ring-offset-2 ring-offset-black',
      )}
      onPointerDown={() => onFocus(order.id)}
      onFocus={() => onFocus(order.id)}
    >
      <header className="flex items-start justify-between gap-3 border-b border-neutral-700 bg-black/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Table {order.tableId}
              </h2>
              {viewModel.isModified && (
                <span
                  className="rounded-md border border-amber-300 bg-amber-400/20 px-2 py-0.5 text-xs font-extrabold uppercase tracking-widest text-amber-100"
                  data-testid={`kds-ticket-mod-badge-${order.id}`}
                >
                  MOD
                </span>
              )}
              {viewModel.isNew && (
                <span className="rounded-md border border-emerald-300 bg-emerald-300/20 px-2 py-0.5 text-xs font-extrabold uppercase tracking-widest text-emerald-100">
                  NEW
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
              <span className="rounded border border-amber-300/60 bg-amber-400/10 px-1.5 py-0.5 text-amber-100">
                Modified {modifiedItemCount}
              </span>
              <span className="rounded border border-emerald-300/60 bg-emerald-400/10 px-1.5 py-0.5 text-emerald-100">
                Standard {standardItemCount}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={cn(
              'inline-flex rounded-md border px-2 py-1 text-xs font-extrabold uppercase tracking-wider',
              statusClass(order.status),
            )}
          >
            {order.status}
          </span>
          <div className="mt-1 flex items-center justify-end gap-1 text-sm font-bold text-neutral-100">
            {viewModel.isOverdue ? (
              <AlertTriangle className="h-4 w-4 text-orange-300" aria-hidden="true" />
            ) : (
              <Clock3 className="h-4 w-4 text-neutral-300" aria-hidden="true" />
            )}
            <span className={cn(viewModel.isOverdue && 'text-orange-200')}>
              {viewModel.elapsedMinutes}m
            </span>
          </div>
          {viewModel.isOverdue && (
            <div
              className="mt-1 inline-flex items-center gap-1 rounded-md border border-orange-300/80 bg-orange-500/20 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-orange-100"
              data-testid={`kds-overdue-indicator-${order.id}`}
            >
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              OVERDUE
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-3">
        <div className={focusedColumnsClass}>
          {visibleItems.map((item) => (
            <section
              key={item.key}
              className={cn(
                'rounded-xl border',
                compactFocusedItems ? 'p-2' : 'p-3',
                item.isModified
                  ? 'border-amber-400/70 bg-amber-500/10'
                  : 'border-emerald-400/40 bg-emerald-500/5',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-lg bg-black/40 font-black text-white',
                    compactFocusedItems ? 'h-8 w-8 text-lg' : 'h-11 w-11 text-2xl',
                  )}
                >
                  {item.count}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'font-bold leading-tight text-white',
                      compactFocusedItems ? 'text-sm' : 'text-xl',
                    )}
                  >
                    {item.name}
                  </p>
                  {item.orderedByName && !compactFocusedItems && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                      {item.orderedByName}
                    </p>
                  )}
                </div>
              </div>
              <div className={cn(compactFocusedItems ? 'mt-2 pl-10' : 'mt-3 pl-14')}>
                <KDSModifierBlock
                  orderId={order.id}
                  itemKey={item.key}
                  tokens={item.modifierTokens}
                  kitchenNote={item.kitchenNote}
                  compact={compactFocusedItems}
                />
              </div>
            </section>
          ))}
          {!isFocused && hiddenItemsCount > 0 && (
            <div className="rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-100">
              +{hiddenItemsCount} more item{hiddenItemsCount > 1 ? 's' : ''} (focus to expand)
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-neutral-700 bg-black/40 p-3">
        <KDSStatusAction order={order} onStatusUpdate={onStatusUpdate} />
      </footer>
    </article>
  );
}

KDSOrderCard.displayName = 'KDSOrderCard';
