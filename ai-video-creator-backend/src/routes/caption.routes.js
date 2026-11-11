import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../validators/validate.js';
import {
  projectIdPath,
  captionIdPath,
  createCaptionRules,
  updateCaptionRules,
} from '../validators/caption.validators.js';
import * as captionController from '../controllers/caption.controller.js';

/**
 * Caption routes. Route paths include :projectId so the path parameter is
 * matched by the route layer itself (mounted under /api/projects).
 */
const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /api/projects/{projectId}/captions:
 *   post:
 *     tags: [Captions]
 *     summary: Create a caption
 *     description: |
 *       Adds a caption line to a project. Timings (`startTime` / `endTime`, in
 *       seconds) are optional; when both are provided `endTime` must be greater
 *       than `startTime`. Timed captions are burned into exported videos.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Welcome back, travellers!
 *               startTime:
 *                 type: number
 *                 minimum: 0
 *                 description: Start time in seconds.
 *                 example: 0
 *               endTime:
 *                 type: number
 *                 minimum: 0
 *                 description: End time in seconds (must be > startTime).
 *                 example: 3.5
 *     responses:
 *       201:
 *         description: Caption created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     caption: { $ref: '#/components/schemas/Caption' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Validation failed (including endTime <= startTime).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example:
 *               success: false
 *               statusCode: 422
 *               message: endTime must be greater than startTime.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:projectId/captions',
  [...projectIdPath, ...createCaptionRules],
  validate,
  asyncHandler(captionController.create)
);

/**
 * @openapi
 * /api/projects/{projectId}/captions:
 *   get:
 *     tags: [Captions]
 *     summary: List captions of a project
 *     description: Returns captions ordered by `startTime` (untimed captions last).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Captions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     captions:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Caption' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:projectId/captions',
  projectIdPath,
  validate,
  asyncHandler(captionController.list)
);

/**
 * @openapi
 * /api/projects/{projectId}/captions/{captionId}:
 *   patch:
 *     tags: [Captions]
 *     summary: Update a caption
 *     description: Partially updates a caption. Only provided fields change. When both resulting times are set, `endTime` must be greater than `startTime`.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/CaptionIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 2000
 *               startTime:
 *                 type: number
 *                 minimum: 0
 *               endTime:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Updated caption.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     caption: { $ref: '#/components/schemas/Caption' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
  '/:projectId/captions/:captionId',
  [...projectIdPath, ...updateCaptionRules],
  validate,
  asyncHandler(captionController.update)
);

/**
 * @openapi
 * /api/projects/{projectId}/captions/{captionId}:
 *   delete:
 *     tags: [Captions]
 *     summary: Delete a caption
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/CaptionIdParam'
 *     responses:
 *       200:
 *         description: Caption deleted.
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
router.delete(
  '/:projectId/captions/:captionId',
  [...projectIdPath, ...captionIdPath],
  validate,
  asyncHandler(captionController.remove)
);

export default router;
