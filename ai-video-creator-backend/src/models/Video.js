import { DataTypes } from 'sequelize';
import validator from 'validator';

/**
 * Sequelize's built-in `isUrl` shorthand ignores options (always requires a
 * TLD), so localhost URLs would fail. Use a custom validator instead so
 * local development URLs like http://localhost:5000/uploads/... are accepted.
 */
function isHttpUrl(value) {
  if (value === null || value === undefined || value === '') return true;
  return validator.isURL(String(value), {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  });
}

/**
 * Video model - a stock video attached to a project (usually found through
 * the Pexels search endpoint) or any externally hosted video URL.
 */
export default function defineVideo(sequelize) {
  return sequelize.define(
    'Video',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'pexels',
      },
      externalVideoId: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      videoUrl: {
        type: DataTypes.STRING(1024),
        allowNull: false,
        validate: {
          validUrl(value) {
            if (!isHttpUrl(value)) {
              throw new Error('videoUrl must be a valid http(s) URL.');
            }
          },
        },
      },
      thumbnailUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true,
        validate: {
          validUrl(value) {
            if (!isHttpUrl(value)) {
              throw new Error('thumbnailUrl must be a valid http(s) URL.');
            }
          },
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      selected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'videos',
      timestamps: true,
    }
  );
}
