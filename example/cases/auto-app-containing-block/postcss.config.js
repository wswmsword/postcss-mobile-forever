module.exports = {
  plugins: [
    ["postcss-mobile-forever", {
      viewportWidth: 750,
      maxDisplayWidth: 600,
      appSelector: "#app-containing-block",
      appContainingBlock: "auto",
      necessarySelectorWhenAuto: ".root-class",
    }],
  ],
};