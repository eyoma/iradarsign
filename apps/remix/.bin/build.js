#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { cp, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPT_DIR = __dirname;
const WEB_APP_DIR = resolve(SCRIPT_DIR, '..');
const ROOT_DIR = resolve(WEB_APP_DIR, '../..');

(async () => {
  try {
    const startTime = Date.now();

    // Change to web app directory
    process.chdir(WEB_APP_DIR);

    console.log('[Build]: Extracting and compiling translations');
    execSync('npm run translate --prefix ../../', { stdio: 'inherit' });

    console.log('[Build]: Building app');
    execSync('npm run build:app', { stdio: 'inherit' });

    console.log('[Build]: Building server');
    execSync('npm run build:server', { stdio: 'inherit' });

    // Copy over the entry point for the server
    const serverMainSrc = join(WEB_APP_DIR, 'server', 'main.js');
    const serverMainDest = join(WEB_APP_DIR, 'build', 'server', 'main.js');

    console.log('[Build]: Copying server/main.js');
    const serverBuildDir = join(WEB_APP_DIR, 'build', 'server');
    if (!existsSync(serverBuildDir)) {
      await mkdir(serverBuildDir, { recursive: true });
    }
    await cp(serverMainSrc, serverMainDest);

    // Copy over all web.js translations
    const translationsSrc = join(ROOT_DIR, 'packages', 'lib', 'translations');
    const translationsDest = join(WEB_APP_DIR, 'build', 'server', 'hono', 'packages', 'lib', 'translations');

    console.log('[Build]: Copying translations');
    if (!existsSync(translationsDest)) {
      await mkdir(translationsDest, { recursive: true });
    }
    await cp(translationsSrc, translationsDest, { recursive: true });

    // Time taken
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    console.log(`[Build]: Done in ${timeTaken} seconds`);
  } catch (error) {
    console.error('[Build]: Error:', error.message);
    process.exit(1);
  }
})();

