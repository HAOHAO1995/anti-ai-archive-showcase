# Contributing / 参与

[Project overview / 项目首页](README.md) · [Methodology / 方法](docs/methodology.md)

You do not need to code. Submit public sources or specific corrections in Chinese, English or the source language. Editors review evidence and translations separately. / 无需会编程，可用中文、英文或来源原语言提交公开来源与具体勘误；证据核读与译文审校分别进行。

## Choose a form / 选择表单

| Contribution / 提交类型 | Form / 表单 |
| --- | --- |
| Missing / new source · 缺失或新增来源 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=new-source.yml) |
| Factual correction / 事实纠错 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=source-correction.yml) |
| Missing case / 缺失案例 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=missing-case.yml) |
| Broken link / 失效链接 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=broken-link.yml) |
| Translation correction / 翻译纠错 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=translation.yml) |
| Metadata correction / 元数据纠错 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=data-error.yml) |
| Missing event / 缺失事件 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=missing-event.yml) |
| Art-history node / 艺术史节点 | [Open / 打开](https://github.com/HAOHAO1995/anti-ai-archive-showcase/issues/new?template=genealogy-node.yml) |

For an unlisted question, use the existing general source/correction template or a blank Issue. / 其他问题可使用已有通用来源／勘误模板或空白 Issue。

## Include these details / 建议提供

1. **Archive page or case / 档案页面或案例：** URL or stable ID; mark a new record as not yet catalogued / 网址或稳定编号；新条目注明尚未编目。
2. **Original source URL / 原始来源网址：** provide publicly accessible evidence, not a private draft / 提供公开证据，不提交私有草稿。
3. **Publication date / 来源发布日期：** retain year/month/day precision and distinguish it from the event date; unknown is acceptable / 保留年、月、日精度并与事件日区分；未知可注明。
4. **Source language / 来源语言：** preserve original titles and distinguish official from archive translations / 保留原题，区分官方译本与档案翻译。
5. **Requested addition or correction / 建议补充或修正：** identify the current wording or field and the proposed change / 指明现有表述或字段及拟议修改。
6. **Optional context / 可选说明：** attribution, related records, review status or limitations / 归属、关联条目、审查状态或限制。

## Review and attribution / 核读与归属

Preserve uncertainty and chronology. A claim, announcement, filing, ruling, settlement and implementation are different states. A litigant’s allegation must not become a court finding. An opt-out label or stated safeguard does not automatically demonstrate technical effect.

保留不确定性与时间过程。主张、公告、诉状、裁判、和解、实施属于不同状态；当事方指控不能写成法院认定，退出标签或宣称的保障不自动证明技术效果。

For translations, give the original wording and proposed correction, and distinguish AI assistance from independent human review. Do not invent official language versions. Submissions are reviewed before inclusion; maintainers may ask for evidence, merge duplicates or explain a rejection.

翻译建议请附原文与拟议修正，区分 AI 辅助与独立人工审校，不虚构官方语言版本。提交经核读后决定是否收录；维护者可能要求补证、合并重复或说明不收录理由。

## Public boundaries / 公开边界

Issues are public. Do not submit sensitive personal information, credentials, private correspondence, unpublished source notes or third-party full texts. Submitting an Issue does not transfer copyright or grant a blanket reuse license; state relevant attribution and permissions for original contributions.

Issues 为公开内容。请勿提交敏感个人信息、凭据、私人通信、未公开来源笔记或第三方全文。提交 Issue 不等于转让著作权或授予整体复用许可；原创投稿请注明署名和相关授权。

A selective public snapshot is downloadable under `data/`; the complete internal dataset remains excluded. Report metadata problems through collection names, stable IDs, snapshot version and evidence. See the [public data release policy](docs/data-release-policy.md).

`data/` 提供选择性公开快照，完整内部数据集仍不公开。问题请提供集合、稳定 ID、快照版本与证据。参见[公开数据发布政策](docs/data-release-policy.md)。

[Existing introductory tasks / 已有入门任务](docs/GOOD_FIRST_ISSUES.md)


## Code and data changes / 代码与数据改动

Fork the repository, create a branch, make a focused change and submit a pull request. Run the commands in [Development](docs/DEVELOPMENT.md). A data correction must preserve IDs, specify the supporting original source and locator, explain date precision and procedural status, update bilingual versions and state translation-review limits. Do not edit generated exports alone; update the approved source and regenerate after maintainer review. Snapshot hash changes require an explicitly accepted research release.

Fork 后建立分支，提交范围明确的 PR，并运行开发指南中的检查。数据更正须保留 ID、给出原始来源与定位、说明日期精度和程序状态，同步双语并标明审校局限。不要只改生成文件，应修改获批准的来源并重新导出；更改快照哈希必须经过研究发布验收。

For pull-request contributions, submit only material you have the right to license. Original code contributions use MIT; original metadata and research text use CC BY 4.0. Preserve attribution and identify third-party material with its separate rights. This does not retroactively relicense existing issue submissions.

PR 仅提交你有权授权的材料。原创代码采用 MIT；原创编目与研究文字采用 CC BY 4.0。保留署名，第三方材料单列权利；这不追溯改变既有 issue 投稿的许可。
