import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimiterMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});