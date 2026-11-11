import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { uploadsRoot } from './storage.js';
import { AppError } from './AppError.js';

export function imageExtension(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  throw new AppError(422, 'Avatar must be a JPEG, PNG or WebP image.');
}

export async function saveAvatar(file) {
  const extension = imageExtension(file.buffer);
  const directory = path.join(uploadsRoot, 'avatars');
  await fs.mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await fs.writeFile(path.join(directory, filename), file.buffer, { flag: 'wx' });
  return `/uploads/avatars/${filename}`;
}

export async function removeAvatar(url) {
  if (!url || !/^\/uploads\/avatars\/[a-f0-9-]+\.(jpg|png|webp)$/.test(url)) return;
  await fs.unlink(path.join(uploadsRoot, 'avatars', path.basename(url))).catch(error => {
    if (error.code !== 'ENOENT') console.error('[avatar] Failed to remove old image:', error.code);
  });
}
