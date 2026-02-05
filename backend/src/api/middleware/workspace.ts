import { Request, Response, NextFunction } from 'express';

export function workspaceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const workspaceId = req.headers['x-workspace-id'];
  if (!workspaceId || typeof workspaceId !== 'string' || workspaceId.trim().length === 0) {
    res.status(400).json({ error: 'Missing or invalid X-Workspace-Id header' });
    return;
  }
  (req as any).workspaceId = workspaceId.trim();
  next();
}

export function getWorkspaceId(req: Request): string {
  return (req as any).workspaceId as string;
}
