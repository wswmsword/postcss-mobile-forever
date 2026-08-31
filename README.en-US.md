# postcss-mobile-forever

<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS" width="90" height="90" align="right">

[English](./README.en-US.md) | [简体中文](./README.md)

<a href="https://996.icu/#/en_US"><img src="https://img.shields.io/badge/link-996.icu-red.svg" alt="996.icu" align="right"></a>
<a href="https://www.npmjs.com/package/postcss-mobile-forever"><img src="https://img.shields.io/npm/v/postcss-mobile-forever?style=flat-square" alt="npm version" align="right"></a>
<a href="https://www.npmjs.com/package/postcss-mobile-forever"><img src="https://img.shields.io/npm/dm/postcss-mobile-forever?style=flat-square" alt="npm downloads" align="right"></a>

> **⚠️ Warning**
>
> Scaled views generated with `vw` or `rem` units that are not limited to a maximum width will not trigger the browser's zoom feature (you can force it with <kbd>Cmd/Ctrl</kbd> + <kbd>+/-</kbd>), which fails the [WCAG accessibility standard for resizing text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html). See an [accessibility experiment on vw-scaled views](https://github.com/wswmsword/web-experiences/tree/main/a11y/mobile-vw-viewport).
>
> A consistent interface across devices is not the same as a consistent user experience. Using `vw` (or `rem`) for mobile adaptation is a crude, technology-first approach and a shortcut. Consider using [responsive design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design) from the user's perspective: show richer content on large screens and simpler content on small screens.

postcss-mobile-forever is a PostCSS plugin that converts fixed sizes to scalable sizes, producing a proportionally scaled view, with a complete set of options to limit the maximum width. mobile-forever can be used together with [scale-view](https://github.com/wswmsword/scale-view): the former works at build time, the latter at runtime. mobile-forever has 4 modes for different scenarios:

- ***vw-mode***: no maximum width, the view scales proportionally to follow the screen width via *`px`->`vw`* conversion
- ***mq-mode***: media-query mode, **caps the maximum width**, distinguishes desktop and landscape widths, produces larger bundles, has better accessibility, does **not** support converting styles inside [At-rules](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule), implemented with *`@media`*
- ***max-vw-mode***: **caps the maximum width**, does not distinguish desktop from landscape, stops scaling once it reaches the preset width, produces smaller bundles, implemented with *`min(vw, px)`*
- ***rem-mode***: **caps the maximum width**, stops scaling at the preset width, better compatibility and smaller bundles than *max-vw-mode*, implemented with *`font-size: vw`* on `<html>` + *`@media`* combined with *`rem`*

See the [Options](#options) section below for how to activate these modes. By default, mobile-forever corrects `fixed`-positioned elements (e.g. pulling a "Top" button in the lower-right corner of a wide screen back into the centered view area), and supports the conversion of [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values).

## Mobile templates and examples

The following is a list of mobile templates that use mobile-forever and display well on wide screens. Each item includes an online demo and source code, from which you can learn how to configure mobile-forever:

- [vue3-vant-mobile](https://github.com/easy-temps/vue3-vant-mobile) — a mobile web app template based on the Vue 3 ecosystem, helping you build business features quickly. ([code](https://github.com/easy-temps/vue3-vant-mobile)/[demo](https://vue3-vant-mobile.netlify.app/), [position-correction code](./example/templates/vue3-vant-mobile-main)/[demo](https://wswmsword.github.io/examples/templates/vue3-vant-mobile/), [rem-mode code](./example/templates/vue3-vant-mobile-rem-mode)/[demo](https://wswmsword.github.io/examples/templates/rem-mode/vue3-vant-mobile))
- [vue3-vant4-mobile](https://github.com/xiangshu233/vue3-vant4-mobile) — a mobile template built with Vue 3.4, Vite 5, Vant 4, Pinia, TypeScript, UnoCSS, etc., with dark mode, system theme colors, mock data, login/register/forgot-password flows, keep-alive, Axios, useEcharts, IconSvg and more. Start your business code on top of it! ([code](https://github.com/xiangshu233/vue3-vant4-mobile)/[demo](https://vvmobile.xiangshu233.cn/#/))
- [fantastic-mobile](https://github.com/fantastic-mobile/basic) — a distinguished mobile H5 framework based on Vue 3 that supports multiple UI component libraries. ([code](https://github.com/fantastic-mobile/basic)/[demo](https://fantastic-mobile.hurui.me/basic-example/), [rem-mode code](./example/templates/basic-main)/[demo](https://wswmsword.github.io/examples/templates/rem-mode/fantastic-mobile))

<details>
<summary>
The `example/` folder contains examples of using mobile-forever in frameworks (React, Svelte, Next.js, etc.) and other open-source templates, including some of the mobile templates above. Clone the repo, enter an example folder, and run it:
</summary>

```bash
cd example/react/
npm install
npm run start
```

- max-vw-mode with vanilla JS. ([code](./example/others/maxDisplayWidth-vanilla/)/[demo](https://wswmsword.github.io/examples/mobile-forever/maxDisplayWidth/))
- max-vw-mode with Next.js. ([code](./example/nextjs/))
- max-vw-mode with Nuxt. ([code](./example/nuxtjs/))
- mq-mode with vanilla JS. ([code](./example/vanilla/)/[demo](https://wswmsword.github.io/examples/mobile-forever/vanilla/))
- mq-mode with React. ([code](./example/react/)/[demo](https://wswmsword.github.io/examples/mobile-forever/react/))
- mq-mode with Vue. ([code](./example/vue/)/[demo](https://wswmsword.github.io/examples/mobile-forever/vue/))
- mq-mode with Svelte. ([code](./example/svelte)/[demo](https://wswmsword.github.io/examples/mobile-forever/svelte/))
- mq-mode with Vue using Vant TabBar. ([code](./example/others/vant-vue/)/[demo](https://wswmsword.github.io/examples/mobile-forever/vant-vue/))

---

- [v-shop](https://github.com/JoeshuTT/v-shop) — a mobile H5 mall. ([code](./example/templates/v-shop)/[demo](https://wswmsword.github.io/examples/templates/v-shop/))
- [vue-h5-template](https://github.com/sunniejs/vue-h5-template) — a Vue H5 mobile scaffolding for rapid development. ([code](./example/templates/vue-h5-template)/[demo](https://wswmsword.github.io/examples/templates/vue-h5-template/))
- [KITE-TRIP](https://github.com/sakurafall/KITE-TRIP) — a simple travel app template. ([code](./example/templates/kite-trip/)/[demo](https://wswmsword.github.io/examples/templates/kite-trip/))
- [vue3-calendar](https://github.com/qddidi/vue3-calendar) — a calendar app with Chinese lunar dates based on Vue 3. ([code](./example/templates/vue3-calendar/)/[demo](https://wswmsword.github.io/examples/templates/vue3-calendar/))

</details>

## Install & migrate

Install the latest version with npm (based on `postcss@^8.0.0`) (with yarn: `yarn add -D postcss postcss-mobile-forever`):

```bash
npm install --save-dev postcss postcss-mobile-forever
```

Install the latest compatible version (based on `postcss@^6.0.0`) (with yarn: `yarn add -D postcss-mobile-forever@legacy`):

```bash
npm install postcss-mobile-forever@legacy --save-dev
```

See [the docs for the compatible version](./README_LEGACY.md). Note that the compatible version does not support [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values).

<details>
<summary>
After installing, import it in `postcss.config.js` or your framework's config file.
</summary>

`postcss.config.js` supports several [config formats](https://github.com/webpack-contrib/postcss-loader#config). Here is one of them:

```javascript
import mobile from 'postcss-mobile-forever' // <---- here
import autoprefixer from 'autoprefixer'
// …omitted…
{
	postcss: {
		plugins: [
			autoprefixer(),
			mobile({ // <---- here
				appSelector: '#app',
				viewportWidth: 375,
				maxDisplayWidth: 580,
			}),
		]
	}
}
// …omitted…
```

https://github.com/webpack-contrib/postcss-loader/issues/172

</details>

If your project was previously adapted for mobile with rem+JS, see [Migration](./migration.md) to move to vw-based adaptation or other approaches provided by mobile-forever.

## Options

A large wave of options is coming — don't panic, it's all manageable. Let's start with the most basic config (max-vw-mode):

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "maxDisplayWidth": 600
}
```

This config may already satisfy your project. It means: the app is coded against a width of `750px`; after mobile-forever transforms it, the view scales proportionally and is capped at `600px`; beyond `600px` the view no longer changes, and the root `#app` view is always centered in the browser window. Keep reading for special cases.

Every option in the table below is optional. Setting `viewportWidth` activates **vw-mode**; setting `maxDisplayWidth` additionally activates **max-vw-mode**; setting `mobileUnit` to `rem` or setting `basicRemWidth` activates **rem-mode**. The modes are progressive — activating a later mode requires the options of the earlier ones. Setting both `viewportWidth` and `enableMediaQuery` activates **mq-mode**.

After activating *max-vw-mode*, *rem-mode*, or *mq-mode*, your stylesheet must contain at least an empty outermost selector for the app, e.g. `#app {}`. In *rem-mode*, the stylesheet must also contain an empty `<html>` selector, e.g. `html {}`.

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| viewportWidth | number\|(file: string) => number | 750 | The width your app is designed against; the scaled view is proportionally based on this width. Pass a function to set the width dynamically per file, e.g. `file => file.includes("vant") ? 375 : 750` uses 375px for files whose name contains "vant" and 750px for all others |
| mobileUnit | string | "vw" | Which scalable unit should the portrait (mobile) view be converted to? Set to `rem` to activate **rem-mode** |
| maxDisplayWidth | number | / | The maximum width of the scaled view |
| basicRemWidth | number | / | Base width for *rem-mode*; if not set, falls back to `viewportWidth` |
| enableMediaQuery | boolean | false | Enable media-query mode. When enabled, `maxDisplayWidth` is automatically turned off and **mq-mode** is activated |
| desktopWidth | number | 600 | The width of the view when adapted to a desktop screen |
| landscapeWidth | number | 425 | The width of the view when adapted to a landscape mobile screen |
| appSelector | string | / | The outermost selector of the page, e.g. `#app`; used to center the view on desktop and landscape mobile. The stylesheet must contain at least an empty `#app {}` selector |
| appContainingBlock | "calc"\|"manual"\|"auto" | "calc" | Related to correcting `fixed`-positioned elements. `manual` disables correction; `calc` **actively computes** the corrected element sizes and **is the default**; `auto` uses `contain: layer` to set the root [containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block) instead of the window, auto-correcting elements. When `auto`, you must also set `necessarySelectorWhenAuto` |
| necessarySelectorWhenAuto | string | "body" | Required when `appContainingBlock` is `auto`. Specifies the parent element of `appSelector`; the stylesheet must contain a style block for that selector, e.g. `body {}`. See an [experiment](https://github.com/wswmsword/web-experiences/tree/main/css/fixed-on-containing-block) for the principle, or the [example project](./example/cases/auto-app-containing-block/postcss.config.js) for usage |
| border | boolean\|string | false | Show a border around the page to distinguish the small centered layout from the background; can be a color string |
| disableDesktop | boolean | false | Disable desktop adaptation. Requires `enableMediaQuery` |
| disableLandscape | boolean | false | Disable landscape mobile adaptation. Requires `enableMediaQuery` |
| disableMobile | boolean | false | Disable portrait mobile adaptation; converts px to viewport units such as vw |
| exclude | RegExp\|RegExp[] | / | Exclude files or folders |
| include | RegExp\|RegExp[] | / | Include files or folders |
| unitPrecision | number | 3 | How many decimal places should units be rounded to? |
| propList | string[] | ['*'] | Which properties to convert and which to skip. See the [postcss-px-to-viewport docs](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) for usage |
| selectorBlackList | (string\|RegExp)[] | [] | Selector blacklist; matching selectors are not converted |
| propertyBlackList | propertyBlackList | [] | Property blacklist; matching properties are not converted. To restrict properties to a specific selector, use the selector name as the object key. See the [Vant example](./example/others/vant-vue/postcss.config.cjs#L9C17-L9C17) |
| valueBlackList | (string\|RegExp)[] | [] | Value blacklist; matching values are not converted |
| rootContainingBlockSelectorList | (string\|RegExp)[] | [] | Selectors whose containing block is the root element. Equivalent to the `/* root-containing-block */` comment; if the list gets large, consider setting `appContainingBlock` to `auto` |
| verticalWritingSelectorList | (string\|RegExp)[] | [] | Selectors in vertical writing mode. Equivalent to the `/* vertical-writing-mode */` comment placed above a selector |
| minDesktopDisplayWidth | number | / | Width breakpoint; defaults to `desktopWidth` if not provided. The view uses the desktop width `desktopWidth` once the viewport is wider than this value. See "Input/Output Examples and How It Works" for details |
| maxLandscapeDisplayHeight | number | 640 | Height breakpoint; when the view is shorter than this and certain conditions hold, the page uses the landscape mobile width. See "Input/Output Examples and How It Works" for details |
| side | any | / | Side config, applied in the desktop media query, for making use of wide-screen space. Sub-properties are described below |
| comment | any | / | Custom comments; change the names of the marker comments. Sub-properties are described below |
| customLengthProperty | any | / | Specifies the custom properties (CSS variables, `var(...)`) to add to desktop/landscape output. If not specified, **all** length-related properties using custom variables are added to desktop and landscape output by default. Sub-properties are described below |
| experimental.extract | boolean | false | Extract desktop and landscape styles into separate files for production, enabling code-splitting to optimize bundles. See "Notes" |
| experimental.minDisplayWidth | number | / | Cap the minimum width; pair with `maxDisplayWidth` |

The following are sub-properties of `customLengthProperty`, for custom variables — each is optional. `customLengthProperty` serves two purposes: specifying the conversion method (e.g. `left`/`right` based on the root containing block require `customLengthProperty.rootContainingBlockList_LR` for correct conversion), and, in media-query mode, avoiding adding every length-related property that uses a CSS variable to the media queries — instead specifying exactly which custom variables should be added to desktop/landscape output:

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| rootContainingBlockList_LR | string[] | [] | Custom properties used for `left`/`right` in the root containing block. E.g. with `["--len-a", "--len-b"]`, `--len-a` and `--len-b` values are converted for use in `left` and `right` properties with the root containing block, and added to desktop and landscape output |
| rootContainingBlockList_NOT_LR | string[] | [] | Custom properties used for non-`left`/`right` properties in the root containing block |
| ancestorContainingBlockList | string[] | [] | Custom properties for non-root containing blocks; values are not converted but are added to desktop and landscape output to avoid specificity issues |
| disableAutoApply | boolean | false | Disable auto-adding custom properties to desktop and landscape output. Setting any of the three options above automatically sets this to `true` |

<details>
<summary>
There are also options for moving parts of the page to the side on wide screens, e.g. moving a QR code from the bottom of the mobile page to the desktop sidebar to make use of empty space. These options are rarely used; expand to see details.
</summary>

The following are sub-properties of `side` — each is optional. `side` configures side content and takes effect only in media-query mode with `disableDesktop` set to `false`:

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| width | number | / | Side width; unnecessary if the specified selector already has a `width` property |
| gap | number | 18 | Spacing around the side layout |
| selector1 | string | / | Top-left side element selector |
| selector2 | string | / | Top-right side element selector |
| selector3 | string | / | Bottom-right side element selector |
| selector4 | string | / | Bottom-left side element selector |
| width1 | number | / | Top-left side width; takes precedence over `width` |
| width2 | number | / | Top-right side width |
| width3 | number | / | Bottom-right side width |
| width4 | number | / | Bottom-left side width |

</details>

You can also use comments in your stylesheet to mark how a local size should be converted:

- `/* apply-without-convert */` — placed after a property line: the property is added to desktop and landscape output without conversion (useful for overrides);
- `/* root-containing-block */` — placed above a selector: the selector's containing block is the root element (the browser window). If the selector already contains `position: fixed;`, no comment is needed;
- `/* not-root-containing-block */` — placed above a selector: the element's containing block is not the root element;
- `/* mobile-ignore-next */` — placed above a property line: the next property line is not converted;
- `/* mobile-ignore */` — placed after a property line: the current property line is not converted;
- `/* vertical-writing-mode */` — placed above a selector: the selector is in vertical writing mode, so its internal logical properties need to be converted.

<details>
<summary>The marker comment names can be customized via the `comment` option — rarely needed; expand for details.</summary>

The following are sub-properties of `comment` — each is optional:

| Name | Type | Default | Desc |
|:--|:--|:--|:--|
| applyWithoutConvert | string | "apply-without-convert" | Added to screen media queries without conversion |
| rootContainingBlock | string | "root-containing-block" | Containing-block comment |
| notRootContainingBlock | string | "not-root-containing-block" | Non-containing-block comment |
| ignoreNext | string | "mobile-ignore-next" | Ignore conversion of the next line |
| ignoreLine | string | "mobile-ignore" | Ignore conversion of the current line |
| verticalWritingMode | string | "vertical-writing-mode" | Vertical writing mode |

</details>

<details>
<summary>
Although there are many options, setting only `viewportWidth` already produces a scaled view. To also cap the maximum width, just add `appSelector` and `maxDisplayWidth`. If you see differences between the wide-screen view and the mobile view during development, consider other options then.
</summary>

The following config activates max-vw-mode, using a CSS function to cap the viewport unit's maximum value. After the screen width exceeds 600px, the view no longer changes:

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "maxDisplayWidth": 600
}
```

The following config activates mq-mode, generating media queries to adapt to desktop and landscape. The desktop view width is 600px and the landscape width is 425px:

```json
{
  "viewportWidth": 750,
  "appSelector": "#app",
  "enableMediaQuery": true
}
```

If you don't want to limit the maximum width for now, to keep the view's accessibility on large screens, activate vw-mode like this:

```json
{
  "viewportWidth": 750
}
```

</details>

<details>
<summary>
Expand to see the default options.
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

## Unit tests & contributing

```bash
npm install
npm run test
```

After modifying the source code, write unit tests to verify the expected output. The `example/` folder provides runnable examples that simulate production usage of the plugin; these examples depend on the local source of `postcss-mobile-forever`, so after changing the source you can `npm i` inside an example and run it locally to verify your changes in a browser.

If you are the developer of a mobile template, after successfully integrating postcss-mobile-forever you can submit a PR following the format in "Mobile templates and examples" to add your template repo and online demo to the list below. This gives your template more exposure and demonstrates that your mobile template provides a good desktop experience.

Let's develop together and make variable names, performance, and features better.

## Input/Output Examples and How It Works

Plugin config:

```json
{
  "viewportWidth": 750,
  "maxDisplayWidth": 560,
  "appSelector": "#app"
}
```

Input example:

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

Output example:

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
<summary>Expand to see the input/output example with rem mode activated.</summary>

Plugin config:

```json
{
  "viewportWidth": 750,
  "maxDisplayWidth": 560,
  "mobileUnit": "rem",
  "appSelector": "#app"
}
```

Input example:

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

Output example:

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
<summary>Expand to see the output example with `enableMediaQuery` (media-query mode).</summary>

Plugin config:

```json
{
  "appSelector": "#app",
  "enableMediaQuery": true
}
```

Output example:

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

/* Desktop media query */
@media (min-width: 600px) and (min-height: 640px) { /* 600 here is the default and can be customized */
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

/* Mobile media query */
@media (min-width: 600px) and (max-height: 640px),
(max-width: 600px) and (min-width: 425px) and (orientation: landscape) { /* 640 and 425 here are the defaults and can be customized */
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

/* Shared media query for desktop and mobile */
@media (min-width: 600px),
(orientation: landscape) and (max-width: 600px) and (min-width: 425px) {
  #app {
    margin-left : auto !important;
    margin-right: auto !important;
  }
}
```

Compared to using CSS functions, limiting the width with media queries generates more code.

</details>

See [how it works](./how-it-works.md).

## Notes

The centering properties of the element matched by `appSelector` are occupied, including `margin-left`, `margin-right`, and `max-width`; if `border` is enabled, `box-shadow` is also occupied.

By default, the plugin treats the containing block of every `fixed`-positioned element as the root element. If you want to skip handling a non-root containing block, add the comment `/* not-root-containing-block */` above the selector. With this comment, the plugin computes everything inside the selector using the non-root containing block:

```css
/* not-root-containing-block */
.class {
  position: fixed;
  left: 50%;
}
```

The plugin's default containing-block handling cannot cover the cases below. If one of these is set on an ancestor element, then the containing block of a `fixed`-positioned descendant is that ancestor — while the plugin assumes the containing block of every `fixed` element is the browser window (visual viewport):

- `transform` or `perspective` with a value other than `none`;
- `will-change` set to `transform` or `perspective`;
- `filter` with a value other than `none`, or `will-change` set to `filter` (only effective in Firefox);
- `contain` set to `paint` (e.g. `contain: paint;`);
- `backdrop-filter` with a value other than `none` (e.g. `backdrop-filter: blur(10px);`).

If you use an atomic CSS framework such as [UnoCSS](https://unocss.dev/) or [tailwindcss](https://tailwindcss.com/), every CSS property is its own selector, so you must change the containing block from the browser window to the app root element to fix the `fixed`-position correction. In that case, see and use the `appContainingBlock` and `necessarySelectorWhenAuto` options. Usually `necessarySelectorWhenAuto` needs no attention — its default is `body`, so just make sure your global stylesheet contains `body {}`.

<details>
<summary>
For containing blocks, if `position: fixed;` and `left: 0;` are not in the same selector, mark the selector to recompute with the comment `/* root-containing-block */` (the alternative is setting the `rootContainingBlockSelectorList` option).
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
Expand for notes about the `experimental.extract` option.
</summary>

- When enabled, the stylesheet is split into `mobile.xxx.css`, `landscape.xxx.css` and `desktop.xxx.css`, which helps optimize bundles with code splitting;
- This option requires setting `modules.getLocalIdent` in [css-loader](https://github.com/webpack-contrib/css-loader). Import the `remakeExtractedGetLocalIdent` function from this plugin and pass it in, to prevent hash errors in selector names (hashes are computed from file paths, and the split files have different paths);
- Hot reload is not supported for now — enable the option in production mode only;
- The split files cannot be processed by other PostCSS plugins running after postcss-mobile-forever for now;
- If you use [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) to auto-inject style bundles, mind the order. The order can be controlled with `optimization.splitChunks.cacheGroups.[group].priority` — the higher the priority, the earlier the file is injected into the HTML.

<details>
<summary>Expand to see a full config example using `experimental.extract`.</summary>

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
              getLocalIdent: isProdMode ? remakeExtractedGetLocalIdent({ defaultGetLocalIdent }) : undefined, // no splitting in dev, so set to undefined
            },
          }
        }, {
          loader: "postcss-loader",
          options: {
            postcssOptions: [
              ["postcss-mobile-forever", {
                appSelector: ".root-class",
                experimental: {
                  extract: isProdMode, // enable file extraction in production
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
          test: /desktop[^\\/]*?\.css$/, // split desktop styles
          name: "desktop",
          priority: 101, // loaded third
        },
        landscape: {
          chunks: "all",
          enforce: true,
          test: /landscape[^\\/]*?\.css$/, // split landscape styles
          name: "landscape",
          priority: 102, // loaded second
        },
        mobile: {
          chunks: "all",
          enforce: true,
          test: /mobile[^\\/]*?\.css$/, // split mobile styles
          name: "mobile",
          priority: 103, // loaded first
        },
      }
    }
  },
};
```

See the [runnable config](./example/cases/split-chunks/react/).

</details>

</details>

<details>
<summary>
Regarding CSS custom properties: by default, every length-related property that uses a custom property is added to desktop and landscape output. This may add some redundancy, and may also cause conversion errors — errors related to containing blocks.
</summary>

In the example below, by default `--len-a` becomes `60px` on desktop and `42.5px` on landscape. But in the actual layout the element is `fixed`, so its containing block is the root containing block, making the default conversion wrong. The correct conversion is `calc(50% - 240px)` on desktop and `calc(50% - 170px)` on landscape:

```css
:root {
  --len-a: 75px;
}
.rule {
  left: var(--len-a);
  position: fixed;
}
```

To convert correctly in the example above, explicitly tell the config that `--len-a` is used in the root containing block and applies to the `left` property:

```javascript
{
  // ...other config
  customLengthProperty: {
    rootContainingBlockList_LR: ["--len-a"]
  }
}
```

</details>

The goal of the plugin's media-query mode is to show an **appropriate** view on different screen sizes — a larger view on wider screens, a smaller view on flatter screens, and the portrait mobile view on narrow screens — rather than **accurately** identifying a specific device or platform.

Browser compatibility after conversion: *media-query mode* and *rem mode* use the CSS `calc()` function, so compatibility is slightly reduced and Opera Mini is completely unsupported. *max-vw-mode* uses `max()`, `min()` and `calc()`, so it has compatibility issues — IE, Opera Mini, and QQ Browser 13.1 are completely unsupported. Check [caniuse min(), max()](https://caniuse.com/css-math-functions) and [caniuse calc()](https://caniuse.com/calc).

## Expected result

On different devices, [*duozhuayu.com*](https://www.duozhuayu.com/book) uses one shared UI set with accessible UX and no giant fonts or full-width issues.

<details>
<summary>
See the "Duozhuayu" site on mobile, mobile landscape and desktop.
</summary>
<table>
	<tr>
		<td><img src="./images/dzy-portrait.png" alt="Mobile view" /></td>
		<td><img src="./images/dzy-landscape.png" alt="Landscape mobile view" /></td>
	</tr>
	<tr>
		<td colspan="2"><img src="./images/dzy-desktop.png" alt="Desktop view" /></td>
	</tr>
</table>

</details>

The Duozhuayu site is adapted with *percentage* units and a maximum width of 600px: below this width it squeezes inward, above it the portrait mobile view is centered. This small-centered layout displays well on devices of all sizes. This approach gives up pixel-perfect restoration of the design; in return, the code has no pre-processing and is lighter, development becomes more flexible without the "perfect" constraint — there are many ways to implement adaptation for one layout — and this kind of adaptation also triggers the browser's zoom feature well, satisfying the [accessibility standard for resizing text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html).

## CHANGELOG

See the [changelog](./CHANGELOG.md).

## Versioning

See [Semantic Versioning 2.0.0](https://semver.org/).

## License

See the [MIT License](./LICENSE).

## Support & Sponsorship

Feel free to open Issues, PRs, and Star the project. You can also sponsor the project — the amount is up to you, based on the value you get from it.

<details>
<summary>Expand to see the WeChat Pay and Alipay QR codes.</summary>

<table>
  <tr align="center">
    <td>WeChat Pay</td>
    <td>Alipay</td>
  </tr>
	<tr>
		<td><img src="./images/wechat-pay.png" alt="Pay through WeChat" /></td>
		<td><img src="./images/ali-pay.jpg" alt="Pay through AliPay" /></td>
	</tr>
</table>

</details>

## Misc

<details>
<summary>
If you only use postcss-px-to-viewport and your project has no routing, you can nest the vw-scaled interface in an iframe (see the <a href="https://github.com/evrone/postcss-px-to-viewport/issues/130#issuecomment-1641725322">source link</a>) to cap the maximum width.
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
  <!-- vw-index.html is the scaled interface transformed by postcss-px-to-viewport -->
  <iframe id="iframe" src="./vw-index.html" frameborder="0"></iframe>
<body>
```

</details>

Projects related to or compatible with this one:

- [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport) — PostCSS plugin for converting specified units to viewport units.
- [postcss-px-to-clamp](https://github.com/wangguangyou/postcss-px-to-clamp) — PostCSS plugin for converting px while capping min and max values.
- [postcss-extract-media-query](https://github.com/SassNinja/postcss-extract-media-query) — PostCSS plugin for extracting media queries.
- [media-query-plugin](https://github.com/SassNinja/media-query-plugin) — webpack plugin for extracting media queries; works with other webpack plugins such as [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) and [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin).
- [scale-view](https://github.com/wswmsword/scale-view) — runtime conversion of scalable sizes for inline styles in frameworks. See [#17](https://github.com/wswmsword/postcss-mobile-forever/issues/17).

Related links:

- [Media Queries Level 3](https://www.w3.org/TR/mediaqueries-3/#syntax), W3C Recommendation, 05 April 2022;
- [CSS syntax validator](https://csstree.github.io/docs/validator.html), an online CSS syntax validator that follows W3C standards;
- "[What are CSS percentages?](https://jameshfisher.com/2019/12/29/what-are-css-percentages/)" — lists the properties that take percentages of the containing block width;
- [CSS shorthand properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) — lists all the shorthand properties;
- [Definition of "containing block"](https://www.w3.org/TR/CSS2/visudet.html#containing-block-details), W3C Recommendation;
- [postcss-bud](https://github.com/wswmsword/postcss-bud) — a PostCSS plugin that keeps the view horizontally and vertically centered on screen;
- [CSS3 Media Queries overview](http://cssmediaqueries.com/overview.html) — a site showing the media queries currently active on your device;
- "[Don't target specific devices or sizes!](https://stackoverflow.com/a/20350990)" — an answer explaining why you shouldn't adapt interfaces by device type;
- [Media Queries for Standard Devices](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/) — media queries for all kinds of screens;
- [Enhancing vw/rem mobile adaptation](https://juejin.cn/post/7431558902171484211) — a blog post about enhanced vw scaling;
- [Responsive design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design) — MDN's responsive design tutorial.
