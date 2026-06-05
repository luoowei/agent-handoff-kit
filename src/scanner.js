const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const IGNORED_DIRS = new Set([
  '.git',
  '.hg',
  '.svn',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.cache',
  '.turbo',
  'target',
  '__pycache__'
]);

const DOC_FILES = new Set([
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'ARCHITECTURE.md',
  'SECURITY.md',
  'AGENTS.md',
  'CLAUDE.md'
]);

const CONFIG_PATTERNS = [
  /^package\.json$/,
  /^tsconfig.*\.json$/,
  /^vite\.config\./,
  /^next\.config\./,
  /^svelte\.config\./,
  /^astro\.config\./,
  /^tailwind\.config\./,
  /^pytest\.ini$/,
  /^pyproject\.toml$/,
  /^Cargo\.toml$/,
  /^go\.mod$/,
  /^Dockerfile$/,
  /^docker-compose\./,
  /^\.github\/workflows\//
];

function scanRepository(rootDir) {
  const root = path.resolve(rootDir || process.cwd());
  const packageJson = readPackageJson(root);
  const files = walkFiles(root).slice(0, 200);

  return {
    root,
    projectName: detectProjectName(root, packageJson),
    packageManager: detectPackageManager(root),
    scripts: packageJson && packageJson.scripts ? packageJson.scripts : {},
    stack: detectStack(root, packageJson, files),
    docs: files.map((file) => file.path).filter((file) => DOC_FILES.has(path.basename(file))),
    configs: files.map((file) => file.path).filter(isConfigFile),
    files,
    git: detectGit(root)
  };
}

function readPackageJson(root) {
  const packagePath = path.join(root, 'package.json');
  if (!fs.existsSync(packagePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch {
    return null;
  }
}

function detectProjectName(root, packageJson) {
  if (packageJson && packageJson.name) {
    return packageJson.name;
  }
  return path.basename(root);
}

function detectPackageManager(root) {
  if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(root, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(root, 'bun.lockb')) || fs.existsSync(path.join(root, 'bun.lock'))) return 'bun';
  if (fs.existsSync(path.join(root, 'package-lock.json'))) return 'npm';
  if (fs.existsSync(path.join(root, 'package.json'))) return 'npm';
  return null;
}

function detectStack(root, packageJson, files) {
  const stack = new Set();
  const names = new Set(files.map((file) => file.path));
  const deps = Object.assign(
    {},
    packageJson ? packageJson.dependencies : {},
    packageJson ? packageJson.devDependencies : {}
  );
  const depNames = new Set(Object.keys(deps));

  if (packageJson) stack.add('Node.js');
  if (depNames.has('react') || files.some((file) => /\.(jsx|tsx)$/.test(file.path))) stack.add('React');
  if (depNames.has('vue')) stack.add('Vue');
  if (depNames.has('svelte')) stack.add('Svelte');
  if (depNames.has('next') || names.has('next.config.js') || names.has('next.config.mjs')) stack.add('Next.js');
  if (depNames.has('vite') || files.some((file) => /^vite\.config\./.test(path.basename(file.path)))) stack.add('Vite');
  if (names.has('pyproject.toml') || files.some((file) => /\.py$/.test(file.path))) stack.add('Python');
  if (names.has('go.mod') || files.some((file) => /\.go$/.test(file.path))) stack.add('Go');
  if (names.has('Cargo.toml') || files.some((file) => /\.rs$/.test(file.path))) stack.add('Rust');
  if (fs.existsSync(path.join(root, 'Dockerfile'))) stack.add('Docker');

  return Array.from(stack);
}

function detectGit(root) {
  try {
    const branch = execFileSync('git', ['-C', root, 'branch', '--show-current'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    const status = execFileSync('git', ['-C', root, 'status', '--short'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trimEnd();

    return {
      branch: branch || 'detached',
      dirty: status.length > 0,
      changedFiles: parseGitChangedFiles(status)
    };
  } catch {
    return null;
  }
}

function parseGitChangedFiles(status) {
  if (!status) {
    return [];
  }

  return status
    .split(/\r?\n/)
    .map((line) => line.slice(3))
    .map((file) => file.trim())
    .filter(Boolean);
}

function walkFiles(root) {
  const results = [];

  function visit(dir, prefix) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    entries
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((entry) => {
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name)) {
            visit(path.join(dir, entry.name), path.join(prefix, entry.name));
          }
          return;
        }

        if (!entry.isFile()) {
          return;
        }

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(prefix, entry.name).replace(/\\/g, '/');
        let size = 0;
        try {
          size = fs.statSync(fullPath).size;
        } catch {
          size = 0;
        }
        results.push({ path: relativePath, size });
      });
  }

  visit(root, '');
  return results;
}

function isConfigFile(file) {
  return CONFIG_PATTERNS.some((pattern) => pattern.test(file));
}

module.exports = {
  parseGitChangedFiles,
  scanRepository
};
