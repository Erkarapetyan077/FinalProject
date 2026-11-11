import { Caption } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { findOwnedProject } from './project.service.js';

function assertTimeRange(startTime, endTime) {
  if (
    startTime !== null && startTime !== undefined &&
    endTime !== null && endTime !== undefined &&
    Number(endTime) <= Number(startTime)
  ) {
    throw new AppError(422, ERROR_MESSAGES.CAPTION_TIME_RANGE_INVALID);
  }
}

export async function createCaption(userId, projectId, data) {
  await findOwnedProject(projectId, userId);
  assertTimeRange(data.startTime, data.endTime);
  return Caption.create({
    projectId,
    text: data.text,
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
  });
}

export async function listProjectCaptions(userId, projectId) {
  await findOwnedProject(projectId, userId);
  return Caption.findAll({
    where: { projectId },
    order: [['startTime', 'ASC'], ['createdAt', 'ASC']],
  });
}

async function findOwnedCaption(projectId, captionId) {
  const caption = await Caption.findOne({ where: { id: captionId, projectId } });
  if (!caption) {
    throw new AppError(404, ERROR_MESSAGES.CAPTION_NOT_FOUND);
  }
  return caption;
}

export async function updateCaption(userId, projectId, captionId, patch) {
  await findOwnedProject(projectId, userId);
  const caption = await findOwnedCaption(projectId, captionId);

  const nextStart = patch.startTime !== undefined ? patch.startTime : caption.startTime;
  const nextEnd = patch.endTime !== undefined ? patch.endTime : caption.endTime;
  assertTimeRange(nextStart, nextEnd);

  const changes = {};
  for (const field of ['text', 'startTime', 'endTime']) {
    if (patch[field] !== undefined) {
      changes[field] = patch[field];
    }
  }
  await caption.update(changes);
  return caption.reload();
}

export async function deleteCaption(userId, projectId, captionId) {
  await findOwnedProject(projectId, userId);
  const caption = await findOwnedCaption(projectId, captionId);
  await caption.destroy();
  return { id: captionId };
}
