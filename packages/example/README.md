# @repo/example

用于演示 Monorepo 共享库约定的 TypeScript 示例包，同时提供 ESM、CommonJS 和类型声明入口。

## 使用

```ts
import { formatGreeting } from "@repo/example";

formatGreeting("Ada"); // "Hello, Ada!"
```

## 开发

从仓库根目录运行：

```bash
pnpm --filter @repo/example dev
pnpm --filter @repo/example test
pnpm --filter @repo/example check-types
pnpm --filter @repo/example build
```

构建产物位于 `dist/`：

- `index.js`：ESM 入口；
- `index.cjs`：CommonJS 入口；
- `index.d.ts`：TypeScript 类型声明；
- 对应的 source map 和 declaration map。

发布内容由 `package.json` 的 `files` 与 `exports` 字段约束。
