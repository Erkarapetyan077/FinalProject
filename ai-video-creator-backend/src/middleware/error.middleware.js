import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Global error middleware - the single place where API errors are converted
 * into the standard JSON envelope:
 *   { "success": false, "statusCode": <int>, "message": "<string>", "errors"?: [...] }
 *
 * The API NEVER returns HTML error pages or stack traces.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message =
    err instanceof AppError && err.isOperational
      ? err.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  let errors = err instanceof AppError ? err.errors : undefined;

  // Sequelize model validation errors -> 422 with field details
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = ERROR_MESSAGES.VALIDATION_FAILED;
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Sequelize unique constraint violations -> 409
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const isEmail = Array.isArray(err.errors) && err.errors.some((e) => e.path === 'email');
    message = isEmail
      ? ERROR_MESSAGES.EMAIL_IN_USE
      : 'A record with the same unique value already exists.';
    errors = Array.isArray(err.errors)
      ? err.errors.map((e) => ({ field: e.path, message: e.message }))
      : undefined;
  }

  // Malformed JSON body -> 400
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = ERROR_MESSAGES.INVALID_JSON;
  }

  if (statusCode >= 500) {
    // Log server-side only; never leak internals or stack traces to clients.
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${statusCode}`);
    console.error(err);
  }

  const body = { success: false, statusCode, message };
  if (Array.isArray(errors) && errors.length > 0) {
    body.errors = errors;
  }

  res.status(statusCode).json(body);
}

export default errorHandler;
