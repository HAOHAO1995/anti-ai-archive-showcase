# Research method / 研究方法

The archive records AI-related artistic practices, resistance, negotiation and institutional change. The 2022–2026 dispute chronology and the longer generative-art history are related research tracks, not interchangeable datasets. The public snapshot is selective, geographically uneven and incomplete. See the retained [research methodology](docs/methodology.md).

档案研究 AI 艺术实践、抵抗、协商与制度变化。2022—2026 年争议编年与更长时段的生成艺术史相互关联，但不能视为同一个数据集。公开快照经过选择，地区覆盖不均，尚不完整；另见保留的[研究方法](docs/methodology.md)。

## Evidence / 证据

An event retains its case ID, procedural status, claim status, evidence claim, source ID and locator. A proposal, filing, judgment, agreement, effective date and an actor's own statement are distinct stages. A source classified primary can still be interested, incomplete or disputed. `source-checked` records a research workflow; it does not certify legal finality, the truth of every assertion or independent replication.

事件保留案例 ID、程序状态、主张状态、证据主张、来源 ID 与定位。提案、起诉、裁判、协议、生效与参与方自述是不同阶段。原始来源也可能具有利益立场、残缺或争议。`source-checked` 表示研究流程，不等于法律终局、全部主张真实或独立复核。

Historical account sections reference their own local source IDs, separate from archive-wide source IDs. Interpretation and limitations remain visible. The export retains `factReview`, `translationReview`, `translationOrigin`, revision and related-record fields; these must not be silently promoted to reviewed.

历史正文的段落引用使用正文内部的来源 ID，与全库来源 ID 区分。保留解释与局限，以及事实审校、翻译审校、翻译来源、版本和相关条目字段，不得默默升级审校状态。

## Dates and identity / 日期与身份

Event and document ISO dates have explicit day/month/year/unknown precision. Unknown publication dates become JSON null with `date_as_recorded` retained; no date is inferred from an access date. History dates remain bilingual display labels and original date notes: ranges, multiple dates and approximate dates are not forced into a fictitious exact ISO date. Numerical history order is for navigation, not evidence of influence.

事件与文献的 ISO 日期注明日、月、年或未知精度。未知发布日期导出为 null，并保留原始写法，不从访问日期推定。历史日期保留双语显示与原注，不将区间、多个日期和约略日期压成虚构的精确日期。排序数值用于导航，不证明影响关系。

Stable IDs do not change when chronological position changes. Preserve existing aliases explicitly. Never merge records on title or shared URL alone; one source may support different procedural stages. Corrections should append an explanation and retain prior releases.

稳定 ID 不随排序改变。既有别名须明示保留。不能仅因标题或链接相同就合并：同一来源可能支持不同程序阶段。更正应追加说明，保留旧版。

## Language and rights / 语言与权利

ZH/EN fields are checked structurally; original titles and names remain separately attributed. AI-assisted translations retain their review labels. Automated checks cannot establish semantic equivalence or replace a bilingual subject expert. Third-party full texts and media are outside the data licence. See [rights](docs/RIGHTS.md).

校验中英文结构齐备，同时保留原题与原名。AI 辅助翻译保留审校标签。自动检查无法证明语义一致，不能取代双语领域专家。第三方全文与媒体不属于数据许可，详见[权利边界](docs/RIGHTS.md)。

## Reproducibility / 可复现性

The initial public export is pinned to the accepted 2026-11-19 website snapshot (through research batch 1306). Its input hash is enforced by the exporter. It intentionally excludes later internal research and the unaccepted November22 deployment candidate. JSON/CSV generation is deterministic; CI checks byte-for-byte regeneration, references, real calendar dates, formula-safe CSV parity and test fixtures that deliberately corrupt data. HTTP auditing reports a dated, bounded sample; 403/429/network errors are unresolved availability, not evidence of disappearance.

首次公开导出固定到已验收的 2026-11-19 网站快照（研究批次 1306），导出器强制检查输入哈希。排除后续内部研究及未验收的 11 月 22 日候选版本。JSON/CSV 确定性生成，CI 对比重建字节、关联、真实日历日期、CSV 安全与内容一致性，并使用故意损坏数据的测试。HTTP 审计只报告有日期的有限样本；403、429 和网络错误表示可用性未决，不等于来源消失。
