import { avatarUpload } from '../middleware/avatar.middleware.js';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../validators/validate.js';
import { registerRules, loginRules, updateProfileRules, changePasswordRules } from '../validators/auth.validators.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: |
 *       Creates a standard user account (privileges/roles are never user-assignable),
 *       hashes the password with bcrypt and returns the sanitized profile plus a JWT.
 *       The React frontend should store the token and send it as
 *       `Authorization: Bearer <token>` on every authenticated request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 80
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: Str0ngPass!42
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AuthData' }
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 6f1c1e60-1f5e-4b7f-9b39-8b8f0b1a2c4d
 *                   name: Jane Doe
 *                   email: jane@example.com
 *                   createdAt: 2026-01-15T10:30:00.000Z
 *                   updatedAt: 2026-01-15T10:30:00.000Z
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/register',
  registerRules,
  validate,
  asyncHandler(authController.register)
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     description: |
 *       Verifies the credentials and returns the user profile plus a fresh JWT.
 *       For security reasons the same generic message `Invalid email or password`
 *       is returned for unknown emails and wrong passwords (no account enumeration).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Str0ngPass!42
 *     responses:
 *       200:
 *         description: Logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AuthData' }
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example:
 *               success: false
 *               statusCode: 401
 *               message: Invalid email or password
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', loginRules, validate, asyncHandler(authController.login));

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current user profile
 *     description: Returns the profile of the user that owns the Bearer token. Password hashes are never returned.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/me', authenticate, asyncHandler(authController.me));

/**
 * @openapi
 * /api/auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Change the current user's name
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 80, example: Erik }
 *     responses:
 *       200:
 *         description: Updated public profile, including avatarUrl.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 * /api/auth/password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change password after verifying the current password
 *     description: Existing JWTs remain valid until their expiry. The new password has a maximum of 72 UTF-8 bytes (bcrypt limit).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password, minLength: 8, maxLength: 128 }
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             example: { success: true, data: { message: 'Password changed successfully.' } }
 *       400:
 *         description: Current password is incorrect.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 * /api/auth/avatar:
 *   post:
 *     tags: [Auth]
 *     summary: Upload or replace your profile image
 *     description: Upload one JPEG, PNG or WebP image (maximum 5 MB). Returns the updated user with a relative avatarUrl; prepend the backend origin to display it. The previous image is removed after a successful replacement.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Updated public user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Malformed multipart upload.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       413:
 *         description: Image exceeds 5 MB.
 *       422:
 *         description: Missing avatar, unexpected field, or unsupported image signature.
 *   delete:
 *     tags: [Auth]
 *     summary: Remove your profile image
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated public profile with avatarUrl set to null. Also succeeds if no avatar exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/me', authenticate, updateProfileRules, validate, asyncHandler(authController.updateProfile));
router.patch('/password', authenticate, changePasswordRules, validate, asyncHandler(authController.changePassword));
router.post('/avatar', authenticate, avatarUpload, asyncHandler(authController.uploadAvatar));
router.delete('/avatar', authenticate, asyncHandler(authController.deleteAvatar));

export default router;
