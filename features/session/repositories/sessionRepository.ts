import { readSession, writeSession } from '@/features/session/services/sessionStorage';
import type { TableSession } from '@/types';

export interface SessionRepository {
  get(tableId: string): TableSession | null;
  set(session: TableSession): void;
}

class LocalSessionRepository implements SessionRepository {
  get(tableId: string): TableSession | null {
    return readSession(tableId);
  }

  set(session: TableSession): void {
    writeSession(session);
  }
}

export const sessionRepository: SessionRepository = new LocalSessionRepository();
