module.exports = {
  plugins: [
    require("postcss-mobile-forever")({
      viewportWidth: 750,
      enableMediaQuery: true,
      desktopWidth: 600,
      landscapeWidth: 450,
      disableMobile: true,
      border: true,
      appSelector: ".root-class",
    }),
    require("postcss-px-to-viewport")({
      viewportWidth: 750,
      viewportUnit: "vw",
      mediaQuery: false,
    }),
  ],
};