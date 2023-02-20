const { removeDulplicateDecls, mergeRules, createRegArrayChecker, createIncludeFunc, createExcludeFunc, blacklistedSelector } = require("./src/logic-helper");
const { createPropListMatcher } = require("./src/prop-list-matcher");
const { appendMarginCentreRootClassWithBorder, appendFixedFullWidthCentre, appendStaticWidthFromFullVwWidth, appendMediaRadioPxOrReplaceMobileVwFromPx, appendMarginCentreRootClassNoBorder, appendDemoContent } = require("./src/css-generator");
const { demoModeSelector } = require("./src/constants");

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
    viewportUnit: "vw",
    fontViewportUnit: "vw",
    selectorBlackList: [],
    replace: true,
  },
  /** 添加标识，用于调试 */
  demoMode: false,
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
 * 本插件用于解决在只有 1 套 UI 的情况下，适配移动端横屏和桌面端的问题。
 *
 * 通过媒体查询设置在移动端横屏和桌面端两种情况下的 app 视口宽度，根据视口宽度和设计图
 * 宽度的比例，将两种情况的 px 元素的比例计算后的尺寸放入媒体查询中。
 */
module.exports = (options = {}) => {
  const optMobileConfig = options.mobileConfig;
  const opts = {
    ...defaults,
    ...options,
    mobileConfig: {
      ...defaults.mobileConfig,
      ...optMobileConfig,
    }
  };
  let { yAxisBreakPoint } = opts
  const { viewportWidth, desktopWidth, landscapeWidth, rootClass, border, disableDesktop, disableLandscape, enableMobile, xAxisBreakPoint, pass1px, include, exclude, unitPrecision, mobileConfig, demoMode } = opts;
  const { propList, fontViewportUnit, selectorBlackList, replace, viewportUnit } = mobileConfig;

  if (yAxisBreakPoint == null) {
    yAxisBreakPoint = desktopWidth
  }

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

  const satisfyPropList = createPropListMatcher(propList);
  return {
    postcssPlugin: "postcss-px-to-multi-displays",
    prepare(result) {
      /** 桌面端视图下的媒体查询 */
      let desktopViewAtRule = null;
      /** 移动端横屏下的媒体查询 */
      let landScapeViewAtRule = null;
      /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
      let sharedAtRult = null;


      let hasFixed = null;
      let hasFullVwWidth = null;
      let hasFullPerWidth = null;
      /** 当前选择器 */
      let selector = null;
      /** 视图宽度 */
      let viewportWidthValue = null;
      /** 桌面端缩放比例 */
      let desktopRadio = 1;
      /** 移动端横屏缩放比例 */
      let landscapeRadio = 1;
      /** 选择器在黑名单吗 */
      let blackListedMobileSelector = null;
      /** 是否要跳过不执行 Declaration */
      let brokenRule = false;
      /** 是否添加过调试代码了？ */
      let addedDemo = false;

      return {
        Once(_, postcss) {
          /** 桌面端视图下的媒体查询 */
          desktopViewAtRule = postcss.atRule({ name: "media", params: `(min-width: ${yAxisBreakPoint}px) and (min-height: ${xAxisBreakPoint}px)`, nodes: [] })
          /** 移动端横屏下的媒体查询 */
          const landscapeMediaStr_1 = `(min-width: ${yAxisBreakPoint}px) and (max-height: ${xAxisBreakPoint}px)`;
          const landscapeMediaStr_2 = `(max-width: ${yAxisBreakPoint}px) and (min-width: ${landscapeWidth}px) and (orientation: landscape)`;
          landScapeViewAtRule = postcss.atRule({ name: "media", params: `${landscapeMediaStr_1}, ${landscapeMediaStr_2}`, nodes: [] });
          /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
          sharedAtRult = postcss.atRule({ name: "media", params: `(min-width: ${yAxisBreakPoint}px), (orientation: landscape) and (max-width: ${yAxisBreakPoint}px) and (min-width: ${landscapeWidth}px)`, nodes: [] });
        },
        Rule(rule) {
          hasFixed = false;
          hasFullVwWidth = false;
          hasFullPerWidth = false;
          selector = rule.selector;
          const file = rule.source && rule.source.input.file;

          // 包含文件
          if(hasNoIncludeFile(include, file, includeType)) return brokenRule = true;
          // 排除文件
          if(hasExcludeFile(exclude, file, excludeType)) return brokenRule = true;

          // 是否动态视图宽度？
          const isDynamicViewportWidth = typeof viewportWidth === "function";
          viewportWidthValue = isDynamicViewportWidth ? viewportWidth(file, selector) : viewportWidth;
          /** 桌面端缩放比例 */
          desktopRadio = desktopWidth / viewportWidthValue;
          /** 移动端横屏缩放比例 */
          landscapeRadio = landscapeWidth / viewportWidthValue;

          // 验证当前选择器在媒体查询中吗，不对选择器中的内容转换
          if (rule.parent.params) return brokenRule = true;

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

          blackListedMobileSelector = blacklistedSelector(selectorBlackList, selector);
        },
        Declaration(decl) {
          if (brokenRule) return;
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
              viewportWidth: viewportWidthValue,
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
              blackListedMobileSelector,
              replace,
              result,
              viewportUnit,
            });
          }
        },
        RuleExit(rule) {
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
          !addedDemo && demoMode && demoModeSelector === selector && (appendDemoContent(demoModeSelector, rule, desktopViewAtRule, landScapeViewAtRule, disableDesktop, disableLandscape, enableMobile), addedDemo = true);
        },
        OnceExit(css) {
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
        },
      };
    },
  };
};

module.exports.postcss = true;