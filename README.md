# postcss-mobile-to-multi-displays

在桌面端和移动端横屏展示移动端（竖屏）设计视图。

## 安装

npm 安装：
```bash
npm install postcss-mobile-to-multi-displays --save-dev
```

yarn 安装：
```bash
yarn add -D postcss-mobile-to-multi-displays
```

## 简介

通过配合 [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport/)，使用本插件生成桌面端和移动端横屏的媒体查询，移动端设计视图会按照小版心布局，居中展示在桌面端和移动端横屏，使得在非移动端竖屏的设备上也具备良好的展示效果。*目前已经集成了 post-px-to-viewport 的转换视口单位的功能，如果需要在移动端竖屏的情况下使用视口（vw）单位，可以打开 enableMobile 属性，无需安装 postcss-px-to-viewport，具体查看“配置参数”一节。*

如何使用：
- 首先使用本插件，插件会利用源码中移动端设计视图的 px 值，生成桌面端和移动端横屏的媒体查询；
- 然后使用插件 `postcss-px-to-viewport`，移动端设计视图的 px 值会被转为适合移动端竖屏的可伸缩界面。

本插件生成的媒体查询期望覆盖：
- 移动端竖屏，正常使用移动端竖屏视图；
- 移动端横屏，使用**居中的较小固定宽度**的移动端竖屏视图；
- 平板、笔记本、桌面端，使用**居中的较大固定宽度**的移动端竖屏视图。

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

在“范例”一节查看，源码中提供了范例，用于在本地运行后验证演示效果。

## 配置参数

| Name | Type | isRequired | Default | Desc |
|:--|:--|:--|:--|:--|
| viewportWidth | number | N | 750 | 设计图宽度，代码中的尺寸都是基于这个宽度的尺寸 |
| desktopWidth | number | N | 600 | 适配到桌面端时，展示的视图宽度 |
| landscapeWidth | number | N | 425 | 适配到移动端横屏时，展示的视图宽度 |
| yAxisBreakPoint | number | N | / | 纵向 y 轴断点，如果不提供这个值，默认使用 `desktopWidth` 的值，视图大于这个宽度，则页面宽度是桌面端宽度 `desktopWidth`，“简介”一节具体介绍了该值的触发情况 |
| xAxisBreakPoint | number | N | 640 | 横向 x 轴断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度，“简介”一节具体介绍了该值的触发情况 |
| rootClass | string | N | "root-class" | 页面最外层 class 选择器，用于设置在桌面端和移动端横屏时的居中样式 |
| border | boolean | N | false | 在页面外层展示边框吗，用于分辨居中的小版心布局和背景 |
| disableDesktop | boolean | N | false | 不做桌面端适配 |
| disableLandscape | boolean | N | false | 不做移动端横屏适配 |
| enableMobile | boolean | N | false | 做移动端竖屏适配，把 px 转换为视口单位 vw |
| pass1px | boolean | N | true | 是否转换 1px？ |
| exclude | RegExp\|RegExp[] | N | null | 排除文件或文件夹 |
| include | RegExp\|RegExp[] | N | null | 包括文件或文件夹 |
| unitPrecision | number | N | 3 | 单位精确到小数点后几位？ |
| mobileConfig | { propList: string[]; fontViewportUnit: string; selectorBlackList: (string\|RegExp)[]; replace: boolean; } | N | { propList: ['*'], fontViewportUnit: "vw", selectorBlackList: [], replace: true } | 移动端竖屏视口视图的配置，设置 enableMobile 为 true 即可生效，用于部分兼容 postcss-px-to-viewport，用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) |
| mobileConfig.propList | string[] | N | ['*'] | 那些属性要替换，那些属性忽略？ |
| mobileConfig.fontViewportUnit | string | N | "vw" | 字体单位 |
| mobileConfig.selectorBlackList | (string\|RegExp)[] | N | [] | 选择器黑名单，名单上的不转换 |
| mobileConfig.replace | boolean | N | true | 直接替换属性值还是新增？ |

下面是默认的配置参数：

```json
{
  "viewportWidth": 750,
  "desktopWidth": 600,
  "landscapeWidth": 425,
  "yAxisBreakPoint": null,
  "xAxisBreakPoint": 640,
  "rootClass": "root-class",
  "border": false,
  "disableDesktop": false,
  "disableLandscape": false,
  "enableMobile": false,
  "pass1px": true,
  "exclude": null,
  "include": null,
  "unitPrecision": 3,
  "mobileConfig": {
    "propList": ['*'],
    "fontViewportUnit": "vw",
    "selectorBlackList": [],
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

文件夹 `example` 内提供了分别在 [React](https://reactjs.org/)、[Svelte](https://svelte.dev/) 和 [Vue](https://cn.vuejs.org/) 中使用 `postcss-mobile-to-multi-displays` 的范例，通过命令行进入对应的范例文件夹中，即可运行：

```bash
cd example/react/
npm install
npm run start
```

在“演示效果”一节中查看成功运行之后，不同屏幕的界面图片。

## 原理和输入输出范例

本插件会通过两个媒体查询断点创建可以代表桌面端和移动端横屏的媒体查询，然后找到所有的 px 值进行转换，默认情况会把原值转换成两个经过比例计算后的新 px 值，分别对应桌面端和移动端横屏。

两个断点分别是“x 轴断点（X）”和“y 轴断点（Y）”，屏幕的高低（高度）变化触发 x 轴断点，屏幕的宽窄（宽度）变化触发 y 轴断点。下面是触发断点的每种情况，以及和每种情况等效的端口（默认的 x 轴断点是 640px，y 轴断点是 600px）：

- 宽于 Y（600）
	- 高于 X（640），使用桌面宽度（平板、笔记本、桌面端）
	- 低于 X，使用移动端横屏宽度（移动端横屏）
- 窄于 Y
	- 横屏
		- 高于 X，使用移动端横屏宽度（移动端横屏）
		- 低于 X，使用移动端横屏宽度（移动端横屏）
	- 纵屏
		- 高于 X，使用设计图宽度（移动端竖屏）
		- 低于 X，使用设计图宽度（移动端竖屏）


下面是使用默认配置的输入输出内容。

输入：

```css
.root-class {
	width: 100%;
}

.class {
	position: fixed;
	width: 100%;
}

.class2 {
	width: 100vw;
	height: 30px;
}
```

输出：

```css
.root-class {
	width: 100%;
}

.class {
	position: fixed;
	width: 100%;
}

.class2 {
	width: 100vw;
	height: 30px;
}

/* 桌面端媒体查询 */
@media (min-width: 600px) and (min-height: 640px) { /* 这里的 600 是默认值，可以自定义 */
	.root-class {
		max-width: 600px !important;
	}

	.class {
		width: 600px; /* 100% -> 600px */
	}

	.class2 {
		width: 600px; /* 100vw -> 600px */
		height: 24.000px; /* 600/750*30=24，600 是默认的桌面端预期宽度，750 是默认的设计图宽度 */
	}
}

/* 移动端媒体查询 */
@media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { /* 这里的 640 是固定值 */
	.root-class {
		max-width: 425px !important;
	}

	.class {
		width: 425px; /* 100% -> 425px */
	}
	
	.class2 {
		width: 425px; /* 100vw -> 425px */
		height: 17.000px; /* 425/750*30=17 */
	}
}

/* 桌面端和移动端公共的媒体查询 */
@media (min-width: 600px), (orientation: landscape) and (max-width: 600px) {
	.root-class {
		margin-left: auto !important;
		margin-right: auto !important;
	}

	.class {
		margin-left: auto;  /* 用于居中 */
		margin-right: auto; /* 用于居中 */
		left: 0;            /* 用于居中 */
		right: 0;           /* 用于居中 */
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

对于样式 `position: fixed; width: 100vw;` 会在非移动端视图中转换成固定宽度的居中样式，转换的前提 `position` 和 `width` 在同一选择器中，所以代码中使用 `fixed` 并且全宽的情况，要注意写在同一选择器中。

由于样式 `position: fixed; width: 100vw;` 会被转换为居中固定宽度的样式，因此会生成居中有关的属性，包括 `margin-left`、`margin-right`、`left`、`right`，这些属性会在对应选择器中被占用。

`root-class` 所在元素的居中属性会被占用，如果开启了 `border`，边框属性也会被占用，包括 `margin-left`、`margin-right`、`box-sizing`、`border-left`、`border-right`、`min-height`、`height`。

## 版本规则

版本规则使用[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## 协议

协议使用 [MIT License](./LICENSE)。

## 其它

配套插件：
- postcss-px-to-viewport，[*‌https://github.com/evrone/postcss-px-to-viewport/*](https://github.com/evrone/postcss-px-to-viewport/)

相关链接：
- [Media Queries Level 3](https://www.w3.org/TR/mediaqueries-3/#syntax)，W3C Recommendation，05 April 2022；
- [CSS syntax validator](https://csstree.github.io/docs/validator.html)，遵守 W3C 标准的在线 CSS 语法检测器。
