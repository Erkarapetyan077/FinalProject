import { Router } from 'express';
import { sequelize } from '../config/database.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import { searchRouter, projectVideoRouter } from './video.routes.js';
import voiceoverRoutes from './voiceover.routes.js';
import captionRoutes from './caption.routes.js';
import exportRoutes from './export.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/videos', searchRouter);
// Sub-routers define the full /:projectId/... route paths themselves so that
// path parameters are matched by the route layer (reliable in Express 4).
router.use('/projects', projectRoutes);
router.use('/projects', projectVideoRouter);
router.use('/projects', voiceoverRoutes);
router.use('/projects', captionRoutes);
router.use('/projects', exportRoutes);

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Reports service uptime and database connectivity. Useful for uptime monitors and Docker health checks.
 *     responses:
 *       200:
 *         description: Service is up.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/HealthData' }
 */
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    let database = 'disconnected';
    try {
      await sequelize.authenticate();
      database = 'connected';
    } catch {
      database = 'disconnected';
    }
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database,
      },
    });
  })
);

export default router;
