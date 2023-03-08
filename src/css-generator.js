const { marginL, marginR, maxWidth, borderR, borderL, contentBox, minFullHeight, autoHeight, lengthProps } = require("./constants");
const {
  convertPropValue,
  convertFixedMediaQuery,
  convertMobile,
  convertMaxMobile,
} = require("./logic-helper");
const { varTestReg } = require("./regexs");
const {
  percentageToMaxViewUnit,
  vwToMaxViewUnit,
  pxToMaxViewUnit,
  pxToMaxViewUnit_FIXED_LR,
  vwToMaxViewUnit_FIXED_LR,
  percentToMaxViewUnit_FIXED_LR,
} = require("./unit-transfer");

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
          } else {
            return convertMobile(prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit);
          }
        } else {
          if (limitedWidth) {
            if (unit === "px") {
              return pxToMaxViewUnit(number, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop);
            } else if (unit === "vw") {
              return vwToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision);
            } else if (unit === '%') {
              return percentageToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision);
            } else return `${numberStr}${unit}`;
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
    const { mobile, desktop, landscape } = convertPropValue(prop, val, {
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
      if (replace)
        decl.value = mobile;
      else
        decl.after(decl.clone({ value: mobile, book: true, }));
    }
    if (enabledDesktop) {
      if (val !== desktop) {
        desktopViewAtRule.append(postcss.rule({ selector }).append({
          prop: prop, // 属性
          value: desktop, // 替换 px 比例计算后的值
          important, // 值的尾部有 important 则添加
        }));
      }
    }
    if (enabledLandscape) {
      if (val !== landscape) {
        landScapeViewAtRule.append(postcss.rule({ selector }).append({
          prop,
          value: landscape,
          important,
        }));
      }
    }

    let shouldAppendDesktopVar = false;
    let shouldAppendLandscape = false;
    if (enabledDesktop || enabledLandscape) {
      if (lengthProps.includes(prop)) {
        const tested = varTestReg.test(val);
        shouldAppendDesktopVar = tested && val === desktop;
        shouldAppendLandscape = tested && val === landscape;
      }
    }
    appendCSSVar(shouldAppendDesktopVar, shouldAppendLandscape, prop, val, important, selector, postcss, {
      sharedAtRult,
      desktopViewAtRule,
      landScapeViewAtRule,
    });
  }
}

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

module.exports = {
  appendMarginCentreRootClassWithBorder,
  appendMediaRadioPxOrReplaceMobileVwFromPx,
  appendMarginCentreRootClassNoBorder,
  appendDemoContent,
  appendConvertedFixedContainingBlockDecls,
  appendCentreRoot,
  appendCSSVar,
};
