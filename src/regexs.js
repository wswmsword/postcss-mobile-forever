module.exports = {
  /** 用于验证字符串是否为“数字px”的形式 */
  pxTestReg: /(?<=\d)px/,
  pxVwTestReg: /(?<=\d)(?:px|vw| |$)/,
  /** 用于匹配字符串形如“数字px”的字符串，不可以在 url()、单引号、双引号中
   * 
   * \d+\.\d+|\d+|\.\d+ // 匹配数字
   * 
   * url\((?:\\\(|\\\)|[^()])*\) // 匹配 url(...)
   * 
   * var\((?:\\\(|\\\)|[^()])*\) // 匹配 var(...)
   * 
   * "(?:\\"|[^"])*" // 匹配 "..."
   * 
   * '(?:\\'|[^'])*' // 匹配 '...'
   * 
   * #\d+ // 匹配颜色
   */
  pxMatchReg: /(url\((?:\\\(|\\\)|[^()])*\)|"(?:\\"|[^"])*"|'(?:\\'|[^'])*')|((?:\d+\.\d+|\d+|\.\d+)px)/g,
  unitContentMatchReg: /((?:url|var)\((?:\\\(|\\\)|[^()])*\)|"(?:\\"|[^"])*"|'(?:\\'|[^'])*')|(?:#\d+)|(-?(?:\d+\.\d+|\d+|\.\d+))(px|vw| |$)/g,
  fixedUnitContentReg: /((?:url|var)\((?:\\\(|\\\)|[^()])*\)|"(?:\\"|[^"])*"|'(?:\\'|[^'])*')|(?:#\d+)|(-?(?:\d+\.\d+|\d+|\.\d+))(px|vw|%| |$)/g,
  varTestReg: /var\((?:\\\(|\\\)|[^()])*\)/,
}  