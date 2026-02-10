import { Checkout } from '@/components/domain/Checkout';
import { CartItem } from '@/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock dependencies
// We can wrap with TableSessionProvider or mock the context hook.
// Mocking the hook is often cleaner for component testing to control state.

const mockSession = {
    tableId: '1',
    orders: [],
    cart: [] as CartItem[],
    status: 'active',
    customerName: 'Test'
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
            sendOrder: mockSendOrder
        })
    };
});

describe('Checkout', () => {
    it('renders nothing if cart and orders are empty', () => {
        render(<Checkout isOpen={true} onClose={() => {}} />);
        // It returns null
        expect(screen.queryByText('Your Table')).not.toBeInTheDocument();
    });

    it('renders cart items when present', () => {
        mockSession.cart = [
            { id: 'c1', name: 'Burger', price: 10, quantity: 1, menuItemId: 'm1', category: 'Main' } as CartItem
        ];

        render(<Checkout isOpen={true} onClose={() => {}} />);
        
        expect(screen.getByText('Your Table')).toBeInTheDocument();
        expect(screen.getByText('Burger')).toBeInTheDocument();
        expect(screen.getByText('$10.00')).toBeInTheDocument();
    });
});
