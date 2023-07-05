module.exports = {
  plugins: [
    require("postcss-mobile-forever")({
      viewportWidth: file => file.includes("node_modules/vant") ? 375 : 750,
      desktopWidth: 600,
      landscapeWidth: 450,
      border: true,
      rootSelector: ".root-class",
      propertyBlackList: {
        ".van-icon": "font"
      },
      rootContainingBlockSelectorList: ["van-tabbar"],
      demoMode: true,
      side: {
        selector1: ".footer",
      }
    }),
  ],
};