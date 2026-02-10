import { MenuHeader } from '@/components/domain/MenuHeader';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/context/IdentityContext', () => ({
  useIdentity: vi.fn(() => ({ userName: 'TestUser' })),
}));

// Mock ThemeToggle to avoid theme context issues in isolation
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

// Mock scrollIntoView since jsdom doesn't support it
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollTo = vi.fn();

describe('MenuHeader', () => {
  const categories = ['Starters', 'Mains', 'Desserts'];
  const mockOnCategoryClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand name and categories', () => {
    render(
      <MenuHeader 
        categories={categories} 
        onCategoryClick={mockOnCategoryClick} 
        tableId="1" 
      />
    );

    expect(screen.getByText('TempoDine')).toBeInTheDocument();
    expect(screen.getByText('Table 1')).toBeInTheDocument();
    
    categories.forEach(cat => {
      expect(screen.getByText(cat)).toBeInTheDocument();
    });
  });

  it('calls onCategoryClick when a category is selected', () => {
    render(
      <MenuHeader 
        categories={categories} 
        onCategoryClick={mockOnCategoryClick} 
      />
    );

    const mainsButton = screen.getByText('Mains');
    fireEvent.click(mainsButton);

    expect(mockOnCategoryClick).toHaveBeenCalledWith('Mains');
  });

  it('displays user name in typewriter effect', async () => {
    vi.useFakeTimers();
    
    render(
      <MenuHeader 
        categories={categories} 
        onCategoryClick={mockOnCategoryClick} 
      />
    );

    // Initial state might be empty or partial
    // Fast-forward time to let typewriter finish
    act(() => {
        vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/TestUser is ordering/i)).toBeInTheDocument();
    
    vi.useRealTimers();
  });
});
