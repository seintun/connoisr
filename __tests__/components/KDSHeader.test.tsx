import { KDSHeader } from '@/components/domain/kitchen/KDSHeader';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('KDSHeader', () => {
  const baseProps = {
    metrics: {
      total: 7,
      overdue: 5,
      ordered: 3,
      cooking: 2,
      ready: 2,
    },
    now: Date.UTC(2026, 1, 11, 10, 0, 0),
    soundEnabled: true,
    onToggleSound: vi.fn(),
    inputMode: 'keyboard' as const,
  };

  it('shows active chip near title', () => {
    render(<KDSHeader {...baseProps} />);

    const activeChip = screen.getByTestId('kds-active-chip');
    expect(activeChip).toBeInTheDocument();
    expect(activeChip).toHaveTextContent('Active');
    expect(activeChip).toHaveTextContent('7');
  });

  it('renders status metrics in priority order and omits modified summary', () => {
    render(<KDSHeader {...baseProps} />);

    const metricsRow = screen.getByTestId('kds-header-metrics');
    const metricIds = Array.from(metricsRow.children).map((child) =>
      child.getAttribute('data-testid'),
    );

    expect(metricIds).toEqual([
      'kds-metric-overdue',
      'kds-metric-ready',
      'kds-metric-cooking',
      'kds-metric-ordered',
    ]);
    expect(screen.queryByTestId('kds-metric-modified')).not.toBeInTheDocument();
  });
});
