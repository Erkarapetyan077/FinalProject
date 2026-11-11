import * as videoService from '../services/video.service.js';

/** GET /api/videos/search?query=nature&page=1 */
export async function search(req, res) {
  const result = await videoService.searchStockVideos({
    query: req.query.query,
    page: req.query.page || 1,
  });
  res.status(200).json({ success: true, data: result });
}

/** POST /api/projects/:projectId/videos */
export async function attach(req, res) {
  const video = await videoService.addVideoToProject(
    req.user.id,
    req.params.projectId,
    req.body
  );
  res.status(201).json({ success: true, data: { video } });
}

/** GET /api/projects/:projectId/videos */
export async function list(req, res) {
  const videos = await videoService.listProjectVideos(req.user.id, req.params.projectId);
  res.status(200).json({ success: true, data: { videos } });
}

/** DELETE /api/projects/:projectId/videos/:videoId */
export async function remove(req, res) {
  const deleted = await videoService.deleteProjectVideo(
    req.user.id,
    req.params.projectId,
    req.params.videoId
  );
  res.status(200).json({ success: true, data: deleted });
}
