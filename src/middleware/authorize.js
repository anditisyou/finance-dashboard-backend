import AppError from '../utils/AppError.js';

// Role hierarchy: higher index = more permissions
const ROLE_LEVELS = { viewer: 1, analyst: 2, admin: 3 };

/**
 * Returns middleware that checks whether the authenticated user holds one of
 * the permitted roles.
 *
 * Usage: authorize('admin')  or  authorize('analyst', 'admin')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const userLevel = ROLE_LEVELS[req.user.role] ?? 0;
    const requiredLevel = Math.min(...allowedRoles.map((r) => ROLE_LEVELS[r] ?? 99));

    if (userLevel < requiredLevel) {
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Convenience aliases for common access patterns.
 */
export const requireAdmin = authorize('admin');
export const requireAnalyst = authorize('analyst', 'admin');
export const requireViewer = authorize('viewer', 'analyst', 'admin');
