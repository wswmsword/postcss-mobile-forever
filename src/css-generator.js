const { marginL, marginR, maxWidth, shadowBorder, minFullHeight, autoHeight, lengthProps, fixedPos, autoDir, sideL, sideR, top, bottom, width, minWidth, minDFullHeight } = require("./constants");
const { bookObj: b } = require("./utils");
const { convertPropValue, } = require("./logic-helper");
const { varTestReg } = require("./regexs");
const fs = require("fs");
const path = require("path");

function appendDemoContent(postcss, selector, rule, desktopViewAtRule, landScapeViewAtRule, disableDesktop, disableLandscape, disableMobile) {
  if (!disableMobile) {
    rule.append({
      prop: "content",
      value: "'✨Portrait✨'",
    });
  }
  if (!disableDesktop) {
    desktopViewAtRule.append(postcss.rule({ selector }).append({
      prop: "content",
      value: "'✨Desktop✨'",
    }));
  }
  if (!disableLandscape) {
    landScapeViewAtRule.append(postcss.rule({ selector }).append({
      prop: "content",
      value: "'✨Landscape✨'",
    }));
  }
}

function extractFile(cssContent, newFile, targetFileDir) {
  return new Promise(resolve => {
    const newFilePath = path.join(targetFileDir, newFile);
    if (!fs.existsSync(targetFileDir)) {
      fs.mkdirSync(targetFileDir, { recursive: true });
    }
    fs.writeFileSync(newFilePath, cssContent);

    resolve();
  });
}

/** 桌面和横屏添加选择器属性 */
function appendDisplaysRule(enabledDesktop, enabledLandscape, prop, val, important, selector, postcss, {
  sharedAtRule,
  desktopViewAtRule,
  landScapeViewAtRule,
  isShare,
}) {
  if (enabledDesktop && enabledLandscape && isShare) {
    sharedAtRule.append(postcss.rule({ selector }).append({
      prop: prop, // 属性
      value: val,
      important, // 值的尾部有 important 则添加
    }));
  } else {
    if (enabledDesktop) {
      desktopViewAtRule.append(postcss.rule({ selector }).append({
        prop: prop, // 属性
        value: val,
        important, // 值的尾部有 important 则添加
      }));
    }
    if (enabledLandscape) {
      landScapeViewAtRule.append(postcss.rule({ selector }).append({
        prop: prop, // 属性
        value: val,
        important, // 值的尾部有 important 则添加
      }));
    }
  }
}

/** px 值，转换为媒体查询中比例计算的 px，替换为移动端竖屏视口单位 */
function appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRule,
  important,
  decl,
  convertLandscape,
  convertDesktop,
  convertMobile,
  matchPercentage,
  expectedLengthVars = [],
  disableAutoApply = false,
  isLastProp,
  isKeyframesAtRule,
  desktopKeyframesAtRule,
  landscapeKeyframesAtRule,
}) {
  decl.book = true;

  const enabledDesktop = !disableDesktop;
  const enabledLandscape = !disableLandscape;
  const enabledMobile = !disableMobile;

  if (enabledDesktop || enabledLandscape || enabledMobile) {
    const { mobile, desktop, landscape, book: converted } = convertPropValue(prop, val, {
      enabledMobile,
      enabledDesktop,
      enabledLandscape,
      convertMobile,
      convertDesktop,
      convertLandscape,
      matchPercentage,
    });

    if (enabledMobile) {
      decl.value = mobile;
    }
    if (enabledDesktop && converted) {
      const atRule = isKeyframesAtRule ? desktopKeyframesAtRule : desktopViewAtRule;
      atRule.append(postcss.rule({ selector }).append({
        prop: prop, // 属性
        value: desktop, // 替换 px 比例计算后的值
        important, // 值的尾部有 important 则添加
      }));
    }
    if (enabledLandscape && converted) {
      const atRule = isKeyframesAtRule ? landscapeKeyframesAtRule : landScapeViewAtRule;
      atRule.append(postcss.rule({ selector }).append({
        prop,
        value: landscape,
        important,
      }));
    }

    let shouldAppendDesktopVar = false;
    let shouldAppendLandscape = false;
    if (
      (enabledDesktop || enabledLandscape) &&
      // 值没有被转换
      !converted) {
      if (
        (expectedLengthVars.length > 0 && expectedLengthVars.some(varStr => val.includes(varStr))) ||
        (expectedLengthVars.length === 0 && !disableAutoApply && lengthProps.includes(prop) && varTestReg.test(val))) {
        shouldAppendDesktopVar = enabledDesktop;
        shouldAppendLandscape = enabledLandscape;
      }
    }
    appendCSSVar(shouldAppendDesktopVar, shouldAppendLandscape, prop, val, important, selector, postcss, {
      sharedAtRule,
      desktopViewAtRule,
      landScapeViewAtRule,
      isLastProp,
    });
  }
}

/** 由于不能直接检测 css 变量的值，不能获取变量内部是否包含 px 等单位，所以无法转换，因此将 css 变量统一移到共享媒体查询中，防止 css 变量被转换过的低优先级的属性覆盖 */
function appendCSSVar(enabledDesktop, enabledLandscape, prop, val, important, selector, postcss, {
  sharedAtRule,
  desktopViewAtRule,
  landScapeViewAtRule,
  isLastProp,
}) {
  appendDisplaysRule(enabledDesktop, enabledLandscape, prop, val, important, selector, postcss, {
    sharedAtRule,
    desktopViewAtRule,
    landScapeViewAtRule,
    isShare: isLastProp,
  });
}

/** 居中最外层选择器，margin 居中，无 border */
function appendMarginCentreRootClassNoBorder(postcss, selector, disableDesktop, disableLandscape, {
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRule,
  desktopWidth,
  landscapeWidth
}) {
  if (disableDesktop && !disableLandscape) {
    // 仅移动端横屏
    landScapeViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(landscapeWidth), marginL, marginR));
  } else if (disableLandscape && !disableDesktop) {
    // 仅桌面
    desktopViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(desktopWidth), marginL, marginR));
  } else if (!disableDesktop && !disableLandscape) {
    // 桌面和移动端横屏
    desktopViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(desktopWidth)));
    landScapeViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(landscapeWidth)));
    sharedAtRule.append(postcss.rule({ selector }).prepend(marginL, marginR));
  }
}

/** 居中最外层选择器，用 margin 居中，有 border */
function appendMarginCentreRootClassWithBorder(postcss, selector, disableDesktop, disableLandscape, {
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRule,
  dvhAtRule,
  desktopWidth,
  landscapeWidth,
  borderColor,
}) {
  if (!disableDesktop || !disableLandscape) {
    if (dvhAtRule.nodes.length === 0)
      dvhAtRule.append(postcss.rule({ selector }).append(minDFullHeight));
  }
  if (disableDesktop && !disableLandscape) {
    // 仅移动端横屏
    landScapeViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(landscapeWidth), marginL, marginR, shadowBorder(borderColor), minFullHeight, autoHeight));
  } else if (disableLandscape && !disableDesktop) {
    // 仅桌面
    desktopViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(desktopWidth), marginL, marginR, shadowBorder(borderColor), minFullHeight, autoHeight));
  } else if (!disableDesktop && !disableLandscape) {
    // 桌面和移动端横屏
    desktopViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(desktopWidth)));
    landScapeViewAtRule.append(postcss.rule({ selector }).prepend(maxWidth(landscapeWidth)));
    sharedAtRule.append(postcss.rule({ selector }).prepend(marginL, marginR, shadowBorder(borderColor), minFullHeight, autoHeight));
  }
}

function appendRemFontSize(rule, basicViewWidth) {
  rule.prepend(b({
    prop: 'font-size',
    value: `${10000 / basicViewWidth}vw`, // 100 / basicViewWidth * 100
    important: true,
  }))
}

function appendCentreRoot(postcss, selector, disableDesktop, disableLandscape, border, {
  rule,
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRule,
  dvhAtRule,
  desktopWidth,
  landscapeWidth,
  maxWidthMode,
  maxDisplayWidth,
  minDisplayWidth,
}) {
  const hadBorder = !!border;
  const c = typeof border === "string" ? border : "#8888881f";
  const isClamp = minDisplayWidth != null;
  if (maxWidthMode) {
    if (hadBorder) {
      rule.prepend(b(maxWidth(maxDisplayWidth)), b(marginL), b(marginR), b(shadowBorder(c)), b(minFullHeight), b(autoHeight));
      if (dvhAtRule.nodes.length === 0) dvhAtRule.append(postcss.rule({ selector }).append(b(minDFullHeight)));
    }
    else {
      rule.prepend(b(maxWidth(maxDisplayWidth)), b(marginL), b(marginR));
      isClamp && rule.prepend(b(minWidth(minDisplayWidth)));
    }
    rule.processedLimitedCentreWidth = true; // 做标记，防止死循环
  } else {
    if (hadBorder) { 
      appendMarginCentreRootClassWithBorder(postcss, selector, disableDesktop, disableLandscape, {
        desktopViewAtRule,
        landScapeViewAtRule,
        sharedAtRule,
        dvhAtRule,
        desktopWidth,
        landscapeWidth,
        borderColor: c,
      });
    } else {
      appendMarginCentreRootClassNoBorder(postcss, selector, disableDesktop, disableLandscape, {
        desktopViewAtRule,
        landScapeViewAtRule,
        sharedAtRule,
        desktopWidth,
        landscapeWidth,
      });
    }
  }
}

function appendSiders(postcss, siders, desktopWidth, maxLandscapeDisplayHeight) {
  const defaultSideW = 190;
  const side1W = siders[0].width ?? defaultSideW;
  const side2W = siders[1].width ?? defaultSideW;
  const side3W = siders[2].width ?? defaultSideW;
  const side4W = siders[3].width ?? defaultSideW;
  const sideRule1 = siders[0].selector != null ? postcss.rule({ selector: siders[0].selector }).append(fixedPos, top(siders[0].gap), sideL(desktopWidth, siders[0].gap, side1W), autoDir("right"), autoDir("bottom"), width(side1W)) : null;
  const sideRule2 = siders[1].selector != null ? postcss.rule({ selector: siders[1].selector }).append(fixedPos, top(siders[1].gap), autoDir("left"), sideR(desktopWidth, siders[1].gap, side2W), autoDir("bottom"), width(side2W)) : null;
  const sideRule3 = siders[2].selector != null ? postcss.rule({ selector: siders[2].selector }).append(fixedPos, autoDir("top"), autoDir("left"), sideR(desktopWidth, siders[2].gap, side3W), bottom(siders[2].gap), width(side3W)) : null;
  const sideRule4 = siders[3].selector != null ? postcss.rule({ selector: siders[3].selector }).append(fixedPos, autoDir("top"), sideL(desktopWidth, siders[3].gap, side4W), autoDir("right"), bottom(siders[3].gap), width(side4W)) : null;
  const sidersRule = [[siders[0], sideRule1], [siders[1], sideRule2], [siders[2], sideRule3], [siders[3], sideRule4]].filter(s => s[1] != null);
  const atRules = sidersRule.reduce((acc, [side, rule]) => {
    const sideW = side.width ?? defaultSideW
    const atRule = postcss
      .atRule({ name: "media", params: `(min-width: ${desktopWidth + sideW * 2 + side.gap * 2}px) and (min-height: ${maxLandscapeDisplayHeight}px)`, nodes: [] })
      .append(rule);
    return acc.concat(atRule);
  }, []);
  return atRules;
}

module.exports = {
  appendMediaRadioPxOrReplaceMobileVwFromPx,
  appendDemoContent,
  appendCentreRoot,
  appendCSSVar,
  appendSiders,
  appendDisplaysRule,
  extractFile,
  appendRemFontSize,
};
