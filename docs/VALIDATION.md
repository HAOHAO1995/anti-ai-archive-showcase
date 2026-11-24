# Validation record / 验证记录

Local checks on 2026-11-24, against the infrastructure branch:

- Deterministic export regeneration: no diff in generated data or public release metrics.
- Data validator: no errors in IDs, references, evidence mappings, required fields, calendar dates, history roles, CSV encoding/parity or hashes.
- Python regression tests: 5 passed, including deliberate duplicate-ID, missing-source, impossible-date, missing-language and checksum corruption.
- Website checks: translation coverage, content/provenance checks, TypeScript and 118 tests passed.
- Production build passed using the upgraded locked dependencies.
- Chromium: 20 sampled combinations across 390/1440px and light/dark, including ZH/EN data pages. No recorded page errors, horizontal overflow or automated WCAG A/AA violations. Keyboard skip links and canonical/language alternatives passed. All 18 JSON/CSV downloads matched the manifest.
- npm audit: baseline 31 advisories; final recorded audit 0. This is a dated database result, not a security guarantee.
- Source links: 200 of 2,200 unique URLs checked; 142 available, 28 restricted, 27 unresolved and 3 HTTP404 candidates. Remaining URLs are untested.

本轮本地验证：确定性导出无差异；数据校验无错误；5 项 Python 损坏数据回归、双语覆盖与内容检查、类型检查及 118 项网站测试通过；升级后构建通过。Chromium 完成 20 个手机/桌面、亮/暗组合，未记录页面错误、横向溢出或自动无障碍违规，键盘与检索标签通过，18 个下载哈希全部一致。当前依赖审计为 0；200 条外链抽查发现 3 个 HTTP404 候选。自动验证不是完整安全、语义、事实或无障碍认证。

Detailed reports are linked in [AUDIT](AUDIT.md). CI reruns these checks independently on pushes and pull requests; a local pass is not a claim that the GitHub run has completed. Later dependency/content changes require renewed relevant checks.

详细报告见审计文档；CI 在 push/PR 时独立重跑。本地通过不代表远程 CI 已完成，后续改动须重跑相关检查。

Translation projection: all source keys and both ZH/EN values match the full catalogue; see the measured client-bundle report in AUDIT. 翻译投影逐键、逐语言匹配完整字典，体积测量见审计。
