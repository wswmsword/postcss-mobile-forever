# Changelog
该文件记录项目的所有改动。

格式基于“[如何维护更新日志](https://keepachangelog.com/zh-CN/1.0.0/)”，
版本管理基于“[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)”。

## [Unreleased]

### Added
- 添加属性用于设置高度限制；
- 添加全宽注释用于在桌面端全宽展示部分元素；
- 兼容逻辑宽高的属性计算；

### Changed
- 插件更名；
- 插件拆分。

### Fixed
- 修复 `experimental.extract` 选项的热重载问题；
- 修复 `experimental.extract` 分割后加载后续插件问题；
- 修复自定义属性覆盖同一选择器内优先级更高的属性问题。

## [3.1.0] - 2023-03-26

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