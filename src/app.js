import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// ─── Security & utility middleware ────────────────────────────────────────────
app.use(helmet());                        // Set secure HTTP headers
app.use(cors());                          // Enable CORS for all origins
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies (size-limited)
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));                  // HTTP request logging
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── API documentation ────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
const BASE = '/api/v1';
app.use(`${BASE}/auth`, authRoutes);
app.use(`${BASE}/users`, userRoutes);
app.use(`${BASE}/transactions`, transactionRoutes);
app.use(`${BASE}/dashboard`, dashboardRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
