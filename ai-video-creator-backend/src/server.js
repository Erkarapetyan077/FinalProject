import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { createApp } from './app.js';
import { connectDatabase, sequelize } from './config/database.js';
import { ensureUploadDirs } from './utils/storage.js';

const PORT = Number.parseInt(process.env.PORT || '5000', 10);
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Server entry point:
 *   1. validate critical environment
 *   2. verify the PostgreSQL connection (fail fast with clear guidance)
 *   3. sync models in development only (sync({ alter: true }), NEVER force)
 *   4. start the HTTP server
 */
async function main() {
  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      console.error(
        '[boot] Refusing to start: JWT_SECRET is not set. Generate one with:\n' +
          '       node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
      );
      process.exit(1);
    }
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    console.warn(
      '[boot] WARNING: JWT_SECRET is not set - using a random development secret. ' +
        'Tokens become invalid on every restart. Set JWT_SECRET in .env for stable sessions.'
    );
  }

  try {
    await connectDatabase();
    console.log('[boot] PostgreSQL connection established');
  } catch (err) {
    console.error('[boot] Unable to connect to PostgreSQL:', err.message);
    console.error(
      '[boot] Check the DB_* (or DATABASE_URL) values in your .env file and make sure the database exists.\n' +
        '       Create it, for example, with: createdb ai_video_creator\n' +
        '       (SQL alternative: CREATE DATABASE ai_video_creator;)'
    );
    process.exit(1);
  }

  if (!isProduction) {
    await sequelize.sync({ alter: true });
    console.log('[boot] Models synchronized (sequelize.sync({ alter: true }))');
  }

  ensureUploadDirs();

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`[boot] AI Video Creator API listening on http://localhost:${PORT}`);
    console.log(`[boot] Swagger UI:  http://localhost:${PORT}/api-docs`);
    console.log(`[boot] OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  });

  const shutdown = async (signal) => {
    console.log(`[boot] ${signal} received - shutting down gracefully`);
    server.close(async () => {
      await sequelize.close().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('[boot] Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[boot] Uncaught exception:', err);
  process.exit(1);
});

main();
