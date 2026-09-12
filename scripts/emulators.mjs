import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { delimiter, resolve } from 'node:path';

// Psudo code //
// First use Java from the system, or the optional project-local Java runtime.
// Then restore the previous local database if an export exists.
// Start only Authentication and Firestore, and export when you press Ctrl+C.
const javaBin = resolve('.tools/java/Contents/Home/bin');
const env = { ...process.env };
if (existsSync(javaBin)) env.PATH = `${javaBin}${delimiter}${env.PATH ?? ''}`;
const args = [
  'node_modules/firebase-tools/lib/bin/firebase.js',
  'emulators:start', '--project', 'demo-pinboard', '--only', 'auth,firestore',
  '--export-on-exit=.firebase-data',
];
if (existsSync('.firebase-data/firebase-export-metadata.json')) args.push('--import=.firebase-data');
const child = spawn(process.execPath, args, { stdio: 'inherit', env, detached: process.platform !== 'win32' });
// Keep the parent alive so the CLI can complete its export after terminal signals.
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
child.on('exit', code => { process.exitCode = code ?? 0; });
