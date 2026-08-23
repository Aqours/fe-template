# fe-template

基于 pnpm workspace、Turborepo 和 TypeScript 的前端 Monorepo 模板。项目内置共享库打包、单元测试、代码质量检查、Git hooks，以及基于 Changesets 的版本与发布流程。

## 环境要求

- Node.js 22 或更高版本
- pnpm 11（仓库锁定版本为 `11.11.0`）
- Corepack

## 快速开始

```bash
corepack enable
pnpm install
pnpm release:check
```

`pnpm install` 会通过 `prepare` 脚本安装 Lefthook Git hooks。`release:check` 会依次执行代码检查、类型检查、测试和构建，可用于确认本地环境与项目状态正常。

## 目录结构

```text
.
├── apps/                       # 私有应用工作区
├── packages/
│   ├── example/                # 可发布 TypeScript 库示例
│   └── typescript-config/      # 工作区共享 TypeScript 配置
├── docs/                       # 项目文档
├── biome.json                  # Biome 格式化与检查配置
├── lefthook.yml                # Git hooks 配置
├── turbo.json                  # Turbo 任务依赖与缓存配置
└── pnpm-workspace.yaml         # pnpm 工作区范围
```

工作区包含 `packages/*` 和 `apps/*`。共享库放在 `packages/`，不发布的应用放在 `apps/` 并在自身 `package.json` 中声明 `"private": true`。

## 常用命令

根目录命令由 Turbo 调度到各工作区：

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 以监听模式运行各工作区的开发任务 |
| `pnpm build` | 构建所有工作区，产物默认写入 `dist/` |
| `pnpm lint` | 执行 Biome 静态检查 |
| `pnpm test` | 执行 Vitest 单元测试 |
| `pnpm check-types` | 执行 TypeScript 类型检查 |
| `pnpm clean` | 清理各工作区构建产物 |
| `pnpm release:check` | 依次执行 lint、类型检查、测试和构建 |

只操作一个工作区时，使用 pnpm filter：

```bash
pnpm --filter @repo/example dev
pnpm --filter @repo/example build
pnpm --filter @repo/example test
```

## 示例包

`packages/example` 展示了一个可发布 TypeScript 库的基本约定：

- Vite 同时生成 ESM 的 `dist/index.js` 与 CommonJS 的 `dist/index.cjs`；
- TypeScript 生成 `dist/index.d.ts` 类型声明；
- `package.json` 通过 `exports` 分别声明 `types`、`import` 和 `require` 入口；
- Vitest 测试与源码放在同一目录中。

使用示例：

```ts
import { formatGreeting } from "@repo/example";

formatGreeting("Ada"); // "Hello, Ada!"
```

## 提交检查

- `pre-commit`：使用 Biome 检查并格式化暂存的 JavaScript、TypeScript 和 JSON 文件，并重新暂存修复结果；
- `commit-msg`：使用 Commitlint 校验 Conventional Commits 格式；
- `pre-push`：并行执行测试和类型检查。

提交信息示例：

```text
feat(example): add greeting options
fix(example): handle empty names
docs: update setup guide
```

## 版本与发布

影响可发布包的修改应创建变更集：

```bash
pnpm changeset
```

准备新版本并发布：

```bash
pnpm version-packages
pnpm install --lockfile-only
pnpm release:check
pnpm release
```

`pnpm release` 会再次运行完整质量检查，然后执行 `changeset publish`。发布前需要配置 npm 认证，且不应将 token 写入仓库或 CI 日志。

新增工作区、任务约定、发布步骤和当前 CI 行为详见 [Monorepo 使用指南](docs/Monorepo.md)。
