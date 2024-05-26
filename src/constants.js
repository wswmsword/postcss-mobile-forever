module.exports = {
  PLUGIN_NAME: "postcss-mobile-forever",
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
  minWidth: w => ({
    prop: 'min-width',
    value: `${w}px`,
    important: true,
  }),
  minFullHeight: {
    prop: 'min-height',
    value: '100vh',
  },
  minDFullHeight: {
    prop: 'min-height',
    value: '100dvh',
  },
  autoHeight: {
    prop: 'height',
    value: 'auto',
    important: true,
  },
  shadowBorder: c => ({
    prop: "box-shadow",
    value: `0 0 0 1px ${c}`,
  }),
  fixedPos: {
    prop: "position",
    value: "fixed",
  },
  autoDir: dir => ({
    prop: dir,
    value: "auto",
  }),
  sideL: (vwidth, gap, width) => ({
    prop: "left",
    value: `calc(50% - ${vwidth / 2 + gap + width}px)`,
  }),
  sideR: (vwidth, gap, width) => ({
    prop: "right",
    value: `calc(50% - ${vwidth / 2 + gap + width}px)`
  }),
  top: t => ({
    prop: "top",
    value: `${t}px`,
  }),
  bottom: b => ({
    prop: "bottom",
    value: `${b}px`,
  }),
  gpuLayer: {
    prop: "transform",
    value: "translateZ(0)"
  },
  fullW: {
    prop: "width",
    value: "100%",
    important: true,
  },
  fullH: {
    prop: "height",
    value: "100%",
    important: true,
  },
  fullHVh: {
    prop: "height",
    value: "100vh",
    important: true,
  },
  autoOverflow: {
    prop: "overflow",
    value: "auto",
    important: true,
  },
  demoModeSelector: ".DEMO_MODE::before",
  ignoreNextComment: "mobile-ignore-next",
  ignorePrevComment: "mobile-ignore",
  notRootCBComment: "not-root-containing-block",
  rootCBComment: "root-containing-block",
  applyComment: "apply-without-convert",
  verticalComment: "vertical-writing-mode",
  /** position fixed 时依赖屏幕宽度的属性，https://jameshfisher.com/2019/12/29/what-are-css-percentages/ */
  containingBlockWidthProps: [
    "left", "right",
    "margin", "margin-bottom", "margin-left", "margin-right", "margin-top",
    "max-width", "min-width",
    "padding", "padding-bottom", "padding-left", "padding-right", "padding-top",
    "shape-margin",
    "text-indent",
    "width"
  ],
  /** 涉及到长度的属性 */
  lengthProps: ["word-spacing", "width", "translate", "transform", "transform-origin", "top",
    "text-decoration-thickness", "text-indent", "text-underline-offset",
    "tab-size", "shape-margin", "shape-outside",
    "scroll-margin", "scroll-margin-block", "scroll-margin-block-end", "scroll-margin-block-start", "scroll-margin-bottom",
    "scroll-margin-inline", "scroll-margin-inline-end", "scroll-margin-inline-start", "scroll-margin-left", "scroll-margin-right",
    "scroll-margin-top", "scroll-padding", "scroll-padding-block", "scroll-padding-block-end", "scroll-padding-block-start",
    "scroll-padding-bottom", "scroll-padding-inline", "scroll-padding-inline-end", "scroll-padding-inline-start",
    "scroll-padding-left", "scroll-padding-right", "scroll-padding-top",
    "row-gap", "right", "perspective",
    "padding", "padding-block", "padding-block-end", "padding-block-start", "padding-bottom", "padding-inline",
    "padding-inline-end", "padding-inline-start", "padding-left", "padding-right", "padding-top",
    "overflow-clip-margin", "outline", "outline-offset", "outline-width", "offset", "offset-distance",
    "object-position", "min-block-size", "min-height", "min-inline-size", "min-width",
    "max-block-size", "max-height", "max-inline-size", "max-width", "mask", "mask-border", "mask-border-outset",
    "mask-border-width", "mask-position", "mask-size", "margin", "margin-block", "margin-block-end", "margin-block-start",
    "margin-bottom", "margin-inline", "margin-inline-end", "margin-inline-start", "margin-left", "margin-right", "margin-top",
    "line-height", "letter-spacing", "left", "inset", "inset-block", "inset-block-end", "inset-block-start", "inset-inline",
    "inset-inline-end", "inset-inline-start", "inline-size", "height",
    "grid", "grid-auto-columns", "grid-auto-rows", "grid-template", "grid-template-columns", "grid-template-rows", "gap",
    "font", "font-size", "flex", "flex-basis", "contain-intrinsic-block-size", "contain-intrinsic-height", "contain-intrinsic-inline-size",
    "contain-intrinsic-size", "contain-intrinsic-width", "columns", "column-gap", "column-rule", "column-rule-width", "column-width",
    "clip-path", "box-shadow", "bottom", "border", "border-block", "border-block-end", "border-block-end-width", "border-block-start",
    "border-block-start-width", "border-block-width", "border-bottom", "border-bottom-left-radius", "border-bottom-right-radius",
    "border-bottom-width", "border-end-end-radius", "border-end-start-radius", "border-image-outset", "border-image-width",
    "border-inline", "border-inline-end", "border-inline-end-width", "border-inline-start", "border-inline-start-width",
    "border-inline-width", "border-left", "border-left-width", "border-radius", "border-right", "border-right-width", "border-spacing",
    "border-start-end-radius", "border-start-start-radius", "border-top", "border-top-left-radius", "border-top-right-radius",
    "border-width", "block-size", "background", "background-position", "background-position-x", "background-position-y", "background-size",
    "backdrop-filter",
  ],
  /** 书写模式为横向时，百分比可能取根包含块的逻辑属性 */
  horisontalContainingBlockLogicalProps: ["inline-size", "max-inline-size", "min-inline-size",
    "padding-inline", "padding-inline-end", "padding-inline-start",
    "inset-inline", "inset-inline-end", "inset-inline-start"],
  /** 书写模式为纵向时，百分比可能取根包含块的逻辑属性 */
  verticleContainingBlockLogicalProps: ["block-size", "max-block-size", "min-block-size",
    "padding-block", "padding-block-end", "padding-block-start",
    "inset-block", "inset-block", "inset-block-start"],
}