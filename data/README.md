# Public research snapshot / 公开研究快照

Version **2026.11.19**, derived from the accepted public website through batch 1306. Use [manifest.json](manifest.json) for counts and SHA-256. Download same-name `.json` or `.csv` files. This directory excludes the full internal research archive and third-party full texts/media.

版本 **2026.11.19** 来自批次 1306 的已验收公开站点。清单提供数量与哈希，各集合有同名 JSON/CSV。不含完整内部研究库或第三方全文、媒体。

[Model / 模型](../docs/DATA_MODEL.md) · [Counting / 数量](../docs/COUNTING.md) · [Licence / 许可](../DATA_LICENSE.md) · [Method / 方法](../METHODOLOGY.md)

```python
import json
from pathlib import Path
p = Path("data")
events = json.loads((p / "events.json").read_text())
sources = {r["id"]: r for r in json.loads((p / "sources.json").read_text())}
for evidence in events[0]["evidence"]:
    source = sources[evidence["source_id"]]
    print(evidence["claim"]["en"], evidence["locator"]["en"], source["original_url"])
```

Run `python3 examples/read_evidence.py` from the repository root for a complete evidence-chain example. Cite the snapshot version, collection, stable ID, commit and original evidence. Preserve pending reviews when reusing results.

在仓库根目录运行上述示例脚本，可读取完整证据链。引用须注明版本、集合、稳定 ID、提交和原始证据，复用时保留待审状态。
