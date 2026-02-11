import { buildCartItem, buildOrder } from '@/__tests__/fixtures/builders';
import { KDSOrderCard } from '@/components/domain/kitchen/KDSOrderCard';
import { buildKDSOrderViewModels } from '@/features/kitchen/domain/kdsSelectors';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('KDSOrderCard', () => {
  it('renders modifier and overdue indicators with status action', () => {
    const now = Date.now();
    const order = buildOrder({
      id: 'kds-1',
      tableId: '11',
      createdAt: now - 14 * 60 * 1000,
      status: 'ordered',
      items: [
        buildCartItem({
          status: 'SENT',
          name: 'Truffle Risotto',
          options: { note: 'split plating', removals: 'garlic' },
          isCustomized: true,
        }),
      ],
    });

    const [viewModel] = buildKDSOrderViewModels([order], now);
    const onStatusUpdate = vi.fn();

    render(
      <KDSOrderCard
        viewModel={viewModel}
        isFocused
        onFocus={vi.fn()}
        onStatusUpdate={onStatusUpdate}
      />,
    );

    expect(screen.getByTestId('kds-ticket-mod-badge-kds-1')).toBeInTheDocument();
    expect(screen.getByTestId('kds-overdue-indicator-kds-1')).toBeInTheDocument();
    expect(screen.getByTestId('kds-focused-mobile-grid-kds-1')).toBeInTheDocument();
    expect(screen.queryByTestId('kds-focused-item-column-kds-1-1')).not.toBeInTheDocument();

    const action = screen.getByTestId('kitchen-start-cooking-kds-1');
    fireEvent.click(action);

    expect(onStatusUpdate).toHaveBeenCalledWith('kds-1', 'cooking');
  });

  it('keeps fixed preview when unfocused and expands list when focused', () => {
    const now = Date.now();
    const order = buildOrder({
      id: 'kds-2',
      tableId: '12',
      createdAt: now - 2 * 60 * 1000,
      status: 'ordered',
      items: [
        buildCartItem({
          instanceId: 'i-1',
          menuItemId: 'm-1',
          name: 'One',
          status: 'SENT',
        }),
        buildCartItem({
          instanceId: 'i-2',
          menuItemId: 'm-2',
          name: 'Two',
          status: 'SENT',
        }),
        buildCartItem({
          instanceId: 'i-3',
          menuItemId: 'm-3',
          name: 'Three',
          status: 'SENT',
        }),
        buildCartItem({
          instanceId: 'i-4',
          menuItemId: 'm-4',
          name: 'Four',
          status: 'SENT',
          isCustomized: true,
          options: { note: 'extra sauce' },
        }),
        buildCartItem({
          instanceId: 'i-5',
          menuItemId: 'm-5',
          name: 'Five',
          status: 'SENT',
        }),
      ],
    });

    const [viewModel] = buildKDSOrderViewModels([order], now);
    const onStatusUpdate = vi.fn();

    const { rerender } = render(
      <KDSOrderCard
        viewModel={viewModel}
        isFocused={false}
        onFocus={vi.fn()}
        onStatusUpdate={onStatusUpdate}
      />,
    );

    expect(screen.getByText('+2 more items (focus to expand)')).toBeInTheDocument();
    expect(screen.queryByText('Two')).not.toBeInTheDocument();
    expect(screen.queryByText('Three')).not.toBeInTheDocument();
    expect(screen.getByText('Modified 1')).toBeInTheDocument();
    expect(screen.getByText('Standard 4')).toBeInTheDocument();

    rerender(
      <KDSOrderCard
        viewModel={viewModel}
        isFocused
        onFocus={vi.fn()}
        onStatusUpdate={onStatusUpdate}
      />,
    );

    const focusedGrid = screen.getByTestId('kds-focused-mobile-grid-kds-2');
    expect(screen.queryByText('+2 more items (focus to expand)')).not.toBeInTheDocument();
    expect(focusedGrid.children[0]).toHaveClass('col-span-2');
    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Four')).toBeInTheDocument();
    expect(screen.getByText('Five')).toBeInTheDocument();
  });

  it('uses one focused column on portrait when only one unmodified item exists', () => {
    const now = Date.now();
    const order = buildOrder({
      id: 'kds-3',
      tableId: '14',
      createdAt: now - 60_000,
      status: 'ready',
      items: [
        buildCartItem({
          instanceId: 'i-1',
          menuItemId: 'm-1',
          name: 'Yuzu Lemon Tart',
          status: 'SENT',
        }),
      ],
    });

    const [viewModel] = buildKDSOrderViewModels([order], now);

    render(
      <KDSOrderCard viewModel={viewModel} isFocused onFocus={vi.fn()} onStatusUpdate={vi.fn()} />,
    );

    const focusedGrid = screen.getByTestId('kds-focused-mobile-grid-kds-3');
    expect(focusedGrid).toHaveClass('grid-cols-1');
  });
});
