const { width, marginL, marginR, left, right, maxWidth, borderR, borderL, contentBox, minFullHeight, autoHeight } = require("./constants");
const {
  convertPropValue,
  hasIgnoreComments,
  round,
} = require("./logic-helper");

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

/** 转换受 fixed 影响的属性的媒体查询值 */
function appendConvertedFixedContainingBlockDecls(postcss, selector, decl, disableDesktop, disableLandscape, disableMobile, isFixed, {
  viewportWidth,
  desktopRadio,
  landscapeRadio,
  desktopViewAtRule,
  landScapeViewAtRule,
  unitPrecision,
  satisfiedPropList,
  fontViewportUnit,
  blackListedSelector,
  replace,
  result,
  viewportUnit,
  desktopWidth,
  landscapeWidth
}) {
  const prop = decl.prop;
  const val = decl.value;
  const important = decl.important;
  const leftOrRight = prop === "left" || prop === "right";
  appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
    viewportWidth,
    desktopRadio,
    landscapeRadio,
    desktopViewAtRule,
    landScapeViewAtRule,
    important,
    decl,
    unitPrecision,
    satisfiedPropList,
    fontViewportUnit,
    blackListedSelector,
    replace,
    result,
    viewportUnit,
    desktopWidth,
    landscapeWidth,
    matchPercentage: isFixed,
    convertMobile: (number, unit) => {
      if (unit === "px") {
        const fontProp = prop.includes("font");
        const n = round(number * 100 / viewportWidth, unitPrecision)
        const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
        return number === 0 ? `0${unit}` : `${n}${mobileUnit}`;
      } else
        return `${number}${unit}`
    },
    convertDesktop: (number, unit) => {
      if (isFixed) {
        if (leftOrRight) {
          if (unit === "%" || unit === "vw" || unit === "px") {
            const roundedCalc = round(desktopWidth / 2 - number * desktopRadio, unitPrecision)
            return `calc(50% - ${roundedCalc}px)`;
          } else
            return `${number}${unit}`;
        } else
          return `${round(desktopWidth / 100 * number, unitPrecision)}px`;
      } else {
        if (unit === "vw" || unit === "%")
          return `${round(desktopWidth / 100 * number, unitPrecision)}px`;
        else if (unit === "px") {
          const roundedPx = round(number * desktopRadio, unitPrecision);
          return number === 0 ? `0${unit}` : `${roundedPx}px`;
        } else
          return `${number}${unit}`;
      }
    },
    convertLandscape: (number, unit) => {
      if (isFixed) {
        if (leftOrRight) {
          if (unit === "%" || unit === "vw" || unit === "px") {
            const roundedCalc = round(landscapeWidth / 2 - number * landscapeRadio, unitPrecision)
            return `calc(50% - ${roundedCalc}px)`;
          } else
            return `${number}${unit}`;
        } else
          return `${round(landscapeWidth / 100 * number, unitPrecision)}px`;
      } else {
        if (unit === "vw" || unit === "%")
          return `${round(landscapeWidth / 100 * number, unitPrecision)}px`;
        else if (unit === "px") {
          const roundedPx = round(number * landscapeRadio, unitPrecision);
          return number === 0 ? `0${unit}` : `${roundedPx}px`;
        } else
          return `${number}${unit}`;
      }
    },
  });
}

/** px 值，转换为媒体查询中比例计算的 px，替换为移动端竖屏视口单位 */
function appendMediaRadioPxOrReplaceMobileVwFromPx(postcss, selector, prop, val, disableDesktop, disableLandscape, disableMobile, {
  desktopViewAtRule,
  landScapeViewAtRule,
  important,
  decl,
  satisfiedPropList,
  blackListedSelector,
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
  const ignore = hasIgnoreComments(decl, result);

  const enabledDesktop = !disableDesktop && satisfiedPropList && !blackListedSelector && !ignore;
  const enabledLandscape = !disableLandscape && satisfiedPropList && !blackListedSelector && !ignore;
  const enabledMobile = !disableMobile && satisfiedPropList && !blackListedSelector && !ignore;

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


module.exports = {
  appendMarginCentreRootClassWithBorder,
  appendMediaRadioPxOrReplaceMobileVwFromPx,
  appendMarginCentreRootClassNoBorder,
  appendDemoContent,
  appendConvertedFixedContainingBlockDecls,
};

/** fixed 的百分百宽度转换为居中的固定宽度（预期的桌面端和移动端横屏宽度） */
// const appendFixedFullWidthCentre = (postcss) => {
//   let widthCentreRule = null;
//   return (selector, disableDesktop, disableLandscape, {
//     desktopWidth,
//     landscapeWidth,
//     desktopViewAtRule,
//     landScapeViewAtRule,
//     sharedAtRult,
//   }) => {
//     if (!disableDesktop && !disableLandscape) {
//       // 桌面端和移动端横屏
//       desktopViewAtRule.append(postcss.rule({ selector }).append(width(desktopWidth)));
//       landScapeViewAtRule.append(postcss.rule({ selector }).append(width(landscapeWidth)));
//       if (widthCentreRule == null) {
//         widthCentreRule = postcss.rule({ selector });
//         sharedAtRult.append(widthCentreRule.append(marginL, marginR, left, right));
//       } else {
//         widthCentreRule.selector += ', ' + selector;
//       }
//     } else if (disableDesktop && !disableLandscape) {
//       // 仅移动端横屏
//       if (widthCentreRule == null) {
//         widthCentreRule = postcss.rule({ selector });
//         landScapeViewAtRule.append(widthCentreRule.append(width(landscapeWidth), marginL, marginR, left, right));
//       } else
//         widthCentreRule.selector += ', ' + selector;
//     } else if (disableLandscape && !disableDesktop) {
//       // 仅桌面端
//       if (widthCentreRule == null) {
//         widthCentreRule = postcss.rule({ selector });
//         desktopViewAtRule.append(widthCentreRule.append(width(desktopWidth), marginL, marginR, left, right));
//       } else
//         widthCentreRule.selector += ', ' + selector;
//     }
//   }
// };

/** 100vw 转换为固定宽度（预期的桌面端和移动端横屏宽度） */
// function appendStaticWidthFromFullVwWidth(postcss, selector, disableDesktop, disableLandscape, {
//   desktopWidth,
//   landscapeWidth,
//   desktopViewAtRule,
//   landScapeViewAtRule,
// }) {
//   if (!disableDesktop) {
//     desktopViewAtRule.append(postcss.rule({ selector }).append(width(desktopWidth)));
//   }
//   if (!disableLandscape) {
//     landScapeViewAtRule.append(postcss.rule({ selector }).append(width(landscapeWidth)));
//   }
// }