module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      maxDisplayWidth: 600,
      appSelector: "#root",
      appContainingBlock: "auto",
      necessarySelectorWhenAuto: "body",
    }],
  ],
};