# Public data model 1.0.0 / 公开数据模型

Each file contains a JSON array and a corresponding CSV. [manifest.json](../data/manifest.json) lists counts, licences, input hashes and SHA-256 for every download. Use JSON as the canonical format. Data version `2026.11.19` identifies the frozen research snapshot; Git commits identify software/export corrections. No DOI or immutable GitHub Release has yet been assigned.

每个集合提供 JSON 数组与 CSV；[清单](../data/manifest.json)记录数量、许可、输入哈希及各下载文件的 SHA-256。JSON 为标准结构。数据版本标识研究快照，Git 提交标识软件与导出修订。目前没有 DOI 或不可变 GitHub Release。

| Collection / 集合 | Stable key / 稳定键 | Meaning / 含义 |
| --- | --- | --- |
| cases | id | Ongoing case, dates, procedural status, event IDs / 案卷、日期、程序状态、事件 |
| events | id | Dated development; case_id and evidence source_id / 有日期的发展及证据链 |
| documents | id | Catalogue metadata, rights, source/event/case IDs / 文献编目及关联 |
| sources | id | Original URLs, source language, verification and locator / 原始链接、语言、核查与定位 |
| entities | id | Person/organisation, explicit canonical_id alias / 人物机构及显式别名 |
| genealogy | id (three-digit string / 三位字符串) | Main history node or contextual work / 历史主线或背景作品 |
| history-accounts | nodeId | Section-level bilingual historical account and local sources / 分段历史正文与内部来源 |
| authored-documents | id | Metadata for two authored essays; bodies remain in site source / 两篇原创文章目录，正文位于站点源码 |
| guides | id | Art-history guide prose, excluded from node counts / 艺术史导读，不计入节点 |

Text objects contain `zh`, `en`, and where available `original`, `original_language`, `translation_review`. Reviewed, pending and AI-assisted states retain their original meaning. History source objects are local to an account: `sourceIds: ["primary"]` is not an archive-wide `src-*` identifier.

文本对象包含中英文，适用时保留原文、原文语言、翻译审校状态。历史正文中的来源键局限于该正文，不能把 `primary` 当作全库来源 ID。

`genealogy.timeline_role` is `milestone` or `context`. `chronological_order` is a navigation value; `date_label`, `date_note` and `master_date_as_recorded` retain precision without inferring exact dates. `date_precision` explicitly describes this display-label representation. IDs are strings; do not open three-digit IDs as numbers in a spreadsheet.

历史记录区分主线与背景。排序值用于导航，日期显示、注释与原始日期保留实际精度，不推定具体日。ID 是字符串，表格导入时不要转为数字。

CSV: UTF-8 BOM; dictionaries flattened with dots; arrays encoded as JSON; null encoded as `null`; missing optional columns blank. Cells beginning with formula/control prefixes or a literal apostrophe receive a leading apostrophe. Therefore CSV is an analysis view, not a lossless reconstruction of JSON; the validator compares the exact defined encoding.

CSV 使用 UTF-8 BOM，对象以点号展平、数组编码为 JSON、null 写作 `null`、缺失可选列留空。公式或控制字符前缀及原有单引号前加单引号。因此 CSV 为分析视图，不是 JSON 的无损替代；校验器按上述规则逐字段核对。

The draft structural [JSON Schema](public-data.schema.json) documents the common envelope and history distinctions. Full cross-file integrity is enforced by `scripts/validate-data.py` and the site content validators. Schema acceptance alone does not certify research accuracy.

[JSON Schema](public-data.schema.json)描述通用结构与历史记录的区别；跨集合完整性由 Python 与站点校验器共同检查。Schema 通过不代表研究结论已证实。
