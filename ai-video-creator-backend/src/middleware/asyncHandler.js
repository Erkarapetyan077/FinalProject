/**
 * Wraps an async route handler so any rejected promise is forwarded
 * to the global error middleware instead of crashing the process.
 *
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
