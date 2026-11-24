# Working on ANTI-AI ARCHIVE / 档案维护

Preserve the research identity, stable IDs, original-source attribution and bilingual substantive content. The dispute chronology and generative-art history are related but distinct tracks. Follow [METHODOLOGY](METHODOLOGY.md), [data model](docs/DATA_MODEL.md) and [counting rules](docs/COUNTING.md).

保留研究身份、稳定 ID、原始出处与双语正文。争议编年和生成艺术史相互关联但分开编目，遵循研究方法、数据模型与统计口径。

`docs/input-snapshot.json` pins the approved public research inputs. Do not replace them with newer private or unaccepted research merely to make an export pass. Correct approved inputs deliberately, preserve correction history and review metadata, then version and regenerate. Never auto-merge entries solely on shared titles or URLs; do not infer dates from access/ingest timestamps. Preserve pending translation and fact-review labels.

公开输入经过固定，不可为通过检查而替换为较新私有或未验收研究。更正须保留历史与审校状态，明确版本并重新生成；不能仅凭标题或链接合并，不能从访问或入库时间推定事件日期。

Generated JSON/CSV and client metadata must agree with their source. Keep the full translation research catalogue separate from the compact browser rendering dictionary; verify every key and both language values. Use the checks in [Development](docs/DEVELOPMENT.md), including relevant browser regressions for UI changes. Preserve light/dark themes, mobile reading controls, keyboard focus and explicitly selected historical records across scrolling/resizing.

生成数据与客户端元数据须与来源一致。完整翻译研究字典与浏览器显示字典分开，逐键验证双语值；UI 修改运行相关浏览器回归，保留主题、手机阅读控制、键盘与选择状态。

Software is MIT; original metadata/research is CC BY 4.0. Third-party media/text retain their own rights. Do not add credentials, private research, generated environments or unlicensed media. CI performs checks and does not publish. Keep repository changes distinct from an accepted production deployment or DOI release.

代码 MIT、原创编目研究 CC BY 4.0，第三方材料另有权利。不得提交凭据、私有研究、运行环境或未授权媒体。CI 只校验；仓库改动与生产部署、DOI 发布分别记录。
