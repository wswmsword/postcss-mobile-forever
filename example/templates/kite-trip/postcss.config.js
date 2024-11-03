module.exports = {
  plugins: {
    'postcss-mobile-forever': {
      // 根元素，用于宽屏中令视图居中于屏幕
      appSelector: "body",
      // 设计稿的视口宽度
      viewportWidth: 375,
      // 视图的最大宽度
      maxDisplayWidth: 560,
      // 需要忽略的css选择器
      selectorBlackList: ["favor"],
      // 包含块是根元素的选择器
      rootContainingBlockSelectorList: ["van-tabbar", "van-popup--bottom"],
    }
  },
};
