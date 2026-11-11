import { DataTypes } from 'sequelize';

/**
 * Voiceover model - stores the voiceover text per project. Audio generation
 * (ElevenLabs) is optional: `audioUrl` stays null and `status` stays `draft`
 * until audio was successfully generated.
 */
export default function defineVoiceover(sequelize) {
  return sequelize.define(
    'Voiceover',
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
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'text is required.' },
        },
      },
      provider: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      audioUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('draft', 'generating', 'ready', 'failed'),
        allowNull: false,
        defaultValue: 'draft',
      },
    },
    {
      tableName: 'voiceovers',
      timestamps: true,
    }
  );
}
