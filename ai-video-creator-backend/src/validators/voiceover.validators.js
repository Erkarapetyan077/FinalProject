import { body, param } from 'express-validator';

export const projectIdPath = [
  param('projectId').isUUID().withMessage('Project id must be a valid UUID.'),
];

export const voiceoverIdPath = [
  param('voiceoverId').isUUID().withMessage('Voiceover id must be a valid UUID.'),
];

export const createVoiceoverRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('text is required.')
    .isLength({ max: 5000 })
    .withMessage('text must not exceed 5000 characters.'),
];
