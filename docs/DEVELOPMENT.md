# Development / 开发

Requirements: Python 3.10+, Node 22.13+ and npm. No credentials are needed for local development or CI. Cloudflare deployment remains a separate maintainer operation; this repository does not automatically publish or notify search engines.

需要 Python 3.10+、Node 22.13+ 和 npm。本地与 CI 不需生产凭据；Cloudflare 部署由维护者另行执行，仓库不自动发布或通知搜索引擎。

```sh
python3 scripts/export-public-data.py
python3 scripts/validate-data.py
python3 -m unittest discover -s tests -v
cd site
npm ci
npm run check
npm run build
npm run dev
```

The exporter refuses an archive input hash other than the accepted snapshot. A future research release must first establish provenance, validate bilingual content and rights, and intentionally update the pinned hash/version; changing the hash merely to bypass an error is not a release procedure.

导出器拒绝非指定快照。未来研究发布须先确认来源、双语与权利，再明确更新固定哈希和版本，不可为消除报错而随意改哈希。

`site/` contains the accepted public source: App Router pages, components, reusable interaction modules, content validators and regression tests. Generated downloads are staged into `site/public/datasets/` by predev/prebuild. Omitted third-party media resolve to the existing public origin; see [RIGHTS](RIGHTS.md). The local Worker has no production routes or account configuration. Set `ARCHIVE_LOCAL_PREVIEW=1` in Wrangler preview to bypass canonical redirects; production binding changes require a separate reviewed deployment.

站点源码包括页面、组件、交互模块、内容校验与回归测试。下载文件在开发或构建前生成；未分发媒体引用原站。本地 Worker 无生产域名或账户配置。Wrangler 预览须启用本地预览绑定以跳过域名规范化重定向；生产变更另行审查。

```sh
python3 scripts/audit-links.py --limit 20
```

External checks are opt-in, bounded and network dependent; see `reports/links.json`. 403/429 are restricted access, not dead-link findings. Do not make network access a dependency of deterministic data tests. Do not commit tokens, `.env`, `.wrangler`, private research notes, `node_modules`, build outputs or copyrighted media.

外链检查需主动运行，受数量与网络限制，结果不应成为确定性数据测试的依赖。禁止提交凭据、环境文件、私有笔记、依赖目录、构建文件或未获授权媒体。

## Browser regression / 浏览器回归

```sh
cd site
npx playwright install --with-deps chromium
npm run test:browser
```

This starts an isolated local preview, checks sampled ZH/EN routes at 390/1440px in light/dark themes, keyboard skip links, page errors, canonical/hreflang, horizontal overflow and automated WCAG A/AA rules. It also downloads every JSON/CSV and verifies manifest hashes. Set `ARCHIVE_TEST_ORIGIN` only to reuse an already running local preview. Reports go to `reports/browser.json`. Automated success is not a full manual accessibility or semantic translation review.

该命令启动独立本地预览，在手机、桌面与亮暗主题下抽查中英文路由、键盘、运行错误、规范与语言链接、横向溢出和自动无障碍规则，并逐个下载 JSON/CSV 核对哈希。可设置测试地址复用本地预览；结果见报告。自动通过不代替完整人工无障碍或译文审阅。

The browser imports a generated `lib/data/i18n/display.json` projection containing only exact ZH/EN strings. The complete `translations.json` remains the provenance-bearing research source. `prepare-client-metadata.mjs` regenerates the projection before build/dev; regression tests compare every key and both values. Do not remove review metadata from the full catalogue to reduce bundle size.

浏览器使用仅含双语显示值的生成字典；完整字典继续保留研究元数据。构建与开发前生成显示投影，测试逐键对照双语值；不能为减小体积而删除完整字典的审校资料。
