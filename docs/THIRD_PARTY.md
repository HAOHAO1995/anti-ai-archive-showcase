# Third-party software / 第三方软件

Runtime and build dependencies retain their own licences. Exact versions and integrity hashes are in `site/package-lock.json`; installing them does not relicense them as archive research. Review upstream notices when redistributing a build.

运行与构建依赖沿用各自许可，精确版本与完整性哈希见锁文件。安装依赖不使其成为档案原创研究，分发构建时须保留上游声明。

`site/app/vendor/shadcn.css` is the shadcn 4.23.0 Tailwind animation stylesheet, retained with its MIT licence in `shadcn-LICENSE.md`. Vendoring this small file removes the unused shadcn command-line dependency and its dependency graph. Existing generated UI components use shadcn/Base UI patterns; preserve their upstream attribution where applicable.

样式目录保留 shadcn 4.23.0 的动画样式及 MIT 声明，从而移除运行时不需要的 CLI 依赖。既有生成式 UI 组件沿用 shadcn/Base UI 模式，适用时须保留上游署名。

Third-party media and source material follow the separate [rights policy](RIGHTS.md), not this software notice.

第三方媒体与来源材料遵循独立权利边界，不适用本软件声明。
