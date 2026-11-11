import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Voiceover } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { findOwnedProject } from './project.service.js';
import { voiceoversDir, ensureUploadDirs } from '../utils/storage.js';

export async function createVoiceover(userId, projectId, { text }) {
  await findOwnedProject(projectId, userId);
  return Voiceover.create({ projectId, text, status: 'draft', provider: null });
}

export async function listProjectVoiceovers(userId, projectId) {
  await findOwnedProject(projectId, userId);
  return Voiceover.findAll({
    where: { projectId },
    order: [['createdAt', 'DESC']],
  });
}

async function findOwnedVoiceover(projectId, voiceoverId) {
  const voiceover = await Voiceover.findOne({
    where: { id: voiceoverId, projectId },
  });
  if (!voiceover) {
    throw new AppError(404, ERROR_MESSAGES.VOICEOVER_NOT_FOUND);
  }
  return voiceover;
}

/**
 * Generate voiceover audio with ElevenLabs.
 *
 * - Without ELEVENLABS_API_KEY this fails gracefully: 503 with clear setup
 *   guidance, and the stored voiceover text is left untouched.
 * - With a key, the MP3 is stored under UPLOAD_DIR/voiceovers and the row
 *   becomes `status: ready` with a public `audioUrl`.
 */
export async function generateVoiceoverAudio(userId, projectId, voiceoverId) {
  await findOwnedProject(projectId, userId);
  const voiceover = await findOwnedVoiceover(projectId, voiceoverId);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // Graceful degradation - do not corrupt the stored text, just explain.
    throw new AppError(503, ERROR_MESSAGES.VOICEOVER_NOT_CONFIGURED);
  }

  await voiceover.update({ status: 'generating' });

  try {
    const voiceId =
      process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // "Rachel"

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: voiceover.text,
          model_id: 'eleven_multilingual_v2',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`provider responded with HTTP ${response.status}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    ensureUploadDirs();
    const filename = `${randomUUID()}.mp3`;
    const filePath = path.join(voiceoversDir(), filename);
    fs.writeFileSync(filePath, audioBuffer);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      throw new Error(ERROR_MESSAGES.VOICEOVER_AUDIO_FILE_MISSING);
    }

    return voiceover.update({
      provider: 'elevenlabs',
      audioUrl: `/uploads/voiceovers/${filename}`,
      status: 'ready',
    });
  } catch (err) {
    await voiceover.update({ status: 'failed' }).catch(() => {});
    if (err instanceof AppError) throw err;
    throw new AppError(
      502,
      `${ERROR_MESSAGES.VOICEOVER_GENERATION_FAILED} (${err.message})`
    );
  }
}

export async function deleteProjectVoiceover(userId, projectId, voiceoverId) {
  await findOwnedProject(projectId, userId);
  const voiceover = await findOwnedVoiceover(projectId, voiceoverId);
  await voiceover.destroy();
  return { id: voiceoverId };
}
