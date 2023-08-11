module.exports = {
  plugins: [
    require("postcss-mobile-forever")({
      viewportWidth: 750,
      enableMediaQuery: true,
      desktopWidth: 600,
      landscapeWidth: 450,
      border: true,
      appSelector: ".app-inner-root",
      demoMode: true,
      side: {
        selector1: ".footer",
      }
    }),
  ],
};