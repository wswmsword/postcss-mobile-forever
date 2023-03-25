const isProdMode = process.env.NODE_ENV === "production";

module.exports = {
  plugins: {
    "postcss-mobile-forever": {
      viewportWidth: 750,
      desktopWidth: 600,
      landscapeWidth: 450,
      border: true,
      rootSelector: ".root-class",
      demoMode: true,
      side: {
        selector1: ".footer",
      },
      experimental: {
        extract: isProdMode,
      },
    },
  },
};