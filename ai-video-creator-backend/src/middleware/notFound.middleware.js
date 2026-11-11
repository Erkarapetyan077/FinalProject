import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * 404 middleware - catches every unmatched route and returns a JSON
 * error envelope instead of the default HTML Express 404 page.
 */
export function notFound(req, _res, next) {
  next(
    new AppError(
      404,
      `${ERROR_MESSAGES.NOT_FOUND} No route matches ${req.method} ${req.originalUrl}.`
    )
  );
}

export default notFound;
