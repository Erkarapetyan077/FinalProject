import * as exportService from '../services/export.service.js';

export async function create(req, res) {
  const exportJob = await exportService.createExport(req.user.id, req.params.projectId);
  res.status(201).json({
    success: true,
    data: {
      export: exportJob,
      hint: 'Poll GET /api/projects/:projectId/exports/:exportId until status is completed or failed.',
    },
  });
}

export async function list(req, res) {
  const exportsList = await exportService.listProjectExports(
    req.user.id,
    req.params.projectId
  );
  res.status(200).json({ success: true, data: { exports: exportsList } });
}

export async function getById(req, res) {
  const exportJob = await exportService.getProjectExport(
    req.user.id,
    req.params.projectId,
    req.params.exportId
  );
  res.status(200).json({ success: true, data: { export: exportJob } });
}
