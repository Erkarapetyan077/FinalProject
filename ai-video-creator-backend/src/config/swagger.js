import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 5000;

/**
 * OpenAPI 3.0.3 specification.
 * - Reusable schemas live here (User, Project, Video, Voiceover, Caption,
 *   Export, ErrorResponse, pagination meta).
 * - Endpoint definitions are annotated inline in src/routes/*.js with
 *   `@openapi` JSDoc blocks and merged by swagger-jsdoc.
 * - Served at GET /api-docs (Swagger UI) and GET /api-docs.json (raw JSON).
 */
const definition = {
  openapi: '3.0.3',
  info: {
    title: 'AI Video Creator API',
    version: '1.0.0',
    description:
      'REST API for an AI video creation platform. Users register, create projects, search Pexels stock videos, write voiceover text (optional ElevenLabs audio generation), add captions and export videos with FFmpeg. ' +
      'All authenticated endpoints expect a JWT Bearer token in the Authorization header. ' +
      'All responses are JSON: success responses use `{ "success": true, "data": ... }`, errors use `{ "success": false, "statusCode", "message", "errors"? }`.',
    contact: { name: 'API Support', url: 'https://localhost:5000' },
    license: { name: 'MIT' },
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'User registration, login and profile' },
    { name: 'Projects', description: 'Video projects owned by the authenticated user' },
    { name: 'Videos', description: 'Pexels stock video search and project video attachments' },
    { name: 'Voiceovers', description: 'Voiceover text and optional audio generation' },
    { name: 'Captions', description: 'Caption lines with optional timings' },
    { name: 'Exports', description: 'FFmpeg video exports and status polling' },
    { name: 'System', description: 'Health and service metadata' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Paste the JWT returned by POST /api/auth/login or /api/auth/register. Example header: `Authorization: Bearer <token>`.',
      },
    },
    parameters: {
      ProjectIdParam: {
        name: 'projectId',
        in: 'path',
        required: true,
        description: 'UUID of the project (must belong to the authenticated user).',
        schema: { type: 'string', format: 'uuid' },
        example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      },
      VideoIdParam: {
        name: 'videoId',
        in: 'path',
        required: true,
        description: 'UUID of the attached video.',
        schema: { type: 'string', format: 'uuid' },
      },
      VoiceoverIdParam: {
        name: 'voiceoverId',
        in: 'path',
        required: true,
        description: 'UUID of the voiceover.',
        schema: { type: 'string', format: 'uuid' },
      },
      CaptionIdParam: {
        name: 'captionId',
        in: 'path',
        required: true,
        description: 'UUID of the caption.',
        schema: { type: 'string', format: 'uuid' },
      },
      ExportIdParam: {
        name: 'exportId',
        in: 'path',
        required: true,
        description: 'UUID of the export.',
        schema: { type: 'string', format: 'uuid' },
      },
      PageParam: {
        name: 'page',
        in: 'query',
        required: false,
        description: 'Page number (1-based).',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'Items per page (max 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
      SearchQueryParam: {
        name: 'query',
        in: 'query',
        required: true,
        description: 'Free-text topic to search for, e.g. "nature" or "city at night".',
        schema: { type: 'string', maxLength: 120 },
        example: 'nature',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'A useful error message' },
          errors: {
            type: 'array',
            description: 'Optional field-level validation details.',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Email must be a valid email address.' },
              },
            },
          },
        },
        required: ['success', 'statusCode', 'message'],
      },
      User: {
        type: 'object',
        description: 'User profile. Password hashes are never returned.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          avatarUrl: { type: 'string', nullable: true, example: '/uploads/avatars/550e8400-e29b-41d4-a716-446655440000.png' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T10:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-01-15T10:30:00.000Z' },
        },
      },
      AuthData: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: {
            type: 'string',
            description: 'JWT. Send it as `Authorization: Bearer <token>` on every authenticated request.',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid', description: 'Owner of the project.' },
          title: { type: 'string', example: 'Travel montage' },
          topic: { type: 'string', nullable: true, example: 'nature' },
          scriptText: { type: 'string', nullable: true, example: 'Ten places you must visit...' },
          status: {
            type: 'string',
            enum: ['draft', 'processing', 'completed', 'failed'],
            example: 'draft',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Video: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          provider: { type: 'string', example: 'pexels' },
          externalVideoId: { type: 'string', nullable: true, example: '3571264' },
          videoUrl: { type: 'string', format: 'uri', example: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4' },
          thumbnailUrl: { type: 'string', format: 'uri', nullable: true },
          duration: { type: 'integer', nullable: true, description: 'Duration in seconds.' },
          width: { type: 'integer', nullable: true },
          height: { type: 'integer', nullable: true },
          selected: { type: 'boolean', description: 'Whether the video is included in exports.' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Voiceover: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          text: { type: 'string', example: 'Welcome to the ultimate travel guide.' },
          provider: { type: 'string', nullable: true, example: 'elevenlabs' },
          audioUrl: { type: 'string', nullable: true, example: '/uploads/voiceovers/1c6f5a54-7e05-4f5f-9d16-3f0b1a2c4d5e.mp3' },
          status: {
            type: 'string',
            enum: ['draft', 'generating', 'ready', 'failed'],
            example: 'draft',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Caption: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          text: { type: 'string', example: 'Welcome back, travellers!' },
          startTime: { type: 'number', nullable: true, description: 'Start time in seconds.' },
          endTime: { type: 'number', nullable: true, description: 'End time in seconds (must be greater than startTime).' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Export: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          outputUrl: { type: 'string', nullable: true, description: 'Public path of the rendered MP4 once status is completed.', example: '/uploads/exports/8d1f...c3.mp4' },
          status: {
            type: 'string',
            enum: ['queued', 'processing', 'completed', 'failed'],
            example: 'queued',
          },
          errorMessage: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      HealthData: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          uptime: { type: 'number', example: 123.45 },
          timestamp: { type: 'string', format: 'date-time' },
          database: { type: 'string', example: 'connected' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing, malformed or expired Bearer token.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              statusCode: 401,
              message:
                'Authentication required. Send a Bearer token in the Authorization header.',
            },
          },
        },
      },
      ValidationError: {
        description: 'Request validation failed. Inspect the `errors` array.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              statusCode: 422,
              message: 'Validation failed. Please check the errors field for details.',
              errors: [{ field: 'email', message: 'Email must be a valid email address.' }],
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found (or it belongs to another user).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, statusCode: 404, message: 'Project not found, or it does not belong to you.' },
          },
        },
      },
      Conflict: {
        description: 'Conflict with existing data.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      ServerError: {
        description: 'Unexpected server error. No internals are leaked.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, statusCode: 500, message: 'Internal server error. Please try again later.' },
          },
        },
      },
    },
  },
  security: [],
  paths: {},
};

const spec = swaggerJsdoc({
  definition,
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
});

export default spec;
export { spec as openapiSpec };
