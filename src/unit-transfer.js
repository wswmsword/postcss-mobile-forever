const {
  round,
} = require("./utils");

/** 限制百分比的最大宽度 */
function percentageToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision) {
  if (number === 0) return "0%";
  const maxN = round(maxDisplayWidth * number / 100, unitPrecision);
  if (number > 0) return `min(${numberStr}%, ${maxN}px)`;
  else return `max(${numberStr}%, ${maxN}px)`;
}

/** fixed 定位的百分比尺寸向 rem 转换 */
function percentageToRemUnit(number, viewportWidth, unitPrecision) {
  if (number === 0) return "0%";
  return `${round(viewportWidth * number / 10000, unitPrecision)}rem`;
}

/** 限制百分比的最大最小宽度 */
function percentageToClampLength(number, maxDisplayWidth, minDisplayWidth, numberStr, unitPrecision) {
  if (number === 0) return "0%";
  const maxN = round(maxDisplayWidth * number / 100, unitPrecision);
  const minN = round(minDisplayWidth * number / 100, unitPrecision);
  return `clamp(${minN}px, ${numberStr}%, ${maxN}px)`
}

/** vw 限制最大宽度 */
function vwToMaxViewUnit(number, maxDisplayWidth, numberStr, unitPrecision) {
  if (number === 0) return "0vw";
  const maxN = round(maxDisplayWidth * number / 100, unitPrecision);
  if (number > 0) return `min(${numberStr}vw, ${maxN}px)`;
  else return `max(${numberStr}vw, ${maxN}px)`;
}

/** vw 向 rem 转换 */
function vwToRemUnit(number, viewportWidth, unitPrecision) {
  if (number === 0) return "0vw";
  return `${round(viewportWidth * number / 10000, unitPrecision)}rem`
}

/** vw 限制最大最小宽度 */
function vwToClampLength(number, maxDisplayWidth, minDisplayWidth, numberStr, unitPrecision) {
  if (number === 0) return "0vw";
  const maxN = round(maxDisplayWidth * number / 100, unitPrecision);
  const minN = round(minDisplayWidth * number / 100, unitPrecision);
  return `clamp(${minN}px, ${numberStr}vw, ${maxN}px)`
}

/** px 转为视口单位（限制最大宽度） */
function pxToMaxViewUnit(number, maxDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop) {
  if (number === 0) return `0px`;
  const fontProp = prop.includes("font");
  const n = round(number * 100 / viewportWidth, unitPrecision);
  const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
  const maxN = round(number * maxDisplayWidth / viewportWidth, unitPrecision);
  if (number > 0) return `min(${n}${mobileUnit}, ${maxN}px)`;
  else return `max(${n}${mobileUnit}, ${maxN}px)`;
}

/** px 转为视口单位（限制最大最小宽度） */
function pxToClampLength(number, maxDisplayWidth, minDisplayWidth, viewportWidth, unitPrecision, viewportUnit, fontViewportUnit, prop) {
  if (number === 0) return "0px";
  const fontProp = prop.includes("font");
  const n = round(number * 100 / viewportWidth, unitPrecision);
  const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
  const maxN = round(number * maxDisplayWidth / viewportWidth, unitPrecision);
  const minN = round(number * minDisplayWidth / viewportWidth, unitPrecision);
  return `clamp(${minN}px, ${n}${mobileUnit}, ${maxN}px)`
}

/** px 转为视口单位 */
function pxToViewUnit(prop, number, unit, viewportWidth, unitPrecision, fontViewportUnit, viewportUnit) {
  if (number === 0) return `0${unit}`;
  const fontProp = prop.includes("font");
  const n = round(number * 100 / viewportWidth, unitPrecision);
  const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
  return `${n}${mobileUnit}`;
}

/** px 转为 rem */
function pxToRemUnit(number, unitPrecision, viewportUnit, fontViewportUnit, prop, basicRemRatio) {
  if (number === 0) return `0px`;
  const fontProp = prop.includes("font");
  const n = round(number * basicRemRatio / 100, unitPrecision);
  const mobileUnit = fontProp ? fontViewportUnit : viewportUnit;
  return `${n}${mobileUnit}`
}

/** 以根元素为包含块的 left、right 属性的 px 值转换 */
function pxToMaxViewUnit_FIXED_LR(number, maxDisplayWidth, viewportWidth, unitPrecision) {
  const maxNRadio = maxDisplayWidth / viewportWidth;
  const calc = round(50 - number * 100 / viewportWidth, unitPrecision);
  const calc2 = round(maxDisplayWidth / 2 - number * maxNRadio, unitPrecision)
  if (number > viewportWidth / 2)
    return `calc(50% - max(${calc2}px, ${calc}%))`;
  else return `calc(50% - min(${calc2}px, ${calc}%))`;
}

function pxToRemUnit_FIXED_LR(number, viewportWidth, unitPrecision, basicRemRatio) {
  const n = round((viewportWidth / 2 - number * basicRemRatio) / 100, unitPrecision);
  return `calc(50% - ${n}rem)`;
}

/** 以根元素为包含块的 left、right 属性的 vw 值转换 */
function vwToMaxViewUnit_FIXED_LR(number, maxDisplayWidth, unitPrecision) {
  const calc = round(maxDisplayWidth * (50 - number) / 100, unitPrecision);
  const calc2 = round(50 - number, unitPrecision);
  if (number < 50) return `calc(50vw - min(${calc2}vw, ${calc}px))`;
  else return `calc(50vw - max(${calc2}vw, ${calc}px))`;
}

/** 以根元素为包含块的 left、right 属性的百分比 % 值转换 */
function percentToMaxViewUnit_FIXED_LR(number, maxDisplayWidth, unitPrecision) {
  const calc = round(maxDisplayWidth * (50 - number) / 100, unitPrecision);
  const calc2 = round(50 - number, unitPrecision);
  if (number < 50) return `calc(50% - min(${calc2}%, ${calc}px))`;
  else return `calc(50% - max(${calc2}%, ${calc}px))`;
}

function vwToRemUnit_FIXED_LR(number, viewportWidth, unitPrecision) {
  const n = round(number * viewportWidth / 10000, unitPrecision)
  return `calc(50vw - ${n}rem)`;
}

function percentageToRemUnit_FIXED_LR(number, viewportWidth, unitPrecision) {
  const n = round(number * viewportWidth / 10000, unitPrecision)
  return `calc(50% - ${n}rem)`;
}

/** px 转为媒体查询中的 px */
function pxToMediaQueryPx(number, viewportWidth, idealWidth, unitPrecision, numberStr) {
  const radio = idealWidth / viewportWidth;
  const n = round(number * radio, unitPrecision);
  return `${n}px`;
}

/** 以根元素为包含块的 left、right 属性的 px 值转换 */
function pxToMediaQueryPx_FIXED_LR(number, viewportWidth, idealWidth, unitPrecision) {
  const radio = idealWidth / viewportWidth;
  const roundedCalc = round(idealWidth / 2 - number * radio, unitPrecision);
  return `calc(50% - ${roundedCalc}px)`;
}

/** 以根元素为包含块的 left、right 属性的 vw 值转换 */
function vwToMediaQueryPx_FIXED_LR(number, idealWidth, precision) {
  const roundedCalc = round(idealWidth / 2 - idealWidth * number / 100, precision);
  return `calc(50% - ${roundedCalc}px)`;
}

/** 以根元素为包含块的 left、right 属性的百分比 % 值转换 */
function percentToMediaQueryPx_FIXED_LR(number, idealWidth, precision) {
  const roundedCalc = round(idealWidth / 2 - idealWidth * number / 100, precision);
  return `calc(50% - ${roundedCalc}px)`;
}

/** 无单位的 0，以根元素为包含块，left、right 属性的转换 */
function noUnitZeroToMediaQueryPx_FIXED_LR(idealWidth) {
  return `calc(50% - ${idealWidth / 2}px)`;
}

/** vw 转为媒体查询中的 px */
function vwToMediaQueryPx(number, idealWidth, precision, numberStr) {
  return `${round(idealWidth / 100 * number, precision)}px`;
}

/** 百分比 % 转为媒体查询中的 px，包含块为根元素 */
function percentToMediaQueryPx_FIXED(number, idealWidth, precision, numberStr) {
  return `${round(idealWidth / 100 * number, precision)}px`;
}


/** px 转为媒体查询中的 px，不带单位 */
function pxToMediaQueryPx_noUnit(number, viewportWidth, idealWidth, unitPrecision, numberStr) {
  const radio = idealWidth / viewportWidth;
  const n = round(number * radio, unitPrecision);
  return n;
}

/** vw 转为媒体查询中的 px，不带单位 */
function vwToMediaQueryPx_noUnit(number, idealWidth, precision, numberStr) {
  return round(idealWidth / 100 * number, precision);
}

/** 百分比 % 转为媒体查询中的 px，包含块为根元素，不带单位 */
function percentToMediaQueryPx_FIXED_noUnit(number, idealWidth, precision, numberStr) {
  return round(idealWidth / 100 * number, precision);
}

module.exports = {
  percentageToMaxViewUnit,
  vwToMaxViewUnit,
  pxToMaxViewUnit,
  pxToViewUnit,
  pxToMaxViewUnit_FIXED_LR,
  vwToMaxViewUnit_FIXED_LR,
  percentToMaxViewUnit_FIXED_LR,
  pxToMediaQueryPx,
  pxToMediaQueryPx_FIXED_LR,
  vwToMediaQueryPx_FIXED_LR,
  percentToMediaQueryPx_FIXED_LR,
  noUnitZeroToMediaQueryPx_FIXED_LR,
  vwToMediaQueryPx,
  percentToMediaQueryPx_FIXED,
  pxToMediaQueryPx_noUnit,
  vwToMediaQueryPx_noUnit,
  percentToMediaQueryPx_FIXED_noUnit,
  percentageToClampLength,
  vwToClampLength,
  pxToClampLength,
  percentageToRemUnit,
  vwToRemUnit,
  pxToRemUnit,
  pxToRemUnit_FIXED_LR,
  vwToRemUnit_FIXED_LR,
  percentageToRemUnit_FIXED_LR,
};