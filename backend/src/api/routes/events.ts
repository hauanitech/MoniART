import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { addSSEClient } from '../../services/sse.js';

const eventsRouter = Router();

/**
 * GET /api/events
 * Server-Sent Events endpoint for real-time calendar updates.
 * The client must pass the JWT as a query parameter: /api/events?token=xxx
 * because the EventSource API cannot set Authorization headers.
 */
eventsRouter.get('/', (req: AuthRequest, res: Response) => {
  addSSEClient(res);
});

export default eventsRouter;
