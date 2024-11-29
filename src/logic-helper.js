const { unitContentMatchReg, fixedUnitContentReg } = require("./regexs");
const { containingBlockWidthProps, horisontalContainingBlockLogicalProps, verticleContainingBlockLogicalProps } = require("./constants");
const { vwToMediaQueryPx, pxToMediaQueryPx, noUnitZeroToMediaQueryPx_FIXED_LR, pxToMediaQueryPx_FIXED_LR, vwToMediaQueryPx_FIXED_LR, percentToMediaQueryPx_FIXED_LR, percentToMediaQueryPx_FIXED, pxToMaxViewUnit, vwToMaxViewUnit, pxToViewUnit, pxToMaxViewUnit_FIXED_LR, vwToMaxViewUnit_FIXED_LR, percentToMaxViewUnit_FIXED_LR, percentageToMaxViewUnit, pxToClampLength, vwToClampLength, percentageToClampLength, pxToRemUnit, vwToRemUnit, pxToRemUnit_FIXED_LR, vwToRemUnit_FIXED_LR, percentageToRemUnit_FIXED_LR, percentageToRemUnit } = require("./unit-transfer");

/** 创建 fixed 时依赖宽度的属性 map */
const createContainingBlockWidthDecls = (isVerticalWritingMode) => {
  /** 逻辑宽度属性，和包含块有关的属性 */
  const logicalWidthProps = isVerticalWritingMode ? verticleContainingBlockLogicalProps : horisontalContainingBlockLogicalProps;
  /** 所有和根包含块宽度有关的属性 */
  const allContainingBlockWidthProps = containingBlockWidthProps.concat(logicalWidthProps);
  const mapArray = allContainingBlockWidthProps.reduce((prev, cur) => {
    return prev.concat([[cur, null]]);
  }, []);
  return new Map(mapArray);
}

/** 移除重复属性 */
const removeDuplicateDecls = (node) => {
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
    const compositeSelector = rule.selector.concat(rule.parent.name).concat(rule.parent.params); // 将区别类似 @k a { %0 { top: 0 } } 和 @k b { %0 { top: 0 } }
    const i = walked.selectors.indexOf(compositeSelector);
    if (i > -1) {
      walked.rules[i].append(rule.nodes);
      rule.remove();
    } else {
      walked.rules.push(rule);
      walked.selectors.push(compositeSelector);
    }
	});
};

/** 检查是否是正则类型或包含正则的数组 */
const createRegArrayChecker = (TYPE_REG, TYPE_ARY) => (options, optionName) => {
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
};

/** 如果不包含，则返回 true，不转换 */
const createIncludeFunc = (TYPE_REG, TYPE_ARY) => (include, file, regOrAry) => {
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

/** 如果排除，则返回 true，不转换 */
const createExcludeFunc = (TYPE_REG, TYPE_ARY) => (exclude, file, regOrAry) => {
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


const isMatchedStr = (list, str) => {
  if (typeof str !== 'string') return;
  return list.some((regex) => {
    if (typeof regex === 'string') return str.includes(regex);
    return str.match(regex);
  });
};

/** 是否匹配选择器属性 */
const isMatchedSelectorProperty = (propertyBlackList, selector, prop) => {
  const propertyBlackListAry = [].concat(propertyBlackList);
  for(const property of propertyBlackListAry) {
    if (Object.prototype.toString.call(property) === "[object Object]") {
      for(const propSelector in property) {
        if (property.hasOwnProperty(propSelector) && propSelector === selector) {
          const propValue = [].concat(property[propSelector]);
          if (isMatchedStr(propValue, prop)) return true;
        }
      }
    } else {
      if (isMatchedStr([property], prop)) return true;
    }
  }
};

/** 是否有忽略转换的注释？ */
const hasIgnoreComments = (decl, result, IN_CMT, IL_CMT) => {
  let ignore = false;
  ignore = hasNextComment(decl, IN_CMT);
  if (!ignore) {
    ignore = hasPrevComment(decl, IL_CMT, result);
  }
  return ignore;
};

/** 当前行是否有注释？ */
const hasPrevComment = (node, comment, result) => {
  let bud = false;
  let next = node.next();
  do {
    if (next && next.type === 'comment' && next.text === comment) {
      if (/\n/.test(next.raws.before)) {
        result.warn('Unexpected comment /* ' + comment + ' */ must be after declaration at same line.', { node: next });
      } else {
        // remove comment
        next.remove();
        bud = true;
      }
      break;
    }
    if (next == null || next.type !== "comment") break;
  } while(next = next.next())
  return bud;
};

/** 前面是否有匹配注释？ */
const hasNextComment = (node, comment) => {
  let bud = false;
  let prev = node.prev();
  if (prev == null) return false;
  do {
    if (prev && prev.type === 'comment' && prev.text === comment) {
      // remove comment
      prev.remove();
      bud = true;
      break;
    }
    if (prev == null ||  prev.type !== "comment") break;
  } while(prev = prev.prev())
  return bud;
};

const hasApplyWithoutConvertComment = (decl, result, AWC_CMT) => {
  return hasPrevComment(decl, AWC_CMT, result);
};

/** 选择器上方有根包含块的注释 */
const hasRootContainingBlockComment = hasNextComment;

/** 选择器前面有非根包含块的注释吗 */
const hasNoneRootContainingBlockComment = hasNextComment;

/** 选择器前面有书写模式的注释吗 */
const hasWritingModeComment = hasNextComment;

/** 获取匹配的数字和单位，转换 */
const convertPropValue = (prop, val, {
  enabledMobile,
  enabledDesktop,
  enabledLandscape,
  convertMobile,
  convertDesktop,
  convertLandscape,
  matchPercentage,
}) => {
  let book = false;
  let mobileVal = '';
  let desktopVal = '';
  let landscapeVal = '';

  let matched = null;
  let lastIndex = 0;
  const reg = matchPercentage ? fixedUnitContentReg : unitContentMatchReg;
  while(matched = reg.exec(val)) {
    const numberStr = matched[2];
    if (numberStr == null) continue;
    book = true;
    const beforePxContent = matched[1] || '';
    const chunk = val.slice(lastIndex, matched.index + beforePxContent.length); // 当前匹配和上一次匹配之间的字符串
    const number = Number(numberStr); // 数字
    const lengthUnit = matched[3]; // 单位
    if (convertMobile && enabledMobile)
      mobileVal = mobileVal.concat(chunk, convertMobile(number, lengthUnit, numberStr));
    if (convertDesktop && enabledDesktop)
      desktopVal = desktopVal.concat(chunk, convertDesktop(number, lengthUnit, numberStr));
    if (convertLandscape && enabledLandscape)
      landscapeVal = landscapeVal.concat(chunk, convertLandscape(number, lengthUnit, numberStr));

    lastIndex = reg.lastIndex;
  }

  const tailChunk = val.slice(lastIndex, val.length); // 最后一次匹配到结尾的字符串

  return {
    mobile: enabledMobile ? mobileVal.concat(tailChunk) : val,
    desktop: enabledDesktop ? desktopVal.concat(tailChunk) : val,
    landscape: enabledLandscape ? landscapeVal.concat(tailChunk) : val,
    book,
  }
};

/** 转换包含块是根元素的媒体查询 */
const convertFixedMediaQuery = (number, idealWidth, viewportWidth, precision, unit, numberStr, isFixed, leftOrRight) => {
  if (isFixed) {
    if (leftOrRight) {
      if (unit === "px") {
        return pxToMediaQueryPx_FIXED_LR(number, viewportWidth, idealWidth, precision);
      } else if (unit === "vw") {
        return vwToMediaQueryPx_FIXED_LR(number, idealWidth, precision);
      } else if (unit === '%') {
        return percentToMediaQueryPx_FIXED_LR(number, idealWidth, precision);
      } else if (unit === "" || unit === " ") {
        if (number === 0)
          return noUnitZeroToMediaQueryPx_FIXED_LR(idealWidth);
        return `${number}${unit}`;
      } else
        return `${number}${unit}`;
    } else {
      if (unit === "px") {
        return pxToMediaQueryPx(number, viewportWidth, idealWidth, precision, numberStr);
      } else if (unit === '%') {
        return percentToMediaQueryPx_FIXED(number, idealWidth, precision, numberStr);
      } else if (unit === "vw") {
        return vwToMediaQueryPx(number, idealWidth, precision, numberStr);
      } else
        return `${number}${unit}`;
    }
  } else {
    return convertNoFixedMediaQuery(number, idealWidth, viewportWidth, precision, unit, numberStr);
  }
};

/** 转换媒体查询 */
const convertNoFixedMediaQuery = (number, idealWidth, viewportWidth, precision, unit, numberStr) => {
  if (unit === "vw")
    return vwToMediaQueryPx(number, idealWidth, precision, numberStr);
  else if (unit === "px") {
    return pxToMediaQueryPx(number, viewportWidth, idealWidth, precision, numberStr);
  } else return `${number}${unit}`;
};

/** 转换移动竖屏 */
const convertMobile = (prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit) => {
  if (unit === "px")
    return pxToViewUnit(prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit);
  else return `${number}${unit}`;
};

/** 转换移动竖屏，限制最大宽度 */
const convertMaxMobile = (number, unit, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop, numberStr, minDisplayWidth) => {
  const isClamp = minDisplayWidth != null;
  if (unit === "px")
    return isClamp ?
      pxToClampLength(number, maxDisplayWidth, minDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop) :
      pxToMaxViewUnit(number, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop);
  else if (unit === "vw")
    return isClamp ?
      vwToClampLength(number, maxDisplayWidth, minDisplayWidth, numberStr, unitPrecision) :
      vwToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision);
  else return `${number}${unit}`;
}

/** 转换非 fixed 定位的 px，向 rem 转换 */
const convertRem = (number, unit, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop, basicRemRatio) => {
  if (unit === "px") {
    return pxToRemUnit(number, unitPrecision, viewportUnit, fontViewportUnit, prop, basicRemRatio);
  } else if (unit === "vw") {
    return vwToRemUnit(number, viewportWidth, unitPrecision);
  }
  else return `${number}${unit}`;
}

/** 转换移动端竖屏，包含块是根元素，left、right 属性 */
const convertMaxMobile_FIXED_LR = (number, unit, maxDisplayWidth, viewportWidth, unitPrecision, numberStr) => {
  if (unit === "px")
    return pxToMaxViewUnit_FIXED_LR(number, maxDisplayWidth, viewportWidth, unitPrecision);
  else if (unit === "vw")
    return vwToMaxViewUnit_FIXED_LR(number, maxDisplayWidth, unitPrecision);
  else if (unit === '%')
    return percentToMaxViewUnit_FIXED_LR(number, maxDisplayWidth, unitPrecision);
  else if (unit === " " || unit === "") {
    if (number === 0)
      return `calc(50% - min(50%, ${maxDisplayWidth / 2}px))`;
    return `${number}${unit}`;
  } else return `${numberStr}${unit}`;
};

const convertRem_FIXED_LR = (number, unit, viewportWidth, unitPrecision, numberStr, basicRemRatio) => {
  if (unit === "px")
    return pxToRemUnit_FIXED_LR(number, viewportWidth, unitPrecision, basicRemRatio);
  else if (unit === "vw")
    return vwToRemUnit_FIXED_LR(number, viewportWidth, unitPrecision);
  else if (unit === '%')
    return percentageToRemUnit_FIXED_LR(number, viewportWidth, unitPrecision);
  else if (unit === " " || unit === "") {
    if (number === 0)
      return `calc(50% - ${viewportWidth / 200}rem)`;
    return `${number}${unit}`;
  } else return `${numberStr}${unit}`;
};

/** 转换移动端竖屏，包含块是根元素 */
const convertMaxMobile_FIXED = (number, unit, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop, numberStr, minDisplayWidth) => {
  const isClamp = minDisplayWidth != null;
  if (unit === "px") {
    return isClamp ?
      pxToClampLength(number, maxDisplayWidth, minDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop) :
      pxToMaxViewUnit(number, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop);
  } else if (unit === "vw") {
    return isClamp ?
      vwToClampLength(number, maxDisplayWidth, minDisplayWidth, numberStr, unitPrecision) :
      vwToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision);
  } else if (unit === '%') {
    return isClamp ?
      percentageToClampLength(number, maxDisplayWidth, minDisplayWidth, numberStr, unitPrecision) :
      percentageToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision);
  } else return `${numberStr}${unit}`;
};

const convertRem_FIXED = (number, unit, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop, numberStr, basicRemRatio) => {
  if (unit === "px") {
    return pxToRemUnit(number, unitPrecision, viewportUnit, fontViewportUnit, prop, basicRemRatio);
  } else if (unit === "vw") {
    return vwToRemUnit(number, viewportWidth, unitPrecision);
  } else if (unit === '%') {
    return percentageToRemUnit(number, viewportWidth, unitPrecision);
  } else return `${numberStr}${unit}`;
};

module.exports = {
  removeDuplicateDecls,
  mergeRules,
  createRegArrayChecker,
  createIncludeFunc,
  createExcludeFunc,
  isMatchedStr,
  isMatchedSelectorProperty,
  convertPropValue,
  hasIgnoreComments,
  createContainingBlockWidthDecls,
  hasNoneRootContainingBlockComment,
  hasRootContainingBlockComment,
  hasWritingModeComment,
  convertNoFixedMediaQuery,
  convertFixedMediaQuery,
  convertMobile,
  convertMaxMobile,
  convertMaxMobile_FIXED_LR,
  convertMaxMobile_FIXED,
  hasApplyWithoutConvertComment,
  convertRem,
  convertRem_FIXED_LR,
  convertRem_FIXED,
};