import { readFileSync } from 'node:fs';

const config = readFileSync('src/environments/environment.cloud.ts', 'utf8');
if (/['"]REPLACE_WITH_/.test(config)) {
  console.error('Cloud build stopped: fill in your public Firebase web app configuration in src/environments/environment.cloud.ts first. See docs/FIREBASE-SETUP.md.');
  process.exitCode = 1;
}
