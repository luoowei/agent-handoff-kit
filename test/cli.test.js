const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { main, parseArgs } = require('../src/cli');

function streamBuffer() {
  let value = '';
  return {
    write(chunk) {
      value += String(chunk);
    },
    value() {
      return value;
    }
  };
}

test('parseArgs supports dir, out, dry-run, force, and help', () => {
  assert.deepEqual(parseArgs(['--dir', 'repo', '--out', 'generated', '--dry-run', '--force']), {
    dir: 'repo',
    out: 'generated',
    dryRun: true,
    force: true,
    help: false
  });
  assert.equal(parseArgs(['--help']).help, true);
});

test('main dry-run previews generated artifacts without writing files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahk-cli-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'dry-run-demo',
    scripts: { test: 'node --test' }
  }, null, 2));
  const stdout = streamBuffer();
  const stderr = streamBuffer();

  const code = main(['--dir', dir, '--dry-run'], {
    cwd: dir,
    stdout,
    stderr
  });

  assert.equal(code, 0);
  assert.match(stdout.value(), /Dry run/);
  assert.match(stdout.value(), /AGENT_HANDOFF.md/);
  assert.equal(stderr.value(), '');
  assert.equal(fs.existsSync(path.join(dir, 'AGENT_HANDOFF.md')), false);
});
