/**
 * Sends a standardised JSON success response.
 *
 * @param {Object} res       - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message   - Human-readable message
 * @param {*}      data      - Payload to include in the response
 * @param {Object} meta      - Optional metadata (pagination, etc.)
 */
export const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const payload = { status: 'success', message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};
