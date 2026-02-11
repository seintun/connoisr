import { Checkout } from '@/components/domain/Checkout';
import { CartItem, TableSession } from '@/types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
// We can wrap with TableSessionProvider or mock the context hook.
// Mocking the hook is often cleaner for component testing to control state.

const mockSession: TableSession = {
  tableId: '1',
  orders: [],
  cart: [] as CartItem[],
  status: 'ordering',
  guestName: 'Test',
};

const mockUpdateItemQuantity = vi.fn();
const mockRemoveItem = vi.fn();
const mockClearCart = vi.fn();
const mockSendOrder = vi.fn();

vi.mock('@/components/providers/TableSessionProvider', async () => {
  const actual = await vi.importActual('@/components/providers/TableSessionProvider');
  return {
    ...actual,
    useTableSession: () => ({
      session: mockSession,
      updateItemQuantity: mockUpdateItemQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      sendOrder: mockSendOrder,
    }),
  };
});

describe('Checkout', () => {
  beforeEach(() => {
    mockSession.cart = [];
    mockSession.orders = [];
  });

  it('renders nothing if cart and orders are empty', () => {
    render(<Checkout isOpen={true} onClose={() => {}} />);
    // It returns null
    expect(screen.queryByText('Your Table')).not.toBeInTheDocument();
  });

  it('renders cart items when present', () => {
    mockSession.cart = [
      {
        instanceId: 'c1',
        name: 'Burger',
        price: 10,
        quantity: 1,
        menuItemId: 'm1',
        category: 'Main',
        status: 'PENDING',
      },
    ];

    render(<Checkout isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Your Table')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('groups identical kitchen order items and keeps different customizations separate', () => {
    mockSession.orders = [
      {
        id: 'o1',
        tableId: '1',
        status: 'ordered',
        createdAt: Date.now(),
        total: 44,
        items: [
          {
            instanceId: 'i1',
            name: 'Avocado Toast',
            price: 18,
            quantity: 1,
            menuItemId: 'm-avocado',
            category: 'Mains',
            status: 'SENT',
            options: { removals: 'onion' },
            orderedByName: 'Alex',
            isCustomized: true,
          },
          {
            instanceId: 'i2',
            name: 'Avocado Toast',
            price: 18,
            quantity: 1,
            menuItemId: 'm-avocado',
            category: 'Mains',
            status: 'SENT',
            options: { removals: 'onion' },
            orderedByName: 'Alex',
            isCustomized: true,
          },
          {
            instanceId: 'i3',
            name: 'Avocado Toast',
            price: 18,
            quantity: 1,
            menuItemId: 'm-avocado',
            category: 'Mains',
            status: 'SENT',
            options: { removals: 'tomato' },
            orderedByName: 'Alex',
            isCustomized: true,
          },
        ],
      },
    ];

    render(<Checkout isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('$36.00')).toBeInTheDocument();
    expect(screen.getAllByText(/No:/)).toHaveLength(2);
    expect(screen.getByText('onion')).toBeInTheDocument();
    expect(screen.getByText('tomato')).toBeInTheDocument();
  });
});
