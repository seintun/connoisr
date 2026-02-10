import { useOrderTimer } from '@/hooks/useOrderTimer';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useOrderTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates initial elapsed time correctly', () => {
    const startTime = Date.now() - 5000; // 5 seconds ago
    const { result } = renderHook(() => useOrderTimer(startTime, 'ordered'));
    
    expect(result.current.elapsed).toBe(5);
    expect(result.current.formattedTime).toBe('0:05');
  });

  it('updates elapsed time every second', () => {
    const startTime = Date.now();
    const { result } = renderHook(() => useOrderTimer(startTime, 'ordered'));
    
    expect(result.current.elapsed).toBe(0);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsed).toBe(3);
    expect(result.current.formattedTime).toBe('0:03');
  });

  it('returns correct urgency based on status and time', () => {
    const startTime = Date.now();
    
    // Status 'ordered' -> always 'new'
    const { result: r1 } = renderHook(() => useOrderTimer(startTime, 'ordered'));
    expect(r1.current.urgency).toBe('new');

    // Status 'cooking' -> 'process' initially
    const { result: r2 } = renderHook(() => useOrderTimer(startTime, 'cooking'));
    expect(r2.current.urgency).toBe('process');

    // Status 'cooking' -> 'delayed' after 15 mins (900s)
    act(() => {
        vi.advanceTimersByTime(901 * 1000); 
    });
    expect(r2.current.urgency).toBe('delayed');

    // Status 'ready' -> always 'ready'
    const { result: r3 } = renderHook(() => useOrderTimer(startTime, 'ready'));
    expect(r3.current.urgency).toBe('ready');

     // Status 'served' -> always 'served'
     const { result: r4 } = renderHook(() => useOrderTimer(startTime, 'served'));
     expect(r4.current.urgency).toBe('served');
  });
});
