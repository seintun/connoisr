import { IdentityProvider, useIdentity } from '@/context/IdentityContext';
import { IDENTITY_STORAGE_KEY } from '@/lib/constants';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Crypto mock
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid',
  },
});

describe('IdentityContext', () => {
  const tableId = 'table-1';
  const storageKey = IDENTITY_STORAGE_KEY(tableId);

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
  });

  it('persists changes to sessionStorage', async () => {
    const TestComponent = () => {
      const { setIdentity } = useIdentity();
      return <button onClick={() => setIdentity('John Doe')}>Set Name</button>;
    };

    render(
      <IdentityProvider tableId={tableId}>
        <TestComponent />
      </IdentityProvider>,
    );

    const button = screen.getByText('Set Name');
    await act(async () => {
      button.click();
    });

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      storageKey,
      expect.stringContaining('"userName":"John Doe"'),
    );
  });

  it('hydrates from sessionStorage on mount', () => {
    // Setup existing session
    const existingState = {
      userName: 'Jane Doe',
      userId: 'existing-uuid',
      isGuest: false,
    };
    sessionStorageMock.getItem.mockReturnValue(JSON.stringify(existingState));

    const TestComponent = () => {
      const { userName } = useIdentity();
      return <div>User: {userName}</div>;
    };

    render(
      <IdentityProvider tableId={tableId}>
        <TestComponent />
      </IdentityProvider>,
    );

    expect(screen.getByText('User: Jane Doe')).toBeInTheDocument();
  });

  it('exposes isHydrated after mount', () => {
    const TestComponent = () => {
      const { isHydrated } = useIdentity();
      return <div>Hydrated: {String(isHydrated)}</div>;
    };

    render(
      <IdentityProvider tableId={tableId}>
        <TestComponent />
      </IdentityProvider>,
    );

    expect(screen.getByText('Hydrated: true')).toBeInTheDocument();
  });
});
