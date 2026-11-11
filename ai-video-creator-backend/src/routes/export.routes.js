import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../validators/validate.js';
import { projectIdPath, exportIdPath } from '../validators/export.validators.js';
import * as exportController from '../controllers/export.controller.js';

/**
 * Export routes. Route paths include :projectId so the path parameter is
 * matched by the route layer itself (mounted under /api/projects).
 */
const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /api/projects/{projectId}/exports:
 *   post:
 *     tags: [Exports]
 *     summary: Request a video export (FFmpeg)
 *     description: |
 *       Creates an export job and starts background FFmpeg processing:
 *       downloads the project's selected videos, concatenates them into a
 *       1280x720 MP4, mixes the latest `ready` voiceover audio (if any) and
 *       burns timed captions (if any).
 *       - If FFmpeg is not installed the endpoint fails fast with 503 and
 *         explains exactly what must be installed/configured.
 *       - An export is only marked `completed` after the output file was
 *         verified to exist on disk.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       201:
 *         description: Export job created (status `queued`/`processing`). Poll the status endpoint.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     export: { $ref: '#/components/schemas/Export' }
 *                     hint: { type: 'string' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       503:
 *         description: FFmpeg is not available on the server.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example:
 *               success: false
 *               statusCode: 503
 *               message: FFmpeg is not available on the server, so video export is disabled. Install FFmpeg (for example "sudo apt install ffmpeg" on Debian/Ubuntu or "brew install ffmpeg" on macOS) and restart the server.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:projectId/exports',
  projectIdPath,
  validate,
  asyncHandler(exportController.create)
);

/**
 * @openapi
 * /api/projects/{projectId}/exports:
 *   get:
 *     tags: [Exports]
 *     summary: List export jobs of a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Export jobs, newest first.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     exports:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Export' }
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
  '/:projectId/exports',
  projectIdPath,
  validate,
  asyncHandler(exportController.list)
);

/**
 * @openapi
 * /api/projects/{projectId}/exports/{exportId}:
 *   get:
 *     tags: [Exports]
 *     summary: Get export status / output URL
 *     description: |
 *       Poll this endpoint until `status` is `completed` or `failed`.
 *       When `completed`, `outputUrl` contains the public path of the rendered
 *       MP4 (prefix it with the server origin, e.g.
 *       `http://localhost:5000/uploads/exports/<id>.mp4`).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/ExportIdParam'
 *     responses:
 *       200:
 *         description: Export job status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     export: { $ref: '#/components/schemas/Export' }
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
  '/:projectId/exports/:exportId',
  [...projectIdPath, ...exportIdPath],
  validate,
  asyncHandler(exportController.getById)
);

export default router;
