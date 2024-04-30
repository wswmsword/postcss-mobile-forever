module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      maxDisplayWidth: 520,
      appSelector: "#root",
      border: true,
      side: {
        selector1: ".footer",
      },
    }],
  ],
};