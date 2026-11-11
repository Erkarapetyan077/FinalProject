// Explicit, additive production migration; does not alter other columns.
import 'dotenv/config';
import { sequelize } from '../src/config/database.js';
import { DataTypes } from 'sequelize';

try {
  const query = sequelize.getQueryInterface();
  const columns = await query.describeTable('users');
  if (!columns.avatarUrl) {
    await query.addColumn('users', 'avatarUrl', {
      type: DataTypes.STRING(255), allowNull: true, defaultValue: null,
    });
    console.log('Added users.avatarUrl');
  } else {
    console.log('users.avatarUrl already exists');
  }
} finally {
  await sequelize.close();
}
