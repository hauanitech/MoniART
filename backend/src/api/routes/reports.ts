import { Router, Request, Response } from 'express';
import { getWorkspaceId } from '../middleware/workspace.js';
import {
  createReport,
  listReports,
  getReport,
  updateReport,
  deleteReport,
} from '../../services/reportRepository.js';
import { isValidReportType, ReportType } from '../../models/report.js';

const router = Router();

// LIST
router.get('/', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const typeFilter = req.query.type as string | undefined;
  if (typeFilter && !isValidReportType(typeFilter)) {
    res.status(400).json({ error: 'Invalid type filter' });
    return;
  }
  const reports = await listReports(wsId, typeFilter as ReportType | undefined);
  res.json(reports);
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { type, title, templateId, metadata, sections } = req.body;
  if (!isValidReportType(type)) {
    res.status(400).json({ error: 'Invalid or missing type (SALLES_B | BU)' });
    return;
  }
  if (!metadata || !metadata.reportDate) {
    res.status(400).json({ error: 'metadata.reportDate is required' });
    return;
  }
  const report = await createReport(wsId, type, title, metadata, sections || {}, templateId);
  res.status(201).json(report);
});

// GET ONE
router.get('/:reportId', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const report = await getReport(wsId, req.params.reportId);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json(report);
});

// UPDATE
router.put('/:reportId', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { title, metadata, sections } = req.body;
  if (!metadata || !metadata.reportDate) {
    res.status(400).json({ error: 'metadata.reportDate is required' });
    return;
  }
  const report = await updateReport(wsId, req.params.reportId, title, metadata, sections || {});
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json(report);
});

// DELETE
router.delete('/:reportId', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const deleted = await deleteReport(wsId, req.params.reportId);
  if (!deleted) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.status(204).end();
});

export default router;
