const { unitContentMatchReg, fixedUnitContentReg } = require("./regexs");
const { ignorePrevComment, ignoreNextComment, containingBlockWidthProps, notRootCBComment, rootCBComment } = require("./constants");
/** 单独处理 0 的情况，让 0 经过转换后一定变化 */
const dynamicZero = (num, numStr) => {
  if (num === 0) {
    return numStr === '0' ? `.0` : `${numStr}0`;
  }
  return num;
};

/** 创建 fixed 时依赖宽度的属性 map */
const createContainingBlockWidthDecls = () => {
  const mapArray = containingBlockWidthProps.reduce((prev, cur) => {
    return prev.concat([[cur, null]]);
  }, []);
  return new Map(mapArray);
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

/** 取小数后一位的四舍五入 */
const round = (number, precision) => Math.round(+number + 'e' + precision) / Math.pow(10, precision);

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
}

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


const isBlacklistSelector = (blacklist, selector) => {
  if (typeof selector !== 'string') return;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') return selector.includes(regex);
    return selector.match(regex);
  });
}

/** 选择器上方有根包含块的注释 */
const hasRootContainingBlockComment = (rule) => {
  let prev = rule.prev();
  if (prev == null) return false;
  do {
    if (prev && prev.type === 'comment' && prev.text === rootCBComment) {
      // remove comment
      prev.remove();
      return true;
    }
    else return false;
  } while(prev = prev.prev())
};

/** 选择器前面有非根包含块的注释吗 */
const hasNoneRootContainingBlockComment = (rule) => {
  let prev = rule.prev();
  if (prev == null) return false;
  do {
    if (prev && prev.type === 'comment' && prev.text === notRootCBComment) {
      // remove comment
      prev.remove();
      return true;
    }
    else return false;
  } while(prev = prev.prev())
}

/** 是否有忽略转换的注释？ */
const hasIgnoreComments = (decl, result) => {
  let ignore = false;
  const prev = decl.prev();
  // prev declaration is ignore conversion comment at same line
  if (prev && prev.type === 'comment' && prev.text === ignoreNextComment) {
    // remove comment
    prev.remove();
    ignore = true;
  }
  const next = decl.next();
  // next declaration is ignore conversion comment at same line
  if (next && next.type === 'comment' && next.text === ignorePrevComment) {
    if (/\n/.test(next.raws.before)) {
      result.warn('Unexpected comment /* ' + ignorePrevComment + ' */ must be after declaration at same line.', { node: next });
    } else {
      // remove comment
      next.remove();
      ignore = true;
    }
  }
  return ignore;
};

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
  let mobileVal = '';
  let desktopVal = '';
  let landscapeVal = '';

  let matched = null;
  let lastIndex = 0;
  const reg = matchPercentage ? fixedUnitContentReg : unitContentMatchReg;
  while(matched = reg.exec(val)) {
    const numberStr = matched[2];
    if (numberStr == null) continue;
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
  }
};

module.exports = {
  removeDulplicateDecls,
  mergeRules,
  round,
  createRegArrayChecker,
  createIncludeFunc,
  createExcludeFunc,
  isBlacklistSelector,
  convertPropValue,
  hasIgnoreComments,
  createContainingBlockWidthDecls,
  hasNoneRootContainingBlockComment,
  dynamicZero,
  hasRootContainingBlockComment,
};