const express = require('express');
const healthController = require('../controllers/health');
const authRoutes = require('./auth');
const executionRoutes = require('./execution');
const snippetsRoutes = require('./snippets');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/execute', executionRoutes);
router.use('/api/snippets', snippetsRoutes);

module.exports = router;
