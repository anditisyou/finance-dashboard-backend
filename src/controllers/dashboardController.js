import * as dashboardService from '../services/dashboardService.js';
import { sendResponse } from '../utils/response.js';
import catchAsync from '../utils/catchAsync.js';

export const getSummary = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboardSummary(req.user._id, req.user.role);
  sendResponse(res, 200, 'Dashboard summary retrieved successfully.', data);
});
