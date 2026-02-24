import type { Response } from 'express';

/** All currently connected SSE clients */
const clients = new Set<Response>();

/**
 * Open an SSE stream on the given response object.
 * The response is kept open indefinitely. When the client disconnects,
 * it is automatically removed from the set.
 */
export function addSSEClient(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if proxied
  res.flushHeaders();

  clients.add(res);

  res.on('close', () => {
    clients.delete(res);
  });
}

/**
 * Broadcast an SSE event to all connected authenticated clients.
 *
 * @param eventName - e.g. "timeblock_created" | "timeblock_updated" | "timeblock_deleted"
 * @param payload   - JSON-serialisable object
 */
export function broadcast(eventName: string, payload: object): void {
  const frame = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    res.write(frame);
  }
}

/** Keepalive ping every 30 s to prevent proxy / browser timeouts */
setInterval(() => {
  for (const res of clients) {
    res.write('event: ping\ndata: {}\n\n');
  }
}, 30_000);
