import express from 'express';
import { httpMiddleware } from './api/middleware/http.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import apiRouter from './api/router.js';

const app = express();

app.use(httpMiddleware());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use(errorHandler);

export default app;
