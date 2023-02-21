const { pxMatchReg } = require("./regexs");
const { ignorePrevComment, ignoreNextComment } = require("./constants");

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


const blacklistedSelector = (blacklist, selector) => {
  if (typeof selector !== 'string') return;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') return selector.includes(regex);
    return selector.match(regex);
  });
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
  if (next && next.type === 'comment') {
  }
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

const convertPropValue = (prop, val, {
  enabledMobile,
  enabledDesktop,
  enabledLandscape,
  viewportUnit, fontViewportUnit, pass1px, unitPrecision,
  convertMobile,
  convertDesktop,
  convertLandscape,
}) => {
  let mobileVal = '';
  let desktopVal = '';
  let landscapeVal = '';

  let mached = null;
  let lastIndex = 0;
  const fontProp = prop.includes("font");
  while(mached = pxMatchReg.exec(val)) {
    const pxContent = mached[2];
    if (pxContent == null || pxContent === "0px") continue;
    const beforePxContent = mached[1] || '';
    const chunk = val.slice(lastIndex, mached.index + beforePxContent.length); // 当前匹配和上一次匹配之间的字符串
    const pxNum = Number(pxContent.slice(0, -2)); // 数字
    const pxUnit = pxContent.slice(-2); // 单位
    const is1px = pass1px && pxNum === 1;
    const mobileUnit = is1px ? pxUnit : fontProp ? fontViewportUnit : viewportUnit;

    if (convertMobile && enabledMobile)
      mobileVal = mobileVal.concat(chunk, is1px ? 1 : round(convertMobile(pxNum), unitPrecision), mobileUnit);
    if (convertDesktop && enabledDesktop)
      desktopVal = desktopVal.concat(chunk, is1px ? 1 : round(convertDesktop(pxNum), unitPrecision), "px");
    if (convertLandscape && enabledLandscape)
      landscapeVal = landscapeVal.concat(chunk, is1px ? 1 : round(convertLandscape(pxNum), unitPrecision), "px");

    lastIndex = pxMatchReg.lastIndex;
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
  blacklistedSelector,
  convertPropValue,
  hasIgnoreComments,
};