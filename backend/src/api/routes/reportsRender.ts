import { Router, Request, Response } from 'express';
import { getWorkspaceId } from '../middleware/workspace.js';
import { getReport } from '../../services/reportRepository.js';
import { renderReport } from '../../services/reportRenderer.js';

const router = Router();

router.post('/:reportId/render', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const report = await getReport(wsId, req.params.reportId);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  const rendered = renderReport(report);
  res.json(rendered);
});

export default router;
