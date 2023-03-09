# postcss-mobile-forever

<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS" width="90" height="90" align="right">

一款 PostCSS 插件，用于转换视口单位，限制视图最大宽度，生成屏幕媒体查询，让移动端视图处处可访问。

您可以在线查看 [React 范例](https://wswmsword.github.io/examples/mobile-forever/react/)、[Vue 范例](https://wswmsword.github.io/examples/mobile-forever/vue/)或 [Svelte 范例](https://wswmsword.github.io/examples/mobile-forever/svelte/)，通过旋转屏幕、改变窗口大小、在不同屏幕查看展示效果。范例顶部的文字会提示您，当前的视图是移动端竖屏（Portrait）、移动端横屏（Landscape）还是桌面端（Desktop）。

## 安装

npm 安装：
```bash
npm install --save-dev postcss postcss-mobile-forever
```

yarn 安装：
```bash
yarn add -D postcss postcss-mobile-forever
```
<details>
<summary>
安装之后在 `postcss.config.js` 配置文件中引入，或者其它框架配置文件中引入。
</summary>

```javascript
import mobile from 'postcss-mobile-forever' // <---- 这里
import autoprefixer from 'autoprefixer'
// 省略……
{
	postcss: {
		plugins: [
			autoprefixer(),
			mobile({ // <---- 这里
				rootSelector: '#app',
				viewportWidth: 375,
				border: false,
			}),
		],
	},
}
// 省略……
```
</details>

## 简介

插件使用两种方法让移动端视图处处可访问，第一种方法生成媒体查询，第二种方法限制视口单位的最大值：
- 第一种方法**转换用于移动端视图的视口单位，生成用于桌面端和横屏的媒体查询**，移动端视图会以合适的宽度，居中展示在竖屏、横屏和桌面端宽度的屏幕上，这种方法覆盖广；
- 第二种方法**在转换视口单位的同时，限制视图的最大宽度**，当视图超过指定宽度，视图将以指定宽度居中于屏幕，这种方法代码量小。

<details>
<summary>
插件生成的媒体查询，期望覆盖手机、平板、笔记本，以及竖屏或横屏的各种屏幕。
</summary>

- 移动端竖屏，正常使用可伸缩（vw）的移动端竖屏视图；
- 移动端横屏，使用*居中的较小固定宽度*的移动端竖屏视图；
- 平板、笔记本、桌面端，使用*居中的较大固定宽度*的移动端竖屏视图；
- 穿戴设备，使用*可伸缩*（vw）的移动端竖屏视图。
</details>

> 您也可以通过配合 [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport/)（后简称 *px2vw*），把转换视口单位（适配移动端竖屏）的任务交给 *px2vw* 完成，然后打开本插件的 `disableMobile`，关闭本插件的视口单位转换功能。

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
| maxDisplayWidth | number | N | null | 限制视口单位的最大宽度，使用该参数不可以打开 `disableMobile` |
| desktopWidth | number | N | 600 | 适配到桌面端时，展示的视图宽度 |
| landscapeWidth | number | N | 425 | 适配到移动端横屏时，展示的视图宽度 |
| minDesktopDisplayWidth | number | N | / | 宽度断点，如果不提供这个值，默认使用 `desktopWidth` 的值，视图大于这个宽度，则页面宽度是桌面端宽度 `desktopWidth`，“简介”一节具体介绍了该值的触发情况 |
| maxLandscapeDisplayHeight | number | N | 640 | 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度，“原理和输入输出范例”一节具体介绍了该值的触发情况 |
| rootClass | string | N | "root-class" | 页面最外层 class 选择器，用于设置在桌面端和移动端横屏时的居中样式，将在下个主版本发布后删除，请使用 rootSelector |
| rootSelector | string | N | null | 页面最外层选择器，例如“`#app`”，用于设置在桌面端和移动端横屏时的居中样式，优先级高于 rootClass |
| border | boolean\|string | N | false | 在页面外层展示边框吗，用于分辨居中的小版心布局和背景，可以设置颜色字符串 |
| disableDesktop | boolean | N | false | 打开则不做桌面端适配 |
| disableLandscape | boolean | N | false | 打开则不做移动端横屏适配 |
| disableMobile | boolean | N | false | 打开则不做移动端竖屏适配，把 px 转换为视口单位，如 vw |
| exclude | RegExp\|RegExp[] | N | null | 排除文件或文件夹 |
| include | RegExp\|RegExp[] | N | null | 包括文件或文件夹 |
| unitPrecision | number | N | 3 | 单位精确到小数点后几位？ |
| propList | string[] | N | ['*'] | 哪些属性要替换，哪些属性忽略？用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) |
| selectorBlackList | (string\|RegExp)[] | N | [] | 选择器黑名单，名单上的不转换，用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) |
| rootContainingBlockSelectorList | (string\|RegExp)[] | N | [] | 包含块是根元素的选择器列表，效果和标注注释 `/* root-containing-block */` 相同 |
| mobileConfig | { viewportUnit: string; fontViewportUnit: string; replace: boolean; } | N | { viewportUnit: "vw", fontViewportUnit: "vw", replace: true } | 移动端竖屏视口视图的配置，如果需要关闭，设置 disableMobile 为 true 即可关闭 |
| mobileConfig.viewportUnit | number | N | "vw" | 转换成什么视口单位？ |
| mobileConfig.fontViewportUnit | string | N | "vw" | 字体单位 |
| mobileConfig.replace | boolean | N | true | 直接替换属性值还是新增？ |

> 插件默认将生成桌面端和横屏的媒体查询，可以通过参数 `disableDesktop` 和 `disableLandscape` 关闭，这是第一种限制视口单位宽度的方法。第二种方法是设置 `maxDisplayWidth`，并打开 `disableDesktop` 和 `disableLandscape`，这种方法不会生成媒体查询，但是同样会限制视口宽度。

下面是默认的配置参数：

```json
{
  "viewportWidth": 750,
  "maxDisplayWidth": null,
  "desktopWidth": 600,
  "landscapeWidth": 425,
  "minDesktopDisplayWidth": null,
  "maxLandscapeDisplayHeight": 640,
  "rootClass": "root-class",
  "rootSelector": null,
  "border": false,
  "disableDesktop": false,
  "disableLandscape": false,
  "disableMobile": false,
  "exclude": null,
  "include": null,
  "unitPrecision": 3,
  "selectorBlackList": [],
  "rootContainingBlockSelectorList": [],
  "propList": ['*'],
  "mobileConfig": {
    "viewportUnit": "vw",
    "fontViewportUnit": "vw",
    "replace": true
  }
}
```

标记注释：
- `/* root-containing-block */`，标记在选择器上面，用于表示当前选择器的包含块是根元素，是浏览器窗口（如果选择器中已有“`position: fixed;`”，则无需标注该注释）；
- `/* not-root-containing-block */`，标记在选择器上面，用于表示当前选择器所属元素的包含块不是根元素；
- `/* px-to-viewport-ignore-next */`，标记在一行属性的上面，表示下一行属性不需要进行转换；
- `/* px-to-viewport-ignore */`，标记在一行属性后面，表示当前行属性不需要进行转换。

## 单元测试

```bash
npm install
npm run test
```

## 范例

文件夹 `example` 内提供了分别在 [React](https://reactjs.org/)、[Svelte](https://svelte.dev/) 和 [Vue](https://cn.vuejs.org/) 中使用 `postcss-mobile-forever` 的范例，通过命令行进入对应的范例文件夹中，即可运行：

```bash
cd example/react/
npm install
npm run start
```

在“演示效果”一节中查看成功运行之后，不同屏幕的界面图片。

## 原理和输入输出范例

下面会介绍关于媒体查询、限制最大宽度和 fixed 定位时的计算这三个主题，以及展示输入输出范例。

---

本插件会创建可以代表桌面端和移动端横屏的两个媒体查询，然后找到所有的 px 值进行转换，默认情况会把原值转换成两个经过比例计算后的新 px 值，分别对应桌面端和移动端横屏。

媒体查询中有两个重要因素，分别是“屏幕宽度（X）”和“屏幕高度（Y）”，分别对应了屏幕的高低（高度）变化，以及屏幕的宽窄（宽度）变化。下面是媒体查询断点的具体情况，以及和每种情况等效的端口（默认 X 是 640px，Y 是 600px，可通过参数调整）：

- 宽于 X（600）
	- 高于 Y（640），使用桌面宽度（平板、笔记本、桌面端）
	- 低于 Y，使用移动端横屏宽度（移动端横屏）
- 窄于 X
	- 横屏
		- 宽于 landscapeWidth（425），使用移动端横屏宽度（移动端横屏）
		- 窄于 landscapeWidth，使用设计图宽度（穿戴设备）
	- 纵屏，使用设计图宽度（移动端竖屏）

桌面端媒体查询类似于：

```css
@media (min-width: 600px) and (min-height: 640px) { /* ... */ }
```

移动端横屏媒体查询类似于：

```css
@media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { /* ... */ }
```

---

怎样限制视口单位的最大宽度：
- 使用 CSS 函数 `min()` 或 `max()`；
- 举例，当前配置为 `{ viewportWidth: 750, maxDisplayWidth: 600 }`，
	- 转换前，`width: 75px;`，
	- 转换后，`width: min(10vw, 60px);`。

---

当需要把竖屏视图居中展示时，fixed 定位的元素需要重新计算，让元素回到视图中，而不是左右的空白区域。例如 `position: fixed; left: 0;` 在宽屏上，应该处于居中的视图中，而不是屏幕最左侧。

如果元素的长度单位是百分比，那么这个百分比是基于[包含块](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block)计算的。大部分情况，元素的包含块是它的父级元素，因此插件不需要进行转换，但是当元素处于 fixed 定位时，元素的包含块就可能是根元素 `<html>`（visual viewport），这时的宽度是浏览器宽度，所以插件需要把此时依赖浏览器宽度的属性进行转换，这样不管浏览器宽度怎么变化，视图才能始终居中。下面是具体的计算方法（fixed 定位的元素，其百分比宽度大部分情况依赖浏览器宽度，但也存在特殊情况，请查看“注意事项”一节来应对特殊情况）：
- 属性是除了 left 和 right 的属性，单位使用 vw 或百分号（%），
	- 计算方式为 `(idealClientWidth / 100 * number)px`；
- 属性是除了 left 和 right 的属性，单位使用 px，
	- 计算方式为 `(idealClientWidth / viewportWidth * number)px`；
- 属性为 left 或 right，单位使用 vw 或百分号，
	- 计算方式为 `calc(50% - (idealClientWidth / 2 - idealClientWidth / 100 * number)px)`；
- 属性为 left 或 right，单位使用 px，
	- 计算方式为 `calc(50% - (idealClientWidth / 2 - number * idealClientWidth / viewportWidth)px)`。

<details>
<summary>查看关于上述包含块内单位转换的更多解释。</summary>

- idealClientWidth（理想客户端宽度）是属性表中的 desktopWidth 或 landscapeWidth；
- viewportWidth 即属性表中的 viewportWidth；
- number 即属性值里的长度数字；
- 对于包含块，“未考虑的其它情况”请查看“注意事项”一节，例如 `position: fixed; left: 0;` 的另一种可能是使元素处于某祖先元素的最左侧，而不是根元素（浏览器窗口）最左侧；
- 对于包含块，会有 `position: fixed;` 和 `left: 0;` 不在同一选择器的情况，这种情况仍然需要计算 `left`，但默认由于未在同一选择器中检测到 `fixed`，因此不会重新计算，应对方法请查看“注意事项”一节；
- 包含块宽度影响的属性，请查看“其它”一节；
- 以上值的重新计算，目的是保证每个端口的视图完全一致。

</details>

---

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
	left    : 0;
	top     : 0;
}

/* 桌面端媒体查询 */
@media (min-width: 600px) and (min-height: 640px) { /* 这里的 600 是默认值，可以自定义 */
	.root-class {
		max-width: 600px !important;
	}

	.nav {
		height: 57.6px;
		top: .0;
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
		top: .0;
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

## 注意事项

rootSelector 或者 rootClass 所在元素的居中属性会被占用，如果开启了 `border`，边框属性也会被占用，包括 `margin-left`、`margin-right`、`box-sizing`、`border-left`、`border-right`、`min-height`、`height`。

默认情况，插件会把所有 fixed 定位的元素的包含块当成根元素，如果希望跳过处理非根元素的包含块，请在选择器上方添加注释，`/* not-root-containing-block */`，这样设置后，插件会知道这个选择器内的计算方式统一使用非根包含块的计算方式：

```css
/* not-root-containing-block */
.class {
	position: fixed;
	left: 50%;
}
```

> 对于 fixed 定位元素的包含块是祖先元素，而不是根元素（浏览器窗口，visual viewport）的条件，请查看“其它”一节。

对于包含块，如果 `position: fixed;` 和 `left: 0;` 不在同一选择器，可以在需要重新计算的选择器上标记注释 `/* root-containing-block */`，例如（另一个方法是设置 `rootContainingBlockSelectorList` 参数）：

```css
.position {
	position: fixed;
}
/* root-containing-block */
.top-box {
	right: 0;
	bottom: 0;
	width: 66px;
	height: 66px;
	border-radius: 9px;
}
```

插件暂时不支持转换和包含块的 `logical-width`、`logical-height`、`block-size`、`inline-size` 有关的属性。

插件转换的是选择器中的属性的值，不转换 [At 规则](https://developer.mozilla.org/zh-CN/docs/Web/CSS/At-rule)中的属性，例如 `@font-face` 中的属性。

本插件的目标是在不同尺寸的屏幕上展示**合适**的视图，在宽一点的屏幕上展示大一点的视图，在扁一点的屏幕上展示小一点的视图，在窄一些的屏幕展示移动端竖屏视图，而**非准确**地识别具体的设备或平台来应用对应视图。

## 期望效果

在不同设备上，[*duozhuayu.com*](https://www.duozhuayu.com/book) 做得很好，桌面端和移动端虽然基本公用一套 UI（移动端竖屏 UI），但访问无障碍，没有巨大字体和全宽的问题。

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

“多抓鱼”官网用百分比单位做适配，最大宽度是 600px，小于这个宽度则向内挤压，大于这个宽度则居中移动端竖屏视图。从上面的展示效果来看，在不同的设备上，这种小版心布局仍然有不错的兼容性和展示效果。虽然百分比单位牺牲了一点“完美还原度”，但是从灵活度和代码轻量的角度看，是个不错的选择。

这样适配：
- 保证内容可用，不会出现视口单位导致的“大屏大字”问题；
- 在非前端适配方案失效时，前端有兜底自适应适配，终端用户仍可访问。

## CHANGELOG

查看[更新日志](./CHANGELOG.md)。

## 版本规则

查看[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## 协议

查看 [MIT License](./LICENSE)。

## 其它

配套插件：
- postcss-px-to-viewport，[*‌https://github.com/evrone/postcss-px-to-viewport*](https://github.com/evrone/postcss-px-to-viewport)
- postcss-extract-media-query，[*https://github.com/SassNinja/postcss-extract-media-query*](https://github.com/SassNinja/postcss-extract-media-query)

百分比值受包含块（Containing Block）宽度影响的属性：`left`、`margin-bottom`、`margin-left`、`margin-right`、`margin-top`、`margin`、`max-width`、`min-width`、`padding-bottom`、`padding-left`、`padding-right`、`padding-top`、`padding`、`right`、`shape-margin`、`text-indent`、`width`。

对于包含块，插件默认的处理方式不能处理下面的情况，如果某个情况设置在祖先元素上，那么当前定位为 fixed 元素的包含块就是那个祖先元素，而插件默认所有的 fixed 元素的包含块是浏览器窗口（visual viewport）：
- transform 或 perspective 的值不是 none；
- will-change 的值是 transform 或 perspective；
- filter 的值不是 none 或 will-change 的值是 filter（只在 Firefox 下生效）；
- contain 的值是 paint（例如：`contain: paint;`）；
- backdrop-filter 的值不是 none（例如：`backdrop-filter: blur(10px);`）。

相关链接：
- “[Media Queries Level 3](https://www.w3.org/TR/mediaqueries-3/#syntax)”，W3C Recommendation，05 April 2022；
- “[CSS syntax validator](https://csstree.github.io/docs/validator.html)”，遵守 W3C 标准的在线 CSS 语法检测器；
- “[What are CSS percentages?](https://jameshfisher.com/2019/12/29/what-are-css-percentages/)”，罗列了百分比取包含块（Containing Block）宽度的属性；
- “[CSS 的简写属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Shorthand_properties)”，罗列了所有的简写属性。
