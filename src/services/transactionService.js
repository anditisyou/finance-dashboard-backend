import Transaction from '../models/Transaction.js';
import AppError from '../utils/AppError.js';

/**
 * Builds a MongoDB filter object from validated query parameters.
 */
const buildFilter = (userId, { type, category, startDate, endDate, search }) => {
  const filter = { userId };

  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Full-text search across category and notes fields
  if (search) {
    filter.$or = [
      { category: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
};

/**
 * Retrieves a paginated, filtered, sorted list of transactions for a user.
 */
export const getTransactions = async (userId, query) => {
  const { page, limit, sortBy, sortOrder, ...filterParams } = query;
  const filter = buildFilter(userId, filterParams);

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Creates a new transaction for the authenticated user.
 */
export const createTransaction = async (userId, data) => {
  return Transaction.create({ ...data, userId });
};

/**
 * Updates a transaction. Ensures users can only modify their own records.
 */
export const updateTransaction = async (transactionId, userId, data) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    data,
    { new: true, runValidators: true }
  );
  if (!transaction) {
    throw new AppError('Transaction not found or access denied.', 404);
  }
  return transaction;
};

/**
 * Soft-deletes a transaction by setting deletedAt.
 */
export const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!transaction) {
    throw new AppError('Transaction not found or access denied.', 404);
  }
  return transaction;
};
