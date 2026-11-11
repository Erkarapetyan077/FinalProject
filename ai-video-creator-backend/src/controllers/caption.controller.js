import * as captionService from '../services/caption.service.js';

export async function create(req, res) {
  const caption = await captionService.createCaption(
    req.user.id,
    req.params.projectId,
    req.body
  );
  res.status(201).json({ success: true, data: { caption } });
}

export async function list(req, res) {
  const captions = await captionService.listProjectCaptions(
    req.user.id,
    req.params.projectId
  );
  res.status(200).json({ success: true, data: { captions } });
}

export async function update(req, res) {
  const caption = await captionService.updateCaption(
    req.user.id,
    req.params.projectId,
    req.params.captionId,
    req.body
  );
  res.status(200).json({ success: true, data: { caption } });
}

export async function remove(req, res) {
  const deleted = await captionService.deleteCaption(
    req.user.id,
    req.params.projectId,
    req.params.captionId
  );
  res.status(200).json({ success: true, data: deleted });
}
