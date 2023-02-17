const postcss = require("postcss");
const { width, marginL, marginR, left, right, maxWidth, borderR, borderL, contentBox, minFullHeight, autoHeight } = require("./constants");

const {
  /** 用于验证字符串是否为“数字px”的形式 */
  pxTestReg,
  /** 用于匹配字符串形如“数字px”中的“数字” */
  pxMatchReg,
 } = require("./regexs");

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
  rootClass: 'root-class',
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
};

const TYPE_REG = "regex";
const TYPE_ARY = "array";

/** 取小数后一位的四舍五入 */
const round = (number, precision) => Math.round(+number + 'e' + precision) / Math.pow(10, precision);

/** 检查是否是正则类型或包含正则的数组 */
const checkRegExpOrArray = (options, optionName) => {
  const obj2Str = val => Object.prototype.toString.call(val);
  const option = options[optionName];
  if (!option) return null;
  if (obj2Str(option) === '[object RegExp]') return TYPE_REG;
  if (obj2Str(option) === '[object Array]') {
    let bad = false;
    for (let i = 0; i < option.length; ++ i) {
      if (obj2Str(option[i]) !== '[object RegExp]') {
        bad = true;
        break;
      }
    }
    if (!bad) return TYPE_ARY;
  }
  throw new Error('options.' + optionName + ' should be RegExp or Array of RegExp.');
}

/** 移除重复属性 */
const removeDulplicateDecls = (node) => {
  node.walkRules(rule => {
    const walked = { props: [], propNodes: [] }
    rule.walkDecls(decl => {
      const prop = decl.prop;
      const i = walked.props.indexOf(prop);
      if (i > -1) {
        const important = decl.important;
        const prevImportant = walked.propNodes[i].important;
        if (important || (!important && !prevImportant)) {
          walked.propNodes[i].remove();
          walked.propNodes[i] = decl;
        }
      } else {
        walked.props.push(prop);
        walked.propNodes.push(decl);
      }
    });
  });
};

/** 合并相同名称的选择器 */
const mergeRules = (node) => {
	const walked = { rules: [], selectors: [] };
	node.walkRules(rule => {
		const i = walked.selectors.indexOf(rule.selector);
		if (i > -1) {
			walked.rules[i].append(rule.nodes);
			rule.remove();
		} else {
			walked.rules.push(rule);
			walked.selectors.push(rule.selector);
		}
	});
};

const hasNoIncludeFile = (include, file, regOrAry) => {
  if (include && file) {
    if (regOrAry === TYPE_REG) {
      if (!include.test(file)) return true;
    }
    if (regOrAry === TYPE_ARY) {
      let book = false;
      for (let i = 0; i < include.length; ++ i) {
        if(include[i].test(file)) {
          book = true;
          break;
        }
      }
      if (!book) return true;
    }
  }
};

const hasExcludeFile = (exclude, file, regOrAry) => {
  if (exclude && file) {
    if (regOrAry === TYPE_REG) {
      if (exclude.test(file)) return true;
    }
    if (regOrAry === TYPE_ARY) {
      for (let i = 0; i < exclude.length; ++ i)
        if (exclude[i].test(file)) return true;
    }
  }
};

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
  const opts = {
    ...defaults,
    ...options,
  };
  let { yAxisBreakPoint } = opts
  const { viewportWidth, desktopWidth, landscapeWidth, rootClass, border, disableDesktop, disableLandscape, enableMobile, xAxisBreakPoint, pass1px, include, exclude, unitPrecision } = opts;

  if (yAxisBreakPoint == null) {
    yAxisBreakPoint = desktopWidth
  }

  /** 桌面端缩放比例 */
  const desktopRadio = desktopWidth / viewportWidth;
  /** 移动端横屏缩放比例 */
  const landscapeRadio = landscapeWidth / viewportWidth;

  const excludeType = checkRegExpOrArray(opts, "exclude");
  const includeType = checkRegExpOrArray(opts, "include");

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
})

/** 居中最外层选择器，用 margin 居中，有 border */
function appendMarginCentreRootClassWithBorder(selector, disableDesktop, disableLandscape, {
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRult,
  desktopWidth,
  landscapeWidth,
  borderColor,
}) {
  if (disableDesktop && !disableLandscape) {
    // 仅移动端横屏
    landScapeViewAtRule.append(postcss.rule({ selector }).append(maxWidth(landscapeWidth), marginL, marginR, contentBox, borderL(borderColor), borderR(borderColor), minFullHeight, autoHeight));
  } else if (disableLandscape && !disableDesktop) {
    // 仅桌面
    desktopViewAtRule.append(postcss.rule({ selector }).append(maxWidth(desktopWidth), marginL, marginR, contentBox, borderL(borderColor), borderR(borderColor), minFullHeight, autoHeight));
  } else if (!disableDesktop && !disableLandscape) {
    // 桌面和移动端横屏
    desktopViewAtRule.append(postcss.rule({ selector }).append(maxWidth(desktopWidth)));
    landScapeViewAtRule.append(postcss.rule({ selector }).append(maxWidth(landscapeWidth)));
    sharedAtRult.append(postcss.rule({ selector }).append(marginL, marginR, contentBox, borderL(borderColor), borderR(borderColor), minFullHeight, autoHeight));
  }
}

/** 居中最外层选择器，margin 居中，无 border */
function appendMarginCentreRootClassNoBorder(selector, disableDesktop, disableLandscape, {
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRult,
  desktopWidth,
  landscapeWidth
}) {
  if (disableDesktop && !disableLandscape) {
    // 仅移动端横屏
    landScapeViewAtRule.append(postcss.rule({ selector }).append(maxWidth(landscapeWidth), marginL, marginR));
  } else if (disableLandscape && !disableDesktop) {
    // 仅桌面
    desktopViewAtRule.append(postcss.rule({ selector }).append(maxWidth(desktopWidth), marginL, marginR));
  } else if (!disableDesktop && !disableLandscape) {
    // 桌面和移动端横屏
    desktopViewAtRule.append(postcss.rule({ selector }).append(maxWidth(desktopWidth)));
    landScapeViewAtRule.append(postcss.rule({ selector }).append(maxWidth(landscapeWidth)));
    sharedAtRult.append(postcss.rule({ selector }).append(marginL, marginR));
  }
}

/** px 值，转换为媒体查询中比例计算的 px，替换为移动端竖屏视口单位 */
function appendMediaRadioPxOrReplaceMobileVwFromPx(selector, prop, val, disableDesktop, disableLandscape, enableMobile, {
  viewportWidth,
  desktopRadio,
  landscapeRadio,
  desktopViewAtRule,
  landScapeViewAtRule,
  important,
  pass1px,
  decl,
  unitPrecision,
}) {
  const enabledDesktop = !disableDesktop;
  const enabledLandscape = !disableLandscape;
  const enabledMobile = enableMobile;

  if (enabledDesktop || enabledLandscape || enabledMobile) {
    let mobileVal = '';
    let desktopVal = '';
    let landscapeVal = '';

    let mached = null;
    let lastIndex = 0;
    let book = false; // 标记
    while(mached = pxMatchReg.exec(val)) {
      const pxContent = mached[2];
      if (pxContent == null || pxContent === "0px") continue;
      book = true;
      const beforePxContent = mached[1] || '';
      const chunk = val.slice(lastIndex, mached.index + beforePxContent.length); // 当前匹配和上一次匹配之间的字符串
      const pxNum = Number(pxContent.slice(0, -2)); // 数字
      const pxUnit = pxContent.slice(-2); // 单位
      const is1px = pass1px && pxNum === 1;

      if (enabledMobile)
        mobileVal = mobileVal.concat(chunk, is1px ? 1 : round(Number(pxNum * 100 / viewportWidth), unitPrecision), is1px ? pxUnit : "vw");
      if (enabledDesktop)
        desktopVal = desktopVal.concat(chunk, is1px ? 1 : round(Number(pxNum * desktopRadio), unitPrecision), "px");
      if (enabledLandscape)
        landscapeVal = landscapeVal.concat(chunk, is1px ? 1 : round(Number(pxNum * landscapeRadio), unitPrecision), "px");

      lastIndex = pxMatchReg.lastIndex;
    }

    const tailChunk = val.slice(lastIndex, val.length); // 最后一次匹配到结尾的字符串
    if (enabledMobile && book) {
      mobileVal = mobileVal.concat(tailChunk);
      decl.value = mobileVal;
    }
    if (enabledDesktop && book) {
      desktopVal = desktopVal.concat(tailChunk);
      if (val !== desktopVal) {
        desktopViewAtRule.append(postcss.rule({ selector }).append({
          prop: prop, // 属性
          value: desktopVal, // 替换 px 比例计算后的值
          important, // 值的尾部有 important 则添加
        }));
      }
    }
    if (enabledLandscape && book) {
      landscapeVal = landscapeVal.concat(tailChunk);
      if (val !== landscapeVal) {
        landScapeViewAtRule.append(postcss.rule({ selector }).append({
          prop,
          value: landscapeVal,
          important,
        }));
      }
    }
  }
}

/** fixed 的百分百宽度转换为居中的固定宽度（预期的桌面端和移动端横屏宽度） */
function appendFixedFullWidthCentre(selector, disableDesktop, disableLandscape, {
  desktopWidth,
  landscapeWidth,
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRult,
}) {
  if (!disableDesktop && !disableLandscape) {
    // 桌面端和移动端横屏
    desktopViewAtRule.append(postcss.rule({ selector }).append(width(desktopWidth)));
    landScapeViewAtRule.append(postcss.rule({ selector }).append(width(landscapeWidth)));
    sharedAtRult.append(postcss.rule({ selector }).append(marginL, marginR, left, right));
  } else if (disableDesktop && !disableLandscape) {
    // 仅移动端横屏
    landScapeViewAtRule.append(postcss.rule({ selector }).append(width(landscapeWidth), marginL, marginR, left, right));
  } else if (disableLandscape && !disableDesktop) {
    // 仅桌面端
    desktopViewAtRule.append(postcss.rule({ selector }).append(width(desktopWidth), marginL, marginR, left, right));
  }

}

/** 100vw 转换为固定宽度（预期的桌面端和移动端横屏宽度） */
function appendStaticWidthFromFullVwWidth(selector, disableDesktop, disableLandscape, {
  desktopWidth,
  landscapeWidth,
  desktopViewAtRule,
  landScapeViewAtRule,
}) {
  if (!disableDesktop) {
    desktopViewAtRule.append(postcss.rule({ selector }).append(width(desktopWidth)));
  }
  if (!disableLandscape) {
    landScapeViewAtRule.append(postcss.rule({ selector }).append(width(landscapeWidth)));
  }
}