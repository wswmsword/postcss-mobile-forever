module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      enableMediaQuery: true,
      appSelector: "#root",
      demoMode: true,
      include: [/pages[\\/](mobile|watch)/],
      side: {
        selector1: ".footer",
      }
    }],
  ],
};