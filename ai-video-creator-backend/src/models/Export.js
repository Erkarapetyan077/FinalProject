import { DataTypes } from 'sequelize';

/**
 * Export model - one FFmpeg render job per project.
 * `status` transitions: queued -> processing -> completed | failed.
 * `outputUrl` is only set when the output file actually exists on disk.
 */
export default function defineExport(sequelize) {
  return sequelize.define(
    'Export',
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
      outputUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('queued', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'queued',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'exports',
      timestamps: true,
    }
  );
}
