import { buildOrder } from '@/__tests__/fixtures/builders';
import { buildKDSOrderViewModels } from '@/features/kitchen/domain/kdsSelectors';
import { useKDSInputController } from '@/hooks/useKDSInputController';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useKDSInputController', () => {
  it('moves focus with keyboard and advances status on Enter', () => {
    const now = Date.now();
    const viewModels = buildKDSOrderViewModels(
      [
        buildOrder({ id: 'o1', status: 'ordered', createdAt: now - 60_000 }),
        buildOrder({ id: 'o2', status: 'cooking', createdAt: now - 30_000 }),
      ],
      now,
    );

    const updateOrderStatus = vi.fn();

    const { result } = renderHook(() =>
      useKDSInputController({
        orders: viewModels,
        updateOrderStatus,
      }),
    );

    expect(result.current.focusedOrderId).toBe('o1');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current.focusedOrderId).toBe('o2');
    expect(result.current.inputMode).toBe('keyboard');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(updateOrderStatus).toHaveBeenCalledWith('o2', 'ready');
  });

  it('supports undo shortcut within window', () => {
    const now = Date.now();
    const viewModels = buildKDSOrderViewModels(
      [buildOrder({ id: 'o1', status: 'ordered', createdAt: now })],
      now,
    );
    const updateOrderStatus = vi.fn();

    renderHook(() =>
      useKDSInputController({
        orders: viewModels,
        updateOrderStatus,
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'u' }));
    });

    expect(updateOrderStatus).toHaveBeenNthCalledWith(1, 'o1', 'cooking');
    expect(updateOrderStatus).toHaveBeenNthCalledWith(2, 'o1', 'ordered');
  });
});
