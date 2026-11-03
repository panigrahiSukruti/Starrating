import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS handling
  app.use(
    cors({
      origin: true, // Allow client origin
      credentials: true
    })
  );

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP
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

  // Global error handler
  app.use(errorHandler);

  return app;
};

