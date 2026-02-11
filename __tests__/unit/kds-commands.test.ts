import {
  findNextMatchingIndex,
  getNextActionLabel,
  getNextFocusIndex,
  getNextStatus,
} from '@/features/kitchen/domain/kdsCommands';
import { describe, expect, it } from 'vitest';

describe('kdsCommands', () => {
  it('wraps focus movement safely', () => {
    expect(getNextFocusIndex(0, -1, 4)).toBe(3);
    expect(getNextFocusIndex(3, 1, 4)).toBe(0);
    expect(getNextFocusIndex(-1, 1, 4)).toBe(0);
  });

  it('finds next matching index in wrapped order', () => {
    const flags = [false, false, true, false];
    const idx = findNextMatchingIndex(3, flags.length, (i) => flags[i]);

    expect(idx).toBe(2);
  });

  it('returns sequential kitchen statuses and labels', () => {
    expect(getNextStatus('ordered')).toBe('cooking');
    expect(getNextStatus('cooking')).toBe('ready');
    expect(getNextStatus('ready')).toBe('served');
    expect(getNextStatus('served')).toBeNull();

    expect(getNextActionLabel('ordered')).toContain('Start Cooking');
    expect(getNextActionLabel('ready')).toContain('Mark Served');
  });
});
