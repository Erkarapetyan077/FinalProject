import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * JWT authentication middleware.
 * Expects: Authorization: Bearer <token>
 * On success attaches `req.user = { id: <userId> }`.
 * The React frontend sends the token returned by /api/auth/login.
 */
export function authenticate(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return next(new AppError(401, ERROR_MESSAGES.AUTH_REQUIRED));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError(500, ERROR_MESSAGES.JWT_SECRET_MISSING));
  }

  try {
    const payload = jwt.verify(token, secret);
    if (!payload || typeof payload.sub !== 'string' || !payload.sub) {
      return next(new AppError(401, ERROR_MESSAGES.TOKEN_INVALID));
    }
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new AppError(401, ERROR_MESSAGES.TOKEN_INVALID));
  }
}

export default authenticate;
