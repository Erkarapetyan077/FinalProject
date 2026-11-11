import { body, param, query } from 'express-validator';

/** GET / PATCH / DELETE - :id must be a UUID */
export const projectIdParam = [
  param('id').isUUID().withMessage('Project id must be a valid UUID.'),
];

/** Project-scoped child routes - :projectId must be a UUID */
export const projectIdPath = [
  param('projectId').isUUID().withMessage('Project id must be a valid UUID.'),
];

export const paginationRules = [
  query('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('page must be an integer >= 1.')
    .toInt(),
  query('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100.')
    .toInt(),
];

export const createProjectRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 120 })
    .withMessage('Title must not exceed 120 characters.'),
  body('topic')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Topic must not exceed 200 characters.'),
  body('scriptText')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('scriptText must be a string.')
    .isLength({ max: 20000 })
    .withMessage('scriptText must not exceed 20000 characters.'),
];

export const updateProjectRules = [
  ...projectIdParam,
  body('title')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters.'),
  body('topic')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Topic must not exceed 200 characters.'),
  body('scriptText')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('scriptText must be a string.')
    .isLength({ max: 20000 })
    .withMessage('scriptText must not exceed 20000 characters.'),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(['draft', 'processing', 'completed', 'failed'])
    .withMessage('status must be one of: draft, processing, completed, failed.'),
];
