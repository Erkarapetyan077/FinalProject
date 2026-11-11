import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../validators/validate.js';
import {
  searchVideosRules,
  projectIdPath,
  videoIdPath,
  attachVideoRules,
} from '../validators/video.validators.js';
import * as videoController from '../controllers/video.controller.js';

/**
 * Search endpoint - mounted at /api/videos/search (see routes/index.js).
 */
const searchRouter = Router();
searchRouter.use(authenticate);

/**
 * @openapi
 * /api/videos/search:
 *   get:
 *     tags: [Videos]
 *     summary: Search stock videos by topic (Pexels)
 *     description: |
 *       Proxies a topic search to the Pexels API from the backend, so
 *       `PEXELS_API_KEY` is never exposed to the frontend.
 *       When `PEXELS_API_KEY` is not configured the endpoint responds 200 with
 *       clearly-flagged development mock data (`mock: true` + `message`),
 *       so the frontend can be built before obtaining a key.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - $ref: '#/components/parameters/PageParam'
 *     responses:
 *       200:
 *         description: Search results (real Pexels data or flagged mock data).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider: { type: 'string', example: 'pexels' }
 *                     mock: { type: 'boolean', example: false, description: 'true when development mock data is returned because PEXELS_API_KEY is missing.' }
 *                     message: { type: 'string', nullable: true }
 *                     query: { type: 'string', example: 'nature' }
 *                     page: { type: 'integer', example: 1 }
 *                     total: { type: 'integer', nullable: true }
 *                     nextPage: { type: 'string', nullable: true }
 *                     videos:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Video' }
 *             example:
 *               success: true
 *               data:
 *                 provider: pexels
 *                 mock: false
 *                 query: nature
 *                 page: 1
 *                 videos:
 *                   - provider: pexels
 *                     externalVideoId: '3571264'
 *                     videoUrl: https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4
 *                     thumbnailUrl: https://images.pexels.com/videos/3571264/free-video-3571264.jpg
 *                     duration: 27
 *                     width: 1920
 *                     height: 1080
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       502:
 *         description: Pexels request failed.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
searchRouter.get(
  '/search',
  searchVideosRules,
  validate,
  asyncHandler(videoController.search)
);

/**
 * Project-scoped video routes.
 * Routes include the :projectId segment so the path parameter is matched by
 * the route layer itself and available in req.params (Express 4 guarantee).
 * Mounted under /api/projects (see routes/index.js).
 */
const projectVideoRouter = Router();
projectVideoRouter.use(authenticate);

/**
 * @openapi
 * /api/projects/{projectId}/videos:
 *   post:
 *     tags: [Videos]
 *     summary: Attach a stock video to a project
 *     description: |
 *       Stores a selected video (usually one returned by GET /api/videos/search)
 *       on the project. Attached videos are `selected: true` by default, which
 *       means they are included in FFmpeg exports.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [videoUrl]
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               provider:
 *                 type: string
 *                 example: pexels
 *               externalVideoId:
 *                 type: string
 *                 example: '3571264'
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds.
 *                 example: 27
 *               width:
 *                 type: integer
 *                 example: 1920
 *               height:
 *                 type: integer
 *                 example: 1080
 *               selected:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Video attached.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     video: { $ref: '#/components/schemas/Video' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
projectVideoRouter.post(
  '/:projectId/videos',
  projectIdPath,
  attachVideoRules,
  validate,
  asyncHandler(videoController.attach)
);

/**
 * @openapi
 * /api/projects/{projectId}/videos:
 *   get:
 *     tags: [Videos]
 *     summary: List videos attached to a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Project videos, newest first.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Video' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
projectVideoRouter.get(
  '/:projectId/videos',
  projectIdPath,
  validate,
  asyncHandler(videoController.list)
);

/**
 * @openapi
 * /api/projects/{projectId}/videos/{videoId}:
 *   delete:
 *     tags: [Videos]
 *     summary: Remove a video from a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/VideoIdParam'
 *     responses:
 *       200:
 *         description: Video removed.
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
projectVideoRouter.delete(
  '/:projectId/videos/:videoId',
  [...projectIdPath, ...videoIdPath],
  validate,
  asyncHandler(videoController.remove)
);

const router = { searchRouter, projectVideoRouter };
export default router;
export { searchRouter, projectVideoRouter };
