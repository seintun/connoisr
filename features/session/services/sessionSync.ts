const SESSION_SYNC_CHANNEL = 'connoisr-session-sync';

type SessionSyncListener = (tableId?: string) => void;

interface SessionSyncMessage {
  type: 'session-updated';
  tableId?: string;
  timestamp: number;
}

function createChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  return new BroadcastChannel(SESSION_SYNC_CHANNEL);
}

export function notifySessionUpdated(tableId?: string): void {
  const channel = createChannel();
  if (!channel) return;

  const payload: SessionSyncMessage = {
    type: 'session-updated',
    tableId,
    timestamp: Date.now(),
  };

  channel.postMessage(payload);
  channel.close();
}

export function subscribeToSessionUpdates(listener: SessionSyncListener): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key?.includes('-session-')) {
      listener();
    }
  };

  window.addEventListener('storage', onStorage);

  const channel = createChannel();
  if (!channel) {
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }

  const onMessage = (event: MessageEvent<SessionSyncMessage>) => {
    if (event.data?.type === 'session-updated') {
      listener(event.data.tableId);
    }
  };

  channel.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('storage', onStorage);
    channel.removeEventListener('message', onMessage);
    channel.close();
  };
}
