const path = require('node:path');
const { scanRepository } = require('./scanner');
const { generateArtifacts } = require('./generator');
const { writeArtifacts } = require('./file-writer');

function parseArgs(argv) {
  const options = {
    dir: null,
    out: null,
    dryRun: false,
    force: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dir') {
      options.dir = readValue(argv, index, arg);
      index += 1;
    } else if (arg === '--out') {
      options.out = readValue(argv, index, arg);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function main(argv, env) {
  const runtime = Object.assign({
    cwd: process.cwd(),
    stdout: process.stdout,
    stderr: process.stderr
  }, env || {});

  try {
    const options = parseArgs(argv);
    if (options.help) {
      runtime.stdout.write(helpText());
      return 0;
    }

    const root = path.resolve(runtime.cwd, options.dir || '.');
    const outDir = path.resolve(runtime.cwd, options.out || options.dir || '.');
    const scan = scanRepository(root);
    const artifacts = generateArtifacts(scan);

    if (options.dryRun) {
      runtime.stdout.write(`Dry run for ${scan.projectName}\n\n`);
      for (const [name, content] of Object.entries(artifacts)) {
        runtime.stdout.write(`- ${name} (${content.length} chars)\n`);
      }
      runtime.stdout.write('\nRe-run without --dry-run to write files.\n');
      return 0;
    }

    const written = writeArtifacts(outDir, artifacts, { force: options.force });
    runtime.stdout.write(`Generated ${written.length} agent handoff files:\n`);
    for (const file of written) {
      runtime.stdout.write(`- ${file}\n`);
    }
    return 0;
  } catch (error) {
    runtime.stderr.write(`${error.message}\n`);
    return 1;
  }
}

function run(argv, env) {
  const runtime = Object.assign({ exit: process.exit }, env || {});
  const code = main(argv, runtime);
  runtime.exit(code);
}

function readValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function helpText() {
  return `agent-handoff-kit

Generate AI coding agent handoff files for a repository.

Usage:
  agent-handoff-kit [options]

Options:
  --dir <path>    Repository to scan. Defaults to current directory.
  --out <path>    Directory to write generated files. Defaults to scanned repo.
  --dry-run       Preview generated artifacts without writing files.
  --force         Overwrite existing generated files.
  -h, --help      Show this help.
`;
}

module.exports = {
  main,
  parseArgs,
  run
};
