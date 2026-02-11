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
let mockIsOnline = true;

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

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockIsOnline,
}));

describe('Checkout', () => {
  beforeEach(() => {
    mockSession.cart = [];
    mockSession.orders = [];
    mockIsOnline = true;
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

  it('disables pay and send actions while offline', () => {
    mockIsOnline = false;
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
    mockSession.orders = [
      {
        id: 'o1',
        tableId: '1',
        status: 'ordered',
        createdAt: Date.now(),
        total: 10,
        items: [
          {
            instanceId: 'i1',
            name: 'Burger',
            price: 10,
            quantity: 1,
            menuItemId: 'm1',
            category: 'Main',
            status: 'SENT',
          },
        ],
      },
    ];

    render(<Checkout isOpen={true} onClose={() => {}} />);

    expect(screen.getByTestId('pay-bill-btn')).toBeDisabled();
    expect(screen.getByTestId('send-order-btn')).toBeDisabled();
    expect(screen.getByText('Pay (Offline)')).toBeInTheDocument();
    expect(screen.getByText('Send Disabled')).toBeInTheDocument();
    expect(screen.getByText('Send and Pay are unavailable offline.')).toBeInTheDocument();
  });

  it('shows normal action labels and hides offline helper when online', () => {
    mockIsOnline = true;
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
    mockSession.orders = [
      {
        id: 'o1',
        tableId: '1',
        status: 'ordered',
        createdAt: Date.now(),
        total: 10,
        items: [
          {
            instanceId: 'i1',
            name: 'Burger',
            price: 10,
            quantity: 1,
            menuItemId: 'm1',
            category: 'Main',
            status: 'SENT',
          },
        ],
      },
    ];

    render(<Checkout isOpen={true} onClose={() => {}} />);

    expect(screen.getByTestId('pay-bill-btn')).toBeEnabled();
    expect(screen.getByTestId('send-order-btn')).toBeEnabled();
    expect(screen.getByText(/^Pay \$10\.80$/)).toBeInTheDocument();
    expect(screen.getByText('Send Order')).toBeInTheDocument();
    expect(screen.queryByText('Send and Pay are unavailable offline.')).not.toBeInTheDocument();
  });

  it('renders kitchen orders from newest to oldest', () => {
    mockSession.orders = [
      {
        id: 'old',
        tableId: '1',
        status: 'ordered',
        createdAt: 1000,
        total: 12,
        items: [
          {
            instanceId: 'i-old',
            name: 'Old Item',
            price: 12,
            quantity: 1,
            menuItemId: 'm-old',
            category: 'Main',
            status: 'SENT',
          },
        ],
      },
      {
        id: 'new',
        tableId: '1',
        status: 'ordered',
        createdAt: 2000,
        total: 14,
        items: [
          {
            instanceId: 'i-new',
            name: 'New Item',
            price: 14,
            quantity: 1,
            menuItemId: 'm-new',
            category: 'Main',
            status: 'SENT',
          },
        ],
      },
    ];

    render(<Checkout isOpen={true} onClose={() => {}} />);

    const newItem = screen.getByText('New Item');
    const oldItem = screen.getByText('Old Item');
    expect(
      newItem.compareDocumentPosition(oldItem) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
