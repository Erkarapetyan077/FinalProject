import { body, param, query } from 'express-validator';

/** GET /api/videos/search */
export const searchVideosRules = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('query is required, e.g. ?query=nature.')
    .isLength({ max: 120 })
    .withMessage('query must not exceed 120 characters.'),
  query('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('page must be an integer >= 1.')
    .toInt(),
];

export const projectIdPath = [
  param('projectId').isUUID().withMessage('Project id must be a valid UUID.'),
];

export const videoIdPath = [
  param('videoId').isUUID().withMessage('Video id must be a valid UUID.'),
];

/** POST /api/projects/:projectId/videos - attach a stock video to a project */
export const attachVideoRules = [
  body('videoUrl')
    .trim()
    .notEmpty()
    .withMessage('videoUrl is required.')
    .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
    .withMessage('videoUrl must be a valid http(s) URL.'),
  body('thumbnailUrl')
    .optional({ values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
    .withMessage('thumbnailUrl must be a valid http(s) URL.'),
  body('provider')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 40 })
    .withMessage('provider must not exceed 40 characters.'),
  body('externalVideoId')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 120 })
    .withMessage('externalVideoId must not exceed 120 characters.'),
  body('duration')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('duration must be a non-negative integer (seconds).')
    .toInt(),
  body('width')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('width must be a non-negative integer (pixels).')
    .toInt(),
  body('height')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('height must be a non-negative integer (pixels).')
    .toInt(),
  body('selected')
    .optional({ values: 'falsy' })
    .isBoolean()
    .withMessage('selected must be a boolean.')
    .toBoolean(),
];
