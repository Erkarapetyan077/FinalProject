import { Sequelize } from 'sequelize';

/**
 * Builds the Sequelize instance from environment variables.
 * Supports either a full postgres:// DATABASE_URL or discrete DB_* variables.
 * A DATABASE_URL that is not postgres-flavoured (e.g. inherited from another
 * tool in the environment) is ignored in favour of the DB_* variables.
 * The connection is verified in server.js before the HTTP server starts.
 */
function buildSequelize() {
  const databaseUrl = process.env.DATABASE_URL;
  if (
    typeof databaseUrl === 'string' &&
    (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))
  ) {
    return new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
    });
  }

  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'ai_video_creator',
    DB_USER = 'postgres',
    DB_PASSWORD = 'postgres',
  } = process.env;

  return new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: Number.parseInt(DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
  });
}

export const sequelize = buildSequelize();

/** Verify the connection; throws when PostgreSQL is unreachable. */
export async function connectDatabase() {
  await sequelize.authenticate();
  return sequelize;
}

export default sequelize;
