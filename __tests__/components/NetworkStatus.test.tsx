import { NetworkStatus } from '@/components/domain/NetworkStatus';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('NetworkStatus', () => {
  it('is hidden by default when online', () => {
    render(<NetworkStatus />);
    expect(screen.queryByText(/You are offline/i)).not.toBeInTheDocument();
  });

  it('shows offline message on offline event', () => {
    render(<NetworkStatus />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    expect(screen.getByText(/still browse and add items/i)).toBeInTheDocument();
  });

  it('shows a temporary back-online message, then hides banner', async () => {
    vi.useRealTimers();
    render(<NetworkStatus />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText(/Back online\. You can send your order now\./i)).toBeInTheDocument();
    expect(screen.queryByText(/You are offline/i)).not.toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2300));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('network-status-offline-banner')).not.toBeInTheDocument();
    });
  });
});
