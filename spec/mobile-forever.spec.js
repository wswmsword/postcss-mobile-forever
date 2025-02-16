// To run tests, run these commands from the project root:
// 1. `npm install`
// 2. `npm test`

/* global describe, it, expect */

var postcss = require("postcss");
var mobileToMultiDisplays = require("..");

describe("mobile-forever", function() {

  it("should work on the readme example", function() {
    var input = "#app { width: 100%; } .nav { position: fixed; width: 100%; height: 72px; left: 0; top: 0; }";
    var output = "#app { max-width: 560px !important; margin-left: auto !important; margin-right: auto !important; width: 100%; } .nav { position: fixed; width: min(100%, 560px); height: min(9.6vw, 53.76px); left: calc(50% - min(50%, 280px)); top: 0; }";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 560 })).process(input).css;
    expect(processed).toBe(output);

    var processed = postcss(mobileToMultiDisplays({
      appSelector: "#app",
      enableMediaQuery: true,
    })).process(input).css;
    var output2 = "#app { width: 100%; } .nav { position: fixed; width: 100%; height: 9.6vw; left: 0; top: 0; } @media (min-width: 600px) and (min-height: 640px) { #app { max-width: 600px !important; } .nav { height: 57.6px; top: 0; left: calc(50% - 300px); width: 600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { #app { max-width: 425px !important; } .nav { height: 40.8px; top: 0; left: calc(50% - 212.5px); width: 425px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { #app { margin-left: auto !important; margin-right: auto !important; } }";
    expect(processed).toBe(output2);

    var processed = postcss(mobileToMultiDisplays({
      appSelector: "#app",
    })).process(input).css;
    var output3 = "#app { width: 100%; } .nav { position: fixed; width: 100%; height: 9.6vw; left: 0; top: 0; }";
    expect(processed).toBe(output3);

    input = "html {} #app { width: 100%; } .nav { position: fixed; width: 100%; height: 72px; left: 0; top: 0; }";
    var processed = postcss(mobileToMultiDisplays({
      appSelector: "#app",
      "viewportWidth": 750,
      "maxDisplayWidth": 560,
      "mobileUnit": "rem",
    })).process(input).css;
    var output4 = "html { font-size: 13.333333333333334vw !important;} #app { max-width: 560px !important; margin-left: auto !important; margin-right: auto !important; width: 100%; } .nav { position: fixed; width: 7.5rem; height: 0.72rem; left: calc(50% - 3.75rem); top: 0; } @media (min-width: 560px) { html { font-size: 74.66666666666667px !important;}}";
    expect(processed).toBe(output4);
  });

  it("should convert px to desktop and landscape radio px", function() {
    var input = ".rule { width: 375px; } .l{}";
    var output = ".rule { width: 50vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 300px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 212.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should ignore duplicate rules and props in media-query", function() {
    var input = ".rule { width: 500px; } .rule { width: 375px; width: 250px; }";
    var output = ".rule { width: 66.667vw; } .rule { width: 375px; width: 33.333vw; } @media (min-width: 600px) and (min-height: 640px) { .rule { width: 200px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 141.667px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle value < 1", function() {
    var input = ".rule { left: -750px; } .l{}";
    var output = ".rule { left: -750px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: -600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: -425px; } }"
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      disableMobile: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle values without a leading 0", function() {
    var input = ".rule { left: .75px; top: -.75px; right: .px; } .l{}";
    var output = ".rule { left: .75px; top: -.75px; right: .px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: -0.6px; left: 0.6px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { top: -0.425px; left: 0.425px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      disableMobile: true,
    })).process(input).css;
    expect(processed).toBe(output);

    output = ".rule { left: 0.1vw; top: -0.1vw; right: .px; } .l{}";
    processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("ignore input media queries", function() {
    var input = "@media (min-width: 600px) and (min-height: 640px) { .root-class { width: 100vw; } .class { width: 66px; }}";
    var output = "@media (min-width: 600px) and (min-height: 640px) { .root-class { width: 100vw; } .class { width: 66px; }}";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("logical property", function() {

  /** 可以正常转换逻辑宽度属性 */
  it("should convert logical property", function() {
    var input = ".rule { inline-size: 75px; block-size: 75px; } .l{}";
    var output = ".rule { inline-size: min(10vw, 60px); block-size: min(10vw, 60px); } .l{}";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);
  });

  /** 非根元素包含块，无需转换 */
  it("should not convert logical property that has not root containing block", function() {
    var input = ".rule { inline-size: 10%; block-size: 10%; } .l{}";
    var output = ".rule { inline-size: 10%; block-size: 10%; } .l{}";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);
  });

  /** 根元素包含块，将进行转换 */
  it("should convert logical property that has root containing block", function() {
    var input = ".rule { inline-size: 10%; block-size: 10%; position: fixed; } .l{}";
    var output = ".rule { inline-size: min(10%, 60px); block-size: 10%; position: fixed; } .l{}";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);

    input = ".rule { inline-size: 10vw; block-size: 10vw; position: fixed; } .l{}";
    output = ".rule { inline-size: min(10vw, 60px); block-size: min(10vw, 60px); position: fixed; } .l{}";
    processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);
  });

  /** 横向模式，根包含块，将进行转换 */
  it("should convert logical property in horisontal-mode", function() {
    var input = ".rule { inline-size: 10%; block-size: 10%; position: fixed; writing-mode: horizontal-tb; } .l{}";
    var output = ".rule { inline-size: min(10%, 60px); block-size: 10%; position: fixed; writing-mode: horizontal-tb; } .l{}";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);


    input = ".rule { inline-size: 10%; block-size: 10%; position: fixed; } .l{}";
    output = ".rule { inline-size: min(10%, 60px); block-size: 10%; position: fixed; } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      horizontalWritingSelectorList: [".rule"], })).process(input).css;
    expect(processed).toBe(output);


    input = ".rule { inline-size: 10%; block-size: 10%; } .l{}";
    output = ".rule { inline-size: min(10%, 60px); block-size: 10%; } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      horizontalWritingSelectorList: [".rule"],
      rootContainingBlockSelectorList: [".rule"], })).process(input).css;
    expect(processed).toBe(output);
  });

  /** 横向模式，非包含块，将不进行转换 */
  it("should not convert logical property that has not root containing block in horisontal-mode", function() {
    var input = ".rule { inline-size: 10%; block-size: 10%; writing-mode: horizontal-tb; } .l{}";
    var output = ".rule { inline-size: 10%; block-size: 10%; writing-mode: horizontal-tb; } .l{}";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);
  });

  /** 纵向模式，根包含快，进行转换 */
  it("should convert logical property in vertical-mode", function() {
    var input = ".rule { inline-size: 10%; block-size: 10%; writing-mode: vertical-rl; position: fixed; } .l{}";
    var output = ".rule { inline-size: 10%; block-size: min(10%, 60px); writing-mode: vertical-rl; position: fixed; } .l{}";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);

    input = ".rule { inline-size: 10%; block-size: 10%; position: fixed; } .l{}";
    output = ".rule { inline-size: 10%; block-size: min(10%, 60px); position: fixed; } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      verticalWritingSelectorList: [".rule"], })).process(input).css;
    expect(processed).toBe(output);

    input = "/* vertical-writing-mode */ .rule { inline-size: 10%; block-size: 10%; position: fixed; } .l{}";
    output = ".rule { inline-size: 10%; block-size: min(10%, 60px); position: fixed; } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);

    input = "/* vertical-writing-mode */ /* root-containing-block */ .rule { inline-size: 10%; block-size: 10%; } .l{}";
    output = ".rule { inline-size: 10%; block-size: min(10%, 60px); } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("border", function() {
  it("should add border for maxDisplay option when enable border option", function() {
    var input = ".rule { left: 75px; } .l {}";
    var output = ".rule { max-width: 620px !important; margin-left: auto !important; margin-right: auto !important; box-shadow: 0 0 0 1px #8888881f; min-height: 100vh; height: auto !important; left: min(10vw, 62px); } .l {} @supports (min-height: 100dvh) { .rule { min-height: 100dvh; } }";
    var processed = postcss(mobileToMultiDisplays({
      appSelector: ".rule",
      border: true,
      maxDisplayWidth: 620,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not add border for maxDisplay option by default", function() {
    var input = ".rule { left: 75px; }";
    var output = ".rule { max-width: 620px !important; margin-left: auto !important; margin-right: auto !important; left: min(10vw, 62px); }";
    var processed = postcss(mobileToMultiDisplays({
      appSelector: ".rule",
      maxDisplayWidth: 620,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should add border for desktop and landscape", function() {
    var input = ".rule { left: 75px; } .l{}";
    var output = ".rule { left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; max-width: 600px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; max-width: 425px !important; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { margin-left: auto !important; margin-right: auto !important; box-shadow: 0 0 0 1px #8888881f; min-height: 100vh; height: auto !important; } } @supports (min-height: 100dvh) { .rule { min-height: 100dvh; } }";
    var processed = postcss(mobileToMultiDisplays({
      appSelector: ".rule",
      border: true,
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not add border for desktop and landscape by default", function() {
    var input = ".rule { left: 75px; } .l{}";
    var output = ".rule { left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; max-width: 600px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; max-width: 425px !important; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { margin-left: auto !important; margin-right: auto !important; } }";
    var processed = postcss(mobileToMultiDisplays({
      appSelector: ".rule",
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("ignore value", function() {

  describe("propertyBlackList", function() {
    it("should ignore expected property of selector", function() {
      var input = ".rule { left: 75px; border: 1px solid salmon; } .l{}";
      var output = ".rule { left: 75px; border: 1px solid salmon; } .l{}";

      var processed = postcss(mobileToMultiDisplays({
        propertyBlackList: {
          ".rule": ["left", "border"],
        },
      })).process(input).css;
      expect(processed).toBe(output);

      var processed = postcss(mobileToMultiDisplays({
        propertyBlackList: ["left", "border"],
      })).process(input).css;
      expect(processed).toBe(output);

      var processed = postcss(mobileToMultiDisplays({
        propertyBlackList: "left",
      })).process(input).css;
      expect(processed).toBe(".rule { left: 75px; border: 0.133vw solid salmon; } .l{}");
    });
  });
  
  describe("valueBlackList", function() {
    it("should ignore value of porperty if set valueBlackList", function() {
      var input = ".rule { left: 75px; border: 1px solid salmon; } .l{}";
      var output = ".rule { left: 75px; border: 1px solid salmon; } .l{}";
      var processed = postcss(mobileToMultiDisplays({
        valueBlackList: ["75px", "1px solid salmon"],
      })).process(input).css;
      expect(processed).toBe(output);
      
      var input = ".rule { left: 75px; } .l{}";
      var output = ".rule { left: min(10vw, 75px); } .l{}";
      var processed = postcss(mobileToMultiDisplays({
        valueBlackList: [],
        maxDisplayWidth: 750,
      })).process(input).css;
      expect(processed).toBe(output);
    });
  });

  describe("propList", function() {
    it("should ignore to convert props value expected by propList", function() {
      var input = ".rule { border: 1px solid salmon; } .l{}";
      var output = ".rule { border: 1px solid salmon; } .l{}";
      var processed = postcss(mobileToMultiDisplays({
        propList: ["*", "!border"],
      })).process(input).css;
      expect(processed).toBe(output);
    })
  });

  describe("comments", function() {
    it("should ignore to convert values that followed comments", function() {
      var input = ".rule { border: 1px solid salmon; /* mobile-ignore */ } .l{}";
      var output = ".rule { border: 1px solid salmon; } .l{}";
      var processed = postcss(mobileToMultiDisplays()).process(input).css;
      expect(processed).toBe(output);
    });
  })
});

describe("shared media query of landscape and desktop", function() {

  it("should not generate shared media query if not last property", function() {
    var input = ".rule { left: var(--beatles); left: 75px; } .l{}";
    var output = ".rule { left: var(--beatles); left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { left: 750px; /* apply-without-convert */ left: 75px; } .l{}";
    var output = ".rule { left: 750px; left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate shared media query if last property", function() {
    var input = ".rule { left: 75px; left: var(--beatles); } .l{}";
    var output = ".rule { left: 75px; left: var(--beatles); } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: var(--beatles); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { left: 750px; left: 75px; /* apply-without-convert */ } .l{}";
    var output = ".rule { left: 100vw; left: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 425px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: 75px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate shared media query if important property", function() {
    var input = ".rule { left: var(--beatles) !important; left: 75px; } .l{}";
    var output = ".rule { left: var(--beatles) !important; left: 75px; } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: var(--beatles) !important; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { left: 750px !important; /* apply-without-convert */ left: 75px; } .l{}";
    var output = ".rule { left: 750px !important; left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: 750px !important; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not generate shared media if previous important property", function() {
    var input = ".rule { left: 75px !important; left: var(--beatles); } .l{}";
    var output = ".rule { left: 10vw !important; left: var(--beatles); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px !important; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { left: 75px !important; left: 750px; /* apply-without-convert */ } .l{}";
    var output = ".rule { left: 10vw !important; left: 750px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px !important; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate shared media if root-selector center", function() {
    var input = ".rule { margin-left: 75px !important; margin-left: 750px; } .l{}";
    var output = ".rule { margin-left: 10vw !important; margin-left: 750px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { margin-left: 60px !important; max-width: 600px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { margin-left: 42.5px !important; max-width: 425px !important; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { margin-left: auto !important; margin-right: auto !important; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      appSelector: ".rule"
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("sider", function() {
  it("should not generate when disable desktop", function() {
    var input = ".rule { left: 75px; } .l {}";
    var output = ".rule { left: 10vw; } .l {} @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      disableDesktop: true,
      side: {
        selector1: ".rule",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate left top sider", function() {
    var input = ".rule { left: 75px; } .l {}";
    var output = ".rule { left: 10vw; } .l {} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 1016px) and (min-height: 640px) { .rule { position: fixed; top: 18px; left: calc(50% - 508px); right: auto; bottom: auto; width: 190px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      side: {
        selector1: ".rule",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate right top sider", function() {
    var input = ".rule { left: 75px; } .l {}";
    var output = ".rule { left: 10vw; } .l {} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 1016px) and (min-height: 640px) { .rule { position: fixed; top: 18px; left: auto; right: calc(50% - 508px); bottom: auto; width: 190px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      side: {
        selector2: ".rule",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate right bottom sider", function() {
    var input = ".rule { left: 75px; } .l {}";
    var output = ".rule { left: 10vw; } .l {} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 1016px) and (min-height: 640px) { .rule { position: fixed; top: auto; left: auto; right: calc(50% - 508px); bottom: 18px; width: 190px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      side: {
        selector3: ".rule",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should generate left bottom sider", function() {
    var input = ".rule { left: 75px; } .l {}";
    var output = ".rule { left: 10vw; } .l {} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 1016px) and (min-height: 640px) { .rule { position: fixed; top: auto; left: calc(50% - 508px); right: auto; bottom: 18px; width: 190px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      side: {
        selector4: ".rule",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should get width value in selector without specified", function() {
    var input = ".rule { width: 75px; } .l {}";
    var output = ".rule { width: 10vw; } .l {} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 756px) and (min-height: 640px) { .rule { position: fixed; top: 18px; left: calc(50% - 378px); right: auto; bottom: auto; width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      side: {
        selector1: ".rule",
      },
    })).process(input).css;
    expect(processed).toBe(output);

  });

});

describe("appContainingBlock", function() {
  it("manual", function() {
    var input = ".abc { left: 75px; } .def { left: 75px; position: fixed; width: 100%; }";
    var output = ".abc { max-width: 600px !important; margin-left: auto !important; margin-right: auto !important; left: min(10vw, 60px); } .def { left: min(10vw, 60px); position: fixed; width: 100%; }";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      appContainingBlock: "manual",
      appSelector: ".abc"
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("auto", function() {
    var input = "bdy {} .abc { left: 75px; } .def { left: 75px; position: fixed; width: 100%; }";
    var output = "bdy { max-width: 600px !important; margin-left: auto !important; margin-right: auto !important; contain: layout; height: 100vh;} .abc { width: 100% !important; height: 100% !important; overflow: auto !important; left: min(10vw, 60px); } .def { left: min(10vw, 60px); position: fixed; width: 100%; } @supports (min-height: 100dvh) { bdy { height: 100dvh;}}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      appContainingBlock: "auto",
      appSelector: ".abc",
      necessarySelectorWhenAuto: "bdy",
    })).process(input).css;
    expect(processed).toBe(output);

    var input = "body {} .abc { left: 75px; } .def { left: 10%; position: fixed; width: 100%; }";
    var output = "body { max-width: 600px !important; margin-left: auto !important; margin-right: auto !important; contain: layout; height: 100vh;} .abc { width: 100% !important; height: 100% !important; overflow: auto !important; left: min(10vw, 60px); } .def { left: 10%; position: fixed; width: 100%; } @supports (min-height: 100dvh) { body { height: 100dvh;}}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      appContainingBlock: "auto",
      appSelector: ".abc",
    })).process(input).css;
    expect(processed).toBe(output);

    var input = "body {} .abc { left: 75px; } .def { left: 10vw; position: fixed; width: 100%; }";
    var output = "body { max-width: 600px !important; margin-left: auto !important; margin-right: auto !important; contain: layout; height: 100vh;} .abc { width: 100% !important; height: 100% !important; overflow: auto !important; left: min(10vw, 60px); } .def { left: min(10vw, 60px); position: fixed; width: 100%; } @supports (min-height: 100dvh) { body { height: 100dvh;}}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      appContainingBlock: "auto",
      appSelector: ".abc",
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("default calc", function() {
    var input = ".abc { left: 75px; } .def { left: 75px; position: fixed; width: 100%; }";
    var output = ".abc { max-width: 600px !important; margin-left: auto !important; margin-right: auto !important; left: min(10vw, 60px); } .def { left: calc(50% - min(240px, 40%)); position: fixed; width: min(100%, 600px); }";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      appContainingBlock: "calc",
      appSelector: ".abc"
    })).process(input).css;
    expect(processed).toBe(output);

    processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      appSelector: ".abc"
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("rootContainingBlockSelectorList", function() {
  it("should convert selector string", function() {
    var input = ".abc { left: 75px; } .def { left: 75px; }";
    var output = ".abc { left: 10vw; } .def { left: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .abc { left: calc(50% - 240px); } .def { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .abc { left: calc(50% - 170px); } .def { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      rootContainingBlockSelectorList: [".abc"],
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert selector regex", function() {
    var input = ".abc { left: 75px; } .def { left: 75px; }";
    var output = ".abc { left: 10vw; } .def { left: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .abc { left: calc(50% - 240px); } .def { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .abc { left: calc(50% - 170px); } .def { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      rootContainingBlockSelectorList: [/bc$/],
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert percentage", function() {
    var input = ".abc { left: 0; bottom: 0; width: 100%; } .def { left: 75px; }";
    var output = ".abc { left: 0; bottom: 0; width: 100%; } .def { left: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .abc { bottom: 0; left: calc(50% - 300px); width: 600px; } .def { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .abc { bottom: 0; left: calc(50% - 212.5px); width: 425px; } .def { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      rootContainingBlockSelectorList: [/bc$/],
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert when enabled maxDisplayWidth", function() {
    var input = ".abc { left: 75px; } .def { left: 75px; }";
    var output = ".abc { left: calc(50% - min(240px, 40%)); } .def { left: min(10vw, 60px); }";
    var processed = postcss(mobileToMultiDisplays({
      rootContainingBlockSelectorList: [/bc$/],
      maxDisplayWidth: 600,
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("CSS variable, custom properties", function() {

  it("should not correct override by high priority", function() {
    var input = ".rule { border-bottom: var(--bb); border-bottom: 75px; } .l{}";
    var output = ".rule { border-bottom: var(--bb); border-bottom: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { border-bottom: var(--bb); border-bottom: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { border-bottom: var(--bb); border-bottom: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).not.toBe(output);
  });

  it("should apply custom property when enable disableAutoApply and expect customLengthProperty", function() {
    var input = ".rule { border-bottom: var(--bb); border-top: var(--cc); } .l{}";
    var output = ".rule { border-bottom: var(--bb); border-top: var(--cc); } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        disableAutoApply: true,
        rootContainingBlockList_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);

    var input = ":root { --bb: 75px; --cc: 75px; } .rule { border-bottom: var(--bb); border-top: var(--cc); } .l{}";
    var output = ":root { --bb: calc(50% - min(240px, 40%)); --cc: min(10vw, 60px); } .rule { border-bottom: var(--bb); border-top: var(--cc); } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
      customLengthProperty: {
        rootContainingBlockList_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not apply custom property when enable disableAutoApply option", function() {
    var input = ".rule { border-bottom: var(--bb); } .l{}";
    var output = ".rule { border-bottom: var(--bb); } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      customLengthProperty: {
        disableAutoApply: true,
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not apply custom property value outside customLengthProperty list", function() {
    var input = ".rule { border-bottom: var(--bb); } .l{}";
    var output = ".rule { border-bottom: var(--bb); } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      customLengthProperty: {
        rootContainingBlockList_LR: ["--cc"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should apply shared value inside customLengthProperty list", function() {
    var input = ".rule { border-bottom: var(--bb); } .l{}";
    var output = ".rule { border-bottom: var(--bb); } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        rootContainingBlockList_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should apply desktop and landscape value inside customLengthProperty list", function() {
    var input = ".rule { border-bottom: var(--bb); left: 75px; } .l{}";
    var output = ".rule { border-bottom: var(--bb); left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        rootContainingBlockList_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert custom fixed left or right property", function() {
    var input = ":root { --bb: 75px; } .rule { left: var(--bb); } .l{}";
    var output = ":root { --bb: 10vw; } .rule { left: var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { :root { --bb: calc(50% - 240px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { :root { --bb: calc(50% - 170px); } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        rootContainingBlockList_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert custom fixed not left and right property", function() {
    var input = ":root { --bb: 75px; --cc: 75px; } .rule { top: var(--bb); } .l{}";
    var output = ":root { --bb: 10vw; --cc: 10vw; } .rule { top: var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { :root { --cc: 60px; --bb: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { :root { --cc: 42.5px; --bb: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { top: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        rootContainingBlockList_NOT_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert common percentage custom property", function() {
    var input = ":root { --bb: 10%; } .rule { left: var(--bb); } .l{}";
    var output = ":root { --bb: 10%; } .rule { left: var(--bb); } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        ancestorContainingBlockList: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed left or right percentage custom property", function() {
    var input = ":root { --bb: 10%; } .rule { left: var(--bb); } .l{}";
    var output = ":root { --bb: 10%; } .rule { left: var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { :root { --bb: calc(50% - 240px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { :root { --bb: calc(50% - 170px); } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        rootContainingBlockList_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed not left and right percentage custom property", function() {
    var input = ":root { --bb: 10%; } .rule { left: var(--bb); } .l{}";
    var output = ":root { --bb: 10%; } .rule { left: var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { :root { --bb: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { :root { --bb: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { left: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      customLengthProperty: {
        rootContainingBlockList_NOT_LR: ["--bb"],
      }
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed left or right percentage custom property with maxDisplayWidth", function() {
    var input = ":root { --bb: 10%; --cc: 75px; --dd: 10%; } .rule { left: var(--bb); right: var(--cc); position: fixed; } .l{}";
    var output = ":root { --bb: calc(50% - min(40%, 240px)); --cc: min(10vw, 60px); --dd: 10%; } .rule { left: var(--bb); right: var(--cc); position: fixed; } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      customLengthProperty: {
        rootContainingBlockList_LR: ["--bb"],
      },
      maxDisplayWidth: 600,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should append var() to shared media query when enabled desktop and landscape", function() {
    var input = ".rule { border-bottom: var(--bb); } .l{}";
    var output = ".rule { border-bottom: var(--bb); } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should append var() to desktop media query when enabled desktop", function() {
    var input = ".rule { border-bottom: var(--bb); } .l{}";
    var output = ".rule { border-bottom: var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, disableLandscape: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should append var() to landscape media query when enabled landscape", function() {
    var input = ".rule { border-bottom: var(--bb); } .l{}";
    var output = ".rule { border-bottom: var(--bb); } .l{} @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, disableDesktop: true })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should append var() to shared media query with other props", function() {
    var input = ".rule { border-bottom: var(--bb); width: 75px; } .l{}";
    var output = ".rule { border-bottom: var(--bb); width: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { border-bottom: var(--bb); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert value includes var()", function() {
    var input = ".rule { padding: 75px var(--bb); } .l{}";
    var output = ".rule { padding: 10vw var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { padding: 60px var(--bb); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { padding: 42.5px var(--bb); } }"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value includes 0", function() {
    var input = ".rule { padding: 0 var(--bb); } .l{}";
    var output = ".rule { padding: 0 var(--bb); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { padding: 0 var(--bb); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { padding: 0 var(--bb); } }"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not append color var() to media query", function() {
    var input = ".rule { color: var(--salmon); } .l{}";
    var output = ".rule { color: var(--salmon); } .l{}";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle var() with fallback value", function() {
    var input = ".rule { font-size: var(--row-font-size, 14px); }";
    var output = ".rule { font-size: var(--row-font-size, min(1.867vw, 11.2px)); }";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle nested var()", function() {
    var input = ".rule { font-size: var(--row-font-size, var(--nested-font-size, 14px)); }";
    var output = ".rule { font-size: var(--row-font-size, var(--nested-font-size, min(1.867vw, 11.2px))); }";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("maxDisplayWidth", function() {
  var baseOpts = {
    maxDisplayWidth: 600,
  }
  it("should convert px to min(vw, px)", function() {
    var input = ".rule { border-width: 75px; }";
    var output = ".rule { border-width: min(10vw, 60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert negative px to max(vw, px)", function() {
    var input = ".rule { border-width: -75px; }";
    var output = ".rule { border-width: max(-10vw, -60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert vw to min(vw, px)", function() {
    var input = ".rule { border-width: 10vw; }";
    var output = ".rule { border-width: min(10vw, 60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert negative vw to max(vw, px)", function() {
    var input = ".rule { border-width: -10vw; }";
    var output = ".rule { border-width: max(-10vw, -60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed left px to calc(50% - min(px, vw))", function() {
    var input = ".rule { position: fixed; left: 75px; }";
    var output = ".rule { position: fixed; left: calc(50% - min(240px, 40%)); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("shoud convert fixed left px greater than half viewportWidth to calc(50% - max(px, vw))", function() {
    var input = ".rule { position: fixed; left: 376px; }";
    var output = ".rule { position: fixed; left: calc(50% - max(-0.8px, -0.133%)); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { position: fixed; left: 750px; }";
    var output = ".rule { position: fixed; left: calc(50% - max(-300px, -50%)); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { position: fixed; left: 188px; }";
    var output = ".rule { position: fixed; left: calc(50% - max(-0.64px, -0.133%)); }";
    var processed = postcss(mobileToMultiDisplays({
      viewportWidth: 375,
      maxDisplayWidth: 480
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed left vw/% to calc(50% - min(%, px))", function() {
    var input = ".rule { position: fixed; left: 10vw; right: 10%; }";
    var output = ".rule { position: fixed; left: calc(50vw - min(40vw, 240px)); right: calc(50% - min(40%, 240px)); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed left vw/% greater than 50 to calc(50% - max(%, px))", function() {
    var input = ".rule { position: fixed; left: 100vw; right: 100%; }";
    var output = ".rule { position: fixed; left: calc(50vw - max(-50vw, -300px)); right: calc(50% - max(-50%, -300px)); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed left 0 to calc(50% - min(50%, px))", function() {
    var input = ".rule { position: fixed; left: 0; }";
    var output = ".rule { position: fixed; left: calc(50% - min(50%, 300px)); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed not-left/right containing-block px to min(vw, px)", function() {
    var input = ".rule { position: fixed; padding-bottom: 75px; }";
    var output = ".rule { position: fixed; padding-bottom: min(10vw, 60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed not-left/right containing-block negative px to max(vw, px)", function() {
    var input = ".rule { position: fixed; padding-bottom: -75px; }";
    var output = ".rule { position: fixed; padding-bottom: max(-10vw, -60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed not-left/right containing-block 0px", function() {
    var input = ".rule { position: fixed; padding-bottom: 0px; }";
    var output = ".rule { position: fixed; padding-bottom: 0px; }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed not-left/right containing-block vw/% to min(px, %)", function() {
    var input = ".rule { position: fixed; padding-bottom: 10vw; padding-top: 10%; padding-left: 0%; }";
    var output = ".rule { position: fixed; padding-bottom: min(10vw, 60px); padding-top: min(10%, 60px); padding-left: 0%; }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert containing-block px to min(vw, px)", function() {
    var input = ".rule { padding-bottom: 75px; }";
    var output = ".rule { padding-bottom: min(10vw, 60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert containing-block negative px to max(vw, px)", function() {
    var input = ".rule { padding-bottom: -75px; }";
    var output = ".rule { padding-bottom: max(-10vw, -60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert containing-block vw to min(vw, px)", function() {
    var input = ".rule { padding-bottom: 10vw; }";
    var output = ".rule { padding-bottom: min(10vw, 60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert containing-block negative vw to min(vw, px)", function() {
    var input = ".rule { padding-bottom: -10vw; }";
    var output = ".rule { padding-bottom: max(-10vw, -60px); }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert 0px", function() {
    var input = ".rule { border: 0px solid salmon; }";
    var output = ".rule { border: 0px solid salmon; }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("appSelector", function() {
  var options = { appSelector: "#app", enableMediaQuery: true, }

  it("should centre the appSelector element on page", function() {
    var input = "#app { color: salmon; } .l{}";
    var output = "#app { color: salmon; } .l{} @media (min-width: 600px) and (min-height: 640px) { #app { max-width: 600px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { #app { max-width: 425px !important; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { #app { margin-left: auto !important; margin-right: auto !important; } }";
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not centre the selector that different with appSelector on page", function() {
    var input = "div#app { color: salmon; } .l{}";
    var output = "div#app { color: salmon; } .l{}"
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should centre the appSelector element on page", function() {
    var input = "#app { color: salmon; } .l{}";
    var output = "#app { color: salmon; } .l{} @media (min-width: 600px) and (min-height: 640px) { #app { max-width: 600px !important; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { #app { max-width: 425px !important; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { #app { margin-left: auto !important; margin-right: auto !important; } }";
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("comment", function() {
  it("should convert none-fixed-position value with root-containing-block comment", function() {
    var input = "/* root-containing-block */.nav { left: 0; } .l{}";
    var output = ".nav { left: 0; } .l{} @media (min-width: 600px) and (min-height: 640px) { .nav { left: calc(50% - 300px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .nav { left: calc(50% - 212.5px); } }"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert not root containing block px value with comment", function() {
    var input = "/*not-root-containing-block*/.nav { position: fixed; left: 75px; } .b { top: 0px }";
    var output = ".nav { position: fixed; left: 10vw; } .b { top: 0px } @media (min-width: 600px) and (min-height: 640px) { .nav { left: 60px; } .b { top: 0px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .nav { left: 42.5px; } .b { top: 0px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should ignore not root containing block percentage value with comment", function() {
    var input = "/*not-root-containing-block*/.nav { position: fixed; left: 75%; } .b { top: 0px }";
    var output = ".nav { position: fixed; left: 75%; } .b { top: 0px } @media (min-width: 600px) and (min-height: 640px) { .b { top: 0px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .b { top: 0px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert not root containing block vw value with comment", function() {
    var input = "/*not-root-containing-block*/.nav { position: fixed; left: 10vw; } .b { top: 0px }";
    var output = ".nav { position: fixed; left: 10vw; } .b { top: 0px } @media (min-width: 600px) and (min-height: 640px) { .nav { left: 60px; } .b { top: 0px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .nav { left: 42.5px; } .b { top: 0px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should ignore not root containing block percentage value with comment, not left and right", function() {
    var input = "/*not-root-containing-block*/.nav { position: fixed; margin: 75%; } .b { top: 0px }";
    var output = ".nav { position: fixed; margin: 75%; } .b { top: 0px } @media (min-width: 600px) and (min-height: 640px) { .b { top: 0px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .b { top: 0px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should apply without convert when add /* apply-without-convert */ comment", function() {
    var input = ".a, .b, .c { position: absolute; left: 75px; }; .b { left: auto; /* apply-without-convert */ right: 75px; }";
    var output = ".a, .b, .c { position: absolute; left: 10vw; }; .b { left: auto; right: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .a, .b, .c { left: 60px; } .b { right: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .a, .b, .c { left: 42.5px; } .b { right: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .b { left: auto; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle custom comment", function() {
    var input = ".a, .b, .c { position: absolute; left: 75px; }; .b { left: auto; /* 移动本行 */ right: 75px; }";
    var output = ".a, .b, .c { position: absolute; left: 10vw; }; .b { left: auto; right: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .a, .b, .c { left: 60px; } .b { right: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .a, .b, .c { left: 42.5px; } .b { right: 42.5px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .b { left: auto; } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      comment: {
        applyWithoutConvert: "移动本行",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert none-fixed-position value with root-containing-block comment", function() {
    var input = "/* 包含块 */.nav { left: 0; } .l{}";
    var output = ".nav { left: 0; } .l{} @media (min-width: 600px) and (min-height: 640px) { .nav { left: calc(50% - 300px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .nav { left: calc(50% - 212.5px); } }"
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      comment: {
        rootContainingBlock: "包含块",
      },
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("transform vw to media query px", function() {
  it("should convert width viewport unit", function() {
    var input = ".rule { width: 75vw; } .l{}"
    var output = ".rule { width: 75vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 450px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 318.75px; } }"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("fixed position in media queries", function() {
  it("should convert left px property", function() {
    var input = ".rule { left: 75px; top: 75px; position: fixed; } .l{}";
    var output = ".rule { left: 10vw; top: 10vw; position: fixed; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60px; left: calc(50% - 240px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { top: 42.5px; left: calc(50% - 170px); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert right px property", function() {
    var input = ".rule { right: 75px; top: 75px; position: fixed; } .l{}";
    var output = ".rule { right: 10vw; top: 10vw; position: fixed; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60px; right: calc(50% - 240px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { top: 42.5px; right: calc(50% - 170px); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed left and right px property", function(){
    var input = ".rule { right: 75px; left: 150px; top: 75px; position: fixed; } .l{}";
    var output = ".rule { right: 10vw; left: 20vw; top: 10vw; position: fixed; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60px; left: calc(50% - 180px); right: calc(50% - 240px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { top: 42.5px; left: calc(50% - 127.5px); right: calc(50% - 170px); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed left 0", function() {
    var input = ".rule { left: 0px; top: 75px; position: fixed; } .l{}";
    var output = ".rule { left: 0px; top: 10vw; position: fixed; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60px; left: calc(50% - 300px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { top: 42.5px; left: calc(50% - 212.5px); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed percentage prop", function() {
    var input = ".rule { position: fixed; width: 100%; left: 50%; } .l{}"
    var output = ".rule { position: fixed; width: 100%; left: 50%; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: calc(50% - 0px); width: 600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: calc(50% - 0px); width: 425px; } }"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed vw prop", function() {
    var input = ".rule { position: fixed; width: 100vw; left: 50vw; } .l{}"
    var output = ".rule { position: fixed; width: 100vw; left: 50vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: calc(50% - 0px); width: 600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: calc(50% - 0px); width: 425px; } }"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should not convert when percentage prop without fixed position", function() {
    var input = ".rule { width: 100%; left: 50%; } .l{}"
    var output = ".rule { width: 100%; left: 50%; } .l{}"
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should not convert fixed percentage props that is not containing block", function() {
    var input = ".rule { position: fixed; background-size: 50%; } .l{}";
    var output = ".rule { position: fixed; background-size: 50%; } .l{}";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed negative vw or percentage prop", function() {
    var input = ".rule { position: fixed; width: 10vw; left: -50%; } .l{}";
    var output = ".rule { position: fixed; width: 10vw; left: -50%; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: calc(50% - 600px); width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: calc(50% - 425px); width: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
  it("should convert fixed px containing block prop except left and right", function() {
    var input = ".rule { position: fixed; width: 10vw; margin: 75px; } .l{}";
    var output = ".rule { position: fixed; width: 10vw; margin: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { margin: 60px; width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { margin: 42.5px; width: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("dynamic viewportWidth", function() {
  var options = {
    viewportWidth: file => file.includes("vant") ? 375 : 750,
  };
  it("should use truthy viewportWidth by dynamic viewportWidth", function() {
    var input = ".rule { left: 75px; font-size: 75px; } .l{}";
    var output = ".rule { left: 20vw; font-size: 20vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { font-size: 120px; left: 120px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { font-size: 85px; left: 85px; } }"
    var processed = postcss(mobileToMultiDisplays({ ...options, enableMediaQuery: true })).process(input, {
      from: "/vant/main.css",
    }).css;
    expect(processed).toBe(output);
  });

  it("should use falthy viewportWidth by dynamic viewportWidth", function() {
    var input = ".rule { left: 75px; } .l{}";
    var output = ".rule { left: 10vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 42.5px; } }"
    var processed = postcss(mobileToMultiDisplays({ ...options, enableMediaQuery: true })).process(input, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(output);
  });

  it("should work in vw-mode", function() {
    var input = ".rule { left: 75px; font-size: 75px; } .l{}";
    var output = ".rule { left: 10vw; font-size: 10vw; } .l{}"
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should work in max-vw-mode", function() {
    var input = ".rule { left: 75px; font-size: 75px; } .l{}";
    var output = ".rule { left: min(10vw, 60px); font-size: min(10vw, 60px); } .l{}"
    var processed = postcss(mobileToMultiDisplays({ ...options, maxDisplayWidth: 600 })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should use viewportWidth number", function() {
    var options = {
      viewportWidth: 375,
      enableMediaQuery: true
    };
    var input = ".rule { left: 75px; } .l{}";
    var output = ".rule { left: 20vw; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 120px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { left: 85px; } }"
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("demoMode", function() {
  it("should excute demoMode without enableMobile", function() {
    var options = {
      demoMode: true,
      disableMobile: true,
      enableMediaQuery: true,
    };
    var input = ".DEMO_MODE::before { o_o: ''; } .l{}"
    var output = ".DEMO_MODE::before { o_o: ''; } .l{} @media (min-width: 600px) and (min-height: 640px) { .DEMO_MODE::before { content: '✨Desktop✨'; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .DEMO_MODE::before { content: '✨Landscape✨'; } }"
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });
  it("should excute demoMode with enabledMobile", function() {
    var options = {
      demoMode: true,
      enableMediaQuery: true,
    };
    var input = ".DEMO_MODE::before {} .l{}"
    var output = ".DEMO_MODE::before { content: '✨Portrait✨'} .l{} @media (min-width: 600px) and (min-height: 640px) { .DEMO_MODE::before { content: '✨Desktop✨'}} @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .DEMO_MODE::before { content: '✨Landscape✨'}}"
    var processed = postcss(mobileToMultiDisplays(options)).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("value parsing", function() {
  var baseOpts = {
    disableMobile: true,
    enableMediaQuery: true
  };
  it("should not convert values in url()", function() {
    var input = ".rule { background: url(750px.jpg); font-size: 75px; } .l{}";
    var output = ".rule { background: url(750px.jpg); font-size: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { font-size: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { font-size: 42.5px; } }"
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert value outside url()", function() {
    var input = ".rule { background: left 75px / 7.5px 60% repeat-x url(./star750px); } .l{}";
    var output = ".rule { background: left 75px / 7.5px 60% repeat-x url(./star750px); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { background: left 60px / 6px 60% repeat-x url(./star750px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { background: left 42.5px / 4.25px 60% repeat-x url(./star750px); } }"
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value end with other words except px", function() {
    var input = ".rule { width: calc(100% - 75px); } .l{}";
    var output = ".rule { width: calc(100% - 75px); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: calc(100% - 60px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: calc(100% - 42.5px); } }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert values equal to 1", function() {
    var input = ".rule { border: 1px solid white; /* mobile-ignore */ left: 1px; /* mobile-ignore */ top: 75px; } .l{}";
    var output = ".rule { border: 1px solid white; left: 1px; top: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { top: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value in content property value", function() {
    var input = ".rule::before { content: '75px'; left: 75px; } .l{}";
    var output = ".rule::before { content: '75px'; left: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule::before { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule::before { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value in quotes of font property", function() {
    var input = ".rule { font: italic 75px '75px', serif; } .l{}";
    var output = ".rule { font: italic 75px '75px', serif; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { font: italic 60px '75px', serif; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { font: italic 42.5px '75px', serif; } }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle value without unit", function() {
    var input = ".rule { padding: 75px; padding-bottom: 0; } .l{}";
    var output = ".rule { padding: 10vw; padding-bottom: 0; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { padding: 60px; padding-bottom: 0; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { padding: 42.5px; padding-bottom: 0; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle fixed value without unit", function() {
    var input = ".rule { position: fixed; margin: 0 0; padding-bottom: 0; left: 0; border: 0; } .l{}";
    var output = ".rule { position: fixed; margin: 0 0; padding-bottom: 0; left: 0; border: 0; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { border: 0; left: calc(50% - 300px); margin: 0 0; padding-bottom: 0; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { border: 0; left: calc(50% - 212.5px); margin: 0 0; padding-bottom: 0; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert var(...px)", function() {
    var input = ".rule { left: var(l-75px); border: var(l-75px) solid salmon; } .l{}";
    var output = ".rule { left: var(l-75px); border: var(l-75px) solid salmon; } .l{} @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) and (min-width: 425px) { .rule { border: var(l-75px) solid salmon; left: var(l-75px); } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert var(...px) with maxDisplayWidth", function() {
    var input = ".rule { left: var(l-75px); border: var(l-75px) solid salmon; } .l{}";
    var output = ".rule { left: var(l-75px); border: var(l-75px) solid salmon; } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert hex color value ends with number", function() {
    var input = ".rule { color: #781A05; } .l{}";
    var output = ".rule { color: #781A05; } .l{}";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("media queries", function() {
  var baseOpts = {
    disableMobile: true,
    enableMediaQuery: true,
  };
  it("should ignore 1px in media queries", function() {
    var input = ".rule { border: 1px solid white; /* mobile-ignore */ left: 1px; /* mobile-ignore */ top: 1px; /* mobile-ignore */ background: left 1px / 1px 60% repeat-x url(./star750px); /* mobile-ignore */ } .l{}";
    var output = ".rule { border: 1px solid white; left: 1px; top: 1px; background: left 1px / 1px 60% repeat-x url(./star750px); } .l{}";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert if no px value", function() {
    var input = ".rule { font-size: 1rem; }";
    var output = ".rule { font-size: 1rem; }";
    var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert props in font-face at-rule", function() {
    var input = "@font-face { font-size: 75px } .rule { font-size: 75px; }";
    var output = "@font-face { font-size: 75px } .rule { font-size: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .rule { font-size: 60px } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { font-size: 42.5px } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true, })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should ignore media queries from source", function() {
    var input = "@media (min-width: 600px) { .rule { width: 75px; } } .rule2 { width: 75px; }";
    var output = "@media (min-width: 600px) { .rule { width: 75px; } } .rule2 { width: 10vw; } @media (min-width: 600px) and (min-height: 640px) { .rule2 { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule2 { width: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays({ enableMediaQuery: true })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("exclude", function() {
  var baseOpts = {
    disableMobile: true,
    enableMediaQuery: true,
  };
  var rules = ".rule { width: 75px; } .l{}";
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 42.5px; } }";
  it("when using exclude option, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      exclude: /\/node_modules\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using exclude option, the style should be overwritten.", function() {
    var options = {
      ...baseOpts,
      exclude: /\/node_modules\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });

  it("when using exclude array, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      exclude: [/\/node_modules\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using exclude array, the style should be overwritten.", function() {
    var options = {
      ...baseOpts,
      exclude: [/\/node_modules\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });
});

describe("include", function() {
  var baseOpts = {
    disableMobile: true,
    enableMediaQuery: true,
  };
  var rules = ".rule { width: 75px; } .l{}";
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 42.5px; } }";
  it("when using include option, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: /\/src\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using include option, the style should be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: /\/src\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });

  it("when using include array, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: [/\/src\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using include array, the style should be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: [/\/src\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });
});

describe("include and exclude", function() {
  var baseOpts = {
    disableMobile: true,
    enableMediaQuery: true,
  };
  var rules = ".rule { width: 75px; } .l{}";
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { width: 42.5px; } }";
  it("when using same include and exclude, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: /\/src\//,
      exclude: /\/src\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: /\/mobile\//,
      exclude: /\/desktop\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude, the style should be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: /\/mobile\//,
      exclude: /\/desktop\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/mobile/main.css",
    }).css;
    expect(processed).toBe(converted);
  });

  it("when using same include and exclude array, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: [/\/src\//],
      exclude: [/\/src\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude array, the style should not be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: [/\/mobile\//],
      exclude: [/\/desktop\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude array, the style should be overwritten.", function() {
    var options = {
      ...baseOpts,
      include: [/\/mobile\//],
      exclude: [/\/desktop\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/mobile/main.css",
    }).css;
    expect(processed).toBe(converted);
  });
});

describe("experimental", function() {

  describe("minDisplayWidth", function() {
    var baseOpts = {
      appSelector: "#app",
      maxDisplayWidth: 1000,
      experimental: {
        minDisplayWidth: 700,
      }
    }

    it("should clamp root element width", function() {
      var input = "#app { min-height: 100vh; }";
      var output = "#app { min-width: 700px !important; max-width: 1000px !important; margin-left: auto !important; margin-right: auto !important; min-height: 100vh; }";
      var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
      expect(processed).toBe(output);
    });

    it("should clamp px", function() {
      var input = ".rule { width: 60px }";
      var output = ".rule { width: clamp(56px, 8vw, 80px) }";
      var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
      expect(processed).toBe(output);
    });

    it("should clamp vw", function() {
      var input = ".rule { width: 60vw }";
      var output = ".rule { width: clamp(420px, 60vw, 600px) }";
      var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
      expect(processed).toBe(output);
    });

    it("should clamp %", function() {
      var input = ".rule { width: 60%; position: fixed; }";
      var output = ".rule { width: clamp(420px, 60%, 600px); position: fixed; }";
      var processed = postcss(mobileToMultiDisplays(baseOpts)).process(input).css;
      expect(processed).toBe(output);
    });
  });
});

describe("keyframes at rule", function() {
  it("should append keyframes inside landscape and desktop", function() {
    var input = ".rule { bottom: 75px; } @keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; } 50% { top: 10px; } 100% { top: 0; } } @keyframes identifier2 { 0% { top: 0; } 50% { top: 30px; left: 20px; } 50% { top: 10px; } 100% { top: 0; } }";
    var output = ".rule { bottom: 10vw; } @keyframes identifier { 0% { top: 0; } 50% { top: 4vw; left: 2.667vw; } 50% { top: 1.333vw; } 100% { top: 0; } } @keyframes identifier2 { 0% { top: 0; } 50% { top: 4vw; left: 2.667vw; } 50% { top: 1.333vw; } 100% { top: 0; } } @media (min-width: 600px) and (min-height: 640px) { .rule { bottom: 60px; } @keyframes identifier { 0% { top: 0; } 50% { left: 16px; top: 8px; } 100% { top: 0; } } @keyframes identifier2 { 0% { top: 0; } 50% { left: 16px; top: 8px; } 100% { top: 0; } } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { bottom: 42.5px; } @keyframes identifier { 0% { top: 0; } 50% { left: 11.333px; top: 5.667px; } 100% { top: 0; } } @keyframes identifier2 { 0% { top: 0; } 50% { left: 11.333px; top: 5.667px; } 100% { top: 0; } } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert keyframes px to vw that limited width", function() {
    var input = "@keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; } 50% { top: 10px; } 100% { top: 0; } }";
    var output = "@keyframes identifier { 0% { top: 0; } 50% { top: min(4vw, 24px); left: min(2.667vw, 16px); } 50% { top: min(1.333vw, 8px); } 100% { top: 0; } }";
    var processed = postcss(mobileToMultiDisplays({
      maxDisplayWidth: 600,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert keyframes px to vw", function() {
    var input = "@keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; } 50% { top: 10px; } 100% { top: 0; } }";
    var output = "@keyframes identifier { 0% { top: 0; } 50% { top: 4vw; left: 2.667vw; } 50% { top: 1.333vw; } 100% { top: 0; } }";
    var processed = postcss(mobileToMultiDisplays({})).process(input).css;
    expect(processed).toBe(output);
  });

  it("should append keyframes inside landscape", function() {
    var input = ".rule { bottom: 75px; } @keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; } 50% { top: 10px; } 100% { top: 0; } }";
    var output = ".rule { bottom: 10vw; } @keyframes identifier { 0% { top: 0; } 50% { top: 4vw; left: 2.667vw; } 50% { top: 1.333vw; } 100% { top: 0; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { .rule { bottom: 42.5px; } @keyframes identifier { 0% { top: 0; } 50% { left: 11.333px; top: 5.667px; } 100% { top: 0; } } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      disableDesktop: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should append keyframes inside desktop", function() {
    var input = ".rule { bottom: 75px; } @keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; } 50% { top: 10px; } 100% { top: 0; } }";
    var output = ".rule { bottom: 10vw; } @keyframes identifier { 0% { top: 0; } 50% { top: 4vw; left: 2.667vw; } 50% { top: 1.333vw; } 100% { top: 0; } } @media (min-width: 600px) and (min-height: 640px) { .rule { bottom: 60px; } @keyframes identifier { 0% { top: 0; } 50% { left: 16px; top: 8px; } 100% { top: 0; } } }";
    var processed = postcss(mobileToMultiDisplays({
      enableMediaQuery: true,
      disableLandscape: true,
    })).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("at rule", function() {

  describe("layer", function() {
    var input = "@layer base, special; @layer special { .item { color: rebeccapurple; }} @layer base { .item { color: green; border: 12px solid green; font-size: 30px; padding: 75px; }} .abc { width: 75px }";
    it("should transform @layer in max-vw-mode", function() {
      var output = "@layer base, special; @layer special { .item { color: rebeccapurple; }} @layer base { .item { color: green; border: min(1.6vw, 9.6px) solid green; font-size: min(4vw, 24px); padding: min(10vw, 60px); }} .abc { width: min(10vw, 60px) }";
      var processed = postcss(mobileToMultiDisplays({
        "viewportWidth": 750,
        "maxDisplayWidth": 600,
      })).process(input).css;
      expect(processed).toBe(output);
    });

    it("should transform @layer in vw-mode", function() {
      var output = "@layer base, special; @layer special { .item { color: rebeccapurple; }} @layer base { .item { color: green; border: 1.6vw solid green; font-size: 4vw; padding: 10vw; }} .abc { width: 10vw }";
      var processed = postcss(mobileToMultiDisplays({
        "viewportWidth": 750,
      })).process(input).css;
      expect(processed).toBe(output);
    });

    it("should not transform @layer in mq-mode", function() {
      var output = "@layer base, special; @layer special { .item { color: rebeccapurple; }} @layer base { .item { color: green; border: 12px solid green; font-size: 30px; padding: 75px; }} .abc { width: 10vw } @media (min-width: 600px) and (min-height: 640px){ .abc{ width: 60px;}} @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape){ .abc{ width: 42.5px;}}";
      var processed = postcss(mobileToMultiDisplays({
        "viewportWidth": 750,
        "enableMediaQuery": true,
      })).process(input).css;
      expect(processed).toBe(output);
    });
  })

  it("font-face", function() {
    var input = "@font-face { font-weight: 400; font-style: normal; }";
    var output = "@font-face { font-weight: 400; font-style: normal; }";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 560 })).process(input).css;
    expect(processed).toBe(output);
  })

  it("position-try", function() {
    var input = "@position-try --custom-left { position-area: left; width: 100px; margin: 0 10px 0 0; }";
    var output = "@position-try --custom-left { position-area: left; width: min(13.333vw, 74.667px); margin: 0 min(1.333vw, 7.467px) 0 0; }";
    var processed = postcss(mobileToMultiDisplays({ maxDisplayWidth: 560 })).process(input).css;
    expect(processed).toBe(output);
  })
})

describe("rem-mode", function() {

  it("should convert rem from px", function() {
    var input = "html {} .rule { width: 100px }";
    var output = "html { font-size: 13.333333333333334vw !important} .rule { width: 1rem } @media (min-width: 560px) { html { font-size: 74.66666666666667px !important}}";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, maxDisplayWidth: 560, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert fixed property", function() {
    var input = ".rule { position: fixed; width: 50% }";
    var output = ".rule { position: fixed; width: 3.75rem }";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { position: fixed; width: 50vw }";
    var output = ".rule { position: fixed; width: 3.75rem }";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { position: fixed; margin: 0 auto; }";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(input);
  });

  it("should convert fixed left/right", function() {
    var input = ".rule { position: fixed; left: 50% }";
    var output = ".rule { position: fixed; left: calc(50% - 3.75rem) }";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { position: fixed; right: 50vw }";
    var output = ".rule { position: fixed; right: calc(50vw - 3.75rem) }";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(output);

    var input = ".rule { position: fixed; right: 75px }";
    var output = ".rule { position: fixed; right: calc(50% - 3rem) }";
    var processed = postcss(mobileToMultiDisplays({ viewportWidth: 750, mobileUnit: "rem" })).process(input).css;
    expect(processed).toBe(output);
  })
});

describe("others", function() {
  it("unitPrecision", function() {
    var input = ".rule { position: fixed; right: 187px; } .l{}";
    var output = ".rule { position: fixed; right: calc(50% - min(0.64px, 0.133%)); } .l{}";
    var processed = postcss(mobileToMultiDisplays({
      viewportWidth: 375,
      maxDisplayWidth: 480
    })).process(input).css;
    expect(processed).toBe(output);
  });
});