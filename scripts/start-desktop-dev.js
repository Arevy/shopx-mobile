#!/usr/bin/env node
const path = require('path');
const {spawn} = require('child_process');
const waitOn = require('wait-on');

async function run() {
  const port = process.env.WEB_PORT || '8082';
  const host = process.env.WEB_HOST || '127.0.0.1';
  const protocol = process.env.WEB_PROTOCOL || 'http';
  const target =
    process.env.ELECTRON_START_URL || `${protocol}://${host}:${port}`;

  const timeout = Number(process.env.ELECTRON_WAIT_TIMEOUT || 120000);

  try {
    await waitOn({
      resources: [target],
      timeout,
      validateStatus: status => status >= 200 && status < 500,
    });
  } catch (error) {
    process.stderr.write(`Timed out waiting for ${target} (${timeout}ms)\n`);
    process.exit(1);
  }

  const electronBinary = require('electron');
  const child = spawn(electronBinary, [path.join(__dirname, '../desktop/main.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ELECTRON_START_URL: target,
    },
  });

  child.on('exit', code => {
    process.exit(code ?? 0);
  });
}

run();
