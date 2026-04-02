import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin, requireViewer } from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../utils/validators.js';

const router = Router();

// Every transaction route requires authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Financial transaction CRUD
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transactions with filtering, search, and pagination
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in category and notes fields
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [date, amount, createdAt], default: date }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: Transactions list with pagination metadata }
 */
router.get(
  '/',
  requireViewer,
  validate(transactionQuerySchema, 'query'),
  transactionController.getTransactions
);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction (analyst and admin)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount:   { type: number, example: 5000 }
 *               type:     { type: string, enum: [income, expense] }
 *               category: { type: string, example: Salary }
 *               date:     { type: string, format: date }
 *               notes:    { type: string }
 *     responses:
 *       201: { description: Transaction created }
 */
router.post(
  '/',
  requireAdmin, // analysts use their own scoped create; admins have full access
  validate(createTransactionSchema),
  transactionController.createTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Update a transaction (admin only)
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction updated }
 *       404: { description: Not found }
 */
router.patch(
  '/:id',
  requireAdmin,
  validate(updateTransactionSchema),
  transactionController.updateTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Soft-delete a transaction (admin only)
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction deleted }
 */
router.delete('/:id', requireAdmin, transactionController.deleteTransaction);

export default router;
