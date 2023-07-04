const { removeDulplicateDecls, mergeRules, createRegArrayChecker, createIncludeFunc, createExcludeFunc, isMatchedStr, createContainingBlockWidthDecls,
  hasNoneRootContainingBlockComment, hasRootContainingBlockComment, hasIgnoreComments, convertNoFixedMediaQuery, convertMaxMobile, convertMobile,
  hasApplyWithoutConvertComment,
  isMatchedSelectorProperty,
} = require("./src/logic-helper");
const { createPropListMatcher } = require("./src/prop-list-matcher");
const { appendMediaRadioPxOrReplaceMobileVwFromPx, appendDemoContent, appendConvertedFixedContainingBlockDecls, appendCentreRoot, appendSider,
  appendDisplaysRule, appendCSSVar, extractFile,
} = require("./src/css-generator");
const { PLUGIN_NAME, demoModeSelector, lengthProps, applyComment, rootCBComment, notRootCBComment, ignoreNextComment, ignorePrevComment } = require("./src/constants");
const path = require('path');

const {
  /** 用于验证字符串是否为“数字px”的形式 */
  preflightReg, varTestReg,
} = require("./src/regexs");
// const SubsequentPlugins = require("./src/subsequent-plugins");

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
  /** 和长度有关的自定义属性 */
  customLengthProperty: {
    /** 根包含块属性，用于 left 和 right */
    rootContainingBlockList_LR: [],
    /** 根包含块属性，用于非 left 和 right 的属性 */
    rootContainingBlockList_NOT_LR: [],
    /** 祖先包含块属性 */
    ancestorContainingBlockList: [],
    /** 关闭自动添加到桌面端和横屏 */
    disableAutoApply: false,
  },
  /** 实验性功能 */
  experimental: {
    /** 是否拆分桌面端和横屏样式文件，提取移动端、桌面端和横屏代码，使用 `@import` 引入 */
    extract: false,
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
    customLengthProperty: {
      ...defaults.customLengthProperty,
      ...options.customLengthProperty,
    },
    experimental: {
      ...defaults.experimental,
      ...options.experimental,
    },
  };

  const { viewportWidth, desktopWidth, landscapeWidth, rootSelector, border, disableDesktop, disableLandscape, disableMobile, minDesktopDisplayWidth,
    maxLandscapeDisplayHeight, include, exclude, unitPrecision, side, demoMode, selectorBlackList, propertyBlackList, valueBlackList, rootContainingBlockSelectorList,
    propList, maxDisplayWidth, comment, mobileUnit, customLengthProperty, experimental,
  } = opts;
  const { extract } = experimental || {};
  const { width: sideWidth, gap: sideGap, selector1: side1, selector2: side2, selector3: side3, selector4: side4 } = side;
  const { applyWithoutConvert: AWC_CMT, rootContainingBlock: RCB_CMT, notRootContainingBlock: NRCB_CMT, ignoreNext: IN_CMT, ignoreLine: IL_CMT } = comment;
  const { rootContainingBlockList_LR, rootContainingBlockList_NOT_LR, ancestorContainingBlockList, disableAutoApply } = customLengthProperty;
  const fontViewportUnit = "vw";
  const replace = true;

  const _minDesktopDisplayWidth = minDesktopDisplayWidth == null ? desktopWidth : minDesktopDisplayWidth;

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

  const satisfyPropList = createPropListMatcher(propList);

  /** 需要添加到桌面端和横屏的 css 变量 */
  const expectedLengthVars = [...new Set([].concat(rootContainingBlockList_LR, rootContainingBlockList_NOT_LR, ancestorContainingBlockList))].filter(e => e != null);

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

      /** 一个选择器内优先级最高的各个属性 */
      const priorityProps = new Map();

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
          if (rule.processedLimitedWidthBorder) return; // 对于用 maxDisplayWidth 来限制宽度的根元素，会在原来的选择器内添加属性，这会导致重新执行这个选择器，这里对已经处理过的做标记判断，防止死循环
          walkedRule = true;
          hadFixed = false;
          insideMediaQuery = false;
          blackListedSelector = false;
          containingBlockWidthDeclsMap = createContainingBlockWidthDecls();
          selector = rule.selector;

          if (isMatchedStr(selectorBlackList, selector))
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
          const hadRootContainingBlock = hasRootContainingBlockComment(rule, RCB_CMT) || isMatchedStr(rootContainingBlockSelectorList, selector);
          if (hadRootContainingBlock) hadFixed = true;

          /** 标记优先级最高的各个属性 */
          priorityProps.clear();
          rule.walkDecls(decl => {
            const important = decl.important;
            const prop = decl.prop;
            const mapProp = priorityProps.get(prop);
            if (mapProp == null || important || !mapProp.important) {
              priorityProps.set(prop, decl);
            }
          })
        },
        Declaration(decl, postcss) {
          if (!walkedRule) return; // 不是 Rule 的属性则不转换
          if (insideMediaQuery) return; // 不转换媒体查询中的属性
          if (decl.book) return; // 被标记过不转换
          if (blackListedSelector) return; // 属性在黑名单选择器中，不进行转换
          const prop = decl.prop;
          const val = decl.value;

          if (!satisfyPropList(prop)) return;
          if (isMatchedSelectorProperty(propertyBlackList, selector, prop)) return; // 属性是否在黑名单中
          if (isMatchedStr(valueBlackList, val)) return; // 属性值是否在黑名单中
  
          if (prop === "position" && val === "fixed") return hadFixed = true;
          if (hasIgnoreComments(decl, result, IN_CMT, IL_CMT)) return;
          // 如果有标注不转换注释，直接添加到桌面端和横屏，不进行转换
          if (hasApplyWithoutConvertComment(decl, result, AWC_CMT)) {
            appendDisplaysRule(!disableDesktop, !disableLandscape, prop, val, decl.important, selector, postcss, {
              sharedAtRult,
              desktopViewAtRule,
              landScapeViewAtRule,
              isShare: priorityProps.get(prop) === decl,
            });
            return;
          }

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

          // 预检正则，判断是否符合转换条件
          if (preflightReg.test(val)) {
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
              viewportUnit: mobileUnit,
              desktopWidth,
              landscapeWidth,
              matchPercentage: false,
              expectedLengthVars,
              disableAutoApply,
              isLastProp: priorityProps.get(prop) === decl,
              convertMobile(number, unit, numberStr) {
                if (limitedWidth)
                  return convertMaxMobile(number, unit, maxDisplayWidth, _viewportWidth, unitPrecision, mobileUnit, fontViewportUnit, prop, numberStr);
                else
                  return convertMobile(prop, number, unit, _viewportWidth, unitPrecision, fontViewportUnit, mobileUnit);
              },
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
              sharedAtRult,
              desktopViewAtRule,
              landScapeViewAtRule,
              isLastProp: priorityProps.get(prop) === decl,
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
              viewportUnit: mobileUnit,
              desktopWidth,
              landscapeWidth,
              maxDisplayWidth,
              expectedLengthVars,
              disableAutoApply,
              isLRVars: rootContainingBlockList_LR.includes(prop),
              isLastProp: priorityProps.get(prop) === decl,
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
            const atImportShared = postcss.atRule({ name: "import", params: `url(${newSharedFilePath}) ${sharedAtRult.params}` });

            if (appendedDesktop) {
              appendSider(postcss, sideAtRule, sideWidth, sideGap, hadSider1, hadSider2, hadSider3, hadSider4, desktopWidth, side1, side2, side3, side4);
              if (sideAtRule.nodes.length > 0) css.append(sideAtRule); // 侧边样式添加入移动端样式文件中，移动端样式文件也就是主样式文件
            }
            if (appendedShared) css.append(atImportShared);
            const mobileCss = css.toString(); // without media query
            const mobilePromise = extractFile(mobileCss, mobileFile, targetFileDir); // 提取移动端 css
            atImportShared.remove();

            let sharedPromise = Promise.resolve();
            if (appendedShared) {
              mergeRules(sharedAtRult); // 合并相同选择器中的内容
              removeDulplicateDecls(sharedAtRult); // 移除重复属性
              const sharedCss = postcss.root().append(sharedAtRult.nodes).toString(); // without media query
              sharedPromise = extractFile(sharedCss, sharedFile, targetFileDir); // 提取公共 css
            }

            let desktopPromise = Promise.resolve();
            if (appendedDesktop) {
              const desktopCssRules = postcss.root(); // without media query
              mergeRules(desktopViewAtRule); // 合并相同选择器中的内容
              removeDulplicateDecls(desktopViewAtRule); // 移除重复属性
              // appendSider(postcss, sideAtRule, sideWidth, sideGap, hadSider1, hadSider2, hadSider3, hadSider4, desktopWidth, side1, side2, side3, side4);
              desktopCssRules.append(desktopViewAtRule.nodes);
              // if (sideAtRule.nodes.length > 0) desktopCssRules.append(sideAtRule);
              // if (appendedShared) desktopCssRules.prepend(atImportShared);
              const desktopCss = desktopCssRules.toString();
              desktopPromise = extractFile(desktopCss, desktopFile, targetFileDir); // 提取桌面端 css
            }

            let landscapePromise = Promise.resolve();
            if (appendedLandscape) {
              const landscapeCssRules = postcss.root(); // without media query
              mergeRules(landScapeViewAtRule); // 合并相同选择器中的内容
              removeDulplicateDecls(landScapeViewAtRule); // 移除重复属性
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
      resourcePath: cStr, // remaked resource path
    };
    if (getLocalIdent) {
      return getLocalIdent(newContext, localIdentName, localName, options);
    } else {
      const localIdent = defaultGetLocalIdent(newContext, localIdentName, localName, options);
      return localIdent.replace(/\[local\]/gi, localName);
    }
  }
};