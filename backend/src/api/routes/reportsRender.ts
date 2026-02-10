import { Router, Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth.js';
import { getReport } from '../../services/reportRepository.js';
import { renderReport } from '../../services/reportRenderer.js';

const router = Router();

router.post('/:reportId/render', async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const report = await getReport(userId, req.params.reportId);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  const rendered = renderReport(report);
  res.json(rendered);
});

export default router;
