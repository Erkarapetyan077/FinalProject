import * as projectService from '../services/project.service.js';

export async function create(req, res) {
  const project = await projectService.createProject(req.user.id, req.body);
  res.status(201).json({ success: true, data: { project } });
}

export async function list(req, res) {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const { items, pagination } = await projectService.listProjects(req.user.id, {
    page,
    limit,
  });
  res.status(200).json({ success: true, data: { items, pagination } });
}

export async function getById(req, res) {
  const includes = projectService.parseIncludes(req.query.include);
  const project = await projectService.getProject(req.params.id, req.user.id, includes);
  res.status(200).json({ success: true, data: { project } });
}

export async function update(req, res) {
  const project = await projectService.updateProject(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: { project } });
}

export async function remove(req, res) {
  const deleted = await projectService.deleteProject(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: deleted });
}
