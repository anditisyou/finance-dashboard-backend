/**
 * Operational error class that carries an HTTP status code.
 * Distinguishes known errors (e.g. 404 Not Found) from unexpected ones.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    // Preserve original stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
