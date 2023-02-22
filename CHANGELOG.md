# Changelog
该文件记录项目的所有改动。

格式基于 [如何维护更新日志](https://keepachangelog.com/zh-CN/1.0.0/)，
版本管理基于 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed
- 修复桌面端和移动端横屏的 fixed 定位元素定位至视图外的问题；
- 合并相同样式的居中全宽的选择器；
- 在桌面端和移动端横屏将 vw 全部替换为 px；
- 在桌面端和移动端横屏将 fixed 定位的宽度相关的百分比属性全部替换为 px。

## [2.0.0] - 2023-02-20

### Changed
- 迁移至 postcss8.0.0；
- 宽度、高度断点的属性名称变更为 minDesktopDisplayWidth 和 maxLandscapeDisplayHeight；
- 属性过滤列表和选择器黑名单的作用范围从仅移动端竖屏调整至所有屏幕；
- 默认打开移动端竖屏转换。

## [1.3.2] - 2023-02-20

### Added
- 添加属性 mobileConfig.viewportUnit 用于移动端竖屏；
- 添加 `/* px-to-viewport-ignore */` 和 `/* px-to-viewport-ignore-next */`；

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
- 添加属性 unitPrecision 用于精确小数点；

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