import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(projectRoot, 'ebooks/static-site-replit-vercel-domain.md');
const sourceName = basename(sourcePath);
const buildScript = resolve(projectRoot, 'scripts/build-ebook.mjs');
let lastSignature = '';
let debounceTimer;
let building = false;
let queued = false;
let stopped = false;

async function signature() {
  try {
    const info = await stat(sourcePath);
    return `${info.mtimeMs}:${info.size}`;
  } catch {
    return 'missing';
  }
}

async function runBuild(reason) {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  lastSignature = await signature();
  console.log(`[ebook] ${reason}; rebuilding EPUB, HTML, PDF, and covers.`);

  const child = spawn(process.execPath, [buildScript], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  child.on('error', (error) => {
    console.error('[ebook] Could not start the builder:', error);
  });
  child.on('close', async (code) => {
    building = false;
    if (code === 0) {
      lastSignature = await signature();
      console.log('[ebook] Outputs are up to date.');
    } else {
      console.error(`[ebook] Build exited with status ${code ?? 'unknown'}.`);
    }
    if (queued && !stopped) {
      queued = false;
      void runBuild('queued source change');
    }
  });
}

function scheduleBuild(reason) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void runBuild(reason), 350);
}

lastSignature = await signature();
await new Promise((resolveStart) => {
  const child = spawn(process.execPath, [buildScript], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  child.on('error', (error) => {
    console.error('[ebook] Could not start the initial build:', error);
    resolveStart();
  });
  child.on('close', async (code) => {
    if (code === 0) {
      lastSignature = await signature();
      console.log('[ebook] Initial build complete; watching the Markdown source.');
    } else {
      console.error(`[ebook] Initial build exited with status ${code ?? 'unknown'}.`);
    }
    resolveStart();
  });
});

const directoryWatcher = watch(dirname(sourcePath), (_eventType, filename) => {
  if (!filename || filename.toString() === sourceName) {
    scheduleBuild('book source changed');
  }
});

const poller = setInterval(async () => {
  const current = await signature();
  if (current !== lastSignature) {
    lastSignature = current;
    scheduleBuild('book source changed');
  }
}, 1500);

function stop() {
  stopped = true;
  clearTimeout(debounceTimer);
  clearInterval(poller);
  directoryWatcher.close();
  console.log('[ebook] Source watcher stopped.');
  process.exit(0);
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
console.log(`[ebook] Watching ${sourcePath}`);