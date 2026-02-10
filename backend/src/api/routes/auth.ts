import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, getUser } from '../middleware/auth.js';
import { getUserById, listAllUsersPublic, updatePassword } from '../../services/userRepository.js';
import { verifyPassword, generateToken } from '../../services/authService.js';
import { LoginRequest, ChangePasswordRequest, AuthResponse, UserSummary } from '../../models/user.js';

const authRouter = Router();

// GET /api/auth/users - Liste publique des utilisateurs (pour la page login)
authRouter.get('/users', async (req, res: Response) => {
  try {
    const users = await listAllUsersPublic();
    res.json(users);
  } catch (error) {
    console.error('[auth] Error listing users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login - Connexion
authRouter.post('/login', async (req, res: Response) => {
  try {
    const { userId, password } = req.body as LoginRequest;

    if (!userId || !password) {
      res.status(400).json({ error: 'userId et password requis' });
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });

    const userSummary: UserSummary = {
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };

    const response: AuthResponse = { token, user: userSummary };
    res.json(response);
  } catch (error) {
    console.error('[auth] Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Récupère l'utilisateur connecté
authRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const payload = getUser(req);
    const user = await getUserById(payload.userId);
    
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const userSummary: UserSummary = {
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };

    res.json(userSummary);
  } catch (error) {
    console.error('[auth] Get me error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/change-password - Changement de mot de passe
authRouter.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body as ChangePasswordRequest;
    const payload = getUser(req);

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
      return;
    }

    if (newPassword.length < 4) {
      res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 4 caractères' });
      return;
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      return;
    }

    await updatePassword(user.id, newPassword, false);

    // Générer un nouveau token avec mustChangePassword = false
    const newToken = generateToken({
      userId: user.id,
      role: user.role,
      mustChangePassword: false,
    });

    const userSummary: UserSummary = {
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: false,
      createdAt: user.createdAt,
    };

    res.json({ token: newToken, user: userSummary });
  } catch (error) {
    console.error('[auth] Change password error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default authRouter;
