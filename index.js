const { removeDulplicateDecls, mergeRules, createRegArrayChecker, createIncludeFunc, createExcludeFunc, isBlacklistSelector, round, createFixedContainingBlockDecls, hasContainingBlockComment, dynamicZero } = require("./src/logic-helper");
const { createPropListMatcher } = require("./src/prop-list-matcher");
const { appendMarginCentreRootClassWithBorder, appendMediaRadioPxOrReplaceMobileVwFromPx, appendMarginCentreRootClassNoBorder, appendDemoContent, appendConvertedFixedContainingBlockDecls, appendCentreRoot } = require("./src/css-generator");
const { demoModeSelector } = require("./src/constants");

const {
  /** 用于验证字符串是否为“数字px”的形式 */
  pxVwTestReg,
} = require("./src/regexs");

const defaults = {
  /** 设计图宽度 */
  viewportWidth: 750,
  /** 桌面端宽度 */
  desktopWidth: 600,
  /** 移动端横屏宽度 */
  landscapeWidth: 425,
  /** 宽度断点，视图大于这个宽度，则页面使用桌面端宽度 */
  minDesktopDisplayWidth: null,
  /** 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度 */
  maxLandscapeDisplayHeight: 640,
  /** [deprecated] 页面最外层 class 选择器 */
  rootClass: "root-class",
  /** 页面最外层选择器，如 `#app`、`.root-class` */
  rootSelector: null,
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
  /** 是否处理某个属性？ */
  propList: ['*'],
  /** 移动端竖屏视口视图的配置，同 postcss-px-to-view */
  mobileConfig: {
    viewportUnit: "vw",
    fontViewportUnit: "vw",
    replace: true,
  },
  sideConfig: {
    selector: null,
    width: 190,
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

  const { viewportWidth, desktopWidth, landscapeWidth, rootClass, rootSelector, border, disableDesktop, disableLandscape, disableMobile, minDesktopDisplayWidth, maxLandscapeDisplayHeight, include, exclude, unitPrecision, mobileConfig, demoMode, selectorBlackList, propList } = opts;
  const { fontViewportUnit, replace, viewportUnit } = mobileConfig;


  const _minDesktopDisplayWidth = minDesktopDisplayWidth == null ? desktopWidth : minDesktopDisplayWidth;
  const _rootSelector = rootSelector == null ? `.${rootClass}` : rootSelector;

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

  const satisfyPropList = createPropListMatcher(propList);
  return {
    postcssPlugin: "postcss-mobile-forever",
    prepare(result) {
      const file = result.root.source && result.root.source.input.file;
      // 包含文件
      if(hasNoIncludeFile(include, file, includeType)) return;
      // 排除文件
      if(hasExcludeFile(exclude, file, excludeType)) return;

      /** 桌面端视图下的媒体查询 */
      let desktopViewAtRule = null;
      /** 移动端横屏下的媒体查询 */
      let landScapeViewAtRule = null;
      /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
      let sharedAtRult = null;


      let hasFixed = null;
      /** 当前选择器 */
      let selector = null;
      /** 视图宽度 */
      let _viewportWidth = null;
      /** 桌面端缩放比例 */
      let desktopRadio = 1;
      /** 移动端横屏缩放比例 */
      let landscapeRadio = 1;
      /** 选择器在黑名单吗 */
      let blackListedSelector = null;
      /** 是否在媒体查询中 */
      let insideMediaQuery = false;
      /** 是否添加过调试代码了？ */
      let addedDemo = false;
      let rootContainingBlockDeclsMap = null;
      /** 不是被选择器包裹的属性不处理，例如 @font-face 中的属性 */
      let walkedRule = false;
      return {
        Once(_, postcss) {
          /** 桌面端视图下的媒体查询 */
          desktopViewAtRule = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth}px) and (min-height: ${maxLandscapeDisplayHeight}px)`, nodes: [] })
          /** 移动端横屏下的媒体查询 */
          const landscapeMediaStr_1 = `(min-width: ${_minDesktopDisplayWidth}px) and (max-height: ${maxLandscapeDisplayHeight}px)`;
          const landscapeMediaStr_2 = `(max-width: ${_minDesktopDisplayWidth}px) and (min-width: ${landscapeWidth}px) and (orientation: landscape)`;
          landScapeViewAtRule = postcss.atRule({ name: "media", params: `${landscapeMediaStr_1}, ${landscapeMediaStr_2}`, nodes: [] });
          /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
          sharedAtRult = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth}px), (orientation: landscape) and (max-width: ${_minDesktopDisplayWidth}px) and (min-width: ${landscapeWidth}px)`, nodes: [] });
          
        },
        Rule(rule, postcss) {
          walkedRule = true;
          hasFixed = false;
          insideMediaQuery = false;
          blackListedSelector = false;
          selector = rule.selector;

          if (isBlacklistSelector(selectorBlackList, selector))
            return blackListedSelector = true;
          // 验证当前选择器在媒体查询中吗，不对选择器中的内容转换
          if (rule.parent.params) return insideMediaQuery = true;

          // 是否动态视图宽度？
          const isDynamicViewportWidth = typeof viewportWidth === "function";
          _viewportWidth = isDynamicViewportWidth ? viewportWidth(file, selector) : viewportWidth;
          /** 桌面端缩放比例 */
          desktopRadio = desktopWidth / _viewportWidth;
          /** 移动端横屏缩放比例 */
          landscapeRadio = landscapeWidth / _viewportWidth;

          // 设置页面最外层 class 的最大宽度，并居中
          if (selector === _rootSelector) {
            appendCentreRoot(postcss, selector, disableDesktop, disableLandscape, border, {
              desktopViewAtRule,
              landScapeViewAtRule,
              sharedAtRult,
              desktopWidth,
              landscapeWidth,
            });
          }

          /** 有标志非根包含块的注释吗？ */
          const notRootContainingBlock = hasContainingBlockComment(rule);
          rootContainingBlockDeclsMap = notRootContainingBlock ? new Map() : createFixedContainingBlockDecls();
        },
        Declaration(decl, postcss) {
          if (!walkedRule) return;
          if (insideMediaQuery) return;
          if (decl.book) return; // 被标记过
          if (blackListedSelector) return;
          const prop = decl.prop;
          const val = decl.value;
  
          if (prop === "position" && val === "fixed") {
            hasFixed = true;
          }
          // 受 fixed 布局影响的，需要在 ruleExit 中计算的属性
          if (rootContainingBlockDeclsMap.has(prop)) {
            const important = decl.important;
            const mapDecl = rootContainingBlockDeclsMap.get(prop);
            if (mapDecl == null || important || !mapDecl.important)
              rootContainingBlockDeclsMap.set(prop, decl);
            return;
          }
          // 转换 px
          if (pxVwTestReg.test(val)) {
            const important = decl.important;
            const satisfiedPropList = satisfyPropList(prop);
            // 添加桌面端、移动端媒体查询
            appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
              desktopViewAtRule,
              landScapeViewAtRule,
              important,
              decl,
              unitPrecision,
              satisfiedPropList,
              fontViewportUnit,
              replace,
              result,
              viewportUnit,
              desktopWidth,
              landscapeWidth,
              matchPercentage: false,
              convertMobile: (number, unit) => {
                if (unit === "px") {
                  const fontProp = prop.includes("font");
                  const n = round(number * 100 / _viewportWidth, unitPrecision)
                  const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
                  return number === 0 ? `0${unit}` : `${n}${mobileUnit}`;
                } else
                  return `${number}${unit}`;
              },
              convertDesktop: (number, unit, numberStr) => {
                // 处理 0
                const dznn = numberStr => number => dynamicZero(number, numberStr);
                const dzn = dznn(numberStr);

                if (unit === "vw")
                  return `${dzn(round(desktopWidth / 100 * number, unitPrecision))}px`;
                else if (unit === "px") {
                  const n = round(number * desktopRadio, unitPrecision);
                  return `${dzn(n)}px`;
                } else
                  return `${dzn(number)}${unit}`;
              },
              convertLandscape: (number, unit, numberStr) => {
                // 处理 0
                const dznn = numberStr => number => dynamicZero(number, numberStr);
                const dzn = dznn(numberStr);

                if (unit === "vw")
                  return `${dzn(round(landscapeWidth / 100 * number, unitPrecision))}px`;
                else if (unit === "px") {
                  const n = round(number * landscapeRadio, unitPrecision);
                  return `${dzn(n)}px`;
                } else
                  return `${dzn(number)}${unit}`;
              },
            });
          }
        },
        RuleExit(rule, postcss) {
          if (!walkedRule) return;
          if (insideMediaQuery) return;
          if (blackListedSelector) return;
          rootContainingBlockDeclsMap.forEach((decl, prop) => {
            if (decl == null) return;
            const satisfiedPropList = satisfyPropList(prop);
            appendConvertedFixedContainingBlockDecls(postcss, selector, decl, disableDesktop, disableLandscape, disableMobile, hasFixed, {
              viewportWidth: _viewportWidth,
              desktopRadio,
              landscapeRadio,
              desktopViewAtRule,
              landScapeViewAtRule,
              unitPrecision,
              satisfiedPropList,
              fontViewportUnit,
              replace,
              result,
              viewportUnit,
              desktopWidth,
              landscapeWidth,
            });
          });
          walkedRule = false;
          !addedDemo && demoMode && demoModeSelector === selector && (appendDemoContent(postcss, demoModeSelector, rule, desktopViewAtRule, landScapeViewAtRule, disableDesktop, disableLandscape, disableMobile), addedDemo = true);
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