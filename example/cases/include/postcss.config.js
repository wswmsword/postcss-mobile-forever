module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      rootSelector: "#root",
      demoMode: true,
      include: /pages\/mobile\//,
      side: {
        selector1: ".footer",
      }
    }],
  ],
};