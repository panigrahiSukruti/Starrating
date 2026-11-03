import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { PORT } from './config/constants';
import { prisma } from './prisma';

const app = createApp();

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to SQLite database with Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

