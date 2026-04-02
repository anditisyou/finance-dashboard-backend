import Transaction from '../models/Transaction.js';

/**
 * Returns a complete dashboard summary for a given user using aggregation.
 * Admins see all data; other roles see only their own.
 */
export const getDashboardSummary = async (userId, role) => {
  const matchStage = role === 'admin' ? {} : { userId };

  const [summary, categoryTotals, recentTransactions, monthlyTrends] = await Promise.all([
    getIncomeSummary(matchStage),
    getCategoryTotals(matchStage),
    getRecentTransactions(matchStage),
    getMonthlyTrends(matchStage),
  ]);

  return { summary, categoryTotals, recentTransactions, monthlyTrends };
};

/**
 * Aggregate total income, total expenses, and net balance.
 */
const getIncomeSummary = async (matchStage) => {
  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const income = result.find((r) => r._id === 'income') || { total: 0, count: 0 };
  const expense = result.find((r) => r._id === 'expense') || { total: 0, count: 0 };

  return {
    totalIncome: income.total,
    totalExpenses: expense.total,
    netBalance: income.total - expense.total,
    transactionCount: income.count + expense.count,
  };
};

/**
 * Aggregate totals grouped by category and type.
 */
const getCategoryTotals = async (matchStage) => {
  return Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
};

/**
 * Fetch the 10 most recent transactions.
 */
const getRecentTransactions = async (matchStage) => {
  return Transaction.aggregate([
    { $match: matchStage },
    { $sort: { date: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    {
      $project: {
        amount: 1,
        type: 1,
        category: 1,
        date: 1,
        notes: 1,
        user: { $arrayElemAt: ['$user', 0] },
      },
    },
  ]);
};

/**
 * Monthly income vs expense trends for the last 12 months.
 */
const getMonthlyTrends = async (matchStage) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  return Transaction.aggregate([
    {
      $match: {
        ...matchStage,
        date: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        entries: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        income: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$entries',
                    cond: { $eq: ['$$this.type', 'income'] },
                  },
                },
                0,
              ],
            },
            { total: 0, count: 0 },
          ],
        },
        expense: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$entries',
                    cond: { $eq: ['$$this.type', 'expense'] },
                  },
                },
                0,
              ],
            },
            { total: 0, count: 0 },
          ],
        },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);
};
