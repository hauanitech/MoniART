import { Router } from 'express';
import { workspaceMiddleware } from './middleware/workspace.js';
import templatesRouter from './routes/templates.js';
import reportsRouter from './routes/reports.js';
import reportsRenderRouter from './routes/reportsRender.js';
import emailRouter from './routes/email.js';

const apiRouter = Router();

apiRouter.use(workspaceMiddleware);
apiRouter.use('/templates', templatesRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/reports', reportsRenderRouter);
apiRouter.use('/reports', emailRouter);

export default apiRouter;
