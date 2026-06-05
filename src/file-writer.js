const fs = require('node:fs');
const path = require('node:path');

function writeArtifacts(outDir, artifacts, options = {}) {
  const force = Boolean(options.force);
  fs.mkdirSync(outDir, { recursive: true });

  const written = [];
  for (const [name, content] of Object.entries(artifacts)) {
    const target = path.join(outDir, name);
    if (fs.existsSync(target) && !force) {
      throw new Error(`${name} already exists. Re-run with --force to overwrite it.`);
    }
    fs.writeFileSync(target, content, 'utf8');
    written.push(target);
  }

  return written;
}

module.exports = {
  writeArtifacts
};
