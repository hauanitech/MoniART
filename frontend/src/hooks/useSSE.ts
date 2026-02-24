import { useEffect, useRef } from 'react';
import type { Timeblock } from '../types/calendar';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface SSECallbacks {
  onCreated: (timeblock: Timeblock) => void;
  onUpdated: (timeblock: Timeblock) => void;
  onDeleted: (timeblockId: string) => void;
}

export function useSSE(token: string | null, callbacks: SSECallbacks) {
  // Keep stable reference to callbacks so we don't reconnect on every render
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!token) return;

    const url = `${BASE_URL}/api/events?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);

    function handleEvent(ev: MessageEvent) {
      try {
        const payload = JSON.parse(ev.data as string) as {
          type: string;
          timeblock?: Timeblock;
          timeblockId?: string;
        };

        if (payload.type === 'timeblock_created' && payload.timeblock) {
          callbacksRef.current.onCreated(payload.timeblock);
        } else if (payload.type === 'timeblock_updated' && payload.timeblock) {
          callbacksRef.current.onUpdated(payload.timeblock);
        } else if (payload.type === 'timeblock_deleted' && payload.timeblockId) {
          callbacksRef.current.onDeleted(payload.timeblockId);
        }
      } catch {
        // Ignore malformed SSE data
      }
    }

    source.addEventListener('timeblock_created', handleEvent);
    source.addEventListener('timeblock_updated', handleEvent);
    source.addEventListener('timeblock_deleted', handleEvent);

    source.onerror = () => {
      // EventSource auto-reconnects — no action needed
    };

    return () => {
      source.close();
    };
  }, [token]);
}
