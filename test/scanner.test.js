const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { scanRepository } = require('../src/scanner');

function makeTempRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahk-scan-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'demo-app',
    scripts: {
      dev: 'vite --host 0.0.0.0',
      test: 'vitest run',
      build: 'vite build'
    },
    dependencies: {
      '@vitejs/plugin-react': '^5.0.0',
      vite: '^7.0.0',
      react: '^19.0.0'
    }
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}\n');
  fs.writeFileSync(path.join(dir, 'README.md'), '# Demo App\n');
  fs.writeFileSync(path.join(dir, 'src.jsx'), 'export function App() { return null; }\n');
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.writeFileSync(path.join(dir, 'node_modules', 'ignored.js'), 'ignored\n');
  return dir;
}

test('scanRepository detects project identity, package manager, scripts, and stack hints', () => {
  const dir = makeTempRepo();

  const result = scanRepository(dir);

  assert.equal(result.projectName, 'demo-app');
  assert.equal(result.packageManager, 'npm');
  assert.deepEqual(result.scripts, {
    dev: 'vite --host 0.0.0.0',
    test: 'vitest run',
    build: 'vite build'
  });
  assert.ok(result.stack.includes('Node.js'));
  assert.ok(result.stack.includes('React'));
  assert.ok(result.stack.includes('Vite'));
  assert.ok(result.docs.includes('README.md'));
  assert.ok(result.files.some((file) => file.path === 'src.jsx'));
  assert.ok(!result.files.some((file) => file.path.includes('node_modules')));
});
