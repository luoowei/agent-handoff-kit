#!/usr/bin/env node

const { run } = require('../src/cli');

run(process.argv.slice(2), {
  cwd: process.cwd(),
  stdout: process.stdout,
  stderr: process.stderr,
  exit: process.exit
});
