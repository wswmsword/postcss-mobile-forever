/** 取小数后一位的四舍五入 */
const round = (number, precision) => Math.round(+number + 'e' + precision) / Math.pow(10, precision);

/** book 标记 */
const bookObj = obj => ({ ...obj, book: 1 });

module.exports = {
  round,
  bookObj,
};