# agent-handoff-kit

**语言：** [English](README.en.md) | 简体中文

不要再给每个 AI 编程 Agent 反复解释你的仓库。

`agent-handoff-kit` 是一个零配置 CLI，可以为 Codex、Claude Code、Cursor 和其他 AI 编程 Agent 生成紧凑的仓库交接文件。它只在本地扫描你的仓库，并在 Agent 改代码前写出它需要的上下文。

不需要 API key。不上传代码。没有复杂配置。

## 快速开始

```bash
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git
```

它会生成：

- `AGENT_HANDOFF.md`：项目快照、技术栈、命令、关键文件和当前 Git 状态
- `AGENTS.md`：仓库级 AI 编程 Agent 操作规则
- `llms.txt`：给 LLM 读取的简短项目入口
- `handoff-pack.md`：可直接粘贴到新 Agent 会话里的上下文包

## 为什么需要它

AI 编程 Agent 很强，但每个新会话一开始都是“冷启动”：

- 这个项目是什么技术栈？
- 哪些命令可以安全运行？
- 哪些文件最重要？
- 工作区现在有没有未提交改动？
- 下一个 Agent 绝对不能覆盖什么？

这个工具把这些重复解释变成可复用的仓库文档。

## 用法

```bash
# 扫描当前目录，并把生成文件写到当前目录
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git

# 只预览，不写文件
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --dry-run

# 扫描另一个仓库
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --dir ../my-app

# 把生成结果写到其他目录
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --dir ../my-app --out ./handoff

# 覆盖已有生成文件
npx --yes git+https://github.com/luoowei/agent-handoff-kit.git --force
```

发布到 npm 后，可以使用更短的命令：

```bash
npx agent-handoff-kit
```

## 输出示例

```markdown
# my-app Agent Handoff

## Project Snapshot

- Stack: Node.js, React, Vite
- Package manager: npm
- Git branch: main
- Working tree: has local changes

## Common Commands

- `npm test` - vitest run
- `npm run build` - vite build

## Instructions For The Next Agent

- Read this file before making edits.
- Inspect the working tree before changing files.
- Do not overwrite user changes.
- Prefer existing project scripts and conventions.
```

## 它会检测什么

- 从 `package.json` 或目录名识别项目名称
- 从 lockfile 识别包管理器
- 从 `package.json` 读取 scripts
- 识别 Node.js、React、Vue、Svelte、Next.js、Vite、Python、Go、Rust、Docker 等技术栈线索
- 发现文档和配置文件
- 读取 Git 分支、工作区是否有改动、改动文件列表
- 收集重要文件，同时跳过大型生成目录

## 生成文件说明

### `AGENT_HANDOFF.md`

主要交接文档。你可以在需要持久保存 Agent 上下文时提交它，也可以在活跃开发中随时重新生成。

### `AGENTS.md`

给 AI 编程 Agent 的共享操作规则。很多工具已经会主动查找这个文件。

### `llms.txt`

给 LLM 和 AI 工具使用的简短仓库地图。

### `handoff-pack.md`

一个可粘贴的上下文块，适合新聊天窗口或远程协作者的 Agent 会话。

## 安全性

`agent-handoff-kit` 只在本地运行。它不会调用 LLM，不会发送遥测，也不会上传你的代码。默认不会覆盖已有生成文件，除非显式传入 `--force`。

## 开发

```bash
npm test
node ./bin/agent-handoff-kit.js --dry-run
```

## 许可证

MIT
