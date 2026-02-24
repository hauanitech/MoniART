import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  createTimeblock as createTb,
  getTimeblockDocById,
  listTimeblocks,
  updateTimeblock as updateTb,
  deleteTimeblock as deleteTb,
} from '../../services/timeblockRepository.js';
import { checkOverlap, checkLocationOverlap } from '../../services/timeblockService.js';
import { broadcast } from '../../services/sse.js';
import { generateTitle } from '../../models/timeblock.js';
import type { CreateTimeblockRequest, UpdateTimeblockRequest } from '../../models/timeblock.js';
import { getUserById } from '../../services/userRepository.js';

const timeblocksRouter = Router();

// ── GET /api/timeblocks ─────────────────────────────────────────────────────
timeblocksRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const tbs = await listTimeblocks(from, to);
    res.json(tbs);
  } catch (err) {
    console.error('[timeblocks] Error listing:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── POST /api/timeblocks ────────────────────────────────────────────────────
timeblocksRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { date, startTime, endTime, location } = req.body as CreateTimeblockRequest;
    const userId = req.userId!;

    if (!date || !startTime || !endTime || !location) {
      res.status(400).json({ error: 'date, startTime, endTime, and location are required' });
      return;
    }
    if (!['B2-1', 'BU'].includes(location)) {
      res.status(400).json({ error: 'location must be B2-1 or BU' });
      return;
    }

    const conflict = await checkOverlap(userId, date, startTime, endTime);
    if (conflict) {
      res.status(409).json({
        error: 'Overlap conflict',
        details: `You already have a timeblock from ${conflict.startTime} to ${conflict.endTime} on ${conflict.date}`,
      });
      return;
    }

    const locationConflict = await checkLocationOverlap(location, date, startTime, endTime);
    if (locationConflict) {
      res.status(409).json({
        error: 'Location conflict',
        details: `L'emplacement ${location} est déjà occupé de ${locationConflict.startTime} à ${locationConflict.endTime} le ${locationConflict.date}`,
      });
      return;
    }

    const user = await getUserById(userId);
    const userName = user?.name ?? 'Unknown';
    const doc = await createTb(userId, date, startTime, endTime, location);

    const timeblock = {
      id: doc._id,
      userId,
      userName,
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
      location: doc.location as 'B2-1' | 'BU',
      title: generateTitle(userName, doc.location),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    broadcast('timeblock_created', { type: 'timeblock_created', timeblock });
    res.status(201).json(timeblock);
  } catch (err) {
    console.error('[timeblocks] Error creating:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── PUT /api/timeblocks/:id ─────────────────────────────────────────────────
timeblocksRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const role = req.user!.role;
    const body = req.body as UpdateTimeblockRequest;

    const current = await getTimeblockDocById(id);
    if (!current) {
      res.status(404).json({ error: 'Timeblock not found' });
      return;
    }

    if (role !== 'ADMIN' && current.userId !== userId) {
      res.status(403).json({ error: 'You can only edit your own timeblocks' });
      return;
    }

    const newDate = body.date ?? current.date;
    const newStartTime = body.startTime ?? current.startTime;
    const newEndTime = body.endTime ?? current.endTime;
    const newLocation = body.location ?? current.location;

    if (!['B2-1', 'BU'].includes(newLocation)) {
      res.status(400).json({ error: 'location must be B2-1 or BU' });
      return;
    }

    const conflict = await checkOverlap(current.userId, newDate, newStartTime, newEndTime, id);
    if (conflict) {
      res.status(409).json({
        error: 'Overlap conflict',
        details: `Overlaps existing timeblock from ${conflict.startTime} to ${conflict.endTime}`,
      });
      return;
    }

    const locationConflict = await checkLocationOverlap(newLocation, newDate, newStartTime, newEndTime, id);
    if (locationConflict) {
      res.status(409).json({
        error: 'Location conflict',
        details: `L'emplacement ${newLocation} est déjà occupé de ${locationConflict.startTime} à ${locationConflict.endTime} le ${locationConflict.date}`,
      });
      return;
    }

    const updated = await updateTb(id, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation,
    });

    if (!updated) {
      res.status(404).json({ error: 'Timeblock not found' });
      return;
    }

    broadcast('timeblock_updated', { type: 'timeblock_updated', timeblock: updated });
    res.json(updated);
  } catch (err) {
    console.error('[timeblocks] Error updating:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── DELETE /api/timeblocks/:id ──────────────────────────────────────────────
timeblocksRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const role = req.user!.role;

    const doc = await getTimeblockDocById(id);
    if (!doc) {
      res.status(404).json({ error: 'Timeblock not found' });
      return;
    }

    if (role !== 'ADMIN' && doc.userId !== userId) {
      res.status(403).json({ error: 'You can only delete your own timeblocks' });
      return;
    }

    await deleteTb(id);
    broadcast('timeblock_deleted', { type: 'timeblock_deleted', timblockId: id });
    res.status(204).send();
  } catch (err) {
    console.error('[timeblocks] Error deleting:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Admin: GET /api/timeblocks/admin ────────────────────────────────────────
timeblocksRouter.get('/admin', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const tbs = await listTimeblocks(from, to);
    res.json(tbs);
  } catch (err) {
    console.error('[timeblocks] Error listing admin:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Admin: DELETE /api/timeblocks/admin/:id ─────────────────────────────────
timeblocksRouter.delete('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTb(id);
    if (!deleted) {
      res.status(404).json({ error: 'Timeblock not found' });
      return;
    }
    broadcast('timeblock_deleted', { type: 'timeblock_deleted', timblockId: id });
    res.status(204).send();
  } catch (err) {
    console.error('[timeblocks] Error admin deleting:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default timeblocksRouter;
