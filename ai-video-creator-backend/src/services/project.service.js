import { Project } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Valid `include` aliases for GET /api/projects/:id?include=...
 * Mirrors the association aliases defined in models/index.js.
 */
const INCLUDE_ALIASES = ['videos', 'voiceovers', 'captions', 'exports'];

export function parseIncludes(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter((part) => INCLUDE_ALIASES.includes(part));
}

function paginationMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/**
 * Load a project owned by `userId` or throw 404.
 * The same 404 is returned for "missing" and "owned by someone else"
 * so the API does not leak the existence of other users' projects.
 */
export async function findOwnedProject(projectId, userId) {
  const project = await Project.findOne({
    where: { id: projectId, userId },
  });
  if (!project) {
    throw new AppError(404, ERROR_MESSAGES.PROJECT_NOT_FOUND);
  }
  return project;
}

export async function createProject(userId, data) {
  return Project.create({
    userId,
    title: data.title,
    topic: data.topic ?? null,
    scriptText: data.scriptText ?? null,
    status: 'draft',
  });
}

export async function listProjects(userId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Project.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });
  return {
    items: rows,
    pagination: paginationMeta({ page, limit, total: count }),
  };
}

export async function getProject(projectId, userId, includes = []) {
  await findOwnedProject(projectId, userId);
  return Project.findByPk(projectId, {
    include: includes.map((association) => ({ association })),
  });
}

const UPDATABLE_FIELDS = ['title', 'topic', 'scriptText', 'status'];

export async function updateProject(projectId, userId, patch) {
  const project = await findOwnedProject(projectId, userId);
  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (patch[field] !== undefined) {
      changes[field] = patch[field];
    }
  }
  await project.update(changes);
  return project.reload();
}

export async function deleteProject(projectId, userId) {
  const project = await findOwnedProject(projectId, userId);
  await project.destroy();
  return { id: projectId };
}
