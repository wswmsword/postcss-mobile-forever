const path = require('path');

const judgeComponent = (file) => {
  const ignore = ['vant', '@nutui', '@varlet'];
  return ignore.some((item) => path.join(file).includes(path.join('node_modules', item)));
};

module.exports = {
  plugins: {
    autoprefixer: { overrideBrowserslist: ['Android 4.1', 'iOS 7.1', 'Chrome > 31', 'ff > 31', 'ie >= 8'] },
    'postcss-mobile-forever': {
      viewportWidth: file => /node_modules[\\/](?:vant|@nutui|quarkd)/.test(file) ? 375 : 750, // UI设计稿的宽度
      maxDisplayWidth: 600,
      border: true,
      rootContainingBlockSelectorList: [".nut-tabbar"],
    },
  },
};
