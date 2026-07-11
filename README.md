# fe-template

基于 pnpm workspace、Turborepo 与 TypeScript 的前端 monorepo 模板。仓库内置库打包、单元测试、代码质量检查、Git hooks 与 Changesets 发布流程。

## 技术栈

- Node.js 22+
- pnpm 11
- Turborepo：统一调度工作区任务
- Vite：库的 ESM / CommonJS 打包
- Vitest：单元测试
- TypeScript：类型检查与声明文件生成
- Biome：格式化与静态检查
- Lefthook + Commitlint：提交前质量检查
- Changesets：可发布包的版本管理与发布

## 目录结构

```text
.
├── app/                 # 私有应用工作区
├── packages/            # 可发布的共享库工作区
│   └── example/         # 双格式库示例
├── docs/                # 项目文档
├── turbo.json           # Turbo 任务依赖与缓存配置
└── pnpm-workspace.yaml  # 工作区范围
```

## 开始使用

要求：Node.js 22 或更高版本，并启用 Corepack。

```bash
corepack enable
pnpm install
```

`pnpm install` 会自动安装 Lefthook 的 Git hooks。

## 常用命令

根目录命令由 Turbo 调度至各工作区：

```bash
pnpm dev            # 启动各工作区的开发任务
pnpm build          # 构建所有工作区
pnpm lint           # 执行静态检查
pnpm test           # 执行单元测试
pnpm typecheck      # 执行类型检查
pnpm clean          # 清理构建产物
pnpm release:check  # 依次执行 lint、typecheck、test 与 build
```

只操作某个工作区时使用 pnpm filter，例如：

```bash
pnpm --filter @fe-template/example dev
pnpm --filter @fe-template/example build
pnpm --filter @fe-template/example test
```

`packages/example` 展示了可发布库的约定：Vite 输出 `dist/index.js`（ESM）与 `dist/index.cjs`（CommonJS），TypeScript 生成 `dist/index.d.ts`。

## Git hooks

- `pre-commit`：使用 Biome 检查并格式化暂存文件。
- `commit-msg`：使用 Commitlint 校验 Conventional Commits 格式。
- `pre-push`：运行 `pnpm test` 与 `pnpm typecheck`。

## 版本与发布

修改可发布包后，先创建变更集：

```bash
pnpm changeset
```

版本更新与发布命令：

```bash
pnpm version-packages
pnpm release:check
pnpm release
```

发布前需要配置 npm 认证；不要将 token 提交到仓库或输出到 CI 日志。

更多关于新增工作区、版本管理与 CI 的说明见 [Monorepo 使用指南](docs/Monorepo.md)。
