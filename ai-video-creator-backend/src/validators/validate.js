import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Runs after an express-validator chain and forwards a 422 error with a
 * consistent `errors` array when validation failed:
 *   { success: false, statusCode: 422, message: "Validation failed...",
 *     errors: [{ field: "email", message: "..." }] }
 */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  const errors = result
    .array({ onlyFirstError: true })
    .map((e) => ({ field: e.path, message: e.msg }));
  return next(new AppError(422, ERROR_MESSAGES.VALIDATION_FAILED, errors));
}

export default validate;
