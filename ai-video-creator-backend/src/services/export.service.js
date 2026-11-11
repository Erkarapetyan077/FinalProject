import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { Export, Video, Voiceover, Caption } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { findOwnedProject } from './project.service.js';
import { exportsDir, tmpDir, voiceoversDir, ensureUploadDirs } from '../utils/storage.js';

const MAX_DOWNLOAD_BYTES = 250 * 1024 * 1024; // 250 MB per source video

/** Check whether the FFmpeg binary is available on this machine. */
export function isFfmpegAvailable() {
  try {
    const result = spawnSync('ffmpeg', ['-version'], { timeout: 5000 });
    return result.status === 0 && !result.error;
  } catch {
    return false;
  }
}

/**
 * Run FFmpeg with an explicit argv array. User input NEVER reaches a shell -
 * all arguments are separate strings passed directly to the binary.
 */
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args]);
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    child.on('error', (err) => {
      reject(new Error(`FFmpeg could not be started: ${err.message}`));
    });
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(stderr.trim() || `FFmpeg exited with code ${code}`));
    });
  });
}

function assertHttpUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Stored video URL is not a valid absolute URL.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Blocked non-http(s) video URL: ${parsed.protocol}`);
  }
  return parsed.toString();
}

async function downloadToFile(url, destination) {
  const safeUrl = assertHttpUrl(url);
  const response = await fetch(safeUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download source video (HTTP ${response.status}).`);
  }
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_DOWNLOAD_BYTES) {
    throw new Error('Source video exceeds the 250 MB download limit.');
  }
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(destination));
  const actualSize = fs.existsSync(destination) ? fs.statSync(destination).size : 0;
  if (actualSize === 0) {
    throw new Error('Downloaded source video is empty.');
  }
  if (actualSize > MAX_DOWNLOAD_BYTES) {
    throw new Error('Source video exceeds the 250 MB download limit.');
  }
}

function secondsToSrtTime(totalSeconds) {
  const ms = Math.max(0, Math.round(totalSeconds * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const millis = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${millis}`;
}

/** Build an SRT subtitle file content from timed captions (ordered). */
function buildSrt(captions) {
  const timed = captions
    .filter((c) => c.startTime !== null && c.endTime !== null)
    .sort((a, b) => a.startTime - b.startTime);
  if (timed.length === 0) return null;
  return timed
    .map(
      (caption, index) =>
        `${index + 1}\n${secondsToSrtTime(caption.startTime)} --> ${secondsToSrtTime(
          caption.endTime
        )}\n${caption.text}\n`
    )
    .join('\n');
}

/** Escape a file path for use inside the FFmpeg subtitles filter. */
function escapeForSubtitlesFilter(filePath) {
  return filePath
    .replace(/\\/g, '/')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function cleanupFiles(...files) {
  for (const file of files) {
    fs.promises.unlink(file).catch(() => {});
  }
}

/**
 * Background FFmpeg pipeline:
 *   1. download selected project videos
 *   2. normalize + concat them into one 1280x720/30fps MP4
 *   3. mix the latest `ready` voiceover audio when present
 *   4. burn timed captions (SRT) when present
 *   5. mark `completed` ONLY after verifying the output file exists
 */
async function processExport(exportId, projectId) {
  const tmp = tmpDir();
  const tempFiles = [];
  try {
    ensureUploadDirs();
    await Export.update({ status: 'processing' }, { where: { id: exportId } });

    const selectedVideos = await Video.findAll({
      where: { projectId, selected: true },
      order: [['createdAt', 'ASC']],
    });
    const sourceVideos = selectedVideos.length
      ? selectedVideos
      : await Video.findAll({ where: { projectId }, order: [['createdAt', 'ASC']] });

    if (sourceVideos.length === 0) {
      throw new Error(
        'No videos are attached to this project. Add at least one video before exporting.'
      );
    }

    // 1. Download sources
    const parts = [];
    for (let i = 0; i < sourceVideos.length; i += 1) {
      const destination = path.join(tmp, `part-${exportId}-${i}.mp4`);
      tempFiles.push(destination);
      await downloadToFile(sourceVideos[i].videoUrl, destination);
      parts.push(destination);
    }

    // 2. Concat + normalize
    const listFile = path.join(tmp, `concat-${exportId}.txt`);
    tempFiles.push(listFile);
    fs.writeFileSync(
      listFile,
      parts.map((p) => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n')
    );
    const baseOutput = path.join(tmp, `base-${exportId}.mp4`);
    tempFiles.push(baseOutput);
    await runFfmpeg([
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      baseOutput,
    ]);
    let current = baseOutput;

    // 3. Mix voiceover audio when a ready one exists
    const voiceover = await Voiceover.findOne({
      where: { projectId, status: 'ready' },
      order: [['createdAt', 'DESC']],
    });
    if (voiceover && voiceover.audioUrl) {
      const audioPath = path.join(voiceoversDir(), path.basename(voiceover.audioUrl));
      if (fs.existsSync(audioPath)) {
        const mixedOutput = path.join(tmp, `mix-${exportId}.mp4`);
        tempFiles.push(mixedOutput);
        await runFfmpeg([
          '-i', current,
          '-i', audioPath,
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-shortest',
          mixedOutput,
        ]);
        current = mixedOutput;
      }
    }

    // 4. Burn captions when timed captions exist
    const captions = await Caption.findAll({ where: { projectId } });
    const srt = buildSrt(captions);
    const finalOutput = path.join(exportsDir(), `${exportId}.mp4`);

    if (srt) {
      const srtFile = path.join(tmp, `subs-${exportId}.srt`);
      tempFiles.push(srtFile);
      fs.writeFileSync(srtFile, srt);
      await runFfmpeg([
        '-i', current,
        '-vf', `subtitles=${escapeForSubtitlesFilter(srtFile)}`,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '23',
        '-c:a', 'copy',
        finalOutput,
      ]);
    } else {
      fs.copyFileSync(current, finalOutput);
    }

    // 5. Only mark completed when the file really exists and is non-empty
    if (!fs.existsSync(finalOutput) || fs.statSync(finalOutput).size === 0) {
      throw new Error('Export finished but the output file was not produced.');
    }

    await Export.update(
      { status: 'completed', outputUrl: `/uploads/exports/${exportId}.mp4`, errorMessage: null },
      { where: { id: exportId } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await Export.update(
      { status: 'failed', errorMessage: message.slice(0, 1000) },
      { where: { id: exportId } }
    ).catch(() => {});
  } finally {
    cleanupFiles(...tempFiles);
  }
}

/**
 * Create an export job for a project owned by `userId`.
 * Fails fast with 503 + setup guidance when FFmpeg is not installed,
 * and never claims success before the output file exists.
 */
export async function createExport(userId, projectId) {
  await findOwnedProject(projectId, userId);

  if (!isFfmpegAvailable()) {
    throw new AppError(503, ERROR_MESSAGES.FFMPEG_NOT_AVAILABLE);
  }

  const record = await Export.create({ projectId, status: 'queued' });

  // Fire-and-forget background processing; poll GET /exports/:id for status.
  processExport(record.id, projectId).catch(() => {});

  return record;
}

export async function listProjectExports(userId, projectId) {
  await findOwnedProject(projectId, userId);
  return Export.findAll({
    where: { projectId },
    order: [['createdAt', 'DESC']],
  });
}

export async function getProjectExport(userId, projectId, exportId) {
  await findOwnedProject(projectId, userId);
  const record = await Export.findOne({ where: { id: exportId, projectId } });
  if (!record) {
    throw new AppError(404, ERROR_MESSAGES.EXPORT_NOT_FOUND);
  }
  return record;
}
