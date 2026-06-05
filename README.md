# agent-handoff-kit

**Language:** English | [简体中文](README.zh-CN.md)

Stop re-explaining your repo to every AI coding agent.

`agent-handoff-kit` is a zero-config CLI that generates compact handoff files for Codex, Claude Code, Cursor, and other AI coding agents. It scans your repository locally and writes the context a new agent needs before touching code.

No API key. No upload. No setup ceremony.

## Quick Start

```bash
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git
```

That generates:

- `AGENT_HANDOFF.md` - project snapshot, stack, commands, files, and current Git state
- `AGENTS.md` - repository-level operating rules for AI coding agents
- `llms.txt` - short LLM-friendly project entrypoint
- `handoff-pack.md` - copy-paste context for a fresh agent session

## Why

AI coding agents are powerful, but every fresh session starts cold:

- What stack is this?
- Which commands are safe to run?
- What files matter?
- Is the working tree dirty?
- What should the next agent never overwrite?

This tool turns that repeated explanation into a reusable repository artifact.

## Usage

```bash
# Scan the current directory and write files there
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git

# Preview without writing
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --dry-run

# Scan another repo
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --dir ../my-app

# Write output somewhere else
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --dir ../my-app --out ./handoff

# Overwrite existing generated files
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --force
```

After npm publication, the shorter command will be:

```bash
npx agent-handoff-kit
```

## Example Output

```markdown
# my-app Agent Handoff

## Project Snapshot

- Stack: Node.js, React, Vite
- Package manager: npm
- Git branch: main
- Working tree: has local changes

## Common Commands

- `npm test` - vitest run
- `npm build` - vite build

## Instructions For The Next Agent

- Read this file before making edits.
- Inspect the working tree before changing files.
- Do not overwrite user changes.
- Prefer existing project scripts and conventions.
```

## What It Detects

- project name from `package.json` or folder name
- package manager from lockfiles
- scripts from `package.json`
- stack hints for Node.js, React, Vue, Svelte, Next.js, Vite, Python, Go, Rust, and Docker
- docs and config files
- Git branch, dirty state, and changed files
- important files while skipping heavy generated folders

## Generated Files

### `AGENT_HANDOFF.md`

The main handoff document. Commit it when you want persistent agent context, or regenerate it during active work.

### `AGENTS.md`

Shared operating rules for coding agents. Many tools already look for this file.

### `llms.txt`

A short entrypoint for LLMs and AI tools that want a concise map of your repository.

### `handoff-pack.md`

A single pasteable block for a new chat or a remote teammate's agent session.

## Safety

`agent-handoff-kit` is local-only. It does not call an LLM, send telemetry, or upload your code. Existing generated files are not overwritten unless you pass `--force`.

## Development

```bash
npm test
node ./bin/agent-handoff-kit.js --dry-run
```

## License

MIT
