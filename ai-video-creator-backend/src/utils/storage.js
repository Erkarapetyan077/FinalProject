import path from 'node:path';
import fs from 'node:fs';

/**
 * Storage helpers for generated media (voiceover audio, exported videos).
 * Everything lives under UPLOAD_DIR (default: `uploads`) inside the project.
 * File names are always generated server-side from UUIDs - user input never
 * influences a file path.
 */
const projectRoot = process.cwd();

export const uploadsRoot = path.resolve(
  projectRoot,
  process.env.UPLOAD_DIR || 'uploads'
);

export const voiceoversDir = () => path.join(uploadsRoot, 'voiceovers');
export const exportsDir = () => path.join(uploadsRoot, 'exports');
export const tmpDir = () => path.join(uploadsRoot, 'tmp');

export function ensureUploadDirs() {
  for (const dir of [uploadsRoot, voiceoversDir(), exportsDir(), tmpDir()]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Public URL path for a file inside the uploads root. */
export function toPublicUploadPath(dir, filename) {
  const relative = path.relative(uploadsRoot, path.join(dir, filename));
  return `/uploads/${relative.split(path.sep).join('/')}`;
}
