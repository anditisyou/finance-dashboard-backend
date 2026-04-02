import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAnalyst } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated financial analytics (analyst and admin only)
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Full dashboard summary (income, expenses, trends, categories)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Aggregated summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalIncome:      { type: number }
 *                     totalExpenses:    { type: number }
 *                     netBalance:       { type: number }
 *                     transactionCount: { type: integer }
 *                 categoryTotals:       { type: array }
 *                 recentTransactions:   { type: array }
 *                 monthlyTrends:        { type: array }
 *       403: { description: Insufficient role }
 */
router.get('/summary', requireAnalyst, dashboardController.getSummary);

export default router;
