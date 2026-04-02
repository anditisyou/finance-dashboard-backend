import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../middleware/authenticate.js';

/**
 * Creates a new user. Admin-only role assignment is enforced in the route layer.
 */
export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password, role: role || 'viewer' });
  const token = signToken(user._id);

  return { user, token };
};

/**
 * Validates credentials and returns a JWT on success.
 */
export const loginUser = async ({ email, password }) => {
  // Explicitly select password since it is excluded by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Intentionally vague to prevent user enumeration
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status !== 'active') {
    throw new AppError('Your account has been deactivated. Contact an admin.', 403);
  }

  const token = signToken(user._id);
  user.password = undefined; // strip before returning

  return { user, token };
};
