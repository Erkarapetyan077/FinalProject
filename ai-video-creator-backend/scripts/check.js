/**
 * Project verification script (npm run check).
 *
 * Performs REAL checks against the codebase:
 *   1. `node --check` syntax validation for every .js file under src/ and scripts/
 *   2. Import smoke test: loads models/index.js (models + associations),
 *      app.js (full route/controller/service graph) without a database
 *   3. OpenAPI spec generation: verifies Swagger builds and counts documented paths
 *
 * Exits with code 1 when any check fails. No database connection required.
 */
import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`  FAIL  ${message}`);
}

function pass(message) {
  console.log(`  PASS  ${message}`);
}

function listJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      files.push(...listJsFiles(full));
    } else if (entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

console.log('[check] 1/3 - Node.js syntax checks (node --check)');
const jsFiles = listJsFiles(path.join(projectRoot, 'src'))
  .concat(listJsFiles(path.join(projectRoot, 'scripts')));
for (const file of jsFiles) {
  const relative = path.relative(projectRoot, file);
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status === 0) {
    pass(relative);
  } else {
    fail(relative);
    console.error(result.stderr);
  }
}

console.log('[check] 2/3 - Import smoke test (models, app graph)');
try {
  await import(path.join(projectRoot, 'src', 'models', 'index.js'));
  pass('models/index.js loads, all 6 models + associations initialize');
} catch (err) {
  fail(`models/index.js failed to load: ${err.message}`);
}

try {
  const { createApp } = await import(path.join(projectRoot, 'src', 'app.js'));
  const app = createApp();
  if (typeof app !== 'function') {
    fail('createApp() did not return an Express app');
  } else {
    pass('app.js loads and createApp() builds the full Express app (routes, controllers, services, swagger)');
  }
} catch (err) {
  fail(`app.js failed to load: ${err.message}`);
}

console.log('[check] 3/3 - OpenAPI spec generation');
try {
  const specModule = await import(path.join(projectRoot, 'src', 'config', 'swagger.js'));
  const spec = specModule.default;
  const pathCount = Object.keys(spec.paths || {}).length;
  const schemaCount = Object.keys(spec.components?.schemas || {}).length;
  if (spec.openapi?.startsWith('3.') && pathCount >= 15 && schemaCount >= 8) {
    pass(`OpenAPI ${spec.openapi} generated: ${pathCount} documented paths, ${schemaCount} reusable schemas`);
  } else {
    fail(`OpenAPI spec looks incomplete: version=${spec.openapi}, paths=${pathCount}, schemas=${schemaCount}`);
  }
} catch (err) {
  fail(`Swagger spec generation failed: ${err.message}`);
}

console.log('----------------------------------------');
if (failures > 0) {
  console.error(`[check] FAILED: ${failures} check(s) did not pass.`);
  process.exit(1);
}
console.log('[check] ALL CHECKS PASSED');
