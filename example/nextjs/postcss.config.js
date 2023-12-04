module.exports = {
  "plugins": [
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        "autoprefixer": {
          "flexbox": "no-2009"
        },
        "stage": 3,
        "features": {
          "custom-properties": false
        }
      }
    ],
    [
      "postcss-mobile-forever",
      {
        "viewportWidth": 750,
        "maxDisplayWidth": 520,
        "appSelector": ".appInnerRoot",
      }
    ]
  ]
}