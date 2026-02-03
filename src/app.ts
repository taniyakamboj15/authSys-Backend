import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import './config/passport.config'; // Import passport config
import { globalErrorHandler } from './common/middlewares/error.middleware';
import routes from './routes';
import { NotFoundError } from './common/errors/AuthError';

import cookieParser from 'cookie-parser';

const app = express();

// Middlewares
app.use(helmet());



// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
