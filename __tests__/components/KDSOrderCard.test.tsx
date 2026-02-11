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

    const action = screen.getByTestId('kitchen-start-cooking-kds-1');
    fireEvent.click(action);

    expect(onStatusUpdate).toHaveBeenCalledWith('kds-1', 'cooking');
  });
});
