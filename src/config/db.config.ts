import mongoose from 'mongoose';
import logger from '../common/utils/logger';

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(mongoURI);

    logger.info('MongoDB Connected Successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime error', { err });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error('MongoDB Connection Error:', { error });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

export default connectDB;
