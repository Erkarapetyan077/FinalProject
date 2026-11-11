import * as authService from '../services/auth.service.js';

export async function register(req, res) {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: { user, token } });
}

export async function login(req, res) {
  const { user, token } = await authService.loginUser(req.body);
  res.status(200).json({ success: true, data: { user, token } });
}

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json({ success: true, data: { user } });
}

export async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: { user } });
}

export async function changePassword(req, res) {
  await authService.changePassword(req.user.id, req.body);
  res.json({ success: true, data: { message: 'Password changed successfully.' } });
}

export async function uploadAvatar(req, res) {
  const user = await authService.updateAvatar(req.user.id, req.file);
  res.json({ success: true, data: { user } });
}

export async function deleteAvatar(req, res) {
  const user = await authService.updateAvatar(req.user.id, null);
  res.json({ success: true, data: { user } });
}
