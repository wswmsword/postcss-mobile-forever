const { removeDulplicateDecls, mergeRules, createRegArrayChecker, createIncludeFunc, createExcludeFunc, isSelector, createContainingBlockWidthDecls, hasNoneRootContainingBlockComment, hasRootContainingBlockComment, hasIgnoreComments, convertNoFixedMediaQuery, convertMaxMobile, convertMobile, hasApplyWithoutConvertComment } = require("./src/logic-helper");
const { createPropListMatcher } = require("./src/prop-list-matcher");
const { appendMediaRadioPxOrReplaceMobileVwFromPx, appendDemoContent, appendConvertedFixedContainingBlockDecls, appendCentreRoot, appendSider, appendDisplaysRule, appendCSSVar, extractFile } = require("./src/css-generator");
const { PLUGIN_NAME, demoModeSelector, lengthProps, applyComment, rootCBComment, notRootCBComment, ignoreNextComment, ignorePrevComment } = require("./src/constants");
const path = require('path');

const {
  /** 用于验证字符串是否为“数字px”的形式 */
  pxVwTestReg, varTestReg,
} = require("./src/regexs");
const SubsequentPlugins = require("./src/subsequent-plugins");

const defaults = {
  /** 设计图宽度 */
  viewportWidth: 750,
  /** 桌面端宽度 */
  desktopWidth: 600,
  /** 移动端横屏宽度 */
  landscapeWidth: 425,
  /** 视图展示的最大宽度，单位会转换成诸如 min(vw, px) 的形式 */
  maxDisplayWidth: null,
  /** 宽度断点，视图大于这个宽度，则页面使用桌面端宽度 */
  minDesktopDisplayWidth: null,
  /** 高度断点，视图小于这个高度，并满足一定条件，则页面使用移动端横屏宽度 */
  maxLandscapeDisplayHeight: 640,
  /** 页面最外层选择器，如 `#app`、`.root-class` */
  rootSelector: "#app",
  /** 在页面外层展示边框吗 */
  border: false,
  /** 提取移动端、桌面端和横屏代码，使用 `@import` 引入 */
  extract: false,
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
  /** 包含块是根元素的选择器列表 */
  rootContainingBlockSelectorList: [],
  /** 移动端竖屏转换单位 */
  mobileUnit: "vw",
  /** 侧边内容配置 */
  side: {
    /** 侧边宽度 */
    width: 190,
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
  };

  const { viewportWidth, desktopWidth, landscapeWidth, rootSelector, extract, border, disableDesktop, disableLandscape, disableMobile, minDesktopDisplayWidth, maxLandscapeDisplayHeight, include, exclude, unitPrecision, side, demoMode, selectorBlackList, rootContainingBlockSelectorList, propList, maxDisplayWidth, comment, mobileUnit } = opts;
  const { width: sideWidth, gap: sideGap, selector1: side1, selector2: side2, selector3: side3, selector4: side4 } = side;
  const { applyWithoutConvert: AWC_CMT, rootContainingBlock: RCB_CMT, notRootContainingBlock: NRCB_CMT, ignoreNext: IN_CMT, ignoreLine: IL_CMT } = comment;
  const fontViewportUnit = "vw";
  const replace = true;

  const _minDesktopDisplayWidth = minDesktopDisplayWidth == null ? desktopWidth : minDesktopDisplayWidth;

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

  const satisfyPropList = createPropListMatcher(propList);

  return {
    postcssPlugin: PLUGIN_NAME,
    prepare(result) {
      const file = result.root && result.root.source && result.root.source.input.file;
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
      let sharedAtRult = null;
      /** 侧边视图的媒体查询 */
      let sideAtRule = null;


      let hadFixed = null;
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
      /** 依赖根包含块宽度的属性 */
      let containingBlockWidthDeclsMap = null;
      /** 不是被选择器包裹的属性不处理，例如 @font-face 中的属性 */
      let walkedRule = false;
      /** 是否限制了最宽宽度？ */
      let limitedWidth = maxDisplayWidth != null;
      /** 是否有侧边选择器？ */
      let hadSider1 = false;
      let hadSider2 = false;
      let hadSider3 = false;
      let hadSider4 = false;
      // mobile-forever 之后的插件
      let plugins = null;
      // 提取桌面端和移动端，则需要为提取出的代码执行 postcss 插件
      if (extract) plugins = new SubsequentPlugins();

      return {
        Once(_, postcss) {
          /** 桌面端视图下的媒体查询 */
          desktopViewAtRule = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth}px) and (min-height: ${maxLandscapeDisplayHeight}px)`, nodes: [] });
          /** 移动端横屏下的媒体查询 */
          const landscapeMediaStr_1 = `(min-width: ${_minDesktopDisplayWidth}px) and (max-height: ${maxLandscapeDisplayHeight}px)`;
          const landscapeMediaStr_2 = `(max-width: ${_minDesktopDisplayWidth}px) and (min-width: ${landscapeWidth}px) and (orientation: landscape)`;
          landScapeViewAtRule = postcss.atRule({ name: "media", params: `${landscapeMediaStr_1}, ${landscapeMediaStr_2}`, nodes: [] });
          /** 桌面端和移动端横屏公共的媒体查询，用于节省代码体积 */
          sharedAtRult = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth}px), (orientation: landscape) and (max-width: ${_minDesktopDisplayWidth}px) and (min-width: ${landscapeWidth}px)`, nodes: [] });
          /** 侧边视图媒体查询 */
          sideAtRule = postcss.atRule({ name: "media", params: `(min-width: ${_minDesktopDisplayWidth + sideWidth * 2 + sideGap * 2}px) and (min-height: ${maxLandscapeDisplayHeight}px)`, nodes: [] });
        },
        Rule(rule, postcss) {
          walkedRule = true;
          hadFixed = false;
          insideMediaQuery = false;
          blackListedSelector = false;
          containingBlockWidthDeclsMap = createContainingBlockWidthDecls();
          selector = rule.selector;

          if (isSelector(selectorBlackList, selector))
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
          if (selector === rootSelector) {
            appendCentreRoot(postcss, selector, disableDesktop, disableLandscape, border, {
              rule,
              desktopViewAtRule,
              landScapeViewAtRule,
              sharedAtRult,
              desktopWidth,
              landscapeWidth,
              maxDisplayWidth,
            });
          }

          hadSider1 = hadSider1 || selector === side1;
          hadSider2 = hadSider2 || selector === side2;
          hadSider3 = hadSider3 || selector === side3;
          hadSider4 = hadSider4 || selector === side4;

          /** 有标志*非根包含块*的注释吗？ */
          const notRootContainingBlock = hasNoneRootContainingBlockComment(rule, NRCB_CMT);
          if (notRootContainingBlock) containingBlockWidthDeclsMap = new Map();
          /** 有标志*根包含块*的注释吗？ */
          const hadRootContainingBlock = hasRootContainingBlockComment(rule, RCB_CMT) || isSelector(rootContainingBlockSelectorList, selector);
          if (hadRootContainingBlock) hadFixed = true;
        },
        Declaration(decl, postcss) {
          if (!walkedRule) return;
          if (insideMediaQuery) return;
          if (decl.book) return; // 被标记过
          if (blackListedSelector) return;
          const prop = decl.prop;
          const val = decl.value;

          if (!satisfyPropList(prop)) return;
  
          if (prop === "position" && val === "fixed") return hadFixed = true;
          if (hasIgnoreComments(decl, result, IN_CMT, IL_CMT)) return;
          // 如果有标注不转换注释，直接添加到桌面端和横屏，不进行转换
          if (hasApplyWithoutConvertComment(decl, result, AWC_CMT)) {
            appendDisplaysRule(!disableDesktop, !disableLandscape, prop, val, decl.important, selector, postcss, {
              sharedAtRult,
              desktopViewAtRule,
              landScapeViewAtRule,
            });
            return;
          }

          // 受 fixed 布局影响的，需要在 ruleExit 中计算的属性
          if (containingBlockWidthDeclsMap.has(prop)) {
            const important = decl.important;
            const mapDecl = containingBlockWidthDeclsMap.get(prop);
            if (mapDecl == null || important || !mapDecl.important)
              containingBlockWidthDeclsMap.set(prop, decl);
            return;
          }
          // 转换 px
          if (pxVwTestReg.test(val)) {
            const important = decl.important;
            // 添加桌面端、移动端媒体查询
            appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
              desktopViewAtRule,
              landScapeViewAtRule,
              sharedAtRult,
              important,
              decl,
              unitPrecision,
              fontViewportUnit,
              replace,
              result,
              viewportUnit: mobileUnit,
              desktopWidth,
              landscapeWidth,
              matchPercentage: false,
              convertMobile: (number, unit, numberStr) => {
                if (limitedWidth)
                  return convertMaxMobile(number, unit, maxDisplayWidth, _viewportWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, numberStr);
                else
                  return convertMobile(prop, number, unit, _viewportWidth, unitPrecision, fontViewportUnit, mobileUnit);
              },
              convertDesktop: (number, unit, numberStr) => convertNoFixedMediaQuery(number, desktopWidth, viewportWidth, unitPrecision, unit, numberStr),
              convertLandscape: (number, unit, numberStr) => convertNoFixedMediaQuery(number, landscapeWidth, viewportWidth, unitPrecision, unit, numberStr),
            });
          } else if (lengthProps.includes(prop) && varTestReg.test(val)) {
            // 可以匹配 val(...) 的部分（css 变量），css 变量直接加入媒体查询
            const enabledDesktop = !disableDesktop;
            const enabledLandscape = !disableLandscape;
            appendCSSVar(enabledDesktop, enabledLandscape, prop, val, decl.important, selector, postcss, {
              sharedAtRult,
              desktopViewAtRule,
              landScapeViewAtRule,
            });
          }
        },
        RuleExit(rule, postcss) {
          if (!walkedRule) return;
          if (insideMediaQuery) return;
          if (blackListedSelector) return;
          containingBlockWidthDeclsMap.forEach((decl, prop) => {
            if (decl == null) return;
            appendConvertedFixedContainingBlockDecls(postcss, selector, decl, disableDesktop, disableLandscape, disableMobile, hadFixed, {
              viewportWidth: _viewportWidth,
              desktopRadio,
              landscapeRadio,
              desktopViewAtRule,
              landScapeViewAtRule,
              sharedAtRult,
              unitPrecision,
              fontViewportUnit,
              replace,
              result,
              viewportUnit: mobileUnit,
              desktopWidth,
              landscapeWidth,
              maxDisplayWidth,
            });
          });
          walkedRule = false;
          !addedDemo && demoMode && demoModeSelector === selector && (appendDemoContent(postcss, demoModeSelector, rule, desktopViewAtRule, landScapeViewAtRule, disableDesktop, disableLandscape, disableMobile), addedDemo = true);
        },
        OnceExit(css, postcss) {
          const appendedDesktop = desktopViewAtRule.nodes.length > 0;
          const appendedLandscape = landScapeViewAtRule.nodes.length > 0;
          const appendedShared = sharedAtRult.nodes.length > 0;

          if (extract) {
            /**
             * 清空 css 内容，并拆分为 `@import`
             * ```css
             * @import url(mobile.css)
             * @import url(landscape.css) screen and ...
             * @import url(desktop.css) screen and ...
             * ```
             */
            const matched = file.match(/([^/\\]+)\.(\w+)(?:\?.+)?$/);
            const name = matched[1];
            const ext = matched[2];
            const mobileFile = `${name}-mobile.${ext}`;
            const desktopFile = `${name}-desktop.${ext}`;
            const landscapeFile = `${name}-landscape.${ext}`;
            const sharedFile = `${name}-shared.${ext}`;

            /** 应用根目录 */
            const rootDir = process.cwd();
            /** 当前 css 文件路径 */
            const curFilePath = from || '';
            /** 目标文件夹 */
            const targetDir = path.join(__dirname, ".temp");
            /** 目标文件文件夹 */
            const targetFileDir = path.join(targetDir, curFilePath.replace(/[^/\\]*$/, '').replace(rootDir, ''));

            const mobileCss = css.toString(); // without media query
            const mobilePromise = extractFile(plugins, mobileCss, mobileFile, targetFileDir, false); // 提取移动端 css

            let desktopPromise = Promise.resolve();
            if (appendedDesktop) {
              appendSider(postcss, sideAtRule, sideWidth, sideGap, hadSider1, hadSider2, hadSider3, hadSider4, desktopWidth, side1, side2, side3, side4);
              const desktopCss = postcss.root().append(desktopViewAtRule.nodes, sideAtRule).toString(); // without media query
              desktopPromise = extractFile(plugins, desktopCss, desktopFile, targetFileDir, appendedShared, sharedFile, sharedAtRult, desktopViewAtRule, postcss); // 提取桌面端 css
            }

            let landscapePromise = Promise.resolve();
            if (appendedLandscape) {
              const landscapeCss = postcss.root().append(landScapeViewAtRule.nodes).toString(); // without media query
              landscapePromise = extractFile(plugins, landscapeCss, landscapeFile, targetFileDir, appendedShared, sharedFile, sharedAtRult, landScapeViewAtRule, postcss); // 提取横屏 css
            }

            // 清空文件内容，并替换为 @import，导入移动端、桌面端和横屏
            const atImportMobile = postcss.atRule({ name: "import", params: `url(${path.join(targetFileDir, mobileFile)})` });
            const atImportDesktop = postcss.atRule({ name: "import", params: `url(${path.join(targetFileDir, desktopFile)}) ${desktopViewAtRule.params}` });
            const atImportLandscape = postcss.atRule({ name: "import", params: `url(${path.join(targetFileDir, landscapeFile)}) ${landScapeViewAtRule.params}` });
            css.removeAll();
            css.append(atImportMobile);
            if (appendedDesktop) css.append(atImportDesktop);
            if (appendedLandscape) css.append(atImportLandscape);
            return Promise.all(mobilePromise, desktopPromise, landscapePromise);
          } else {
            if (appendedDesktop) {
              mergeRules(desktopViewAtRule); // 合并相同选择器中的内容
              removeDulplicateDecls(desktopViewAtRule); // 移除重复属性
              css.append(desktopViewAtRule); // 样式中添加桌面端媒体查询
  
              appendSider(postcss, sideAtRule, sideWidth, sideGap, hadSider1, hadSider2, hadSider3, hadSider4, desktopWidth, side1, side2, side3, side4);
              if (sideAtRule.nodes.length > 0) {
                css.append(sideAtRule);
              }
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
          }
        },
      };
    },
  };
};

module.exports.postcss = true;