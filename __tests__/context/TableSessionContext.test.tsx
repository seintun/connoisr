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

            <button onClick={() => addItem({
                menuItemId: 'm1',
                name: 'Burger',
                category: 'Main',
                price: 10,
                quantity: 1,
                isCustomized: true,
                options: {
                    spiciness: 'extra-hot',
                    note: 'No pickles'
                }
            })}>Add Spicy Burger with Note</button>

            <button onClick={() => addItem({
                menuItemId: 'm1',
                name: 'Burger',
                category: 'Main',
                price: 10,
                quantity: 1,
                isCustomized: true,
                options: {
                    spiciness: 'Extra',
                    sweetness: 'Light',
                    note: 'No onions'
                }
            })}>Add Sweet & Spicy Burger</button>

            <button onClick={() => {
                const item = session.cart[0];
                if (item) removeItem(item.instanceId);
            }}>Remove First Item</button>

            <button onClick={() => {
                 const item = session.cart[0];
                 if (item) updateItemQuantity(item.instanceId, 5);
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
        
        // Instance-based: Should create 2 separate items, total quantity 2
        expect(screen.getByTestId('cart-items-length').textContent).toBe('2'); 
        expect(screen.getByTestId('cart-count').textContent).toBe('2');
        
        const items = JSON.parse(screen.getByTestId('cart-json').textContent!);
        expect(items[0].quantity).toBe(1);
        expect(items[1].quantity).toBe(1);
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
             // In instance mode, calling updateItemQuantity(id, 5) on a single item will likely result in 
             // adding 4 more instances if the reducer logic handles it by duplicating the target instance.
             screen.getByText('Set First Item Qty 5').click();
        });
        
        expect(screen.getByTestId('cart-count').textContent).toBe('5');
        expect(screen.getByTestId('cart-items-length').textContent).toBe('5'); // 5 separate instances
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

    it('splits item on modify (simulated by remove + add custom)', async () => {
        // This tests the underlying mechanism of "Split-on-Modify":
        // 1. Add 2 identical items (grouped in UI, but 2 instances in state)
        // 2. Remove one specific instance
        // 3. Add a new customized instance
        // Result: 1 Original, 1 Custom. Total 2.
        
        render(
           <TableSessionProvider tableId="t1">
               <TestComponent />
           </TableSessionProvider>
       );

       await act(async () => {
            screen.getByText('Add Burger').click(); // Instance A
            screen.getByText('Add Burger').click(); // Instance B
       });
       
       expect(screen.getByTestId('cart-items-length').textContent).toBe('2');

       await act(async () => {
            // Remove first instance (simulating "Edit" start + "Save" remove old)
            screen.getByText('Remove First Item').click();
       });
       
       expect(screen.getByTestId('cart-items-length').textContent).toBe('1');

       await act(async () => {
            // Add custom item (simulating "Save" add new)
            screen.getByText('Add Custom Burger').click();
       });

       expect(screen.getByTestId('cart-items-length').textContent).toBe('2');
       
       // Verify we have 1 standard and 1 custom
       const items = JSON.parse(screen.getByTestId('cart-json').textContent!);
       const customCount = items.filter((i: any) => i.isCustomized).length;
       const standardCount = items.filter((i: any) => !i.isCustomized).length;
       
       expect(customCount).toBe(1);
       expect(standardCount).toBe(1);
   });

   it('adds custom item with options (spiciness, note)', async () => {
        render(
           <TableSessionProvider tableId="t1">
               <TestComponent />
           </TableSessionProvider>
       );

       await act(async () => {
            screen.getByText('Add Spicy Burger with Note').click();
       });
       
       expect(screen.getByTestId('cart-items-length').textContent).toBe('1');
       
       const items = JSON.parse(screen.getByTestId('cart-json').textContent!);
       const item = items[0];
       
       expect(item.isCustomized).toBe(true);
       expect(item.options).toEqual({
           spiciness: 'extra-hot',
           note: 'No pickles'
       });
   });
});
