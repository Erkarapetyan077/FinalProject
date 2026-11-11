import { param } from 'express-validator';

export const projectIdPath = [
  param('projectId').isUUID().withMessage('Project id must be a valid UUID.'),
];

export const exportIdPath = [
  param('exportId').isUUID().withMessage('Export id must be a valid UUID.'),
];
