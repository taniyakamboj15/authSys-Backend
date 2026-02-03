import 'dotenv/config';

import app from './app';
import connectDB, { disconnectDB } from './config/db.config';
import { disconnectRedis } from './config/redis.config';
import logger from './common/utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Closing resources...`);
  await disconnectDB();
  await disconnectRedis();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});
