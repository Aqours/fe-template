# Monorepo 使用指南

## 工作区约定

pnpm 扫描以下两类工作区：

- `packages/*`：共享库和共享配置；
- `apps/*`：应用项目，必须在各自的 `package.json` 中声明 `"private": true`。

当前工作区：

| 工作区 | 作用 | 是否发布 |
| --- | --- | --- |
| `@repo/example` | TypeScript 库的构建、测试和导出示例 | 是 |
| `@repo/typescript-config` | 共享的 TypeScript 基础、React 与 Next.js 配置 | 否 |

## Turbo 任务

在仓库根目录运行任务，Turbo 会将它调度到声明了对应 script 的工作区：

```bash
pnpm dev
pnpm build
pnpm test
pnpm check-types
pnpm lint
pnpm clean
```

任务行为由 `turbo.json` 定义：

- `build` 先构建依赖工作区，并缓存 `dist/**`；
- `check-types` 先检查依赖工作区；
- `dev` 是不缓存的持久任务；
- `test`、`check-types`、`lint` 和 `clean` 不使用 Turbo 缓存。

可用 filter 缩小执行范围：

```bash
pnpm --filter @repo/example test
pnpm --filter @repo/example build
pnpm --filter './packages/*' lint
```

## 新增共享库

在 `packages/<name>` 创建包。建议至少包含以下 scripts：

```json
{
  "scripts": {
    "build": "pnpm run build:bundle && pnpm run build:types",
    "build:bundle": "vite build",
    "build:types": "tsc --project tsconfig.build.json --emitDeclarationOnly",
    "clean": "node -e \"require('node:fs').rmSync('dist', { recursive: true, force: true })\"",
    "dev": "vite build --watch",
    "lint": "biome lint src --no-errors-on-unmatched --files-ignore-unknown=true --colors=off",
    "test": "vitest run",
    "check-types": "tsc --noEmit"
  }
}
```

这些 scripts 依赖 Vite、Vitest、TypeScript 和 Biome；新包应在自身的 `devDependencies` 中显式声明所使用的工具。类型构建还需要单独的 `tsconfig.build.json`，将声明文件写入发布目录：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "exclude": ["src/**/*.test.ts"]
}
```

可发布库还应明确声明发布内容和入口。例如：

```json
{
  "name": "@repo/my-library",
  "files": ["dist"],
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

如需复用 TypeScript 配置，在新包的 `devDependencies` 中加入：

```json
{
  "@repo/typescript-config": "workspace:*"
}
```

然后在 `tsconfig.json` 中继承适用配置：

```json
{
  "extends": "@repo/typescript-config/base.json"
}
```

可选配置还包括 `react-library.json` 和 `nextjs.json`。

## 新增应用

将应用创建在 `apps/<name>`，并避免它进入发布流程：

```json
{
  "name": "@repo/my-app",
  "private": true
}
```

应用可以声明与根命令同名的 scripts 以接入 Turbo。没有声明某项 script 的工作区会被该任务跳过。

## 版本与发布

### 1. 创建变更集

对可发布包完成修改后运行：

```bash
pnpm changeset
```

在交互界面选择受影响的包、语义化版本级别，并填写面向使用者的变更说明。随后提交生成的 `.changeset/*.md` 文件。

### 2. 更新版本

在发布 PR 或发布提交中消费变更集：

```bash
pnpm version-packages
pnpm install --lockfile-only
```

`version-packages` 会更新包版本，并用 Changesets 内置生成器维护各发布包的 `CHANGELOG.md`。锁文件需要随版本变更一同提交。

### 3. 检查与发布

先执行不会发布任何内容的质量门禁：

```bash
pnpm release:check
```

确认 npm 认证、包名、版本和 registry 均正确后再运行：

```bash
pnpm release
```

该命令会再次执行 `release:check`，然后调用 `changeset publish`。当前 Changesets 配置默认使用 `restricted` 访问级别；如需公开发布 scoped package，应在发布前将访问级别调整为 `public` 或为包设置相应的 `publishConfig`。

## CI

当前 GitHub Actions 工作流位于 `.github/workflows/npm-test.yml`，在每次 push 时使用 Node.js 22 执行：

```bash
corepack enable
pnpm install
pnpm run test
```

本地提交前的 `pre-push` hook 还会并行运行 `pnpm test` 和 `pnpm check-types`。如需在 CI 中启用与发布前一致的完整检查，可将 CI 的测试步骤替换为：

```bash
pnpm install --frozen-lockfile
pnpm release:check
```

## 常见问题

### 根命令没有执行新工作区的任务

确认工作区路径匹配 `packages/*` 或 `apps/*`，并确认该工作区的 `package.json` 声明了同名 script。新增依赖后重新运行 `pnpm install`。

### 本地提交没有触发 Git hooks

运行以下命令重新安装 hooks：

```bash
pnpm prepare
```

### 只想验证发布流程，不想实际发布

只运行 `pnpm release:check`。不要运行 `pnpm release`，后者会在检查成功后执行真正的 npm 发布。
