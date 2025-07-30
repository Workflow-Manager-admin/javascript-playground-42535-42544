const express = require('express');
const executionController = require('../controllers/execution');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExecutionResult:
 *       type: object
 *       properties:
 *         output:
 *           type: string
 *           description: Code execution output
 *         error:
 *           type: string
 *           description: Execution error (if any)
 *         executionTime:
 *           type: number
 *           description: Execution time in milliseconds
 *         hasError:
 *           type: boolean
 *           description: Whether execution had errors
 *     ExecutionHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: History entry ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         snippet_id:
 *           type: integer
 *           nullable: true
 *           description: Associated snippet ID
 *         code:
 *           type: string
 *           description: Executed code
 *         output:
 *           type: string
 *           description: Execution output
 *         error:
 *           type: string
 *           description: Execution error
 *         execution_time:
 *           type: number
 *           description: Execution time in milliseconds
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Execution timestamp
 * tags:
 *   - name: Code Execution
 *     description: Code execution and history endpoints
 */

/**
 * @swagger
 * /api/execute:
 *   post:
 *     summary: Execute JavaScript code
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: JavaScript code to execute
 *               snippetId:
 *                 type: integer
 *                 description: Optional snippet ID for tracking
 *     responses:
 *       200:
 *         description: Code executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ExecutionResult'
 *       400:
 *         description: Invalid code or validation errors
 */
router.post('/', AuthMiddleware.optional, executionController.executeCode.bind(executionController));

/**
 * @swagger
 * /api/execute/history:
 *   get:
 *     summary: Get execution history for authenticated user
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Execution history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ExecutionHistory'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/history', AuthMiddleware.authenticate, executionController.getHistory.bind(executionController));

/**
 * @swagger
 * /api/execute/history/{id}:
 *   get:
 *     summary: Get specific execution history entry
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: History entry ID
 *     responses:
 *       200:
 *         description: History entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       $ref: '#/components/schemas/ExecutionHistory'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: History entry not found
 */
router.get('/history/:id', AuthMiddleware.authenticate, executionController.getHistoryById.bind(executionController));

/**
 * @swagger
 * /api/execute/stats:
 *   get:
 *     summary: Get execution statistics for authenticated user
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total_executions:
 *                           type: integer
 *                         avg_execution_time:
 *                           type: number
 *                         max_execution_time:
 *                           type: number
 *                         error_count:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', AuthMiddleware.authenticate, executionController.getStats.bind(executionController));

module.exports = router;
