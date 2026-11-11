import { saveAvatar, removeAvatar } from '../utils/avatar.js';
import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/generateToken.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Create a new standard user account.
 * Roles/privileges are never user-assignable - registration always creates
 * a normal account. Returns the sanitized user (no password hash) + JWT.
 */
export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError(409, ERROR_MESSAGES.EMAIL_IN_USE);
  }

  try {
    const user = await User.create({ name, email, password });
    return { user: user.toPublicJSON(), token: generateToken(user.id) };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new AppError(409, ERROR_MESSAGES.EMAIL_IN_USE);
    }
    throw err;
  }
}

/**
 * Authenticate with email + password.
 * Returns the SAME generic message for "unknown email" and "wrong password"
 * so the endpoint cannot be used to enumerate accounts.
 */
export async function loginUser({ email, password }) {
  const user = await User.findOne({
    where: { email: String(email).trim().toLowerCase() },
  });
  if (!user) {
    throw new AppError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new AppError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  return { user: user.toPublicJSON(), token: generateToken(user.id) };
}

/** Load the authenticated user's profile (sanitized). */
export async function getCurrentUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError(401, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  return user.toPublicJSON();
}

async function requireUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError(401, ERROR_MESSAGES.USER_NOT_FOUND);
  return user;
}

export async function updateProfile(userId, { name }) {
  const user = await requireUser(userId);
  await user.update({ name });
  return user.toPublicJSON();
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await requireUser(userId);
  if (!await user.comparePassword(currentPassword)) {
    throw new AppError(400, 'Current password is incorrect.');
  }
  await user.update({ password: newPassword });
}

export async function updateAvatar(userId, file) {
  const user = await requireUser(userId);
  const oldUrl = user.avatarUrl;
  let newUrl = null;
  if (file) newUrl = await saveAvatar(file);
  try {
    await user.update({ avatarUrl: newUrl });
  } catch (error) {
    await removeAvatar(newUrl);
    throw error;
  }
  await removeAvatar(oldUrl);
  return user.toPublicJSON();
}
