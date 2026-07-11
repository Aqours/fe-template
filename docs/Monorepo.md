# Monorepo 使用指南

## 日常开发

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm --filter @fe-template/example test
pnpm --filter @fe-template/example build
```

根命令由 Turbo 调度。`build` 会先构建依赖工作区并缓存 `dist/**`；`test`、`typecheck` 与 `lint` 每次都执行，不复用缓存。

## 添加工作区

将共享库放在 `packages/<name>`，并提供 `build`、`test`、`typecheck`、`lint` 和 `clean` scripts。共享库应声明 `files: ["dist"]`、`exports` 和构建后的 `types` 入口。

将应用放在 `app/<name>`，并在其 `package.json` 声明：

```json
{ "private": true }
```

私有应用会参与 Turbo 任务，但不会被 Changesets 版本化或发布。

## 版本与发布

为影响可发布库的提交创建变更集：

```bash
pnpm changeset
git add .changeset
git commit -m "chore: add changeset"
```

在发布 PR 或发布提交中消费变更集：

```bash
pnpm version-packages
pnpm install --lockfile-only
git add package.json packages pnpm-lock.yaml .changeset
git commit -m "chore: version packages"
```

`version-packages` 使用 Changesets 内置生成器，将各发布包的变更写入本地 `CHANGELOG.md`；该流程不依赖 GitHub PR 或提交链接。

先运行发布质量门禁；该命令不会发布：

```bash
pnpm release:check
```

在已配置 npm 认证、版本更新已经提交且允许发布时，运行：

```bash
pnpm release
```

`release` 会再次运行 `release:check`，然后调用 `changeset publish`。请勿在本地或 CI 日志中提交 npm token。

## CI

对每个 pull request 和发布候选提交执行：

```bash
pnpm install --frozen-lockfile
pnpm release:check
```
