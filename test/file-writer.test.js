const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { writeArtifacts } = require('../src/file-writer');

test('writeArtifacts refuses to overwrite existing files unless forced', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahk-write-'));
  fs.writeFileSync(path.join(dir, 'AGENT_HANDOFF.md'), 'existing\n');

  assert.throws(() => {
    writeArtifacts(dir, { 'AGENT_HANDOFF.md': 'new\n' }, { force: false });
  }, /already exists/);

  writeArtifacts(dir, { 'AGENT_HANDOFF.md': 'new\n' }, { force: true });

  assert.equal(fs.readFileSync(path.join(dir, 'AGENT_HANDOFF.md'), 'utf8'), 'new\n');
});
