import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and profile endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:   { type: string, example: Alice Smith }
 *               email:  { type: string, format: email, example: alice@example.com }
 *               password: { type: string, minLength: 8, example: secret123 }
 *               role:   { type: string, enum: [viewer, analyst, admin] }
 *     responses:
 *       201: { description: User registered }
 *       409: { description: Email already in use }
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200: { description: Profile returned }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, authController.getMe);

export default router;
