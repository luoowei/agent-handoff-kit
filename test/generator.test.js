const assert = require('node:assert/strict');
const test = require('node:test');

const { generateArtifacts } = require('../src/generator');

test('generateArtifacts creates the expected handoff markdown files', () => {
  const artifacts = generateArtifacts({
    projectName: 'demo-app',
    root: '/tmp/demo-app',
    packageManager: 'npm',
    scripts: { test: 'vitest run', build: 'vite build' },
    stack: ['Node.js', 'React', 'Vite'],
    docs: ['README.md'],
    configs: ['vite.config.ts'],
    files: [{ path: 'src/App.tsx', size: 1200 }],
    git: { branch: 'main', dirty: true, changedFiles: ['src/App.tsx'] }
  });

  assert.deepEqual(Object.keys(artifacts).sort(), [
    'AGENTS.md',
    'AGENT_HANDOFF.md',
    'handoff-pack.md',
    'llms.txt'
  ].sort());
  assert.match(artifacts['AGENT_HANDOFF.md'], /demo-app/);
  assert.match(artifacts['AGENT_HANDOFF.md'], /npm test/);
  assert.match(artifacts['AGENT_HANDOFF.md'], /npm run build/);
  assert.match(artifacts['AGENTS.md'], /Do not overwrite user changes/);
  assert.match(artifacts['llms.txt'], /# demo-app/);
  assert.match(artifacts['handoff-pack.md'], /Paste this into a fresh AI coding agent session/);
});
