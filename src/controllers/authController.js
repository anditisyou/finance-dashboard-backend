import * as authService from '../services/authService.js';
import { sendResponse } from '../utils/response.js';
import catchAsync from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  sendResponse(res, 201, 'User registered successfully.', { user, token });
});

export const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  sendResponse(res, 200, 'Login successful.', { user, token });
});

export const getMe = catchAsync(async (req, res) => {
  sendResponse(res, 200, 'User profile retrieved.', { user: req.user });
});
