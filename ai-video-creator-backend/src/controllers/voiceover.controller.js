import * as voiceoverService from '../services/voiceover.service.js';

export async function create(req, res) {
  const voiceover = await voiceoverService.createVoiceover(
    req.user.id,
    req.params.projectId,
    req.body
  );
  res.status(201).json({ success: true, data: { voiceover } });
}

export async function list(req, res) {
  const voiceovers = await voiceoverService.listProjectVoiceovers(
    req.user.id,
    req.params.projectId
  );
  res.status(200).json({ success: true, data: { voiceovers } });
}

export async function generate(req, res) {
  const voiceover = await voiceoverService.generateVoiceoverAudio(
    req.user.id,
    req.params.projectId,
    req.params.voiceoverId
  );
  res.status(200).json({ success: true, data: { voiceover } });
}

export async function remove(req, res) {
  const deleted = await voiceoverService.deleteProjectVoiceover(
    req.user.id,
    req.params.projectId,
    req.params.voiceoverId
  );
  res.status(200).json({ success: true, data: deleted });
}
