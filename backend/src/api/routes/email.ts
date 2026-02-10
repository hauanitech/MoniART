import { Router, Response, NextFunction } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth.js';
import { prepareEmail } from '../../services/emailPreparer.js';

const emailRouter = Router();

/**
 * POST /api/reports/:reportId/email/prepare
 * Body (optional): { to?: string[] }
 */
emailRouter.post('/:reportId/email/prepare', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { reportId } = req.params;
    const { to } = req.body as { to?: string[] };

    const result = await prepareEmail(reportId, userId, to);
    res.json(result);
  } catch (err: any) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default emailRouter;
