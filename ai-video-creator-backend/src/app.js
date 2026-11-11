import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './config/swagger.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { uploadsRoot } from './utils/storage.js';
import { ERROR_MESSAGES } from './constants/errorMessages.js';

/**
 * Express application factory.
 * Kept separate from server.js so the server entry can first verify the
 * database connection, and so tests could import the app without side effects.
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  // Security headers. crossOriginResourcePolicy:'cross-origin' allows the
  // separate React frontend to load generated media from /uploads.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS - allow the frontend origin(s) configured in CLIENT_URL.
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.use(
    cors(
      allowedOrigins.length > 0
        ? { origin: allowedOrigins }
        : {} // no CLIENT_URL configured -> open CORS for local development
    )
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic rate limiting for the API surface.
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/health'),
    message: {
      success: false,
      statusCode: 429,
      message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
    },
  });
  app.use('/api', apiLimiter);

  // Root - JSON on purpose (the API never returns HTML pages).
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        name: 'AI Video Creator API',
        version: '1.0.0',
        docs: '/api-docs',
        openapi: '/api-docs.json',
        health: '/api/health',
      },
    });
  });

  // Generated media (voiceover audio, exported videos).
  app.use('/uploads', express.static(uploadsRoot, { maxAge: '1h' }));

  // Swagger: interactive UI + raw OpenAPI JSON.
  app.use('/api-docs.json', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(openapiSpec);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: 'AI Video Creator API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );

  // API routes.
  app.use('/api', routes);

  // 404 (JSON) + global error handler must stay last.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
