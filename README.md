# postcss-mobile-forever

<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS" width="90" height="90" align="right">

<a href="https://996.icu"><img src="https://img.shields.io/badge/link-996.icu-red.svg" alt="996.icu" align="right"></a>

一款 PostCSS 插件，用于将基于特定宽度的固定尺寸的移动端视图转为具有最大宽度的可伸缩的移动端视图。postcss-mobile-forever 具备以下特性：

- 转换视口单位（*px->vw*）；
- 生成适应桌面端和横屏的媒体查询（*@media*）；
- 限制视图最大宽度（*min(vw, px)*）；
- 矫正 `fixed` 定位的元素，支持[逻辑属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_logical_properties_and_values/Basic_concepts_of_logical_properties_and_values)的转换。

postcss-mobile-forever 可以配合 [scale-view](https://github.com/wswmsword/scale-view) 使用，postcss-mobile-forever 用于编译阶段，scale-view 用于运行阶段。

> 如果您在使用 [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport/)（后简称 *px2vw*） 实现伸缩界面的时候，不希望界面在大屏设备上撑满整个屏幕而难以浏览，希望界面在达到某一个合适的宽度后停止伸缩（限制最大宽度），您可以使用本插件。

您可以在线查看[一个范例](https://wswmsword.github.io/examples/mobile-forever/vanilla/)，通过旋转屏幕、改变窗口大小、在不同屏幕查看展示效果。范例顶部的文字会提示您，当前的视图是移动端竖屏（Portrait）、移动端横屏（Landscape）还是桌面端（Desktop）。

> **⚠️ Warning**
>
> 使用本插件转换视口单位（如 vw），或是其它使用动态根元素 `font-size` 结合 rem，这两种方法生成的伸缩视图，不能触发浏览器的缩放功能（可以通过快捷键同时按下 <kbd>CMD/Ctrl</kbd> 和 <kbd>+/-</kbd> 触发），不能满足[针对缩放的可访问性标准](https://www.w3.org/Translations/WCAG21-zh/#resize-text)，因此存在可访问性问题。查看一个[关于 vw 伸缩视图的可访问性实验](https://github.com/wswmsword/web-experiences/tree/main/a11y/mobile-vw-viewport)。

## 安装

npm 安装最新版本（基于 postcss@^8.0.0）（yarn 则是 `yarn add -D postcss postcss-mobile-forever`）：
```bash
npm install --save-dev postcss postcss-mobile-forever
```

npm 安装最新的兼容版本（基于 postcss@^6.0.0）（yarn 则是 `yarn add -D postcss-mobile-forever@legacy`）：

```bash
npm install postcss-mobile-forever@legacy --save-dev
```

查看[兼容版本的 mobile-forever 文档](./README_LEGACY.md)，目前兼容版本不支持[逻辑属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_logical_properties_and_values/Basic_concepts_of_logical_properties_and_values)的处理。

<details>
<summary>
安装之后在 postcss.config.js 配置文件中引入，或者其它框架配置文件中引入。
</summary>

`postcss.config.js` 有好几种[配置格式](https://github.com/webpack-contrib/postcss-loader#config)，下面是其中一种配置方法：

```javascript
import mobile from 'postcss-mobile-forever' // <---- 这里
import autoprefixer from 'autoprefixer'
// 省略……
{
	postcss: {
		plugins: [
			autoprefixer(),
			mobile({ // <---- 这里
				appSelector: '#app',
				viewportWidth: 375,
				maxDisplayWidth: 580,
			}),
		],
	},
}
// 省略……
```

https://github.com/webpack-contrib/postcss-loader/issues/172

</details>

## 简介

插件使用两种方法生成具有最大宽度的伸缩视图，原理上，第一种方法会利用 `min()` 之类的 CSS 函数，第二种方法则是生成媒体查询：
- 第一种方法**在转换 px 为视口单位（默认 vw）的同时，使用 CSS 函数限制视图的最大宽度**，当视图超过指定宽度，视图将以指定宽度居中于屏幕，这种方法的代码量相比生成媒体查询会更小，您可以查看[一个在线范例](https://wswmsword.github.io/examples/mobile-forever/maxDisplayWidth/)，对比与媒体查询方法的不同（查看[配置范例](./example/others/maxDisplayWidth-vanilla/postcss.config.js)）；
- 第二种方法**把 px 转换为视口单位（默认 vw），生成用于桌面端和横屏的媒体查询**，移动端视图会以两种合适的宽度，居中展示在横屏和桌面端的屏幕上，具体的媒体查询断点请查看“原理和输入输出范例”一节，您可以查看文档开头提供的范例，在不同设备上观察视图变化（查看[配置范例](./example/vanilla/postcss.config.js)）。

<details>
<summary>
媒体查询模式，也即第二种方法，期望覆盖手机、平板、笔记本，以及竖屏或横屏的多种屏幕。
</summary>

- 移动端竖屏，正常使用可伸缩（vw）的移动端竖屏视图；
- 移动端横屏，使用*居中的较小固定宽度*的移动端竖屏视图；
- 平板、笔记本、桌面端，使用*居中的较大固定宽度*的移动端竖屏视图；
- 穿戴设备，使用*可伸缩*（vw）的移动端竖屏视图。

下面的三张图是使用本插件生成媒体查询，移动端、移动端横屏和桌面端的展示效果：

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

> 您也可以通过配合 *px2vw*，把转换视口单位（适配移动端竖屏）的任务交给 *px2vw* 完成，然后打开本插件的 `disableMobile`，关闭本插件的视口单位转换功能。这样做只适用于上面的第二种方法，生成媒体查询的方法。
</details>

## 配置参数

一大波配置参数正在靠近，不必焦虑，尽在掌握，在这之前可以先尝试最基础的配置参数。下方配置表示了，应用已是基于 `750px` 的宽度开发，经过 mobile-forever 转换后，应用视图将被限制在 `600px` 以内的宽度伸缩：

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "maxDisplayWidth": 600
}
```

下面的每一项都是可选的。

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| viewportWidth | number\|(file: string, selector: string) => number | 750 | 应用基于该宽度进行开发，转换后的伸缩视图将会以该宽度的视图作为标准进行比例伸缩；可以传递函数动态生成宽度，例如 `file => file.includes("vant") ? 375 : 750` 表示在名称包含“vant”的文件内使用 375px 的宽度，而其他文件使用 750px 的宽度 |
| mobileUnit | string | "vw" | 移动端竖屏视口视图，转换成什么视口单位？ |
| maxDisplayWidth | number | / | 限制视口单位的最大宽度 |
| enableMediaQuery | boolean | false | 打开媒体查询模式，打开后将自动关闭 `maxDisplayWidth` |
| desktopWidth | number | 600 | 适配到桌面端时，展示的视图宽度 |
| landscapeWidth | number | 425 | 适配到移动端横屏时，展示的视图宽度 |
| appSelector | string | / | 页面最外层选择器，例如“`#app`”，用于设置在桌面端和移动端横屏时的居中样式 |
| border | boolean\|string | false | 在页面外层展示边框吗，用于分辨居中的小版心布局和背景，可以设置颜色字符串 |
| disableDesktop | boolean | false | 打开则不做桌面端适配，使用该参数前需要打开 `enableMediaQuery` |
| disableLandscape | boolean | false | 打开则不做移动端横屏适配，使用该参数前需要打开 `enableMediaQuery` |
| disableMobile | boolean | false | 打开则不做移动端竖屏适配，把 px 转换为视口单位，如 vw |
| exclude | RegExp\|RegExp[] | / | 排除文件或文件夹 |
| include | RegExp\|RegExp[] | / | 包括文件或文件夹 |
| unitPrecision | number | 3 | 单位精确到小数点后几位？ |
| propList | string[] | ['*'] | 哪些属性要替换，哪些属性忽略？用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) |
| selectorBlackList | (string\|RegExp)[] | [] | 选择器黑名单，名单上的不转换 |
| propertyBlackList | propertyBlackList | [] | 属性黑名单，名单上的不转换，如果要指定选择器内的属性，用对象的键表示选择器名称，具体用法见 [vant 的范例代码](./example/others/vant-vue/postcss.config.cjs#L9C17-L9C17) |
| valueBlackList | (string\|RegExp)[] | [] | 属性值黑名单，名单上的值不转换 |
| rootContainingBlockSelectorList | (string\|RegExp)[] | [] | 包含块是根元素的选择器列表，效果和标注注释 `/* root-containing-block */` 相同 |
| verticalWritingSelectorList | (string\|RegExp)[] | [] | 纵向书写模式的选择器列表，效果和在选择器顶部标注注释 `/* vertical-writing-mode */` 相同 |
| minDesktopDisplayWidth | number | / | 宽度断点，如果不提供这个值，默认使用 `desktopWidth` 的值，视图大于这个宽度，则页面宽度是桌面端宽度 `desktopWidth`，“原理和输入输出范例”一节具体介绍了该值的触发情况 |
| maxLandscapeDisplayHeight | number | 640 | 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度，“原理和输入输出范例”一节具体介绍了该值的触发情况 |
| side | any | / | 侧边配置，在桌面端媒体查询中生效，用于利用宽屏的空间，后文将介绍它的若干子属性 |
| comment | any | / | 自定义注释，改变注释的名称，后文将介绍它的若干子属性 |
| customLengthProperty | any | / | 用于指定需要添加到桌面端或横屏的自定义变量（css 变量，`var(...)`），如果不指定，默认**所有**和长度有关的属性，如果使用了自定义变量，都会被添加入桌面端和横屏，后文将介绍它的若干子属性 |
| experimental.extract | boolean | false | 提取桌面端与横屏样式代码，用于生产环境，用于代码分割优化产包，具体查看“注意事项”一节 |

下面是属性 `comment` 的子属性，每一个属性都是可选的，`comment` 用于自定义注释：

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| applyWithoutConvert | string | "apply-without-convert" | 直接添加进屏幕媒体查询，不转换 |
| rootContainingBlock | string | "root-containing-block" | 包含块注释 |
| notRootContainingBlock | string | "not-root-containing-block" | 非包含块注释 |
| ignoreNext | string | "mobile-ignore-next" | 忽略选择器内的转换 |
| ignoreLine | string | "mobile-ignore" | 忽略本行转换 |
| verticalWritingMode | string | "vertical-writing-mode" | 纵向书写模式 |

下面是属性 `customLengthProperty` 的子属性，每一个属性都是可选的，`customLengthProperty` 有两个作用，一个是指定转换方式，例如基于根包含块的 `left` 和 `right`，则需要 `customLengthProperty.rootContainingBlockList_LR` 进行指定，来得到正确的转换结果，另一个作用是，在媒体查询模式下，避免所有和长度有关的使用 CSS 变量的属性，都被添加到媒体查询中，用于指定真正需要添加到桌面端或横屏的自定义变量：

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| rootContainingBlockList_LR | string[] | [] | 用于根包含块的，left、right 的自定义属性，例如设置 `["--len-a", "--len-b"]` 后，`--len-a` 和 `--len-b` 的值会转换为用于 `left` 和 `right` 属性，并且包含块是根包含块的值，并添加到桌面端和横屏中 |
| rootContainingBlockList_NOT_LR | string[] | [] | 用于根包含块的，非 left、right 的自定义属性 |
| ancestorContainingBlockList | string[] | [] | 用于非根包含块的自定义属性，这些属性值不会被转换，但是会添加到桌面端和横屏，用于避免优先级问题 |
| disableAutoApply | boolean | false | 关闭自定义属性自动添加到桌面端和横屏，设置上面的三个选项后，这个选项自动为 true |

<details>
<summary>
还有一些属性可以把页面上某个部分在宽屏设备上转移到侧边，例如可以把在移动端底部的二维码转移到桌面端的侧边栏区域以利用空白区域，这些属性不常用，您可以展开查看具体属性情况。
</summary>

下面是属性 `side` 的子属性，每一个属性都是可选的，`side` 用于配制侧边内容，只有当打开媒体查询模式、`disableDesktop` 为 false 的时候，`side` 将生效：

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| width | number | / | 侧边宽度，如果指定的选择器下有 width 属性，则无需设置 |
| gap | number | 18 | 侧边布局的上下左右间隔 |
| selector1 | string | / | 左上侧边元素选择器 |
| selector2 | string | / | 右上侧边元素选择器 |
| selector3 | string | / | 右下侧边元素选择器 |
| selector4 | string | / | 左下侧边元素选择器 |
| width1 | number | / | 左上侧边宽度，优先级大于 width |
| width2 | number | / | 右上侧边宽度 |
| width3 | number | / | 右下侧边宽度 |
| width4 | number | / | 左下侧边宽度 |

</details>

<details>
<summary>
查看默认的配置参数。
</summary>

```json
{
  "viewportWidth": 750,
  "maxDisplayWidth": null,
  "enableMediaQuery": false,
  "desktopWidth": 600,
  "landscapeWidth": 425,
  "minDesktopDisplayWidth": null,
  "maxLandscapeDisplayHeight": 640,
  "appSelector": "#app",
  "border": false,
  "disableDesktop": false,
  "disableLandscape": false,
  "disableMobile": false,
  "exclude": null,
  "include": null,
  "unitPrecision": 3,
  "selectorBlackList": [],
  "valueBlackList": [],
  "rootContainingBlockSelectorList": [],
  "verticalWritingSelectorList": [],
  "propList": ['*'],
  "mobileUnit": "vw",
  "side": {
    "width": null,
    "gap": 18,
    "selector1": null,
    "selector2": null,
    "selector3": null,
    "selector4": null,
    "width1": null,
    "width2": null,
    "width3": null,
    "width4": null
  },
  "comment": {
    "applyWithoutConvert": "apply-without-convert",
    "rootContainingBlock": "root-containing-block",
    "notRootContainingBlock": "not-root-containing-block",
    "ignoreNext": "mobile-ignore-next",
    "ignoreLine": "mobile-ignore",
    "verticalWritingMode": "vertical-writing-mode"
  },
  "customLengthProperty": {
    "rootContainingBlockList_LR": [],
    "rootContainingBlockList_NOT_LR": [],
    "ancestorContainingBlockList": [],
    "disableAutoApply": false
  },
  "experimental": {
    "extract": false
  }
}
```

</details>

<details>
<summary>
虽然配置选项的数量看起来很多，但是只需要指定选项 viewportWidth 后，就可以输出伸缩视图的结果，通常我们还需要让伸缩视图具有最大宽度，只要再添加 appSelector 和 maxDisplayWidth，即可完成。开发中，如果在浏览器看到，宽屏的视图有和在移动端视图不一样的地方，再考虑配置其它选项。
</summary>

下面的配置会激活第一种方法，使用 CSS 函数限制视口单位的最大值，当屏幕宽度超过 600px 后，视图不会再变化：

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "maxDisplayWidth": 600
}
```

下面的配置会激活第二种方法，生成媒体查询，适配桌面端和横屏，桌面端视图的宽度是 600px，横屏的宽度是 425px：

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "enableMediaQuery": true
}
```

如果暂时不希望优化视图在大屏的可访问性，不做最大宽度的限制，可以像下面这样配置：

```json
{
  "viewportWidth": 750
}
```

</details>

也可以通过在样式文件中添加注释，来标记局部的尺寸该如何转换，下面是一些标记注释：
- `/* apply-without-convert */`，标记在一行属性之后，表示属性不经过转换，将直接添加到桌面端和横屏（可用于属性覆盖的情况）；
- `/* root-containing-block */`，标记在选择器上面，用于表示当前选择器的包含块是根元素，是浏览器窗口（如果选择器中已有“`position: fixed;`”，则无需标注该注释）；
- `/* not-root-containing-block */`，标记在选择器上面，用于表示当前选择器所属元素的包含块不是根元素；
- `/* mobile-ignore-next */`，标记在一行属性的上面，表示下一行属性不需要进行转换；
- `/* mobile-ignore */`，标记在一行属性后面，表示当前行属性不需要进行转换；
- `/* vertical-writing-mode */`，标记在选择器上面，表示当前选择器是纵向书写模式，内部的逻辑属性需要被转换。

## 单元测试与参与开发

```bash
npm install
npm run test
```

修改源码后，编写单元测试，验证是否输出了预期的结果。在文件夹 `example/` 内提供了一些范例，可以用来模拟生产环境使用插件的场景，这些范例项目中依赖的 `postcss-mobile-forever` 来自源码，因此当修改源码后，可以通过在范例里 `npm i` 安装依赖，然后本地运行，通过浏览器验证自己的修改是否符合预期。

一起开发，让程序的变量命名更合适、性能和功能更好。

## 范例

文件夹 `example/` 内提供了分别在 [React](https://reactjs.org/)、[Svelte](https://svelte.dev/)、[Vue](https://cn.vuejs.org/)、[Next.js](https://nextjs.org/) 和原生 JavaScript 中使用 `postcss-mobile-forever` 的范例，通过命令行进入对应的范例文件夹中，即可运行：

```bash
cd example/react/
npm install
npm run start
```

- [访问原生 JS 的限制最大宽度的在线范例](https://wswmsword.github.io/examples/mobile-forever/maxDisplayWidth/)，[查看原生 JS 的限制最大宽度的源码](./example/others/maxDisplayWidth-vanilla/)；
- [查看 Next.js 的限制最大宽度的源码](./example/nextjs/)；
- [访问原生 JS 的媒体查询在线范例](https://wswmsword.github.io/examples/mobile-forever/vanilla/)，[查看原生 JS 的媒体查询的源码](./example/vanilla/)；
- [访问 React 的媒体查询在线范例](https://wswmsword.github.io/examples/mobile-forever/react/)，[查看 React 的媒体查询的源码](./example/react/)；
- [访问 Vue 的媒体查询在线范例](https://wswmsword.github.io/examples/mobile-forever/vue/)，[查看 Vue 的媒体查询的源码](./example/vue/)；
- [访问 Svelte 的媒体查询在线范例](https://wswmsword.github.io/examples/mobile-forever/svelte/)，[查看 Svelte 的媒体查询的源码](./example/svelte)；
- [访问在 Vue 中使用 Vant TabBar 的在线范例](https://wswmsword.github.io/examples/mobile-forever/vant-vue/)，[查看在 Vue 中使用 Vant TabBar 的源码](./example/others/vant-vue/)。

## 输入输出范例和原理

插件配置：

```json
{
  "appSelector": "#app",
  "maxDisplayWidth": 560
}
```

输入范例：

```css
#app {
  width: 100%;
}

.nav {
  position: fixed;
  width   : 100%;
  height  : 72px;
  left    : 0;
  top     : 0;
}
```

输出范例：

```css
#app {
  width       : 100%;
  max-width   : 560px !important;
  margin-left : auto !important;
  margin-right: auto !important;
}

.nav {
  position: fixed;
  width   : min(100%, 560px);
  height  : min(9.6vw, 53.76px);
  left    : calc(50% - min(50%, 280px));
  top     : 0;
}
```

<details>
<summary>查看打开选项 enableMediaQuery，媒体查询模式下的输出范例。</summary>

插件配置：

```json
{
  "appSelector": "#app",
  "enableMediaQuery": true
}
```

输出范例：

```css
#app {
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
  #app {
    max-width: 600px !important;
  }

  .nav {
    height: 57.6px;
    top   : 0;
    left  : calc(50% - 300px); /* calc(50% - (600 / 2 - 0 * 600 / 750)px) */
    width : 600px; /* 100% -> 600px */
  }
}

/* 移动端媒体查询 */
@media (min-width: 600px) and (max-height: 640px),
(max-width: 600px) and (min-width: 425px) and (orientation: landscape) { /* 这里的 640 和 425 是默认值，可自定义 */
  #app {
    max-width: 425px !important;
  }

  .nav {
    height: 40.8px;
    top   : 0;
    left  : calc(50% - 212.5px); /* calc(50% - (425 / 2 - 0 * 425 / 750)px) */
    width : 425px; /* 100% -> 425px */
  }
}

/* 桌面端和移动端公共的媒体查询 */
@media (min-width: 600px),
(orientation: landscape) and (max-width: 600px) and (min-width: 425px) {
  #app {
    margin-left : auto !important;
    margin-right: auto !important;
  }
}
```

相比使用 CSS 函数，使用媒体查询限制宽度，生成的代码量更大。
</details>

查看[原理](./how-it-works.md)。

## 注意事项

appSelector 所在元素的居中属性会被占用，如果开启了 `border`，边框属性也会被占用，包括 `margin-left`、`margin-right`、`box-sizing`、`border-left`、`border-right`、`min-height`、`height`。

默认情况，插件会把所有 fixed 定位的元素的包含块当成根元素，如果希望跳过处理非根元素的包含块，请在选择器上方添加注释，`/* not-root-containing-block */`，这样设置后，插件会知道这个选择器内的计算方式统一使用非根包含块的计算方式：

```css
/* not-root-containing-block */
.class {
  position: fixed;
  left: 50%;
}
```

> 对于 fixed 定位元素的包含块是祖先元素，而不是根元素（浏览器窗口，visual viewport）的条件，请查看“其它”一节。

<details>
<summary>
对于包含块，如果“position: fixed;”和“left: 0;”不在同一选择器，可以在需要重新计算的选择器上标记注释“/* root-containing-block */”（另一个方法是设置“rootContainingBlockSelectorList”参数）。
</summary>

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
</details>

插件转换的是选择器中的属性的值，不转换 [At 规则](https://developer.mozilla.org/zh-CN/docs/Web/CSS/At-rule)中的属性，例如 `@font-face` 中的属性。

<details>
<summary>
展开查看关于 `experimental.extract` 选项的一些说明。
</summary>

- 打开选项后，样式文件会被分割为 `mobile.xxx.css`、`landscape.xxx.css` 和 `desktop.xxx.css`，这有利于使用代码分割进行产包优化;
- 该选项需要设置 [css-loader](https://github.com/webpack-contrib/css-loader) 的 `modules.getLocalIdent` 选项，需要从本插件导入 `remakeExtractedGetLocalIdent` 函数进行传递，这是为了防止选择器名称中的哈希值出现错误（哈希值会通过文件路径计算，而被分割的文件路径是不同的）；
- 暂时不支持热重载，可以仅在生产模式下打开该选项；
- 被分割的文件暂时不支持运行本插件（postcss-mobile-forever）后面的其它 postcss 插件；
- 如果使用 [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) 自动插入样式产包，需要注意顺序，顺序可以通过 `optimization.splitChunks.cacheGroups.[group].priority` 来决定，优先级越高，插入到 html 的顺序越靠前。

<details>
<summary>展开查看使用“experimental.extract”的一份范例配置。</summary>

```javascript
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { defaultGetLocalIdent } = require("css-loader");
const { remakeExtractedGetLocalIdent } = require("postcss-mobile-forever");

const isProdMode = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProdMode ? "production" : "development",
  entry: "./src/index.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [isProdMode ? MiniCssExtractPlugin.loader : "style-loader", {
          loader: "css-loader",
          options: {
            modules: {
              localIdentName: isProdMode ? "[hash:base64]" : "[path][name]__[local]",
              getLocalIdent: isProdMode ? remakeExtractedGetLocalIdent({ defaultGetLocalIdent }) : undefined, // 开发环境不分割，因此设置为 undefined
            },
          }
        }, {
          loader: "postcss-loader",
          options: {
            postcssOptions: [
              ["postcss-mobile-forever", {
                appSelector: ".root-class",
                experimental: {
                  extract: isProdMode, // 生产环境打开文件的提取
                },
              }]
            ]
          }
        }],
      }
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        desktop: {
          chunks: "all",
          enforce: true,
          test: /desktop[^\\/]*?\.css$/, // 分割桌面端样式
          name: "desktop",
          priority: 101, // 第三位被加载
        },
        landscape: {
          chunks: "all",
          enforce: true,
          test: /landscape[^\\/]*?\.css$/, // 分割横屏样式
          name: "landscape",
          priority: 102, // 第二位被加载
        },
        mobile: {
          chunks: "all",
          enforce: true,
          test: /mobile[^\\/]*?\.css$/, // 分割移动端样式
          name: "mobile",
          priority: 103, // 第一位被加载
        },
      }
    }
  },
};
```

前往[范例](./example/cases/split-chunks/react/)查看可运行的配置。

</details>

</details>

<details>
<summary>
关于 CSS 自定义属性，默认情况下，所有和长度相关的属性，如果使用了自定义属性，都会被添加入桌面端和横屏，这可能会带来一些冗余的添加，也可能会有一些转换的错误，转换的错误和包含块相关。
</summary>

下面的例子，默认的情况，`--len-a` 的值在桌面端会被转为 `60px`，横屏会被转为 `42.5px`，但是可以看到实际的应用场景中，定位是 fixed，因此包含块是根包含块，所以默认的转换是错误的，正确的转换应该是，桌面端会被转为 `calc(50% - 240px)`，横屏会被转为 `calc(50% - 170px)`。
```css
:root {
  --len-a: 75px;
}
.rule {
  left: var(--len-a);
  position: fixed;
}
```

上面的例子中，如果要正确的转换，需要在配置中明确指定，`--len-a` 用于根包含块，并且被用于 `left` 属性：
```javascript
{
  // ...其它配置
  customLengthProperty: {
    rootContainingBlockList_LR: ["--len-a"],
  }
}
```

</details>

本插件媒体查询模式的目标是在不同尺寸的屏幕上展示**合适**的视图，在宽一点的屏幕上展示大一点的视图，在扁一点的屏幕上展示小一点的视图，在窄一些的屏幕展示移动端竖屏视图，而**非准确**地识别具体的设备或平台来应用对应视图。

使用插件转换后的浏览器兼容性情况：媒体查询模式下会利用 CSS 函数 `calc()`，因此兼容性略有降低，Opera Mini 完全不可用，max-display-width 模式利用了 CSS 函数 `max()`、`min()` 以及 `calc()`，会有兼容性问题，IE、Opera Mini、QQ 浏览器 13.1 完全不可用，具体可以查看 [caniuse min(), max()](https://caniuse.com/css-math-functions)、[caniuse calc()](https://caniuse.com/calc)。

## 期望效果

在不同设备上，[*duozhuayu.com*](https://www.duozhuayu.com/book)（多抓鱼）公用一套 UI，访问无障碍，没有巨大字体和全宽的问题。

<details>
<summary>
查看“多抓鱼“在移动端、移动端横屏和桌面端的展示效果。
</summary>
<table>
	<tr>
		<td><img src="./images/dzy-portrait.png" alt="移动端的展示效果" /></td>
		<td><img src="./images/dzy-landscape.png" alt="移动端横屏的展示效果" /></td>
	</tr>
	<tr>
		<td colspan="2"><img src="./images/dzy-desktop.png" alt="桌面端的展示效果" /></td>
	</tr>
</table>

</details>

多抓鱼官网用*百分比*单位做适配，最大宽度是 600px，小于这个宽度则向内挤压，大于这个宽度则居中移动端竖屏视图，这种小版心布局在不同尺寸屏幕的设备上，展示效果很好。这样的适配方法舍弃了对设计稿的“完美”还原，相应的，代码没有了预处理，更轻量了，没有了“完美”的限制，开发的过程也变得灵活，对于一种布局，有很多方式实现适配，而且，这样适配也能很好地触发浏览器的缩放功能，满足了[针对缩放的可访问性标准](https://www.w3.org/Translations/WCAG21-zh/#resize-text)。

## CHANGELOG

查看[更新日志](./CHANGELOG.md)。

## 版本规则

查看[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## 协议

查看 [MIT License](./LICENSE)。

## 支持与赞助

请随意 Issue、PR 和 Star，您也可以支付该项目，支付金额由您从该项目中获得的收益自行决定。

<details>
<summary>展开查看用于微信支付和支付宝支付的二维码。</summary>

<table>
  <tr align="center">
    <td>微信支付</td>
    <td>支付宝支付</td>
  </tr>
	<tr>
		<td><img src="./images/wechat-pay.png" alt="Pay through WeChat" /></td>
		<td><img src="./images/ali-pay.jpg" alt="Pay through AliPay" /></td>
	</tr>
</table>

</details>

## 其它

如果仅使用 [postcss-px-to-viewport](‌https://github.com/evrone/postcss-px-to-viewport)，并且项目无路由，可以通过 iframe 嵌套 vw 伸缩界面（[来源链接](https://github.com/evrone/postcss-px-to-viewport/issues/130#issuecomment-1641725322)），来达到限制最大宽度的目的，例如：

```html
<style>
  body {
    margin: 0;
  }
  #iframe {
    max-width: 520px;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    display: block;
  }
</style>
<body>
  <!-- vw-index.html 为 postcss-px-to-viewport 转换后的伸缩界面 -->
  <iframe id="iframe" src="./vw-index.html" frameborder="0"></iframe>
<body>
```

与本项目有关或者可以配合使用的项目：
- postcss-px-to-viewport，[*‌https://github.com/evrone/postcss-px-to-viewport*](https://github.com/evrone/postcss-px-to-viewport)，postcss 插件，用于将指定单位转为视口单位。
- postcss-px-to-clamp，[*https://github.com/wangguangyou/postcss-px-to-clamp*](https://github.com/wangguangyou/postcss-px-to-clamp)，postcss 插件，用于转换 px，并且限制最大和最小值。
- postcss-extract-media-query，[*https://github.com/SassNinja/postcss-extract-media-query*](https://github.com/SassNinja/postcss-extract-media-query)，postcss 插件，用于分离媒体查询。
- media-query-plugin，[*https://github.com/SassNinja/media-query-plugin*](https://github.com/SassNinja/media-query-plugin)，webpack 插件，用于分离媒体查询，可以配合其它 webpack 插件使用，例如 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)、[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)。
- scale-view，[*https://github.com/wswmsword/scale-view*](https://github.com/wswmsword/scale-view)，运行时转换伸缩尺寸，可用于框架中的行内样式，查看 [#17](https://github.com/wswmsword/postcss-mobile-forever/issues/17)。

对于包含块，插件默认的处理方式不能处理下面的情况，如果某个情况设置在祖先元素上，那么当前定位为 fixed 元素的包含块就是那个祖先元素，而插件默认所有的 fixed 元素的包含块是浏览器窗口（visual viewport）：
- transform 或 perspective 的值不是 none；
- will-change 的值是 transform 或 perspective；
- filter 的值不是 none 或 will-change 的值是 filter（只在 Firefox 下生效）；
- contain 的值是 paint（例如：`contain: paint;`）；
- backdrop-filter 的值不是 none（例如：`backdrop-filter: blur(10px);`）。

相关链接：
- [Media Queries Level 3](https://www.w3.org/TR/mediaqueries-3/#syntax)，W3C Recommendation，05 April 2022；
- [CSS syntax validator](https://csstree.github.io/docs/validator.html)，遵守 W3C 标准的在线 CSS 语法检测器；
- “[What are CSS percentages?](https://jameshfisher.com/2019/12/29/what-are-css-percentages/)”，罗列了百分比取包含块（Containing Block）宽度的属性；
- [CSS 的简写属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Shorthand_properties)，罗列了所有的简写属性；
- [postcss-bud](https://github.com/wswmsword/postcss-bud)，一款 PostCSS 插件，用于保持视图横竖居中于屏幕；
- [CSS3 Media Queries overview](http://cssmediaqueries.com/overview.html)，一个网站，展示本机当前应用的媒体查询；
- “[Don't target specific devices or sizes!](https://stackoverflow.com/a/20350990)”，一条答案，解释为什么不应该通过设备类型适配界面；
- [Media Queries for Standard Devices](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/)，罗列了各种屏幕的媒体查询；
- [响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)，MDN 的响应式设计教程。
