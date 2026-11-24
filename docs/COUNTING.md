# Counting records / 统计口径

The legacy **225/225** displayed coverage of a mixed catalogue: **222 historical nodes + 3 editorial guides**. It must not be described as 225 historical nodes. Old screenshots and dated update notes retain that historical state; do not rewrite them as current statistics.

旧版 **225/225** 表示混合目录覆盖，其中有 **222 个历史节点 + 3 篇导读**，不能写成 225 个历史节点。旧截图与有日期的更新记录保留旧版状态，不改写为当前统计。

The accepted November19 snapshot has:

- 336 timeline nodes + 55 contextual works = 391 history records.
- 391 historical accounts cover those 391 records. Coverage denominator excludes guides.
- 5 art-history guides are exported separately. Guide growth does not imply added historical events.
- 1,028 catalogue documents + 2 authored essays = 1,030 document entries.
- 417 stored entity IDs resolve to 416 canonical entities. Events reference 414 entity IDs, resolving to 413 canonical entities.

已验收的 11 月 19 日快照：336 个主线节点 + 55 项背景作品 = 391 条历史记录；391 篇历史正文覆盖这些记录；另有 5 篇艺术史导读。文献总数为 1,028 条编目 + 2 篇原创文章。417 个存储实体 ID 对应 416 个规范实体；事件引用 414 个实体 ID，对应 413 个规范实体。

The exporter generates `manifest.counts` and `site/lib/data/public-release.json` from records, never from hand-entered totals. The new data page uses those generated metrics. Existing explanatory prose containing totals is snapshot-specific, checked against that snapshot and reviewed on the next release.

导出器根据记录生成清单统计及站点公开版本统计，下载页直接读取这些数值。既有说明正文中的数量仅适用于该快照，下次发布时须同步审阅。
