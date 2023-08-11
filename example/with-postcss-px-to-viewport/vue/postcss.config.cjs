module.exports = {
  plugins: [
    require("postcss-mobile-forever")({
      viewportWidth: 750,
      desktopWidth: 600,
      landscapeWidth: 450,
      disableMobile: true,
      border: true,
      rootClass: "root-class",
    }),
    require("postcss-px-to-viewport")({
      viewportWidth: 750,
      viewportUnit: "vw",
      mediaQuery: false,
    }),
  ],
};