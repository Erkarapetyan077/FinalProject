import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../validators/validate.js';
import {
  projectIdParam,
  paginationRules,
  createProjectRules,
  updateProjectRules,
} from '../validators/project.validators.js';
import * as projectController from '../controllers/project.controller.js';

const router = Router();

// All project routes require authentication; ownership is enforced in the service layer.
router.use(authenticate);

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     description: Creates a new video project owned by the authenticated user. New projects always start with status `draft`.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 120
 *                 example: Travel montage
 *               topic:
 *                 type: string
 *                 maxLength: 200
 *                 example: nature
 *               scriptText:
 *                 type: string
 *                 maxLength: 20000
 *                 example: Ten places you must visit this year...
 *     responses:
 *       201:
 *         description: Project created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     project: { $ref: '#/components/schemas/Project' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', createProjectRules, validate, asyncHandler(projectController.create));

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List the authenticated user's projects
 *     description: Returns a paginated list of projects owned by the authenticated user, newest first.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated projects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Project' }
 *                     pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', paginationRules, validate, asyncHandler(projectController.list));

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by id
 *     description: |
 *       Returns one project owned by the authenticated user.
 *       Optionally include related resources via the `include` query parameter
 *       (comma separated, e.g. `?include=videos,captions`).
 *       Returns 404 for missing projects AND projects owned by other users.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project UUID.
 *         schema: { type: string, format: uuid }
 *       - name: include
 *         in: query
 *         required: false
 *         description: Comma-separated related resources to embed.
 *         schema:
 *           type: string
 *           enum: ['videos', 'voiceovers', 'captions', 'exports', 'videos,voiceovers,captions,exports']
 *         example: videos,captions
 *     responses:
 *       200:
 *         description: The project (with any requested includes).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     project: { $ref: '#/components/schemas/Project' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', projectIdParam, validate, asyncHandler(projectController.getById));

/**
 * @openapi
 * /api/projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
 *     description: Partially updates a project owned by the authenticated user. Only the provided fields are changed.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project UUID.
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 120
 *                 example: Travel montage (final)
 *               topic:
 *                 type: string
 *                 maxLength: 200
 *               scriptText:
 *                 type: string
 *                 maxLength: 20000
 *               status:
 *                 type: string
 *                 enum: [draft, processing, completed, failed]
 *     responses:
 *       200:
 *         description: Updated project.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     project: { $ref: '#/components/schemas/Project' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id', updateProjectRules, validate, asyncHandler(projectController.update));

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
 *     description: Deletes a project owned by the authenticated user together with its videos, voiceovers, captions and exports (cascade).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project UUID.
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', projectIdParam, validate, asyncHandler(projectController.remove));

export default router;
