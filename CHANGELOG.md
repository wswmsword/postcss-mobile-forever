# Changelog
该文件记录项目的所有改动。

格式基于“[如何维护更新日志](https://keepachangelog.com/zh-CN/1.0.0/)”，
版本管理基于“[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)”。

## [Unreleased]

### Added

- 添加选项用于关闭 `calc` 的应用以提高兼容性。

### Fixed

- 修复 `experimental.extract` 选项的热重载问题；
- 修复 `experimental.extract` 分割后加载后续插件问题。

## [4.3.2] - 2025-01-11

### Fixed

- 修复函数 viewportWidth 入参为 `undefined` 问题，[#69](https://github.com/wswmsword/postcss-mobile-forever/issues/69)。

## [4.3.1] - 2024-11-29

### Fixed

- 修复 rem-mode 下 fixed 定位的元素，并且该元素和包含块宽度相关，长度没有单位时被转换成 “123” 的问题，[#62](https://github.com/wswmsword/postcss-mobile-forever/issues/62)。

## [4.3.0] - 2024-11-21

### Added

- 新增 *rem-mode*，通过 rem 结合 vw 和媒体查询，限制伸缩视图最大宽度，相比 *vw-mode* 有更高兼容性和更小产包；
- 新增 `basicRemWidth` 选项。

## [4.2.4] - 2024-11-03

### Fixed

- 修复矫正 `fixed` 定位时，`left` 和 `right` 尺寸超过视图一半时的计算错误；
- 修复矫正定位的尺寸精度错误。

## [4.2.3] - 2024-10-23

### Fixed

- 修复 At 规则下的属性不转换、导致报错问题，[#59](https://github.com/wswmsword/postcss-mobile-forever/issues/59)。

### Changed

- 移除 `viewportWidth` 函数入参的第二个 `selector` 参数。

## [4.2.2] - 2024-10-22

### Changed

- 在添加居中样式时，将生成的代码添加到原始代码之前（append -> prepend），便于使用者覆盖插件生成的代码。

## [4.2.1] - 2024-10-18

### Fixed

- 修复 vw-mode、max-vw-mode 中依赖根包含块宽度的属性转换成 NaN 的问题。

## [4.2.0] - 2024-10-17

### Added

- 支持 vw-mode 和 max-vw-mode 时 At 规则中的样式转换，[#51](https://github.com/wswmsword/postcss-mobile-forever/issues/51)。

### Changed

- 分割 mq-mode 媒体查询模式的实现，引入 3 个模式，vw-mode、mq-mode、max-vw-mode。

## [4.1.6] - 2024-09-05

### Fixed

- 修复存在多个 `@keyframes` 时只转换第一个 `@keyframes` 的问题。

## [4.1.5] - 2024-07-10

### Fixed

- 修复 `@keyframes` 不转换问题，[#44](https://github.com/wswmsword/postcss-mobile-forever/issues/44)。

## [4.1.4] - 2024-05-26

### Fixed

- 打开 border 选项后，原先添加的 `100vh` 会导致移动端浏览器会出现滚动条问题，[#40](https://github.com/wswmsword/postcss-mobile-forever/issues/40)。

## [4.1.3] - 2024-04-30

### Fixed

- 打开 border 选项后，使用 `box-shadow` 模拟 `border` 属性，避免在移动设备上左右两侧边框占用 2 像素宽度，[#36](https://github.com/wswmsword/postcss-mobile-forever/issues/36)。

## [4.1.2] - 2024-03-08

### Fixed

- 修复不转换 CSS 函数 `var()` 回退值的问题，[#25](https://github.com/wswmsword/postcss-mobile-forever/issues/25)。

## [4.1.1] - 2024-01-10

### Fixed

- 添加 appContainingBlock、necessarySelectorWhenAuto、minDisplayWidth 类型定义。

## [4.1.0] - 2024-01-09

### Added

- 添加选项 appContainingBlock，值为 `'manual'|'auto'|'calc'`，默认为 `calc`，用于指定通过插件主动计算的方式，矫正 `fixed` 定位的元素;
- 添加选项 necessarySelectorWhenAuto，用于值为 `auto` 的 appContainingBlock。

## [4.0.1] - 2024-01-03

### Added

- 支持限制最小宽度（实验），`experimental.minDisplayWidth`，[#14](https://github.com/wswmsword/postcss-mobile-forever/issues/14)、[#21](https://github.com/wswmsword/postcss-mobile-forever/issues/21)。

## [4.0.0] - 2023-08-11

### Changed

- 使用 CSS 函数作为默认限制最大宽度的默认方法，其次为媒体查询；
- rootSelector 更名为 appSelector。

### Added

- 支持逻辑宽的属性计算，例如横向书写模式下的 inline-size、纵向书写模式下的 block-size；
- 添加选项 enableMediaQuery，用于打开媒体查询模式，否则默认为 max-display-width 模式；
- 添加选项 verticalWritingSelectorList，用于添加没有标明属性 `writing-mode`，但是是纵向书写模式的选择器；
- 添加选项 `comment.verticalWritingMode`，使用注释，表明某个选择器是纵向书写模式。

## [3.4.2] - 2023-07-21
### Fixed

- 移除 npm 包内的 `example/` 文件夹，减小体积、加快下载速度。

## [3.4.1] - 2023-07-21

### Fixed

- 移除 npm 包内的 `images/` 文件夹，减小体积、加快下载速度。

## [3.4.0] - 2023-07-21

### Added

- 添加属性黑名单 propertyBlackList；
- 优化 side.width 选项，当某个侧边选择器内存在 width 属性的时候，且值类似 `12px`、`12vw`，直接取该值作为 side.width；
- 添加 side.width1、side.width2、side.width3、side.width4。

## [3.3.2] - 2023-05-08

### Fixed

- 修复在打开选项 maxDisplayWidth 时，会在根元素陷入死循环问题；
- 修复在打开选项 maxDisplayWidth 时，选项 border 的功能和预期相反的问题。

## [3.3.1] - 2023-04-21

### Fixed

- 添加 valueBlackList 类型定义。

## [3.3.0] - 2023-04-21

### Added

- 添加选项 valueBlackList，指定的值不进行转换，例如可以指定 `["1px solid black"]`，指定之后本地和引入的仓库样式包含 `1px solid black` 的值都将不被转换，[#7](https://github.com/wswmsword/postcss-mobile-forever/issues/7)。

## [3.2.3] - 2023-04-18

### Fixed

- 修复 viewportWidth 选项是函数的配置下，非包含块属性的值在桌面端和横屏会被转换为 `NaN` 的问题，[#6](https://github.com/wswmsword/postcss-mobile-forever/issues/6)。

## [3.2.2] - 2023-04-10

### Fixed

- 修复十六进制颜色值的尾部包含数字可能被转换的问题，[#4](https://github.com/wswmsword/postcss-mobile-forever/issues/4)。

## [3.2.1] - 2023-03-29

### Fixed

- 修复共享媒体查询的属性，会覆盖原选择器中更高优先级的属性的问题。

## [3.2.0] - 2023-03-26

### Added

- 添加 `customLengthProperty` 选项，用于解决 css 变量的转换问题。

## [3.1.0] - 2023-03-25

### Added

- 添加 `experimental.extract` 选项，用于拆分桌面端与横屏样式，用于代码分割优化产包。

## [3.0.0] - 2023-03-12

### Changed

- 整理入参；
- 删除 fontViewportUnit、replace；
- 删除 rootSelector；
- mobileConfig.viewportUnit 重命名为 mobileUnit；
- sideConfig 重命名为 side；
- 更换 ignoreNext 和 ignoreLine 的默认值。

## [2.4.1] - 2023-03-11

### Fixed

- 更新类型包。

## [2.4.0] - 2023-03-10

### Added

- 添加自定义注释；
- 新增桌面端或移动端横屏空白区域填充内容，如在左右空白区域放置原视图内的部分信息。

### Fixed

- 修复生成 `.0` 的问题；
- 修复正则匹配 css 变量中单位问题；
- 修复属性覆盖问题，使用 `/* apply-without-convert */` 防止覆盖，例如 `left: 10px;` 覆盖 `left: auto;` 的问题。

## [2.3.3] - 2023-03-07

### Added

- 添加参数用于识别某选择器的包含块是根元素，例如第三方库的根元素包含块选择器属性计算。

## [2.3.2] - 2023-03-04

### Added

- 添加 TypeScript 声明文件。

## [2.3.1] - 2023-03-03

### Fixed

- 修复 CSS 变量（`var(...)`）被相同属性的非 CSS 变量的值覆盖的问题。

## [2.3.0] - 2023-03-03

### Added

- 添加 maxDisplayWidth 参数，限制视口单位的最大宽度，弥补媒体查询的还原度问题；
- 添加注释用于确认当前元素是根包含块，`/* root-containing-block */`。

### Fixed

- 修复 fixed 定位元素 left 或 right 属性在值的单位为百分号时计算错误问题；
- 修复非 fixed 定位元素的属性值为百分号时计算错误问题。

## [2.2.2] - 2023-03-01

### Fixed

- 修复源码包含媒体查询导致剩余代码未转换的问题。

### Added

- 添加 border 参数传递颜色字符串，用于设置边框颜色。

## [2.2.1] - 2023-02-27

### Docs

- 更新文档。

## [2.2.0] - 2023-02-27

### Added

- 处理不带单位的纯数字，如 0；
- 添加根元素选择器参数 rootSelector。

### Fixed

- 修复媒体查询中缩写属性（padding）覆盖媒体查询外非缩写属性（padding-top）问题。

## [2.1.2] - 2023-02-25

### Changed

- 项目名称使用 postcss-mobile-forever 替换 postcss-mobile-to-multi-displays。

## [2.1.1] - 2023-02-24

### Fixed

- 修复视口宽度无法设置函数问题；
- 修复转换受 At 规则影响的问题。

## [2.1.0] - 2023-02-23

### Changed

- 移除 pass1px 属性。

### Added

- 非移动端竖屏，fixed 定位的百分比元素可正常定位至视图内；
- 非移动端竖屏，fixed 定位的视口单位元素可正常定位至视图内；
- 非移动端竖屏，视口单位转换为 px；
- 添加注释 `/* not-root-containing-block */`，非移动端竖屏，对于 fixed 定位的元素，非根部包含块的选择器使用该注释进行标记，否则默认元素的包含块为浏览器窗口（visual viewport）。

## [2.0.0] - 2023-02-20

### Changed

- 迁移至 postcss8.0.0；
- 宽度、高度断点的属性名称变更为 minDesktopDisplayWidth 和 maxLandscapeDisplayHeight；
- 属性过滤列表和选择器黑名单的作用范围从仅移动端竖屏调整至所有屏幕；
- 默认打开移动端竖屏转换。

## [1.3.2] - 2023-02-20

### Added

- 添加属性 mobileConfig.viewportUnit 用于移动端竖屏；
- 添加 `/* px-to-viewport-ignore */` 和 `/* px-to-viewport-ignore-next */`。

### Fixed

- 修复穿戴设备屏幕上的显示效果。

## [1.3.1] - 2023-02-19

### Added

- 属性 viewportWidth 允许传入函数。

## [1.3.0] - 2023-02-18

### Added

- 添加移动端竖屏的配置属性。

## [1.2.0] - 2023-02-17

### Added

- 添加移动端竖屏转换视口单位功能；
- 添加属性 unitPrecision 用于精确小数点。

### Fixed

- 修复完善正则匹配，不匹配 url、单引号、双引号里的值。

## [1.1.0] - 2023-02-15

### Added

- 添加属性 include 和 exclude 过滤条件。

## [1.0.2] - 2023-02-14

### Added

- 添加 Vue 和 Svelte 范例。

### Fixed

- 修复媒体查询的“或者”问题、遗漏“px”问题。

## [1.0.1] - 2023-02-13

### Added

- 添加 React 范例。

### Fixed

- 修复 px 正则；
- 修复 1px 转换问题。

## [1.0.0] - 2023-02-11