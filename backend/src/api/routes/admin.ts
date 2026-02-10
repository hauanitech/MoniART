import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword,
  countAdmins,
} from '../../services/userRepository.js';
import { listAllReports } from '../../services/reportRepository.js';
import { CreateUserRequest, UpdateUserRequest, isValidUserRole } from '../../models/user.js';
import { generateTemporaryPassword } from '../../services/authService.js';

const adminRouter = Router();

// Toutes les routes admin nécessitent auth + admin
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// GET /api/admin/users - Liste tous les utilisateurs
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    console.error('[admin] Error listing users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users - Créer un utilisateur
adminRouter.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { name, password, role } = req.body as CreateUserRequest;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Le nom est requis' });
      return;
    }

    const userRole = role || 'MONITOR';
    if (!isValidUserRole(userRole)) {
      res.status(400).json({ error: 'Rôle invalide' });
      return;
    }

    // Générer un mot de passe temporaire si non fourni
    const userPassword = password || generateTemporaryPassword();
    const mustChangePassword = !password;

    const user = await createUser(name.trim(), userPassword, userRole, mustChangePassword);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      },
      temporaryPassword: mustChangePassword ? userPassword : undefined,
    });
  } catch (error: any) {
    console.error('[admin] Error creating user:', error);
    if (error.message?.includes('existe déjà')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// GET /api/admin/users/:userId - Récupérer un utilisateur
adminRouter.get('/users/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[admin] Error getting user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/users/:userId - Modifier un utilisateur
adminRouter.put('/users/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, role } = req.body as UpdateUserRequest;

    const updates: UpdateUserRequest = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) {
      if (!isValidUserRole(role)) {
        res.status(400).json({ error: 'Rôle invalide' });
        return;
      }
      updates.role = role;
    }

    const user = await updateUser(userId, updates);

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('[admin] Error updating user:', error);
    if (error.message?.includes('existe déjà')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// DELETE /api/admin/users/:userId - Supprimer un utilisateur
adminRouter.delete('/users/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Vérifier qu'on ne supprime pas le dernier admin
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    if (user.role === 'ADMIN') {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
        return;
      }
    }

    const deleted = await deleteUser(userId);
    if (!deleted) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('[admin] Error deleting user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users/:userId/reset-password - Réinitialiser le mot de passe
adminRouter.post('/users/:userId/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const tempPassword = await resetPassword(userId);
    if (!tempPassword) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({ temporaryPassword: tempPassword });
  } catch (error) {
    console.error('[admin] Error resetting password:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/reports - Lister tous les rapports (tous utilisateurs)
adminRouter.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const typeFilter = req.query.type as string | undefined;
    const reports = await listAllReports(typeFilter as any);
    res.json(reports);
  } catch (error) {
    console.error('[admin] Error listing reports:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default adminRouter;
