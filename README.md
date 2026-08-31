# postcss-mobile-forever

<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS" width="90" height="90" align="right">

[English](./README.en-US.md) | [简体中文](./README.md)

<a href="https://996.icu"><img src="https://img.shields.io/badge/link-996.icu-red.svg" alt="996.icu" align="right"></a>
<a href="https://www.npmjs.com/package/postcss-mobile-forever"><img src="https://img.shields.io/npm/v/postcss-mobile-forever?style=flat-square" alt="npm version" align="right"></a>
<a href="https://www.npmjs.com/package/postcss-mobile-forever"><img src="https://img.shields.io/npm/dm/postcss-mobile-forever?style=flat-square" alt="npm downloads" align="right"></a>

> **⚠️ Warning**
>
> 使用 vw 或 rem 生成的伸缩视图，且没有限制最大宽度的，将不能触发浏览器的缩放功能（可以通过快捷键同时按下 <kbd>Cmd/Ctrl</kbd> 和 <kbd>+/-</kbd> 触发），不能满足[针对缩放的可访问性标准](https://www.w3.org/Translations/WCAG21-zh/#resize-text)，因此存在可访问性问题。查看一个[关于 vw 伸缩视图的可访问性实验](https://github.com/wswmsword/web-experiences/tree/main/a11y/mobile-vw-viewport)。
>
> 不同设备上的界面一致，不等于用户体验一致，使用 vw（或 rem）做移动端适配，是一种粗暴的、技术先于设计的适配方法，是一条技术捷径，请考虑站在用户的角度、利用专业知识，使用[响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)开发页面，使得用户在大尺寸设备上看到更丰富的内容，在小尺寸设备上看到更简洁的内容。

postcss-mobile-forever 是一款 PostCSS 插件，用于将固定尺寸转为伸缩尺寸，得到一个能够等比例缩放的视图，并提供一揽子限制最大宽度的办法。mobile-forever 可以配合 [scale-view](https://github.com/wswmsword/scale-view) 使用，前者用于编译阶段，后者用于运行时。mobile-forever 有 4 种模式，适用不同的场景：
- ***vw-mode***，不限制最大宽度，跟随屏幕的宽窄变化，视图将等比放大或缩小，通过 *`px`->`vw`* 实现
- ***mq-mode***，媒体查询 media-query 模式，**限制最大宽度**，区分桌面端与横屏两种宽度，产包较大，可访问性较优，不支持 [At 规则](https://developer.mozilla.org/zh-CN/docs/Web/CSS/At-rule)中的样式转换，通过 *`@media`* 实现
- ***max-vw-mode***，**限制最大宽度**，不区分桌面端、横屏，达到预设宽度后即停止伸缩，产包较小，通过 *`min(vw, px)`* 实现
- ***rem-mode***，**限制最大宽度**，达到预设宽度即停止伸缩，兼容性和产包体积较 *max-vw-mode* 更优，通过 `<html>` 的 *`font-size: vw`* 和 *`@media`* 结合 *`rem`* 实现

后面的“[配置参数](#配置参数)”一节将介绍如何激活这些模式。mobile-forever 默认会矫正 `fixed` 定位的元素（例如将宽屏右下角的“Top”按钮矫正回中央视图区域），并支持[逻辑属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_logical_properties_and_values/Basic_concepts_of_logical_properties_and_values)的转换。

## 移动端模版和范例

下面是一个移动端模版列表，这些模版使用了 mobile-forever 进行配置，在宽屏上展示良好，下面的每一项都包含了在线演示链接和模版源码，通过源码可以参考 mobile-forever 的配置方法：

- [vue3-vant-mobile](https://github.com/easy-temps/vue3-vant-mobile)，一个基于 Vue 3 生态系统的移动 web 应用模板，帮助你快速完成业务开发。（[代码](https://github.com/easy-temps/vue3-vant-mobile)/[演示](https://vue3-vant-mobile.netlify.app/)，[自动矫正定位代码](./example/templates/vue3-vant-mobile-main)/[演示](https://wswmsword.github.io/examples/templates/vue3-vant-mobile/)，[rem-mode 代码](./example/templates/vue3-vant-mobile-rem-mode)/[演示](https://wswmsword.github.io/examples/templates/rem-mode/vue3-vant-mobile)）
- [vue3-vant4-mobile](https://github.com/xiangshu233/vue3-vant4-mobile)，👋👋👋 基于Vue3.4、Vite5、Vant4、Pinia、Typescript、UnoCSS等主流技术开发，集成 Dark Mode（暗黑）模式和系统主题色，且持久化保存，集成 Mock 数据，包括登录/注册/找回/keep-alive/Axios/useEcharts/IconSvg 等其他扩展。你可以在此之上直接开发你的业务代码！（[代码](https://github.com/xiangshu233/vue3-vant4-mobile)/[演示](https://vvmobile.xiangshu233.cn/#/)）
- [fantastic-mobile](https://github.com/fantastic-mobile/basic)，一款自成一派的移动端 H5 框架，支持多款 UI 组件库，基于 Vue3。（[代码](https://github.com/fantastic-mobile/basic)/[演示](https://fantastic-mobile.hurui.me/basic-example/)，[rem-mode 代码](./example/templates/basic-main)/[演示](https://wswmsword.github.io/examples/templates/rem-mode/fantastic-mobile)）


<details>
<summary>
文件夹 “example/” 内提供了在框架中（如 React、Svelte、Next.js 等）和其它开源模版中使用 mobile-forever 的范例，范例中也包含部分上面的移动端模板，克隆本仓库后，通过命令行进入对应的范例文件夹中，即可运行。
</summary>


```bash
cd example/react/
npm install
npm run start
```

- 原生 JS 的 max-vw-mode。（[代码](./example/others/maxDisplayWidth-vanilla/)/[演示](https://wswmsword.github.io/examples/mobile-forever/maxDisplayWidth/)）
- Next.js 的 max-vw-mode。（[代码](./example/nextjs/)）
- Nuxt 的 max-vw-mode。（[代码](./example/nuxtjs/)）
- 原生 JS 的 mq-mode。（[代码](./example/vanilla/)/[演示](https://wswmsword.github.io/examples/mobile-forever/vanilla/)）
- React 的 mq-mode。（[代码](./example/react/)/[演示](https://wswmsword.github.io/examples/mobile-forever/react/)）
- Vue 的 mq-mode。（[代码](./example/vue/)/[演示](https://wswmsword.github.io/examples/mobile-forever/vue/)）
- Svelte 的 mq-mode。（[代码](./example/svelte)/[演示](https://wswmsword.github.io/examples/mobile-forever/svelte/)）
- Vue 使用 Vant TabBar 的 mq-mode。（[代码](./example/others/vant-vue/)/[演示](https://wswmsword.github.io/examples/mobile-forever/vant-vue/)）

---

- [v-shop](https://github.com/JoeshuTT/v-shop)，🛒 v-shop 是一个移动端 H5 商城。（[代码](./example/templates/v-shop)/[演示](https://wswmsword.github.io/examples/templates/v-shop/)）
- [vue-h5-template](https://github.com/sunniejs/vue-h5-template)，一个快速开发的 Vue H5 移动端脚手架。（[代码](./example/templates/vue-h5-template)/[演示](https://wswmsword.github.io/examples/templates/vue-h5-template/)）
- [KITE-TRIP](https://github.com/sakurafall/KITE-TRIP)，一个简单的旅游应用模版。（[代码](./example/templates/kite-trip/)/[演示](https://wswmsword.github.io/examples/templates/kite-trip/)）
- [vue3-calendar](https://github.com/qddidi/vue3-calendar)，基于 Vue3 实现的万年历、老黄历、日历。（[代码](./example/templates/vue3-calendar/)/[演示](https://wswmsword.github.io/examples/templates/vue3-calendar/)）

</details>

## 安装和迁移

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
		]
	}
}
// 省略……
```

https://github.com/webpack-contrib/postcss-loader/issues/172

</details>

如果项目原本是基于 rem+js 做的移动端适配，可以参考文档“[迁移](./migration.md)”，迁移到 vw 移动端适配或 mobile-forever 提供的其它适配办法。

## 配置参数

一大波配置参数正在靠近，不必焦虑，尽在掌握，首先我们尝试最基础的配置（max-vw-mode）：

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "maxDisplayWidth": 600
}
```

这样的配置也许已经满足了项目要求。它表示了应用正在基于 `750px` 的宽度编码，经过 mobile-forever 转换后，浏览器中，应用视图将被限制在 `600px` 宽度以内进行等比例缩放，当宽度大于 `600px`，视图将不改变，并且根元素 `#app` 的应用视图始终处于浏览器窗口的中央区域。继续浏览以处理特殊情况。

下表的每一项都是可选的。设定 `viewportWidth` 后激活 **vw-mode**，设定 `maxDisplayWidth` 后激活 **max-vw-mode**，指定 `mobileUnit` 的值为 `rem` 或设定 `basicRemWidth` 后，激活 **rem-mode**。这 3 种模式的属性设定是递进的，后一个模式需要同时设定前一个模式的所需属性。设定 `viewportWidth` 和 `enableMediaQuery` 后激活 **mq-mode**。

激活 *max-vw-mode*、*rem-mode*、*mq-mode* 后，样式文件中至少要包含空的应用最外层选择器，例如 `#app {}`，激活 `rem-mode` 后，样式文件还要至少包含空的 `<html>` 选择器，例如 `html {}`。

| Name | Type | Default | Desc                                                                                                                                                                                                                                                                                        |
|:--|:--|:--|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| viewportWidth | number\|(file: string) => number | 750 | 应用基于该宽度进行开发，转换后的伸缩视图将会以该宽度的视图作为标准进行比例伸缩；可以传递函数动态生成宽度，例如 `file => file.includes("vant") ? 375 : 750` 表示在名称包含“vant”的文件内使用 375px 的宽度，而其他文件使用 750px 的宽度                                                                                                                                         |
| mobileUnit | string | "vw" | 移动端竖屏视口视图，转换成什么伸缩单位？设置为 `rem` 后激活 **rem-mode**                                                                                                                                                                                                                                                                         |
| maxDisplayWidth | number | / | 伸缩视图的最大宽度                                                                                                                                                                                                                                                                                |
| basicRemWidth | number | / | *rem-mode* 的基准宽度，若不设定，将通过 `viewportWidth` 获取 |
| enableMediaQuery | boolean | false | 打开媒体查询模式，打开后将自动关闭 `maxDisplayWidth`，激活 **mq-mode**                                                                                                                                                                                                                                                         |
| desktopWidth | number | 600 | 适配到桌面端宽度时，展示的视图宽度                                                                                                                                                                                                                                                                             |
| landscapeWidth | number | 425 | 适配到移动端横屏宽度时，展示的视图宽度                                                                                                                                                                                                                                                                           |
| appSelector | string | / | 页面最外层选择器，例如“`#app`”，用于设置在桌面端和移动端横屏时的居中样式，样式文件中至少要包含空的选择器 `#app {}`                                                                                                                                                                                                                                                    |
| appContainingBlock | "calc"\|"manual"\|"auto" | "calc" | 该属性和矫正 `fixed` 定位元素有关，`manual` 将不矫正；`calc` 将**主动计算**矫正元素尺寸，**是默认行为**；`auto` 将通过 `contain: layer` 指定根[包含块](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block)取代窗口包含块，自动矫正元素，此时需设置 `necessarySelectorWhenAuto`                                            |
| necessarySelectorWhenAuto | string | "body" | 当 `appContainingBlock` 设为 `auto` 时，需要指定该属性，该属性指定了 `appSelector` 的父元素，样式文件中要包含对应选择器的样式块，例如 `body {}`，查看一个[实验](https://github.com/wswmsword/web-experiences/tree/main/css/fixed-on-containing-block)以了解原理，您也可以查看[示例项目](./example/cases/auto-app-containing-block/postcss.config.js)以了解使用方法 |
| border | boolean\|string | false | 在页面外层展示边框吗，用于分辨居中的小版心布局和背景，可以设置颜色字符串                                                                                                                                                                                                                                                        |
| disableDesktop | boolean | false | 打开则不做桌面端适配，使用该参数前需要打开 `enableMediaQuery`                                                                                                                                                                                                                                                    |
| disableLandscape | boolean | false | 打开则不做移动端横屏适配，使用该参数前需要打开 `enableMediaQuery`                                                                                                                                                                                                                                                  |
| disableMobile | boolean | false | 打开则不做移动端竖屏适配，把 px 转换为视口单位，如 vw                                                                                                                                                                                                                                                              |
| exclude | RegExp\|RegExp[] | / | 排除文件或文件夹                                                                                                                                                                                                                                                                                    |
| include | RegExp\|RegExp[] | / | 包括文件或文件夹                                                                                                                                                                                                                                                                                    |
| unitPrecision | number | 3 | 单位精确到小数点后几位？                                                                                                                                                                                                                                                                                |
| propList | string[] | ['*'] | 哪些属性要替换，哪些属性忽略？用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md)                                                                                                                                                                    |
| selectorBlackList | (string\|RegExp)[] | [] | 选择器黑名单，名单上的不转换                                                                                                                                                                                                                                                                              |
| propertyBlackList | propertyBlackList | [] | 属性黑名单，名单上的不转换，如果要指定选择器内的属性，用对象的键表示选择器名称，具体用法见 [Vant 的范例代码](./example/others/vant-vue/postcss.config.cjs#L9C17-L9C17)                                                                                                                                                                        |
| valueBlackList | (string\|RegExp)[] | [] | 属性值黑名单，名单上的值不转换                                                                                                                                                                                                                                                                             |
| rootContainingBlockSelectorList | (string\|RegExp)[] | [] | 包含块是根元素的选择器列表，效果和标注注释 `/* root-containing-block */` 相同，如果列表数量庞大，请考虑指定  `appContainingBlock` 为 `auto`                                                                                                                                                                                                                                      |
| verticalWritingSelectorList | (string\|RegExp)[] | [] | 纵向书写模式的选择器列表，效果和在选择器顶部标注注释 `/* vertical-writing-mode */` 相同                                                                                                                                                                                                                                 |
| minDesktopDisplayWidth | number | / | 宽度断点，如果不提供这个值，默认使用 `desktopWidth` 的值，视图大于这个宽度，则页面宽度是桌面端宽度 `desktopWidth`，“原理和输入输出范例”一节具体介绍了该值的触发情况                                                                                                                                                                                          |
| maxLandscapeDisplayHeight | number | 640 | 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度，“原理和输入输出范例”一节具体介绍了该值的触发情况                                                                                                                                                                                                                                |
| side | any | / | 侧边配置，在桌面端媒体查询中生效，用于利用宽屏的空间，后文将介绍它的若干子属性                                                                                                                                                                                                                                                     |
| comment | any | / | 自定义注释，改变注释的名称，后文将介绍它的若干子属性                                                                                                                                                                                                                                                                  |
| customLengthProperty | any | / | 用于指定需要添加到桌面端或横屏的自定义变量（css 变量，`var(...)`），如果不指定，默认**所有**和长度有关的属性，如果使用了自定义变量，都会被添加入桌面端和横屏，后文将介绍它的若干子属性                                                                                                                                                                                        |
| experimental.extract | boolean | false | 提取桌面端与横屏样式代码，用于生产环境，用于代码分割优化产包，具体查看“注意事项”一节                                                                                                                                                                                                                                                 |
| experimental.minDisplayWidth | number | / | 限制最小宽度，和 `maxDisplayWidth` 搭配使用                                                                                                                                                                                                                                                             |

下面是属性 `customLengthProperty` 的子属性，用于自定义变量，并且每一个属性都是可选的。`customLengthProperty` 有两个作用，一个是指定转换方式，例如基于根包含块的 `left` 和 `right`，则需要 `customLengthProperty.rootContainingBlockList_LR` 进行指定，来得到正确的转换结果，另一个作用是，在媒体查询模式下，避免所有和长度有关的使用 CSS 变量的属性，都被添加到媒体查询中，用于指定真正需要添加到桌面端或横屏的自定义变量：

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

也可以通过在样式文件中添加注释，来标记局部的尺寸该如何转换，下面是一些标记注释：
- `/* apply-without-convert */`，标记在一行属性之后，表示属性不经过转换，将直接添加到桌面端和横屏（可用于属性覆盖的情况）；
- `/* root-containing-block */`，标记在选择器上面，用于表示当前选择器的包含块是根元素，是浏览器窗口（如果选择器中已有“`position: fixed;`”，则无需标注该注释）；
- `/* not-root-containing-block */`，标记在选择器上面，用于表示当前选择器所属元素的包含块不是根元素；
- `/* mobile-ignore-next */`，标记在一行属性的上面，表示下一行属性不需要进行转换；
- `/* mobile-ignore */`，标记在一行属性后面，表示当前行属性不需要进行转换；
- `/* vertical-writing-mode */`，标记在选择器上面，表示当前选择器是纵向书写模式，内部的逻辑属性需要被转换。

<details>
<summary>标记注释的名称可以通过属性自定义，这些属性不常用，您可以展开查看属性的具体说明。</summary>

下面是属性 `comment` 的子属性，每一个属性都是可选的，`comment` 用于自定义注释：

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| applyWithoutConvert | string | "apply-without-convert" | 直接添加进屏幕媒体查询，不转换 |
| rootContainingBlock | string | "root-containing-block" | 包含块注释 |
| notRootContainingBlock | string | "not-root-containing-block" | 非包含块注释 |
| ignoreNext | string | "mobile-ignore-next" | 忽略选择器内的转换 |
| ignoreLine | string | "mobile-ignore" | 忽略本行转换 |
| verticalWritingMode | string | "vertical-writing-mode" | 纵向书写模式 |
</details>

<details>
<summary>
虽然配置选项的数量看起来很多，但是只需要指定选项 viewportWidth 后，就可以输出伸缩视图的结果，通常我们还需要让伸缩视图具有最大宽度，只要再添加 appSelector 和 maxDisplayWidth，即可完成。开发中，如果在浏览器看到了宽屏的视图有和在移动端视图不一样的地方，再考虑配置其它选项也不迟。
</summary>

下面的配置会激活 max-vw-mode，使用 CSS 函数限制视口单位的最大值，当屏幕宽度超过 600px 后，视图不会再变化：

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "maxDisplayWidth": 600
}
```

下面的配置会激活 mq-mode，生成媒体查询，适配桌面端和横屏，桌面端视图的宽度是 600px，横屏的宽度是 425px：

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "enableMediaQuery": true
}
```

如果暂时不希望优化视图在大屏的可访问性，不做最大宽度的限制，可以像下面这样配置激活 vw-mode：

```json
{
  "viewportWidth": 750
}
```

</details>

<details>
<summary>
展开查看默认的配置参数。
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
  "appContainingBlock": "calc",
  "necessarySelectorWhenAuto": "body",
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
  "propList": ["*"],
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
    "extract": false,
    "minDisplayWidth": null
  }
}
```

</details>

## 单元测试与参与开发

```bash
npm install
npm run test
```

修改源码后，编写单元测试，验证是否输出了预期的结果。另外，在文件夹 `example/` 内提供了一些范例，可以用来模拟生产环境使用插件的场景，这些范例项目中依赖的 `postcss-mobile-forever` 来自源码，因此当修改源码后，可以通过在范例里 `npm i` 安装依赖，然后本地运行，通过浏览器验证自己的修改是否符合预期。

如果您是移动端模版的开发者，成功引入 postcss-mobile-forever 之后，您可以按照“移动端模版和范例”一节的格式，提交 PR，将您的模版仓库以及在线演示地址添加到后续的列表中，这样可以为您的模版提供更多的曝光，也能够表示您的移动端模版具有良好的桌面端体验。

一起开发，让程序的变量命名更合适、性能和功能更好。

## 输入输出范例和原理

插件配置：

```json
{
  "viewportWidth": 750,
  "maxDisplayWidth": 560,
  "appSelector": "#app"
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
<summary>查看激活 rem 模式后的输入、输出范例。</summary>

插件配置：

```json
{
  "viewportWidth": 750,
  "maxDisplayWidth": 560,
  "mobileUnit": "rem",
  "appSelector": "#app"
}
```

输入范例：

```css
html {}

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
html {
  font-size: 13.333333333333334vw !important;
}

#app {
  max-width   : 560px !important;
  margin-left : auto !important;
  margin-right: auto !important;
  width       : 100%;
}

.nav {
  position: fixed;
  width   : 7.5rem;
  height  : 0.72rem;
  left    : calc(50% - 3.75rem);
  top     : 0;
}

@media (min-width: 560px) {
  html {
    font-size: 74.66666666666667px !important;
  }
}
```
</details>

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

appSelector 所在元素的居中属性会被占用，包括 `margin-left`、`margin-right`、`max-width`，如果开启了 border，`box-shadow` 会被占用。

默认情况，插件会把所有 `fixed` 定位的元素的包含块当成根元素，如果希望跳过处理非根元素的包含块，请在选择器上方添加注释，`/* not-root-containing-block */`，这样设置后，插件会知道这个选择器内的计算方式统一使用非根包含块的计算方式：

```css
/* not-root-containing-block */
.class {
  position: fixed;
  left: 50%;
}
```

对于包含块，插件默认的处理方式不能处理下面列表中的情况，如果下面某个情况设置在某个祖先元素上，那么当前定位为 `fixed` 元素的包含块就是那个祖先元素，而插件默认所有的 `fixed` 元素的包含块是浏览器窗口（visual viewport）：
- transform 或 perspective 的值不是 none；
- will-change 的值是 transform 或 perspective；
- filter 的值不是 none 或 will-change 的值是 filter（只在 Firefox 下生效）；
- contain 的值是 paint（例如：`contain: paint;`）；
- backdrop-filter 的值不是 none（例如：`backdrop-filter: blur(10px);`）。

如果使用了原子化 CSS 框架，例如 [UnoCSS](https://unocss.dev/)、[tailwindcss](https://tailwindcss.com/)，这样的项目里每一个 CSS 属性都是单独的选择器，需要把包含块从浏览器窗口设置成应用根元素，才能解决 fixed 定位矫正问题。当使用原子化 CSS 框架后，请查看并使用 `appContainingBlock` 和 `necessarySelectorWhenAuto` 选项。通常 `necessarySelectorWhenAuto` 无需关注和设置，默认值为 `body`，所以保证全局样式文件中包含 `body {}` 即可。

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

<details>
<summary>
展开查看关于“experimental.extract”选项的一些说明。
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

下面的例子，默认的情况，`--len-a` 的值在桌面端会被转为 `60px`，横屏会被转为 `42.5px`，但是可以看到实际的应用场景中，定位是 `fixed`，因此包含块是根包含块，所以默认的转换是错误的，正确的转换应该是，桌面端会被转为 `calc(50% - 240px)`，横屏会被转为 `calc(50% - 170px)`。
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
    rootContainingBlockList_LR: ["--len-a"]
  }
}
```

</details>

本插件媒体查询模式的目标是在不同尺寸的屏幕上展示**合适**的视图，在宽一点的屏幕上展示大一点的视图，在扁一点的屏幕上展示小一点的视图，在窄一些的屏幕展示移动端竖屏视图，而**非准确**地识别具体的设备或平台来应用对应视图。

使用插件转换后的浏览器兼容性情况：*媒体查询模式*和 *rem 模式*下会利用 CSS 函数 `calc()`，因此兼容性略有降低，Opera Mini 完全不可用，max-vw-mode 利用了 CSS 函数 `max()`、`min()` 以及 `calc()`，会有兼容性问题，IE、Opera Mini、QQ 浏览器 13.1 完全不可用，具体可以查看 [caniuse min(), max()](https://caniuse.com/css-math-functions)、[caniuse calc()](https://caniuse.com/calc)。

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

<details>
<summary>
如果仅使用 postcss-px-to-viewport，并且项目无路由，可以通过 iframe 嵌套 vw 伸缩界面（<a href="https://github.com/evrone/postcss-px-to-viewport/issues/130#issuecomment-1641725322">来源链接</a>），来达到限制最大宽度的目的。
</summary>

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
</details>

与本项目有关或者可以配合使用的项目：
- [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport)，postcss 插件，用于将指定单位转为视口单位。
- [postcss-px-to-clamp](https://github.com/wangguangyou/postcss-px-to-clamp)，postcss 插件，用于转换 px，并且限制最大和最小值。
- [postcss-extract-media-query](https://github.com/SassNinja/postcss-extract-media-query)，postcss 插件，用于分离媒体查询。
- [media-query-plugin](https://github.com/SassNinja/media-query-plugin)，webpack 插件，用于分离媒体查询，可以配合其它 webpack 插件使用，例如 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)、[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)。
- [scale-view](https://github.com/wswmsword/scale-view)，运行时转换伸缩尺寸，可用于框架中的行内样式，查看 [#17](https://github.com/wswmsword/postcss-mobile-forever/issues/17)。

相关链接：
- [Media Queries Level 3](https://www.w3.org/TR/mediaqueries-3/#syntax)，W3C Recommendation，05 April 2022；
- [CSS syntax validator](https://csstree.github.io/docs/validator.html)，遵守 W3C 标准的在线 CSS 语法检测器；
- “[What are CSS percentages?](https://jameshfisher.com/2019/12/29/what-are-css-percentages/)”，罗列了百分比取包含块（Containing Block）宽度的属性；
- [CSS 的简写属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Shorthand_properties)，罗列了所有的简写属性；
- [Definition of "containing block"](https://www.w3.org/TR/CSS2/visudet.html#containing-block-details)，W3C Recommendation；
- [postcss-bud](https://github.com/wswmsword/postcss-bud)，一款 PostCSS 插件，用于保持视图横竖居中于屏幕；
- [CSS3 Media Queries overview](http://cssmediaqueries.com/overview.html)，一个网站，展示本机当前应用的媒体查询；
- “[Don't target specific devices or sizes!](https://stackoverflow.com/a/20350990)”，一条答案，解释为什么不应该通过设备类型适配界面；
- [Media Queries for Standard Devices](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/)，罗列了各种屏幕的媒体查询；
- [增强 vw/rem 移动端适配](https://juejin.cn/post/7431558902171484211)，一篇介绍增强 vw 的科普博文；
- [响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)，MDN 的响应式设计教程。
