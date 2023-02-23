module.exports = {
  width: w => ({
    prop: 'width',
    value: `${w}px`,
  }),
  marginL: {
    prop: 'margin-left',
    value: 'auto',
    important: true,
  },
  marginR: {
    prop: 'margin-right',
    value: 'auto',
    important: true,
  },
  left: {
    prop: 'left',
    value: '0',
    important: true,
  },
  right: {
    prop: 'right',
    value: '0',
    important: true,
  },
  maxWidth: w => ({
    prop: 'max-width',
    value: `${w}px`,
    important: true,
  }),
  minFullHeight: {
    prop: 'min-height',
    value: '100vh',
  },
  autoHeight: {
    prop: 'height',
    value: 'auto',
    important: true,
  },
  borderL: c => ({
    prop: 'border-left',
    value: `1px solid ${c}`,
  }),
  borderR: c => ({
    prop: 'border-right',
    value: `1px solid ${c}`,
  }),
  contentBox: {
    prop: 'box-sizing',
    value: 'content-box',
  },
  demoModeSelector: ".DEMO_MODE::before",
  ignoreNextComment: 'px-to-viewport-ignore-next',
  ignorePrevComment: 'px-to-viewport-ignore',
  notRootCBComment: "not-root-containing-block",
  /** position fixed 时依赖屏幕宽度的属性，https://jameshfisher.com/2019/12/29/what-are-css-percentages/ */
  fixedContainingBlockWidthProp: [
    "left", "right",
    "margin-bottom", "margin-left", "margin-right", "margin-top", "margin",
    "max-width", "min-width",
    "padding-bottom", "padding-left", "padding-right", "padding-top", "padding",
    "shape-margin",
    "text-indent",
    "width"
  ],
}