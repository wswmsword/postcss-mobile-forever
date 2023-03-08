/** 取小数后一位的四舍五入 */
const round = (number, precision) => Math.round(+number + 'e' + precision) / Math.pow(10, precision);

module.exports = {
  round,
};