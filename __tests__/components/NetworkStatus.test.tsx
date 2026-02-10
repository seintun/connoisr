import { NetworkStatus } from '@/components/domain/NetworkStatus';
import { act, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('NetworkStatus', () => {
  it('is hidden by default when online', () => {
    render(<NetworkStatus />);
    expect(screen.queryByText(/You are offline/i)).not.toBeInTheDocument();
  });

  it('shows banner when window goes offline and hides when online', async () => {
    render(<NetworkStatus />);

    // Mock initial online status if needed, but browser env is usually online
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    await waitForElementToBeRemoved(() => screen.queryByText(/You are offline/i));
  });
});
