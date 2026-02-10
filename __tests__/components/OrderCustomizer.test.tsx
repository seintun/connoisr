import { CustomizationDrawer } from '@/components/domain/CustomizationDrawer';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('CustomizationDrawer', () => {
  const mockItem = {
    id: '1',
    name: 'Burger',
    description: 'Delicious burger',
    price: 10,
    category: 'Mains',
    tags: ['Spicy'],
  };

  const mockOnAddToCart = vi.fn();
  const mockOnClose = vi.fn();

  it('limits chef note to 100 characters', () => {
    render(
      <CustomizationDrawer
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onAddToCart={mockOnAddToCart}
      />
    );

    const textarea = screen.getByPlaceholderText(/Extra crispy/i);
    
    // Create a string longer than 100 chars
    const longNote = 'a'.repeat(110);
    
    // Simulate typing
    fireEvent.change(textarea, { target: { value: longNote } });

    // Assert value is truncated to 100
    expect((textarea as HTMLTextAreaElement).value).toHaveLength(100);
    
    // Verify it contains the first 100 chars
    expect((textarea as HTMLTextAreaElement).value).toBe('a'.repeat(100));
  });

  it('allows adding to order with valid note', () => {
    render(
      <CustomizationDrawer
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onAddToCart={mockOnAddToCart}
      />
    );

    const textarea = screen.getByPlaceholderText(/Extra crispy/i);
    fireEvent.change(textarea, { target: { value: 'No onions' } });

    const addButton = screen.getByText(/Add to Order/i);
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalled();
    const calledArg = mockOnAddToCart.mock.calls[0][0];
    expect(calledArg.options.note).toBe('No onions');
  });
});
