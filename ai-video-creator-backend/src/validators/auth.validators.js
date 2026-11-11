import { body } from 'express-validator';

export const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters.'),
];

export const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Email must be a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const updateProfileRules = [
  body('name').isString().withMessage('Name must be a string.').bail()
    .trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
];

export const changePasswordRules = [
  body('currentPassword').isString().bail().notEmpty().withMessage('Current password is required.'),
  body('newPassword').isString().bail().isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters.')
    .custom(value => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('New password must not exceed 72 UTF-8 bytes.'),
];
