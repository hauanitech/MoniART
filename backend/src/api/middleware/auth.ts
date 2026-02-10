import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../../services/authService.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token d\'authentification manquant' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
    return;
  }

  req.user = payload;
  req.userId = payload.userId;
  next();
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    return;
  }
  next();
}

export function requirePasswordChanged(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.mustChangePassword) {
    res.status(403).json({ 
      error: 'Vous devez changer votre mot de passe',
      code: 'MUST_CHANGE_PASSWORD'
    });
    return;
  }
  next();
}

export function getUserId(req: AuthRequest): string {
  return req.userId!;
}

export function getUser(req: AuthRequest): JwtPayload {
  return req.user!;
}
