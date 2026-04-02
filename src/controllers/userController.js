import * as userService from '../services/userService.js';
import { sendResponse } from '../utils/response.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req.user);
  sendResponse(res, 200, 'Users retrieved successfully.', { users });
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.user);
  sendResponse(res, 200, 'User retrieved successfully.', { user });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  sendResponse(res, 200, 'User role updated successfully.', { user });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, 200, 'User status updated successfully.', { user });
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user);
  sendResponse(res, 200, 'User deleted successfully.', null);
});
