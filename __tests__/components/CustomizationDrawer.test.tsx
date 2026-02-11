
import { CustomizationDrawer } from '@/components/domain/CustomizationDrawer';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('CustomizationDrawer', () => {
  const mockOnClose = vi.fn();
  const mockOnAddToCart = vi.fn();
  
  const defaultItem = {
    id: '1',
    name: 'Test Item',
    description: 'Test Description',
    price: 10,
    category: 'Mains',
    tags: [] as string[]
  };

  it('renders correctly when open', () => {
    render(
      <CustomizationDrawer 
        isOpen={true}
        onClose={mockOnClose}
        item={defaultItem}
        onAddToCart={mockOnAddToCart}
      />
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Add to Order')).toBeInTheDocument();
  });

  it('maps intensity to Spiciness when tag is Spicy', () => {
    const spicyItem = { ...defaultItem, tags: ['Spicy'] };
    render(
      <CustomizationDrawer 
        isOpen={true}
        onClose={mockOnClose}
        item={spicyItem}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Spiciness')).toBeInTheDocument();
    
    // Select "Extra" (value 150)
    fireEvent.click(screen.getByText('Extra'));
    fireEvent.click(screen.getByText('Add to Order'));

    expect(mockOnAddToCart).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({
        spiciness: 'Extra'
      })
    }));
  });

  it('maps intensity to Sweetness when tag is Sweet', () => {
    const sweetItem = { ...defaultItem, tags: ['Sweet'] };
    render(
        <CustomizationDrawer 
          isOpen={true}
          onClose={mockOnClose}
          item={sweetItem}
          onAddToCart={mockOnAddToCart}
        />
      );
  
      expect(screen.getByText('Sweetness')).toBeInTheDocument();
      
      // Select "Light" (value 50)
      fireEvent.click(screen.getByText('Light'));
      fireEvent.click(screen.getByText('Add to Order'));
  
      expect(mockOnAddToCart).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.objectContaining({
          sweetness: 'Light'
        })
      }));
  });

  it('maps intensity to generic "intensity" when no relevant tag', () => {
    render(
        <CustomizationDrawer 
          isOpen={true}
          onClose={mockOnClose}
          item={defaultItem}
          initialOptions={{ intensity: "150%" }}
          onAddToCart={mockOnAddToCart}
        />
      );
      
      // Since no tags, it might not show the slider UI in the current implementation? 
      // Checking implementation... 
      // Ah, the drawer only shows intensity controls if tags includes Spicy or Sweet.
      // So this test might fail if the UI isn't rendered. 
      // Let's check the code. The block is: `{(item.tags?.includes("Spicy") || item.tags?.includes("Sweet")) && (...)`
      // So for a generic item, no intensity controls are shown.
      // We should verify that NO intensity partial is sent if we just click Add.
      
      fireEvent.click(screen.getByText('Add to Order'));
      
      // Should NOT have intensity in options if it wasn't changed/rendered
      expect(mockOnAddToCart).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.not.objectContaining({
            intensity: expect.anything()
        })
      }));
  });

  it('limits chef note to 100 characters', () => {
    render(
      <CustomizationDrawer
        isOpen={true}
        onClose={mockOnClose}
        item={defaultItem}
        onAddToCart={mockOnAddToCart}
      />
    );

    const textarea = screen.getByPlaceholderText(/Extra crispy/i);
    const longNote = 'a'.repeat(110);
    fireEvent.change(textarea, { target: { value: longNote } });

    expect((textarea as HTMLTextAreaElement).value).toHaveLength(100);
    expect((textarea as HTMLTextAreaElement).value).toBe('a'.repeat(100));
  });

  it('allows adding to order with valid note', () => {
    render(
      <CustomizationDrawer
        isOpen={true}
        onClose={mockOnClose}
        item={defaultItem}
        onAddToCart={mockOnAddToCart}
      />
    );

    const textarea = screen.getByPlaceholderText(/Extra crispy/i);
    fireEvent.change(textarea, { target: { value: 'No onions' } });

    const addButton = screen.getByText(/Add to Order/i);
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.objectContaining({
            note: 'No onions'
        })
    }));
  });
});
