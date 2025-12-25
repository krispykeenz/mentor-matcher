import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
if (!isDemo) {
  console.error(
    'build-demo-export.mjs: NEXT_PUBLIC_DEMO_MODE must be set to "true" for demo export builds.',
  );
  process.exit(1);
}

const repoRoot = process.cwd();
const apiDir = path.join(repoRoot, 'app', 'api');
const authDir = path.join(repoRoot, 'app', 'auth');
const tmpDir = path.join(repoRoot, '.demo-tmp');
const apiBackupDir = path.join(tmpDir, 'app-api');
const authBackupDir = path.join(tmpDir, 'app-auth');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

let movedApi = false;
let movedAuth = false;
try {
  if (fs.existsSync(apiDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, apiBackupDir);
    movedApi = true;
  }

  // app/auth contains a redirect route handler (app/auth/complete/route.ts) which
  // is incompatible with output: 'export'. It's safe to exclude for demo builds.
  if (fs.existsSync(authDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
    if (fs.existsSync(authBackupDir)) {
      fs.rmSync(authBackupDir, { recursive: true, force: true });
    }
    fs.renameSync(authDir, authBackupDir);
    movedAuth = true;
  }

  const result = spawnSync(npxCmd, ['next', 'build'], {
    stdio: 'inherit',
    env: process.env,
  });

  if (typeof result.status === 'number') {
    process.exitCode = result.status;
  } else {
    process.exitCode = 1;
  }
} finally {
  // Restore excluded route handlers for normal dev usage.
  if (movedAuth) {
    try {
      fs.renameSync(authBackupDir, authDir);
    } catch (err) {
      console.error('Failed to restore app/auth after demo export build:', err);
    }
  }

  if (movedApi) {
    try {
      fs.renameSync(apiBackupDir, apiDir);
    } catch (err) {
      console.error('Failed to restore app/api after demo export build:', err);
    }
  }
}
