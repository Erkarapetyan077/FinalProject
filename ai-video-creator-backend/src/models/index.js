import { sequelize } from '../config/database.js';
import defineUser from './User.js';
import defineProject from './Project.js';
import defineVideo from './Video.js';
import defineVoiceover from './Voiceover.js';
import defineCaption from './Caption.js';
import defineExport from './Export.js';

/**
 * Central model registry + association definitions.
 *
 * Aliases used consistently with `include`:
 *   user.projects, project.user, project.videos, project.voiceovers,
 *   project.captions, project.exports
 */
export const User = defineUser(sequelize);
export const Project = defineProject(sequelize);
export const Video = defineVideo(sequelize);
export const Voiceover = defineVoiceover(sequelize);
export const Caption = defineCaption(sequelize);
export const Export = defineExport(sequelize);

// User <-> Project
User.hasMany(Project, {
  foreignKey: { name: 'userId', allowNull: false },
  as: 'projects',
  onDelete: 'CASCADE',
});
Project.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, as: 'user' });

// Project <-> Video
Project.hasMany(Video, {
  foreignKey: { name: 'projectId', allowNull: false },
  as: 'videos',
  onDelete: 'CASCADE',
});
Video.belongsTo(Project, { foreignKey: { name: 'projectId', allowNull: false }, as: 'project' });

// Project <-> Voiceover
Project.hasMany(Voiceover, {
  foreignKey: { name: 'projectId', allowNull: false },
  as: 'voiceovers',
  onDelete: 'CASCADE',
});
Voiceover.belongsTo(Project, { foreignKey: { name: 'projectId', allowNull: false }, as: 'project' });

// Project <-> Caption
Project.hasMany(Caption, {
  foreignKey: { name: 'projectId', allowNull: false },
  as: 'captions',
  onDelete: 'CASCADE',
});
Caption.belongsTo(Project, { foreignKey: { name: 'projectId', allowNull: false }, as: 'project' });

// Project <-> Export
Project.hasMany(Export, {
  foreignKey: { name: 'projectId', allowNull: false },
  as: 'exports',
  onDelete: 'CASCADE',
});
Export.belongsTo(Project, { foreignKey: { name: 'projectId', allowNull: false }, as: 'project' });

export { sequelize };

const models = { User, Project, Video, Voiceover, Caption, Export, sequelize };
export default models;
