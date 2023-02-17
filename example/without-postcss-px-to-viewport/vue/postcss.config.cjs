module.exports = {
  plugins: [
    require("postcss-mobile-to-multi-displays")({
      viewportWidth: 750,
      desktopWidth: 600,
      landscapeWidth: 450,
      border: true,
      rootClass: "root-class",
      enableMobile: true,
    }),
  ],
};