import { Router } from 'express';
import { authMiddleware, requirePasswordChanged } from './middleware/auth.js';
import templatesRouter from './routes/templates.js';
import reportsRouter from './routes/reports.js';
import reportsRenderRouter from './routes/reportsRender.js';
import emailRouter from './routes/email.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

const apiRouter = Router();

// Routes publiques (pas d'authentification)
apiRouter.use('/auth', authRouter);

// Routes protégées (nécessitent authentification + mot de passe changé)
apiRouter.use('/templates', authMiddleware, requirePasswordChanged, templatesRouter);
apiRouter.use('/reports', authMiddleware, requirePasswordChanged, reportsRouter);
apiRouter.use('/reports', authMiddleware, requirePasswordChanged, reportsRenderRouter);
apiRouter.use('/reports', authMiddleware, requirePasswordChanged, emailRouter);

// Routes admin (nécessitent authentification + rôle admin)
apiRouter.use('/admin', adminRouter);

export default apiRouter;
