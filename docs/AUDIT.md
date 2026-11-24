# Infrastructure audit / 基础设施审计

Baseline: target repository commit `35c5c65`, plus the accepted November19 public website snapshot through batch 1306. Later internal research and the failed November22 release candidate are not imported. This branch does not change the live site. The source hashes are fixed in [input-snapshot.json](input-snapshot.json).

基线为目标仓库提交 `35c5c65` 及已验收的 11 月 19 日公开站点快照（批次 1306）。不导入后续内部研究和未成功发布的 11 月 22 日候选；本分支不修改线上站点。输入哈希见清单。

| Area / 范围 | Finding and action / 发现与处理 |
| --- | --- |
| Repository architecture / 架构 | Existing remote had showcase documents, no site source or public dataset. Added `site/`, `data/`, deterministic `scripts/` and tests; private research remains separate. / 原远端仅展示文档；现分离源码、数据、脚本与测试。 |
| Dependencies / 依赖 | Independent baseline install reported 31 advisories including 4 critical; upgrade and CLI removal reduced the audited graph to 0. [Dated report](audits/dependencies-2026-11-24.json). This is a point-in-time result. / 基线 31 项含 4 项严重，修复后当前查询为 0。 |
| Counts / 数量 | Legacy 225 mixed 222 nodes with 3 guides. Export and new page separately count current 336 timeline nodes, 55 contextual works, 391 accounts and 5 guides. Entity aliasing explains 414 IDs versus 413 canonical event-linked entities. [Definitions](COUNTING.md). / 明确旧混合口径与新统计。 |
| Structured data / 数据 | Nine JSON/CSV collections, stable IDs, explicit history roles, checksums, schema, cross-references and unknown-date preservation. CSV formula prefixes escaped. / 九类导出、稳定 ID、角色、哈希、关联与未知日期保留。 |
| Evidence / 证据 | Validate event→case/source/document/entity references and section-local history citations. Preserve claim/procedural/review status. All-record independent source rereading is not claimed. / 校验关联与段落引用，不冒充全库独立核读。 |
| Bilingual content / 双语 | Existing structural checks plus export coverage preserve both languages and original metadata. 391 history translations remain pending review; 211 history source-verification states remain pending. [Recorded statuses](audits/evidence-2026-11-24.json). Human semantic review is outstanding. / 结构齐备不等于语义审校。 |
| Duplicates / 重复 | No exact same-date/normalised-title duplicates found by the export check. Eight shared-source/year groups are retained as manual candidates, not auto-merged. [Queue](audits/evidence-2026-11-24.json). / 精确重复未发现，八组共享来源待人工判断。 |
| Source links / 外链 | Host-diverse sample of 200 / 2,200 unique source URLs: 142 available, 28 access-restricted, 27 unresolved and 3 HTTP404 candidates. The three candidates remain in the correction queue; original evidence URLs are preserved. [Results](audits/links-2026-11-24.json). The remaining 2,000 URLs are not represented as checked. / 有限抽查，不宣称全网已核查。 |
| SEO / 检索 | Existing canonical/hreflang/robots preserved; removed sitemap dependency on private maintenance files and inaccurate hard-coded modification dates. Added bilingual data route and Dataset/DataDownload metadata. / 保留语言与规范链接，清除私有构建依赖及错误固定修改日期。 |
| Client bundle / 客户端体积 | Separate rendering strings from full translation provenance; largest compiled JS asset 16,270,828 → 11,580,759 bytes (28.8% smaller; gzip 11.8% smaller). [Measurement](audits/client-bundle-2026-11-24.json). Full research metadata and all display values retained. / 分离渲染字典，保留完整元数据与双语值。 |
| Accessibility / 无障碍 | Preserve keyboard skip link, focus states, reduced motion and selected-item behaviour. Browser audit found low-contrast light-theme year/sidebar text; corrected using theme variables. [Browser report](audits/browser-2026-11-24.json): 20 route/viewport/theme combinations passed, with 18 download hashes verified. Automated WCAG checks are sampled, not certification. / 修复实测对比度问题，不宣称完整认证。 |
| Mobile / 手机 | Test 390px and 1440px; new data page wraps long citations and hides the irrelevant floating history rail. Existing reading-room interaction regressions retained. / 测试窄屏与桌面，数据页避免浮动时间线遮挡。 |
| Rights / 权利 | MIT software, CC BY 4.0 original metadata/research. Third-party media excluded from source download and resolved from existing public origin; no offline-media promise. [Rights](RIGHTS.md). / 第三方媒体另列，不承诺离线完整。 |
| Deployment / 部署 | Local Worker has no production domain/account binding. Removed historical private release/prefill/notification utilities; CI cannot deploy. / 去除私有发布工具，CI 不部署。 |

## Remaining research and release boundaries / 待办边界

- Pending source and translation reviews need subject experts; code cannot certify them. Shared-source candidates need entry-by-entry decisions.
- This public snapshot intentionally stops at November19. Reconcile later accepted research in a separate versioned release.
- Source media availability depends on the existing site and original holders. Obtain permissions before bundling more media.
- A GitHub branch/PR is reviewable work, not a tagged release, DOI deposit or accepted production deployment. Review the concrete changes before merging/deploying.

事实与译文待领域专家审阅；疑似重复须逐条判断；后续研究另行发布；媒体依赖现有站点与权利人；GitHub 分支/PR 不等于标签版本、DOI 或线上验收。
