const express = require('express');
const snippetsController = require('../controllers/snippets');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CodeSnippet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Snippet ID
 *         user_id:
 *           type: integer
 *           description: Owner user ID
 *         title:
 *           type: string
 *           description: Snippet title
 *         code:
 *           type: string
 *           description: JavaScript code content
 *         description:
 *           type: string
 *           description: Snippet description
 *         share_token:
 *           type: string
 *           description: Unique share token
 *         is_public:
 *           type: boolean
 *           description: Public visibility
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         username:
 *           type: string
 *           description: Owner username
 * tags:
 *   - name: Code Snippets
 *     description: Code snippet management endpoints
 */

/**
 * @swagger
 * /api/snippets:
 *   post:
 *     summary: Create a new code snippet
 *     tags: [Code Snippets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - code
 *             properties:
 *               title:
 *                 type: string
 *                 description: Snippet title
 *               code:
 *                 type: string
 *                 description: JavaScript code content
 *               description:
 *                 type: string
 *                 description: Optional description
 *               isPublic:
 *                 type: boolean
 *                 description: Make snippet publicly visible
 *     responses:
 *       201:
 *         description: Snippet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     snippet:
 *                       $ref: '#/components/schemas/CodeSnippet'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all snippets for authenticated user
 *     tags: [Code Snippets]
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
 *         description: Snippets retrieved successfully
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
 *                     snippets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CodeSnippet'
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
router.post('/', AuthMiddleware.authenticate, snippetsController.create.bind(snippetsController));
router.get('/', AuthMiddleware.authenticate, snippetsController.getAll.bind(snippetsController));

/**
 * @swagger
 * /api/snippets/public:
 *   get:
 *     summary: Get public snippets
 *     tags: [Code Snippets]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
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
 *         description: Public snippets retrieved successfully
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
 *                     snippets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CodeSnippet'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 */
router.get('/public', snippetsController.getPublic.bind(snippetsController));

/**
 * @swagger
 * /api/snippets/share/{token}:
 *   get:
 *     summary: Get snippet by share token
 *     tags: [Code Snippets]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Share token
 *     responses:
 *       200:
 *         description: Snippet retrieved successfully
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
 *                     snippet:
 *                       $ref: '#/components/schemas/CodeSnippet'
 *       404:
 *         description: Snippet not found
 */
router.get('/share/:token', snippetsController.getByShareToken.bind(snippetsController));

/**
 * @swagger
 * /api/snippets/{id}:
 *   get:
 *     summary: Get snippet by ID
 *     tags: [Code Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Snippet ID
 *     responses:
 *       200:
 *         description: Snippet retrieved successfully
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
 *                     snippet:
 *                       $ref: '#/components/schemas/CodeSnippet'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Snippet not found
 *   put:
 *     summary: Update a code snippet
 *     tags: [Code Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Snippet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Snippet title
 *               code:
 *                 type: string
 *                 description: JavaScript code content
 *               description:
 *                 type: string
 *                 description: Snippet description
 *               is_public:
 *                 type: boolean
 *                 description: Public visibility
 *     responses:
 *       200:
 *         description: Snippet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     snippet:
 *                       $ref: '#/components/schemas/CodeSnippet'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Snippet not found or access denied
 *   delete:
 *     summary: Delete a code snippet
 *     tags: [Code Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Snippet ID
 *     responses:
 *       200:
 *         description: Snippet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Snippet not found or access denied
 */
router.get('/:id', AuthMiddleware.authenticate, snippetsController.getById.bind(snippetsController));
router.put('/:id', AuthMiddleware.authenticate, snippetsController.update.bind(snippetsController));
router.delete('/:id', AuthMiddleware.authenticate, snippetsController.delete.bind(snippetsController));

module.exports = router;
