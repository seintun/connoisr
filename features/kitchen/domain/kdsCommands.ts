import type { Order } from '@/types';

export function getNextFocusIndex(currentIndex: number, delta: number, length: number): number {
  if (length <= 0) {
    return -1;
  }

  if (currentIndex < 0) {
    return delta >= 0 ? 0 : length - 1;
  }

  const next = (currentIndex + delta + length) % length;
  return next;
}

export function findNextMatchingIndex(
  startIndex: number,
  length: number,
  predicate: (index: number) => boolean,
): number {
  if (length === 0) {
    return -1;
  }

  const safeStart = startIndex < 0 ? 0 : startIndex;

  for (let step = 0; step < length; step += 1) {
    const idx = (safeStart + step) % length;
    if (predicate(idx)) {
      return idx;
    }
  }

  return -1;
}

export function getNextStatus(status: Order['status']): Order['status'] | null {
  switch (status) {
    case 'ordered':
      return 'cooking';
    case 'cooking':
      return 'ready';
    case 'ready':
      return 'served';
    default:
      return null;
  }
}

export function getNextActionLabel(status: Order['status']): string {
  switch (status) {
    case 'ordered':
      return 'Enter: Start Cooking';
    case 'cooking':
      return 'Enter: Mark Ready';
    case 'ready':
      return 'Enter: Mark Served';
    default:
      return 'No action available';
  }
}
