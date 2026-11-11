import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

/**
 * User model. Password hashes are hashed with bcrypt and NEVER returned
 * from the API - `toJSON()` strips the password column.
 */
export default function defineUser(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
        validate: {
          len: { args: [2, 80], msg: 'Name must be between 2 and 80 characters.' },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        set(value) {
          this.setDataValue('email', String(value).trim().toLowerCase());
        },
        validate: {
          isEmail: { msg: 'Email must be a valid email address.' },
        },
      },
      avatarUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: { args: [8, 128], msg: 'Password must be between 8 and 128 characters.' },
        },
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.changed('password')) {
            user.password = await hashPassword(user.password);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await hashPassword(user.password);
          }
        },
      },
    }
  );

  async function hashPassword(plain) {
    const parsed = Number.parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const rounds = Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
    return bcrypt.hash(plain, rounds);
  }

  /** Verify a plaintext password against the stored hash. */
  User.prototype.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  };

  /** Public representation without the password hash. */
  User.prototype.toPublicJSON = function toPublicJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  // Default JSON serialization also strips the password, so a hash can
  // never leak even if an instance is serialized by accident.
  User.prototype.toJSON = function toJSON() {
    return this.toPublicJSON();
  };

  return User;
}
