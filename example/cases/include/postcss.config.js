module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      enableMediaQuery: true,
      appSelector: "#root",
      demoMode: true,
      include: [/pages/],
      exclude: [/pages\/desktop/, /pages\/headset/],
      side: {
        selector1: ".footer",
      }
    }],
  ],
};