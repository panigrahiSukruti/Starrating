import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );

  // CORS handling
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use(limiter);

  // JSON payload parser
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // API router
  app.use('/api', routes);

  // Serve compiled React SPA static build if present
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Global error handler
  app.use(errorHandler);

  return app;
};
