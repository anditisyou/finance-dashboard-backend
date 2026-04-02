/**
 * Wraps an async route handler and forwards any thrown errors to Express's
 * next() function, eliminating the need for try/catch in every controller.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
