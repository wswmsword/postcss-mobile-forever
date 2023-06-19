module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      maxDisplayWidth: 520,
      disableLandscape: true,
      disableDesktop: true,
      rootSelector: "#root",
      side: {
        selector1: ".footer",
      },
    }],
  ],
};