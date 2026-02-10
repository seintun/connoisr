import { TableSessionProvider, useTableSession } from '@/components/providers/TableSessionProvider';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'mock-uuid-' + Math.random(),
    },
});

// Helper component to expose hook
const TestComponent = () => {
    const { session, addItem, removeItem, updateItemQuantity, clearCart } = useTableSession();
    
    if (!session) return <div>Loading...</div>;

    return (
        <div>
            <div data-testid="cart-count">{session.cart.reduce((acc, item) => acc + item.quantity, 0)}</div>
            <div data-testid="cart-items-length">{session.cart.length}</div>
            <div data-testid="cart-json">{JSON.stringify(session.cart)}</div>
            
            <button onClick={() => addItem({
                menuItemId: 'm1',
                name: 'Burger',
                category: 'Main',
                price: 10,
                quantity: 1,
                // orderedByName: 'Guest' // strict check in provider uses orderedByName
            })}>Add Burger</button>
            
            <button onClick={() => addItem({
                menuItemId: 'm1',
                name: 'Burger',
                category: 'Main',
                price: 10,
                quantity: 1,
                isCustomized: true
            })}>Add Custom Burger</button>

            <button onClick={() => {
                const item = session.cart[0];
                if (item) removeItem(item.id);
            }}>Remove First Item</button>

            <button onClick={() => {
                 const item = session.cart[0];
                 if (item) updateItemQuantity(item.id, 5);
            }}>Set First Item Qty 5</button>
             
             <button onClick={() => clearCart()}>Clear Cart</button>
        </div>
    );
};

describe('TableSessionContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('adds item to cart', async () => {
        render(
            <TableSessionProvider tableId="t1">
                <TestComponent />
            </TableSessionProvider>
        );
        
        await act(async () => {
            screen.getByText('Add Burger').click();
        });
        
        expect(screen.getByTestId('cart-items-length').textContent).toBe('1');
        expect(screen.getByTestId('cart-count').textContent).toBe('1');
    });

     it('increments quantity when adding same non-customized item', async () => {
        render(
            <TableSessionProvider tableId="t1">
                <TestComponent />
            </TableSessionProvider>
        );
        
        await act(async () => {
             screen.getByText('Add Burger').click();
             screen.getByText('Add Burger').click();
        });
        
        // Should merge into 1 item line, but quantity 2
        expect(screen.getByTestId('cart-items-length').textContent).toBe('1'); 
        expect(screen.getByTestId('cart-count').textContent).toBe('2');
        
        const items = JSON.parse(screen.getByTestId('cart-json').textContent!);
        expect(items[0].quantity).toBe(2);
    });

    it('adds separate entry for customized item', async () => {
         render(
            <TableSessionProvider tableId="t1">
                <TestComponent />
            </TableSessionProvider>
        );

        await act(async () => {
             screen.getByText('Add Burger').click();       // Regular
             screen.getByText('Add Custom Burger').click(); // Custom
             screen.getByText('Add Custom Burger').click(); // Custom (always new entry for custom items currently)
        });
        
         expect(screen.getByTestId('cart-items-length').textContent).toBe('3');
    });

    it('removes item from cart', async () => {
         render(
            <TableSessionProvider tableId="t1">
                <TestComponent />
            </TableSessionProvider>
        );

        await act(async () => {
             screen.getByText('Add Burger').click(); 
        });
        expect(screen.getByTestId('cart-items-length').textContent).toBe('1');

        await act(async () => {
             screen.getByText('Remove First Item').click(); 
        });
        expect(screen.getByTestId('cart-items-length').textContent).toBe('0');
    });
    
    it('updates item quantity', async () => {
         render(
            <TableSessionProvider tableId="t1">
                <TestComponent />
            </TableSessionProvider>
        );

        await act(async () => {
             screen.getByText('Add Burger').click(); // Qty 1
        });
        
        // Wait for state update so item exists in session
        await act(async () => {
             screen.getByText('Set First Item Qty 5').click();
        });
        
        expect(screen.getByTestId('cart-count').textContent).toBe('5');
    });

    it('clears cart', async () => {
         render(
            <TableSessionProvider tableId="t1">
                <TestComponent />
            </TableSessionProvider>
        );

        await act(async () => {
             screen.getByText('Add Burger').click(); 
             screen.getByText('Add Custom Burger').click();
             screen.getByText('Clear Cart').click();
        });
        
        expect(screen.getByTestId('cart-items-length').textContent).toBe('0');
    });
});
