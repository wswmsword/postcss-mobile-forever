# postcss-mobile-to-multi-displays

在桌面端和横屏移动端展示（竖屏）移动端设计视图。

## 配置参数

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
  "disableLandscape": false
}
```

| Name | Type | isRequired | Default | Desc |
|:--|:--|:--|:--|:--|
| viewportWidth | number | N | 750 | 设计图宽度，代码中的尺寸都是基于这个宽度的尺寸 |
| desktopWidth | number | N | 600 | 桌面端需要展示的视图宽度 |
| landscapeWidth | number | N | 425 | 移动端横屏需要展示的视图宽度 |
| yAxisBreakPoint | number | N | / | 纵向 y 轴断点，视图大于这个宽度，则页面使用桌面端宽度，如果不提供这个值，默认使用 `landscapeWidth` 的值 |
| xAxisBreakPoint | number | N | 640 | 横向 x 轴断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度 |
| rootClass | string | N | root-class | 页面最外层 class 选择器，用于设置在桌面端和移动端横屏时的居中样式 |
| border | boolean | N | false | 在页面外层展示边框吗，用于分辨居中的小版心布局和背景 |
| disableDesktop | boolean | N | false | 不做桌面端适配 |
| disableLandscape | boolean | N | false | 不做横屏移动端适配 |

## 输入输出样例

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
		max-width: 600px;
	}

	.class {
		width: 600px; /* 100% -> 600px */
	}

	.class2 {
		width: 600px; /* 100vw -> 600px */
		height: 24px; /* 600/750*30=24，600 是默认的桌面端预期宽度，750 是默认的设计图宽度 */
	}
}

/* 移动端媒体查询 */
@media ((min-width: 600px) and (max-height: 640px)) or ((max-width: 600px) and (orientation: landscape)) { /* 这里的 640 是固定值 */
	.root-class {
		max-width: 450px;	
	}

	.class {
		width: 450px; /* 100% -> 450px */
	}
	
	.class2 {
		width: 450px; /* 100vw -> 450px */
		height: 18px; /* 450/750*30=18 */
	}
}

/* 桌面端和移动端公共的媒体查询 */
@media (min-width: 600px) or ((orientation: landscape) and (max-width: 600px)) {
	.root-class {
		margin-left: auto !important;
		margin-right: auto !important;
		box-sizing: content-box;
		border-left: 1px solid #eee;
		border-right: 1px solid #eee;
		min-height: 100vh;
		height: auto !important;	
	}

	.class {
		position: fixed;
		margin-left: auto;  /* 用于居中 */
		margin-right: auto; /* 用于居中 */
		left: 0;            /* 用于居中 */
		right: 0;           /* 用于居中 */
	}
}
```

## 其它

配套插件：
- postcss-px-to-viewport，[*‌https://github.com/evrone/postcss-px-to-viewport/*](https://github.com/evrone/postcss-px-to-viewport/)

## 草稿

X：横向 x 轴断点。
Y：纵向 y 轴断点。

- 大于 Y
	- 大于 X，使用桌面宽度（桌面端）
	- 小于 X，使用移动端横屏宽度（横屏移动端）
- 小于 Y
	- 横屏
		- 大于 X，使用移动端横屏宽度（横屏移动端）
		- 小于 X，使用移动端横屏宽度（横屏移动端）
	- 纵屏
		- 大于 X，使用设计图宽度（竖屏移动端）
		- 小于 X，使用设计图宽度（竖屏移动端）