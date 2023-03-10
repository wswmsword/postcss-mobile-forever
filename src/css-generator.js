const { marginL, marginR, maxWidth, borderR, borderL, contentBox, minFullHeight, autoHeight, lengthProps, fixedPos, autoDir, sideL, sideR, top, bottom, width } = require("./constants");
const {
  convertPropValue,
  convertFixedMediaQuery,
  convertMobile,
  convertMaxMobile,
  convertMaxMobile_FIXED,
  convertMaxMobile_FIXED_LR,
} = require("./logic-helper");
const { varTestReg } = require("./regexs");

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

/** 转换受 fixed 影响的属性的媒体查询值 */
function appendConvertedFixedContainingBlockDecls(postcss, selector, decl, disableDesktop, disableLandscape, disableMobile, isFixed, {
  viewportWidth,
  desktopRadio,
  landscapeRadio,
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRult,
  unitPrecision,
  fontViewportUnit,
  replace,
  result,
  viewportUnit,
  desktopWidth,
  landscapeWidth,
  maxDisplayWidth,
}) {
  const prop = decl.prop;
  const val = decl.value;
  const important = decl.important;
  const leftOrRight = prop === "left" || prop === "right";
  const limitedWidth = maxDisplayWidth != null;
  appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
    viewportWidth,
    desktopRadio,
    landscapeRadio,
    desktopViewAtRule,
    landScapeViewAtRule,
    sharedAtRult,
    important,
    decl,
    unitPrecision,
    fontViewportUnit,
    replace,
    result,
    viewportUnit,
    desktopWidth,
    landscapeWidth,
    matchPercentage: isFixed,
    convertMobile: (number, unit, numberStr) => {
      if (isFixed) {
        if (leftOrRight) {
          if (limitedWidth) {
            return convertMaxMobile_FIXED_LR(number, unit, maxDisplayWidth, viewportWidth, unitPrecision, numberStr);
          } else {
            return convertMobile(prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit);
          }
        } else {
          if (limitedWidth) {
            return convertMaxMobile_FIXED(number, unit, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop, numberStr);
          } else {
            return convertMobile(prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit);
          }
        }
      } else {
        if (limitedWidth) {
          return convertMaxMobile(number, unit, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop, numberStr);
        } else {
          return convertMobile(prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit);
        }
      }
    },
    convertDesktop: (number, unit, numberStr) => convertFixedMediaQuery(number, desktopWidth, viewportWidth, unitPrecision, unit, numberStr, isFixed, leftOrRight),
    convertLandscape: (number, unit, numberStr) => convertFixedMediaQuery(number, landscapeWidth, viewportWidth, unitPrecision, unit, numberStr, isFixed, leftOrRight),
  });
}

/** px 值，转换为媒体查询中比例计算的 px，替换为移动端竖屏视口单位 */
function appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRult,
  important,
  decl,
  replace,
  result,
  convertLandscape,
  convertDesktop,
  convertMobile,
  desktopWidth,
  landscapeWidth,
  unitPrecision,
  matchPercentage,
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
      desktopWidth,
      landscapeWidth,
      unitPrecision,
      matchPercentage,
    });

    if (enabledMobile) {
      if (replace) decl.value = mobile;
      else decl.after(decl.clone({ value: mobile, book: true, }));
    }
    if (enabledDesktop && converted) {
      desktopViewAtRule.append(postcss.rule({ selector }).append({
        prop: prop, // 属性
        value: desktop, // 替换 px 比例计算后的值
        important, // 值的尾部有 important 则添加
      }));
    }
    if (enabledLandscape && converted) {
      landScapeViewAtRule.append(postcss.rule({ selector }).append({
        prop,
        value: landscape,
        important,
      }));
    }

    let shouldAppendDesktopVar = false;
    let shouldAppendLandscape = false;
    if (enabledDesktop || enabledLandscape) {
      if (lengthProps.includes(prop)) {
        const tested = varTestReg.test(val);
        shouldAppendDesktopVar = tested && !converted;
        shouldAppendLandscape = tested && !converted;
      }
    }
    appendCSSVar(shouldAppendDesktopVar, shouldAppendLandscape, prop, val, important, selector, postcss, {
      sharedAtRult,
      desktopViewAtRule,
      landScapeViewAtRule,
    });
  }
}

/** 由于不能直接检测 css 变量的值，不能获取变量内部是否包含 px 等单位，所以无法转换，因此将 css 变量统一移到共享媒体查询中，防止 css 变量被转换过的低优先级的属性覆盖 */
function appendCSSVar(enabledDesktop, enabledLandscape, prop, val, important, selector, postcss, {
  sharedAtRult,
  desktopViewAtRule,
  landScapeViewAtRule,
}) {
  if (enabledDesktop && enabledLandscape) {
    sharedAtRult.append(postcss.rule({ selector }).append({
      prop: prop, // 属性
      value: val,
      important, // 值的尾部有 important 则添加
    }));
  } else if (enabledDesktop) {
    desktopViewAtRule.append(postcss.rule({ selector }).append({
      prop: prop, // 属性
      value: val,
      important, // 值的尾部有 important 则添加
    }));
  } else if (enabledLandscape) {
    landScapeViewAtRule.append(postcss.rule({ selector }).append({
      prop: prop, // 属性
      value: val,
      important, // 值的尾部有 important 则添加
    }));
  }
}

/** 居中最外层选择器，margin 居中，无 border */
function appendMarginCentreRootClassNoBorder(postcss, selector, disableDesktop, disableLandscape, {
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

/** 居中最外层选择器，用 margin 居中，有 border */
function appendMarginCentreRootClassWithBorder(postcss, selector, disableDesktop, disableLandscape, {
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

function appendCentreRoot(postcss, selector, disableDesktop, disableLandscape, border, {
  rule,
  desktopViewAtRule,
  landScapeViewAtRule,
  sharedAtRult,
  desktopWidth,
  landscapeWidth,
  maxDisplayWidth,
}) {
  const hadBorder = !!border;
  const c = typeof border === "string" ? border : "#eee";
  const limitedWidth = maxDisplayWidth != null;
  if (limitedWidth) {
    if (hadBorder) rule.append(b(maxWidth(maxDisplayWidth)), b(marginL), b(marginR));
    else rule.append(b(maxWidth(maxDisplayWidth)), b(marginL), b(marginR), b(borderL(c)), b(borderR(c)), b(minFullHeight), b(autoHeight), b(contentBox));
    function b(obj) {
      return { ...obj, book: 1, };
    }
  }
  if (hadBorder) {
    appendMarginCentreRootClassWithBorder(postcss, selector, disableDesktop, disableLandscape, {
      desktopViewAtRule,
      landScapeViewAtRule,
      sharedAtRult,
      desktopWidth,
      landscapeWidth,
      borderColor: c,
    });
  } else {
    appendMarginCentreRootClassNoBorder(postcss, selector, disableDesktop, disableLandscape, {
      desktopViewAtRule,
      landScapeViewAtRule,
      sharedAtRult,
      desktopWidth,
      landscapeWidth,
    });
  }
}

function appendSider(postcss, atRule, w, gap, hadSide1, hadSide2, hadSide3, hadSide4, vw, selector1, selector2, selector3, selector4) {
  const sideRule1 = hadSide1 ? postcss.rule({ selector: selector1 }).append(fixedPos, top(gap), sideL(vw, gap, w), autoDir("right"), autoDir("bottom"), width(w)) : null;
  const sideRule2 = hadSide2 ? postcss.rule({ selector: selector2 }).append(fixedPos, top(gap), autoDir("left"), sideR(vw, gap, vw), autoDir("bottom"), width(w)) : null;
  const sideRule3 = hadSide3 ? postcss.rule({ selector: selector3 }).append(fixedPos, autoDir("top"), autoDir("left"), sideR(vw, gap, vw), bottom(gap), width(w)) : null;
  const sideRule4 = hadSide4 ? postcss.rule({ selector: selector4 }).append(fixedPos, autoDir("top"), sideL(vw, gap, w), autoDir("right"), bottom(gap), width(w)) : null;
  const rules = [sideRule1, sideRule2, sideRule3, sideRule4].filter(r => r != null);
  rules.forEach(R => atRule.append(R));
}

module.exports = {
  appendMarginCentreRootClassWithBorder,
  appendMediaRadioPxOrReplaceMobileVwFromPx,
  appendMarginCentreRootClassNoBorder,
  appendDemoContent,
  appendConvertedFixedContainingBlockDecls,
  appendCentreRoot,
  appendCSSVar,
  appendSider,
};
