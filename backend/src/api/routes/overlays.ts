import { Router, Response } from 'express';
import * as nodeIcal from 'node-ical';
import { AuthRequest } from '../middleware/auth.js';
import {
  createFeed,
  listFeedsByUser,
  updateFeed,
  deleteFeed,
  getFeedDocForEvents,
} from '../../services/overlayRepository.js';
import type { CreateOverlayFeedRequest, UpdateOverlayFeedRequest } from '../../models/overlay.js';

const overlaysRouter = Router();

// ── GET /api/overlays ─────────────────────────────────────────────────────────
overlaysRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const feeds = await listFeedsByUser(req.userId!);
    res.json(feeds);
  } catch (err) {
    console.error('[overlays] Error listing:', err);
    res.status(500).json({ error: 'Failed to load overlay feeds' });
  }
});

// ── POST /api/overlays ────────────────────────────────────────────────────────
overlaysRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { label, url, color } = req.body as CreateOverlayFeedRequest;

    if (!label?.trim() || !url?.trim()) {
      res.status(400).json({ error: 'label and url are required' });
      return;
    }

    // Basic URL validation
    try { new URL(url); } catch {
      res.status(400).json({ error: 'url must be a valid URL' });
      return;
    }

    const feed = await createFeed(req.userId!, label, url, color);
    res.status(201).json(feed);
  } catch (err) {
    console.error('[overlays] Error creating:', err);
    res.status(500).json({ error: 'Failed to create overlay feed' });
  }
});

// ── PUT /api/overlays/:id ─────────────────────────────────────────────────────
overlaysRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { label, url, color, isEnabled } = req.body as UpdateOverlayFeedRequest;

    if (url !== undefined) {
      try { new URL(url); } catch {
        res.status(400).json({ error: 'url must be a valid URL' });
        return;
      }
    }

    const feed = await updateFeed(req.params.id, req.userId!, { label, url, color, isEnabled });
    if (!feed) {
      res.status(404).json({ error: 'Overlay feed not found' });
      return;
    }
    res.json(feed);
  } catch (err) {
    console.error('[overlays] Error updating:', err);
    res.status(500).json({ error: 'Failed to update overlay feed' });
  }
});

// ── DELETE /api/overlays/:id ──────────────────────────────────────────────────
overlaysRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await deleteFeed(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ error: 'Overlay feed not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    console.error('[overlays] Error deleting:', err);
    res.status(500).json({ error: 'Failed to delete overlay feed' });
  }
});

// ── GET /api/overlays/:id/events ──────────────────────────────────────────────
overlaysRouter.get('/:id/events', async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      res.status(400).json({ error: 'from and to query params are required (YYYY-MM-DD)' });
      return;
    }

    const feed = await getFeedDocForEvents(req.params.id, req.userId!);
    if (!feed) {
      res.status(404).json({ error: 'Overlay feed not found' });
      return;
    }

    // Fetch & parse ICS with a 10-second timeout
    const rangeStart = new Date(`${from}T00:00:00.000Z`);
    const rangeEnd = new Date(`${to}T23:59:59.999Z`);

    let cal: nodeIcal.CalendarResponse;
    try {
      const fetchPromise = nodeIcal.async.fromURL(feed.url);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('ICS fetch timed out')), 10_000),
      );
      cal = await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
      res.status(502).json({ error: (err as Error).message ?? 'Failed to fetch ICS feed' });
      return;
    }

    const events = Object.values(cal)
      .filter((comp): comp is nodeIcal.VEvent => comp != null && comp.type === 'VEVENT')
      .filter((ev) => {
        const start = new Date(ev.start as Date);
        const end = ev.end ? new Date(ev.end as Date) : start;
        return start <= rangeEnd && end >= rangeStart;
      })
      .map((ev) => {
        const allDay = (ev as nodeIcal.VEvent & { datetype?: string }).datetype === 'date';
        return {
          id: ev.uid ?? String(Math.random()),
          feedId: req.params.id,
          title: ev.summary ?? '(No title)',
          start: new Date(ev.start as Date).toISOString(),
          end: ev.end ? new Date(ev.end as Date).toISOString() : new Date(ev.start as Date).toISOString(),
          allDay,
          color: feed.color,
        };
      });

    res.json(events);
  } catch (err) {
    console.error('[overlays] Error fetching events:', err);
    res.status(500).json({ error: 'Failed to process overlay events' });
  }
});

export default overlaysRouter;
