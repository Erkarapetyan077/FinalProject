import { body, param } from 'express-validator';

export const projectIdPath = [
  param('projectId').isUUID().withMessage('Project id must be a valid UUID.'),
];

export const captionIdPath = [
  param('captionId').isUUID().withMessage('Caption id must be a valid UUID.'),
];

export const createCaptionRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('text is required.')
    .isLength({ max: 2000 })
    .withMessage('text must not exceed 2000 characters.'),
  body('startTime')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('startTime must be a non-negative number of seconds.')
    .toFloat(),
  body('endTime')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('endTime must be a non-negative number of seconds.')
    .toFloat(),
];

export const updateCaptionRules = [
  ...captionIdPath,
  body('text')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('text must be between 1 and 2000 characters.'),
  body('startTime')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('startTime must be a non-negative number of seconds.')
    .toFloat(),
  body('endTime')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('endTime must be a non-negative number of seconds.')
    .toFloat(),
];
