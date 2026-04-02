import Joi from 'joi';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('viewer', 'analyst', 'admin'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Users ───────────────────────────────────────────────────────────────────

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid('viewer', 'analyst', 'admin').required(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

// ─── Transactions ─────────────────────────────────────────────────────────────

export const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().max(50).required(),
  date: Joi.date().iso(),
  notes: Joi.string().max(500).allow('', null),
});

export const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().max(50),
  date: Joi.date().iso(),
  notes: Joi.string().max(500).allow('', null),
}).min(1); // at least one field must be provided

export const transactionQuerySchema = Joi.object({
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().max(50),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  search: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('date', 'amount', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
