import { Router, Request, Response } from 'express';
import { getAllTemplates } from '../../templates/index.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getAllTemplates());
});

export default router;
