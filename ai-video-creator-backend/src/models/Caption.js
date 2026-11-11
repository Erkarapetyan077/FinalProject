import { DataTypes } from 'sequelize';

/**
 * Caption model - a single caption line, optionally timed (seconds).
 * Timings are optional so users can write captions before timing them.
 */
export default function defineCaption(sequelize) {
  return sequelize.define(
    'Caption',
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
      text: {
        type: DataTypes.STRING(2000),
        allowNull: false,
        validate: {
          len: { args: [1, 2000], msg: 'text must be between 1 and 2000 characters.' },
        },
      },
      startTime: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        validate: { min: 0 },
      },
      endTime: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        validate: { min: 0 },
      },
    },
    {
      tableName: 'captions',
      timestamps: true,
    }
  );
}
