import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Verifies the JWT from the Authorization header and attaches the user to req.
 * Rejects inactive or deleted users even if their token is valid.
 */
export const authenticate = catchAsync(async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  // Verify signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid token. Please log in again.';
    return next(new AppError(message, 401));
  }

  // Confirm user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }
  if (user.status !== 'active') {
    return next(new AppError('Your account has been deactivated. Contact an admin.', 403));
  }

  req.user = user;
  next();
});

/**
 * Generates a JWT for a given user id.
 */
export const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
