import { KDSTicket } from '@/components/domain/KDSTicket';
import { Order } from '@/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock useOrderTimer
vi.mock('@/hooks/useOrderTimer', () => ({
    useOrderTimer: () => ({
        formattedTime: '10:00',
        urgency: 'new'
    })
}));

describe('KDSTicket', () => {
    const mockOrder: Order = {
        id: 'order-123',
        tableId: '5',
        items: [
            { id: 'i1', name: 'Burger', price: 10, quantity: 2, menuItemId: 'm1', category: 'Main' },
            { id: 'i2', name: 'Fries', price: 5, quantity: 1, menuItemId: 'm2', category: 'Sides', options: { note: 'No salt' } }
        ],
        status: 'ordered',
        createdAt: Date.now(),
        total: 25
    };

    const mockOnStatusUpdate = vi.fn();

    it('renders order details correctly', () => {
        render(<KDSTicket order={mockOrder} onStatusUpdate={mockOnStatusUpdate} />);
        
        expect(screen.getByText('Table 5')).toBeInTheDocument();
        expect(screen.getByText('#order-12')).toBeInTheDocument(); // Slice check handled in component
        expect(screen.getByText('Burger')).toBeInTheDocument();
        expect(screen.getByText('2x')).toBeInTheDocument();
        expect(screen.getByText('No salt')).toBeInTheDocument();
    });

    it('shows "Start Cooking" button for "ordered" status', () => {
        render(<KDSTicket order={{ ...mockOrder, status: 'ordered' }} onStatusUpdate={mockOnStatusUpdate} />);
        
        const button = screen.getByText('Start Cooking');
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(mockOnStatusUpdate).toHaveBeenCalledWith('order-123', 'cooking');
    });

    it('shows "Mark Ready" button for "cooking" status', () => {
        render(<KDSTicket order={{ ...mockOrder, status: 'cooking' }} onStatusUpdate={mockOnStatusUpdate} />);
        
        const button = screen.getByText('Mark Ready');
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(mockOnStatusUpdate).toHaveBeenCalledWith('order-123', 'ready');
    });

    it('shows "Complete Order" button for "ready" status', () => {
        render(<KDSTicket order={{ ...mockOrder, status: 'ready' }} onStatusUpdate={mockOnStatusUpdate} />);
        
        const button = screen.getByText('Complete Order');
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(mockOnStatusUpdate).toHaveBeenCalledWith('order-123', 'served');
    });
});
