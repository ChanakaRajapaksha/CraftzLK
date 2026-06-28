/**
 * Wraps async route handlers so errors propagate to Express error middleware.
 */
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error('[route error]', err && err.stack ? err.stack : err);
    next(err);
  }
};

module.exports = asyncHandler;
