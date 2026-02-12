'use client';

import { KDSModifierBlock } from '@/components/domain/kitchen/KDSModifierBlock';
import { KDSStatusAction } from '@/components/domain/kitchen/KDSStatusAction';
import type { KDSOrderViewModel } from '@/features/kitchen/domain/kdsSelectors';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock3 } from 'lucide-react';

interface KDSOrderCardProps {
  viewModel: KDSOrderViewModel;
  isFocused: boolean;
  onFocus: (orderId: string) => void;
  onStatusUpdate: (orderId: string, status: KDSOrderViewModel['order']['status']) => void;
}

function splitIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns = Array.from({ length: Math.max(columnCount, 1) }, () => [] as T[]);
  items.forEach((item, index) => {
    columns[index % columns.length].push(item);
  });
  return columns;
}

function getFocusedColumnCount(groupedItems: KDSOrderViewModel['groupedItems']): number {
  // Modified items usually include extra metadata blocks, so they consume more vertical space.
  const weightedLoad = groupedItems.reduce((sum, item) => sum + (item.isModified ? 2 : 1), 0);

  if (weightedLoad <= 8) {
    return 1;
  }

  if (weightedLoad <= 16) {
    return 2;
  }

  return 3;
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
  const isDesktopLayout = useMediaQuery('(min-width: 768px)');
  const { order, groupedItems } = viewModel;
  const collapsedPreviewCount = 3;
  const visibleItems = isFocused ? groupedItems : groupedItems.slice(0, collapsedPreviewCount);
  const hiddenItemsCount = Math.max(groupedItems.length - visibleItems.length, 0);
  const focusedColumnCount = isFocused ? getFocusedColumnCount(groupedItems) : 1;
  const focusedColumns = isFocused ? splitIntoColumns(visibleItems, focusedColumnCount) : [];
  const focusedModifiedItems = isFocused ? visibleItems.filter((item) => item.isModified) : [];
  const focusedStandardItems = isFocused ? visibleItems.filter((item) => !item.isModified) : [];
  const useTwoColumnFocusedMobile = focusedStandardItems.length >= 2;
  const shouldSpanBoardWidth = isFocused && focusedColumnCount >= 3;
  const compactFocusedItems = isFocused && groupedItems.length >= 7;
  const modifiedItemCount = groupedItems.reduce(
    (sum, item) => sum + (item.isModified ? item.count : 0),
    0,
  );
  const standardItemCount = groupedItems.reduce(
    (sum, item) => sum + (!item.isModified ? item.count : 0),
    0,
  );

  const renderItem = (item: (typeof visibleItems)[number]) => {
    const placeModifierRight = isFocused && item.isModified;

    return (
      <section
        key={item.key}
        className={cn(
          'rounded-xl border',
          compactFocusedItems ? 'p-2' : 'p-2.5 sm:p-3',
          item.isModified
            ? 'border-amber-400/70 bg-amber-500/10'
            : 'border-emerald-400/40 bg-emerald-500/5',
        )}
      >
        <div className={cn('flex gap-3', placeModifierRight ? 'items-start' : 'items-center')}>
          <span
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-lg bg-black/40 font-black text-white',
              compactFocusedItems
                ? 'h-8 w-8 text-lg'
                : 'h-9 w-9 text-xl sm:h-11 sm:w-11 sm:text-2xl',
            )}
          >
            {item.count}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'font-bold leading-tight text-white',
                compactFocusedItems ? 'text-sm' : 'text-lg sm:text-xl',
              )}
            >
              {item.name}
            </p>
            {item.orderedByName && !compactFocusedItems && (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-300 sm:text-xs">
                {item.orderedByName}
              </p>
            )}
          </div>
          {placeModifierRight && (
            <div className="min-w-0 w-[48%] max-w-[14rem]">
              <KDSModifierBlock
                orderId={order.id}
                itemKey={item.key}
                tokens={item.modifierTokens}
                kitchenNote={item.kitchenNote}
                compact
              />
            </div>
          )}
        </div>
        {!placeModifierRight && (
          <div className={cn(compactFocusedItems ? 'mt-2 pl-10' : 'mt-3 pl-14')}>
            <KDSModifierBlock
              orderId={order.id}
              itemKey={item.key}
              tokens={item.modifierTokens}
              kitchenNote={item.kitchenNote}
              compact={compactFocusedItems}
            />
          </div>
        )}
      </section>
    );
  };

  return (
    <article
      tabIndex={0}
      aria-label={`Table ${order.tableId} order`}
      data-testid={`kitchen-order-card-${order.id}`}
      className={cn(
        'flex min-h-[13.25rem] flex-col overflow-hidden rounded-2xl border bg-[#121417] shadow-lg shadow-black/40 outline-none transition sm:min-h-[16rem]',
        shouldSpanBoardWidth && 'md:col-span-2',
        viewModel.isOverdue ? 'border-orange-500/80' : 'border-neutral-700',
        isFocused && 'ring-4 ring-cyan-400/90 ring-offset-2 ring-offset-black',
      )}
      onPointerDown={() => onFocus(order.id)}
      onFocus={() => onFocus(order.id)}
    >
      <header className="border-b border-neutral-700 bg-black/30 px-2.5 py-2 sm:px-4 sm:py-2.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 md:gap-2.5">
            <h2 className="truncate text-[1.8rem] font-black leading-none tracking-tight text-white sm:text-[30px]">
              Table {order.tableId}
            </h2>
            <div className="flex items-center gap-1 whitespace-nowrap md:gap-1.5">
              {viewModel.isOverdue && (
                <span
                  className="inline-flex h-6 items-center gap-1 rounded-md border border-orange-300/80 bg-orange-500/20 px-2 text-[9px] font-black uppercase tracking-wide text-orange-100 sm:h-7 sm:text-[10px]"
                  data-testid={`kds-overdue-indicator-${order.id}`}
                >
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  OVERDUE
                </span>
              )}
              <span
                className={cn(
                  'inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px] font-bold sm:h-7 sm:text-[12px]',
                  viewModel.isOverdue
                    ? 'border-orange-300/80 bg-orange-500/20 text-orange-100'
                    : 'border-neutral-500 bg-neutral-800/80 text-neutral-100',
                )}
              >
                {viewModel.isOverdue ? (
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5 text-neutral-300" aria-hidden="true" />
                )}
                <span>{viewModel.elapsedMinutes}m</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:gap-1.5 md:overflow-visible md:pb-0">
            <span
              className={cn(
                'inline-flex h-6 items-center rounded-md border px-2 text-[10px] font-extrabold uppercase tracking-wider sm:h-7 sm:text-[11px]',
                statusClass(order.status),
              )}
            >
              {order.status}
            </span>
            {viewModel.isModified && (
              <span
                className="rounded-md border border-amber-300 bg-amber-400/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-100 sm:text-[10px]"
                data-testid={`kds-ticket-mod-badge-${order.id}`}
              >
                MOD
              </span>
            )}
            {viewModel.isNew && (
              <span className="rounded-md border border-emerald-300 bg-emerald-300/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-emerald-100 sm:text-[10px]">
                NEW
              </span>
            )}
            <span className="rounded-md border border-amber-300/70 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-100 sm:text-[10px]">
              Modified {modifiedItemCount}
            </span>
            <span className="rounded-md border border-emerald-300/70 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-100 sm:text-[10px]">
              Standard {standardItemCount}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-2.5 sm:p-3">
        {isFocused ? (
          isDesktopLayout ? (
            <div
              className="flex items-start gap-2"
              data-testid={`kds-focused-item-columns-${order.id}`}
            >
              {focusedColumns.map((column, idx) => (
                <div
                  key={`${order.id}-col-${idx}`}
                  className="min-w-0 flex-1 space-y-2"
                  data-testid={`kds-focused-item-column-${order.id}-${idx + 1}`}
                >
                  {column.map((item) => renderItem(item))}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-2',
                useTwoColumnFocusedMobile ? 'grid-cols-2' : 'grid-cols-1',
              )}
              data-testid={`kds-focused-mobile-grid-${order.id}`}
            >
              {focusedModifiedItems.map((item) => (
                <div
                  key={`mobile-mod-${item.key}`}
                  className={cn(useTwoColumnFocusedMobile && 'col-span-2')}
                >
                  {renderItem(item)}
                </div>
              ))}
              {focusedStandardItems.map((item) => (
                <div key={`mobile-standard-${item.key}`} className="min-w-0">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {visibleItems.map((item) => renderItem(item))}
            {hiddenItemsCount > 0 && (
              <div className="rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-2.5 py-2 text-[11px] font-bold uppercase tracking-wide text-cyan-100 sm:px-3 sm:text-xs">
                +{hiddenItemsCount} more item{hiddenItemsCount > 1 ? 's' : ''} (focus to expand)
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-neutral-700 bg-black/40 p-2.5 sm:p-3">
        <KDSStatusAction order={order} onStatusUpdate={onStatusUpdate} />
      </footer>
    </article>
  );
}

KDSOrderCard.displayName = 'KDSOrderCard';
