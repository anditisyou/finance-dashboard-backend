import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Returns all non-deleted users. Admins see everyone; others see only themselves.
 */
export const getAllUsers = async (requestingUser) => {
  if (requestingUser.role !== 'admin') {
    return [requestingUser];
  }
  return User.find().sort({ createdAt: -1 });
};

/**
 * Returns a single user by id. Non-admins can only fetch their own profile.
 */
export const getUserById = async (userId, requestingUser) => {
  if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== userId) {
    throw new AppError('Access denied.', 403);
  }
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Updates a user's role. Only admins may call this.
 */
export const updateUserRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Activates or deactivates a user account.
 */
export const updateUserStatus = async (userId, status) => {
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Soft-deletes a user by setting deletedAt.
 * Prevents an admin from deleting their own account.
 */
export const deleteUser = async (userId, requestingUser) => {
  if (requestingUser._id.toString() === userId) {
    throw new AppError('You cannot delete your own account.', 400);
  }
  const user = await User.findByIdAndUpdate(userId, { deletedAt: new Date() }, { new: true });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};
