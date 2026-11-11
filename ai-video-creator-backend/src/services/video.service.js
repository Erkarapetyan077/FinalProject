import { Video } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { findOwnedProject } from './project.service.js';

const PEXELS_SEARCH_URL = 'https://api.pexels.com/videos/search';

/**
 * Deterministic mock results used when PEXELS_API_KEY is not configured.
 * Always returned with `mock: true` + a `message` so the frontend can tell
 * mock data from real Pexels data.
 */
function buildMockVideos(query, page) {
  const samples = [
    { id: 'mock-1', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 596, w: 1280, h: 720 },
    { id: 'mock-2', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 653, w: 1280, h: 720 },
    { id: 'mock-3', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 15, w: 1280, h: 720 },
    { id: 'mock-4', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: 15, w: 1280, h: 720 },
    { id: 'mock-5', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: 15, w: 1280, h: 720 },
    { id: 'mock-6', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 888, w: 1280, h: 720 },
  ];
  return samples.map((s, index) => ({
    provider: 'mock',
    externalVideoId: `${s.id}-p${page}`,
    videoUrl: s.url,
    thumbnailUrl: null,
    duration: s.duration,
    width: s.w,
    height: s.h,
    title: `Mock result ${index + 1} for "${query}" (page ${page})`,
  }));
}

/** Pick the best MP4 rendition: largest width not exceeding 1920. */
function pickVideoFile(videoFiles = []) {
  const mp4Files = videoFiles.filter((f) => f.file_type === 'video/mp4' && f.link);
  if (mp4Files.length === 0) return null;
  const sorted = [...mp4Files].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted.find((f) => (f.width || 0) <= 1920) || sorted[sorted.length - 1];
}

/**
 * Search stock videos by topic via the Pexels API (key stays on the server).
 * Without PEXELS_API_KEY, returns clearly-flagged development mock data so
 * the frontend can be built before a key is obtained.
 */
export async function searchStockVideos({ query, page = 1 }) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return {
      provider: 'mock',
      mock: true,
      message: ERROR_MESSAGES.PEXELS_MOCK_NOTICE,
      query,
      page,
      videos: buildMockVideos(query, page),
    };
  }

  const url = new URL(PEXELS_SEARCH_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', '15');

  let response;
  try {
    response = await fetch(url, { headers: { Authorization: apiKey } });
  } catch {
    throw new AppError(502, ERROR_MESSAGES.PEXELS_REQUEST_FAILED);
  }

  if (!response.ok) {
    throw new AppError(
      502,
      `${ERROR_MESSAGES.PEXELS_REQUEST_FAILED} (HTTP ${response.status})`
    );
  }

  const payload = await response.json();
  const videos = (payload.videos || []).map((item) => {
    const file = pickVideoFile(item.video_files);
    return {
      provider: 'pexels',
      externalVideoId: String(item.id),
      videoUrl: file ? file.link : null,
      thumbnailUrl: item.image || null,
      duration: item.duration ?? null,
      width: item.width ?? null,
      height: item.height ?? null,
      title: undefined,
    };
  });

  return {
    provider: 'pexels',
    mock: false,
    query,
    page,
    total: payload.total_results ?? null,
    nextPage: payload.next_page ?? null,
    videos,
  };
}

/** Attach (and select) a video to a project owned by `userId`. */
export async function addVideoToProject(userId, projectId, data) {
  await findOwnedProject(projectId, userId);
  return Video.create({
    projectId,
    provider: data.provider || 'pexels',
    externalVideoId: data.externalVideoId || null,
    videoUrl: data.videoUrl,
    thumbnailUrl: data.thumbnailUrl || null,
    duration: data.duration ?? null,
    width: data.width ?? null,
    height: data.height ?? null,
    selected: data.selected === undefined ? true : Boolean(data.selected),
  });
}

export async function listProjectVideos(userId, projectId) {
  await findOwnedProject(projectId, userId);
  const rows = await Video.findAll({
    where: { projectId },
    order: [['createdAt', 'DESC']],
  });
  return rows;
}

export async function deleteProjectVideo(userId, projectId, videoId) {
  await findOwnedProject(projectId, userId);
  const video = await Video.findOne({ where: { id: videoId, projectId } });
  if (!video) {
    throw new AppError(404, ERROR_MESSAGES.VIDEO_NOT_FOUND);
  }
  await video.destroy();
  return { id: videoId };
}
