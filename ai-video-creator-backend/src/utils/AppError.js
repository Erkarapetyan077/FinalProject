/**
 * Operational application error with an HTTP status code.
 * Throw this from services/controllers; the global error middleware
 * converts it into the standard JSON error envelope.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode HTTP status code (4xx / 5xx)
   * @param {string} message    Human readable message (use ERROR_MESSAGES)
   * @param {Array<{field: string, message: string}>} [errors]
   *        Optional field-level details, rendered in the `errors` array.
   */
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    if (errors !== undefined) {
      this.errors = errors;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
