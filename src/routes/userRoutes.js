import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { updateRoleSchema, updateStatusSchema } from '../utils/validators.js';

const router = Router();

// All user-management routes require a valid JWT
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only except GET /me)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (admin sees all; others see only themselves)
 *     tags: [Users]
 *     responses:
 *       200: { description: Users list returned }
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User returned }
 *       404: { description: User not found }
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user's role (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [viewer, analyst, admin] }
 *     responses:
 *       200: { description: Role updated }
 */
router.patch('/:id/role', requireAdmin, validate(updateRoleSchema), userController.updateUserRole);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/:id/status', requireAdmin, validate(updateStatusSchema), userController.updateUserStatus);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft-delete a user (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User deleted }
 */
router.delete('/:id', requireAdmin, userController.deleteUser);

export default router;
