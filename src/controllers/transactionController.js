import * as transactionService from '../services/transactionService.js';
import { sendResponse } from '../utils/response.js';
import catchAsync from '../utils/catchAsync.js';

export const getTransactions = catchAsync(async (req, res) => {
  const { transactions, meta } = await transactionService.getTransactions(
    req.user._id,
    req.query
  );
  sendResponse(res, 200, 'Transactions retrieved successfully.', { transactions }, meta);
});

export const createTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.user._id, req.body);
  sendResponse(res, 201, 'Transaction created successfully.', { transaction });
});

export const updateTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.updateTransaction(
    req.params.id,
    req.user._id,
    req.body
  );
  sendResponse(res, 200, 'Transaction updated successfully.', { transaction });
});

export const deleteTransaction = catchAsync(async (req, res) => {
  await transactionService.deleteTransaction(req.params.id, req.user._id);
  sendResponse(res, 200, 'Transaction deleted successfully.', null);
});
