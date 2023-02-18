const postcss = require("postcss");
const { removeDulplicateDecls, mergeRules, createRegArrayChecker, createIncludeFunc, createExcludeFunc } = require("./src/logic-helper");
const { createPropListMatcher } = require("./src/prop-list-matcher");
const { appendMarginCentreRootClassWithBorder, appendFixedFullWidthCentre, appendStaticWidthFromFullVwWidth, appendMediaRadioPxOrReplaceMobileVwFromPx, appendMarginCentreRootClassNoBorder } = require("./src/css-generator");

const {
  /** 用于验证字符串是否为“数字px”的形式 */
  pxTestReg,
 } = require("./src/regexs");

const defaults = {
  /** 设计图宽度 */
  viewportWidth: 750,
  /** 桌面端宽度 */
  desktopWidth: 600,
  /** 移动端横屏宽度 */
  landscapeWidth: 425,
  /** 纵向 y 轴断点，视图大于这个宽度，则页面使用桌面端宽度 */
  yAxisBreakPoint: null,
  /** 横向 x 轴断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度 */
  xAxisBreakPoint: 640,
  /** 页面最外层 class 选择器 */
  rootClass: "root-class",
  /** 在页面外层展示边框吗 */
  border: false,
  /** 不做桌面端的适配 */
  disableDesktop: false,
  /** 不做移动端横屏的适配 */
  disableLandscape: false,
  /** px 转换为视口单位 */
  enableMobile: false,
  /** 不转换 1px */
  pass1px: true,
  /** 排除文件 */
  exclude: null,
  /** 包含文件 */
  include: null,
  /** 单位精确到小数点后几位？ */
  unitPrecision: 3,
  /** 移动端竖屏视口视图的配置，同 postcss-px-to-view */
  mobileConfig: {
    propList: ['*'],
    fontViewportUnit: "vw",
    // selectorBlackList: [],
    // replace: true,
  },
};

const TYPE_REG = "regex";
const TYPE_ARY = "array";

/** 检查是否是正则类型或包含正则的数组 */
const checkRegExpOrArray = createRegArrayChecker(TYPE_REG, TYPE_ARY);

/** 如果不包含，则返回 true，不转换 */
const hasNoIncludeFile = createIncludeFunc(TYPE_REG, TYPE_ARY);

/** 如果排除，则返回 true，不转换 */
const hasExcludeFile = createExcludeFunc(TYPE_REG, TYPE_ARY);

/**
 * 视口类型可以分为 3 种，分别是移动端竖屏、移动端横屏以及桌面端。
 *
 * 插件 postcss-px-to-viewport 用于解决移动端竖屏适配问题。
 * 本插件（postcss-px-to-media-viewport）用于解决在只有 1 套 UI 的情况下，适配移
 * 动端横屏和桌面端的问题。
 *
 * 通过媒体查询设置在移动端横屏和桌面端两种情况下的 app 视口宽度，根据视口宽度和设计图
 * 宽度的比例，将两种情况的 px 元素的比例计算后的尺寸放入媒体查询中。
 */
module.exports = postcss.plugin("postcss-px-to-media-viewport", function(options) {
  const optMobileConfig = (options || {}).mobileConfig;
  const opts = {
    ...defaults,
    ...options,
    mobileConfig: {
      ...defaults.mobileConfig,
      ...optMobileConfig,
    }
  };
  let { yAxisBreakPoint } = opts
  const { viewportWidth, desktopWidth, landscapeWidth, rootClass, border, disableDesktop, disableLandscape, enableMobile, xAxisBreakPoint, pass1px, include, exclude, unitPrecision, mobileConfig } = opts;
  const { propList, fontViewportUnit, selectorBlackList, replace } = mobileConfig;

  if (yAxisBreakPoint == null) {
    yAxisBreakPoint = desktopWidth
  }

  /** 桌面端缩放比例 */
  const desktopRadio = desktopWidth / viewportWidth;
  /** 移动端横屏缩放比例 */
  const landscapeRadio = landscapeWidth / viewportWidth;

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

  const satisfyPropList = createPropListMatcher(propList);

  return function(css/* , result */) {
    /** 桌面端视图下的媒体查询 */
    let desktopViewAtRule = postcss.atRule({ name: "media", params: `(min-width: ${yAxisBreakPoint}px) and (min-height: ${xAxisBreakPoint}px)`, nodes: [] })
    /** 移动端横屏下的媒体查询 */
    const landscapeMediaStr_1 = `(min-width: ${yAxisBreakPoint}px) and (max-height: ${xAxisBreakPoint}px)`;
    const landscapeMediaStr_2 = `(max-width: ${yAxisBreakPoint}px) and (orientation: landscape)`;
    let landScapeViewAtRule = postcss.atRule({ name: "media", params: `${landscapeMediaStr_1}, ${landscapeMediaStr_2}`, nodes: [] });
    /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
    let sharedAtRult = postcss.atRule({ name: "media", params: `(min-width: ${yAxisBreakPoint}px), (orientation: landscape) and (max-width: ${yAxisBreakPoint}px)`, nodes: [] });


    // 遍历选择器
    css.walkRules(rule => {
      let hasFixed = false;
      let hasFullVwWidth = false;
      let hasFullPerWidth = false;
      const selector = rule.selector;
      const file = rule.source && rule.source.input.file;

      // 包含文件
      if(hasNoIncludeFile(include, file, includeType)) return;
      // 排除文件
      if(hasExcludeFile(exclude, file, excludeType)) return;

      // 验证当前选择器在媒体查询中吗，不对选择器中的内容转换
      if (rule.parent.params) return;

      // 设置页面最外层 class 的最大宽度，并居中
      if (selector === `.${rootClass}`) {
        if (border) {
          const c = '#eee';
          appendMarginCentreRootClassWithBorder(selector, disableDesktop, disableLandscape, {
            desktopViewAtRule,
            landScapeViewAtRule,
            sharedAtRult,
            desktopWidth,
            landscapeWidth,
            borderColor: c,
          })
        } else {
          appendMarginCentreRootClassNoBorder(selector, disableDesktop, disableLandscape, {
            desktopViewAtRule,
            landScapeViewAtRule,
            sharedAtRult,
            desktopWidth,
            landscapeWidth,
          })
        }
      }

      // 遍历选择器内的 css 属性
      rule.walkDecls(decl => {
        const prop = decl.prop;
        const val = decl.value;

        // 判断是否存在 fixed 和 100% 的情况
        if (prop === 'width' && val === '100%') {
          hasFullPerWidth = true;
        }
        if (prop === 'width' && val === '100vw') {
          hasFullVwWidth = true;
        }
        if (prop === 'position' && val === 'fixed') {
          hasFixed = true;
        }

        // 转换 px
        if (pxTestReg.test(val)) {
          const important = decl.important;
          const satisfiedMobilePropList = satisfyPropList(prop);
          // 添加桌面端、移动端媒体查询
          appendMediaRadioPxOrReplaceMobileVwFromPx(selector, prop, val, disableDesktop, disableLandscape, enableMobile, {
            viewportWidth,
            desktopRadio,
            landscapeRadio,
            desktopViewAtRule,
            landScapeViewAtRule,
            important,
            pass1px,
            decl,
            unitPrecision,
            satisfiedMobilePropList,
            fontViewportUnit,
          });
        }
      })

      if (hasFixed && (hasFullPerWidth || hasFullVwWidth)) {
        // 将同一选择器中的 `position: fixed; width: 100%`
        // 转换为 `position: fixed; width: ???px; margin-left: auto; margin-right: auto; left: 0; right: 0;`
        appendFixedFullWidthCentre(selector, disableDesktop, disableLandscape, {
          desktopWidth,
          landscapeWidth,
          desktopViewAtRule,
          landScapeViewAtRule,
          sharedAtRult,
        })
      } else if (hasFullVwWidth) {
        // 100vw 的宽度转换为固定宽度
        appendStaticWidthFromFullVwWidth(selector, disableDesktop, disableLandscape, {
          desktopWidth,
          landscapeWidth,
          desktopViewAtRule,
          landScapeViewAtRule,
        })
      }
    })

    const appendedDesktop = desktopViewAtRule.nodes.length > 0;
    const appendedLandscape = landScapeViewAtRule.nodes.length > 0;
    const appendedShared = sharedAtRult.nodes.length > 0;

    if (appendedDesktop) {
      mergeRules(desktopViewAtRule); // 合并相同选择器中的内容
      removeDulplicateDecls(desktopViewAtRule); // 移除重复属性
      css.append(desktopViewAtRule); // 样式中添加桌面端媒体查询
    }
    if (appendedLandscape) {
      mergeRules(landScapeViewAtRule);
      removeDulplicateDecls(landScapeViewAtRule); // 移除重复属性
      css.append(landScapeViewAtRule); // 样式中添加横屏媒体查询
    }
    if (appendedShared) {
      mergeRules(sharedAtRult);
      removeDulplicateDecls(sharedAtRult); // 移除重复属性
      css.append(sharedAtRult); // 样式中添加公共媒体查询
    }
  };
});