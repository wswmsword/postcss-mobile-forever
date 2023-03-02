const { marginL, marginR, maxWidth, borderR, borderL, contentBox, minFullHeight, autoHeight } = require("./constants");
const {
  convertPropValue,
  hasIgnoreComments,
  round,
  dynamicZero,
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

/** 转换受 fixed 影响的属性的媒体查询值 */
function appendConvertedFixedContainingBlockDecls(postcss, selector, decl, disableDesktop, disableLandscape, disableMobile, isFixed, {
  viewportWidth,
  desktopRadio,
  landscapeRadio,
  desktopViewAtRule,
  landScapeViewAtRule,
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
      if (limitedWidth) {
        if (isFixed) {
          if (leftOrRight) {
            const maxNRadio = maxDisplayWidth / viewportWidth;
            if (unit === "px") {
              const calc = 50 - round(number * 100 / viewportWidth, unitPrecision);
              const calc2 = round(maxDisplayWidth / 2 - number * maxNRadio, unitPrecision)
              if (number > maxDisplayWidth / 2)
                return `calc(50% - max(${calc2}px, ${calc}vw))`;
              else return `calc(50% - min(${calc2}px, ${calc}vw))`;
            } else if (unit === "vw" || unit === "%") {
              const calc = round(maxDisplayWidth * (50 - number) / 100, unitPrecision);
              const calc2 = 50 - number;
              if (number < 50) return `calc(50${unit} - min(${calc2}${unit}, ${calc}px))`;
              else return `calc(50${unit} - max(${calc2}${unit}, ${calc}px))`;
            } else if (unit === " " || unit === "") {
              if (number === 0)
                return `calc(50% - min(50%, ${maxDisplayWidth / 2}px))`;
              return `${number}${unit}`;
            } else return `${numberStr}${unit}`;
          } else {
            if (unit === "px") {
              const fontProp = prop.includes("font");
              const n = round(number * 100 / viewportWidth, unitPrecision);
              const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
              const maxN = round(number * maxDisplayWidth / viewportWidth, unitPrecision);
              if (number > 0)
                return number === 0 ? `0${unit}` : `min(${n}${mobileUnit}, ${maxN}px)`;
              else return number === 0 ? `0${unit}` : `max(${n}${mobileUnit}, ${maxN}px)`;
            } else if (unit === "vw" || unit === "%") {
              const n = round(maxDisplayWidth / 100 * number, unitPrecision);
              if (number > 0) return `min(${n}px, ${numberStr}${unit})`;
              else return `max(${n}px, ${numberStr}${unit})`;
            } else return `${numberStr}${unit}`;
          }
        } else {
          if (unit === "px") {
            const fontProp = prop.includes("font");
            const n = round(number * 100 / viewportWidth, unitPrecision);
            const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
            const maxN = round(number * maxDisplayWidth / viewportWidth, unitPrecision);
            if (number > 0)
              return number === 0 ? `0${unit}` : `min(${n}${mobileUnit}, ${maxN}px)`;
            else return number === 0 ? `0${unit}` : `max(${n}${mobileUnit}, ${maxN}px)`;
          } else if (unit === "vw") {
            const maxN = round(maxDisplayWidth * number / 100, unitPrecision);
            if (number > 0) return `min(${numberStr}${unit}, ${maxN}px)`;
            else return `max(${numberStr}${unit}, ${maxN}px)`;
          } else return `${number}${unit}`;
        }
      }
      if (unit === "px") {
        const fontProp = prop.includes("font");
        const n = round(number * 100 / viewportWidth, unitPrecision);
        const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
        return number === 0 ? `0${unit}` : `${n}${mobileUnit}`;
      } else
        return `${number}${unit}`
    },
    convertDesktop: (number, unit, numberStr) => {
      // 处理 0
      const dznn = numberStr => number => dynamicZero(number, numberStr);
      const dzn = dznn(numberStr);
      if (isFixed) {
        if (leftOrRight) {
          if (unit === "px") {
            const roundedCalc = round(desktopWidth / 2 - number * desktopRadio, unitPrecision)
            return `calc(50% - ${roundedCalc}px)`;
          } else if (unit === "%" || unit === "vw") {
            const roundedCalc = round(desktopWidth * number / 100, unitPrecision)
            return `calc(50% + ${roundedCalc}px)`;
          } else if (unit === "" || unit === " ") {
            if (number === 0)
              return `calc(50% - ${desktopWidth / 2}px)`;
            return `${number}${unit}`;
          } else
            return `${number}${unit}`;
        } else {
          if (unit === "px") {
            const roundedPx = round(number * desktopRadio, unitPrecision);
            return `${dzn(roundedPx)}px`;
          } else if (unit === '%' || unit === "vw") {
            return `${dzn(round(desktopWidth * number / 100, unitPrecision))}px`;
          } else
            return `${dzn(number)}${unit}`;
        }
      } else {
        if (unit === "vw" || unit === "%")
          return `${dzn(round(desktopWidth * number / 100, unitPrecision))}px`;
        else if (unit === "px") {
          const roundedPx = round(number * desktopRadio, unitPrecision);
          return `${dzn(roundedPx)}px`;
        } else
          return `${dzn(number)}${unit}`;
      }
    },
    convertLandscape: (number, unit, numberStr) => {
      // 处理 0
      const dznn = numberStr => number => dynamicZero(number, numberStr);
      const dzn = dznn(numberStr);
      if (isFixed) {
        if (leftOrRight) {
          if (unit === "px") {
            const roundedCalc = round(landscapeWidth / 2 - number * landscapeRadio, unitPrecision)
            return `calc(50% - ${roundedCalc}px)`;
          } else if (unit === "%" || unit === "vw") {
            const roundedCalc = round(landscapeWidth * number / 100, unitPrecision);
            return `calc(50% + ${roundedCalc}px)`;
          } else if (unit === "" || unit === " ") {
            if (number === 0)
              return `calc(50% - ${landscapeWidth / 2}px)`;
            return `${number}${unit}`;
          } else
            return `${number}${unit}`;
        } else {
          if (unit === "px") {
            const roundedPx = round(number * landscapeRadio, unitPrecision);
            return `${dzn(roundedPx)}px`;
          } else if (unit === '%' || unit === "vw") {
            return `${dzn(round(landscapeWidth / 100 * number, unitPrecision))}px`;
          } else
            return `${dzn(number)}${unit}`;
        }
      } else {
        if (unit === "vw" || unit === "%")
          return `${dzn(round(landscapeWidth / 100 * number, unitPrecision))}px`;
        else if (unit === "px") {
          const roundedPx = round(number * landscapeRadio, unitPrecision);
          return `${dzn(roundedPx)}px`;
        } else
          return `${dzn(number)}${unit}`;
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

  const enabledDesktop = !disableDesktop && !ignore;
  const enabledLandscape = !disableLandscape && !ignore;
  const enabledMobile = !disableMobile && !ignore;

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