import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
}).single('avatar');

export function avatarUpload(req, res, next) {
  upload(req, res, error => {
    if (error) {
      if (error instanceof multer.MulterError) {
        return next(new AppError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 422,
          error.code === 'LIMIT_FILE_SIZE' ? 'Avatar must not exceed 5 MB.' : 'Upload exactly one image using the avatar field.'));
      }
      return next(new AppError(400, 'Invalid multipart upload.'));
    }
    if (!req.file) return next(new AppError(422, 'Avatar image is required in the avatar field.'));
    next();
  });
}
