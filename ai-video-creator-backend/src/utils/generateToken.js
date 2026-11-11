import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Sign a JWT for an authenticated user.
 * The token payload intentionally carries only the user id (`sub`) -
 * never roles or other privileges users could influence.
 *
 * @param {string} userId
 * @returns {string} signed JWT
 */
export function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(ERROR_MESSAGES.JWT_SECRET_MISSING);
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export default generateToken;
