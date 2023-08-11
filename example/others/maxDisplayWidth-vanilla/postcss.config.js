module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      enableMediaQuery: true,
      maxDisplayWidth: 520,
      disableLandscape: true,
      disableDesktop: true,
      appSelector: "#root",
      side: {
        selector1: ".footer",
      },
    }],
  ],
};