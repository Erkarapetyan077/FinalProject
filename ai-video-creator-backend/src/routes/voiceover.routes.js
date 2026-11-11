import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../validators/validate.js';
import {
  projectIdPath,
  voiceoverIdPath,
  createVoiceoverRules,
} from '../validators/voiceover.validators.js';
import * as voiceoverController from '../controllers/voiceover.controller.js';

/**
 * Voiceover routes. Route paths include :projectId so the path parameter is
 * matched by the route layer itself (mounted under /api/projects).
 */
const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /api/projects/{projectId}/voiceovers:
 *   post:
 *     tags: [Voiceovers]
 *     summary: Create a voiceover (text only)
 *     description: |
 *       Saves voiceover text for a project. This works WITHOUT any ElevenLabs
 *       configuration - the text is stored with status `draft` and can be
 *       generated into audio later.
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
 *                 maxLength: 5000
 *                 example: Welcome to the ultimate travel guide. Today we explore ten hidden gems.
 *     responses:
 *       201:
 *         description: Voiceover saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     voiceover: { $ref: '#/components/schemas/Voiceover' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:projectId/voiceovers',
  projectIdPath,
  createVoiceoverRules,
  validate,
  asyncHandler(voiceoverController.create)
);

/**
 * @openapi
 * /api/projects/{projectId}/voiceovers:
 *   get:
 *     tags: [Voiceovers]
 *     summary: List voiceovers of a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Voiceovers, newest first.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     voiceovers:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Voiceover' }
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
  '/:projectId/voiceovers',
  projectIdPath,
  validate,
  asyncHandler(voiceoverController.list)
);

/**
 * @openapi
 * /api/projects/{projectId}/voiceovers/{voiceoverId}/generate:
 *   post:
 *     tags: [Voiceovers]
 *     summary: Generate voiceover audio (ElevenLabs, optional)
 *     description: |
 *       Converts the stored voiceover text into MP3 audio using ElevenLabs.
 *       - Without `ELEVENLABS_API_KEY` configured the endpoint fails gracefully:
 *         503 with clear setup guidance, and the stored text stays untouched.
 *       - With a key: stores the MP3 under `/uploads/voiceovers`, returns the
 *         updated voiceover with `status: ready` and a public `audioUrl`.
 *       On provider failure the voiceover is marked `status: failed`.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/VoiceoverIdParam'
 *     responses:
 *       200:
 *         description: Audio generated; voiceover updated with audioUrl.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     voiceover: { $ref: '#/components/schemas/Voiceover' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       502:
 *         description: The ElevenLabs request failed.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       503:
 *         description: Voiceover generation is not configured on this server.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example:
 *               success: false
 *               statusCode: 503
 *               message: Voiceover audio generation is not configured on this server. Set ELEVENLABS_API_KEY (and optionally ELEVENLABS_VOICE_ID) in .env and restart the server.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:projectId/voiceovers/:voiceoverId/generate',
  [...projectIdPath, ...voiceoverIdPath],
  validate,
  asyncHandler(voiceoverController.generate)
);

/**
 * @openapi
 * /api/projects/{projectId}/voiceovers/{voiceoverId}:
 *   delete:
 *     tags: [Voiceovers]
 *     summary: Delete a voiceover
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/VoiceoverIdParam'
 *     responses:
 *       200:
 *         description: Voiceover deleted.
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
  '/:projectId/voiceovers/:voiceoverId',
  [...projectIdPath, ...voiceoverIdPath],
  validate,
  asyncHandler(voiceoverController.remove)
);

export default router;
