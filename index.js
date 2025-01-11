const { removeDuplicateDecls, mergeRules, createRegArrayChecker, createIncludeFunc, createExcludeFunc, isMatchedStr, createContainingBlockWidthDecls,
  hasNoneRootContainingBlockComment, hasRootContainingBlockComment, hasIgnoreComments,
  convertNoFixedMediaQuery, convertMaxMobile, convertMobile, convertFixedMediaQuery, 
  hasApplyWithoutConvertComment,
  isMatchedSelectorProperty,
  hasWritingModeComment,
  convertPropValue,
  convertMaxMobile_FIXED_LR,
  convertMaxMobile_FIXED,
  convertRem,
  convertRem_FIXED_LR,
  convertRem_FIXED,
} = require("./src/logic-helper");
const { createPropListMatcher } = require("./src/prop-list-matcher");
const { appendMediaRadioPxOrReplaceMobileVwFromPx, appendDemoContent, appendCentreRoot,
  appendDisplaysRule, appendCSSVar, extractFile, appendSiders, appendRemFontSize,
} = require("./src/css-generator");
const { PLUGIN_NAME, demoModeSelector, lengthProps, applyComment, rootCBComment, notRootCBComment, ignoreNextComment, ignorePrevComment,
  verticalComment,
  gpuLayer, fullW, fullH, autoOverflow, fullHVh
} = require("./src/constants");
const { pxToMediaQueryPx_noUnit, vwToMediaQueryPx_noUnit, percentToMediaQueryPx_FIXED_noUnit } = require("./src/unit-transfer");
const path = require('path');
const { bookObj } = require("./src/utils");

const {
  /** 用于验证字符串是否为“数字px”的形式 */
  preflightReg, varTestReg,
} = require("./src/regexs");

const defaults = {
  /** 页面最外层选择器，如 `#app`、`.root-class` */
  appSelector: "#app",
  /** 标准视图宽度 */
  viewportWidth: 750,
  /** rem 模式的基准宽度 */
  basicRemWidth: null,
  /** 视图展示的最大宽度，单位会转换成诸如 min(vw, px) 的形式 */
  maxDisplayWidth: null,
  /** 打开媒体查询，打开后将自动关闭 maxDisplayWidth */
  enableMediaQuery: false,
  /** 桌面端宽度 */
  desktopWidth: 600,
  /** 移动端横屏宽度 */
  landscapeWidth: 425,
  /** 宽度断点，视图大于这个宽度，则页面使用桌面端宽度 */
  minDesktopDisplayWidth: null,
  /** 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度 */
  maxLandscapeDisplayHeight: 640,
  /** 用于指定应用根元素作为包含块 */
  appContainingBlock: "calc", // manual | auto | calc
  /** 指定 appContainingBlock auto 后的应用第二级选择器名称 */
  necessarySelectorWhenAuto: null,
  /** 在页面外层展示边框吗 */
  border: false,
  /** 不做桌面端的适配 */
  disableDesktop: false,
  /** 不做移动端横屏的适配 */
  disableLandscape: false,
  /** 不做视口单位转换 */
  disableMobile: false,
  /** 排除文件 */
  exclude: null,
  /** 包含文件 */
  include: null,
  /** 单位精确到小数点后几位？ */
  unitPrecision: 3,
  /** 选择器黑名单列表 */
  selectorBlackList: [],
  /** 属性黑名单列表 */
  propertyBlackList: {},
  /** 属性值的黑名单列表 */
  valueBlackList: [],
  /** 是否处理某个属性？ */
  propList: ['*'],
  /** 包含块是根元素的选择器列表 */
  rootContainingBlockSelectorList: [],
  /** 纵向书写模式的选择器列表 */
  verticalWritingSelectorList: [],
  /** 移动端竖屏转换单位 */
  mobileUnit: "vw",
  /** 侧边内容配置 */
  side: {
    /** 侧边宽度 */
    width: null,
    /** 上下左右间隔 */
    gap: 18,
    /** 左上选择器 */
    selector1: null,
    /** 右上选择器 */
    selector2: null,
    /** 右下选择器 */
    selector3: null,
    /** 左下选择器 */
    selector4: null,
    width1: null,
    width2: null,
    width3: null,
    width4: null,
  },
  /** 自定义注释名称 */
  comment: {
    /** 直接添加进屏幕媒体查询，不转换 */
    applyWithoutConvert: applyComment,
    /** 包含块注释 */
    rootContainingBlock: rootCBComment,
    /** 非包含块注释 */
    notRootContainingBlock: notRootCBComment,
    /** 忽略选择器内的转换 */
    ignoreNext: ignoreNextComment,
    /** 忽略本行转换 */
    ignoreLine: ignorePrevComment,
    /** 纵向书写模式 */
    verticalWritingMode: verticalComment,
  },
  /** 添加标识，用于调试 */
  demoMode: false,
  /** 和长度有关的自定义属性 */
  customLengthProperty: {
    /** 根包含块属性，用于 left 和 right */
    rootContainingBlockList_LR: [],
    /** 根包含块属性，用于非 left 和 right 的属性 */
    rootContainingBlockList_NOT_LR: [],
    /** 祖先包含块属性 */
    ancestorContainingBlockList: [],
    /** 关闭自动添加到桌面端和横屏，设置了以上三个任意选项后，该值强制为 true */
    disableAutoApply: false,
  },
  /** 实验性功能 */
  experimental: {
    /** 是否拆分桌面端和横屏样式文件，提取移动端、桌面端和横屏代码，使用 `@import` 引入 */
    extract: false,
    /** 视图展示的最小宽度 */
    minDisplayWidth: null,
  }
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
 * 本插件用于解决在只有 1 套 UI 的情况下，适配移动端竖屏、横屏和桌面端的问题。
 *
 * 通过媒体查询设置在移动端横屏和桌面端两种情况下的 app 视口宽度，根据视口宽度和设计图
 * 宽度的比例，将两种情况的 px 元素的比例计算后的尺寸放入媒体查询中。
 * 
 * 以上是本插件的一种模式，即媒体查询模式，这种模式生成代码量大，因此插件提供
 * 了另一种生成代码量小、功能效果近似的模式，也即 max-vw-mode。
 */
module.exports = (options = {}) => {
  const opts = {
    ...defaults,
    ...options,
    side: {
      ...defaults.side,
      ...options.side,
    },
    comment: {
      ...defaults.comment,
      ...options.comment,
    },
    customLengthProperty: {
      ...defaults.customLengthProperty,
      ...options.customLengthProperty,
    },
    experimental: {
      ...defaults.experimental,
      ...options.experimental,
    },
  };

  const { viewportWidth, enableMediaQuery, desktopWidth, landscapeWidth, appSelector, border, disableMobile, minDesktopDisplayWidth,
    maxLandscapeDisplayHeight, include, exclude, unitPrecision, side, demoMode, selectorBlackList, propertyBlackList, valueBlackList,
    rootContainingBlockSelectorList, verticalWritingSelectorList,
    propList, maxDisplayWidth, comment, mobileUnit, customLengthProperty, experimental,
    appContainingBlock,
    necessarySelectorWhenAuto,
    basicRemWidth,
  } = opts;
  const disableDesktop = enableMediaQuery ? opts.disableDesktop : true;
  const disableLandscape = enableMediaQuery ? opts.disableLandscape : true;
  const { extract, minDisplayWidth } = experimental || {};
  const { width: sideWidth, width1: sideW1, width2: sideW2, width3: sideW3, width4: sideW4, gap: sideGap, selector1: side1, selector2: side2, selector3: side3, selector4: side4 } = side;
  const { applyWithoutConvert: AWC_CMT, rootContainingBlock: RCB_CMT, notRootContainingBlock: NRCB_CMT, ignoreNext: IN_CMT, ignoreLine: IL_CMT, verticalWritingMode: VWM_CMT } = comment;
  const { rootContainingBlockList_LR, rootContainingBlockList_NOT_LR, ancestorContainingBlockList, disableAutoApply } = customLengthProperty;

  const _minDesktopDisplayWidth = minDesktopDisplayWidth == null ? desktopWidth : minDesktopDisplayWidth;

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

  const satisfyPropList = createPropListMatcher(propList);

  /** 需要添加到桌面端和横屏的 css 变量 */
  const expectedLengthVars = [...new Set([].concat(rootContainingBlockList_LR, rootContainingBlockList_NOT_LR, ancestorContainingBlockList))].filter(e => e != null);

  const defaultViewportWidth = typeof viewportWidth === "function" ? viewportWidth('') : viewportWidth;

  return {
    postcssPlugin: PLUGIN_NAME,
    prepare(result) {
      const file = result.root && result.root.source && result.root.source.input.file || '';
      const from = result.opts.from;
      // 包含文件
      if(hasNoIncludeFile(include, file, includeType)) return;
      // 排除文件
      if(hasExcludeFile(exclude, file, excludeType)) return;

      /** 桌面端视图下的媒体查询 */
      let desktopViewAtRule = null;
      /** 移动端横屏下的媒体查询 */
      let landScapeViewAtRule = null;
      /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
      let sharedAtRule = null;
      /** 用于在开启 border 后的 dvh 检测，如果浏览器支持，则应用 dvh，`@supports (min-height: 100dvh)` */
      let dvhAtRule = null;

      /** 当前选择器是否是 fixed 布局 */
      let hadFixed = null;
      /** 当前选择器是否是纵向书写模式 */
      let isVerticalWritingMode = false;
      /** 当前选择器 */
      let selector = null;
      // 是否动态视图宽度？
      const isDynamicViewportWidth = typeof viewportWidth === "function";
      /** 视图宽度 */
      const _viewportWidth = isDynamicViewportWidth ? viewportWidth(file) : viewportWidth;
      /** 选择器在黑名单吗 */
      let blackListedSelector = null;
      /** 是否添加过调试代码了？ */
      let addedDemo = false;
      /** 依赖根包含块宽度的属性 */
      let containingBlockWidthDeclsMap = null;
      /** 不是被选择器包裹的属性不处理，例如 @font-face 中的属性 */
      let walkedRule = false;
      /** 媒体查询模式，media-query mode */
      const mqMode = enableMediaQuery === true;
      /** rem 模式，相比 max-vw 模式有更小的产包 */
      const remMode = !mqMode && (mobileUnit === "rem" || basicRemWidth != null);
      /** max-vw 模式 */
      const maxVwMode = !mqMode && !remMode && (maxDisplayWidth != null);
      /** vw 模式 */
      const vwMode = !mqMode && !remMode && !maxVwMode;
      /** rem 模式的基准宽度 */
      const _basicRemWidth = remMode ? basicRemWidth == null ? defaultViewportWidth : basicRemWidth : null;
      /** rem 模式下，基准宽度和当前视图宽度的比值，用于将视图统一转换为基准视图宽度 */
      const remRatio = _basicRemWidth / _viewportWidth;
      const fontViewportUnit = remMode ? "rem" : mobileUnit;
      /** 忽略矫正 fixed 定位 */
      const ignoreToCorrectFixed = ["manual", "auto"].includes(appContainingBlock);
      /** 需要添加到应用根元素的样式，该样式用于指定根元素为包含块 */
      const autoAppContainingBlock = appContainingBlock === "auto";

      /** 忽略转换的 at 规则 */
      let ignoreAtRule = false;
      /** 是否是 keyframes 规则 */
      let isKeyframesAtRule = false;
      let desktopKeyframesAtRule = null;
      let landscapeKeyframesAtRule = null;

      let siders = [{
        atRule: null,
        selector: side1,
        width: sideW1 ?? sideWidth,
        gap: sideGap,
      }, {
        atRule: null,
        selector: side2,
        width: sideW2 ?? sideWidth,
        gap: sideGap,
      }, {
        atRule: null,
        selector: side3,
        width: sideW3 ?? sideWidth,
        gap: sideGap,
      }, {
        atRule: null,
        selector: side4,
        width: sideW4 ?? sideWidth,
        gap: sideGap,
      }]; // { atRule, selector, width, gap }
      /** 一个选择器内优先级最高的各个属性 */
      const priorityProps = new Map();
      /** 给侧边用的存储宽度属性的 */
      let widthValForSiders = null;

      if (maxVwMode || vwMode) {
        return {
          Once(_, postcss) {
            /** 检测 dvh 支不支持，支持就应用，不然移动端有的浏览器的 vh 会导致滚动 */
            dvhAtRule = postcss.atRule({ name: "supports", params: "(min-height: 100dvh)", nodes: [] });
          },
          AtRule: initContainingBlockWidthDeclsMap,
          Rule,
          Declaration,
          RuleExit: transformContainingBlockWidthDecls,
          AtRuleExit: transformContainingBlockWidthDecls,
          OnceExit(css) {
            const appendedDvh = dvhAtRule.nodes.length > 0;
            if (appendedDvh) css.append(dvhAtRule);
          }
        }
      }

      let maxRemAtRule = [];
      let hasHtmlRule = false;

      if (remMode) {
        return {
          Once(_, postcss) {
            dvhAtRule = postcss.atRule({ name: "supports", params: "(min-height: 100dvh)", nodes: [] });
          },
          AtRule: initContainingBlockWidthDeclsMap,
          Rule,
          Declaration,
          RuleExit: transformContainingBlockWidthDecls,
          AtRuleExit: transformContainingBlockWidthDecls,
          OnceExit(css, postcss) {
            const appendedDvh = dvhAtRule.nodes.length > 0;
            if (appendedDvh) css.append(dvhAtRule);

            if (hasHtmlRule) {
              const _maxDisplayWidth = [].concat(maxDisplayWidth);
              maxRemAtRule = _maxDisplayWidth.map(w => {
                const mediaRule = postcss.atRule({
                  name: "media",
                  params: `(min-width: ${w}px)`,
                });
                const htmlRule = postcss.rule({
                  selector: "html",
                }).append(bookObj({
                  prop: "font-size",
                  value: `${w * 100 / _basicRemWidth}px`,
                  important: true,
                }));
                mediaRule.append(htmlRule);
                return mediaRule;
              });
              maxRemAtRule.forEach(atRule => css.append(atRule));
            }
          }
        }
      }


      return {
        Once(_, postcss) {
          /** 桌面端视图下的媒体查询 */
          desktopViewAtRule = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth}px) and (min-height: ${maxLandscapeDisplayHeight}px)`, nodes: [] });
          /** 移动端横屏下的媒体查询 */
          const landscapeMediaStr_1 = `(min-width: ${_minDesktopDisplayWidth}px) and (max-height: ${maxLandscapeDisplayHeight}px)`;
          const landscapeMediaStr_2 = `(max-width: ${_minDesktopDisplayWidth}px) and (min-width: ${landscapeWidth}px) and (orientation: landscape)`;
          landScapeViewAtRule = postcss.atRule({ name: "media", params: `${landscapeMediaStr_1}, ${landscapeMediaStr_2}`, nodes: [] });
          /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
          sharedAtRule = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth}px), (orientation: landscape) and (max-width: ${_minDesktopDisplayWidth}px) and (min-width: ${landscapeWidth}px)`, nodes: [] });
          /** 检测 dvh 支不支持，支持就应用，不然移动端有的浏览器的 vh 会导致滚动 */
          dvhAtRule = postcss.atRule({ name: "supports", params: "(min-height: 100dvh)", nodes: [] });
        },
        AtRule(atRule, postcss) {
          isKeyframesAtRule = atRule.name === "keyframes";
          ignoreAtRule = !isKeyframesAtRule;
          if (isKeyframesAtRule) {
            const params = atRule.params;
            desktopKeyframesAtRule = postcss.atRule({ name: "keyframes", params, nodes: [] });
            landscapeKeyframesAtRule = postcss.atRule({ name: "keyframes", params, nodes: [] });
          }
        },
        AtRuleExit() {
          ignoreAtRule = false;
          isKeyframesAtRule = false;
          const appendedDesktopKeyframes = desktopKeyframesAtRule != null && desktopKeyframesAtRule.nodes.length > 0;
          const appendedLandcapeKeyframes = landscapeKeyframesAtRule != null && landscapeKeyframesAtRule.nodes.length > 0;
          if (appendedDesktopKeyframes) {
            desktopViewAtRule.append(desktopKeyframesAtRule);
            desktopKeyframesAtRule = null;
          }
          if (appendedLandcapeKeyframes) {
            landScapeViewAtRule.append(landscapeKeyframesAtRule);
            landscapeKeyframesAtRule = null;
          }
        },
        Rule,
        Declaration(decl, postcss) {
          const prop = decl.prop;
          const val = decl.value;
          if (prop === "width") widthValForSiders = val;
          if (!walkedRule) return; // 不是 Rule 的属性则不转换
          if (ignoreAtRule) return; // 不转换媒体查询中的属性
          if (decl.book) return; // 被标记过不转换
          if (blackListedSelector) return; // 属性在黑名单选择器中，不进行转换

          if (!satisfyPropList(prop)) return;
          if (isMatchedSelectorProperty(propertyBlackList, selector, prop)) return; // 属性是否在黑名单中
          if (isMatchedStr(valueBlackList, val)) return; // 属性值是否在黑名单中

          if (prop === "position" && val === "fixed" && !ignoreToCorrectFixed) return hadFixed = true;
          if (hasIgnoreComments(decl, result, IN_CMT, IL_CMT)) return;
          // 如果有标注不转换注释，直接添加到桌面端和横屏，不进行转换
          if (hasApplyWithoutConvertComment(decl, result, AWC_CMT)) {
            appendDisplaysRule(!disableDesktop, !disableLandscape, prop, val, decl.important, selector, postcss, {
              sharedAtRule,
              desktopViewAtRule,
              landScapeViewAtRule,
              isShare: priorityProps.get(prop) === decl,
            });
            return;
          }

          // 是否忽略百分比转换？如果不忽略，则需要收集哪些属性会涉及到根包含块
          if (!ignoreToCorrectFixed) {
            // 该属性是用于设置根包含块的变量属性
            const isRootContainingBlockProp = rootContainingBlockList_LR.includes(prop) || rootContainingBlockList_NOT_LR.includes(prop);
            isRootContainingBlockProp && (hadFixed = true);
            // 受 fixed 布局影响的，需要在 ruleExit 中计算的属性
            if (containingBlockWidthDeclsMap.has(prop) || isRootContainingBlockProp) {
              const important = decl.important;
              const mapDecl = containingBlockWidthDeclsMap.get(prop);
              if (mapDecl == null || important || !mapDecl.important)
                containingBlockWidthDeclsMap.set(prop, decl);
              return;
            }
          }

          // 预检正则，判断是否符合转换条件
          if (preflightReg.test(val)) {
            const important = decl.important;
            // 添加桌面端、移动端媒体查询
            appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
              desktopViewAtRule,
              landScapeViewAtRule,
              sharedAtRule,
              important,
              decl,
              matchPercentage: false,
              expectedLengthVars,
              disableAutoApply,
              isLastProp: priorityProps.get(prop) === decl,
              isKeyframesAtRule,
              desktopKeyframesAtRule,
              landscapeKeyframesAtRule,
              convertMobile: (number, unit) => convertMobile(prop, number, unit, _viewportWidth, unitPrecision, fontViewportUnit, mobileUnit),
              convertDesktop: (number, unit, numberStr) => convertNoFixedMediaQuery(number, desktopWidth, _viewportWidth, unitPrecision, unit, numberStr),
              convertLandscape: (number, unit, numberStr) => convertNoFixedMediaQuery(number, landscapeWidth, _viewportWidth, unitPrecision, unit, numberStr),
            });
          } else if (
            // 值是指定的变量名称，则加入进桌面端和横屏的媒体查询
            (expectedLengthVars.length > 0 && expectedLengthVars.some(varStr => val.includes(varStr))) ||
            // 默认行为，未指定长度变量列表，属性和长度有关，并且值包含变量 val(...)，则加入进桌面端和横屏的媒体查询
            (expectedLengthVars.length === 0 && !disableAutoApply && lengthProps.includes(prop) && varTestReg.test(val))) {
            const enabledDesktop = !disableDesktop;
            const enabledLandscape = !disableLandscape;
            appendCSSVar(enabledDesktop, enabledLandscape, prop, val, decl.important, selector, postcss, {
              sharedAtRule,
              desktopViewAtRule,
              landScapeViewAtRule,
              isLastProp: priorityProps.get(prop) === decl,
            });
          }
        },
        RuleExit(rule, postcss) {

          if (!walkedRule) return;
          if (ignoreAtRule) return;
          if (blackListedSelector) return;
          // 转换受 fixed 影响的属性的媒体查询值
          containingBlockWidthDeclsMap.forEach((decl, prop) => {
            if (decl == null) return;


            const { value: val, important } = decl;
            const leftOrRight = prop === "left" || prop === "right" || rootContainingBlockList_LR.includes(prop);
            appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
              desktopViewAtRule,
              landScapeViewAtRule,
              sharedAtRule,
              important,
              decl,
              matchPercentage: hadFixed,
              expectedLengthVars,
              disableAutoApply,
              isLastProp: priorityProps.get(prop) === decl,
              isKeyframesAtRule,
              desktopKeyframesAtRule,
              landscapeKeyframesAtRule,
              convertMobile: (number, unit) => convertMobile(prop, number, unit, _viewportWidth, unitPrecision, fontViewportUnit, mobileUnit),
              convertDesktop: (number, unit, numberStr) => convertFixedMediaQuery(number, desktopWidth, _viewportWidth, unitPrecision, unit, numberStr, hadFixed, leftOrRight),
              convertLandscape: (number, unit, numberStr) => convertFixedMediaQuery(number, landscapeWidth, _viewportWidth, unitPrecision, unit, numberStr, hadFixed, leftOrRight),
            });
          });
          containingBlockWidthDeclsMap = new Map();
          // 自动获取并转换 sider 的宽度
          let foundSide = null;
          if (widthValForSiders && (foundSide = siders.find(side => side.selector === selector))) {
            if (foundSide.width == null) {
              let convertedSideVal = null;
              const pxVal = widthValForSiders.match(/(.*?)(?=px$)/)?.[1];
              if (pxVal != null) {
                convertedSideVal = pxToMediaQueryPx_noUnit(+pxVal, _viewportWidth, desktopWidth, unitPrecision);
              } else {
                const vwVal = widthValForSiders.match(/(.*?)(?=vw$)/)?.[1];
                if (vwVal != null) {
                  convertedSideVal = vwToMediaQueryPx_noUnit(+vwVal, desktopWidth, unitPrecision);
                } else {
                  const percVal = hadFixed ? widthValForSiders.match(/(.*?)(?=%$)/)?.[1] : null;
                  if (percVal != null) {
                    convertedSideVal = percentToMediaQueryPx_FIXED_noUnit(+percVal, desktopWidth, unitPrecision);
                  }
                }
              }
              foundSide.width = convertedSideVal;
            }
          }
          walkedRule = false;
          !addedDemo && demoMode && demoModeSelector === selector && (appendDemoContent(postcss, demoModeSelector, rule, desktopViewAtRule, landScapeViewAtRule, disableDesktop, disableLandscape, disableMobile), addedDemo = true);
        },
        OnceExit(css, postcss) {
          const appendedDesktop = desktopViewAtRule.nodes.length > 0;
          const appendedLandscape = landScapeViewAtRule.nodes.length > 0;
          const appendedShared = sharedAtRule.nodes.length > 0;
          const appendedDvh = dvhAtRule.nodes.length > 0;

          if (extract) {
            /**
             * 清空 css 内容，并拆分为 `@import`
             * ```css
             * @import url(mobile.css)
             * @import url(landscape.css) screen and ...
             * @import url(desktop.css) screen and ...
             * ```
             */
            const matched = (file || '').match(/([^/\\]+)\.(\w+)(?:\?.+)?$/);
            const name = matched && matched[1] || "UNEXPECTED_FILE";
            const ext = matched && matched[2] || "css";
            const mobileFile = `mobile.${name}.${ext}`;
            const desktopFile = `desktop.${name}.${ext}`;
            const landscapeFile = `landscape.${name}.${ext}`;
            const sharedFile = `shared.${name}.${ext}`;

            /** 应用根目录 */
            const rootDir = process.cwd();
            /** 当前 css 文件路径 */
            const curFilePath = from || '';
            /** 目标文件夹 */
            const targetDir = path.join(__dirname, ".temp");
            /** 目标文件文件夹 */
            const targetFileDir = path.join(targetDir, curFilePath.replace(/[^/\\]*$/, '').replace(rootDir, ''));

            const newSharedFilePath = path.join(targetFileDir, sharedFile);
            const atImportShared = postcss.atRule({ name: "import", params: `url(${newSharedFilePath}) ${sharedAtRule.params}` });

            if (appendedDesktop) {
              const sidersMedia = appendSiders(postcss, siders, _minDesktopDisplayWidth, maxLandscapeDisplayHeight);
              if (sidersMedia.length > 0) css.append(sidersMedia); // 侧边样式添加入移动端样式文件中，移动端样式文件也就是主样式文件
            }
            if (appendedShared) css.append(atImportShared);
            const mobileCss = css.toString(); // without media query
            const mobilePromise = extractFile(mobileCss, mobileFile, targetFileDir); // 提取移动端 css
            atImportShared.remove();

            let sharedPromise = Promise.resolve();
            if (appendedShared) {
              mergeRules(sharedAtRule); // 合并相同选择器中的内容
              removeDuplicateDecls(sharedAtRule); // 移除重复属性
              const sharedCss = postcss.root().append(sharedAtRule.nodes).toString(); // without media query
              sharedPromise = extractFile(sharedCss, sharedFile, targetFileDir); // 提取公共 css
            }

            let desktopPromise = Promise.resolve();
            if (appendedDesktop) {
              const desktopCssRules = postcss.root(); // without media query
              mergeRules(desktopViewAtRule); // 合并相同选择器中的内容
              removeDuplicateDecls(desktopViewAtRule); // 移除重复属性
              desktopCssRules.append(desktopViewAtRule.nodes);
              // if (appendedShared) desktopCssRules.prepend(atImportShared);
              const desktopCss = desktopCssRules.toString();
              desktopPromise = extractFile(desktopCss, desktopFile, targetFileDir); // 提取桌面端 css
            }

            let landscapePromise = Promise.resolve();
            if (appendedLandscape) {
              const landscapeCssRules = postcss.root(); // without media query
              mergeRules(landScapeViewAtRule); // 合并相同选择器中的内容
              removeDuplicateDecls(landScapeViewAtRule); // 移除重复属性
              landscapeCssRules.append(landScapeViewAtRule.nodes);
              // if (appendedShared) landscapeCssRules.prepend(atImportShared);
              const landscapeCss = landscapeCssRules.toString();
              landscapePromise = extractFile(landscapeCss, landscapeFile, targetFileDir); // 提取横屏 css
            }

            // 清空文件内容，并替换为 @import，导入移动端、桌面端和横屏
            const atImportMobile = postcss.atRule({ name: "import", params: `url(${path.join(targetFileDir, mobileFile)})` });
            const atImportDesktop = postcss.atRule({ name: "import", params: `url(${path.join(targetFileDir, desktopFile)}) ${desktopViewAtRule.params}` });
            const atImportLandscape = postcss.atRule({ name: "import", params: `url(${path.join(targetFileDir, landscapeFile)}) ${landScapeViewAtRule.params}` });
            css.walkRules(rule => {
              rule.removeAll();
            });
            if (appendedLandscape) css.prepend(atImportLandscape);
            if (appendedDesktop) css.prepend(atImportDesktop);
            css.prepend(atImportMobile);
            return Promise.all([mobilePromise, desktopPromise, landscapePromise, sharedPromise]);
          } else {
            if (appendedDesktop) {
              mergeRules(desktopViewAtRule); // 合并相同选择器中的内容
              removeDuplicateDecls(desktopViewAtRule); // 移除重复属性
              css.append(desktopViewAtRule); // 样式中添加桌面端媒体查询
  
              const sidersMedia = appendSiders(postcss, siders, _minDesktopDisplayWidth, maxLandscapeDisplayHeight);
              if (sidersMedia.length > 0) {
                css.append(sidersMedia);
              }
            }
            if (appendedLandscape) {
              mergeRules(landScapeViewAtRule);
              removeDuplicateDecls(landScapeViewAtRule); // 移除重复属性
              css.append(landScapeViewAtRule); // 样式中添加横屏媒体查询
            }
            if (appendedShared) {
              mergeRules(sharedAtRule);
              removeDuplicateDecls(sharedAtRule); // 移除重复属性
              css.append(sharedAtRule); // 样式中添加公共媒体查询
            }
          }
          if (appendedDvh) css.append(dvhAtRule);
        },
      };

      function Rule(rule, postcss) {
        if (rule.processedLimitedCentreWidth || rule.processedAutoAppContainingBlock) return; // 对于用 maxDisplayWidth 来限制宽度的根元素，会在原来的选择器内添加属性，这会导致重新执行这个选择器，这里对已经处理过的做标记判断，防止死循环
        if (mqMode) {
          // 验证当前选择器在媒体查询中吗，不对选择器中的内容转换
          if (ignoreAtRule) return ;
          walkedRule = true;
          widthValForSiders = null;
        }
        selector = rule.selector;
        if (isMatchedStr(selectorBlackList, selector))
          return blackListedSelector = true;

        hadFixed = false;
        isVerticalWritingMode = false;
        blackListedSelector = false;

        if (remMode && !hasHtmlRule) {
          hasHtmlRule = selector === "html";
          hasHtmlRule && appendRemFontSize(rule, _basicRemWidth);
        }

        // 设置页面最外层 class 的最大宽度，并居中
        if (selector === appSelector) {
          appendCentreRoot(postcss, selector, disableDesktop, disableLandscape, border, {
            rule,
            desktopViewAtRule,
            landScapeViewAtRule,
            sharedAtRule,
            dvhAtRule,
            desktopWidth,
            landscapeWidth,
            maxWidthMode: maxVwMode || remMode,
            maxDisplayWidth,
            minDisplayWidth,
          });

          if (autoAppContainingBlock) {
            rule.prepend(bookObj(gpuLayer), bookObj(fullHVh))
          }
        }

        if (selector === necessarySelectorWhenAuto && autoAppContainingBlock) {
          rule.prepend(bookObj(fullW), bookObj(fullH), bookObj(autoOverflow));
          rule.processedAutoAppContainingBlock = true;
        }

        // 标记优先级最高的各个属性
        mqMode && priorityProps.clear();
        rule.walkDecls(decl => {
          const { prop, value: val } = decl;

          if (mqMode) {
            const mapProp = priorityProps.get(prop);
            if (mapProp == null || decl.important || !mapProp.important) {
              priorityProps.set(prop, decl);
            }
          }

          if (!isVerticalWritingMode && prop === "writing-mode" && ["vertical-rl", "vertical-lr", "sideways-rl", "sideways-lr", "tb", "tb-rl"].includes(val))
            isVerticalWritingMode = true;
        });

        if (!ignoreToCorrectFixed)
          if (hasRootContainingBlockComment(rule, RCB_CMT) || // 有标志*根包含块*的注释吗？
            isMatchedStr(rootContainingBlockSelectorList, selector))
            hadFixed = true;
        if (hasWritingModeComment(rule, VWM_CMT) || // 有标志*纵向书写模式*的注释吗？
          isMatchedStr(verticalWritingSelectorList, selector))
          isVerticalWritingMode = true;
        initContainingBlockWidthDeclsMap(rule);
      }

      function initContainingBlockWidthDeclsMap(typeRule) {
        if (ignoreToCorrectFixed || hasNoneRootContainingBlockComment(typeRule, NRCB_CMT)) // 有标志*非根包含块*的注释吗？或者指定了忽略转换百分比单位
          containingBlockWidthDeclsMap = new Map();
        else containingBlockWidthDeclsMap = createContainingBlockWidthDecls(isVerticalWritingMode);
      }

      function transformContainingBlockWidthDecls() {
        if (blackListedSelector) return;

        containingBlockWidthDeclsMap.forEach((decl, prop) => {
          if (decl == null) return;

          const val = decl.value;
          const leftOrRight = prop === "left" || prop === "right" || rootContainingBlockList_LR.includes(prop);

          const { mobile } = convertPropValue(prop, val, {
            enabledMobile: true,
            matchPercentage: hadFixed,
            convertMobile: (number, unit, numberStr) => {
              if (remMode) {
                if (hadFixed) {
                  if (leftOrRight)
                    return convertRem_FIXED_LR(number, unit, _basicRemWidth, unitPrecision, numberStr, remRatio);
                  return convertRem_FIXED(number, unit, _basicRemWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, numberStr, remRatio);
                }
                return convertRem(number, unit, _basicRemWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, remRatio);
              }
              else if (maxVwMode) {
                if (hadFixed) {
                  if (leftOrRight)
                    return convertMaxMobile_FIXED_LR(number, unit, maxDisplayWidth, _viewportWidth, unitPrecision, numberStr);
                  return convertMaxMobile_FIXED(number, unit, maxDisplayWidth, _viewportWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, numberStr, minDisplayWidth);
                }
                return convertMaxMobile(number, unit, maxDisplayWidth, _viewportWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, numberStr, minDisplayWidth);
              }
              return convertMobile(prop, number, unit, _viewportWidth, unitPrecision, fontViewportUnit, mobileUnit);
            },
          });

          decl.book = true;
          decl.value = mobile;
        });
        containingBlockWidthDeclsMap = new Map();
      }

      function Declaration(decl) {

        const { prop, value: val } = decl;
        if (decl.book) return; // 被标记过不转换
        if (blackListedSelector) return; // 属性在黑名单选择器中，不进行转换

        if (!satisfyPropList(prop)) return ;
        if (isMatchedSelectorProperty(propertyBlackList, selector, prop)) return; // 属性是否在黑名单中
        if (isMatchedStr(valueBlackList, val)) return; // 属性值是否在黑名单中

        if (prop === "position" && val === "fixed" && !ignoreToCorrectFixed) return hadFixed = true;
        if (hasIgnoreComments(decl, result, IN_CMT, IL_CMT)) return;
        // 如果有标注不转换注释，不进行转换
        if (hasApplyWithoutConvertComment(decl, result, AWC_CMT)) return ;
        // 是否忽略百分比转换？如果不忽略，则需要收集哪些属性会涉及到根包含块
        if (!ignoreToCorrectFixed) {
          // 该属性是用于设置根包含块的变量属性
          const isRootContainingBlockProp = rootContainingBlockList_LR.includes(prop) || rootContainingBlockList_NOT_LR.includes(prop);
          isRootContainingBlockProp && (hadFixed = true);
          // 受 fixed 布局影响的，需要在 ruleExit 中计算的属性
          if (containingBlockWidthDeclsMap.has(prop) || isRootContainingBlockProp) {
            const important = decl.important;
            const mapDecl = containingBlockWidthDeclsMap.get(prop);
            if (mapDecl == null || important || !mapDecl.important)
              containingBlockWidthDeclsMap.set(prop, decl);
            return;
          }
        }

        if (preflightReg.test(val)) {
          const { mobile } = convertPropValue(prop, val, {
            enabledMobile: true,
            matchPercentage: false,
            convertMobile(number, unit, numberStr) {
              if (remMode)
                return convertRem(number, unit, _basicRemWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, remRatio);
              else if (maxVwMode)
                return convertMaxMobile(number, unit, maxDisplayWidth, _viewportWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, numberStr, minDisplayWidth);
              else
                return convertMobile(prop, number, unit, _viewportWidth, unitPrecision, fontViewportUnit, mobileUnit);
            },
          });
          decl.book = true;
          decl.value = mobile;
        }

      }

    },
  };
};

module.exports.postcss = true;

/**
 * 用于替换 webpack css-loader 配置中的 getLocalIdent。需要引入 css-loader
 * 导出的 defaultGetLocalIdent 函数。
 *
 * 开启 extract 选项后，桌面端和横屏的媒体查询会被分割为单独的文件，文件的路
 * 径和源文件相异，这会导致生成的样式选择器 hash 值不同，这个函数用来修改新生成
 * 文件的路径字符串，用于在桌面端和横屏的媒体查询文件里的选择器 hash 保持和源文
 * 件一致。
 *
 * 举例：
 * ```javascript
 * const { defaultGetLocalIdent } = require("css-loader");
 * const { remakeExtractedGetLocalIdent } = require("postcss-mobile-forever");
 * 
 * module.exports = {
 *   module: {
 *     rules: [{
 *       test: /\.css$/,
 *       use: [{
 *         loader: "css-loader",
 *         options: {
 *           modules: {
 *             localIdentName: "[path][name]__[local]",
 *             getLocalIdent: remakeExtractedGetLocalIdent({ defaultGetLocalIdent }), // <----- 这里
 *           },
 *         },
 *       }, "postcss-loader"],
 *     }],
 *   },
 * }
 * ```
 **/
module.exports.remakeExtractedGetLocalIdent = function({ defaultGetLocalIdent, getLocalIdent }) {
  return (context, localIdentName, localName, options) => {
    const {
      resourcePath,
    } = context;
    const aStr = __dirname.replace(process.cwd(), ''); // '/node_modules/postcss-mobile-forever'
    const bStr = resourcePath.replace(aStr + '/.temp', ''); // remove '/node_modules/postcss-mobile-forever/.temp'
    const cStr = bStr.replace(/(?<=[\\/])(?:landscape|desktop|mobile|shared)\.([^\\/]*)$/, (_, file) => file); // remove 'landscape\.|desktop\.|mobile\.|shared.'
    const newContext = {
      ...context,
      resourcePath: cStr, // remade resource path
    };
    if (getLocalIdent) {
      return getLocalIdent(newContext, localIdentName, localName, options);
    } else {
      const localIdent = defaultGetLocalIdent(newContext, localIdentName, localName, options);
      return localIdent.replace(/\[local\]/gi, localName);
    }
  }
};