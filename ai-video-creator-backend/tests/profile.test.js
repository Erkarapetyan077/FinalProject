import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'profile-test-'));
process.env.UPLOAD_DIR = temporary;
process.env.JWT_SECRET = 'profile-test-only-secret';
const { User } = await import('../src/models/index.js');
const { createApp } = await import('../src/app.js');
const { generateToken } = await import('../src/utils/generateToken.js');
const spec = (await import('../src/config/swagger.js')).default;
const originalFind = User.findByPk;
const user = User.build({ id: '550e8400-e29b-41d4-a716-446655440000', name: 'Erik', email: 'test@example.com', password: 'original-password' });
await User.runHooks('beforeCreate', user);
user.update = async changes => {
  user.set(changes);
  await User.runHooks('beforeUpdate', user);
  user.changed('password', false);
  return user;
};
user.changed('password', false);
User.findByPk = async () => user;
const server = createApp().listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const token = generateToken(user.id);
async function request(url, method, body, authenticated = true) {
  const headers = authenticated ? { Authorization: `Bearer ${token}` } : {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return fetch(base + url, { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aE1sAAAAASUVORK5CYII=', 'base64');
function imageForm(bytes = png, name = 'avatar') {
  const form = new FormData();
  form.append(name, new Blob([bytes], { type: 'image/png' }), 'avatar.png');
  return form;
}
after(async () => {
  User.findByPk = originalFind;
  await new Promise(resolve => server.close(resolve));
  await fs.rm(temporary, { recursive: true, force: true });
});

test('profile settings API', async t => {
  await t.test('all changes require authentication', async () => {
    for (const [url, method] of [['/api/auth/me', 'PATCH'], ['/api/auth/password', 'PATCH'], ['/api/auth/avatar', 'POST'], ['/api/auth/avatar', 'DELETE']]) {
      assert.equal((await request(url, method, undefined, false)).status, 401);
    }
  });
  await t.test('name validation, allowlist and safe profile serialization', async () => {
    assert.equal((await request('/api/auth/me', 'PATCH', { name: ' ' })).status, 422);
    const response = await request('/api/auth/me', 'PATCH', { name: '  New Name  ', email: 'other@example.com', password: 'ignored-password' });
    assert.equal(response.status, 200);
    const result = (await response.json()).data.user;
    assert.equal(result.name, 'New Name');
    assert.equal(result.email, 'test@example.com');
    assert.equal('password' in result, false);
  });
  await t.test('password requires current password and hashes the replacement', async () => {
    assert.equal((await request('/api/auth/password', 'PATCH', { currentPassword: 'wrong', newPassword: 'replacement-password' })).status, 400);
    assert.equal((await request('/api/auth/password', 'PATCH', { currentPassword: 'original-password', newPassword: 'short' })).status, 422);
    assert.equal((await request('/api/auth/password', 'PATCH', { currentPassword: 'original-password', newPassword: 'ա'.repeat(40) })).status, 422);
    assert.equal((await request('/api/auth/password', 'PATCH', { currentPassword: 'original-password', newPassword: 'replacement-password' })).status, 200);
    assert.notEqual(user.password, 'replacement-password');
    assert.equal(await user.comparePassword('replacement-password'), true);
    assert.equal(await user.comparePassword('original-password'), false);
  });
  await t.test('avatar validation and limits', async () => {
    assert.equal((await request('/api/auth/avatar', 'POST')).status, 422);
    assert.equal((await request('/api/auth/avatar', 'POST', imageForm(Buffer.from('<svg>not an image</svg>')))).status, 422);
    assert.equal((await request('/api/auth/avatar', 'POST', imageForm(png, 'wrong'))).status, 422);
    assert.equal((await request('/api/auth/avatar', 'POST', imageForm(Buffer.alloc(5 * 1024 * 1024 + 1)))).status, 413);
  });
  await t.test('upload, serve, replace and remove avatar', async () => {
    const first = await request('/api/auth/avatar', 'POST', imageForm());
    assert.equal(first.status, 200);
    const firstUrl = (await first.json()).data.user.avatarUrl;
    assert.match(firstUrl, /^\/uploads\/avatars\/.*\.png$/);
    assert.equal((await fetch(base + firstUrl)).status, 200);
    const second = await request('/api/auth/avatar', 'POST', imageForm());
    assert.equal(second.status, 200);
    const secondUrl = (await second.json()).data.user.avatarUrl;
    assert.notEqual(firstUrl, secondUrl);
    assert.equal((await fetch(base + firstUrl)).status, 404);
    const me = await request('/api/auth/me', 'GET');
    assert.equal((await me.json()).data.user.avatarUrl, secondUrl);
    const deleted = await request('/api/auth/avatar', 'DELETE');
    assert.equal((await deleted.json()).data.user.avatarUrl, null);
    assert.equal((await fetch(base + secondUrl)).status, 404);
    assert.equal((await request('/api/auth/avatar', 'DELETE')).status, 200);
  });
  await t.test('Swagger includes operations and upload input', () => {
    assert.ok(spec.paths['/api/auth/me'].patch);
    assert.ok(spec.paths['/api/auth/password'].patch);
    assert.ok(spec.paths['/api/auth/avatar'].delete);
    assert.equal(spec.paths['/api/auth/avatar'].post.requestBody.content['multipart/form-data'].schema.properties.avatar.format, 'binary');
    assert.ok(spec.components.schemas.User.properties.avatarUrl);
  });
});
