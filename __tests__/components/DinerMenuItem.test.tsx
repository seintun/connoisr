import { DinerMenuItem } from '@/components/domain/DinerMenuItem';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => <img {...props} alt={props.alt} />,
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const MockComponent = () => <div>MockLightbox</div>;
    return MockComponent;
  }
}));

describe('DinerMenuItem', () => {
  const defaultProps = {
    id: '1',
    name: 'Test Burger',
    price: 15.50,
    description: 'A delicious test burger',
    onAdd: vi.fn(),
    onModify: vi.fn(),
    onUpdateQuantity: vi.fn(),
  };

  it('renders item details correctly', () => {
    render(<DinerMenuItem {...defaultProps} />);
    
    expect(screen.getByText('Test Burger')).toBeInTheDocument();
    expect(screen.getByText('$15.5')).toBeInTheDocument();
    expect(screen.getByText('A delicious test burger')).toBeInTheDocument();
  });

  it('shows Add button when quantity is 0', () => {
    render(<DinerMenuItem {...defaultProps} quantity={0} />);
    
    const addButton = screen.getByText('Add');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    expect(defaultProps.onAdd).toHaveBeenCalled();
  });

  it('shows quantity controls when quantity > 0', () => {
    render(<DinerMenuItem {...defaultProps} quantity={2} />);
    
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByTitle('Customize')).toBeInTheDocument();
  });

  it('calls onModify when clicking customize', () => {
    render(<DinerMenuItem {...defaultProps} quantity={1} />);
    
    const customizeBtn = screen.getByTitle('Customize');
    fireEvent.click(customizeBtn);
    expect(defaultProps.onModify).toHaveBeenCalled();
  });

  it('renders tags correctly', () => {
     render(<DinerMenuItem {...defaultProps} tags={['Spicy', 'Vegan']} />);
     expect(screen.getByText('Spicy')).toBeInTheDocument();
     expect(screen.getByText('Vegan')).toBeInTheDocument();
  });
});
