module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      rootSelector: "#root",
      demoMode: true,
      side: {
        selector1: ".footer",
      }
    }],
  ],
};