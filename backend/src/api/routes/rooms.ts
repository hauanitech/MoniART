import { Router } from 'express';
import { getRoomAvailability } from '../../services/roomAvailability.js';

const roomsRouter = Router();

/** GET /api/rooms/availability — Room availability from ICS feeds */
roomsRouter.get('/availability', async (_req, res, next) => {
  try {
    const availability = await getRoomAvailability();
    res.json(availability);
  } catch (err) {
    next(err);
  }
});

export default roomsRouter;
