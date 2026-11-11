import { DataTypes } from 'sequelize';

/**
 * Project model. Every project belongs to exactly one user; ownership is
 * enforced in the service layer (queries always filter by userId).
 */
export default function defineProject(sequelize) {
  return sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          len: { args: [1, 120], msg: 'Title must be between 1 and 120 characters.' },
        },
      },
      topic: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      scriptText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('draft', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'draft',
      },
    },
    {
      tableName: 'projects',
      timestamps: true,
    }
  );
}
