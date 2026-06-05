# Agent Handoff Kit Design

## Goal

Build a zero-config CLI that scans a repository and generates a compact handoff pack for AI coding agents, so developers do not need to re-explain the same project context in every Codex, Claude Code, Cursor, or other agent session.

## Audience

The first audience is developers already using AI coding tools on active repositories. The launch promise is: "Stop re-explaining your repo to every AI coding agent."

## MVP Scope

The CLI generates four markdown artifacts:

- `AGENT_HANDOFF.md`: current project snapshot, detected stack, commands, risks, and next-agent instructions.
- `AGENTS.md`: repository-level AI agent operating instructions.
- `llms.txt`: a short LLM-friendly project entrypoint.
- `handoff-pack.md`: a copy-paste bundle for a new agent chat.

The MVP is local-only, requires no API key, and uses static repository analysis. It should be useful within one minute after installation.

## CLI

Command:

```bash
npx agent-handoff-kit
```

Options:

- `--dir <path>` scans a target repository instead of the current directory.
- `--out <path>` writes generated files to a target directory instead of the repository root.
- `--dry-run` prints generated output names and previews without writing files.
- `--force` overwrites existing generated files.
- `--help` prints usage.

## Architecture

The implementation is a small Node.js CLI with no runtime dependencies:

- `src/cli.js` parses arguments, handles terminal output, and delegates work.
- `src/scanner.js` inspects files, package metadata, Git status, scripts, docs, and project layout.
- `src/generator.js` turns the scan result into markdown artifacts.
- `src/file-writer.js` writes files safely and refuses to overwrite unless `--force` is set.

## Detection

The scanner detects:

- project name from `package.json`, Git root folder, or directory name
- package manager from lockfiles
- scripts from `package.json`
- language/framework hints from common files
- docs and config files
- Git branch/status when available
- ignored heavy folders such as `node_modules`, `.git`, `dist`, `build`, `.next`, and coverage output

## Error Handling

The CLI exits with:

- `0` on success
- `1` for validation or file-write failures

Existing generated files are not overwritten by default. The error explains `--force`.

## Testing

Use Node's built-in test runner. Cover argument parsing, repository scanning, markdown generation, dry run behavior, and overwrite protection.

## Launch Assets

The repository includes:

- `README.md` with quick start, examples, generated artifact preview, and launch pitch
- `LICENSE` using MIT
- `package.json` with executable bin metadata
- `LAUNCH.md` with GitHub/Hacker News/Reddit/X launch copy
