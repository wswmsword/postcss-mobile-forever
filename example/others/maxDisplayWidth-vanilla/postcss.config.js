module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      maxDisplayWidth: 520,
      appSelector: "#root",
      side: {
        selector1: ".footer",
      },
    }],
  ],
};