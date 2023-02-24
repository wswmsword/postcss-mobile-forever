# postcss-mobile-first

在桌面端和移动端横屏展示移动端（竖屏）设计视图，确保移动端视图处处可访问。

您可以在线查看 [React 范例](https://wswmsword.github.io/examples/mobile-first/react/)、[Vue 范例](https://wswmsword.github.io/examples/mobile-first/vue/)或 [Svelte 范例](https://wswmsword.github.io/examples/mobile-first/svelte/)，通过旋转屏幕、改变窗口大小、在不同屏幕查看展示效果。范例顶部的文字会提示你，当前的视图是移动端竖屏（Portrait）、移动端横屏（Landscape）还是桌面端（Desktop）。

## 安装

npm 安装：
```bash
npm install --save-dev postcss postcss-mobile-first
```

yarn 安装：
```bash
yarn add -D postcss postcss-mobile-first
```

## 简介

本插件会**转换视口单位适配移动端竖屏，生成媒体查询（限制最大宽度）适配桌面端和移动端横屏**，最终移动端设计视图会按照小版心布局，居中展示在桌面端和移动端横屏，使得在非移动端竖屏的设备上也具备良好的展示效果，同时保持竖屏时的移动端视图。

> 您也可以通过配合 [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport/)（后简称 *px2vw*），把转换视口单位（适配移动端竖屏）的任务交给 *px2vw* 完成，然后打开本插件的 `disableMobile`，关闭本插件的视口单位转换功能。

本插件生成的媒体查询期望覆盖：
- 移动端竖屏，正常使用可伸缩（vw）的移动端竖屏视图；
- 移动端横屏，使用*居中的较小固定宽度*的移动端竖屏视图；
- 平板、笔记本、桌面端，使用*居中的较大固定宽度*的移动端竖屏视图；
- 穿戴设备，使用*可伸缩*（vw）的移动端竖屏视图。

## 演示效果

下面的三张图是使用本插件后，移动端、移动端横屏和桌面端的展示效果：

<table>
	<tr>
		<td><img src="./images/portrait.png" alt="移动端的展示效果" /></td>
		<td><img src="./images/landscape.png" alt="移动端横屏的展示效果" /></td>
	</tr>
	<tr>
		<td colspan="2"><img src="./images/desktop.png" alt="桌面端的展示效果" /></td>
	</tr>
</table>

在“范例”一节查看，源码中提供了范例，用于在本地运行后验证演示效果，或者您也可以查看文档开头的在线范例。

## 配置参数

| Name | Type | isRequired | Default | Desc |
|:--|:--|:--|:--|:--|
| viewportWidth | number\|(file: string, selector: string) => number | N | 750 | 设计图宽度，可以传递函数动态生成设计图宽度，例如 `file => file.includes("vant") ? 375 : 750` 表示在名称包含“vant”的文件内使用 375 的设计图宽度 |
| desktopWidth | number | N | 600 | 适配到桌面端时，展示的视图宽度 |
| landscapeWidth | number | N | 425 | 适配到移动端横屏时，展示的视图宽度 |
| minDesktopDisplayWidth | number | N | / | 宽度断点，如果不提供这个值，默认使用 `desktopWidth` 的值，视图大于这个宽度，则页面宽度是桌面端宽度 `desktopWidth`，“简介”一节具体介绍了该值的触发情况 |
| maxLandscapeDisplayHeight | number | N | 640 | 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度，“原理和输入输出范例”一节具体介绍了该值的触发情况 |
| rootClass | string | N | "root-class" | 页面最外层 class 选择器，用于设置在桌面端和移动端横屏时的居中样式 |
| border | boolean | N | false | 在页面外层展示边框吗，用于分辨居中的小版心布局和背景 |
| disableDesktop | boolean | N | false | 不做桌面端适配 |
| disableLandscape | boolean | N | false | 不做移动端横屏适配 |
| disableMobile | boolean | N | false | 不做移动端竖屏适配，把 px 转换为视口单位 vw |
| exclude | RegExp\|RegExp[] | N | null | 排除文件或文件夹 |
| include | RegExp\|RegExp[] | N | null | 包括文件或文件夹 |
| unitPrecision | number | N | 3 | 单位精确到小数点后几位？ |
| propList | string[] | N | ['*'] | 那些属性要替换，那些属性忽略？用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) |
| selectorBlackList | (string\|RegExp)[] | N | [] | 选择器黑名单，名单上的不转换，用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) |
| mobileConfig | { viewportUnit: string; fontViewportUnit: string; replace: boolean; } | N | { viewportUnit: "vw", fontViewportUnit: "vw", replace: true } | 移动端竖屏视口视图的配置，如果需要关闭，设置 disableMobile 为 true 即可关闭 |
| mobileConfig.viewportUnit | number | N | "vw" | 转换成什么视口单位？ |
| mobileConfig.fontViewportUnit | string | N | "vw" | 字体单位 |
| mobileConfig.replace | boolean | N | true | 直接替换属性值还是新增？ |

标记注释：
- `/* not-root-containing-block */`，标记在选择器上面，用于表示当前选择器所属元素的包含块不是最外层元素；
- `/* px-to-viewport-ignore-next */`，标记在一行属性的上面，表示下一行属性不需要进行转换；
- `/* px-to-viewport-ignore */`，标记在一行属性后面，表示当前行属性不需要进行转换。

下面是默认的配置参数：

```json
{
  "viewportWidth": 750,
  "desktopWidth": 600,
  "landscapeWidth": 425,
  "minDesktopDisplayWidth": null,
  "maxLandscapeDisplayHeight": 640,
  "rootClass": "root-class",
  "border": false,
  "disableDesktop": false,
  "disableLandscape": false,
  "disableMobile": false,
  "exclude": null,
  "include": null,
  "unitPrecision": 3,
  "selectorBlackList": [],
  "propList": ['*'],
  "mobileConfig": {
    "viewportUnit": "vw",
    "fontViewportUnit": "vw",
    "replace": true
  }
}
```

## 单元测试

```bash
npm install
npm run test
```

## 范例

文件夹 `example` 内提供了分别在 [React](https://reactjs.org/)、[Svelte](https://svelte.dev/) 和 [Vue](https://cn.vuejs.org/) 中使用 `postcss-mobile-first` 的范例，通过命令行进入对应的范例文件夹中，即可运行：

```bash
cd example/react/
npm install
npm run start
```

在“演示效果”一节中查看成功运行之后，不同屏幕的界面图片。

## 原理和输入输出范例

本插件会通过两个媒体查询断点创建可以代表桌面端和移动端横屏的媒体查询，然后找到所有的 px 值进行转换，默认情况会把原值转换成两个经过比例计算后的新 px 值，分别对应桌面端和移动端横屏。

两个断点分别是“宽度断点（X）”和“高度断点（Y）”，屏幕的高低（高度）变化触发高度断点，屏幕的宽窄（宽度）变化触发宽度断点。下面是触发断点的每种情况，以及和每种情况等效的端口（默认的高度断点是 640px，宽度断点是 600px）：

- 宽于 X（600）
	- 高于 Y（640），使用桌面宽度（平板、笔记本、桌面端）
	- 低于 Y，使用移动端横屏宽度（移动端横屏）
- 窄于 X
	- 横屏
		- 宽于 landscapeWidth（425）
			- 高于 Y，使用移动端横屏宽度（移动端横屏）
			- 低于 Y，使用移动端横屏宽度（移动端横屏）
		- 窄于 landscapeWidth，使用设计图宽度（穿戴设备）
	- 纵屏
		- 高于 Y，使用设计图宽度（移动端竖屏）
		- 低于 Y，使用设计图宽度（移动端竖屏）


关于转换至桌面端和移动端横屏时，对于定位为 fixed 的元素，并且百分比值受[包含块（Containing Block）](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block)影响的属性，下面列出了这些值的计算方法（插件默认 fixed 定位的元素的包含块为浏览器窗口（visual viewport），如果需要满足其它情况，请查看“注意事项”一节）：
- 属性是除了 left 和 right 的属性，单位使用 vw 或百分号（%），
	- 计算方式为 `idealClientWidth / 100 * number`；
- 属性是除了 left 和 right 的属性，单位使用 px，
	- 计算方式为 `idealClientWidth / viewportWidth * number`；
- 属性为 left 或 right，单位使用 vw 或百分号，
	- 计算方式为 `calc(50% + (idealClientWidth / 100 * number)px)`；
- 属性为 left 或 right，单位使用 px，
	- 计算方式为 `calc(50% - (idealClientWidth / 2 - number * idealClientWidth / viewportWidth)px)`。

下面是关于上面表达式的一些解释：
- idealClientWidth（理想客户端宽度）是属性表中的 desktopWidth 或 landscapeWidth；
- viewportWidth 即属性表中的 viewportWidth；
- number 即属性值里的长度数字；
- 对于包含块，“未考虑的其它情况”请查看“注意事项”一节；
- 包含块宽度影响的属性，请查看“其它”一节；
- 以上值的重新计算，目的是保证在非移动端竖屏时的界面和移动端竖屏一致。

下面是使用默认配置的输入输出内容。

输入：

```css
.root-class {
	width: 100%;
}

.nav {
	position: fixed;
	width: 100%;
	height: 72px;
	left: 0;
	top: 0;
}
```

输出：

```css
.root-class {
	width: 100%;
}

.nav {
	position: fixed;
	width   : 100%;
	height  : 9.6vw;
	left    : 0px;
	top     : 0px;
}

/* 桌面端媒体查询 */
@media (min-width: 600px) and (min-height: 640px) { /* 这里的 600 是默认值，可以自定义 */
	.root-class {
		max-width: 600px !important;
	}

	.nav {
		height: 57.6px;
		left  : calc(50% - 300px); /* calc(50% - (600 / 2 - 0 * 600 / 750)px) */
		width : 600px; /* 100% -> 600px */
	}
}

/* 移动端媒体查询 */
@media (min-width: 600px) and (max-height: 640px),
(max-width: 600px) and (min-width: 425px) and (orientation: landscape) { /* 这里的 640 和 425 是默认值，可自定义 */
	.root-class {
		max-width: 425px !important;
	}

	.nav {
		height: 40.8px;
		left  : calc(50% - 212.5px); /* calc(50% - (425 / 2 - 0 * 425 / 750)px) */
		width : 425px; /* 100% -> 425px */
	}
}

/* 桌面端和移动端公共的媒体查询 */
@media (min-width: 600px),
(orientation: landscape) and (max-width: 600px) and (min-width: 425px) {
	.root-class {
		margin-left: auto !important;
		margin-right: auto !important;
	}
}
```

## 期望效果

在不同设备上，[*duozhuayu.com*](https://www.duozhuayu.com/book) 做得很好，桌面端和移动端虽然基本公用一套 UI（移动端竖屏 UI），但访问无障碍，没有巨大字体和全宽的问题，因此这里用它作为期望目标。

下面的三张图分别是“多抓鱼“在移动端、移动端横屏和桌面端的展示效果：

<table>
	<tr>
		<td><img src="./images/dzy-portrait.png" alt="移动端的展示效果" /></td>
		<td><img src="./images/dzy-landscape.png" alt="移动端横屏的展示效果" /></td>
	</tr>
	<tr>
		<td colspan="2"><img src="./images/dzy-desktop.png" alt="桌面端的展示效果" /></td>
	</tr>
</table>

“多抓鱼”官网的最大宽度是 600px，小于这个宽度则向内挤压，大于这个宽度则居中移动端竖屏视图。从上面的展示效果来看，在不同的设备上，这种小版心布局仍然有不错的兼容性（展示效果）。

这样适配：
- 保证内容可用，不会出现视口单位导致的“大屏大字”问题；
- 在非前端适配方案失效时，前端有兜底自适应适配，终端用户仍可访问。

## 注意事项

属性值为 0 的情况，暂时无法转换媒体查询的值，需要用 0 加单位的形式代替，如 `0px`。

`root-class` 所在元素的居中属性会被占用，如果开启了 `border`，边框属性也会被占用，包括 `margin-left`、`margin-right`、`box-sizing`、`border-left`、`border-right`、`min-height`、`height`。

对于包含块，插件默认的处理方式不能处理下面的情况，如果某个情况设置在祖先元素上，那么当前定位为 fixed 元素的包含块就是那个祖先元素，而插件默认所有的 fixed 元素的包含块是浏览器窗口（visual viewport）：
- transform 或 perspective 的值不是 none；
- will-change 的值是 transform 或 perspective；
- filter 的值不是 none 或 will-change 的值是 filter（只在 Firefox 下生效）；
- contain 的值是 paint（例如：contain: paint;）；
- backdrop-filter 的值不是 none（例如：`backdrop-filter: blur(10px);`）。

如果希望插件处理 fixed 定位元素的非根元素的包含块，请在选择器上方添加注释，`/* not-root-containing-block */`，这样设置后，插件会知道这个选择器内的计算方式统一使用非根包含块的计算方式：

```css
/* not-root-containing-block */
.class {
	position: fixed;
	left: 50%;
}
```

插件转换的是选择器中的属性的值，不转换 [At 规则](https://developer.mozilla.org/zh-CN/docs/Web/CSS/At-rule)中的属性，例如 `@font-face` 中的属性。

本插件的目标是在不同尺寸的屏幕上展示**合适**的视图，在宽一点的屏幕上展示大一点的视图，在扁一点的屏幕上展示小一点的视图，在窄一些的屏幕展示移动端竖屏视图，而**非准确**地识别具体的设备或平台来应用对应视图。

## CHANGELOG

[查看更新日志。](./CHANGELOG.md)

## 版本规则

版本规则使用[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## 协议

协议使用 [MIT License](./LICENSE)。

## 其它

配套插件：
- postcss-px-to-viewport，[*‌https://github.com/evrone/postcss-px-to-viewport/*](https://github.com/evrone/postcss-px-to-viewport/)

百分比值受包含块（Containing Block）宽度影响的属性：`left`、`margin-bottom`、`margin-left`、`margin-right`、`margin-top`、`margin`、`max-width`、`min-width`、`padding-bottom`、`padding-left`、`padding-right`、`padding-top`、`padding`、`right`、`shape-margin`、`text-indent`、`width`。

相关链接：
- [Media Queries Level 3](https://www.w3.org/TR/mediaqueries-3/#syntax)，W3C Recommendation，05 April 2022；
- [CSS syntax validator](https://csstree.github.io/docs/validator.html)，遵守 W3C 标准的在线 CSS 语法检测器；
- [What are CSS percentages?](https://jameshfisher.com/2019/12/29/what-are-css-percentages/)，罗列了百分比取包含块（Containing Block）宽度的属性。
