import { Plugin } from 'postcss'

declare namespace mobileForever {
  type viewportWidthFunc = (file: string, selector: string) => number

  interface Options {
    /** 设计图宽度，可以传递函数动态生成设计图宽度，例如 `file => file.includes("vant") ? 375 : 750` 表示在名称包含“vant”的文件内使用 375 的设计图宽度 */
    viewportWidth?: number | viewportWidthFunc

    /** 限制视口单位的最大宽度，使用该参数不可以打开 `disableMobile` */
    maxDisplayWidth?: number

    /** 适配到桌面端时，展示的视图宽度 */
    desktopWidth?: number

    /** 适配到移动端横屏时，展示的视图宽度 */
    landscapeWidth?: number

    /** 宽度断点，如果不提供这个值，默认使用 `desktopWidth` 的值，视图大于这个宽度，则页面宽度是桌面端宽度 `desktopWidth`，“简介”一节具体介绍了该值的触发情况 */
    minDesktopDisplayWidth?: number

    /** 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度，“原理和输入输出范例”一节具体介绍了该值的触发情况 */
    maxLandscapeDisplayHeight?: number

    /** 页面最外层 class 选择器，用于设置在桌面端和移动端横屏时的居中样式，将在下个主版本发布后删除，请使用 rootSelector */
    rootClass?: string

    /** 页面最外层 class 选择器，用于设置在桌面端和移动端横屏时的居中样式，将在下个主版本发布后删除，请使用 rootSelector */
    rootSelector?: string

    /** 在页面外层展示边框吗，用于分辨居中的小版心布局和背景，可以设置颜色字符串 */
    border?: boolean | string

    /** 打开则不做桌面端适配 */
    disableDesktop?: boolean

    /** 打开则不做移动端横屏适配 */
    disableLandscape?: boolean

    /** 打开则不做移动端竖屏适配，把 px 转换为视口单位，如 vw */
    disableMobile?: boolean

    /** 排除文件或文件夹 */
    exclude?: RegExp | RegExp[]

    /** 包括文件或文件夹 */
    include?: RegExp | RegExp[]

    /** 单位精确到小数点后几位？ */
    unitPrecision?: number

    /** 哪些属性要替换，哪些属性忽略？用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) */
    propList?: string[];

    /** 选择器黑名单，名单上的不转换，用法参考 [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md) */
    selectorBlackList?: (string | RegExp)[]

    /** 包含块是根元素的选择器列表 */
    rootContainingBlockSelectorList?: (string | RegExp)[]

    /** 移动端竖屏视口视图的配置，如果需要关闭，设置 disableMobile 为 true 即可关闭 */
    mobileConfig?: mobileConfig

    /** 侧边内容的配置，用于扩大桌面端可访问内容 */
    sideConfig?: sideConfig
  }

  interface mobileConfig {
    /** 转换成什么视口单位？ */
    viewportUnit?: string

    /** 字体单位 */
    fontViewportUnit?: string

    /** 直接替换属性值还是新增？ */
    replace?: boolean
  }

  interface sideConfig {
    /** 侧边宽度 */
    width?: number,
    /** 上下左右间隔 */
    gap?: number,
    /** 左上选择器 */
    selector1?: string,
    /** 右上选择器 */
    selector2?: string,
    /** 右下选择器 */
    selector3?: string,
    /** 左下选择器 */
    selector4?: string,
  }
}

declare function mobileForever(options?: mobileForever.Options): Plugin

export = mobileForever