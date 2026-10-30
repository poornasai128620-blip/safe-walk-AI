import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { contactsRouter } from './routes/contacts.js';
import { safetyRouter } from './routes/safety.js';
import { incidentsRouter } from './routes/incidents.js';
import { gpsRouter } from './routes/gps.js';
import { evidenceRouter } from './routes/evidence.js';
import { notificationsRouter } from './routes/notifications.js';
import { aiRouter } from './routes/ai.js';
import { emergencyRouter } from './routes/emergency.js';
import { cctvRouter } from './routes/cctv.js';
import { dashboardRouter } from './routes/dashboard.js';

const app = express();

// Security headers and CORS
app.use(helmet({
  contentSecurityPolicy: false // Allows previewing dashboards and web app assets
}));

app.use(cors({
  origin: '*', // Allow frontend web and mobile dev clients
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (config.env !== 'test') {
  app.use(morgan('combined'));
}

// Global API rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    product: 'SafeWalk AI Emergency Response Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    features: {
      erss_112: 'active',
      ai_voice_detection: 'active',
      cctv_registry: 'active',
      gps_tracking: 'active'
    }
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', api_version: 'v1' });
});

// Mount Versioned REST API under /api/v1
const v1 = express.Router();

v1.use('/auth', authRouter);
v1.use('/users', usersRouter);
v1.use('/contacts', contactsRouter);
v1.use('/safety', safetyRouter);
v1.use('/incidents', incidentsRouter);
v1.use('/incidents', gpsRouter);
v1.use('/incidents', evidenceRouter);
v1.use('/incidents', notificationsRouter);
v1.use('/ai', aiRouter);
v1.use('/integrations', emergencyRouter);
v1.use('/cameras', cctvRouter);
v1.use('/dashboard', dashboardRouter);

app.use('/api/v1', v1);

// Error Handling Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, () => {
    logger.info(`SafeWalk AI Backend Server running securely on port ${config.port}`, {
      apiUrl: `${config.apiBaseUrl}/api/v1`,
      environment: config.env
    });
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down SafeWalk AI server gracefully');
    server.close(() => process.exit(0));
  });
}

export { app };
