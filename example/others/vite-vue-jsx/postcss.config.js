import mobileForever from "postcss-mobile-forever";

export default {
  plugins: [
    mobileForever({
      viewportWidth: 750,
      desktopWidth: 600,
      landscapeWidth: 450,
      // maxDisplayWidth: 600,
      // disableLandscape: true,
      // disableDesktop: true,
      border: true,
      rootSelector: "#app",
    }),
    // require("postcss-modules")({
    //   localsConvention: "camelCase",
    //   generateScopedName: process.env.NODE_ENV === "production" ? "[local]_[hash:base64:2]" : "[hash:base64:2]",
    // }),
  ],
};
