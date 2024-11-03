// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-mobile-forever': {
      viewportWidth: 375,
      maxDisplayWidth: 480,
      rootSelector: '#app',
      rootContainingBlockSelectorList: ['van-tabbar', 'van-popup--bottom'],
      customLengthProperty: {
        rootContainingBlockList_LR: ['--placeholder', '--van-back-top-right'],
      },
    },
  },
};
